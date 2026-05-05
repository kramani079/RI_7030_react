import { useState } from 'react';
import { useData } from '../context/DataContext';
import './Appointments.css';

const EMPTY_FORM = {
  customerName: '',
  phone: '',
  services: '',
  employee: '',
  date: new Date().toISOString().split('T')[0],
  startTime: '10:00',
  endTime: '10:45',
  status: 'Scheduled',
};

export default function Appointments() {
  const { appointments, addAppointment, updateAppointment, deleteAppointment, loadingBookings, bookingError } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editAppt, setEditAppt] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = appointments.filter(a => {
    const matchSearch = a.customerName.toLowerCase().includes(search.toLowerCase()) || 
                        a.phone.includes(search) || 
                        a.employee.toLowerCase().includes(search.toLowerCase());
    const matchDate = filterDate ? a.date === filterDate : true;
    return matchSearch && matchDate;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const scheduledCount = filtered.filter(a => a.status === 'Scheduled').length;
  const completedCount = filtered.filter(a => a.status === 'Completed').length;
  const cancelledCount = filtered.filter(a => a.status === 'Cancelled').length;

  function openAdd() {
    setEditAppt(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(appt) {
    setEditAppt(appt);
    setForm(appt);
    setShowModal(true);
  }

  function handleSave() {
    if (!form.customerName.trim() || !form.startTime.trim() || !form.endTime.trim()) return;
    
    if (editAppt) {
      updateAppointment(editAppt.id, form);
    } else {
      addAppointment(form);
    }
    setShowModal(false);
  }

  function toggleStatus(appt) {
    let newStatus = 'Scheduled';
    if (appt.status === 'Scheduled') newStatus = 'Completed';
    else if (appt.status === 'Completed') newStatus = 'Cancelled';
    
    updateAppointment(appt.id, { status: newStatus });
  }

  return (
    <div className="appointments-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Appointments</h1>
          <p className="page-sub">Manage salon bookings and schedules</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ New Appointment</button>
      </div>

      {/* Summary */}
      <div className="appt-summary">
        <div className="appt-sum-card appt-sum-card--blue">
          <div className="appt-sum-icon">📝</div>
          <div>
            <div className="appt-sum-value">{filtered.length}</div>
            <div className="appt-sum-label">Total Selected</div>
          </div>
        </div>
        <div className="appt-sum-card appt-sum-card--orange">
          <div className="appt-sum-icon">⏳</div>
          <div>
            <div className="appt-sum-value">{scheduledCount}</div>
            <div className="appt-sum-label">Scheduled</div>
          </div>
        </div>
        <div className="appt-sum-card appt-sum-card--green">
          <div className="appt-sum-icon">✅</div>
          <div>
            <div className="appt-sum-value">{completedCount}</div>
            <div className="appt-sum-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="appt-filters">
        <input 
          type="date" 
          value={filterDate} 
          onChange={e => setFilterDate(e.target.value)} 
          className="appt-date-filter"
        />
        <input 
          type="text" 
          placeholder="🔍 Search customer or stylist..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="appt-search"
        />
        {filterDate && (
          <button className="btn btn-sm btn-secondary" onClick={() => setFilterDate('')}>Show All Dates</button>
        )}
      </div>

      {loadingBookings && <div className="appt-empty">⏳ Loading bookings from backend server...</div>}
      {bookingError && <div className="appt-empty" style={{color: 'var(--accent-orange)'}}>⚠️ Using Local Data. Could not connect to MongoDB Backend: {bookingError}.</div>}

      {/* Appointments List */}
      {!loadingBookings && (
        <div className="appt-list">
          {filtered.length === 0 ? (
            <div className="appt-empty">No appointments found. <span onClick={openAdd} style={{ color: 'var(--accent-gold)', cursor: 'pointer' }}>Schedule one →</span></div>
          ) : (
            filtered.map(appt => (
              <div key={appt.id} className={`appt-card appt-card--${appt.status.toLowerCase()}`}>
              <div className="appt-time-col">
                <div className="appt-start">{appt.startTime}</div>
                <div className="appt-end">to {appt.endTime}</div>
              </div>
              <div className="appt-info-col">
                <div className="appt-customer-info">
                  <span className="appt-customer">{appt.customerName}</span>
                  <span className="appt-phone">📞 {appt.phone}</span>
                </div>
                <div className="appt-services">{appt.services}</div>
                <div className="appt-employee">👤 Stylist: {appt.employee || 'Any'}</div>
              </div>
              <div className="appt-status-col">
                <button 
                  className={`status-btn status-btn--${appt.status.toLowerCase()}`}
                  onClick={() => toggleStatus(appt)}
                >
                  {appt.status}
                </button>
              </div>
              <div className="appt-actions-col">
                <button className="btn btn-sm btn-secondary" onClick={() => openEdit(appt)}>✏️ Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => setConfirmDel(appt)}>🗑️</button>
              </div>
            </div>
          ))
        )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editAppt ? '✏️ Edit Appointment' : '🗓️ Schedule Appointment'}</h2>
            <div className="modal-form">
              <div className="modal-row">
                <label style={{ flex: 1 }}>
                  Customer Name *
                  <input value={form.customerName} onChange={e => setForm(f => ({...f, customerName: e.target.value}))} placeholder="Jayeshbhai" />
                </label>
                <label style={{ flex: 1 }}>
                  Mobile Number
                  <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="9876543210" />
                </label>
              </div>
              <label>
                Services Requested (details)
                <textarea 
                  value={form.services} 
                  onChange={e => setForm(f => ({...f, services: e.target.value}))} 
                  placeholder="e.g., Hair cut, beard trim, hair color"
                  style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', resize: 'vertical', minHeight: '60px' }}
                />
              </label>
              <div className="modal-row">
                <label style={{ flex: 1 }}>
                  Assigned Stylist / Barber
                  <input value={form.employee} onChange={e => setForm(f => ({...f, employee: e.target.value}))} placeholder="Rajesh" />
                </label>
              </div>
              <div className="modal-row">
                <label style={{ flex: 1 }}>
                  Date
                  <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} />
                </label>
                <label style={{ flex: 1 }}>
                  Start Time *
                  <input type="time" value={form.startTime} onChange={e => setForm(f => ({...f, startTime: e.target.value}))} />
                </label>
                <label style={{ flex: 1 }}>
                  End Time *
                  <input type="time" value={form.endTime} onChange={e => setForm(f => ({...f, endTime: e.target.value}))} />
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>💾 Save Appointment</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDel && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: 'var(--accent-red)' }}>🗑️ Cancel Appointment</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>
              Are you sure you want to delete the appointment for <strong style={{ color: 'var(--text-primary)' }}>{confirmDel.customerName}</strong>?
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { deleteAppointment(confirmDel.id); setConfirmDel(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
