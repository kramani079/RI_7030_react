import { useState } from 'react';
import { useData } from '../context/DataContext';
import './Inventory.css';

const CATEGORIES = ['All', 'Shampoo', 'Styling', 'Color', 'Beard', 'Facial', 'Spa', 'Tools', 'Other'];

const EMPTY_FORM = { name: '', category: 'Other', qty: '', unit: 'bottle', price: '', lowStock: 5 };

export default function Inventory() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useData();

  const [search,      setSearch]      = useState('');
  const [catFilter,   setCatFilter]   = useState('All');
  const [showModal,   setShowModal]   = useState(false);
  const [editItem,    setEditItem]    = useState(null);   // item being edited
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [confirmDel,  setConfirmDel]  = useState(null);

  /* filtered list */
  const filtered = inventory.filter(item => {
    const matchCat  = catFilter === 'All' || item.category === catFilter;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function openAdd() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({ name: item.name, category: item.category, qty: item.qty, unit: item.unit, price: item.price, lowStock: item.lowStock });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name.trim() || form.qty === '' || form.price === '') return;
    const payload = {
      name:     form.name.trim(),
      category: form.category,
      qty:      Number(form.qty),
      unit:     form.unit,
      price:    Number(form.price),
      lowStock: Number(form.lowStock) || 5,
    };
    if (editItem) {
      updateInventoryItem(editItem.id, payload);
    } else {
      addInventoryItem(payload);
    }
    setShowModal(false);
  }

  function handleAdjustQty(id, delta) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(0, item.qty + delta);
    updateInventoryItem(id, { qty: newQty });
  }

  /* summary */
  const totalItems   = inventory.length;
  const lowStockCnt  = inventory.filter(i => i.qty <= i.lowStock).length;
  const totalValue   = inventory.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <div className="inventory-page animate-fade-in">
      {/* ── Page Header ─────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📦 Inventory</h1>
          <p className="page-sub">Manage salon products and supplies</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Item</button>
      </div>

      {/* ── Summary Cards ───────────────────────── */}
      <div className="inv-summary">
        <div className="inv-sum-card">
          <span className="inv-sum-icon">📦</span>
          <div>
            <div className="inv-sum-value">{totalItems}</div>
            <div className="inv-sum-label">Total Items</div>
          </div>
        </div>
        <div className="inv-sum-card inv-sum-card--red">
          <span className="inv-sum-icon">⚠️</span>
          <div>
            <div className="inv-sum-value">{lowStockCnt}</div>
            <div className="inv-sum-label">Low Stock</div>
          </div>
        </div>
        <div className="inv-sum-card inv-sum-card--gold">
          <span className="inv-sum-icon">💰</span>
          <div>
            <div className="inv-sum-value">₹{totalValue.toLocaleString('en-IN')}</div>
            <div className="inv-sum-label">Stock Value</div>
          </div>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────── */}
      <div className="inv-filters">
        <input
          type="text"
          placeholder="🔍  Search items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="inv-search"
        />
        <div className="cat-pills">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`cat-pill${catFilter === c ? ' active' : ''}`}
              onClick={() => setCatFilter(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────── */}
      <div className="inv-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Unit Price</th>
              <th>Stock Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="empty-row">No items found</td></tr>
            )}
            {filtered.map(item => {
              const isLow = item.qty <= item.lowStock;
              return (
                <tr key={item.id} className={isLow ? 'row-low-stock' : ''}>
                  <td>
                    <span className="item-name">{item.name}</span>
                    <span className="item-id"> #{item.id}</span>
                  </td>
                  <td><span className="badge badge-blue">{item.category}</span></td>
                  <td>
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => handleAdjustQty(item.id, -1)}>−</button>
                      <span className={`qty-val${isLow ? ' qty-low' : ''}`}>{item.qty}</span>
                      <button className="qty-btn" onClick={() => handleAdjustQty(item.id, +1)}>+</button>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.unit}</td>
                  <td>₹{item.price.toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 600 }}>₹{(item.qty * item.price).toLocaleString('en-IN')}</td>
                  <td>
                    {isLow
                      ? <span className="badge badge-red">Low Stock</span>
                      : <span className="badge badge-green">In Stock</span>
                    }
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(item)}>✏️ Edit</button>
                      <button className="btn btn-sm btn-danger"    onClick={() => setConfirmDel(item)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Add / Edit Modal ────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editItem ? '✏️ Edit Item' : '+ Add New Item'}</h2>
            <div className="modal-form">
              <label>
                Item Name *
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Wella Shampoo" />
              </label>
              <div className="modal-row">
                <label style={{ flex: 1 }}>
                  Category
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label style={{ flex: 1 }}>
                  Unit
                  <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                    {['bottle','tube','pack','box','piece','kg','litre'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </label>
              </div>
              <div className="modal-row">
                <label style={{ flex: 1 }}>
                  Quantity *
                  <input type="number" min="0" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} placeholder="0" />
                </label>
                <label style={{ flex: 1 }}>
                  Unit Price (₹) *
                  <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" />
                </label>
                <label style={{ flex: 1 }}>
                  Low Stock Alert
                  <input type="number" min="0" value={form.lowStock} onChange={e => setForm(f => ({ ...f, lowStock: e.target.value }))} placeholder="5" />
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary"   onClick={handleSave}>{editItem ? 'Save Changes' : 'Add Item'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal ─────────────────── */}
      {confirmDel && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: 'var(--accent-red)' }}>🗑️ Delete Item</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>
              Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{confirmDel.name}</strong>?
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { deleteInventoryItem(confirmDel.id); setConfirmDel(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
