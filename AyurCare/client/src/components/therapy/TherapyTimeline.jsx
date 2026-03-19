const statusColors = {
  completed: 'bg-emerald-500 text-white',
  'in-progress': 'bg-amber-400 text-white',
  scheduled: 'bg-stone-200 text-stone-500',
  cancelled: 'bg-red-200 text-red-600',
  'no-show': 'bg-gray-200 text-gray-500',
};

const stageLabels = {
  purvakarma: 'Purva Karma',
  pradhanakarma: 'Pradhana Karma',
  paschatkarma: 'Paschat Karma',
};

const TherapyTimeline = ({ sessions = [] }) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-stone-400">
        <p className="text-sm">No sessions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-stone-100" />
      <div className="space-y-4">
        {sessions.map((session, idx) => (
          <div key={session._id || idx} className="relative flex items-start space-x-4 pl-12">
            <div
              className={`absolute left-3 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                statusColors[session.status] || 'bg-stone-200 text-stone-500'
              } ${session.status === 'in-progress' ? 'animate-pulse' : ''}`}
            >
              {session.status === 'completed' ? '✓' : session.sessionNumber}
            </div>
            <div className="bg-white border border-stone-100 rounded-xl p-4 w-full shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm font-semibold text-stone-800">
                  {stageLabels[session.stage] || session.stage} — Session {session.sessionNumber}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    session.status === 'in-progress' ? 'bg-stone-100 text-stone-700' :
                    session.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-stone-100 text-stone-600'
                  }`}
                >
                  {session.status}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {session.scheduledDate
                  ? new Date(session.scheduledDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                  : 'Date TBD'}
              </p>
              {session.sessionNotes && (
                <p className="text-xs text-stone-500 mt-2 italic border-l-2 border-stone-300 pl-2">
                  {session.sessionNotes}
                </p>
              )}
              {session.patientFeedback?.rating && (
                <div className="flex items-center mt-2 space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-sm ${i < session.patientFeedback.rating ? 'text-stone-400' : 'text-stone-200'}`}>★</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapyTimeline;
