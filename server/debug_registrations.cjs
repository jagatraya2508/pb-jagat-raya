
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tournament_db',
    password: 'sa',
    port: 5432,
});

async function checkRegistrations() {
    try {
        const res = await pool.query('SELECT participant_name, ranking, points, category FROM tournament_registrations ORDER BY created_at DESC LIMIT 20');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkRegistrations();
