import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft, MapPin, Clock, Users, AlertTriangle,
  Sparkles, Award, CheckCircle2, Share2, Image, Mic, Video
} from 'lucide-react';
import { mockActiveTasks } from '../../data/mockData';
import './TaskView.css';

export default function TaskView() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const task = mockActiveTasks.find(t => t.id === taskId);
  const [showApplySheet, setShowApplySheet] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  if (!task) {
    return (
      <div className="empty-state">
        <p className="display-sm serif text-muted">Task not found</p>
        <button className="logout-btn-editorial" onClick={() => navigate('/feed')}>Back to Feed</button>
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
  };

  return (
    <div className="task-view-page animate-fade-in">
      <div className="task-view-header">
        <button className="icon-btn-minimal" onClick={() => navigate('/feed')}>
          <ArrowLeft size={20} />
        </button>
        <button className="icon-btn-minimal">
          <Share2 size={20} />
        </button>
      </div>

      <div className="task-view-hero">
        <div className="hero-badge-row">
          {isGreatMatch && (
            <span className="match-tag">
              <Award size={10} /> GREAT MATCH
            </span>
          )}
          <span className="category-tag">{cat.toUpperCase()}</span>
          <span className={`severity-tag severity-${sev.toLowerCase()}`}>{sev}</span>
        </div>
        <h1 className="display-sm serif task-hero-title">{task.title}</h1>
        <div className="hero-meta-list">
          <div className="meta-item">
            <MapPin size={14} />
            <span className="label-lg">{task.location.address}</span>
          </div>
          <div className="meta-item">
            <Clock size={14} />
            <span className="label-lg">{urg.replace('_', ' ')}</span>
          </div>
          <div className="meta-item">
            <Users size={14} />
            <span className="label-lg">{task.acceptedCount}/{task.maxVolunteers || '∞'} VOLUNTEERS</span>
          </div>
        </div>
      </div>

      <div className="match-score-section">
        <div className="match-header">
          <span className="label-lg">QUALIFICATION SCORE</span>
          <div className="match-score-pill">
            <div className="match-fill" style={{ width: `${Math.round(task.matchScore * 100)}%` }}></div>
            <span className="label-lg">{Math.round(task.matchScore * 100)}% MATCH</span>
          </div>
        </div>
        <div className="match-grid">
          <div className="match-item">
            <span className="label-lg text-muted">DISTANCE</span>
            <span className="serif title-md">{task.distance} km</span>
          </div>
          <div className="match-item">
            <span className="label-lg text-muted">OPEN SLOTS</span>
            <span className="serif title-md">{slotsLeft !== null ? slotsLeft : '∞'}</span>
          </div>
          <div className="match-item">
            <span className="label-lg text-muted">IMPACT</span>
            <span className="serif title-md">{ai.estimatedAffected?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="task-detail-section ai-analysis-card">
        <div className="section-header-row">
          <div className="ai-icon-bubble"><Sparkles size={16} /></div>
          <h2 className="title-md serif">AI Situation Analysis</h2>
        </div>
        <p className="body-md editorial-text">{ai.situationSummary}</p>
      </div>

      <div className="task-detail-section">
        <h2 className="label-lg section-label">KEY OBSERVATIONS</h2>
        <div className="observations-list">
          {ai.keyObservations.map((obs, i) => (
            <div key={i} className="observation-item">
              <div className="obs-dot"></div>
              <span className="body-md">{obs}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="task-detail-section">
        <h2 className="label-lg section-label">LOCATION & MEDIA</h2>
        <div className="media-preview-strip">
          {Array.from({ length: Math.min(task.mediaCount.images, 3) }).map((_, i) => (
            <div key={i} className="media-placeholder">
              <Image size={20} />
            </div>
          ))}
          {task.mediaCount.audio > 0 && (
            <div className="media-placeholder audio">
              <Mic size={20} />
            </div>
          )}
        </div>
        <div className="location-card-mini">
          <MapPin size={16} />
          <div className="location-info">
            <span className="label-lg">{task.location.address}</span>
            <span className="body-sm opacity-50">{task.location.lat.toFixed(4)}, {task.location.lng.toFixed(4)}</span>
          </div>
        </div>
      </div>

      <div className="apply-action-bar">
        {hasApplied ? (
          <div className="application-status-card animate-scale-in">
            <CheckCircle2 size={24} />
            <div className="status-text">
              <span className="label-lg">APPLICATION SUBMITTED</span>
              <span className="body-sm">Awaiting NGO Management review</span>
            </div>
          </div>
        ) : (
          <button
            className="submit-btn-editorial"
            onClick={() => setShowApplySheet(true)}
          >
            Apply to Task Console
          </button>
        )}
      </div>

      {showApplySheet && (
        <div className="editorial-sheet-overlay animate-fade-in">
          <div className="editorial-sheet animate-slide-up">
            <div className="sheet-header">
              <div className="sheet-handle"></div>
              <h3 className="title-md serif">Confirm Application</h3>
            </div>
            <div className="sheet-content">
              <p className="body-md">You are requesting deployment to the following mission:</p>
              <div className="sheet-task-brief">
                <span className="serif title-md">{task.title}</span>
                <span className="label-lg text-muted">{task.location.address}</span>
              </div>
              <div className="sheet-actions">
                <button className="submit-btn-editorial" onClick={handleApply}>Confirm Deployment</button>
                <button className="logout-btn-editorial" onClick={() => setShowApplySheet(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
