import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/slices/authSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import api from '../../services/api';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaVenusMars,
  FaMapMarkerAlt,
  FaCity,
  FaMap,
  FaMailBulk,
  FaNotesMedical,
  FaLock,
  FaEdit,
  FaCalendarAlt,
  FaShieldAlt,
} from 'react-icons/fa';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { toasts, toast, removeToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
  });

  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [medicalHistory, setMedicalHistory] = useState([]);

  useEffect(() => {
    if (user) {
      setPersonalData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
      });

      setAddressData({
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
      });

      setMedicalHistory(user.medicalHistory || []);
    }
  }, [user]);

  const handleUpdatePersonal = async () => {
    try {
      setLoading(true);
      const response = await api.patch('/patient/profile/personal', personalData);
      dispatch(updateUser(response.data.data));
      toast.success('Personal information updated successfully!');
      setIsEditingPersonal(false);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    try {
      setLoading(true);
      const response = await api.patch('/patient/profile/address', { address: addressData });
      dispatch(updateUser(response.data.data));
      toast.success('Address updated successfully!');
      setIsEditingAddress(false);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      await api.post('/patient/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header - Enhanced */}
        <div className="bg-stone-800 rounded-2xl shadow-xl p-8 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-3xl font-bold border-2 border-white/30 shadow-lg">
              {user?.firstName?.charAt(0)?.toUpperCase()}{user?.lastName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-bold tracking-tight">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-blue-200 text-lg mt-1 flex items-center gap-2">
                <FaUser className="text-sm" /> Patient
              </p>
              <p className="text-white/80 text-sm mt-2 flex items-center gap-2">
                <FaEnvelope className="text-sm" /> {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information - Enhanced */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaUser className="text-stone-900 text-sm" />
                </div>
                Personal Information
              </h3>
              {!isEditingPersonal && (
                <Button
                  onClick={() => setIsEditingPersonal(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FaEdit className="text-xs" /> Edit
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
                      setPersonalData({ ...personalData, firstName: e.target.value })
                    }
                  />
                  <Input
                    label="Last Name"
                    value={personalData.lastName}
                    onChange={(e) =>
                      setPersonalData({ ...personalData, lastName: e.target.value })
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={personalData.dateOfBirth}
                    onChange={(e) =>
                      setPersonalData({ ...personalData, dateOfBirth: e.target.value })
                    }
                  />

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={personalData.gender}
                      onChange={(e) =>
                        setPersonalData({ ...personalData, gender: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-stone-900"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button onClick={handleUpdatePersonal} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-blue-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-stone-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <FaUser className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-stone-900 uppercase tracking-wider">First Name</p>
                    <p className="font-semibold text-stone-900">{user?.firstName || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <FaUser className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">Last Name</p>
                    <p className="font-semibold text-stone-900">{user?.lastName || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
                    <FaEnvelope className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Email</p>
                    <p className="font-semibold text-stone-900">{user?.email || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-orange-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <FaPhone className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-orange-600 uppercase tracking-wider">Phone</p>
                    <p className="font-semibold text-stone-900">{user?.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-xl border border-pink-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/30">
                    <FaBirthdayCake className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-pink-600 uppercase tracking-wider">Date of Birth</p>
                    <p className="font-semibold text-stone-900">
                      {user?.dateOfBirth
                        ? new Date(user.dateOfBirth).toLocaleDateString()
                        : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl border border-cyan-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <FaVenusMars className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-cyan-600 uppercase tracking-wider">Gender</p>
                    <p className="font-semibold text-stone-900 capitalize">{user?.gender || 'Not Set'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address - Enhanced */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaMapMarkerAlt className="text-green-600 text-sm" />
                </div>
                Address
              </h3>
              {!isEditingAddress && (
                <Button
                  onClick={() => setIsEditingAddress(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FaEdit className="text-xs" /> Edit
                </Button>
              )}
            </div>
          </div>

          <div className="p-6">
            {isEditingAddress ? (
              <div className="space-y-4">
                <Input
                  label="Street Address"
                  value={addressData.street}
                  onChange={(e) =>
                    setAddressData({ ...addressData, street: e.target.value })
                  }
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    value={addressData.city}
                    onChange={(e) =>
                      setAddressData({ ...addressData, city: e.target.value })
                    }
                  />
                  <Input
                    label="State"
                    value={addressData.state}
                    onChange={(e) =>
                      setAddressData({ ...addressData, state: e.target.value })
                    }
                  />
                  <Input
                    label="ZIP Code"
                    value={addressData.zipCode}
                    onChange={(e) =>
                      setAddressData({ ...addressData, zipCode: e.target.value })
                    }
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button onClick={handleUpdateAddress} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={() => setIsEditingAddress(false)}
                    variant="outline"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-green-100">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
                    <FaMapMarkerAlt className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Street</p>
                    <p className="font-semibold text-stone-900">{user?.address?.street || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 bg-stone-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <FaCity className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-stone-900 uppercase tracking-wider">City</p>
                    <p className="font-semibold text-stone-900">{user?.address?.city || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <FaMap className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">State</p>
                    <p className="font-semibold text-stone-900">{user?.address?.state || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-orange-100">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <FaMailBulk className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-orange-600 uppercase tracking-wider">ZIP Code</p>
                    <p className="font-semibold text-stone-900">{user?.address?.zipCode || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Medical History - Enhanced */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <FaNotesMedical className="text-red-600 text-sm" />
              </div>
              Medical History
            </h3>
          </div>

          <div className="p-6">
            {medicalHistory.length > 0 ? (
              <div className="space-y-4">
                {medicalHistory.map((item, index) => (
                  <div key={index} className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/30 flex-shrink-0">
                        <FaNotesMedical className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-900">{item.condition}</h4>
                        <p className="text-sm text-stone-600 flex items-center gap-1 mt-1">
                          <FaCalendarAlt className="text-xs" />
                          Diagnosed: {new Date(item.diagnosedDate).toLocaleDateString()}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-stone-700 mt-2 bg-white/50 rounded-lg p-2">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-stone-50 rounded-xl border border-stone-200">
                <FaNotesMedical className="text-5xl text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 font-medium">No medical history recorded</p>
                <p className="text-sm text-stone-400 mt-1">Your medical records will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Security - Enhanced */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FaShieldAlt className="text-indigo-600 text-sm" />
              </div>
              Security
            </h3>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <FaLock className="text-white text-lg" />
                </div>
                <div>
                  <p className="font-semibold text-stone-900">Password</p>
                  <p className="text-sm text-stone-500">Last changed: Never</p>
                </div>
              </div>
              <Button onClick={() => setIsChangingPassword(true)} variant="outline" className="flex items-center gap-2">
                <FaEdit className="text-xs" /> Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal - Enhanced */}
      <Modal
        isOpen={isChangingPassword}
        onClose={() => setIsChangingPassword(false)}
        title=""
        size="medium"
        showCloseButton={false}
      >
        <div className="relative">
          {/* Gradient Header */}
          <div className="bg-stone-700 px-6 py-5 -mx-6 -mt-6 mb-6">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full"></div>
            </div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaLock className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Change Password</h2>
                  <p className="text-white/70 text-sm">Update your security credentials</p>
                </div>
              </div>
              <button
                onClick={() => setIsChangingPassword(false)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              >
                <span className="text-white text-lg">×</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
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
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
            />

            <div className="flex space-x-3 pt-4">
              <Button onClick={handleChangePassword} disabled={loading} className="flex-1">
                {loading ? 'Changing...' : 'Change Password'}
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
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Profile;
