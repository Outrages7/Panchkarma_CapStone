import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";
import {
  FaLeaf,
  FaPlus,
  FaEdit,
  FaToggleOn,
  FaToggleOff,
  FaWater,
  FaTint,
  FaWind,
  FaHeartbeat,
  FaFire,
} from "react-icons/fa";

const THERAPY_ICONS = {
  vamana: FaWater,
  virechana: FaFire,
  basti: FaTint,
  nasya: FaWind,
  raktamokshana: FaHeartbeat,
};

const DOSHA_COLORS = {
  kapha: "bg-blue-50 text-blue-700 border-blue-200",
  pitta: "bg-red-50 text-red-700 border-red-200",
  vata: "bg-purple-50 text-purple-700 border-purple-200",
};

const TherapyTypes = () => {
  const [therapies, setTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    displayName: "",
    description: "",
    primaryDosha: "kapha",
    totalDurationDays: 7,
    preparationDays: 3,
    recoveryDays: 7,
    estimatedCost: "",
    successRate: 85,
    indications: "",
    contraindications: "",
  });

  useEffect(() => {
    fetchTherapies();
  }, []);

  const fetchTherapies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/therapy-types");
      setTherapies(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (t) => {
    setEditItem(t);
    setForm({
      name: t.name,
      displayName: t.displayName,
      description: t.description || "",
      primaryDosha: t.primaryDosha || "kapha",
      totalDurationDays: t.totalDurationDays || 7,
      preparationDays: t.preparationDays || 3,
      recoveryDays: t.recoveryDays || 7,
      estimatedCost: t.estimatedCost || "",
      successRate: t.successRate || 85,
      indications: (t.indications || []).join(", "),
      contraindications: (t.contraindications || []).join(", "),
    });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", displayName: "", description: "", primaryDosha: "kapha", totalDurationDays: 7, preparationDays: 3, recoveryDays: 7, estimatedCost: "", successRate: 85, indications: "", contraindications: "" });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      totalDurationDays: Number(form.totalDurationDays),
      preparationDays: Number(form.preparationDays),
      recoveryDays: Number(form.recoveryDays),
      successRate: Number(form.successRate),
      estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined,
      indications: form.indications.split(",").map(s => s.trim()).filter(Boolean),
      contraindications: form.contraindications.split(",").map(s => s.trim()).filter(Boolean),
    };
    try {
      if (editItem) {
        await api.put(`/therapy-types/${editItem._id}`, payload);
      } else {
        await api.post("/therapy-types", payload);
      }
      setShowForm(false);
      fetchTherapies();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (t) => {
    try {
      await api.put(`/therapy-types/${t._id}`, { isActive: !t.isActive });
      fetchTherapies();
    } catch (err) {
      console.error(err);
    }
  };

  const THERAPY_NAMES = ["vamana", "virechana", "basti", "nasya", "raktamokshana"];

  const renderTherapyIcon = (name) => {
    const IconComponent = THERAPY_ICONS[name] || FaLeaf;
    return <IconComponent className="text-xl sm:text-2xl" />;
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mt-2 mb-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
              <FaLeaf className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                Panchakarma Therapies
              </h1>
              <p className="text-stone-400 font-medium tracking-wide">
                Configure and define system-wide Ayurvedic treatment modalities
              </p>
            </div>
          </div>
          
          <button
            onClick={openCreate}
            className="relative z-10 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg w-full md:w-auto mt-4 md:mt-0"
          >
            <FaPlus /> Add Therapy
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32 bg-stone-50/50 rounded-3xl border border-stone-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-stone-900"></div>
          </div>
        ) : therapies.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-stone-200 p-16 text-center shadow-sm">
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <FaLeaf className="text-4xl text-stone-300" />
            </div>
            <h2 className="text-2xl font-black text-stone-800 mb-3">No Therapy Configurations</h2>
            <p className="text-stone-500 font-medium mb-8 max-w-sm mx-auto">Create and define base Ayurvedic modalities to begin offering services.</p>
            <button 
              onClick={openCreate} 
              className="px-8 py-3.5 bg-stone-900 border border-stone-800 text-white font-bold rounded-xl hover:bg-stone-800 shadow-md transition-all active:scale-95"
            >
              Configure First Therapy
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {therapies.map(t => (
              <div key={t._id} className={`bg-white rounded-[2rem] p-6 shadow-sm transition-all group relative overflow-hidden flex flex-col justify-between ${t.isActive ? "border border-stone-200 hover:border-emerald-300 hover:shadow-md" : "border border-stone-100 bg-stone-50 pointer-events-none"}`}>
                
                <div className={`absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-125 transition-transform duration-700 ${!t.isActive && 'grayscale'}`}>
                   {renderTherapyIcon(t.name)}
                </div>

                <div className="relative z-10 pointer-events-auto">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex gap-4">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0 border ${t.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-stone-200 border-stone-300 text-stone-400'}`}>
                          {renderTherapyIcon(t.name)}
                       </div>
                       <div>
                         <h3 className={`font-black tracking-tight text-xl mb-1 mt-0.5 ${t.isActive ? "text-stone-900" : "text-stone-400"}`}>{t.displayName}</h3>
                         <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md font-bold border ${t.isActive ? DOSHA_COLORS[t.primaryDosha] || "bg-stone-50 text-stone-600 border-stone-200" : "bg-stone-100 text-stone-400 border-stone-200"}`}>
                           {t.primaryDosha} DOMINANT
                         </span>
                       </div>
                    </div>

                    <div className="flex items-center gap-2">
                       <button onClick={() => toggleActive(t)} className={`p-2 rounded-xl transition-colors shadow-sm border ${t.isActive ? "text-emerald-500 bg-white border-emerald-100 hover:bg-emerald-50" : "text-stone-400 bg-stone-100 border-stone-200 hover:bg-stone-200"}`} title={t.isActive ? "Deactivate" : "Activate"}>
                         {t.isActive ? <FaToggleOn className="w-5 h-5" /> : <FaToggleOff className="w-5 h-5" />}
                       </button>
                    </div>
                  </div>

                  {t.description && (
                    <p className={`text-sm font-medium leading-relaxed mb-6 line-clamp-2 ${t.isActive ? "text-stone-600" : "text-stone-400"}`}>{t.description}</p>
                  )}

                  <div className={`grid grid-cols-3 gap-3 mb-6 ${!t.isActive && 'opacity-60'}`}>
                    <div className="bg-stone-50 border border-stone-100 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Runtime</p>
                      <p className="font-black text-stone-900 text-lg">{t.totalDurationDays}<span className="text-sm font-semibold text-stone-500">d</span></p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
                      <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mb-1">Prep</p>
                      <p className="font-black text-emerald-700 text-lg">{t.preparationDays}<span className="text-sm font-semibold text-emerald-600/70">d</span></p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
                      <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest mb-1">Recovery</p>
                      <p className="font-black text-amber-700 text-lg">{t.recoveryDays}<span className="text-sm font-semibold text-amber-600/70">d</span></p>
                    </div>
                  </div>
                </div>

                <div className={`pt-5 border-t relative z-10 pointer-events-auto flex items-center justify-between ${t.isActive ? "border-stone-100" : "border-stone-200"}`}>
                   <div className="flex flex-col gap-0.5">
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${t.isActive ? "text-stone-500" : "text-stone-400"}`}>Success Rate</span>
                     <span className={`font-black ${t.isActive ? "text-emerald-600" : "text-stone-400"}`}>{t.successRate}% Avg</span>
                   </div>
                   <div className="flex items-center gap-4">
                      {t.estimatedCost && (
                         <div className="flex flex-col gap-0.5 text-right">
                           <span className={`text-[10px] font-bold uppercase tracking-widest ${t.isActive ? "text-stone-500" : "text-stone-400"}`}>Est. Value</span>
                           <span className={`font-black ${t.isActive ? "text-stone-900" : "text-stone-400"}`}>₹{t.estimatedCost.toLocaleString("en-IN")}</span>
                         </div>
                      )}
                      
                      <button 
                        onClick={() => openEdit(t)} 
                        className={`p-3 rounded-xl transition-all shadow-sm border ${t.isActive ? "border-stone-200 bg-white text-stone-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50" : "border-stone-200 bg-stone-100 text-stone-400 hover:bg-stone-200"}`}
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                   </div>
                </div>
                
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animation-scale-up">
              <div className="p-6 md:p-8 border-b border-stone-100 bg-stone-50/50 rounded-t-[2rem]">
                <h2 className="text-2xl font-black text-stone-900">{editItem ? "Refine Modality Specification" : "Define New Therapy Type"}</h2>
                <p className="text-sm font-medium text-stone-500 mt-1">{editItem ? "Adjust operational parameters for this treatment" : "Register a foundational Panchakarma therapy into the datastore"}</p>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <form id="therapy-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="bg-stone-50 border border-stone-100 rounded-2xl p-5 space-y-5">
                     <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Base Meta
                     </p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div>
                         <label className="text-xs font-bold text-stone-700 block mb-1.5">System Reference ID</label>
                         <select
                           value={form.name}
                           onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                           required
                           className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                         >
                           <option value="">Select Category...</option>
                           {THERAPY_NAMES.map(n => <option key={n} value={n} className="capitalize">{n}</option>)}
                         </select>
                       </div>
                       <div>
                         <label className="text-xs font-bold text-stone-700 block mb-1.5">Public Display Name</label>
                         <input
                           type="text"
                           value={form.displayName}
                           onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                           required
                           placeholder="e.g. Vamana Treatment"
                           className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 placeholder:font-medium"
                         />
                       </div>
                     </div>
                     <div>
                       <label className="text-xs font-bold text-stone-700 block mb-1.5">Clinical Description</label>
                       <textarea
                         rows={2}
                         value={form.description}
                         onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                         placeholder="Detailed explanation of the therapy methodology..."
                         className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 resize-none"
                       />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5 space-y-4">
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Clinical Focus
                        </p>
                        <div>
                          <label className="text-xs font-bold text-stone-700 block mb-1.5">Primary Target Dosha</label>
                          <select
                            value={form.primaryDosha}
                            onChange={e => setForm(f => ({ ...f, primaryDosha: e.target.value }))}
                            className="w-full bg-white border border-purple-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer text-purple-900"
                          >
                            <option value="kapha">Kapha Dosha</option>
                            <option value="pitta">Pitta Dosha</option>
                            <option value="vata">Vata Dosha</option>
                          </select>
                        </div>
                     </div>

                     <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-4">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Value Metrics
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                             <label className="text-xs font-bold text-stone-700 block mb-1.5">Avg Rate (₹)</label>
                             <input
                               type="number"
                               value={form.estimatedCost}
                               onChange={e => setForm(f => ({ ...f, estimatedCost: e.target.value }))}
                               placeholder="15000"
                               className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 placeholder:font-medium text-emerald-900"
                             />
                           </div>
                           <div>
                             <label className="text-xs font-bold text-stone-700 block mb-1.5">Success %</label>
                             <input
                               type="number"
                               value={form.successRate}
                               onChange={e => setForm(f => ({ ...f, successRate: e.target.value }))}
                               placeholder="85"
                               className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 placeholder:font-medium text-emerald-900"
                             />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-stone-50 border border-stone-100 rounded-2xl p-5">
                     <p className="text-xs font-bold text-stone-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span> Lifecycle Timings (Days)
                     </p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       {[
                         { key: "totalDurationDays", label: "Full Procedure Cycle" },
                         { key: "preparationDays", label: "Purvakarma (Prep)" },
                         { key: "recoveryDays", label: "Paschatkarma (Recov)" },
                       ].map(f => (
                         <div key={f.key}>
                           <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1.5">{f.label}</label>
                           <input
                             type="number"
                             min="1"
                             value={form[f.key]}
                             onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                             className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center"
                           />
                         </div>
                       ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 shadow-sm rounded-2xl overflow-hidden border border-stone-100">
                     <div className="bg-blue-50/50 p-5 border-b border-stone-100">
                       <label className="text-xs font-bold text-blue-700 uppercase tracking-widest block mb-1.5">Medical Indications (CSV)</label>
                       <input
                         type="text"
                         value={form.indications}
                         onChange={e => setForm(f => ({ ...f, indications: e.target.value }))}
                         placeholder="e.g. obesity, respiratory disorders, ..."
                         className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-stone-300 placeholder:font-medium"
                       />
                     </div>
                     <div className="bg-red-50/50 p-5">
                       <label className="text-xs font-bold text-red-700 uppercase tracking-widest block mb-1.5">Contraindications (CSV)</label>
                       <input
                         type="text"
                         value={form.contraindications}
                         onChange={e => setForm(f => ({ ...f, contraindications: e.target.value }))}
                         placeholder="e.g. pregnancy, cardiac disease, young children, ..."
                         className="w-full bg-white border border-red-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-stone-300 placeholder:font-medium"
                       />
                     </div>
                  </div>

                </form>
              </div>
              <div className="p-6 md:p-8 border-t border-stone-100 bg-stone-50/50 rounded-b-[2rem] flex flex-col-reverse sm:flex-row gap-4">
                 <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="flex-1 px-6 py-3.5 text-sm font-bold border border-stone-200 bg-white rounded-xl hover:bg-stone-50 text-stone-600 transition-colors shadow-sm"
                 >
                    Discard Changes
                 </button>
                 <button 
                    type="submit" 
                    form="therapy-form" 
                    disabled={saving} 
                    className="flex-1 px-6 py-3.5 text-sm font-bold shadow-sm border border-stone-900 text-white bg-stone-900 rounded-xl hover:bg-stone-800 disabled:opacity-50 transition-colors"
                 >
                    {saving ? "Processing Query..." : editItem ? "Sync Modification" : "Publish Configuration"}
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TherapyTypes;
