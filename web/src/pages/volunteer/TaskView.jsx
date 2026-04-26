import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TaskDetail from '../../components/volunteer/TaskDetail';
import './TaskView.css';

export default function TaskView() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="task-view-page">
      {/* Mobile Back Button Overlay (if needed) */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10 }}>
        <button className="task-view-back" onClick={() => navigate('/volunteer/tasks')}>
          <ArrowLeft size={20} />
        </button>
      </div>

      <TaskDetail taskId={taskId} />
    </div>
  );
}
