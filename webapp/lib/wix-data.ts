// Wix CMS (Data API) as the database. Server-only: uses the site API key, never shipped to the browser.
// Collections (all ADMIN-only): PlaidItems, Accounts, Transactions, Holdings, Budgets. Every row carries userId.
const BASE = 'https://www.wixapis.com/wix-data/v2';
const headers = () => ({ Authorization: process.env.WIX_API_KEY!, 'wix-site-id': process.env.WIX_SITE_ID || 'd7297d6c-0f9e-42b4-af66-478f660798c5', 'Content-Type': 'application/json' });

async function call(path: string, body: unknown) {
  const r = await fetch(BASE + path, { method: 'POST', headers: headers(), body: JSON.stringify(body), cache: 'no-store' });
  if (!r.ok) throw new Error(`Wix Data ${path} ${r.status}: ${await r.text()}`);
  return r.json();
}

export async function query<T = any>(collection: string, userId: string, extra: Record<string, unknown> = {}, sort?: { fieldName: string; order: 'ASC' | 'DESC' }[], limit = 1000): Promise<T[]> {
  const out: T[] = [];
  let offset = 0;
  while (true) {
    const j = await call('/items/query', { dataCollectionId: collection, query: { filter: { userId, ...extra }, sort, paging: { limit: Math.min(limit, 1000), offset } } });
    const items = (j.dataItems ?? []).map((d: any) => ({ _id: d.id, ...d.data }));
    out.push(...items);
    if (items.length < 1000 || out.length >= limit) return out.slice(0, limit);
    offset += 1000;
  }
}

// Upsert by deterministic id (Plaid ids), in chunks of 1000.
export async function save(collection: string, rows: Array<{ _id: string } & Record<string, unknown>>) {
  for (let i = 0; i < rows.length; i += 1000)
    await call('/bulk/items/save', { dataCollectionId: collection, dataItems: rows.slice(i, i + 1000).map(({ _id, ...data }) => ({ id: _id, data: { _id, ...data } })) });
}

export async function remove(collection: string, ids: string[]) {
  for (let i = 0; i < ids.length; i += 1000)
    await call('/bulk/items/remove', { dataCollectionId: collection, dataItemIds: ids.slice(i, i + 1000) });
}
