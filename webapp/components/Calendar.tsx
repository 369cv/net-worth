import { usd } from '@/lib/fmt';
export default function Calendar({ byDay }: { byDay: Record<number, number> }) {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth(), days = new Date(y, m + 1, 0).getDate(), first = new Date(y, m, 1).getDay();
  return (<div className="cal">{Array.from({ length: first }, (_, i) => <div key={'b' + i} />)}
    {Array.from({ length: days }, (_, i) => { const d = i + 1, v = byDay[d];
      return <div key={d} className={`day ${d === now.getDate() ? 'today' : ''} ${v ? 'sp' : ''}`}>{d}<br />{d > now.getDate() ? '–' : usd(v || 0)}</div>; })}
  </div>);
}
