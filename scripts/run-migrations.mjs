import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pg from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Supabase connection string
const connectionString = 'postgresql://postgres.hvcmidkylzrhmrwyigqr:CmMB5vxcJnP4XYXV@aws-0-us-east-1.pooler.supabase.com:6543/postgres'

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

async function runMigration(filePath) {
  console.log(`\n📄 Running: ${filePath}`)

  const sql = readFileSync(filePath, 'utf-8')

  try {
    await client.query(sql)
    console.log('✅ Success!')
    return true
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Connecting to Supabase...')
  await client.connect()
  console.log('✅ Connected!\n')

  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations')

  // Migration 1: Create tables & schema
  await runMigration(join(migrationsDir, '20251117100400_social_connections_system.sql'))

  // Migration 2: Update platform configs
  await runMigration(join(migrationsDir, '20251118000000_seed_social_providers.sql'))

  await client.end()
  console.log('\n✨ Done!')
}

main().catch(console.error)
