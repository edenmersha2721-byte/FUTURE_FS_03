import { pool, query } from '../config/db.js';

const run = async () => {
  try {
    console.log('Applying inspiration image-framing migration…');
    await query('ALTER TABLE inspirations ADD COLUMN IF NOT EXISTS image_pos_y INTEGER NOT NULL DEFAULT 50');
    await query('ALTER TABLE inspirations ADD COLUMN IF NOT EXISTS image_zoom NUMERIC(4,2) NOT NULL DEFAULT 1');
    console.log('✅ image_pos_y / image_zoom ready on inspirations.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
