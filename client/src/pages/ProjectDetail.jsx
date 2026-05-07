import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate, isOverdue, getDaysUntilDue } from '../utils/helpers';
import TaskModal from '../components/TaskModal';
import AddMemberModal from '../components/AddMemberModal';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: 'var(--text-muted)', bg: 'var(--bg-hover)' },
  { key: 'in-progress', label: 'In Progress', color: 'var(--blue)', bg: 'var(--blue-dim)' },
  { key: 'in-review', label: 'In Review', color: 'var(--purple)', bg: 'var(--purple-dim)' },
  { key: 'completed', label: 'Completed', color: 'var(--green)', bg: 'var(--green-dim)' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban'); // kanban | list
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');

  const fetchProject = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`)
      ]);
      setProject(projRes.data.project);
      setTaskStats(projRes.data.taskStats);
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 403) navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  const isOwner = project?.owner?._id === user?._id;
  const memberEntry = project?.members?.find(m => m.user?._id === user?._id);
  const isProjectAdmin = isOwner || memberEntry?.role === 'admin' || user?.role === 'admin';

  const handleStatusChange = async (taskId, newStatus) => {
    await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
    fetchProject();
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    fetchProject();
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member from the project?')) return;
    await api.delete(`/projects/${id}/members/${memberId}`);
    fetchProject();
  };

  const filteredTasks = tasks.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterAssignee && t.assignee?._id !== filterAssignee) return false;
    return true;
  });

  if (loading) return <div className="page-container loading-center"><div className="loading-spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!project) return null;

  const progress = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

  return (
    <div className="page-container">
      {/* Back */}
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => navigate('/projects')}>
        ← Back to Projects
      </button>

      {/* Project Header */}
      <div className="card" style={{ marginBottom: 24, borderLeft: `4px solid ${project.color || 'var(--accent)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.3px' }}>{project.name}</h1>
              <span className={`badge badge-${project.status}`}>{project.status.replace('-', ' ')}</span>
              <span className={`badge badge-${project.priority}`}>{project.priority}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>{project.description || 'No description.'}</p>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 2 }}>Owner</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
                  <img src={project.owner?.avatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                  {project.owner?.name}
                </div>
              </div>
              {project.deadline && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 2 }}>Deadline</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: isOverdue(project.deadline, project.status) ? 'var(--red)' : 'inherit' }}>
                    {formatDate(project.deadline)}
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 2 }}>Progress</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{progress}%</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 2 }}>Tasks</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{taskStats.completed}/{taskStats.total}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {isProjectAdmin && (
              <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>+ Member</button>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setShowTaskModal(true); }}>
              + Task
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar-bg" style={{ marginTop: 16 }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%`, background: project.color || 'var(--accent)' }} />
        </div>
      </div>

      {/* Members */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: 'var(--text-secondary)' }}>TEAM MEMBERS ({project.members?.length})</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {project.members?.map(m => m.user && (
            <div key={m.user._id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
              <img src={m.user.avatar} alt={m.user.name} style={{ width: 28, height: 28, borderRadius: '50%' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.user.name}</div>
                <span className={`badge badge-${m.role}`} style={{ fontSize: 9 }}>{m.role}</span>
              </div>
              {isProjectAdmin && m.user._id !== project.owner._id && (
                <button className="btn btn-ghost btn-icon" style={{ padding: '2px 4px', fontSize: 12, color: 'var(--red)' }}
                  onClick={() => handleRemoveMember(m.user._id)}>×</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 18 }}>Tasks</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="form-select" style={{ padding: '8px 12px', fontSize: 13, width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="in-review">In Review</option>
            <option value="completed">Completed</option>
          </select>
          <select className="form-select" style={{ padding: '8px 12px', fontSize: 13, width: 'auto' }} value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
            <option value="">All Members</option>
            {project.members?.map(m => m.user && <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
          </select>
          <button className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('kanban')}>⊟ Board</button>
          <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}>☰ List</button>
        </div>
      </div>

      {/* Kanban Board */}
      {view === 'kanban' && (
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} className="kanban-col">
                <div className="kanban-col-header" style={{ background: col.bg }}>
                  <span className="kanban-col-title" style={{ color: col.color }}>{col.label}</span>
                  <span className="kanban-col-count" style={{ color: col.color }}>{colTasks.length}</span>
                </div>
                <div className="kanban-col-body">
                  {colTasks.length === 0 && (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No tasks</div>
                  )}
                  {colTasks.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={() => { setEditTask(task); setShowTaskModal(true); }}
                      onDelete={() => handleDeleteTask(task._id)}
                      onStatusChange={handleStatusChange}
                      isProjectAdmin={isProjectAdmin}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Task</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Due Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No tasks found</td></tr>
              )}
              {filteredTasks.map(task => (
                <tr key={task._id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{task.title}</div>
                    {task.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{task.description.slice(0, 60)}...</div>}
                  </td>
                  <td><span className={`badge badge-${task.status}`}>{task.status.replace('-', ' ')}</span></td>
                  <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                  <td>
                    {task.assignee ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <img src={task.assignee.avatar} alt={task.assignee.name} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                        <span style={{ fontSize: 13 }}>{task.assignee.name}</span>
                      </div>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Unassigned</span>}
                  </td>
                  <td>
                    {task.dueDate ? (
                      <span style={{ fontSize: 13, color: isOverdue(task.dueDate, task.status) ? 'var(--red)' : 'inherit' }}>
                        {isOverdue(task.dueDate, task.status) ? '⚠ ' : ''}{formatDate(task.dueDate)}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <select className="form-select" style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                        value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}>
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="in-review">In Review</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditTask(task); setShowTaskModal(true); }}>✎</button>
                      {isProjectAdmin && <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeleteTask(task._id)}>⊗</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showTaskModal && (
        <TaskModal
          task={editTask}
          projectId={id}
          members={project.members}
          onClose={() => { setShowTaskModal(false); setEditTask(null); }}
          onSave={() => { setShowTaskModal(false); setEditTask(null); fetchProject(); }}
        />
      )}

      {showMemberModal && (
        <AddMemberModal
          projectId={id}
          onClose={() => setShowMemberModal(false)}
          onSave={() => { setShowMemberModal(false); fetchProject(); }}
        />
      )}
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange, isProjectAdmin }) {
  const overdue = isOverdue(task.dueDate, task.status);
  const daysLeft = getDaysUntilDue(task.dueDate);

  return (
    <div className="task-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div className="task-card-title">{task.title}</div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button className="btn btn-ghost btn-icon" style={{ padding: '2px 4px', fontSize: 12 }} onClick={onEdit}>✎</button>
          {isProjectAdmin && <button className="btn btn-ghost btn-icon" style={{ padding: '2px 4px', fontSize: 12, color: 'var(--red)' }} onClick={onDelete}>⊗</button>}
        </div>
      </div>

      {task.description && (
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </p>
      )}

      <div className="task-card-meta">
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
        {task.assignee ? (
          <img src={task.assignee.avatar} alt={task.assignee.name} title={task.assignee.name}
            style={{ width: 20, height: 20, borderRadius: '50%', marginLeft: 'auto' }} />
        ) : (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>Unassigned</span>
        )}
      </div>

      {task.dueDate && (
        <div style={{ marginTop: 8 }}>
          {overdue
            ? <span className="overdue-indicator">⚠ Overdue by {Math.abs(daysLeft)}d</span>
            : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📅 {formatDate(task.dueDate)}</span>
          }
        </div>
      )}

      {/* Quick status change */}
      <select
        className="form-select"
        style={{ marginTop: 10, padding: '5px 8px', fontSize: 11, width: '100%' }}
        value={task.status}
        onChange={e => onStatusChange(task._id, e.target.value)}
        onClick={e => e.stopPropagation()}
      >
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="in-review">In Review</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}

