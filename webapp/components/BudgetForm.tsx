'use client';
import { useState } from 'react';
export default function BudgetForm({ current }: { current: number }) {
  const [v, setV] = useState(current ? String(current) : ''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  return (<form style={{ display: 'grid', gap: 8 }} onSubmit={async e => { e.preventDefault(); setBusy(true);
    const r = await fetch('/api/budget', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ monthlyLimit: v }) });
    if (r.ok) location.reload(); else { setErr((await r.json()).error); setBusy(false); } }}>
    <label htmlFor="bud">Monthly budget (USD)<input id="bud" type="number" min="1" required value={v} onChange={e => setV(e.target.value)} /></label>
    <button className="btn pri w" disabled={busy}>{busy ? 'Saving…' : current ? 'Update budget' : 'Start budgeting'}</button>{err && <span className="dn d">{err}</span>}
  </form>);
}
