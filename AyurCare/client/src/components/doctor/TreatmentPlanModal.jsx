import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import api from '../../services/api';

const TreatmentPlanModal = ({ isOpen, onClose, onSuccess, patient }) => {
  const [therapyTypes, setTherapyTypes] = useState([]);
  const [form, setForm] = useState({
    therapyType: '',
    title: '',
    startDate: '',
    chiefComplaints: '',
    goals: '',
    dietPlan: '',
    lifestyleAdvice: '',
    practitionerNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) fetchTherapyTypes();
  }, [isOpen]);

  const fetchTherapyTypes = async () => {
    try {
      const res = await api.get('/therapy-types');
      setTherapyTypes(res.data.data || []);
    } catch {
      setTherapyTypes([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.therapyType || !form.startDate) {
      setError('Therapy type and start date are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/treatment-plans', {
        patient: patient._id,
        therapyType: form.therapyType,
        title: form.title || undefined,
        startDate: form.startDate,
        chiefComplaints: form.chiefComplaints.split(',').map(s => s.trim()).filter(Boolean),
        goals: form.goals.split(',').map(s => s.trim()).filter(Boolean),
        dietPlan: form.dietPlan || undefined,
        lifestyleAdvice: form.lifestyleAdvice || undefined,
        practitionerNotes: form.practitionerNotes || undefined,
        status: 'active',
      });
      onSuccess?.();
      onClose();
      setForm({ therapyType: '', title: '', startDate: '', chiefComplaints: '', goals: '', dietPlan: '', lifestyleAdvice: '', practitionerNotes: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create treatment plan.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Create Treatment Plan — ${patient?.firstName} ${patient?.lastName}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-stone-600 block mb-1">Therapy Type *</label>
            <select
              value={form.therapyType}
              onChange={e => setForm(f => ({ ...f, therapyType: e.target.value }))}
              className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            >
              <option value="">Select therapy...</option>
              {therapyTypes.map(t => (
                <option key={t._id} value={t._id}>{t.displayName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 block mb-1">Plan Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g., Vamana Therapy — March 2026"
              className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-600 block mb-1">Start Date *</label>
          <input
            type="date"
            min={today}
            value={form.startDate}
            onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
            className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-600 block mb-1">Chief Complaints (comma separated)</label>
          <input
            type="text"
            value={form.chiefComplaints}
            onChange={e => setForm(f => ({ ...f, chiefComplaints: e.target.value }))}
            placeholder="e.g., joint pain, obesity, digestive issues"
            className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-600 block mb-1">Treatment Goals (comma separated)</label>
          <input
            type="text"
            value={form.goals}
            onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
            placeholder="e.g., weight loss, pain relief, improved digestion"
            className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-600 block mb-1">Diet Plan Recommendations</label>
          <textarea
            rows={2}
            value={form.dietPlan}
            onChange={e => setForm(f => ({ ...f, dietPlan: e.target.value }))}
            placeholder="Dietary guidelines for this treatment..."
            className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-600 block mb-1">Lifestyle Advice</label>
          <textarea
            rows={2}
            value={form.lifestyleAdvice}
            onChange={e => setForm(f => ({ ...f, lifestyleAdvice: e.target.value }))}
            placeholder="Lifestyle recommendations for the patient..."
            className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-600 block mb-1">Practitioner Notes</label>
          <textarea
            rows={2}
            value={form.practitionerNotes}
            onChange={e => setForm(f => ({ ...f, practitionerNotes: e.target.value }))}
            placeholder="Clinical observations or special considerations..."
            className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Treatment Plan</Button>
        </div>
      </form>
    </Modal>
  );
};

export default TreatmentPlanModal;
