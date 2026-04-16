import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getDepartment, getDoctorsByDepartment } from '../lib/api';
import { toast } from 'sonner';

export default function DepartmentDoctors() {
  const navigate = useNavigate();
  const { departmentId } = useParams();
  const [department, setDepartment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [departmentId]);

  const loadData = async () => {
    try {
      const [deptData, docsData] = await Promise.all([
        getDepartment(departmentId),
        getDoctorsByDepartment(departmentId),
      ]);
      setDepartment(deptData);
      setDoctors(docsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-slate-800/50 glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/patient')}
              data-testid="back-to-departments-btn"
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-white">
                {department?.name || 'Loading...'}
              </h1>
              <p className="text-sm text-slate-400">
                {department?.description}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-12 py-8 lg:py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Available Doctors</h2>
          <p className="text-slate-400">Select a doctor to view available appointment slots</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-slate-900/50 animate-pulse" />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No doctors found in this department.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <div className="rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-teal-500/30 transition-all duration-300 overflow-hidden">
                  {/* Doctor Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={doctor.image_url}
                      alt={doctor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-lg font-semibold text-white">{doctor.name}</h3>
                      <p className="text-sm text-teal-400">{doctor.specialization}</p>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Award className="w-4 h-4 text-cyan-400" />
                      <span>{doctor.experience_years} years experience</span>
                    </div>

                    <Button
                      onClick={() => navigate(`/patient/book/${doctor.id}`)}
                      data-testid={`book-doctor-${doctor.id}-btn`}
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-medium"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
