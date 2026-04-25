import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ChevronRight, MapPin, Star, CheckCircle2, XCircle,
  Info, Image, Award
} from 'lucide-react';
import { mockTasks, mockVolunteerApplications } from '../data/mockData';
import './VolunteerManagement.css';

function MatchScoreBar({ score }) {
  const pct = Math.round(score * 100);
  const isGreat = score > 0.7;
  return (
    <div className="match-score-wrapper">
      <div className="match-score-bar">
        <div className="match-score-fill" style={{ width: `${pct}%` }}></div>
      </div>
      <span className="match-score-value">{pct}%</span>
      {isGreat && (
        <span className="great-match-badge">
          <Award size={12} /> Great Match
        </span>
      )}
    </div>
  );
}

function ScoreBreakdown({ breakdown }) {
  const items = [
    { label: 'Proximity', weight: '0.40', value: breakdown.proximity },
    { label: 'Interest', weight: '0.25', value: breakdown.interest },
    { label: 'Availability', weight: '0.20', value: breakdown.availability },
    { label: 'Skill', weight: '0.15', value: breakdown.skill },
  ];
  return (
    <div className="score-breakdown">
      <div className="score-breakdown-header">
        <Info size={14} />
        <span className="label-md">Match Score Breakdown</span>
      </div>
      {items.map((item) => (
        <div key={item.label} className="breakdown-row">
          <span className="body-sm">{item.label}</span>
          <span className="label-md text-muted">×{item.weight}</span>
          <div className="breakdown-bar">
            <div className="breakdown-fill" style={{ width: `${item.value / parseFloat(item.weight) * 100}%` }}></div>
          </div>
          <span className="body-sm">{item.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function AppStatusBadge({ status }) {
  const map = {
    APPLIED: { cls: 'applied', label: 'Pending' },
    ACCEPTED: { cls: 'accepted', label: 'Accepted' },
    REJECTED: { cls: 'rejected', label: 'Rejected' },
    PROOF_SUBMITTED: { cls: 'proof', label: 'Proof Submitted' },
    COMPLETED: { cls: 'completed', label: 'Completed' },
  };
  const s = map[status] || { cls: 'applied', label: status };
  return <span className={`app-status-badge app-${s.cls}`}>{s.label}</span>;
}

export default function VolunteerManagement() {
  const { taskId } = useParams();
  const task = mockTasks.find(t => t.id === (taskId || 'task-001'));
  const applications = mockVolunteerApplications;
  const [expandedScore, setExpandedScore] = useState(null);

  return (
    <div className="volunteer-mgmt-page">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs animate-fade-in">
        <Link to="/dashboard">Dashboard</Link>
        <ChevronRight size={14} />
        <Link to="/volunteers">Volunteers</Link>
        <ChevronRight size={14} />
        <span className="text-muted">{task?.title?.substring(0, 40) || 'Task'}...</span>
      </nav>

      {/* Task Info Header */}
      <div className="vol-task-header animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div>
          <h1 className="headline-lg">{task?.title || 'Volunteer Applications'}</h1>
          <div className="vol-task-meta">
            <span className={`status-badge status-${task?.status?.toLowerCase()}`}>
              {task?.status?.replace('_', ' ')}
            </span>
            <span className="body-sm text-muted">
              {task?.acceptedCount || 0} / {task?.maxVolunteers || '∞'} volunteers accepted
            </span>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <section className="detail-section animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h2 className="headline-sm">Volunteer Applications ({applications.length})</h2>
        <div className="vol-table-wrapper">
          <table className="vol-table">
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>Distance</th>
                <th>Skills</th>
                <th>Interests</th>
                <th>Match Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications
                .sort((a, b) => b.matchScore - a.matchScore)
                .map((app, i) => (
                <tr key={app.id} className="vol-row animate-fade-in" style={{ animationDelay: `${300 + i * 80}ms` }}>
                  <td>
                    <div className="vol-name-cell">
                      <div className="vol-avatar">{app.volunteerName.charAt(0)}</div>
                      <div>
                        <span className="title-md">{app.volunteerName}</span>
                        <span className="label-md text-muted">Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="vol-distance">
                      <MapPin size={14} />
                      <span className="body-md">{app.distance} km</span>
                    </div>
                  </td>
                  <td>
                    <div className="vol-tags">
                      {app.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                    </div>
                  </td>
                  <td>
                    <div className="vol-tags">
                      {app.interests.slice(0, 2).map(i => <span key={i} className="interest-tag">{i}</span>)}
                    </div>
                  </td>
                  <td>
                    <div className="vol-score-cell">
                      <MatchScoreBar score={app.matchScore} />
                      <button
                        className="score-detail-btn"
                        onClick={() => setExpandedScore(expandedScore === app.id ? null : app.id)}
                        aria-label="Show score breakdown"
                      >
                        <Info size={14} />
                      </button>
                      {expandedScore === app.id && (
                        <ScoreBreakdown breakdown={app.matchBreakdown} />
                      )}
                    </div>
                  </td>
                  <td><AppStatusBadge status={app.status} /></td>
                  <td>
                    <div className="vol-actions">
                      {app.status === 'APPLIED' && (
                        <>
                          <button className="btn-icon-accept" title="Accept" id={`accept-${app.id}`}>
                            <CheckCircle2 size={18} />
                          </button>
                          <button className="btn-icon-reject" title="Reject" id={`reject-${app.id}`}>
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {app.status === 'ACCEPTED' && (
                        <span className="label-md text-primary">✓ Accepted</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Proof of Participation */}
      <section className="detail-section animate-fade-in" style={{ animationDelay: '500ms' }}>
        <h2 className="headline-sm">Proof of Participation Queue</h2>
        <div className="proof-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="proof-card">
              <div className="proof-media-placeholder">
                <Image size={32} />
                <span className="label-sm text-muted">Proof #{i}</span>
              </div>
              <div className="proof-info">
                <span className="title-md">Volunteer {i}</span>
                <span className="body-sm text-muted">Submitted 2h ago</span>
              </div>
              <div className="proof-actions">
                <button className="btn-approve btn-sm" id={`proof-approve-${i}`}>
                  <CheckCircle2 size={14} />
                  Approve
                </button>
                <button className="btn-secondary btn-sm" id={`proof-resubmit-${i}`}>
                  Request Resubmission
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
