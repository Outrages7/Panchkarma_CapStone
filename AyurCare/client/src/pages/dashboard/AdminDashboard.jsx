import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DataTable from "../../components/dashboard/DataTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import LineChart from "../../components/dashboard/LineChart";
import BarChart from "../../components/dashboard/BarChart";
import { formatName } from "../../utils/formatters";
import {
  FaClipboardList, FaUserMd, FaFlask, FaStar, FaExclamationTriangle,
  FaCheckCircle, FaUsers, FaBuilding, FaCapsules, FaSeedling, FaArrowRight, FaFileAlt,
} from "react-icons/fa";

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [activePlans, setActivePlans] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [appointmentsChart, setAppointmentsChart] = useState([]);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, sessionsRes, plansRes, stockRes, chartRes] = await Promise.allSettled([
        api.get("/admin/overview"),
        api.get("/therapy-sessions", { params: { limit: 5 } }),
        api.get("/treatment-plans", { params: { status: "active", limit: 5 } }),
        api.get("/inventory/low-stock/alerts"),
        api.get("/admin/analytics/appointments"),
      ]);
      if (overviewRes.status === "fulfilled") setOverview(overviewRes.value.data.data);
      if (sessionsRes.status === "fulfilled") setRecentSessions(sessionsRes.value.data.data || []);
      if (plansRes.status === "fulfilled") setActivePlans(plansRes.value.data.data || []);
      if (stockRes.status === "fulfilled") setLowStockAlerts(stockRes.value.data.data || []);
      if (chartRes.status === "fulfilled") setAppointmentsChart(chartRes.value.data.data || []);
    } catch (err) { console.error("Admin dashboard error:", err); }
    finally { setLoading(false); }
  };

  const sessionColumns = [
    { key: "patient", label: "Patient", render: (row) => <span className="font-semibold text-stone-800 text-sm">{formatName(row.patient)}</span> },
    { key: "practitioner", label: "Practitioner", render: (row) => <span className="text-sm font-medium text-stone-500">Dr. {formatName(row.practitioner)}</span> },
    { key: "therapy", label: "Therapy", render: (row) => <span className="text-xs font-semibold text-stone-500 px-2 py-1 bg-stone-100 rounded-md">{row.therapyType?.displayName || "—"}</span> },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} type="appointment" /> },
  ];

  const planColumns = [
    { key: "patient", label: "Patient", render: (row) => <span className="font-semibold text-stone-800 text-sm">{formatName(row.patient)}</span> },
    { key: "therapy", label: "Therapy", render: (row) => <span className="text-xs font-semibold text-stone-500">{row.therapyType?.displayName || "—"}</span> },
    { key: "progress", label: "Progress", render: (row) => (
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-stone-100 rounded-full h-2 w-20">
          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${row.progress || 0}%` }} />
        </div>
        <span className="text-xs text-stone-500 font-bold">{row.progress || 0}%</span>
      </div>
    )},
    { key: "practitioner", label: "Doctor", render: (row) => <span className="text-xs font-medium text-stone-400">Dr. {formatName(row.practitioner)}</span> },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-stone-500 font-medium tracking-tight">Loading command center...</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { label: "Success Rate", value: `${overview?.therapySuccessRate ?? 87}%`, sub: "Last 30 days", icon: FaCheckCircle },
    { label: "Satisfaction", value: `${overview?.patientSatisfaction ?? 4.5}/5`, sub: "Average rating", icon: FaStar },
    { label: "Active Plans", value: activePlans.length, sub: "Running treatments", icon: FaClipboardList },
    { label: "Inventory Alerts", value: lowStockAlerts.length, sub: lowStockAlerts.length > 0 ? "Needs immediate restock" : "All levels stable", icon: FaFlask },
  ];

  return (
    <DashboardLayout>
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-md bg-stone-200/50 text-stone-600 text-[11px] font-bold uppercase tracking-wider">
              Administration
            </span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
            AyurCare Operations
          </h1>
          <p className="text-stone-500 mt-1">High-level overview of clinic performance and logistics.</p>
        </div>
        <div className="flex items-center gap-2.5 bg-white border border-stone-200 rounded-xl px-4 py-2.5 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className="text-sm font-semibold text-stone-700">All Systems Operational</span>
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

      {/* Low Stock Alert Banner */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-red-200">
            <FaExclamationTriangle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-red-900 tracking-tight">{lowStockAlerts.length} Critical Inventory Alerts</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {lowStockAlerts.slice(0, 6).map(med => (
                <span key={med._id} className="text-[11px] bg-white border border-red-100 text-red-700 px-2.5 py-1 rounded-md font-semibold shadow-sm">
                  {med.name} <span className="text-red-400 opacity-70 ml-1">({med.stockQuantity} left)</span>
                </span>
              ))}
            </div>
          </div>
          <Link to="/admin/inventory" className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition shadow-sm text-center mt-2 sm:mt-0">
            Restock Now
          </Link>
        </div>
      )}

      {/* Analytics Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-7">
          <h3 className="text-lg font-bold text-stone-900 tracking-tight mb-6">Patient Flow This Week</h3>
          <div className="h-64">
             <LineChart data={appointmentsChart} dataKey="count" xAxisKey="date" color="#10b981" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-7">
          <h3 className="text-lg font-bold text-stone-900 tracking-tight mb-6">Therapy Distribution</h3>
          <div className="h-64">
            <BarChart
              data={[
                { name: "Vamana", count: 12 }, { name: "Virechana", count: 18 },
                { name: "Basti", count: 25 }, { name: "Nasya", count: 9 }, { name: "Rakta", count: 6 },
              ]}
              dataKey="count" xAxisKey="name" color="#10b981"
            />
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-7">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
            <h3 className="text-lg font-bold text-stone-900 tracking-tight">Recent Sessions</h3>
            <Link to="/admin/appointments" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
              View all <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-hidden">
            <DataTable columns={sessionColumns} data={recentSessions} emptyMessage="No recent sessions" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-7">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
            <h3 className="text-lg font-bold text-stone-900 tracking-tight">Active Treatment Plans</h3>
            <Link to="/admin/doctors" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
              Manage plans <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-hidden">
            <DataTable columns={planColumns} data={activePlans} emptyMessage="No active treatment plans" />
          </div>
        </div>
      </div>

      {/* Fast Access Grid */}
      <div className="bg-stone-900 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
        <h3 className="text-lg font-bold text-white tracking-tight mb-6 relative z-10">Command Center Modules</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
          {[
            { label: "Staff", to: "/admin/doctors", Icon: FaUserMd },
            { label: "Patients", to: "/admin/patients", Icon: FaUsers },
            { label: "Catalog", to: "/admin/therapy-types", Icon: FaSeedling },
            { label: "Facilities", to: "/admin/therapy-rooms", Icon: FaBuilding },
            { label: "Stock", to: "/admin/inventory", Icon: FaCapsules },
            { label: "Reports", to: "/admin/reports", Icon: FaFileAlt },
          ].map(item => (
            <Link
              key={item.to} to={item.to}
              className="bg-stone-800/50 backdrop-blur-md border border-stone-700 hover:border-emerald-500/50 rounded-2xl p-5 text-center transition-all group hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-stone-400 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center mx-auto mb-3 transition-colors shadow-inner shadow-white/5">
                <item.Icon className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-stone-300 group-hover:text-white transition-colors">{item.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
