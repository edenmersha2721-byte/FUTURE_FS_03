import { ApiError } from './ApiError.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (v) => typeof v === 'string' && EMAIL_RE.test(v.trim());

/** Throw a 400 with field errors if any required field is missing/blank. */
export const requireFields = (body, fields) => {
  const errors = {};
  for (const f of fields) {
    const val = body[f];
    if (val === undefined || val === null || String(val).trim() === '') {
      errors[f] = `${f} is required`;
    }
  }
  if (Object.keys(errors).length) {
    throw ApiError.badRequest('Validation failed', errors);
  }
};

/** Coerce a truthy/falsey-ish value (checkbox, "true"/"false") into boolean. */
export const toBool = (v) => {
  if (typeof v === 'boolean') return v;
  if (v === undefined || v === null) return undefined;
  return ['true', '1', 'yes', 'on'].includes(String(v).toLowerCase());
};
