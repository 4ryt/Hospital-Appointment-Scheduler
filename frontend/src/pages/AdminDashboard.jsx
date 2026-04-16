import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Calendar, Clock, User, Mail, Phone, Stethoscope, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { getAllAppointments, getDepartments, getAllDoctors } from '../lib/api';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [aptsData, deptsData, docsData] = await Promise.all([
        getAllAppointments(),
        getDepartments(),
        getAllDoctors(),
      ]);
      setAppointments(aptsData);
      setDepartments(deptsData);
      setDoctors(docsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || 'Unknown';
  };

  const getDoctorName = (docId) => {
    const doc = doctors.find(d => d.id === docId);
    return doc?.name || 'Unknown';
  };

  // Stats
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
  const todayAppointments = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard">
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-slate-950" strokeWidth={2.5} />
                </div>
                <span className="text-lg font-semibold text-white">Admin Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-12 py-8 lg:py-12">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Appointments</p>
                <p className="text-3xl font-bold text-white mt-1">{totalAppointments}</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-500/10">
                <Calendar className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Confirmed</p>
                <p className="text-3xl font-bold text-white mt-1">{confirmedAppointments}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <ShieldCheck className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Today's Appointments</p>
                <p className="text-3xl font-bold text-white mt-1">{todayAppointments}</p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/10">
                <Clock className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Appointments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="rounded-xl bg-slate-900/50 border border-slate-800/50 overflow-hidden">
            <div className="p-6 border-b border-slate-800/50">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                All Appointments
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-400">No appointments have been booked yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800/50 hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-widest text-slate-500">Date</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-slate-500">Time</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-slate-500">Patient</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-slate-500">Doctor</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-slate-500">Department</TableHead>
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
                        data-testid={`admin-appointment-row-${apt.id}`}
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
                            <Stethoscope className="w-4 h-4 text-slate-500" />
                            {getDoctorName(apt.doctor_id)}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-500" />
                            {getDepartmentName(apt.department_id)}
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
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
