/**
 * run-migrations.cjs
 * Runs all SQL migrations against the Supabase PostgreSQL database.
 * Uses the direct PostgreSQL connection via the Supabase transaction pooler.
 *
 * Usage: node scripts/run-migrations.cjs
 *
 * Requires SUPABASE_DB_PASSWORD in .env.local
 * Connection string format:
 *   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 */
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const password = process.env.SUPABASE_DB_PASSWORD
const projectRef = 'gwzxlqrzaxztwpvjoowv'

if (!password) {
  console.error('❌ SUPABASE_DB_PASSWORD not set in .env.local')
  console.error('   Find it in Supabase dashboard → Settings → Database → Database password')
  process.exit(1)
}

// Supabase transaction pooler (port 6543 = session mode; 5432 = direct but needs SSL)
// Use the direct connection for DDL statements
const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`

const migrations = [
  '001_create_orders.sql',
  '002_create_licenses.sql',
  '003_create_webhook_events.sql',
  '004_create_activation_attempts.sql',
  '005_rls_policies.sql',
]

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...')
    await client.connect()
    console.log('✅ Connected\n')

    for (const file of migrations) {
      const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', file)
      const sql = fs.readFileSync(sqlPath, 'utf8')
      console.log(`▶ Running ${file}...`)
      try {
        await client.query(sql)
        console.log(`  ✅ ${file} — done\n`)
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`  ⚠️  ${file} — skipped (already exists)\n`)
        } else {
          console.error(`  ❌ ${file} — FAILED: ${err.message}\n`)
          throw err
        }
      }
    }

    console.log('🎉 All migrations complete!')
    console.log('\nTables created:')
    const { rows } = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('orders','licenses','webhook_events','license_activation_attempts')
      ORDER BY tablename;
    `)
    rows.forEach(r => console.log(`  ✓ ${r.tablename}`))
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
