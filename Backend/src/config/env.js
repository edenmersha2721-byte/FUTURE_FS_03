import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from Backend root regardless of CWD
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  db: {
    connectionString: process.env.DATABASE_URL || undefined,
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'beauty_salon_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@luxesalon.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    name: process.env.ADMIN_NAME || 'Salon Admin',
  },

  mail: {
    apiKey: process.env.RESEND_API_KEY || '',
    // Must be an address on a domain verified in Resend. For quick testing use
    // 'onboarding@resend.dev' (only delivers to your Resend account email).
    from: process.env.MAIL_FROM || 'Amra Beauty <onboarding@resend.dev>',
    salonName: process.env.SALON_NAME || 'Amra Beauty',
  },
};

export const isProd = env.nodeEnv === 'production';
