-- ============================================================
-- NEO-BROWSER FULL SCHEMA MIGRATION
-- Paste this entire script into Supabase SQL Editor and click Run
-- URL: https://supabase.com/dashboard/project/gwzxlqrzaxztwpvjoowv/sql/new
-- ============================================================

create extension if not exists "pgcrypto";

-- Helper: auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── ORDERS ────────────────────────────────────────────────────
create table if not exists public.orders (
  id                      uuid primary key default gen_random_uuid(),
  cashfree_order_id       text unique not null,
  cashfree_cf_order_id    text unique,
  customer_email          text not null,
  customer_phone          text,
  product_id              text not null default 'neo-browser-individual',
  amount                  numeric(10,2) not null,
  currency                text not null default 'INR',
  payment_status          text not null default 'PENDING',
  cashfree_payment_status text,
  payment_reference       text,
  paid_at                 timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint orders_payment_status_check check (
    payment_status in ('PENDING','PAID','FAILED','CANCELLED','REFUNDED')
  )
);
create index if not exists orders_cashfree_order_id_idx on public.orders (cashfree_order_id);
create index if not exists orders_customer_email_idx    on public.orders (customer_email);
create index if not exists orders_payment_status_idx    on public.orders (payment_status);
create index if not exists orders_created_at_idx        on public.orders (created_at desc);
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'orders_set_updated_at') then
    create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();
  end if;
end $$;
alter table public.orders enable row level security;

-- ── LICENSES ──────────────────────────────────────────────────
create table if not exists public.licenses (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid unique not null references public.orders(id) on delete restrict,
  purchase_email        text not null,
  activation_code_hash  text unique not null,
  activation_code_last4 text not null,
  activation_status     text not null default 'UNACTIVATED',
  installation_id       text unique,
  platform              text,
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
create index if not exists licenses_order_id_idx          on public.licenses (order_id);
create index if not exists licenses_purchase_email_idx    on public.licenses (purchase_email);
create index if not exists licenses_installation_id_idx   on public.licenses (installation_id);
create index if not exists licenses_activation_status_idx on public.licenses (activation_status);
create index if not exists licenses_created_at_idx        on public.licenses (created_at desc);
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'licenses_set_updated_at') then
    create trigger licenses_set_updated_at before update on public.licenses for each row execute function public.set_updated_at();
  end if;
end $$;
alter table public.licenses enable row level security;

-- ── WEBHOOK EVENTS ─────────────────────────────────────────────
create table if not exists public.webhook_events (
  id                uuid primary key default gen_random_uuid(),
  provider          text not null default 'cashfree',
  provider_event_id text,
  idempotency_key   text unique,
  event_type        text,
  payload_hash      text not null,
  processing_status text not null,
  error_message     text,
  processed_at      timestamptz,
  created_at        timestamptz not null default now(),
  constraint webhook_processing_status_check check (
    processing_status in ('PROCESSED','FAILED','SKIPPED')
  )
);
create index if not exists webhook_events_idempotency_key_idx   on public.webhook_events (idempotency_key);
create index if not exists webhook_events_provider_event_id_idx on public.webhook_events (provider_event_id);
create index if not exists webhook_events_created_at_idx        on public.webhook_events (created_at desc);
alter table public.webhook_events enable row level security;

-- ── ACTIVATION ATTEMPTS ────────────────────────────────────────
create table if not exists public.license_activation_attempts (
  id              uuid primary key default gen_random_uuid(),
  license_id      uuid references public.licenses(id) on delete set null,
  attempted_email text,
  installation_id text,
  ip_hash         text,
  result          text not null,
  created_at      timestamptz not null default now(),
  constraint attempt_result_check check (
    result in ('SUCCESS','INVALID_CODE','WRONG_EMAIL','ALREADY_ACTIVATED','REVOKED','RATE_LIMITED','ERROR')
  )
);
create index if not exists activation_attempts_license_id_idx on public.license_activation_attempts (license_id);
create index if not exists activation_attempts_ip_hash_idx    on public.license_activation_attempts (ip_hash);
create index if not exists activation_attempts_created_at_idx on public.license_activation_attempts (created_at desc);
alter table public.license_activation_attempts enable row level security;

-- ── Verify no public access policies (intentional) ────────────
-- Service-role key bypasses RLS entirely.
-- Run this to confirm zero policies: 
-- select tablename, policyname from pg_policies where tablename in ('orders','licenses','webhook_events','license_activation_attempts');

select 
  tablename,
  case when rowsecurity then 'RLS ENABLED' else 'RLS DISABLED (FIX!)' end as rls_status
from pg_tables
where schemaname = 'public'
and tablename in ('orders','licenses','webhook_events','license_activation_attempts')
order by tablename;
