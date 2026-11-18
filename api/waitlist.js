// Vercel serverless function: POST /api/waitlist
// Storage (first configured wins):
//   1. Supabase  -> SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (table: waitlist, see README)
//   2. Webhook   -> WAITLIST_WEBHOOK_URL (Zapier / Make / Google Sheets / Slack, etc.)
//   3. Fallback  -> logged to Vercel runtime logs only
const crypto = require('crypto');
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ROLES = ['individual', 'couple', 'advisor', 'employer', 'investor'];
const PLATFORMS = ['web', 'ios', 'android'];
const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  if (b.company) return res.status(200).json({ ok: true, code: 'x' }); // honeypot: silently drop bots
  const email = clip(b.email, 254).toLowerCase();
  if (!EMAIL.test(email)) return res.status(400).json({ error: 'Please enter a valid email.' });

  const code = crypto.createHash('sha256').update(email).digest('hex').slice(0, 8);
  const row = {
    email,
    name: clip(b.name, 120) || null,
    role: ROLES.includes(b.role) ? b.role : 'individual',
    platform: PLATFORMS.includes(b.platform) ? b.platform : 'web',
    source: clip(b.source, 60) || 'unknown',
    question: clip(b.question, 500) || null,
    referral_code: code,
    referred_by: clip(b.ref, 16) || null,
    utm: b.utm && typeof b.utm === 'object' ? b.utm : {},
    created_at: new Date().toISOString(),
  };

  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, WAITLIST_WEBHOOK_URL } = process.env;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?on_conflict=email`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=ignore-duplicates,return=minimal',
        },
        body: JSON.stringify(row),
      });
      if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
    } else if (WAITLIST_WEBHOOK_URL) {
      const r = await fetch(WAITLIST_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row) });
      if (!r.ok) throw new Error(`Webhook ${r.status}`);
    }
    console.log('WAITLIST_SIGNUP', JSON.stringify(row));
    return res.status(200).json({ ok: true, code });
  } catch (e) {
    console.error('WAITLIST_ERROR', e.message, JSON.stringify(row));
    return res.status(500).json({ error: 'Could not save your request. Please try again.' });
  }
};
