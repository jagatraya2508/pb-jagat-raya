import pool from './db.js';

const resetCategories = async () => {
    try {
        await pool.query('DROP TABLE IF EXISTS tournament_categories');
        console.log('Dropped tournament_categories table.');
    } catch (err) {
        console.error('Error dropping table:', err);
    } finally {
        pool.end();
    }
};

resetCategories();
