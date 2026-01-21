
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tournament_db',
    password: 'sa',
    port: 5432,
});

async function checkContent() {
    try {
        const res = await pool.query('SELECT * FROM content_sections');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkContent();
