import { query } from './wix-data';
export const LIAB = new Set(['credit', 'loan']);
export const nice = (c: string) => c.replace(/_/g, ' ').toLowerCase().replace(/^\w/, m => m.toUpperCase());
// Everything the dashboard needs for one member, from Wix.
export async function load(userId: string) {
  const [accounts, tx, holdings, budgets] = await Promise.all([
    query('Accounts', userId), query('Transactions', userId, {}, [{ fieldName: 'date', order: 'DESC' }], 500),
    query('Holdings', userId), query('Budgets', userId),
  ]);
  const assets = accounts.filter(a => !LIAB.has(a.type)).reduce((s, a) => s + Number(a.balance), 0);
  const debts = accounts.filter(a => LIAB.has(a.type)).reduce((s, a) => s + Number(a.balance), 0);
  const month = new Date().toISOString().slice(0, 7);
  const spendTx = tx.filter(t => t.date?.startsWith(month) && t.amount > 0 && !['INCOME', 'TRANSFER_IN', 'TRANSFER_OUT', 'LOAN_PAYMENTS'].includes(t.category));
  const income = tx.filter(t => t.date?.startsWith(month) && t.amount < 0 && t.category === 'INCOME').reduce((s, t) => s - Number(t.amount), 0);
  const byDay: Record<number, number> = {}, byCat: Record<string, number> = {};
  for (const t of spendTx) { const d = +t.date.slice(8, 10); byDay[d] = (byDay[d] || 0) + Number(t.amount); byCat[t.category] = (byCat[t.category] || 0) + Number(t.amount); }
  const spent = spendTx.reduce((s, t) => s + Number(t.amount), 0);
  const budget = budgets.find(b => b.category === 'TOTAL')?.monthlyLimit ?? 0;
  return { accounts, tx, holdings, assets, debts, nw: assets - debts, spent, income, byDay, byCat, budget };
}
