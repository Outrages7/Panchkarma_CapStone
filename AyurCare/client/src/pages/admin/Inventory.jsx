import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";
import { FaFlask, FaPlus, FaEdit, FaExclamationTriangle, FaSearch } from "react-icons/fa";

const Inventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sanskritName: "",
    category: "churna",
    stockQuantity: "",
    unit: "grams",
    reorderLevel: "",
    price: "",
    manufacturer: "",
    description: "",
  });

  const CATEGORIES = ["churna", "kwatha", "taila", "ghrita", "vati", "avaleha", "asava", "arishta", "bhasma", "other"];
  const UNITS = ["grams", "ml", "tablets", "units", "kg", "liters"];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [medRes, stockRes] = await Promise.allSettled([
        api.get("/inventory"),
        api.get("/inventory/low-stock/alerts"),
      ]);
      if (medRes.status === "fulfilled") setMedicines(medRes.value.data.data || []);
      if (stockRes.status === "fulfilled") setLowStock(stockRes.value.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", sanskritName: "", category: "churna", stockQuantity: "", unit: "grams", reorderLevel: "", price: "", manufacturer: "", description: "" });
    setShowForm(true);
  };

  const openEdit = (med) => {
    setEditItem(med);
    setForm({
      name: med.name || "",
      sanskritName: med.sanskritName || "",
      category: med.category || "churna",
      stockQuantity: med.stockQuantity ?? "",
      unit: med.unit || "grams",
      reorderLevel: med.reorderLevel ?? "",
      price: med.price ?? "",
      manufacturer: med.manufacturer || "",
      description: med.description || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      stockQuantity: Number(form.stockQuantity),
      reorderLevel: Number(form.reorderLevel),
      price: form.price ? Number(form.price) : undefined,
    };
    try {
      if (editItem) {
        await api.put(`/inventory/${editItem._id}`, payload);
      } else {
        await api.post("/inventory", payload);
      }
      setShowForm(false);
      fetchInventory();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = medicines.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || (m.sanskritName || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || m.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const getStockStatus = (med) => {
    if (med.stockQuantity <= 0) return { label: "Out of Stock", color: "bg-red-50 text-red-700 border-red-200" };
    if (med.stockQuantity <= (med.reorderLevel || 0)) return { label: "Low Stock", color: "bg-amber-50 text-amber-700 border-amber-200" };
    return { label: "Well Stocked", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mt-2 mb-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
              <FaFlask className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                Medicinal Inventory
              </h1>
              <p className="text-stone-400 font-medium tracking-wide">
                Manage Ayurvedic formulation repository, supply metrics, and depletion alerts
              </p>
            </div>
          </div>
          
          <button
            onClick={openCreate}
            className="relative z-10 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg w-full md:w-auto mt-4 md:mt-0"
          >
            <FaPlus /> Stock New Medicine
          </button>
        </div>

        {/* Low stock alert */}
        {lowStock.length > 0 && (
          <div className="bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-[2rem] p-6 mb-6 shadow-sm relative overflow-hidden">
             <div className="absolute right-0 top-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             
             <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 relative z-10">
               <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0 border border-red-200 shadow-sm text-red-600">
                  <FaExclamationTriangle className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="font-extrabold text-red-900 text-xl">Critical Supply Depletion</h3>
                  <p className="font-semibold text-red-700/80 text-sm">Action required: {lowStock.length} formulation{lowStock.length > 1 ? 's have' : ' has'} dropped below configured minimum thresholds.</p>
               </div>
             </div>
             
             <div className="flex flex-wrap gap-2.5 relative z-10">
               {lowStock.map(m => (
                 <span key={m._id} className="text-xs bg-white text-red-700 px-4 py-2 rounded-xl font-bold shadow-sm border border-red-100 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
                   <span className="truncate max-w-[150px]">{m.name}</span>
                   <span className="px-1.5 py-0.5 bg-red-50 rounded-md font-black">
                     {m.stockQuantity} <span className="font-semibold">{m.unit}</span>
                   </span>
                 </span>
               ))}
             </div>
          </div>
        )}

        {/* Filters Panel */}
        <div className="bg-white p-3 rounded-[1.5rem] border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
           <div className="flex-1 flex items-center w-full min-w-0 bg-stone-50 rounded-xl px-4 py-3 border border-stone-100 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-300 transition-all">
             <FaSearch className="text-stone-400 w-4 h-4 shrink-0" />
             <input
                type="text"
                placeholder="Search inventory by botanical or systematic name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-stone-900 placeholder:text-stone-400 font-semibold px-3 text-sm"
             />
           </div>
           
           <div className="w-full sm:w-auto relative group">
             <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full sm:w-64 bg-stone-50 border border-stone-100 text-stone-700 font-bold focus:ring-2 focus:ring-emerald-500/20 hover:border-stone-300 py-3 pl-4 pr-10 rounded-xl cursor-pointer appearance-none outline-none transition-all text-sm capitalize shadow-sm"
             >
                <option value="all">All Formulation Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c} Preparations</option>)}
             </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 group-hover:text-stone-600 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
             </div>
           </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32 bg-stone-50/50 rounded-[2rem] border border-stone-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-stone-900"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-stone-200 p-16 text-center shadow-sm">
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <FaFlask className="text-4xl text-stone-300" />
            </div>
            <h2 className="text-2xl font-black text-stone-800 mb-3">No Medicines Found</h2>
            <p className="text-stone-500 font-medium mb-8 max-w-sm mx-auto">There are no formulations tracking under the current filter criteria.</p>
            <button 
              onClick={openCreate} 
              className="px-8 py-3.5 bg-stone-900 border border-stone-800 text-white font-bold rounded-xl hover:bg-stone-800 shadow-md transition-all active:scale-95"
            >
              Log First Entry
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-100/50">
                    <th className="text-[10px] uppercase tracking-widest font-black text-stone-500 px-6 py-4 border-b border-stone-200 w-1/3">Formulation Blueprint</th>
                    <th className="text-[10px] uppercase tracking-widest font-black text-stone-500 px-6 py-4 border-b border-stone-200">System Log Status</th>
                    <th className="text-[10px] uppercase tracking-widest font-black text-stone-500 px-6 py-4 border-b border-stone-200">Current Volume</th>
                    <th className="text-[10px] uppercase tracking-widest font-black text-stone-500 px-6 py-4 border-b border-stone-200">Est Value</th>
                    <th className="text-[10px] uppercase tracking-widest font-black text-stone-500 px-6 py-4 border-b border-stone-200 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100/80">
                  {filtered.map(med => {
                    const stockStatus = getStockStatus(med);
                    return (
                      <tr key={med._id} className="hover:bg-stone-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-4">
                             <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 border border-stone-200 shrink-0">
                                <FaFlask className="w-4 h-4" />
                             </div>
                             <div>
                               <p className="font-extrabold text-stone-900 text-sm leading-tight mb-1">{med.name}</p>
                               <div className="flex flex-col gap-1 items-start">
                                  {med.sanskritName && <p className="text-xs font-semibold text-stone-400 italic">“{med.sanskritName}”</p>}
                                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{med.category}</span>
                               </div>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 align-middle">
                          <span className={`inline-flex py-1 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-5 align-middle">
                          <div className="flex flex-col gap-1">
                             <p className="text-sm font-black text-stone-900 bg-stone-100 py-1 px-3 rounded-lg w-max border border-stone-200 shadow-inner">
                                {med.stockQuantity} <span className="font-semibold text-stone-500 ml-1">{med.unit}</span>
                             </p>
                             {med.reorderLevel && (
                               <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                                 Alert Trigger: {med.reorderLevel}
                               </p>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-5 align-middle">
                          <p className="text-sm font-bold text-stone-700">{med.price ? `₹${med.price.toLocaleString("en-IN")}` : "Untracked"}</p>
                        </td>
                        <td className="px-6 py-5 align-middle text-right">
                          <button 
                            onClick={() => openEdit(med)} 
                            className="p-2.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-200 inline-block focus:ring-2 focus:ring-emerald-500/20 outline-none"
                            title="Edit Formulation"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animation-scale-up">
              <div className="p-6 md:p-8 border-b border-stone-100 bg-stone-50/50 rounded-t-[2rem]">
                <h2 className="text-2xl font-black text-stone-900">{editItem ? "Amend Formulation Matrix" : "Register Novel Formulation"}</h2>
                <p className="text-sm font-medium text-stone-500 mt-1">{editItem ? "Modify datastore metrics for existing Ayurvedic preparation" : "Append a new foundational preparation into system inventory"}</p>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <form id="inventory-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 space-y-4">
                     <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Nomenclature
                     </p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <label className="text-xs font-bold text-stone-700 block mb-1.5">Primary Trade Name <span className="text-red-500">*</span></label>
                         <input 
                           type="text" 
                           value={form.name} 
                           onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                           required 
                           placeholder="e.g. Ashwagandha Churna"
                           className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 placeholder:font-medium" 
                         />
                       </div>
                       <div>
                         <label className="text-xs font-bold text-stone-700 block mb-1.5">Classical Sanskrit Dialect</label>
                         <input 
                           type="text" 
                           value={form.sanskritName} 
                           onChange={e => setForm(f => ({ ...f, sanskritName: e.target.value }))} 
                           placeholder="e.g. अश्वगन्ध"
                           className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 placeholder:font-medium" 
                         />
                       </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Classification
                        </p>
                        <div>
                          <label className="text-xs font-bold text-stone-700 block mb-1.5">Preparation Type</label>
                          <select 
                            value={form.category} 
                            onChange={e => setForm(f => ({ ...f, category: e.target.value }))} 
                            className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer capitalize text-blue-900"
                          >
                            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                          </select>
                        </div>
                     </div>

                     <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100 space-y-4">
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Metric Base
                        </p>
                        <div>
                          <label className="text-xs font-bold text-stone-700 block mb-1.5">Measurement Unit</label>
                          <select 
                            value={form.unit} 
                            onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} 
                            className="w-full bg-white border border-purple-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer capitalize text-purple-900"
                          >
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                     </div>
                  </div>

                  <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100/50 space-y-4">
                     <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Datastore Metrics
                     </p>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <div>
                         <label className="text-[10px] font-bold text-amber-900 uppercase tracking-widest block mb-1.5">Current Cap <span className="text-red-500">*</span></label>
                         <input 
                           type="number" 
                           min="0" 
                           value={form.stockQuantity} 
                           onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))} 
                           required 
                           placeholder="0"
                           className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-lg font-black outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-amber-900 shadow-inner" 
                         />
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-amber-900 uppercase tracking-widest block mb-1.5">Trigger Defect</label>
                         <input 
                           type="number" 
                           min="0" 
                           value={form.reorderLevel} 
                           onChange={e => setForm(f => ({ ...f, reorderLevel: e.target.value }))} 
                           placeholder="5"
                           className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-lg font-black outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-amber-900 shadow-inner" 
                         />
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-amber-900 uppercase tracking-widest block mb-1.5">Unit Value (₹)</label>
                         <input 
                           type="number" 
                           min="0" 
                           value={form.price} 
                           onChange={e => setForm(f => ({ ...f, price: e.target.value }))} 
                           placeholder="499"
                           className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-lg font-black outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-amber-900 shadow-inner" 
                         />
                       </div>
                     </div>
                  </div>

                  <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 flex flex-col gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1.5">Supplying Agency (Vendor)</label>
                      <input 
                        type="text" 
                        value={form.manufacturer} 
                        onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} 
                        placeholder="e.g. Kottakkal Arya Vaidya Sala"
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 placeholder:font-medium" 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1.5">Extended Formulator Specs</label>
                      <textarea 
                        rows={3} 
                        value={form.description} 
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                        placeholder="Provide deep background on base ingredients or internal storage protocols..."
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 resize-none" 
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
                    Abort Directive
                 </button>
                 <button 
                    type="submit" 
                    form="inventory-form" 
                    disabled={saving} 
                    className="flex-1 px-6 py-3.5 text-sm font-bold shadow-sm border border-stone-900 text-white bg-stone-900 rounded-xl hover:bg-stone-800 disabled:opacity-50 transition-colors"
                 >
                    {saving ? "Executing Write..." : editItem ? "Sync Modification" : "Publish Configuration"}
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
