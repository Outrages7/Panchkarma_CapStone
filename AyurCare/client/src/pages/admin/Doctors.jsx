import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/common/Button";
import SearchBar from "../../components/common/SearchBar";
import Modal from "../../components/common/Modal";
import StatusBadge from "../../components/dashboard/StatusBadge";
import DataTable from "../../components/dashboard/DataTable";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/common/Toast";
import { formatName } from "../../utils/formatters";
import { getSpecializationLabel } from "../../utils/specializations";
import api from "../../services/api";
import {
  FaUserMd,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaUserCheck,
  FaEye,
  FaCheck,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaBriefcase,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCalendarCheck,
} from "react-icons/fa";

const Doctors = () => {
  const { toasts, toast, removeToast } = useToast();

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    available: 0,
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/doctors");
      const doctorsList = response.data.data?.doctors || [];
      setDoctors(doctorsList);

      // Calculate stats
      setStats({
        total: doctorsList.length,
        approved: doctorsList.filter((d) => d.isApproved).length,
        pending: doctorsList.filter((d) => !d.isApproved).length,
        available: doctorsList.filter((d) => d.isAvailable).length,
      });
    } catch (error) {
      toast.error("Failed to fetch doctors");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "doctor",
      label: "Doctor",
      render: (row) => (
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-sm">
            {row.firstName?.charAt(0) || ""}
            {row.lastName?.charAt(0) || ""}
          </div>
          <div>
            <p className="font-bold text-stone-900 text-base flex items-center gap-1.5">
              Dr. {formatName(row)}
              {row.isApproved && (
                <FaCheckCircle
                  className="text-emerald-500 w-3.5 h-3.5"
                  title="Approved Verification"
                />
              )}
            </p>
            <p className="text-sm font-semibold text-stone-500 mt-0.5">{getSpecializationLabel(row.specialization)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (row) => (
        <div>
          <p className="text-sm font-bold text-stone-900">{row.email}</p>
          <p className="text-xs font-semibold text-stone-500 mt-0.5">{row.phone || "No phone"}</p>
        </div>
      ),
    },
    {
      key: "experience",
      label: "Experience",
      render: (row) => (
        <span className="text-sm font-bold text-stone-900 bg-stone-50 px-3 py-1 rounded-lg border border-stone-200">
          {row.experience} yrs
        </span>
      ),
    },
    {
      key: "fee",
      label: "Fee",
      render: (row) => (
        <span className="text-sm font-bold text-stone-900">
          {row.consultationFee ? (
            `₹${row.consultationFee}`
          ) : (
            <span className="text-stone-400 italic font-medium">Not set</span>
          )}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <div className="flex flex-col gap-1.5 items-start">
          {!row.isApproved ? (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
              <FaClock className="text-amber-500" /> Pending Review
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
              <FaCheckCircle className="text-emerald-500" /> Approved
            </span>
          )}

          {row.isAvailable ? (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
              <FaUserCheck className="text-emerald-500" /> Available
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500 px-2 py-0.5 rounded-md border border-stone-200">
              Not Available
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stats",
      label: "Insights",
      render: (row) => (
        <div className="flex flex-col gap-1 text-sm">
          <p className="text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded w-max">
            {row.totalPatients || 0} Patients
          </p>
          <p className="text-xs font-bold text-stone-500 px-2">
            {row.totalAppointments || 0} Appointments
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:border-emerald-500 hover:text-emerald-700 text-stone-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <FaEye /> Profile
          </button>
          {!row.isApproved && (
            <button
              onClick={() => handleApprove(row)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              <FaCheck /> Approve
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailsModal(true);
  };

  const handleApprove = (doctor) => {
    setSelectedDoctor(doctor);
    setShowApprovalModal(true);
  };

  const handleConfirmApproval = async () => {
    try {
      await api.patch(
        `/admin/doctors/${selectedDoctor.id || selectedDoctor._id}/approval`,
        {
          isApproved: true,
        }
      );
      toast.success(`Dr. ${formatName(selectedDoctor)} has been approved`);
      setShowApprovalModal(false);
      setSelectedDoctor(null);
      fetchDoctors(); // Refresh the list
    } catch (error) {
      toast.error("Failed to approve doctor");
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mt-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
              <FaUserMd className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                Doctors Management
              </h1>
              <p className="text-stone-400 font-medium tracking-wide">
                Manage practitioner credentials, verify identities, and review approvals
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col justify-between hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Total Doctors</p>
              <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
                <FaUserMd className="text-stone-600 text-lg" />
              </div>
            </div>
            <p className="text-4xl font-black tracking-tight text-stone-900">
              {loading ? <span className="animate-pulse bg-stone-200 text-transparent rounded">--</span> : stats.total}
            </p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col justify-between hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Approved</p>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                <FaCheckCircle className="text-emerald-500 text-lg" />
              </div>
            </div>
            <p className="text-4xl font-black tracking-tight text-emerald-700">
               {loading ? <span className="animate-pulse bg-stone-200 text-transparent rounded">--</span> : stats.approved}
            </p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col justify-between hover:border-amber-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Pending Review</p>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                <FaClock className="text-amber-500 text-lg" />
              </div>
            </div>
            <p className="text-4xl font-black tracking-tight text-amber-600">
               {loading ? <span className="animate-pulse bg-stone-200 text-transparent rounded">--</span> : stats.pending}
            </p>
          </div>
          <div className="bg-stone-900 rounded-3xl shadow-md border border-stone-800 p-6 flex flex-col justify-between hover:bg-stone-950 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-stone-400 uppercase tracking-wider">Available Now</p>
              <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center border border-stone-700">
                <FaUserCheck className="text-stone-300 text-lg" />
              </div>
            </div>
            <p className="text-4xl font-black tracking-tight text-white">
               {loading ? <span className="animate-pulse bg-stone-700 text-transparent rounded">--</span> : stats.available}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-2 max-w-2xl">
           <div className="pl-4 text-stone-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
           </div>
           <input 
              type="text"
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-stone-900 placeholder:text-stone-400 font-medium py-3"
              placeholder="Search doctors by name, specialization, or license number..."
           />
           <button className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition">
              Search
           </button>
        </div>

        {/* Doctors Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 bg-stone-50/50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-stone-900"></div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUserMd className="w-8 h-8 text-stone-300" />
              </div>
              <p className="text-xl font-bold text-stone-800 mb-2">No Doctors Registered</p>
              <p className="text-stone-500 font-medium">There are currently no doctors pending or approved in the system.</p>
            </div>
          ) : (
            <DataTable columns={columns} data={doctors} />
          )}
        </div>
      </div>

      {/* Doctor Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title=""
        size="large"
        showCloseButton={false}
      >
        {selectedDoctor && (
          <div className="space-y-6 pt-1">
            {/* Header with Avatar */}
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
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/40 via-transparent to-transparent"></div>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10 text-center sm:text-left">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[1.5rem] shadow-xl flex items-center justify-center text-white text-4xl font-extrabold border border-white/20 shrink-0">
                  {selectedDoctor.firstName?.charAt(0)?.toUpperCase()}
                  {selectedDoctor.lastName?.charAt(0)?.toUpperCase()}
                </div>
                <div className="text-white flex-1">
                  <h2 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center justify-center sm:justify-start gap-3">
                    Dr. {formatName(selectedDoctor)}
                    {selectedDoctor.isApproved && (
                      <span className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-full border border-emerald-500/30">
                        <FaCheckCircle className="w-5 h-5" title="Approved Profile" />
                      </span>
                    )}
                  </h2>
                  <p className="text-stone-300 text-lg font-medium mb-3">
                    {getSpecializationLabel(selectedDoctor.specialization)} Specialization
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    {!selectedDoctor.isApproved && (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-amber-500/30">
                        <FaClock /> Pending Review
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${
                      selectedDoctor.isAvailable 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-white/5 text-stone-400 border-white/10'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${selectedDoctor.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`}></span>
                      {selectedDoctor.isAvailable ? 'Active Scheduler' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information - Premium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
              <div className="flex flex-col justify-center p-5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-3 mb-2">
                  <FaEnvelope className="text-stone-400" />
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Email Address</p>
                </div>
                <p className="font-bold text-stone-900 text-lg pl-7">{selectedDoctor.email}</p>
              </div>
              <div className="flex flex-col justify-center p-5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-3 mb-2">
                  <FaPhone className="text-stone-400" />
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Phone Number</p>
                </div>
                <p className="font-bold text-stone-900 text-lg pl-7">{selectedDoctor.phone || "Not provided"}</p>
              </div>
            </div>

            {/* Professional Details Grid */}
            <div className="px-2 mt-6">
              <h3 className="text-lg font-bold text-stone-900 mb-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                  <FaBriefcase className="text-stone-600 text-sm" />
                </div>
                Professional Insights
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col justify-center items-center text-center shadow-sm">
                   <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center mb-3">
                      <FaIdCard className="text-stone-500" />
                   </div>
                   <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">License No.</p>
                   <p className="text-sm font-bold text-stone-900">{selectedDoctor.licenseNumber || "Pending"}</p>
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col justify-center items-center text-center shadow-sm">
                   <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                      <FaBriefcase className="text-emerald-500" />
                   </div>
                   <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Experience</p>
                   <p className="text-sm font-black text-stone-900">{selectedDoctor.experience || 0} Years</p>
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col justify-center items-center text-center shadow-sm">
                   <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
                      <FaMoneyBillWave className="text-amber-500" />
                   </div>
                   <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Consultation</p>
                   <p className="text-sm font-black text-stone-900">{selectedDoctor.consultationFee ? `₹${selectedDoctor.consultationFee}` : "N/A"}</p>
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col justify-center items-center text-center shadow-sm">
                   <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center mb-3">
                      <FaCalendarAlt className="text-stone-500" />
                   </div>
                   <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Joined Date</p>
                   <p className="text-xs font-bold text-stone-900">
                     {selectedDoctor.joinedDate
                      ? new Date(selectedDoctor.joinedDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                      : "Unknown"}
                   </p>
                </div>
              </div>
            </div>

            {/* Engagements & Actions */}
            <div className="px-2 mt-6 flex flex-col sm:flex-row gap-6">
              {/* Engagement Stats */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="p-5 bg-stone-950 rounded-2xl text-white shadow-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 transform transition-transform group-hover:scale-125 duration-500">
                    <FaUsers className="w-16 h-16" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Total Network</p>
                    <p className="text-3xl font-black">{selectedDoctor.totalPatients || 0}</p>
                    <p className="text-sm font-medium text-stone-400 mt-1">Unique Patients</p>
                  </div>
                </div>
                <div className="p-5 bg-emerald-700 rounded-2xl text-white shadow-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 transform transition-transform group-hover:scale-125 duration-500">
                    <FaCalendarCheck className="w-16 h-16" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 mb-1">Case History</p>
                    <p className="text-3xl font-black">{selectedDoctor.totalAppointments || 0}</p>
                    <p className="text-sm font-medium text-emerald-200 mt-1">Appointments Total</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer Sidebar */}
              {!selectedDoctor.isApproved && (
                <div className="sm:w-64 bg-amber-50 rounded-2xl p-6 border border-amber-200 flex flex-col justify-center text-center">
                  <FaCheckCircle className="text-3xl text-amber-500 mx-auto mb-3" />
                  <h4 className="font-bold text-amber-800 mb-2">Pending Medical Approval</h4>
                  <p className="text-xs font-medium text-amber-700/80 mb-5">Review credentials before granting platform access.</p>
                  <button 
                    onClick={() => handleApprove(selectedDoctor)}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <FaCheck /> Verify & Approve
                  </button>
                </div>
              )}
            </div>
            
            <div className="pb-4"></div>
          </div>
        )}
      </Modal>

      {/* Approval Confirmation Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Verify Practitioner"
        size="medium"
      >
        {selectedDoctor && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4">
              <div className="w-12 h-12 bg-amber-100 flex items-center justify-center rounded-xl shrink-0">
                 <FaIdCard className="text-amber-600 text-xl" />
              </div>
              <div>
                <p className="text-stone-800 font-medium">
                  Are you sure you want to approve{" "}
                  <strong className="text-stone-950 font-black">
                    Dr. {formatName(selectedDoctor)}
                  </strong>{" "}
                  as a verified doctor on the platform?
                </p>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
                Post-Approval Capabilities:
              </p>
              <ul className="space-y-3">
                {["Access exclusive practitioner dashboard", "Manage holistic therapy and treatment plans", "Access patient case history records", "Prescribe comprehensive wellness formulas"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-emerald-100 flex items-center justify-center rounded-full text-emerald-600 shrink-0 mt-0.5"><FaCheck className="text-[10px]" /></span>
                    <span className="text-sm font-medium text-stone-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 pt-4 border-t border-stone-100">
              <button 
                onClick={handleConfirmApproval}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors shadow-sm text-sm"
              >
                Approve Doctor Now
              </button>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-3 rounded-xl transition-colors text-sm"
              >
                Cancel Evaluation
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Doctors;
