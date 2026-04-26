import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, CheckCircle2, Clock, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { mockActiveTasks, myReports } from '../../data/mockData';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  const highSeverityTasks = mockActiveTasks.filter(t => t.aiAnalysis.severity === 'CRITICAL' || t.aiAnalysis.severity === 'HIGH');
  const pendingReports = myReports.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW');

  return (
    <div className="admin-dashboard-page animate-fade-in">
      <div className="dashboard-hero">
        <h1 className="display-sm serif">Operations Console</h1>
        <p className="body-md text-muted editorial-para">Real-time humanitarian logistics and resource distribution overview.</p>
      </div>

      <div className="admin-stats-grid">
        <div className="editorial-stat-card">
          <div className="stat-header">
            <span className="label-sm opacity-40">ACTIVE MISSIONS</span>
            <div className="stat-icon-bubble"><AlertTriangle size={14} /></div>
          </div>
          <div className="stat-value display-sm serif">{mockActiveTasks.length}</div>
          <div className="stat-footer">
            <span className="label-sm text-primary">+2 INITIALIZED TODAY</span>
          </div>
        </div>

        <div className="editorial-stat-card">
          <div className="stat-header">
            <span className="label-sm opacity-40">PENDING ANALYSIS</span>
            <div className="stat-icon-bubble"><Clock size={14} /></div>
          </div>
          <div className="stat-value display-sm serif">{pendingReports.length}</div>
          <div className="stat-footer">
            <span className="label-sm text-primary">REQUIRES ATTENTION</span>
          </div>
        </div>

        <div className="editorial-stat-card">
          <div className="stat-header">
            <span className="label-sm opacity-40">VOLUNTEER FORCE</span>
            <div className="stat-icon-bubble"><Users size={14} /></div>
          </div>
          <div className="stat-value display-sm serif">128</div>
          <div className="stat-footer">
            <span className="label-sm text-primary">12 ACTIVE DEPLOYMENTS</span>
          </div>
        </div>

        <div className="editorial-stat-card">
          <div className="stat-header">
            <span className="label-sm opacity-40">TOTAL RESOLVED</span>
            <div className="stat-icon-bubble"><CheckCircle2 size={14} /></div>
          </div>
          <div className="stat-value display-sm serif">42</div>
          <div className="stat-footer">
            <span className="label-sm opacity-40">THIS CALENDAR MONTH</span>
          </div>
        </div>
      </div>

      <div className="admin-content-sections">
        <div className="admin-section">
          <div className="section-header-editorial">
            <span className="label-lg">PRIORITY DISPATCH QUEUE</span>
            <button className="icon-btn-minimal" onClick={() => navigate('/feed')}>
              <ArrowRight size={18} />
            </button>
          </div>
          
          <div className="editorial-queue-list">
            {mockActiveTasks.slice(0, 3).map((task, i) => (
              <div 
                key={task.id} 
                className={`editorial-app-card severity-${task.aiAnalysis.severity.toLowerCase()} animate-fade-in`}
                style={{ animationDelay: `${i * 100}ms` }}
                onClick={() => navigate(`/feed/${task.id}`)}
              >
                <div className="app-card-header">
                  <span className={`editorial-status-pill status-active`}>
                    {task.aiAnalysis.severity} PRIORITY
                  </span>
                  <span className="label-sm opacity-40">2H AGO</span>
                </div>
                <h3 className="title-md serif">{task.title}</h3>
                <div className="app-card-meta">
                  <div className="meta-item">
                    <MapPin size={12} />
                    <span className="label-sm">{task.location.address.split(',')[0].toUpperCase()}</span>
                  </div>
                  <div className="meta-item">
                    <Users size={12} />
                    <span className="label-sm">{task.acceptedCount}/{task.maxVolunteers} DEPLOYED</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-section">
          <div className="section-header-editorial">
            <span className="label-lg">LOGISTICAL TIMELINE</span>
          </div>
          
          <div className="editorial-activity-timeline">
            {myReports.slice(0, 3).map((report, i) => (
              <div key={i} className="timeline-entry animate-fade-in" style={{ animationDelay: `${(i + 3) * 100}ms` }}>
                <div className="timeline-marker">
                  <div className="marker-dot"></div>
                  {i !== 2 && <div className="marker-line"></div>}
                </div>
                <div className="timeline-content">
                  <span className="label-sm opacity-40">JUST NOW</span>
                  <p className="body-md editorial-para">
                    <strong>{report.title}</strong> was successfully transmitted from {report.location.address.split(',')[0]}.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
