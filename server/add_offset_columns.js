import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tournament_db',
    password: 'sa',
    port: 5432,
});

async function addOffsetColumns() {
    try {
        await pool.query('ALTER TABLE bracket_matches ADD COLUMN IF NOT EXISTS offset_x INTEGER DEFAULT 0');
        await pool.query('ALTER TABLE bracket_matches ADD COLUMN IF NOT EXISTS offset_y INTEGER DEFAULT 0');
        console.log('Offset columns added successfully');
    } catch (err) {
        console.error('Error adding columns:', err);
    } finally {
        await pool.end();
    }
}

addOffsetColumns();
