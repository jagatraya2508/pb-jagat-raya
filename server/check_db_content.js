
import pool from './db.js';

const check = async () => {
    try {
        const res = await pool.query('SELECT * FROM tournaments');
        console.log('Tournaments in DB:', JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error querying DB:', err);
    } finally {
        pool.end();
    }
};

check();
