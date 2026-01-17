import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// --- Database Initialization ---
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS members (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                address TEXT,
                birthdate DATE,
                category TEXT DEFAULT 'dewasa' CHECK (category IN ('anak', 'dewasa')),
                status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS tournaments (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                location TEXT,
                start_date DATE,
                end_date DATE,
                registration_deadline DATE,
                categories TEXT,
                max_participants INTEGER DEFAULT 100,
                status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS tournament_registrations (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
                participant_name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                category TEXT NOT NULL,
                partner_name TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

        `);
        console.log('Database tables verified/created.');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initDb();

// --- API Routes ---

// 4. Categories
app.get('/api/categories', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/categories', async (req, res) => {
    try {
        const { name, description, match_type } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO categories (name, description, match_type) VALUES ($1, $2, $3) RETURNING *',
            [name, description, match_type]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, match_type } = req.body;
        const { rows } = await pool.query(
            'UPDATE categories SET name = $1, description = $2, match_type = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
            [name, description, match_type, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM categories WHERE id = $1', [id]);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API Routes ---

// 1. Members
app.get('/api/members', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM members ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/members', async (req, res) => {
    try {
        const { name, email, phone, address, birthdate, category, status } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO members (name, email, phone, address, birthdate, category, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, email, phone, address, birthdate, category, status]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/members/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, birthdate, category, status } = req.body;
        const { rows } = await pool.query(
            'UPDATE members SET name = $1, email = $2, phone = $3, address = $4, birthdate = $5, category = $6, status = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
            [name, email, phone, address, birthdate, category, status, id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/members/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM members WHERE id = $1', [id]);
        res.json({ message: 'Member deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Tournaments
app.get('/api/tournaments', async (req, res) => {
    try {
        const { status } = req.query;
        let query = 'SELECT * FROM tournaments';
        const params = [];

        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }

        query += ' ORDER BY start_date ASC';

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tournaments', async (req, res) => {
    try {
        const { name, description, location, start_date, end_date, registration_deadline, categories, max_participants, status } = req.body;

        // Helper to convert empty string to null for dates
        const toDate = (val) => val === '' ? null : val;

        const { rows } = await pool.query(
            'INSERT INTO tournaments (name, description, location, start_date, end_date, registration_deadline, categories, max_participants, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [name, description, location, toDate(start_date), toDate(end_date), toDate(registration_deadline), categories, max_participants, status]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tournaments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, location, start_date, end_date, registration_deadline, categories, max_participants, status } = req.body;

        // Helper to convert empty string to null for dates
        const toDate = (val) => val === '' ? null : val;

        const { rows } = await pool.query(
            'UPDATE tournaments SET name = $1, description = $2, location = $3, start_date = $4, end_date = $5, registration_deadline = $6, categories = $7, max_participants = $8, status = $9, updated_at = NOW() WHERE id = $10 RETURNING *',
            [name, description, location, toDate(start_date), toDate(end_date), toDate(registration_deadline), categories, max_participants, status, id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/tournaments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tournaments WHERE id = $1', [id]);
        res.json({ message: 'Tournament deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Registrations
app.get('/api/tournaments/:id/registrations', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM tournament_registrations WHERE tournament_id = $1 ORDER BY created_at DESC', [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/registrations', async (req, res) => {
    try {
        const { tournament_id, participant_name, email, phone, category, partner_name } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO tournament_registrations (tournament_id, participant_name, email, phone, category, partner_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [tournament_id, participant_name, email, phone, category, partner_name]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
