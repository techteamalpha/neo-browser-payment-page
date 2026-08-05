-- Migration 001: orders table
-- Stores every checkout attempt and tracks payment lifecycle.
-- Access is server-only via service-role key — RLS blocks all anon/authenticated access.

create extension if not exists "pgcrypto";

-- Helper: auto-update updated_at on any row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.orders (
  id                      uuid primary key default gen_random_uuid(),
  cashfree_order_id       text unique not null,       -- e.g. neo_<uuid>
  cashfree_cf_order_id    text unique,                 -- Cashfree's internal CF order ID
  customer_email          text not null,
  customer_phone          text,                        -- E.164 format, stored if collected
  product_id              text not null default 'neo-browser-individual',
  amount                  numeric(10,2) not null,
  currency                text not null default 'INR',
  payment_status          text not null default 'PENDING',
  cashfree_payment_status text,                        -- raw status from Cashfree API
  payment_reference       text,                        -- Cashfree payment/transaction ID
  paid_at                 timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  constraint orders_payment_status_check check (
    payment_status in ('PENDING','PAID','FAILED','CANCELLED','REFUNDED')
  )
);

-- Indexes
create index if not exists orders_cashfree_order_id_idx    on public.orders (cashfree_order_id);
create index if not exists orders_customer_email_idx       on public.orders (customer_email);
create index if not exists orders_payment_status_idx       on public.orders (payment_status);
create index if not exists orders_created_at_idx           on public.orders (created_at desc);

-- updated_at trigger
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Enable Row Level Security
-- IMPORTANT: No anon or authenticated policies are created.
-- All access goes through the service-role key used exclusively in server code.
-- The service-role bypasses RLS, so these policies are defensive defaults.
alter table public.orders enable row level security;

comment on table public.orders is
  'Payment orders. All access is server-side only via service-role key. '
  'No public policies intentionally. The service-role key must never be exposed to the browser.';
