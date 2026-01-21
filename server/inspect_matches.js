import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tournament_db',
    password: 'sa',
    port: 5432,
});

async function inspectMatches() {
    try {
        const res = await pool.query('SELECT id, player1_name, player1_score, player2_name, player2_score, score_detail FROM bracket_matches');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

inspectMatches();
