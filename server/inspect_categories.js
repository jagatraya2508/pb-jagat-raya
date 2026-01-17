import pool from './db.js';

const inspectCategories = async () => {
    try {
        const res = await pool.query('SELECT * FROM categories');
        console.log('Categories data:', res.rows);

        // Also check columns just in case
        const colRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'categories'
        `);
        console.log('Columns:', colRes.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
};

inspectCategories();
