import { pool, query } from '../config/db.js';

const run = async () => {
  try {
    console.log('Applying inspirations migration…');
    await query(`
      CREATE TABLE IF NOT EXISTS inspirations (
        id          SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name        VARCHAR(120) NOT NULL,
        email       VARCHAR(160) NOT NULL,
        phone       VARCHAR(40),
        note        TEXT,
        image_url   TEXT NOT NULL,
        status      VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_inspirations_status ON inspirations(status)');
    console.log('✅ Inspirations table ready.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
