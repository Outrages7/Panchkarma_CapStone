import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import api from '../../services/api';
import {
  FaWater,
  FaLeaf,
  FaTint,
  FaWind,
  FaHeartbeat,
  FaClock,
  FaCheckCircle,
} from 'react-icons/fa';

const THERAPY_ICONS = {
  vamana: FaWater,
  virechana: FaLeaf,
  basti: FaTint,
  nasya: FaWind,
  raktamokshana: FaHeartbeat,
};

const DOSHA_COLORS = {
  kapha: 'bg-blue-100 text-blue-700',
  pitta: 'bg-red-100 text-red-700',
  vata: 'bg-purple-100 text-purple-700',
};

const BookTherapyModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [therapyTypes, setTherapyTypes] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [selectedTherapy, setSelectedTherapy] = useState(null);
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTherapyTypes();
      fetchPractitioners();
    }
  }, [isOpen]);

  const fetchTherapyTypes = async () => {
    try {
      const res = await api.get('/therapy-types');
      setTherapyTypes(res.data.data || []);
    } catch {
      setTherapyTypes([]);
    }
  };

  const fetchPractitioners = async () => {
    try {
      const res = await api.get('/patient/doctors');
      setPractitioners((res.data.data || []).filter(d => d.isApproved));
    } catch {
      setPractitioners([]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTherapy || !selectedPractitioner || !preferredDate) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/patient/appointments', {
        doctor: selectedPractitioner._id,
        date: new Date(preferredDate).toISOString(),
        department: selectedTherapy.name,
        reason: chiefComplaints || `${selectedTherapy.displayName} therapy`,
        type: 'new',
        therapyType: selectedTherapy._id,
      });
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedTherapy(null);
    setSelectedPractitioner(null);
    setPreferredDate('');
    setChiefComplaints('');
    setError('');
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];

  const renderTherapyIcon = (name) => {
    const IconComponent = THERAPY_ICONS[name] || FaLeaf;
    return <IconComponent className="w-6 h-6 text-stone-600" />;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Book Therapy Session" size="lg">
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              s < step ? 'bg-emerald-500 text-white' :
              s === step ? 'bg-stone-500 text-white' :
              'bg-stone-200 text-stone-400'
            }`}>
              {s < step ? <FaCheckCircle className="w-4 h-4" /> : s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-1 mx-1 ${s < step ? 'bg-emerald-400' : 'bg-stone-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Choose Therapy */}
      {step === 1 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-600 mb-3">Choose Your Panchakarma Therapy</h3>
          <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-1">
            {therapyTypes.map(t => (
              <button
                key={t._id}
                onClick={() => setSelectedTherapy(t)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedTherapy?._id === t._id
                    ? 'border-stone-400 bg-stone-50'
                    : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {renderTherapyIcon(t.name)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-semibold text-stone-800 text-sm">{t.displayName}</span>
                      {t.primaryDosha && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${DOSHA_COLORS[t.primaryDosha] || 'bg-stone-100 text-stone-600'}`}>
                          {t.primaryDosha} dosha
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">{t.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-stone-400">
                      <span className="flex items-center gap-1"><FaClock className="w-3 h-3" /> {t.totalDurationDays} days</span>
                      {t.estimatedCost && <span>₹{t.estimatedCost.toLocaleString()}</span>}
                      {t.successRate && <span className="flex items-center gap-1"><FaCheckCircle className="w-3 h-3" /> {t.successRate}% success</span>}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setStep(2)} disabled={!selectedTherapy}>
              Next: Select Practitioner
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Practitioner & Date */}
      {step === 2 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-600 mb-3">
            Select Practitioner & Schedule
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mb-4">
            {practitioners.map(p => (
              <button
                key={p._id}
                onClick={() => setSelectedPractitioner(p)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                  selectedPractitioner?._id === p._id
                    ? 'border-stone-400 bg-stone-50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-stone-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {p.firstName?.[0]}{p.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">Dr. {p.firstName} {p.lastName}</p>
                    <p className="text-xs text-stone-500">{p.specialization}</p>
                  </div>
                  {p.consultationFee && (
                    <span className="ml-auto text-xs text-emerald-600 font-semibold">₹{p.consultationFee}</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-stone-600 block mb-1">Preferred Date *</label>
            <input
              type="datetime-local"
              min={today}
              value={preferredDate}
              onChange={e => setPreferredDate(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-stone-600 block mb-1">Chief Complaints / Goals</label>
            <textarea
              rows={2}
              value={chiefComplaints}
              onChange={e => setChiefComplaints(e.target.value)}
              placeholder="Describe your main health concerns..."
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} disabled={!selectedPractitioner || !preferredDate}>
              Next: Confirm
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-600 mb-4">Confirm Your Booking</h3>
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Therapy</span>
              <span className="font-semibold text-stone-800 flex items-center gap-1">
                {(() => { const Icon = THERAPY_ICONS[selectedTherapy?.name] || FaLeaf; return <Icon className="w-4 h-4 text-stone-600" />; })()}
                {selectedTherapy?.displayName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Practitioner</span>
              <span className="font-semibold text-stone-800">
                Dr. {selectedPractitioner?.firstName} {selectedPractitioner?.lastName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Date & Time</span>
              <span className="font-semibold text-stone-800">
                {preferredDate ? new Date(preferredDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Duration</span>
              <span className="font-semibold text-stone-800">{selectedTherapy?.totalDurationDays} days program</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={handleSubmit} loading={loading}>
              Confirm Booking
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BookTherapyModal;
