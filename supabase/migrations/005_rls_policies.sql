-- Migration 005: Row Level Security policies
-- All four tables have RLS enabled with NO permissive policies for anon or authenticated roles.
-- The Supabase service-role key bypasses RLS entirely, so server code
-- using the service-role client can read/write freely without policies.
--
-- DO NOT create anon SELECT/INSERT policies on these tables.
-- The public frontend MUST NOT query orders, licenses, webhook_events,
-- or license_activation_attempts using the anon key or any user JWT.
--
-- If you ever need a user-facing "my order status" feature, implement it
-- as a server-side API endpoint that uses the service-role client internally
-- and returns only the specific non-sensitive data the user is entitled to see.

-- ─── orders ──────────────────────────────────────────────────────────────────
-- No policies. Only service-role access.
-- Confirm RLS is enabled (idempotent):
do $$ begin
  if not exists (
    select 1 from pg_tables
    where tablename = 'orders' and rowsecurity = true
  ) then
    alter table public.orders enable row level security;
  end if;
end $$;

-- ─── licenses ─────────────────────────────────────────────────────────────────
do $$ begin
  if not exists (
    select 1 from pg_tables
    where tablename = 'licenses' and rowsecurity = true
  ) then
    alter table public.licenses enable row level security;
  end if;
end $$;

-- ─── webhook_events ───────────────────────────────────────────────────────────
do $$ begin
  if not exists (
    select 1 from pg_tables
    where tablename = 'webhook_events' and rowsecurity = true
  ) then
    alter table public.webhook_events enable row level security;
  end if;
end $$;

-- ─── license_activation_attempts ──────────────────────────────────────────────
do $$ begin
  if not exists (
    select 1 from pg_tables
    where tablename = 'license_activation_attempts' and rowsecurity = true
  ) then
    alter table public.license_activation_attempts enable row level security;
  end if;
end $$;

-- Intentionally no policies added.
-- This comment block serves as documentation that the absence of policies is deliberate.
--
-- To verify no public access exists, run in Supabase SQL editor:
--   select tablename, policyname, cmd, roles
--   from pg_policies
--   where tablename in ('orders','licenses','webhook_events','license_activation_attempts');
-- Expected result: 0 rows.
