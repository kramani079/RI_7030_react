import { useState } from 'react';
import './Inventory.css';

const STAGE_LABELS = {
  C: 'Stage 1 – Casting',
  F: 'Stage 2 – Finishing Touch',
  G: 'Stage 3 – Gold Plating',
  P: 'Stage 4 – Packaging',
};

function getNextProductId(products) {
  const nums = products.map(p => {
    const m = p.id.match(/RI_(\d+)/);
    return m ? Number(m[1]) : 0;
  });
  return `RI_${Math.max(1000, ...nums) + 1}`;
}

function pct(prod) { return Object.values(prod).filter(Boolean).length * 25; }

function CompleteBadge({ prod }) {
  const p = pct(prod);
  const color = p === 100 ? '#2dab6f' : p >= 50 ? '#f4a12a' : '#e05c5c';
  return (
    <span className="inv-complete" style={{ color }}>
      {p === 100 ? '100% Done' : p === 0 ? '0%' : `${p}%`}
    </span>
  );
}

export default function Inventory({ products, setProducts }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [form, setForm] = useState({ name: '', stock: '', production: { C: false, F: false, G: false, P: false } });

  const visible = products.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  function toggleProductStage(productId, stageKey) {
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, production: { ...p.production, [stageKey]: !p.production[stageKey] } }
        : p
    ));
  }

  function openAdd() {
    setEditTarget(null);
    setForm({ name: '', stock: '', production: { C: false, F: false, G: false, P: false } });
    setShowModal(true);
  }

  function openEdit(p) {
    setEditTarget(p.id);
    setForm({ name: p.name, stock: p.stock, production: { ...p.production } });
    setShowModal(true);
  }

  function toggleFormStage(key) {
    setForm(prev => ({
      ...prev,
      production: { ...prev.production, [key]: !prev.production[key] },
    }));
  }

  function handleSave(e) {
    e.preventDefault();
    if (editTarget) {
      setProducts(prev => prev.map(p =>
        p.id === editTarget
          ? { ...p, name: form.name, stock: Number(form.stock), lowStock: Number(form.stock) < 15, production: { ...form.production } }
          : p
      ));
    } else {
      const newProdId = getNextProductId(products);
      setProducts(prev => [...prev, {
        id: newProdId, name: form.name,
        stock: Number(form.stock), lowStock: Number(form.stock) < 15,
        production: { ...form.production },
      }]);
    }
    setShowModal(false);
  }

  function handleDelete(id) {
    if (window.confirm('Delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  }

  return (
    <div className="inv-page">
      <div className="inv-header">
        <h2 className="inv-title">Inventory Management</h2>
        <button className="btn-add-inv" onClick={openAdd}>+ Add New Product</button>
      </div>

      <div className="inv-search-wrap">
        <input className="inv-search" placeholder="Search by name or RI ID..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="inv-table-wrap">
        <table className="inv-tbl">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Current Stock</th>
              <th>Production Stages</th>
              <th>Overall Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(p => (
              <tr key={p.id}>
                <td className="inv-id">{p.id}</td>
                <td className="inv-name">{p.name}</td>
                <td>
                  <span className={`inv-stock ${p.lowStock ? 'low' : ''}`}>
                    {p.stock} units{p.lowStock ? ' (Low)' : ''}
                  </span>
                </td>
                <td>
                  <div className="inv-prod-dots">
                    {Object.entries(p.production).map(([letter, done]) => (
                      <span key={letter}
                        className={`inv-dot ${done ? 'done' : 'pending'}`}
                      >{letter}</span>
                    ))}
                  </div>
                </td>
                <td><CompleteBadge prod={p.production} /></td>
                <td>
                  <div className="inv-actions">
                    <button className="act-view" onClick={() => setViewProduct(p)}>View</button>
                    <button className="act-edit" onClick={() => openEdit(p)}>Edit</button>
                    <button className="act-del" onClick={() => handleDelete(p.id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan="6" className="inv-empty">No products available.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="inv-legend">
        <span className="leg-done">Done</span> &nbsp;
        <span className="leg-pending">Pending</span> &nbsp;|&nbsp;
        <strong>C</strong>: Casting &nbsp;|&nbsp;
        <strong>G</strong>: Gold Plating &nbsp;|&nbsp;
        <strong>P</strong>: Packaging
      </div>

      <button className="fab-btn" onClick={openAdd}>+</button>

      {/* View Modal */}
      {viewProduct && (
        <div className="modal-overlay" onClick={() => setViewProduct(null)}>
          <div className="modal-box inv-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Product Info: {viewProduct.id}</span>
              <button className="modal-close" onClick={() => setViewProduct(null)}>X</button>
            </div>
            <div className="inv-view-details">
              <div className="inv-view-row"><strong>Name:</strong> {viewProduct.name}</div>
              <div className="inv-view-row"><strong>Stock Level:</strong> <span className={viewProduct.lowStock ? 'inv-stock low' : ''}>{viewProduct.stock} units</span></div>
              <div className="inv-view-row"><strong>Status:</strong> <CompleteBadge prod={viewProduct.production} /> Complete</div>
              <div className="inv-view-row" style={{ marginTop: 15 }}><strong>Production Tracking:</strong></div>
              <div className="inv-view-stages">
                {Object.entries(STAGE_LABELS).map(([k, lbl]) => (
                  <div key={k} className={`inv-view-stage ${viewProduct.production[k] ? 'done' : 'pending'}`}>
                    {viewProduct.production[k] ? '[DONE]' : '[PENDING]'} {lbl}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setViewProduct(null)}>Close</button>
              <button className="modal-submit" onClick={() => { openEdit(viewProduct); setViewProduct(null); }}>Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box inv-modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="inv-modal-title">{editTarget ? `Edit Product ${editTarget}` : 'Add New Product'}</h3>
            <form className="inv-modal-form" onSubmit={handleSave}>
              {!editTarget && (
                <div className="inv-modal-row" style={{ marginBottom: 12 }}>
                  <div className="inv-modal-col">
                    <label className="inv-mlabel">PRODUCT ID (Auto)</label>
                    <input className="inv-minput read-only" value={getNextProductId(products)} readOnly style={{ background: '#f0f7fa', color: '#3e97b9', fontWeight: 700 }} />
                  </div>
                </div>
              )}
              <div className="inv-modal-row">
                <div className="inv-modal-col">
                  <label className="inv-mlabel">PRODUCT NAME</label>
                  <input className="inv-minput" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="inv-modal-col inv-modal-col-sm">
                  <label className="inv-mlabel">STOCK</label>
                  <input className="inv-minput" type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} required />
                </div>
              </div>
              <label className="inv-mlabel" style={{ marginTop: 18 }}>PRODUCTION STAGES</label>
              <div className="inv-stages-grid">
                {Object.entries(STAGE_LABELS).map(([k, lbl]) => (
                  <label key={k} className="inv-stage-check">
                    <input type="checkbox" checked={form.production[k]} onChange={() => toggleFormStage(k)} />
                    <span className="inv-stage-text">{lbl}</span>
                  </label>
                ))}
              </div>
              <div className="inv-modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="modal-submit">{editTarget ? 'Save Changes' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
