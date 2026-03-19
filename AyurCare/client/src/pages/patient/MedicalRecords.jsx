import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import AddAllergyModal from '../../components/patient/AddAllergyModal';
import AddVitalSignModal from '../../components/patient/AddVitalSignModal';
import LabResultDetailsModal from '../../components/patient/LabResultDetailsModal';
import api from '../../services/api';

const MedicalRecords = () => {
  const { toasts, toast, removeToast } = useToast();

  const [activeTab, setActiveTab] = useState('history');
  const [loading, setLoading] = useState(true);

  // Data states
  const [allergies, setAllergies] = useState([]);
  const [medications, setMedications] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [vitalSigns, setVitalSigns] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);

  // Modal states
  const [showAddAllergyModal, setShowAddAllergyModal] = useState(false);
  const [showAddVitalSignModal, setShowAddVitalSignModal] = useState(false);
  const [selectedLabResult, setSelectedLabResult] = useState(null);

  useEffect(() => {
    fetchMedicalRecordsSummary();
  }, []);

  const fetchMedicalRecordsSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patient/medical-records/summary');
      const data = response.data.data;

      setAllergies(data.allergies || []);
      setMedications(data.medications || []);
      setLabResults(data.labResults || []);
      setVitalSigns(data.vitalSigns || []);
      setMedicalHistory(data.medicalHistory || []);
    } catch (error) {
      toast.error('Failed to load medical records');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllergy = async (formData) => {
    try {
      const response = await api.post('/patient/medical-records/allergies', formData);
      setAllergies([response.data.data, ...allergies]);
      setShowAddAllergyModal(false);
      toast.success('Allergy added successfully');
    } catch (error) {
      toast.error('Failed to add allergy');
      console.error(error);
    }
  };

  const handleDeleteAllergy = async (allergyId) => {
    if (!window.confirm('Are you sure you want to remove this allergy?')) return;

    try {
      await api.delete(`/patient/medical-records/allergies/${allergyId}`);
      setAllergies(allergies.filter((a) => a._id !== allergyId));
      toast.success('Allergy removed');
    } catch (error) {
      toast.error('Failed to remove allergy');
      console.error(error);
    }
  };

  const handleAddVitalSign = async (formData) => {
    try {
      const response = await api.post('/patient/medical-records/vital-signs', formData);
      setVitalSigns([response.data.data, ...vitalSigns]);
      setShowAddVitalSignModal(false);
      toast.success('Vital signs recorded');
    } catch (error) {
      toast.error('Failed to record vital signs');
      console.error(error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return 'bg-red-100 text-red-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'mild':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'abnormal':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Medical Records
            </h1>
            <p className="text-stone-400 font-medium">
              View your complete medical history and health information
            </p>
          </div>
        </div>
        
        {/* The rest of the page matches the premium dark-header aesthetic */}


        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 mb-6">
          <div className="border-b border-stone-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'history', label: 'Medical History' },
                { id: 'allergies', label: 'Allergies' },
                { id: 'medications', label: 'Medications' },
                { id: 'lab', label: 'Lab Results' },
                { id: 'vitals', label: 'Vital Signs' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-7">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
            </div>
          ) : (
            <>
              {/* Medical History */}
              {activeTab === 'history' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-stone-900">Medical History</h2>
                  </div>

                  {medicalHistory.length > 0 ? (
                    <div className="space-y-4">
                      {medicalHistory.map((item, index) => (
                        <div key={index} className="border-l-4 border-stone-900 pl-4 py-3 bg-stone-50 rounded">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-stone-900">{item.condition}</h3>
                            {item.status && (
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  item.status === 'active'
                                    ? 'bg-blue-100 text-stone-800'
                                    : item.status === 'resolved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-stone-100 text-stone-800'
                                }`}
                              >
                                {item.status}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-stone-600 mt-1">
                            Diagnosed: {new Date(item.diagnosedDate).toLocaleDateString()}
                          </p>
                          {item.severity && (
                            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${getSeverityColor(item.severity)}`}>
                              {item.severity}
                            </span>
                          )}
                          {item.notes && <p className="text-sm text-stone-700 mt-2">{item.notes}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-stone-900">No medical history recorded</h3>
                      <p className="mt-1 text-sm text-stone-500">Your medical history will appear here.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Allergies */}
              {activeTab === 'allergies' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-stone-900">Allergies</h2>
                    <Button onClick={() => setShowAddAllergyModal(true)}>Add Allergy</Button>
                  </div>

                  {allergies.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-stone-200">
                        <thead className="bg-stone-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              Allergen
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              Severity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              Reaction
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              Diagnosed Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-stone-200">
                          {allergies.map((allergy) => (
                            <tr key={allergy._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">
                                {allergy.allergen}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(
                                    allergy.severity
                                  )}`}
                                >
                                  {allergy.severity}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-stone-700">{allergy.reaction}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">
                                {new Date(allergy.diagnosedDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => handleDeleteAllergy(allergy._id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-stone-500">No allergies recorded</p>
                      <Button onClick={() => setShowAddAllergyModal(true)} className="mt-4">
                        Add Your First Allergy
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Medications */}
              {activeTab === 'medications' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-stone-900">Current Medications</h2>
                  </div>

                  {medications.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {medications.map((medication) => (
                        <div key={medication._id} className="border border-stone-200 rounded-lg p-4">
                          <h3 className="font-semibold text-stone-900">{medication.medicationName}</h3>
                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-stone-700">
                              <span className="font-medium">Dosage:</span> {medication.dosage}
                            </p>
                            <p className="text-sm text-stone-700">
                              <span className="font-medium">Frequency:</span> {medication.frequency}
                            </p>
                            <p className="text-sm text-stone-700">
                              <span className="font-medium">Started:</span>{' '}
                              {new Date(medication.startDate).toLocaleDateString()}
                            </p>
                            {medication.prescribingDoctor && (
                              <p className="text-sm text-stone-700">
                                <span className="font-medium">Prescribed by:</span> Dr.{' '}
                                {medication.prescribingDoctor.firstName} {medication.prescribingDoctor.lastName}
                              </p>
                            )}
                            {medication.instructions && (
                              <p className="text-sm text-stone-600 mt-2 italic">{medication.instructions}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-stone-500">No medications recorded</p>
                    </div>
                  )}
                </div>
              )}

              {/* Lab Results */}
              {activeTab === 'lab' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-stone-900">Lab Results</h2>
                  </div>

                  {labResults.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-stone-200">
                        <thead className="bg-stone-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              Test Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              Doctor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-stone-200">
                          {labResults.map((result) => (
                            <tr key={result._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">
                                {result.labOrderName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">
                                {result.resultDate
                                  ? new Date(result.resultDate).toLocaleDateString()
                                  : new Date(result.orderedDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">
                                {result.orderingDoctor
                                  ? `Dr. ${result.orderingDoctor.firstName} ${result.orderingDoctor.lastName}`
                                  : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                    result.overallStatus
                                  )}`}
                                >
                                  {result.overallStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => setSelectedLabResult(result)}
                                  className="text-stone-900 hover:text-stone-800"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-stone-500">No lab results available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Vital Signs */}
              {activeTab === 'vitals' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-stone-900">Vital Signs History</h2>
                    <Button onClick={() => setShowAddVitalSignModal(true)}>Record Vitals</Button>
                  </div>

                  {vitalSigns.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-stone-200">
                        <thead className="bg-stone-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              Blood Pressure
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              Heart Rate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              Temperature
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              Weight
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                              BMI
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-stone-200">
                          {vitalSigns.map((vital) => (
                            <tr key={vital._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">
                                {new Date(vital.recordedDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">
                                {vital.bloodPressure?.systolic && vital.bloodPressure?.diastolic
                                  ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}`
                                  : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">
                                {vital.heartRate ? `${vital.heartRate} bpm` : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">
                                {vital.temperature?.value
                                  ? `${vital.temperature.value}°${vital.temperature.unit}`
                                  : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">
                                {vital.weight?.value ? `${vital.weight.value} ${vital.weight.unit}` : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">
                                {vital.bmi ? vital.bmi : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-stone-500">No vital signs recorded</p>
                      <Button onClick={() => setShowAddVitalSignModal(true)} className="mt-4">
                        Record Your First Vital Signs
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddAllergyModal && (
        <AddAllergyModal onClose={() => setShowAddAllergyModal(false)} onSubmit={handleAddAllergy} />
      )}

      {showAddVitalSignModal && (
        <AddVitalSignModal onClose={() => setShowAddVitalSignModal(false)} onSubmit={handleAddVitalSign} />
      )}

      {selectedLabResult && (
        <LabResultDetailsModal labResult={selectedLabResult} onClose={() => setSelectedLabResult(null)} />
      )}
    </DashboardLayout>
  );
};

export default MedicalRecords;
