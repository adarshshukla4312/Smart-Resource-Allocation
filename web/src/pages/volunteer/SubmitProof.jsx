import { useNavigate, useParams } from 'react-router-dom';
import { useState, useRef } from 'react';
import {
  ArrowLeft, Camera, Video, Upload, CheckCircle2, Info
} from 'lucide-react';
import { tasksApi } from '../../api';
import './SubmitProof.css';

export default function SubmitProof() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [files, setFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({
        type: f.type.startsWith('video/') ? 'video' : 'image',
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

  const compressImage = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => resolve(null);
    };
    reader.onerror = () => resolve(null);
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const proofMedia = await Promise.all(files.map(async f => {
        let url = `https://mock.storage/proof-${f.id}.jpg`;
        if (f.file && f.type.toUpperCase() === 'IMAGE') {
          const compressed = await compressImage(f.file);
          if (compressed) url = compressed;
        }
        return {
          type: f.type.toUpperCase(),
          url: url
        };
      }));
      
      const { collection, query, where, getDocs, updateDoc, serverTimestamp, db, auth } = await import('../../firebase.js');
      
      const q = query(
        collection(db, 'applications'),
        where('taskId', '==', taskId),
        where('volunteerId', '==', auth.currentUser?.uid)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const appDoc = snapshot.docs[0];
        await updateDoc(appDoc.ref, {
          status: 'PROOF_SUBMITTED',
          proofMedia: proofMedia,
          proofSubmittedAt: serverTimestamp()
        });
      } else {
        throw new Error('Could not find your application for this task.');
      }
      
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit proof: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="proof-page">
        <div className="proof-success animate-scale-in">
          <div className="proof-success-icon">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="headline-md">Proof Submitted!</h2>
          <p className="body-md text-muted">
            Your proof of participation has been submitted. NGO management will review it shortly.
          </p>
          <button className="btn-primary" onClick={() => navigate('/volunteer/applications')} style={{ marginTop: '24px' }}>
            Back to My Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="proof-page">
      {/* Header */}
      <div className="proof-header">
        <button className="task-view-back" onClick={() => navigate('/volunteer/applications')} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <span className="title-md">Submit Proof</span>
        <div style={{ width: 48 }}></div>
      </div>

      {/* Guidance Checklist */}
      <div className="proof-guidance animate-fade-in">
        <div className="proof-guidance-header">
          <Info size={16} className="text-primary" />
          <span className="title-md">Photo & Video Guidelines</span>
        </div>
        <ul className="proof-guidance-list">
          <li className="body-sm">
            <CheckCircle2 size={14} className="text-primary" />
            Show the completed work or the situation after your intervention.
          </li>
          <li className="body-sm">
            <CheckCircle2 size={14} className="text-primary" />
            Include yourself at the location if possible.
          </li>
          <li className="body-sm">
            <CheckCircle2 size={14} className="text-primary" />
            If beneficiary consent is given, include them in the media.
          </li>
        </ul>
      </div>

      {/* Upload Area */}
      <div className="proof-upload-area animate-fade-in" style={{ animationDelay: '200ms' }}>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          multiple 
          onChange={handleFileChange} 
        />
        <div className="proof-upload-zone" onClick={() => triggerFileInput('image/*,video/*')} style={{ cursor: 'pointer' }}>
          <Upload size={32} />
          <span className="title-md">Tap to add photos or video</span>
          <span className="body-sm text-muted">Images, short video (≤45s), or long video</span>
        </div>

        <div className="proof-upload-btns">
          <button className="proof-upload-btn" onClick={() => triggerFileInput('image/*')}>
            <Camera size={20} />
            <span className="label-md">Photo</span>
          </button>
          <button className="proof-upload-btn" onClick={() => triggerFileInput('video/*')}>
            <Video size={20} />
            <span className="label-md">Video</span>
          </button>
        </div>
      </div>

      {/* Attached Files Preview */}
      {files.length > 0 && (
        <div className="proof-files animate-fade-in">
          <span className="label-lg">{files.length} file{files.length > 1 ? 's' : ''} attached</span>
          <div className="proof-files-grid">
            {files.map((f) => (
              <div key={f.id} className="proof-file-thumb" title={f.name} style={{ position: 'relative', overflow: 'hidden' }}>
                {f.previewUrl ? (
                   <img src={f.previewUrl} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                ) : (
                   <>
                     {f.type === 'image' ? <Camera size={20} /> : <Video size={20} />}
                     <span className="label-sm">{f.name ? (f.name.length > 10 ? f.name.substring(0, 10) + '...' : f.name) : (f.type === 'image' ? 'Photo' : 'Video')}</span>
                   </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="proof-submit-area">
        <button
          className="btn-primary"
          disabled={files.length === 0 || isSubmitting}
          onClick={handleSubmit}
          id="submit-proof"
        >
          {isSubmitting ? 'Submitting...' : (
            <>
              <Upload size={18} />
              Submit Proof of Participation
            </>
          )}
        </button>
      </div>
    </div>
  );
}
