import app from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';

const start = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL');
  } catch (err) {
    console.error('❌ Could not connect to PostgreSQL:', err.message);
    console.error('   Check your .env DB credentials and that the DB exists.');
  }

  app.listen(env.port, () => {
    console.log(`🚀 Luxe Salon API running on http://localhost:${env.port}`);
    console.log(`   Environment: ${env.nodeEnv}`);
  });
};

start();
