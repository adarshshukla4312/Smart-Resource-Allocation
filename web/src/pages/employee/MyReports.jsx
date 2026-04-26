import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, PlusCircle, Image, Mic, Video, Wifi, WifiOff, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMyReports } from '../../hooks/useFirestoreData';
import './MyReports.css';

function SeverityBadge({ severity }) {
  const cls = `severity-badge severity-${(severity || 'LOW').toLowerCase()}`;
  return <span className={cls}>{severity || 'LOW'}</span>;
}

function StatusBadge({ status }) {
  const labels = { DRAFT: 'Draft', SUBMITTED: 'Submitted', UNDER_REVIEW: 'Under Review', ACTIVE: 'Active', CLOSED: 'Closed', COMPLETED: 'Completed', REJECTED: 'Rejected' };
  return <span className={`status-badge status-${(status || '').toLowerCase()}`}>{labels[status] || status}</span>;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = dateStr.toDate ? dateStr.toDate() : new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function MyReports() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { data: reportsData, loading } = useMyReports(userProfile?.uid);

  if (loading) {
    return <div className="loading-screen">Loading reports...</div>;
  }

  const myReports = reportsData || [];

  const drafts = myReports.filter(r => r.status === 'DRAFT');
  const submitted = myReports.filter(r => r.status !== 'DRAFT');

  return (
    <div className="my-reports-page">
      {/* Sync Status Bar */}
      <div className="sync-status-bar animate-fade-in">
        <div className="sync-status-indicator synced">
          <Wifi size={14} />
          <span className="label-md">All synced</span>
        </div>
        <span className="label-md text-muted">{myReports.length} reports</span>
      </div>

      {/* New Report FAB */}
      <button className="new-report-btn animate-fade-in" onClick={() => navigate('/employee/create-report')} id="new-report">
        <PlusCircle size={20} />
        <span className="title-md">Create New Report</span>
      </button>

      {/* Drafts */}
      {drafts.length > 0 && (
        <div className="reports-section">
          <div className="reports-section-header">
            <span className="headline-sm">Drafts</span>
            <span className="label-md text-muted">{drafts.length}</span>
          </div>
          {drafts.map((report, i) => (
            <div key={report.id} className="report-card mobile-card animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="report-card-top">
                <StatusBadge status={report.status} />
                <div className="report-sync-chip">
                  {report.syncStatus === 'synced' ? <Wifi size={12} /> : <WifiOff size={12} />}
                  <span className="label-sm">{report.syncStatus === 'synced' ? 'Synced' : 'Pending'}</span>
                </div>
              </div>
              <h3 className="title-md">{report.title}</h3>
              <div className="report-card-meta">
                <span className="body-sm text-muted"><MapPin size={12} /> {report.location?.address || 'Unknown'}</span>
                <span className="body-sm text-muted"><Clock size={12} /> {timeAgo(report.createdAt)}</span>
              </div>
              <div className="report-card-bottom">
                <SeverityBadge severity={report.employeeAssessment?.severity} />
                <div className="report-card-media">
                  {report.mediaCount?.images > 0 && <span className="report-media-chip"><Image size={10} /> {report.mediaCount.images}</span>}
                  {report.mediaCount?.audio > 0 && <span className="report-media-chip"><Mic size={10} /> {report.mediaCount.audio}</span>}
                  {(report.mediaCount?.shortVideos + report.mediaCount?.longVideos) > 0 && <span className="report-media-chip"><Video size={10} /> {report.mediaCount.shortVideos + report.mediaCount.longVideos}</span>}
                </div>
                <ChevronRight size={16} className="report-card-arrow" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submitted */}
      <div className="reports-section">
        <div className="reports-section-header">
          <span className="headline-sm">Submitted</span>
          <span className="label-md text-muted">{submitted.length}</span>
        </div>
        {submitted.map((report, i) => (
          <div key={report.id} className="report-card mobile-card animate-fade-in" style={{ animationDelay: `${(i + drafts.length) * 60}ms` }}>
            <div className="report-card-top">
              <StatusBadge status={report.status} />
              <div className="report-sync-chip synced">
                <Wifi size={12} />
                <span className="label-sm">Synced</span>
              </div>
            </div>
            <h3 className="title-md">{report.title}</h3>
            <div className="report-card-meta">
              <span className="body-sm text-muted"><MapPin size={12} /> {report.location?.address || 'Unknown'}</span>
              <span className="body-sm text-muted"><Clock size={12} /> {timeAgo(report.createdAt)}</span>
            </div>
            <div className="report-card-bottom">
              <SeverityBadge severity={report.employeeAssessment?.severity || report.aiAnalysis?.severity} />
              <div className="report-card-media">
                {report.mediaCount?.images > 0 && <span className="report-media-chip"><Image size={10} /> {report.mediaCount.images}</span>}
                {report.mediaCount?.audio > 0 && <span className="report-media-chip"><Mic size={10} /> {report.mediaCount.audio}</span>}
                {(report.mediaCount?.shortVideos + report.mediaCount?.longVideos) > 0 && <span className="report-media-chip"><Video size={10} /> {report.mediaCount.shortVideos + report.mediaCount.longVideos}</span>}
              </div>
              <ChevronRight size={16} className="report-card-arrow" />
            </div>
          </div>
        ))}
        {submitted.length === 0 && drafts.length === 0 && (
          <p className="body-md text-muted" style={{ padding: '16px' }}>No reports created yet.</p>
        )}
      </div>
    </div>
  );
}
