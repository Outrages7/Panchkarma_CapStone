import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import api from '../../services/api';

const SessionNotesModal = ({ isOpen, onClose, onSuccess, session }) => {
  const [form, setForm] = useState({
    sessionNotes: '',
    patientCondition: '',
    proceduresPerformed: '',
    vitalsBefore: { bloodPressure: '', pulse: '', temperature: '', weight: '', generalCondition: '' },
    vitalsAfter: { bloodPressure: '', pulse: '', temperature: '', weight: '', generalCondition: '' },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVitalsChange = (timing, field, value) => {
    setForm(f => ({
      ...f,
      [`vitals${timing}`]: { ...f[`vitals${timing}`], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.patch(`/therapy-sessions/${session._id}/notes`, {
        sessionNotes: form.sessionNotes,
        patientCondition: form.patientCondition,
        proceduresPerformed: form.proceduresPerformed.split(',').map(s => s.trim()).filter(Boolean),
        vitalsBefore: form.vitalsBefore,
        vitalsAfter: form.vitalsAfter,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save notes.');
    } finally {
      setLoading(false);
    }
  };

  const VitalsSection = ({ timing }) => (
    <div className="grid grid-cols-2 gap-2">
      {['bloodPressure', 'pulse', 'temperature', 'weight'].map(field => (
        <div key={field}>
          <label className="text-xs text-stone-500 capitalize block mb-0.5">{field.replace(/([A-Z])/g, ' $1')}</label>
          <input
            type="text"
            value={form[`vitals${timing}`][field]}
            onChange={e => handleVitalsChange(timing, field, e.target.value)}
            placeholder={field === 'bloodPressure' ? '120/80' : field === 'temperature' ? '98.6°F' : '—'}
            className="w-full border border-amber-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>
      ))}
      <div>
        <label className="text-xs text-stone-500 block mb-0.5">General Condition</label>
        <select
          value={form[`vitals${timing}`].generalCondition}
          onChange={e => handleVitalsChange(timing, 'generalCondition', e.target.value)}
          className="w-full border border-amber-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
        >
          <option value="">Select...</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Session Notes — Session ${session?.sessionNumber}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-stone-600 block mb-1">Session Notes</label>
          <textarea
            rows={3}
            value={form.sessionNotes}
            onChange={e => setForm(f => ({ ...f, sessionNotes: e.target.value }))}
            placeholder="Observations, procedures performed, patient response..."
            className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-600 block mb-1">Patient Condition</label>
          <input
            type="text"
            value={form.patientCondition}
            onChange={e => setForm(f => ({ ...f, patientCondition: e.target.value }))}
            placeholder="e.g., Responding well, mild fatigue after treatment"
            className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-600 block mb-1">Procedures Performed (comma separated)</label>
          <input
            type="text"
            value={form.proceduresPerformed}
            onChange={e => setForm(f => ({ ...f, proceduresPerformed: e.target.value }))}
            placeholder="e.g., Abhyanga, Swedana, Vamana"
            className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-stone-600 mb-2">Vitals Before</p>
            <VitalsSection timing="Before" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-600 mb-2">Vitals After</p>
            <VitalsSection timing="After" />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Save Notes</Button>
        </div>
      </form>
    </Modal>
  );
};

export default SessionNotesModal;
