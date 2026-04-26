import { useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, CheckCircle2, XCircle, HourglassIcon,
  Camera, ChevronRight
} from 'lucide-react';
import { myApplications } from '../../data/mockData';
import './MyApplications.css';

function SeverityBadge({ severity }) {
  return <span className={`severity-badge severity-${severity.toLowerCase()}`}>{severity}</span>;
}

function AppStatusBadge({ status }) {
  const map = {
    APPLIED: { cls: 'applied', label: 'Pending', icon: HourglassIcon },
    ACCEPTED: { cls: 'accepted', label: 'Accepted', icon: CheckCircle2 },
    REJECTED: { cls: 'rejected', label: 'Rejected', icon: XCircle },
    PROOF_SUBMITTED: { cls: 'proof_submitted', label: 'Proof Sent', icon: Camera },
    COMPLETED: { cls: 'completed', label: 'Completed', icon: CheckCircle2 },
  };
  const s = map[status] || { cls: 'applied', label: status, icon: HourglassIcon };
  const Icon = s.icon;
  return (
    <span className={`status-badge status-${s.cls}`}>
      <Icon size={10} /> {s.label}
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

  const accepted = myApplications.filter(a => a.status === 'ACCEPTED');
  const pending = myApplications.filter(a => a.status === 'APPLIED');
  const others = myApplications.filter(a => !['ACCEPTED', 'APPLIED'].includes(a.status));

  const renderCard = (app, i) => (
    <div
      key={app.id}
      className="app-card mobile-card animate-fade-in"
      style={{ animationDelay: `${i * 60}ms` }}
      onClick={() => app.status === 'ACCEPTED' ? navigate(`/applications/${app.taskId}/proof`) : navigate(`/feed/${app.taskId}`)}
      role="button"
      tabIndex={0}
    >
      <div className="app-card-top">
        <AppStatusBadge status={app.status} />
        <span className="label-md text-muted">Applied {timeAgo(app.appliedAt)}</span>
      </div>
      <h3 className="title-md">{app.taskTitle}</h3>
      <div className="app-card-meta">
        <span className="body-sm text-muted"><MapPin size={12} /> {app.distance} km</span>
        <SeverityBadge severity={app.taskSeverity} />
        <span className="category-badge">{app.taskCategory}</span>
      </div>
      <div className="app-card-bottom">
        <div className="app-card-match">
          <span className="label-md text-muted">Match</span>
          <span className="label-lg text-primary">{Math.round(app.matchScore * 100)}%</span>
        </div>
        {app.status === 'ACCEPTED' && (
          <div className="app-card-proof-cta">
            <Camera size={14} />
            <span className="label-md">Submit Proof</span>
          </div>
        )}
        <ChevronRight size={16} className="app-card-arrow" />
      </div>
    </div>
  );

  return (
    <div className="my-applications-page">
      {/* Accepted / Active */}
      {accepted.length > 0 && (
        <div className="app-section">
          <div className="app-section-header">
            <span className="headline-sm">Active</span>
            <span className="label-md text-primary">{accepted.length}</span>
          </div>
          {accepted.map((app, i) => renderCard(app, i))}
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div className="app-section">
          <div className="app-section-header">
            <span className="headline-sm">Pending Review</span>
            <span className="label-md text-muted">{pending.length}</span>
          </div>
          {pending.map((app, i) => renderCard(app, i + accepted.length))}
        </div>
      )}

      {/* Others */}
      {others.length > 0 && (
        <div className="app-section">
          <div className="app-section-header">
            <span className="headline-sm">History</span>
          </div>
          {others.map((app, i) => renderCard(app, i + accepted.length + pending.length))}
        </div>
      )}

      {myApplications.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <ClipboardList size={28} />
          </div>
          <p className="headline-sm text-muted">No applications yet</p>
          <p className="body-md text-muted">Browse the task feed and apply to volunteer!</p>
        </div>
      )}
    </div>
  );
}
