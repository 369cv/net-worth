import { NextResponse } from 'next/server';
import { plaid } from '@/lib/plaid';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase-server';
import { syncItem } from '@/lib/sync';
export async function POST(req: Request) {
  const { data: { user } } = await (await supabaseServer()).auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { public_token, institution } = await req.json();
  const r = await plaid.itemPublicTokenExchange({ public_token });
  await supabaseAdmin().from('plaid_items').insert({ item_id: r.data.item_id, user_id: user.id, access_token: r.data.access_token, institution: institution ?? null });
  await syncItem(user.id, r.data.item_id);
  return NextResponse.json({ ok: true });
}
