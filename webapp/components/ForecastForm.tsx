'use client';
import { useState } from 'react';
import { usd } from '@/lib/fmt';
export default function ForecastForm({ nw }: { nw: number }) {
  const [m, setM] = useState(500), [r, setR] = useState(6);
  let v = nw; for (let i = 0; i < 20; i++) v = v * (1 + r / 100) + m * 12;
  return (<div style={{ display: 'grid', gap: 12 }}><div className="val">{usd(v)}</div>
    <div className="d mute">From today&apos;s {usd(nw)}, saving {usd(m)}/mo at {r}% a year, compounded yearly. An estimate, not a guarantee.</div>
    <div className="split"><label htmlFor="fm">Monthly saving<input id="fm" type="number" min="0" step="50" value={m} onChange={e => setM(+e.target.value)} /></label>
      <label htmlFor="fr">Annual return %<input id="fr" type="number" min="0" max="15" step=".5" value={r} onChange={e => setR(+e.target.value)} /></label></div></div>);
}
