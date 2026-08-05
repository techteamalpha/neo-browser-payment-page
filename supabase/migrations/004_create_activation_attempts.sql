-- Migration 004: license_activation_attempts table
-- Records every activation attempt for rate limiting, abuse detection, and audit.
-- IP addresses are stored as hashes (SHA-256) to protect user privacy.

create table if not exists public.license_activation_attempts (
  id              uuid primary key default gen_random_uuid(),
  license_id      uuid references public.licenses(id) on delete set null,
  attempted_email text,                         -- normalized email submitted
  installation_id text,                          -- installation ID submitted
  ip_hash         text,                          -- SHA-256 of IP — not raw IP
  result          text not null,                 -- 'SUCCESS' | 'INVALID_CODE' | 'WRONG_EMAIL' | 'ALREADY_ACTIVATED' | 'REVOKED' | 'RATE_LIMITED' | 'ERROR'
  created_at      timestamptz not null default now(),

  constraint attempt_result_check check (
    result in ('SUCCESS','INVALID_CODE','WRONG_EMAIL','ALREADY_ACTIVATED','REVOKED','RATE_LIMITED','ERROR')
  )
);

-- Indexes
create index if not exists activation_attempts_license_id_idx  on public.license_activation_attempts (license_id);
create index if not exists activation_attempts_ip_hash_idx     on public.license_activation_attempts (ip_hash);
create index if not exists activation_attempts_created_at_idx  on public.license_activation_attempts (created_at desc);

-- Enable Row Level Security
alter table public.license_activation_attempts enable row level security;

comment on table public.license_activation_attempts is
  'Audit log of all activation attempts. '
  'IPs are stored as SHA-256 hashes — raw IPs are never persisted. '
  'Server access only via service-role key.';

comment on column public.license_activation_attempts.ip_hash is
  'SHA-256 hash of the client IP address. The raw IP is never stored.';
