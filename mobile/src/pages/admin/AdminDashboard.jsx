import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, CheckCircle2, TrendingUp, Clock, FileText } from 'lucide-react';
import { mockActiveTasks, myReports } from '../../data/mockData';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  const highSeverityTasks = mockActiveTasks.filter(t => t.aiAnalysis.severity === 'CRITICAL' || t.aiAnalysis.severity === 'HIGH');
  const pendingReports = myReports.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW');

  return (
    <div className="admin-dashboard-mobile">
      <div className="admin-header">
        <h1 className="headline-md">Management Overview</h1>
        <p className="body-md text-muted">Real-time status of current operations</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card primary">
          <div className="admin-stat-icon"><Users size={20} /></div>
          <span className="display-sm">{mockActiveTasks.length}</span>
          <span className="label-md">Active Tasks</span>
        </div>
        <div className="admin-stat-card danger">
          <div className="admin-stat-icon"><AlertTriangle size={20} /></div>
          <span className="display-sm">{highSeverityTasks.length}</span>
          <span className="label-md">Critical Alerts</span>
        </div>
        <div className="admin-stat-card success">
          <div className="admin-stat-icon"><CheckCircle2 size={20} /></div>
          <span className="display-sm">84%</span>
          <span className="label-md">Resolution Rate</span>
        </div>
        <div className="admin-stat-card warning">
          <div className="admin-stat-icon"><Clock size={20} /></div>
          <span className="display-sm">{pendingReports.length}</span>
          <span className="label-md">Pending Reports</span>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="title-md">Recent Reports</h2>
          <button className="btn-text">View All</button>
        </div>
        <div className="admin-list">
          {myReports.slice(0, 3).map((report, i) => (
            <div key={i} className="admin-list-item">
              <div className={`admin-list-icon ${report.severity.toLowerCase()}`}>
                <FileText size={16} />
              </div>
              <div className="admin-list-content">
                <span className="title-md">{report.title}</span>
                <span className="body-sm text-muted">{report.location.address}</span>
              </div>
              <div className="admin-list-action">
                <span className={`status-badge status-${report.status.toLowerCase()}`}>
                  {report.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="title-md">High Priority Tasks</h2>
          <button className="btn-text">View All</button>
        </div>
        <div className="admin-list">
          {highSeverityTasks.slice(0, 3).map((task, i) => (
            <div key={i} className="admin-list-item" onClick={() => navigate(`/feed/${task.id}`)}>
              <div className="admin-list-icon critical">
                <AlertTriangle size={16} />
              </div>
              <div className="admin-list-content">
                <span className="title-md">{task.title}</span>
                <span className="body-sm text-muted">{task.acceptedCount}/{task.maxVolunteers} Volunteers</span>
              </div>
              <div className="admin-list-action">
                <span className="label-md text-primary">Manage</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
