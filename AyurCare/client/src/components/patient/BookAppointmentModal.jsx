import { useState, useEffect } from "react";
import {
  FaHeartbeat,
  FaBrain,
  FaBaby,
  FaEye,
  FaUserMd,
  FaArrowLeft,
  FaCheck,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaHeart,
  FaLeaf,
  FaSeedling,
  FaShieldAlt,
  FaCut,
} from "react-icons/fa";
import { FaSpa } from "react-icons/fa6";
import Button from "../common/Button";
import Input from "../common/Input";
import StatusBadge from "../dashboard/StatusBadge";
import { formatName } from "../../utils/formatters";
import { getSpecializationLabel, getSpecializationInfo } from "../../utils/specializations";
import api from "../../services/api";

// Map icon name strings to actual React icon components
const ICON_MAP = {
  FaHeartbeat, FaBrain, FaBaby, FaEye, FaUserMd,
  FaLeaf, FaHeart, FaSeedling, FaShieldAlt, FaCut, FaSpa,
};

const BookAppointmentModal = ({ isOpen, onClose, onSuccess, toast }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("new");
  const [reason, setReason] = useState("");
  const [symptoms, setSymptoms] = useState("");

  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const response = await api.get("/patient/departments");
      setDepartments(response.data.data || []);
    } catch {
      toast?.error("Failed to load departments");
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedDepartment("");
      setSelectedDoctor(null);
      setSelectedDate("");
      setSelectedTime("");
      setAppointmentType("new");
      setReason("");
      setSymptoms("");
      fetchDepartments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const getDepartmentInfo = (dept) => {
    const info = getSpecializationInfo(dept);
    const IconComponent = ICON_MAP[info.iconName] || FaUserMd;
    return {
      icon: <IconComponent className="w-7 h-7 text-white" />,
      bgColor: info.bgColor,
      description: info.description,
      displayName: info.displayName,
    };
  };

  const fetchDoctorsByDepartment = async (department) => {
    try {
      setLoading(true);
      const response = await api.get("/patient/doctors", {
        params: { specialization: department },
      });
      setDoctors(response.data.data || []);
    } catch {
      toast?.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentSelect = (dept) => {
    setSelectedDepartment(dept);
    fetchDoctorsByDepartment(dept);
    setStep(2);
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(3);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 2) {
        setSelectedDoctor(null);
        setDoctors([]);
      } else if (step === 3) {
        setSelectedDate("");
        setSelectedTime("");
      }
    }
  };

  const handleContinueToConfirm = () => {
    if (!selectedTime) {
      toast?.error("Please select a time slot");
      return;
    }
    if (!reason.trim()) {
      toast?.error("Please provide a reason for visit");
      return;
    }
    setStep(4);
  };

  const handleSubmitAppointment = async () => {
    try {
      setLoading(true);
      const appointmentData = {
        doctorId: selectedDoctor._id,
        date: `${selectedDate}T${selectedTime}`,
        type: appointmentType,
        reason: reason.trim(),
        symptoms: symptoms
          .trim()
          .split(",")
          .filter((s) => s.trim()),
        department: selectedDepartment,
      };

      await api.post("/patient/appointments", appointmentData);
      toast?.success("Appointment booked successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast?.error(
        error.response?.data?.error?.message || "Failed to book appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date as minimum selectable date
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const minDate = getMinDate();

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-stone-950/50 border-b border-stone-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Book Appointment</h2>
              <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">
                {step === 1 && "Select a department to get started"}
                {step === 2 && "Choose your preferred doctor"}
                {step === 3 && "Pick a convenient date and time"}
                {step === 4 && "Review and confirm your appointment"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-300 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {[
              { num: 1, label: "Department" },
              { num: 2, label: "Doctor" },
              { num: 3, label: "Date & Time" },
              { num: 4, label: "Confirm" },
            ].map((item, index) => (
              <div key={item.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 border ${
                      step > item.num
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        : step === item.num
                        ? "bg-stone-800 text-white border-stone-600 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                        : "bg-stone-900 border-stone-800 text-stone-600"
                    }`}
                  >
                    {step > item.num ? (
                      <FaCheck className="w-4 h-4" />
                    ) : (
                      item.num
                    )}
                  </div>
                  <span
                    className={`text-[10px] uppercase font-black tracking-widest mt-2 transition-colors ${
                      step >= item.num ? "text-stone-300" : "text-stone-600"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded-full transition-all duration-300 ${
                      step > item.num ? "bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-stone-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Step 1: Select Department */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6">
                Select Department
              </h3>
              {departmentsLoading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                  <p className="mt-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Loading departments...</p>
                </div>
              ) : departments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept) => {
                    const deptName = dept.name || dept;
                    const deptInfo = getDepartmentInfo(deptName);
                    return (
                      <button
                        key={deptName}
                        onClick={() => handleDepartmentSelect(deptName)}
                        className="p-5 border border-stone-800 bg-stone-900/50 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 text-left group shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                      >
                        <div
                          className={`w-12 h-12 ${deptInfo.bgColor} rounded-xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 shadow-lg`}
                        >
                          {deptInfo.icon}
                        </div>
                        <h3 className="font-bold text-white text-lg transition-colors group-hover:text-emerald-400">
                          {deptInfo.displayName || deptName}
                        </h3>
                        <p className="text-xs text-stone-400 mt-2 leading-relaxed line-clamp-2">
                          {deptInfo.description}
                        </p>
                        {dept.doctorCount !== undefined && (
                          <div className="mt-4 flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-stone-800 text-stone-300 border border-stone-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                              {dept.doctorCount}{" "}
                              {dept.doctorCount === 1 ? "Doctor" : "Doctors"}
                            </span>
                            {dept.availableDoctors > 0 && (
                              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div>
                                {dept.availableDoctors} Available
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-stone-900/50 border border-stone-800 rounded-2xl">
                  <div className="w-16 h-16 bg-stone-800 border border-stone-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <FaUserMd className="w-6 h-6 text-stone-500" />
                  </div>
                  <p className="text-white font-bold text-sm">
                    No departments available
                  </p>
                  <p className="text-stone-500 text-xs mt-1 font-medium">
                    Please check back later
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Doctor */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                    Select Practitioner
                  </h3>
                  <p className="text-white font-bold text-sm mt-1">{selectedDepartment}</p>
                </div>
                <Button onClick={handleBack} variant="outline" size="sm">
                  <FaArrowLeft className="mr-2" /> Back
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                  <p className="mt-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Loading practitioners...</p>
                </div>
              ) : doctors.length > 0 ? (
                <div className="space-y-4">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor._id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className="w-full p-5 border border-stone-800 bg-stone-900/50 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 text-left group shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-14 h-14 bg-stone-800 border border-stone-700 rounded-xl flex items-center justify-center text-emerald-400 text-sm font-black uppercase tracking-widest shadow-inner group-hover:border-emerald-500/30 transition-colors">
                            {doctor.firstName?.charAt(0)}
                            {doctor.lastName?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">
                              Dr. {formatName(doctor)}
                            </h4>
                            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">
                              {getSpecializationLabel(doctor.specialization)}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-stone-400 font-medium">
                              <span className="flex items-center gap-1.5">
                                <FaCalendarAlt className="text-stone-500" />
                                {doctor.experience} Years Exp
                              </span>
                            </div>
                            <div className="mt-3">
                              {doctor.isAvailable ? (
                                <StatusBadge status="available" type="doctor" />
                              ) : (
                                <StatusBadge status="away" type="doctor" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 shadow-inner">
                            <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest mb-1">
                              Consultation Fee
                            </p>
                            <p className="text-lg font-black text-emerald-400">
                              {doctor.consultationFee
                                ? `₹${doctor.consultationFee}`
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-stone-900/50 border border-stone-800 rounded-2xl">
                  <div className="w-16 h-16 bg-stone-800 border border-stone-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <FaUserMd className="w-6 h-6 text-stone-500" />
                  </div>
                  <p className="text-white font-bold text-sm">
                    No practitioners available
                  </p>
                  <p className="text-stone-500 text-xs mt-1 font-medium">
                    Try selecting a different department
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6">
                Select Date & Time
              </h3>

              {/* Selected Doctor Info */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 mb-8 shadow-inner">
                <div className="flex items-center space-x-5">
                  <div className="w-14 h-14 bg-stone-800 border border-stone-700 rounded-xl flex items-center justify-center text-emerald-400 font-black text-sm uppercase tracking-widest shadow-inner">
                    {selectedDoctor?.firstName?.charAt(0)}
                    {selectedDoctor?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">
                      Dr. {selectedDoctor && formatName(selectedDoctor)}
                    </h4>
                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">
                      {selectedDepartment}
                    </p>
                    <p className="text-sm text-emerald-400 font-black tracking-wide mt-2">
                      Fee: ₹{selectedDoctor?.consultationFee || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Date & Time */}
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">
                      <FaCalendarAlt className="text-stone-500" />
                      Select Date
                    </label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateSelect(e.target.value)}
                      min={minDate}
                      className="w-full bg-stone-900/50 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium custom-datetime"
                    />
                  </div>

                  {selectedDate && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">
                        <FaClock className="text-stone-500" />
                        Select Time Slot
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 border rounded-xl text-xs font-bold transition-all duration-300 ${
                              selectedTime === time
                                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                : "border-stone-800 bg-stone-900/50 hover:border-stone-700 hover:bg-stone-900 text-stone-400"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 mt-6">
                      Appointment Type
                    </label>
                    <select
                      value={appointmentType}
                      onChange={(e) => setAppointmentType(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-900/50 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium appearance-none"
                    >
                      <option value="new">New Consultation</option>
                      <option value="follow-up">Follow-up Visit</option>
                    </select>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">
                      Reason for Visit <span className="text-emerald-500">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-stone-900/50 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium resize-none placeholder-stone-600"
                      placeholder="Please describe your symptoms or reason for the visit..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">
                      Symptoms <span className="text-stone-600 lowercase">(comma separated)</span>
                    </label>
                    <Input
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="e.g., headache, fever, cough"
                      className="w-full bg-stone-900/50 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium placeholder-stone-600"
                    />
                    <p className="text-[9px] font-bold text-stone-600 uppercase tracking-widest mt-2">
                      Optional - helps the doctor prepare
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-4 mt-8 pt-6 border-t border-stone-800">
                <Button onClick={handleBack} variant="outline" className="border-stone-700 text-stone-400 hover:text-white hover:bg-stone-800">
                  Back
                </Button>
                <Button
                  onClick={handleContinueToConfirm}
                  disabled={!selectedDate || !selectedTime || !reason.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:shadow-none"
                >
                  Continue to Confirm
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6">
                Confirm Your Appointment
              </h3>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-inner mb-6">
                {/* Doctor Card */}
                <div className="bg-stone-950/50 border-b border-stone-800 p-6">
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-stone-800 border border-stone-700 rounded-xl flex items-center justify-center text-emerald-400 font-black text-sm uppercase tracking-widest shadow-inner">
                      {selectedDoctor?.firstName?.charAt(0)}
                      {selectedDoctor?.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">
                        Dr. {selectedDoctor && formatName(selectedDoctor)}
                      </h4>
                      <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">{selectedDepartment}</p>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2 p-4 bg-stone-950/30 border border-stone-800 rounded-xl">
                      <div className="flex items-center gap-2 text-[10px] font-black text-stone-500 uppercase tracking-widest">
                        <FaCalendarAlt className="text-stone-600" />
                        Date
                      </div>
                      <p className="font-bold text-white text-sm">
                        {selectedDate &&
                          new Date(selectedDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 p-4 bg-stone-950/30 border border-stone-800 rounded-xl">
                      <div className="flex items-center gap-2 text-[10px] font-black text-stone-500 uppercase tracking-widest">
                        <FaClock className="text-stone-600" />
                        Time
                      </div>
                      <p className="font-bold text-white text-sm">
                        {selectedTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-stone-950/50 border border-stone-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                        <FaMoneyBillWave className="text-emerald-500" />
                      </div>
                      <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Consultation Fee</p>
                    </div>
                    <p className="font-black text-emerald-400 text-lg">
                      ₹{selectedDoctor?.consultationFee || "N/A"}
                    </p>
                  </div>

                  <div className="border-t border-stone-800 pt-6">
                    <div className="space-y-5">
                      <div>
                        <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">
                          Appointment Type
                        </p>
                        <p className="font-bold text-white text-sm capitalize">
                          {appointmentType === "new"
                            ? "New Consultation"
                            : "Follow-up Visit"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">
                          Reason for Visit
                        </p>
                        <p className="font-bold text-white text-sm leading-relaxed">{reason}</p>
                      </div>
                      {symptoms && (
                        <div>
                          <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Symptoms</p>
                          <p className="font-bold text-stone-300 text-sm">{symptoms}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-8">
                <p className="text-xs text-emerald-300/80 leading-relaxed font-medium">
                  <strong className="text-emerald-400">Important:</strong> By confirming, you agree to attend
                  the appointment at the scheduled time. Please arrive 10
                  minutes early. Cancellation should be done at least 24 hours
                  in advance.
                </p>
              </div>

              <div className="flex justify-end items-center gap-4 pt-6 border-t border-stone-800">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  disabled={loading}
                  className="border-stone-700 text-stone-400 hover:text-white hover:bg-stone-800"
                >
                  Back
                </Button>
                <Button onClick={handleSubmitAppointment} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:shadow-none min-w-[200px]">
                  {loading ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Booking...
                    </>
                  ) : (
                    "Confirm Appointment"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
