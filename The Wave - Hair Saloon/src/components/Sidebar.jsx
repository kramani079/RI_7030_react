import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const NAV_ITEMS = [
    { to: '/home',       icon: '🏠', label: 'Home'       },
    { to: '/inventory',  icon: '📦', label: 'Inventory'  },
    { to: '/membership', icon: '👤', label: 'Membership' },
    { to: '/appointments',icon:'📅', label: 'Appointments'},
    { to: '/sales',      icon: '💰', label: 'Sales'      },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">✂️</span>
        <span>The Wave</span>
        <span className="logo-sub">Men's Saloon</span>
      </div>
      <ul className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
            >
              <span className="sidebar-icon">{icon}</span>
              <span className="sidebar-label">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
