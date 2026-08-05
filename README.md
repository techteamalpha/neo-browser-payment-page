# Neo-Browser Landing Page

Vite + React + TypeScript marketing site for Neo-Browser, with a production-ready payment backend.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vite 8 · React 19 · TypeScript · Tailwind CSS |
| API server | Node.js · Express 5 (serverless on Vercel) |
| Database | Supabase (PostgreSQL + RLS) |
| Payments | Cashfree Payment Gateway |
| Email | Resend |
| License tokens | JWT (HS256) |
| Deployment | Vercel |

---

## Local development

### 1. Clone and install

```bash
git clone <your-repo>
cd neo-browser-ship
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all values. See `.env.example` for descriptions.

**Never commit `.env` or `.env.local`.**

### 3. Set up Supabase

1. Create a Supabase project at https://supabase.com
2. Open the SQL editor and run each migration in order:
   ```sql
   -- Run these in Supabase SQL Editor, in order:
   -- supabase/migrations/001_create_orders.sql
   -- supabase/migrations/002_create_licenses.sql
   -- supabase/migrations/003_create_webhook_events.sql
   -- supabase/migrations/004_create_activation_attempts.sql
   -- supabase/migrations/005_rls_policies.sql
   ```
3. Copy your **Project URL** and **service-role key** (from Project Settings → API) into `.env.local`

> ⚠️ The service-role key bypasses Row Level Security. It must stay in server environment variables only.

### 4. Cashfree sandbox credentials

1. Sign up at https://merchant.cashfree.com
2. Switch to **Sandbox** mode
3. Get your App ID and Secret Key from Payments → Gateway → API Keys
4. Set in `.env.local`:
   ```
   CASHFREE_ENVIRONMENT=sandbox
   CASHFREE_CLIENT_ID=your-sandbox-app-id
   CASHFREE_CLIENT_SECRET=your-sandbox-secret-key
   CASHFREE_API_VERSION=2023-08-01
   ```

### 5. Resend setup

1. Sign up at https://resend.com
2. **Verify your sending domain** (critical — Gmail addresses cannot be used as FROM without domain verification)
3. Create an API key
4. Set in `.env.local`:
   ```
   RESEND_API_KEY=re_your_api_key
   EMAIL_FROM=noreply@your-verified-domain.com
   ```
   > For testing only, you can use `onboarding@resend.dev` as `EMAIL_FROM`.

### 6. Run locally

```bash
# Run frontend (port 5173) and API server (port 3001) together:
npm run dev:all

# Or separately:
npm run dev          # Vite frontend
npm run server:dev   # Express API server
```

The Vite dev server proxies all `/api/*` requests to `http://localhost:3001`.

---

## Testing webhooks locally (Cashfree sandbox)

You need a public URL for Cashfree to send webhooks to. Use **ngrok** or **Cloudflare Tunnel**:

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3001

# This gives you a URL like: https://abc123.ngrok-free.app
# Set your Cashfree sandbox webhook URL to:
# https://abc123.ngrok-free.app/api/webhooks/cashfree
```

**Set the webhook URL in Cashfree:**
1. Cashfree merchant dashboard → Payments → Gateway → Webhooks
2. Add endpoint: `https://your-ngrok-url/api/webhooks/cashfree`
3. Select events: PAYMENT_SUCCESS_WEBHOOK, PAYMENT_FAILED_WEBHOOK

**Test payment cards (sandbox):**
| Card | Number | Expiry | CVV |
|---|---|---|---|
| Success | 4111111111111111 | Any future date | Any 3 digits |
| Failure | 4000000000000002 | Any future date | Any 3 digits |

---

## Running tests

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

Tests mock Supabase, Cashfree, and Resend — no real API calls are made.

---

## Deploying to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Add payment backend"
git push origin main
```

### 2. Connect to Vercel
1. Go to https://vercel.com/new → Import your repository
2. Framework: **Other** (do not select Vite — the `vercel.json` handles everything)
3. Build command: `npm run build`
4. Output directory: `dist`
5. Do NOT set a root directory override

### 3. Set environment variables in Vercel

Go to your project → Settings → Environment Variables. Add **all** server-only variables from `.env.example`:

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
CASHFREE_ENVIRONMENT          (set to "production" for live)
CASHFREE_CLIENT_ID
CASHFREE_CLIENT_SECRET
CASHFREE_API_VERSION
LICENSE_TOKEN_SECRET
ACTIVATION_CODE_SECRET
RESEND_API_KEY
EMAIL_FROM
SUPPORT_EMAIL
NEO_BROWSER_PRICE_INR
NEO_BROWSER_PRODUCT_ID
VITE_APP_URL                  (your https://your-project.vercel.app URL)
VITE_CASHFREE_ENV             (set to "production" for live)
```

> ⚠️ `VITE_APP_URL` and `VITE_CASHFREE_ENV` must also be set as Vercel environment variables (they're used at build time and runtime respectively).

### 4. Configure Cashfree production webhook

In Cashfree production dashboard → Payments → Gateway → Webhooks:
```
https://your-project.vercel.app/api/webhooks/cashfree
```

### 5. Deploy

Push any change to `main` — Vercel deploys automatically.

---

## Manual end-to-end test checklist

1. Visit `/pricing` → click **Purchase Neo-Browser**
2. Modal opens → enter email and Indian phone number → check agreement → submit
3. Loading state shows → Cashfree hosted checkout opens
4. Complete with Cashfree test card
5. Redirected to `/checkout/success?order_id=neo_xxx`
6. Success page shows order reference and instructs to check email
7. Check Supabase `orders` table → status should be `PAID`
8. Check Supabase `licenses` table → one row created with `UNACTIVATED` status
9. Check `webhook_events` table → one PROCESSED event
10. Email received with `NEO-XXXXXX-XXXXXX-XXXXXX-XXXXXX` activation code
11. Send `POST /api/licenses/activate` from desktop app with correct email + code → `ACTIVATED` + JWT token
12. Send duplicate webhook manually → `ALREADY_PROCESSED` (no second license created)

---

## Security checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is not in any `VITE_*` variable
- [ ] `CASHFREE_CLIENT_SECRET` is not in any `VITE_*` variable
- [ ] `RESEND_API_KEY` is not in any `VITE_*` variable
- [ ] No activation codes in Supabase `licenses` table (only HMAC hash)
- [ ] No raw IPs in `license_activation_attempts` (only SHA-256 hash)
- [ ] Webhook returns 400 on signature verification failure
- [ ] `/checkout/success` page does NOT claim payment is confirmed
- [ ] RLS is enabled on all 4 tables with no anon/authenticated policies

---

## Database table overview

| Table | Purpose |
|---|---|
| `orders` | One row per checkout attempt. Payment lifecycle. |
| `licenses` | One row per paid order. Stores hashed activation code. |
| `webhook_events` | Idempotency log of all inbound Cashfree webhooks. |
| `license_activation_attempts` | Audit log of all activation attempts. IPs are SHA-256 hashed. |

## API endpoints

| Method | Path | Consumer |
|---|---|---|
| POST | `/api/checkout/create` | Frontend checkout modal |
| POST | `/api/webhooks/cashfree` | Cashfree (server-to-server) |
| POST | `/api/licenses/activate` | Neo-Browser desktop app |
| POST | `/api/licenses/validate` | Neo-Browser desktop app |
| POST | `/api/licenses/deactivate` | Neo-Browser desktop app |
| GET | `/api/health` | Monitoring |
