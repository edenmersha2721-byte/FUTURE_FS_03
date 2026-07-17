import { pool, query } from '../config/db.js';

const run = async () => {
  try {
    console.log('Applying reviews moderation migration…');
    // New reviews are pending until an admin approves them.
    await query('ALTER TABLE reviews ALTER COLUMN is_approved SET DEFAULT FALSE');
    // Three-state moderation: pending → approved / rejected.
    // is_approved is kept in sync (TRUE only when approved) for the public feed.
    await query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending'`);
    // Backfill: already-approved rows become 'approved'; the rest stay 'pending'.
    await query(`UPDATE reviews SET status = 'approved' WHERE is_approved = TRUE AND status <> 'approved'`);
    // Index the columns we filter by.
    await query('CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved)');
    await query('CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status)');
    console.log('✅ Reviews now use approve/reject moderation. Existing reviews keep their current status.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
