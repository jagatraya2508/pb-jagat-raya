
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tournament_db',
    password: 'sa',
    port: 5432,
});

async function checkMatches() {
    try {
        const res = await pool.query(`
            SELECT round, position, player1_name, player2_name, bracket_matches.status, winner_name 
            FROM bracket_matches 
            JOIN tournament_brackets ON bracket_matches.bracket_id = tournament_brackets.id
            WHERE tournament_brackets.category = 'TRA'
            ORDER BY round ASC, position ASC
        `);
        res.rows.forEach(r => {
            console.log(`R${r.round} P${r.position}: ${r.player1_name || 'Bye'} vs ${r.player2_name || 'Bye'} [${r.status}] > Winner: ${r.winner_name}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkMatches();
