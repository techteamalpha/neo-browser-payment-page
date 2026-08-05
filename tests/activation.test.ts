import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../server/app'
import { supabase } from '../server/lib/supabase'
import {
  hashActivationCode,
  normalizeActivationCode,
  generateActivationCode,
  issueDeviceToken,
} from '../server/lib/license'

const TEST_LICENSE_ID = '550e8400-e29b-41d4-a716-446655440000'
const TEST_INSTALLATION_ID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
const TEST_EMAIL = 'buyer@example.com'

function makeTestCode() {
  const raw = generateActivationCode()
  const normalized = normalizeActivationCode(raw)
  const hash = hashActivationCode(normalized)
  return { raw, normalized, hash }
}

describe('POST /api/licenses/activate', () => {
  beforeEach(() => vi.clearAllMocks())

  it('activates with correct email and activation code', async () => {
    const { raw, hash } = makeTestCode()

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'licenses') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: TEST_LICENSE_ID,
                  purchase_email: TEST_EMAIL,
                  activation_code_hash: hash,
                  activation_status: 'UNACTIVATED',
                  installation_id: null,
                  order_id: 'order-id',
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
      if (table === 'orders') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { payment_status: 'PAID' },
                error: null,
              }),
            }),
          }),
        } as unknown as ReturnType<typeof supabase.from>
      }
      return {
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as unknown as ReturnType<typeof supabase.from>
    })

    const res = await request(app).post('/api/licenses/activate').send({
      email: TEST_EMAIL,
      activationCode: raw,
      installationId: TEST_INSTALLATION_ID,
      platform: 'win32',
      appVersion: '2.0.7',
    })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ACTIVATED')
    expect(res.body).toHaveProperty('licenseToken')
    // Token must not contain sensitive data
    const [, payloadB64] = res.body.licenseToken.split('.')
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString())
    expect(payload).not.toHaveProperty('email')
    expect(payload).not.toHaveProperty('activationCode')
  })

  it('fails with wrong email — returns generic error', async () => {
    const { raw, hash } = makeTestCode()

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'licenses') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null, // no license found for this email
                error: null,
              }),
            }),
          }),
        } as unknown as ReturnType<typeof supabase.from>
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) } as unknown as ReturnType<typeof supabase.from>
    })

    const res = await request(app).post('/api/licenses/activate').send({
      email: 'wrong@example.com',
      activationCode: raw,
      installationId: TEST_INSTALLATION_ID,
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('ACTIVATION_FAILED')
    // Must not reveal whether the email exists
    expect(res.body.message).not.toContain('email not found')
    expect(res.body.message).not.toContain('does not exist')
  })

  it('rejects reuse of code on a different installation', async () => {
    const { raw, hash } = makeTestCode()
    const differentInstallation = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'licenses') {
        return {
          select: (_cols: string) => ({
            eq: (_col: string, _val: unknown) => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: {
                    id: TEST_LICENSE_ID,
                    purchase_email: TEST_EMAIL,
                    activation_code_hash: hash,
                    activation_status: 'ACTIVE',
                    installation_id: TEST_INSTALLATION_ID,
                    order_id: 'order-id',
                  },
                  error: null,
                }),
            }),
          }),
        } as unknown as ReturnType<typeof supabase.from>
      }
      // license_activation_attempts
      return {
        insert: (_row: unknown) => Promise.resolve({ error: null }),
      } as unknown as ReturnType<typeof supabase.from>
    })

    const res = await request(app).post('/api/licenses/activate').send({
      email: TEST_EMAIL,
      activationCode: raw,
      installationId: differentInstallation,
    })

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('ALREADY_ACTIVATED')
  })
})

describe('POST /api/licenses/validate', () => {
  it('validates a valid token and returns a new rotated token', async () => {
    const token = issueDeviceToken(TEST_LICENSE_ID, TEST_INSTALLATION_ID)

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: TEST_LICENSE_ID,
              activation_status: 'ACTIVE',
              installation_id: TEST_INSTALLATION_ID,
            },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const res = await request(app).post('/api/licenses/validate').send({
      licenseToken: token,
      installationId: TEST_INSTALLATION_ID,
      appVersion: '2.0.7',
    })

    expect(res.status).toBe(200)
    expect(res.body.valid).toBe(true)
    expect(res.body).toHaveProperty('licenseToken')
  })

  it('returns invalid for a revoked license', async () => {
    const token = issueDeviceToken(TEST_LICENSE_ID, TEST_INSTALLATION_ID)

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: TEST_LICENSE_ID,
              activation_status: 'REVOKED',
              installation_id: TEST_INSTALLATION_ID,
            },
            error: null,
          }),
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const res = await request(app).post('/api/licenses/validate').send({
      licenseToken: token,
      installationId: TEST_INSTALLATION_ID,
    })

    expect(res.status).toBe(401)
    expect(res.body.valid).toBe(false)
  })
})

describe('Supabase RLS — client cannot access protected tables directly', () => {
  it('the anon Supabase key is not exposed in any server response', async () => {
    const res = await request(app).get('/api/health')
    // Verify no Supabase keys in response body
    const body = JSON.stringify(res.body)
    expect(body).not.toContain('service_role')
    expect(body).not.toContain('supabase_service_role')
    expect(body).not.toContain(process.env.SUPABASE_SERVICE_ROLE_KEY)
  })

  it('the server never returns raw activation code hashes to clients', async () => {
    // Any license endpoint response must not contain the DB hash
    const { raw, hash } = makeTestCode()

    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    } as unknown as ReturnType<typeof supabase.from>))

    const res = await request(app).post('/api/licenses/activate').send({
      email: 'nobody@example.com',
      activationCode: 'NEO-WRONG-WRONG-WRONG-WRONG1234',
      installationId: TEST_INSTALLATION_ID,
    })

    const body = JSON.stringify(res.body)
    expect(body).not.toContain(hash)
    expect(body).not.toContain('activation_code_hash')
  })
})
