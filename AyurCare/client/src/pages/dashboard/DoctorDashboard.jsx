import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { formatTime, formatName } from "../../utils/formatters";
import {
  FaCalendarCheck,
  FaClipboardList,
  FaCheckCircle,
  FaStar,
  FaExclamationTriangle,
  FaPlay,
  FaStop,
  FaPlus,
  FaCalendarAlt,
  FaUsers,
  FaCapsules,
  FaCommentAlt,
  FaArrowRight,
} from "react-icons/fa";

const STAGE_COLORS = {
  purvakarma: "bg-amber-50 text-amber-700",
  pradhanakarma: "bg-emerald-50 text-emerald-700",
  paschatkarma: "bg-orange-50 text-orange-700",
};
const STAGE_LABELS = {
  purvakarma: "Purva Karma",
  pradhanakarma: "Pradhana Karma",
  paschatkarma: "Paschat Karma",
};

const DoctorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [todaySessions, setTodaySessions] = useState([]);
  const [activePlansCount, setActivePlansCount] = useState(0);
  const [availability, setAvailability] = useState("available");

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, sessionsRes, plansRes] = await Promise.allSettled([
        api.get("/doctor/overview"),
        api.get("/therapy-sessions/today"),
        api.get("/treatment-plans/practitioner-plans", { params: { status: "active", limit: 1 } }),
      ]);
      if (overviewRes.status === "fulfilled") {
        setOverview(overviewRes.value.data.data);
        setAvailability(overviewRes.value.data.data?.currentStatus || "available");
      }
      if (sessionsRes.status === "fulfilled") setTodaySessions(sessionsRes.value.data.data || []);
      if (plansRes.status === "fulfilled") setActivePlansCount(plansRes.value.data.total || 0);
    } catch (err) { console.error("Doctor dashboard error:", err); }
    finally { setLoading(false); }
  };

  const handleSessionAction = async (sessionId, action) => {
    try { await api.patch(`/therapy-sessions/${sessionId}/${action}`); fetchDashboardData(); }
    catch (err) { console.error(`${action} session error:`, err); }
  };

  const handleAvailabilityChange = async (newStatus) => {
    try { await api.patch("/doctor/availability", { status: newStatus }); setAvailability(newStatus); }
    catch (err) { console.error("Availability update error:", err); }
  };

  const sessionColumns = [
    { key: "time", label: "Time", sortable: true, render: (row) => <span className="font-bold text-stone-800 tracking-tight">{formatTime(row.scheduledDate)}</span> },
    { key: "patient", label: "Patient", render: (row) => (
      <div>
        <div className="font-semibold text-stone-800">{formatName(row.patient)}</div>
        <div className="text-xs text-stone-500">{row.patient?.phone}</div>
      </div>
    )},
    { key: "stage", label: "Stage", render: (row) => row.stage ? (
      <span className={`text-[11px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${STAGE_COLORS[row.stage] || "bg-stone-100 text-stone-600"}`}>
        {STAGE_LABELS[row.stage] || row.stage}
      </span>
    ) : <span className="text-stone-400">—</span> },
    { key: "session", label: "Session", render: (row) => <span className="text-sm font-medium text-stone-500">#{row.sessionNumber}</span> },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} type="appointment" /> },
    { key: "actions", label: "Actions", render: (row) => (
      <div className="flex gap-2">
        {row.status === "scheduled" && (
          <button onClick={() => handleSessionAction(row._id, 'start')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition font-semibold">
            <FaPlay className="w-2.5 h-2.5" /> Start
          </button>
        )}
        {row.status === "in-progress" && (
          <button onClick={() => handleSessionAction(row._id, 'end')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold">
            <FaStop className="w-2.5 h-2.5" /> End
          </button>
        )}
      </div>
    )},
  ];

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

  const completionRate = todaySessions.length > 0
    ? Math.round((todaySessions.filter(s => s.status === "completed").length / todaySessions.length) * 100) : 0;
  const ratedSessions = todaySessions.filter(s => s.patientFeedback?.rating);
  const avgRating = ratedSessions.length > 0
    ? (ratedSessions.reduce((acc, s) => acc + s.patientFeedback.rating, 0) / ratedSessions.length) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Active Plans", value: activePlansCount, sub: "Running treatments", icon: FaClipboardList },
    { label: "Today's Sessions", value: todaySessions.length, sub: `${todaySessions.filter(s => s.status === "scheduled").length} pending`, icon: FaCalendarCheck },
    { label: "Completion Rate", value: `${completionRate}%`, sub: "Of today's load", icon: FaCheckCircle },
    { label: "Avg Rating", value: avgRating > 0 ? `${avgRating.toFixed(1)}/5` : "N/A", sub: "Patient feedback", icon: FaStar },
  ];

  return (
    <DashboardLayout>
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-md bg-stone-200/50 text-stone-600 text-[11px] font-bold uppercase tracking-wider">
              Practitioner Portal
            </span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
            {greeting}, Dr. {user?.lastName}
          </h1>
          <p className="text-stone-500 mt-1">Here is your daily overview and schedule.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-white border border-stone-200 rounded-xl px-4 py-2.5 shadow-sm">
            <div className={`w-2.5 h-2.5 rounded-full ${availability === "available" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-400"}`} />
            <select
              value={availability} onChange={(e) => handleAvailabilityChange(e.target.value)}
              className="text-sm text-stone-600 font-semibold border-none outline-none bg-transparent cursor-pointer focus:ring-0"
            >
              <option value="available">Available</option>
              <option value="in-consultation">In Session</option>
              <option value="away">Away</option>
            </select>
          </div>
          <Link to="/doctor/treatment-plans" className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm font-semibold rounded-xl hover:bg-stone-800 transition-all shadow-sm focus:ring-2 focus:ring-stone-900/20">
            <FaPlus className="w-3.5 h-3.5" /> New Plan
          </Link>
        </div>
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

      {/* In-progress alert banner */}
      {todaySessions.some(s => s.status === "in-progress") && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-amber-200">
            <FaExclamationTriangle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-amber-900 tracking-tight">Active Consultation</h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-1.5">
              {todaySessions.filter(s => s.status === "in-progress").map(s => (
                <div key={s._id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <p className="text-sm font-semibold text-amber-800">
                    {formatName(s.patient)} <span className="text-amber-600 font-medium ml-1">Session #{s.sessionNumber}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
          <Link to="/doctor/therapy-sessions" className="px-4 py-2 bg-white border border-amber-200 rounded-lg text-sm font-semibold text-amber-800 hover:bg-amber-100 transition text-center mt-2 sm:mt-0">
            View Details
          </Link>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Daily Schedule Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-7">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-900 tracking-tight">Today's Schedule</h2>
              <Link to="/doctor/therapy-sessions" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                View all <FaArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-hidden">
              <DataTable columns={sessionColumns} data={todaySessions} emptyMessage="No appointments left for today." />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Daily Summary */}
          <div className="bg-stone-900 text-white rounded-2xl shadow-sm border border-stone-800 p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl">
              <div className="w-32 h-32 bg-emerald-500 rounded-full"></div>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-6 relative z-10">Agenda Status</h3>
            <div className="space-y-4 relative z-10">
              {[
                { label: "Pending", value: todaySessions.filter(s => s.status === "scheduled").length, color: "bg-amber-400" },
                { label: "Active", value: todaySessions.filter(s => s.status === "in-progress").length, color: "bg-emerald-400" },
                { label: "Completed", value: todaySessions.filter(s => s.status === "completed").length, color: "bg-blue-400" },
                { label: "Cancelled", value: todaySessions.filter(s => s.status === "cancelled").length, color: "bg-red-400" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium text-stone-300">{item.label}</span>
                  </div>
                  <span className="text-base font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-4">Quick Shortcuts</h3>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Daily Calendar", to: "/doctor/therapy-sessions", Icon: FaCalendarAlt },
                { label: "Treatment Plans", to: "/doctor/treatment-plans", Icon: FaClipboardList },
                { label: "Patient Directory", to: "/doctor/patients", Icon: FaUsers },
                { label: "Issue Prescriptions", to: "/doctor/prescriptions", Icon: FaCapsules },
                { label: "Inbox & Messages", to: "/doctor/messages", Icon: FaCommentAlt },
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
    </DashboardLayout>
  );
};

export default DoctorDashboard;
