import { NextResponse } from 'next/server';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase-server';
import { syncItem } from '@/lib/sync';
export async function POST() {
  const { data: { user } } = await (await supabaseServer()).auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: items } = await supabaseAdmin().from('plaid_items').select('item_id').eq('user_id', user.id);
  for (const i of items ?? []) await syncItem(user.id, i.item_id);
  return NextResponse.json({ ok: true, items: items?.length ?? 0 });
}
