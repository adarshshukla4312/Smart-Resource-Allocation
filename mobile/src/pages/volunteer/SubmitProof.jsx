import { useNavigate, useParams } from 'react-router-dom';
import { useState, useRef } from 'react';
import {
  ArrowLeft, Camera, Video, Upload, CheckCircle2, Info, Sparkles
} from 'lucide-react';
import './SubmitProof.css';

export default function SubmitProof() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [files, setFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({
        type: f.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        id: Date.now() + Math.random(),
        file: f,
        name: f.name,
        previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null
      }));
      setFiles([...files, ...newFiles]);
    }
  };

  const triggerFileInput = (accept) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="proof-page success-view animate-fade-in">
        <div className="proof-success-editorial">
          <div className="success-icon-bubble">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="display-sm serif">Evidence Transmitted</h2>
          <p className="body-md text-muted editorial-para">
            Your field deployment proof has been successfully encrypted and filed. NGO administrators will review your contribution.
          </p>
          <div className="contribution-meta">
            <Sparkles size={20} className="text-primary" />
            <span className="label-lg">CREDITS PENDING REVIEW</span>
          </div>
          <button className="submit-btn-editorial" onClick={() => navigate('/applications')}>
            Return to Engagements
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="proof-page animate-fade-in">
      <div className="proof-header-editorial">
        <button className="icon-btn-minimal" onClick={() => navigate('/applications')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="title-md serif">Transmit Field Evidence</h1>
        <div style={{ width: 44 }}></div>
      </div>

      <div className="proof-scroll-content">
        <div className="editorial-guidance-card">
          <div className="guidance-header">
            <div className="info-icon-bubble"><Info size={16} /></div>
            <span className="label-lg">VERIFICATION PROTOCOLS</span>
          </div>
          <ul className="editorial-check-list">
            <li className="body-sm">
              <div className="check-dot"></div>
              Visual documentation of intervention impact.
            </li>
            <li className="body-sm">
              <div className="check-dot"></div>
              Geographic context identification (landmarks).
            </li>
            <li className="body-sm">
              <div className="check-dot"></div>
              Personal verification (Self-portrait on site).
            </li>
          </ul>
        </div>

        <div className="editorial-upload-zone">
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            multiple 
            onChange={handleFileChange} 
          />
          <div className="dashed-upload-box" onClick={() => triggerFileInput('image/*,video/*')} style={{ cursor: 'pointer' }}>
            <Upload size={32} className="opacity-20" />
            <h3 className="title-md serif">Initialize Assets</h3>
            <span className="body-sm text-muted">Capture imagery or video evidence</span>
          </div>

          <div className="capture-action-row">
            <button className="capture-pill" onClick={() => triggerFileInput('image/*')}>
              <Camera size={18} />
              <span className="label-lg">PHOTOGRAPHY</span>
            </button>
            <button className="capture-pill" onClick={() => triggerFileInput('video/*')}>
              <Video size={18} />
              <span className="label-lg">VIDEO FEED</span>
            </button>
          </div>
        </div>

        {files.length > 0 && (
          <div className="attached-assets-view animate-fade-in">
            <div className="section-label-row">
              <span className="label-lg">ASSET INVENTORY ({files.length})</span>
            </div>
            <div className="assets-preview-grid">
              {files.map((f) => (
                <div key={f.id} className="asset-thumb-card" title={f.name} style={{ position: 'relative', overflow: 'hidden' }}>
                  {f.previewUrl ? (
                    <img src={f.previewUrl} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                  ) : (
                    <>
                      {f.type === 'IMAGE' ? <Camera size={18} /> : <Video size={18} />}
                      <span className="label-sm">{f.name ? (f.name.length > 10 ? f.name.substring(0, 10) + '...' : f.name) : f.type}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="proof-action-footer">
        <button
          className="submit-btn-editorial"
          disabled={files.length === 0}
          onClick={handleSubmit}
        >
          <Upload size={18} />
          <span>TRANSMIT EVIDENCE</span>
        </button>
      </div>
    </div>
  );
}
