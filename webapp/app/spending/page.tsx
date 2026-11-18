import Shell from '@/components/Shell';
import LinkButton from '@/components/LinkButton';
import BudgetForm from '@/components/BudgetForm';
import { currentUser } from '@/lib/wix-auth';
import { load, nice } from '@/lib/data';
import { usd } from '@/lib/fmt';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function Spending() {
  const user = await currentUser(); if (!user) redirect('/login');
  const D = await load(user.id);
  const cats = Object.entries(D.byCat).sort((a, b) => b[1] - a[1]);
  return (<Shell active="spending" title="Spending" actions={<LinkButton label="Add account" />}>
    <div className="grid"><div className="col">
      <section className="card"><div className="ch"><span className="lbl">Spend this month</span></div><div className="cb">
        <div className="val">{usd(D.spent)}</div>
        {cats.length ? <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>{cats.map(([c, v]) => <div key={c}><div style={{ display: 'flex', justifyContent: 'space-between' }} className="d"><span>{nice(c)}</span><span>{usd(v)} · {Math.round(v / D.spent * 100)}%</span></div><div className="prog"><i style={{ width: `${v / D.spent * 100}%`, background: 'var(--blue)' }} /></div></div>)}</div>
          : <div className="empty"><div>Spending is tracked from linked bank and card transactions.</div><LinkButton label="Link with Plaid" /></div>}</div></section>
      <section className="card"><div className="ch"><span className="lbl">Transactions</span></div><div className="cb tw"><table>
        <thead><tr><th>Date</th><th>Merchant</th><th>Category</th><th className="num">Amount</th></tr></thead>
        <tbody>{D.tx.length ? D.tx.slice(0, 100).map(t => <tr key={t._id}><td className="mute">{t.date}</td><td>{t.name}</td><td className="mute">{nice(t.category)}</td><td className={`num ${t.amount < 0 ? 'up' : ''}`}>{t.amount < 0 ? '+' : '-'}{usd(Math.abs(t.amount))}</td></tr>)
          : <tr><td colSpan={4} className="mute" style={{ textAlign: 'center', padding: 22 }}>No transactions yet</td></tr>}</tbody></table></div></section>
    </div><div className="col">
      <section className="card"><div className="ch"><span className="lbl">Budget</span></div><div className="cb" style={{ display: 'grid', gap: 10 }}>
        {D.budget > 0 && <div className="val">{usd(D.budget - D.spent)} <span className="d mute">left of {usd(D.budget)}</span></div>}<BudgetForm current={D.budget} /></div></section>
      <section className="card"><div className="ch"><span className="lbl">Cash flow</span></div><div className="cb">
        <div className="li"><span>Income</span><span className="up">{usd(D.income)}</span></div><div className="li"><span>Expenses</span><span>{usd(D.spent)}</span></div>
        <div className="li"><b>Net cash flow</b><b>{usd(D.income - D.spent)}</b></div></div></section>
    </div></div></Shell>);
}
