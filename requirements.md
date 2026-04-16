# Hospital Appointment Scheduling System - Requirements & Documentation

## Original Problem Statement
Build a Hospital Appointment Scheduling System where:
- Patients can register and log in (simplified: no auth for MVP)
- Patients see available doctors and time slots in different departments (Cardiology, Neurology, etc.)
- Patients can book an appointment in an available slot
- Once booked, the slot should no longer be available for others
- Admins or doctors can view appointments
- The system should prevent double-booking and show clear messages

## User Choices
- No authentication for now
- 3 roles: Patient, Doctor, Admin
- Admin: View all appointments only
- Modern dark theme

## Architecture Completed

### Backend (FastAPI + MongoDB)
- **Models**: Department, Doctor, TimeSlot, Appointment
- **Seed Data**: 8 departments, 11 doctors, auto-generated time slots for 7 days
- **API Endpoints**:
  - `GET /api/departments` - List all departments
  - `GET /api/departments/{id}` - Get department details
  - `GET /api/departments/{id}/doctors` - Get doctors by department
  - `GET /api/doctors` - List all doctors
  - `GET /api/doctors/{id}` - Get doctor details
  - `GET /api/doctors/{id}/slots` - Get available slots (with date filter)
  - `POST /api/appointments` - Book appointment (prevents double-booking)
  - `GET /api/appointments` - Get all appointments (Admin)
  - `GET /api/appointments/doctor/{id}` - Get doctor's appointments
  - `GET /api/appointments/patient/{email}` - Get patient's appointments

### Frontend (React + Tailwind + Shadcn)
- **Landing Page**: Role selector (Patient, Doctor, Admin)
- **Patient Portal**:
  - View 8 departments in bento grid
  - Browse doctors by department
  - Book appointment with calendar & time slot selection
  - View own appointments by email
- **Doctor Portal**: Select doctor and view scheduled appointments
- **Admin Portal**: View all appointments with statistics

### Design Theme: "Nocturnal Healing"
- Dark slate background (#020617)
- Teal primary (#2dd4bf)
- Manrope + Plus Jakarta Sans fonts
- Glassmorphism effects with animations

## Departments (8)
1. Cardiology - Heart and cardiovascular system
2. Neurology - Brain, spine, nervous system
3. Orthopedics - Bone, joint, muscle
4. Pediatrics - Infants and children
5. Dermatology - Skin, hair, nail
6. Ophthalmology - Eye and vision care
7. General Medicine - Primary healthcare
8. Psychiatry - Mental health

## Files Created
- `/app/backend/server.py` - Complete FastAPI backend
- `/app/frontend/src/App.js` - Main app with routes
- `/app/frontend/src/lib/api.js` - API client
- `/app/frontend/src/pages/LandingPage.jsx` - Role selector
- `/app/frontend/src/pages/PatientDashboard.jsx` - Department browsing
- `/app/frontend/src/pages/DepartmentDoctors.jsx` - Doctor listing
- `/app/frontend/src/pages/BookAppointment.jsx` - Booking flow
- `/app/frontend/src/pages/DoctorDashboard.jsx` - Doctor portal
- `/app/frontend/src/pages/AdminDashboard.jsx` - Admin view
- `/app/frontend/src/index.css` - Custom theme styles

## Next Action Items
1. **Add Authentication**: JWT-based or Google OAuth for user login
2. **Email Notifications**: Send booking confirmations via email
3. **Cancel/Reschedule**: Allow patients to modify appointments
4. **Doctor Availability**: Let doctors set their own schedules
5. **Search & Filters**: Add filters by date, department, doctor
6. **Patient History**: Track appointment history and medical records
