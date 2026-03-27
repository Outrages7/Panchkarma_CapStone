import { useState, useEffect } from "react";
import {
  FaUserShield,
  FaPlus,
  FaTrash,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaUser,
  FaBuilding,
  FaCheck,
} from "react-icons/fa";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/common/Toast";
import { useSelector } from "react-redux";
import api from "../../services/api";

const Admins = () => {
  const { toasts, toast, removeToast } = useToast();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    department: "",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/admins");
      setAdmins(res.data.data || []);
    } catch {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.phone) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setCreating(true);
      await api.post("/admin/admins", form);
      toast.success("Admin account created successfully");
      setShowCreateModal(false);
      setForm({ firstName: "", lastName: "", email: "", password: "", phone: "", department: "" });
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create admin");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/admins/${id}`);
      toast.success("Admin account deleted");
      setDeleteConfirm(null);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete admin");
    }
  };

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mt-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
              <FaUserShield className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                Admin Management
              </h1>
              <p className="text-stone-400 font-medium tracking-wide">
                Manage administrator accounts
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 text-sm relative z-10"
          >
            <FaPlus className="w-3.5 h-3.5" />
            Add Admin
          </button>
        </div>

        {/* Admins List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-stone-50/50 rounded-3xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-stone-900"></div>
          </div>
        ) : admins.length > 0 ? (
          <div className="space-y-4">
            {admins.map((admin) => {
              const isSelf = currentUser?._id === admin._id || currentUser?.id === admin._id;
              return (
                <div
                  key={admin._id}
                  className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:shadow-md ${
                    isSelf ? "border-emerald-300 bg-emerald-50/30" : "border-stone-200"
                  }`}
                >
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-black text-lg border border-emerald-200 flex-shrink-0">
                    {admin.firstName?.[0]}
                    {admin.lastName?.[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-stone-900 truncate">
                        {admin.firstName} {admin.lastName}
                      </h3>
                      {isSelf && (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-emerald-200">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-stone-500">
                      <span className="flex items-center gap-1.5">
                        <FaEnvelope className="w-3 h-3" />
                        {admin.email}
                      </span>
                      {admin.phone && (
                        <span className="flex items-center gap-1.5">
                          <FaPhone className="w-3 h-3" />
                          {admin.phone}
                        </span>
                      )}
                      {admin.department && (
                        <span className="flex items-center gap-1.5">
                          <FaBuilding className="w-3 h-3" />
                          {admin.department}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {admin.isEmailVerified && (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-emerald-200">
                        <FaCheck className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    )}
                    {deleteConfirm === admin._id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(admin._id)}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 bg-stone-200 text-stone-700 text-xs font-bold rounded-lg hover:bg-stone-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      !isSelf && (
                        <button
                          onClick={() => setDeleteConfirm(admin._id)}
                          className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete admin"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[2rem] shadow-sm border border-stone-200">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaUserShield className="text-4xl text-stone-300" />
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-2">No Admins Found</h2>
            <p className="text-stone-500 font-medium">Run the seed script to create the first admin</p>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center border border-emerald-200">
                    <FaUserShield className="text-emerald-600 w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">Create Admin</h2>
                    <p className="text-xs text-stone-500 font-medium">Add a new administrator account</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-400 hover:text-stone-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                      First Name *
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-3.5 h-3.5" />
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                      Last Name *
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-3.5 h-3.5" />
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                    Email *
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-3.5 h-3.5" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-3.5 h-3.5" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="Min 8 characters"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                      Phone *
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-3.5 h-3.5" />
                      <input
                        type="text"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="10-digit number"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                      Department
                    </label>
                    <div className="relative">
                      <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-3.5 h-3.5" />
                      <input
                        type="text"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="Administration"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 border border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-3 bg-stone-900 hover:bg-stone-950 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <FaPlus className="w-3 h-3" />
                        Create Admin
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Admins;
