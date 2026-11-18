import { NextResponse } from 'next/server';
import { plaid } from '@/lib/plaid';
import { currentUser } from '@/lib/wix-auth';
import { save } from '@/lib/wix-data';
import { syncItem } from '@/lib/sync';
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { public_token, institution } = await req.json();
  const r = await plaid.itemPublicTokenExchange({ public_token });
  await save('PlaidItems', [{ _id: r.data.item_id, userId: user.id, itemId: r.data.item_id, accessToken: r.data.access_token, institution: institution ?? '', cursor: '' }]);
  await syncItem(user.id, r.data.item_id);
  return NextResponse.json({ ok: true });
}
