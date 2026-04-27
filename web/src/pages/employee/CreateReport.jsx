import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, MapPin, Mic, Image, Video,
  CheckCircle2, AlertTriangle, Clock, FileText, Tag, Trash2
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { tasksApi } from '../../api';
import { REPORT_TYPES, SEVERITY_LEVELS, URGENCY_LEVELS, DOCUMENT_TAGS, SKILLS } from '../../data/mockData';
import './CreateReport.css';

const STEPS = ['Type & Info', 'Location', 'Media', 'Assessment', 'Review'];

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '350px',
  borderRadius: '12px',
};

export default function CreateReport() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [reportType, setReportType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [severity, setSeverity] = useState('');
  const [urgency, setUrgency] = useState('');
  const [attachedMedia, setAttachedMedia] = useState([]);
  const [lat, setLat] = useState(28.6304);
  const [lng, setLng] = useState(77.2177);
  const [address, setAddress] = useState('Connaught Place, New Delhi');
  const [isLocating, setIsLocating] = useState(false);
  const [requiredSkills, setRequiredSkills] = useState([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const mapRef = useRef(null);
  const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  const audioRef = useRef(null);
  const imageRef = useRef(null);
  const videoRef = useRef(null);

  const toggleTag = (tag) => {
    setSelectedTags(selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    );
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        setLat(newLat);
        setLng(newLng);
        reverseGeocode(newLat, newLng);
        setIsLocating(false);
      },
      (error) => {
        alert("Geolocation error: " + error.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
      }
    } catch {
      setAddress(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
    }
  };

  const handleMapClick = (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setLat(newLat);
    setLng(newLng);
    reverseGeocode(newLat, newLng);
  };

  const handleMediaSelect = (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newMedia = files.map(file => {
      // Create local preview URL
      const previewUrl = type === 'image' ? URL.createObjectURL(file) : null;
      return {
        id: Date.now() + Math.random(),
        type,
        file,
        previewUrl,
        name: file.name,
        size: file.size
      };
    });

    setAttachedMedia(prev => [...prev, ...newMedia]);
    e.target.value = ''; // Reset input
  };

  const removeMedia = (id) => {
    setAttachedMedia(prev => {
      const filtered = prev.filter(m => m.id !== id);
      // Revoke object URLs to avoid memory leaks
      const removed = prev.find(m => m.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return filtered;
    });
  };

  const canNext = () => {
    if (step === 0) return reportType && title.trim().length > 0 && description.trim().length >= 30;
    if (step === 3) return severity && urgency;
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        reportType,
        location: {
          lat: lat,
          lng: lng,
          address: address,
        },
        requiredSkills: requiredSkills,
        employeeAssessment: {
          severity,
          urgency,
        },
      };

      const { collection, addDoc, serverTimestamp, db, auth, storage } = await import('../../firebase.js');
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { setDoc, doc } = await import('firebase/firestore');
      
      const mediaCounts = { images: 0, audio: 0, shortVideos: 0, longVideos: 0 };
      attachedMedia.forEach(m => {
        if (m.type === 'image') mediaCounts.images++;
        if (m.type === 'audio') mediaCounts.audio++;
        if (m.type === 'video') mediaCounts.shortVideos++; // Assuming short for now
      });

      const fullTaskData = {
        ...taskData,
        status: 'SUBMITTED',
        employeeId: auth.currentUser?.uid,
        employeeName: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Unknown',
        tags: selectedTags,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        mediaCount: mediaCounts,
        maxVolunteers: 0,
        acceptedCount: 0
      };

      const docRef = await addDoc(collection(db, 'tasks'), fullTaskData);
      
      // Upload media files to Firebase Storage
      const uploadPromises = attachedMedia.map(async (mediaItem) => {
        const attachmentId = `m_${mediaItem.id}`;
        const filePath = `tasks/${docRef.id}/media/${attachmentId}/${mediaItem.name}`;
        const storageRef = ref(storage, filePath);
        
        await uploadBytes(storageRef, mediaItem.file);
        const downloadUrl = await getDownloadURL(storageRef);
        
        await setDoc(doc(db, 'tasks', docRef.id, 'media', attachmentId), {
          id: attachmentId,
          taskId: docRef.id,
          type: mediaItem.type.toUpperCase(),
          storagePath: filePath,
          downloadURL: downloadUrl,
          processingStatus: 'PENDING',
          aiCaption: '',
          uploadedAt: serverTimestamp(),
          metadata: {
            sizeBytes: mediaItem.size,
            originalName: mediaItem.name
          }
        });
      });

      await Promise.all(uploadPromises);
      
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit report: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
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
          <button className="btn-primary" onClick={() => navigate('/employee/reports')} style={{ marginTop: '24px' }}>
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
        <button className="report-back-btn" onClick={() => step > 0 ? setStep(step - 1) : navigate('/employee/reports')}>
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
            <button className="report-location-btn" onClick={detectLocation} disabled={isLocating}>
              <MapPin size={20} />
              <div>
                <span className="title-md">{isLocating ? 'Locating...' : 'Record Current Location'}</span>
                <span className="body-sm text-muted">GPS auto-detection</span>
              </div>
            </button>
            <div className="report-location-result" style={{ marginTop: '12px' }}>
              <label className="label-md">Or enter address manually:</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input
                  type="text"
                  className="mobile-input"
                  style={{ flex: 1 }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="E.g., 123 Main St, City"
                />
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label className="label-sm text-muted">Latitude</label>
                  <input
                    type="number"
                    className="mobile-input"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                    step="0.0001"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label-sm text-muted">Longitude</label>
                  <input
                    type="number"
                    className="mobile-input"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value))}
                    step="0.0001"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="report-map-container" style={{ height: '350px', borderRadius: '12px', overflow: 'hidden', marginTop: '16px' }}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={{ lat, lng }}
                zoom={14}
                onClick={handleMapClick}
                onLoad={onMapLoad}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                <Marker
                  position={{ lat, lng }}
                  draggable={true}
                  onDragEnd={(e) => {
                    const newLat = e.latLng.lat();
                    const newLng = e.latLng.lng();
                    setLat(newLat);
                    setLng(newLng);
                    reverseGeocode(newLat, newLng);
                  }}
                />
              </GoogleMap>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--surface-container)' }}>
                <span className="body-md text-muted">Loading map...</span>
              </div>
            )}
            <p className="body-sm text-muted" style={{ marginTop: '8px', textAlign: 'center' }}>
              Click anywhere on the map or drag the red marker to set the exact location.
            </p>
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

            {/* Hidden file inputs */}
            <input type="file" ref={audioRef} accept="audio/*" onChange={(e) => handleMediaSelect(e, 'audio')} style={{ display: 'none' }} multiple />
            <input type="file" ref={imageRef} accept="image/*" onChange={(e) => handleMediaSelect(e, 'image')} style={{ display: 'none' }} multiple />
            <input type="file" ref={videoRef} accept="video/*" onChange={(e) => handleMediaSelect(e, 'video')} style={{ display: 'none' }} multiple />

            <div className="report-media-btns">
              <button className="report-media-btn" onClick={() => audioRef.current?.click()}>
                <Mic size={24} />
                <span className="label-md">Record Audio</span>
                <span className="label-sm text-muted">Interview / observation</span>
              </button>
              <button className="report-media-btn" onClick={() => imageRef.current?.click()}>
                <Image size={24} />
                <span className="label-md">Add Photos</span>
                <span className="label-sm text-muted">Max 10, 20MB each</span>
              </button>
              <button className="report-media-btn" onClick={() => videoRef.current?.click()}>
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
                  <div key={m.id} className="report-attached-item" style={{ position: 'relative', overflow: 'hidden' }}>
                    {m.type === 'image' && m.previewUrl ? (
                      <img src={m.previewUrl} alt="preview" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        {m.type === 'audio' && <Mic size={24} />}
                        {m.type === 'video' && <Video size={24} />}
                        <span className="label-sm" style={{ textAlign: 'center', wordBreak: 'break-all' }}>{m.name}</span>
                      </div>
                    )}
                    <button 
                      onClick={() => removeMedia(m.id)}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', color: 'white' }}
                    >
                      <Trash2 size={14} />
                    </button>
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

          <div className="report-field" style={{ marginTop: '24px' }}>
            <label className="label-lg">
              <FileText size={14} /> Required Skills
            </label>
            <p className="body-sm text-muted" style={{ marginBottom: '12px' }}>
              Select specific skills volunteers should have to assist with this task.
            </p>
            <div className="profile-chips">
              {SKILLS.map(skill => (
                <button
                  key={skill}
                  className={`chip ${requiredSkills.includes(skill) ? 'active' : ''}`}
                  onClick={() => {
                    setRequiredSkills(prev => 
                      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                    );
                  }}
                >{skill}</button>
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
            <span className="body-md">{address}</span>
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
          <button className="btn-primary" onClick={handleSubmit} id="submit-report" disabled={isSubmitting}>
            {isSubmitting ? (
              <span>Submitting...</span>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Submit Report</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
