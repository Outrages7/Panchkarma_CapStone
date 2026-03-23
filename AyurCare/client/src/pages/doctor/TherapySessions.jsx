import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import SessionNotesModal from "../../components/doctor/SessionNotesModal";
import StatusBadge from "../../components/dashboard/StatusBadge";
import api from "../../services/api";
import { formatName, formatTime } from "../../utils/formatters";
import { FaCalendarCheck, FaPlay, FaStop, FaNotesMedical, FaFilter } from "react-icons/fa";

const STAGE_COLORS = {
  purvakarma: "bg-stone-100 text-stone-700",
  pradhanakarma: "bg-emerald-100 text-emerald-700",
  paschatkarma: "bg-orange-100 text-orange-700",
};
const STAGE_LABELS = {
  purvakarma: "Purva Karma",
  pradhanakarma: "Pradhana Karma",
  paschatkarma: "Paschat Karma",
};

const TherapySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("today");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notesSession, setNotesSession] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [dateFilter]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const endpoint = dateFilter === "today" ? "/therapy-sessions/today" : "/therapy-sessions/practitioner-sessions";
      const res = await api.get(endpoint);
      setSessions(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/therapy-sessions/${id}/start`);
      fetchSessions();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnd = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/therapy-sessions/${id}/end`);
      fetchSessions();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = sessions.filter(s => statusFilter === "all" || s.status === statusFilter);

  const counts = {
    scheduled: sessions.filter(s => s.status === "scheduled").length,
    inProgress: sessions.filter(s => s.status === "in-progress").length,
    completed: sessions.filter(s => s.status === "completed").length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mb-4 mt-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
              <FaCalendarCheck className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                Therapy Sessions
              </h1>
              <p className="text-stone-400 font-medium">
                Manage and track patient therapy sessions
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Summary */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-3xl border border-stone-200 shadow-sm">
          {/* Summary pills */}
          <div className="flex gap-2 flex-wrap order-2 md:order-1">
            <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm font-medium">
              <span className="text-stone-500">Scheduled: </span>
              <span className="font-bold text-stone-900">{counts.scheduled}</span>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm font-medium">
              <span className="text-stone-500">In Progress: </span>
              <span className="font-bold text-stone-900">{counts.inProgress}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm font-medium">
              <span className="text-emerald-700">Completed: </span>
              <span className="font-bold text-emerald-800">{counts.completed}</span>
            </div>
          </div>

          {/* Filter Toggles */}
          <div className="flex flex-wrap gap-3 order-1 md:order-2 w-full md:w-auto">
            <div className="flex bg-stone-100 border border-stone-200 rounded-xl p-1 overflow-hidden w-full md:w-auto">
              {[
                { value: "today", label: "Today" },
                { value: "all", label: "All Sessions" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDateFilter(opt.value)}
                  className={`flex-1 md:flex-none px-5 py-2 text-sm font-bold transition-all rounded-lg ${
                    dateFilter === opt.value
                      ? "bg-white text-stone-900 shadow-sm border border-stone-200"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FaFilter className="text-stone-400 w-3 h-3" />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full md:w-auto bg-white border border-stone-200 rounded-xl pl-9 pr-10 py-2.5 text-sm font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none shadow-sm cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sessions Content */}
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-3xl border border-stone-200 border-dashed">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stone-900"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarCheck className="w-6 h-6 text-stone-400" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">No Sessions Found</h2>
            <p className="text-stone-500 font-medium">No therapy sessions match the current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(session => (
              <div key={session._id} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="bg-stone-50 rounded-2xl p-4 text-center min-w-24 border border-stone-100 flex flex-col justify-center items-center h-full">
                      <p className="text-xl font-extrabold text-stone-900">{formatTime(session.scheduledDate)}</p>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mt-1">#{session.sessionNumber}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-stone-900">{formatName(session.patient)}</h3>
                      <p className="text-sm font-medium text-stone-500">{session.therapyType?.displayName || "Therapy Session"}</p>
                      
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {session.stage && (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${STAGE_COLORS[session.stage] || "bg-stone-100 text-stone-600"}`}>
                            {STAGE_LABELS[session.stage] || session.stage}
                          </span>
                        )}
                        <StatusBadge status={session.status} type="appointment" />
                        {session.therapyRoom && (
                          <span className="text-xs font-semibold text-stone-500 bg-stone-50 px-2 py-1 rounded-md border border-stone-200">
                            Room: {session.therapyRoom.name || session.therapyRoom}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end mt-2 md:mt-0 pt-4 md:pt-0 border-t border-stone-100 md:border-0">
                    {session.status === "scheduled" && (
                      <button
                        onClick={() => handleStart(session._id)}
                        disabled={actionLoading === session._id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-stone-800 transition shadow-sm disabled:opacity-50"
                      >
                        <FaPlay className="w-3 h-3" /> Start Session
                      </button>
                    )}
                    {session.status === "in-progress" && (
                      <button
                        onClick={() => handleEnd(session._id)}
                        disabled={actionLoading === session._id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-500 transition shadow-sm disabled:opacity-50"
                      >
                        <FaStop className="w-3 h-3" /> End Session
                      </button>
                    )}
                    {(session.status === "in-progress" || session.status === "completed") && (
                      <button
                        onClick={() => setNotesSession(session)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-stone-100 text-stone-700 text-sm font-bold rounded-xl hover:bg-stone-200 transition"
                      >
                        <FaNotesMedical className="w-4 h-4" /> Notes
                      </button>
                    )}
                  </div>
                </div>

                {session.sessionNotes && (
                  <div className="mt-5 pt-4 border-t border-stone-100 bg-stone-50/50 -mx-6 -mb-6 px-6 pb-6 rounded-b-3xl">
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Session Notes</h4>
                    <p className="text-sm font-medium text-stone-700">{session.sessionNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {notesSession && (
        <SessionNotesModal
          session={notesSession}
          onClose={() => setNotesSession(null)}
          onSaved={() => { setNotesSession(null); fetchSessions(); }}
        />
      )}
    </DashboardLayout>
  );
};

export default TherapySessions;
