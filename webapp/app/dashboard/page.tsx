import Shell from '@/components/Shell';
import LinkButton from '@/components/LinkButton';
import SyncButton from '@/components/SyncButton';
import Calendar from '@/components/Calendar';
import BudgetForm from '@/components/BudgetForm';
import NetWorthChart from '@/components/NetWorthChart';
import Icon from '@/components/Icon';
import { currentUser } from '@/lib/wix-auth';
import { load, LIAB } from '@/lib/data';
import { usd } from '@/lib/fmt';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const user = await currentUser(); if (!user) redirect('/login');
  const D = await load(user.id);
  const h = new Date().getHours(), greet = `${h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'}${user.name ? ', ' + user.name : ''}`;
  const month = new Date().toLocaleString('en-US', { month: 'long' });
  const steps = [['Link your first account', D.accounts.length > 0], ['Set a monthly budget', D.budget > 0], ['Ask the advisor a question', false]] as const;
  const done = steps.filter(s => s[1]).length;
  return (<Shell active="dashboard" title={greet} actions={<>{D.accounts.length > 0 && <SyncButton />}<LinkButton label="Add account" /></>}>
    <div className="grid"><div className="col">
      <section className="card"><div className="ch"><span className="lbl">Net worth</span></div><div className="cb" style={{ display: 'grid', gap: 10 }}>
        <div><div className="val">{usd(D.nw)}</div><div className="d mute">{D.accounts.length} accounts · {usd(D.assets)} assets · {usd(D.debts)} debts</div></div>
        {D.accounts.length ? <NetWorthChart nw={D.nw} tx={D.tx} /> : <div className="empty"><Icon name="forecast" size={22} /><div>Your net worth chart starts when you link your first account.</div></div>}
        <LinkButton label="Add account" wide /></div></section>
      <section className="card"><div className="ch"><span className="lbl">Spent in {month}</span></div><div className="cb split">
        <div><div className="val" style={{ marginBottom: 10 }}>{usd(D.spent)}</div><Calendar byDay={D.byDay} /></div>
        <div><div className="lbl" style={{ marginBottom: 6 }}>Recent transactions</div>
          {D.tx.length ? D.tx.slice(0, 7).map(t => <div className="li" key={t._id}><div>{t.name}<div className="d mute">{t.date}</div></div><span className={`d ${t.amount < 0 ? 'up' : ''}`}>{t.amount < 0 ? '+' : ''}{usd(Math.abs(t.amount))}</span></div>)
            : <div className="empty"><Icon name="link" size={22} /><div>Transactions appear here once you link a bank or card.</div></div>}</div></div></section>
      <section className="card"><div className="ch"><span className="lbl">Accounts</span></div><div className="cb">
        {D.accounts.length ? D.accounts.map(a => <div className="li" key={a._id}><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="av">{(a.institution || a.name)[0]}</span><div>{a.name}<div className="d mute">{a.institution} · {a.subtype} ··{a.mask}</div></div></div>
          <span className={`d ${LIAB.has(a.type) ? 'dn' : ''}`}>{LIAB.has(a.type) ? '-' : ''}{usd(Number(a.balance))}</span></div>)
          : <div className="empty"><Icon name="bank" size={22} /><div>No accounts yet.</div></div>}</div></section>
    </div><div className="col">
      <section className="card hero"><div className="ch"><span className="lbl">Get started</span></div><div className="cb">
        <div className="serif" style={{ fontSize: 24 }}>Make the most of <em>Net Worth</em></div>
        <div className="prog" style={{ marginTop: 12, background: 'rgba(255,255,255,.25)' }}><i style={{ width: `${done / steps.length * 100}%`, background: '#fff' }} /></div>
        <div className="d" style={{ marginTop: 6, opacity: .8 }}>{done} of {steps.length} complete</div>
        <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>{steps.map(([l, d]) => <li key={l} style={{ opacity: d ? .6 : 1, textDecoration: d ? 'line-through' : 'none' }}>{l}</li>)}</ul></div></section>
      <section className="card"><div className="ch"><span className="lbl">Budget in {month}</span></div><div className="cb" style={{ display: 'grid', gap: 10 }}>
        {D.budget > 0 && <><div className="val">{usd(D.spent)} <span className="d mute">of {usd(D.budget)}</span></div><div className={`prog ${D.spent > D.budget ? 'over' : ''}`}><i style={{ width: `${Math.min(100, D.spent / D.budget * 100)}%` }} /></div></>}
        <BudgetForm current={D.budget} /></div></section>
      <section className="card"><div className="ch"><span className="lbl">Investments</span></div><div className="cb">
        {D.holdings.length ? <><div className="val">{usd(D.holdings.reduce((s, x) => s + Number(x.value), 0))}</div><a className="btn w" style={{ marginTop: 10 }} href="/invest">View holdings</a></>
          : <div className="empty"><Icon name="invest" size={22} /><div>Link a brokerage to see holdings.</div></div>}</div></section>
    </div></div></Shell>);
}
