import pool from './db.js';

const fixColumns = async () => {
    try {
        await pool.query(`
            ALTER TABLE tournaments 
            ADD COLUMN IF NOT EXISTS registration_deadline DATE,
            ADD COLUMN IF NOT EXISTS categories TEXT,
            ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 100;
        `);
        console.log('Successfully added missing columns.');
    } catch (err) {
        console.error('Error updating columns:', err);
    } finally {
        pool.end();
    }
};

fixColumns();
