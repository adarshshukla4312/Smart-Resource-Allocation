import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Sparkles, Clock, Users, Filter,
  Award, ChevronRight, Map, List, Search
} from 'lucide-react';
import { mockActiveTasks, CATEGORIES, SEVERITY_LEVELS, currentVolunteerProfile, myApplications } from '../../data/mockData';
import TaskDetailModal from '../../components/volunteer/TaskDetailModal';
import './TaskFeed.css';

function SeverityBadge({ severity }) {
  return <span className={`severity-badge severity-${severity.toLowerCase()}`}>{severity}</span>;
}

function CategoryBadge({ category }) {
  return <span className="category-badge">{category}</span>;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function TaskFeed() {
  const navigate = useNavigate();
  
  // Volunteer Level Logic
  const completedTasksCount = myApplications.filter(app => app.status === 'ACCEPTED').length + 9; // mock completed tasks base = 9 + accepted apps
  const totalHours = completedTasksCount * 3.5; // dummy hours
  let level = 'Newcomer';
  let nextLevelThreshold = 6;
  let progress = 0;

  if (completedTasksCount <= 5) {
    level = 'Newcomer';
    nextLevelThreshold = 6;
    progress = (completedTasksCount / 6) * 100;
  } else if (completedTasksCount <= 15) {
    level = 'Rising Helper';
    nextLevelThreshold = 16;
    progress = ((completedTasksCount - 5) / 11) * 100;
  } else if (completedTasksCount <= 30) {
    level = 'Active Contributor';
    nextLevelThreshold = 31;
    progress = ((completedTasksCount - 15) / 15) * 100;
  } else {
    level = 'Community Hero';
    nextLevelThreshold = completedTasksCount;
    progress = 100;
  }
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const handleTaskClick = (taskId) => {
    if (window.innerWidth > 768) {
      setSelectedTaskId(taskId);
    } else {
      navigate(`/volunteer/feed/${taskId}`);
    }
  };

  const filteredTasks = mockActiveTasks
    .filter(task => {
      const cat = task.managementOverride?.category || task.aiAnalysis.category;
      const sev = task.managementOverride?.severity || task.aiAnalysis.severity;
      if (filterCategory !== 'ALL' && cat !== filterCategory) return false;
      if (filterSeverity !== 'ALL' && sev !== filterSeverity) return false;
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="task-feed-page">
      {/* Volunteer Overview Card */}
      <div className="volunteer-overview-card animate-fade-in" style={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        borderRadius: '12px', 
        padding: '16px', 
        marginBottom: '20px',
        border: '1px solid var(--outline)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div className="profile-avatar" style={{ width: '56px', height: '56px', fontSize: '24px' }}>
            {currentVolunteerProfile?.displayName?.charAt(0) || 'V'}
          </div>
          <div>
            <h2 className="title-lg">{currentVolunteerProfile?.displayName || 'Volunteer'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
              <Award size={14} />
              <span className="label-md">{level}</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <span className="display-sm">{completedTasksCount}</span>
            <div className="label-sm text-muted">Tasks Completed</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <span className="display-sm">{totalHours.toFixed(1)}</span>
            <div className="label-sm text-muted">Hours Served</div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span className="label-sm text-muted">Progress to next level</span>
            <span className="label-sm">{completedTasksCount} / {nextLevelThreshold}</span>
          </div>
          <div className="feed-match-bar" style={{ background: 'rgba(255,255,255,0.1)', height: '6px' }}>
            <div className="feed-match-fill" style={{ width: `${progress}%`, background: 'var(--primary)', height: '100%', borderRadius: '4px' }}></div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="feed-search-bar">
        <div className="feed-search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search tasks near you..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="feed-search"
          />
        </div>
        <button
          className={`feed-filter-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
        >
          <Filter size={18} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="feed-filters animate-fade-in">
          <div className="feed-filter-row">
            <span className="label-md text-muted">Category</span>
            <div className="feed-chip-row">
              <button
                className={`chip ${filterCategory === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterCategory('ALL')}
              >All</button>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  className={`chip ${filterCategory === c ? 'active' : ''}`}
                  onClick={() => setFilterCategory(c)}
                >{c}</button>
              ))}
            </div>
          </div>
          <div className="feed-filter-row">
            <span className="label-md text-muted">Severity</span>
            <div className="feed-chip-row">
              <button
                className={`chip ${filterSeverity === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterSeverity('ALL')}
              >All</button>
              {SEVERITY_LEVELS.map(s => (
                <button
                  key={s}
                  className={`chip ${filterSeverity === s ? 'active' : ''}`}
                  onClick={() => setFilterSeverity(s)}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="feed-view-toggle">
        <span className="label-lg">{filteredTasks.length} tasks near you</span>
        <div className="feed-view-btns">
          <button
            className={`feed-view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          ><List size={16} /></button>
          <button
            className={`feed-view-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
            aria-label="Map view"
          ><Map size={16} /></button>
        </div>
      </div>

      {viewMode === 'list' ? (
        /* Task Cards */
        <div className="feed-task-list">
          {filteredTasks.map((task, i) => {
            const sev = task.managementOverride?.severity || task.aiAnalysis.severity;
            const cat = task.managementOverride?.category || task.aiAnalysis.category;
            const isGreatMatch = task.matchScore > 0.7;
            const slotsLeft = task.maxVolunteers ? task.maxVolunteers - task.acceptedCount : null;

            return (
              <div
                key={task.id}
                className="feed-task-card animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => handleTaskClick(task.id)}
                role="button"
                tabIndex={0}
                id={`feed-card-${task.id}`}
              >
                {/* Top Row: Match Badge + Time */}
                <div className="feed-card-topline">
                  <div className="feed-card-badges">
                    {isGreatMatch && (
                      <span className="great-match-badge">
                        <Award size={10} /> Great Match
                      </span>
                    )}
                    <CategoryBadge category={cat} />
                  </div>
                  <span className="label-md text-muted">{timeAgo(task.createdAt)}</span>
                </div>

                {/* Title */}
                <h3 className="title-lg feed-card-title">{task.title}</h3>

                {/* AI Summary */}
                <div className="feed-ai-snippet">
                  <Sparkles size={12} className="feed-ai-icon" />
                  <p className="body-sm text-muted">
                    {task.aiAnalysis.situationSummary.substring(0, 120)}…
                  </p>
                </div>

                {/* Meta Row */}
                <div className="feed-card-meta">
                  <div className="feed-meta-item">
                    <MapPin size={13} />
                    <span className="body-sm">{task.distance} km</span>
                  </div>
                  <SeverityBadge severity={sev} />
                  <div className="feed-meta-item">
                    <Users size={13} />
                    <span className="body-sm">
                      {slotsLeft !== null ? `${slotsLeft} slots left` : 'Open'}
                    </span>
                  </div>
                  <div className="feed-meta-item feed-meta-affected">
                    <span className="body-sm">{task.aiAnalysis.estimatedAffected} affected</span>
                  </div>
                </div>

                {/* Match Score Bar */}
                <div className="feed-match-row">
                  <span className="label-md text-muted">Match</span>
                  <div className="feed-match-bar">
                    <div
                      className="feed-match-fill"
                      style={{ width: `${Math.round(task.matchScore * 100)}%` }}
                    ></div>
                  </div>
                  <span className="label-lg text-primary">{Math.round(task.matchScore * 100)}%</span>
                  <ChevronRight size={16} className="feed-card-arrow" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Map View Placeholder */
        <div className="feed-map-view">
          <div className="feed-map-placeholder">
            {filteredTasks.map((task, i) => (
              <div
                key={task.id}
                className="feed-map-pin"
                style={{
                  top: `${20 + (i * 15)}%`,
                  left: `${15 + (i * 18)}%`,
                  animationDelay: `${i * 200}ms`,
                }}
                onClick={() => handleTaskClick(task.id)}
              >
                <MapPin size={24} />
                <span className="feed-map-pin-label label-sm">
                  {task.title.split('—')[0].trim()}
                </span>
              </div>
            ))}
            <div className="feed-map-overlay">
              <Map size={32} />
              <span className="label-md">Google Maps integration</span>
              <span className="label-sm text-muted">Connect API key to enable</span>
            </div>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search size={28} />
          </div>
          <p className="headline-sm text-muted">No tasks match your filters</p>
          <p className="body-md text-muted">Try adjusting the category or severity</p>
        </div>
      )}

      <TaskDetailModal 
        taskId={selectedTaskId} 
        isOpen={!!selectedTaskId} 
        onClose={() => setSelectedTaskId(null)} 
      />
    </div>
  );
}
