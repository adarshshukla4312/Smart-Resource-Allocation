import { useState, useEffect, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, Image, Mic, Video, FileText,
  Sparkles, Eye, Tag, Loader2, Zap, BookOpen, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { analyzeMediaItem, analyzeDocument } from '../services/aiAnalysis';
import './MediaPreviewModal.css';

const TYPE_CONFIG = {
  IMAGE: { icon: Image, label: 'Image', cls: 'image' },
  AUDIO: { icon: Mic, label: 'Audio', cls: 'audio' },
  SHORT_VIDEO: { icon: Video, label: 'Video', cls: 'video' },
  LONG_VIDEO: { icon: Video, label: 'Video', cls: 'video' },
  VIDEO: { icon: Video, label: 'Video', cls: 'video' },
  PDF: { icon: FileText, label: 'Document', cls: 'pdf' },
  DOCUMENT: { icon: FileText, label: 'Document', cls: 'pdf' },
};

function isDocument(type) {
  return ['PDF', 'DOCUMENT'].includes((type || '').toUpperCase()) ||
    (type || '').toLowerCase().includes('pdf');
}

export default function MediaPreviewModal({ isOpen, onClose, mediaItems, initialIndex = 0, taskId }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [activeTab, setActiveTab] = useState('preview');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [localAnalysis, setLocalAnalysis] = useState({}); // cache analysis results per media ID
  const [detailedLoading, setDetailedLoading] = useState(false);
  const [localDetailed, setLocalDetailed] = useState({}); // cache detailed doc analysis per media ID

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setActiveTab('preview');
    setAnalyzeError('');
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

  const mediaType = (item.type || '').toUpperCase();
  const typeConf = TYPE_CONFIG[mediaType] || TYPE_CONFIG.IMAGE;
  const TypeIcon = typeConf.icon;
  const isDoc = isDocument(mediaType);
  const hasSummary = !!(item.aiSummary || localAnalysis[item.id]?.aiSummary);
  const hasDetailed = !!(item.contentAnalysis || localDetailed[item.id]);

  // Determine which tabs to show
  const tabs = [{ id: 'preview', label: 'Preview', icon: Eye }];
  tabs.push({ id: 'summary', label: 'AI Summary', icon: Sparkles });
  if (isDoc) {
    tabs.push({ id: 'detailed', label: 'Content Analysis', icon: BookOpen });
  }

  // ── Generate AI Summary ──
  const handleGenerateSummary = async () => {
    if (!taskId) { setAnalyzeError('Task ID missing'); return; }
    setAnalyzing(true);
    setAnalyzeError('');
    try {
      let result;
      if (isDoc) {
        result = await analyzeDocument(taskId, item, 'summary');
      } else {
        result = await analyzeMediaItem(taskId, item);
      }
      setLocalAnalysis(prev => ({ ...prev, [item.id]: result }));
    } catch (err) {
      setAnalyzeError(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Generate Detailed Content Analysis (docs only) ──
  const handleGenerateDetailed = async () => {
    if (!taskId) { setAnalyzeError('Task ID missing'); return; }
    setDetailedLoading(true);
    setAnalyzeError('');
    try {
      const result = await analyzeDocument(taskId, item, 'detailed');
      setLocalDetailed(prev => ({ ...prev, [item.id]: result }));
    } catch (err) {
      setAnalyzeError(err.message || 'Content analysis failed');
    } finally {
      setDetailedLoading(false);
    }
  };

  // ── Preview Tab ──
  const renderPreview = () => {
    if (!item.downloadURL) {
      return (
        <div className="media-preview-placeholder">
          <TypeIcon size={48} />
          <span className="body-md">Media file not yet uploaded or processed</span>
        </div>
      );
    }

    if (mediaType === 'IMAGE') {
      return <img src={item.downloadURL} alt={item.aiCaption || 'Media attachment'} />;
    }

    if (mediaType === 'AUDIO') {
      return (
        <div className="media-preview-placeholder" style={{ background: 'transparent' }}>
          <Mic size={56} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
          <audio controls src={item.downloadURL} style={{ width: '100%', maxWidth: '500px' }}>
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }

    if (['SHORT_VIDEO', 'LONG_VIDEO', 'VIDEO'].includes(mediaType)) {
      return (
        <video controls src={item.downloadURL} style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '12px' }}>
          Your browser does not support video playback.
        </video>
      );
    }

    if (isDoc) {
      return (
        <div className="media-preview-placeholder">
          <FileText size={56} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
          <span className="headline-sm">Document</span>
          <span className="body-sm text-muted">{item.metadata?.originalName || item.fileName || 'PDF Document'}</span>
          <a
            href={item.downloadURL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ marginTop: '16px' }}
          >
            <FileText size={16} /> Open Document
          </a>
        </div>
      );
    }

    return (
      <div className="media-preview-placeholder">
        <TypeIcon size={48} />
        <span className="body-md">Preview unavailable for this file type</span>
      </div>
    );
  };

  // ── AI Summary Tab ──
  const renderSummary = () => {
    const summary = localAnalysis[item.id] || item;
    const aiText = summary.aiSummary || summary.aiCaption;
    const findings = summary.keyFindings || [];
    const elements = summary.detectedElements || [];
    const relevance = summary.relevanceScore;

    // If no summary exists and not in processed state, show generate button
    if (!aiText && item.processingStatus !== 'DONE') {
      return (
        <div className="media-analysis-cta">
          <div className="media-analysis-cta-icon">
            <Sparkles size={36} />
          </div>
          <h3 className="headline-sm">AI Summary Not Generated</h3>
          <p className="body-sm text-muted">
            {mediaType === 'IMAGE'
              ? 'Click below to analyze this image using Gemini AI vision.'
              : isDoc
              ? 'Click below to extract and summarize this document using AI.'
              : 'Click below to generate an AI summary of this media.'}
          </p>
          {analyzeError && (
            <div className="media-analysis-error">
              <AlertTriangle size={14} /> {analyzeError}
            </div>
          )}
          <button
            className="media-generate-btn"
            onClick={handleGenerateSummary}
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>Analyzing with Gemini...</span>
              </>
            ) : (
              <>
                <Zap size={18} />
                <span>Generate AI Summary</span>
              </>
            )}
          </button>
        </div>
      );
    }

    // Show existing summary
    return (
      <div className="media-summary-content">
        <div className="media-summary-header">
          <CheckCircle2 size={16} style={{ color: 'var(--severity-low)' }} />
          <span className="label-md" style={{ color: 'var(--severity-low)' }}>AI Analysis Complete</span>
          {relevance && (
            <span className={`relevance-badge relevance-${relevance.toLowerCase()}`}>
              {relevance} Relevance
            </span>
          )}
        </div>

        <div className="media-summary-section">
          <h4><Sparkles size={14} /> Summary</h4>
          <p className="body-md">{aiText}</p>
        </div>

        {findings.length > 0 && (
          <div className="media-summary-section">
            <h4><AlertTriangle size={14} /> Key Findings</h4>
            <ul className="media-findings-list">
              {findings.map((f, i) => (
                <li key={i} className="body-sm">{f}</li>
              ))}
            </ul>
          </div>
        )}

        {elements.length > 0 && (
          <div className="media-summary-section">
            <h4><Tag size={14} /> Detected Elements</h4>
            <div className="media-elements-grid">
              {elements.map((el, i) => (
                <span key={i} className="media-element-chip">{el}</span>
              ))}
            </div>
          </div>
        )}

        {item.cleanTranscript && (
          <div className="media-summary-section">
            <h4><Mic size={14} /> Cleaned Transcript</h4>
            <p className="body-md" style={{ fontStyle: 'italic' }}>"{item.cleanTranscript}"</p>
          </div>
        )}

        {/* Re-generate button */}
        <button
          className="media-regenerate-btn"
          onClick={handleGenerateSummary}
          disabled={analyzing}
        >
          {analyzing ? <Loader2 size={14} className="spin-icon" /> : <Sparkles size={14} />}
          <span>{analyzing ? 'Re-analyzing...' : 'Re-generate Summary'}</span>
        </button>
      </div>
    );
  };

  // ── Detailed Content Analysis Tab (Documents only) ──
  const renderDetailed = () => {
    const detailed = localDetailed[item.id] || item.contentAnalysis;

    if (!detailed) {
      return (
        <div className="media-analysis-cta">
          <div className="media-analysis-cta-icon detailed">
            <BookOpen size={36} />
          </div>
          <h3 className="headline-sm">Detailed Content Analysis</h3>
          <p className="body-sm text-muted">
            Get a thorough, section-by-section breakdown of every part of this document.
            The AI will explain each section's content, significance, data points, and recommended actions.
          </p>
          {analyzeError && (
            <div className="media-analysis-error">
              <AlertTriangle size={14} /> {analyzeError}
            </div>
          )}
          <button
            className="media-generate-btn detailed"
            onClick={handleGenerateDetailed}
            disabled={detailedLoading}
          >
            {detailedLoading ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>Deep analyzing document...</span>
              </>
            ) : (
              <>
                <BookOpen size={18} />
                <span>Generate Content Analysis</span>
              </>
            )}
          </button>
        </div>
      );
    }

    // Show detailed analysis
    return (
      <div className="media-detailed-content">
        {/* Header */}
        <div className="detailed-header">
          <div className="detailed-header-info">
            <h3 className="headline-sm">{detailed.documentTitle || 'Document Analysis'}</h3>
            <div className="detailed-meta">
              {detailed.documentType && (
                <span className="detailed-meta-badge">{detailed.documentType}</span>
              )}
              {detailed.totalPages && (
                <span className="body-sm text-muted">{detailed.totalPages} pages/sections</span>
              )}
            </div>
          </div>
        </div>

        {/* Overall Assessment */}
        {detailed.overallAssessment && (
          <div className="detailed-assessment">
            <h4><AlertTriangle size={14} /> Overall Assessment</h4>
            <p className="body-md">{detailed.overallAssessment}</p>
          </div>
        )}

        {/* Critical Information */}
        {detailed.criticalInformation && detailed.criticalInformation.length > 0 && (
          <div className="detailed-critical">
            <h4><Zap size={14} /> Critical Information</h4>
            <ul className="detailed-critical-list">
              {detailed.criticalInformation.map((info, i) => (
                <li key={i} className="body-sm">{info}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sections */}
        {detailed.sections && detailed.sections.map((section, i) => (
          <div key={i} className="detailed-section-card">
            <div className="detailed-section-number">{i + 1}</div>
            <div className="detailed-section-body">
              <h4 className="title-md">{section.heading}</h4>
              <p className="body-md">{section.content}</p>

              {section.keyDataPoints && section.keyDataPoints.length > 0 && (
                <div className="detailed-data-points">
                  <span className="label-sm text-muted">Key Data Points</span>
                  <ul>
                    {section.keyDataPoints.map((dp, j) => (
                      <li key={j} className="body-sm">{dp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.actionItems && section.actionItems.length > 0 && (
                <div className="detailed-action-items">
                  <span className="label-sm" style={{ color: 'var(--primary)' }}>Action Items</span>
                  <ul>
                    {section.actionItems.map((ai, j) => (
                      <li key={j} className="body-sm">{ai}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Re-generate */}
        <button
          className="media-regenerate-btn"
          onClick={handleGenerateDetailed}
          disabled={detailedLoading}
        >
          {detailedLoading ? <Loader2 size={14} className="spin-icon" /> : <BookOpen size={14} />}
          <span>{detailedLoading ? 'Re-analyzing...' : 'Re-generate Analysis'}</span>
        </button>
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
              {item.metadata?.originalName || item.fileName || `${typeConf.label} ${currentIndex + 1}`}
            </span>
          </div>
          <div className="media-modal-nav">
            <button
              onClick={() => { setCurrentIndex(i => i - 1); setActiveTab('preview'); }}
              disabled={currentIndex === 0}
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="media-modal-nav-counter">
              {currentIndex + 1} / {mediaItems.length}
            </span>
            <button
              onClick={() => { setCurrentIndex(i => i + 1); setActiveTab('preview'); }}
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
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`media-modal-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <TabIcon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="media-modal-content">
          {activeTab === 'preview' && (
            <div className="media-preview-container">
              {renderPreview()}
            </div>
          )}
          {activeTab === 'summary' && renderSummary()}
          {activeTab === 'detailed' && renderDetailed()}
        </div>
      </div>
    </div>
  );
}
