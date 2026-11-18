'use client';
import { useEffect, useState } from 'react';
declare global { interface Window { Plaid?: any } }
export default function LinkButton({ label = 'Connect an account' }: { label?: string }) {
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!document.getElementById('plaid-js')) { const s = document.createElement('script'); s.id = 'plaid-js'; s.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'; document.head.appendChild(s); } }, []);
  async function open() {
    setBusy(true);
    const { link_token } = await fetch('/api/plaid/link-token', { method: 'POST' }).then(r => r.json());
    const h = window.Plaid.create({ token: link_token,
      onSuccess: async (public_token: string, meta: any) => {
        await fetch('/api/plaid/exchange', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ public_token, institution: meta?.institution?.name }) });
        location.reload();
      }, onExit: () => setBusy(false) });
    h.open();
  }
  return <button className="btn" onClick={open} disabled={busy}>{busy ? 'Opening…' : label}</button>;
}
