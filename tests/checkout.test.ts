import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../server/app'
import { supabase } from '../server/lib/supabase'
import * as cashfreeLib from '../server/lib/cashfree'

// Mock the cashfree lib so we don't need real credentials in tests
vi.mock('../server/lib/cashfree', async (importOriginal) => {
  const actual = await importOriginal<typeof cashfreeLib>()
  return {
    ...actual,
    createCashfreeOrder: vi.fn().mockResolvedValue({
      cfOrderId: 'cf_test123',
      paymentSessionId: 'session_test_abc',
      status: 'ACTIVE',
    }),
    CF_API_VERSION: '2023-08-01',
  }
})

describe('POST /api/checkout/create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a checkout session with valid email and phone', async () => {
    // Mock Supabase insert + select
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'order-uuid', cashfree_order_id: 'neo_test123' },
          error: null,
        }),
      }),
    })
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>)

    // The cashfree lib is already mocked at module level to return a valid session
    vi.mocked(cashfreeLib.createCashfreeOrder).mockResolvedValue({
      cfOrderId: 'cf_123',
      paymentSessionId: 'session_abc123',
      status: 'ACTIVE',
    })

    const res = await request(app)
      .post('/api/checkout/create')
      .send({
        email: 'test@example.com',
        phone: '+919876543210',
        productId: 'neo-browser-individual',
        agreedToTerms: true,
      })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('paymentSessionId')
    expect(res.body).toHaveProperty('orderId')
    // Ensure no secrets are returned
    expect(res.body).not.toHaveProperty('phone')
    expect(res.body).not.toHaveProperty('email')
    expect(res.body).not.toHaveProperty('cashfree_client_secret')
  })

  it('rejects an invalid email', async () => {
    const res = await request(app)
      .post('/api/checkout/create')
      .send({
        email: 'not-an-email',
        phone: '+919876543210',
        productId: 'neo-browser-individual',
        agreedToTerms: true,
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('VALIDATION_ERROR')
  })

  it('rejects a non-Indian phone number', async () => {
    const res = await request(app)
      .post('/api/checkout/create')
      .send({
        email: 'test@example.com',
        phone: '+1234567890',
        productId: 'neo-browser-individual',
        agreedToTerms: true,
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('VALIDATION_ERROR')
  })

  it('rejects when terms not agreed', async () => {
    const res = await request(app)
      .post('/api/checkout/create')
      .send({
        email: 'test@example.com',
        phone: '+919876543210',
        productId: 'neo-browser-individual',
        agreedToTerms: false,
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('VALIDATION_ERROR')
  })

  it('rejects an unknown product ID', async () => {
    const res = await request(app)
      .post('/api/checkout/create')
      .send({
        email: 'test@example.com',
        phone: '+919876543210',
        productId: 'fake-product',
        agreedToTerms: true,
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('INVALID_PRODUCT')
  })
})
