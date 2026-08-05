import { describe, it, expect } from 'vitest'
import {
  generateActivationCode,
  normalizeActivationCode,
  hashActivationCode,
  verifyActivationCode,
  getCodeLast4,
  issueDeviceToken,
  verifyDeviceToken,
  hashIp,
} from '../server/lib/license'

describe('generateActivationCode', () => {
  it('generates codes with correct format NEO-XXXXXX-XXXXXX-XXXXXX-XXXXXX', () => {
    const code = generateActivationCode()
    expect(code).toMatch(/^NEO-[A-Z2-9]{6}-[A-Z2-9]{6}-[A-Z2-9]{6}-[A-Z2-9]{8}$/)
  })

  it('generates unique codes each call', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateActivationCode()))
    expect(codes.size).toBe(100)
  })

  it('generates codes using only allowed characters (no O, I, 0, 1, L)', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateActivationCode()
      const dataChars = code.replace(/NEO-|-/g, '')
      expect(dataChars).not.toMatch(/[OI01L]/)
    }
  })
})

describe('normalizeActivationCode', () => {
  it('normalizes to uppercase with dashes stripped', () => {
    expect(normalizeActivationCode('neo-abcdef-ghijkl-mnpqrs-tuvwxy12')).toBe('NEOABCDEFGHIJKLMNPQRSTUVWXY12')
  })

  it('handles extra whitespace', () => {
    expect(normalizeActivationCode('  NEO-ABCDEF  ')).toBe('NEOABCDEF')
  })
})

describe('hashActivationCode + verifyActivationCode', () => {
  it('verifies a correct code against its hash', () => {
    const raw = generateActivationCode()
    const normalized = normalizeActivationCode(raw)
    const hash = hashActivationCode(normalized)
    expect(verifyActivationCode(raw, hash)).toBe(true)
  })

  it('rejects an incorrect code', () => {
    const raw = generateActivationCode()
    const normalized = normalizeActivationCode(raw)
    const hash = hashActivationCode(normalized)
    expect(verifyActivationCode('NEO-WRONG-WRONG-WRONG-WRONG1234', hash)).toBe(false)
  })

  it('produces different hashes for different codes', () => {
    const c1 = normalizeActivationCode(generateActivationCode())
    const c2 = normalizeActivationCode(generateActivationCode())
    expect(hashActivationCode(c1)).not.toBe(hashActivationCode(c2))
  })
})

describe('getCodeLast4', () => {
  it('returns exactly 4 characters', () => {
    const normalized = normalizeActivationCode(generateActivationCode())
    expect(getCodeLast4(normalized)).toHaveLength(4)
  })

  it('returns the last 4 chars of the normalized code', () => {
    const normalized = 'NEOABCDEFGHI5678'
    expect(getCodeLast4(normalized)).toBe('5678')
  })
})

describe('issueDeviceToken + verifyDeviceToken', () => {
  const licenseId = '550e8400-e29b-41d4-a716-446655440000'
  const installationId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

  it('issues a verifiable JWT with correct claims', () => {
    const token = issueDeviceToken(licenseId, installationId)
    const payload = verifyDeviceToken(token)
    expect(payload).not.toBeNull()
    expect(payload!.sub).toBe(licenseId)
    expect(payload!.iid).toBe(installationId)
    expect(payload!.typ).toBe('device-license-v1')
  })

  it('returns null for a tampered token', () => {
    const token = issueDeviceToken(licenseId, installationId)
    const tampered = token.slice(0, -5) + 'XXXXX'
    expect(verifyDeviceToken(tampered)).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(verifyDeviceToken('')).toBeNull()
  })

  it('never includes email or activation code in payload', () => {
    const token = issueDeviceToken(licenseId, installationId)
    // Decode payload without verifying (base64)
    const parts = token.split('.')
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    expect(payload).not.toHaveProperty('email')
    expect(payload).not.toHaveProperty('activationCode')
    expect(payload).not.toHaveProperty('activation_code')
    expect(payload).not.toHaveProperty('phone')
  })
})

describe('hashIp', () => {
  it('returns a 64-char hex string (SHA-256)', () => {
    expect(hashIp('192.168.1.1')).toHaveLength(64)
  })

  it('is deterministic for the same IP', () => {
    expect(hashIp('1.2.3.4')).toBe(hashIp('1.2.3.4'))
  })

  it('produces different hashes for different IPs', () => {
    expect(hashIp('1.2.3.4')).not.toBe(hashIp('4.3.2.1'))
  })
})
