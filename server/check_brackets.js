
import pool from './db.js';

const check = async () => {
    try {
        const res = await pool.query('SELECT * FROM tournament_brackets');
        console.log('Brackets count:', res.rowCount);
        console.log('Brackets:', JSON.stringify(res.rows, null, 2));

        const res2 = await pool.query('SELECT COUNT(*) FROM bracket_matches');
        console.log('Matches count:', res2.rows[0].count);
    } catch (err) {
        console.error('Error querying DB:', err);
    } finally {
        pool.end();
    }
};

check();
