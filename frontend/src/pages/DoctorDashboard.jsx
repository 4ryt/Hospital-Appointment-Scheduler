import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Stethoscope, Calendar, Clock, User, Mail, Phone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { getAllDoctors, getDoctorAppointments } from '../lib/api';
import { toast } from 'sonner';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      loadAppointments();
    }
  }, [selectedDoctor]);

  const loadDoctors = async () => {
    try {
      const data = await getAllDoctors();
      setDoctors(data);
    } catch (error) {
      toast.error('Failed to load doctors');
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getDoctorAppointments(selectedDoctor);
      setAppointments(data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);

  return (
    <div className="min-h-screen bg-background" data-testid="doctor-dashboard">
      {/* Header */}
      <header className="border-b border-slate-800/50 glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                data-testid="back-btn"
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-slate-950" strokeWidth={2.5} />
                </div>
                <span className="text-lg font-semibold text-white">Doctor Portal</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-12 py-8 lg:py-12">
        {/* Doctor Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="glass-effect rounded-xl p-6 border border-slate-800/50">
            <h2 className="text-lg font-semibold text-white mb-4">Select Doctor</h2>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger 
                className="w-full max-w-md bg-slate-900/50 border-slate-800"
                data-testid="doctor-select"
              >
                <SelectValue placeholder="Choose a doctor to view appointments" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                {doctors.map((doctor) => (
                  <SelectItem 
                    key={doctor.id} 
                    value={doctor.id}
                    data-testid={`doctor-option-${doctor.id}`}
                  >
                    {doctor.name} - {doctor.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Doctor Info */}
        {selectedDoctorData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedDoctorData.image_url}
                  alt={selectedDoctorData.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedDoctorData.name}</h2>
                  <p className="text-cyan-400">{selectedDoctorData.specialization}</p>
                  <p className="text-sm text-slate-400">{selectedDoctorData.experience_years} years experience</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Appointments Table */}
        {selectedDoctor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="rounded-xl bg-slate-900/50 border border-slate-800/50 overflow-hidden">
              <div className="p-6 border-b border-slate-800/50">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  Scheduled Appointments
                </h2>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-400">No appointments scheduled yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800/50 hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-widest text-slate-500">Date</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-slate-500">Time</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-slate-500">Patient</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-slate-500">Email</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-slate-500">Phone</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-slate-500">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((apt) => (
                      <TableRow 
                        key={apt.id} 
                        className="border-slate-800/50 hover:bg-slate-800/30"
                        data-testid={`appointment-row-${apt.id}`}
                      >
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            {apt.date}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500" />
                            {apt.time}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-500" />
                            {apt.patient_name}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-500" />
                            {apt.patient_email}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-500" />
                            {apt.patient_phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            apt.status === 'confirmed' 
                              ? 'bg-green-500/10 text-green-400' 
                              : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {apt.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
