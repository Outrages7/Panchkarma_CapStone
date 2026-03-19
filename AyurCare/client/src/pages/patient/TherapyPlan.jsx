import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PanchakarmaStageIndicator from "../../components/therapy/PanchakarmaStageIndicator";
import api from "../../services/api";
import {
  FaClipboardList,
  FaLeaf,
  FaAppleAlt,
  FaHeart,
  FaBullseye,
} from "react-icons/fa";

const StageCard = ({ stage }) => {
  const [open, setOpen] = useState(false);
  const stageStyles = {
    purvakarma: { bg: "bg-stone-50 border-stone-200", badge: "bg-stone-100 text-stone-700", icon: "🌱" },
    pradhanakarma: { bg: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700", icon: "🔥" },
    paschatkarma: { bg: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700", icon: "🌿" },
  };
  const style = stageStyles[stage.stageName] || stageStyles.purvakarma;
  const labels = { purvakarma: "Purva Karma", pradhanakarma: "Pradhana Karma", paschatkarma: "Paschat Karma" };

  return (
    <div className={`rounded-3xl border border-stone-200 shadow-sm ${style.bg} overflow-hidden transition-all hover:shadow-md`}>
      <button
        className="w-full p-5 flex items-center justify-between text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center text-xl">
            {style.icon}
          </div>
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${style.badge}`}>
              {labels[stage.stageName]}
            </span>
            {stage.startDate && (
              <p className="text-xs font-semibold text-stone-500 mt-2">
                {new Date(stage.startDate).toLocaleDateString("en-IN")}
                {stage.endDate && ` → ${new Date(stage.endDate).toLocaleDateString("en-IN")}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {stage.isCompleted && <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg">Done</span>}
          <span className="text-stone-400 text-lg">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="px-6 pb-6 space-y-5 border-t border-stone-200/50 pt-5 mt-2 bg-white/50">
          {stage.instructions?.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3 flex items-center gap-2">
                <span className="text-stone-400">📝</span> Instructions
              </p>
              <ul className="space-y-2">
                {stage.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-stone-700">
                    <span className="text-stone-400 mt-0.5">•</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {stage.dietInstructions?.length > 0 && (
            <div className="pt-4 border-t border-stone-100/50">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-2">
                <span className="text-emerald-500">🥗</span> Diet Instructions
              </p>
              <ul className="space-y-2">
                {stage.dietInstructions.map((d, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-stone-700">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {stage.notes && (
            <div className="bg-white rounded-2xl p-4 text-sm font-medium text-stone-700 border border-stone-200 shadow-sm mt-4">
              <span className="font-bold text-stone-900 block mb-1 text-xs uppercase tracking-wider">Practitioner Note:</span> 
              <span className="italic">{stage.notes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TherapyPlan = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get("/treatment-plans/my-plans");
      const data = res.data.data || [];
      setPlans(data);
      setSelectedPlan(data.find(p => p.status === "active") || data[0] || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentStage = selectedPlan?.stages?.find(s => !s.isCompleted)?.stageName
    || selectedPlan?.stages?.[0]?.stageName;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mb-8 mt-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
              <FaClipboardList className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                My Treatment Plan
              </h1>
              <p className="text-stone-400 font-medium">
                Your personalized Panchakarma journey
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-3xl border border-stone-200 border-dashed">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stone-900"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-200">
              <span className="text-2xl">🌿</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">No Treatment Plan Yet</h2>
            <p className="text-stone-500 font-medium max-w-md mx-auto">Your practitioner hasn't created a holistic treatment plan for you yet. Maintain a healthy lifestyle and wait for your next session.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Plan selector if multiple */}
            {plans.length > 1 && (
              <div className="flex gap-2 flex-wrap bg-white p-2 rounded-2xl border border-stone-200 shadow-sm inline-flex">
                {plans.map(p => (
                  <button
                    key={p._id}
                    onClick={() => setSelectedPlan(p)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      selectedPlan?._id === p._id
                        ? "bg-stone-950 text-white shadow-md transform scale-[1.02]"
                        : "bg-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                    }`}
                  >
                    {p.title || p.therapyType?.displayName}
                  </button>
                ))}
              </div>
            )}

            {selectedPlan && (
              <>
                {/* Plan header */}
                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 lg:p-8">
                  <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-stone-900">
                        {selectedPlan.title || selectedPlan.therapyType?.displayName}
                      </h2>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-2">
                        <p className="text-sm font-semibold text-stone-500">
                          <span className="text-stone-400">Practitioner:</span> Dr. {selectedPlan.practitioner?.firstName} {selectedPlan.practitioner?.lastName}
                        </p>
                        <p className="text-sm font-semibold text-stone-500">
                          <span className="text-stone-400">Started:</span> {selectedPlan.startDate ? new Date(selectedPlan.startDate).toLocaleDateString("en-IN") : "—"}
                          {selectedPlan.endDate && ` · Ends: ${new Date(selectedPlan.endDate).toLocaleDateString("en-IN")}`}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${
                        selectedPlan.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm" :
                        selectedPlan.status === "completed" ? "bg-stone-100 text-stone-600 border-stone-200" :
                        "bg-stone-100 text-stone-700 border-stone-300"
                      }`}>
                        {selectedPlan.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-8 bg-stone-50 rounded-2xl p-5 border border-stone-100">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Plan Progress</span>
                      <span className="text-2xl font-black text-stone-900 leading-none">{selectedPlan.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-stone-200/60 rounded-full h-3 mb-2 shadow-inner">
                      <div
                        className="bg-emerald-500 h-3 rounded-full transition-all duration-1000 shadow-sm"
                        style={{ width: `${selectedPlan.progress || 0}%` }}
                      />
                    </div>
                    <p className="text-xs font-bold text-stone-400">
                      {selectedPlan.completedSessions} OF {selectedPlan.totalSessions} SESSIONS COMPLETED
                    </p>
                  </div>

                  {currentStage && (
                    <div className="pt-2">
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-4">Current Active Phase</p>
                      <PanchakarmaStageIndicator currentStage={currentStage} />
                    </div>
                  )}
                </div>

                {/* Goals and Complaints */}
                {(selectedPlan.goals?.length > 0 || selectedPlan.chiefComplaints?.length > 0) && (
                  <div className="grid md:grid-cols-2 gap-5">
                    {selectedPlan.chiefComplaints?.length > 0 && (
                      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4 border-b border-stone-100 pb-4">
                          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center border border-red-100">
                            <FaHeart className="text-red-500 w-4 h-4" />
                          </div>
                          <h3 className="font-bold text-stone-900">Chief Complaints</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedPlan.chiefComplaints.map((c, i) => (
                            <span key={i} className="text-sm font-semibold bg-stone-50 text-stone-700 px-4 py-2 rounded-xl border border-stone-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors cursor-default">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedPlan.goals?.length > 0 && (
                      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4 border-b border-stone-100 pb-4">
                          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                            <FaBullseye className="text-emerald-600 w-4 h-4" />
                          </div>
                          <h3 className="font-bold text-stone-900">Treatment Goals</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedPlan.goals.map((g, i) => (
                            <span key={i} className="text-sm font-semibold bg-stone-50 text-stone-700 px-4 py-2 rounded-xl border border-stone-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors cursor-default">{g}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stages breakdown */}
                {selectedPlan.stages?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center border border-stone-200">
                        <FaLeaf className="text-emerald-600 w-4 h-4" />
                      </div>
                      Treatment Stages Framework
                    </h3>
                    <div className="space-y-4">
                      {selectedPlan.stages.map((stage, i) => (
                        <StageCard key={i} stage={stage} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Diet & Lifestyle */}
                {(selectedPlan.dietPlan || selectedPlan.lifestyleAdvice) && (
                  <div className="grid md:grid-cols-2 gap-5">
                    {selectedPlan.dietPlan && (
                      <div className="bg-emerald-50 rounded-3xl border border-emerald-100/50 p-6 xl:p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                           <FaAppleAlt className="w-24 h-24 text-emerald-800" />
                        </div>
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600">
                             <FaAppleAlt className="w-5 h-5" />
                          </div>
                          <h3 className="font-bold text-stone-900 text-lg">Diet Plan</h3>
                        </div>
                        <p className="text-sm font-medium text-stone-700 leading-relaxed relative z-10">{selectedPlan.dietPlan}</p>
                      </div>
                    )}
                    {selectedPlan.lifestyleAdvice && (
                      <div className="bg-stone-50 rounded-3xl border border-stone-200 p-6 xl:p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                           <FaHeart className="w-24 h-24 text-stone-800" />
                        </div>
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-stone-500 border border-stone-200">
                             <FaHeart className="w-5 h-5" />
                          </div>
                          <h3 className="font-bold text-stone-900 text-lg">Lifestyle Advice</h3>
                        </div>
                        <p className="text-sm font-medium text-stone-700 leading-relaxed relative z-10">{selectedPlan.lifestyleAdvice}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Practitioner Notes */}
                {selectedPlan.practitionerNotes && (
                  <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6">
                    <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider mb-3">Overall Practitioner Note</h3>
                    <p className="font-medium text-stone-600 italic border-l-2 border-stone-300 pl-4">{selectedPlan.practitionerNotes}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TherapyPlan;
