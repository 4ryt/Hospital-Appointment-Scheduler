import requests
import sys
import json
from datetime import datetime, timedelta

class HospitalAPITester:
    def __init__(self, base_url="https://medbooker-23.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.departments = []
        self.doctors = []
        self.appointments = []

    def log_test(self, name, success, details="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def run_test(self, name, method, endpoint, expected_status=200, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            response_data = None
            
            if success:
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    response_data = response.text
                    print(f"   Response: {response_data[:200]}...")
            else:
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")

            self.log_test(name, success, f"Expected {expected_status}, got {response.status_code}", response_data)
            return success, response_data

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.log_test(name, False, error_msg)
            return False, None

    def test_departments(self):
        """Test department endpoints"""
        print("\n" + "="*50)
        print("TESTING DEPARTMENT ENDPOINTS")
        print("="*50)
        
        # Test get all departments
        success, data = self.run_test(
            "Get All Departments",
            "GET",
            "departments"
        )
        
        if success and data:
            self.departments = data
            print(f"   Found {len(data)} departments")
            
            # Verify we have 8 departments as expected
            if len(data) == 8:
                self.log_test("Department Count Verification", True, "Found expected 8 departments")
            else:
                self.log_test("Department Count Verification", False, f"Expected 8 departments, found {len(data)}")
            
            # Test get specific department
            if data:
                dept_id = data[0]['id']
                success, dept_data = self.run_test(
                    "Get Specific Department",
                    "GET",
                    f"departments/{dept_id}"
                )
                
                # Test get doctors by department
                success, doctors_data = self.run_test(
                    "Get Doctors by Department",
                    "GET",
                    f"departments/{dept_id}/doctors"
                )
                
                if success and doctors_data:
                    print(f"   Found {len(doctors_data)} doctors in {data[0]['name']}")

    def test_doctors(self):
        """Test doctor endpoints"""
        print("\n" + "="*50)
        print("TESTING DOCTOR ENDPOINTS")
        print("="*50)
        
        # Test get all doctors
        success, data = self.run_test(
            "Get All Doctors",
            "GET",
            "doctors"
        )
        
        if success and data:
            self.doctors = data
            print(f"   Found {len(data)} doctors")
            
            # Verify we have 11 doctors as expected
            if len(data) == 11:
                self.log_test("Doctor Count Verification", True, "Found expected 11 doctors")
            else:
                self.log_test("Doctor Count Verification", False, f"Expected 11 doctors, found {len(data)}")
            
            # Test get specific doctor
            if data:
                doctor_id = data[0]['id']
                success, doctor_data = self.run_test(
                    "Get Specific Doctor",
                    "GET",
                    f"doctors/{doctor_id}"
                )
                
                # Test get doctor slots
                success, slots_data = self.run_test(
                    "Get Doctor Slots",
                    "GET",
                    f"doctors/{doctor_id}/slots"
                )
                
                if success and slots_data:
                    print(f"   Found {len(slots_data)} available slots for {data[0]['name']}")
                    
                    # Test get doctor slots for specific date
                    today = datetime.now().strftime('%Y-%m-%d')
                    success, today_slots = self.run_test(
                        "Get Doctor Slots for Specific Date",
                        "GET",
                        f"doctors/{doctor_id}/slots",
                        params={"date": today}
                    )
                    
                    if success and today_slots:
                        print(f"   Found {len(today_slots)} slots for {today}")

    def test_appointments(self):
        """Test appointment endpoints"""
        print("\n" + "="*50)
        print("TESTING APPOINTMENT ENDPOINTS")
        print("="*50)
        
        # First, get available slot for booking
        if not self.doctors:
            print("   ❌ No doctors available for appointment testing")
            return
            
        doctor_id = self.doctors[0]['id']
        success, slots_data = self.run_test(
            "Get Slots for Appointment Booking",
            "GET",
            f"doctors/{doctor_id}/slots"
        )
        
        if not success or not slots_data:
            print("   ❌ No slots available for appointment testing")
            return
            
        # Find an available slot
        available_slot = None
        for slot in slots_data:
            if slot.get('is_available', True):
                available_slot = slot
                break
                
        if not available_slot:
            print("   ❌ No available slots found for appointment testing")
            return
            
        print(f"   Using slot: {available_slot['date']} at {available_slot['time']}")
        
        # Test create appointment
        appointment_data = {
            "patient_name": "John Doe Test",
            "patient_email": "john.doe.test@example.com",
            "patient_phone": "+1234567890",
            "doctor_id": doctor_id,
            "slot_id": available_slot['id']
        }
        
        success, created_appointment = self.run_test(
            "Create Appointment",
            "POST",
            "appointments",
            expected_status=201,
            data=appointment_data
        )
        
        if success and created_appointment:
            appointment_id = created_appointment['id']
            print(f"   Created appointment with ID: {appointment_id}")
            
            # Test double-booking prevention
            success, double_book_response = self.run_test(
                "Test Double-Booking Prevention",
                "POST",
                "appointments",
                expected_status=400,  # Should fail with 400
                data=appointment_data
            )
            
            if success:  # Success here means we got the expected 400 error
                self.log_test("Double-Booking Prevention", True, "Correctly prevented double booking")
            else:
                self.log_test("Double-Booking Prevention", False, "Failed to prevent double booking")
            
            # Test get all appointments (Admin view)
            success, all_appointments = self.run_test(
                "Get All Appointments (Admin)",
                "GET",
                "appointments"
            )
            
            if success and all_appointments:
                self.appointments = all_appointments
                print(f"   Found {len(all_appointments)} total appointments")
            
            # Test get doctor appointments
            success, doctor_appointments = self.run_test(
                "Get Doctor Appointments",
                "GET",
                f"appointments/doctor/{doctor_id}"
            )
            
            if success and doctor_appointments:
                print(f"   Found {len(doctor_appointments)} appointments for doctor")
            
            # Test get patient appointments
            success, patient_appointments = self.run_test(
                "Get Patient Appointments",
                "GET",
                f"appointments/patient/{appointment_data['patient_email']}"
            )
            
            if success and patient_appointments:
                print(f"   Found {len(patient_appointments)} appointments for patient")

    def test_root_endpoint(self):
        """Test root API endpoint"""
        print("\n" + "="*50)
        print("TESTING ROOT ENDPOINT")
        print("="*50)
        
        success, data = self.run_test(
            "Root API Endpoint",
            "GET",
            ""
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🏥 Hospital Appointment System API Testing")
        print("=" * 60)
        
        # Test basic connectivity
        self.test_root_endpoint()
        
        # Test all endpoints
        self.test_departments()
        self.test_doctors()
        self.test_appointments()
        
        # Print summary
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print failed tests
        failed_tests = [t for t in self.test_results if not t['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = HospitalAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())