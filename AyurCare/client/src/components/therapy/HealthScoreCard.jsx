import { FaHeart, FaBrain, FaFire, FaBolt } from 'react-icons/fa';

const HealthScoreCard = ({ score }) => {
  const categories = [
    { key: 'physicalHealth', label: 'Physical', icon: FaHeart, color: 'text-red-500' },
    { key: 'digestiveHealth', label: 'Digestive', icon: FaFire, color: 'text-orange-500' },
    { key: 'mentalWellbeing', label: 'Mental', icon: FaBrain, color: 'text-purple-500' },
    { key: 'energyLevel', label: 'Energy', icon: FaBolt, color: 'text-amber-500' },
  ];

  const overall = score?.overallScore;

  const getColor = (val) => {
    if (!val && val !== 0) return '#a8a29e';
    if (val >= 75) return '#059669';
    if (val >= 50) return '#d97706';
    return '#ef4444';
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <h3 className="text-sm font-semibold text-stone-900 mb-4">Health Score</h3>

      <div className="flex items-center justify-center mb-5">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f5f5f4" strokeWidth="2" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={getColor(overall)}
              strokeWidth="2"
              strokeDasharray={`${overall || 0}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-stone-900">{overall ?? '--'}</span>
            <span className="text-[10px] text-stone-400">/100</span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {categories.map(({ key, label, icon: Icon, color }) => {
          const val = score?.categories?.[key];
          return (
            <div key={key} className="flex items-center gap-3">
              <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
              <span className="text-xs text-stone-500 flex-1">{label}</span>
              <div className="w-16 bg-stone-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${val || 0}%`, backgroundColor: getColor(val) }}
                />
              </div>
              <span className="text-xs font-semibold text-stone-700 w-6 text-right">{val ?? '--'}</span>
            </div>
          );
        })}
      </div>

      {score?.scoreDate && (
        <p className="text-[10px] text-stone-300 mt-4 text-center">
          Updated {new Date(score.scoreDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export default HealthScoreCard;
