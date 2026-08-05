/**
 * run-migrations-api.cjs
 *
 * Runs SQL migrations via Supabase Management API.
 * Requires a SUPABASE_ACCESS_TOKEN (personal access token from supabase.com/dashboard/account/tokens)
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/run-migrations-api.cjs
 */
const https = require('https')
const fs = require('fs')
const path = require('path')

const PROJECT_REF = 'gwzxlqrzaxztwpvjoowv'
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!ACCESS_TOKEN) {
  console.error('❌ Set SUPABASE_ACCESS_TOKEN environment variable')
  console.error('   Get one at: https://supabase.com/dashboard/account/tokens')
  process.exit(1)
}

// Combine all migrations into one SQL block
const migrations = [
  '001_create_orders.sql',
  '002_create_licenses.sql',
  '003_create_webhook_events.sql',
  '004_create_activation_attempts.sql',
  '005_rls_policies.sql',
]

const combinedSQL = migrations
  .map(f => fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', f), 'utf8'))
  .join('\n\n')

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined
    const req = https.request({
      hostname: 'api.supabase.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, res => {
      let raw = ''
      res.on('data', chunk => (raw += chunk))
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }) }
        catch { resolve({ status: res.statusCode, body: raw }) }
      })
    })
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

async function main() {
  console.log(`🔌 Running migrations on project: ${PROJECT_REF}\n`)

  const result = await apiRequest('POST', `/v1/projects/${PROJECT_REF}/database/query`, {
    query: combinedSQL,
  })

  if (result.status >= 200 && result.status < 300) {
    console.log('✅ Migrations ran successfully!')
    console.log(JSON.stringify(result.body, null, 2))
  } else {
    console.error('❌ Migration failed:')
    console.error(`   Status: ${result.status}`)
    console.error(`   Body: ${JSON.stringify(result.body, null, 2)}`)
    process.exit(1)
  }
}

main()
