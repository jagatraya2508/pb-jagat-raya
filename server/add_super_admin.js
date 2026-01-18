import pool from './db.js';

async function addSuperAdmin() {
    try {
        const result = await pool.query(`
            INSERT INTO users (username, email, password_hash, role) 
            VALUES ('Super Admin', 'admin@pbjagat-raya.com', 'admin123', 'admin') 
            ON CONFLICT (email) DO NOTHING 
            RETURNING *
        `);

        if (result.rows.length > 0) {
            console.log('Super Admin created:', result.rows[0]);
        } else {
            console.log('Super Admin already exists');
        }

        // Show all users
        const allUsers = await pool.query('SELECT id, username, email, role FROM users');
        console.log('All users:', allUsers.rows);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addSuperAdmin();
