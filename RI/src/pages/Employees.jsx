import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { apiGetUsers, showToast } from '../api';
import './Employees.css';

export default function Employees({ onTransaction, history }) {
    const { t, g } = useLanguage();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [payForm, setPayForm] = useState({ amount: '', method: 'Cash', date: new Date().toISOString().slice(0, 10) });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchEmployees() {
            try {
                const users = await apiGetUsers();
                // Filter to show only employees (or all if desired)
                setEmployees(users);
            } catch (err) {
                console.error('Failed to fetch employees:', err.message);
                // Fallback to local storage if API fails during development
                const localUsers = JSON.parse(localStorage.getItem('ri_users') || '[]');
                setEmployees(localUsers);
            } finally {
                setLoading(false);
            }
        }
        fetchEmployees();
    }, []);

    const filtered = employees.filter(e =>
        (e.name || e.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.role || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.employeeType || '').toLowerCase().includes(search.toLowerCase())
    );

    function getNextTxId() {
        const nums = history.map(h => {
            const m = h.id.match(/RI_(\d+)/);
            return m ? Number(m[1]) : 0;
        });
        return `RI_${Math.max(3000, ...nums) + 1}`;
    }

    async function handlePaySalary(e) {
        e.preventDefault();
        if (!selectedEmp) return;

        setSaving(true);
        const tx = {
            id: getNextTxId(),
            type: 'Buy', // Salary is an expense/buy
            party: selectedEmp.name || selectedEmp.fullName,
            productId: 'EMP_SALARY',
            product: `Salary - ${selectedEmp.employeeType || 'Employee'}`,
            qty: '1',
            amount: `₹${Number(payForm.amount).toLocaleString('en-IN')}`,
            rate: payForm.amount,
            paymentMethod: payForm.method,
            status: 'Paid',
            date: new Date(payForm.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' }),
        };

        try {
            await onTransaction(tx);
            setShowModal(false);
            setPayForm({ amount: '', method: 'Cash', date: new Date().toISOString().slice(0, 10) });
            showToast(`Salary of ${g(tx.amount)} paid to ${tx.party}`, 'success');
        } catch (err) {
            // Error handled by API layer
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="emp-page"><p>{t.loadingEmployees || 'Loading Employees...'}</p></div>;
    }

    return (
        <div className="emp-page">
            <div className="emp-header">
                <h2 className="emp-title">{t.employeeManagement}</h2>
                <div className="emp-search-box">
                    <input
                        placeholder={t.searchEmployees}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="emp-grid">
                {filtered.map((emp, i) => (
                    <div key={i} className="emp-card">
                        <div className="emp-card-header">
                            <div className="emp-avatar">{(emp.name || emp.fullName || 'E')[0]}</div>
                            <div className="emp-info">
                                <h3 className="emp-name">{emp.name || emp.fullName}</h3>
                                <p className="emp-role">{emp.role} {emp.employeeType && emp.employeeType !== 'N/A' ? `— ${emp.employeeType}` : ''}</p>
                            </div>
                        </div>
                        <div className="emp-stats">
                            <div className="emp-stat">
                                <span>{t.salary || 'Salary'}</span>
                                <strong>{g(`₹${(emp.salary || 0).toLocaleString('en-IN')}`)}</strong>
                            </div>
                            <div className="emp-stat">
                                <span>{t.joined || 'Joined'}</span>
                                <strong>{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : '—'}</strong>
                            </div>
                        </div>
                        <div className="emp-actions">
                            <button className="emp-pay-btn" onClick={() => { setSelectedEmp(emp); setPayForm(p => ({ ...p, amount: emp.salary || '' })); setShowModal(true); }}>
                                💸 {t.paySalary || 'Pay Salary'}
                            </button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <p className="emp-empty">{t.noEmployeesFound || 'No employees found.'}</p>}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box emp-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">{t.paySalaryTo || 'Pay Salary to'} {selectedEmp?.name || selectedEmp?.fullName}</span>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form className="modal-form" onSubmit={handlePaySalary}>
                            <div className="modal-col">
                                <label>{t.amount || 'Amount'}</label>
                                <input type="number" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} required />
                            </div>
                            <div className="modal-col">
                                <label>{t.paymentMethod || 'Payment Method'}</label>
                                <select value={payForm.method} onChange={e => setPayForm(p => ({ ...p, method: e.target.value }))}>
                                    <option value="Cash">{t.cash}</option>
                                    <option value="Bank Transfer">{t.bankTransfer}</option>
                                    <option value="UPI">{t.upi}</option>
                                </select>
                            </div>
                            <div className="modal-col">
                                <label>{t.date || 'Date'}</label>
                                <input type="date" value={payForm.date} onChange={e => setPayForm(p => ({ ...p, date: e.target.value }))} required />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>{t.cancel}</button>
                                <button type="submit" className="modal-submit" disabled={saving}>{saving ? 'Processing...' : t.paySalary || 'Pay Salary'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
