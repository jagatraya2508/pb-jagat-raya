
import pool from './db.js';

const checkDb = async () => {
    try {
        console.log('Checking tournaments table...');
        const res = await pool.query('SELECT * FROM tournaments');
        console.log(`Found ${res.rows.length} tournaments.`);
        if (res.rows.length > 0) {
            console.log('Tournaments:', JSON.stringify(res.rows, null, 2));
        } else {
            console.log('No tournaments found.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error querying database:', err);
        process.exit(1);
    }
};

checkDb();
