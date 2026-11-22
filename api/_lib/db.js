// Postgres access via Neon's serverless driver (works on Vercel's free Postgres from the Marketplace).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
let sqlFn = null, ready = null;

function sql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) { const e = new Error('Database not configured'); e.status = 503; throw e; }
  if (!sqlFn) sqlFn = require('@neondatabase/serverless').neon(url);
  return sqlFn;
}
async function migrate() {
  if (!ready) ready = (async () => {
    const q = sql();
    const ddl = fs.readFileSync(path.join(process.cwd(), 'db', 'schema.sql'), 'utf8');
    for (const stmt of ddl.split(/;\s*\n/).map(s => s.replace(/--.*$/gm, '').trim()).filter(Boolean)) await q.query(stmt);
  })().catch(e => { ready = null; throw e; });
  return ready;
}
// Interim auth: each device holds a random 48-hex key; only its hash is stored. Replace with real sign-in later.
async function userFor(req) {
  const key = String(req.headers['x-nw-key'] || '');
  if (!/^[a-f0-9]{48}$/.test(key)) { const e = new Error('Missing or invalid key'); e.status = 401; throw e; }
  const h = crypto.createHash('sha256').update(key).digest('hex');
  const q = sql();
  const rows = await q.query('insert into nw_users(key_hash) values ($1) on conflict (key_hash) do update set key_hash = excluded.key_hash returning id', [h]);
  return rows[0].id;
}
module.exports = { sql, migrate, userFor };
