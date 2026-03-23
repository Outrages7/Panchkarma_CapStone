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
  FaUsers,
  FaUserCheck,
  FaUserPlus,
  FaCalendarAlt,
  FaEye,
  FaEnvelope,
  FaPhone,
  FaVenusMars,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaClipboardList,
  FaHistory,
  FaNotesMedical,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

const Patients = () => {
  const { toasts, toast, removeToast } = useToast();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    totalAppointments: 0,
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/patients");
      const patientsList = response.data.data?.patients || [];
      setPatients(patientsList);

      // Calculate stats
      const now = new Date();
      const newThisMonth = patientsList.filter((p) => {
        const registered = new Date(p.registeredDate);
        return (
          registered.getMonth() === now.getMonth() &&
          registered.getFullYear() === now.getFullYear()
        );
      }).length;

      setStats({
        total: patientsList.length,
        active: patientsList.filter((p) => p.upcomingAppointments > 0).length,
        newThisMonth,
        totalAppointments: patientsList.reduce(
          (sum, p) => sum + (p.totalAppointments || 0),
          0
        ),
      });
    } catch (error) {
      toast.error("Failed to fetch patients");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "patient",
      label: "Patient",
      render: (row) => (
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-center text-stone-900 text-lg font-bold shadow-sm">
            {row.firstName?.charAt(0) || ""}
            {row.lastName?.charAt(0) || ""}
          </div>
          <div>
            <p className="font-bold text-stone-900 text-base">{formatName(row)}</p>
            <p className="text-sm font-medium text-stone-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (row) => (
        <div>
          <p className="text-sm font-bold text-stone-900">{row.phone || "N/A"}</p>
          <p className="text-xs font-semibold text-stone-500 capitalize mt-0.5">
            {row.gender || "N/A"}
          </p>
        </div>
      ),
    },
    {
      key: "age",
      label: "Age",
      render: (row) => {
        if (!row.dateOfBirth)
          return <span className="text-sm font-medium text-stone-400">N/A</span>;
        const age =
          new Date().getFullYear() - new Date(row.dateOfBirth).getFullYear();
        return <span className="text-sm font-bold text-stone-900 bg-stone-50 px-3 py-1 rounded-lg border border-stone-200">{age} yrs</span>;
      },
    },
    {
      key: "location",
      label: "Location",
      render: (row) => (
        <div className="text-sm font-medium text-stone-700">
          {row.address?.city && row.address?.state
            ? `${row.address.city}, ${row.address.state}`
            : <span className="text-stone-400 italic">Not specified</span>}
        </div>
      ),
    },
    {
      key: "lastVisit",
      label: "Last Visit",
      render: (row) => (
        <span className="text-sm font-medium text-stone-700">
          {row.lastVisit
            ? new Date(row.lastVisit).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
            : <span className="text-stone-400 italic">Never</span>}
        </span>
      ),
    },
    {
      key: "appointments",
      label: "Appointments",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md inline-block w-max">
            {row.totalAppointments || 0} Total
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block w-max">
            {row.upcomingAppointments || 0} Upcoming
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold rounded-xl transition shadow-sm"
        >
          <FaEye className="text-xs" />
          View Profile
        </button>
      ),
    },
  ];

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mt-2 mb-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
              <FaUsers className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                Patients Directory
              </h1>
              <p className="text-stone-400 font-medium tracking-wide">
                Comprehensive view and management of all registered patients
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col justify-between hover:border-stone-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Total Patients</p>
              <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
                <FaUsers className="text-stone-600 text-lg" />
              </div>
            </div>
            <p className="text-4xl font-black tracking-tight text-stone-900">
               {loading ? <span className="animate-pulse bg-stone-200 text-transparent rounded">000</span> : stats.total}
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col justify-between hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Active Patients</p>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                <FaUserCheck className="text-emerald-600 text-lg" />
              </div>
            </div>
            <p className="text-4xl font-black tracking-tight text-emerald-700">
              {loading ? <span className="animate-pulse bg-stone-200 text-transparent rounded">00</span> : stats.active}
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col justify-between hover:border-amber-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">New This Month</p>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                <FaUserPlus className="text-amber-600 text-lg" />
              </div>
            </div>
            <p className="text-4xl font-black tracking-tight text-amber-700">
              {loading ? <span className="animate-pulse bg-stone-200 text-transparent rounded">00</span> : stats.newThisMonth}
            </p>
          </div>
          
          <div className="bg-stone-900 rounded-3xl shadow-md border border-stone-800 p-6 flex flex-col justify-between relative overflow-hidden group hover:bg-stone-950 transition-colors">
            <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
               <FaCalendarAlt className="w-32 h-32 text-white" />
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <p className="text-sm font-bold text-stone-400 uppercase tracking-wider">Total Appointments</p>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                <FaCalendarAlt className="text-white text-lg" />
              </div>
            </div>
            <p className="text-4xl font-black tracking-tight text-white relative z-10">
               {loading ? <span className="animate-pulse bg-stone-700 text-transparent rounded">000</span> : stats.totalAppointments}
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
              placeholder="Search patients by name, email, or phone number..."
           />
           <button className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition">
              Search
           </button>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 bg-stone-50/50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-stone-900"></div>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUsers className="w-8 h-8 text-stone-300" />
              </div>
              <p className="text-xl font-bold text-stone-800 mb-2">Patient Directory is Empty</p>
              <p className="text-stone-500 font-medium">No registered patients were found in the system yet.</p>
            </div>
          ) : (
            <DataTable columns={columns} data={patients} />
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title=""
        size="large"
        showCloseButton={false}
      >
        {selectedPatient && (
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
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/40 via-transparent to-transparent"></div>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10 text-center sm:text-left">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[1.5rem] shadow-xl flex items-center justify-center text-white text-4xl font-extrabold border border-white/20 shrink-0">
                  {selectedPatient.firstName?.charAt(0) || ""}
                  {selectedPatient.lastName?.charAt(0) || ""}
                </div>
                <div className="text-white">
                  <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                    {formatName(selectedPatient)}
                  </h2>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-6 text-stone-300 font-medium text-sm">
                    <p className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      <FaEnvelope className="text-emerald-400" />
                      {selectedPatient.email}
                    </p>
                    <p className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      <FaNotesMedical className="text-emerald-400" />
                      Registered: {new Date(selectedPatient.registeredDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information Grid */}
            <div className="px-2">
              <h3 className="text-lg font-bold text-stone-900 mb-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                  <FaUsers className="text-stone-600 text-sm" />
                </div>
                Personal Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
                   <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Phone</p>
                   <p className="text-sm font-bold text-stone-900">{selectedPatient.phone || "N/A"}</p>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
                   <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">D.O.B</p>
                   <p className="text-sm font-bold text-stone-900">
                      {selectedPatient.dateOfBirth ? `${new Date(selectedPatient.dateOfBirth).toLocaleDateString("en-IN")} (${calculateAge(selectedPatient.dateOfBirth)})` : "N/A"}
                   </p>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
                   <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Gender</p>
                   <p className="text-sm font-bold text-stone-900 capitalize">{selectedPatient.gender || "N/A"}</p>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
                   <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Location</p>
                   <p className="text-sm font-bold text-stone-900">
                      {selectedPatient.address?.city && selectedPatient.address?.state ? `${selectedPatient.address.city}, ${selectedPatient.address.state}` : "N/A"}
                   </p>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-6 px-2 mt-2">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Appointment Statistics Cards */}
                  <div className="lg:col-span-1 border border-stone-200 rounded-3xl p-6 bg-white shadow-sm h-full flex flex-col">
                     <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                        <FaCalendarAlt className="text-stone-600 text-sm" />
                        </div>
                        Appointments
                     </h3>
                     <div className="flex flex-col gap-4 flex-1 justify-center">
                        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                           <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">Total</span>
                           <span className="text-2xl font-black text-stone-900">{selectedPatient.totalAppointments || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                           <span className="text-sm font-bold text-amber-700 uppercase tracking-wider">Upcoming</span>
                           <span className="text-2xl font-black text-amber-600">{selectedPatient.upcomingAppointments || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                           <span className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Completed</span>
                           <span className="text-2xl font-black text-emerald-600">
                              {(selectedPatient.totalAppointments || 0) - (selectedPatient.upcomingAppointments || 0)}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Medical History */}
                  <div className="lg:col-span-2 border border-stone-200 rounded-3xl p-6 bg-white shadow-sm h-full flex flex-col">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-stone-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 border border-red-100">
                           <FaNotesMedical className="text-sm" />
                        </div>
                        Medical History
                        </h3>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto max-h-[340px] pr-2 custom-scrollbar">
                        {selectedPatient.medicalHistory?.length > 0 ? (
                        <div className="space-y-4">
                           {selectedPatient.medicalHistory.map((item, index) => (
                              <div key={index} className="bg-white border-2 border-stone-100 rounded-2xl p-5 hover:border-emerald-100 transition-colors">
                                 <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-stone-900 text-lg">{item.condition}</h4>
                                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider bg-stone-100 px-3 py-1 rounded-lg">
                                       {new Date(item.diagnosedDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                                    </span>
                                 </div>
                                 {item.notes && (
                                    <p className="text-sm font-medium text-stone-600 mt-3 pt-3 border-t border-stone-100/60 leading-relaxed italic">
                                       "{item.notes}"
                                    </p>
                                 )}
                              </div>
                           ))}
                        </div>
                        ) : (
                        <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200 border-dashed h-full flex flex-col items-center justify-center">
                           <FaNotesMedical className="text-4xl text-stone-300 mx-auto mb-4 opacity-50" />
                           <p className="text-stone-500 font-bold uppercase tracking-wider text-sm">No medical history recorded</p>
                        </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Patients;
