import Logo from '@/components/Logo';
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (<div className="center"><div className="card" style={{ width: 'min(420px,100%)', padding: 28, display: 'grid', gap: 16 }}>
    <div className="logo"><Logo />Net Worth</div>
    <h1 className="serif" style={{ fontSize: 36, margin: 0 }}>Welcome to the beta</h1>
    <p className="mute" style={{ margin: 0 }}>Sign in or create your account to see your whole financial picture.</p>
    {error && <p className="dn" style={{ margin: 0 }}>Sign-in didn&apos;t complete. Try again.</p>}
    <a className="btn pri w" href="/auth/login">Continue</a>
  </div></div>);
}
