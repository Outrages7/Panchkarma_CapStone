import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import TherapyProgressBar from "../../components/therapy/TherapyProgressBar";
import HealthScoreCard from "../../components/therapy/HealthScoreCard";
import RecoveryMilestone from "../../components/therapy/RecoveryMilestone";
import TherapyTimeline from "../../components/therapy/TherapyTimeline";
import LineChart from "../../components/dashboard/LineChart";
import api from "../../services/api";
import { FaChartLine, FaPlus } from "react-icons/fa";

const TherapyProgress = () => {
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [scores, setScores] = useState([]);
  const [scoreForm, setScoreForm] = useState({ overallScore: "", physicalHealth: "", digestiveHealth: "", mentalWellbeing: "", energyLevel: "", sleepQuality: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, sessionsRes, scoresRes] = await Promise.allSettled([
        api.get("/treatment-plans/my-plans"),
        api.get("/therapy-sessions/my-sessions"),
        api.get("/health-scores/my-scores"),
      ]);

      if (plansRes.status === "fulfilled") {
        const plans = plansRes.value.data.data || [];
        setActivePlan(plans.find(p => p.status === "active") || plans[0] || null);
      }
      if (sessionsRes.status === "fulfilled") setSessions(sessionsRes.value.data.data || []);
      if (scoresRes.status === "fulfilled") setScores(scoresRes.value.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (!scoreForm.overallScore) return;
    setSubmitting(true);
    try {
      await api.post("/health-scores", {
        overallScore: Number(scoreForm.overallScore),
        categories: {
          physicalHealth: Number(scoreForm.physicalHealth) || undefined,
          digestiveHealth: Number(scoreForm.digestiveHealth) || undefined,
          mentalWellbeing: Number(scoreForm.mentalWellbeing) || undefined,
          energyLevel: Number(scoreForm.energyLevel) || undefined,
          sleepQuality: Number(scoreForm.sleepQuality) || undefined,
        },
        notes: scoreForm.notes,
        treatmentPlan: activePlan?._id,
      });
      setShowForm(false);
      setScoreForm({ overallScore: "", physicalHealth: "", digestiveHealth: "", mentalWellbeing: "", energyLevel: "", sleepQuality: "", notes: "" });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentStage = activePlan?.stages?.find(s => !s.isCompleted)?.stageName;
  const latestScore = scores[0];
  const chartData = [...scores].reverse().map(s => ({ date: new Date(s.scoreDate).toLocaleDateString("en-IN"), score: s.overallScore }));

  return (
    <DashboardLayout>
      {/* Dark Premium Page Header matching Sidebar */}
      <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
            <FaChartLine className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Therapy Progress
            </h1>
            <p className="text-stone-400 font-medium">
              Track your healing journey
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(s => !s)}
          className="relative z-10 flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95 whitespace-nowrap"
        >
          <FaPlus className="w-4 h-4" /> Record Health Score
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stone-900"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick record form */}
          {showForm && (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6">
              <h3 className="font-bold text-stone-800 mb-4">Record Today's Health Score</h3>
              <form onSubmit={handleScoreSubmit}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {[
                    { key: "overallScore", label: "Overall Score *" },
                    { key: "physicalHealth", label: "Physical Health" },
                    { key: "digestiveHealth", label: "Digestive Health" },
                    { key: "mentalWellbeing", label: "Mental Wellbeing" },
                    { key: "energyLevel", label: "Energy Level" },
                    { key: "sleepQuality", label: "Sleep Quality" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-semibold text-stone-600 block mb-1">{f.label} (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scoreForm[f.key]}
                        onChange={e => setScoreForm(s => ({ ...s, [f.key]: e.target.value }))}
                        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 accent-emerald-600"
                        required={f.key === "overallScore"}
                      />
                    </div>
                  ))}
                </div>
                <div className="mb-4">
                  <label className="text-xs font-semibold text-stone-600 block mb-1">Notes</label>
                  <input
                    type="text"
                    value={scoreForm.notes}
                    onChange={e => setScoreForm(s => ({ ...s, notes: e.target.value }))}
                    placeholder="How are you feeling today?"
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 accent-emerald-600"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-800 disabled:opacity-50">
                    {submitting ? "Saving..." : "Save Score"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Treatment Progress */}
              {activePlan && (
                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6">
                  <h2 className="font-bold text-stone-800 mb-4">Treatment Progress</h2>
                  <TherapyProgressBar
                    progress={activePlan.progress || 0}
                    stage={currentStage}
                    totalSessions={activePlan.totalSessions}
                    completedSessions={activePlan.completedSessions}
                  />
                  {activePlan.startDate && (
                    <div className="mt-5">
                      <RecoveryMilestone startDate={activePlan.startDate} />
                    </div>
                  )}
                </div>
              )}

              {/* Health Score Chart */}
              {chartData.length > 0 && (
                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6">
                  <h2 className="font-bold text-stone-800 mb-4">Health Score Trend</h2>
                  <LineChart data={chartData} dataKey="score" xAxisKey="date" color="#f59e0b" />
                </div>
              )}

              {/* Session Timeline */}
              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6">
                <h2 className="font-bold text-stone-800 mb-4">Session Timeline</h2>
                <TherapyTimeline sessions={sessions.slice(0, 8)} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <HealthScoreCard score={latestScore} />
              {scores.length > 0 && (
                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
                  <h3 className="font-bold text-stone-800 mb-3 text-sm">Score History</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {scores.slice(0, 10).map(s => (
                      <div key={s._id} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100 last:border-0">
                        <span className="text-stone-500 font-medium">{new Date(s.scoreDate).toLocaleDateString("en-IN")}</span>
                        <span className={`font-bold ${s.overallScore >= 75 ? "text-emerald-600" : s.overallScore >= 50 ? "text-stone-600" : "text-red-500"}`}>
                          {s.overallScore}/100
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TherapyProgress;
