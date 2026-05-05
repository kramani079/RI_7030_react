import { useState, useEffect } from 'react';

export default function ProductForm({ product = {}, types = [], onSave, onCancel }) {
  const [state, setState] = useState({ name: '', sku: '', typeId: '', stock: 0, unitCost: 0, ...product });

  useEffect(() => setState({ name: '', sku: '', typeId: '', stock: 0, unitCost: 0, ...product }), [product]);

  function change(e) { const { name, value } = e.target; setState(s => ({ ...s, [name]: name === 'stock' || name === 'unitCost' ? Number(value) : value })); }

  function submit(e) { e.preventDefault(); onSave(state); }

  return (
    <form className="form" onSubmit={submit} style={{ margin: '12px 0' }}>
      <input name="name" placeholder="Name" value={state.name} onChange={change} required />
      <input name="sku" placeholder="SKU" value={state.sku} onChange={change} />
      <select name="typeId" value={state.typeId || ''} onChange={change} required>
        <option value="">-- type --</option>
        {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <input name="stock" type="number" placeholder="Stock" value={state.stock} onChange={change} />
      <input name="unitCost" type="number" step="0.01" placeholder="Unit cost" value={state.unitCost} onChange={change} />
      <div>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
