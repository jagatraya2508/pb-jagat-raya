
import pool from './db.js';

const check = async () => {
    try {
        const res = await pool.query('SELECT * FROM hero_slides');
        console.log('Hero slides count:', res.rowCount);

        const res2 = await pool.query('SELECT * FROM content_sections');
        console.log('Content sections count:', res2.rowCount);
    } catch (err) {
        console.error('Error querying DB:', err);
    } finally {
        pool.end();
    }
};

check();
