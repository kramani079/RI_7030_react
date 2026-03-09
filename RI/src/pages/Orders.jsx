import { useState, useEffect } from 'react';
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

export default function Orders({ orders, setOrders, onTransaction, products, history }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
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
    // When filter is 'All', exclude Delivered. Otherwise match the selected filter.
    if (filter === 'All' && o.status === 'Delivered') return false;
    const matchFilter = filter === 'All' || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || o.customer.toLowerCase().includes(q) || o.product.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  function handleDispatch(o) {
    if (o.status === 'Delivered') {
      alert('Order already dispatched and delivered!');
      return;
    }

    // Stock Validation
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
      // 1. Mark order as Delivered
      setOrders(prev =>
        prev.map(order =>
          order.id === o.id ? { ...order, status: 'Delivered' } : order
        )
      );

      // 2. Log in Transaction History
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

      onTransaction(tx);

      alert(`✅ Order ${o.id} marked as Delivered!\nTransaction recorded in Transactions → History.`);
    }
  }

  function handleSave(e) {
    e.preventDefault();
    const formattedAmount = form.amount.startsWith('₹') ? form.amount : `₹${Number(form.amount).toLocaleString('en-IN')}`;

    if (editOrder) {
      setOrders(prev => prev.map(o => o.id === editOrder.id ? { ...o, ...form, amount: formattedAmount } : o));
    } else {
      setOrders(prev => [{
        id: getNextOrderId(prev),
        ...form,
        amount: formattedAmount,
        production: { C: false, F: false, G: false, P: false },
        status: 'Pending'
      }, ...prev]);
    }
    setShowModal(false);
    setEditOrder(null);
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

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h2 className="orders-title">Orders Management</h2>
        <button className="btn-new-order" onClick={() => {
          setEditOrder(null);
          setForm({ customer: '', email: '', productId: '', product: '', qty: '', unitPrice: '', amount: '', dueDate: '' });
          setShowModal(true);
        }}>+ Create New Order</button>
      </div>

      <div className="orders-search-wrap">
        <input className="orders-search" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="orders-filters">
        {['All', 'Pending', 'In Production', 'Ready', 'Delivered'].map(f => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="orders-table-wrap">
        <table className="orders-tbl">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product (ID)</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Production</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(o => {
              const s = STATUS_STYLE[o.status] || STATUS_STYLE.Pending;
              return (
                <tr key={o.id}>
                  <td className="td-id">{o.id}</td>
                  <td className="td-customer"><strong>{o.customer}</strong><br /><small>{o.email}</small></td>
                  <td>{o.product} <br /><small style={{ color: '#64748b' }}>{o.productId}</small></td>
                  <td>{o.qty}</td>
                  <td>₹{Number(o.unitPrice || 0).toLocaleString('en-IN')}</td>
                  <td className="td-amount">{o.amount}</td>
                  <td>
                    <div className="prod-dots">
                      {Object.keys(o.production).map(k => (
                        <span key={k} className={`prod-dot ${o.production[k] ? 'done' : 'pending'}`}>{k}</span>
                      ))}
                      <span className="prod-pct">{pct(o.production)}%</span>
                    </div>
                  </td>
                  <td><span className="status-chip" style={{ color: s.color, background: s.bg, borderColor: s.border }}>{o.status}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="act-view" onClick={() => setViewOrder(o)}>View</button>
                      <button className="act-edit" onClick={() => openEdit(o)}>Edit</button>
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
                        }}>✓ Delivered</span>
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
                        }} onClick={() => handleDispatch(o)}>Dispatch</button>
                      )}
                      <button className="act-del" onClick={() => setOrders(prev => prev.filter(x => x.id !== o.id))}>Del</button>
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
              <span className="modal-title">Order Details: {viewOrder.id}</span>
              <button className="modal-close" onClick={() => setViewOrder(null)}>✕</button>
            </div>
            <div className="order-view-details">
              <p><strong>Customer:</strong> {viewOrder.customer}</p>
              <p><strong>Email:</strong> {viewOrder.email || 'N/A'}</p>
              <p><strong>Product:</strong> {viewOrder.product} ({viewOrder.productId || 'N/A'})</p>
              <p><strong>Quantity:</strong> {viewOrder.qty}</p>
              <p><strong>Unit Price:</strong> ₹{Number(viewOrder.unitPrice || 0).toLocaleString('en-IN')}</p>
              <p><strong>Total Amount:</strong> {viewOrder.amount}</p>
              <p><strong>Due Date:</strong> {viewOrder.dueDate || 'N/A'}</p>
              <p><strong>Status:</strong> {viewOrder.status}</p>
              <p><strong>Progress:</strong> {pct(viewOrder.production)}%</p>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setViewOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editOrder ? 'Edit Order' : 'New Order'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="modal-form" onSubmit={handleSave}>
              <div className="modal-grid">
                {!editOrder && (
                  <div className="modal-col">
                    <label>Order ID (Auto)</label>
                    <input value={getNextOrderId(orders)} readOnly className="read-only" style={{ background: '#f0f7fa', color: '#3e97b9', fontWeight: 700 }} />
                  </div>
                )}
                <div className="modal-col">
                  <label>Customer Name</label>
                  <input value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} required />
                </div>
                <div className="modal-col">
                  <label>Email</label>
                  <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" />
                </div>
                <div className="modal-col">
                  <label>Product ID</label>
                  <input value={form.productId} onChange={e => setForm(p => ({ ...p, productId: e.target.value }))} placeholder="e.g. RI_1001" />
                </div>
                <div className="modal-col">
                  <label>Product Name</label>
                  <input value={form.product} onChange={e => setForm(p => ({ ...p, product: e.target.value }))} required />
                </div>
                <div className="modal-col">
                  <label>Quantity</label>
                  <input value={form.qty} onChange={e => setForm(p => ({ ...p, qty: e.target.value }))} type="number" required />
                </div>
                <div className="modal-col">
                  <label>Unit Price (₹)</label>
                  <input value={form.unitPrice} onChange={e => setForm(p => ({ ...p, unitPrice: e.target.value }))} type="number" required />
                </div>
                <div className="modal-col">
                  <label>Total Amount (₹)</label>
                  <input value={form.amount} readOnly className="read-only" />
                </div>
                <div className="modal-col">
                  <label>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
              </div>
              {editOrder && (
                <div style={{ marginTop: '15px' }}>
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    {Object.keys(STATUS_STYLE).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="modal-submit">Save Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
