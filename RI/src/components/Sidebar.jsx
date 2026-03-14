import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const ADMIN_NAV_ITEMS = [
    { to: '/dashboard', label: t.home },
    { to: '/orders', label: t.orders },
    { to: '/inventory', label: t.inventory },
    { to: '/employees', label: t.employees },
    { to: '/transactions', label: t.transactions },
    { to: '/salary', label: t.salary },
  ];

  const EMPLOYEE_NAV_ITEMS = [
    { to: '/employee/dashboard', label: t.home },
    { to: '/employee/orders', label: t.orders },
    { to: '/employee/inventory', label: t.inventory },
    { to: '/employee/transactions', label: t.transactions },
    { to: '/employee/salary', label: t.salary },
  ];

  const NAV_ITEMS = user?.role === 'Employee' ? EMPLOYEE_NAV_ITEMS : ADMIN_NAV_ITEMS;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">RI</div>
      <ul className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to.endsWith('/dashboard')}
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

