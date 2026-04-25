import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, MapPin, Search } from 'lucide-react';
import { mockTasks, SEVERITY_LEVELS, TASK_STATUSES, REPORT_TYPES } from '../data/mockData';
import './TaskQueue.css';

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

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function TaskQueue() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = mockTasks.filter(task => {
    if (filterStatus !== 'ALL' && task.status !== filterStatus) return false;
    if (filterSeverity !== 'ALL' && task.aiAnalysis.severity !== filterSeverity) return false;
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="task-queue-page">
      <div className="page-header">
        <div>
          <h1 className="headline-lg">Task Queue</h1>
          <p className="body-md text-muted">{mockTasks.length} total tasks · {mockTasks.filter(t => t.status === 'SUBMITTED').length} awaiting review</p>
        </div>
      </div>

      {/* Filters */}
      <div className="task-filters animate-fade-in">
        <div className="task-filter-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="task-search"
          />
        </div>
        <div className="task-filter-group">
          <Filter size={16} className="text-muted" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} id="filter-status">
            <option value="ALL">All Statuses</option>
            {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} id="filter-severity">
            <option value="ALL">All Severities</option>
            {SEVERITY_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Task Cards */}
      <div className="task-cards-grid">
        {filteredTasks.map((task, i) => (
          <div
            key={task.id}
            className="task-card animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
            onClick={() => navigate(`/tasks/${task.id}`)}
            role="button"
            tabIndex={0}
            id={`task-card-${task.id}`}
          >
            <div className="task-card-top">
              <StatusBadge status={task.status} />
              <span className="body-sm text-muted">{timeAgo(task.createdAt)}</span>
            </div>
            <h3 className="title-lg">{task.title}</h3>
            <p className="body-sm text-muted task-card-desc">{task.description}</p>
            <div className="task-card-meta">
              <div className="task-card-location">
                <MapPin size={14} />
                <span className="body-sm">{task.location.address.split(',')[0]}</span>
              </div>
              <SeverityBadge severity={task.managementOverride?.severity || task.aiAnalysis.severity} />
            </div>
            <div className="task-card-footer">
              <span className="label-md text-muted">By {task.employeeName}</span>
              <div className="task-card-media-counts">
                {task.mediaCount.images > 0 && <span className="media-count">🖼 {task.mediaCount.images}</span>}
                {task.mediaCount.audio > 0 && <span className="media-count">🎙 {task.mediaCount.audio}</span>}
                {(task.mediaCount.shortVideos + task.mediaCount.longVideos) > 0 && (
                  <span className="media-count">🎬 {task.mediaCount.shortVideos + task.mediaCount.longVideos}</span>
                )}
              </div>
            </div>
            {task.aiAnalysis.processingStatus === 'DONE' && (
              <div className="task-card-ai-summary">
                <span className="label-sm text-primary">AI Summary</span>
                <p className="body-sm text-muted">{task.aiAnalysis.situationSummary.substring(0, 120)}...</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="empty-state animate-fade-in">
          <p className="headline-sm text-muted">No tasks match your filters</p>
          <p className="body-md text-muted">Try adjusting the status or severity filters</p>
        </div>
      )}
    </div>
  );
}
