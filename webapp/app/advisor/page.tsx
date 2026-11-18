import Shell from '@/components/Shell';
import Chat from '@/components/Chat';
export default function Advisor() {
  return (<Shell active="advisor" title="Advisor"><div style={{ maxWidth: 760, display: 'grid', gap: 14 }}>
    <div className="serif" style={{ fontSize: 34, lineHeight: 1.1 }}>Your AI <em>financial advisor</em> is ready to help you.</div><Chat /></div></Shell>);
}
