import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/common/Toast";
import {
  FaCog,
  FaHospital,
  FaCalendarAlt,
  FaBell,
  FaServer,
  FaDatabase,
  FaBroom,
  FaSave,
  FaShieldAlt,
} from "react-icons/fa";

const Settings = () => {
  const { toasts, toast, removeToast } = useToast();

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    hospitalName: "City Medical Center",
    hospitalEmail: "contact@citymedical.com",
    hospitalPhone: "+1-800-MEDICAL",
    address: "123 Healthcare Avenue",
    city: "New York",
    state: "NY",
    zipCode: "10001",
  });

  // Appointment Settings State
  const [appointmentSettings, setAppointmentSettings] = useState({
    slotDuration: 30, // minutes
    advanceBookingDays: 30,
    cancellationHours: 24,
    maxAppointmentsPerDay: 20,
    workingHoursStart: "09:00",
    workingHoursEnd: "17:00",
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    reminderHoursBefore: 24,
    doctorApprovalNotification: true,
    appointmentCancellationNotification: true,
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 5,
  });

  const handleGeneralSettingsChange = (e) => {
    setGeneralSettings({
      ...generalSettings,
      [e.target.name]: e.target.value,
    });
  };

  const handleAppointmentSettingsChange = (e) => {
    const value =
      e.target.type === "number" ? parseInt(e.target.value) : e.target.value;
    setAppointmentSettings({
      ...appointmentSettings,
      [e.target.name]: value,
    });
  };

  const handleNotificationSettingsChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setNotificationSettings({
      ...notificationSettings,
      [e.target.name]: value,
    });
  };

  const handleSystemSettingsChange = (e) => {
    const value =
      e.target.type === "checkbox"
        ? e.target.checked
        : e.target.type === "number"
        ? parseInt(e.target.value)
        : e.target.value;
    setSystemSettings({
      ...systemSettings,
      [e.target.name]: value,
    });
  };

  const handleSaveGeneralSettings = async () => {
    try {
      // API call to save general settings
      toast.success("General settings saved successfully");
    } catch (error) {
      toast.error("Failed to save general settings");
    }
  };

  const handleSaveAppointmentSettings = async () => {
    try {
      // API call to save appointment settings
      toast.success("Appointment settings saved successfully");
    } catch (error) {
      toast.error("Failed to save appointment settings");
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      // API call to save notification settings
      toast.success("Notification settings saved successfully");
    } catch (error) {
      toast.error("Failed to save notification settings");
    }
  };

  const handleSaveSystemSettings = async () => {
    try {
      // API call to save system settings
      toast.success("System settings saved successfully");
    } catch (error) {
      toast.error("Failed to save system settings");
    }
  };

  const handleBackupDatabase = () => {
    toast.success("Database backup initiated");
  };

  const handleClearCache = () => {
    toast.success("Cache cleared successfully");
  };

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mt-2 mb-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
              <FaCog className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                System Settings
              </h1>
              <p className="text-stone-400 font-medium tracking-wide">
                Configure hospital management system core settings
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          <div className="space-y-8">
             {/* General Settings */}
             <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 border-b border-stone-200 px-8 py-5 flex items-center gap-3">
                   <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <FaHospital className="text-lg" />
                   </div>
                   <h2 className="text-lg font-bold text-stone-900">
                   General Settings
                   </h2>
                </div>
                <div className="p-8">
                   <div className="space-y-5">
                      <Input
                         label="Hospital Name"
                         name="hospitalName"
                         value={generalSettings.hospitalName}
                         onChange={handleGeneralSettingsChange}
                         className="bg-stone-50/50"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <Input
                         label="Hospital Email"
                         type="email"
                         name="hospitalEmail"
                         value={generalSettings.hospitalEmail}
                         onChange={handleGeneralSettingsChange}
                         className="bg-stone-50/50"
                         />
                         <Input
                         label="Hospital Phone"
                         name="hospitalPhone"
                         value={generalSettings.hospitalPhone}
                         onChange={handleGeneralSettingsChange}
                         className="bg-stone-50/50"
                         />
                      </div>
                      <Input
                         label="Address"
                         name="address"
                         value={generalSettings.address}
                         onChange={handleGeneralSettingsChange}
                         className="bg-stone-50/50"
                      />
                      <div className="grid grid-cols-3 gap-5">
                         <div className="col-span-1">
                            <Input
                               label="City"
                               name="city"
                               value={generalSettings.city}
                               onChange={handleGeneralSettingsChange}
                               className="bg-stone-50/50"
                            />
                         </div>
                         <div className="col-span-1">
                            <Input
                               label="State"
                               name="state"
                               value={generalSettings.state}
                               onChange={handleGeneralSettingsChange}
                               className="bg-stone-50/50"
                            />
                         </div>
                         <div className="col-span-1">
                            <Input
                               label="ZIP Code"
                               name="zipCode"
                               value={generalSettings.zipCode}
                               onChange={handleGeneralSettingsChange}
                               className="bg-stone-50/50"
                            />
                         </div>
                      </div>
                   </div>
                   <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end">
                      <button
                         onClick={handleSaveGeneralSettings}
                         className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-sm transition-colors"
                      >
                         <FaSave /> Save Changes
                      </button>
                   </div>
                </div>
             </div>

             {/* System Settings */}
             <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 border-b border-stone-200 px-8 py-5 flex items-center gap-3">
                   <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                      <FaShieldAlt className="text-lg" />
                   </div>
                   <h2 className="text-lg font-bold text-stone-900">
                   Security & Access
                   </h2>
                </div>
                <div className="p-8 space-y-6">
                   <div className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div>
                         <p className="font-bold text-stone-900 mb-0.5">Maintenance Mode</p>
                         <p className="text-xs font-semibold text-stone-500">Temporarily block access for non-admins</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" name="maintenanceMode" checked={systemSettings.maintenanceMode} onChange={handleSystemSettingsChange} className="sr-only peer" />
                         <div className="w-12 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                      </label>
                   </div>
                   <div className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div>
                         <p className="font-bold text-stone-900 mb-0.5">Allow Registration</p>
                         <p className="text-xs font-semibold text-stone-500">Allow new users to sign up securely</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" name="allowRegistration" checked={systemSettings.allowRegistration} onChange={handleSystemSettingsChange} className="sr-only peer" />
                         <div className="w-12 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                   </div>
                   <div className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div>
                         <p className="font-bold text-stone-900 mb-0.5">Require Email Verification</p>
                         <p className="text-xs font-semibold text-stone-500">Users must verify before logging in</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" name="requireEmailVerification" checked={systemSettings.requireEmailVerification} onChange={handleSystemSettingsChange} className="sr-only peer" />
                         <div className="w-12 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                   </div>

                   <div className="grid grid-cols-2 gap-5 mt-4">
                      <Input label="Session Timeout (min)" type="number" name="sessionTimeout" value={systemSettings.sessionTimeout} onChange={handleSystemSettingsChange} className="bg-stone-50/50" />
                      <Input label="Max Login Attempts" type="number" name="maxLoginAttempts" value={systemSettings.maxLoginAttempts} onChange={handleSystemSettingsChange} className="bg-stone-50/50" />
                   </div>

                   <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end">
                      <button onClick={handleSaveSystemSettings} className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-sm transition-colors">
                         <FaSave /> Save Security
                      </button>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-8">
             {/* Appointment Settings */}
             <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 border-b border-stone-200 px-8 py-5 flex items-center gap-3">
                   <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                      <FaCalendarAlt className="text-lg" />
                   </div>
                   <h2 className="text-lg font-bold text-stone-900">
                   Appointments Default Config
                   </h2>
                </div>
                <div className="p-8">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input label="Slot Duration (min)" type="number" name="slotDuration" value={appointmentSettings.slotDuration} onChange={handleAppointmentSettingsChange} className="bg-stone-50/50" />
                      <Input label="Adv. Booking Days" type="number" name="advanceBookingDays" value={appointmentSettings.advanceBookingDays} onChange={handleAppointmentSettingsChange} className="bg-stone-50/50" />
                      <Input label="Cancel Notice (hrs)" type="number" name="cancellationHours" value={appointmentSettings.cancellationHours} onChange={handleAppointmentSettingsChange} className="bg-stone-50/50" />
                      <Input label="Max Appt/Day" type="number" name="maxAppointmentsPerDay" value={appointmentSettings.maxAppointmentsPerDay} onChange={handleAppointmentSettingsChange} className="bg-stone-50/50" />
                      <Input label="Work Hours Start" type="time" name="workingHoursStart" value={appointmentSettings.workingHoursStart} onChange={handleAppointmentSettingsChange} className="bg-stone-50/50" />
                      <Input label="Work Hours End" type="time" name="workingHoursEnd" value={appointmentSettings.workingHoursEnd} onChange={handleAppointmentSettingsChange} className="bg-stone-50/50" />
                   </div>
                   <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end">
                      <button onClick={handleSaveAppointmentSettings} className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-sm transition-colors">
                         <FaSave /> Save Configuration
                      </button>
                   </div>
                </div>
             </div>

             {/* Notification Settings */}
             <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 border-b border-stone-200 px-8 py-5 flex items-center gap-3">
                   <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                      <FaBell className="text-lg" />
                   </div>
                   <h2 className="text-lg font-bold text-stone-900">
                   Alerts & Notifications
                   </h2>
                </div>
                <div className="p-8 space-y-6">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="justify-between items-center p-4 bg-stone-50 rounded-2xl border border-stone-100 flex flex-col sm:flex-row gap-3">
                         <div className="flex-1">
                            <p className="font-bold text-stone-900">Email Alerts</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Global Trigger</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="emailNotifications" checked={notificationSettings.emailNotifications} onChange={handleNotificationSettingsChange} className="sr-only peer" />
                            <div className="w-12 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                         </label>
                      </div>
                      <div className="justify-between items-center p-4 bg-stone-50 rounded-2xl border border-stone-100 flex flex-col sm:flex-row gap-3">
                         <div className="flex-1">
                            <p className="font-bold text-stone-900">SMS Alerts</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Global Trigger</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="smsNotifications" checked={notificationSettings.smsNotifications} onChange={handleNotificationSettingsChange} className="sr-only peer" />
                            <div className="w-12 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                         </label>
                      </div>
                      <div className="col-span-1 sm:col-span-2 justify-between items-center p-4 bg-stone-50 rounded-2xl border border-stone-100 flex gap-3">
                         <div className="flex-1">
                            <p className="font-bold text-stone-900">Appt Reminders</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="appointmentReminders" checked={notificationSettings.appointmentReminders} onChange={handleNotificationSettingsChange} className="sr-only peer" />
                            <div className="w-12 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                         </label>
                      </div>
                   </div>

                   <Input label="Auto-trigger Reminder Hours Before" type="number" name="reminderHoursBefore" value={notificationSettings.reminderHoursBefore} onChange={handleNotificationSettingsChange} className="bg-stone-50/50" />

                   <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <input type="checkbox" name="doctorApprovalNotification" checked={notificationSettings.doctorApprovalNotification} onChange={handleNotificationSettingsChange} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300" />
                         <span className="text-sm font-bold text-stone-700">Notify admins on new doctor registration</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <input type="checkbox" name="appointmentCancellationNotification" checked={notificationSettings.appointmentCancellationNotification} onChange={handleNotificationSettingsChange} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300" />
                         <span className="text-sm font-bold text-stone-700">Notify parties on appointment cancellations</span>
                      </div>
                   </div>

                   <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end">
                      <button onClick={handleSaveNotificationSettings} className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-sm transition-colors">
                         <FaSave /> Save Alerts
                      </button>
                   </div>
                </div>
             </div>
             
             {/* Infrastructure Actions */}
             <div className="bg-stone-900 rounded-[2rem] shadow-sm border border-stone-800 overflow-hidden text-white relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <FaServer className="w-24 h-24" />
                 </div>
                 <div className="p-8 relative z-10 border-b border-stone-800">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                       <FaServer className="text-blue-400" /> Infrastructure Ops
                    </h2>
                 </div>
                 <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={handleBackupDatabase} className="flex flex-col items-center justify-center p-6 bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-2xl transition hover:border-blue-500/50">
                       <FaDatabase className="text-blue-400 text-3xl mb-3" />
                       <span className="font-bold text-sm tracking-widest uppercase">Database Backup</span>
                       <span className="text-xs text-stone-400 mt-1">Snapshot Data</span>
                    </button>
                    <button onClick={handleClearCache} className="flex flex-col items-center justify-center p-6 bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-2xl transition hover:border-orange-500/50">
                       <FaBroom className="text-orange-400 text-3xl mb-3" />
                       <span className="font-bold text-sm tracking-widest uppercase">Clear Sys Cache</span>
                       <span className="text-xs text-stone-400 mt-1">Purge Memory</span>
                    </button>
                 </div>
             </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
