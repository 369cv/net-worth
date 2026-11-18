'use client';
import { useState } from 'react';
type M = { role: 'user' | 'assistant'; content: string };
export default function Chat() {
  const [msgs, setMsgs] = useState<M[]>([]); const [q, setQ] = useState(''); const [busy, setBusy] = useState(false);
  async function send(e: React.FormEvent) {
    e.preventDefault(); if (!q.trim()) return;
    const next = [...msgs, { role: 'user' as const, content: q }]; setMsgs(next); setQ(''); setBusy(true);
    const r = await fetch('/api/advisor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: next }) }).then(r => r.json());
    setMsgs([...next, { role: 'assistant', content: r.reply ?? r.error }]); setBusy(false);
  }
  const ideas = ['Where did my money go this month?', 'Can I afford a $2,000 trip in March?', 'How fast can I pay off my card?'];
  return (<div style={{ display: 'grid', gap: 12, maxWidth: 760 }}>
    {!msgs.length && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{ideas.map(i => <button key={i} className="btn ghost" onClick={() => setQ(i)}>{i}</button>)}</div>}
    {msgs.map((m, i) => <div key={i} className="card" style={{ whiteSpace: 'pre-wrap', background: m.role === 'user' ? 'transparent' : undefined }}>{m.content}</div>)}
    {busy && <div className="card" style={{ color: 'var(--mute)' }}>Thinking…</div>}
    <form onSubmit={send} style={{ display: 'flex', gap: 8 }}><input value={q} onChange={e => setQ(e.target.value)} placeholder="Ask about your money…" /><button className="btn" disabled={busy}>Send</button></form>
  </div>);
}
