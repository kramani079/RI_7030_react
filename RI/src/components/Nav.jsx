export default function Nav({ onLogout, user }) {
  return (
    <nav className="topbar">
      <div className="topbar-welcome">
        <span className="topbar-sun">🌼</span>
        <span className="topbar-text">Welcome, {user?.name || 'Admin User'}</span>
        <span className="topbar-badge">{user?.role || 'Admin'}</span>
      </div>
      <div className="topbar-right">
        <span className="topbar-avatar">👤</span>
        <button className="topbar-logout" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}
