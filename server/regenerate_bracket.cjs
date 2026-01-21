
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tournament_db',
    password: 'sa',
    port: 5432,
});

async function regenerate() {
    try {
        // 1. Get Active Tournament
        const tResult = await pool.query("SELECT id, name FROM tournaments WHERE status = 'open' OR status = 'active' LIMIT 1");
        if (tResult.rows.length === 0) {
            console.log('No active tournament found.');
            return;
        }
        const tournamentId = tResult.rows[0].id;
        console.log(`Tournament: ${tResult.rows[0].name} (${tournamentId})`);

        // 2. Get Category 'TRA' (from debugging earlier)
        // Or getting all categories that have registrations?
        const catResult = await pool.query("SELECT DISTINCT category FROM tournament_registrations WHERE tournament_id = $1", [tournamentId]);

        for (const row of catResult.rows) {
            const category = row.category;
            console.log(`Regenerating bracket for category: ${category}`);

            try {
                const response = await axios.post('http://localhost:5001/api/brackets/generate', {
                    tournament_id: tournamentId,
                    category: category
                });
                console.log('Success:', response.status);
            } catch (apiErr) {
                console.error('API Error:', apiErr.message);
                if (apiErr.response) {
                    console.error('Response Data:', apiErr.response.data);
                }
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

regenerate();
