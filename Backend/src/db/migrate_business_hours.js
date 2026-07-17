import { pool, query } from '../config/db.js';

const run = async () => {
  try {
    console.log('Applying business-hours migration…');

    // Weekly recurring hours: one row per day of week (0=Sunday … 6=Saturday).
    await query(`
      CREATE TABLE IF NOT EXISTS business_hours (
        day_of_week INTEGER PRIMARY KEY CHECK (day_of_week BETWEEN 0 AND 6),
        is_open     BOOLEAN NOT NULL DEFAULT TRUE,
        open_time   TIME NOT NULL DEFAULT '09:00',
        close_time  TIME NOT NULL DEFAULT '19:00'
      )
    `);

    // One-off closed dates / holidays (override the weekly schedule).
    await query(`
      CREATE TABLE IF NOT EXISTS closed_dates (
        id         SERIAL PRIMARY KEY,
        date       DATE NOT NULL UNIQUE,
        reason     VARCHAR(160),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Seed defaults once: Mon–Sat 09:00–19:00, Sunday closed.
    for (let d = 0; d <= 6; d++) {
      const isOpen = d !== 0; // Sunday closed by default
      await query(
        `INSERT INTO business_hours (day_of_week, is_open, open_time, close_time)
         VALUES ($1, $2, '09:00', '19:00')
         ON CONFLICT (day_of_week) DO NOTHING`,
        [d, isOpen]
      );
    }

    console.log('✅ Business hours tables ready.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
