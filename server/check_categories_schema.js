
import pool from './db.js';

const check = async () => {
    try {
        const res = await pool.query('SELECT * FROM categories LIMIT 1');
        console.log('Categories sample:', res.rows[0]);
        // list columns
        const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'categories'");
        console.log('Columns:', cols.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
};

check();
