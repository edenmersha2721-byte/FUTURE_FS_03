import { pool, query } from '../config/db.js';

const run = async () => {
  try {
    console.log('Applying inspiration-booking migration…');
    await query('ALTER TABLE inspirations ADD COLUMN IF NOT EXISTS preferred_date DATE');
    await query('ALTER TABLE inspirations ADD COLUMN IF NOT EXISTS preferred_time TIME');
    await query('ALTER TABLE inspirations ADD COLUMN IF NOT EXISTS appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL');
    await query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS inspiration_image TEXT');
    console.log('✅ Inspiration-booking columns ready.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
