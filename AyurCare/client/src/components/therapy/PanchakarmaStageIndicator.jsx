const STAGES = [
  { key: 'purvakarma', label: 'Purva Karma', sub: 'Preparation', activeBg: 'bg-stone-500', completedBg: 'bg-amber-400' },
  { key: 'pradhanakarma', label: 'Pradhana Karma', sub: 'Main Therapy', activeBg: 'bg-emerald-700', completedBg: 'bg-emerald-500' },
  { key: 'paschatkarma', label: 'Paschat Karma', sub: 'Recovery', activeBg: 'bg-orange-600', completedBg: 'bg-orange-400' },
];

const PanchakarmaStageIndicator = ({ currentStage }) => {
  const currentIndex = STAGES.findIndex(s => s.key === currentStage);

  return (
    <div className="flex items-start w-full">
      {STAGES.map((stage, idx) => {
        const isCompleted = currentIndex > idx;
        const isCurrent = idx === currentIndex;
        const isPending = idx > currentIndex;

        return (
          <div key={stage.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted
                    ? `${stage.completedBg} text-white`
                    : isCurrent
                    ? `${stage.activeBg} text-white ring-4 ring-offset-2 ring-amber-300 animate-pulse-glow`
                    : 'bg-stone-200 text-stone-400'
                }`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <p className={`text-xs font-semibold mt-2 text-center leading-tight ${isCurrent ? 'text-stone-800' : isPending ? 'text-stone-400' : 'text-stone-600'}`}>
                {stage.label}
              </p>
              <p className="text-xs text-stone-400 text-center">{stage.sub}</p>
            </div>
            {idx < STAGES.length - 1 && (
              <div className={`flex-1 h-1 mx-2 mt-[-24px] transition-all duration-500 ${isCompleted ? 'bg-emerald-400' : 'bg-stone-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PanchakarmaStageIndicator;
