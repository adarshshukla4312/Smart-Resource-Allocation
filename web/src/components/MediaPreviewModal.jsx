import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Image, Mic, Video, Sparkles, Eye, Tag } from 'lucide-react';
import './MediaPreviewModal.css';

const TYPE_CONFIG = {
  IMAGE: { icon: Image, label: 'Image', cls: 'image' },
  AUDIO: { icon: Mic, label: 'Audio', cls: 'audio' },
  SHORT_VIDEO: { icon: Video, label: 'Video', cls: 'video' },
  LONG_VIDEO: { icon: Video, label: 'Video', cls: 'video' },
  VIDEO: { icon: Video, label: 'Video', cls: 'video' },
};

export default function MediaPreviewModal({ isOpen, onClose, mediaItems, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [activeTab, setActiveTab] = useState('preview');

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setActiveTab('preview');
  }, [initialIndex, isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex(i => i - 1);
    if (e.key === 'ArrowRight' && currentIndex < (mediaItems?.length || 0) - 1) setCurrentIndex(i => i + 1);
  }, [isOpen, onClose, currentIndex, mediaItems]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !mediaItems || mediaItems.length === 0) return null;

  const item = mediaItems[currentIndex];
  if (!item) return null;

  const typeConf = TYPE_CONFIG[item.type] || TYPE_CONFIG.IMAGE;
  const TypeIcon = typeConf.icon;

  const renderPreview = () => {
    if (!item.downloadURL) {
      return (
        <div className="media-preview-placeholder">
          <TypeIcon size={48} />
          <span className="body-md">Media file not yet uploaded or processed</span>
        </div>
      );
    }

    if (item.type === 'IMAGE') {
      return <img src={item.downloadURL} alt={item.aiCaption || 'Media attachment'} />;
    }

    if (item.type === 'AUDIO') {
      return (
        <div className="media-preview-placeholder" style={{ background: 'transparent' }}>
          <Mic size={56} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
          <audio controls src={item.downloadURL} style={{ width: '100%', maxWidth: '500px' }}>
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }

    if (item.type === 'SHORT_VIDEO' || item.type === 'LONG_VIDEO' || item.type === 'VIDEO') {
      return (
        <video controls src={item.downloadURL} style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '12px' }}>
          Your browser does not support video playback.
        </video>
      );
    }

    return (
      <div className="media-preview-placeholder">
        <TypeIcon size={48} />
        <span className="body-md">Preview unavailable for this file type</span>
      </div>
    );
  };

  const renderSummary = () => {
    if (!item.aiCaption && item.processingStatus !== 'DONE') {
      return (
        <div className="media-summary-empty">
          <div className="media-processing-spinner" />
          <span className="body-md">AI analysis pending...</span>
          <span className="body-sm text-muted">Analysis will be available after processing completes.</span>
        </div>
      );
    }

    if (!item.aiCaption) {
      return (
        <div className="media-summary-empty">
          <Sparkles size={32} />
          <span className="body-md">No AI summary available</span>
        </div>
      );
    }

    return (
      <div className="media-summary-content">
        <div className="media-summary-section">
          <h4><Sparkles size={14} /> AI Summary</h4>
          <p className="body-md">{item.aiCaption}</p>
        </div>
        {item.cleanTranscript && (
          <div className="media-summary-section">
            <h4><Mic size={14} /> Cleaned Transcript</h4>
            <p className="body-md" style={{ fontStyle: 'italic' }}>"{item.cleanTranscript}"</p>
          </div>
        )}
        {item.transcript && item.transcript !== item.cleanTranscript && (
          <div className="media-summary-section" style={{ opacity: 0.7 }}>
            <h4><Mic size={14} /> Raw Transcript</h4>
            <p className="body-sm">{item.transcript}</p>
          </div>
        )}
      </div>
    );
  };

  const renderObservations = () => {
    const observations = item.aiObservations || [];

    if (observations.length === 0) {
      return (
        <div className="media-summary-empty">
          <Eye size={32} />
          <span className="body-md">No content analysis available</span>
          <span className="body-sm text-muted">
            {item.type === 'IMAGE' 
              ? 'Image analysis detects objects, labels, and visual elements.'
              : 'Content analysis identifies key elements in the media.'}
          </span>
        </div>
      );
    }

    return (
      <div className="media-observations-list">
        {observations.map((obs, i) => (
          <div key={i} className="media-observation-chip">
            <div className="obs-icon">
              <Tag size={14} />
            </div>
            <span>{obs}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="media-modal-overlay" onClick={onClose}>
      <div className="media-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="media-modal-header">
          <div className="media-modal-header-left">
            <span className={`media-modal-type-badge ${typeConf.cls}`}>
              <TypeIcon size={12} />
              {typeConf.label}
            </span>
            <span className="label-md text-muted">
              {item.fileName || `${typeConf.label} ${currentIndex + 1}`}
            </span>
          </div>
          <div className="media-modal-nav">
            <button
              onClick={() => setCurrentIndex(i => i - 1)}
              disabled={currentIndex === 0}
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="media-modal-nav-counter">
              {currentIndex + 1} / {mediaItems.length}
            </span>
            <button
              onClick={() => setCurrentIndex(i => i + 1)}
              disabled={currentIndex === mediaItems.length - 1}
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
            <button className="media-modal-close" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="media-modal-tabs">
          <button
            className={`media-modal-tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
          <button
            className={`media-modal-tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            AI Summary
          </button>
          <button
            className={`media-modal-tab ${activeTab === 'observations' ? 'active' : ''}`}
            onClick={() => setActiveTab('observations')}
          >
            Content Analysis
          </button>
        </div>

        {/* Content */}
        <div className="media-modal-content">
          {activeTab === 'preview' && (
            <div className="media-preview-container">
              {renderPreview()}
            </div>
          )}
          {activeTab === 'summary' && renderSummary()}
          {activeTab === 'observations' && renderObservations()}
        </div>
      </div>
    </div>
  );
}
