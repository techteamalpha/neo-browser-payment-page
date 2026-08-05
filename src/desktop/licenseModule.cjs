/**
 * Neo Browser Desktop License Client Module (CommonJS)
 *
 * Handles:
 * 1. Persistent storage of random UUID installationId and licenseToken in app userData/license.json
 * 2. HTTP communications with LICENSE_API_BASE_URL (/api/licenses/activate, /validate, /deactivate)
 * 3. Activation code normalization (NEO-XXXXX... -> NEOXXXXX...)
 * 4. Offline grace period calculations (LICENSE_OFFLINE_GRACE_DAYS)
 * 5. IPC registration for Activation UI & Settings modal
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const https = require('https');

let electronModule = null;
try {
    electronModule = require('electron');
} catch (e) {}

const app = electronModule ? electronModule.app : null;
const ipcMain = electronModule ? electronModule.ipcMain : null;

// ─── Environment & Config ────────────────────────────────────────────────────

function getLicenseApiBaseUrl() {
    return process.env.LICENSE_API_BASE_URL || 'http://localhost:3001';
}

function getOfflineGraceDays() {
    const days = parseInt(process.env.LICENSE_OFFLINE_GRACE_DAYS, 10);
    return isNaN(days) ? 7 : days;
}

// ─── Persistent Storage ─────────────────────────────────────────────────────

function getStorePath() {
    const userData = app ? app.getPath('userData') : path.join(process.env.APPDATA || process.cwd(), 'Neo Browser');
    if (!fs.existsSync(userData)) {
        try { fs.mkdirSync(userData, { recursive: true }); } catch (e) {}
    }
    return path.join(userData, 'license.json');
}

function loadLicenseState() {
    try {
        const file = getStorePath();
        if (fs.existsSync(file)) {
            const raw = fs.readFileSync(file, 'utf8');
            return JSON.parse(raw);
        }
    } catch (e) {}
    return {};
}

function saveLicenseState(state) {
    try {
        const file = getStorePath();
        const existing = loadLicenseState();
        const updated = { ...existing, ...state };
        fs.writeFileSync(file, JSON.stringify(updated, null, 2), 'utf8');
        return updated;
    } catch (e) {
        return state;
    }
}

function getInstallationId() {
    let state = loadLicenseState();
    if (!state.installationId) {
        state.installationId = crypto.randomUUID();
        saveLicenseState(state);
    }
    return state.installationId;
}

function clearLicenseData() {
    let state = loadLicenseState();
    const instId = state.installationId || crypto.randomUUID();
    const newState = { installationId: instId };
    try {
        fs.writeFileSync(getStorePath(), JSON.stringify(newState, null, 2), 'utf8');
    } catch (e) {}
    return newState;
}

// ─── Activation Code Normalization ──────────────────────────────────────────

function normalizeActivationCode(code) {
    if (typeof code !== 'string') return '';
    return code.trim().toUpperCase().replace(/-/g, '');
}

// ─── Mask Email Helper ───────────────────────────────────────────────────────

function maskEmail(email) {
    if (!email || typeof email !== 'string' || !email.includes('@')) return '***@***.com';
    const [local, domain] = email.split('@');
    if (local.length <= 2) {
        return `${local[0] || '*'}***@${domain}`;
    }
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

// ─── HTTP Request Helper ────────────────────────────────────────────────────

function makeApiRequest(endpoint, bodyData) {
    return new Promise((resolve, reject) => {
        const baseUrl = getLicenseApiBaseUrl().replace(/\/$/, '');
        const targetUrl = new URL(baseUrl + endpoint);

        const payload = JSON.stringify(bodyData);
        const transport = targetUrl.protocol === 'https:' ? https : http;

        const req = transport.request(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 10000
        }, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(body); } catch (e) {}
                resolve({ statusCode: res.statusCode, data: parsed || {} });
            });
        });

        req.on('error', (err) => {
            reject({ networkError: true, error: err.message });
        });

        req.on('timeout', () => {
            req.destroy();
            reject({ networkError: true, error: 'Request timeout' });
        });

        req.write(payload);
        req.end();
    });
}

// ─── Core API Methods ────────────────────────────────────────────────────────

async function activateLicense({ email, activationCode }) {
    if (!email || !activationCode) {
        return { success: false, error: 'VALIDATION_ERROR', message: 'Email and activation code are required.' };
    }

    const installationId = getInstallationId();
    const appVersion = 'Neo_Browser_v2.0.7';
    const platform = process.platform || 'win32';

    try {
        const res = await makeApiRequest('/api/licenses/activate', {
            email: email.trim().toLowerCase(),
            activationCode: activationCode.trim(),
            installationId,
            platform,
            appVersion
        });

        if (res.statusCode === 200 && (res.data.licenseToken || res.data.status === 'ACTIVATED' || res.data.status === 'ALREADY_ACTIVE')) {
            saveLicenseState({
                licenseToken: res.data.licenseToken,
                licenseId: res.data.licenseId || 'license-id',
                purchaseEmail: email.trim().toLowerCase(),
                lastValidatedAt: Date.now(),
                activatedAt: Date.now()
            });
            return { success: true, message: 'Neo Browser is activated on this device.' };
        }

        if (res.statusCode === 409 || (res.data && res.data.error === 'ALREADY_ACTIVATED')) {
            return {
                success: false,
                error: 'ALREADY_ACTIVATED',
                message: 'This activation code is already in use on a different device.'
            };
        }

        return {
            success: false,
            error: 'ACTIVATION_FAILED',
            message: 'The email or activation code is invalid.'
        };
    } catch (err) {
        return {
            success: false,
            error: 'NETWORK_ERROR',
            message: 'We couldn’t reach the license server. Check your connection and try again.'
        };
    }
}

async function validateLicense() {
    const state = loadLicenseState();
    if (!state.licenseToken) {
        return { valid: false, reason: 'NO_TOKEN', message: 'Activation required.' };
    }

    const installationId = getInstallationId();
    const appVersion = 'Neo_Browser_v2.0.7';

    try {
        const res = await makeApiRequest('/api/licenses/validate', {
            licenseToken: state.licenseToken,
            installationId,
            appVersion
        });

        if (res.statusCode === 200 && res.data.valid) {
            saveLicenseState({
                licenseToken: res.data.licenseToken || state.licenseToken,
                lastValidatedAt: Date.now()
            });
            return { valid: true, isOfflineGrace: false };
        }

        // Token invalid, expired, or license revoked
        clearLicenseData();
        return { valid: false, reason: 'REVOKED', message: 'This license is not active. Please contact support.' };
    } catch (err) {
        // Network error -> Calculate offline grace period
        const graceDays = getOfflineGraceDays();
        const graceMs = graceDays * 24 * 60 * 60 * 1000;
        const lastValidated = state.lastValidatedAt || 0;
        const elapsed = Date.now() - lastValidated;

        if (lastValidated > 0 && elapsed <= graceMs) {
            const remainingDays = Math.ceil((graceMs - elapsed) / (24 * 60 * 60 * 1000));
            return {
                valid: true,
                isOfflineGrace: true,
                remainingDays,
                message: `Offline mode: ${remainingDays} day(s) remaining in grace period.`
            };
        }

        return {
            valid: false,
            reason: 'OFFLINE_EXPIRED',
            message: 'License verification required. Please check your internet connection.'
        };
    }
}

async function deactivateLicense() {
    const state = loadLicenseState();
    const installationId = getInstallationId();

    if (state.licenseToken) {
        try {
            await makeApiRequest('/api/licenses/deactivate', {
                licenseToken: state.licenseToken,
                installationId
            });
        } catch (e) {}
    }

    clearLicenseData();
    return { success: true, message: 'Device deactivated successfully.' };
}

function getLicenseInfo() {
    const state = loadLicenseState();
    const isActivated = !!state.licenseToken;
    return {
        isActivated,
        purchaseEmail: state.purchaseEmail ? maskEmail(state.purchaseEmail) : null,
        platform: process.platform || 'win32',
        appVersion: 'Neo_Browser_v2.0.7',
        lastValidatedAt: state.lastValidatedAt ? new Date(state.lastValidatedAt).toISOString() : null,
        installationId: state.installationId || getInstallationId()
    };
}

// ─── Register IPC Handlers ──────────────────────────────────────────────────

function setupLicenseIpc() {
    if (!ipcMain) return;

    ipcMain.handle('license-activate', async (event, data) => {
        return await activateLicense(data || {});
    });

    ipcMain.handle('license-validate', async () => {
        return await validateLicense();
    });

    ipcMain.handle('license-deactivate', async () => {
        return await deactivateLicense();
    });

    ipcMain.handle('license-get-info', async () => {
        return getLicenseInfo();
    });
}

module.exports = {
    getInstallationId,
    loadLicenseState,
    saveLicenseState,
    clearLicenseData,
    normalizeActivationCode,
    maskEmail,
    activateLicense,
    validateLicense,
    deactivateLicense,
    getLicenseInfo,
    setupLicenseIpc
};
