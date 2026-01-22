import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const slidesDir = path.join(uploadsDir, 'slides');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(slidesDir)) fs.mkdirSync(slidesDir);

// Configure multer for slide uploads
const slideStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, slidesDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'slide-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadSlide = multer({
    storage: slideStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Configure multer for gallery uploads
const galleryDir = path.join(uploadsDir, 'gallery');
if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir);

const galleryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, galleryDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadGallery = multer({
    storage: galleryStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

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

            CREATE TABLE IF NOT EXISTS tournament_brackets (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
                category TEXT NOT NULL,
                bracket_type TEXT DEFAULT 'single_elimination',
                total_rounds INTEGER DEFAULT 0,
                status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS bracket_matches (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                bracket_id UUID REFERENCES tournament_brackets(id) ON DELETE CASCADE,
                round INTEGER NOT NULL,
                position INTEGER NOT NULL,
                player1_id UUID,
                player2_id UUID,
                player1_name TEXT,
                player2_name TEXT,
                player1_score INTEGER,
                player2_score INTEGER,
                winner_id UUID,
                winner_name TEXT,
                match_time TIMESTAMP WITH TIME ZONE,
                court TEXT,
                status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'playing', 'completed')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

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

            CREATE TABLE IF NOT EXISTS hero_slides (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                image_url TEXT NOT NULL,
                title TEXT,
                sort_order INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournament_registrations' AND column_name='si_pbsi') THEN
                    ALTER TABLE tournament_registrations ADD COLUMN si_pbsi TEXT;
                END IF;
            END $$;

        `);

        // Initialize content_sections table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS content_sections (
                key TEXT PRIMARY KEY,
                title TEXT,
                content TEXT,
                icon TEXT,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        // Seed default content
        await pool.query(`
            INSERT INTO content_sections (key, title, content, icon)
            VALUES 
            ('about_main', 'Tentang Kami', 'PB. JAGAT RAYA adalah perkumpulan bulutangkis yang berdedikasi untuk mengembangkan bakat dan prestasi atlet bulutangkis Indonesia.', null),
            ('about_history', 'Sejarah Kami', 'Didirikan pada tahun 2014, PB. JAGAT RAYA bermula dari sekelompok pecinta bulutangkis yang memiliki visi untuk mengembangkan olahraga bulutangkis di Indonesia. Berbekal semangat dan dedikasi tinggi, kami terus berkembang hingga menjadi salah satu perkumpulan bulutangkis yang diakui di tingkat lokal.\\n\\nDengan fasilitas modern dan pelatih berpengalaman, kami telah berhasil mencetak puluhan atlet berprestasi yang mengharumkan nama daerah di berbagai kejuaraan bulutangkis.', null),
            ('about_vision', 'Visi', 'Menjadi perkumpulan bulutangkis terdepan yang menghasilkan atlet berprestasi di tingkat nasional dan internasional.', 'Target'),
            ('about_mission', 'Misi', 'Memberikan pelatihan berkualitas, mengembangkan karakter atlet, dan menciptakan lingkungan yang mendukung prestasi.', 'Award'),
            ('about_community', 'Komunitas', 'Membangun komunitas bulutangkis yang solid, saling mendukung, dan berorientasi pada pengembangan bersama.', 'Users'),
            ('about_values', 'Nilai', 'Menjunjung tinggi sportivitas, disiplin, kerja keras, dan semangat pantang menyerah dalam setiap latihan dan pertandingan.', 'Heart'),
            
            -- Activities Section
            ('activity_main', 'Kegiatan Kami', 'Berbagai kegiatan rutin yang kami selenggarakan untuk mengembangkan kemampuan dan prestasi para anggota.', null),
            ('activity_card_1', 'Latihan Rutin', 'Latihan terstruktur setiap minggu dengan pelatih berpengalaman', 'Calendar'),
            ('activity_card_2', 'Sparring Match', 'Pertandingan persahabatan untuk mengasah kemampuan bermain', 'Users'),
            ('activity_card_3', 'Kejuaraan', 'Mengikuti berbagai turnamen tingkat lokal dan nasional', 'Clock'),
            ('activity_schedule', 'Jadwal Latihan', '[{"day":"Senin","time":"16:00 - 18:00","type":"Latihan Anak-anak","location":"GOR Utama"},{"day":"Selasa","time":"18:00 - 21:00","type":"Latihan Dewasa","location":"GOR Utama"},{"day":"Rabu","time":"16:00 - 18:00","type":"Latihan Anak-anak","location":"GOR Utama"},{"day":"Kamis","time":"18:00 - 21:00","type":"Latihan Dewasa","location":"GOR Utama"},{"day":"Jumat","time":"16:00 - 18:00","type":"Latihan Anak-anak","location":"GOR Utama"},{"day":"Sabtu","time":"08:00 - 12:00","type":"Sparring & Pertandingan","location":"GOR Utama"},{"day":"Minggu","time":"08:00 - 12:00","type":"Latihan Bebas","location":"GOR Utama"}]', 'Calendar'),
            
            -- Gallery Section
            ('gallery_main', 'Galeri Kegiatan', 'Dokumentasi berbagai kegiatan dan momen berharga PB. JAGAT RAYA', null),
            ('gallery_groups', 'Groups', '[{"title":"Latihan & Pembinaan","items":[{"title":"Latihan Rutin","description":"Kegiatan latihan rutin setiap minggu","icon":"🏸"},{"title":"Pelatihan Khusus","description":"Sesi pelatihan teknik bersama pelatih","icon":"📋"}]},{"title":"Turnamen & Prestasi","items":[{"title":"Kejuaraan Daerah","description":"Partisipasi dalam kejuaraan tingkat daerah","icon":"🏆"},{"title":"Pembagian Hadiah","description":"Penghargaan untuk atlet berprestasi","icon":"🥇"}]},{"title":"Komunitas & Event","items":[{"title":"Sparring Match","description":"Pertandingan persahabatan antar anggota","icon":"🤝"},{"title":"Gathering Anggota","description":"Acara kebersamaan para anggota","icon":"🎉"}]}]', 'Image')

            ON CONFLICT (key) DO NOTHING;
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

// 5. Users
app.get('/api/users', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, username as name, email, role, created_at FROM users ORDER BY created_at DESC');
        // Add default status since column doesn't exist in old schema
        const usersWithStatus = rows.map(u => ({ ...u, status: 'active' }));
        res.json(usersWithStatus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Use username and password_hash columns from existing schema
        const { rows } = await pool.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username as name, email, role, created_at',
            [name, email, password, role || 'admin']
        );
        res.json({ ...rows[0], status: 'active' });
    } catch (err) {
        if (err.code === '23505') { // unique violation
            res.status(400).json({ error: 'Email sudah terdaftar' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        let query, params;
        if (password) {
            query = 'UPDATE users SET username = $1, email = $2, password_hash = $3, role = $4 WHERE id = $5 RETURNING id, username as name, email, role, created_at';
            params = [name, email, password, role, id];
        } else {
            query = 'UPDATE users SET username = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, username as name, email, role, created_at';
            params = [name, email, role, id];
        }

        const { rows } = await pool.query(query, params);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ ...rows[0], status: 'active' });
    } catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ error: 'Email sudah terdaftar' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'User deleted' });
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
        const { si_pbsi, participant_name, email, phone, category, club_name, partner_name, partner_phone, partner_ranking, partner_points, ranking, points } = req.body;
        const { rows } = await pool.query(
            'UPDATE tournament_registrations SET si_pbsi = $1, participant_name = $2, email = $3, phone = $4, category = $5, club_name = $6, partner_name = $7, partner_phone = $8, partner_ranking = $9, partner_points = $10, ranking = $11, points = $12 WHERE id = $13 RETURNING *',
            [si_pbsi || '', participant_name, email || '', phone, category, club_name || '', partner_name || '', partner_phone || '', partner_ranking || 0, partner_points || 0, ranking || 0, points || 0, id]
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

// --- Bracket API Routes ---

// Get all brackets for a tournament
app.get('/api/brackets/:tournamentId', async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const { rows } = await pool.query(
            'SELECT * FROM tournament_brackets WHERE tournament_id = $1 ORDER BY category ASC',
            [tournamentId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get bracket with matches for a specific category
app.get('/api/brackets/:tournamentId/:category', async (req, res) => {
    try {
        const { tournamentId, category } = req.params;
        const decodedCategory = decodeURIComponent(category);

        // Get bracket info
        const bracketResult = await pool.query(
            'SELECT * FROM tournament_brackets WHERE tournament_id = $1 AND category = $2',
            [tournamentId, decodedCategory]
        );

        if (bracketResult.rows.length === 0) {
            return res.json({ bracket: null, matches: [] });
        }

        const bracket = bracketResult.rows[0];

        // Get matches for this bracket with player rankings
        const matchesResult = await pool.query(`
            SELECT m.*, 
                   p1.ranking as player1_rank,
                   p2.ranking as player2_rank
            FROM bracket_matches m
            LEFT JOIN tournament_registrations p1 ON m.player1_id = p1.id
            LEFT JOIN tournament_registrations p2 ON m.player2_id = p2.id
            WHERE m.bracket_id = $1 
            ORDER BY m.round ASC, m.position ASC
        `, [bracket.id]);

        res.json({ bracket, matches: matchesResult.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generate bracket from registrations
app.post('/api/brackets/generate', async (req, res) => {
    try {
        const { tournament_id, category } = req.body;

        // Check if bracket already exists
        const existingBracket = await pool.query(
            'SELECT id FROM tournament_brackets WHERE tournament_id = $1 AND category = $2',
            [tournament_id, category]
        );

        if (existingBracket.rows.length > 0) {
            // Delete existing bracket and matches
            await pool.query('DELETE FROM tournament_brackets WHERE id = $1', [existingBracket.rows[0].id]);
        }

        // Get registrations for this category
        const registrations = await pool.query(
            'SELECT * FROM tournament_registrations WHERE tournament_id = $1 AND category = $2',
            [tournament_id, category]
        );

        let players = registrations.rows;

        if (players.length < 2) {
            return res.status(400).json({ error: 'Minimal 2 peserta untuk generate bracket' });
        }

        // 1. Sort players by Ranking (ASC), then Points (DESC)
        // Values of 0 or null are treated as lowest rank (highest number)
        players.sort((a, b) => {
            const rankA = a.ranking && a.ranking > 0 ? a.ranking : 999999;
            const rankB = b.ranking && b.ranking > 0 ? b.ranking : 999999;

            if (rankA !== rankB) {
                return rankA - rankB;
            }

            const pointsA = a.points || 0;
            const pointsB = b.points || 0;
            return pointsB - pointsA;
        });

        // Calculate bracket size (next power of 2)
        const bracketSize = Math.pow(2, Math.ceil(Math.log2(players.length)));
        const totalRounds = Math.log2(bracketSize);

        // 2. Generate Seeding Order
        // Standard seeding pattern: [1, 2] -> [1, 4, 2, 3] -> [1, 8, 4, 5, 2, 7, 3, 6] ...
        let seedOrder = [1, 2];
        for (let i = 1; i < totalRounds; i++) {
            const nextOrder = [];
            const currentSize = Math.pow(2, i + 1); // 4, 8, 16...
            for (const val of seedOrder) {
                nextOrder.push(val);
                nextOrder.push(currentSize + 1 - val);
            }
            seedOrder = nextOrder;
        }

        // 3. Map Players to Seeds
        // players[0] is Rank 1. It goes to seedOrder index containing '1'.
        // Actually, seedOrder is the LIST of seeds in match order.
        // e.g. [1, 8, 4, 5...] means Match 1 has Seed 1 vs Seed 8.
        // So we just iterate seedOrder in pairs.

        // Create a map for quick lookup: Rank/Seed N -> Player
        // Since players are sorted, players[0] is Seed 1, players[1] is Seed 2.

        // Create bracket record
        const bracketResult = await pool.query(
            'INSERT INTO tournament_brackets (tournament_id, category, bracket_type, total_rounds, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [tournament_id, category, 'single_elimination', totalRounds, 'active']
        );
        const bracket = bracketResult.rows[0];

        // 3. Map Players to Seeds and Create Matches
        // seedOrder is [1, 8, 4, 5, 2, 7, 3, 6...]

        let matchPairs = [];
        const firstRoundMatchesCount = bracketSize / 2;

        for (let i = 0; i < firstRoundMatchesCount; i++) {
            const seed1 = seedOrder[i * 2];
            const seed2 = seedOrder[i * 2 + 1];
            matchPairs.push({ seed1, seed2 });
        }

        // Apply "Visual Balance" -> Place Seed 2 pair at the very bottom
        // Logic: Standard seeding has 1 at top-left, 2 at top-right (if vertical).
        // Vertical list: 1 at top, 2 at top of bottom block.
        // To put 2 at bottom, we reverse the order of the bottom block matches.
        if (matchPairs.length >= 2) {
            const mid = matchPairs.length / 2;
            const topHalf = matchPairs.slice(0, mid);
            const bottomHalf = matchPairs.slice(mid).reverse();
            matchPairs = [...topHalf, ...bottomHalf];
        }

        const matches = [];

        for (let i = 0; i < matchPairs.length; i++) {
            const { seed1, seed2 } = matchPairs[i];

            // Get actual players (0-indexed array, so Seed N is players[N-1])
            const player1 = players[seed1 - 1] || null; // If seed > players.length, it's a Bye
            const player2 = players[seed2 - 1] || null;

            // Determine player name helper
            const getPlayerName = (player) => {
                if (!player) return null;
                if (player.partner_name) {
                    return `${player.participant_name} / ${player.partner_name}`;
                }
                return player.participant_name;
            };

            const matchData = {
                bracket_id: bracket.id,
                round: 1,
                position: i + 1,
                player1_id: player1?.id || null,
                player2_id: player2?.id || null,
                player1_name: getPlayerName(player1),
                player2_name: getPlayerName(player2),
                status: 'pending'
            };

            // Auto-advance logic for Byes
            if (player1 && !player2) {
                // P1 vs Bye -> P1 wins
                matchData.winner_id = player1.id;
                matchData.winner_name = getPlayerName(player1);
                matchData.status = 'completed';
            } else if (!player1 && player2) {
                // Bye vs P2 -> P2 wins
                matchData.winner_id = player2.id;
                matchData.winner_name = getPlayerName(player2);
                matchData.status = 'completed';
            } else if (!player1 && !player2) {
                matchData.status = 'completed';
            }

            const matchResult = await pool.query(
                `INSERT INTO bracket_matches 
                (bracket_id, round, position, player1_id, player2_id, player1_name, player2_name, winner_id, winner_name, status) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                [matchData.bracket_id, matchData.round, matchData.position,
                matchData.player1_id, matchData.player2_id, matchData.player1_name, matchData.player2_name,
                matchData.winner_id || null, matchData.winner_name || null, matchData.status]
            );

            matches.push(matchResult.rows[0]);
        }

        // Create placeholder matches for subsequent rounds
        for (let round = 2; round <= totalRounds; round++) {
            const matchesInRound = Math.pow(2, totalRounds - round);
            for (let pos = 1; pos <= matchesInRound; pos++) {
                const matchResult = await pool.query(
                    `INSERT INTO bracket_matches 
                    (bracket_id, round, position, status) 
                    VALUES ($1, $2, $3, 'pending') RETURNING *`,
                    [bracket.id, round, pos]
                );
                matches.push(matchResult.rows[0]);
            }
        }

        // Process any auto-advances from byes
        await processAutoAdvances(bracket.id, totalRounds);

        // Get updated matches
        const updatedMatches = await pool.query(
            'SELECT * FROM bracket_matches WHERE bracket_id = $1 ORDER BY round ASC, position ASC',
            [bracket.id]
        );

        res.json({ bracket, matches: updatedMatches.rows });
    } catch (err) {
        console.error('Error generating bracket:', err);
        res.status(500).json({ error: err.message });
    }
});

// Helper function to process auto-advances from byes
// Helper function to process auto-advances from byes
async function processAutoAdvances(bracketId, totalRounds) {
    for (let round = 1; round < totalRounds; round++) {
        const completedMatches = await pool.query(
            `SELECT * FROM bracket_matches 
             WHERE bracket_id = $1 AND round = $2 AND status = 'completed' AND winner_id IS NOT NULL
             ORDER BY position ASC`,
            [bracketId, round]
        );

        for (const match of completedMatches.rows) {
            // Determine next match position
            const nextRound = round + 1;
            const nextPosition = Math.ceil(match.position / 2);
            const isPlayer1Position = (match.position % 2 !== 0); // Odd position goes to Player 1 slot

            // Find next match
            const nextMatchResult = await pool.query(
                'SELECT * FROM bracket_matches WHERE bracket_id = $1 AND round = $2 AND position = $3',
                [bracketId, nextRound, nextPosition]
            );

            if (nextMatchResult.rows.length > 0) {
                const nextMatch = nextMatchResult.rows[0];
                const updateField = isPlayer1Position ? 'player1' : 'player2';

                await pool.query(
                    `UPDATE bracket_matches 
                     SET ${updateField}_id = $1, ${updateField}_name = $2 
                     WHERE id = $3`,
                    [match.winner_id, match.winner_name, nextMatch.id]
                );
            }
        }
    }
}

// Swap Players Endpoint
app.post('/api/brackets/swap-players', async (req, res) => {
    try {
        const { match1_id, player1_slot, match2_id, player2_slot } = req.body;

        // Fetch both matches
        const matchesResult = await pool.query(
            'SELECT * FROM bracket_matches WHERE id IN ($1, $2)',
            [match1_id, match2_id]
        );

        if (matchesResult.rows.length === 0) {
            return res.status(404).json({ error: 'Matches not found' });
        }

        const match1 = matchesResult.rows.find(m => m.id === match1_id);
        const match2 = matchesResult.rows.find(m => m.id === match2_id);

        if (!match1 || !match2) {
            return res.status(404).json({ error: 'One or both matches not found' });
        }

        // Helper to get player data from a slot
        const getPlayerData = (match, slot) => {
            if (slot === 'player1') {
                return {
                    id: match.player1_id,
                    name: match.player1_name
                };
            } else {
                return {
                    id: match.player2_id,
                    name: match.player2_name
                };
            }
        };

        const player1Data = getPlayerData(match1, player1_slot);
        const player2Data = getPlayerData(match2, player2_slot);

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Update Match 1 with Player 2's data
            await client.query(
                `UPDATE bracket_matches 
                 SET ${player1_slot}_id = $1, ${player1_slot}_name = $2 
                 WHERE id = $3`,
                [player2Data.id, player2Data.name, match1_id]
            );

            // Update Match 2 with Player 1's data
            await client.query(
                `UPDATE bracket_matches 
                 SET ${player2_slot}_id = $1, ${player2_slot}_name = $2 
                 WHERE id = $3`,
                [player1Data.id, player1Data.name, match2_id]
            );

            await client.query('COMMIT');

            // Return updated matches
            const updatedMatches = await pool.query(
                'SELECT * FROM bracket_matches WHERE id IN ($1, $2)',
                [match1_id, match2_id]
            );

            res.json(updatedMatches.rows);
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (err) {
        console.error('Error swapping players:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update match result
app.put('/api/brackets/match/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { player1_score, player2_score, court, match_time } = req.body;

        // Get match info
        const matchResult = await pool.query('SELECT * FROM bracket_matches WHERE id = $1', [id]);
        if (matchResult.rows.length === 0) {
            return res.status(404).json({ error: 'Match not found' });
        }

        const match = matchResult.rows[0];

        // Determine winner
        let winner_id = null;
        let winner_name = null;
        if (player1_score !== null && player2_score !== null) {
            // Only finish match if someone has won at least 2 sets
            if (Math.max(player1_score, player2_score) >= 2) {
                if (player1_score > player2_score) {
                    winner_id = match.player1_id;
                    winner_name = match.player1_name;
                    status = 'completed';
                } else if (player2_score > player1_score) {
                    winner_id = match.player2_id;
                    winner_name = match.player2_name;
                    status = 'completed';
                }
            }
        }

        // Update match
        const updateResult = await pool.query(
            `UPDATE bracket_matches 
             SET player1_score = $1, player2_score = $2, winner_id = $3, winner_name = $4, 
                 court = $5, match_time = $6, status = $7, score_detail = $8, updated_at = NOW()
             WHERE id = $9 RETURNING *`,
            [player1_score, player2_score, winner_id, winner_name, court || null, match_time || null, status, req.body.score_detail || null, id]
        );

        const updatedMatch = updateResult.rows[0];

        // If match is completed, advance winner to next round
        if (status === 'completed' && winner_id) {
            const bracketResult = await pool.query('SELECT * FROM tournament_brackets WHERE id = $1', [match.bracket_id]);
            const bracket = bracketResult.rows[0];

            if (match.round < bracket.total_rounds) {
                const nextRound = match.round + 1;
                const nextPosition = Math.ceil(match.position / 2);
                const isPlayer1 = match.position % 2 === 1;

                const updateField = isPlayer1 ?
                    { id: 'player1_id', name: 'player1_name' } :
                    { id: 'player2_id', name: 'player2_name' };

                await pool.query(
                    `UPDATE bracket_matches 
                     SET ${updateField.id} = $1, ${updateField.name} = $2, updated_at = NOW()
                     WHERE bracket_id = $3 AND round = $4 AND position = $5`,
                    [winner_id, winner_name, match.bracket_id, nextRound, nextPosition]
                );
            } else {
                // Final match completed, update bracket status
                await pool.query(
                    'UPDATE tournament_brackets SET status = $1, updated_at = NOW() WHERE id = $2',
                    ['completed', match.bracket_id]
                );
            }
        }

        res.json(updatedMatch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update bracket layout (batch)
app.put('/api/brackets/layout', async (req, res) => {
    try {
        const { updates } = req.body; // Array of { id, offset_x, offset_y }
        if (!Array.isArray(updates)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const update of updates) {
                await client.query(
                    'UPDATE bracket_matches SET offset_x = $1, offset_y = $2 WHERE id = $3',
                    [update.offset_x, update.offset_y, update.id]
                );
            }
            await client.query('COMMIT');
            res.json({ message: 'Layout updated' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete bracket
app.delete('/api/brackets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tournament_brackets WHERE id = $1', [id]);
        res.json({ message: 'Bracket deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Hero Slides API Routes ---

// Get all hero slides
app.get('/api/hero-slides', async (req, res) => {
    try {
        const { active_only } = req.query;
        let query = 'SELECT * FROM hero_slides';
        if (active_only === 'true') {
            query += ' WHERE is_active = true';
        }
        query += ' ORDER BY sort_order ASC, created_at ASC';
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create hero slide
app.post('/api/hero-slides', async (req, res) => {
    try {
        const { image_url, title, is_active } = req.body;
        // Get max sort_order
        const maxOrderResult = await pool.query('SELECT COALESCE(MAX(sort_order), 0) as max_order FROM hero_slides');
        const newOrder = maxOrderResult.rows[0].max_order + 1;

        const { rows } = await pool.query(
            'INSERT INTO hero_slides (image_url, title, sort_order, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
            [image_url, title || '', newOrder, is_active !== false]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update hero slide
app.put('/api/hero-slides/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { image_url, title, is_active } = req.body;
        const { rows } = await pool.query(
            'UPDATE hero_slides SET image_url = $1, title = $2, is_active = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
            [image_url, title || '', is_active, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Slide not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reorder hero slides
app.put('/api/hero-slides/reorder', async (req, res) => {
    try {
        const { slides } = req.body; // Array of { id, sort_order }
        for (const slide of slides) {
            await pool.query(
                'UPDATE hero_slides SET sort_order = $1, updated_at = NOW() WHERE id = $2',
                [slide.sort_order, slide.id]
            );
        }
        const { rows } = await pool.query('SELECT * FROM hero_slides ORDER BY sort_order ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete hero slide
app.delete('/api/hero-slides/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM hero_slides WHERE id = $1', [id]);
        res.json({ message: 'Slide deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload slide image
app.post('/api/hero-slides/upload', uploadSlide.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const imageUrl = `http://localhost:${PORT}/uploads/slides/${req.file.filename}`;
        res.json({ image_url: imageUrl, filename: req.file.filename });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Content Management API ---

app.get('/api/content', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM content_sections');
        const contentMap = {};
        result.rows.forEach(row => {
            contentMap[row.key] = row;
        });
        res.json(contentMap);
    } catch (err) {
        console.error('Error fetching content:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/content/:key', async (req, res) => {
    const { key } = req.params;
    try {
        const result = await pool.query('SELECT * FROM content_sections WHERE key = $1', [key]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Content not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching content:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/content/:key', async (req, res) => {
    const { key } = req.params;
    const { title, content, icon } = req.body;
    try {
        // Using UPSERT (Insert on conflict update)
        const result = await pool.query(
            `INSERT INTO content_sections (key, title, content, icon, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             ON CONFLICT (key) 
             DO UPDATE SET 
                title = EXCLUDED.title, 
                content = EXCLUDED.content, 
                icon = EXCLUDED.icon,
                updated_at = NOW()
             RETURNING *`,
            [key, title, content, icon] // icon can be null/undefined
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating content:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- Gallery API ---

app.get('/api/gallery', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM gallery_items ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/gallery/upload', (req, res) => {
    uploadGallery.single('image')(req, res, async (err) => {
        if (err) {
            console.error('Multer upload error:', err);
            return res.status(500).json({ error: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            const imageUrl = `http://localhost:${PORT}/uploads/gallery/${req.file.filename}`;
            res.json({ image_url: imageUrl, filename: req.file.filename });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
});

app.post('/api/gallery', async (req, res) => {
    try {
        const { image_url, caption, category } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO gallery_items (image_url, caption, category) VALUES ($1, $2, $3) RETURNING *',
            [image_url, caption || '', category || 'general']
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/gallery/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { caption, category, image_url } = req.body;
        const { rows } = await pool.query(
            'UPDATE gallery_items SET caption = $1, category = $2, image_url = COALESCE($4, image_url) WHERE id = $3 RETURNING *',
            [caption, category, id, image_url]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/gallery/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('DELETE FROM gallery_items WHERE id = $1 RETURNING *', [id]);
        if (rows.length > 0) {
            // Optional: Delete file from filesystem
            try {
                const imageUrl = rows[0].image_url;
                const filename = imageUrl.split('/').pop();
                const filePath = path.join(galleryDir, filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                console.error('Error deleting gallery file:', e);
            }
        }
        res.json({ message: 'Gallery item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
