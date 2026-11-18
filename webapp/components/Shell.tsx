import Link from 'next/link';
export default function Shell({ active, children }: { active: string; children: React.ReactNode }) {
  const nav = [['dashboard', 'Overview'], ['advisor', 'Advisor']];
  return (<div className="shell"><nav className="side"><div className="brand">Net Worth</div>
    {nav.map(([k, l]) => <Link key={k} href={`/${k}`} className={active === k ? 'on' : ''}>{l}</Link>)}
    <form action="/auth/signout" method="post" style={{ marginTop: 'auto' }}><button className="btn ghost">Sign out</button></form>
  </nav><main>{children}</main></div>);
}
