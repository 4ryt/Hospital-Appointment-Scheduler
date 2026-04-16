import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${API_URL}/api`;

const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Departments
export const getDepartments = async () => {
  const response = await api.get('/departments');
  return response.data;
};

export const getDepartment = async (departmentId) => {
  const response = await api.get(`/departments/${departmentId}`);
  return response.data;
};

export const getDoctorsByDepartment = async (departmentId) => {
  const response = await api.get(`/departments/${departmentId}/doctors`);
  return response.data;
};

// Doctors
export const getAllDoctors = async () => {
  const response = await api.get('/doctors');
  return response.data;
};

export const getDoctor = async (doctorId) => {
  const response = await api.get(`/doctors/${doctorId}`);
  return response.data;
};

export const getDoctorSlots = async (doctorId, date = null) => {
  const params = date ? { date } : {};
  const response = await api.get(`/doctors/${doctorId}/slots`, { params });
  return response.data;
};

// Appointments
export const createAppointment = async (appointmentData) => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

export const getAllAppointments = async () => {
  const response = await api.get('/appointments');
  return response.data;
};

export const getDoctorAppointments = async (doctorId) => {
  const response = await api.get(`/appointments/doctor/${doctorId}`);
  return response.data;
};

export const getPatientAppointments = async (email) => {
  const response = await api.get(`/appointments/patient/${email}`);
  return response.data;
};

// Seed database
export const seedDatabase = async () => {
  const response = await api.post('/seed');
  return response.data;
};

export default api;
