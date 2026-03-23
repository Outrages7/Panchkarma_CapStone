import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import PrescriptionModal from '../../components/doctor/PrescriptionModal';
import api from '../../services/api';

const Prescriptions = () => {
  const { user } = useSelector((state) => state.auth);
  const isDoctor = user?.role === 'doctor';
  const { toasts, toast, removeToast } = useToast();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (isDoctor) {
      fetchDoctorPrescriptions();
    } else {
      fetchPatientPrescriptions();
    }
  }, [isDoctor, filterStatus]);

  const fetchDoctorPrescriptions = async () => {
    try {
      setLoading(true);
      const queryParams = filterStatus !== 'all' ? `?status=${filterStatus}` : '';

      const [medicationsRes, statsRes] = await Promise.all([
        api.get(`/doctor/medications${queryParams}`),
        api.get('/doctor/medications/stats'),
      ]);

      setPrescriptions(medicationsRes.data.data.medications || []);
      setStats(statsRes.data.data);
    } catch (error) {
      toast.error('Failed to load prescriptions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patient/prescriptions');
      let meds = response.data.data || [];

      if (filterStatus !== 'all') {
        meds = meds.filter((m) => m.status === filterStatus);
      }

      setPrescriptions(meds);
    } catch (error) {
      toast.error('Failed to load prescriptions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionCreated = () => {
    setShowCreateModal(false);
    if (isDoctor) {
      fetchDoctorPrescriptions();
    }
    toast.success('Prescription created successfully');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'discontinued':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isDoctor ? 'Prescriptions Management' : 'My Prescriptions'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isDoctor
                ? "View and manage all medications you've prescribed"
                : 'View all your active and past prescriptions'}
            </p>
          </div>
          {isDoctor && (
            <Button onClick={() => setShowCreateModal(true)}>Create Prescription</Button>
          )}
        </div>

        {/* Stats Cards (Doctor Only) */}
        {isDoctor && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Prescribed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPrescribed}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeMedications}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Discontinued</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.discontinuedMedications}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">{stats.completedMedications}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="discontinued">Discontinued</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Prescriptions Table */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : prescriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Medication
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {isDoctor ? 'Patient' : 'Prescribed By'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dosage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    {isDoctor && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prescriptions.map((prescription) => (
                    <tr key={prescription._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {prescription.medicationName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {isDoctor
                          ? prescription.patient
                            ? `${prescription.patient.firstName} ${prescription.patient.lastName}`
                            : 'N/A'
                          : prescription.prescribingDoctor
                          ? `Dr. ${prescription.prescribingDoctor.firstName} ${prescription.prescribingDoctor.lastName}`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{prescription.dosage}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{prescription.frequency}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(prescription.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            prescription.status
                          )}`}
                        >
                          {prescription.status}
                        </span>
                      </td>
                      {isDoctor && (
                        <td className="px-6 py-4 text-sm">
                          <button className="text-blue-600 hover:text-blue-900">Edit</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No prescriptions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {isDoctor
                  ? 'Start by creating a prescription for a patient'
                  : 'You have no prescriptions'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Prescription Modal (Doctor Only) */}
      {isDoctor && showCreateModal && (
        <PrescriptionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handlePrescriptionCreated}
        />
      )}
    </DashboardLayout>
  );
};

export default Prescriptions;
