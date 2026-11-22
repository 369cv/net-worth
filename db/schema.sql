-- Net Worth: statement import schema (Postgres). Applied automatically on first API call.
create table if not exists nw_users (
  id          bigserial primary key,
  key_hash    text unique not null,          -- sha256 of the device key; raw key never stored
  created_at  timestamptz not null default now()
);
create table if not exists nw_accounts (
  id          bigserial primary key,
  user_id     bigint not null references nw_users(id) on delete cascade,
  client_id   text not null,                 -- account id used by the web app
  name        text not null,
  currency    char(3) not null default 'USD',
  balance     numeric(18,2),
  source      text not null default 'import',
  updated_at  timestamptz not null default now(),
  unique (user_id, client_id)
);
create table if not exists nw_imports (
  id          bigserial primary key,
  account_id  bigint not null references nw_accounts(id) on delete cascade,
  file_name   text,
  row_count   int not null,
  inserted    int not null,
  created_at  timestamptz not null default now()
);
create table if not exists nw_transactions (
  id          bigserial primary key,
  account_id  bigint not null references nw_accounts(id) on delete cascade,
  posted_on   date not null,
  description text not null,
  amount      numeric(18,2) not null,        -- bank sign: negative = money out
  fingerprint text not null,                 -- dedupe key: date|amount|description
  import_id   bigint references nw_imports(id) on delete set null,
  unique (account_id, fingerprint)
);
create index if not exists nw_tx_acct_date on nw_transactions(account_id, posted_on desc);
