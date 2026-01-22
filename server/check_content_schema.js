import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    password: 'sa',
    host: 'localhost',
    port: 5432,
    database: 'tournament_db',
});

async function checkSchema() {
    try {
        const client = await pool.connect();
        try {
            const res = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'content_sections' AND column_name = 'icon';
            `);

            if (res.rows.length > 0) {
                console.log('Column "icon" EXISTS in content_sections.');
            } else {
                console.log('Column "icon" does NOT exist in content_sections.');
                // Add it if missing
                await client.query('ALTER TABLE content_sections ADD COLUMN icon VARCHAR(255)');
                console.log('Column "icon" added successfully.');
            }

            // Check for created_at
            const resCreated = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'content_sections' AND column_name = 'created_at';
            `);
            if (resCreated.rows.length === 0) {
                console.log('Column "created_at" does NOT exist. Adding...');
                await client.query('ALTER TABLE content_sections ADD COLUMN created_at TIMESTAMP DEFAULT NOW()');
            }

            // Check for updated_at
            const resUpdated = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'content_sections' AND column_name = 'updated_at';
            `);
            if (resUpdated.rows.length === 0) {
                console.log('Column "updated_at" does NOT exist. Adding...');
                await client.query('ALTER TABLE content_sections ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()');
            }
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        await pool.end();
    }
}

checkSchema();
