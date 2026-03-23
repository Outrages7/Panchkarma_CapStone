import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";
import { FaPlus, FaEdit, FaToggleOn, FaToggleOff } from "react-icons/fa";

const STATUS_STYLES = {
  available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  occupied: "bg-stone-100 text-stone-700 border-stone-200",
  maintenance: "bg-red-100 text-red-600 border-red-200",
  cleaning: "bg-blue-100 text-blue-700 border-blue-200",
};

const TherapyRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    roomNumber: "",
    floor: "",
    capacity: 1,
    suitableTherapies: [],
    equipment: "",
    amenities: "",
  });

  const THERAPY_OPTIONS = ["vamana", "virechana", "basti", "nasya", "raktamokshana"];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get("/therapy-rooms");
      setRooms(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", roomNumber: "", floor: "", capacity: 1, suitableTherapies: [], equipment: "", amenities: "" });
    setShowForm(true);
  };

  const openEdit = (r) => {
    setEditItem(r);
    setForm({
      name: r.name || "",
      roomNumber: r.roomNumber || "",
      floor: r.floor || "",
      capacity: r.capacity || 1,
      suitableTherapies: r.suitableTherapies || [],
      equipment: (r.equipment || []).join(", "),
      amenities: (r.amenities || []).join(", "),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      capacity: Number(form.capacity),
      equipment: form.equipment.split(",").map(s => s.trim()).filter(Boolean),
      amenities: form.amenities.split(",").map(s => s.trim()).filter(Boolean),
    };
    try {
      if (editItem) {
        await api.put(`/therapy-rooms/${editItem._id}`, payload);
      } else {
        await api.post("/therapy-rooms", payload);
      }
      setShowForm(false);
      fetchRooms();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleTherapy = (t) => {
    setForm(f => ({
      ...f,
      suitableTherapies: f.suitableTherapies.includes(t)
        ? f.suitableTherapies.filter(x => x !== t)
        : [...f.suitableTherapies, t],
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mt-2 mb-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
              <span className="text-3xl text-white">🏠</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                Therapy Rooms
              </h1>
              <p className="text-stone-400 font-medium tracking-wide">
                Manage clinical spaces, equipment availability, and room capacity
              </p>
            </div>
          </div>
          
          <button
            onClick={openCreate}
            className="relative z-10 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg w-full md:w-auto mt-4 md:mt-0"
          >
            <FaPlus /> Add Room
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32 bg-stone-50/50 rounded-3xl border border-stone-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-stone-900"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-stone-200 p-16 text-center shadow-sm">
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <span className="text-4xl text-stone-300">🏠</span>
            </div>
            <h2 className="text-2xl font-black text-stone-800 mb-3">No Clinical Spaces Defined</h2>
            <p className="text-stone-500 font-medium mb-8 max-w-sm mx-auto">Create and configure treatment suites to enable therapy scheduling.</p>
            <button 
              onClick={openCreate} 
              className="px-8 py-3.5 bg-stone-900 border border-stone-800 text-white font-bold rounded-xl hover:bg-stone-800 shadow-md transition-all active:scale-95"
            >
              Configure First Space
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {rooms.map(room => (
              <div key={room._id} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 group hover:border-emerald-200 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="pr-4">
                      <h3 className="font-extrabold text-stone-900 text-lg leading-tight mb-1">{room.name}</h3>
                      <p className="text-sm font-semibold text-stone-500">Suite {room.roomNumber}{room.floor ? ` • Lvl ${room.floor}` : ""}</p>
                    </div>
                    <button 
                      onClick={() => openEdit(room)} 
                      className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-transparent hover:border-emerald-100 shrink-0 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                  </div>
  
                  <div className="mb-6">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2.5">Eligible Modalities</p>
                    <div className="flex flex-wrap gap-1.5 min-h-[40px]">
                      {(room.suitableTherapies || []).length > 0 ? (
                        room.suitableTherapies.map(t => (
                          <span key={t} className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md border border-stone-200 uppercase tracking-wider">{t}</span>
                        ))
                      ) : (
                        <span className="text-xs font-medium text-stone-400 border border-dashed border-stone-200 px-3 py-1 rounded-lg">Multi-purpose Use</span>
                      )}
                    </div>
                  </div>
                </div>
  
                <div className="pt-4 border-t border-stone-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Base Capacity</span>
                    <span className="text-sm font-black text-stone-900 px-3 py-1 bg-stone-100 rounded-lg">{room.capacity} Person</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Current State</span>
                    <span className={`text-[10px] px-3 py-1 rounded-md font-bold uppercase tracking-wider border ${STATUS_STYLES[room.currentStatus] || "bg-stone-50 text-stone-600 border-stone-200"}`}>
                      {room.currentStatus || "available"}
                    </span>
                  </div>
               </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col animation-scale-up">
              <div className="p-6 md:p-8 border-b border-stone-100 bg-stone-50/50 rounded-t-[2rem]">
                <h2 className="text-2xl font-black text-stone-900">{editItem ? "Modify Suite Specs" : "Register Clinic Space"}</h2>
                <p className="text-sm font-medium text-stone-500 mt-1">{editItem ? "Adjust parameters for existing therapy room" : "Add a fresh room into the hospital database"}</p>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <form id="room-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 space-y-4">
                     <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Core Identification
                     </p>
                     <div>
                       <label className="text-xs font-bold text-stone-700 block mb-1.5">Suite Name</label>
                       <input
                         type="text"
                         value={form.name}
                         onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                         required
                         placeholder="e.g. Premium Vamana Suite Alpha"
                         className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 placeholder:font-medium"
                       />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-xs font-bold text-stone-700 block mb-1.5">Unit Number</label>
                         <input
                           type="text"
                           value={form.roomNumber}
                           onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))}
                           placeholder="B-101"
                           className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 placeholder:font-medium"
                         />
                       </div>
                       <div>
                         <label className="text-xs font-bold text-stone-700 block mb-1.5">Level / Floor</label>
                         <input
                           type="text"
                           value={form.floor}
                           onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}
                           placeholder="Mezzanine"
                           className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 placeholder:font-medium"
                         />
                       </div>
                     </div>
                  </div>

                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
                     <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Operational Limits
                     </p>
                     <div>
                       <label className="text-xs font-bold text-stone-700 block mb-1.5">Simultaneous Patient Capacity</label>
                       <input
                         type="number"
                         min="1"
                         value={form.capacity}
                         onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                         className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                       />
                     </div>
                  </div>

                  <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Supported Modalities
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {THERAPY_OPTIONS.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTherapy(t)}
                          className={`px-4 py-2 text-xs font-bold rounded-lg capitalize border transition-all ${
                            form.suitableTherapies.includes(t)
                              ? "bg-purple-600 text-white border-purple-700 shadow-md"
                              : "bg-white text-stone-600 border-stone-200 hover:border-purple-300 hover:text-purple-700"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 space-y-4">
                     <p className="text-xs font-bold text-stone-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span> Inventory & Resources
                     </p>
                     <div>
                       <label className="text-xs font-bold text-stone-700 block mb-1.5">Fixed Equipment (comma-separated)</label>
                       <textarea
                         value={form.equipment}
                         rows={2}
                         onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))}
                         placeholder="e.g. Bronze Droni, Steam Chamber, ..."
                         className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 placeholder:font-medium resize-none"
                       />
                     </div>
                     <div>
                       <label className="text-xs font-bold text-stone-700 block mb-1.5">Comfort Amenities (comma-separated)</label>
                       <input
                         type="text"
                         value={form.amenities}
                         onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))}
                         placeholder="e.g. Ambient Lighting, Attached Bath, ..."
                         className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 placeholder:font-medium"
                       />
                     </div>
                  </div>

                </form>
              </div>
              <div className="p-6 md:p-8 border-t border-stone-100 bg-stone-50/50 rounded-b-[2rem] flex flex-col-reverse sm:flex-row gap-3">
                 <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="flex-1 px-6 py-3.5 text-sm font-bold border border-stone-200 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
                 >
                    Discard Edits
                 </button>
                 <button 
                    type="submit" 
                    form="room-form" 
                    disabled={saving} 
                    className="flex-1 px-6 py-3.5 text-sm font-bold shadow-sm border border-stone-900 text-white bg-stone-900 rounded-xl hover:bg-stone-800 disabled:opacity-50 transition-colors"
                 >
                    {saving ? "Executing Write..." : editItem ? "Save Modifications" : "Initialize Room"}
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TherapyRooms;
