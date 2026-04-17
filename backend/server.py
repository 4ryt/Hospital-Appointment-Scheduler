from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from pymongo import MongoClient
import certifi

client = MongoClient(
    os.getenv("MONGO_URI"),
    tls=True,
    tlsCAFile=certifi.where()
)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class Department(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    icon: str

class Doctor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    department_id: str
    specialization: str
    image_url: str
    experience_years: int

class TimeSlot(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    doctor_id: str
    date: str  # YYYY-MM-DD format
    time: str  # HH:MM format
    is_available: bool = True

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_name: str
    patient_email: str
    patient_phone: str
    doctor_id: str
    slot_id: str
    date: str
    time: str
    department_id: str
    status: str = "confirmed"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ============== REQUEST MODELS ==============

class AppointmentCreate(BaseModel):
    patient_name: str
    patient_email: str
    patient_phone: str
    doctor_id: str
    slot_id: str

# ============== SEED DATA ==============

DEPARTMENTS = [
    {"id": "dept-1", "name": "Cardiology", "description": "Heart and cardiovascular system specialists", "icon": "HeartPulse"},
    {"id": "dept-2", "name": "Neurology", "description": "Brain, spine and nervous system specialists", "icon": "Brain"},
    {"id": "dept-3", "name": "Orthopedics", "description": "Bone, joint and muscle specialists", "icon": "Bone"},
    {"id": "dept-4", "name": "Pediatrics", "description": "Medical care for infants and children", "icon": "Baby"},
    {"id": "dept-5", "name": "Dermatology", "description": "Skin, hair and nail specialists", "icon": "Fingerprint"},
    {"id": "dept-6", "name": "Ophthalmology", "description": "Eye and vision care specialists", "icon": "Eye"},
    {"id": "dept-7", "name": "General Medicine", "description": "Primary healthcare and general consultations", "icon": "Stethoscope"},
    {"id": "dept-8", "name": "Psychiatry", "description": "Mental health and behavioral specialists", "icon": "BrainCog"},
]

DOCTORS = [
    {"id": "doc-1", "name": "Dr. Aarav Sharma", "department_id": "dept-1", "specialization": "Interventional Cardiology", "image_url": "https://emojigraph.org/man-health-worker-medium-skin-tone/=Aarav", "experience_years": 15},
    {"id": "doc-2", "name": "Dr. Rohan Mehta", "department_id": "dept-1", "specialization": "Electrophysiology", "image_url": "https://emojigraph.org/man-health-worker-medium-skin-tone/=Rohan", "experience_years": 12},
    {"id": "doc-3", "name": "Dr. Ananya Reddy", "department_id": "dept-2", "specialization": "Neurological Surgery", "image_url": "https://emojipedia.org/apple/ios-13.3/woman-health-worker-light-skin-tone=Ananya", "experience_years": 18},
    {"id": "doc-4", "name": "Dr. Vikram Singh", "department_id": "dept-2", "specialization": "Movement Disorders", "image_url": "https://emojigraph.org/man-health-worker-medium-skin-tone/=Vikram", "experience_years": 10},
    {"id": "doc-5", "name": "Dr. Priya Nair", "department_id": "dept-3", "specialization": "Sports Medicine", "image_url": "https://emojipedia.org/apple/ios-13.3/woman-health-worker-light-skin-tone=Priya", "experience_years": 14},
    {"id": "doc-6", "name": "Dr. Arjun Patel", "department_id": "dept-3", "specialization": "Joint Replacement", "image_url": "https://emojigraph.org/man-health-worker-medium-skin-tone/=Arjun", "experience_years": 20},
    {"id": "doc-7", "name": "Dr. Kavya Iyer", "department_id": "dept-4", "specialization": "Neonatal Care", "image_url": "https://emojigraph.org/man-health-worker-medium-skin-tone/=Kavya", "experience_years": 11},
    {"id": "doc-8", "name": "Dr. Rahul Verma", "department_id": "dept-5", "specialization": "Cosmetic Dermatology", "image_url": "https://emojigraph.org/man-health-worker-medium-skin-tone/=Rahul", "experience_years": 9},
    {"id": "doc-9", "name": "Dr. Kavya Sharma", "department_id": "dept-6", "specialization": "Retina Specialist", "image_url": "https://emojipedia.org/apple/ios-13.3/woman-health-worker-light-skin-tone=Kavya", "experience_years": 16},
    {"id": "doc-10", "name": "Dr. Karan Malhotra", "department_id": "dept-7", "specialization": "Internal Medicine", "image_url": "https://emojigraph.org/man-health-worker-medium-skin-tone/=Karan", "experience_years": 22},
    {"id": "doc-11", "name": "Dr. Neha Joshi", "department_id": "dept-8", "specialization": "Clinical Psychology", "image_url": "https://emojipedia.org/apple/ios-13.3/woman-health-worker-light-skin-tone=Neha", "experience_years": 13},
]

# Generate time slots for each doctor for the next 7 days
def generate_time_slots():
    slots = []
    times = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"]
    
    from datetime import timedelta
    today = datetime.now(timezone.utc).date()
    
    for doctor in DOCTORS:
        for day_offset in range(7):
            date = today + timedelta(days=day_offset)
            date_str = date.strftime("%Y-%m-%d")
            for time in times:
                slots.append({
                    "id": f"slot-{doctor['id']}-{date_str}-{time.replace(':', '')}",
                    "doctor_id": doctor["id"],
                    "date": date_str,
                    "time": time,
                    "is_available": True
                })
    return slots

# ============== SEED ENDPOINT ==============

@api_router.post("/seed")
async def seed_database():
    """Seed the database with initial data"""
    # Clear existing data
    await db.departments.delete_many({})
    await db.doctors.delete_many({})
    await db.time_slots.delete_many({})
    
    # Insert departments
    await db.departments.insert_many(DEPARTMENTS)
    
    # Insert doctors
    await db.doctors.insert_many(DOCTORS)
    
    # Insert time slots
    slots = generate_time_slots()
    await db.time_slots.insert_many(slots)
    
    return {"message": "Database seeded successfully", "departments": len(DEPARTMENTS), "doctors": len(DOCTORS), "slots": len(slots)}

# ============== DEPARTMENT ENDPOINTS ==============

@api_router.get("/departments", response_model=List[Department])
async def get_departments():
    """Get all departments"""
    departments = await db.departments.find({}, {"_id": 0}).to_list(100)
    if not departments:
        # Return seed data if database is empty
        return DEPARTMENTS
    return departments

@api_router.get("/departments/{department_id}", response_model=Department)
async def get_department(department_id: str):
    """Get a specific department"""
    department = await db.departments.find_one({"id": department_id}, {"_id": 0})
    if not department:
        # Fallback to seed data
        for dept in DEPARTMENTS:
            if dept["id"] == department_id:
                return dept
        raise HTTPException(status_code=404, detail="Department not found")
    return department

@api_router.get("/departments/{department_id}/doctors", response_model=List[Doctor])
async def get_doctors_by_department(department_id: str):
    """Get all doctors in a department"""
    doctors = await db.doctors.find({"department_id": department_id}, {"_id": 0}).to_list(100)
    if not doctors:
        # Return seed data if database is empty
        return [doc for doc in DOCTORS if doc["department_id"] == department_id]
    return doctors

# ============== DOCTOR ENDPOINTS ==============

@api_router.get("/doctors", response_model=List[Doctor])
async def get_all_doctors():
    """Get all doctors"""
    doctors = await db.doctors.find({}, {"_id": 0}).to_list(100)
    if not doctors:
        return DOCTORS
    return doctors

@api_router.get("/doctors/{doctor_id}", response_model=Doctor)
async def get_doctor(doctor_id: str):
    """Get a specific doctor"""
    doctor = await db.doctors.find_one({"id": doctor_id}, {"_id": 0})
    if not doctor:
        for doc in DOCTORS:
            if doc["id"] == doctor_id:
                return doc
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

@api_router.get("/doctors/{doctor_id}/slots")
async def get_doctor_slots(doctor_id: str, date: Optional[str] = None):
    """Get available slots for a doctor, optionally filtered by date"""
    query = {"doctor_id": doctor_id, "is_available": True}
    if date:
        query["date"] = date
    
    slots = await db.time_slots.find(query, {"_id": 0}).to_list(1000)
    
    if not slots:
        # Generate slots on the fly if database is empty
        all_slots = generate_time_slots()
        filtered_slots = [s for s in all_slots if s["doctor_id"] == doctor_id and s["is_available"]]
        if date:
            filtered_slots = [s for s in filtered_slots if s["date"] == date]
        return filtered_slots
    
    return slots

# ============== APPOINTMENT ENDPOINTS ==============

@api_router.post("/appointments", response_model=Appointment, status_code=201)
async def create_appointment(appointment_data: AppointmentCreate):
    """Book an appointment - prevents double booking"""
    # Check if slot exists and is available
    slot = await db.time_slots.find_one({"id": appointment_data.slot_id}, {"_id": 0})
    
    if not slot:
        # Check in generated slots
        all_slots = generate_time_slots()
        slot = next((s for s in all_slots if s["id"] == appointment_data.slot_id), None)
        if not slot:
            raise HTTPException(status_code=404, detail="Time slot not found")
    
    if not slot.get("is_available", True):
        raise HTTPException(status_code=400, detail="This time slot is already booked")
    
    # Get doctor details
    doctor = await db.doctors.find_one({"id": appointment_data.doctor_id}, {"_id": 0})
    if not doctor:
        for doc in DOCTORS:
            if doc["id"] == appointment_data.doctor_id:
                doctor = doc
                break
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Create appointment
    appointment = Appointment(
        patient_name=appointment_data.patient_name,
        patient_email=appointment_data.patient_email,
        patient_phone=appointment_data.patient_phone,
        doctor_id=appointment_data.doctor_id,
        slot_id=appointment_data.slot_id,
        date=slot["date"],
        time=slot["time"],
        department_id=doctor["department_id"]
    )
    
    # Mark slot as unavailable
    await db.time_slots.update_one(
        {"id": appointment_data.slot_id},
        {"$set": {"is_available": False}},
        upsert=True
    )
    
    # Save appointment
    appointment_dict = appointment.model_dump()
    await db.appointments.insert_one(appointment_dict)
    
    return appointment

@api_router.get("/appointments", response_model=List[Appointment])
async def get_all_appointments():
    """Get all appointments (Admin view)"""
    appointments = await db.appointments.find({}, {"_id": 0}).to_list(1000)
    return appointments

@api_router.get("/appointments/doctor/{doctor_id}", response_model=List[Appointment])
async def get_doctor_appointments(doctor_id: str):
    """Get appointments for a specific doctor"""
    appointments = await db.appointments.find({"doctor_id": doctor_id}, {"_id": 0}).to_list(1000)
    return appointments

@api_router.get("/appointments/patient/{email}", response_model=List[Appointment])
async def get_patient_appointments(email: str):
    """Get appointments for a patient by email"""
    appointments = await db.appointments.find({"patient_email": email}, {"_id": 0}).to_list(100)
    return appointments

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Hospital Appointment System API", "status": "running"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Seed database on startup if empty"""
    count = await db.departments.count_documents({})
    if count == 0:
        logger.info("Seeding database with initial data...")
        await db.departments.insert_many(DEPARTMENTS)
        await db.doctors.insert_many(DOCTORS)
        slots = generate_time_slots()
        await db.time_slots.insert_many(slots)
        logger.info("Database seeded successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
