import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const client = new Client({
    user: 'postgres',
    password: 'sa',
    host: 'localhost',
    port: 5432,
    database: 'postgres', // Connect to default DB first
});

async function createDatabase() {
    try {
        await client.connect();
        // Check if database exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'tournamen_db'");
        if (res.rowCount === 0) {
            await client.query('CREATE DATABASE tournamen_db');
            console.log('Database tournamen_db created successfully.');
        } else {
            console.log('Database tournamen_db already exists.');
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
}

createDatabase();
