import pool from './db.js';

const checkColumns = async () => {
    try {
        const { rows } = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tournaments';
        `);
        console.log('Columns in tournaments table:', rows.map(r => r.column_name));
    } catch (err) {
        console.error('Error checking columns:', err);
    } finally {
        pool.end();
    }
};

checkColumns();
