import { useState, useEffect } from 'react';
import './Profile.css';

export default function Profile({ user, onUpdateUser }) {
    const [editSection, setEditSection] = useState(null); // 'header', 'personal', 'address'
    const [message, setMessage] = useState('');

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
        </div>
    );
}
