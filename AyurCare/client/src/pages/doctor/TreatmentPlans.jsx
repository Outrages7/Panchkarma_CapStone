import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import TreatmentPlanModal from "../../components/doctor/TreatmentPlanModal";
import api from "../../services/api";
import { formatName } from "../../utils/formatters";
import { FaClipboardList, FaPlus, FaSearch, FaEdit } from "react-icons/fa";

const STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  draft: "bg-stone-100 text-stone-600 border-stone-200",
  paused: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-stone-800 text-white border-stone-700",
  cancelled: "bg-red-100 text-red-600 border-red-200",
};

const TreatmentPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [patients, setPatients] = useState([]);
  const [therapyTypes, setTherapyTypes] = useState([]);

  useEffect(() => {
    fetchPlans();
    api.get("/doctor/patients").then(r => setPatients(r.data.data || [])).catch(() => {});
    api.get("/therapy-types").then(r => setTherapyTypes(r.data.data || [])).catch(() => {});
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get("/treatment-plans/practitioner-plans");
      setPlans(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditPlan(null);
    fetchPlans();
  };

  const filtered = plans.filter(p => {
    const matchSearch = !search ||
      formatName(p.patient).toLowerCase().includes(search.toLowerCase()) ||
      (p.therapyType?.displayName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mb-6 mt-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
              <FaClipboardList className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                Treatment Plans
              </h1>
              <p className="text-stone-400 font-medium tracking-wide">
                Manage your patients' Panchakarma plans
              </p>
            </div>
          </div>
          
          <div className="relative z-10">
            <button
              onClick={() => { setEditPlan(null); setShowModal(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-500 shadow-sm border border-emerald-500/50 transition-colors w-full md:w-auto justify-center"
            >
              <FaPlus className="w-3 h-3" /> New Plan
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 flex-1">
            <FaSearch className="text-stone-400 w-4 h-4 shrink-0" />
            <input
              type="text"
              placeholder="Search patient or therapy..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-sm font-bold text-stone-700 outline-none flex-1 bg-transparent placeholder:text-stone-400 placeholder:font-medium"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 outline-none focus:ring-2 focus:ring-emerald-500/20 sm:w-48 appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Plans</option>
            <option value="draft">Draft Plans</option>
            <option value="paused">Paused Plans</option>
            <option value="completed">Completed Plans</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-24 bg-white rounded-3xl border border-stone-200 border-dashed">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-stone-900"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaClipboardList className="text-4xl text-stone-300" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-3">No Treatment Plans Found</h2>
            <p className="text-stone-500 font-medium mb-8 max-w-md mx-auto">Create a cohesive holistic treatment plan for your patients to guide their wellness journey.</p>
            <button
              onClick={() => { setEditPlan(null); setShowModal(true); }}
              className="px-6 py-3 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-stone-800 shadow-md transition-colors inline-block"
            >
              Create First Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(plan => (
              <div key={plan._id} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 hover:shadow-md hover:border-emerald-500/30 transition-all flex flex-col h-full">
                
                <div className="flex items-start justify-between mb-5">
                  <div className="bg-stone-100 rounded-xl p-3 shrink-0 border border-stone-200">
                    <FaClipboardList className="text-stone-500 w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${STATUS_STYLES[plan.status] || "bg-stone-50 text-stone-500 border-stone-200"}`}>
                    {plan.status}
                  </span>
                </div>

                <div className="mb-6 flex-grow">
                  <p className="font-extrabold text-xl text-stone-900 tracking-tight leading-tight">{formatName(plan.patient)}</p>
                  <p className="text-sm font-bold text-emerald-700 mt-1 uppercase tracking-wider">
                    {plan.therapyType?.displayName || "Therapy"}
                  </p>
                  <p className="text-sm font-medium text-stone-500 mt-2 line-clamp-2">
                    {plan.title || "Holistic Treatment Plan"}
                  </p>
                </div>

                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Progress</span>
                    <span className="text-sm font-black text-stone-900">{plan.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${plan.progress || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-stone-400">
                    <span>Started: {plan.startDate ? new Date(plan.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—"}</span>
                    <span>{plan.completedSessions}/{plan.totalSessions} Sessions</span>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-4">
                  {plan.chiefComplaints?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {plan.chiefComplaints.slice(0, 3).map((c, i) => (
                        <span key={i} className="text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-1 rounded-md border border-stone-200">{c}</span>
                      ))}
                      {plan.chiefComplaints.length > 3 && (
                        <span className="text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-1 rounded-md border border-stone-200">+{plan.chiefComplaints.length - 3} more</span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => { setEditPlan(plan); setShowModal(true); }}
                    className="w-full py-3 text-sm font-bold text-stone-700 bg-white border-2 border-stone-200 rounded-xl hover:border-emerald-500 hover:text-emerald-700 transition flex items-center justify-center gap-2 mt-2"
                  >
                    <FaEdit className="w-4 h-4" /> Edit Plan
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {showModal && (
        <TreatmentPlanModal
          plan={editPlan}
          patients={patients}
          therapyTypes={therapyTypes}
          onClose={() => { setShowModal(false); setEditPlan(null); }}
          onSaved={handleSaved}
        />
      )}
    </DashboardLayout>
  );
};

export default TreatmentPlans;
