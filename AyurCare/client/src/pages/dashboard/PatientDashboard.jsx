import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import TherapyProgressBar from "../../components/therapy/TherapyProgressBar";
import PanchakarmaStageIndicator from "../../components/therapy/PanchakarmaStageIndicator";
import TherapyTimeline from "../../components/therapy/TherapyTimeline";
import HealthScoreCard from "../../components/therapy/HealthScoreCard";
import TherapyRecommendation from "../../components/ai/TherapyRecommendation";
import BookTherapyModal from "../../components/patient/BookTherapyModal";
import {
  FaCheckCircle,
  FaHeart,
  FaClock,
  FaClipboardList,
  FaChartLine,
  FaPlus,
  FaStar,
  FaFolder,
  FaSeedling,
  FaArrowRight,
  FaLeaf,
} from "react-icons/fa";

const PatientDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [latestScore, setLatestScore] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [plansRes, sessionsRes, scoresRes] = await Promise.allSettled([
        api.get("/treatment-plans/my-plans"),
        api.get("/therapy-sessions/my-sessions"),
        api.get("/health-scores/my-scores"),
      ]);
      const plans = plansRes.status === "fulfilled" ? plansRes.value.data.data : [];
      setActivePlan(plans.find(p => p.status === "active") || plans[0] || null);
      setSessions(sessionsRes.status === "fulfilled" ? sessionsRes.value.data.data : []);
      const scores = scoresRes.status === "fulfilled" ? scoresRes.value.data.data : [];
      setLatestScore(scores[0] || null);
    } catch (err) { console.error("Dashboard fetch error:", err); }
    finally { setLoading(false); }
  };

  const completedSessions = sessions.filter(s => s.status === "completed").length;
  const upcomingSessions = sessions.filter(s => s.status === "scheduled").length;
  const daysLeft = activePlan?.endDate
    ? Math.max(0, Math.ceil((new Date(activePlan.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;
  const currentStage = activePlan?.stages?.find(s => !s.isCompleted)?.stageName || activePlan?.stages?.[0]?.stageName || null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-stone-500 font-medium tracking-tight">Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { label: "Active Plan", value: activePlan ? activePlan.therapyType?.displayName?.split("(")[0]?.trim() || "Active" : "None", sub: activePlan ? `Status: ${activePlan.status}` : "No active plan", icon: FaClipboardList },
    { label: "Sessions Done", value: completedSessions, sub: `${upcomingSessions} upcoming`, icon: FaCheckCircle },
    { label: "Health Score", value: latestScore?.overallScore ?? "--", sub: "Out of 100", icon: FaHeart },
    { label: "Days Left", value: daysLeft !== null ? daysLeft : "--", sub: activePlan ? "to complete plan" : "No active plan", icon: FaClock },
  ];

  return (
    <DashboardLayout>
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-md bg-stone-200/50 text-stone-600 text-[11px] font-bold uppercase tracking-wider">
              Patient Portal
            </span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-stone-500 mt-1">Here is your wellness overview for today.</p>
        </div>
        <button
          onClick={() => setShowBookModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm font-semibold rounded-xl hover:bg-stone-800 transition-all shadow-sm focus:ring-2 focus:ring-stone-900/20"
        >
          <FaPlus className="w-3.5 h-3.5" />
          Book Session
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">{s.label}</p>
                <p className="text-3xl font-extrabold text-stone-900 tracking-tight">{s.value}</p>
                <p className="text-xs text-stone-400 mt-1 font-medium">{s.sub}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <s.icon className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activePlan ? (
            <>
              {/* Treatment Plan Wrapper */}
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-7">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                  <h2 className="text-lg font-bold text-stone-900 tracking-tight">Current Treatment Plan</h2>
                  <Link to="/patient/therapy-plan" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                    View full details <FaArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-stone-800">
                    {activePlan.title || activePlan.therapyType?.displayName}
                  </h3>
                  <p className="text-sm text-stone-500 mt-1">
                    Guided by Dr. {activePlan.practitioner?.firstName} {activePlan.practitioner?.lastName}
                    {activePlan.startDate && `  •  Started ${new Date(activePlan.startDate).toLocaleDateString("en-IN")}`}
                  </p>
                </div>

                <div className="bg-stone-50 rounded-xl p-5 border border-stone-100 mb-6">
                  <TherapyProgressBar progress={activePlan.progress || 0} stage={currentStage} totalSessions={activePlan.totalSessions} completedSessions={activePlan.completedSessions} />
                </div>

                {currentStage && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-stone-500 mb-3 uppercase tracking-widest">Active Stage</p>
                    <PanchakarmaStageIndicator currentStage={currentStage} />
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "View Plan", to: "/patient/therapy-plan" },
                    { label: "Track Progress", to: "/patient/therapy-progress" },
                    { label: "Care Guide", to: "/patient/pre-post-care" },
                  ].map(a => (
                    <Link key={a.label} to={a.to} className="flex justify-center py-2.5 text-sm font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all">
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Timeline Wrapper */}
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-7">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                  <h2 className="text-lg font-bold text-stone-900 tracking-tight">Session Timeline</h2>
                  <Link to="/patient/appointments" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                    All sessions <FaArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <TherapyTimeline sessions={sessions.slice(0, 5)} />
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-10 text-center">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <FaSeedling className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 tracking-tight mb-2">Start Your Healing Journey</h2>
                <p className="text-stone-500 mb-8 max-w-md mx-auto">
                  You don't have an active treatment plan yet. Book a therapy session with our practitioners to get started.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button onClick={() => setShowBookModal(true)} className="w-full sm:w-auto px-6 py-3 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-800 transition shadow-sm">
                    Book Session
                  </button>
                  <Link to="/patient/appointments" className="w-full sm:w-auto px-6 py-3 bg-white border border-stone-200 text-stone-700 font-semibold rounded-xl hover:bg-stone-50 transition">
                    View History
                  </Link>
                </div>
              </div>
              <TherapyRecommendation />
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <HealthScoreCard score={latestScore} />

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-4">Quick Links</h3>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "My Treatment Plan", to: "/patient/therapy-plan", Icon: FaClipboardList },
                { label: "Progress Reports", to: "/patient/therapy-progress", Icon: FaChartLine },
                { label: "Pre & Post Care", to: "/patient/pre-post-care", Icon: FaLeaf },
                { label: "Submit Feedback", to: "/patient/feedback", Icon: FaStar },
                { label: "Medical Records", to: "/patient/medical-records", Icon: FaFolder },
              ].map(item => (
                <Link key={item.to} to={item.to} className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                    <item.Icon className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <span className="text-sm font-semibold text-stone-600 group-hover:text-stone-900 flex-1">{item.label}</span>
                  <FaArrowRight className="w-3 h-3 text-stone-300 group-hover:text-stone-900 transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BookTherapyModal isOpen={showBookModal} onClose={() => setShowBookModal(false)} onSuccess={fetchDashboardData} />
    </DashboardLayout>
  );
};

export default PatientDashboard;
