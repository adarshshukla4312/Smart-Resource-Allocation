import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, PlusCircle, Image, Mic, Video, Wifi, WifiOff, ChevronRight } from 'lucide-react';
import { myReports } from '../../data/mockData';
import './MyReports.css';

function StatusBadge({ status }) {
  const map = {
    DRAFT: { label: 'FIELD DRAFT', type: 'pending' },
    SUBMITTED: { label: 'TRANSMITTED', type: 'active' },
    UNDER_REVIEW: { label: 'IN ANALYSIS', type: 'active' },
    ACTIVE: { label: 'OPERATIONAL', type: 'completed' },
    CLOSED: { label: 'ARCHIVED', type: 'rejected' },
    COMPLETED: { label: 'RESOLVED', type: 'completed' },
    REJECTED: { label: 'VOID', type: 'rejected' }
  };
  const s = map[status] || { label: status, type: 'pending' };
  return (
    <span className={`editorial-status-pill status-${s.type}`}>
      {s.label}
    </span>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function MyReports() {
  const navigate = useNavigate();
  const drafts = myReports.filter(r => r.status === 'DRAFT');
  const submitted = myReports.filter(r => r.status !== 'DRAFT');

  const renderCard = (report, i) => (
    <div 
      key={report.id} 
      className={`editorial-report-card severity-${report.severity.toLowerCase()} animate-fade-in`} 
      style={{ animationDelay: `${i * 60}ms` }}
      onClick={() => navigate(`/reports/${report.id}`)}
    >
      <div className="report-card-header">
        <StatusBadge status={report.status} />
        <div className="sync-badge">
          {report.syncStatus === 'synced' ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span className="label-sm">{report.syncStatus === 'synced' ? 'ENCRYPTED' : 'PENDING'}</span>
        </div>
      </div>
      
      <h3 className="title-md serif report-title">{report.title}</h3>
      
      <div className="report-card-meta">
        <div className="meta-item">
          <MapPin size={12} />
          <span className="label-sm">{report.location.address.split(',')[0].toUpperCase()}</span>
        </div>
        <div className="meta-item">
          <Clock size={12} />
          <span className="label-sm">{timeAgo(report.createdAt).toUpperCase()}</span>
        </div>
      </div>

      <div className="report-card-footer">
        <div className="media-inventory-chips">
          {report.mediaCount.images > 0 && <span className="mini-media-chip"><Image size={10} /> {report.mediaCount.images}</span>}
          {report.mediaCount.audio > 0 && <span className="mini-media-chip"><Mic size={10} /> {report.mediaCount.audio}</span>}
          {(report.mediaCount.shortVideos + report.mediaCount.longVideos) > 0 && <span className="mini-media-chip"><Video size={10} /> {report.mediaCount.shortVideos + report.mediaCount.longVideos}</span>}
        </div>
        <ChevronRight size={16} className="opacity-30" />
      </div>
    </div>
  );

  return (
    <div className="my-reports-page animate-fade-in">
      <div className="reports-hero">
        <div className="sync-status-editorial">
          <div className="sync-indicator">
            <Wifi size={14} />
            <span className="label-lg">CONSOLE SYNCHRONIZED</span>
          </div>
          <span className="label-lg opacity-40">{myReports.length} ASSETS</span>
        </div>
        <h1 className="display-sm serif">Field Reports</h1>
      </div>

      <div className="reports-content">
        {drafts.length > 0 && (
          <div className="reports-section">
            <div className="section-header-editorial">
              <span className="label-lg">PENDING DRAFTS</span>
              <div className="count-pill">{drafts.length}</div>
            </div>
            <div className="reports-grid">
              {drafts.map((report, i) => renderCard(report, i))}
            </div>
          </div>
        )}

        <div className="reports-section">
          <div className="section-header-editorial">
            <span className="label-lg">TRANSMITTED REPORTS</span>
          </div>
          <div className="reports-grid">
            {submitted.map((report, i) => renderCard(report, i + drafts.length))}
          </div>
        </div>
      </div>

      <div className="reports-action-bar">
        <button className="submit-btn-editorial" onClick={() => navigate('/reports/new')} id="new-report">
          <PlusCircle size={20} />
          <span>INITIALIZE FIELD REPORT</span>
        </button>
      </div>
    </div>
  );
}
