import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ChevronRight, MapPin, AlertTriangle, Clock, Users,
  Shield, Eye, MessageSquare, CheckCircle2, XCircle, Image, Mic, Video
} from 'lucide-react';
import { useDocument } from '../hooks/useFirestoreData';
import { adminApi } from '../api';
import { SEVERITY_LEVELS, URGENCY_LEVELS, CATEGORIES } from '../data/mockData'; // For dropdowns
import './TaskDetail.css';

function SeverityBadge({ severity }) {
  const cls = `severity-badge severity-${(severity || 'LOW').toLowerCase()}`;
  return <span className={cls}>{severity || 'LOW'}</span>;
}

function StatusBadge({ status }) {
  const labels = {
    DRAFT: 'Draft', SUBMITTED: 'Submitted', UNDER_REVIEW: 'Under Review',
    ACTIVE: 'Active', CLOSED: 'Closed', COMPLETED: 'Completed', REJECTED: 'Rejected'
  };
  return <span className={`status-badge status-${(status || '').toLowerCase()}`}>{labels[status] || status}</span>;
}

export default function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { data: task, loading } = useDocument('tasks', taskId);
  
  const [overrideCategory, setOverrideCategory] = useState('');
  const [overrideSeverity, setOverrideSeverity] = useState('');
  const [overrideUrgency, setOverrideUrgency] = useState('');
  const [newComment, setNewComment] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [maxVol, setMaxVol] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setOverrideCategory(task.managementOverride?.category || '');
      setOverrideSeverity(task.managementOverride?.severity || '');
      setOverrideUrgency(task.managementOverride?.urgency || '');
      setRequiredSkills(task.requiredSkills?.join(', ') || '');
      setMaxVol(task.maxVolunteers || '');
    }
  }, [task]);

  if (loading) {
    return <div className="loading-screen">Loading task details...</div>;
  }

  if (!task) {
    return (
      <div className="empty-state">
        <p className="headline-sm text-muted">Task not found</p>
        <button className="btn-tertiary" onClick={() => navigate('/admin/tasks')}>Back to Task Queue</button>
      </div>
    );
  }

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const { doc, updateDoc, db, serverTimestamp } = await import('../firebase.js');
      const updates = {
        status: 'ACTIVE',
        updatedAt: serverTimestamp()
      };
      
      if (overrideCategory || overrideSeverity || overrideUrgency) {
        updates.managementOverride = {
          category: overrideCategory || undefined,
          severity: overrideSeverity || undefined,
          urgency: overrideUrgency || undefined,
        };
      }
      
      await updateDoc(doc(db, 'tasks', taskId), updates);
      navigate('/admin/tasks');
    } catch (err) {
      alert('Error approving task: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      const { doc, updateDoc, db, serverTimestamp } = await import('../firebase.js');
      await updateDoc(doc(db, 'tasks', taskId), {
        status: 'REJECTED',
        rejectionReason: rejectionReason,
        updatedAt: serverTimestamp()
      });
      setShowRejectModal(false);
      navigate('/admin/tasks');
    } catch (err) {
      alert('Error rejecting task: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const { doc, updateDoc, arrayUnion, db, auth } = await import('../firebase.js');
      const commentObj = {
        text: newComment.trim(),
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName || 'Admin',
        createdAt: new Date().toISOString()
      };
      await updateDoc(doc(db, 'tasks', taskId), {
        comments: arrayUnion(commentObj)
      });
      setNewComment('');
    } catch (err) {
      alert('Error adding comment: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ai = task.aiAnalysis || {
    processingStatus: 'PENDING',
    situationSummary: 'Pending analysis...',
    category: 'Unknown',
    severity: 'LOW',
    urgency: 'NON_URGENT',
    estimatedAffected: null,
    keyObservations: []
  };

  const employeeAssessment = task.employeeAssessment || { severity: 'LOW', urgency: 'NON_URGENT' };

  return (
    <div className="task-detail-page">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs animate-fade-in">
        <Link to="/admin/dashboard">Dashboard</Link>
        <ChevronRight size={14} />
        <Link to="/admin/tasks">Task Queue</Link>
        <ChevronRight size={14} />
        <span className="text-muted">{task.title?.substring(0, 40) || 'Task'}...</span>
      </nav>

      {/* Task Header */}
      <div className="task-detail-header animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="task-detail-header-left">
          <div className="task-detail-badges">
            <StatusBadge status={task.status} />
            <span className="type-badge">{task.reportType?.replace('_', ' ') || 'Report'}</span>
          </div>
          <h1 className="headline-lg">{task.title}</h1>
          <div className="task-detail-meta">
            <span className="body-sm text-muted">
              <MapPin size={14} /> {task.location?.address || 'Unknown'}
            </span>
            <span className="body-sm text-muted">
              <Clock size={14} /> Submitted {task.createdAt?.toDate ? task.createdAt.toDate().toLocaleDateString() : 'Unknown'}
            </span>
            <span className="body-sm text-muted">
              <Users size={14} /> By {task.employeeName || task.employeeId || 'Unknown'}
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
              <span className={`ai-status ai-${ai.processingStatus?.toLowerCase() || 'pending'}`}>
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
                    <SeverityBadge severity={employeeAssessment.severity} />
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
                    <span className="urgency-value">{employeeAssessment.urgency.replace('_', ' ')}</span>
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
              {(ai.keyObservations || []).map((obs, i) => (
                <li key={i} className="body-md">
                  <AlertTriangle size={14} className="text-primary" />
                  {obs}
                </li>
              ))}
              {(!ai.keyObservations || ai.keyObservations.length === 0) && (
                <li className="body-md text-muted">No specific observations available.</li>
              )}
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
              {(!task.internalComments || task.internalComments.length === 0) && (
                <p className="body-sm text-muted">No internal comments yet.</p>
              )}
              {(task.internalComments || []).map((comment, i) => (
                <div key={i} className="comment-item">
                  <div className="comment-header">
                    <span className="label-lg">{comment.authorName || comment.authorId}</span>
                    <span className="label-md text-muted">
                      {comment.timestamp?.toDate ? comment.timestamp.toDate().toLocaleString() : new Date(comment.timestamp).toLocaleString()}
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
              <button 
                className="btn-secondary btn-sm" 
                disabled={!newComment.trim() || isSubmitting}
                onClick={handleAddComment}
              >
                Post
              </button>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN — Media, Map, Actions */}
        <div className="task-detail-right">
          {/* Media Gallery */}
          <section className="detail-section animate-slide-right" style={{ animationDelay: '200ms' }}>
            <h2 className="headline-sm">Media Attachments</h2>
            <div className="media-gallery">
              {Array.from({ length: task.mediaCount?.images || 0 }).map((_, i) => (
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
              {Array.from({ length: task.mediaCount?.audio || 0 }).map((_, i) => (
                <div key={`aud-${i}`} className="media-thumb audio">
                  <div className="media-thumb-placeholder">
                    <Mic size={24} />
                    <span className="label-sm">Audio {i + 1}</span>
                  </div>
                </div>
              ))}
              {Array.from({ length: (task.mediaCount?.shortVideos || 0) + (task.mediaCount?.longVideos || 0) }).map((_, i) => (
                <div key={`vid-${i}`} className="media-thumb video">
                  <div className="media-thumb-placeholder">
                    <Video size={24} />
                    <span className="label-sm">Video {i + 1}</span>
                  </div>
                </div>
              ))}
              {(!task.mediaCount || (task.mediaCount.images === 0 && task.mediaCount.audio === 0 && task.mediaCount.shortVideos === 0 && task.mediaCount.longVideos === 0)) && (
                <p className="body-sm text-muted">No media attached.</p>
              )}
            </div>
          </section>

          {/* Transcript */}
          <section className="detail-section animate-slide-right" style={{ animationDelay: '300ms' }}>
            <h2 className="headline-sm">Audio Transcript</h2>
            <div className="transcript-box">
              <p className="body-md">
                "{task.description} — Field officer report recorded on-site. 
                Immediate attention required for {ai.category.toLowerCase()} response."
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
                <span className="body-sm">{task.location?.address || 'Unknown location'}</span>
                <span className="label-sm text-muted">
                  {task.location?.lat?.toFixed(4)}, {task.location?.lng?.toFixed(4)}
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

            {['SUBMITTED', 'UNDER_REVIEW'].includes(task.status) && (
              <div className="action-buttons">
                <button className="btn-approve" id="approve-task" onClick={handleApprove} disabled={isSubmitting}>
                  <CheckCircle2 size={18} />
                  <span>Approve & Activate</span>
                </button>
                <button className="btn-reject" onClick={() => setShowRejectModal(true)} id="reject-task" disabled={isSubmitting}>
                  <XCircle size={18} />
                  <span>Reject</span>
                </button>
              </div>
            )}

            <button 
              className="btn-secondary btn-full"
              onClick={() => navigate(`/admin/volunteers/${task.id}`)}
              id="view-volunteers"
            >
              <Users size={18} />
              <span>View Volunteer Applications ({task.acceptedCount || 0})</span>
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
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)} disabled={isSubmitting}>Cancel</button>
              <button className="btn-reject" disabled={!rejectionReason.trim() || isSubmitting} onClick={handleReject}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
