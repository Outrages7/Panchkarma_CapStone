const TherapyProgressBar = ({ progress = 0, stage, totalSessions = 0, completedSessions = 0 }) => {
  const stageColors = {
    purvakarma: 'bg-amber-400',
    pradhanakarma: 'bg-emerald-600',
    paschatkarma: 'bg-orange-600',
  };

  const stageLabel = {
    purvakarma: 'Purva Karma',
    pradhanakarma: 'Pradhana Karma',
    paschatkarma: 'Paschat Karma',
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-stone-700">
          {stageLabel[stage] || 'Treatment'} Phase
        </span>
        <span className="text-sm text-stone-500">
          {completedSessions}/{totalSessions} sessions
        </span>
      </div>
      <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
        <div
          className={`${stageColors[stage] || 'bg-stone-500'} h-3 rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-stone-400">0%</span>
        <span className="text-xs font-bold text-stone-600">{progress}% Complete</span>
        <span className="text-xs text-stone-400">100%</span>
      </div>
    </div>
  );
};

export default TherapyProgressBar;
