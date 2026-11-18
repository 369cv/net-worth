# Net Worth — Landing page (private beta)

A static landing page (`index.html`) plus one serverless function (`api/waitlist.js`) that collects waitlist and access requests.

## Waitlist storage
Every CTA on the page opens the same modal and tags the signup with a `source` (the section it came from, such as `hero-ask`, `investing`, `couples` or `investors`). Set **one** of these in Vercel → Project → Settings → Environment Variables:

| Option | Variables |
|---|---|
| Supabase (recommended) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Any webhook (Zapier, Make, Sheets, Slack) | `WAITLIST_WEBHOOK_URL` |

With neither set, signups go **only** to Vercel runtime logs (search `WAITLIST_SIGNUP`).

### Supabase table
```sql
create table waitlist (
  id bigint generated always as identity primary key,
  email text unique not null,
  name text,
  role text,            -- individual | couple | advisor | investor
  platform text,        -- web | ios | android
  source text,          -- which section the request came from
  question text,        -- hero "ask" text, if any
  referral_code text,
  referred_by text,
  utm jsonb default '{}',
  created_at timestamptz default now()
);
alter table waitlist enable row level security; -- service role bypasses RLS; no public access
```

### Useful queries
```sql
select source, count(*) from waitlist group by 1 order by 2 desc;          -- best-converting sections
select * from waitlist where role = 'investor' order by created_at desc;    -- investor leads
select referred_by, count(*) from waitlist where referred_by is not null group by 1 order by 2 desc; -- top referrers
```

## Deploy
Static site with no build step. Vercel serves `index.html` and turns `api/` into functions automatically.

Roles: individual | couple | advisor | employer | investor. Employer leads: `select * from waitlist where role='employer';`
