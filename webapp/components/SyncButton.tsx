'use client';
import { useState } from 'react';
export default function SyncButton() {
  const [b, setB] = useState(false);
  return <button className="btn ghost" disabled={b} onClick={async () => { setB(true); await fetch('/api/plaid/sync', { method: 'POST' }); location.reload(); }}>{b ? 'Syncing…' : 'Refresh'}</button>;
}
