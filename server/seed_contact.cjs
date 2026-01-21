
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tournament_db',
    password: 'sa',
    port: 5432,
});

async function seedContact() {
    try {
        const defaultContact = {
            address: "GOR Bulutangkis JAGAT RAYA\nJl. Olahraga No. 123\nJakarta, Indonesia",
            phone: "+62 812 3456 7890",
            email: "info@pbjagat-raya.com",
            hours: "Senin - Jumat: 16:00 - 21:00\nSabtu - Minggu: 08:00 - 12:00"
        };

        const key = 'contact';
        const title = 'Informasi Kontak';

        // Upsert
        const check = await pool.query('SELECT * FROM content_sections WHERE key = $1', [key]);
        if (check.rows.length === 0) {
            await pool.query(
                'INSERT INTO content_sections (key, title, content) VALUES ($1, $2, $3)',
                [key, title, JSON.stringify(defaultContact)]
            );
            console.log('Contact info inserted.');
        } else {
            console.log('Contact info already exists.');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

seedContact();
