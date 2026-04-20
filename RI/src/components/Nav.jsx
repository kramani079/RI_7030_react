import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Nav({ onLogout, user }) {
  const { t } = useLanguage();

  return (
    <nav className="topbar">
      <div className="topbar-welcome">
        <span className="topbar-text">{t.welcome || 'Welcome'}, {user?.name || 'Admin User'}</span>
        <span className="topbar-badge">{user?.role === 'Admin' ? (t.admin || 'Admin') : (t.employee || 'Employee')}</span>
      </div>
      <div className="topbar-right">
        <Link
          to={user?.role === 'Employee' ? '/employee/profile' : '/profile'}
          className="topbar-avatar"
          style={{ textDecoration: 'none', cursor: 'pointer', fontSize: '14px', background: '#e2e8f0', padding: '5px 10px', borderRadius: '5px' }}
        >
          {t.profile || 'Profile'}
        </Link>
        <button className="topbar-logout" onClick={onLogout}>{t.logout}</button>
      </div>
    </nav>
  );
}
