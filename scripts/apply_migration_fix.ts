
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env and .env.local
dotenv.config({ path: '.env' });
if (fs.existsSync('.env.local')) {
  const envLocal = dotenv.parse(fs.readFileSync('.env.local'));
  for (const k in envLocal) {
    process.env[k] = envLocal[k];
  }
}

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!dbUrl) {
  console.error("❌ No DATABASE_URL or POSTGRES_URL found in .env or .env.local");
  process.exit(1);
}

// Adjust connection string for transaction pooler if needed (Supabase usually uses port 6543 or 5432)
// This script assumes direct connection or session pooler is fine for DDL.
console.log(`Connecting to database...`); // Don't log the URL for security

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false } // Required for Supabase usually
});

const migrationFile = path.join(__dirname, '../supabase/migrations/20260118195500_fix_upsert_campaign_rpc_enum.sql');

async function applyMigration() {
  try {
    const sql = fs.readFileSync(migrationFile, 'utf8');
    console.log(`Applying migration: ${path.basename(migrationFile)}`);
    
    // We execute the SQL directly. The SQL contains multiple statements.
    // pg driver handles multiple statements if they are separated by semicolons.
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log("✅ Migration applied successfully!");
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    if (error.position) {
         console.error(`Position: ${error.position}`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();
