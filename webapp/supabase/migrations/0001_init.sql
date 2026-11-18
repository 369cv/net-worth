-- Net Worth web app schema. Run in Supabase → SQL editor.
create table if not exists public.plaid_items (
  item_id text primary key, user_id uuid not null references auth.users on delete cascade,
  access_token text not null, institution text, cursor text, created_at timestamptz default now());
create table if not exists public.accounts (
  id text primary key, user_id uuid not null references auth.users on delete cascade,
  item_id text references public.plaid_items on delete cascade, name text, mask text, type text, subtype text,
  balance numeric(14,2) default 0, currency text default 'USD', updated_at timestamptz default now());
create table if not exists public.transactions (
  id text primary key, user_id uuid not null references auth.users on delete cascade,
  account_id text references public.accounts on delete cascade, date date, name text,
  amount numeric(14,2), category text, pending boolean default false);
create index if not exists tx_user_date on public.transactions(user_id, date desc);

alter table public.plaid_items enable row level security;   -- no policies: service role only (access tokens never reach the browser)
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
create policy "own accounts" on public.accounts for select using (auth.uid() = user_id);
create policy "own transactions" on public.transactions for select using (auth.uid() = user_id);
