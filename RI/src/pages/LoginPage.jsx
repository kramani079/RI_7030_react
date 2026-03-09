import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage({ onLogin }) {
  const [loginType, setLoginType] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function submit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    // Lookup from localStorage
    const users = JSON.parse(localStorage.getItem('ri_users') || '[]');
    const found = users.find(u => u.email === email.toLowerCase().trim());

    if (!found) {
      setError('No account found with this email. Please register first.');
      return;
    }

    if (found.password !== password) {
      setError('Incorrect password. Please try again.');
      return;
    }

    // Check role match
    if (found.role !== loginType) {
      setError(`This account is registered as "${found.role}". Please use the ${found.role} login tab.`);
      return;
    }

    // Login success
    const user = {
      name: found.fullName,
      email: found.email,
      mobile: found.mobile || '',
      address: found.address || '',
      role: found.role,
      employeeType: found.employeeType || 'N/A',
    };

    onLogin(user);
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="login-page">
      <header className="login-topbar">
        <div className="brand-box">RI</div>
        <div className="top-actions">
          <div className="nav-pills">
            {[1, 2, 3, 4].map(i => <span key={i} className="nav-pill"></span>)}
          </div>
          <input className="search-box" type="text" placeholder="" readOnly />
        </div>
      </header>

      <section className="login-bg">
        <div className="login-card">
          <div className="illustration" aria-hidden="true">
            <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="18" y="14" width="155" height="180" rx="10" fill="#ddeef6" stroke="#c5dde9" strokeWidth="1.5" />
              <rect x="34" y="30" width="123" height="148" rx="6" fill="#fff" />
              <rect x="44" y="50" width="90" height="7" rx="3.5" fill="#d8e8f0" />
              <rect x="44" y="68" width="70" height="7" rx="3.5" fill="#d8e8f0" />
              <rect x="44" y="86" width="80" height="7" rx="3.5" fill="#d8e8f0" />
              <rect x="44" y="104" width="60" height="7" rx="3.5" fill="#d8e8f0" />
              <polyline points="44,140 68,120 92,130 116,108 140,118" stroke="#8cbdd0" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="116" cy="108" r="4" fill="#3e97b9" />
              <ellipse cx="156" cy="197" rx="28" ry="7" fill="#1e4a62" opacity="0.10" />
              <rect x="135" y="140" width="42" height="54" rx="10" fill="#3e97b9" />
              <path d="M150 140 Q156 148 162 140" stroke="#2d85a5" strokeWidth="2" fill="none" />
              <circle cx="156" cy="122" r="17" fill="#f5c9a0" />
              <path d="M139 118 Q140 103 156 102 Q172 103 173 118 Q165 112 156 113 Q147 112 139 118Z" fill="#2b1a0e" />
              <rect x="124" y="145" width="11" height="30" rx="5.5" fill="#3e97b9" />
              <rect x="177" y="145" width="11" height="30" rx="5.5" fill="#3e97b9" />
              <circle cx="129" cy="178" r="6" fill="#f5c9a0" />
              <circle cx="183" cy="178" r="6" fill="#f5c9a0" />
              <rect x="140" y="192" width="14" height="22" rx="5" fill="#1e3a4f" />
              <rect x="158" y="192" width="14" height="22" rx="5" fill="#1e3a4f" />
            </svg>
          </div>

          <div className="login-form-area">
            {/* Login Type Toggle */}
            <div className="login-type-toggle">
              <button
                type="button"
                className={`login-type-btn ${loginType === 'Admin' ? 'active admin-active' : ''}`}
                onClick={() => { setLoginType('Admin'); setError(''); }}
              >
                <span className="login-type-icon">🔐</span>
                Admin
              </button>
              <button
                type="button"
                className={`login-type-btn ${loginType === 'Employee' ? 'active employee-active' : ''}`}
                onClick={() => { setLoginType('Employee'); setError(''); }}
              >
                <span className="login-type-icon">👤</span>
                Employee
              </button>
            </div>

            <h1 className="login-title">
              {loginType === 'Admin' ? 'Admin Login' : 'Employee Login'}
            </h1>
            <p className="login-subtitle">
              {loginType === 'Admin'
                ? 'Sign in with your admin credentials'
                : 'Sign in with your employee credentials'}
            </p>

            {error && (
              <div className="login-error">
                <span className="login-error-icon">⚠</span>
                {error}
              </div>
            )}

            <form className="login-form" onSubmit={submit}>
              <div className="field-group">
                <label className="field-label" htmlFor="login-email">Email ID</label>
                <input
                  id="login-email"
                  className="field"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                  type="email"
                />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="login-password">Password</label>
                <div className="password-wrap">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="field"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-pass-btn"
                    onClick={() => setShowPassword(p => !p)}
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <button
                className={`btn-primary ${loginType === 'Employee' ? 'btn-employee' : ''}`}
                type="submit"
              >
                Login as {loginType}
              </button>
            </form>
            <div className="register-line">
              Don't have an account? <Link to="/register">Register here</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
