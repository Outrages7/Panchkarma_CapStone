import { useState, useEffect } from "react";
import {
  FaHeartbeat,
  FaBrain,
  FaBone,
  FaBaby,
  FaAllergies,
  FaStethoscope,
  FaEye,
  FaLungs,
  FaTooth,
  FaUserMd,
  FaBuilding,
  FaUsers,
  FaCalendarAlt,
} from "react-icons/fa";
import { GiKidneys, GiStomach } from "react-icons/gi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import SearchBar from "../../components/common/SearchBar";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/common/Toast";
import api from "../../services/api";

const Departments = () => {
  const { toasts, toast, removeToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Department info with icons
  const getDepartmentInfo = (dept) => {
    const deptLower = dept.toLowerCase();
    const departmentMap = {
      cardiology: {
        icon: <FaHeartbeat className="w-6 h-6 text-white" />,
        bgColor: "bg-red-500",
        description: "Heart and cardiovascular care",
      },
      neurology: {
        icon: <FaBrain className="w-6 h-6 text-white" />,
        bgColor: "bg-purple-600",
        description: "Brain and nervous system",
      },
      orthopedics: {
        icon: <FaBone className="w-6 h-6 text-white" />,
        bgColor: "bg-amber-600",
        description: "Bones, joints, and muscles",
      },
      pediatrics: {
        icon: <FaBaby className="w-6 h-6 text-white" />,
        bgColor: "bg-pink-500",
        description: "Child healthcare specialists",
      },
      dermatology: {
        icon: <FaAllergies className="w-6 h-6 text-white" />,
        bgColor: "bg-teal-500",
        description: "Skin, hair, and nail care",
      },
      "general medicine": {
        icon: <FaStethoscope className="w-6 h-6 text-white" />,
        bgColor: "bg-amber-600",
        description: "Primary healthcare services",
      },
      ophthalmology: {
        icon: <FaEye className="w-6 h-6 text-white" />,
        bgColor: "bg-sky-500",
        description: "Eye care and vision",
      },
      pulmonology: {
        icon: <FaLungs className="w-6 h-6 text-white" />,
        bgColor: "bg-cyan-500",
        description: "Lung and respiratory care",
      },
      dentistry: {
        icon: <FaTooth className="w-6 h-6 text-white" />,
        bgColor: "bg-emerald-500",
        description: "Dental and oral health",
      },
      nephrology: {
        icon: <GiKidneys className="w-6 h-6 text-white" />,
        bgColor: "bg-rose-500",
        description: "Kidney care specialists",
      },
      gastroenterology: {
        icon: <GiStomach className="w-6 h-6 text-white" />,
        bgColor: "bg-yellow-500",
        description: "Digestive system care",
      },
    };

    return (
      departmentMap[deptLower] || {
        icon: <FaUserMd className="w-6 h-6 text-white" />,
        bgColor: "bg-stone-500",
        description: "Specialized medical care",
      }
    );
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/departments");
      setDepartments(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDoctors = departments.reduce(
    (sum, dept) => sum + (dept.totalDoctors || 0),
    0
  );
  const totalPatients = departments.reduce(
    (sum, dept) => sum + (dept.totalPatients || 0),
    0
  );
  const totalAppointments = departments.reduce(
    (sum, dept) => sum + (dept.totalAppointments || 0),
    0
  );

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mt-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
              <FaBuilding className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                Departments Management
              </h1>
              <p className="text-stone-400 font-medium tracking-wide">
                Manage hospital departments and specializations
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col justify-between hover:border-amber-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Departments</p>
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
                <FaBuilding className="text-amber-500 text-xl" />
              </div>
            </div>
            <p className="text-4xl font-black tracking-tight text-amber-700">
               {loading ? <span className="animate-pulse bg-stone-200 text-transparent rounded">--</span> : departments.length}
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col justify-between hover:border-amber-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Total Doctors</p>
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
                <FaUserMd className="text-amber-500 text-xl" />
              </div>
            </div>
            <p className="text-4xl font-black tracking-tight text-amber-700">
              {loading ? <span className="animate-pulse bg-stone-200 text-transparent rounded">---</span> : totalDoctors}
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col justify-between hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Total Patients</p>
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                <FaUsers className="text-emerald-500 text-xl" />
              </div>
            </div>
            <p className="text-4xl font-black tracking-tight text-emerald-700">
              {loading ? <span className="animate-pulse bg-stone-200 text-transparent rounded">---</span> : totalPatients}
            </p>
          </div>
          
          <div className="bg-stone-900 rounded-3xl shadow-md border border-stone-800 p-6 flex flex-col justify-between relative overflow-hidden group hover:bg-stone-950 transition-colors">
            <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
               <FaCalendarAlt className="w-32 h-32 text-white" />
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <p className="text-sm font-bold text-stone-400 uppercase tracking-wider">Appointments</p>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                <FaCalendarAlt className="text-white text-xl" />
              </div>
            </div>
            <p className="text-4xl font-black tracking-tight text-white relative z-10">
               {loading ? <span className="animate-pulse bg-stone-700 text-transparent rounded">---</span> : totalAppointments}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-2 max-w-2xl">
           <div className="pl-4 text-stone-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
           </div>
           <input 
              type="text"
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-stone-900 placeholder:text-stone-400 font-medium py-3"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>

        {/* Departments Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-stone-50/50 rounded-3xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-stone-900"></div>
          </div>
        ) : filteredDepartments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((department) => {
              const deptInfo = getDepartmentInfo(department.name);
              return (
                <div
                  key={department.name}
                  className="bg-white rounded-3xl shadow-sm border border-stone-200 hover:shadow-lg hover:border-emerald-500/30 transition-all flex flex-col h-full overflow-hidden"
                >
                  <div className="p-7 flex flex-col h-full">
                    <div className="flex items-start space-x-5 mb-6">
                      <div
                        className={`w-16 h-16 ${deptInfo.bgColor} rounded-2xl flex items-center justify-center shadow-md transform hover:scale-105 transition-transform`}
                      >
                        {deptInfo.icon}
                      </div>
                      <div className="flex-1 mt-1">
                        <h3 className="text-xl font-bold text-stone-900 tracking-tight leading-tight">
                          {department.name}
                        </h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mt-2">
                          {deptInfo.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 py-5 border-t border-b border-stone-100 flex-grow">
                      <div className="bg-stone-50 rounded-2xl p-3 text-center border border-stone-100/50 flex flex-col justify-center">
                        <p className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-1">Docs</p>
                        <p className="text-2xl font-black text-stone-900 leading-none">
                          {department.totalDoctors || 0}
                        </p>
                      </div>
                      <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-100/50 flex flex-col justify-center">
                        <p className="text-sm font-bold uppercase tracking-wider text-emerald-700 mb-1">Patients</p>
                        <p className="text-2xl font-black text-emerald-700 leading-none">
                          {department.totalPatients || 0}
                        </p>
                      </div>
                      <div className="bg-stone-50 rounded-2xl p-3 text-center border border-stone-100/50 flex flex-col justify-center">
                        <p className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-1">Appts</p>
                        <p className="text-2xl font-black text-stone-900 leading-none">
                          {department.totalAppointments || 0}
                        </p>
                      </div>
                    </div>

                    {/* Doctors List */}
                    {department.doctors && department.doctors.length > 0 && (
                      <div className="mt-5 pt-1">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          Featured Specialists 
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {department.doctors.slice(0, 3).map((doctor, idx) => (
                            <span
                              key={idx}
                              className="text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 truncate max-w-[120px]"
                              title={doctor.name}
                            >
                              {doctor.name}
                            </span>
                          ))}
                          {department.doctors.length > 3 && (
                            <span className="text-xs font-bold text-stone-500 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
                              +{department.doctors.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[2rem] shadow-sm border border-stone-200">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBuilding className="text-4xl text-stone-300" />
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-2">No Departments Found</h2>
            <p className="text-stone-500 font-medium">
              {searchTerm
                ? "Try a different search term"
                : "Departments will appear when doctors are registered"}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Departments;
