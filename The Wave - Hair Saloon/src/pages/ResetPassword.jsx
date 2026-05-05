import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { validateResetToken, consumeResetToken } from '../services/emailService';
import './LoginPage.css'; // reuse all login card / field styles
import './ResetPassword.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus]           = useState('checking'); // checking | valid | invalid | done
  const [tokenEmail, setTokenEmail]   = useState('');
  const [invalidReason, setInvalidReason] = useState('');

  const [newPassword, setNewPassword]   = useState('');
  const [confirmPass, setConfirmPass]   = useState('');
  const [error, setError]               = useState('');
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setInvalidReason('No reset token found in the URL. Please use the link from your email.');
      return;
    }
    const result = validateResetToken(token);
    if (result.valid) {
      setTokenEmail(result.email);
      setStatus('valid');
    } else {
      setInvalidReason(result.reason);
      setStatus('invalid');
    }
  }, [token]);

  function handleReset(e) {
    e.preventDefault();
    setError('');

    if (!newPassword) { setError('Please enter a new password.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPass) { setError('Passwords do not match.'); return; }

    setLoading(true);

    // Re-validate token (could have expired while user was typing)
    const check = validateResetToken(token);
    if (!check.valid) {
      setError(check.reason);
      setStatus('invalid');
      setInvalidReason(check.reason);
      setLoading(false);
      return;
    }

    // Update password in localStorage
    const users = JSON.parse(localStorage.getItem('ri_users') || '[]');
    const idx = users.findIndex(u => u.email === tokenEmail);
    if (idx === -1) {
      setError('User account not found.');
      setLoading(false);
      return;
    }
    users[idx].password = newPassword;
    localStorage.setItem('ri_users', JSON.stringify(users));

    // Consume (delete) the token so it can't be reused
    consumeResetToken(token);

    setStatus('done');
    setLoading(false);
  }

  return (
    <div className="login-page">
      {/* ── Top bar ── */}
      <header className="login-topbar">
        <div className="brand-box">RI</div>
        <div className="top-actions">
          <div className="nav-pills">
            {[1, 2, 3, 4].map(i => <span key={i} className="nav-pill" />)}
          </div>
          <input className="search-box" type="text" placeholder="" readOnly />
        </div>
      </header>

      <section className="login-bg">
        <div className="login-card rp-card">

          {/* ── Illustration ── */}
          <div className="illustration" aria-hidden="true">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="90" fill="#ddeef6" />
              <rect x="60" y="80" width="80" height="70" rx="10" fill="#3e97b9" opacity="0.85" />
              <rect x="72" y="92" width="56" height="8" rx="4" fill="#fff" opacity="0.7" />
              <rect x="72" y="108" width="40" height="8" rx="4" fill="#fff" opacity="0.5" />
              <rect x="72" y="124" width="48" height="8" rx="4" fill="#fff" opacity="0.5" />
              <circle cx="100" cy="65" r="18" fill="#f5c9a0" />
              <path d="M82 61 Q83 48 100 47 Q117 48 118 61 Q109 56 100 57 Q91 56 82 61Z" fill="#2b1a0e" />
              <rect x="75" y="78" width="12" height="20" rx="6" fill="#3e97b9" opacity="0.6" />
              <rect x="113" y="78" width="12" height="20" rx="6" fill="#3e97b9" opacity="0.6" />
              {/* lock icon over the card */}
              <rect x="86" y="118" width="28" height="22" rx="5" fill="#1a3344" />
              <path d="M88 118 Q88 108 100 108 Q112 108 112 118" stroke="#1a3344" strokeWidth="4" fill="none" strokeLinecap="round" />
              <circle cx="100" cy="128" r="3" fill="#fff" />
            </svg>
          </div>

          {/* ── Form area ── */}
          <div className="login-form-area">

            {/* ── CHECKING ── */}
            {status === 'checking' && (
              <div className="rp-checking">
                <div className="rp-spinner" />
                <p>Validating your reset link…</p>
              </div>
            )}

            {/* ── INVALID token ── */}
            {status === 'invalid' && (
              <div className="rp-state">
                <div className="rp-icon rp-icon-error">✕</div>
                <h1 className="login-title rp-title">Link Expired</h1>
                <p className="login-subtitle">{invalidReason}</p>
                <Link to="/login" className="btn-primary rp-back-btn">Back to Login</Link>
              </div>
            )}

            {/* ── VALID — show password form ── */}
            {status === 'valid' && (
              <>
                <h1 className="login-title">Set New Password</h1>
                <p className="login-subtitle">
                  Resetting password for <strong>{tokenEmail}</strong>
                </p>

                {error && (
                  <div className="login-error">
                    <span className="login-error-icon">⚠</span>{error}
                  </div>
                )}

                <form className="login-form" onSubmit={handleReset}>
                  <div className="field-group">
                    <label className="field-label" htmlFor="rp-new">New Password</label>
                    <div className="password-wrap">
                      <input
                        id="rp-new"
                        type={showNew ? 'text' : 'password'}
                        className="field"
                        placeholder="Min. 6 characters"
                        value={newPassword}
                        onChange={e => { setNewPassword(e.target.value); setError(''); }}
                      />
                      <button type="button" className="toggle-pass-btn" onClick={() => setShowNew(p => !p)} tabIndex={-1}>
                        {showNew ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="rp-confirm">Confirm New Password</label>
                    <div className="password-wrap">
                      <input
                        id="rp-confirm"
                        type={showConfirm ? 'text' : 'password'}
                        className="field"
                        placeholder="Re-enter new password"
                        value={confirmPass}
                        onChange={e => { setConfirmPass(e.target.value); setError(''); }}
                      />
                      <button type="button" className="toggle-pass-btn" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                        {showConfirm ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                  <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Updating…' : 'Update Password'}
                  </button>
                </form>
              </>
            )}

            {/* ── DONE — password updated ── */}
            {status === 'done' && (
              <div className="rp-state">
                <div className="rp-icon rp-icon-success">✓</div>
                <h1 className="login-title rp-title">Password Updated!</h1>
                <p className="login-subtitle">Your password has been reset successfully. You can now log in with your new password.</p>
                <Link to="/login" className="btn-primary rp-back-btn">Go to Login</Link>
              </div>
            )}

          </div>
        </div>
      </section>
    </div>
  );
}
