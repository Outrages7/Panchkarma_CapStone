import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';

const PrescriptionModal = ({ onClose, onSuccess, preSelectedPatientId = null }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);

  const [formData, setFormData] = useState({
    patientId: preSelectedPatientId || '',
    medicationName: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    instructions: '',
    notes: '',
  });

  useEffect(() => {
    if (!preSelectedPatientId) {
      fetchPatients();
    }
  }, [preSelectedPatientId]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/doctor/patients');
      setPatients(response.data.data || []);
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/doctor/patients/${formData.patientId}/medications`, {
        medicationName: formData.medicationName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        instructions: formData.instructions,
        notes: formData.notes,
      });

      onSuccess();
    } catch (error) {
      toast.error('Failed to create prescription');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create Prescription" size="large">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {!preSelectedPatientId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName} - {patient.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Medication Name"
            name="medicationName"
            value={formData.medicationName}
            onChange={handleChange}
            required
            placeholder="e.g., Lisinopril"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Dosage"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              required
              placeholder="e.g., 10mg"
            />
            <Input
              label="Frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              required
              placeholder="e.g., Once daily"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            <Input
              label="End Date (Optional)"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows="3"
              placeholder="e.g., Take with food"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="Additional notes"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            Create Prescription
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PrescriptionModal;
