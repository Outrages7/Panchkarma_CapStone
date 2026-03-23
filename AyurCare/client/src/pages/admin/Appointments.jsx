import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/common/Button";
import SearchBar from "../../components/common/SearchBar";
import Modal from "../../components/common/Modal";
import DataTable from "../../components/dashboard/DataTable";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/common/Toast";
import { formatName } from "../../utils/formatters";
import api from "../../services/api";
import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaUserMd,
  FaCheckCircle,
  FaUserSlash,
  FaTimesCircle,
  FaFileExport,
  FaEye,
  FaBan,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaClock,
  FaHospital,
  FaStethoscope,
  FaNotesMedical,
  FaExclamationTriangle,
  FaStickyNote,
} from "react-icons/fa";

const Appointments = () => {
  const { toasts, toast, removeToast } = useToast();

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all"); // all, booked, completed, cancelled
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    booked: 0,
    inConsultation: 0,
    completed: 0,
    noShow: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/appointments");
      const appointmentsList = response.data.data.appointments || [];
      setAppointments(appointmentsList);

      // Calculate stats
      setStats({
        total: appointmentsList.length,
        booked: appointmentsList.filter((a) => a.status === "booked").length,
        inConsultation: appointmentsList.filter(
          (a) => a.status === "in-consultation"
        ).length,
        completed: appointmentsList.filter((a) => a.status === "completed")
          .length,
        noShow: appointmentsList.filter((a) => a.status === "no-show").length,
        cancelled: appointmentsList.filter((a) => a.status === "cancelled")
          .length,
      });
    } catch (error) {
      toast.error("Failed to fetch appointments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      booked: "bg-blue-50 text-blue-700 border-blue-200",
      "in-consultation": "bg-yellow-50 text-yellow-700 border-yellow-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      "no-show": "bg-stone-100 text-stone-700 border-stone-200",
    };
    return colors[status] || "bg-stone-50 text-stone-700 border-stone-200";
  };

  const getTypeColor = (type) => {
    const colors = {
      new: "bg-indigo-50 text-indigo-700 border-indigo-200",
      "follow-up": "bg-purple-50 text-purple-700 border-purple-200",
    };
    return colors[type] || "bg-stone-100 text-stone-700 border-stone-200";
  };

  const columns = [
    {
      key: "patient",
      label: "Patient Details",
      render: (row) => (
        <div className="flex items-center space-x-4 py-1">
          <div className="w-12 h-12 bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-center text-stone-800 font-bold shadow-sm">
            {row.patient?.firstName?.charAt(0) || ""}
            {row.patient?.lastName?.charAt(0) || ""}
          </div>
          <div>
            <p className="font-bold text-stone-900 text-base">
              {row.patient ? formatName(row.patient) : "Unknown Patient"}
            </p>
            <p className="text-sm font-semibold text-stone-500 mt-0.5">{row.patient?.email || "No email"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "doctor",
      label: "Assigned Doctor",
      render: (row) => (
        <div className="py-1">
          <p className="font-bold text-stone-900 text-base flex items-center gap-1.5">
            <FaUserMd className="text-emerald-600 w-3.5 h-3.5" /> Dr. {row.doctor ? formatName(row.doctor) : "N/A"}
          </p>
          <p className="text-sm font-semibold text-stone-500 mt-0.5">{row.doctor?.specialization}</p>
        </div>
      ),
    },
    {
      key: "date",
      label: "Schedule",
      render: (row) => {
        const date = new Date(row.date);
        return (
          <div className="py-1">
            <p className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <FaCalendarAlt className="text-stone-400 w-3 h-3" /> {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-sm font-semibold text-stone-500 flex items-center gap-1.5 mt-0.5">
              <FaClock className="text-stone-400 w-3 h-3" />
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        );
      },
    },
    {
      key: "type",
      label: "Visit Type",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getTypeColor(
            row.type
          )}`}
        >
          {row.type === "new" ? "New Consult" : "Follow Up"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Current Status",
      render: (row) => (
        <span
          className={`flex items-center gap-1.5 w-max px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(
            row.status
          )}`}
        >
          {row.status === 'booked' && <FaCalendarCheck />}
          {row.status === 'in-consultation' && <FaStethoscope className="animate-pulse" />}
          {row.status === 'completed' && <FaCheckCircle />}
          {row.status === 'cancelled' && <FaTimesCircle />}
          {row.status === 'no-show' && <FaUserSlash />}
          {row.status}
        </span>
      ),
    },
    {
      key: "department",
      label: "Dept.",
      render: (row) => (
        <span className="text-sm font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-lg border border-stone-200">
           {row.department || "General"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2 py-1">
          <button
            onClick={() => handleViewDetails(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:border-emerald-500 hover:text-emerald-700 text-stone-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <FaEye /> Case File
          </button>
          {row.status === "booked" && (
            <button
              onClick={() => handleCancelAppointment(row)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              <FaBan /> Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    try {
      await api.patch(`/admin/appointments/${selectedAppointment._id}/cancel`, {
        reason: "Cancelled by admin",
      });
      toast.success("Appointment cancelled successfully");
      setShowCancelModal(false);
      setSelectedAppointment(null);
      fetchAppointments(); // Refresh the list
    } catch (error) {
      toast.error("Failed to cancel appointment");
      console.error(error);
    }
  };

  const filteredAppointments =
    filterStatus === "all"
      ? appointments
      : appointments.filter((apt) => apt.status === filterStatus);

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mt-2 mb-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
              <FaCalendarAlt className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                Appointments Database
              </h1>
              <p className="text-stone-400 font-medium tracking-wide">
                Comprehensive overview of clinical schedules and patient consultations
              </p>
            </div>
          </div>
          
          <button
            onClick={() => toast.success("Export feature coming soon")}
            className="relative z-10 flex items-center justify-center gap-2 px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl border border-stone-700 transition shadow-lg w-full md:w-auto"
          >
            <FaFileExport /> Export Report
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 flex flex-col justify-between hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between mb-3">
               <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Total</p>
               <FaCalendarAlt className="text-stone-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
               {loading ? <span className="animate-pulse bg-stone-200 text-transparent rounded">--</span> : stats.total}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 flex flex-col justify-between hover:border-blue-200 transition-colors">
            <div className="flex items-center justify-between mb-3">
               <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Booked</p>
               <FaCalendarCheck className="text-blue-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-blue-600">
               {loading ? <span className="animate-pulse bg-stone-200 text-transparent rounded">--</span> : stats.booked}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 flex flex-col justify-between hover:border-amber-200 transition-colors">
            <div className="flex items-center justify-between mb-3">
               <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest leading-tight">In Consult</p>
               <FaUserMd className="text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-amber-500">
               {loading ? <span className="animate-pulse bg-stone-200 text-transparent rounded">--</span> : stats.inConsultation}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 flex flex-col justify-between hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between mb-3">
               <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest leading-tight">Complete</p>
               <FaCheckCircle className="text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-600">
               {loading ? <span className="animate-pulse bg-stone-200 text-transparent rounded">--</span> : stats.completed}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 flex flex-col justify-between hover:border-stone-400 transition-colors">
            <div className="flex items-center justify-between mb-3">
               <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">No-Show</p>
               <FaUserSlash className="text-stone-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-stone-700">
               {loading ? <span className="animate-pulse bg-stone-200 text-transparent rounded">--</span> : stats.noShow}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 flex flex-col justify-between hover:border-red-200 transition-colors">
            <div className="flex items-center justify-between mb-3">
               <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest leading-tight">Cancelled</p>
               <FaTimesCircle className="text-red-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-red-600">
               {loading ? <span className="animate-pulse bg-stone-200 text-transparent rounded">--</span> : stats.cancelled}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center gap-2">
           <div className="flex-1 flex items-center w-full min-w-0">
             <div className="pl-4 text-stone-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             </div>
             <input 
                type="text"
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-stone-900 placeholder:text-stone-400 font-medium py-3 px-3"
                placeholder="Search appointments by patient, doctor, or specialty..."
             />
           </div>
           
           <div className="w-full sm:w-auto flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-stone-200 pt-2 sm:pt-0 sm:pl-2">
             <div className="pl-2">
                <FaClock className="text-stone-400 text-sm" />
             </div>
             <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto bg-transparent border-none text-stone-800 font-bold focus:ring-0 py-3 pr-8 cursor-pointer appearance-none"
             >
                <option value="all">All Statuses</option>
                <option value="booked">Booked Scheduled</option>
                <option value="in-consultation">In Consultation</option>
                <option value="completed">Consult Completed</option>
                <option value="no-show">Patient No-Show</option>
                <option value="cancelled">Cancelled</option>
             </select>
           </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 bg-stone-50/50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-stone-900"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCalendarPlus className="w-8 h-8 text-stone-300" />
              </div>
              <p className="text-xl font-bold text-stone-800 mb-2">No Appointments Found</p>
              <p className="text-stone-500 font-medium max-w-sm mx-auto">There are no schedule records matching the selected current filter criteria.</p>
            </div>
          ) : (
            <DataTable columns={columns} data={filteredAppointments} />
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title=""
        size="large"
        showCloseButton={false}
      >
        {selectedAppointment && (
          <div className="space-y-6 pt-1">
            {/* Dark Premium Modal Header */}
            <div className="bg-stone-950 rounded-[2rem] p-8 -mt-8 -mx-8 mb-8 relative overflow-hidden shadow-lg border border-stone-900">
              {/* Close button */}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-200 z-20 border border-white/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/40 via-transparent to-transparent"></div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 relative z-10 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                   <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-md rounded-[1.5rem] shadow-xl flex items-center justify-center border border-white/20 shrink-0">
                     <FaCalendarCheck className="text-white text-3xl sm:text-5xl" />
                   </div>
                   <div className="text-white flex-1">
                     <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                       Clinical Session
                     </h2>
                     <p className="text-emerald-300 text-lg font-bold flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                       <span className="flex items-center justify-center sm:justify-start gap-2">
                          <FaCalendarAlt />
                          {new Date(selectedAppointment.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                       </span>
                       <span className="hidden sm:block text-stone-500">•</span>
                       <span className="flex items-center justify-center sm:justify-start gap-2 text-stone-300">
                          <FaClock />
                          {new Date(selectedAppointment.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                       </span>
                     </p>
                   </div>
                </div>
                <div className="shrink-0">
                   <span className={`flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg ${
                     selectedAppointment.status === 'booked' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50' :
                     selectedAppointment.status === 'in-consultation' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' :
                     selectedAppointment.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                     selectedAppointment.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                     'bg-stone-500/20 text-stone-300 border border-stone-500/50'
                   }`}>
                     {selectedAppointment.status === 'booked' && <FaCalendarCheck />}
                     {selectedAppointment.status === 'in-consultation' && <FaStethoscope className="animate-pulse" />}
                     {selectedAppointment.status === 'completed' && <FaCheckCircle />}
                     {selectedAppointment.status === 'cancelled' && <FaTimesCircle />}
                     {selectedAppointment.status === 'no-show' && <FaUserSlash />}
                     {selectedAppointment.status}
                   </span>
                </div>
              </div>
            </div>

            {/* Patient & Doctor Premium Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-2">
              {/* Patient Card */}
              <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                   <FaUser className="w-24 h-24" />
                </div>
                <div className="relative z-10 flex items-center justify-between mb-5">
                   <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-6 h-0.5 bg-blue-500 rounded-full"></span>
                     Patient Identity
                   </h3>
                   <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      <FaUser className="text-sm" />
                   </div>
                </div>
                
                <div className="relative z-10 flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white border-2 border-blue-100 shadow-sm rounded-[1.25rem] flex items-center justify-center text-blue-600 text-xl font-black">
                    {selectedAppointment.patient.firstName?.charAt(0) || ""}
                    {selectedAppointment.patient.lastName?.charAt(0) || ""}
                  </div>
                  <div>
                    <p className="text-xl font-black text-stone-900">
                      {formatName(selectedAppointment.patient)}
                    </p>
                    <p className="text-sm font-semibold text-stone-500">Registered Member</p>
                  </div>
                </div>

                <div className="relative z-10 space-y-3 bg-white p-4 rounded-2xl border border-stone-100">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center border border-stone-100 shrink-0">
                        <FaEnvelope className="text-stone-400 text-sm" />
                     </div>
                     <span className="font-semibold text-stone-700 truncate">{selectedAppointment.patient.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center border border-stone-100 shrink-0">
                        <FaPhone className="text-stone-400 text-sm" />
                     </div>
                     <span className="font-semibold text-stone-700">{selectedAppointment.patient.phone || "No phone provided"}</span>
                  </div>
                </div>
              </div>

              {/* Doctor Card */}
              <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 relative overflow-hidden group hover:border-emerald-200 transition-colors">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                   <FaUserMd className="w-24 h-24" />
                </div>
                <div className="relative z-10 flex items-center justify-between mb-5">
                   <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-6 h-0.5 bg-emerald-500 rounded-full"></span>
                     Attending Physician
                   </h3>
                   <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                      <FaUserMd className="text-sm" />
                   </div>
                </div>
                
                <div className="relative z-10 flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white border-2 border-emerald-100 shadow-sm rounded-[1.25rem] flex items-center justify-center text-emerald-600 text-xl font-black">
                    {selectedAppointment.doctor.firstName?.charAt(0) || ""}
                    {selectedAppointment.doctor.lastName?.charAt(0) || ""}
                  </div>
                  <div>
                    <p className="text-xl font-black text-stone-900 flex items-center gap-2">
                      Dr. {formatName(selectedAppointment.doctor)}
                       <FaCheckCircle className="text-emerald-500 text-sm" />
                    </p>
                    <p className="text-sm font-semibold text-stone-500">Medical Professional</p>
                  </div>
                </div>

                <div className="relative z-10 space-y-3 bg-white p-4 rounded-2xl border border-stone-100">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center border border-stone-100 shrink-0">
                        <FaStethoscope className="text-emerald-500 text-sm" />
                     </div>
                     <span className="font-bold text-stone-700 truncate">{selectedAppointment.doctor.specialization}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center border border-stone-100 shrink-0">
                        <FaHospital className="text-blue-500 text-sm" />
                     </div>
                     <span className="font-bold text-stone-700">{selectedAppointment.department}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Consultation Context Grid */}
            <div className="px-2 mt-6">
              <h3 className="text-lg font-bold text-stone-900 mb-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                  <FaNotesMedical className="text-stone-600 text-sm" />
                </div>
                Consultation Context
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                 {/* Type Tracker */}
                 <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col justify-center shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 translate-x-4">
                       <FaNotesMedical className="w-20 h-20" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                       <FaCalendarAlt className="text-indigo-500" />
                       <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Visit Frequency</p>
                    </div>
                    <p className="text-lg font-black text-stone-900 capitalize block pt-1">{selectedAppointment.type === 'new' ? 'New First Consult' : 'Follow-up Routine'}</p>
                 </div>
                 {/* Dept Tracker */}
                 <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col justify-center shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 translate-x-4">
                       <FaHospital className="w-20 h-20" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                       <FaHospital className="text-blue-500" />
                       <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Routing Dept.</p>
                    </div>
                    <p className="text-lg font-black text-stone-900 capitalize block pt-1 truncate">{selectedAppointment.department || "General OP"}</p>
                 </div>
                 {/* Reason Tracker */}
                 <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col justify-center shadow-sm relative overflow-hidden md:col-span-2 lg:col-span-1">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 translate-x-4">
                       <FaExclamationTriangle className="w-20 h-20" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                       <FaUserMd className="text-amber-500" />
                       <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Primary Reason</p>
                    </div>
                    <p className="text-sm font-bold text-stone-800 flex-1 flex items-center pt-1">{selectedAppointment.reason}</p>
                 </div>
              </div>

              {/* Symptoms & Notes Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Symptoms */}
                {selectedAppointment.symptoms && selectedAppointment.symptoms.length > 0 ? (
                    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                       <h4 className="text-sm font-bold text-amber-800 mb-4 flex items-center gap-2">
                         <FaExclamationTriangle className="text-amber-500" /> Patient Reported Symptoms
                       </h4>
                       <div className="flex flex-wrap gap-2">
                         {selectedAppointment.symptoms.map((symptom, index) => (
                           <span key={index} className="px-4 py-2 bg-white text-amber-700 rounded-xl text-xs font-bold shadow-sm border border-amber-100 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> {symptom}
                           </span>
                         ))}
                       </div>
                    </div>
                ) : (
                    <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 flex flex-col items-center justify-center text-center">
                       <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center mb-3">
                         <FaExclamationTriangle className="text-stone-300 text-xl" />
                       </div>
                       <p className="text-sm font-bold text-stone-700">No Symptoms Logged</p>
                       <p className="text-xs font-medium text-stone-500 mt-1">Patient did not report beforehand.</p>
                    </div>
                )}

                {/* Additional Notes */}
                {selectedAppointment.notes ? (
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                     <h4 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
                       <FaStickyNote className="text-blue-500" /> Clinical Introspection Notes
                     </h4>
                     <p className="text-sm font-medium text-blue-900/80 leading-relaxed bg-white/60 p-4 rounded-xl border border-blue-100">{selectedAppointment.notes}</p>
                  </div>
                ) : (
                  <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 flex flex-col items-center justify-center text-center">
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center mb-3">
                       <FaStickyNote className="text-stone-300 text-xl" />
                     </div>
                     <p className="text-sm font-bold text-stone-700">No Extra Notes Added</p>
                     <p className="text-xs font-medium text-stone-500 mt-1">No additional commentary provided.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Context Footer */}
            {selectedAppointment.status === "booked" && (
              <div className="mt-6 px-2">
                 <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-red-100 shadow-sm">
                          <FaExclamationTriangle className="text-red-500 text-xl" />
                       </div>
                       <div>
                          <p className="font-bold text-red-900">Administrative Override</p>
                          <p className="text-xs font-semibold text-red-700/80">Force cancel this scheduled appointment slot</p>
                       </div>
                    </div>
                    <button
                      onClick={() => handleCancelAppointment(selectedAppointment)}
                      className="w-full sm:w-auto flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md"
                    >
                      <FaBan /> Enforce Cancellation
                    </button>
                 </div>
              </div>
            )}
            <div className="pb-4"></div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Override Cancellation"
        size="medium"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-4">
              <div className="w-12 h-12 bg-red-100 flex items-center justify-center rounded-xl shrink-0">
                 <FaBan className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-stone-800 font-medium">
                  Are you absolutely certain you wish to cancel the structured appointment for{" "}
                  <strong className="text-stone-950 font-black">
                    {formatName(selectedAppointment.patient)}
                  </strong>{" "}
                  with consulting physician{" "}
                  <strong className="text-stone-950 font-black">
                    Dr. {formatName(selectedAppointment.doctor)}
                  </strong>
                  ?
                </p>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
                System Impact Protocol:
              </p>
              <ul className="space-y-3">
                 <li className="flex items-start gap-3">
                   <span className="w-5 h-5 bg-red-100 flex items-center justify-center rounded-full text-red-600 shrink-0 mt-0.5"><FaTimesCircle className="text-[10px]" /></span>
                   <span className="text-sm font-medium text-stone-700">Immediate automated alert dispatch to patient</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <span className="w-5 h-5 bg-red-100 flex items-center justify-center rounded-full text-red-600 shrink-0 mt-0.5"><FaTimesCircle className="text-[10px]" /></span>
                   <span className="text-sm font-medium text-stone-700">Physician schedule will be re-opened for booking</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <span className="w-5 h-5 bg-red-100 flex items-center justify-center rounded-full text-red-600 shrink-0 mt-0.5"><FaTimesCircle className="text-[10px]" /></span>
                   <span className="text-sm font-medium text-stone-700">Action is final and cannot be easily undone</span>
                 </li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4 border-t border-stone-100">
              <button 
                onClick={handleConfirmCancel}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm text-sm"
              >
                Confirm Deletion
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-3 rounded-xl transition-colors text-sm"
              >
                Abort Protocol
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Appointments;
