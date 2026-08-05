/**
 * Desktop License Client Test Suite
 *
 * Tests the Electron desktop app license client module:
 * - Activation code normalization & email masking
 * - InstallationId generation & persistence
 * - License activation, validation, and deactivation HTTP flows
 * - Offline grace period calculations
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Import licenseModule CommonJS export directly
const licenseModule = require('../src/desktop/licenseModule.cjs')

describe('Desktop License Client Module', () => {
  const tmpDir = path.join(os.tmpdir(), 'neo-browser-test-' + Math.random().toString(36).substring(2, 9))

  beforeEach(() => {
    process.env.APPDATA = tmpDir
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }
    licenseModule.clearLicenseData()
  })

  afterEach(() => {
    licenseModule.clearLicenseData()
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    } catch (e) {}
    vi.restoreAllMocks()
  })

  describe('normalizeActivationCode', () => {
    it('normalizes activation code by trimming, uppercasing, and removing hyphens', () => {
      const input = '  neo-ab12-cd34-ef56-7890-gh12-ij34  '
      const normalized = licenseModule.normalizeActivationCode(input)
      expect(normalized).toBe('NEOAB12CD34EF567890GH12IJ34')
    })

    it('returns empty string for invalid non-string inputs', () => {
      expect(licenseModule.normalizeActivationCode(null)).toBe('')
      expect(licenseModule.normalizeActivationCode(123)).toBe('')
    })
  })

  describe('maskEmail', () => {
    it('masks purchaser email correctly for privacy', () => {
      expect(licenseModule.maskEmail('buyer@example.com')).toBe('b***r@example.com')
      expect(licenseModule.maskEmail('a@b.com')).toBe('a***@b.com')
      expect(licenseModule.maskEmail('invalid-email')).toBe('***@***.com')
    })
  })

  describe('getInstallationId', () => {
    it('generates a valid UUIDv4 on first run and persists it', () => {
      const id1 = licenseModule.getInstallationId()
      expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)

      const id2 = licenseModule.getInstallationId()
      expect(id2).toBe(id1)
    })
  })

  describe('Offline Grace Period Calculations', () => {
    it('allows startup within 7-day grace period when offline', async () => {
      const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000)
      licenseModule.saveLicenseState({
        licenseToken: 'mock-valid-token',
        lastValidatedAt: fiveDaysAgo
      })

      // Simulate network error during validation
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'))

      const result = await licenseModule.validateLicense()
      expect(result.valid).toBe(true)
      expect(result.isOfflineGrace).toBe(true)
      expect(result.remainingDays).toBeGreaterThan(0)
    })

    it('rejects startup if offline grace period has expired (after 7 days)', async () => {
      const tenDaysAgo = Date.now() - (10 * 24 * 60 * 60 * 1000)
      licenseModule.saveLicenseState({
        licenseToken: 'mock-valid-token',
        lastValidatedAt: tenDaysAgo
      })

      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'))

      const result = await licenseModule.validateLicense()
      expect(result.valid).toBe(false)
      expect(result.reason).toBe('OFFLINE_EXPIRED')
    })
  })

  describe('License Deactivation', () => {
    it('clears stored license data upon deactivation', async () => {
      licenseModule.saveLicenseState({
        licenseToken: 'mock-valid-token',
        purchaseEmail: 'user@example.com',
        lastValidatedAt: Date.now()
      })

      const infoBefore = licenseModule.getLicenseInfo()
      expect(infoBefore.isActivated).toBe(true)

      await licenseModule.deactivateLicense()

      const infoAfter = licenseModule.getLicenseInfo()
      expect(infoAfter.isActivated).toBe(false)
      expect(infoAfter.purchaseEmail).toBeNull()
    })
  })
})
