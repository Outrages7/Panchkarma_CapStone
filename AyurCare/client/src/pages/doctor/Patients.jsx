import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import { formatName } from '../../utils/formatters';
import api from '../../services/api';
import { FaUserInjured, FaSearch } from 'react-icons/fa';

const Patients = () => {
  const { toasts, toast, removeToast } = useToast();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/doctor/patients');
      setPatients(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load patients');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mt-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
              <FaUserInjured className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                My Patients
              </h1>
              <p className="text-stone-400 font-medium">
                View and manage your patient list
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-2">
          <div className="pl-4 text-stone-400">
             <FaSearch className="w-5 h-5" />
          </div>
          <input 
            type="text"
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-stone-900 placeholder:text-stone-400 font-medium py-3"
            placeholder="Search patients by name, email, or phone..."
          />
        </div>

        {/* Patients Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-stone-200 border-dashed">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
          </div>
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-16 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <FaUserInjured className="w-6 h-6 text-stone-400" />
            </div>
            <p className="text-stone-500 font-medium text-lg">No patients found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
            <div key={patient.id} className="bg-white rounded-3xl shadow-sm border border-stone-200 p-7 hover:border-emerald-500/30 hover:shadow-md transition-all flex flex-col h-full">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-14 h-14 bg-stone-950 border border-stone-800 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-inner">
                  {patient.firstName.charAt(0)}
                  {patient.lastName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-stone-900 truncate tracking-tight">{formatName(patient)}</h3>
                  <p className="text-sm font-medium text-stone-500 truncate">{patient.email}</p>
                  <p className="text-xs font-semibold text-stone-400 mt-0.5 tracking-wider">{patient.phone}</p>
                </div>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 flex-1 border border-stone-100/50 space-y-3 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-stone-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Age</span>
                  <span className="font-bold text-stone-900">{calculateAge(patient.dateOfBirth)} years</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-stone-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Gender</span>
                  <span className="font-bold text-stone-900 capitalize">{patient.gender}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-stone-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Last Visit</span>
                  <span className="font-bold text-stone-900">
                    {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Visits</span>
                  <span className="font-bold text-stone-900">{patient.totalVisits || 0}</span>
                </div>
              </div>

              <div className="mt-auto">
                <button onClick={() => handleViewDetails(patient)} className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition-colors">
                  View Full Profile
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Patient Details"
        size="large"
      >
        {selectedPatient && (
          <div className="space-y-6 pt-2">
            {/* Personal Information */}
            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 mb-5">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="font-bold text-stone-900">{formatName(selectedPatient)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="font-bold text-stone-900 truncate" title={selectedPatient.email}>{selectedPatient.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Phone</p>
                  <p className="font-bold text-stone-900">{selectedPatient.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Date of Birth</p>
                  <p className="font-bold text-stone-900">
                    {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Gender</p>
                  <p className="font-bold text-stone-900 capitalize">{selectedPatient.gender}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Blood Group</p>
                  <p className="font-bold text-stone-900">{selectedPatient.medicalHistory?.[0]?.bloodGroup || "Unknown"}</p>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div>
              <h3 className="text-lg font-bold text-stone-900 mb-4 px-2">Medical History</h3>
              {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                <div className="space-y-3">
                  {selectedPatient.medicalHistory.map((item, index) => (
                    <div key={index} className="border-l-4 border-emerald-500 pl-5 py-4 bg-white border border-stone-200 rounded-2xl shadow-sm">
                      <h4 className="font-bold text-stone-900">{item.condition}</h4>
                      <p className="text-xs font-medium text-stone-500 mt-1 uppercase tracking-wider">
                        Diagnosed: {new Date(item.diagnosedDate).toLocaleDateString()}
                      </p>
                      {item.notes && <p className="text-sm font-medium text-stone-700 mt-3 pt-3 border-t border-stone-100">{item.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-stone-200 border-dashed rounded-3xl p-8 text-center">
                  <p className="text-stone-500 font-medium">No medical history recorded</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-stone-100">
              <button onClick={() => setShowDetailsModal(false)} className="flex-1 py-3 text-sm font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition">
                Close
              </button>
              <button disabled onClick={() => {}} className="flex-1 py-3 text-sm font-bold text-stone-400 bg-stone-100 cursor-not-allowed rounded-xl transition">
                Full Records (Soon)
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Patients;
