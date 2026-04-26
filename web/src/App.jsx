import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import VolunteerLayout from './layouts/VolunteerLayout';
import EmployeeLayout from './layouts/EmployeeLayout';

// Admin Pages
import DashboardOverview from './pages/DashboardOverview';
import TaskQueue from './pages/TaskQueue';
import TaskDetail from './pages/TaskDetail';
import VolunteerManagement from './pages/VolunteerManagement';

// Volunteer Pages
import TaskFeed from './pages/volunteer/TaskFeed';
import TaskView from './pages/volunteer/TaskView';
import MyApplications from './pages/volunteer/MyApplications';
import Profile from './pages/volunteer/Profile';
import SubmitProof from './pages/volunteer/SubmitProof';

// Employee Pages
import CreateReport from './pages/employee/CreateReport';
import MyReports from './pages/employee/MyReports';

import './App.css';

// Protected Route Component — now uses AuthContext
function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, userProfile, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userProfile?.role)) {
    if (userProfile?.role === 'VOLUNTEER') return <Navigate to="/volunteer" replace />;
    if (userProfile?.role === 'NGO_EMPLOYEE') return <Navigate to="/employee" replace />;
    if (userProfile?.role === 'NGO_MANAGEMENT') return <Navigate to="/admin" replace />;
    return <div className="loading-screen">Setting up profile...</div>;
  }
  return children;
}

function App() {
  const { isAuthenticated, userProfile, loading, logout } = useAuth();

  const getHomeRoute = () => {
    if (!isAuthenticated) return "/login";
    if (userProfile?.role === 'VOLUNTEER') return "/volunteer";
    if (userProfile?.role === 'NGO_EMPLOYEE') return "/employee";
    return "/admin";
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // Build user object for layouts (backward compatible with existing layout props)
  const user = userProfile ? {
    displayName: userProfile.displayName,
    role: userProfile.role,
    uid: userProfile.uid,
  } : null;

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated 
              ? <Navigate to={getHomeRoute()} replace /> 
              : <LoginPage />
          } 
        />
        
        {/* Base Route Redirection */}
        <Route path="/" element={<Navigate to={getHomeRoute()} replace />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['NGO_MANAGEMENT']}>
              <DashboardLayout user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="tasks" element={<TaskQueue />} />
          <Route path="tasks/:taskId" element={<TaskDetail />} />
          <Route path="volunteers" element={<VolunteerManagement />} />
          <Route path="volunteers/:taskId" element={<VolunteerManagement />} />
        </Route>

        {/* Volunteer Routes */}
        <Route
          path="/volunteer"
          element={
            <ProtectedRoute allowedRoles={['VOLUNTEER']}>
              <VolunteerLayout user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/volunteer/tasks" replace />} />
          <Route path="tasks" element={<TaskFeed />} />
          <Route path="feed/:taskId" element={<TaskView />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="proof/:taskId" element={<SubmitProof />} />
        </Route>

        {/* Employee Routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={['NGO_EMPLOYEE']}>
              <EmployeeLayout user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/employee/reports" replace />} />
          <Route path="create-report" element={<CreateReport />} />
          <Route path="reports" element={<MyReports />} />
        </Route>

        <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
