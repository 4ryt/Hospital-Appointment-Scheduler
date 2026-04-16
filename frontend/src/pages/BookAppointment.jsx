import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar as CalendarIcon, Clock, User, Mail, Phone, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Calendar } from '../components/ui/calendar';
import { getDoctor, getDoctorSlots, createAppointment } from '../lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function BookAppointment() {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
  });

  useEffect(() => {
    loadDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      loadSlots(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate, doctorId]);

  const loadDoctor = async () => {
    try {
      const data = await getDoctor(doctorId);
      setDoctor(data);
    } catch (error) {
      toast.error('Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (date) => {
    try {
      const data = await getDoctorSlots(doctorId, date);
      setSlots(data);
    } catch (error) {
      toast.error('Failed to load available slots');
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }
    if (!formData.patient_name || !formData.patient_email || !formData.patient_phone) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await createAppointment({
        ...formData,
        doctor_id: doctorId,
        slot_id: selectedSlot.id,
      });
      toast.success('Appointment booked successfully!');
      setBookingStep(3);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('This slot is no longer available');
        loadSlots(format(selectedDate, 'yyyy-MM-dd'));
      } else {
        toast.error('Failed to book appointment');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Group slots by time
  const morningSlots = slots.filter(s => parseInt(s.time.split(':')[0]) < 12);
  const afternoonSlots = slots.filter(s => parseInt(s.time.split(':')[0]) >= 12);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-slate-800/50 glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              data-testid="back-btn"
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-white">Book Appointment</h1>
              <p className="text-sm text-slate-400">with {doctor?.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-12 py-8 lg:py-12">
        {bookingStep === 3 ? (
          /* Success Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
            <p className="text-slate-400 mb-8">
              Your appointment with {doctor?.name} has been scheduled for{' '}
              <span className="text-white">{format(selectedDate, 'MMMM d, yyyy')}</span> at{' '}
              <span className="text-white">{selectedSlot?.time}</span>
            </p>
            <Button
              onClick={() => navigate('/patient')}
              data-testid="back-to-dashboard-btn"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-medium"
            >
              Back to Dashboard
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left - Doctor Info & Calendar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Doctor Card */}
              <div className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-6">
                <div className="flex items-center gap-4">
                  <img
                    src={doctor?.image_url}
                    alt={doctor?.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-white">{doctor?.name}</h2>
                    <p className="text-teal-400">{doctor?.specialization}</p>
                    <p className="text-sm text-slate-400">{doctor?.experience_years} years experience</p>
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-teal-400" />
                  Select Date
                </h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                  }}
                  disabled={(date) => date < new Date() || date > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                  className="rounded-lg border-slate-800 bg-slate-950"
                  data-testid="booking-calendar"
                />
              </div>

              {/* Time Slots */}
              <div className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-400" />
                  Select Time - {format(selectedDate, 'MMMM d, yyyy')}
                </h3>

                {slots.length === 0 ? (
                  <p className="text-slate-400">No available slots for this date.</p>
                ) : (
                  <div className="space-y-6">
                    {morningSlots.length > 0 && (
                      <div>
                        <p className="text-sm text-slate-500 mb-3">Morning</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {morningSlots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => {
                                setSelectedSlot(slot);
                                setBookingStep(2);
                              }}
                              data-testid={`slot-${slot.id}-btn`}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedSlot?.id === slot.id
                                  ? 'bg-teal-500 text-slate-950'
                                  : 'bg-slate-800/50 text-white hover:bg-slate-700/50'
                              }`}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {afternoonSlots.length > 0 && (
                      <div>
                        <p className="text-sm text-slate-500 mb-3">Afternoon</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {afternoonSlots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => {
                                setSelectedSlot(slot);
                                setBookingStep(2);
                              }}
                              data-testid={`slot-${slot.id}-btn`}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedSlot?.id === slot.id
                                  ? 'bg-teal-500 text-slate-950'
                                  : 'bg-slate-800/50 text-white hover:bg-slate-700/50'
                              }`}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right - Booking Form */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-6 sticky top-24"
              >
                <h3 className="text-lg font-semibold text-white mb-6">Your Details</h3>

                {!selectedSlot ? (
                  <p className="text-slate-400 text-sm">
                    Please select a date and time slot to continue.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/20 mb-6">
                      <p className="text-sm text-slate-400">Selected Slot</p>
                      <p className="text-lg font-semibold text-white">
                        {format(selectedDate, 'MMM d, yyyy')} at {selectedSlot.time}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                          placeholder="John Doe"
                          value={formData.patient_name}
                          onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                          data-testid="patient-name-input"
                          className="pl-10 bg-slate-900/50 border-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={formData.patient_email}
                          onChange={(e) => setFormData({ ...formData, patient_email: e.target.value })}
                          data-testid="patient-email-input"
                          className="pl-10 bg-slate-900/50 border-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                          type="tel"
                          placeholder="+1 234 567 8900"
                          value={formData.patient_phone}
                          onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
                          data-testid="patient-phone-input"
                          className="pl-10 bg-slate-900/50 border-slate-800"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      data-testid="confirm-booking-btn"
                      className="w-full mt-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-medium"
                    >
                      {submitting ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
