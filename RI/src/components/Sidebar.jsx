import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '🏠', label: 'Home' },
  { to: '/orders', icon: '📋', label: 'Orders' },
  { to: '/inventory', icon: '📦', label: 'Inventory' },
  { to: '/employees', icon: '👥', label: 'Employees' },
  { to: '/transactions', icon: '💳', label: 'Transactions' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">RI</div>
      <ul className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <li key={label}>
            <NavLink
              to={to}
              end={to === '/dashboard'}
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
