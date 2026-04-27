import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ChevronRight, MapPin, Star, CheckCircle2, XCircle,
  Info, Image, Award
} from 'lucide-react';
import { useDocument, useTaskApplications } from '../hooks/useFirestoreData';
import { adminApi } from '../api';
import './VolunteerManagement.css';

function MatchScoreBar({ score }) {
  const pct = Math.round((score || 0) * 100);
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
  if (!breakdown) return null;
  const items = [
    { label: 'Proximity', weight: '0.40', value: breakdown.proximity || 0 },
    { label: 'Interest', weight: '0.25', value: breakdown.interest || 0 },
    { label: 'Availability', weight: '0.20', value: breakdown.availability || 0 },
    { label: 'Skill', weight: '0.15', value: breakdown.skill || 0 },
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
            <div className="breakdown-fill" style={{ width: `${(item.value / parseFloat(item.weight)) * 100}%` }}></div>
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
  const s = map[status] || { cls: 'applied', label: status || 'Unknown' };
  return <span className={`app-status-badge app-${s.cls}`}>{s.label}</span>;
}

export default function VolunteerManagement() {
  const { taskId } = useParams();
  const { data: task, loading: tLoading } = useDocument('tasks', taskId);
  const { data: applicationsData, loading: aLoading } = useTaskApplications(taskId);
  const [expandedScore, setExpandedScore] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [selectedAppForGallery, setSelectedAppForGallery] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  if (tLoading || aLoading) {
    return <div className="loading-screen">Loading applications...</div>;
  }

  const applications = applicationsData || [];

  const handleAccept = async (appId) => {
    setProcessingId(appId);
    try {
      const { doc, updateDoc, db, serverTimestamp, increment } = await import('../firebase.js');
      await updateDoc(doc(db, 'applications', appId), {
        status: 'ACCEPTED',
        updatedAt: serverTimestamp()
      });
      // Optionally increment acceptedCount on task
      if (taskId) {
        await updateDoc(doc(db, 'tasks', taskId), {
          acceptedCount: increment(1)
        });
      }
    } catch (err) {
      alert('Error accepting: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (appId) => {
    const reason = prompt('Please provide a rejection reason:');
    if (!reason) return;
    setProcessingId(appId);
    try {
      const { doc, updateDoc, db, serverTimestamp } = await import('../firebase.js');
      await updateDoc(doc(db, 'applications', appId), {
        status: 'REJECTED',
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      alert('Error rejecting: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerifyProof = async (appId, approved) => {
    setProcessingId(appId);
    try {
      const { doc, updateDoc, db, serverTimestamp } = await import('../firebase.js');
      await updateDoc(doc(db, 'applications', appId), {
        status: approved ? 'COMPLETED' : 'APPLIED', // If rejected, return to applied to try again
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      alert('Error verifying proof: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const proofApps = applications.filter(a => a.status === 'PROOF_SUBMITTED');

  return (
    <div className="volunteer-mgmt-page">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs animate-fade-in">
        <Link to="/admin/dashboard">Dashboard</Link>
        <ChevronRight size={14} />
        <Link to="/admin/tasks">Task Queue</Link>
        <ChevronRight size={14} />
        <span className="text-muted">{task?.title?.substring(0, 40) || 'Task'}...</span>
      </nav>

      {/* Task Info Header */}
      <div className="vol-task-header animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div>
          <h1 className="headline-lg">{task?.title || 'Volunteer Applications'}</h1>
          <div className="vol-task-meta">
            <span className={`status-badge status-${task?.status?.toLowerCase() || 'draft'}`}>
              {task?.status?.replace('_', ' ') || 'Unknown'}
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
                <th>Task</th>
                <th>Location</th>
                <th>Skills</th>
                <th>Interests</th>
                <th>Match Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications
                .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
                .map((app, i) => (
                <tr key={app.id} className="vol-row animate-fade-in" style={{ animationDelay: `${300 + i * 80}ms` }}>
                  <td>
                    <div className="vol-name-cell">
                      <div className="vol-avatar">{app.volunteerName?.charAt(0) || '?'}</div>
                      <div>
                        <span className="title-md">{app.volunteerName || app.volunteerId}</span>
                        <span className="label-md text-muted">
                          Applied {app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="body-md">{app.taskTitle || task?.title || 'Unknown Task'}</span>
                  </td>
                  <td>
                    <div className="vol-distance">
                      <MapPin size={14} />
                      <span className="body-md">{app.volunteerLocation || app.locationText || 'Unknown location'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="vol-tags">
                      {(app.skills || []).map(s => <span key={s} className="skill-tag">{s}</span>)}
                    </div>
                  </td>
                  <td>
                    <div className="vol-tags">
                      {(app.interests || []).slice(0, 2).map(i => <span key={i} className="interest-tag">{i}</span>)}
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
                          <button 
                            className="btn-icon-accept" 
                            title="Accept" 
                            onClick={() => handleAccept(app.id)}
                            disabled={processingId === app.id}
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            className="btn-icon-reject" 
                            title="Reject" 
                            onClick={() => handleReject(app.id)}
                            disabled={processingId === app.id}
                          >
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
              {applications.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center" style={{ padding: '32px' }}>
                    <p className="body-md text-muted">No applications yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Proof of Participation */}
      {proofApps.length > 0 && (
        <section className="detail-section animate-fade-in" style={{ animationDelay: '500ms' }}>
          <h2 className="headline-sm">Proof of Participation Queue</h2>
          <div className="proof-grid">
            {proofApps.map((app) => (
              <div key={app.id} className="proof-card">
                <div 
                  className="proof-media-placeholder" 
                  style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => { setGalleryIndex(0); setSelectedAppForGallery(app); }}
                  title="Click to view full size"
                >
                  {app.proofMedia?.[0]?.url && !app.proofMedia[0].url.includes('mock.storage') ? (
                    <img src={app.proofMedia[0].url} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      {app.proofMedia?.[0]?.type === 'IMAGE' ? <Image size={32} /> : <Image size={32} />}
                      <span className="label-sm text-muted">Proof Attached</span>
                    </>
                  )}
                </div>
                <div className="proof-info">
                  <span className="title-md">{app.volunteerName || 'Volunteer'}</span>
                  <span className="body-sm text-muted">Awaiting Verification</span>
                </div>
                <div className="proof-actions">
                  <button 
                    className="btn-approve btn-sm" 
                    onClick={() => handleVerifyProof(app.id, true)}
                    disabled={processingId === app.id}
                  >
                    <CheckCircle2 size={14} />
                    Approve
                  </button>
                  <button 
                    className="btn-secondary btn-sm"
                    onClick={() => handleVerifyProof(app.id, false)}
                    disabled={processingId === app.id}
                  >
                    Request Resubmission
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gallery Modal */}
      {selectedAppForGallery && (
        <div className="gallery-modal-overlay" onClick={() => setSelectedAppForGallery(null)}>
          <div className="gallery-modal-content" onClick={e => e.stopPropagation()}>
            <button className="gallery-close" onClick={() => setSelectedAppForGallery(null)}>
              <XCircle size={36} />
            </button>
            
            <div className="gallery-image-container">
               {selectedAppForGallery.proofMedia?.[galleryIndex]?.url && !selectedAppForGallery.proofMedia[galleryIndex].url.includes('mock.storage') ? (
                  <img src={selectedAppForGallery.proofMedia[galleryIndex].url} alt={`Proof ${galleryIndex + 1}`} />
               ) : (
                  <div style={{ padding: '60px', background: 'var(--surface-container-highest)', borderRadius: '12px', color: 'var(--on-surface)' }}>
                    No Valid Image URL
                  </div>
               )}
            </div>
            
            {selectedAppForGallery.proofMedia?.length > 1 && (
              <div className="gallery-navigation">
                <button 
                  className="gallery-nav-btn"
                  disabled={galleryIndex === 0} 
                  onClick={() => setGalleryIndex(prev => prev - 1)}
                >Previous</button>
                <span className="label-md">{galleryIndex + 1} / {selectedAppForGallery.proofMedia.length}</span>
                <button 
                  className="gallery-nav-btn"
                  disabled={galleryIndex === selectedAppForGallery.proofMedia.length - 1} 
                  onClick={() => setGalleryIndex(prev => prev + 1)}
                >Next</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
