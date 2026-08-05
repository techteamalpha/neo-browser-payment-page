/**
 * Supabase service-role client — SERVER ONLY.
 *
 * CRITICAL SECURITY NOTE:
 * The service-role key bypasses ALL Row Level Security policies.
 * This client MUST NEVER be:
 *   - Imported in any file under src/ (frontend code)
 *   - Sent to the browser in any response
 *   - Logged or exposed in error messages
 *   - Stored in VITE_* environment variables
 *
 * Only import this module from server/ and api/ directories.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

/**
 * Lazy singleton Supabase service-role client.
 * Checked on first use so dotenv has time to load before module evaluation.
 *
 * CRITICAL SECURITY NOTE:
 * The service-role key bypasses ALL Row Level Security policies.
 * This client MUST NEVER be:
 *   - Imported in any file under src/ (frontend code)
 *   - Sent to the browser in any response
 *   - Logged or exposed in error messages
 *   - Stored in VITE_* environment variables
 */
function getClient(): SupabaseClient {
  if (_client) return _client

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
      'Set them in .env.local and never expose them to the browser.'
    )
  }

  _client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })

  return _client
}

// Proxy so call sites can do `supabase.from(...)` unchanged
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient()
    const value = (client as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

