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

// Patient Pages
import PatientProfile from './pages/patient/Profile';
import PatientAppointments from './pages/patient/Appointments';
import MedicalRecords from './pages/patient/MedicalRecords';
import TherapyPlan from './pages/patient/TherapyPlan';
import TherapyProgress from './pages/patient/TherapyProgress';
import PrePostCare from './pages/patient/PrePostCare';
import Feedback from './pages/patient/Feedback';

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


        {/* Catch all - 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
