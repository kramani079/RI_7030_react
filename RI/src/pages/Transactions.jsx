import { useState } from 'react';
import './Transactions.css';

const HISTORY_DATA = [
    { id: 'RI_3001', type: 'Sell', party: 'Mahesh Patel', product: 'Gold Ring', qty: '10', amount: '₹80,000', date: 'Feb 24, 2026', status: 'Paid' },
    { id: 'RI_3002', type: 'Buy', party: 'Nikhil Supplier', product: 'Raw Gold', qty: '500g', amount: '₹22,500', date: 'Feb 23, 2026', status: 'Pending' },
    { id: 'RI_3003', type: 'Sell', party: 'Ramesh Jewellers', product: 'Gold Chain', qty: '5', amount: '₹35,000', date: 'Feb 22, 2026', status: 'Paid' },
    { id: 'RI_3004', type: 'Buy', party: 'Rajan Chemicals', product: 'Plating Chemicals', qty: '10 kg', amount: '₹10,000', date: 'Feb 21, 2026', status: 'Pending' },
    { id: 'RI_3005', type: 'Sell', party: 'Suresh Traders', product: 'Gold Bangle', qty: '20', amount: '₹28,000', date: 'Feb 20, 2026', status: 'Cancelled' },
];

let nextTxId = 3006;

const STATUS_STYLE = {
    Paid: { color: '#2dab6f', bg: '#e6f8f0' },
    Pending: { color: '#f4a12a', bg: '#fff8ee' },
    Cancelled: { color: '#e05c5c', bg: '#fff0f0' },
};

export default function Transactions() {
    const [tab, setTab] = useState('buy');
    const [history, setHistory] = useState(HISTORY_DATA);
    const [search, setSearch] = useState('');
    const [editModal, setEditModal] = useState(false);
    const [editForm, setEditForm] = useState(null);

    const [buyForm, setBuyForm] = useState({ supplierName: '', supplierEmail: '', paymentMethod: 'Cash', product: '', quantity: '', unitPrice: '', notes: '', date: '2026-02-26' });
    const [sellForm, setSellForm] = useState({ customerName: '', customerEmail: '', paymentMethod: 'Cash', product: '', quantity: '', sellingPrice: '', notes: '', date: '2026-02-26' });

    function submitBuy(e) {
        e.preventDefault();
        setHistory(prev => [{
            id: `RI_${nextTxId++}`, type: 'Buy', party: buyForm.supplierName, product: buyForm.product, qty: buyForm.quantity,
            amount: `₹${buyForm.unitPrice}`, status: 'Pending',
            date: new Date(buyForm.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
        }, ...prev]);
        setTab('history');
    }

    function submitSell(e) {
        e.preventDefault();
        setHistory(prev => [{
            id: `RI_${nextTxId++}`, type: 'Sell', party: sellForm.customerName, product: sellForm.product, qty: sellForm.quantity,
            amount: `₹${sellForm.sellingPrice}`, status: 'Pending',
            date: new Date(sellForm.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
        }, ...prev]);
        setTab('history');
    }

    const filteredHistory = history.filter(h =>
        !search || h.party.toLowerCase().includes(search.toLowerCase()) || h.product.toLowerCase().includes(search.toLowerCase()) || h.id.toLowerCase().includes(search.toLowerCase())
    );

    function openEdit(h) {
        setEditForm({ ...h, amount: h.amount.replace('₹', '') });
        setEditModal(true);
    }

    function saveEdit(e) {
        e.preventDefault();
        setHistory(prev => prev.map(h => h.id === editForm.id ? { ...editForm, amount: `₹${editForm.amount}` } : h));
        setEditModal(false);
    }

    return (
        <div className="tx-page">
            <div className="tx-tabs">
                {['buy', 'sell', 'history'].map(t => (
                    <button key={t} className={`tx-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {t === 'buy' ? '🛒 Buy' : t === 'sell' ? '💰 Sell' : '📋 History'}
                    </button>
                ))}
            </div>

            {tab === 'buy' && (
                <div className="tx-form-card">
                    <h3 className="tx-form-title">New Purchase (Buy)</h3>
                    <form className="tx-grid-form" onSubmit={submitBuy}>
                        <div className="tx-col">
                            <label className="tx-label">Supplier Name</label>
                            <input className="tx-input" value={buyForm.supplierName} onChange={e => setBuyForm(p => ({ ...p, supplierName: e.target.value }))} required />
                            <label className="tx-label">Payment Method</label>
                            <select className="tx-select" value={buyForm.paymentMethod} onChange={e => setBuyForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                                <option>Cash</option><option>UPI</option><option>Bank Transfer</option>
                            </select>
                        </div>
                        <div className="tx-col">
                            <label className="tx-label">Product Name</label>
                            <input className="tx-input" value={buyForm.product} onChange={e => setBuyForm(p => ({ ...p, product: e.target.value }))} required />
                            <label className="tx-label">Unit Price (₹)</label>
                            <input className="tx-input" value={buyForm.unitPrice} onChange={e => setBuyForm(p => ({ ...p, unitPrice: e.target.value }))} required />
                        </div>
                        <div className="tx-submit-row"><button className="tx-submit-btn" type="submit">Complete Purchase</button></div>
                    </form>
                </div>
            )}

            {tab === 'sell' && (
                <div className="tx-form-card">
                    <h3 className="tx-form-title">New Sale (Sell)</h3>
                    <form className="tx-grid-form" onSubmit={submitSell}>
                        <div className="tx-col">
                            <label className="tx-label">Customer Name</label>
                            <input className="tx-input" value={sellForm.customerName} onChange={e => setSellForm(p => ({ ...p, customerName: e.target.value }))} required />
                            <label className="tx-label">Payment Method</label>
                            <select className="tx-select" value={sellForm.paymentMethod} onChange={e => setSellForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                                <option>Cash</option><option>UPI</option><option>Bank Transfer</option>
                            </select>
                        </div>
                        <div className="tx-col">
                            <label className="tx-label">Product Name</label>
                            <input className="tx-input" value={sellForm.product} onChange={e => setSellForm(p => ({ ...p, product: e.target.value }))} required />
                            <label className="tx-label">Selling Price (₹)</label>
                            <input className="tx-input" value={sellForm.sellingPrice} onChange={e => setSellForm(p => ({ ...p, sellingPrice: e.target.value }))} required />
                        </div>
                        <div className="tx-submit-row"><button className="tx-submit-btn" type="submit">Complete Sale</button></div>
                    </form>
                </div>
            )}

            {tab === 'history' && (
                <div className="tx-history-card">
                    <h3 className="tx-form-title">Transaction Records</h3>
                    <div className="tx-search-wrap">
                        <input className="tx-search" placeholder="Search history..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="tx-table-wrap">
                        <table className="tx-tbl">
                            <thead>
                                <tr><th>Tx ID</th><th>Type</th><th>Party</th><th>Product</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map(h => {
                                    const s = STATUS_STYLE[h.status] || STATUS_STYLE.Pending;
                                    return (
                                        <tr key={h.id}>
                                            <td className="tx-id">{h.id}</td>
                                            <td><span className={`tx-type-chip ${h.type.toLowerCase()}`}>{h.type}</span></td>
                                            <td>{h.party}</td><td>{h.product}</td><td>{h.amount}</td>
                                            <td><span className="tx-status-chip" style={{ color: s.color, background: s.bg }}>{h.status}</span></td>
                                            <td><button className="tx-edit-btn" onClick={() => openEdit(h)}>Edit</button></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {editModal && editForm && (
                <div className="modal-overlay" onClick={() => setEditModal(false)}>
                    <div className="modal-box tx-edit-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><span className="modal-title">Edit Record: {editForm.id}</span></div>
                        <form className="modal-form" onSubmit={saveEdit}>
                            <label>Party Name</label><input value={editForm.party} onChange={e => setEditForm(p => ({ ...p, party: e.target.value }))} required />
                            <label>Product</label><input value={editForm.product} onChange={e => setEditForm(p => ({ ...p, product: e.target.value }))} required />
                            <label>Amount (₹)</label><input value={editForm.amount} onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))} required />
                            <label>Status</label>
                            <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                                <option>Paid</option><option>Pending</option><option>Cancelled</option>
                            </select>
                            <div className="modal-actions">
                                <button type="button" className="modal-cancel" onClick={() => setEditModal(false)}>Cancel</button>
                                <button type="submit" className="modal-submit">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
