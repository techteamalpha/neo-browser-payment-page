import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['server/**/*.ts'],
      exclude: ['server/index.ts', 'api/**'],
    },
    env: {
      NODE_ENV: 'test',
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      CASHFREE_CLIENT_ID: 'test-client-id',
      CASHFREE_CLIENT_SECRET: 'test-client-secret',
      CASHFREE_ENVIRONMENT: 'sandbox',
      CASHFREE_API_VERSION: '2023-08-01',
      CASHFREE_WEBHOOK_SECRET: 'test-webhook-secret',
      LICENSE_TOKEN_SECRET: 'test-license-token-secret-minimum-32-chars!!',
      ACTIVATION_CODE_SECRET: 'test-activation-code-secret-minimum-32-chars!!',
      LICENSE_TOKEN_EXPIRY_DAYS: '7',
      RESEND_API_KEY: 're_test_key',
      EMAIL_FROM: 'test@example.com',
      SUPPORT_EMAIL: 'support@example.com',
      NEO_BROWSER_PRICE_INR: '299',
      NEO_BROWSER_PRODUCT_ID: 'neo-browser-individual',
      VITE_APP_URL: 'http://localhost:5173',
      PORT: '3001',
    },
  },
})
