import { Link } from 'react-router-dom';

export default function Nav({ onLogout, user }) {
  return (
    <nav className="topbar">
      <div className="topbar-welcome">
        <span className="topbar-text">Welcome, {user?.name || 'Admin User'}</span>
        <span className="topbar-badge">{user?.role || 'Admin'}</span>
      </div>
      <div className="topbar-right">
        <Link to="/profile" className="topbar-avatar" style={{ textDecoration: 'none', cursor: 'pointer', fontSize: '14px', background: '#e2e8f0', padding: '5px 10px', borderRadius: '5px' }}>Profile</Link>
        <button className="topbar-logout" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}
