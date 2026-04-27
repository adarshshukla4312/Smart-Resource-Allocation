import { useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, PlusCircle, Image, Mic, Video, Wifi, WifiOff,
  ChevronRight, Zap, Sparkles, FileText, BarChart3, Send, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMyReports } from '../../hooks/useFirestoreData';
import './MyReports.css';

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

  // Quick stats
  const totalReports = myReports.length;
  const activeCount = myReports.filter(r => r.status === 'ACTIVE').length;
  const pendingCount = myReports.filter(r => ['SUBMITTED', 'UNDER_REVIEW'].includes(r.status)).length;

  return (
    <div className="my-reports-page">
      {/* Welcome Section */}
      <div className="mr-welcome animate-fade-in">
        <div className="mr-welcome-text">
          <h1 className="headline-md">
            Welcome back, {userProfile?.displayName?.split(' ')[0] || 'Officer'}
          </h1>
          <p className="body-sm text-muted">Your field reports dashboard</p>
        </div>
        <div className="mr-stats-row">
          <div className="mr-stat">
            <span className="mr-stat-value">{totalReports}</span>
            <span className="mr-stat-label">Total</span>
          </div>
          <div className="mr-stat-divider" />
          <div className="mr-stat">
            <span className="mr-stat-value">{pendingCount}</span>
            <span className="mr-stat-label">Pending</span>
          </div>
          <div className="mr-stat-divider" />
          <div className="mr-stat">
            <span className="mr-stat-value">{activeCount}</span>
            <span className="mr-stat-label">Active</span>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="mr-actions animate-fade-in" style={{ animationDelay: '100ms' }}>
        <button
          className="mr-action-card mr-action-detailed"
          onClick={() => navigate('/employee/create-report')}
          id="new-report"
        >
          <div className="mr-action-icon">
            <PlusCircle size={24} />
          </div>
          <div className="mr-action-info">
            <span className="title-md">Detailed Report</span>
            <span className="body-sm text-muted">Step-by-step with full control</span>
          </div>
          <ChevronRight size={18} className="mr-action-arrow" />
        </button>

        <button
          className="mr-action-card mr-action-quick"
          onClick={() => navigate('/employee/quick-report')}
          id="quick-report"
        >
          <div className="mr-action-icon mr-action-icon-ai">
            <Zap size={22} />
          </div>
          <div className="mr-action-info">
            <span className="title-md">Quick Report</span>
            <span className="body-sm">Upload data → AI generates the report</span>
          </div>
          <span className="mr-ai-tag">
            <Sparkles size={10} /> AI
          </span>
          <ChevronRight size={18} className="mr-action-arrow" />
        </button>
      </div>

      {/* Drafts */}
      {drafts.length > 0 && (
        <div className="mr-section animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="mr-section-header">
            <span className="mr-section-title">
              <FileText size={16} /> Drafts
            </span>
            <span className="mr-section-count">{drafts.length}</span>
          </div>
          {drafts.map((report, i) => (
            <div
              key={report.id}
              className="mr-report-card animate-fade-in"
              style={{ animationDelay: `${(i + 3) * 60}ms` }}
            >
              <div className="mr-card-top">
                <StatusBadge status={report.status} />
                <div className="mr-sync-chip">
                  {report.syncStatus === 'synced' ? <Wifi size={11} /> : <WifiOff size={11} />}
                  <span>{report.syncStatus === 'synced' ? 'Synced' : 'Pending'}</span>
                </div>
              </div>
              <h3 className="mr-card-title">{report.title}</h3>
              <div className="mr-card-meta">
                <span><MapPin size={12} /> {report.location?.address || 'Unknown'}</span>
                <span><Clock size={12} /> {timeAgo(report.createdAt)}</span>
              </div>
              <div className="mr-card-bottom">
                <SeverityBadge severity={report.employeeAssessment?.severity} />
                <div className="mr-card-media">
                  {report.mediaCount?.images > 0 && (
                    <span className="mr-media-chip"><Image size={10} /> {report.mediaCount.images}</span>
                  )}
                  {report.mediaCount?.audio > 0 && (
                    <span className="mr-media-chip"><Mic size={10} /> {report.mediaCount.audio}</span>
                  )}
                  {(report.mediaCount?.shortVideos + report.mediaCount?.longVideos) > 0 && (
                    <span className="mr-media-chip">
                      <Video size={10} /> {report.mediaCount.shortVideos + report.mediaCount.longVideos}
                    </span>
                  )}
                </div>
                {report.quickReport && (
                  <span className="mr-ai-generated"><Sparkles size={10} /> AI</span>
                )}
                <ChevronRight size={16} className="mr-card-arrow" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submitted Reports */}
      <div className="mr-section animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="mr-section-header">
          <span className="mr-section-title">
            <Send size={16} /> Submitted
          </span>
          <span className="mr-section-count">{submitted.length}</span>
        </div>
        {submitted.map((report, i) => (
          <div
            key={report.id}
            className="mr-report-card animate-fade-in"
            style={{ animationDelay: `${(i + drafts.length + 3) * 60}ms` }}
          >
            <div className="mr-card-top">
              <StatusBadge status={report.status} />
              <div className="mr-sync-chip synced">
                <Wifi size={11} />
                <span>Synced</span>
              </div>
            </div>
            <h3 className="mr-card-title">{report.title}</h3>
            <div className="mr-card-meta">
              <span><MapPin size={12} /> {report.location?.address || 'Unknown'}</span>
              <span><Clock size={12} /> {timeAgo(report.createdAt)}</span>
            </div>
            <div className="mr-card-bottom">
              <SeverityBadge severity={report.employeeAssessment?.severity || report.aiAnalysis?.severity} />
              <div className="mr-card-media">
                {report.mediaCount?.images > 0 && (
                  <span className="mr-media-chip"><Image size={10} /> {report.mediaCount.images}</span>
                )}
                {report.mediaCount?.audio > 0 && (
                  <span className="mr-media-chip"><Mic size={10} /> {report.mediaCount.audio}</span>
                )}
                {(report.mediaCount?.shortVideos + report.mediaCount?.longVideos) > 0 && (
                  <span className="mr-media-chip">
                    <Video size={10} /> {report.mediaCount.shortVideos + report.mediaCount.longVideos}
                  </span>
                )}
              </div>
              {report.quickReport && (
                <span className="mr-ai-generated"><Sparkles size={10} /> AI</span>
              )}
              <ChevronRight size={16} className="mr-card-arrow" />
            </div>
          </div>
        ))}
        {submitted.length === 0 && drafts.length === 0 && (
          <div className="mr-empty-state">
            <div className="mr-empty-icon">
              <FileText size={36} />
            </div>
            <p className="headline-sm">No reports yet</p>
            <p className="body-sm text-muted">Create your first field report to get started</p>
            <div className="mr-empty-actions">
              <button className="btn-primary" onClick={() => navigate('/employee/create-report')}>
                <PlusCircle size={16} /> Detailed Report
              </button>
              <button className="btn-secondary" onClick={() => navigate('/employee/quick-report')}>
                <Zap size={16} /> Quick Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
