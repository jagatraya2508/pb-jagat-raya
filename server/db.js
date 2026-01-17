import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    password: 'sa',
    host: 'localhost',
    port: 5432,
    database: 'tournamen_db',
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Database connected successfully:', res.rows[0].now);
    }
});

export default pool;
