import Shell from '@/components/Shell';
import ForecastForm from '@/components/ForecastForm';
import { currentUser } from '@/lib/wix-auth';
import { load } from '@/lib/data';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function Forecast() {
  const user = await currentUser(); if (!user) redirect('/login');
  const { nw } = await load(user.id);
  return (<Shell active="forecast" title="Forecast"><section className="card" style={{ maxWidth: 720 }}><div className="ch"><span className="lbl">In 20 years</span></div><div className="cb"><ForecastForm nw={nw} /></div></section></Shell>);
}
