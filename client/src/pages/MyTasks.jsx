import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate, isOverdue, getDaysUntilDue } from '../utils/helpers';
import TaskModal from '../components/TaskModal';

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [priority, setPriority] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchTasks = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'all' && filter !== 'overdue') params.append('status', filter);
    if (filter === 'overdue') params.append('overdue', 'true');
    if (priority) params.append('priority', priority);

    api.get(`/tasks?${params}`).then(res => setTasks(res.data.tasks)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, [filter, priority]);

  const handleStatusChange = async (taskId, newStatus) => {
    await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
    fetchTasks();
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    fetchTasks();
  };

  const groups = {
    overdue: tasks.filter(t => isOverdue(t.dueDate, t.status)),
    today: tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      const d = new Date(t.dueDate);
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && !isOverdue(t.dueDate, t.status);
    }),
    upcoming: tasks.filter(t => {
      const days = getDaysUntilDue(t.dueDate);
      return days !== null && days > 0 && days <= 7 && t.status !== 'completed';
    }),
    other: tasks.filter(t => {
      const days = getDaysUntilDue(t.dueDate);
      return (!t.dueDate || days > 7) && t.status !== 'completed';
    }),
    completed: tasks.filter(t => t.status === 'completed')
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">Tasks assigned to you across all projects</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'todo', label: 'To Do' },
          { key: 'in-progress', label: 'In Progress' },
          { key: 'in-review', label: 'In Review' },
          { key: 'overdue', label: '⚠ Overdue' },
          { key: 'completed', label: 'Completed' },
        ].map(f => (
          <button key={f.key} className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
        <select className="form-select" style={{ padding: '7px 12px', fontSize: 13, width: 'auto', marginLeft: 'auto' }}
          value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="">All Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-center"><div className="loading-spinner" style={{ width: 40, height: 40 }} /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <div className="empty-title">No tasks found</div>
          <div className="empty-text">Tasks assigned to you will appear here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {filter === 'all' ? (
            <>
              {groups.overdue.length > 0 && <TaskGroup title="⚠ Overdue" tasks={groups.overdue} color="var(--red)" onStatusChange={handleStatusChange} onEdit={t => { setEditTask(t); setShowModal(true); }} onDelete={handleDelete} />}
              {groups.today.length > 0 && <TaskGroup title="📅 Due Today" tasks={groups.today} color="var(--yellow)" onStatusChange={handleStatusChange} onEdit={t => { setEditTask(t); setShowModal(true); }} onDelete={handleDelete} />}
              {groups.upcoming.length > 0 && <TaskGroup title="🗓 Upcoming (7 days)" tasks={groups.upcoming} color="var(--blue)" onStatusChange={handleStatusChange} onEdit={t => { setEditTask(t); setShowModal(true); }} onDelete={handleDelete} />}
              {groups.other.length > 0 && <TaskGroup title="◦ Other Tasks" tasks={groups.other} color="var(--text-muted)" onStatusChange={handleStatusChange} onEdit={t => { setEditTask(t); setShowModal(true); }} onDelete={handleDelete} />}
              {groups.completed.length > 0 && <TaskGroup title="✓ Completed" tasks={groups.completed} color="var(--green)" onStatusChange={handleStatusChange} onEdit={t => { setEditTask(t); setShowModal(true); }} onDelete={handleDelete} />}
            </>
          ) : (
            <TaskGroup title={`${tasks.length} task${tasks.length !== 1 ? 's' : ''}`} tasks={tasks} color="var(--accent)" onStatusChange={handleStatusChange} onEdit={t => { setEditTask(t); setShowModal(true); }} onDelete={handleDelete} />
          )}
        </div>
      )}

      {showModal && (
        <TaskModal
          task={editTask}
          projectId={editTask?.project?._id}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={() => { setShowModal(false); setEditTask(null); fetchTasks(); }}
          readOnly={!editTask}
        />
      )}
    </div>
  );
}

function TaskGroup({ title, tasks, color, onStatusChange, onEdit, onDelete }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ color, fontWeight: 700, fontSize: 14 }}>{title}</span>
        <span style={{ background: color, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>{tasks.length}</span>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Task</th><th>Project</th><th>Priority</th><th>Due Date</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task._id}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{task.title}</div>
                  {task.description && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.description.slice(0, 50)}...</div>}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: task.project?.color || 'var(--accent)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13 }}>{task.project?.name}</span>
                  </div>
                </td>
                <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                <td>
                  {task.dueDate ? (
                    <span style={{ fontSize: 13, color: isOverdue(task.dueDate, task.status) ? 'var(--red)' : 'inherit' }}>
                      {isOverdue(task.dueDate, task.status) ? '⚠ ' : ''}{formatDate(task.dueDate)}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  <select className="form-select" style={{ padding: '5px 8px', fontSize: 12, width: 'auto' }}
                    value={task.status} onChange={e => onStatusChange(task._id, e.target.value)}>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="in-review">In Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(task)}>✎</button>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => onDelete(task._id)}>⊗</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}