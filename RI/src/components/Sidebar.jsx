import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home' },
  { to: '/orders', label: 'Orders' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/employees', label: 'Employees' },
  { to: '/transactions', label: 'Transactions' },
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
