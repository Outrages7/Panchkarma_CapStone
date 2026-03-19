import { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const AddVitalSignModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    recordedDate: new Date().toISOString().split('T')[0],
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperatureValue: '',
    temperatureUnit: 'F',
    weightValue: '',
    weightUnit: 'kg',
    heightValue: '',
    heightUnit: 'cm',
    oxygenSaturation: '',
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
      // Transform data to match API structure
      const apiData = {
        recordedDate: formData.recordedDate,
        notes: formData.notes,
      };

      if (formData.systolic && formData.diastolic) {
        apiData.bloodPressure = {
          systolic: parseFloat(formData.systolic),
          diastolic: parseFloat(formData.diastolic),
        };
      }

      if (formData.heartRate) {
        apiData.heartRate = parseFloat(formData.heartRate);
      }

      if (formData.temperatureValue) {
        apiData.temperature = {
          value: parseFloat(formData.temperatureValue),
          unit: formData.temperatureUnit,
        };
      }

      if (formData.weightValue) {
        apiData.weight = {
          value: parseFloat(formData.weightValue),
          unit: formData.weightUnit,
        };
      }

      if (formData.heightValue) {
        apiData.height = {
          value: parseFloat(formData.heightValue),
          unit: formData.heightUnit,
        };
      }

      if (formData.oxygenSaturation) {
        apiData.oxygenSaturation = parseFloat(formData.oxygenSaturation);
      }

      await onSubmit(apiData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Record Vital Signs" size="large">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Date"
            name="recordedDate"
            type="date"
            value={formData.recordedDate}
            onChange={handleChange}
            required
          />

          {/* Blood Pressure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Systolic"
                name="systolic"
                type="number"
                value={formData.systolic}
                onChange={handleChange}
                placeholder="120"
                min="40"
                max="300"
              />
              <Input
                label="Diastolic"
                name="diastolic"
                type="number"
                value={formData.diastolic}
                onChange={handleChange}
                placeholder="80"
                min="20"
                max="200"
              />
            </div>
          </div>

          {/* Heart Rate */}
          <Input
            label="Heart Rate (bpm)"
            name="heartRate"
            type="number"
            value={formData.heartRate}
            onChange={handleChange}
            placeholder="72"
            min="20"
            max="300"
          />

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Value"
                name="temperatureValue"
                type="number"
                step="0.1"
                value={formData.temperatureValue}
                onChange={handleChange}
                placeholder="98.6"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  name="temperatureUnit"
                  value={formData.temperatureUnit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="F">Fahrenheit (°F)</option>
                  <option value="C">Celsius (°C)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Value"
                name="weightValue"
                type="number"
                step="0.1"
                value={formData.weightValue}
                onChange={handleChange}
                placeholder="70"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  name="weightUnit"
                  value={formData.weightUnit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lbs">Pounds (lbs)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Value"
                name="heightValue"
                type="number"
                step="0.1"
                value={formData.heightValue}
                onChange={handleChange}
                placeholder="170"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  name="heightUnit"
                  value={formData.heightUnit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Oxygen Saturation */}
          <Input
            label="Oxygen Saturation (%)"
            name="oxygenSaturation"
            type="number"
            value={formData.oxygenSaturation}
            onChange={handleChange}
            placeholder="98"
            min="0"
            max="100"
          />

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="Any additional notes"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              BMI will be calculated automatically if you provide both weight and height.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={submitting}>
            Record Vital Signs
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddVitalSignModal;
