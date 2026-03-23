import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FaLeaf, FaCheckCircle, FaUser, FaUserMd, FaCog, FaArrowLeft, FaCheck, FaAddressCard, FaInfoCircle, FaPhoneAlt, FaEnvelope, FaLock, FaUserTag, FaIdCard, FaStethoscope, FaBirthdayCake, FaBuilding } from "react-icons/fa";
import {
  register,
  clearError,
  clearMessage,
} from "../../redux/slices/authSlice";

const DarkInput = ({ label, name, type = "text", value, onChange, placeholder, error, min, icon: Icon, required }) => (
  <div className="space-y-1.5 w-full">
    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-stone-500" />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-stone-900 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-stone-800 focus:border-emerald-500/50'} rounded-xl text-white placeholder-stone-600 focus:outline-none focus:ring-0 transition-all font-medium text-sm`}
      />
    </div>
    {error && <p className="text-xs text-red-400 mt-1.5 ml-1 font-medium">{error}</p>}
  </div>
);

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "",
    dateOfBirth: "",
    gender: "",
    specialization: "",
    licenseNumber: "",
    experience: "",
    consultationFee: "",
    department: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearMessage());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData((prev) => ({ ...prev, role }));
    setStep(2);
  };

  const validateStep2 = () => {
    const errors = {};
    const nameRegex = /^[a-zA-Z\s'-]+$/;

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (!nameRegex.test(formData.firstName)) {
      errors.firstName = "First name can only contain letters";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (!nameRegex.test(formData.lastName)) {
      errors.lastName = "Last name can only contain letters";
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.phone) {
      errors.phone = "Phone is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = "Phone must be 10 digits";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = "Must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const validateStep3 = () => {
    const errors = {};

    if (selectedRole === "patient") {
      if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
      if (!formData.gender) errors.gender = "Gender is required";
    } else if (selectedRole === "doctor") {
      if (!formData.specialization) errors.specialization = "Specialization is required";
      if (!formData.licenseNumber) {
        errors.licenseNumber = "License number is required";
      } else if (!/^[A-Z]{2,3}-\d{4,6}$/.test(formData.licenseNumber)) {
        errors.licenseNumber = "Format: XX-123456 (e.g., MD-123456)";
      }
      if (!formData.experience) errors.experience = "Experience is required";
      if (!formData.consultationFee) errors.consultationFee = "Fee is required";
    } else if (selectedRole === "admin") {
      if (!formData.department) errors.department = "Department is required";
    }

    return errors;
  };

  const handleNext = () => {
    const errors = validateStep2();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateStep3();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
    };

    if (selectedRole === "patient") {
      submitData.dateOfBirth = formData.dateOfBirth;
      submitData.gender = formData.gender;
    } else if (selectedRole === "doctor") {
      submitData.specialization = formData.specialization;
      submitData.licenseNumber = formData.licenseNumber;
      submitData.experience = parseInt(formData.experience);
      submitData.consultationFee = parseFloat(formData.consultationFee);
    } else if (selectedRole === "admin") {
      submitData.department = formData.department;
    }

    await dispatch(register(submitData));
  };

  const stepLabels = ["Account Type", "Details", "Profile"];


  return (
    <div className="min-h-screen flex bg-stone-950 font-sans antialiased text-stone-300 selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Left — Immersive Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-stone-900 border-r border-stone-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
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
             <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Getting Started</span>
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-6">
            <FaCog className="w-3 h-3" /> Secure Registration
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Create your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">AyurCare account.</span>
          </h1>
          <p className="text-stone-400 text-base font-medium max-w-md leading-relaxed mb-10">
            Join our unified platform for holistic healthcare management and personalized treatments.
          </p>

          <div className="space-y-4 max-w-sm">
            {[
               { icon: FaCheckCircle, text: "Personalized Assessments" },
               { icon: FaCheckCircle, text: "Health Tracking & Records" },
               { icon: FaCheckCircle, text: "Secure & Confidential" }
            ].map((f, i) => (
               <div key={i} className="flex items-center gap-3 bg-stone-950/50 backdrop-blur-sm border border-stone-800/80 rounded-xl p-4 shadow-sm">
                 <f.icon className="w-4 h-4 text-emerald-500" />
                 <span className="text-stone-300 text-sm font-bold">{f.text}</span>
               </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-stone-800 pt-6 mt-12 flex justify-between items-center text-xs font-bold text-stone-600 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} AyurCare Core</p>
          <p>v2.4.0-stable</p>
        </div>
      </div>

      {/* Right — Clean Dark Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-6 sm:px-12 py-12 relative overflow-y-auto">
        <div className="max-w-xl w-full">
          
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
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Create Account</h2>
            <p className="text-sm text-stone-400 font-medium">
              {step === 1 ? "Choose your account type" : step === 2 ? "Enter your personal details" : "Complete your profile"}
            </p>
          </div>

          {/* Neural Progress Bar */}
          <div className="flex items-center mb-10 relative">
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-800 -translate-y-1/2 z-0"></div>
             <div className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }}></div>
             
             {stepLabels.map((lbl, i) => {
               const idx = i + 1;
               const active = step >= idx;
               const done = step > idx;
               return (
                  <div key={lbl} className="flex-1 flex justify-center z-10">
                     <div className={`flex flex-col items-center gap-2`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all duration-500 ${active ? 'bg-stone-950 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-stone-900 border-stone-800 text-stone-600'}`}>
                           {done ? <FaCheck className="w-3 h-3" /> : `0${idx}`}
                        </div>
                        <span className={`text-[9px] uppercase tracking-widest font-black ${active ? 'text-emerald-500' : 'text-stone-600'}`}>{lbl}</span>
                     </div>
                  </div>
               )
             })}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl text-sm font-medium flex gap-3 mb-8">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1.5 shrink-0"></div>
              {error}
            </div>
          )}

          {message && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-5 py-4 rounded-2xl text-sm font-medium flex gap-3 mb-8">
              <FaCheckCircle className="w-5 h-5 shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="space-y-4">
                {[
                  { role: "patient", label: "Patient", desc: "Book appointments and track your health", Icon: FaUser, glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]", color: "text-emerald-400" },
                  { role: "doctor", label: "Doctor", desc: "Manage patients, appointments, and medical records", Icon: FaUserMd, glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]", color: "text-amber-400" },
                  { role: "admin", label: "Administrator", desc: "Manage hospital operations and platform settings", Icon: FaCog, glow: "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]", color: "text-purple-400" },
                ].map(r => (
                  <button
                    key={r.role}
                    onClick={() => handleRoleSelect(r.role)}
                    className={`w-full group p-5 bg-stone-900 border border-stone-800 rounded-2xl hover:border-stone-700 transition-all text-left focus:outline-none flex items-center gap-5 relative overflow-hidden ${r.glow}`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-stone-800/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                    <div className="w-12 h-12 bg-stone-950 rounded-xl flex items-center justify-center border border-stone-800 shadow-inner group-hover:-translate-y-1 transition-transform">
                      <r.Icon className={`w-5 h-5 ${r.color}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white tracking-wide group-hover:text-stone-200 transition-colors">{r.label}</h3>
                      <p className="text-xs text-stone-500 mt-1 font-medium">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-stone-800/50 mt-10 text-center flex flex-col gap-4">
                <p className="text-sm font-medium text-stone-500">
                  Already have an account?{" "}
                  <Link to="/login" className="font-bold text-white hover:text-emerald-400 transition-colors ml-1">
                    Log In
                  </Link>
                </p>
                <div className="flex justify-center">
                  <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-600 hover:text-stone-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-stone-900 border border-transparent hover:border-stone-800">
                    <FaArrowLeft className="w-2.5 h-2.5" /> Back to Home
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Basic Information */}
          {step === 2 && (
            <form className="space-y-5 animate-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <DarkInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} error={formErrors.firstName} icon={FaAddressCard} />
                <DarkInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} error={formErrors.lastName} icon={FaAddressCard} />
              </div>
              <DarkInput label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} error={formErrors.email} placeholder="name@domain.com" icon={FaEnvelope} />
              <DarkInput label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="10 Digit Number" error={formErrors.phone} icon={FaPhoneAlt} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <DarkInput label="Password" type="password" name="password" value={formData.password} onChange={handleChange} error={formErrors.password} icon={FaLock} placeholder="••••••••" />
                <DarkInput label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={formErrors.confirmPassword} icon={FaLock} placeholder="••••••••" />
              </div>

              <div className="flex gap-4 pt-6 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 flex items-center justify-center gap-2 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-stone-400 bg-stone-900 border border-stone-800 hover:bg-stone-800 hover:text-white rounded-xl transition"
                >
                  <FaArrowLeft className="w-3 h-3" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-2/3 px-6 py-4 text-sm font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-500 transition"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Role-specific Clearance */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-right-8 duration-500">
              {selectedRole === "patient" && (
                <div className="space-y-5 border border-stone-800 bg-stone-900/50 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                     <FaUserTag className="text-emerald-500 w-5 h-5" />
                     <h4 className="text-white font-black">Patient Details</h4>
                  </div>
                  <DarkInput label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} error={formErrors.dateOfBirth} icon={FaBirthdayCake} />
                  <div className="space-y-1.5 w-full">
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Gender</label>
                    <div className="relative">
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-stone-900 border ${formErrors.gender ? 'border-red-500/50 focus:border-red-500' : 'border-stone-800 focus:border-emerald-500/50'} rounded-xl text-white appearance-none focus:outline-none focus:ring-0 transition-all font-medium text-sm drop-shadow-sm`}
                      >
                        <option value="" className="text-stone-500">Select your gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                         <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    {formErrors.gender && <p className="text-xs text-red-400 mt-1.5 ml-1 font-medium">{formErrors.gender}</p>}
                  </div>
                </div>
              )}

              {selectedRole === "doctor" && (
                <div className="space-y-5 border border-stone-800 bg-stone-900/50 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                     <FaStethoscope className="text-amber-500 w-5 h-5" />
                     <h4 className="text-white font-black">Doctor Details</h4>
                  </div>
                  <div className="space-y-1.5 w-full">
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Specialization</label>
                    <div className="relative">
                      <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-stone-900 border ${formErrors.specialization ? 'border-red-500/50 focus:border-red-500' : 'border-stone-800 focus:border-emerald-500/50'} rounded-xl text-white appearance-none focus:outline-none focus:ring-0 transition-all font-medium text-sm`}
                      >
                        <option value="">Select your specialization</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Endocrinology">Endocrinology</option>
                        <option value="Gastroenterology">Gastroenterology</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Gynecology">Gynecology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Oncology">Oncology</option>
                        <option value="Ophthalmology">Ophthalmology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Psychiatry">Psychiatry</option>
                        <option value="Pulmonology">Pulmonology</option>
                        <option value="Radiology">Radiology</option>
                        <option value="Urology">Urology</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                         <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    {formErrors.specialization && <p className="text-xs text-red-400 mt-1.5 ml-1 font-medium">{formErrors.specialization}</p>}
                  </div>
                  <DarkInput label="License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="MD-123456" error={formErrors.licenseNumber} icon={FaIdCard} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <DarkInput label="Years of Experience" type="number" name="experience" value={formData.experience} onChange={handleChange} min="0" error={formErrors.experience} icon={FaInfoCircle} />
                    <DarkInput label="Consultation Fee (₹)" type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} placeholder="500" min="0" error={formErrors.consultationFee} />
                  </div>
                </div>
              )}

              {selectedRole === "admin" && (
                <div className="space-y-5 border border-stone-800 bg-stone-900/50 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                     <FaBuilding className="text-purple-500 w-5 h-5" />
                     <h4 className="text-white font-black">Admin Details</h4>
                  </div>
                  <DarkInput label="Department" name="department" value={formData.department} onChange={handleChange} placeholder="IT / Logistics / Medical" error={formErrors.department} />
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 flex items-center justify-center gap-2 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-stone-400 bg-stone-900 border border-stone-800 hover:bg-stone-800 hover:text-white rounded-xl transition"
                >
                  <FaArrowLeft className="w-3 h-3" /> Revert
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 flex items-center justify-center gap-3 px-6 py-4 text-sm font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Registration Disclaimer */}
          <div className="mt-10 text-center relative z-20">
             <p className="text-[10px] uppercase tracking-widest text-stone-600 font-bold max-w-xs mx-auto">
               By creating an account, you agree to our Terms of Service and Privacy Policy.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
