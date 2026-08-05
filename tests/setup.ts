/**
 * Test setup — mocks Supabase, Cashfree SDK, and Resend to prevent
 * real network calls during tests.
 */
import { vi } from 'vitest'

// ─── Mock Supabase ────────────────────────────────────────────────────────────
// We mock the entire module so that both server/lib/supabase.ts AND routes
// share the same mock instance.

vi.mock('../server/lib/supabase', () => {
  const mockSupabase = {
    from: vi.fn(),
  }
  return { supabase: mockSupabase }
})

// ─── Mock Cashfree SDK (v6 class-based API) ───────────────────────────────────

vi.mock('cashfree-pg', () => {
  const CFEnvironment = { SANDBOX: 1, PRODUCTION: 2 }

  // v6: Cashfree is a class; PGCreateOrder etc. are instance methods
  function Cashfree(_env: number, _clientId: string, _secret: string) {
    return {
      PGCreateOrder: vi.fn().mockResolvedValue({
        data: {
          cf_order_id: 'cf_test123',
          payment_session_id: 'session_test_abc',
          order_status: 'ACTIVE',
        },
        status: 200,
      }),
      PGVerifyWebhookSignature: vi.fn().mockReturnValue(true),
      PGOrderFetchPayments: vi.fn().mockResolvedValue({ data: [], status: 200 }),
    }
  }
  Cashfree.prototype = {}

  return { Cashfree, CFEnvironment }
})

// ─── Mock Resend ──────────────────────────────────────────────────────────────
// Use a proper class constructor so `new Resend(apiKey)` works

vi.mock('resend', () => {
  const mockSend = vi.fn().mockResolvedValue({ data: { id: 'test-email-id' }, error: null })
  function Resend(_apiKey: string) {
    return {
      emails: { send: mockSend },
    }
  }
  Resend.prototype = {}
  return { Resend }
})

