-- Migration 003: webhook_events table
-- Records every inbound webhook for idempotency and audit trail.
-- Before processing any webhook, the server checks this table.
-- Duplicate events are detected by idempotency_key and payload_hash.

create table if not exists public.webhook_events (
  id                uuid primary key default gen_random_uuid(),
  provider          text not null default 'cashfree',
  provider_event_id text,                        -- Cashfree event ID if provided
  idempotency_key   text unique,                 -- composite key used for dedup
  event_type        text,                        -- e.g. 'PAYMENT_SUCCESS_WEBHOOK'
  payload_hash      text not null,               -- SHA-256 of raw body for audit
  processing_status text not null,               -- 'PROCESSED' | 'FAILED' | 'SKIPPED'
  error_message     text,                        -- if processing_status = 'FAILED'
  processed_at      timestamptz,
  created_at        timestamptz not null default now(),

  constraint webhook_processing_status_check check (
    processing_status in ('PROCESSED','FAILED','SKIPPED')
  )
);

-- Indexes
create index if not exists webhook_events_idempotency_key_idx  on public.webhook_events (idempotency_key);
create index if not exists webhook_events_provider_event_id_idx on public.webhook_events (provider_event_id);
create index if not exists webhook_events_created_at_idx        on public.webhook_events (created_at desc);

-- Enable Row Level Security
alter table public.webhook_events enable row level security;

comment on table public.webhook_events is
  'Audit log of all inbound Cashfree webhooks. '
  'Used for idempotency — a webhook is only processed once per idempotency_key. '
  'Server access only via service-role key.';
