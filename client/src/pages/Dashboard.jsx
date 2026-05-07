import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate, getDaysUntilDue, getPriorityColor, getStatusColor } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container loading-center"><div className="loading-spinner" style={{ width: 40, height: 40 }} /></div>;

  const completionRate = stats?.taskStats?.total > 0
    ? Math.round((stats.taskStats.completed / stats.taskStats.total) * 100)
    : 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="text-accent">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="page-subtitle">Here's what's happening across your workspace today.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-member'}`}>
            {user?.role === 'admin' ? '👑' : '👤'} {user?.role}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Projects</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats?.projectStats?.total || 0}</div>
          <div className="stat-sub">
            <span className="dot dot-green" />
            {stats?.projectStats?.active || 0} active
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{stats?.taskStats?.total || 0}</div>
          <div className="stat-sub">
            <span className="dot dot-green" />
            {completionRate}% completed
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">My Tasks</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{stats?.myTaskStats?.total || 0}</div>
          <div className="stat-sub">
            <span className="dot dot-yellow" />
            {stats?.myTaskStats?.['in-progress'] || 0} in progress
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className="stat-value" style={{ color: stats?.overdueCount > 0 ? 'var(--red)' : 'var(--text-primary)' }}>
            {stats?.overdueCount || 0}
          </div>
          <div className="stat-sub">
            <span className="dot dot-green" />
            {stats?.completedThisWeek || 0} done this week
          </div>
        </div>
      </div>

      {/* Admin Stats */}
      {user?.role === 'admin' && stats?.adminStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Users', value: stats.adminStats.totalUsers, color: 'var(--purple)' },
            { label: 'All Projects', value: stats.adminStats.totalProjects, color: 'var(--accent)' },
            { label: 'All Tasks', value: stats.adminStats.totalTasks, color: 'var(--blue)' },
          ].map(item => (
            <div key={item.label} className="stat-card" style={{ border: '1px solid var(--accent-dim)' }}>
              <div className="stat-label">🔑 Admin — {item.label}</div>
              <div className="stat-value" style={{ color: item.color, fontSize: 28 }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="content-grid">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Task Status Breakdown */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Task Status Overview</h3>
            {[
              { key: 'todo', label: 'To Do', color: 'var(--text-muted)', bg: 'var(--bg-hover)' },
              { key: 'in-progress', label: 'In Progress', color: 'var(--blue)', bg: 'var(--blue-dim)' },
              { key: 'in-review', label: 'In Review', color: 'var(--purple)', bg: 'var(--purple-dim)' },
              { key: 'completed', label: 'Completed', color: 'var(--green)', bg: 'var(--green-dim)' },
            ].map(({ key, label, color, bg }) => {
              const count = stats?.taskStats?.[key] || 0;
              const pct = stats?.taskStats?.total > 0 ? (count / stats.taskStats.total) * 100 : 0;
              return (
                <div key={key} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                    <span style={{ color, fontWeight: 700 }}>{count}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Recent Activity</h3>
            {stats?.recentTasks?.length === 0 && (
              <div className="empty-state" style={{ padding: '20px' }}>
                <p className="text-muted" style={{ fontSize: 14 }}>No recent activity.</p>
              </div>
            )}
            {stats?.recentTasks?.map(task => (
              <div key={task._id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: task.project?.color || 'var(--accent)', marginTop: 6, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {task.project?.name} • <span className={`badge badge-${task.status}`} style={{ fontSize: 10 }}>{task.status}</span>
                  </div>
                </div>
                {task.assignee && (
                  <img src={task.assignee.avatar} alt={task.assignee.name} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Overdue Tasks */}
          {stats?.overdueTasks?.length > 0 && (
            <div className="card" style={{ border: '1px solid rgba(255,95,126,0.2)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚠ Overdue Tasks
              </h3>
              {stats.overdueTasks.map(task => (
                <div key={task._id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{task.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.project?.name}</span>
                    <span className="overdue-indicator">⚠ {Math.abs(getDaysUntilDue(task.dueDate))}d overdue</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming Tasks */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📅 Upcoming (7 days)</h3>
            {stats?.upcomingTasks?.length === 0
              ? <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No upcoming deadlines. Great!</p>
              : stats.upcomingTasks.map(task => (
                <div key={task._id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{task.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.project?.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--yellow)', fontWeight: 600 }}>
                      {getDaysUntilDue(task.dueDate) === 0 ? 'Today' : `${getDaysUntilDue(task.dueDate)}d left`}
                    </span>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Quick Nav */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-secondary w-full" onClick={() => navigate('/projects')}>◫ View All Projects</button>
              <button className="btn btn-secondary w-full" onClick={() => navigate('/tasks')}>✓ My Tasks Board</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}