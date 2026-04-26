import TaskDetail from './TaskDetail';

export default function TaskDetailModal({ taskId, isOpen, onClose }) {
  if (!isOpen || !taskId) return null;

  return (
    <div className="confirm-overlay" onClick={onClose} style={{ 
      padding: '40px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 10000,
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }}>
      <div 
        className="task-modal-content animate-slide-up" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width: '100%', 
          maxWidth: '900px', 
          height: '100%', 
          maxHeight: '90vh',
          background: 'var(--surface-container-low)',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid var(--outline-variant)',
          boxShadow: 'var(--shadow-ambient)'
        }}
      >
        <TaskDetail taskId={taskId} isModal={true} onClose={onClose} />
      </div>
    </div>
  );
}
