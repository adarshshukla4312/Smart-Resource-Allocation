import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import MobileLayout from './layouts/MobileLayout';
import TaskFeed from './pages/volunteer/TaskFeed';
import TaskView from './pages/volunteer/TaskView';
import MyApplications from './pages/volunteer/MyApplications';
import SubmitProof from './pages/volunteer/SubmitProof';
import Profile from './pages/volunteer/Profile';
import CreateReport from './pages/employee/CreateReport';
import MyReports from './pages/employee/MyReports';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to={user?.role === 'VOLUNTEER' ? '/feed' : user?.role === 'ADMIN' ? '/admin' : '/reports'} replace />
              : <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated
              ? <MobileLayout user={user} onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          }
        >
          {/* Volunteer Routes */}
          <Route index element={<Navigate to={user?.role === 'VOLUNTEER' ? '/feed' : user?.role === 'ADMIN' ? '/admin' : '/reports'} replace />} />
          <Route path="feed" element={<TaskFeed />} />
          <Route path="feed/:taskId" element={<TaskView />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="applications/:taskId/proof" element={<SubmitProof />} />
          <Route path="profile" element={<Profile />} />

          {/* Employee Routes */}
          <Route path="reports" element={<MyReports />} />
          <Route path="reports/new" element={<CreateReport />} />

          {/* Admin Routes */}
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
