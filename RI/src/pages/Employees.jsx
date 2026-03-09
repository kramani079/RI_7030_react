import { useState } from 'react';
import './Employees.css';

const AVATAR_COLORS = ['#3e97b9', '#9b59b6', '#e67e22', '#e91e8c', '#16a085', '#27ae60'];

const EMPLOYEE_DATA = [
  { id: 'RI_4001', name: 'Rajesh Kumar', email: 'rajesh.kumar@ri.com', type: 'Casting', salary: '₹22,000' },
  { id: 'RI_4002', name: 'Priya Shah', email: 'priya.shah@ri.com', type: 'Finishing Touch', salary: '₹20,000' },
  { id: 'RI_4003', name: 'Anil Mehta', email: 'anil.mehta@ri.com', type: 'Gold Plating', salary: '₹25,000' },
  { id: 'RI_4004', name: 'Sunita Verma', email: 'sunita.verma@ri.com', type: 'Packaging', salary: '₹18,000' },
  { id: 'RI_4005', name: 'Mukesh Joshi', email: 'mukesh.joshi@ri.com', type: 'Casting', salary: '₹23,000' },
  { id: 'RI_4006', name: 'Neha Desai', email: 'neha.desai@ri.com', type: 'Finishing Touch', salary: '₹19,500' },
];

function getNextEmpId(employees) {
  const nums = employees.map(e => {
    const m = e.id.match(/RI_(\d+)/);
    return m ? Number(m[1]) : 0;
  });
  return `RI_${Math.max(4000, ...nums) + 1}`;
}

function getNextTxId(history) {
  const nums = (history || []).map(h => {
    const m = h.id.match(/RI_(\d+)/);
    return m ? Number(m[1]) : 0;
  });
  return `RI_${Math.max(3000, ...nums) + 1}`;
}

const TYPE_STYLES = {
  'Casting': { color: '#3e97b9', bg: '#e8f4fa' },
  'Finishing Touch': { color: '#2dab6f', bg: '#e6f8f0' },
  'Gold Plating': { color: '#d4a12a', bg: '#fdf6e0' },
  'Packaging': { color: '#9b59b6', bg: '#f4ecfb' },
};

const TYPES = ['Casting', 'Finishing Touch', 'Gold Plating', 'Packaging'];

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function Employees({ onTransaction, history }) {
  const [employees, setEmployees] = useState(EMPLOYEE_DATA);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [payTarget, setPayTarget] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', type: 'Casting', salary: '' });
  const [payForm, setPayForm] = useState({ amount: '', type: 'Cash', date: '' });

  const visible = employees.filter(e =>
    !search ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setEditTarget(null);
    setForm({ name: '', email: '', type: 'Casting', salary: '' });
    setShowModal(true);
  }

  function openEdit(emp) {
    setEditTarget(emp.id);
    setForm({ name: emp.name, email: emp.email, type: emp.type, salary: emp.salary.replace('₹', '') });
    setShowModal(true);
  }

  function handleSave(e) {
    e.preventDefault();
    const sal = form.salary.startsWith('₹') ? form.salary : `₹${form.salary}`;
    if (editTarget) {
      setEmployees(prev => prev.map(emp =>
        emp.id === editTarget ? { ...emp, name: form.name, email: form.email, type: form.type, salary: sal } : emp
      ));
    } else {
      setEmployees(prev => [...prev, {
        id: getNextEmpId(prev), name: form.name, email: form.email, type: form.type, salary: sal
      }]);
    }
    setShowModal(false);
  }

  function openPayModal(emp) {
    setPayTarget(emp);
    const now = new Date();
    const localDate = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
    setPayForm({
      amount: emp.salary.replace(/[₹,]/g, ''),
      type: 'Cash',
      date: localDate
    });
    setShowPayModal(true);
  }

  function submitPaySalary(e) {
    e.preventDefault();
    const tx = {
      id: getNextTxId(history),
      type: 'Buy',
      party: payTarget.name,
      productId: 'EMP_SALARY',
      product: `Salary - ${payTarget.type}`,
      qty: '1',
      amount: `₹${Number(payForm.amount).toLocaleString('en-IN')}`,
      status: 'Paid',
      date: new Date(payForm.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' }) + ' ' + new Date(payForm.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
    };

    onTransaction(tx);
    setShowPayModal(false);
    alert(`Salary of ₹${payForm.amount} paid to ${payTarget.name} via ${payForm.type}. Record added to History.`);
  }

  function handlePaySalary(emp) {
    openPayModal(emp);
  }

  function handleDelete(id) {
    if (window.confirm('Delete this employee?')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  }

  return (
    <div className="emp-page">
      <div className="emp-header">
        <h2 className="emp-title">Employee Records</h2>
        <button className="btn-add-emp" onClick={openAdd}>+ Hire New Employee</button>
      </div>

      <div className="emp-search-wrap">
        <input className="emp-search" placeholder="Search by name, email or ID..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="emp-table-wrap">
        <table className="emp-tbl">
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Full Name</th>
              <th>Email ID</th>
              <th>Department</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((emp, idx) => {
              const ts = TYPE_STYLES[emp.type] || TYPE_STYLES['Casting'];
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              return (
                <tr key={emp.id}>
                  <td className="emp-num">{emp.id}</td>
                  <td>
                    <div className="emp-cell">
                      <span className="emp-avatar" style={{ background: avatarColor }}>
                        {initials(emp.name)}
                      </span>
                      <span className="emp-name">{emp.name}</span>
                    </div>
                  </td>
                  <td className="emp-email">{emp.email}</td>
                  <td>
                    <span className="emp-type-chip" style={{ color: ts.color, background: ts.bg }}>
                      {emp.type}
                    </span>
                  </td>
                  <td className="emp-salary">{emp.salary}</td>
                  <td>
                    <div className="emp-action-btns">
                      <button className="act-pay" onClick={() => handlePaySalary(emp)}>Pay</button>
                      <button className="act-edit" onClick={() => openEdit(emp)}>Edit</button>
                      <button className="act-del" onClick={() => handleDelete(emp.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button className="fab-btn" onClick={openAdd}>+</button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editTarget ? `Update Employee ${editTarget}` : '+ New Hire'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="modal-form" onSubmit={handleSave}>
              {!editTarget && (
                <>
                  <label>Employee ID (Auto)</label>
                  <input value={getNextEmpId(employees)} readOnly className="read-only" style={{ background: '#f0f7fa', color: '#3e97b9', fontWeight: 700 }} />
                </>
              )}
              <label>Full Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              <label>Email Address</label>
              <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required type="email" />
              <label>Department</label>
              <select className="modal-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} required>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <label>Salary (₹)</label>
              <input value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} />
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="modal-submit">{editTarget ? 'Update Employee' : 'Create Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPayModal && payTarget && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Pay Salary: {payTarget.name}</span>
              <button className="modal-close" onClick={() => setShowPayModal(false)}>✕</button>
            </div>
            <form className="modal-form" onSubmit={submitPaySalary}>
              <label>Amount (₹)</label>
              <input
                type="number"
                value={payForm.amount}
                onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                required
              />
              <label>Payment Mode</label>
              <select
                className="modal-select"
                value={payForm.type}
                onChange={e => setPayForm(p => ({ ...p, type: e.target.value }))}
                required
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
              <label>Date and Time</label>
              <input
                type="datetime-local"
                value={payForm.date}
                onChange={e => setPayForm(p => ({ ...p, date: e.target.value }))}
                required
              />
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowPayModal(false)}>Cancel</button>
                <button type="submit" className="modal-submit">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
