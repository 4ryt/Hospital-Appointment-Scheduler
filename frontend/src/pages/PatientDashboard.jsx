import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartPulse, Brain, Bone, Baby, Fingerprint, Eye, Stethoscope, BrainCog,
  ArrowLeft, Search, Calendar, Clock, User
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { getDepartments, getPatientAppointments } from '../lib/api';
import { toast } from 'sonner';

const iconMap = {
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Fingerprint,
  Eye,
  Stethoscope,
  BrainCog,
};

const heroCards = ['dept-1', 'dept-2']; // Cardiology and Neurology are hero cards

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [showAppointments, setShowAppointments] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    if (!patientEmail) {
      toast.error('Please enter your email');
      return;
    }
    try {
      const data = await getPatientAppointments(patientEmail);
      setAppointments(data);
      setShowAppointments(true);
    } catch (error) {
      toast.error('Failed to load appointments');
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const DepartmentIcon = ({ iconName, className }) => {
    const Icon = iconMap[iconName] || Stethoscope;
    return <Icon className={className} strokeWidth={1.5} />;
  };

  return (
    <div className="min-h-screen bg-background">
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-950" strokeWidth={2.5} />
                </div>
                <span className="text-lg font-semibold text-white">Patient Portal</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search departments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="search-input"
                  className="pl-10 w-64 bg-slate-900/50 border-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-12 py-8 lg:py-12">
        {/* My Appointments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="glass-effect rounded-xl p-6 border border-slate-800/50">
            <h2 className="text-lg font-semibold text-white mb-4">View My Appointments</h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1 max-w-md">
                <label className="text-sm text-slate-400 mb-2 block">Enter your email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  data-testid="patient-email-input"
                  className="bg-slate-900/50 border-slate-800"
                />
              </div>
              <Button
                onClick={loadAppointments}
                data-testid="view-appointments-btn"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-medium"
              >
                View Appointments
              </Button>
            </div>

            {showAppointments && (
              <div className="mt-6">
                {appointments.length === 0 ? (
                  <p className="text-slate-400">No appointments found for this email.</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-800/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-teal-500/10">
                            <Calendar className="w-5 h-5 text-teal-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{apt.date}</p>
                            <p className="text-sm text-slate-400">{apt.time}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'confirmed' 
                            ? 'bg-green-500/10 text-green-400' 
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Departments Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Choose a Department
              </h1>
              <p className="text-slate-400">
                Select a specialty to find available doctors
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-40 rounded-xl bg-slate-900/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
              {filteredDepartments.map((dept) => {
                const isHero = heroCards.includes(dept.id);
                return (
                  <motion.div
                    key={dept.id}
                    whileHover={{ y: -4 }}
                    className={`group ${isHero ? 'md:col-span-2' : ''}`}
                  >
                    <button
                      onClick={() => navigate(`/patient/department/${dept.id}`)}
                      data-testid={`department-${dept.id}-btn`}
                      className="w-full h-full p-6 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-teal-500/30 transition-all duration-300 text-left relative overflow-hidden group"
                    >
                      {/* Hover Gradient */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 card-hover-gradient" />
                      
                      <div className="relative z-10">
                        <div className="p-3 rounded-lg bg-slate-800/50 w-fit mb-4 group-hover:bg-teal-500/10 transition-colors">
                          <DepartmentIcon iconName={dept.icon} className="w-6 h-6 text-teal-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">
                          {dept.name}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {dept.description}
                        </p>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
