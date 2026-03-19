import { useState } from 'react';
import api from '../../services/api';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  FaWater,
  FaLeaf,
  FaTint,
  FaWind,
  FaHeartbeat,
  FaRobot,
} from 'react-icons/fa';

const THERAPY_ICONS = {
  vamana: FaWater,
  virechana: FaLeaf,
  basti: FaTint,
  nasya: FaWind,
  raktamokshana: FaHeartbeat,
};

const DOSHA_OPTIONS = [
  { value: '', label: 'Select your Dosha (optional)' },
  { value: 'vata', label: 'Vata — Air & Space' },
  { value: 'pitta', label: 'Pitta — Fire & Water' },
  { value: 'kapha', label: 'Kapha — Earth & Water' },
  { value: 'vata-pitta', label: 'Vata-Pitta (mixed)' },
  { value: 'pitta-kapha', label: 'Pitta-Kapha (mixed)' },
  { value: 'vata-kapha', label: 'Vata-Kapha (mixed)' },
];

const TherapyRecommendation = ({ onSelect }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [dosha, setDosha] = useState('');

  const getRecommendation = async () => {
    setLoading(true);
    setError('');
    try {
      const symptomList = symptoms
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const res = await api.post('/ai/recommend', {
        symptoms: symptomList,
        dominantDosha: dosha || undefined,
      });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to get recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTherapyIcon = (therapyName) => {
    const IconComponent = THERAPY_ICONS[therapyName];
    if (IconComponent) return <IconComponent className="w-4 h-4 text-stone-600 inline mr-1" />;
    return <FaLeaf className="w-4 h-4 text-stone-600 inline mr-1" />;
  };

  return (
    <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
      <div className="flex items-center space-x-2 mb-4">
        <FaRobot className="w-6 h-6 text-stone-600" />
        <div>
          <h3 className="font-bold text-stone-800">AI Therapy Advisor</h3>
          <p className="text-xs text-stone-500">Get personalized Panchakarma recommendations</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-stone-600 block mb-1">Your Symptoms</label>
          <textarea
            className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none"
            placeholder="e.g., joint pain, constipation, anxiety (comma separated)"
            rows={2}
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-600 block mb-1">Your Dosha (Prakriti)</label>
          <select
            className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            value={dosha}
            onChange={e => setDosha(e.target.value)}
          >
            {DOSHA_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <Button
        onClick={getRecommendation}
        loading={loading}
        disabled={!symptoms.trim() && !dosha}
        variant="primary"
        fullWidth
        size="sm"
      >
        {loading ? 'Analyzing...' : 'Get AI Recommendation'}
      </Button>

      {error && (
        <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
      )}

      {result && (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold text-stone-600">Recommended Therapies:</p>
          {result.recommendations.map(rec => (
            <div
              key={rec.therapy}
              className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelect && onSelect(rec)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-stone-800 text-sm flex items-center">
                  {renderTherapyIcon(rec.therapy)} {rec.displayName || rec.therapy}
                </span>
                <span className="text-emerald-600 font-bold text-sm">{rec.confidence}% match</span>
              </div>
              {rec.description && (
                <p className="text-xs text-stone-500 mb-2 line-clamp-2">{rec.description}</p>
              )}
              <div className="w-full bg-stone-200 rounded-full h-1.5">
                <div
                  className="bg-stone-500 h-1.5 rounded-full"
                  style={{ width: `${rec.confidence}%` }}
                />
              </div>
              {rec.estimatedCost && (
                <p className="text-xs text-stone-400 mt-1.5">Est. cost: ₹{rec.estimatedCost.toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapyRecommendation;
