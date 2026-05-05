import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Salary.css';

export default function Salary({ history, setHistory, onTransaction }) {
    const { user } = useAuth();
    const { t, g } = useLanguage();

    const [advanceModal, setAdvanceModal] = useState(false);
    const [advanceForm, setAdvanceForm] = useState({ amount: '', reason: '' });
    const [saving, setSaving] = useState(false);

    const salaryHistory = history.filter(h =>
        (h.productId === 'EMP_SALARY' || h.productId === 'EMP_ADVANCE') && h.party === user?.name
    );

    async function requestAdvance(e) {
        e.preventDefault();
        setSaving(true);
        const tx = {
            id: `RI_${Math.floor(8000 + Math.random() * 1000)}`,
            type: 'Buy',
            party: user?.name,
            productId: 'EMP_ADVANCE',
            product: `Advance Request: ${advanceForm.reason}`,
            qty: '1',
            amount: `₹${Number(advanceForm.amount).toLocaleString('en-IN')}`,
            status: 'Pending',
            date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' }),
        };
        try {
            await onTransaction(tx);
            setAdvanceModal(false);
            setAdvanceForm({ amount: '', reason: '' });
        } catch (err) {
            // Error handled by API layer
        } finally {
            setSaving(false);
        }
    }

    if (user?.role === 'Admin') {
        const pendingAdvances = history.filter(h => h.productId === 'EMP_ADVANCE' && h.status === 'Pending');

        return (
            <div className="salary-page">
                <div className="salary-header">
                    <h2>{t.advanceSalaryRequests}</h2>
                </div>
                <div className="salary-card">
                    <h3 className="salary-title">{t.pendingRequests}</h3>
                    <table className="salary-tbl">
                        <thead>
                            <tr>
                                <th>{t.date}</th>
                                <th>{t.employee}</th>
                                <th>{t.reasonDescription}</th>
                                <th>{t.amount}</th>
                                <th>{t.status}</th>
                                <th>{t.action}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingAdvances.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>{t.noPendingRequests}</td></tr>
                            ) : pendingAdvances.map(tx => (
                                <tr key={tx.id}>
                                    <td>{g(tx.date)}</td>
                                    <td><strong>{tx.party}</strong></td>
                                    <td>{tx.product.replace('Advance Request: ', '')}</td>
                                    <td><strong style={{ color: '#e05c5c' }}>{g(tx.amount)}</strong></td>
                                    <td>
                                        <span className="tx-status-chip" style={{ color: '#f4a12a', background: '#fff8ee' }}>
                                            {t.pending}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-add-salary"
                                            style={{ padding: '6px 12px', fontSize: '13px' }}
                                            disabled={saving}
                                            onClick={async () => {
                                                if (window.confirm(`${t.approveAdvance} ${g(tx.amount)} ${t.for} ${tx.party}?`)) {
                                                    setSaving(true);
                                                    try {
                                                        await onUpdateTransaction(tx.id, { ...tx, status: 'Paid' });
                                                    } catch (err) {
                                                        // Error handled by API layer
                                                    } finally {
                                                        setSaving(false);
                                                    }
                                                }
                                            }}
                                        >
                                            {saving ? '...' : t.payNow}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="salary-page">
            <div className="salary-header">
                <h2>{t.mySalaryAdvances}</h2>
                <button className="btn-add-salary" onClick={() => setAdvanceModal(true)}>{t.requestAdvance}</button>
            </div>

            <div className="salary-card">
                <h3 className="salary-title">{t.myPaymentHistory}</h3>
                <table className="salary-tbl">
                    <thead>
                        <tr>
                            <th>{t.date}</th>
                            <th>{t.type}</th>
                            <th>{t.description}</th>
                            <th>{t.amount}</th>
                            <th>{t.status}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salaryHistory.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>{t.noPaymentHistory}</td></tr>
                        ) : salaryHistory.map((tx, idx) => (
                            <tr key={idx}>
                                <td>{g(tx.date)}</td>
                                <td>
                                    <span className="salary-chip">
                                        {tx.productId === 'EMP_ADVANCE' ? t.advance : t.salary}
                                    </span>
                                </td>
                                <td>{tx.product}</td>
                                <td><strong>{g(tx.amount)}</strong></td>
                                <td>
                                    <span className="tx-status-chip" style={{
                                        color: tx.status === 'Paid' ? '#2dab6f' : '#f4a12a',
                                        background: tx.status === 'Paid' ? '#e6f8f0' : '#fff8ee'
                                    }}>
                                        {tx.status === 'Paid' ? t.paid : t.pending}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {advanceModal && (
                <div className="modal-overlay" onClick={() => setAdvanceModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">{t.requestAdvanceSalary}</span>
                            <button className="modal-close" onClick={() => setAdvanceModal(false)}>✕</button>
                        </div>
                        <form className="modal-form" onSubmit={requestAdvance}>
                            <label>{t.amountRs}</label>
                            <input
                                type="number"
                                value={advanceForm.amount}
                                onChange={e => setAdvanceForm(p => ({ ...p, amount: e.target.value }))}
                                required
                            />
                            <label>{t.reasonNote}</label>
                            <input
                                value={advanceForm.reason}
                                onChange={e => setAdvanceForm(p => ({ ...p, reason: e.target.value }))}
                                required
                            />
                            <div className="modal-actions">
                                <button type="button" className="modal-cancel" onClick={() => setAdvanceModal(false)}>{t.cancel}</button>
                                <button type="submit" className="modal-submit">{t.submitRequest}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
