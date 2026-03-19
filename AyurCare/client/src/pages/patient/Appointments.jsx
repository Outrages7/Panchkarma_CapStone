import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import StatusBadge from "../../components/dashboard/StatusBadge";
import BookAppointmentModal from "../../components/patient/BookAppointmentModal";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/common/Toast";
import { formatName, formatTime } from "../../utils/formatters";
import api from "../../services/api";
import { FaCalendarPlus, FaClock, FaHistory, FaMapMarkerAlt, FaUserMd, FaTimes, FaCalendarAlt } from "react-icons/fa";

const Appointments = () => {
  const { toasts, toast, removeToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    if (activeTab === "upcoming") {
      fetchUpcomingAppointments();
    } else {
      fetchPastAppointments();
    }
  }, [activeTab]);

  const fetchUpcomingAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/patient/appointments/upcoming");
      setUpcomingAppointments(response.data.data || []);
    } catch (error) { toast.error("Failed to load upcoming appointments"); } 
    finally { setLoading(false); }
  };

  const fetchPastAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/patient/appointments/history");
      setPastAppointments(response.data.data?.appointments || []);
    } catch (error) { toast.error("Failed to load appointment history"); } 
    finally { setLoading(false); }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    try {
      setLoading(true);
      await api.patch(`/patient/appointments/${selectedAppointment._id}/cancel`);
      toast.success("Appointment cancelled successfully");
      setShowCancelModal(false); setSelectedAppointment(null); fetchUpcomingAppointments();
    } catch (error) { toast.error(error.response?.data?.error?.message || "Failed to cancel appointment"); } 
    finally { setLoading(false); }
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !newDate) return;
    try {
      setLoading(true);
      await api.post(`/patient/appointments/${selectedAppointment._id}/reschedule`, { newDate });
      toast.success("Appointment rescheduled successfully");
      setShowRescheduleModal(false); setSelectedAppointment(null); setNewDate(""); fetchUpcomingAppointments();
    } catch (error) { toast.error(error.response?.data?.error?.message || "Failed to reschedule appointment"); } 
    finally { setLoading(false); }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
              <FaCalendarAlt className="w-3 h-3" /> Management
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">My Sessions</h1>
            <p className="text-stone-400 font-medium">Keep track of your upcoming therapies and consultation history.</p>
          </div>
          
          <button 
            onClick={() => setShowBookModal(true)}
            className="relative z-10 flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95 whitespace-nowrap"
          >
            <FaCalendarPlus className="w-4 h-4" /> Book New Session
          </button>
        </div>

        {/* Custom Pill Navigation (Matching Sidebar Active States) */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-stone-200 inline-flex font-semibold">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl transition-all ${
              activeTab === "upcoming" ? "bg-stone-950 text-white shadow-sm" : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            <FaClock className="w-4 h-4" /> Upcoming
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl transition-all ${
              activeTab === "past" ? "bg-stone-950 text-white shadow-sm" : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            <FaHistory className="w-4 h-4" /> History
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-200 border-dashed">
              <div className="w-10 h-10 border-4 border-stone-100 border-t-emerald-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-stone-500 font-medium">Loading sessions...</p>
            </div>
          ) : activeTab === "upcoming" ? (
            upcomingAppointments.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment._id} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 hover:border-emerald-500/30 hover:shadow-md transition-all group flex flex-col h-full">
                    
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-stone-950 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-inner">
                          {appointment.doctor?.firstName?.charAt(0)}{appointment.doctor?.lastName?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-900 leading-tight group-hover:text-emerald-700 transition-colors">Dr. {formatName(appointment.doctor)}</h3>
                          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">{appointment.doctor?.specialization}</p>
                        </div>
                      </div>
                      <StatusBadge status={appointment.status} type="appointment" />
                    </div>

                    <div className="bg-stone-50 rounded-2xl p-4 flex-1 mb-5 border border-stone-100/50 space-y-3">
                      <div className="flex items-start gap-3">
                        <FaClock className="w-4 h-4 text-emerald-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-stone-900">{formatDate(appointment.date)}</p>
                          <p className="text-xs font-medium text-stone-500">{formatTime(appointment.date)}</p>
                        </div>
                      </div>
                      <div className="w-full h-px bg-stone-200/50"></div>
                      <div className="flex items-start gap-3">
                        <FaUserMd className="w-4 h-4 text-stone-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-stone-700 capitalize">{appointment.type} Consultation</p>
                          <p className="text-xs font-medium text-stone-500 line-clamp-1">{appointment.reason}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                      {appointment.status === "booked" && (
                        <>
                          <button onClick={() => { setSelectedAppointment(appointment); setShowRescheduleModal(true); }} className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm rounded-xl transition">
                            Reschedule
                          </button>
                          <button onClick={() => { setSelectedAppointment(appointment); setShowCancelModal(true); }} className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition tooltip-trigger" title="Cancel">
                            <FaTimes className="w-4 h-4 mx-auto" />
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-stone-200 border-dashed">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt className="w-6 h-6 text-stone-400" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">No upcoming sessions</h3>
                <p className="text-stone-500 font-medium mb-6">You don't have any therapies scheduled right now.</p>
                <button onClick={() => setShowBookModal(true)} className="px-6 py-3 bg-stone-950 text-white font-bold rounded-xl hover:bg-stone-800 transition">
                  Book Your First Session
                </button>
              </div>
            )
          ) : pastAppointments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pastAppointments.map((appointment) => (
                <div key={appointment._id} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 opacity-75 hover:opacity-100 transition-opacity flex flex-col h-full">
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-stone-200 rounded-2xl flex items-center justify-center text-stone-500 font-bold text-lg">
                        {appointment.doctor?.firstName?.charAt(0)}{appointment.doctor?.lastName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 leading-tight">Dr. {formatName(appointment.doctor)}</h3>
                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">{appointment.doctor?.specialization}</p>
                      </div>
                    </div>
                    <StatusBadge status={appointment.status} type="appointment" />
                  </div>
                  <div className="bg-stone-50 rounded-2xl p-4 flex-1 border border-stone-100/50 space-y-3">
                    <div className="flex items-start gap-3">
                      <FaClock className="w-4 h-4 text-stone-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-stone-900">{formatDate(appointment.date)}</p>
                        <p className="text-xs font-medium text-stone-500">{formatTime(appointment.date)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-stone-200 border-dashed">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHistory className="w-6 h-6 text-stone-400" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">No history</h3>
              <p className="text-stone-500 font-medium">Your past sessions will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Session" size="medium">
        <div className="space-y-6 pt-2">
          <p className="text-stone-600 font-medium">
            Are you sure you want to cancel your session with <span className="font-bold text-stone-900">Dr. {selectedAppointment && formatName(selectedAppointment.doctor)}</span> on <span className="font-bold text-stone-900">{selectedAppointment && formatDate(selectedAppointment.date)}</span>?
          </p>
          <div className="flex gap-3 pt-4 border-t border-stone-100">
            <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold rounded-xl transition">
              Keep It
            </button>
            <button onClick={handleCancelAppointment} disabled={loading} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition">
              {loading ? "Cancelling..." : "Yes, Cancel"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Book & Reschedule Modals */}
      <BookAppointmentModal isOpen={showBookModal} onClose={() => setShowBookModal(false)} onSuccess={fetchUpcomingAppointments} toast={toast} />
    </DashboardLayout>
  );
};

export default Appointments;
