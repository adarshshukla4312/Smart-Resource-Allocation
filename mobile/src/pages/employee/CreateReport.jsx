import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, MapPin, Mic, Image, Video,
  CheckCircle2, AlertTriangle, Clock, FileText, Tag, Sparkles
} from 'lucide-react';
import { REPORT_TYPES, SEVERITY_LEVELS, URGENCY_LEVELS, DOCUMENT_TAGS } from '../../data/mockData';
import './CreateReport.css';

const STEPS = ['Configuration', 'Geo-Spatial', 'Media Deck', 'Assessment', 'Review'];

export default function CreateReport() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

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
      <div className="create-report-page success-view animate-fade-in">
        <div className="report-success-editorial">
          <div className="success-icon-bubble">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="display-sm serif">Report Transmitted</h2>
          <p className="body-md text-muted editorial-para">
            Your field report has been encrypted and queued for management console synchronization. AI analysis will begin momentarily.
          </p>
          <div className="success-stats-grid">
            <div className="success-stat">
              <span className="label-lg">ID REFERENCE</span>
              <span className="serif title-md">#WF-{Math.floor(Math.random() * 9000) + 1000}</span>
            </div>
            <div className="success-stat">
              <span className="label-lg">STATUS</span>
              <span className="match-tag">SYNCHRONIZED</span>
            </div>
          </div>
          <button className="submit-btn-editorial" onClick={() => navigate('/reports')}>
            Return to Dispatch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-report-page animate-fade-in">
      <div className="report-header-editorial">
        <button className="icon-btn-minimal" onClick={() => step > 0 ? setStep(step - 1) : navigate('/reports')}>
          <ArrowLeft size={20} />
        </button>
        <div className="header-title-block">
          <span className="label-lg section-label">STEP {step + 1} OF {STEPS.length}</span>
          <h1 className="title-md serif">{STEPS[step]}</h1>
        </div>
        <div className="step-dots">
          {STEPS.map((_, i) => (
            <div key={i} className={`step-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`} />
          ))}
        </div>
      </div>


      <div className="report-content-scroll">
        {step === 0 && (
          <div className="report-step-view">
            <div className="report-field">
              <label className="label-lg field-label">SELECT REPORT CATEGORY</label>
              <div className="report-type-grid">
                {REPORT_TYPES.map(type => (
                  <button
                    key={type}
                    className={`type-selection-card ${reportType === type ? 'active' : ''}`}
                    onClick={() => setReportType(type)}
                  >
                    <div className="type-icon-box">
                      <FileText size={20} />
                    </div>
                    <span className="label-lg">{type.replace('_', ' ')}</span>
                  </button>

                ))}
              </div>
            </div>

            <div className="report-field">
              <label className="label-lg field-label">REPORT TITLE</label>
              <input
                className="editorial-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Mission identifier or incident summary"
              />
            </div>

            <div className="report-field">
              <label className="label-lg field-label">SITUATIONAL DESCRIPTION</label>
              <textarea
                className="editorial-textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detailed ground-level observations (min 30 chars)"
              />
            </div>

            <div className="report-field">
              <label className="label-lg field-label">CONTEXTUAL TAGS</label>
              <div className="chip-row">
                {DOCUMENT_TAGS.map(tag => (
                  <button
                    key={tag}
                    className={`filter-chip ${selectedTags.includes(tag) ? 'active' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >{tag}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="report-step-view">
            <div className="report-field">
              <label className="label-lg field-label">GEOSPATIAL COORDINATES</label>
              <button className="location-action-card">
                <div className="loc-icon-bubble"><MapPin size={24} /></div>
                <div className="loc-text">
                  <span className="title-md serif">Calibrate GPS</span>
                  <span className="body-sm text-muted">Initialize high-accuracy tracking</span>
                </div>
              </button>
              <div className="location-status-bar">
                <MapPin size={12} className="text-primary" />
                <span className="label-lg">LAT: 28.6304 / LNG: 77.2177</span>
              </div>
            </div>
            <div className="report-map-container" style={{ height: '250px', borderRadius: '16px', overflow: 'hidden', marginTop: '16px' }}>
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=28.6304,77.2177`}
              ></iframe>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="report-step-view">
            <div className="report-field">
              <label className="label-lg field-label">MULTIMEDIA EVIDENCE</label>
              <div className="media-capture-grid">
                <button className="capture-card" onClick={() => addMedia('audio')}>
                  <Mic size={24} />
                  <span className="label-lg">AUDIO REPORT</span>
                </button>
                <button className="capture-card" onClick={() => addMedia('image')}>
                  <Image size={24} />
                  <span className="label-lg">PHOTOGRAPHY</span>
                </button>
                <button className="capture-card" onClick={() => addMedia('video')}>
                  <Video size={24} />
                  <span className="label-lg">VIDEO FEED</span>
                </button>
              </div>
            </div>

            {attachedMedia.length > 0 && (
              <div className="attached-inventory">
                <label className="label-lg field-label">ATTACHED ASSETS ({attachedMedia.length})</label>
                <div className="inventory-grid">
                  {attachedMedia.map(m => (
                    <div key={m.id} className="inventory-item">
                      {m.type === 'audio' && <Mic size={18} />}
                      {m.type === 'image' && <Image size={18} />}
                      {m.type === 'video' && <Video size={18} />}
                      <span className="label-sm">{m.type.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="report-step-view">
            <div className="report-field">
              <label className="label-lg field-label">SEVERITY INDEX</label>
              <div className="severity-selection-list">
                {SEVERITY_LEVELS.map(s => (
                  <button
                    key={s}
                    className={`severity-btn-editorial sev-${s.toLowerCase()} ${severity === s ? 'active' : ''}`}
                    onClick={() => setSeverity(s)}
                  >
                    <span className="label-lg">{s}</span>
                    {severity === s && <CheckCircle2 size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="report-field">
              <label className="label-lg field-label">URGENCY PRIORITY</label>
              <div className="urgency-selection-stack">
                {URGENCY_LEVELS.map(u => (
                  <button
                    key={u}
                    className={`urgency-card-editorial ${urgency === u ? 'active' : ''}`}
                    onClick={() => setUrgency(u)}
                  >
                    <div className="urgency-info">
                      <span className="serif title-md">{u.replace(/_/g, ' ')}</span>
                      <span className="body-sm opacity-50">
                        {u === 'IMMEDIATE' && 'Action required within 6 hours'}
                        {u === 'SAME_DAY' && 'Action required within 24 hours'}
                        {u === 'WITHIN_WEEK' && 'Routine monitoring scheduled'}
                        {u === 'NON_URGENT' && 'Informational / Low priority'}
                      </span>
                    </div>
                    {urgency === u && <CheckCircle2 size={20} className="text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="report-step-view">
            <div className="review-summary-card">
              <div className="review-header">
                <h3 className="title-md serif">Final Verification</h3>
                <span className="match-tag">DRAFT MODE</span>
              </div>
              <div className="review-details">
                <div className="review-row">
                  <span className="label-lg opacity-40">CATEGORY</span>
                  <span className="label-lg">{reportType.replace('_', ' ')}</span>
                </div>
                <div className="review-row">
                  <span className="label-lg opacity-40">IDENTIFIER</span>
                  <span className="label-lg">{title}</span>
                </div>
                <div className="review-row vertical">
                  <span className="label-lg opacity-40">DESCRIPTION</span>
                  <p className="body-md editorial-para">{description}</p>
                </div>
                <div className="review-row">
                  <span className="label-lg opacity-40">GEO-LOCATION</span>
                  <span className="label-lg">CONNAUGHT PLACE, NEW DELHI</span>
                </div>
                <div className="review-row">
                  <span className="label-lg opacity-40">SEVERITY</span>
                  <span className={`severity-tag severity-${severity.toLowerCase()}`}>{severity}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="report-action-bar">
        {step < STEPS.length - 1 ? (
          <button
            className="submit-btn-editorial"
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
          >
            <span>CONTINUE TO {STEPS[step + 1].toUpperCase()}</span>
            <ArrowRight size={18} />
          </button>
        ) : (
          <button className="submit-btn-editorial" onClick={handleSubmit}>
            <CheckCircle2 size={18} />
            <span>TRANSMIT REPORT</span>
          </button>
        )}
      </div>
    </div>
  );
}
