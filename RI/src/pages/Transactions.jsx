import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Transactions.css';

function getNextTxId(history) {
    const nums = history.map(h => {
        const m = h.id.match(/RI_(\d+)/);
        return m ? Number(m[1]) : 0;
    });
    return `RI_${Math.max(3000, ...nums) + 1}`;
}

const STATUS_STYLE = {
    Paid: { color: '#2dab6f', bg: '#e6f8f0' },
    Received: { color: '#2dab6f', bg: '#e6f8f0' },
    Pending: { color: '#f4a12a', bg: '#fff8ee' },
    Cancelled: { color: '#e05c5c', bg: '#fff0f0' },
};

export default function Transactions({ history, setHistory, onTransaction, products }) {
    const [searchParams] = useSearchParams();
    const [tab, setTab] = useState(searchParams.get('tab') || 'buy');
    const [search, setSearch] = useState('');
    const [editModal, setEditModal] = useState(false);
    const [editForm, setEditForm] = useState(null);

    const [buyForm, setBuyForm] = useState({ supplierName: '', paymentMethod: 'Cash', productId: '', product: '', quantity: '', unitPrice: '', amount: '', date: '2026-02-26' });
    const [sellForm, setSellForm] = useState({ customerName: '', paymentMethod: 'Cash', productId: '', product: '', quantity: '', sellingPrice: '', amount: '', date: '2026-02-26' });

    // Auto-calculate Buy Total
    useEffect(() => {
        const q = Number(buyForm.quantity) || 0;
        const p = Number(buyForm.unitPrice) || 0;
        setBuyForm(prev => ({ ...prev, amount: (q * p).toString() }));
    }, [buyForm.quantity, buyForm.unitPrice]);

    // Auto-calculate Sell Total
    useEffect(() => {
        const q = Number(sellForm.quantity) || 0;
        const p = Number(sellForm.sellingPrice) || 0;
        setSellForm(prev => ({ ...prev, amount: (q * p).toString() }));
    }, [sellForm.quantity, sellForm.sellingPrice]);

    function submitBuy(e) {
        e.preventDefault();
        const tx = {
            id: getNextTxId(history),
            type: 'Buy',
            party: buyForm.supplierName,
            productId: buyForm.productId,
            product: buyForm.product,
            qty: buyForm.quantity,
            amount: `₹${Number(buyForm.amount).toLocaleString('en-IN')}`,
            status: 'Pending',
            date: new Date(buyForm.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' }),
        };
        onTransaction(tx);
        setTab('history');
        setBuyForm({ supplierName: '', paymentMethod: 'Cash', productId: '', product: '', quantity: '', unitPrice: '', amount: '', date: '2026-02-26' });
    }

    function submitSell(e) {
        e.preventDefault();

        // Stock Validation
        const qtyToSell = Number(sellForm.quantity) || 0;
        const targetProduct = products.find(p =>
            (sellForm.productId && p.id === sellForm.productId) ||
            (p.name && p.name.toLowerCase() === sellForm.product.toLowerCase())
        );

        if (!targetProduct) {
            alert(`Error: Product "${sellForm.product}" not found in Inventory. You cannot sell what you don't have.`);
            return;
        }

        if (targetProduct.stock < qtyToSell) {
            alert(`Insufficient Stock! \nAvailable: ${targetProduct.stock}\nRequested: ${qtyToSell}\n\nPlease update inventory or reduce quantity.`);
            return;
        }

        const tx = {
            id: getNextTxId(history),
            type: 'Sell',
            party: sellForm.customerName,
            productId: sellForm.productId || targetProduct.id,
            product: sellForm.product,
            qty: sellForm.quantity,
            amount: `₹${Number(sellForm.amount).toLocaleString('en-IN')}`,
            status: 'Received',
            date: new Date(sellForm.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' }),
        };
        onTransaction(tx);
        setTab('history');
        setSellForm({ customerName: '', paymentMethod: 'Cash', productId: '', product: '', quantity: '', sellingPrice: '', amount: '', date: '2026-02-26' });
    }

    const filteredHistory = history.filter(h =>
        !search || h.party.toLowerCase().includes(search.toLowerCase()) || h.product.toLowerCase().includes(search.toLowerCase()) || h.id.toLowerCase().includes(search.toLowerCase())
    );

    function openEdit(h) {
        setEditForm({ ...h, amount: h.amount.replace(/[₹,]/g, '') });
        setEditModal(true);
    }

    function saveEdit(e) {
        e.preventDefault();
        setHistory(prev => prev.map(h => h.id === editForm.id ? { ...editForm, amount: `₹${Number(editForm.amount).toLocaleString('en-IN')}` } : h));
        setEditModal(false);
    }

    return (
        <div className="tx-page">
            <div className="tx-tabs">
                {['buy', 'sell', 'history'].map(t => (
                    <button key={t} className={`tx-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {tab === 'buy' && (
                <div className="tx-form-card">
                    <h3 className="tx-form-title">New Purchase (Buy)</h3>
                    <form className="tx-grid-form" onSubmit={submitBuy}>
                        <div className="tx-col">
                            <label className="tx-label">Transaction ID (Auto)</label>
                            <input className="tx-input read-only" value={getNextTxId(history)} readOnly style={{ background: '#f0f7fa', color: '#3e97b9', fontWeight: 700 }} />
                            <label className="tx-label">From (Supplier Name)</label>
                            <input className="tx-input" value={buyForm.supplierName} onChange={e => setBuyForm(p => ({ ...p, supplierName: e.target.value }))} required />
                            <label className="tx-label">Payment Method</label>
                            <select className="tx-select" value={buyForm.paymentMethod} onChange={e => setBuyForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                                <option>Cash</option><option>UPI</option><option>Bank Transfer</option>
                            </select>
                            <label className="tx-label">Date</label>
                            <input className="tx-input" type="date" value={buyForm.date} onChange={e => setBuyForm(p => ({ ...p, date: e.target.value }))} />
                        </div>
                        <div className="tx-col">
                            <label className="tx-label">Product ID</label>
                            <input className="tx-input" value={buyForm.productId} onChange={e => setBuyForm(p => ({ ...p, productId: e.target.value }))} placeholder="RI_100x" />
                            <label className="tx-label">Product Name</label>
                            <input className="tx-input" value={buyForm.product} onChange={e => setBuyForm(p => ({ ...p, product: e.target.value }))} required />
                        </div>
                        <div className="tx-col">
                            <label className="tx-label">Quantity</label>
                            <input className="tx-input" type="number" value={buyForm.quantity} onChange={e => setBuyForm(p => ({ ...p, quantity: e.target.value }))} required />
                            <label className="tx-label">Unit Price (₹)</label>
                            <input className="tx-input" type="number" value={buyForm.unitPrice} onChange={e => setBuyForm(p => ({ ...p, unitPrice: e.target.value }))} required />
                            <label className="tx-label">Total Amount (₹)</label>
                            <input className="tx-input read-only" value={buyForm.amount} readOnly />
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
                            <label className="tx-label">Transaction ID (Auto)</label>
                            <input className="tx-input read-only" value={getNextTxId(history)} readOnly style={{ background: '#f0f7fa', color: '#3e97b9', fontWeight: 700 }} />
                            <label className="tx-label">To (Customer Name)</label>
                            <input className="tx-input" value={sellForm.customerName} onChange={e => setSellForm(p => ({ ...p, customerName: e.target.value }))} required />
                            <label className="tx-label">Payment Method</label>
                            <select className="tx-select" value={sellForm.paymentMethod} onChange={e => setSellForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                                <option>Cash</option><option>UPI</option><option>Bank Transfer</option>
                            </select>
                            <label className="tx-label">Date</label>
                            <input className="tx-input" type="date" value={sellForm.date} onChange={e => setSellForm(p => ({ ...p, date: e.target.value }))} />
                        </div>
                        <div className="tx-col">
                            <label className="tx-label">Product ID</label>
                            <input className="tx-input" value={sellForm.productId} onChange={e => setSellForm(p => ({ ...p, productId: e.target.value }))} placeholder="RI_100x" />
                            <label className="tx-label">Product Name</label>
                            <input className="tx-input" value={sellForm.product} onChange={e => setSellForm(p => ({ ...p, product: e.target.value }))} required />
                        </div>
                        <div className="tx-col">
                            <label className="tx-label">Quantity</label>
                            <input className="tx-input" type="number" value={sellForm.quantity} onChange={e => setSellForm(p => ({ ...p, quantity: e.target.value }))} required />
                            <label className="tx-label">Selling Price (₹)</label>
                            <input className="tx-input" type="number" value={sellForm.sellingPrice} onChange={e => setSellForm(p => ({ ...p, sellingPrice: e.target.value }))} required />
                            <label className="tx-label">Total Amount (₹)</label>
                            <input className="tx-input read-only" value={sellForm.amount} readOnly />
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
                                <tr><th>Tx ID</th><th>Type</th><th>Party</th><th>Product (ID)</th><th>Qty</th><th>Total Amount</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map(h => {
                                    const s = STATUS_STYLE[h.status] || STATUS_STYLE.Pending;
                                    return (
                                        <tr key={h.id}>
                                            <td className="tx-id">{h.id}</td>
                                            <td><span className={`tx-type-chip ${h.type.toLowerCase()}`}>{h.type}</span></td>
                                            <td>{h.party}</td>
                                            <td>{h.product} <br /><small style={{ color: '#64748b' }}>{h.productId}</small></td>
                                            <td>{h.qty}</td>
                                            <td>{h.amount}</td>
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
                            <label>Product ID</label><input value={editForm.productId || ''} onChange={e => setEditForm(p => ({ ...p, productId: e.target.value }))} />
                            <label>Product</label><input value={editForm.product} onChange={e => setEditForm(p => ({ ...p, product: e.target.value }))} required />
                            <label>Quantity</label><input type="number" value={editForm.qty} onChange={e => setEditForm(p => ({ ...p, qty: e.target.value }))} required />
                            <label>Total Amount (₹)</label><input type="number" value={editForm.amount} onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))} required />
                            <label>Status</label>
                            <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                                {editForm.type === 'Buy' ? (
                                    <>
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Received">Received</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </>
                                )}
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
