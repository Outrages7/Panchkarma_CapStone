import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import { formatName } from '../../utils/formatters';
import api from '../../services/api';

const Calendar = () => {
  const { toasts, toast, removeToast } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [view, setView] = useState('month'); // month, week, day
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await api.get('/doctor/appointments/month', {
        params: { year, month },
      });

      // Convert date strings to Date objects
      const appointmentsData = response.data.data.map(apt => ({
        ...apt,
        date: new Date(apt.date),
        duration: apt.duration || 30,
      }));

      setAppointments(appointmentsData);
    } catch (error) {
      toast.error('Failed to load appointments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return (
        aptDate.getFullYear() === date.getFullYear() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getDate() === date.getDate()
      );
    });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setShowDayModal(true);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getFullYear() === currentDate.getFullYear() &&
      today.getMonth() === currentDate.getMonth() &&
      today.getDate() === day
    );
  };

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Calendar
            </h1>
            <p className="text-stone-400 font-medium">
              View and manage your schedule
            </p>
          </div>
        </div>
        
        {/* The rest of the page matches the premium dark-header aesthetic */}

          
          <div className="relative z-10"><div className="flex space-x-2">
            <Button onClick={() => setCurrentDate(new Date())} variant="outline" size="sm">
              Today
            </Button></div>
        </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-7">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-stone-900">{monthName}</h2>
            <div className="flex space-x-2">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-stone-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before start of month */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="h-24 bg-stone-50 rounded-lg"></div>
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dayAppointments = getAppointmentsForDate(date);

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`h-24 rounded-lg border-2 p-2 hover:border-stone-900 transition-colors ${
                    isToday(day)
                      ? 'border-stone-900 bg-stone-50'
                      : dayAppointments.length > 0
                      ? 'border-stone-300 bg-white'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="text-left">
                    <span
                      className={`text-sm font-semibold ${
                        isToday(day) ? 'text-stone-900' : 'text-stone-900'
                      }`}
                    >
                      {day}
                    </span>
                    {dayAppointments.length > 0 && (
                      <div className="mt-1">
                        <span className="text-xs bg-blue-100 text-stone-800 px-2 py-1 rounded-full">
                          {dayAppointments.length} {dayAppointments.length === 1 ? 'apt' : 'apts'}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-6 mt-6 pt-4 border-t border-stone-200">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-stone-50 border-2 border-stone-900 rounded"></div>
              <span className="text-sm text-stone-600">Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-white border-2 border-stone-300 rounded"></div>
              <span className="text-sm text-stone-600">Has Appointments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      <Modal
        isOpen={showDayModal}
        onClose={() => setShowDayModal(false)}
        title={selectedDate?.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        size="large"
      >
        {selectedDate && (
          <div className="space-y-4">
            {getAppointmentsForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getAppointmentsForDate(selectedDate)
                  .sort((a, b) => a.date - b.date)
                  .map((appointment) => (
                    <div key={appointment.id} className="border border-stone-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {appointment.patient.firstName.charAt(0)}
                            {appointment.patient.lastName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-stone-900">
                              {formatName(appointment.patient)}
                            </h4>
                            <p className="text-sm text-stone-600 mt-1">
                              {formatTime(appointment.date)} ({appointment.duration} min)
                            </p>
                            <p className="text-sm text-stone-700 mt-1">
                              <span className="font-medium">Type:</span>{' '}
                              <span className="capitalize">{appointment.type}</span>
                            </p>
                            <p className="text-sm text-stone-700">
                              <span className="font-medium">Reason:</span> {appointment.reason}
                            </p>
                            <div className="mt-2">
                              <StatusBadge status={appointment.status} type="appointment" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-stone-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-stone-900">No appointments</h3>
                <p className="mt-1 text-sm text-stone-500">You have no appointments scheduled for this day.</p>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowDayModal(false)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Calendar;
