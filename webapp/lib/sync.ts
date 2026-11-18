import { plaid } from './plaid';
import { supabaseAdmin } from './supabase-server';
// Pull accounts + transactions (cursor-based) for one Plaid item into Supabase.
export async function syncItem(userId: string, itemId: string) {
  const db = supabaseAdmin();
  const { data: item } = await db.from('plaid_items').select('access_token,cursor').eq('item_id', itemId).eq('user_id', userId).single();
  if (!item) throw new Error('item not found');
  const acc = await plaid.accountsGet({ access_token: item.access_token });
  await db.from('accounts').upsert(acc.data.accounts.map((a: any) => ({
    id: a.account_id, user_id: userId, item_id: itemId, name: a.name, mask: a.mask, type: a.type, subtype: a.subtype,
    balance: a.balances.current ?? 0, currency: a.balances.iso_currency_code ?? 'USD', updated_at: new Date().toISOString(),
  })));
  let cursor = item.cursor ?? undefined, more = true;
  while (more) {
    const r = await plaid.transactionsSync({ access_token: item.access_token, cursor });
    const rows = [...r.data.added, ...r.data.modified].map(t => ({
      id: t.transaction_id, user_id: userId, account_id: t.account_id, date: t.date, name: t.merchant_name || t.name,
      amount: t.amount, category: t.personal_finance_category?.primary ?? 'OTHER', pending: t.pending,
    }));
    if (rows.length) await db.from('transactions').upsert(rows);
    if (r.data.removed.length) await db.from('transactions').delete().in('id', r.data.removed.map((x: any) => x.transaction_id));
    cursor = r.data.next_cursor; more = r.data.has_more;
  }
  await db.from('plaid_items').update({ cursor }).eq('item_id', itemId);
}
