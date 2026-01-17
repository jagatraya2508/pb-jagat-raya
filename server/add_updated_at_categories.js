import pool from './db.js';

const addUpdatedAtCategories = async () => {
    try {
        await pool.query(`
            ALTER TABLE categories 
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        `);
        console.log('Successfully added updated_at column to categories.');

    } catch (err) {
        console.error('Error adding columns:', err);
    } finally {
        pool.end();
    }
};

addUpdatedAtCategories();
