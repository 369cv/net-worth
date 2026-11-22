'use client';
import { useState } from 'react';
export default function SyncButton() {
  const [b, setB] = useState(false);
  return <button className="btn" disabled={b} onClick={async () => { setB(true); await fetch('/api/plaid/sync', { method: 'POST' }); location.reload(); }}>{b ? 'Refreshing…' : 'Refresh'}</button>;
}
