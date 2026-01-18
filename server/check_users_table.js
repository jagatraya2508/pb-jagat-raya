import pool from './db.js';

async function checkUsers() {
    try {
        const result = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log('Users table columns:', result.rows.map(r => r.column_name));

        if (result.rows.length === 0) {
            console.log('Users table does not exist! Creating now...');
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'operator', 'viewer')),
                    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
                    last_login TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `);
            console.log('Users table created successfully!');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        pool.end();
    }
}

checkUsers();
