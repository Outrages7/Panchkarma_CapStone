import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import api from '../../services/api';
import { getSpecializationLabel } from '../../utils/specializations';
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
  kapha: 'bg-blue-50 text-blue-600 border border-blue-200',
  pitta: 'bg-red-50 text-red-600 border border-red-200',
  vata: 'bg-purple-50 text-purple-600 border border-purple-200',
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

  // Filter practitioners based on selected therapy's allowedSpecializations
  const filteredPractitioners = selectedTherapy?.allowedSpecializations?.length > 0
    ? practitioners.filter(p => selectedTherapy.allowedSpecializations.includes(p.specialization))
    : practitioners;

  // Only show therapy types that have at least one qualified practitioner available
  const availableTherapyTypes = therapyTypes.filter(t => {
    if (!t.allowedSpecializations || t.allowedSpecializations.length === 0) return true;
    return practitioners.some(p => t.allowedSpecializations.includes(p.specialization));
  });

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
        department: selectedPractitioner.specialization,
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
    return (
      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 group-hover:bg-emerald-100 group-hover:border-emerald-300 transition-colors shrink-0">
        <IconComponent className="w-5 h-5 text-emerald-600" />
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Book Therapy Session" size="xlarge">
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-8 mt-2">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
              s < step ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-400' :
              s === step ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' :
              'bg-stone-100 border-2 border-stone-200 text-stone-400'
            }`}>
              {s < step ? <FaCheckCircle className="w-4 h-4" /> : s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-0.5 mx-2 rounded-full transition-all duration-300 ${s < step ? 'bg-emerald-400' : 'bg-stone-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Choose Therapy */}
      {step === 1 && (
        <div>
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Choose Your Panchakarma Therapy</h3>
          <div className="grid grid-cols-1 gap-3 max-h-[22rem] overflow-y-auto pr-2 custom-scrollbar">
            {availableTherapyTypes.length === 0 && (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaLeaf className="w-5 h-5 text-stone-300" />
                </div>
                <p className="text-sm font-semibold text-stone-400">No therapies available</p>
                <p className="text-xs text-stone-400 mt-1">Please contact your clinic to set up therapy types.</p>
              </div>
            )}
            {availableTherapyTypes.map(t => (
              <button
                key={t._id}
                onClick={() => setSelectedTherapy(t)}
                className={`text-left p-4 rounded-2xl border-2 transition-all duration-300 group ${
                  selectedTherapy?._id === t._id
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {renderTherapyIcon(t.name)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                       <span className={`font-bold text-sm transition-colors ${selectedTherapy?._id === t._id ? 'text-emerald-800' : 'text-stone-800 group-hover:text-stone-900'}`}>{t.displayName}</span>
                      {t.primaryDosha && (
                        <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${DOSHA_COLORS[t.primaryDosha] || 'bg-stone-100 text-stone-500 border border-stone-200'}`}>
                          {t.primaryDosha} FOCUS
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed font-medium">{t.description}</p>
                    <div className="flex gap-4 mt-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><FaClock className="w-3 h-3 text-stone-400" /> {t.totalDurationDays} Days</span>
                      {t.estimatedCost && <span className="text-emerald-600">₹{t.estimatedCost.toLocaleString()}</span>}
                      {t.successRate && <span className="flex items-center gap-1.5"><FaCheckCircle className="w-3 h-3 text-emerald-500" /> {t.successRate}% Success</span>}
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
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">
            Select Practitioner & Schedule
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mb-4">
            {filteredPractitioners.length > 0 ? filteredPractitioners.map(p => (
              <button
                key={p._id}
                onClick={() => setSelectedPractitioner(p)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                  selectedPractitioner?._id === p._id
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm border border-emerald-200">
                    {p.firstName?.[0]}{p.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">Dr. {p.firstName} {p.lastName}</p>
                    <p className="text-xs text-stone-500">{getSpecializationLabel(p.specialization)}</p>
                  </div>
                  {p.consultationFee && (
                    <span className="ml-auto text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">₹{p.consultationFee}</span>
                  )}
                </div>
              </button>
            )) : (
              <div className="text-center py-8 bg-stone-50 rounded-xl border border-stone-200">
                <p className="text-sm font-semibold text-stone-600">No qualified practitioners available</p>
                <p className="text-xs text-stone-400 mt-1">No doctors with the required specialization are currently registered.</p>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold text-stone-600 block mb-1.5">Preferred Date & Time *</label>
            <input
              type="datetime-local"
              min={today}
              value={preferredDate}
              onChange={e => setPreferredDate(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold text-stone-600 block mb-1.5">Chief Complaints / Goals</label>
            <textarea
              rows={2}
              value={chiefComplaints}
              onChange={e => setChiefComplaints(e.target.value)}
              placeholder="Describe your main health concerns..."
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
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
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Confirm Your Booking</h3>
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3.5 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500 font-medium">Therapy</span>
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                {(() => { const Icon = THERAPY_ICONS[selectedTherapy?.name] || FaLeaf; return <Icon className="w-4 h-4 text-emerald-600" />; })()}
                {selectedTherapy?.displayName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500 font-medium">Practitioner</span>
              <span className="font-bold text-stone-800">
                Dr. {selectedPractitioner?.firstName} {selectedPractitioner?.lastName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500 font-medium">Date & Time</span>
              <span className="font-bold text-stone-800">
                {preferredDate ? new Date(preferredDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500 font-medium">Duration</span>
              <span className="font-bold text-stone-800">{selectedTherapy?.totalDurationDays} days program</span>
            </div>
            {selectedTherapy?.estimatedCost && (
              <div className="flex justify-between text-sm pt-2 border-t border-stone-200">
                <span className="text-stone-500 font-medium">Estimated Cost</span>
                <span className="font-extrabold text-emerald-700">₹{selectedTherapy.estimatedCost.toLocaleString()}</span>
              </div>
            )}
          </div>

          {error && <p className="text-sm font-semibold text-red-500 mb-3">{error}</p>}

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
