import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/common/Toast";
import api from "../../services/api";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const { toasts, toast, removeToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [personalData, setPersonalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [professionalData, setProfessionalData] = useState({
    specialization: "",
    licenseNumber: "",
    experience: "",
    consultationFee: "",
  });

  const [availabilityData, setAvailabilityData] = useState([]);
  const [qualifications, setQualifications] = useState([]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setPersonalData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });

      setProfessionalData({
        specialization: user.specialization || "",
        licenseNumber: user.licenseNumber || "",
        experience: user.experience || "",
        consultationFee: user.consultationFee || "",
      });

      setAvailabilityData(user.availableSlots || []);
      setQualifications(user.qualifications || []);
    }
  }, [user]);

  const handleUpdatePersonal = async () => {
    try {
      setLoading(true);
      await api.patch("/doctor/profile/personal", personalData);
      toast.success("Personal information updated successfully!");
      setIsEditingPersonal(false);
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfessional = async () => {
    try {
      setLoading(true);
      await api.patch("/doctor/profile/professional", professionalData);
      toast.success("Professional information updated successfully!");
      setIsEditingProfessional(false);
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvailability = async () => {
    try {
      setLoading(true);
      await api.patch("/doctor/profile/availability", {
        availableSlots: availabilityData,
      });
      toast.success("Availability updated successfully!");
      setIsEditingAvailability(false);
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || "Failed to update availability"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      await api.post("/doctor/profile/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-7">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-stone-900">
                Dr. {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-stone-600">{user?.specialization}</p>
              <p className="text-sm text-stone-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200">
          <div className="p-6 border-b border-stone-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-stone-900">
                Personal Information
              </h3>
              {!isEditingPersonal && (
                <Button
                  onClick={() => setIsEditingPersonal(true)}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          <div className="p-6">
            {isEditingPersonal ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={personalData.firstName}
                    onChange={(e) =>
                      setPersonalData({
                        ...personalData,
                        firstName: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Last Name"
                    value={personalData.lastName}
                    onChange={(e) =>
                      setPersonalData({
                        ...personalData,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  value={personalData.email}
                  onChange={(e) =>
                    setPersonalData({ ...personalData, email: e.target.value })
                  }
                />

                <Input
                  label="Phone"
                  type="tel"
                  value={personalData.phone}
                  onChange={(e) =>
                    setPersonalData({ ...personalData, phone: e.target.value })
                  }
                />

                <div className="flex space-x-3 pt-4">
                  <Button onClick={handleUpdatePersonal} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    onClick={() => setIsEditingPersonal(false)}
                    variant="outline"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-stone-600">First Name</p>
                  <p className="font-medium text-stone-900">{user?.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-600">Last Name</p>
                  <p className="font-medium text-stone-900">{user?.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-600">Email</p>
                  <p className="font-medium text-stone-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-600">Phone</p>
                  <p className="font-medium text-stone-900">{user?.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200">
          <div className="p-6 border-b border-stone-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-stone-900">
                Professional Information
              </h3>
              {!isEditingProfessional && (
                <Button
                  onClick={() => setIsEditingProfessional(true)}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          <div className="p-6">
            {isEditingProfessional ? (
              <div className="space-y-4">
                <Input
                  label="Specialization"
                  value={professionalData.specialization}
                  onChange={(e) =>
                    setProfessionalData({
                      ...professionalData,
                      specialization: e.target.value,
                    })
                  }
                />

                <Input
                  label="License Number"
                  value={professionalData.licenseNumber}
                  onChange={(e) =>
                    setProfessionalData({
                      ...professionalData,
                      licenseNumber: e.target.value,
                    })
                  }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Years of Experience"
                    type="number"
                    value={professionalData.experience}
                    onChange={(e) =>
                      setProfessionalData({
                        ...professionalData,
                        experience: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Consultation Fee (₹)"
                    type="number"
                    value={professionalData.consultationFee}
                    onChange={(e) =>
                      setProfessionalData({
                        ...professionalData,
                        consultationFee: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button onClick={handleUpdateProfessional} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    onClick={() => setIsEditingProfessional(false)}
                    variant="outline"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-stone-600">Specialization</p>
                  <p className="font-medium text-stone-900">
                    {user?.specialization}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-600">License Number</p>
                  <p className="font-medium text-stone-900">
                    {user?.licenseNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-600">Experience</p>
                  <p className="font-medium text-stone-900">
                    {user?.experience} years
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-600">Consultation Fee</p>
                  <p className="font-medium text-stone-900">
                    ₹{user?.consultationFee}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Qualifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200">
          <div className="p-6 border-b border-stone-200">
            <h3 className="text-lg font-semibold text-stone-900">
              Qualifications
            </h3>
          </div>

          <div className="p-6">
            {qualifications.length > 0 ? (
              <div className="space-y-4">
                {qualifications.map((qual, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-green-500 pl-4 py-2"
                  >
                    <h4 className="font-medium text-stone-900">{qual.degree}</h4>
                    <p className="text-sm text-stone-600">{qual.institution}</p>
                    <p className="text-sm text-stone-500">Year: {qual.year}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 text-center py-8">
                No qualifications added
              </p>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200">
          <div className="p-6 border-b border-stone-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-stone-900">
                Weekly Availability
              </h3>
              {!isEditingAvailability && (
                <Button
                  onClick={() => setIsEditingAvailability(true)}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          <div className="p-6">
            {availabilityData.length > 0 ? (
              <div className="space-y-3">
                {daysOfWeek.map((day) => {
                  const daySlot = availabilityData.find(
                    (slot) => slot.day === day
                  );
                  return (
                    <div
                      key={day}
                      className="flex items-center justify-between py-2 border-b border-stone-100"
                    >
                      <span className="font-medium text-stone-900 capitalize w-32">
                        {day}
                      </span>
                      {daySlot ? (
                        <span className="text-stone-600">
                          {daySlot.startTime} - {daySlot.endTime}
                        </span>
                      ) : (
                        <span className="text-stone-400">Not available</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-stone-500 text-center py-8">
                No availability set
              </p>
            )}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200">
          <div className="p-6 border-b border-stone-200">
            <h3 className="text-lg font-semibold text-stone-900">Security</h3>
          </div>

          <div className="p-6">
            <Button
              onClick={() => setIsChangingPassword(true)}
              variant="outline"
            >
              Change Password
            </Button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isChangingPassword}
        onClose={() => setIsChangingPassword(false)}
        title="Change Password"
        size="medium"
      >
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                currentPassword: e.target.value,
              })
            }
          />

          <Input
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, newPassword: e.target.value })
            }
            helperText="Must be at least 8 characters long"
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value,
              })
            }
          />

          <div className="flex space-x-3 pt-4">
            <Button onClick={handleChangePassword} disabled={loading}>
              {loading ? "Changing..." : "Change Password"}
            </Button>
            <Button
              onClick={() => setIsChangingPassword(false)}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Profile;
