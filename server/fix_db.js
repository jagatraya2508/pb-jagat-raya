import pool from './db.js';

const fixDb = async () => {
    try {
        await pool.query('ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS location TEXT;');
        console.log('Successfully added location column or it already exists.');
    } catch (err) {
        console.error('Error updating database:', err);
    } finally {
        pool.end();
    }
};

fixDb();
