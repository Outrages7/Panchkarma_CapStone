import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FaLeaf, FaArrowLeft, FaEnvelope, FaLock, FaCheckCircle } from "react-icons/fa";
import { login, clearError } from "../../redux/slices/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(clearError());
    if (isAuthenticated && user) {
      const dashboardRoutes = {
        patient: "/patient/dashboard",
        doctor: "/doctor/dashboard",
        admin: "/admin/dashboard",
      };
      navigate(dashboardRoutes[user.role] || "/");
    }
  }, [dispatch, isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const result = await dispatch(login(formData));
    if (result.type === "auth/login/fulfilled") {
      const role = result.payload.data.user.role;
      const dashboardRoutes = {
        patient: "/patient/dashboard",
        doctor: "/doctor/dashboard",
        admin: "/admin/dashboard",
      };
      navigate(dashboardRoutes[role] || "/");
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-950 font-sans antialiased text-stone-300 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Left — Immersive Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-stone-900 border-r border-stone-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-900/50 via-stone-900 to-stone-900 pointer-events-none"></div>

        <div className="relative z-10 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all">
              <FaLeaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight">AyurCare<span className="text-emerald-500">.</span></span>
            </div>
          </Link>
          <div className="px-3 py-1 rounded-full bg-stone-950 border border-stone-800 flex items-center gap-2 shadow-inner">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Secure Network</span>
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-6">
            <FaCheckCircle className="w-3 h-3" /> Secure Login
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Welcome back to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">AyurCare.</span>
          </h1>
          <p className="text-stone-400 text-base font-medium max-w-md leading-relaxed mb-10">
            Access your personalized Ayurvedic health records, manage appointments, and track your wellness journey.
          </p>

          <div className="bg-stone-950/50 backdrop-blur-sm border border-stone-800 rounded-2xl p-5 max-w-sm">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center">
                  <FaLeaf className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Secure Connection</p>
                  <p className="text-stone-500 text-xs mt-0.5">Your data is fully encrypted</p>
                </div>
             </div>
             <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-full"></div>
             </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-stone-800 pt-6 mt-12 flex justify-between items-center text-xs font-bold text-stone-600 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} AyurCare Core</p>
          <p>v2.4.0-stable</p>
        </div>
      </div>

      {/* Right — Clean Dark Form */}
      <div className="w-full lg:w-[55%] flex justify-center py-12 px-6 sm:px-12 relative overflow-y-auto">
        <div className="max-w-md w-full my-auto relative z-10">
          
          {/* Mobile Branding */}
          <div className="lg:hidden mb-12 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <FaLeaf className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">AyurCare<span className="text-emerald-500">.</span></span>
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Sign In</h2>
            <p className="text-sm text-stone-400 font-medium">Please sign in to access your AyurCare account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl text-sm font-medium flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></div>
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <FaEnvelope className="w-4 h-4 text-stone-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@domain.com"
                  className={`w-full pl-11 pr-4 py-3.5 bg-stone-900 border ${formErrors.email ? 'border-red-500/50 focus:border-red-500' : 'border-stone-800 focus:border-emerald-500/50'} rounded-xl text-white placeholder-stone-600 focus:outline-none focus:ring-0 transition-all font-medium`}
                />
              </div>
              {formErrors.email && <p className="text-xs text-red-400 mt-1.5 ml-1 font-medium">{formErrors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-widest">Forgot Password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <FaLock className="w-4 h-4 text-stone-500" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3.5 bg-stone-900 border ${formErrors.password ? 'border-red-500/50 focus:border-red-500' : 'border-stone-800 focus:border-emerald-500/50'} rounded-xl text-white placeholder-stone-600 focus:outline-none focus:ring-0 transition-all font-medium tracking-widest`}
                />
              </div>
              {formErrors.password && <p className="text-xs text-red-400 mt-1.5 ml-1 font-medium">{formErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 mt-8 bg-emerald-600 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-500"
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : null}
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="mt-10 pt-8 border-t border-stone-800/80 text-center">
              <p className="text-sm font-medium text-stone-500">
                Don't have an account?{" "}
                <Link to="/register" className="font-bold text-white hover:text-emerald-400 transition-colors ml-1">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="text-center mt-6">
              <Link to="/" className="inline-flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-stone-600 hover:text-stone-400 transition-colors py-2 px-4 rounded-lg hover:bg-stone-900 border border-transparent hover:border-stone-800">
                <FaArrowLeft className="w-2.5 h-2.5" /> Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
