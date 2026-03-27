import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import api from '../../services/api';
import { FaPlus, FaTrash, FaCalendarAlt } from 'react-icons/fa';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const TreatmentPlanModal = ({ plan, patients, therapyTypes, onClose, onSaved }) => {
  const isEdit = !!plan;

  const [form, setForm] = useState({
    patient: '',
    therapyType: '',
    title: '',
    startDate: '',
    endDate: '',
    chiefComplaints: '',
    goals: '',
    dietPlan: '',
    lifestyleAdvice: '',
    practitionerNotes: '',
    status: 'active',
  });
  const [sessionSchedule, setSessionSchedule] = useState([]); // [{ dayOfWeek, time, durationMinutes }]
  const [generating, setGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (plan) {
      setForm({
        patient: plan.patient?._id || plan.patient || '',
        therapyType: plan.therapyType?._id || plan.therapyType || '',
        title: plan.title || '',
        startDate: plan.startDate ? new Date(plan.startDate).toISOString().split('T')[0] : '',
        endDate: plan.endDate ? new Date(plan.endDate).toISOString().split('T')[0] : '',
        chiefComplaints: (plan.chiefComplaints || []).join(', '),
        goals: (plan.goals || []).join(', '),
        dietPlan: plan.dietPlan || '',
        lifestyleAdvice: plan.lifestyleAdvice || '',
        practitionerNotes: plan.practitionerNotes || '',
        status: plan.status || 'active',
      });
      setSessionSchedule((plan.sessionSchedule || []).map(s => ({ ...s })));
    } else {
      setForm({
        patient: '', therapyType: '', title: '', startDate: '', endDate: '',
        chiefComplaints: '', goals: '', dietPlan: '', lifestyleAdvice: '',
        practitionerNotes: '', status: 'active',
      });
      setSessionSchedule([]);
    }
    setGenerateMsg('');
  }, [plan]);

  const addScheduleSlot = () => {
    setSessionSchedule(s => [...s, { dayOfWeek: 'monday', time: '09:00', durationMinutes: 60 }]);
  };

  const removeScheduleSlot = (i) => {
    setSessionSchedule(s => s.filter((_, idx) => idx !== i));
  };

  const updateScheduleSlot = (i, key, value) => {
    setSessionSchedule(s => s.map((slot, idx) => idx === i ? { ...slot, [key]: value } : slot));
  };

  const handleGenerateSessions = async () => {
    if (!plan?._id) return;
    setGenerating(true);
    setGenerateMsg('');
    try {
      const res = await api.post(`/treatment-plans/${plan._id}/generate-sessions`);
      setGenerateMsg(`✅ ${res.data.message}`);
    } catch (err) {
      setGenerateMsg(`❌ ${err.response?.data?.error || 'Failed to generate sessions'}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient || !form.therapyType || !form.startDate) {
      setError('Patient, therapy type, and start date are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        patient: form.patient,
        therapyType: form.therapyType,
        title: form.title || undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        chiefComplaints: form.chiefComplaints.split(',').map(s => s.trim()).filter(Boolean),
        goals: form.goals.split(',').map(s => s.trim()).filter(Boolean),
        dietPlan: form.dietPlan || undefined,
        lifestyleAdvice: form.lifestyleAdvice || undefined,
        practitionerNotes: form.practitionerNotes || undefined,
        status: form.status,
        sessionSchedule: sessionSchedule.filter(s => s.dayOfWeek && s.time),
      };

      if (isEdit) {
        await api.put(`/treatment-plans/${plan._id}`, payload);
      } else {
        await api.post('/treatment-plans', payload);
      }
      onSaved?.();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} treatment plan.`);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const inputClass = "w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors";
  const selectClass = "w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors appearance-none cursor-pointer";
  const labelClass = "text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5";

  return (
    <Modal isOpen={true} onClose={onClose} title={isEdit ? 'Edit Treatment Plan' : 'Create Treatment Plan'} size="large">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Patient *</label>
            <select
              value={form.patient}
              onChange={e => setForm(f => ({ ...f, patient: e.target.value }))}
              className={selectClass}
              required
              disabled={isEdit}
            >
              <option value="">Select patient...</option>
              {(patients || []).map(p => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} {p.email ? `(${p.email})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Therapy Type *</label>
            <select
              value={form.therapyType}
              onChange={e => setForm(f => ({ ...f, therapyType: e.target.value }))}
              className={selectClass}
              required
            >
              <option value="">Select therapy...</option>
              {(therapyTypes || []).map(t => (
                <option key={t._id} value={t._id}>{t.displayName || t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Plan Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g., Vamana Therapy — March 2026"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className={selectClass}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Start Date *</label>
            <input
              type="date"
              min={isEdit ? undefined : today}
              value={form.startDate}
              onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              className={`${inputClass} [color-scheme:dark]`}
              required
            />
          </div>
          <div>
            <label className={labelClass}>End Date</label>
            <input
              type="date"
              min={form.startDate || today}
              value={form.endDate}
              onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
              className={`${inputClass} [color-scheme:dark]`}
            />
          </div>
        </div>

        {/* ── Fixed Session Schedule ── */}
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="w-3.5 h-3.5 text-emerald-400" />
              <span className={labelClass} style={{ marginBottom: 0 }}>Fixed Session Schedule</span>
            </div>
            <button
              type="button"
              onClick={addScheduleSlot}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <FaPlus className="w-3 h-3" /> Add Day
            </button>
          </div>

          {sessionSchedule.length === 0 ? (
            <p className="text-xs text-stone-500 font-medium italic">
              No schedule set. Add days to auto-generate recurring sessions for this patient.
            </p>
          ) : (
            <div className="space-y-2">
              {sessionSchedule.map((slot, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={slot.dayOfWeek}
                    onChange={e => updateScheduleSlot(i, 'dayOfWeek', e.target.value)}
                    className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 capitalize"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                  </select>
                  <input
                    type="time"
                    value={slot.time}
                    onChange={e => updateScheduleSlot(i, 'time', e.target.value)}
                    className="w-28 bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 [color-scheme:light]"
                  />
                  <input
                    type="number"
                    value={slot.durationMinutes}
                    min="15"
                    max="240"
                    step="15"
                    onChange={e => updateScheduleSlot(i, 'durationMinutes', Number(e.target.value))}
                    className="w-20 bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    placeholder="60"
                  />
                  <span className="text-xs text-stone-500 shrink-0">min</span>
                  <button
                    type="button"
                    onClick={() => removeScheduleSlot(i)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Generate sessions button — only shown in edit mode */}
          {isEdit && (
            <div className="mt-3 pt-3 border-t border-stone-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerateSessions}
                  disabled={generating || sessionSchedule.length === 0 || !form.endDate}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-xl transition-colors"
                >
                  {generating ? 'Generating...' : '⚡ Generate Sessions'}
                </button>
                {(!form.endDate && sessionSchedule.length > 0) && (
                  <span className="text-xs text-amber-400 font-medium">Set an end date to generate sessions</span>
                )}
                {generateMsg && <span className="text-xs text-stone-400 font-medium">{generateMsg}</span>}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Chief Complaints (comma separated)</label>
          <input
            type="text"
            value={form.chiefComplaints}
            onChange={e => setForm(f => ({ ...f, chiefComplaints: e.target.value }))}
            placeholder="e.g., joint pain, obesity, digestive issues"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Treatment Goals (comma separated)</label>
          <input
            type="text"
            value={form.goals}
            onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
            placeholder="e.g., weight loss, pain relief, improved digestion"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Diet Plan Recommendations</label>
          <textarea
            rows={2}
            value={form.dietPlan}
            onChange={e => setForm(f => ({ ...f, dietPlan: e.target.value }))}
            placeholder="Dietary guidelines for this treatment..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className={labelClass}>Lifestyle Advice</label>
          <textarea
            rows={2}
            value={form.lifestyleAdvice}
            onChange={e => setForm(f => ({ ...f, lifestyleAdvice: e.target.value }))}
            placeholder="Lifestyle recommendations for the patient..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className={labelClass}>Practitioner Notes</label>
          <textarea
            rows={2}
            value={form.practitionerNotes}
            onChange={e => setForm(f => ({ ...f, practitionerNotes: e.target.value }))}
            placeholder="Clinical observations or special considerations..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-sm border border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Treatment Plan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TreatmentPlanModal;
