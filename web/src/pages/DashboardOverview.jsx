import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Clock, MapPin, AlertTriangle, Activity } from 'lucide-react';
import { mockTasks, dashboardStats } from '../data/mockData';
import './DashboardOverview.css';

function StatCard({ stat, icon: Icon, delay }) {
  const isPositive = stat.trend > 0;
  return (
    <div className="stat-card animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-card-header">
        <span className="label-md text-muted">{stat.label}</span>
        <div className="stat-card-icon">
          <Icon size={18} />
        </div>
      </div>
      <div className="stat-card-value display-sm">{stat.value.toLocaleString()}</div>
      <div className={`stat-card-trend ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span className="label-md">{Math.abs(stat.trend)}% from last week</span>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const cls = `severity-badge severity-${severity.toLowerCase()}`;
  return <span className={cls}>{severity}</span>;
}

function StatusBadge({ status }) {
  const labels = {
    DRAFT: 'Draft', SUBMITTED: 'Submitted', UNDER_REVIEW: 'Under Review',
    ACTIVE: 'Active', CLOSED: 'Closed', COMPLETED: 'Completed', REJECTED: 'Rejected'
  };
  return <span className={`status-badge status-${status.toLowerCase()}`}>{labels[status] || status}</span>;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardOverview() {
  const navigate = useNavigate();
  const pendingTasks = mockTasks.filter(t => ['SUBMITTED', 'UNDER_REVIEW'].includes(t.status));
  const allActive = mockTasks.filter(t => t.status === 'ACTIVE');

  return (
    <div className="dashboard-overview">
      <div className="page-header">
        <div>
          <h1 className="headline-lg">Dashboard</h1>
          <p className="body-md text-muted">Real-time overview of operations</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard stat={dashboardStats.activeTasks} icon={Activity} delay={0} />
        <StatCard stat={dashboardStats.pendingReview} icon={AlertTriangle} delay={100} />
        <StatCard stat={dashboardStats.activeVolunteers} icon={MapPin} delay={200} />
        <StatCard stat={dashboardStats.completedMonth} icon={Clock} delay={300} />
      </div>

      {/* Task Review Queue */}
      <div className="section-card animate-fade-in" style={{ animationDelay: '400ms' }}>
        <div className="section-card-header">
          <h2 className="headline-sm">Task Review Queue</h2>
          <button className="btn-tertiary" onClick={() => navigate('/tasks')}>View All</button>
        </div>
        <div className="task-table-wrapper">
          <table className="task-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Reporter</th>
                <th>Location</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>AI</th>
              </tr>
            </thead>
            <tbody>
              {mockTasks.slice(0, 6).map((task, i) => (
                <tr 
                  key={task.id}
                  className="task-table-row animate-fade-in"
                  style={{ animationDelay: `${500 + i * 80}ms` }}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <td>
                    <div className="task-title-cell">
                      <span className="title-md">{task.title}</span>
                      <span className="label-md text-muted">{task.reportType.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="body-md">{task.employeeName}</td>
                  <td>
                    <div className="task-location-cell">
                      <MapPin size={14} />
                      <span className="body-sm text-muted">{task.location.address.split(',')[0]}</span>
                    </div>
                  </td>
                  <td><span className="type-badge">{task.reportType.replace('_', ' ')}</span></td>
                  <td><SeverityBadge severity={task.aiAnalysis.severity} /></td>
                  <td><StatusBadge status={task.status} /></td>
                  <td className="body-sm text-muted">{timeAgo(task.createdAt)}</td>
                  <td>
                    <span className={`ai-status ai-${task.aiAnalysis.processingStatus.toLowerCase()}`}>
                      {task.aiAnalysis.processingStatus === 'DONE' ? '✓ Analysed' : '⏳ Processing'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Row: Active Tasks + Map placeholder */}
      <div className="dashboard-bottom-row">
        <div className="section-card animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="section-card-header">
            <h2 className="headline-sm">Active Tasks</h2>
            <span className="label-md text-muted">{allActive.length} tasks live</span>
          </div>
          <div className="active-tasks-list">
            {allActive.map((task) => (
              <div 
                key={task.id} 
                className="active-task-card"
                onClick={() => navigate(`/tasks/${task.id}`)}
                role="button"
                tabIndex={0}
              >
                <div className="active-task-info">
                  <span className="title-md">{task.title}</span>
                  <div className="active-task-meta">
                    <SeverityBadge severity={task.managementOverride?.severity || task.aiAnalysis.severity} />
                    <span className="body-sm text-muted">{task.acceptedCount}/{task.maxVolunteers || '∞'} volunteers</span>
                  </div>
                </div>
                <div className="active-task-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${task.maxVolunteers ? (task.acceptedCount / task.maxVolunteers * 100) : 30}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card map-placeholder animate-fade-in" style={{ animationDelay: '700ms' }}>
          <div className="section-card-header">
            <h2 className="headline-sm">Live Task Map</h2>
          </div>
          <div className="map-container">
            <div className="map-mock">
              <MapPin size={24} className="map-pin pin-1" />
              <MapPin size={24} className="map-pin pin-2" />
              <MapPin size={24} className="map-pin pin-3" />
              <MapPin size={20} className="map-pin pin-4" />
              <div className="map-overlay-text">
                <span className="label-md">Google Maps integration</span>
                <span className="label-sm text-muted">Connect API key to enable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
