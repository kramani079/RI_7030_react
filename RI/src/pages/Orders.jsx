import { useState } from 'react';
import './Orders.css';

const ORDERS_INIT = [
  { id: 'RI_2001', customer: 'Mahesh Patel', email: 'mahesh@gmail.com', product: 'Gold Chain', qty: 50, amount: '₹2,50,000', dueDate: 'Feb 28, 2026', production: { C: true, F: true, G: true, P: false }, status: 'In Production' },
  { id: 'RI_2002', customer: 'Ramesh Jewellers', email: 'ramesh@jewellers.com', product: 'Ring Set', qty: 30, amount: '₹90,000', dueDate: 'Mar 2, 2026', production: { C: true, F: true, G: false, P: false }, status: 'In Production' },
  { id: 'RI_2003', customer: 'Vijay Exports', email: 'vijay@exports.com', product: 'Necklace', qty: 20, amount: '₹1,20,000', dueDate: 'Mar 5, 2026', production: { C: true, F: false, G: false, P: false }, status: 'Pending' },
  { id: 'RI_2004', customer: 'Anita Stores', email: 'anita@stores.com', product: 'Earrings', qty: 100, amount: '₹50,000', dueDate: 'Mar 7, 2026', production: { C: true, F: true, G: true, P: true }, status: 'Ready' },
  { id: 'RI_2005', customer: 'Suresh Traders', email: 'suresh@traders.com', product: 'Silver Earrings', qty: 200, amount: '₹40,000', dueDate: 'Feb 15, 2026', production: { C: true, F: true, G: true, P: true }, status: 'Delivered' },
];

let nextOrderId = 2006;

const STATUS_STYLE = {
  'In Production': { color: '#3e97b9', bg: '#e8f4fa', border: '#b0d9ec' },
  'Pending': { color: '#f4a12a', bg: '#fff8ee', border: '#fddfa0' },
  'Ready': { color: '#2dab6f', bg: '#e6f8f0', border: '#9edec1' },
  'Delivered': { color: '#6a8090', bg: '#f3f6f8', border: '#cdd8de' },
};

function pct(p) { return Object.values(p).filter(Boolean).length * 25; }

export default function Orders() {
  const [orders, setOrders] = useState(ORDERS_INIT);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [form, setForm] = useState({ customer: '', email: '', product: '', qty: '', amount: '', dueDate: '' });

  const visible = orders.filter(o => {
    const matchFilter = filter === 'All' || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || o.customer.toLowerCase().includes(q) || o.product.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  function toggleStage(orderId, k) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, production: { ...o.production, [k]: !o.production[k] } } : o));
  }

  function handleSave(e) {
    e.preventDefault();
    if (editOrder) {
      setOrders(prev => prev.map(o => o.id === editOrder.id ? { ...o, ...form, amount: form.amount.startsWith('₹') ? form.amount : `₹${form.amount}` } : o));
    } else {
      setOrders(prev => [{
        id: `RI_${nextOrderId++}`,
        ...form,
        amount: `₹${form.amount}`,
        production: { C: false, F: false, G: false, P: false },
        status: 'Pending'
      }, ...prev]);
    }
    setShowModal(false);
    setEditOrder(null);
  }

  function openEdit(o) {
    setEditOrder(o);
    setForm({ customer: o.customer, email: o.email, product: o.product, qty: o.qty, amount: o.amount.replace('₹', ''), dueDate: o.dueDate });
    setShowModal(true);
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h2 className="orders-title">📋 Orders Management</h2>
        <button className="btn-new-order" onClick={() => { setEditOrder(null); setForm({ customer: '', email: '', product: '', qty: '', amount: '', dueDate: '' }); setShowModal(true); }}>+ Create New Order</button>
      </div>

      <div className="orders-search-wrap">
        <span className="search-icon-o">🔍</span>
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
              <th>Product</th>
              <th>Qty</th>
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
                  <td>{o.product}</td>
                  <td>{o.qty}</td>
                  <td className="td-amount">{o.amount}</td>
                  <td>
                    <div className="prod-dots">
                      {Object.keys(o.production).map(k => (
                        <span key={k} className={`prod-dot ${o.production[k] ? 'done' : 'pending'} clickable`} onClick={() => toggleStage(o.id, k)}>{k}</span>
                      ))}
                      <span className="prod-pct">{pct(o.production)}%</span>
                    </div>
                  </td>
                  <td><span className="status-chip" style={{ color: s.color, background: s.bg, borderColor: s.border }}>{o.status}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="act-view" onClick={() => setViewOrder(o)}>View</button>
                      <button className="act-edit" onClick={() => openEdit(o)}>Edit</button>
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
              <p><strong>Email:</strong> {viewOrder.email}</p>
              <p><strong>Product:</strong> {viewOrder.product}</p>
              <p><strong>Quantity:</strong> {viewOrder.qty}</p>
              <p><strong>Price:</strong> {viewOrder.amount}</p>
              <p><strong>Due Date:</strong> {viewOrder.dueDate}</p>
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
              <label>Customer Name</label>
              <input value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} required />
              <label>Email</label>
              <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" />
              <label>Product</label>
              <input value={form.product} onChange={e => setForm(p => ({ ...p, product: e.target.value }))} required />
              <label>Quantity</label>
              <input value={form.qty} onChange={e => setForm(p => ({ ...p, qty: e.target.value }))} type="number" required />
              <label>Amount (₹)</label>
              <input value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
              {editOrder && (
                <>
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    {Object.keys(STATUS_STYLE).map(s => <option key={s}>{s}</option>)}
                  </select>
                </>
              )}
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="modal-submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
