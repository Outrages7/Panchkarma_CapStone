import { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const AddAllergyModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    allergen: '',
    severity: 'mild',
    reaction: '',
    diagnosedDate: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Add Allergy" size="medium">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Allergen Name"
            name="allergen"
            value={formData.allergen}
            onChange={handleChange}
            required
            placeholder="e.g., Penicillin, Peanuts, Pollen"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reaction Description</label>
            <textarea
              name="reaction"
              value={formData.reaction}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Describe the allergic reaction (e.g., rash, difficulty breathing, swelling)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Input
            label="Diagnosed Date"
            name="diagnosedDate"
            type="date"
            value={formData.diagnosedDate}
            onChange={handleChange}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="Any additional information"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={submitting}>
            Add Allergy
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddAllergyModal;
