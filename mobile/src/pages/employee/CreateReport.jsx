import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, MapPin, Mic, Image, Video,
  CheckCircle2, AlertTriangle, Clock, FileText, Tag
} from 'lucide-react';
import { REPORT_TYPES, SEVERITY_LEVELS, URGENCY_LEVELS, DOCUMENT_TAGS } from '../../data/mockData';
import './CreateReport.css';

const STEPS = ['Type & Info', 'Location', 'Media', 'Assessment', 'Review'];

export default function CreateReport() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [reportType, setReportType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [severity, setSeverity] = useState('');
  const [urgency, setUrgency] = useState('');
  const [attachedMedia, setAttachedMedia] = useState([]);

  const toggleTag = (tag) => {
    setSelectedTags(selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    );
  };

  const addMedia = (type) => {
    setAttachedMedia([...attachedMedia, { type, id: Date.now() }]);
  };

  const canNext = () => {
    if (step === 0) return reportType && title.trim().length > 0 && description.trim().length >= 30;
    if (step === 3) return severity && urgency;
    return true;
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="create-report-page">
        <div className="report-success animate-scale-in">
          <div className="report-success-icon">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="headline-md">Report Submitted!</h2>
          <p className="body-md text-muted">
            Your report has been queued for management review. AI processing will begin when synced.
          </p>
          <div className="report-success-info">
            <span className="label-md text-muted">Status</span>
            <span className="status-badge status-submitted">Submitted</span>
          </div>
          <button className="btn-primary" onClick={() => navigate('/reports')} style={{ marginTop: '24px' }}>
            View My Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-report-page">
      {/* Header */}
      <div className="report-header">
        <button className="report-back-btn" onClick={() => step > 0 ? setStep(step - 1) : navigate('/reports')}>
          <ArrowLeft size={20} />
        </button>
        <span className="title-md">{STEPS[step]}</span>
        <span className="label-md text-muted">{step + 1}/{STEPS.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="report-progress">
        {STEPS.map((_, i) => (
          <div key={i} className={`report-progress-dot ${i <= step ? 'active' : ''} ${i === step ? 'current' : ''}`} />
        ))}
        <div className="report-progress-line">
          <div className="report-progress-fill" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}></div>
        </div>
      </div>

      {/* Step 0: Type & Info */}
      {step === 0 && (
        <div className="report-step animate-fade-in">
          <div className="report-field">
            <label className="label-lg">Report Type *</label>
            <div className="report-type-grid">
              {REPORT_TYPES.map(type => (
                <button
                  key={type}
                  className={`report-type-btn ${reportType === type ? 'active' : ''}`}
                  onClick={() => setReportType(type)}
                >
                  <FileText size={18} />
                  <span className="label-md">{type.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="report-field">
            <label className="label-lg" htmlFor="report-title">Title *</label>
            <input
              id="report-title"
              className="mobile-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Short descriptive title (max 120 chars)"
              maxLength={120}
            />
            <span className="label-sm text-muted">{title.length}/120</span>
          </div>

          <div className="report-field">
            <label className="label-lg" htmlFor="report-desc">Description *</label>
            <textarea
              id="report-desc"
              className="mobile-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed description of the situation (min 30 chars)"
            />
            <span className={`label-sm ${description.length < 30 ? 'text-error' : 'text-muted'}`}>
              {description.length}/30 min characters
            </span>
          </div>

          <div className="report-field">
            <label className="label-lg">
              <Tag size={14} /> Document Tags
            </label>
            <div className="profile-chips">
              {DOCUMENT_TAGS.map(tag => (
                <button
                  key={tag}
                  className={`chip ${selectedTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >{tag}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="report-step animate-fade-in">
          <div className="report-field">
            <label className="label-lg">Location *</label>
            <button className="report-location-btn">
              <MapPin size={20} />
              <div>
                <span className="title-md">Record Current Location</span>
                <span className="body-sm text-muted">GPS auto-detection</span>
              </div>
            </button>
            <div className="report-location-result">
              <MapPin size={14} className="text-primary" />
              <span className="body-sm">Connaught Place, New Delhi — 28.6304, 77.2177</span>
            </div>
          </div>
          <div className="report-map-placeholder">
            <MapPin size={32} className="text-primary" />
            <span className="label-md">Google Maps Picker</span>
            <span className="label-sm text-muted">Tap to adjust location manually</span>
          </div>
        </div>
      )}

      {/* Step 2: Media */}
      {step === 2 && (
        <div className="report-step animate-fade-in">
          <div className="report-field">
            <label className="label-lg">Media Attachments</label>
            <p className="body-sm text-muted" style={{ marginBottom: '12px' }}>
              Up to 10 images, 3 short videos (≤45s), and 2 long videos.
            </p>

            <div className="report-media-btns">
              <button className="report-media-btn" onClick={() => addMedia('audio')}>
                <Mic size={24} />
                <span className="label-md">Record Audio</span>
                <span className="label-sm text-muted">Interview / observation</span>
              </button>
              <button className="report-media-btn" onClick={() => addMedia('image')}>
                <Image size={24} />
                <span className="label-md">Add Photos</span>
                <span className="label-sm text-muted">Max 10, 20MB each</span>
              </button>
              <button className="report-media-btn" onClick={() => addMedia('video')}>
                <Video size={24} />
                <span className="label-md">Record Video</span>
                <span className="label-sm text-muted">Short ≤45s or long</span>
              </button>
            </div>
          </div>

          {attachedMedia.length > 0 && (
            <div className="report-attached">
              <span className="label-lg">{attachedMedia.length} file{attachedMedia.length > 1 ? 's' : ''} attached</span>
              <div className="report-attached-grid">
                {attachedMedia.map(m => (
                  <div key={m.id} className="report-attached-item">
                    {m.type === 'audio' && <Mic size={18} />}
                    {m.type === 'image' && <Image size={18} />}
                    {m.type === 'video' && <Video size={18} />}
                    <span className="label-sm">{m.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Assessment */}
      {step === 3 && (
        <div className="report-step animate-fade-in">
          <div className="report-field">
            <label className="label-lg">
              <AlertTriangle size={14} /> Severity Assessment *
            </label>
            <p className="body-sm text-muted" style={{ marginBottom: '12px' }}>
              Your ground-level assessment. This is shown alongside AI prediction to management.
            </p>
            <div className="report-severity-grid">
              {SEVERITY_LEVELS.map(s => (
                <button
                  key={s}
                  className={`report-severity-btn severity-opt-${s.toLowerCase()} ${severity === s ? 'active' : ''}`}
                  onClick={() => setSeverity(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="report-field">
            <label className="label-lg">
              <Clock size={14} /> Urgency Assessment *
            </label>
            <div className="report-urgency-list">
              {URGENCY_LEVELS.map(u => (
                <button
                  key={u}
                  className={`report-urgency-btn ${urgency === u ? 'active' : ''}`}
                  onClick={() => setUrgency(u)}
                >
                  <span className="title-md">{u.replace(/_/g, ' ')}</span>
                  <span className="body-sm text-muted">
                    {u === 'IMMEDIATE' && '< 6 hours'}
                    {u === 'SAME_DAY' && 'Within today'}
                    {u === 'WITHIN_WEEK' && 'This week'}
                    {u === 'NON_URGENT' && 'No time pressure'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="report-step animate-fade-in">
          <div className="report-review-section">
            <span className="label-sm text-muted">REPORT TYPE</span>
            <span className="title-md">{reportType.replace('_', ' ')}</span>
          </div>
          <div className="report-review-section">
            <span className="label-sm text-muted">TITLE</span>
            <span className="title-md">{title}</span>
          </div>
          <div className="report-review-section">
            <span className="label-sm text-muted">DESCRIPTION</span>
            <p className="body-md">{description}</p>
          </div>
          {selectedTags.length > 0 && (
            <div className="report-review-section">
              <span className="label-sm text-muted">TAGS</span>
              <div className="profile-chips">
                {selectedTags.map(t => <span key={t} className="chip active">{t}</span>)}
              </div>
            </div>
          )}
          <div className="report-review-section">
            <span className="label-sm text-muted">LOCATION</span>
            <span className="body-md">Connaught Place, New Delhi</span>
          </div>
          <div className="report-review-section">
            <span className="label-sm text-muted">MEDIA</span>
            <span className="body-md">{attachedMedia.length} file{attachedMedia.length !== 1 ? 's' : ''} attached</span>
          </div>
          <div className="report-review-row">
            <div className="report-review-section" style={{ flex: 1 }}>
              <span className="label-sm text-muted">SEVERITY</span>
              <span className={`severity-badge severity-${severity.toLowerCase()}`}>{severity}</span>
            </div>
            <div className="report-review-section" style={{ flex: 1 }}>
              <span className="label-sm text-muted">URGENCY</span>
              <span className="title-md">{urgency.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="report-nav">
        {step < STEPS.length - 1 ? (
          <button
            className="btn-primary"
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSubmit} id="submit-report">
            <CheckCircle2 size={18} />
            <span>Submit Report</span>
          </button>
        )}
      </div>
    </div>
  );
}
