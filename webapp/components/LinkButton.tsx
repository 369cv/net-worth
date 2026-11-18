'use client';
import { useEffect, useState } from 'react';
declare global { interface Window { Plaid?: any } }
export default function LinkButton({ label = 'Add account', wide = false }: { label?: string; wide?: boolean }) {
  const [busy, setBusy] = useState(false), [err, setErr] = useState('');
  useEffect(() => { if (!document.getElementById('plaid-js')) { const s = document.createElement('script'); s.id = 'plaid-js'; s.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'; document.head.appendChild(s); } }, []);
  async function open() {
    setBusy(true); setErr('');
    const r = await fetch('/api/plaid/link-token', { method: 'POST' }); const j = await r.json();
    if (!r.ok || !window.Plaid) { setErr(j.error || 'Bank linking is unavailable. Try again.'); return setBusy(false); }
    window.Plaid.create({ token: j.link_token,
      onSuccess: async (public_token: string, meta: any) => {
        await fetch('/api/plaid/exchange', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ public_token, institution: meta?.institution?.name }) });
        location.reload();
      }, onExit: () => setBusy(false) }).open();
  }
  return (<span style={{ display: wide ? 'grid' : 'inline-grid', gap: 4 }}><button className={`btn ${wide ? 'w' : 'pri'}`} onClick={open} disabled={busy}>{busy ? 'Connecting…' : label}</button>{err && <span className="d dn">{err}</span>}</span>);
}
