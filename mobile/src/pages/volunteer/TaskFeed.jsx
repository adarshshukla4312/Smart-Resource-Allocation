import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Sparkles, Clock, Users, Filter,
  Award, Search, Calendar
} from 'lucide-react';
import { mockActiveTasks, CATEGORIES, SEVERITY_LEVELS } from '../../data/mockData';
import './TaskFeed.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function TaskFeed() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="task-feed-page animate-fade-in">
      <div className="feed-header">
        <h1 className="display-sm">Task Board</h1>
        <p className="label-lg" style={{ opacity: 0.6 }}>Find operations near your location</p>
      </div>

      <div className="feed-controls">
        <div className="feed-search-wrap">
          <Search size={18} />
          <input
            type="text"
            className="mobile-input"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          <span className="label-lg">Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="feed-filters-drawer animate-slide-down">
          <div className="filter-group">
            <div className="label-lg filter-label">Category</div>
            <div className="chip-row">
              <button
                className={`filter-chip ${filterCategory === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterCategory('ALL')}
              >All</button>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  className={`filter-chip ${filterCategory === c ? 'active' : ''}`}
                  onClick={() => setFilterCategory(c)}
                >{c}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <div className="label-lg filter-label">Priority</div>
            <div className="chip-row">
              <button
                className={`filter-chip ${filterSeverity === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterSeverity('ALL')}
              >All</button>
              {SEVERITY_LEVELS.map(s => (
                <button
                  key={s}
                  className={`filter-chip ${filterSeverity === s ? 'active' : ''}`}
                  onClick={() => setFilterSeverity(s)}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="feed-task-list">
        {filteredTasks.map((task, i) => {
          const sev = task.managementOverride?.severity || task.aiAnalysis.severity;
          const isGreatMatch = task.matchScore > 0.7;

          return (
            <div
              key={task.id}
              className={`task-feed-card severity-${sev.toLowerCase()}`}
              onClick={() => navigate(`/feed/${task.id}`)}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="feed-card-header">
                <div className="feed-card-tags">
                  {isGreatMatch && (
                    <span className="match-tag">
                      <Award size={10} /> Recommended
                    </span>
                  )}
                  <span className="label-lg category-tag">{task.aiAnalysis.category}</span>
                </div>
                <span className="label-lg text-muted">{timeAgo(task.createdAt)}</span>
              </div>

              <h3 className="task-title serif">{task.title}</h3>

              <div className="task-ai-summary">
                <Sparkles size={14} />
                <p className="body-sm">{task.aiAnalysis.situationSummary}</p>
              </div>

              <div className="task-meta-row">
                <div className="meta-item">
                  <MapPin size={12} />
                  <span>{task.distance} km away</span>
                </div>
                <div className="meta-item">
                  <Users size={12} />
                  <span>{task.acceptedCount}/{task.maxVolunteers} slots</span>
                </div>
                <div className="meta-item">
                  <div className="match-score-pill">
                    <div className="match-fill" style={{ width: `${task.matchScore * 100}%` }}></div>
                    <span className="label-lg">{Math.round(task.matchScore * 100)}% Match</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map View */}
      <div className="feed-map-view" style={{ marginTop: '24px' }}>
        <iframe
          width="100%"
          height="400px"
          style={{ border: 0, borderRadius: '24px' }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&center=28.6139,77.2090&zoom=11`}
        ></iframe>
      </div>

      {filteredTasks.length === 0 && (
        <div className="empty-state">
          <Search size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
          <h3 className="title-md serif">No matches found</h3>
          <p className="body-md text-muted">Try adjusting your filters or location</p>
        </div>
      )}
    </div>
  );
}
