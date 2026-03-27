import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { forgotPassword, clearError, clearMessage } from '../../redux/slices/authSlice';
import { FaLeaf, FaEnvelope, FaArrowLeft, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearMessage());
  }, [dispatch]);

  useEffect(() => {
    if (message) setEmailSent(true);
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setEmailError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('Email is invalid'); return; }
    await dispatch(forgotPassword(email));
  };

  return (
    <div className="min-h-screen flex bg-stone-950 font-sans antialiased text-stone-300 selection:bg-emerald-500/30">

      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-stone-900 border-r border-stone-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-900/50 via-stone-900 to-stone-900 pointer-events-none"></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <FaLeaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">AyurCare<span className="text-emerald-500">.</span></span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Forgot your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">password?</span>
          </h1>
          <p className="text-stone-400 text-base font-medium max-w-md leading-relaxed">
            No worries — it happens to the best of us. Enter your email and we'll send a secure link to reset it.
          </p>
        </div>

        <div className="relative z-10 border-t border-stone-800 pt-6 flex justify-between items-center text-xs font-bold text-stone-600 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} AyurCare Core</p>
          <p>Secure Recovery</p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-6 sm:px-12 py-12">
        <div className="max-w-md w-full">

          {/* Mobile Branding */}
          <div className="lg:hidden mb-12 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <FaLeaf className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">AyurCare<span className="text-emerald-500">.</span></span>
            </Link>
          </div>

          {emailSent ? (
            /* — Success State — */
            <div className="text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 mx-auto bg-emerald-500/10 border-2 border-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                <FaCheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">Check Your Email</h2>
              <p className="text-stone-400 font-medium mb-2">{message}</p>
              <p className="text-sm text-stone-500 font-medium mb-8">
                If you don't see the email, check your spam folder.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => { setEmailSent(false); dispatch(clearMessage()); setEmail(''); }}
                  className="w-full px-6 py-4 text-sm font-black uppercase tracking-widest text-stone-400 bg-stone-900 border border-stone-800 hover:bg-stone-800 hover:text-white rounded-xl transition"
                >
                  Try Different Email
                </button>
                <Link to="/login">
                  <button className="w-full px-6 py-4 text-sm font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] border border-emerald-500 transition mt-3">
                    Back to Login
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            /* — Form State — */
            <>
              <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Reset Password</h2>
                <p className="text-sm text-stone-400 font-medium">Enter your registered email to receive a reset link</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl text-sm font-medium flex gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1.5 shrink-0"></div>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="w-4 h-4 text-stone-500" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      placeholder="you@example.com"
                      className={`w-full pl-11 pr-4 py-3 bg-stone-900 border ${emailError ? 'border-red-500/50 focus:border-red-500' : 'border-stone-800 focus:border-emerald-500/50'} rounded-xl text-white placeholder-stone-600 focus:outline-none focus:ring-0 transition-all font-medium text-sm`}
                    />
                  </div>
                  {emailError && <p className="text-xs text-red-400 mt-1.5 ml-1 font-medium">{emailError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 text-sm font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="w-4 h-4" /> Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-600 hover:text-stone-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-stone-900 border border-transparent hover:border-stone-800">
                  <FaArrowLeft className="w-2.5 h-2.5" /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
