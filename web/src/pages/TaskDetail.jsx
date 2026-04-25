import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ChevronRight, MapPin, AlertTriangle, Clock, Users,
  Shield, Eye, MessageSquare, CheckCircle2, XCircle, Image, Mic, Video
} from 'lucide-react';
import { mockTasks, SEVERITY_LEVELS, URGENCY_LEVELS, CATEGORIES } from '../data/mockData';
import './TaskDetail.css';

function SeverityBadge({ severity }) {
  return <span className={`severity-badge severity-${severity.toLowerCase()}`}>{severity}</span>;
}

function StatusBadge({ status }) {
  const labels = {
    DRAFT: 'Draft', SUBMITTED: 'Submitted', UNDER_REVIEW: 'Under Review',
    ACTIVE: 'Active', CLOSED: 'Closed', COMPLETED: 'Completed', REJECTED: 'Rejected'
  };
  return <span className={`status-badge status-${status.toLowerCase()}`}>{labels[status] || status}</span>;
}

export default function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const task = mockTasks.find(t => t.id === taskId);
  
  const [overrideCategory, setOverrideCategory] = useState(task?.managementOverride?.category || '');
  const [overrideSeverity, setOverrideSeverity] = useState(task?.managementOverride?.severity || '');
  const [overrideUrgency, setOverrideUrgency] = useState(task?.managementOverride?.urgency || '');
  const [newComment, setNewComment] = useState('');
  const [requiredSkills, setRequiredSkills] = useState(task?.requiredSkills?.join(', ') || '');
  const [maxVol, setMaxVol] = useState(task?.maxVolunteers || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (!task) {
    return (
      <div className="empty-state">
        <p className="headline-sm text-muted">Task not found</p>
        <button className="btn-tertiary" onClick={() => navigate('/tasks')}>Back to Task Queue</button>
      </div>
    );
  }

  const ai = task.aiAnalysis;

  return (
    <div className="task-detail-page">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs animate-fade-in">
        <Link to="/dashboard">Dashboard</Link>
        <ChevronRight size={14} />
        <Link to="/tasks">Task Queue</Link>
        <ChevronRight size={14} />
        <span className="text-muted">{task.title.substring(0, 40)}...</span>
      </nav>

      {/* Task Header */}
      <div className="task-detail-header animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="task-detail-header-left">
          <div className="task-detail-badges">
            <StatusBadge status={task.status} />
            <span className="type-badge">{task.reportType.replace('_', ' ')}</span>
          </div>
          <h1 className="headline-lg">{task.title}</h1>
          <div className="task-detail-meta">
            <span className="body-sm text-muted">
              <MapPin size={14} /> {task.location.address}
            </span>
            <span className="body-sm text-muted">
              <Clock size={14} /> Submitted {new Date(task.createdAt).toLocaleDateString()}
            </span>
            <span className="body-sm text-muted">
              <Users size={14} /> By {task.employeeName}
            </span>
          </div>
        </div>
      </div>

      <div className="task-detail-grid">
        {/* LEFT COLUMN — AI Information Screen (PRD §5.2.2) */}
        <div className="task-detail-left">
          {/* AI Situation Summary */}
          <section className="detail-section animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="detail-section-header">
              <h2 className="headline-sm">
                <Eye size={20} /> AI Situation Analysis
              </h2>
              <span className={`ai-status ai-${ai.processingStatus.toLowerCase()}`}>
                {ai.processingStatus === 'DONE' ? '✓ Analysis Complete' : '⏳ Processing'}
              </span>
            </div>
            <p className="body-lg">{ai.situationSummary}</p>
          </section>

          {/* Severity/Urgency Comparison */}
          <section className="detail-section animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h2 className="headline-sm">Risk Assessment</h2>
            <div className="assessment-grid">
              <div className="assessment-card">
                <span className="label-sm text-muted">Category</span>
                <span className="title-md">{ai.category}</span>
              </div>
              <div className="assessment-card">
                <span className="label-sm text-muted">Est. Affected</span>
                <span className="display-sm">{ai.estimatedAffected?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="assessment-comparison">
                <span className="label-sm text-muted">Severity</span>
                <div className="comparison-row">
                  <div className="comparison-item">
                    <span className="label-md">Employee</span>
                    <SeverityBadge severity={task.employeeAssessment.severity} />
                  </div>
                  <div className="comparison-item">
                    <span className="label-md">AI</span>
                    <SeverityBadge severity={ai.severity} />
                  </div>
                  {task.managementOverride?.severity && (
                    <div className="comparison-item override">
                      <span className="label-md">
                        <Shield size={12} /> Override
                      </span>
                      <SeverityBadge severity={task.managementOverride.severity} />
                    </div>
                  )}
                </div>
              </div>
              <div className="assessment-comparison">
                <span className="label-sm text-muted">Urgency</span>
                <div className="comparison-row">
                  <div className="comparison-item">
                    <span className="label-md">Employee</span>
                    <span className="urgency-value">{task.employeeAssessment.urgency.replace('_', ' ')}</span>
                  </div>
                  <div className="comparison-item">
                    <span className="label-md">AI</span>
                    <span className="urgency-value">{ai.urgency.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Observations */}
          <section className="detail-section animate-fade-in" style={{ animationDelay: '400ms' }}>
            <h2 className="headline-sm">Key Observations</h2>
            <ul className="observations-list">
              {ai.keyObservations.map((obs, i) => (
                <li key={i} className="body-md">
                  <AlertTriangle size={14} className="text-primary" />
                  {obs}
                </li>
              ))}
            </ul>
          </section>

          {/* Management Override */}
          <section className="detail-section override-section animate-fade-in" style={{ animationDelay: '500ms' }}>
            <h2 className="headline-sm">
              <Shield size={20} /> Management Override
            </h2>
            <p className="body-sm text-muted">Override AI predictions. Your assessment is final.</p>
            <div className="override-fields">
              <div className="override-field">
                <label className="label-md">Category</label>
                <select value={overrideCategory} onChange={(e) => setOverrideCategory(e.target.value)} id="override-category">
                  <option value="">Use AI: {ai.category}</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="override-field">
                <label className="label-md">Severity</label>
                <select value={overrideSeverity} onChange={(e) => setOverrideSeverity(e.target.value)} id="override-severity">
                  <option value="">Use AI: {ai.severity}</option>
                  {SEVERITY_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="override-field">
                <label className="label-md">Urgency</label>
                <select value={overrideUrgency} onChange={(e) => setOverrideUrgency(e.target.value)} id="override-urgency">
                  <option value="">Use AI: {ai.urgency.replace('_', ' ')}</option>
                  {URGENCY_LEVELS.map(u => <option key={u} value={u}>{u.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Internal Comments */}
          <section className="detail-section animate-fade-in" style={{ animationDelay: '600ms' }}>
            <h2 className="headline-sm">
              <MessageSquare size={20} /> Internal Comments
            </h2>
            <div className="comments-list">
              {task.internalComments.length === 0 && (
                <p className="body-sm text-muted">No internal comments yet.</p>
              )}
              {task.internalComments.map((comment, i) => (
                <div key={i} className="comment-item">
                  <div className="comment-header">
                    <span className="label-lg">{comment.author}</span>
                    <span className="label-md text-muted">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="body-md">{comment.text}</p>
                </div>
              ))}
            </div>
            <div className="comment-input-wrapper">
              <input
                type="text"
                placeholder="Add an internal comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                id="new-comment"
              />
              <button className="btn-secondary btn-sm" disabled={!newComment.trim()}>Post</button>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN — Media, Map, Actions */}
        <div className="task-detail-right">
          {/* Media Gallery */}
          <section className="detail-section animate-slide-right" style={{ animationDelay: '200ms' }}>
            <h2 className="headline-sm">Media Attachments</h2>
            <div className="media-gallery">
              {Array.from({ length: task.mediaCount.images }).map((_, i) => (
                <div key={`img-${i}`} className="media-thumb">
                  <div className="media-thumb-placeholder">
                    <Image size={24} />
                    <span className="label-sm">Image {i + 1}</span>
                  </div>
                  <div className="media-ai-caption">
                    <span className="label-sm text-primary">AI Caption</span>
                    <span className="body-sm text-muted">Analysis available after processing</span>
                  </div>
                </div>
              ))}
              {Array.from({ length: task.mediaCount.audio }).map((_, i) => (
                <div key={`aud-${i}`} className="media-thumb audio">
                  <div className="media-thumb-placeholder">
                    <Mic size={24} />
                    <span className="label-sm">Audio {i + 1}</span>
                  </div>
                </div>
              ))}
              {Array.from({ length: task.mediaCount.shortVideos + task.mediaCount.longVideos }).map((_, i) => (
                <div key={`vid-${i}`} className="media-thumb video">
                  <div className="media-thumb-placeholder">
                    <Video size={24} />
                    <span className="label-sm">Video {i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Transcript */}
          <section className="detail-section animate-slide-right" style={{ animationDelay: '300ms' }}>
            <h2 className="headline-sm">Audio Transcript</h2>
            <div className="transcript-box">
              <p className="body-md">
                "{task.description} — Field officer report recorded on-site. 
                Immediate attention required for {task.aiAnalysis.category.toLowerCase()} response."
              </p>
              <span className="label-sm text-primary">Cleaned by Gemini 1.5 Pro · Temp 0.1</span>
            </div>
          </section>

          {/* Location Map */}
          <section className="detail-section animate-slide-right" style={{ animationDelay: '400ms' }}>
            <h2 className="headline-sm">Location</h2>
            <div className="detail-map">
              <div className="detail-map-mock">
                <MapPin size={28} className="text-primary" />
                <span className="body-sm">{task.location.address}</span>
                <span className="label-sm text-muted">
                  {task.location.lat.toFixed(4)}, {task.location.lng.toFixed(4)}
                </span>
              </div>
            </div>
          </section>

          {/* Task Configuration & Actions */}
          <section className="detail-section action-section animate-slide-right" style={{ animationDelay: '500ms' }}>
            <h2 className="headline-sm">Task Configuration</h2>
            <div className="config-fields">
              <div className="config-field">
                <label className="label-md">Required Skills</label>
                <input
                  type="text"
                  placeholder="First Aid, Construction, ..."
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  id="required-skills"
                />
              </div>
              <div className="config-field">
                <label className="label-md">Max Volunteers</label>
                <input
                  type="number"
                  placeholder="Leave empty for unlimited"
                  value={maxVol}
                  onChange={(e) => setMaxVol(e.target.value)}
                  id="max-volunteers"
                  min={1}
                />
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-approve" id="approve-task">
                <CheckCircle2 size={18} />
                <span>Approve & Activate</span>
              </button>
              <button className="btn-reject" onClick={() => setShowRejectModal(true)} id="reject-task">
                <XCircle size={18} />
                <span>Reject</span>
              </button>
            </div>

            <button 
              className="btn-secondary btn-full"
              onClick={() => navigate(`/volunteers/${task.id}`)}
              id="view-volunteers"
            >
              <Users size={18} />
              <span>View Volunteer Applications ({task.acceptedCount})</span>
            </button>
          </section>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content glass animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="headline-sm">Reject Task</h3>
            <p className="body-md text-muted">A rejection reason is mandatory per PRD §5.2.5.</p>
            <textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              id="rejection-reason"
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="btn-reject" disabled={!rejectionReason.trim()}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
