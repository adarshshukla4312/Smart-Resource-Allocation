import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In MVP, we just send a mock structure to the API
      // Real implementation would upload files to Storage first and pass URLs
      const proofMedia = files.map(f => ({
        type: f.type.toUpperCase(),
        url: `https://mock.storage/proof-${f.id}.jpg`
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
        <div className="proof-upload-zone">
          <Upload size={32} />
          <span className="title-md">Tap to add photos or video</span>
          <span className="body-sm text-muted">Images, short video (≤45s), or long video</span>
        </div>

        <div className="proof-upload-btns">
          <button className="proof-upload-btn" onClick={() => setFiles([...files, { type: 'image', id: Date.now() }])}>
            <Camera size={20} />
            <span className="label-md">Photo</span>
          </button>
          <button className="proof-upload-btn" onClick={() => setFiles([...files, { type: 'video', id: Date.now() }])}>
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
              <div key={f.id} className="proof-file-thumb">
                {f.type === 'image' ? <Camera size={20} /> : <Video size={20} />}
                <span className="label-sm">{f.type === 'image' ? 'Photo' : 'Video'}</span>
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
