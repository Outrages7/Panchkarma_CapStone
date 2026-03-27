import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import PatientDashboard from './pages/dashboard/PatientDashboard';
import DoctorDashboard from './pages/dashboard/DoctorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Patient Pages
import PatientProfile from './pages/patient/Profile';
import PatientAppointments from './pages/patient/Appointments';
import MedicalRecords from './pages/patient/MedicalRecords';
import TherapyPlan from './pages/patient/TherapyPlan';
import TherapyProgress from './pages/patient/TherapyProgress';
import PrePostCare from './pages/patient/PrePostCare';
import Feedback from './pages/patient/Feedback';

// Doctor Pages
import DoctorProfile from './pages/doctor/Profile';
import DoctorCalendar from './pages/doctor/Calendar';
import DoctorPatients from './pages/doctor/Patients';
import TreatmentPlans from './pages/doctor/TreatmentPlans';
import TherapySessions from './pages/doctor/TherapySessions';

// Admin Pages
import AdminDoctors from './pages/admin/Doctors';
import AdminPatients from './pages/admin/Patients';
import AdminAppointments from './pages/admin/Appointments';
import AdminDepartments from './pages/admin/Departments';
import AdminAnalytics from './pages/admin/Analytics';
import AdminSettings from './pages/admin/Settings';
import TherapyTypes from './pages/admin/TherapyTypes';
import TherapyRooms from './pages/admin/TherapyRooms';
import Inventory from './pages/admin/Inventory';
import Reports from './pages/admin/Reports';
import AdminAdmins from './pages/admin/Admins';

// Shared Pages
import Prescriptions from './pages/shared/Prescriptions';
import Messages from './pages/shared/Messages';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Redirect authenticated users from home to their dashboard
  const HomeRedirect = () => {
    if (isAuthenticated && user) {
      const dashboardRoutes = {
        patient: '/patient/dashboard',
        doctor: '/doctor/dashboard',
        admin: '/admin/dashboard',
      };
      return <Navigate to={dashboardRoutes[user.role] || '/'} replace />;
    }
    return <Landing />;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* Protected Routes - Patient */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/profile"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/medical-records"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MedicalRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/therapy-plan"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <TherapyPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/therapy-progress"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <TherapyProgress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/pre-post-care"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PrePostCare />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/feedback"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Feedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/prescriptions"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Prescriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/messages"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Messages />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Doctor */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/calendar"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorPatients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/treatment-plans"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <TreatmentPlans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/therapy-sessions"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <TherapySessions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/prescriptions"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <Prescriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/messages"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <Messages />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDoctors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPatients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDepartments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/therapy-types"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TherapyTypes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/therapy-rooms"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TherapyRooms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/admins"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAdmins />
            </ProtectedRoute>
          }
        />

        {/* Catch all - 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
