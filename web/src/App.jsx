import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import TaskQueue from './pages/TaskQueue';
import TaskDetail from './pages/TaskDetail';
import VolunteerManagement from './pages/VolunteerManagement';
import './App.css';

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
              ? <Navigate to="/dashboard" replace /> 
              : <LoginPage onLogin={handleLogin} />
          } 
        />
        <Route
          path="/"
          element={
            isAuthenticated 
              ? <DashboardLayout user={user} onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="tasks" element={<TaskQueue />} />
          <Route path="tasks/:taskId" element={<TaskDetail />} />
          <Route path="volunteers" element={<VolunteerManagement />} />
          <Route path="volunteers/:taskId" element={<VolunteerManagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
