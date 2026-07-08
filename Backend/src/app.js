import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { UPLOAD_DIR } from './middleware/upload.js';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(
  cors({
    origin: env.clientUrl === '*' ? true : [env.clientUrl, 'http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/', (req, res) =>
  res.json({ success: true, message: 'Luxe Salon API', docs: '/api/health' })
);

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
