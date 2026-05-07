import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/projects', icon: '◫', label: 'Projects' },
  { to: '/tasks',    icon: '✓', label: 'My Tasks'  },
];

const ADMIN_ITEMS = [
  { to: '/team', icon: '◈', label: 'Team' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* ── Logo ─────────────────────────────────────── */}
      <div className="sidebar-logo">
        <div className="logo-mark">F</div>
        <div>
          <div className="logo-text">FlowBoard</div>
          <div className="logo-tag">Task Manager</div>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────── */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>

        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-link${isActive ? ' active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="nav-section-label nav-section-label--admin">
              Admin
            </div>
            {ADMIN_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </>
        )}

        {/* Pushes logout to bottom */}
        <div className="nav-spacer" />

        <div className="sidebar-divider" />

        <button
          className="nav-link nav-link--logout"
          onClick={handleLogout}
        >
          <span className="nav-icon">⇥</span>
          Logout
        </button>
      </nav>

      {/* ── User Block ───────────────────────────────── */}
      <div className="sidebar-user">
        <img
          src={
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user?.name || 'U'
            )}&background=6C63FF&color=fff`
          }
          alt={user?.name}
          className="user-avatar"
        />
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <div className="user-status-dot" title="Online" />
      </div>
    </aside>
  );
}