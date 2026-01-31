
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables from .env and .env.local
dotenv.config({ path: '.env' });
if (fs.existsSync('.env.local')) {
    try {
        const envLocal = dotenv.parse(fs.readFileSync('.env.local'));
        for (const k in envLocal) {
            process.env[k] = envLocal[k];
        }
    } catch (e) {
        console.warn("Could not parse .env.local");
    }
}

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!dbUrl) {
    console.error("❌ No DATABASE_URL or POSTGRES_URL found in .env or .env.local");
    process.exit(1);
}

console.log(`Connecting to database...`);

const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
});

const migrationFile = path.join(__dirname, '../supabase/migrations/20260118195500_fix_upsert_campaign_rpc_enum.sql');

async function applyMigration() {
    const client = await pool.connect();
    try {
        const sql = fs.readFileSync(migrationFile, 'utf8');
        console.log(`Applying migration: ${path.basename(migrationFile)}`);

        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log("✅ Migration applied successfully!");
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("❌ Migration failed:", error.message);
        if (error.position) {
            console.error(`Position: ${error.position}`);
        }
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

applyMigration();
