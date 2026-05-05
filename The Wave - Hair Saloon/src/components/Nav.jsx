export default function Nav() {
  return (
    <nav className="topbar">
      <div className="topbar-welcome">
        <span className="topbar-text">✂️ <strong>The Wave</strong> — Men's Saloon</span>
      </div>
      <div className="topbar-right">
        <span className="topbar-text" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
    </nav>
  );
}
