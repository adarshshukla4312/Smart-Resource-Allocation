import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, Upload, Image, Video, Mic, FileText, File,
  Trash2, MapPin, CheckCircle2, AlertTriangle, Clock, Loader2,
  Edit3, Send, Zap, X, Tag
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { generateQuickReport } from '../../services/aiAnalysis';
import { SEVERITY_LEVELS, URGENCY_LEVELS, REPORT_TYPES, SKILLS, DOCUMENT_TAGS } from '../../data/mockData';
import './QuickReport.css';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '280px',
  borderRadius: '16px',
};

const FILE_TYPE_ICONS = {
  image: Image,
  video: Video,
  audio: Mic,
  pdf: FileText,
  other: File,
};

function getFileCategory(file) {
  const type = file.type || '';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type === 'application/pdf') return 'pdf';
  return 'other';
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function QuickReport() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('collect'); // 'collect' | 'processing' | 'review'
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phase 1: Collection state
  const [files, setFiles] = useState([]);
  const [situation, setSituation] = useState('');
  const [helpNeeded, setHelpNeeded] = useState('');
  const [lat, setLat] = useState(28.6304);
  const [lng, setLng] = useState(77.2177);
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [aiError, setAiError] = useState('');

  // Phase 2: AI-generated fields (editable)
  const [genTitle, setGenTitle] = useState('');
  const [genDescription, setGenDescription] = useState('');
  const [genReportType, setGenReportType] = useState('');
  const [genTags, setGenTags] = useState([]);
  const [genSeverity, setGenSeverity] = useState('');
  const [genUrgency, setGenUrgency] = useState('');
  const [genCategory, setGenCategory] = useState('');
  const [genSkills, setGenSkills] = useState([]);
  const [genAffected, setGenAffected] = useState('');
  const [genSummary, setGenSummary] = useState('');
  const [genObservations, setGenObservations] = useState([]);

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });
  const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  // File handling
  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('drag-over');
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    addFiles(selected);
    e.target.value = '';
  };

  const addFiles = async (newFiles) => {
    const { default: imageCompression } = await import('browser-image-compression');
    const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, initialQuality: 0.8 };
    
    const processed = await Promise.all(newFiles.map(async (file) => {
      let finalFile = file;
      if (file.type.startsWith('image/')) {
        try {
          finalFile = await imageCompression(file, options);
        } catch (e) {
          console.error("Compression error:", e);
        }
      }
      return {
        id: Date.now() + Math.random(),
        file: finalFile,
        name: finalFile.name,
        size: finalFile.size,
        category: getFileCategory(finalFile),
        previewUrl: finalFile.type.startsWith('image/') ? URL.createObjectURL(finalFile) : null,
      };
    }));
    setFiles(prev => [...prev, ...processed]);
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  // Location
  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setIsLocating(false);
      },
      () => { setIsLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();
      if (data.results?.length > 0) {
        setAddress(data.results[0].formatted_address);
      }
    } catch { /* fallback to coordinates */ }
  };

  const handleMapClick = (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setLat(newLat);
    setLng(newLng);
    reverseGeocode(newLat, newLng);
  };

  // AI Generation
  const handleGenerate = async () => {
    setPhase('processing');
    setAiError('');
    try {
      const rawFiles = files.map(f => f.file);
      const result = await generateQuickReport(rawFiles, situation, helpNeeded);

      setGenTitle(result.title || '');
      setGenDescription(result.description || '');
      setGenReportType(result.reportType || '');
      setGenTags(result.tags || []);
      setGenSeverity(result.severity || '');
      setGenUrgency(result.urgency || '');
      setGenCategory(result.category || '');
      setGenSkills(result.requiredSkills || []);
      setGenAffected(result.estimatedAffected?.toString() || '');
      setGenSummary(result.situationSummary || '');
      setGenObservations(result.keyObservations || []);
      setPhase('review');
    } catch (err) {
      setAiError(err.message || 'AI processing failed');
      setPhase('collect');
    }
  };

  // Submit to Firestore
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { collection, addDoc, serverTimestamp, db, auth, storage } = await import('../../firebase.js');
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { setDoc, doc } = await import('firebase/firestore');

      const mediaCounts = { images: 0, audio: 0, shortVideos: 0, longVideos: 0 };
      files.forEach(f => {
        if (f.category === 'image') mediaCounts.images++;
        if (f.category === 'audio') mediaCounts.audio++;
        if (f.category === 'video') mediaCounts.shortVideos++;
      });

      const fullTaskData = {
        title: genTitle.trim(),
        description: genDescription.trim(),
        reportType: genReportType,
        tags: genTags,
        status: 'SUBMITTED',
        employeeId: auth.currentUser?.uid,
        employeeName: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Unknown',
        location: { lat, lng, address },
        requiredSkills: genSkills,
        employeeAssessment: {
          severity: genSeverity,
          urgency: genUrgency,
        },
        aiAnalysis: {
          situationSummary: genSummary,
          category: genCategory,
          severity: genSeverity,
          urgency: genUrgency,
          estimatedAffected: genAffected ? parseInt(genAffected) : null,
          keyObservations: genObservations,
          processingStatus: 'DONE',
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        mediaCount: mediaCounts,
        maxVolunteers: 0,
        acceptedCount: 0,
        quickReport: true, // Flag this as AI-generated quick report
      };

      const docRef = await addDoc(collection(db, 'tasks'), fullTaskData);

      // Upload media files
      const uploadPromises = files.map(async (fileItem) => {
        const attachmentId = `m_${fileItem.id}`;
        const filePath = `tasks/${docRef.id}/media/${attachmentId}/${fileItem.name}`;
        const storageRef = ref(storage, filePath);

        await uploadBytes(storageRef, fileItem.file);
        const downloadUrl = await getDownloadURL(storageRef);

        await setDoc(doc(db, 'tasks', docRef.id, 'media', attachmentId), {
          id: attachmentId,
          taskId: docRef.id,
          type: fileItem.category.toUpperCase(),
          storagePath: filePath,
          downloadURL: downloadUrl,
          processingStatus: 'PENDING',
          aiCaption: '',
          uploadedAt: serverTimestamp(),
          metadata: {
            sizeBytes: fileItem.size,
            originalName: fileItem.name,
          }
        });
      });

      await Promise.all(uploadPromises);
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canGenerate = files.length > 0 && situation.trim().length >= 10 && helpNeeded.trim().length >= 10;

  // === SUCCESS SCREEN ===
  if (submitted) {
    return (
      <div className="quick-report-page">
        <div className="qr-success animate-scale-in">
          <div className="qr-success-icon">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="headline-md">Quick Report Submitted!</h2>
          <p className="body-md text-muted">
            Your AI-generated report has been submitted for management review.
          </p>
          <div className="qr-success-badges">
            <span className="status-badge status-submitted">Submitted</span>
            <span className="qr-ai-badge"><Sparkles size={12} /> AI Generated</span>
          </div>
          <button className="btn-primary" onClick={() => navigate('/employee/reports')} style={{ marginTop: '24px' }}>
            View My Reports
          </button>
        </div>
      </div>
    );
  }

  // === PROCESSING SCREEN ===
  if (phase === 'processing') {
    return (
      <div className="quick-report-page">
        <div className="qr-processing">
          <div className="qr-processing-anim">
            <div className="qr-sparkle-orbit">
              <Sparkles size={32} className="qr-sparkle-icon" />
            </div>
            <div className="qr-pulse-ring"></div>
            <div className="qr-pulse-ring delay-1"></div>
            <div className="qr-pulse-ring delay-2"></div>
          </div>
          <h2 className="headline-md">AI is analyzing your data...</h2>
          <p className="body-md text-muted">
            Processing {files.length} file{files.length > 1 ? 's' : ''} and generating report fields
          </p>
          <div className="qr-processing-steps">
            <div className="qr-proc-step active"><Image size={14} /> Analyzing images</div>
            <div className="qr-proc-step active"><FileText size={14} /> Extracting document data</div>
            <div className="qr-proc-step active"><Sparkles size={14} /> Generating report</div>
          </div>
        </div>
      </div>
    );
  }

  // === REVIEW SCREEN (Phase 2) ===
  if (phase === 'review') {
    return (
      <div className="quick-report-page">
        <div className="qr-header">
          <button className="qr-back-btn" onClick={() => setPhase('collect')}>
            <ArrowLeft size={20} />
          </button>
          <div className="qr-header-title">
            <Sparkles size={18} className="text-primary" />
            <span className="title-md">AI-Generated Report</span>
          </div>
          <span className="qr-ai-badge"><Sparkles size={12} /> Review & Edit</span>
        </div>

        <div className="qr-review-banner animate-fade-in">
          <Sparkles size={16} />
          <span className="body-sm">AI has generated all fields. Review and edit anything before submitting.</span>
        </div>

        <div className="qr-review-form animate-fade-in">
          {/* Title */}
          <div className="qr-field">
            <label className="qr-field-label">
              <Edit3 size={14} /> Title
            </label>
            <input
              type="text"
              className="qr-input"
              value={genTitle}
              onChange={e => setGenTitle(e.target.value)}
              maxLength={120}
            />
          </div>

          {/* Description */}
          <div className="qr-field">
            <label className="qr-field-label">
              <Edit3 size={14} /> Description
            </label>
            <textarea
              className="qr-textarea"
              value={genDescription}
              onChange={e => setGenDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* AI Summary */}
          <div className="qr-field">
            <label className="qr-field-label">
              <Sparkles size={14} /> AI Situation Summary
            </label>
            <textarea
              className="qr-textarea qr-textarea-summary"
              value={genSummary}
              onChange={e => setGenSummary(e.target.value)}
              rows={3}
            />
          </div>

          {/* Report Type */}
          <div className="qr-field">
            <label className="qr-field-label">Report Type</label>
            <div className="qr-chip-grid">
              {REPORT_TYPES.map(type => (
                <button
                  key={type}
                  className={`qr-chip ${genReportType === type ? 'active' : ''}`}
                  onClick={() => setGenReportType(type)}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="qr-field">
            <label className="qr-field-label">Category</label>
            <select className="qr-select" value={genCategory} onChange={e => setGenCategory(e.target.value)}>
              {['Medical Emergency', 'Infrastructure', 'Food & Water', 'Education', 'Shelter', 'Environmental', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Severity & Urgency */}
          <div className="qr-row">
            <div className="qr-field" style={{ flex: 1 }}>
              <label className="qr-field-label">
                <AlertTriangle size={14} /> Severity
              </label>
              <div className="qr-chip-grid">
                {SEVERITY_LEVELS.map(s => (
                  <button
                    key={s}
                    className={`qr-chip severity-chip severity-opt-${s.toLowerCase()} ${genSeverity === s ? 'active' : ''}`}
                    onClick={() => setGenSeverity(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="qr-field" style={{ flex: 1 }}>
              <label className="qr-field-label">
                <Clock size={14} /> Urgency
              </label>
              <div className="qr-chip-grid">
                {URGENCY_LEVELS.map(u => (
                  <button
                    key={u}
                    className={`qr-chip ${genUrgency === u ? 'active' : ''}`}
                    onClick={() => setGenUrgency(u)}
                  >
                    {u.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="qr-field">
            <label className="qr-field-label"><Tag size={14} /> Tags</label>
            <div className="qr-chip-grid">
              {DOCUMENT_TAGS.map(tag => (
                <button
                  key={tag}
                  className={`qr-chip ${genTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => setGenTags(prev =>
                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Required Skills */}
          <div className="qr-field">
            <label className="qr-field-label">Required Skills</label>
            <div className="qr-chip-grid">
              {SKILLS.map(skill => (
                <button
                  key={skill}
                  className={`qr-chip ${genSkills.includes(skill) ? 'active' : ''}`}
                  onClick={() => setGenSkills(prev =>
                    prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Affected */}
          <div className="qr-field">
            <label className="qr-field-label">Estimated People Affected</label>
            <input
              type="number"
              className="qr-input"
              value={genAffected}
              onChange={e => setGenAffected(e.target.value)}
              placeholder="e.g., 200"
              min={0}
            />
          </div>

          {/* Key Observations */}
          <div className="qr-field">
            <label className="qr-field-label">
              <Sparkles size={14} /> Key Observations
            </label>
            <div className="qr-observations">
              {genObservations.map((obs, i) => (
                <div key={i} className="qr-observation-item">
                  <AlertTriangle size={12} className="text-primary" />
                  <input
                    type="text"
                    className="qr-input qr-obs-input"
                    value={obs}
                    onChange={e => {
                      const updated = [...genObservations];
                      updated[i] = e.target.value;
                      setGenObservations(updated);
                    }}
                  />
                  <button className="qr-obs-remove" onClick={() => {
                    setGenObservations(prev => prev.filter((_, idx) => idx !== i));
                  }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Location Display */}
          <div className="qr-field">
            <label className="qr-field-label"><MapPin size={14} /> Location</label>
            <p className="body-sm text-muted">{address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}</p>
          </div>

          {/* Media Summary */}
          <div className="qr-field">
            <label className="qr-field-label">Attached Media</label>
            <div className="qr-media-summary">
              {files.map(f => (
                <div key={f.id} className="qr-media-summary-item">
                  {f.previewUrl ? (
                    <img src={f.previewUrl} alt={f.name} />
                  ) : (
                    (() => { const Icon = FILE_TYPE_ICONS[f.category] || File; return <Icon size={16} />; })()
                  )}
                  <span className="label-sm">{f.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="qr-submit-area">
          <button
            className="btn-primary qr-submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting || !genTitle.trim()}
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="spin-icon" /> Submitting...</>
            ) : (
              <><Send size={18} /> Submit Report</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // === COLLECTION SCREEN (Phase 1) ===
  return (
    <div className="quick-report-page">
      <div className="qr-header">
        <button className="qr-back-btn" onClick={() => navigate('/employee/reports')}>
          <ArrowLeft size={20} />
        </button>
        <div className="qr-header-title">
          <Zap size={18} className="text-primary" />
          <span className="title-md">Quick Report</span>
        </div>
        <span className="qr-ai-badge"><Sparkles size={12} /> AI Powered</span>
      </div>

      <div className="qr-intro animate-fade-in">
        <div className="qr-intro-icon">
          <Sparkles size={28} />
        </div>
        <h2 className="headline-md">Drop your data, AI does the rest</h2>
        <p className="body-sm text-muted">
          Upload images, videos, audio, or PDFs from the field. Describe the situation briefly and our AI will generate a complete report.
        </p>
      </div>

      {aiError && (
        <div className="qr-error animate-fade-in">
          <AlertTriangle size={16} />
          <span className="body-sm">{aiError}</span>
          <button onClick={() => setAiError('')}><X size={14} /></button>
        </div>
      )}

      {/* Upload Zone */}
      <div className="qr-section animate-fade-in" style={{ animationDelay: '100ms' }}>
        <label className="qr-section-label">
          <Upload size={16} /> Upload Data
        </label>
        <div
          ref={dropZoneRef}
          className="qr-drop-zone"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); dropZoneRef.current?.classList.add('drag-over'); }}
          onDragLeave={() => dropZoneRef.current?.classList.remove('drag-over')}
          onDrop={handleFileDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <div className="qr-drop-icon">
            <Upload size={28} />
          </div>
          <span className="title-md">Tap or drag files here</span>
          <span className="body-sm text-muted">Images, Videos, Audio, PDFs — any format</span>
        </div>

        {/* File Preview Grid */}
        {files.length > 0 && (
          <div className="qr-files-grid">
            {files.map(f => {
              const Icon = FILE_TYPE_ICONS[f.category] || File;
              return (
                <div key={f.id} className={`qr-file-card ${f.category}`}>
                  {f.previewUrl ? (
                    <img src={f.previewUrl} alt={f.name} className="qr-file-preview" />
                  ) : (
                    <div className="qr-file-icon">
                      <Icon size={24} />
                    </div>
                  )}
                  <div className="qr-file-info">
                    <span className="label-sm qr-file-name">{f.name}</span>
                    <span className="label-sm text-muted">{formatFileSize(f.size)}</span>
                  </div>
                  <button className="qr-file-remove" onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Situation Description */}
      <div className="qr-section animate-fade-in" style={{ animationDelay: '200ms' }}>
        <label className="qr-section-label" htmlFor="qr-situation">
          <AlertTriangle size={16} /> What is this about?
        </label>
        <p className="body-sm text-muted" style={{ marginBottom: '8px' }}>
          Describe the situation briefly (min 10 chars)
        </p>
        <textarea
          id="qr-situation"
          className="qr-textarea"
          value={situation}
          onChange={e => setSituation(e.target.value)}
          placeholder="e.g., Found severe flooding in Block B residential area, multiple families displaced..."
          rows={3}
        />
        <span className={`label-sm ${situation.length < 10 ? 'text-error' : 'text-muted'}`}>
          {situation.length} chars
        </span>
      </div>

      {/* Help Description */}
      <div className="qr-section animate-fade-in" style={{ animationDelay: '300ms' }}>
        <label className="qr-section-label" htmlFor="qr-help">
          <Sparkles size={16} /> How can volunteers help?
        </label>
        <p className="body-sm text-muted" style={{ marginBottom: '8px' }}>
          What kind of help is needed? (min 10 chars)
        </p>
        <textarea
          id="qr-help"
          className="qr-textarea"
          value={helpNeeded}
          onChange={e => setHelpNeeded(e.target.value)}
          placeholder="e.g., Need volunteers for evacuation assistance, medical aid, and food distribution..."
          rows={3}
        />
        <span className={`label-sm ${helpNeeded.length < 10 ? 'text-error' : 'text-muted'}`}>
          {helpNeeded.length} chars
        </span>
      </div>

      {/* Location */}
      <div className="qr-section animate-fade-in" style={{ animationDelay: '400ms' }}>
        <label className="qr-section-label">
          <MapPin size={16} /> Location
        </label>
        <button className="qr-location-btn" onClick={detectLocation} disabled={isLocating}>
          <MapPin size={18} />
          <span>{isLocating ? 'Detecting...' : address || 'Detect Current Location'}</span>
        </button>
        {isLoaded && (
          <div style={{ marginTop: '12px', borderRadius: '16px', overflow: 'hidden' }}>
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={{ lat, lng }}
              zoom={13}
              onClick={handleMapClick}
              onLoad={onMapLoad}
              options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
            >
              <Marker
                position={{ lat, lng }}
                draggable={true}
                onDragEnd={(e) => {
                  setLat(e.latLng.lat());
                  setLng(e.latLng.lng());
                  reverseGeocode(e.latLng.lat(), e.latLng.lng());
                }}
              />
            </GoogleMap>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="qr-generate-area animate-fade-in" style={{ animationDelay: '500ms' }}>
        <button
          className="qr-generate-btn"
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          <Sparkles size={20} />
          <span>Generate Report with AI</span>
        </button>
        {!canGenerate && (
          <p className="body-sm text-muted" style={{ textAlign: 'center', marginTop: '8px' }}>
            Upload at least one file and fill both text fields (min 10 chars each)
          </p>
        )}
      </div>
    </div>
  );
}
