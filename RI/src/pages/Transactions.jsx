import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
    const { user } = useAuth();
    const { t, g } = useLanguage();
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

    const TAB_LABELS = { buy: t.buy, sell: t.sell.replace(' →',''), history: t.history, due: t.duePayments };

    return (
        <div className="tx-page">
            <div className="tx-tabs">
                {(user?.role === 'Employee' ? ['buy', 'sell', 'history'] : ['buy', 'sell', 'history', 'due']).map(tabKey => (
                    <button key={tabKey} className={`tx-tab ${tab === tabKey ? 'active' : ''}`} onClick={() => setTab(tabKey)}>
                        {TAB_LABELS[tabKey]}
                    </button>
                ))}
            </div>

            {tab === 'buy' && (
                <div className="tx-form-card">
                    <h3 className="tx-form-title">{t.newPurchase}</h3>
                    <form className="tx-grid-form" onSubmit={submitBuy}>
                        <div className="tx-col">
                            <label className="tx-label">{t.transactionIdAuto}</label>
                            <input className="tx-input read-only" value={g(getNextTxId(history))} readOnly style={{ background: '#f0f7fa', color: '#3e97b9', fontWeight: 700 }} />
                            <label className="tx-label">{t.fromSupplier}</label>
                            <input className="tx-input" value={buyForm.supplierName} onChange={e => setBuyForm(p => ({ ...p, supplierName: e.target.value }))} required />
                            <label className="tx-label">{t.paymentMethod}</label>
                            <select className="tx-select" value={buyForm.paymentMethod} onChange={e => setBuyForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                                <option value="Cash">{t.cash}</option><option value="UPI">{t.upi}</option><option value="Bank Transfer">{t.bankTransfer}</option><option value="Pending">{t.pending}</option>
                            </select>
                            <label className="tx-label">{t.date}</label>
                            <input className="tx-input" type="date" value={buyForm.date} onChange={e => setBuyForm(p => ({ ...p, date: e.target.value }))} />
                        </div>
                        <div className="tx-col">
                            <label className="tx-label">{t.productIdLabel}</label>
                            <input className="tx-input" value={buyForm.productId} onChange={e => setBuyForm(p => ({ ...p, productId: e.target.value }))} placeholder="RI_100x" />
                            <label className="tx-label">{t.productName}</label>
                            <input className="tx-input" value={buyForm.product} onChange={e => setBuyForm(p => ({ ...p, product: e.target.value }))} required />
                        </div>
                        <div className="tx-col">
                            <label className="tx-label">{t.quantity}</label>
                            <input className="tx-input" type="number" value={buyForm.quantity} onChange={e => setBuyForm(p => ({ ...p, quantity: e.target.value }))} required />
                            <label className="tx-label">{t.unitPriceLabel}</label>
                            <input className="tx-input" type="number" value={buyForm.unitPrice} onChange={e => setBuyForm(p => ({ ...p, unitPrice: e.target.value }))} required />
                            <label className="tx-label">{t.totalAmountLabel}</label>
                            <input className="tx-input read-only" value={g(buyForm.amount)} readOnly />
                        </div>
                        <div className="tx-submit-row"><button className="tx-submit-btn" type="submit">{t.completePurchase}</button></div>
                    </form>
                </div>
            )}

            {tab === 'sell' && (
                <div className="tx-form-card">
                    <h3 className="tx-form-title">{t.newSale}</h3>
                    <form className="tx-grid-form" onSubmit={submitSell}>
                        <div className="tx-col">
                            <label className="tx-label">{t.transactionIdAuto}</label>
                            <input className="tx-input read-only" value={g(getNextTxId(history))} readOnly style={{ background: '#f0f7fa', color: '#3e97b9', fontWeight: 700 }} />
                            <label className="tx-label">{t.toCustomer}</label>
                            <input className="tx-input" value={sellForm.customerName} onChange={e => setSellForm(p => ({ ...p, customerName: e.target.value }))} required />
                            <label className="tx-label">{t.paymentMethod}</label>
                            <select className="tx-select" value={sellForm.paymentMethod} onChange={e => setSellForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                                <option value="Cash">{t.cash}</option><option value="UPI">{t.upi}</option><option value="Bank Transfer">{t.bankTransfer}</option><option value="Pending">{t.pending}</option>
                            </select>
                            <label className="tx-label">{t.date}</label>
                            <input className="tx-input" type="date" value={sellForm.date} onChange={e => setSellForm(p => ({ ...p, date: e.target.value }))} />
                        </div>
                        <div className="tx-col">
                            <label className="tx-label">{t.productIdLabel}</label>
                            <input className="tx-input" value={sellForm.productId} onChange={e => setSellForm(p => ({ ...p, productId: e.target.value }))} placeholder="RI_100x" />
                            <label className="tx-label">{t.productName}</label>
                            <input className="tx-input" value={sellForm.product} onChange={e => setSellForm(p => ({ ...p, product: e.target.value }))} required />
                        </div>
                        <div className="tx-col">
                            <label className="tx-label">{t.quantity}</label>
                            <input className="tx-input" type="number" value={sellForm.quantity} onChange={e => setSellForm(p => ({ ...p, quantity: e.target.value }))} required />
                            <label className="tx-label">{t.sellingPrice}</label>
                            <input className="tx-input" type="number" value={sellForm.sellingPrice} onChange={e => setSellForm(p => ({ ...p, sellingPrice: e.target.value }))} required />
                            <label className="tx-label">{t.totalAmountLabel}</label>
                            <input className="tx-input read-only" value={g(sellForm.amount)} readOnly />
                        </div>
                        <div className="tx-submit-row"><button className="tx-submit-btn" type="submit">{t.completeSale}</button></div>
                    </form>
                </div>
            )}

            {tab === 'history' && (
                <div className="tx-history-card">
                    <h3 className="tx-form-title">{t.transactionRecords}</h3>
                    <div className="tx-search-wrap">
                        <input className="tx-search" placeholder={t.searchHistory} value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="tx-table-wrap">
                        <table className="tx-tbl">
                            <thead>
                                <tr><th>{t.txId}</th><th>{t.type}</th><th>{t.party}</th><th>{t.productIdCol}</th><th>{t.qty}</th><th>{t.totalAmountCol}</th><th>{t.status}</th>{user?.role !== 'Employee' && <th>{t.actions}</th>}</tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map(h => {
                                    const s = STATUS_STYLE[h.status] || STATUS_STYLE.Pending;
                                    return (
                                        <tr key={h.id}>
                                            <td className="tx-id">{g(h.id)}</td>
                                            <td><span className={`tx-type-chip ${h.type.toLowerCase()}`}>{h.type === 'Buy' ? t.buy : t.sell.replace(' →','')}</span></td>
                                            <td>{h.party}</td>
                                            <td>{h.product} <br /><small style={{ color: '#64748b' }}>{g(h.productId)}</small></td>
                                            <td>{g(h.qty)}</td>
                                            <td>{g(h.amount)}</td>
                                            <td><span className="tx-status-chip" style={{ color: s.color, background: s.bg }}>{h.status}</span></td>
                                            {user?.role !== 'Employee' && <td><button className="tx-edit-btn" onClick={() => openEdit(h)}>{t.edit}</button></td>}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'due' && user?.role !== 'Employee' && (
                <div className="tx-history-card">
                    <h3 className="tx-form-title">{t.duePayments}</h3>
                    <div className="tx-table-wrap">
                        <table className="tx-tbl">
                            <thead>
                                <tr><th>{t.txId}</th><th>{t.type}</th><th>{t.party}</th><th>{t.description}</th><th>{t.amount}</th><th>{t.status}</th><th>{t.action}</th></tr>
                            </thead>
                            <tbody>
                                {history.filter(h => h.status === 'Pending').map(h => (
                                    <tr key={h.id}>
                                        <td className="tx-id">{g(h.id)}</td>
                                        <td><span className={`tx-type-chip ${h.type.toLowerCase()}`}>{h.type === 'Buy' ? t.buy : t.sell.replace(' →','')}</span></td>
                                        <td>{h.party}</td>
                                        <td>{h.product}</td>
                                        <td><strong style={{ color: h.type === 'Buy' ? '#e05c5c' : '#2dab6f' }}>{g(h.amount)}</strong></td>
                                        <td><span className="tx-status-chip" style={{ color: STATUS_STYLE.Pending.color, background: STATUS_STYLE.Pending.bg }}>{t.pending}</span></td>
                                        <td>
                                            <button 
                                                className="tx-submit-btn" 
                                                style={{ padding: '6px 12px', fontSize: '13px', width: 'auto' }}
                                                onClick={() => {
                                                    const newStatus = h.type === 'Buy' ? 'Paid' : 'Received';
                                                    setHistory(prev => prev.map(tx => tx.id === h.id ? { ...tx, status: newStatus } : tx));
                                                }}
                                            >
                                                {h.type === 'Buy' ? t.payNow : t.markReceived}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {history.filter(h => h.status === 'Pending').length === 0 && (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>{t.noPendingPayments}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {editModal && editForm && (
                <div className="modal-overlay" onClick={() => setEditModal(false)}>
                    <div className="modal-box tx-edit-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><span className="modal-title">{t.editRecord}: {editForm.id}</span></div>
                        <form className="modal-form" onSubmit={saveEdit}>
                            <label>{t.partyName}</label><input value={editForm.party} onChange={e => setEditForm(p => ({ ...p, party: e.target.value }))} required />
                            <label>{t.productIdLabel}</label><input value={editForm.productId || ''} onChange={e => setEditForm(p => ({ ...p, productId: e.target.value }))} />
                            <label>{t.product}</label><input value={editForm.product} onChange={e => setEditForm(p => ({ ...p, product: e.target.value }))} required />
                            <label>{t.quantity}</label><input type="number" value={editForm.qty} onChange={e => setEditForm(p => ({ ...p, qty: e.target.value }))} required />
                            <label>{t.totalAmountLabel}</label><input type="number" value={editForm.amount} onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))} required />
                            <label>{t.status}</label>
                            <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                                {editForm.type === 'Buy' ? (
                                    <>
                                        <option value="Paid">{t.paid}</option>
                                        <option value="Pending">{t.pending}</option>
                                        <option value="Cancelled">{t.cancelled}</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Received">{t.received}</option>
                                        <option value="Pending">{t.pending}</option>
                                        <option value="Cancelled">{t.cancelled}</option>
                                    </>
                                )}
                            </select>
                            <div className="modal-actions">
                                <button type="button" className="modal-cancel" onClick={() => setEditModal(false)}>{t.cancel}</button>
                                <button type="submit" className="modal-submit">{t.update}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
