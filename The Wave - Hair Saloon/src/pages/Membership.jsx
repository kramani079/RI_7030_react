import { useState } from 'react';
import { useData, SALON_SERVICES } from '../context/DataContext';
import './Membership.css';

const EMPTY_FORM = {
  name: '', phone: '', months: 1, startDate: new Date().toISOString().split('T')[0],
  amount: '', services: Object.fromEntries(SALON_SERVICES.map(s => [s.id, 0])),
};

function getMemberStatus(member) {
  const end = new Date(member.startDate);
  end.setMonth(end.getMonth() + member.months);
  const now = new Date();
  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0)  return { label: 'Expired',    color: 'red',    daysLeft };
  if (daysLeft <= 7) return { label: 'Expiring Soon', color: 'orange', daysLeft };
  return { label: 'Active', color: 'green', daysLeft };
}

function getEndDate(member) {
  const end = new Date(member.startDate);
  end.setMonth(end.getMonth() + member.months);
  return end.toLocaleDateString('en-IN');
}

function totalServicesUsed(services) {
  return Object.values(services || {}).reduce((sum, v) => sum + (v || 0), 0);
}

export default function Membership() {
  const { members, addMember, updateMember, deleteMember, updateMemberService } = useData();

  const [search,      setSearch]      = useState('');
  const [filterStatus,setFilterStatus]= useState('All');
  const [showModal,   setShowModal]   = useState(false);
  const [showGlobalHistory, setShowGlobalHistory] = useState(false);
  const [editMember,  setEditMember]  = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [detailMember,setDetailMember]= useState(null);
  const [confirmDel,  setConfirmDel]  = useState(null);

  /* aggregate global history */
  const allHistory = members.flatMap(m => 
    (m.usageHistory || []).map(h => ({
      ...h,
      memberName: m.name,
      memberPhone: m.phone
    }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  /* filtered list */
  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.phone.includes(search);
    const status = getMemberStatus(m).label;
    const matchStatus = filterStatus === 'All' || status === filterStatus ||
                        (filterStatus === 'Active' && status === 'Active') ||
                        (filterStatus === 'Expiring Soon' && status === 'Expiring Soon') ||
                        (filterStatus === 'Expired' && status === 'Expired');
    return matchSearch && matchStatus;
  });

  /* summary */
  const active      = members.filter(m => getMemberStatus(m).label === 'Active').length;
  const expiringSoon= members.filter(m => getMemberStatus(m).label === 'Expiring Soon').length;
  const expired     = members.filter(m => getMemberStatus(m).label === 'Expired').length;

  function openAdd() {
    setEditMember(null);
    setForm({ ...EMPTY_FORM, startDate: new Date().toISOString().split('T')[0], services: Object.fromEntries(SALON_SERVICES.map(s => [s.id, 0])) });
    setShowModal(true);
  }

  function openEdit(member) {
    setEditMember(member);
    setForm({
      name: member.name, phone: member.phone,
      months: member.months, startDate: member.startDate,
      amount: member.amount || '',
      services: { ...Object.fromEntries(SALON_SERVICES.map(s => [s.id, 0])), ...(member.services || {}) },
    });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.phone.trim()) return;
    const payload = {
      name:      form.name.trim(),
      phone:     form.phone.trim(),
      months:    Number(form.months),
      startDate: form.startDate,
      amount:    Number(form.amount) || 0,
      services:  { ...form.services },
    };
    if (editMember) {
      updateMember(editMember.id, payload);
      if (detailMember?.id === editMember.id) setDetailMember({ ...editMember, ...payload });
    } else {
      addMember(payload);
    }
    setShowModal(false);
  }

  function handleServiceChange(memberId, serviceId, delta) {
    updateMemberService(memberId, serviceId, delta);
    if (detailMember?.id === memberId) {
      setDetailMember(prev => {
        const currentCount = prev.services?.[serviceId] || 0;
        const newCount = Math.max(0, currentCount + delta);
        
        let newHistory = prev.usageHistory || [];
        if (delta < 0 && currentCount > 0) {
          newHistory = [
            {
              id: Date.now().toString(),
              serviceId,
              date: new Date().toISOString()
            },
            ...newHistory
          ];
        }

        return {
          ...prev,
          services: {
            ...prev.services,
            [serviceId]: newCount,
          },
          usageHistory: newHistory
        };
      });
    }
  }

  /* sync detailMember from live members array */
  const liveMember = detailMember ? members.find(m => m.id === detailMember.id) : null;

  return (
    <div className="membership-page animate-fade-in">
      {/* ── Header ───────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">👤 Membership</h1>
          <p className="page-sub">Manage member plans and service usage</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setShowGlobalHistory(true)}>📜 View All History</button>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Member</button>
        </div>
      </div>

      {/* ── Summary ─────────────────────────────── */}
      <div className="mem-summary">
        {[
          { label: 'Total Members',  value: members.length, color: 'gold',   icon: '👥', filter: 'All'           },
          { label: 'Active',         value: active,         color: 'green',  icon: '✅', filter: 'Active'         },
          { label: 'Expiring Soon',  value: expiringSoon,  color: 'orange', icon: '⏳', filter: 'Expiring Soon'  },
          { label: 'Expired',        value: expired,        color: 'red',    icon: '❌', filter: 'Expired'        },
        ].map(s => (
          <div key={s.label}
            className={`mem-sum-card mem-sum-card--${s.color}${filterStatus === s.filter ? ' active' : ''}`}
            onClick={() => setFilterStatus(filterStatus === s.filter ? 'All' : s.filter)}
          >
            <span className="mem-sum-icon">{s.icon}</span>
            <div>
              <div className="mem-sum-value">{s.value}</div>
              <div className="mem-sum-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ──────────────────────────────── */}
      <input
        type="text"
        placeholder="🔍  Search by name or phone..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mem-search"
      />

      {/* ── Members Grid ────────────────────────── */}
      {filtered.length === 0
        ? <div className="mem-empty">No members found. <span onClick={openAdd} style={{ color: 'var(--accent-gold)', cursor: 'pointer' }}>Add one →</span></div>
        : (
          <div className="mem-grid">
            {filtered.map(member => {
              const status = getMemberStatus(member);
              const serviceCount = totalServicesUsed(member.services);
              return (
                <div key={member.id} className={`mem-card mem-card--${status.color}`}>
                  <div className="mem-card-top">
                    <div className="mem-avatar">{member.name.charAt(0).toUpperCase()}</div>
                    <div className="mem-info">
                      <div className="mem-name">{member.name}</div>
                      <div className="mem-phone">📞 {member.phone}</div>
                    </div>
                    <span className={`badge badge-${status.color === 'orange' ? 'gold' : status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="mem-details">
                    <div className="mem-detail-row">
                      <span>📅 Plan</span>
                      <strong>{member.months} month{member.months !== 1 ? 's' : ''}</strong>
                    </div>
                    <div className="mem-detail-row">
                      <span>📆 Expires</span>
                      <strong>{getEndDate(member)}</strong>
                    </div>
                    {member.amount > 0 && (
                      <div className="mem-detail-row">
                        <span>💰 Amount</span>
                        <strong>₹{member.amount.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                    <div className="mem-detail-row">
                      <span>✂️ Available Services</span>
                      <strong>{serviceCount} count</strong>
                    </div>
                    {status.daysLeft >= 0 && (
                      <div className="mem-detail-row">
                        <span>⏳ Days Left</span>
                        <strong style={{ color: status.daysLeft <= 7 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                          {status.daysLeft} days
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* quick service preview */}
                  <div className="mem-services-preview">
                    {SALON_SERVICES.filter(sv => (member.services?.[sv.id] || 0) > 0).slice(0, 4).map(sv => (
                      <span key={sv.id} className="mem-service-tag">
                        {sv.icon} {sv.label}: {member.services[sv.id]}
                      </span>
                    ))}
                    {SALON_SERVICES.filter(sv => (member.services?.[sv.id] || 0) > 0).length === 0 && (
                      <span className="mem-service-tag" style={{ color: 'var(--text-muted)' }}>No services yet</span>
                    )}
                  </div>

                  <div className="mem-card-actions">
                    <button className="btn btn-sm btn-secondary" onClick={() => setDetailMember(member)}>📋 Services</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(member)}>✏️ Edit</button>
                    <button className="btn btn-sm btn-danger"    onClick={() => setConfirmDel(member)}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {/* ═══════════════════════════════════════════
          Global Usage History Modal
          ═══════════════════════════════════════════ */}
      {showGlobalHistory && (
        <div className="modal-overlay" onClick={() => setShowGlobalHistory(false)}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <h2>📜 Full Member Usage History</h2>
            <div className="detail-history" style={{ borderTop: 'none', marginTop: 0, paddingTop: 0 }}>
              <div className="history-list" style={{ maxHeight: '60vh' }}>
                {allHistory.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '20px 0' }}>No history found yet.</p>
                ) : (
                  allHistory.map(entry => {
                    const svc = SALON_SERVICES.find(s => s.id === entry.serviceId);
                    return (
                      <div key={entry.id} className="history-item">
                        <div className="history-svc">
                          <span className="history-icon">{svc?.icon}</span>
                          <div>
                            <div className="history-name">{svc?.label} Used</div>
                            <div style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>By: {entry.memberName} ({entry.memberPhone})</div>
                          </div>
                        </div>
                        <div className="history-date">
                          {new Date(entry.date).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', 
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={() => setShowGlobalHistory(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          Add / Edit Modal
          ═══════════════════════════════════════════ */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <h2>{editMember ? '✏️ Edit Member' : '➕ Add New Member'}</h2>
            <div className="modal-form">
              <div className="modal-row">
                <label style={{ flex: 2 }}>
                  Full Name *
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Rajesh Kumar" />
                </label>
                <label style={{ flex: 1 }}>
                  Phone *
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="9876543210" />
                </label>
              </div>
              <div className="modal-row">
                <label style={{ flex: 1 }}>
                  Membership (Months)
                  <select value={form.months} onChange={e => setForm(f => ({ ...f, months: Number(e.target.value) }))}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </label>
                <label style={{ flex: 1 }}>
                  Start Date
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </label>
                <label style={{ flex: 1 }}>
                  Amount (₹)
                  <input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
                </label>
              </div>

              {/* Services included in plan */}
              <div className="form-section-label">Services in this plan (set initial counts):</div>
              <div className="service-count-grid">
                {SALON_SERVICES.map(sv => (
                  <div key={sv.id} className="svc-count-item">
                    <div className="svc-count-label">
                      <span>{sv.icon}</span>
                      <span>{sv.label}</span>
                    </div>
                    <div className="svc-count-controls">
                      <button type="button" className="qty-btn" onClick={() => setForm(f => ({ ...f, services: { ...f.services, [sv.id]: Math.max(0, (f.services[sv.id] || 0) - 1) } }))}>−</button>
                      <span className="qty-val">{form.services[sv.id] || 0}</span>
                      <button type="button" className="qty-btn" onClick={() => setForm(f => ({ ...f, services: { ...f.services, [sv.id]: (f.services[sv.id] || 0) + 1 } }))}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary"   onClick={handleSave}>{editMember ? 'Save Changes' : 'Add Member'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          Member Detail / Service Log Modal
          ═══════════════════════════════════════════ */}
      {liveMember && (
        <div className="modal-overlay" onClick={() => setDetailMember(null)}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <h2>📋 Services — {liveMember.name}</h2>
            <div className="detail-header">
              <div className="detail-badge">
                <span>📅 Plan: <strong>{liveMember.months} month{liveMember.months !== 1 ? 's' : ''}</strong></span>
                <span>📆 Expires: <strong>{getEndDate(liveMember)}</strong></span>
                {liveMember.amount > 0 && <span>💰 ₹{liveMember.amount.toLocaleString('en-IN')}</span>}
              </div>
              <span className={`badge badge-${getMemberStatus(liveMember).color === 'orange' ? 'gold' : getMemberStatus(liveMember).color}`}>
                {getMemberStatus(liveMember).label} — {getMemberStatus(liveMember).daysLeft} days left
              </span>
            </div>
            <div className="detail-services-grid">
              {SALON_SERVICES.map(sv => {
                const count = liveMember.services?.[sv.id] || 0;
                return (
                  <div key={sv.id} className={`detail-svc-card${count > 0 ? ' detail-svc-card--used' : ''}`}>
                    <div className="dsvc-icon">{sv.icon}</div>
                    <div className="dsvc-label">{sv.label}</div>
                    <div className="dsvc-controls">
                      <button className="qty-btn" onClick={() => handleServiceChange(liveMember.id, sv.id, -1)}>−</button>
                      <span className="dsvc-count">{count}</span>
                      <button className="qty-btn" onClick={() => handleServiceChange(liveMember.id, sv.id, +1)}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="detail-total">
              Total available services: <strong>{totalServicesUsed(liveMember.services)}</strong>
            </div>

            {/* Usage History Section */}
            {liveMember.usageHistory && liveMember.usageHistory.length > 0 && (
              <div className="detail-history">
                <h3 className="history-title">📜 Usage History</h3>
                <div className="history-list">
                  {liveMember.usageHistory.map(entry => {
                    const svc = SALON_SERVICES.find(s => s.id === entry.serviceId);
                    return (
                      <div key={entry.id} className="history-item">
                        <div className="history-svc">
                          <span className="history-icon">{svc?.icon}</span>
                          <span className="history-name">{svc?.label} Used</span>
                        </div>
                        <div className="history-date">
                          {new Date(entry.date).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', 
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => openEdit(liveMember)}>✏️ Edit Member</button>
              <button className="btn btn-primary"   onClick={() => setDetailMember(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ─────────────────────── */}
      {confirmDel && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: 'var(--accent-red)' }}>🗑️ Remove Member</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>
              Remove <strong style={{ color: 'var(--text-primary)' }}>{confirmDel.name}</strong> from membership?
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { deleteMember(confirmDel.id); setConfirmDel(null); }}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
