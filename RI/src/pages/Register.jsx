import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRegister } from '../api';
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    address: '',
    role: 'Admin',
    employeeType: 'Casting'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const EMPLOYEE_TYPES = ['Casting', 'Finishing Touch', 'Gold Plating', 'Packaging'];

  function change(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (!form.fullName || !form.email || !form.password) {
      return alert('Please fill all required fields');
    }
    if (form.password !== form.confirmPassword) {
      return alert('Passwords do not match');
    }

    setLoading(true);

    try {
      const userData = {
        fullName: form.fullName,
        email: form.email.toLowerCase().trim(),
        password: form.password,
        mobile: form.mobile,
        address: form.address,
        role: form.role,
        employeeType: form.role === 'Employee' ? form.employeeType : 'N/A',
      };

      await apiRegister(userData);
      
      setLoading(false);
      alert('Registration successful — you may now sign in');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <header className="login-topbar">
        <div className="brand-box">RI</div>
        <div className="top-actions">
          <div className="nav-pills">
            {[1, 2, 3, 4].map(i => <span key={i} className="nav-pill"></span>)}
          </div>
          <input className="search-box" type="text" placeholder="" readOnly />
        </div>
      </header>

      <section className="reg-bg">
        <div className="reg-card">
          <h2 className="reg-title">Create New Account</h2>
          <hr className="reg-divider" />

          {error && (
            <div className="login-error" style={{ marginBottom: '15px' }}>
              <span className="login-error-icon">⚠</span>{error}
            </div>
          )}

          <form className="reg-form" onSubmit={submit}>
            <div className="reg-section-label">Account Information</div>

            <input
              className="reg-field"
              name="fullName"
              value={form.fullName}
              onChange={change}
              placeholder="Full Name *"
              required
            />
            <input
              className="reg-field"
              name="email"
              type="email"
              value={form.email}
              onChange={change}
              placeholder="Email ID *"
              required
            />
            <input
              className="reg-field"
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={change}
              placeholder="Mobile No *"
              required
            />
            <input
              className="reg-field"
              name="address"
              value={form.address}
              onChange={change}
              placeholder="Address *"
              required
            />
            <input
              className="reg-field"
              name="password"
              type="password"
              value={form.password}
              onChange={change}
              placeholder="Password *"
              required
            />
            <input
              className="reg-field"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={change}
              placeholder="Confirm Password *"
              required
            />

            <hr className="reg-divider" style={{ margin: '15px 0 20px' }} />

            <div className="reg-section-label">Account Type</div>
            <div className="reg-radios">
              <label className="reg-radio-label">
                <input
                  type="radio"
                  name="role"
                  value="Admin"
                  checked={form.role === 'Admin'}
                  onChange={change}
                />
                Admin
              </label>
              <label className="reg-radio-label">
                <input
                  type="radio"
                  name="role"
                  value="Employee"
                  checked={form.role === 'Employee'}
                  onChange={change}
                />
                Employee
              </label>
            </div>

            {form.role === 'Employee' && (
              <div style={{ marginTop: '15px' }}>
                <div className="reg-section-label">Employee Type</div>
                <select
                  className="reg-select"
                  name="employeeType"
                  value={form.employeeType}
                  onChange={change}
                >
                  {EMPLOYEE_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            <hr className="reg-divider" style={{ marginTop: '22px' }} />

            <div className="reg-actions">
              <button className="reg-btn" type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            </div>

            <div className="reg-login-link">
              Already have an account? <Link to="/login">Login here</Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
