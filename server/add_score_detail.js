import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tournament_db',
    password: 'sa',
    port: 5432,
});

async function addColumn() {
    try {
        await pool.query('ALTER TABLE bracket_matches ADD COLUMN IF NOT EXISTS score_detail TEXT');
        console.log('Column score_detail added successfully');
    } catch (err) {
        console.error('Error adding column:', err);
    } finally {
        await pool.end();
    }
}

addColumn();
