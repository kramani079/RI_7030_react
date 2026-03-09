import { useEffect, useState } from 'react';

export default function EmployeeForm({ employee = {}, types = [], onSave, onCancel }) {
  const [state, setState] = useState({ name: '', email: '', typeId: '', ...employee });
  useEffect(() => setState({ name: '', email: '', typeId: '', ...employee }), [employee]);
  function change(e) { const { name, value } = e.target; setState(s => ({ ...s, [name]: value })); }
  function submit(e) { e.preventDefault(); onSave(state); }
  return (
    <form className="form" onSubmit={submit}>
      <input name="name" placeholder="Name" value={state.name} onChange={change} required />
      <input name="email" placeholder="Email" value={state.email} onChange={change} />
      <select name="typeId" value={state.typeId || ''} onChange={change} required>
        <option value="">-- type --</option>
        {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <div>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
