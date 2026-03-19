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
  FaFemale,
  FaRadiation,
  FaXRay,
  FaArrowLeft,
  FaCheck,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaHeart,
  FaPills,
} from "react-icons/fa";
import Button from "../common/Button";
import Input from "../common/Input";
import StatusBadge from "../dashboard/StatusBadge";
import { formatName } from "../../utils/formatters";
import api from "../../services/api";

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
    const deptLower = dept.toLowerCase();
    const departmentMap = {
      cardiology: {
        icon: <FaHeartbeat className="w-7 h-7 text-white" />,
        bgColor: "bg-red-500",
        description: "Heart and cardiovascular care",
      },
      neurology: {
        icon: <FaBrain className="w-7 h-7 text-white" />,
        bgColor: "bg-purple-600",
        description: "Brain and nervous system",
      },
      orthopedics: {
        icon: <FaBone className="w-7 h-7 text-white" />,
        bgColor: "bg-amber-600",
        description: "Bones, joints, and muscles",
      },
      pediatrics: {
        icon: <FaBaby className="w-7 h-7 text-white" />,
        bgColor: "bg-pink-500",
        description: "Child healthcare specialists",
      },
      dermatology: {
        icon: <FaAllergies className="w-7 h-7 text-white" />,
        bgColor: "bg-teal-500",
        description: "Skin, hair, and nail care",
      },
      "general medicine": {
        icon: <FaStethoscope className="w-7 h-7 text-white" />,
        bgColor: "bg-amber-600",
        description: "Primary healthcare services",
      },
      ophthalmology: {
        icon: <FaEye className="w-7 h-7 text-white" />,
        bgColor: "bg-sky-500",
        description: "Eye care and vision",
      },
      pulmonology: {
        icon: <FaLungs className="w-7 h-7 text-white" />,
        bgColor: "bg-cyan-500",
        description: "Lung and respiratory care",
      },
      dentistry: {
        icon: <FaTooth className="w-7 h-7 text-white" />,
        bgColor: "bg-emerald-500",
        description: "Dental and oral health",
      },
      nephrology: {
        icon: <FaHeart className="w-7 h-7 text-white" />,
        bgColor: "bg-rose-500",
        description: "Kidney care specialists",
      },
      gastroenterology: {
        icon: <FaPills className="w-7 h-7 text-white" />,
        bgColor: "bg-yellow-500",
        description: "Digestive system care",
      },
      endocrinology: {
        icon: <FaStethoscope className="w-7 h-7 text-white" />,
        bgColor: "bg-violet-500",
        description: "Hormones and metabolism",
      },
      gynecology: {
        icon: <FaFemale className="w-7 h-7 text-white" />,
        bgColor: "bg-pink-500",
        description: "Women's health specialists",
      },
      oncology: {
        icon: <FaRadiation className="w-7 h-7 text-white" />,
        bgColor: "bg-orange-500",
        description: "Cancer treatment and care",
      },
      psychiatry: {
        icon: <FaBrain className="w-7 h-7 text-white" />,
        bgColor: "bg-indigo-500",
        description: "Mental health specialists",
      },
      radiology: {
        icon: <FaXRay className="w-7 h-7 text-white" />,
        bgColor: "bg-gray-500",
        description: "Medical imaging and diagnostics",
      },
      urology: {
        icon: <FaUserMd className="w-7 h-7 text-white" />,
        bgColor: "bg-amber-700",
        description: "Urinary tract specialists",
      },
    };

    return (
      departmentMap[deptLower] || {
        icon: <FaUserMd className="w-7 h-7 text-white" />,
        bgColor: "bg-gray-500",
        description: "Specialized medical care",
      }
    );
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
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-amber-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Book Appointment</h2>
              <p className="text-blue-100 text-sm mt-1">
                {step === 1 && "Select a department to get started"}
                {step === 2 && "Choose your preferred doctor"}
                {step === 3 && "Pick a convenient date and time"}
                {step === 4 && "Review and confirm your appointment"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 ${
                      step > item.num
                        ? "bg-white text-blue-600 border-white"
                        : step === item.num
                        ? "bg-white text-blue-600 border-white"
                        : "bg-transparent text-blue-200 border-blue-300"
                    }`}
                  >
                    {step > item.num ? (
                      <FaCheck className="w-5 h-5" />
                    ) : (
                      item.num
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      step >= item.num ? "text-white" : "text-blue-200"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded ${
                      step > item.num ? "bg-white" : "bg-blue-400"
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
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Department
              </h3>
              {departmentsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="mt-3 text-gray-600">Loading departments...</p>
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
                        className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                      >
                        <div
                          className={`w-14 h-14 ${deptInfo.bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}
                        >
                          {deptInfo.icon}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {deptName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {deptInfo.description}
                        </p>
                        {dept.doctorCount !== undefined && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {dept.doctorCount}{" "}
                              {dept.doctorCount === 1 ? "Doctor" : "Doctors"}
                            </span>
                            {dept.availableDoctors > 0 && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
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
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUserMd className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    No departments available
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Please check back later
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Doctor */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Select Doctor - {selectedDepartment}
                </h3>
                <Button onClick={handleBack} variant="outline" size="sm">
                  <FaArrowLeft className="mr-2" /> Back
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="mt-3 text-gray-600">Loading doctors...</p>
                </div>
              ) : doctors.length > 0 ? (
                <div className="space-y-4">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor._id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className="w-full p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:shadow-xl transition-shadow">
                            {doctor.firstName?.charAt(0)}
                            {doctor.lastName?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              Dr. {formatName(doctor)}
                            </h4>
                            <p className="text-gray-600">
                              {doctor.specialization}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <FaCalendarAlt className="text-blue-500" />
                                {doctor.experience} years exp
                              </span>
                            </div>
                            <div className="mt-2">
                              {doctor.isAvailable ? (
                                <StatusBadge status="available" type="doctor" />
                              ) : (
                                <StatusBadge status="away" type="doctor" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                            <p className="text-xs text-green-600 font-medium">
                              Consultation Fee
                            </p>
                            <p className="text-xl font-bold text-green-700">
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
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUserMd className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    No doctors available
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Try selecting a different department
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Date & Time
              </h3>

              {/* Selected Doctor Info */}
              <div className="bg-stone-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {selectedDoctor?.firstName?.charAt(0)}
                    {selectedDoctor?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Dr. {selectedDoctor && formatName(selectedDoctor)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedDepartment}
                    </p>
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Fee: ₹{selectedDoctor?.consultationFee || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Date & Time */}
                <div className="space-y-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <FaCalendarAlt className="text-blue-500" />
                      Select Date
                    </label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateSelect(e.target.value)}
                      min={minDate}
                    />
                  </div>

                  {selectedDate && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FaClock className="text-blue-500" />
                        Select Time Slot
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-2.5 border-2 rounded-lg text-sm font-medium transition-all ${
                              selectedTime === time
                                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                                : "border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Type
                    </label>
                    <select
                      value={appointmentType}
                      onChange={(e) => setAppointmentType(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="new">New Consultation</option>
                      <option value="follow-up">Follow-up Visit</option>
                    </select>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Visit <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Please describe your symptoms or reason for the visit..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symptoms (comma separated)
                    </label>
                    <Input
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="e.g., headache, fever, cough"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional - helps the doctor prepare
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button onClick={handleBack} variant="outline">
                  Back
                </Button>
                <Button
                  onClick={handleContinueToConfirm}
                  disabled={!selectedDate || !selectedTime || !reason.trim()}
                >
                  Continue to Confirm
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Your Appointment
              </h3>

              <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden">
                {/* Doctor Card */}
                <div className="bg-amber-600 p-5 text-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {selectedDoctor?.firstName?.charAt(0)}
                      {selectedDoctor?.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">
                        Dr. {selectedDoctor && formatName(selectedDoctor)}
                      </h4>
                      <p className="text-blue-100">{selectedDepartment}</p>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaCalendarAlt className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-semibold text-gray-900">
                          {selectedDate &&
                            new Date(selectedDate).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <FaClock className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-semibold text-gray-900">
                          {selectedTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FaMoneyBillWave className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Consultation Fee</p>
                      <p className="font-semibold text-green-700 text-lg">
                        ₹{selectedDoctor?.consultationFee || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">
                          Appointment Type
                        </p>
                        <p className="font-medium text-gray-900 capitalize">
                          {appointmentType === "new"
                            ? "New Consultation"
                            : "Follow-up Visit"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Reason for Visit
                        </p>
                        <p className="font-medium text-gray-900">{reason}</p>
                      </div>
                      {symptoms && (
                        <div>
                          <p className="text-xs text-gray-500">Symptoms</p>
                          <p className="font-medium text-gray-900">
                            {symptoms}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> By confirming, you agree to attend
                  the appointment at the scheduled time. Please arrive 10
                  minutes early. Cancellation should be done at least 24 hours
                  in advance.
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button onClick={handleSubmitAppointment} disabled={loading}>
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
