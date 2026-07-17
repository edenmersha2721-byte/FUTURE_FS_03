import { pool, query } from '../config/db.js';

const run = async () => {
  try {
    console.log('Applying notifications migration…');
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type       VARCHAR(40) NOT NULL DEFAULT 'info',
        title      VARCHAR(160) NOT NULL,
        message    TEXT,
        link       VARCHAR(200),
        is_read    BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read)');
    console.log('✅ Notifications table ready.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
