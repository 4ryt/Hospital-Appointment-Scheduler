import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Stethoscope, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

const roles = [
  {
    id: 'patient',
    title: 'Patient',
    description: 'Book appointments with specialists across departments',
    icon: User,
    path: '/patient',
    color: 'from-teal-500/20 to-teal-500/5',
    borderColor: 'hover:border-teal-500/50',
    iconColor: 'text-teal-400',
  },
  {
    id: 'doctor',
    title: 'Doctor',
    description: 'View and manage your scheduled appointments',
    icon: Stethoscope,
    path: '/doctor',
    color: 'from-cyan-500/20 to-cyan-500/5',
    borderColor: 'hover:border-cyan-500/50',
    iconColor: 'text-cyan-400',
  },
  {
    id: 'admin',
    title: 'Admin',
    description: 'Monitor all hospital appointments and activity',
    icon: ShieldCheck,
    path: '/admin',
    color: 'from-indigo-500/20 to-indigo-500/5',
    borderColor: 'hover:border-indigo-500/50',
    iconColor: 'text-indigo-400',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg)',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/90" />
      </div>
      
      {/* Hero Glow Effect */}
      <div className="absolute inset-0 hero-glow pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-6 lg:px-12 py-12">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16 lg:mb-24"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-slate-950" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-semibold text-white tracking-tight">Appointment Scheduler</span>
            </div>
          </motion.header>

          {/* Main Content - Split Layout */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Left - Hero Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                  Healthcare
                  <br />
                  <span className="text-gradient">Appointments</span>
                  <br />
                  Made Simple
                </h1>
                <p className="text-lg text-slate-400 max-w-md">
                  Book appointments with top specialists across 8 departments. 
                  Your health journey starts here.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400" />
                  <span>8 Departments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>11+ Specialists</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Instant Booking</span>
                </div>
              </div>
            </motion.div>

            {/* Right - Role Selection */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">
                Select your role to continue
              </p>
              
              <div className="space-y-4">
                {roles.map((role, index) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group"
                  >
                    <button
                      onClick={() => navigate(role.path)}
                      data-testid={`role-${role.id}-btn`}
                      className={`w-full p-6 rounded-xl bg-gradient-to-r ${role.color} border border-slate-800/50 ${role.borderColor} transition-all duration-300 text-left group`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg bg-slate-900/50 ${role.iconColor}`}>
                            <role.icon className="w-6 h-6" strokeWidth={1.5} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {role.title}
                            </h3>
                            <p className="text-sm text-slate-400">
                              {role.description}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
