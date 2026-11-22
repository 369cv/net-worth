// /api/statements
//   POST  { file, account:{id,name,currency,balance}, tx:[{date,name,amt}] }  -> store an imported statement (deduped)
//   GET   -> accounts with their latest transactions for this device key
// Header: x-nw-key (see api/_lib/db.js)
const { sql, migrate, userFor } = require('./_lib/db');
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const CUR = /^[A-Z]{3}$/;
const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await migrate();
    const uid = await userFor(req);
    const q = sql();

    if (req.method === 'GET') {
      const accts = await q.query('select id, client_id, name, currency, balance, updated_at from nw_accounts where user_id = $1 order by name', [uid]);
      const tx = accts.length ? await q.query(
        `select account_id, posted_on, description, amount from (
           select t.*, row_number() over (partition by account_id order by posted_on desc) rn
           from nw_transactions t where account_id = any($1)) x where rn <= 500`, [accts.map(a => a.id)]) : [];
      return res.status(200).json({ accounts: accts.map(a => ({ ...a, tx: tx.filter(t => t.account_id === a.id) })) });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const a = b.account || {};
    const clientId = clip(a.id, 40), name = clip(a.name, 60);
    const currency = CUR.test(a.currency) ? a.currency : 'USD';
    const balance = Number.isFinite(+a.balance) ? +a.balance : null;
    if (!clientId || !name) return res.status(400).json({ error: 'Account id and name are required.' });
    if (!Array.isArray(b.tx) || !b.tx.length || b.tx.length > 20000) return res.status(400).json({ error: 'Send between 1 and 20000 transactions.' });
    const rows = [];
    for (const t of b.tx) {
      const amt = Math.round(+t.amt * 100) / 100, desc = clip(t.name, 200) || 'Transaction';
      if (!DATE.test(t.date) || !Number.isFinite(amt)) continue;
      rows.push([t.date, desc, amt, `${t.date}|${amt.toFixed(2)}|${desc.toLowerCase()}`]);
    }
    if (!rows.length) return res.status(400).json({ error: 'No valid transactions.' });

    const [acct] = await q.query(
      `insert into nw_accounts(user_id, client_id, name, currency, balance) values ($1,$2,$3,$4,$5)
       on conflict (user_id, client_id) do update set name = excluded.name, currency = excluded.currency,
         balance = coalesce(excluded.balance, nw_accounts.balance), updated_at = now() returning id`,
      [uid, clientId, name, currency, balance]);
    const [imp] = await q.query('insert into nw_imports(account_id, file_name, row_count, inserted) values ($1,$2,$3,0) returning id', [acct.id, clip(b.file, 200) || null, rows.length]);
    let inserted = 0;
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const r = await q.query(
        `insert into nw_transactions(account_id, posted_on, description, amount, fingerprint, import_id)
         select $1, d::date, s, a::numeric, f, $2 from unnest($3::text[], $4::text[], $5::text[], $6::text[]) as u(d, s, a, f)
         on conflict (account_id, fingerprint) do nothing returning id`,
        [acct.id, imp.id, chunk.map(r => r[0]), chunk.map(r => r[1]), chunk.map(r => String(r[2])), chunk.map(r => r[3])]);
      inserted += r.length;
    }
    await q.query('update nw_imports set inserted = $1 where id = $2', [inserted, imp.id]);
    return res.status(200).json({ ok: true, account: acct.id, received: rows.length, inserted, duplicates: rows.length - inserted });
  } catch (e) {
    if (!e.status) console.error('statements', e);
    return res.status(e.status || 500).json({ error: e.status ? e.message : 'Server error' });
  }
};
