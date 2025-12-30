-- =============================================
-- PB. JAGAT RAYA - Supabase Database Schema
-- =============================================

-- 1. Members Table
-- Stores badminton club members
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

-- 2. Tournaments Table
-- Stores tournament/championship information
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  registration_deadline DATE,
  categories TEXT, -- Comma separated: "Tunggal Putra, Ganda Putri"
  max_participants INTEGER DEFAULT 100,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tournament Registrations Table
-- Stores participant registrations for tournaments
CREATE TABLE IF NOT EXISTS tournament_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  partner_name TEXT, -- For doubles category
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Members policies
-- Admin can do everything
CREATE POLICY "Admin full access to members" ON members
  FOR ALL USING (auth.role() = 'authenticated');

-- Public can view members (optional - remove if not needed)
CREATE POLICY "Public can view members" ON members
  FOR SELECT USING (true);

-- Tournaments policies
-- Admin can do everything
CREATE POLICY "Admin full access to tournaments" ON tournaments
  FOR ALL USING (auth.role() = 'authenticated');

-- Public can view open tournaments
CREATE POLICY "Public can view tournaments" ON tournaments
  FOR SELECT USING (true);

-- Tournament Registrations policies
-- Admin can view all registrations
CREATE POLICY "Admin full access to registrations" ON tournament_registrations
  FOR ALL USING (auth.role() = 'authenticated');

-- Public can insert registrations (to register for tournaments)
CREATE POLICY "Public can register for tournaments" ON tournament_registrations
  FOR INSERT WITH CHECK (true);

-- Public can view their own registration (by email)
CREATE POLICY "Public can view own registrations" ON tournament_registrations
  FOR SELECT USING (true);

-- =============================================
-- Indexes for better performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_category ON members(category);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON tournament_registrations(tournament_id);

-- =============================================
-- Updated_at trigger function
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to members
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to tournaments
CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Sample data (optional - for testing)
-- =============================================

-- Uncomment below to insert sample data

/*
INSERT INTO tournaments (name, description, location, start_date, end_date, registration_deadline, categories, max_participants, status)
VALUES 
  ('Kejuaraan Bulutangkis JAGAT RAYA Cup 2025', 
   'Kejuaraan tahunan PB. JAGAT RAYA', 
   'GOR Bulutangkis JAGAT RAYA', 
   '2025-02-15', 
   '2025-02-16', 
   '2025-02-10', 
   'Tunggal Putra, Tunggal Putri, Ganda Putra, Ganda Putri, Ganda Campuran',
   100,
   'open');

INSERT INTO members (name, email, phone, category, status)
VALUES 
  ('Ahmad Pratama', 'ahmad@example.com', '081234567890', 'dewasa', 'aktif'),
  ('Siti Nurhaliza', 'siti@example.com', '082345678901', 'dewasa', 'aktif'),
  ('Budi Santoso', 'budi@example.com', '083456789012', 'anak', 'aktif');
*/
