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

        // Get matches for this bracket
        const matchesResult = await pool.query(
            'SELECT * FROM bracket_matches WHERE bracket_id = $1 ORDER BY round ASC, position ASC',
            [bracket.id]
        );

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

        const players = registrations.rows;

        if (players.length < 2) {
            return res.status(400).json({ error: 'Minimal 2 peserta untuk generate bracket' });
        }

        // Shuffle players randomly
        const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

        // Calculate bracket size (next power of 2)
        const bracketSize = Math.pow(2, Math.ceil(Math.log2(players.length)));
        const totalRounds = Math.log2(bracketSize);

        // Create bracket record
        const bracketResult = await pool.query(
            'INSERT INTO tournament_brackets (tournament_id, category, bracket_type, total_rounds, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [tournament_id, category, 'single_elimination', totalRounds, 'active']
        );

        const bracket = bracketResult.rows[0];

        // Create first round matches
        const firstRoundMatches = bracketSize / 2;
        const matches = [];

        for (let i = 0; i < firstRoundMatches; i++) {
            const player1 = shuffledPlayers[i * 2] || null;
            const player2 = shuffledPlayers[i * 2 + 1] || null;

            // Determine player name based on whether it's doubles or singles
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

            // If only one player (bye), auto-advance
            if (player1 && !player2) {
                matchData.winner_id = player1.id;
                matchData.winner_name = getPlayerName(player1);
                matchData.status = 'completed';
            } else if (!player1 && player2) {
                matchData.winner_id = player2.id;
                matchData.winner_name = getPlayerName(player2);
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
async function processAutoAdvances(bracketId, totalRounds) {
    for (let round = 1; round < totalRounds; round++) {
        const completedMatches = await pool.query(
            `SELECT * FROM bracket_matches 
             WHERE bracket_id = $1 AND round = $2 AND status = 'completed' AND winner_id IS NOT NULL
             ORDER BY position ASC`,
            [bracketId, round]
        );

        for (const match of completedMatches.rows) {
            const nextRound = round + 1;
            const nextPosition = Math.ceil(match.position / 2);
            const isPlayer1 = match.position % 2 === 1;

            // Update next round match
            const updateField = isPlayer1 ?
                { id: 'player1_id', name: 'player1_name' } :
                { id: 'player2_id', name: 'player2_name' };

            await pool.query(
                `UPDATE bracket_matches 
                 SET ${updateField.id} = $1, ${updateField.name} = $2, updated_at = NOW()
                 WHERE bracket_id = $3 AND round = $4 AND position = $5`,
                [match.winner_id, match.winner_name, bracketId, nextRound, nextPosition]
            );
        }
    }
}

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
        let status = 'playing';

        if (player1_score !== null && player2_score !== null) {
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

        // Update match
        const updateResult = await pool.query(
            `UPDATE bracket_matches 
             SET player1_score = $1, player2_score = $2, winner_id = $3, winner_name = $4, 
                 court = $5, match_time = $6, status = $7, updated_at = NOW()
             WHERE id = $8 RETURNING *`,
            [player1_score, player2_score, winner_id, winner_name, court || null, match_time || null, status, id]
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
