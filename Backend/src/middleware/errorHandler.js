import { ApiError } from '../utils/ApiError.js';
import { isProd } from '../config/env.js';

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  // Postgres unique violation
  if (err.code === '23505') {
    statusCode = 409;
    message = 'A record with these details already exists';
  }
  // Postgres FK / invalid text representation
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Related record does not exist';
  }
  if (err.code === '22P02') {
    statusCode = 400;
    message = 'Invalid input value';
  }

  if (statusCode >= 500) {
    console.error('💥', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { errors: details } : {}),
    ...(isProd ? {} : { stack: err.stack }),
  });
};
