import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Clock, MapPin, AlertTriangle, Activity,
  Users, Image, Mic, Video, Sparkles, ChevronRight, ArrowUpRight
} from 'lucide-react';
import { useTaskQueue, useAllTasks, useDashboardStats } from '../hooks/useFirestoreData';
import './DashboardOverview.css';

function StatCard({ stat, icon: Icon, delay }) {
  const isPositive = stat.trend >= 0;
  return (
    <div className="stat-card animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-card-header">
        <span className="label-md text-muted">{stat.label}</span>
        <div className="stat-card-icon">
          <Icon size={18} />
        </div>
      </div>
      <div className="stat-card-value display-sm">{stat.value.toLocaleString()}</div>
      <div className={`stat-card-trend ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span className="label-md">{Math.abs(stat.trend)}% from last week</span>
      </div>
    </div>
  );
}

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
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function VolunteerRing({ accepted, max }) {
  const pct = max ? Math.min(((accepted || 0) / max) * 100, 100) : 0;
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="vol-ring-wrap" title={`${accepted || 0}/${max || '∞'} volunteers`}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--surface-container-highest)" strokeWidth="3" />
        {max && (
          <circle cx="22" cy="22" r={r} fill="none" stroke="var(--primary)" strokeWidth="3"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 22 22)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        )}
      </svg>
      <span className="vol-ring-label label-md">{accepted || 0}</span>
    </div>
  );
}

function MediaIcons({ mediaCount }) {
  if (!mediaCount) return null;
  const total = (mediaCount.images || 0) + (mediaCount.audio || 0) + (mediaCount.shortVideos || 0) + (mediaCount.longVideos || 0);
  if (total === 0) return null;
  return (
    <div className="trq-media-icons">
      {mediaCount.images > 0 && <span className="trq-media-chip"><Image size={12} />{mediaCount.images}</span>}
      {mediaCount.audio > 0 && <span className="trq-media-chip"><Mic size={12} />{mediaCount.audio}</span>}
      {(mediaCount.shortVideos + mediaCount.longVideos) > 0 && (
        <span className="trq-media-chip"><Video size={12} />{mediaCount.shortVideos + mediaCount.longVideos}</span>
      )}
    </div>
  );
}

function severityColor(sev) {
  const map = { CRITICAL: 'var(--severity-critical)', HIGH: 'var(--severity-high)', MEDIUM: 'var(--severity-medium)', LOW: 'var(--severity-low)' };
  return map[sev] || 'var(--outline)';
}

export default function DashboardOverview() {
  const navigate = useNavigate();
  const { tasks: pendingTasks, loading: qLoading } = useTaskQueue();
  const { data: activeTasksData, loading: aLoading } = useAllTasks('ACTIVE');
  const { stats, loading: sLoading } = useDashboardStats();

  if (qLoading || aLoading || sLoading) {
    return <div className="loading-screen">Loading dashboard...</div>;
  }

  const allActive = activeTasksData || [];

  return (
    <div className="dashboard-overview">
      <div className="page-header">
        <div>
          <h1 className="display-md">Overview</h1>
          <p className="body-lg text-muted">A curated perspective on your global operations.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard stat={{ value: stats.activeTasks, trend: 0, label: 'Active Tasks' }} icon={Activity} delay={0} />
        <StatCard stat={{ value: stats.pendingReview, trend: 0, label: 'Pending Review' }} icon={AlertTriangle} delay={100} />
        <StatCard stat={{ value: stats.activeVolunteers, trend: 0, label: 'Active Volunteers' }} icon={MapPin} delay={200} />
        <StatCard stat={{ value: stats.completedTasks, trend: 0, label: 'Completed Tasks' }} icon={Clock} delay={300} />
      </div>

      {/* ── Task Review Queue (Premium Card-Row Design) ── */}
      <div className="section-card trq-section animate-fade-in" style={{ animationDelay: '400ms' }}>
        <div className="section-card-header">
          <div className="trq-header-left">
            <h2 className="headline-sm">Task Review Queue</h2>
            <span className="trq-counter">{pendingTasks.length} pending</span>
          </div>
          <button className="btn-tertiary" onClick={() => navigate('/admin/tasks')}>
            View All <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="trq-list">
          {pendingTasks.slice(0, 6).map((task, i) => {
            const sev = task.managementOverride?.severity || task.aiAnalysis?.severity || 'LOW';
            return (
              <div
                key={task.id}
                className="trq-card animate-fade-in"
                style={{ animationDelay: `${500 + i * 70}ms` }}
                onClick={() => navigate(`/admin/tasks/${task.id}`)}
                role="button"
                tabIndex={0}
              >
                {/* Severity accent stripe */}
                <div className="trq-severity-stripe" style={{ background: severityColor(sev) }} />

                {/* Main content */}
                <div className="trq-card-body">
                  {/* Row 1: Status + time */}
                  <div className="trq-card-topline">
                    <div className="trq-card-badges">
                      <StatusBadge status={task.status} />
                      <SeverityBadge severity={sev} />
                    </div>
                    <span className="label-md text-muted">{timeAgo(task.createdAt)}</span>
                  </div>

                  {/* Row 2: Title */}
                  <h3 className="trq-card-title title-lg">{task.title}</h3>

                  {/* Row 3: AI one-liner */}
                  <p className="trq-ai-snippet body-sm text-muted">
                    <Sparkles size={12} className="trq-ai-icon" />
                    {task.aiAnalysis?.situationSummary?.substring(0, 130) || 'Pending AI Analysis...'}
                  </p>

                  {/* Row 4: Meta chips */}
                  <div className="trq-card-meta">
                    <span className="trq-meta-chip">
                      <MapPin size={13} /> {task.location?.address?.split(',')[0] || 'Unknown location'}
                    </span>
                    <span className="trq-meta-chip">
                      <Users size={13} /> {task.employeeName || 'Unknown Employee'}
                    </span>
                    <span className="trq-meta-chip trq-meta-affected">
                      {task.aiAnalysis?.estimatedAffected?.toLocaleString() || '?'} affected
                    </span>
                    <MediaIcons mediaCount={task.mediaCount} />
                  </div>
                </div>

                {/* Right: Volunteer ring + arrow */}
                <div className="trq-card-right">
                  <VolunteerRing accepted={task.acceptedCount} max={task.maxVolunteers} />
                  <ChevronRight size={16} className="trq-card-arrow" />
                </div>
              </div>
            );
          })}
          {pendingTasks.length === 0 && (
            <div className="trq-empty-state">
              <p className="body-md text-muted">No tasks pending review.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Active Tasks + Map placeholder */}
      <div className="dashboard-bottom-row">
        <div className="section-card animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="section-card-header">
            <h2 className="headline-sm">Active Tasks</h2>
            <span className="label-md text-muted">{allActive.length} tasks live</span>
          </div>
          <div className="active-tasks-list">
            {allActive.map((task) => (
              <div 
                key={task.id} 
                className="active-task-card"
                onClick={() => navigate(`/admin/tasks/${task.id}`)}
                role="button"
                tabIndex={0}
              >
                <div className="active-task-info">
                  <span className="title-md">{task.title}</span>
                  <div className="active-task-meta">
                    <SeverityBadge severity={task.managementOverride?.severity || task.aiAnalysis?.severity} />
                    <span className="body-sm text-muted">{task.acceptedCount || 0}/{task.maxVolunteers || '∞'} volunteers</span>
                  </div>
                </div>
                <div className="active-task-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${task.maxVolunteers ? ((task.acceptedCount || 0) / task.maxVolunteers * 100) : 30}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            {allActive.length === 0 && (
              <p className="body-sm text-muted" style={{ padding: '16px' }}>No active tasks at the moment.</p>
            )}
          </div>
        </div>

        <div className="section-card map-placeholder animate-fade-in" style={{ animationDelay: '700ms' }}>
          <div className="section-card-header">
            <h2 className="headline-sm">Live Task Map</h2>
          </div>
          <div className="map-container" style={{ height: '400px', padding: '0' }}>
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '12px' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/search?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=emergency+relief+centers+near+Delhi`}
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
