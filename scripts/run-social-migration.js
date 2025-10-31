#!/usr/bin/env node

/**
 * Social Accounts Migration Runner
 * This script checks if the social accounts tables exist and creates them if they don't
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', tableName)
      .eq('table_schema', 'public')

    return !error && data && data.length > 0
  } catch (error) {
    console.error('Error checking if table exists:', { tableName, error: error.message })
    return false
  }
}

async function runMigration() {
  try {
    console.log('🔍 Checking if social accounts tables exist...')
    
    const socialAccountsExists = await checkTableExists('social_accounts')
    const publishingQueueExists = await checkTableExists('social_publishing_queue')
    
    if (socialAccountsExists && publishingQueueExists) {
      console.log('✅ Social accounts tables already exist!')
      return
    }

    console.log('📋 Tables missing. Running migration...')
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'SOCIAL_ACCOUNTS_MIGRATION.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Remove the sample data insert that has NULL user_id (will fail)
    const cleanedSQL = migrationSQL.replace(/INSERT INTO social_accounts.*?;/gs, '')
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: cleanedSQL })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }
    
    console.log('✅ Social accounts migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()