import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import ProjectModal from '../components/ProjectModal';

const STATUS_COLORS = { active: 'var(--green)', 'on-hold': 'var(--yellow)', completed: 'var(--accent)', archived: 'var(--text-muted)' };

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchProjects = () => {
    setLoading(true);
    api.get('/projects').then(res => setProjects(res.data.projects)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const filtered = projects.filter(p => {
    const matchStatus = filter === 'all' || p.status === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    await api.delete(`/projects/${id}`);
    fetchProjects();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => { setEditProject(null); setShowModal(true); }}>
            + New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <span className="search-icon">⌕</span>
          <input className="form-input" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'active', 'on-hold', 'completed', 'archived'].map(s => (
            <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : s.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="loading-spinner" style={{ width: 40, height: 40 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◫</div>
          <div className="empty-title">No projects found</div>
          <div className="empty-text">
            {user?.role === 'admin' ? 'Create your first project to get started.' : 'You haven\'t been added to any projects yet.'}
          </div>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Project</button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map(project => {
            const progress = project.taskStats?.total > 0
              ? Math.round((project.taskStats.completed / project.taskStats.total) * 100) : 0;
            const isOwner = project.owner?._id === user?._id || project.owner === user?._id;

            return (
              <div key={project._id} className="project-card" onClick={() => navigate(`/projects/${project._id}`)}>
                <div className="project-card-bar" style={{ background: project.color || 'var(--accent)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span className={`badge badge-${project.status}`}>{project.status.replace('-', ' ')}</span>
                  <span className={`badge badge-${project.priority}`}>{project.priority}</span>
                </div>
                <div className="project-card-name">{project.name}</div>
                <div className="project-card-desc">{project.description || 'No description provided.'}</div>

                <div className="project-progress">
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progress}%`, background: project.color || 'var(--accent)' }} />
                  </div>
                  <div className="progress-label">{progress}% complete — {project.taskStats?.completed || 0}/{project.taskStats?.total || 0} tasks</div>
                </div>

                <div className="project-card-meta">
                  <div className="avatar-stack">
                    {project.members?.slice(0, 4).map(m => m.user && (
                      <img key={m.user._id} src={m.user.avatar} alt={m.user.name} className="avatar" title={m.user.name} />
                    ))}
                    {project.members?.length > 4 && (
                      <div className="avatar-more">+{project.members.length - 4}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {project.deadline && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📅 {formatDate(project.deadline)}</span>
                    )}
                    {(isOwner || user?.role === 'admin') && (
                      <>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={e => { e.stopPropagation(); setEditProject(project); setShowModal(true); }}>✎</button>
                        <button className="btn btn-danger btn-icon btn-sm" title="Delete" onClick={e => handleDelete(project._id, e)}>⊗</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editProject}
          onClose={() => { setShowModal(false); setEditProject(null); }}
          onSave={() => { setShowModal(false); setEditProject(null); fetchProjects(); }}
        />
      )}
    </div>
  );
}