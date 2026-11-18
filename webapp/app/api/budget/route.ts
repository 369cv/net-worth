import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/wix-auth';
import { save } from '@/lib/wix-data';
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { monthlyLimit } = await req.json();
  const n = Number(monthlyLimit);
  if (!(n > 0)) return NextResponse.json({ error: 'Enter an amount above zero.' }, { status: 400 });
  await save('Budgets', [{ _id: `${user.id}:total`, userId: user.id, category: 'TOTAL', monthlyLimit: n }]);
  return NextResponse.json({ ok: true });
}
