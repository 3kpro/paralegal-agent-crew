import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { readFileSync } from "fs"
import { join } from "path"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Check if user is authenticated and is admin
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Read migration files
    const migrationsDir = join(process.cwd(), 'supabase', 'migrations')

    const migration1Path = join(migrationsDir, '20251117100400_social_connections_system.sql')
    const migration2Path = join(migrationsDir, '20251118000000_seed_social_providers.sql')

    const migration1SQL = readFileSync(migration1Path, 'utf-8')
    const migration2SQL = readFileSync(migration2Path, 'utf-8')

    // Execute migrations using service role client
    const adminClient = createClient()

    // Execute migration 1
    console.log('Executing migration 1: social_connections_system')
    const { error: error1 } = await adminClient.rpc('exec_sql', {
      query: migration1SQL
    })

    if (error1) {
      console.error('Migration 1 failed:', error1)
      return NextResponse.json({
        error: "Migration 1 failed",
        details: error1
      }, { status: 500 })
    }

    // Execute migration 2
    console.log('Executing migration 2: seed_social_providers')
    const { error: error2 } = await adminClient.rpc('exec_sql', {
      query: migration2SQL
    })

    if (error2) {
      console.error('Migration 2 failed:', error2)
      return NextResponse.json({
        error: "Migration 2 failed",
        details: error2
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Migrations applied successfully"
    })

  } catch (error: any) {
    console.error('Error applying migrations:', error)
    return NextResponse.json({
      error: "Failed to apply migrations",
      details: error.message
    }, { status: 500 })
  }
}
