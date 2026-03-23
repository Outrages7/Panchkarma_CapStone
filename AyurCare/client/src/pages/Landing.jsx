import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaLeaf,
  FaRobot,
  FaCalendarAlt,
  FaChartLine,
  FaWater,
  FaTint,
  FaWind,
  FaHeartbeat,
  FaSeedling,
  FaFire,
  FaSearch,
  FaClipboardList,
  FaUser,
  FaUserMd,
  FaCog,
  FaBullseye,
  FaChartBar,
  FaShieldAlt,
  FaArrowRight,
  FaClock,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheck,
  FaPlay,
  FaQuoteLeft,
} from "react-icons/fa";

const Landing = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}/dashboard`);
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-stone-950 font-sans antialiased text-stone-300 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-950/60 backdrop-blur-2xl border-b border-stone-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all">
                <FaLeaf className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">AyurCare<span className="text-emerald-500">.</span></span>
            </div>
            <div className="hidden lg:flex items-center space-x-10">
              <a href="#therapies" className="text-sm text-stone-400 hover:text-white transition font-bold tracking-wide">Pillars</a>
              <a href="#process" className="text-sm text-stone-400 hover:text-white transition font-bold tracking-wide">Protocol</a>
              <a href="#features" className="text-sm text-stone-400 hover:text-white transition font-bold tracking-wide">Engine</a>
              <a href="#roles" className="text-sm text-stone-400 hover:text-white transition font-bold tracking-wide">Infrastructure</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="hidden sm:inline-block px-5 py-2.5 text-sm font-bold text-stone-300 hover:text-white transition">
                Sign In
              </Link>
              <Link to="/register" className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-500 transition shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group">
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                <span className="relative flex items-center gap-2">Get Started <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Deep ambient blurs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-950/0 via-stone-950/80 to-stone-950 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-center">
            {/* Copy (Left 7 Cols) */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center space-x-2 bg-stone-900/80 border border-stone-800 text-stone-300 px-4 py-2 rounded-full text-xs font-bold mb-8 backdrop-blur-sm shadow-xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="tracking-wide uppercase">Personalized Ayurvedic Wellness</span>
              </div>

              <h1 className="text-[3.5rem] sm:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-white via-stone-200 to-stone-500 lg:text-[4.5rem] font-extrabold leading-[1.05] tracking-tighter mb-8 max-w-2xl">
                Transforming traditional <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Ayurvedic</span> healing.
              </h1>

              <p className="text-lg sm:text-xl text-stone-400 leading-relaxed mb-12 max-w-xl font-medium">
                A modern platform for Ayurvedic medicine. Personalized treatments, health tracking, and integrated care — all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-14">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] border border-emerald-500/50"
                >
                  Create Account
                  <FaArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>
                <button
                  onClick={() => document.getElementById('therapies').scrollIntoView({ behavior: 'smooth' })}
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-stone-900 text-white text-sm font-black uppercase tracking-widest rounded-2xl border border-stone-700 hover:bg-stone-800 hover:border-stone-600 transition-all"
                >
                  <FaPlay className="w-3 h-3 text-emerald-500" />
                  Explore Therapies
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-stone-500 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><FaCheck className="w-2.5 h-2.5 text-emerald-400" /></div>
                  <span>Zero Setup Cost</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><FaCheck className="w-2.5 h-2.5 text-emerald-400" /></div>
                  <span>SOC2 Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><FaCheck className="w-2.5 h-2.5 text-emerald-400" /></div>
                  <span>End-To-End Encrypted</span>
                </div>
              </div>
            </div>

            {/* Hero App Interface Mockup (Right 5 Cols) */}
            <div className="lg:col-span-5 relative perspective-1000 hidden md:block">
              {/* Abstract structural ring behind UI */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-stone-800/50 rounded-full animate-spin-slow pointer-events-none"></div>

              <div className="bg-stone-900 border border-stone-800 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] p-2 relative z-10 transform lg:-rotate-y-12 lg:rotate-x-12 hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out group">
                <div className="bg-stone-950 rounded-[1.5rem] overflow-hidden border border-stone-800/80">
                  {/* Mockup Header */}
                  <div className="bg-stone-900/50 border-b border-stone-800 px-6 py-5 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        <FaLeaf className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-black text-sm tracking-wide">Panchakarma Protocol</h4>
                        <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">In Progress</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                       <div className="w-3 h-3 rounded-full bg-stone-700"></div>
                       <div className="w-3 h-3 rounded-full bg-stone-700"></div>
                       <div className="w-3 h-3 rounded-full bg-stone-700"></div>
                    </div>
                  </div>
                  
                  {/* Mockup Body */}
                  <div className="p-6 space-y-6">
                    {/* Dosha Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: "Vata", val: 40, color: "bg-purple-500", glow: "shadow-[0_0_15px_rgba(168,85,247,0.4)]" },
                        { name: "Pitta", val: 35, color: "bg-red-500", glow: "shadow-[0_0_15px_rgba(239,68,68,0.4)]" },
                        { name: "Kapha", val: 25, color: "bg-blue-500", glow: "shadow-[0_0_15px_rgba(59,130,246,0.4)]" },
                      ].map(d => (
                         <div key={d.name} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                           <div className="flex justify-between items-center mb-3">
                             <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{d.name}</span>
                             <span className="text-xs font-black text-white">{d.val}%</span>
                           </div>
                           <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                             <div className={`h-full ${d.color} rounded-full ${d.glow} transition-all duration-1000`} style={{ width: `${d.val}%` }} />
                           </div>
                         </div>
                      ))}
                    </div>

                    {/* Timeline */}
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
                       <h5 className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-4 border-b border-stone-800 pb-2">Therapy Plan</h5>
                       <div className="space-y-4">
                          {[
                            { icon: FaSeedling, name: "Purva Karma", stat: "Complete", tColor: "text-stone-400", bColor: "border-emerald-500/30", bg: "bg-emerald-500/10", iColor: "text-emerald-500" },
                            { icon: FaFire, name: "Pradhana Karma", stat: "In Progress", tColor: "text-stone-100 font-bold", bColor: "border-amber-500", bg: "bg-amber-500/20", iColor: "text-amber-400" },
                            { icon: FaLeaf, name: "Paschat Karma", stat: "Pending", tColor: "text-stone-600", bColor: "border-stone-800", bg: "bg-stone-800", iColor: "text-stone-500" },
                          ].map((s, i) => (
                             <div key={i} className="flex items-center gap-4">
                               <div className={`w-8 h-8 rounded-lg border ${s.bColor} ${s.bg} flex items-center justify-center shrink-0`}>
                                 <s.icon className={`w-3.5 h-3.5 ${s.iColor}`} />
                               </div>
                               <div className="flex-1">
                                 <p className={`text-xs ${s.tColor}`}>{s.name}</p>
                               </div>
                               <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">{s.stat}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>

                {/* Floating UI Elements (Glassmorphism) */}
                <div className="absolute -left-10 top-1/4 bg-stone-900/80 backdrop-blur-xl border border-stone-700/50 p-4 rounded-2xl shadow-2xl flex items-center gap-4 transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                   <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                     <FaRobot className="w-4 h-4 text-purple-400" />
                   </div>
                   <div>
                     <p className="text-xs font-black text-white">Health Insights</p>
                     <p className="text-[10px] text-purple-300 font-bold uppercase tracking-widest mt-0.5">Status: Optimal</p>
                   </div>
                </div>

                <div className="absolute -right-12 bottom-1/4 bg-stone-900/80 backdrop-blur-xl border border-stone-700/50 p-4 rounded-2xl shadow-2xl flex items-center gap-4 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-300">
                   <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                     <FaChartLine className="w-4 h-4 text-blue-400" />
                   </div>
                   <div>
                     <p className="text-xs font-black text-white">Wellness Progress</p>
                     <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mt-0.5">+14% Improvement</p>
                   </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Telemetry / Social Proof ─── */}
      <section className="py-12 border-y border-stone-800 bg-stone-900/30 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-stone-800">
            {[
              { value: "54.2K", label: "Treatments Completed" },
              { value: "5", label: "Ayurvedic Therapies" },
              { value: "98.7%", label: "Success Rate" },
              { value: "100%", label: "Trusted by Patients" },
            ].map((s, i) => (
              <div key={i} className={`text-center px-4 ${i === 0 || i === 2 ? 'border-none md:border-solid' : i === 1 || i === 3 ? 'border-l border-stone-800' : ''}`}>
                <p className="text-3xl lg:text-4xl font-black text-white mb-2">{s.value}</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Therapies ─── */}
      <section id="therapies" className="py-32 px-6 relative">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-stone-800 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20 text-center lg:text-left">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                <FaLeaf className="w-3 h-3" /> Our Therapies
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Five pillars of classical <br/><span className="text-stone-500">Panchakarma healing.</span>
              </h2>
            </div>
            <p className="text-stone-400 font-medium max-w-md text-base lg:text-right">
              Ancient Ayurvedic treatments optimized for your body type. Each therapy targets specific imbalances to restore your natural health exactly where you need it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Vamana", icon: FaWater, desc: "Therapeutic emesis protocol targeting upper bio-cavity Kapha accumulation. Optimizes respiratory and lipid metabolism.", dosha: "Kapha", days: 14, glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]", color: "text-blue-400" },
              { name: "Virechana", icon: FaLeaf, desc: "Controlled purgation mechanics for systemic Pitta clearance. Re-establishes hepatic enzyme baselines.", dosha: "Pitta", days: 15, glow: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]", color: "text-red-400" },
              { name: "Basti", icon: FaTint, desc: "Deep colonic enema architecture mapping directly to Vata origins. Restores nervous system plasticity.", dosha: "Vata", days: 16, glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]", color: "text-purple-400" },
              { name: "Nasya", icon: FaWind, desc: "Supra-clavicular administration bypassing blood-brain thresholds. Clears neuro-sensory pathways.", dosha: "Kapha/Vata", days: 10, glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]", color: "text-blue-400" },
              { name: "Raktamokshana", icon: FaHeartbeat, desc: "Micro-venesection protocol eliminating deep-tissue toxicity and blood-borne pathologies rapidly.", dosha: "Pitta", days: 7, glow: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]", color: "text-red-400" },
            ].map((t, i) => (
              <div key={t.name} className={`group bg-stone-900/50 backdrop-blur-sm border border-stone-800 hover:border-stone-700 hover:bg-stone-900 rounded-[2rem] p-8 transition-all duration-500 ${t.glow} relative overflow-hidden ${i === 3 ? 'lg:col-span-1 lg:col-start-1 lg:ml-auto' : ''} ${i === 4 ? 'lg:col-span-1' : ''}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-stone-800/20 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="w-14 h-14 bg-stone-950 rounded-2xl flex items-center justify-center border border-stone-800 shadow-inner group-hover:-translate-y-1 transition-transform duration-500">
                    <t.icon className={`w-6 h-6 ${t.color}`} />
                  </div>
                  <span className={`text-[10px] px-3 py-1 rounded-full border border-stone-800 font-bold tracking-widest uppercase bg-stone-950/50 ${t.color}`}>{t.dosha} Focus</span>
                </div>
                <h3 className="font-extrabold text-white text-xl mb-3 relative z-10 group-hover:text-emerald-400 transition-colors">{t.name} Layer</h3>
                <p className="text-sm text-stone-400 leading-relaxed mb-8 relative z-10 min-h-[5rem]">{t.desc}</p>
                <div className="flex items-center justify-between pt-6 border-t border-stone-800/50 relative z-10">
                  <span className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest"><FaClock className="w-3.5 h-3.5" />{t.days} Day Cycle</span>
                  <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                     <FaArrowRight className="w-3 h-3 text-stone-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Process ─── */}
      <section id="process" className="py-32 px-6 bg-stone-900 border-y border-stone-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-6">
              <FaClipboardList className="w-3 h-3" /> How It Works
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">A clear, simple path to wellness.</h2>
            <p className="text-stone-400 text-lg">We provide a seamlessly integrated experience, from your first consultation all the way through your customized healing journey.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[4.5rem] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-stone-800 via-emerald-500/50 to-stone-800"></div>

            {[
              { num: "01", Icon: FaSearch, title: "Personalized Diagnosis", desc: "Our doctors evaluate your health and symptomatic data to instantly chart a clear Prakriti-Vikriti map of your body.", glow: "text-blue-500" },
              { num: "02", Icon: FaCog, title: "Therapy Planning", desc: "A tailored step-by-step treatment timeline is generated for you. Your treatments are scheduled for maximum recovery.", glow: "text-purple-500" },
              { num: "03", Icon: FaChartLine, title: "Execution & Progress", desc: "Live tracking via your portal. Doctors update your status while your dashboard reflects real-time health improvements.", glow: "text-emerald-500" },
            ].map((s, i) => (
              <div key={s.num} className="relative pt-12 text-center group">
                <div className="mx-auto w-24 h-24 bg-stone-950 rounded-2xl flex items-center justify-center border border-stone-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-8 relative z-10 group-hover:-translate-y-2 transition-transform duration-500">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-stone-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <s.Icon className={`w-8 h-8 ${s.glow} relative z-10 drop-shadow-[0_0_10px_currentColor]`} />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-[10px] font-black text-white border-2 border-stone-900 group-hover:bg-emerald-600 transition-colors">{s.num}</div>
                </div>
                <h3 className="font-extrabold text-white text-xl mb-4 group-hover:text-stone-300 transition-colors">{s.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed max-w-xs mx-auto font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features (The Engine) ─── */}
      <section id="features" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                <FaRobot className="w-3 h-3" /> Smart Platform
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-8">
                Modern Technology. <br/>Natural Healing.
              </h2>
              <p className="text-stone-400 text-lg leading-relaxed mb-10 font-medium">
                AyurCare isn't just a basic booking platform. It's a comprehensive platform for clinical Ayurveda, designed to dramatically improve patient outcomes by seamlessly connecting doctors and patients.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Personalized Health Tracking", desc: "Correlates your historical wellness data against current metrics to optimize your ongoing treatments." },
                  { title: "Seamless Appointments", desc: "Automatically manages clinic schedules and rooms so your consultations are always on time." },
                  { title: "Secure Health Records", desc: "Every consultation, prescription, and therapy step is securely logged to guarantee your privacy." }
                ].map((f, i) => (
                   <div key={i} className="flex items-start gap-4">
                     <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                       <FaCheck className="w-3 h-3 text-emerald-400" />
                     </div>
                     <div>
                       <h4 className="text-white font-bold text-base mb-1">{f.title}</h4>
                       <p className="text-sm text-stone-500 leading-relaxed font-medium">{f.desc}</p>
                     </div>
                   </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-stone-800">
                <Link to="/register" className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors group">
                   Get Started Today <FaArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
            
            {/* Abstract Tech Visual */}
            <div className="relative h-[600px] bg-stone-900 border border-stone-800 rounded-[3rem] overflow-hidden flex items-center justify-center shadow-2xl p-8 group">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800/50 via-stone-900 to-stone-900"></div>
               
               {/* Grid Pattern */}
               <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
               
               {/* Center Core */}
               <div className="relative z-10 w-48 h-48 bg-stone-950 rounded-full border border-stone-800 flex items-center justify-center shadow-[0_0_100px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_150px_rgba(168,85,247,0.2)] transition-shadow duration-1000">
                  <div className="absolute inset-4 rounded-full border-2 border-dashed border-stone-700 animate-spin-slow"></div>
                  <FaRobot className="w-16 h-16 text-stone-600 group-hover:text-purple-400 transition-colors duration-700" />
                  
                  {/* Orbiting Elements */}
                  {[FaHeartbeat, FaDatabase, FaShieldAlt].map((Icon, i) => (
                    <div key={i} className={`absolute w-12 h-12 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center shadow-lg transition-all duration-700`}
                         style={{ 
                           transform: `rotate(${i * 120}deg) translateY(-110px) rotate(-${i * 120}deg)`,
                         }}>
                      <Icon className="w-5 h-5 text-stone-400" />
                    </div>
                  ))}
               </div>
               
               <div className="absolute bottom-8 left-8 right-8 bg-stone-950/80 backdrop-blur-md border border-stone-800 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-1">Patient Dashboard</p>
                    <p className="text-white font-black text-sm">Ready for Consult</p>
                  </div>
                  <div className="flex gap-1.5">
                     {[1,2,3,4,5].map(i => (
                       <div key={i} className="w-1.5 h-6 bg-stone-800 rounded-full overflow-hidden">
                         <div className="w-full bg-emerald-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Roles (Infrastructure) ─── */}
      <section id="roles" className="py-32 px-6 bg-stone-900 border-t border-stone-800 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-stone-300 text-[10px] font-bold uppercase tracking-widest mb-6">
              <FaShieldAlt className="w-3 h-3" /> For Everyone
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">Built for your needs.</h2>
            <p className="text-stone-400 text-lg">A unified platform seamlessly connecting patients, doctors, and clinical directors in one place.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { role: "Patient", Icon: FaUser, accent: "emerald", title: "Patient Portal", desc: "Your personal health companion.", features: ["Book therapy sessions", "View personalized plans", "Track health metrics", "Digital prescriptions"] },
              { role: "Doctor", Icon: FaUserMd, accent: "amber", title: "Doctor Dashboard", desc: "The practitioner's workspace.", features: ["Create treatment plans", "Manage appointments", "Review patient health", "Track clinical progress"] },
              { role: "Administrator", Icon: FaCog, accent: "purple", title: "Admin Portal", desc: "Full hospital oversight.", features: ["Manage clinic rooms", "Track medicine inventory", "Manage hospital staff", "View financial reports"] },
            ].map((r, i) => {
              const bgColors = {
                 emerald: "bg-emerald-500/10",
                 amber: "bg-amber-500/10",
                 purple: "bg-purple-500/10"
              };
              const borderColors = {
                 emerald: "border-emerald-500/20 group-hover:border-emerald-500/50",
                 amber: "border-amber-500/20 group-hover:border-amber-500/50",
                 purple: "border-purple-500/20 group-hover:border-purple-500/50"
              };
              const textColors = {
                 emerald: "text-emerald-400",
                 amber: "text-amber-400",
                 purple: "text-purple-400"
              };
              
              return (
                <div key={r.role} className="group bg-stone-950 rounded-[2rem] p-8 border border-stone-800 transition-all duration-500 hover:-translate-y-2 hover:bg-stone-950 relative overflow-hidden">
                  <div className={`absolute -top-10 -right-10 w-40 h-40 ${bgColors[r.accent]} rounded-full blur-[50px] pointer-events-none transition-all duration-500 group-hover:scale-150`}></div>
                  
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-8 bg-stone-900 border ${borderColors[r.accent]} shadow-[0_4px_20px_rgba(0,0,0,0.5)]`}>
                    <r.Icon className={`w-5 h-5 ${textColors[r.accent]}`} />
                  </div>
                  
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">{r.role}</p>
                  <h3 className="font-extrabold text-white text-2xl mb-2">{r.title}</h3>
                  <p className="text-sm text-stone-400 mb-8 font-medium">{r.desc}</p>
                  
                  <div className="space-y-4 pt-6 border-t border-stone-800/50">
                    {r.features.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${bgColors[r.accent].replace('/10', '')} shadow-[0_0_8px_currentColor] ${textColors[r.accent]}`}></div>
                        <span className="text-xs font-bold text-stone-300">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-emerald-600/20 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 bg-stone-900/50 backdrop-blur-2xl border border-emerald-500/20 p-12 md:p-20 rounded-[3rem] shadow-[0_0_100px_rgba(16,185,129,0.1)]">
          <FaLeaf className="w-10 h-10 text-emerald-500 mx-auto mb-8 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Stop booking. <br/>Start healing.
          </h2>
          <p className="text-stone-300 text-lg mb-12 max-w-xl mx-auto font-medium">
            Join the most comprehensive Ayurvedic wellness platform. Create your AyurCare account today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-emerald-500 transition-all shadow-[0_0_40px_rgba(16,185,129,0.4)] border border-emerald-500 text-center">
              Create Account
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-10 py-5 text-white font-black text-sm uppercase tracking-widest rounded-2xl border border-stone-600 hover:bg-stone-800 transition-all text-center">
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-stone-950 py-16 px-6 border-t border-stone-900 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-12 gap-12 lg:gap-8 mb-16">
            <div className="md:col-span-5 lg:col-span-4">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-stone-900 border border-emerald-500/30 rounded-lg flex items-center justify-center">
                  <FaLeaf className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-white font-black text-xl tracking-tight">AyurCare<span className="text-emerald-500">.</span></span>
              </div>
              <p className="text-stone-500 text-sm leading-relaxed font-medium max-w-sm mb-8">
                A modern platform bringing the ancient wisdom of Ayurveda to the digital age.
              </p>
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center hover:border-emerald-500/50 hover:text-emerald-400 transition-all cursor-pointer text-stone-500"><FaPhoneAlt className="w-4 h-4" /></div>
                 <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center hover:border-emerald-500/50 hover:text-emerald-400 transition-all cursor-pointer text-stone-500"><FaEnvelope className="w-4 h-4" /></div>
                 <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center hover:border-emerald-500/50 hover:text-emerald-400 transition-all cursor-pointer text-stone-500"><FaMapMarkerAlt className="w-4 h-4" /></div>
              </div>
            </div>
            
            <div className="md:col-span-7 lg:col-span-8 flex flex-wrap gap-16 lg:justify-end">
               <div>
                 <h4 className="text-stone-300 font-extrabold text-xs uppercase tracking-widest mb-6">Links</h4>
                 <ul className="space-y-4">
                   {[{ label: "Sign Up", to: "/register" }, { label: "Log In", to: "/login" }, { label: "Admin Portal", to: "/login" }].map(l => (
                     <li key={l.label}><Link to={l.to} className="text-stone-500 font-bold text-sm hover:text-emerald-400 transition-colors flex items-center gap-2"><FaArrowRight className="w-2.5 h-2.5 opacity-0 -ml-4 transition-all" /> {l.label}</Link></li>
                   ))}
                 </ul>
               </div>
               <div>
                 <h4 className="text-stone-300 font-extrabold text-xs uppercase tracking-widest mb-6">Security</h4>
                 <ul className="space-y-4">
                   {["Data Privacy", "Security", "Medical Compliance", "Terms of Service"].map(l => (
                     <li key={l}><a href="#" className="text-stone-500 font-bold text-sm hover:text-emerald-400 transition-colors">{l}</a></li>
                   ))}
                 </ul>
               </div>
            </div>
          </div>
          
          <div className="border-t border-stone-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-stone-600 font-bold text-xs">© {new Date().getFullYear()} AyurCare Core Systems. All Rights Reserved.</p>
            <div className="flex items-center gap-2 text-stone-600 font-bold text-xs bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800">
               <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Platform Online
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Add missing FaDatabase icon mock component for the tech visual 
const FaDatabase = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M448 80v48c0 44.2-100.3 80-224 80S0 172.2 0 128V80C0 35.8 100.3 0 224 0S448 35.8 448 80zM393.2 214.7c20.8-7.4 39.9-16.9 54.8-28.6V288c0 44.2-100.3 80-224 80S0 332.2 0 288V186.1c14.9 11.8 34 21.2 54.8 28.6C99.7 230.7 159.5 240 224 240s124.3-9.3 169.2-25.3zM0 346.1c14.9 11.8 34 21.2 54.8 28.6C99.7 390.7 159.5 400 224 400s124.3-9.3 169.2-25.3c20.8-7.4 39.9-16.9 54.8-28.6V432c0 44.2-100.3 80-224 80S0 476.2 0 432V346.1z"/></svg>
);

export default Landing;
