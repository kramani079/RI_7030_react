import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiLogin } from '../api';
import {
  generateResetToken,
  saveResetToken,
  buildResetLink,
  sendResetEmail,
  isEmailConfigured,
} from '../services/emailService';
import './LoginPage.css';

export default function LoginPage({ onLogin }) {
  const [loginType, setLoginType] = useState('Admin');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ── Forgot Password state ───────────────────────────
  const [showForgot, setShowForgot] = useState(false);
  const [fpEmail, setFpEmail]       = useState('');
  const [fpError, setFpError]       = useState('');
  const [fpLoading, setFpLoading]   = useState(false);

  // After success: either 'email' (sent to inbox) or the reset link string (shown on screen)
  const [fpSentMode, setFpSentMode]   = useState(null); // null | 'email' | 'link'
  const [fpResetLink, setFpResetLink] = useState('');
  const [fpCopied, setFpCopied]       = useState(false);

  // ── Login submit ────────────────────────────────────
  async function submit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!password.trim()) { setError('Please enter your password'); return; }

    setLoading(true);
    try {
      const user = await apiLogin(email, password);
      
      if (user.role !== loginType) {
        setError(`This account is registered as "${user.role}". Please use the ${user.role} login tab.`);
        setLoading(false);
        return;
      }

      onLogin(user);

      if (user.role === 'Employee') {
        navigate('/employee/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  // ── Forgot Password ─────────────────────────────────
  async function handleSendResetLink(e) {
    e.preventDefault();
    setFpError('');

    const trimEmail = fpEmail.toLowerCase().trim();
    if (!trimEmail) { setFpError('Please enter your registered email.'); return; }

    setFpLoading(true);

    try {
      // We don't have a checkEmail endpoint, so we rely on the token logic for now
      // but in a real app, we'd check the DB first.
      const token = generateResetToken();
      saveResetToken(trimEmail, token);
      const resetLink = buildResetLink(token);

      if (isEmailConfigured()) {
        await sendResetEmail(trimEmail, 'User', token);
        setFpSentMode('email');
        setFpEmail('');
      } else {
        setFpResetLink(resetLink);
        setFpSentMode('link');
        setFpEmail('');
      }
    } catch (err) {
      setFpError(err.message || 'Failed to process request.');
    } finally {
      setFpLoading(false);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(fpResetLink).then(() => {
      setFpCopied(true);
      setTimeout(() => setFpCopied(false), 2000);
    });
  }

  function toggleForgot() {
    setShowForgot(f => !f);
    setFpError('');
    setFpEmail('');
    setFpSentMode(null);
    setFpResetLink('');
    setFpCopied(false);
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
                <span className="login-type-icon">🔐</span>Admin
              </button>
              <button
                type="button"
                className={`login-type-btn ${loginType === 'Employee' ? 'active employee-active' : ''}`}
                onClick={() => { setLoginType('Employee'); setError(''); }}
              >
                <span className="login-type-icon">👤</span>Employee
              </button>
            </div>

            {!showForgot ? (
              /* ══ NORMAL LOGIN ══ */
              <>
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
                    <span className="login-error-icon">⚠</span>{error}
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
                    <button type="button" className="forgot-link" onClick={toggleForgot}>
                      Forgot Password?
                    </button>
                  </div>
                  <button
                    className={`btn-primary ${loginType === 'Employee' ? 'btn-employee' : ''}`}
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : `Login as ${loginType}`}
                  </button>
                </form>
              </>
            ) : (
              /* ══ FORGOT PASSWORD ══ */
              <>
                <h1 className="login-title">Forgot Password</h1>
                <p className="login-subtitle">
                  Enter your registered email to receive a password reset link.
                </p>

                {fpError && (
                  <div className="login-error">
                    <span className="login-error-icon">⚠</span>{fpError}
                  </div>
                )}

                {/* ── Step 1: Email input ── */}
                {!fpSentMode && (
                  <form className="login-form" onSubmit={handleSendResetLink}>
                    <div className="field-group">
                      <label className="field-label" htmlFor="fp-email">Registered Email</label>
                      <input
                        id="fp-email"
                        type="email"
                        className="field"
                        placeholder="Enter your email address"
                        value={fpEmail}
                        onChange={e => { setFpEmail(e.target.value); setFpError(''); }}
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                    <button type="submit" className="btn-primary" disabled={fpLoading}>
                      {fpLoading ? 'Processing…' : '🔑 Send Password Reset Link'}
                    </button>
                    <button type="button" className="forgot-link" onClick={toggleForgot}>
                      ← Back to Login
                    </button>
                  </form>
                )}

                {/* ── Step 2a: Email sent successfully ── */}
                {fpSentMode === 'email' && (
                  <div className="fp-sent-box">
                    <div className="fp-sent-icon">✉</div>
                    <p className="fp-sent-text">
                      Reset link sent! Check your inbox (and spam folder).<br />
                      The link is valid for <strong>30 minutes</strong>.
                    </p>
                    <button type="button" className="btn-primary" onClick={toggleForgot} style={{ marginTop: '14px' }}>
                      Back to Login
                    </button>
                  </div>
                )}

                {/* ── Step 2b: Link shown on screen (EmailJS not configured) ── */}
                {fpSentMode === 'link' && (
                  <div className="fp-link-box">
                    <div className="fp-link-header">
                      <span className="fp-link-icon">🔑</span>
                      <div>
                        <p className="fp-link-title">Your Password Reset Link</p>
                        <p className="fp-link-sub">Click the link or copy it into your browser. Valid for 30 minutes.</p>
                      </div>
                    </div>

                    <a
                      href={fpResetLink}
                      className="fp-link-url"
                      target="_self"
                    >
                      {fpResetLink}
                    </a>

                    <div className="fp-link-actions">
                      <button
                        type="button"
                        className="fp-copy-btn"
                        onClick={handleCopyLink}
                      >
                        {fpCopied ? '✓ Copied!' : '📋 Copy Link'}
                      </button>
                      <a href={fpResetLink} className="btn-primary fp-open-btn">
                        Open Reset Page →
                      </a>
                    </div>

                    <p className="fp-link-note">
                      💡 To send emails automatically, configure EmailJS in<br />
                      <code>src/services/emailService.js</code>
                    </p>

                    <button type="button" className="forgot-link" onClick={toggleForgot} style={{ marginTop: '8px' }}>
                      ← Back to Login
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="register-line">
              Don't have an account? <Link to="/register">Register here</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
