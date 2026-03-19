const MILESTONES = [
  { day: 1, label: 'Treatment Started', icon: '🌱' },
  { day: 7, label: 'Purva Karma Done', icon: '🔥' },
  { day: 14, label: 'Main Therapy Done', icon: '✨' },
  { day: 21, label: 'Recovery Phase', icon: '🌿' },
  { day: 28, label: 'Wellness Achieved', icon: '🏆' },
];

const RecoveryMilestone = ({ startDate, currentDay }) => {
  const daysSinceStart = currentDay !== undefined
    ? currentDay
    : startDate
    ? Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
      <h3 className="font-bold text-stone-800 mb-5">Recovery Journey</h3>
      <div className="flex items-start justify-between gap-2">
        {MILESTONES.map((m, idx) => {
          const isPast = daysSinceStart >= m.day;
          const isCurrent =
            daysSinceStart >= m.day &&
            (idx === MILESTONES.length - 1 || daysSinceStart < MILESTONES[idx + 1].day);

          return (
            <div key={m.day} className="flex flex-col items-center flex-1 min-w-0">
              <div className={`text-2xl mb-1 transition-all duration-300 ${isPast ? '' : 'grayscale opacity-40'}`}>
                {m.icon}
              </div>
              <p
                className={`text-xs text-center font-medium leading-tight ${
                  isCurrent ? 'text-stone-600' : isPast ? 'text-emerald-700' : 'text-stone-400'
                }`}
              >
                {m.label}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">Day {m.day}</p>
              {isCurrent && (
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-1 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="w-full bg-stone-200 rounded-full h-1.5">
          <div
            className="bg-stone-500 h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, (daysSinceStart / 28) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-stone-500 text-center mt-1">Day {daysSinceStart} of 28</p>
      </div>
    </div>
  );
};

export default RecoveryMilestone;
