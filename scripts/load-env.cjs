// Preload script — loads .env.local before any server module executes.
// Used as: tsx --require ./scripts/load-env.cjs server/index.ts
// This runs synchronously via CJS require BEFORE ESM imports are evaluated.
const { config } = require('dotenv')
const path = require('path')
config({ path: path.resolve(process.cwd(), '.env.local') })
config({ path: path.resolve(process.cwd(), '.env') })
