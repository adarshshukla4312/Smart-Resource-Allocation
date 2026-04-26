import { useState } from 'react';
import {
  MapPin, Clock, Users, AlertTriangle,
  Sparkles, Award, CheckCircle2, Share2, Image, Mic, Video, X
} from 'lucide-react';
import { mockActiveTasks, myApplications } from '../../data/mockData';
import '../../pages/volunteer/TaskView.css';

function SeverityBadge({ severity }) {
  return <span className={`severity-badge severity-${severity.toLowerCase()}`}>{severity}</span>;
}

export default function TaskDetail({ taskId, onApply, isModal = false, onClose }) {
  const task = mockActiveTasks.find(t => t.id === taskId);
  const existingApp = myApplications.find(app => app.taskId === taskId);
  const [showApplySheet, setShowApplySheet] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  if (!task) {
    return (
      <div className="empty-state">
        <p className="headline-sm text-muted">Task not found</p>
      </div>
    );
  }

  const ai = task.aiAnalysis;
  const sev = task.managementOverride?.severity || ai.severity;
  const cat = task.managementOverride?.category || ai.category;
  const urg = task.managementOverride?.urgency || ai.urgency;
  const isGreatMatch = task.matchScore > 0.7;
  const slotsLeft = task.maxVolunteers ? task.maxVolunteers - task.acceptedCount : null;

  const handleApply = () => {
    setHasApplied(true);
    setShowApplySheet(false);
    if (onApply) onApply(task);
  };

  const isApplied = hasApplied || existingApp?.status === 'APPLIED';
  const isAccepted = existingApp?.status === 'ACCEPTED';

  return (
    <div className={`task-detail-container ${isModal ? 'is-modal' : ''}`}>
      {/* Header */}
      <div className="task-view-header">
        {isModal ? (
           <button className="task-view-close" onClick={onClose} aria-label="Close">
             <X size={20} />
           </button>
        ) : null}
      </div>

      {/* Hero Section */}
      <div className="task-view-hero animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="task-view-badges">
          {isGreatMatch && (
            <span className="great-match-badge">
              <Award size={10} /> Great Match
            </span>
          )}
          <span className="category-badge">{cat}</span>
          <SeverityBadge severity={sev} />
        </div>
        <h1 className="display-md">{task.title}</h1>
        <div className="task-view-meta">
          <span className="body-sm text-muted"><MapPin size={13} /> {task.location.address}</span>
          <span className="body-sm text-muted"><Clock size={13} /> {urg.replace('_', ' ')}</span>
          <span className="body-sm text-muted"><Users size={13} /> {task.acceptedCount}/{task.maxVolunteers || '∞'} volunteers</span>
        </div>
      </div>

      {/* Match Score */}
      <div className="task-view-match animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="task-view-match-header">
          <span className="title-md">Your Match Score</span>
          <span className="display-sm text-primary">{Math.round(task.matchScore * 100)}%</span>
        </div>
        <div className="task-view-match-bar">
          <div className="task-view-match-fill" style={{ width: `${Math.round(task.matchScore * 100)}%` }}></div>
        </div>
        <div className="task-view-match-details">
          <div className="match-detail-item">
            <span className="body-sm text-muted">Distance</span>
            <span className="label-lg">{task.distance} km</span>
          </div>
          <div className="match-detail-item">
            <span className="body-sm text-muted">Slots Left</span>
            <span className="label-lg">{slotsLeft !== null ? slotsLeft : '∞'}</span>
          </div>
          <div className="match-detail-item">
            <span className="body-sm text-muted">Affected</span>
            <span className="label-lg">{ai.estimatedAffected?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="task-view-section animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="task-view-section-header">
          <Sparkles size={16} className="text-primary" />
          <span className="title-md">AI Situation Analysis</span>
        </div>
        <p className="body-md">{ai.situationSummary}</p>
      </div>

      {/* Key Observations */}
      <div className="task-view-section animate-fade-in" style={{ animationDelay: '400ms' }}>
        <span className="title-md">Key Observations</span>
        <ul className="task-view-observations">
          {ai.keyObservations.map((obs, i) => (
            <li key={i}>
              <AlertTriangle size={13} className="text-primary" />
              <span className="body-sm">{obs}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Media */}
      {(task.mediaCount.images > 0 || task.mediaCount.audio > 0 || task.mediaCount.shortVideos + task.mediaCount.longVideos > 0) && (
        <div className="task-view-section animate-fade-in" style={{ animationDelay: '500ms' }}>
          <span className="title-md">Media Attachments</span>
          <div className="task-view-media-grid">
            {Array.from({ length: Math.min(task.mediaCount.images, 4) }).map((_, i) => (
              <div key={`img-${i}`} className="task-view-media-thumb">
                <Image size={20} />
                <span className="label-sm">Image {i + 1}</span>
              </div>
            ))}
            {task.mediaCount.audio > 0 && (
              <div className="task-view-media-thumb audio">
                <Mic size={20} />
                <span className="label-sm">{task.mediaCount.audio} Audio</span>
              </div>
            )}
            {(task.mediaCount.shortVideos + task.mediaCount.longVideos) > 0 && (
              <div className="task-view-media-thumb video">
                <Video size={20} />
                <span className="label-sm">{task.mediaCount.shortVideos + task.mediaCount.longVideos} Video</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location */}
      <div className="task-view-section animate-fade-in" style={{ animationDelay: '600ms' }}>
        <span className="title-md">Location</span>
        <div className="task-view-map-placeholder">
          <MapPin size={28} className="text-primary" />
          <span className="body-sm">{task.location.address}</span>
          <span className="label-sm text-muted">
            {task.location.lat.toFixed(4)}, {task.location.lng.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Skills Required */}
      {task.requiredSkills.length > 0 && (
        <div className="task-view-section animate-fade-in" style={{ animationDelay: '700ms' }}>
          <span className="title-md">Required Skills</span>
          <div className="task-view-skills">
            {task.requiredSkills.map(skill => (
              <span key={skill} className="chip active">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Apply Button */}
      <div className="task-view-apply-area">
        {isAccepted ? (
          <div className="task-view-applied animate-scale-in" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
            <CheckCircle2 size={20} />
            <span className="title-md">Application Accepted!</span>
            <p className="body-sm text-muted">You are assigned to this task. Check My Tasks for updates.</p>
          </div>
        ) : isApplied ? (
          <div className="task-view-applied animate-scale-in">
            <Clock size={20} />
            <span className="title-md">Application Submitted</span>
            <p className="body-sm text-muted">Your application is currently under review.</p>
          </div>
        ) : (
          <button
            className="btn-primary task-view-apply-btn"
            onClick={() => setShowApplySheet(true)}
          >
            Apply to Volunteer
          </button>
        )}
      </div>

      {/* Apply Confirmation Overlay */}
      {showApplySheet && (
        <div className="confirm-overlay animate-fade-in">
          <div className="confirm-modal glass animate-slide-up">
            <h3 className="headline-sm">Confirm Application</h3>
            <p className="body-md text-muted" style={{ marginTop: '8px', marginBottom: '16px' }}>
              You're applying to volunteer for:
            </p>
            <div className="apply-sheet-task-info">
              <span className="title-md">{task.title}</span>
              <div className="apply-sheet-meta">
                <span className="body-sm text-muted"><MapPin size={12} /> {task.distance} km away</span>
                <SeverityBadge severity={sev} />
              </div>
            </div>
            <div className="apply-sheet-actions">
              <button className="btn-primary" onClick={handleApply}>Confirm Application</button>
              <button className="btn-secondary" onClick={() => setShowApplySheet(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
