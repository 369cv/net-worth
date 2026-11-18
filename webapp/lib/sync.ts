import { plaid } from './plaid';
import { query, save, remove } from './wix-data';

// Pull accounts, transactions (cursor sync) and holdings for one Plaid item into Wix collections.
export async function syncItem(userId: string, itemId: string) {
  const [item] = await query('PlaidItems', userId, { itemId });
  if (!item) throw new Error('item not found');
  const acc = await plaid.accountsGet({ access_token: item.accessToken });
  await save('Accounts', acc.data.accounts.map((a: any) => ({
    _id: a.account_id, userId, accountId: a.account_id, itemId, name: a.name, mask: a.mask ?? '', type: a.type, subtype: a.subtype ?? '',
    balance: a.balances.current ?? 0, currency: a.balances.iso_currency_code ?? 'USD', institution: item.institution ?? '',
  })));

  let cursor: string | undefined = item.cursor || undefined, more = true;
  while (more) {
    const r = await plaid.transactionsSync({ access_token: item.accessToken, cursor });
    const rows = [...r.data.added, ...r.data.modified].map((t: any) => ({
      _id: t.transaction_id, userId, transactionId: t.transaction_id, accountId: t.account_id, date: t.date,
      name: t.merchant_name || t.name, amount: t.amount, category: t.personal_finance_category?.primary ?? 'OTHER', pending: t.pending,
    }));
    if (rows.length) await save('Transactions', rows);
    if (r.data.removed.length) await remove('Transactions', r.data.removed.map((x: any) => x.transaction_id));
    cursor = r.data.next_cursor; more = r.data.has_more;
  }
  await save('PlaidItems', [{ ...item, cursor }]);

  if (acc.data.accounts.some((a: any) => a.type === 'investment')) {
    try {
      const h = await plaid.investmentsHoldingsGet({ access_token: item.accessToken });
      const sec = new Map(h.data.securities.map((s: any) => [s.security_id, s]));
      await save('Holdings', h.data.holdings.map((x: any) => {
        const s: any = sec.get(x.security_id) ?? {};
        return { _id: `${x.account_id}:${x.security_id}`, userId, accountId: x.account_id, securityId: x.security_id, ticker: s.ticker_symbol ?? '', securityName: s.name ?? '', quantity: x.quantity, price: x.institution_price, value: x.institution_value };
      }));
    } catch { /* item not consented for investments */ }
  }
}
