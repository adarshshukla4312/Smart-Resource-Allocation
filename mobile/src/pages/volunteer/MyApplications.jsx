import { useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, CheckCircle2, XCircle, HourglassIcon,
  Camera, ChevronRight, ClipboardList
} from 'lucide-react';
import { myApplications } from '../../data/mockData';
import './MyApplications.css';

function AppStatusBadge({ status }) {
  const map = {
    APPLIED: { label: 'PENDING REVIEW', type: 'pending' },
    ACCEPTED: { label: 'MISSION ACTIVE', type: 'active' },
    REJECTED: { label: 'DECLINED', type: 'rejected' },
    PROOF_SUBMITTED: { label: 'EVIDENCE FILED', type: 'filed' },
    COMPLETED: { label: 'COMPLETED', type: 'completed' },
  };
  const s = map[status] || { label: status, type: 'pending' };
  return (
    <span className={`editorial-status-pill status-${s.type}`}>
      {s.label}
    </span>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function MyApplications() {
  const navigate = useNavigate();

  const active = myApplications.filter(a => ['ACCEPTED', 'APPLIED'].includes(a.status));
  const history = myApplications.filter(a => !['ACCEPTED', 'APPLIED'].includes(a.status));

  const renderCard = (app, i) => (
    <div
      key={app.id}
      className={`editorial-app-card severity-${app.taskSeverity.toLowerCase()} animate-fade-in`}
      style={{ animationDelay: `${i * 60}ms` }}
      onClick={() => app.status === 'ACCEPTED' ? navigate(`/applications/${app.taskId}/proof`) : navigate(`/feed/${app.taskId}`)}
    >
      <div className="app-card-header">
        <AppStatusBadge status={app.status} />
        <span className="label-sm opacity-40">{timeAgo(app.appliedAt).toUpperCase()}</span>
      </div>
      
      <h3 className="title-md serif app-title">{app.taskTitle}</h3>
      
      <div className="app-card-meta">
        <div className="meta-item">
          <MapPin size={12} />
          <span className="label-sm">{app.distance} KM</span>
        </div>
        <div className="meta-item">
          <span className="match-tag-mini">{Math.round(app.matchScore * 100)}% MATCH</span>
        </div>
      </div>

      {app.status === 'ACCEPTED' && (
        <div className="app-card-action-highlight">
          <Camera size={14} />
          <span className="label-sm">TRANSMIT FIELD PROOF</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="my-applications-page animate-fade-in">
      <div className="applications-hero">
        <h1 className="display-sm serif">Engagement</h1>
        <p className="body-md text-muted editorial-para">Track your active deployments and historical humanitarian contributions.</p>
      </div>

      <div className="applications-content">
        {active.length > 0 && (
          <div className="app-section">
            <div className="section-header-editorial">
              <span className="label-lg">ACTIVE MISSIONS</span>
              <div className="count-pill">{active.length}</div>
            </div>
            <div className="app-grid">
              {active.map((app, i) => renderCard(app, i))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="app-section">
            <div className="section-header-editorial">
              <span className="label-lg">MISSION HISTORY</span>
            </div>
            <div className="app-grid">
              {history.map((app, i) => renderCard(app, i + active.length))}
            </div>
          </div>
        )}

        {myApplications.length === 0 && (
          <div className="editorial-empty-state">
            <div className="empty-icon-bubble">
              <ClipboardList size={32} />
            </div>
            <h3 className="title-md serif">No Active Deployments</h3>
            <p className="body-sm text-muted">Initialize your first application from the mission feed.</p>
            <button className="submit-btn-editorial" onClick={() => navigate('/feed')}>
              Browse Mission Feed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
