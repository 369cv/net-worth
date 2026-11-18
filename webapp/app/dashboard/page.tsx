import Shell from '@/components/Shell';
import LinkButton from '@/components/LinkButton';
import SyncButton from '@/components/SyncButton';
import { supabaseServer } from '@/lib/supabase-server';
import { usd } from '@/lib/fmt';
export const dynamic = 'force-dynamic';
const LIAB = new Set(['credit', 'loan']);
export default async function Dashboard() {
  const sb = await supabaseServer();
  const [{ data: accounts }, { data: tx }] = await Promise.all([
    sb.from('accounts').select('*').order('balance', { ascending: false }),
    sb.from('transactions').select('*').order('date', { ascending: false }).limit(200),
  ]);
  const accs = accounts ?? [], txs = tx ?? [];
  const assets = accs.filter(a => !LIAB.has(a.type)).reduce((s, a) => s + Number(a.balance), 0);
  const debts = accs.filter(a => LIAB.has(a.type)).reduce((s, a) => s + Number(a.balance), 0);
  const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const recent = txs.filter(t => t.date >= since && t.amount > 0 && !['INCOME', 'TRANSFER_IN', 'TRANSFER_OUT', 'LOAN_PAYMENTS'].includes(t.category));
  const byCat = Object.entries(recent.reduce<Record<string, number>>((m, t) => (m[t.category] = (m[t.category] || 0) + Number(t.amount), m), {})).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const spent = byCat.reduce((s, [, v]) => s + v, 0);
  if (!accs.length) return (<Shell active="dashboard"><div className="card" style={{ maxWidth: 560 }}>
    <h1 style={{ fontSize: 40 }}>Let&apos;s see your whole picture.</h1>
    <p style={{ color: 'var(--mute)' }}>Connect a bank, card or brokerage. Sandbox: use <code>user_good</code> / <code>pass_good</code>.</p><LinkButton /></div></Shell>);
  return (<Shell active="dashboard">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
      <div><div className="label">Net worth</div><div className="big">{usd(assets - debts)}</div></div>
      <div style={{ display: 'flex', gap: 8 }}><SyncButton /><LinkButton label="Add account" /></div></div>
    <div className="grid" style={{ marginBottom: 16 }}>
      <div className="card"><div className="label">Assets</div><h2 style={{ fontSize: 32 }} className="up">{usd(assets)}</h2></div>
      <div className="card"><div className="label">Liabilities</div><h2 style={{ fontSize: 32 }} className="down">{usd(debts)}</h2></div>
      <div className="card"><div className="label">Spent · 30 days</div><h2 style={{ fontSize: 32 }}>{usd(spent)}</h2></div></div>
    <div className="grid">
      <div className="card"><div className="label" style={{ marginBottom: 8 }}>Accounts</div><table><tbody>
        {accs.map(a => <tr key={a.id}><td>{a.name}<div style={{ color: 'var(--mute)', fontSize: 12 }}>{a.subtype} ··{a.mask}</div></td>
          <td className={`num ${LIAB.has(a.type) ? 'down' : ''}`}>{usd(Number(a.balance))}</td></tr>)}</tbody></table></div>
      <div className="card"><div className="label" style={{ marginBottom: 12 }}>Spending by category</div>
        {byCat.map(([c, v]) => <div key={c} style={{ marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span>{c.replace(/_/g, ' ').toLowerCase()}</span><span>{usd(v)}</span></div><div className="bar"><i style={{ width: `${(v / spent) * 100}%` }} /></div></div>)}</div></div>
    <div className="card" style={{ marginTop: 16 }}><div className="label" style={{ marginBottom: 8 }}>Recent transactions</div><table>
      <thead><tr><th>Date</th><th>Merchant</th><th>Category</th><th className="num">Amount</th></tr></thead><tbody>
      {txs.slice(0, 25).map(t => <tr key={t.id}><td>{t.date}</td><td>{t.name}</td><td style={{ color: 'var(--mute)' }}>{t.category.replace(/_/g, ' ').toLowerCase()}</td>
        <td className={`num ${t.amount < 0 ? 'up' : ''}`}>{usd(-Number(t.amount))}</td></tr>)}</tbody></table></div>
  </Shell>);
}
