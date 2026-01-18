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
                club_name TEXT,
                partner_name TEXT,
                partner_phone TEXT,
                partner_ranking INTEGER DEFAULT 0,
                partner_points INTEGER DEFAULT 0,
                ranking INTEGER DEFAULT 0,
                points INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Add columns if they don't exist (for existing tables)
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournament_registrations' AND column_name='ranking') THEN
                    ALTER TABLE tournament_registrations ADD COLUMN ranking INTEGER DEFAULT 0;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournament_registrations' AND column_name='points') THEN
                    ALTER TABLE tournament_registrations ADD COLUMN points INTEGER DEFAULT 0;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournament_registrations' AND column_name='club_name') THEN
                    ALTER TABLE tournament_registrations ADD COLUMN club_name TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournament_registrations' AND column_name='partner_phone') THEN
                    ALTER TABLE tournament_registrations ADD COLUMN partner_phone TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournament_registrations' AND column_name='partner_ranking') THEN
                    ALTER TABLE tournament_registrations ADD COLUMN partner_ranking INTEGER DEFAULT 0;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournament_registrations' AND column_name='partner_points') THEN
                    ALTER TABLE tournament_registrations ADD COLUMN partner_points INTEGER DEFAULT 0;
                END IF;
            END $$;

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
        const { tournament_id, participant_name, email, phone, category, club_name, partner_name, partner_phone, partner_ranking, partner_points, ranking, points } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO tournament_registrations (tournament_id, participant_name, email, phone, category, club_name, partner_name, partner_phone, partner_ranking, partner_points, ranking, points) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
            [tournament_id, participant_name, email || '', phone, category, club_name || '', partner_name || '', partner_phone || '', partner_ranking || 0, partner_points || 0, ranking || 0, points || 0]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all registrations with tournament info
app.get('/api/registrations', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT r.*, t.name as tournament_name 
            FROM tournament_registrations r 
            LEFT JOIN tournaments t ON r.tournament_id = t.id 
            ORDER BY r.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update registration
app.put('/api/registrations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { participant_name, email, phone, category, club_name, partner_name, partner_phone, partner_ranking, partner_points, ranking, points } = req.body;
        const { rows } = await pool.query(
            'UPDATE tournament_registrations SET participant_name = $1, email = $2, phone = $3, category = $4, club_name = $5, partner_name = $6, partner_phone = $7, partner_ranking = $8, partner_points = $9, ranking = $10, points = $11 WHERE id = $12 RETURNING *',
            [participant_name, email || '', phone, category, club_name || '', partner_name || '', partner_phone || '', partner_ranking || 0, partner_points || 0, ranking || 0, points || 0, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Registration not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete registration
app.delete('/api/registrations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tournament_registrations WHERE id = $1', [id]);
        res.json({ message: 'Registration deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
