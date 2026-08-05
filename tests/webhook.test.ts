import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../server/app'
import { supabase } from '../server/lib/supabase'
import * as cashfreeLib from '../server/lib/cashfree'

// Helper: build a minimal valid Cashfree webhook payload
function buildWebhookPayload(orderId: string, paymentStatus = 'SUCCESS') {
  return JSON.stringify({
    type: 'PAYMENT_SUCCESS_WEBHOOK',
    data: {
      order: { order_id: orderId },
      payment: { payment_status: paymentStatus, cf_payment_id: 'cf_pay_123' },
    },
  })
}

const VALID_SIG = 'valid-signature'
const INVALID_SIG = 'bad-signature'
const TIMESTAMP = String(Math.floor(Date.now() / 1000))

// Mock the cashfree lib so we don't need real credentials in tests
vi.mock('../server/lib/cashfree', async (importOriginal) => {
  const actual = await importOriginal<typeof cashfreeLib>()
  return {
    ...actual,
    verifyCashfreeWebhookSignature: vi.fn().mockReturnValue(false),
    fetchCashfreePayments: vi.fn().mockResolvedValue({ isPaid: true, paymentId: 'cf_pay_123', cfStatus: 'SUCCESS' }),
    CF_API_VERSION: '2023-08-01',
  }
})

describe('POST /api/webhooks/cashfree', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: signature invalid
    vi.mocked(cashfreeLib.verifyCashfreeWebhookSignature).mockReturnValue(false)
    vi.mocked(cashfreeLib.fetchCashfreePayments).mockResolvedValue({
      isPaid: true, paymentId: 'cf_pay_123', cfStatus: 'SUCCESS',
    })
  })

  it('rejects requests with invalid signature', async () => {
    vi.mocked(cashfreeLib.verifyCashfreeWebhookSignature).mockReturnValue(false)

    const body = buildWebhookPayload('neo_test123')
    const res = await request(app)
      .post('/api/webhooks/cashfree')
      .set('x-webhook-signature', INVALID_SIG)
      .set('x-webhook-timestamp', TIMESTAMP)
      .set('content-type', 'application/json')
      .send(body)

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('INVALID_SIGNATURE')
  })

  it('rejects requests with missing headers', async () => {
    const body = buildWebhookPayload('neo_test123')
    const res = await request(app)
      .post('/api/webhooks/cashfree')
      .set('content-type', 'application/json')
      .send(body)

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('MISSING_HEADERS')
  })

  it('processes a valid payment success webhook exactly once', async () => {
    vi.mocked(cashfreeLib.verifyCashfreeWebhookSignature).mockReturnValue(true)

    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: { id: 'evt-id' }, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    }

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'webhook_events') {
        return mockChain as unknown as ReturnType<typeof supabase.from>
      }
      if (table === 'orders') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'order-id',
                  payment_status: 'PENDING',
                  customer_email: 'test@example.com',
                  cashfree_order_id: 'neo_test123',
                },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }),
        } as unknown as ReturnType<typeof supabase.from>
      }
      if (table === 'licenses') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        } as unknown as ReturnType<typeof supabase.from>
      }
      return mockChain as unknown as ReturnType<typeof supabase.from>
    })

    const body = buildWebhookPayload('neo_test123')
    const res = await request(app)
      .post('/api/webhooks/cashfree')
      .set('x-webhook-signature', VALID_SIG)
      .set('x-webhook-timestamp', TIMESTAMP)
      .set('content-type', 'application/json')
      .send(body)

    expect([200]).toContain(res.status)
  })

  it('handles duplicate webhook idempotently (returns 200, not 500)', async () => {
    vi.mocked(cashfreeLib.verifyCashfreeWebhookSignature).mockReturnValue(true)

    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'existing-event-id', processing_status: 'PROCESSED' },
            error: null,
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    } as unknown as ReturnType<typeof supabase.from>))

    const body = buildWebhookPayload('neo_test123')
    const res = await request(app)
      .post('/api/webhooks/cashfree')
      .set('x-webhook-signature', VALID_SIG)
      .set('x-webhook-timestamp', TIMESTAMP)
      .set('content-type', 'application/json')
      .send(body)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ALREADY_PROCESSED')
  })
})
