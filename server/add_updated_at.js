import pool from './db.js';

const addUpdatedAt = async () => {
    try {
        await pool.query(`
            ALTER TABLE tournaments 
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        `);
        console.log('Successfully added updated_at column to tournaments.');

        await pool.query(`
             ALTER TABLE members 
             ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
         `);
        console.log('Successfully added updated_at column to members.');

    } catch (err) {
        console.error('Error adding columns:', err);
    } finally {
        pool.end();
    }
};

addUpdatedAt();
