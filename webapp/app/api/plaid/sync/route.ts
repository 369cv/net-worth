import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/wix-auth';
import { query } from '@/lib/wix-data';
import { syncItem } from '@/lib/sync';
export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const items = await query('PlaidItems', user.id);
  for (const i of items) await syncItem(user.id, i.itemId);
  return NextResponse.json({ ok: true, items: items.length });
}
