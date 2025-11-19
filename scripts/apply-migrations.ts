import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function applyMigration(filePath: string) {
  console.log(`\n📄 Applying: ${path.basename(filePath)}`)

  const sql = fs.readFileSync(filePath, 'utf-8')

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

  if (error) {
    console.error('❌ Error:', error)
    return false
  }

  console.log('✅ Success!')
  return true
}

async function main() {
  console.log('🚀 Applying Social Connections migrations...\n')

  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')

  // Migration 1: Create tables
  const migration1 = path.join(migrationsDir, '20251117100400_social_connections_system.sql')
  await applyMigration(migration1)

  // Migration 2: Seed platforms
  const migration2 = path.join(migrationsDir, '20251118000000_seed_social_providers.sql')
  await applyMigration(migration2)

  console.log('\n✨ All migrations applied!')
}

main().catch(console.error)
