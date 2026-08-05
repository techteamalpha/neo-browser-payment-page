-- Migration 002: licenses table
-- One license is created per paid order, containing the hashed activation code.
-- The raw activation code is NEVER stored — only the HMAC-SHA256 hash.
-- Server access only via service-role key.

create table if not exists public.licenses (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid unique not null references public.orders(id) on delete restrict,
  purchase_email        text not null,
  activation_code_hash  text unique not null, -- HMAC-SHA256(ACTIVATION_CODE_SECRET, normalized_code)
  activation_code_last4 text not null,         -- last 4 chars only, for support display
  activation_status     text not null default 'UNACTIVATED',
  installation_id       text unique,            -- bound on first activation; null until activated
  platform              text,                   -- 'win32' | 'darwin' | 'linux'
  app_version           text,
  activated_at          timestamptz,
  last_validated_at     timestamptz,
  deactivated_at        timestamptz,
  revoked_at            timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint licenses_activation_status_check check (
    activation_status in ('UNACTIVATED','ACTIVE','DEACTIVATED','REVOKED','EXPIRED')
  )
);

-- Indexes
create index if not exists licenses_order_id_idx           on public.licenses (order_id);
create index if not exists licenses_purchase_email_idx     on public.licenses (purchase_email);
create index if not exists licenses_installation_id_idx    on public.licenses (installation_id);
create index if not exists licenses_activation_status_idx  on public.licenses (activation_status);
create index if not exists licenses_created_at_idx         on public.licenses (created_at desc);

-- updated_at trigger
create trigger licenses_set_updated_at
  before update on public.licenses
  for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.licenses enable row level security;

comment on table public.licenses is
  'One license per paid order. Stores hashed activation code only — raw code is never persisted. '
  'All access is server-side only via service-role key. '
  'The service-role key must never be exposed to the browser.';

comment on column public.licenses.activation_code_hash is
  'HMAC-SHA256 of the normalized (uppercased, dashes stripped) activation code. '
  'Raw activation code is sent once via email and is not recoverable from this column.';
