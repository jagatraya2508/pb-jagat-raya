
import pool from './db.js';

const check = async () => {
    try {
        const res = await pool.query('SELECT COUNT(*) FROM tournament_registrations');
        console.log('Registrations count:', res.rows[0].count);

        const res2 = await pool.query('SELECT * FROM tournament_registrations LIMIT 5');
        console.log('Sample registrations:', JSON.stringify(res2.rows, null, 2));

        const res3 = await pool.query('SELECT * FROM tournaments');
        console.log('Tournaments count:', res3.rowCount);
    } catch (err) {
        console.error('Error querying DB:', err);
    } finally {
        pool.end();
    }
};

check();
