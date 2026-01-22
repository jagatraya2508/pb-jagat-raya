import pool from './db.js';

const createGalleryTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS gallery_items (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                image_url TEXT NOT NULL,
                caption TEXT,
                category TEXT DEFAULT 'general',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('Gallery items table created successfully.');
    } catch (error) {
        console.error('Error creating gallery items table:', error);
    } finally {
        process.exit();
    }
};

createGalleryTable();
