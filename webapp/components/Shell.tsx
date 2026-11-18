import Link from 'next/link';
import Logo from './Logo';
import Icon from './Icon';
const TRACK = [['dashboard', 'home', 'Home'], ['spending', 'spend', 'Spending'], ['invest', 'invest', 'Invest'], ['forecast', 'forecast', 'Forecast']];
const SERVICES = [['broker', 'Brokerage'], ['estate', 'Estate planning'], ['tax', 'Tax'], ['planner', 'Financial planner']];
export default function Shell({ active, title, actions, children }: { active: string; title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (<div className="app"><nav className="side">
    <div className="logo"><Logo />Net Worth</div>
    <div className="sec">TRACK</div>
    {TRACK.map(([k, i, l]) => <Link key={k} href={`/${k}`} className={`nv ${active === k ? 'on' : ''}`}><Icon name={i} />{l}</Link>)}
    <div className="sec">SERVICES</div>
    {SERVICES.map(([i, l]) => <span key={l} className="nv soon" title="Coming soon"><Icon name={i} />{l}</span>)}
    <Link href="/advisor" className="ask"><Icon name="spark" />Ask anything</Link>
    <form action="/auth/signout" method="post"><button className="nv" style={{ all: 'unset', cursor: 'pointer', padding: '7px 10px', color: 'var(--mute)', fontSize: 12 }}>Sign out</button></form>
  </nav><main><div className="top"><h1>{title}</h1><div style={{ display: 'flex', gap: 8 }}>{actions}</div></div>{children}</main></div>);
}
