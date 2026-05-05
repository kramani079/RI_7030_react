import { useState, useEffect } from 'react';
import './Profile.css';
import { useLanguage } from '../context/LanguageContext';

export default function Profile({ user, onUpdateUser }) {
    const { lang, toggleLanguage } = useLanguage();
    const [editSection, setEditSection] = useState(null); // 'header', 'personal', 'address'
    const [message, setMessage] = useState('');

    // ── Change Password state ──────────────────────────
    const [showChangePwd, setShowChangePwd] = useState(false);
    const [cpCurrent, setCpCurrent] = useState('');
    const [cpNew, setCpNew] = useState('');
    const [cpConfirm, setCpConfirm] = useState('');
    const [cpError, setCpError] = useState('');
    const [cpSuccess, setCpSuccess] = useState('');
    const [showCpCurrent, setShowCpCurrent] = useState(false);
    const [showCpNew, setShowCpNew] = useState(false);
    const [showCpConfirm, setShowCpConfirm] = useState(false);

    function handleChangePassword(e) {
        e.preventDefault();
        setCpError('');
        setCpSuccess('');

        if (!cpCurrent) { setCpError('Please enter your current password.'); return; }
        if (!cpNew) { setCpError('Please enter a new password.'); return; }
        if (cpNew.length < 6) { setCpError('New password must be at least 6 characters.'); return; }
        if (cpNew === cpCurrent) { setCpError('New password must be different from the current password.'); return; }
        if (cpNew !== cpConfirm) { setCpError('Passwords do not match.'); return; }

        const users = JSON.parse(localStorage.getItem('ri_users') || '[]');
        const idx = users.findIndex(u => u.email === user?.email);
        if (idx === -1) { setCpError('User account not found.'); return; }
        if (users[idx].password !== cpCurrent) { setCpError('Current password is incorrect.'); return; }

        users[idx].password = cpNew;
        localStorage.setItem('ri_users', JSON.stringify(users));
        setCpSuccess('Password changed successfully!');
        setCpCurrent('');
        setCpNew('');
        setCpConfirm('');
        setTimeout(() => { setShowChangePwd(false); setCpSuccess(''); }, 2500);
    }

    const [formData, setFormData] = useState({
        name: user?.name || 'Admin User',
        email: user?.email || 'admin@ri-factory.com',
        role: user?.role || 'Admin',
        employeeType: user?.employeeType || 'N/A',
        phone: user?.mobile || user?.phone || '9876543210',
        bio: user?.bio || user?.role || 'Admin',
        country: user?.country || 'India',
        cityState: user?.cityState || 'Surat, Gujarat',
        postalCode: user?.postalCode || '395003',
        taxId: user?.taxId || 'GSTIN1234567',
        address: user?.address || 'Gold Plaza, Ring Road, Surat',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                role: user.role || prev.role,
                employeeType: user.employeeType || prev.employeeType,
                phone: user.mobile || user.phone || prev.phone,
                address: user.address || prev.address,
            }));
        }
    }, [user]);

    const initials = formData.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    // Split name into first and last
    const nameParts = formData.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    function handleSave() {
        onUpdateUser({
            ...formData,
            name: formData.name,
            mobile: formData.phone,
        });
        setEditSection(null);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
    }

    function handleCancel() {
        // Reset form from user data
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.mobile || user.phone || prev.phone,
                address: user.address || prev.address,
            }));
        }
        setEditSection(null);
    }

    return (
        <div className="prof-page">
            <h1 className="prof-page-title">My Profile</h1>

            {message && (
                <div className="prof-success-alert">
                    <span className="prof-success-icon">✓</span>
                    {message}
                </div>
            )}

            {/* ── Section 1: Profile Header Card ─────── */}
            <div className="prof-section-card">
                <div className="prof-header-row">
                    <div className="prof-avatar">{initials}</div>
                    <div className="prof-header-info">
                        <h2 className="prof-name">{formData.name}</h2>
                        <p className="prof-designation">{formData.role}{formData.employeeType !== 'N/A' ? ` — ${formData.employeeType}` : ''}</p>
                        <p className="prof-location">{formData.cityState}, {formData.country}</p>
                    </div>
                    <button
                        className="prof-edit-btn"
                        onClick={() => setEditSection(editSection === 'header' ? null : 'header')}
                    >
                        Edit <span className="prof-edit-icon">✎</span>
                    </button>
                </div>

                {editSection === 'header' && (
                    <div className="prof-edit-area">
                        <div className="prof-field-grid">
                            <div className="prof-field">
                                <label>Full Name</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                />
                            </div>
                            <div className="prof-field">
                                <label>Role</label>
                                <input value={formData.role} readOnly className="prof-readonly" />
                            </div>
                        </div>
                        <div className="prof-edit-actions">
                            <button className="prof-cancel-btn" onClick={handleCancel}>Cancel</button>
                            <button className="prof-save-btn" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Section 2: Personal Information Card ── */}
            <div className="prof-section-card">
                <div className="prof-section-header">
                    <h3 className="prof-section-title">Personal Information</h3>
                    <button
                        className="prof-edit-btn"
                        onClick={() => setEditSection(editSection === 'personal' ? null : 'personal')}
                    >
                        Edit <span className="prof-edit-icon">✎</span>
                    </button>
                </div>

                <div className="prof-field-grid">
                    <div className="prof-field">
                        <label>First Name</label>
                        {editSection === 'personal' ? (
                            <input
                                value={firstName}
                                onChange={e => setFormData(p => ({ ...p, name: e.target.value + (lastName ? ' ' + lastName : '') }))}
                            />
                        ) : (
                            <p className="prof-field-value">{firstName}</p>
                        )}
                    </div>
                    <div className="prof-field">
                        <label>Last Name</label>
                        {editSection === 'personal' ? (
                            <input
                                value={lastName}
                                onChange={e => setFormData(p => ({ ...p, name: firstName + (e.target.value ? ' ' + e.target.value : '') }))}
                            />
                        ) : (
                            <p className="prof-field-value">{lastName || '—'}</p>
                        )}
                    </div>
                    <div className="prof-field">
                        <label>Email address</label>
                        {editSection === 'personal' ? (
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                            />
                        ) : (
                            <p className="prof-field-value">{formData.email}</p>
                        )}
                    </div>
                    <div className="prof-field">
                        <label>Phone</label>
                        {editSection === 'personal' ? (
                            <input
                                value={formData.phone}
                                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                            />
                        ) : (
                            <p className="prof-field-value">{formData.phone}</p>
                        )}
                    </div>
                    <div className="prof-field prof-field-full">
                        <label>Bio</label>
                        {editSection === 'personal' ? (
                            <input
                                value={formData.bio}
                                onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                            />
                        ) : (
                            <p className="prof-field-value">{formData.bio}</p>
                        )}
                    </div>
                </div>

                {editSection === 'personal' && (
                    <div className="prof-edit-actions">
                        <button className="prof-cancel-btn" onClick={handleCancel}>Cancel</button>
                        <button className="prof-save-btn" onClick={handleSave}>Save</button>
                    </div>
                )}
            </div>

            {/* ── Section 3: Address Card ───────────── */}
            <div className="prof-section-card">
                <div className="prof-section-header">
                    <h3 className="prof-section-title">Address</h3>
                    <button
                        className="prof-edit-btn"
                        onClick={() => setEditSection(editSection === 'address' ? null : 'address')}
                    >
                        Edit <span className="prof-edit-icon">✎</span>
                    </button>
                </div>

                <div className="prof-field-grid">
                    <div className="prof-field">
                        <label>Country</label>
                        {editSection === 'address' ? (
                            <input
                                value={formData.country}
                                onChange={e => setFormData(p => ({ ...p, country: e.target.value }))}
                            />
                        ) : (
                            <p className="prof-field-value">{formData.country}</p>
                        )}
                    </div>
                    <div className="prof-field">
                        <label>City / State</label>
                        {editSection === 'address' ? (
                            <input
                                value={formData.cityState}
                                onChange={e => setFormData(p => ({ ...p, cityState: e.target.value }))}
                            />
                        ) : (
                            <p className="prof-field-value">{formData.cityState}</p>
                        )}
                    </div>
                    <div className="prof-field">
                        <label>Postal Code</label>
                        {editSection === 'address' ? (
                            <input
                                value={formData.postalCode}
                                onChange={e => setFormData(p => ({ ...p, postalCode: e.target.value }))}
                            />
                        ) : (
                            <p className="prof-field-value">{formData.postalCode}</p>
                        )}
                    </div>
                    <div className="prof-field">
                        <label>TAX ID</label>
                        {editSection === 'address' ? (
                            <input
                                value={formData.taxId}
                                onChange={e => setFormData(p => ({ ...p, taxId: e.target.value }))}
                            />
                        ) : (
                            <p className="prof-field-value">{formData.taxId}</p>
                        )}
                    </div>
                </div>

                {editSection === 'address' && (
                    <div className="prof-edit-actions">
                        <button className="prof-cancel-btn" onClick={handleCancel}>Cancel</button>
                        <button className="prof-save-btn" onClick={handleSave}>Save</button>
                    </div>
                )}
            </div>
            {/* ── Section 4: Language Preferences ─────── */}
            <div className="prof-section-card">
                <div className="prof-section-header">
                    <h3 className="prof-section-title">Language / ભાષા</h3>
                </div>
                <p className="prof-cp-hint">Choose your preferred language for the entire application.</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button
                        onClick={() => lang !== 'en' && toggleLanguage()}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: `2px solid ${lang === 'en' ? '#3e97b9' : '#dde3ea'}`,
                            background: lang === 'en' ? '#e8f4fa' : '#fff',
                            color: lang === 'en' ? '#3e97b9' : '#64748b',
                            fontWeight: lang === 'en' ? '700' : '500',
                            cursor: lang === 'en' ? 'default' : 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s',
                        }}
                    >
                        {lang === 'en' && <span style={{ marginRight: '6px' }}>✓</span>}English
                    </button>
                    <button
                        onClick={() => lang !== 'gu' && toggleLanguage()}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: `2px solid ${lang === 'gu' ? '#3e97b9' : '#dde3ea'}`,
                            background: lang === 'gu' ? '#e8f4fa' : '#fff',
                            color: lang === 'gu' ? '#3e97b9' : '#64748b',
                            fontWeight: lang === 'gu' ? '700' : '500',
                            cursor: lang === 'gu' ? 'default' : 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s',
                        }}
                    >
                        {lang === 'gu' && <span style={{ marginRight: '6px' }}>✓</span>}ગુજરાતી
                    </button>
                </div>
                {lang === 'gu' && (
                    <p style={{ marginTop: '10px', fontSize: '13px', color: '#2dab6f', fontWeight: '600' }}>
                        ✓ ગુજરાતી ભાષા સક્રિય છે — બધા પૃષ્ઠો ગુજરાતીમાં બતાવવામાં આવ્યા છે.
                    </p>
                )}
            </div>

            {/* ── Section 5: Change Password ─────────── */}
            <div className="prof-section-card">
                <div className="prof-section-header">
                    <h3 className="prof-section-title">Change Password</h3>
                    <button
                        className="prof-edit-btn"
                        onClick={() => { setShowChangePwd(p => !p); setCpError(''); setCpSuccess(''); }}
                    >
                        {showChangePwd ? 'Close' : 'Change'} <span className="prof-edit-icon">{showChangePwd ? '✕' : '🔒'}</span>
                    </button>
                </div>

                {!showChangePwd && (
                    <p className="prof-cp-hint">Keep your account secure by updating your password regularly.</p>
                )}

                {showChangePwd && (
                    <>
                        {cpError && (
                            <div className="prof-cp-error">
                                <span>⚠</span> {cpError}
                            </div>
                        )}
                        {cpSuccess && (
                            <div className="prof-cp-success">
                                <span>✓</span> {cpSuccess}
                            </div>
                        )}
                        <form onSubmit={handleChangePassword} className="prof-cp-form">
                            <div className="prof-field">
                                <label>Current Password</label>
                                <div className="prof-pw-wrap">
                                    <input
                                        type={showCpCurrent ? 'text' : 'password'}
                                        placeholder="Enter current password"
                                        value={cpCurrent}
                                        onChange={e => { setCpCurrent(e.target.value); setCpError(''); }}
                                    />
                                    <button type="button" className="prof-pw-toggle" onClick={() => setShowCpCurrent(p => !p)} tabIndex={-1}>
                                        {showCpCurrent ? '🙈' : '👁'}
                                    </button>
                                </div>
                            </div>
                            <div className="prof-field">
                                <label>New Password</label>
                                <div className="prof-pw-wrap">
                                    <input
                                        type={showCpNew ? 'text' : 'password'}
                                        placeholder="Min. 6 characters"
                                        value={cpNew}
                                        onChange={e => { setCpNew(e.target.value); setCpError(''); }}
                                    />
                                    <button type="button" className="prof-pw-toggle" onClick={() => setShowCpNew(p => !p)} tabIndex={-1}>
                                        {showCpNew ? '🙈' : '👁'}
                                    </button>
                                </div>
                            </div>
                            <div className="prof-field">
                                <label>Confirm New Password</label>
                                <div className="prof-pw-wrap">
                                    <input
                                        type={showCpConfirm ? 'text' : 'password'}
                                        placeholder="Re-enter new password"
                                        value={cpConfirm}
                                        onChange={e => { setCpConfirm(e.target.value); setCpError(''); }}
                                    />
                                    <button type="button" className="prof-pw-toggle" onClick={() => setShowCpConfirm(p => !p)} tabIndex={-1}>
                                        {showCpConfirm ? '🙈' : '👁'}
                                    </button>
                                </div>
                            </div>
                            <div className="prof-edit-actions">
                                <button type="button" className="prof-cancel-btn" onClick={() => { setShowChangePwd(false); setCpError(''); setCpSuccess(''); setCpCurrent(''); setCpNew(''); setCpConfirm(''); }}>Cancel</button>
                                <button type="submit" className="prof-save-btn">Update Password</button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
