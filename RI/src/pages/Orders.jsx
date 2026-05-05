import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Orders.css';

const STATUS_STYLE = {
  'In Production': { color: '#3e97b9', bg: '#e8f4fa', border: '#b0d9ec' },
  'Pending': { color: '#f4a12a', bg: '#fff8ee', border: '#fddfa0' },
  'Ready': { color: '#2dab6f', bg: '#e6f8f0', border: '#9edec1' },
  'Delivered': { color: '#6a8090', bg: '#f3f6f8', border: '#cdd8de' },
};

function getNextOrderId(orders) {
  const nums = orders.map(o => {
    const m = o.id.match(/RI_(\d+)/);
    return m ? Number(m[1]) : 0;
  });
  return `RI_${Math.max(2000, ...nums) + 1}`;
}

function pct(p) { return Object.values(p).filter(Boolean).length * 25; }

function getNextTxId(history) {
  const nums = (history || []).map(h => {
    const m = h.id.match(/RI_(\d+)/);
    return m ? Number(m[1]) : 0;
  });
  return `RI_${Math.max(3000, ...nums) + 1}`;
}

export default function Orders({ orders, setOrders, products, history, onTransaction, onAddOrder, onUpdateOrder, onDeleteOrder }) {
  const { user } = useAuth();
  const { t, g } = useLanguage();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer: '',
    email: '',
    productId: '',
    product: '',
    qty: '',
    unitPrice: '',
    amount: '',
    dueDate: ''
  });

  // Auto-calculate amount
  useEffect(() => {
    const q = Number(form.qty) || 0;
    const p = Number(form.unitPrice) || 0;
    if (q && p) {
      setForm(prev => ({ ...prev, amount: (q * p).toString() }));
    }
  }, [form.qty, form.unitPrice]);

  const visible = orders.filter(o => {
    if (filter === 'All' && o.status === 'Delivered') return false;
    const matchFilter = filter === 'All' || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || o.customer.toLowerCase().includes(q) || o.product.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  async function handleDispatch(o) {
    if (o.status === 'Delivered') {
      alert('Order already dispatched and delivered!');
      return;
    }

    const targetProduct = products.find(p =>
      (o.productId && p.id === o.productId) ||
      (p.name && p.name.toLowerCase() === o.product.toLowerCase())
    );

    if (!targetProduct) {
      alert(`Dispatch Failed: Product "${o.product}" not found in Inventory.`);
      return;
    }

    if (targetProduct.stock < o.qty) {
      alert(`Insufficient Stock to Dispatch!\nAvailable: ${targetProduct.stock}\nRequired: ${o.qty}\n\nPlease update inventory stock first.`);
      return;
    }

    if (window.confirm(`Dispatch order ${o.id} for ${o.customer}?\nThis will mark it as Delivered and record the payment in Transactions.`)) {
      
      const success = await onUpdateOrder(o.id, { ...o, status: 'Delivered' });

      if (success) {
        const tx = {
          id: getNextTxId(history),
          type: 'Sell',
          party: o.customer,
          productId: o.productId || targetProduct.id,
          product: o.product,
          qty: o.qty,
          amount: o.amount,
          status: 'Received',
          date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' }),
        };

        await onTransaction(tx);
        alert(`✅ Order ${o.id} marked as Delivered!\nTransaction recorded in Transactions → History.`);
      }
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const formattedAmount = form.amount.startsWith('₹') ? form.amount : `₹${Number(form.amount).toLocaleString('en-IN')}`;

    try {
      if (editOrder) {
        await onUpdateOrder(editOrder.id, { ...editOrder, ...form, amount: formattedAmount });
      } else {
        const newOrder = {
          id: getNextOrderId(orders),
          ...form,
          amount: formattedAmount,
          production: { C: false, F: false, G: false, P: false },
          status: 'Pending'
        };
        await onAddOrder(newOrder);
      }
      setShowModal(false);
      setEditOrder(null);
    } catch (err) {
      // Error toast shown by API layer
    } finally {
      setSaving(false);
    }
  }

  function openEdit(o) {
    setEditOrder(o);
    setForm({
      customer: o.customer,
      email: o.email || '',
      productId: o.productId || '',
      product: o.product,
      qty: o.qty,
      unitPrice: o.unitPrice || '',
      amount: o.amount.replace(/[₹,]/g, ''),
      dueDate: o.dueDate || ''
    });
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (window.confirm('Delete this order?')) {
      await onDeleteOrder(id);
    }
  }

  const FILTER_LABELS = {
    'All': t.all, 'Pending': t.pending, 'In Production': t.inProduction, 'Ready': t.ready, 'Delivered': t.delivered2
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h2 className="orders-title">{t.ordersManagement}</h2>
        {user?.role !== 'Employee' && (
          <button className="btn-new-order" onClick={() => {
            setEditOrder(null);
            setForm({ customer: '', email: '', productId: '', product: '', qty: '', unitPrice: '', amount: '', dueDate: '' });
            setShowModal(true);
          }}>{t.createNewOrder}</button>
        )}
      </div>

      <div className="orders-search-wrap">
        <input className="orders-search" placeholder={t.searchOrders} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="orders-filters">
        {['All', 'Pending', 'In Production', 'Ready', 'Delivered'].map(f => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{FILTER_LABELS[f]}</button>
        ))}
      </div>

      <div className="orders-table-wrap">
        <table className="orders-tbl">
          <thead>
            <tr>
              <th>{t.orderId}</th>
              <th>{t.customer}</th>
              <th>{t.productIdCol}</th>
              <th>{t.qty}</th>
              <th>{t.price}</th>
              <th>{t.amount}</th>
              <th>{t.production}</th>
              <th>{t.status}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(o => {
              const s = STATUS_STYLE[o.status] || STATUS_STYLE.Pending;
              return (
                <tr key={o.id}>
                  <td className="td-id">{g(o.id)}</td>
                  <td className="td-customer"><strong>{o.customer}</strong><br /><small>{o.email}</small></td>
                  <td>{o.product} <br /><small style={{ color: '#64748b' }}>{g(o.productId)}</small></td>
                  <td>{g(o.qty)}</td>
                  <td>{g(`₹${Number(o.unitPrice || 0).toLocaleString('en-IN')}`)}</td>
                  <td className="td-amount">{g(o.amount)}</td>
                  <td>
                    <div className="prod-dots">
                      {Object.keys(o.production).map(k => (
                        <span key={k} className={`prod-dot ${o.production[k] ? 'done' : 'pending'}`}>{k}</span>
                      ))}
                      <span className="prod-pct">{g(pct(o.production))}%</span>
                    </div>
                  </td>
                  <td><span className="status-chip" style={{ color: s.color, background: s.bg, borderColor: s.border }}>{o.status}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="act-view" onClick={() => setViewOrder(o)}>{t.view}</button>
                      {user?.role !== 'Employee' && (
                        <>
                          <button className="act-edit" onClick={() => openEdit(o)}>{t.edit}</button>
                          {o.status === 'Delivered' ? (
                            <span style={{
                              padding: '5px 12px',
                              borderRadius: '5px',
                              fontSize: '12px',
                              fontWeight: '600',
                              border: '1.5px solid #6a8090',
                              color: '#6a8090',
                              background: '#f3f6f8',
                              display: 'inline-block'
                            }}>✓ {t.delivered2}</span>
                          ) : (
                            <button className="act-pay" style={{
                              padding: '5px 12px',
                              borderRadius: '5px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              border: '1.5px solid #2dab6f',
                              color: '#2dab6f',
                              background: 'transparent'
                            }} onClick={() => handleDispatch(o)}>{t.dispatch}</button>
                          )}
                          <button className="act-del" onClick={() => handleDelete(o.id)}>{t.del}</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewOrder && (
        <div className="modal-overlay" onClick={() => setViewOrder(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{t.orderDetails}: {viewOrder.id}</span>
              <button className="modal-close" onClick={() => setViewOrder(null)}>✕</button>
            </div>
            <div className="order-view-details">
              <p><strong>{t.customer}:</strong> {viewOrder.customer}</p>
              <p><strong>{t.email}:</strong> {viewOrder.email || t.na}</p>
              <p><strong>{t.product}:</strong> {viewOrder.product} ({viewOrder.productId || t.na})</p>
              <p><strong>{t.quantity}:</strong> {g(viewOrder.qty)}</p>
              <p><strong>{t.unitPrice}:</strong> {g(`₹${Number(viewOrder.unitPrice || 0).toLocaleString('en-IN')}`)}</p>
              <p><strong>{t.totalAmount}:</strong> {g(viewOrder.amount)}</p>
              <p><strong>{t.dueDate}:</strong> {g(viewOrder.dueDate) || t.na}</p>
              <p><strong>{t.status}:</strong> {viewOrder.status}</p>
              <p><strong>{t.progress}:</strong> {g(pct(viewOrder.production))}%</p>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setViewOrder(null)}>{t.close}</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editOrder ? t.editOrder : t.newOrder}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="modal-form" onSubmit={handleSave}>
              <div className="modal-grid">
                {!editOrder && (
                  <div className="modal-col">
                    <label>{t.orderIdAuto}</label>
                    <input value={g(getNextOrderId(orders))} readOnly className="read-only" style={{ background: '#f0f7fa', color: '#3e97b9', fontWeight: 700 }} />
                  </div>
                )}
                <div className="modal-col">
                  <label>{t.customerName}</label>
                  <input value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} required />
                </div>
                <div className="modal-col">
                  <label>{t.email}</label>
                  <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" />
                </div>
                <div className="modal-col">
                  <label>{t.productIdLabel}</label>
                  <input value={form.productId} onChange={e => setForm(p => ({ ...p, productId: e.target.value }))} placeholder="e.g. RI_1001" />
                </div>
                <div className="modal-col">
                  <label>{t.productName}</label>
                  <input value={form.product} onChange={e => setForm(p => ({ ...p, product: e.target.value }))} required />
                </div>
                <div className="modal-col">
                  <label>{t.quantity}</label>
                  <input value={form.qty} onChange={e => setForm(p => ({ ...p, qty: e.target.value }))} type="number" required />
                </div>
                <div className="modal-col">
                  <label>{t.unitPriceLabel}</label>
                  <input value={form.unitPrice} onChange={e => setForm(p => ({ ...p, unitPrice: e.target.value }))} type="number" required />
                </div>
                <div className="modal-col">
                  <label>{t.totalAmountLabel}</label>
                  <input value={form.amount} readOnly className="read-only" />
                </div>
                <div className="modal-col">
                  <label>{t.dueDate}</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
              </div>
              {editOrder && (
                <div style={{ marginTop: '15px' }}>
                  <label>{t.status}</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    {Object.keys(STATUS_STYLE).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>{t.cancel}</button>
                <button type="submit" className="modal-submit" disabled={saving}>{saving ? 'Saving...' : t.saveOrder}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
