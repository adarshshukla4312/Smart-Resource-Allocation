import { useState, useEffect } from 'react';
import {
  MapPin, Clock, Users, AlertTriangle,
  Sparkles, Award, CheckCircle2, Share2, Image, Mic, Video, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDocument, useMyApplications, useTaskMedia } from '../../hooks/useFirestoreData';
import { tasksApi } from '../../api';
import { computeMatchScore } from '../../utils/matching';
import MediaPreviewModal from '../MediaPreviewModal';
import '../../pages/volunteer/TaskView.css';

function SeverityBadge({ severity }) {
  const cls = `severity-badge severity-${(severity || 'LOW').toLowerCase()}`;
  return <span className={cls}>{severity || 'LOW'}</span>;
}

export default function TaskDetail({ taskId, onApply, isModal = false, onClose }) {
  const { userProfile } = useAuth();
  const { data: task, loading: tLoading } = useDocument('tasks', taskId);
  const { data: myAppsData, loading: aLoading } = useMyApplications(userProfile?.uid);
  const { data: mediaItems } = useTaskMedia(taskId);
  
  const [showApplySheet, setShowApplySheet] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaModalIndex, setMediaModalIndex] = useState(0);

  const [liveLat, setLiveLat] = useState(null);
  const [liveLng, setLiveLng] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLiveLat(pos.coords.latitude);
          setLiveLng(pos.coords.longitude);
        },
        () => {} // fallback to 0 proximity
      );
    }
  }, []);

  if (tLoading || aLoading) {
    return (
      <div className={`task-detail-container ${isModal ? 'is-modal' : ''}`}>
        <div className="loading-screen">Loading task details...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className={`task-detail-container ${isModal ? 'is-modal' : ''}`}>
        <div className="empty-state">
          <p className="headline-sm text-muted">Task not found</p>
        </div>
      </div>
    );
  }

  const existingApp = (myAppsData || []).find(app => app.taskId === taskId);

  const ai = task.aiAnalysis || {};
  const sev = task.managementOverride?.severity || ai.severity;
  const cat = task.managementOverride?.category || ai.category;
  const urg = task.managementOverride?.urgency || ai.urgency;
  
  const match = computeMatchScore(userProfile || {}, task, liveLat, liveLng);
  const matchScore = match.total || 0;
  const liveDistance = match.distance;
  const isGreatMatch = matchScore > 0.7;

  // Compute matched skills
  const required = task.requiredSkills || [];
  const volunteerSkills = userProfile?.skills || [];
  const matchedSkillsCount = required.filter(s => volunteerSkills.includes(s)).length;
  const skillsDisplay = required.length > 0 
    ? `${matchedSkillsCount}/${required.length} Matched` 
    : 'None required';

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const { collection, addDoc, serverTimestamp, db } = await import('../../firebase.js');
      const { auth } = await import('../../firebase.js');
      
      await addDoc(collection(db, 'applications'), {
        taskId,
        taskTitle: task.title,
        volunteerId: auth.currentUser?.uid,
        volunteerName: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Unknown',
        status: 'APPLIED',
        appliedAt: serverTimestamp(),
        matchScore: matchScore || 0,
        distance: liveDistance || 0,
      });

      setShowApplySheet(false);
      if (onApply) onApply(task);
    } catch (err) {
      alert('Failed to apply: ' + err.message);
    } finally {
      setIsApplying(false);
    }
  };

  const isApplied = !!existingApp && existingApp.status !== 'REJECTED';
  const isAccepted = existingApp?.status === 'ACCEPTED' || existingApp?.status === 'PROOF_SUBMITTED' || existingApp?.status === 'COMPLETED';

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
          <span className="category-badge">{cat || 'General'}</span>
          <SeverityBadge severity={sev} />
        </div>
        <h1 className="display-md">{task.title}</h1>
        <div className="task-view-meta">
          <span className="body-sm text-muted"><MapPin size={13} /> {task.location?.address || 'Unknown'}</span>
          <span className="body-sm text-muted"><Clock size={13} /> {(urg || '').replace('_', ' ')}</span>
          <span className="body-sm text-muted"><Users size={13} /> {task.acceptedCount || 0}/{task.maxVolunteers || '∞'} volunteers</span>
        </div>
      </div>

      {/* Match Score */}
      <div className="task-view-match animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="task-view-match-header">
          <span className="title-md">Your Match Score</span>
          <span className="display-sm text-primary">{Math.round(matchScore * 100)}%</span>
        </div>
        <div className="task-view-match-bar">
          <div className="task-view-match-fill" style={{ width: `${Math.round(matchScore * 100)}%` }}></div>
        </div>
        <div className="task-view-match-details">
          <div className="match-detail-item">
            <span className="body-sm text-muted">Distance</span>
            <span className="label-lg">{liveDistance === 999 ? 'Unknown' : `${liveDistance} km`}</span>
          </div>
          <div className="match-detail-item">
            <span className="body-sm text-muted">Skills Required</span>
            <span className="label-lg">{skillsDisplay}</span>
          </div>
          <div className="match-detail-item">
            <span className="body-sm text-muted">Severity</span>
            <span className="label-lg" style={{ textTransform: 'capitalize' }}>{sev || 'LOW'}</span>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="task-view-section animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="task-view-section-header">
          <Sparkles size={16} className="text-primary" />
          <span className="title-md">AI Situation Analysis</span>
        </div>
        <p className="body-md">{ai.situationSummary || 'Processing...'}</p>
      </div>

      {/* Key Observations */}
      {ai.keyObservations && ai.keyObservations.length > 0 && (
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
      )}

      {/* Media */}
      {mediaItems && mediaItems.length > 0 && (
        <div className="task-view-section animate-fade-in" style={{ animationDelay: '500ms' }}>
          <span className="title-md">Media Attachments</span>
          <div className="task-view-media-grid" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
            {mediaItems.map((item, index) => (
              <div 
                key={item.id} 
                className="task-view-media-thumb" 
                onClick={() => { setMediaModalIndex(index); setMediaModalOpen(true); }}
                style={{ 
                  width: '100px', height: '100px', borderRadius: '8px', 
                  background: 'rgba(255,255,255,0.05)', overflow: 'hidden',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {item.type?.startsWith('image') ? (
                  <img src={item.url} alt="Task Media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : item.type?.startsWith('video') ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '50%' }}>
                      <Video size={24} color="white" />
                    </div>
                  </div>
                ) : (
                  <Mic size={24} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location */}
      {task.location && (
        <div className="task-view-section animate-fade-in" style={{ animationDelay: '600ms' }}>
          <span className="title-md">Location</span>
          <div className="task-view-map">
            <iframe
              width="100%"
              height="200"
              style={{ border: 0, borderRadius: '16px' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${task.location.lat},${task.location.lng}`}
            ></iframe>
          </div>
        </div>
      )}

      {/* Skills Required */}
      {task.requiredSkills && task.requiredSkills.length > 0 && (
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
            disabled={task.status !== 'ACTIVE'}
          >
            {task.status !== 'ACTIVE' ? 'Task Not Active' : 'Apply to Volunteer'}
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
                <span className="body-sm text-muted"><MapPin size={12} /> {liveDistance === 999 ? 'Unknown' : liveDistance} km away</span>
                <SeverityBadge severity={sev} />
              </div>
            </div>
            <div className="apply-sheet-actions">
              <button className="btn-primary" onClick={handleApply} disabled={isApplying}>
                {isApplying ? 'Applying...' : 'Confirm Application'}
              </button>
              <button className="btn-secondary" onClick={() => setShowApplySheet(false)} disabled={isApplying}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Media Preview Modal */}
      <MediaPreviewModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        mediaItems={mediaItems || []}
        initialIndex={mediaModalIndex}
      />
    </div>
  );
}
