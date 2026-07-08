import { verifyToken } from '../utils/token.js';
import { ApiError } from '../utils/ApiError.js';
import { query } from '../config/db.js';

/** Require a valid JWT. Attaches req.user = { id, role, name, email }. */
export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized('Authentication required');

    const decoded = verifyToken(token);
    const { rows } = await query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = rows[0];
    if (!user) throw ApiError.unauthorized('User no longer exists');
    if (!user.is_active) throw ApiError.forbidden('Account is deactivated');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Invalid or expired token'));
    }
    next(err);
  }
};

/** Require the authenticated user to have a specific role. */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have access to this resource'));
  }
  next();
};

export const requireAdmin = requireRole('admin');
