'use client';
import { useState } from 'react';
type M = { role: 'user' | 'assistant'; content: string };
export default function Chat() {
  const [msgs, setMsgs] = useState<M[]>([]), [q, setQ] = useState(''), [busy, setBusy] = useState(false);
  async function ask(text: string) {
    if (!text.trim()) return;
    const next = [...msgs, { role: 'user' as const, content: text }]; setMsgs(next); setQ(''); setBusy(true);
    const r = await fetch('/api/advisor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: next }) }).then(r => r.json()).catch(() => ({ error: 'Network error. Try again.' }));
    setMsgs([...next, { role: 'assistant', content: r.reply ?? r.error }]); setBusy(false);
  }
  return (<div style={{ display: 'grid', gap: 10 }}>
    {!msgs.length && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{['What is my net worth?', 'What debts do I have?', 'Where did my money go this month?', 'How can I build wealth?'].map(s => <button key={s} className="chip" onClick={() => ask(s)}>{s}</button>)}</div>}
    {msgs.map((m, i) => <div key={i} className={`msg ${m.role === 'user' ? 'u' : 'a'}`}>{m.content}</div>)}
    {busy && <div className="msg a mute">Thinking…</div>}
    <form onSubmit={e => { e.preventDefault(); ask(q); }} style={{ display: 'flex', gap: 8 }}><input value={q} onChange={e => setQ(e.target.value)} placeholder="Ask anything about your money" aria-label="Question" /><button className="btn pri" disabled={busy}>Ask</button></form>
  </div>);
}
