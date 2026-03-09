import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import Sidebar from './Sidebar';

export default function Layout({ user, onLogout }) {
  return (
    <div className="app-shell">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Right: topbar + content */}
      <div className="app-main">
        <Nav user={user} onLogout={onLogout} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
