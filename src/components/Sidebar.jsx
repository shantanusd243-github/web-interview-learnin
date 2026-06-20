import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Study',
    items: [
      { to: '/dashboard', icon: '📊', label: 'Dashboard' },
      { to: '/questions', icon: '❓', label: 'All Questions' },
      { to: '/mock', icon: '🎯', label: 'Mock Interview' },
      { to: '/cheat', icon: '⚡', label: 'Quick Cheat Sheet' },
      { to: '/bookmarks', icon: '🔖', label: 'Bookmarks' },
      { to: '/submit', icon: '✍️', label: 'Submit a Question' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { to: '/reference/core-java', icon: '☕', label: 'Core Java' },
      { to: '/reference/java8', icon: '🚀', label: 'Java 8' },
      { to: '/reference/springboot', icon: '🍃', label: 'Spring Boot' },
      { to: '/reference/microservices', icon: '🔗', label: 'Microservices' },
      { to: '/reference/sql', icon: '🗄️', label: 'SQL Practice' },
    ],
  },
  {
    label: 'DSA + System Design',
    items: [
      { to: '/dsa', icon: '🧮', label: 'DSA Problems' },
      { to: '/sysdesign', icon: '🏗️', label: 'System Design' },
    ],
  },
  {
    label: 'Strategy',
    items: [
      { to: '/reference/gaps', icon: '🔍', label: 'Senior Gaps' },
      { to: '/reference/plan', icon: '📅', label: 'Revision Plan' },
      { to: '/reference/stories', icon: '💬', label: 'Story Prep' },
    ],
  },
];

const ADMIN_GROUP = {
  label: 'Admin',
  items: [{ to: '/admin', icon: '🛠️', label: 'Admin Dashboard' }],
};

export default function Sidebar({ open }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');
  const groups = isAdmin ? [...NAV_GROUPS, ADMIN_GROUP] : NAV_GROUPS;

  return (
    <div className={`sidebar${open ? ' open' : ''}`} id="sidebar">
      <div className="sidebar-logo">
        <h1>☕ Java Prep</h1>
        <p>Senior Developer · 6–8 yrs</p>
      </div>

      {groups.map((group) => (
        <div className="sidebar-section" key={group.label}>
          <div className="sidebar-label">{group.label}</div>
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="icon">{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </div>
      ))}

      <div className="sidebar-section" style={{ borderTop: '1px solid #1e293b', marginTop: 8 }}>
        <div className="sidebar-label">Account</div>
        {user ? (
          <>
            <div style={{ padding: '6px 16px', fontSize: 12, color: '#cbd5e1' }}>
              {user.name} <span style={{ color: '#475569' }}>({user.email})</span>
            </div>
            <button
              onClick={logout}
              className="nav-item"
              style={{ width: '100%', background: 'none', border: 'none', borderLeft: '2px solid transparent', textAlign: 'left', cursor: 'pointer', font: 'inherit' }}
            >
              <span className="icon">🚪</span> Sign out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="icon">🔑</span> Sign in
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="icon">📝</span> Create account
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
}
