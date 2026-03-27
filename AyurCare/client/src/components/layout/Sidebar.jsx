import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaLeaf,
  FaHome,
  FaUserMd,
  FaUsers,
  FaCalendarAlt,
  FaBuilding,
  FaChartBar,
  FaCog,
  FaCalendarCheck,
  FaFileMedical,
  FaEnvelope,
  FaUser,
  FaNotesMedical,
  FaClipboardList,
  FaChartLine,
  FaStar,
  FaFlask,
  FaFileAlt,
  FaSeedling,
  FaUserShield,
  FaSignOutAlt
} from "react-icons/fa";
import { logout } from "../../redux/slices/authSlice";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const getNavigationItems = () => {
    const role = user?.role;
    if (role === "admin") {
      return [
        { name: "Overview", path: "/admin/dashboard", icon: FaHome },
        { name: "Practitioners", path: "/admin/doctors", icon: FaUserMd },
        { name: "Patients", path: "/admin/patients", icon: FaUsers },
        { name: "Sessions", path: "/admin/appointments", icon: FaCalendarAlt },
        { name: "Therapies", path: "/admin/therapy-types", icon: FaSeedling },
        { name: "Rooms", path: "/admin/therapy-rooms", icon: FaBuilding },
        { name: "Inventory", path: "/admin/inventory", icon: FaFlask },
        { name: "Analytics", path: "/admin/analytics", icon: FaChartBar },
        { name: "Reports", path: "/admin/reports", icon: FaFileAlt },
        { name: "Admins", path: "/admin/admins", icon: FaUserShield },
        { name: "Settings", path: "/admin/settings", icon: FaCog },
      ];
    }
    if (role === "doctor") {
      return [
        { name: "Overview", path: "/doctor/dashboard", icon: FaHome },
        { name: "Today's Sessions", path: "/doctor/therapy-sessions", icon: FaCalendarCheck },
        { name: "Treatment Plans", path: "/doctor/treatment-plans", icon: FaClipboardList },
        { name: "My Patients", path: "/doctor/patients", icon: FaUsers },
        { name: "Prescriptions", path: "/doctor/prescriptions", icon: FaFileMedical },
        { name: "Messages", path: "/doctor/messages", icon: FaEnvelope },
        { name: "Profile", path: "/doctor/profile", icon: FaUser },
      ];
    }
    if (role === "patient") {
      return [
        { name: "Overview", path: "/patient/dashboard", icon: FaHome },
        { name: "My Sessions", path: "/patient/appointments", icon: FaCalendarAlt },
        { name: "Treatment Plan", path: "/patient/therapy-plan", icon: FaClipboardList },
        { name: "Progress", path: "/patient/therapy-progress", icon: FaChartLine },
        { name: "Care Guide", path: "/patient/pre-post-care", icon: FaNotesMedical },
        { name: "Records", path: "/patient/medical-records", icon: FaFileMedical },
        { name: "Feedback", path: "/patient/feedback", icon: FaStar },
        { name: "Messages", path: "/patient/messages", icon: FaEnvelope },
        { name: "Profile", path: "/patient/profile", icon: FaUser },
      ];
    }
    return [];
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[260px] bg-stone-950 text-stone-300 transition-transform duration-300 ease-in-out lg:translate-x-0 outline outline-1 outline-white/5 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand/Logo Area */}
          <div className="flex items-center justify-between h-[72px] px-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-inner shadow-white/20">
                <FaLeaf className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">AyurCare</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 text-stone-400 hover:text-white rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4 px-2">Menu</div>
            {navigationItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    active
                      ? "bg-stone-800 text-white shadow-sm"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${active ? "text-emerald-500" : "text-stone-500 group-hover:text-stone-300"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-900 border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-emerald-900/50 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-stone-400 capitalize truncate">
                  {user?.role === 'doctor' ? 'Practitioner' : user?.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
                title="Log out"
              >
                <FaSignOutAlt className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
