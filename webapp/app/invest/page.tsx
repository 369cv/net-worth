import Shell from '@/components/Shell';
import LinkButton from '@/components/LinkButton';
import { currentUser } from '@/lib/wix-auth';
import { load } from '@/lib/data';
import { usd } from '@/lib/fmt';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function Invest() {
  const user = await currentUser(); if (!user) redirect('/login');
  const { holdings } = await load(user.id);
  const total = holdings.reduce((s, h) => s + Number(h.value), 0);
  return (<Shell active="invest" title="Invest" actions={<LinkButton label="Link brokerage" />}>
    <section className="card"><div className="ch"><span className="lbl">Portfolio</span></div><div className="cb">
      <div className="val">{usd(total)}</div>
      {holdings.length ? <div className="tw" style={{ marginTop: 12 }}><table><thead><tr><th>Holding</th><th className="num">Qty</th><th className="num">Price</th><th className="num">Value</th><th className="num">Weight</th></tr></thead>
        <tbody>{[...holdings].sort((a, b) => b.value - a.value).map(h => <tr key={h._id}><td><b>{h.ticker || '—'}</b><div className="d mute">{h.securityName}</div></td><td className="num">{Number(h.quantity).toLocaleString()}</td><td className="num">{usd(Number(h.price))}</td><td className="num">{usd(Number(h.value))}</td><td className="num">{(h.value / total * 100).toFixed(1)}%</td></tr>)}</tbody></table></div>
        : <div className="empty"><div>Link a brokerage or retirement account to track holdings and allocation.</div></div>}</div></section></Shell>);
}
