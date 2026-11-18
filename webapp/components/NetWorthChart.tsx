import { usd } from '@/lib/fmt';
// Plots balance history from the member's own transactions: walks back from today's net worth.
export default function NetWorthChart({ nw, tx }: { nw: number; tx: any[] }) {
  if (!tx.length) return null;
  const byDate = new Map<string, number>();
  for (const t of tx) byDate.set(t.date, (byDate.get(t.date) || 0) + Number(t.amount));
  const dates = [...byDate.keys()].sort().reverse();
  let v = nw; const pts: number[] = [nw];
  for (const d of dates) { v += byDate.get(d)!; pts.push(v); }
  pts.reverse();
  const W = 600, H = 170, mn = Math.min(...pts), mx = Math.max(...pts), x = (i: number) => 8 + i * (W - 70) / Math.max(1, pts.length - 1), y = (n: number) => H - 10 - (n - mn) / (mx - mn || 1) * (H - 24);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join('');
  return (<svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Net worth over time">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--blue)" stopOpacity=".35" /><stop offset="1" stopColor="var(--blue)" stopOpacity="0" /></linearGradient></defs>
    {[mn, (mn + mx) / 2, mx].map((t, i) => <g key={i}><line x1="0" x2={W - 60} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeDasharray="3 4" /><text x={W - 4} y={y(t) + 3} textAnchor="end" fontSize="10" fill="var(--mute)">{usd(t)}</text></g>)}
    <path d={`${d}L${x(pts.length - 1)} ${H}L8 ${H}Z`} fill="url(#g)" /><path d={d} fill="none" stroke="var(--blue)" strokeWidth="2" />
    <circle cx={x(pts.length - 1)} cy={y(pts.at(-1)!)} r="4" fill="var(--blue)" /></svg>);
}
