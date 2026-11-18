import Shell from '@/components/Shell';
import Chat from '@/components/Chat';
export default function Advisor() {
  return <Shell active="advisor"><h1 style={{ fontSize: 44, marginBottom: 8 }}>Ask anything.</h1>
    <p style={{ color: 'var(--mute)', marginTop: 0 }}>Answers use your connected accounts.</p><Chat /></Shell>;
}
