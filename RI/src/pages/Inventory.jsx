import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Inventory.css';

function getNextProductId(products) {
  const nums = products.map(p => {
    const m = p.id.match(/RI_(\d+)/);
    return m ? Number(m[1]) : 0;
  });
  return `RI_${Math.max(1000, ...nums) + 1}`;
}

function pct(prod) { return Object.values(prod).filter(Boolean).length * 25; }

function CompleteBadge({ prod, g }) {
  const p = pct(prod);
  const color = p === 100 ? '#2dab6f' : p >= 50 ? '#f4a12a' : '#e05c5c';
  return (
    <span className="inv-complete" style={{ color }}>
      {p === 100 ? `${g(100)}% Done` : p === 0 ? `${g(0)}%` : `${g(p)}%`}
    </span>
  );
}

export default function Inventory({ products, setProducts }) {
  const { user } = useAuth();
  const { t, g } = useLanguage();

  const STAGE_LABELS = {
    C: `${t.casting.split(' ')[0]} 1 – ${t.casting}`,
    F: `${t.casting.split(' ')[0]} 2 – Finishing Touch`,
    G: `${t.casting.split(' ')[0]} 3 – ${t.goldPlating}`,
    P: `${t.casting.split(' ')[0]} 4 – ${t.packaging}`,
  };

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
        <h2 className="inv-title">{t.inventoryManagement}</h2>
        <button className="btn-add-inv" onClick={openAdd}>{t.addNewProduct}</button>
      </div>

      <div className="inv-search-wrap">
        <input className="inv-search" placeholder={t.searchInventory}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="inv-table-wrap">
        <table className="inv-tbl">
          <thead>
            <tr>
              <th>{t.productId}</th>
              <th>{t.productName}</th>
              <th>{t.currentStock}</th>
              <th>{t.productionStages}</th>
              <th>{t.overallProgress}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(p => (
              <tr key={p.id}>
                <td className="inv-id">{g(p.id)}</td>
                <td className="inv-name">{p.name}</td>
                <td>
                  <span className={`inv-stock ${p.lowStock ? 'low' : ''}`}>
                    {g(p.stock)} {t.units}{p.lowStock ? ` ${t.low}` : ''}
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
                <td><CompleteBadge prod={p.production} g={g} /></td>
                <td>
                  <div className="inv-actions">
                    <button className="act-view" onClick={() => setViewProduct(p)}>{t.view}</button>
                    <button className="act-edit" onClick={() => openEdit(p)}>{t.edit}</button>
                    {user?.role !== 'Employee' && (
                      <button className="act-del" onClick={() => handleDelete(p.id)}>{t.del}</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan="6" className="inv-empty">{t.noProducts}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="inv-legend">
        <span className="leg-done">{t.done}</span> &nbsp;
        <span className="leg-pending">{t.pendingLabel}</span> &nbsp;|&nbsp;
        <strong>C</strong>: {t.casting} &nbsp;|&nbsp;
        <strong>G</strong>: {t.goldPlating} &nbsp;|&nbsp;
        <strong>P</strong>: {t.packaging}
      </div>

      <button className="fab-btn" onClick={openAdd}>+</button>

      {/* View Modal */}
      {viewProduct && (
        <div className="modal-overlay" onClick={() => setViewProduct(null)}>
          <div className="modal-box inv-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{t.productInfo}: {g(viewProduct.id)}</span>
              <button className="modal-close" onClick={() => setViewProduct(null)}>X</button>
            </div>
            <div className="inv-view-details">
              <div className="inv-view-row"><strong>{t.name}:</strong> {viewProduct.name}</div>
              <div className="inv-view-row"><strong>{t.stockLevelLabel}:</strong> <span className={viewProduct.lowStock ? 'inv-stock low' : ''}>{g(viewProduct.stock)} {t.units}</span></div>
              <div className="inv-view-row"><strong>{t.status}:</strong> <CompleteBadge prod={viewProduct.production} g={g} /> {t.done}</div>
              <div className="inv-view-row" style={{ marginTop: 15 }}><strong>{t.productionTracking}:</strong></div>
              <div className="inv-view-stages">
                {[
                  { k: 'C', lbl: `${t.casting}` },
                  { k: 'F', lbl: 'Finishing Touch' },
                  { k: 'G', lbl: t.goldPlating },
                  { k: 'P', lbl: t.packaging },
                ].map(({ k, lbl }) => (
                  <div key={k} className={`inv-view-stage ${viewProduct.production[k] ? 'done' : 'pending'}`}
                    onClick={() => toggleProductStage(viewProduct.id, k)} style={{ cursor: 'pointer' }}>
                    {viewProduct.production[k] ? `[${t.done}]` : `[${t.pendingLabel}]`} {lbl}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setViewProduct(null)}>{t.close}</button>
              <button className="modal-submit" onClick={() => { openEdit(viewProduct); setViewProduct(null); }}>{t.edit}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box inv-modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="inv-modal-title">{editTarget ? `${t.editProductLabel} ${g(editTarget)}` : t.addNewProductLabel}</h3>
            <form className="inv-modal-form" onSubmit={handleSave}>
              {!editTarget && (
                <div className="inv-modal-row" style={{ marginBottom: 12 }}>
                  <div className="inv-modal-col">
                    <label className="inv-mlabel">{t.productIdAuto}</label>
                    <input className="inv-minput read-only" value={g(getNextProductId(products))} readOnly style={{ background: '#f0f7fa', color: '#3e97b9', fontWeight: 700 }} />
                  </div>
                </div>
              )}
              <div className="inv-modal-row">
                <div className="inv-modal-col">
                  <label className="inv-mlabel">{t.productName}</label>
                  <input className="inv-minput" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="inv-modal-col inv-modal-col-sm">
                  <label className="inv-mlabel">{t.stock}</label>
                  <input className="inv-minput" type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} required />
                </div>
              </div>
              <label className="inv-mlabel" style={{ marginTop: 18 }}>{t.productionStagesLabel}</label>
              <div className="inv-stages-grid">
                {[
                  { k: 'C', lbl: t.casting },
                  { k: 'F', lbl: 'Finishing Touch' },
                  { k: 'G', lbl: t.goldPlating },
                  { k: 'P', lbl: t.packaging },
                ].map(({ k, lbl }) => (
                  <label key={k} className="inv-stage-check">
                    <input type="checkbox" checked={form.production[k]} onChange={() => toggleFormStage(k)} />
                    <span className="inv-stage-text">{lbl}</span>
                  </label>
                ))}
              </div>
              <div className="inv-modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>{t.cancel}</button>
                <button type="submit" className="modal-submit">{editTarget ? t.saveChanges : t.createProduct}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
