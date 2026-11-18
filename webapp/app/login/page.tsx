'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
export default function Login() {
  const [email, setEmail] = useState(''); const [state, setState] = useState<'idle'|'sent'|'err'>('idle'); const [msg, setMsg] = useState('');
  async function go(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback` } });
    if (error) { setState('err'); setMsg(error.message); } else setState('sent');
  }
  return (<div className="center"><form onSubmit={go} className="card" style={{ width: 'min(420px,100%)', display: 'grid', gap: 14 }}>
    <h1 style={{ fontSize: 36 }}>Welcome to the beta</h1>
    <p style={{ color: 'var(--mute)', margin: 0 }}>Sign in with a magic link. No password.</p>
    {state === 'sent' ? <p>Check <b>{email}</b> for your sign-in link.</p> : <>
      <input type="email" required placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
      <button className="btn">Email me a link</button>{state === 'err' && <p className="down">{msg}</p>}</>}
  </form></div>);
}
