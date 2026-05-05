import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Nav />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
