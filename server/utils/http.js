import mongoose from 'mongoose';

/** Error with an HTTP status. Thrown anywhere in a controller, formatted by errorHandler. */
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Wraps an async route handler so rejected promises reach the error middleware (Express 4 does not do this). */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const isValidId = (id) => typeof id === 'string' && mongoose.isValidObjectId(id) && id.length === 24;

/** router.param() callback factory: rejects malformed ObjectIds before they hit Mongoose. */
export const validateIdParam = (label) => (req, _res, next, value) => {
  if (!isValidId(value)) return next(new HttpError(400, `Invalid ${label} id`));
  next();
};

export function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Every error leaves the API in the same shape: { message, details? }
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, ...(err.details ? { details: err.details } : {}) });
  }
  if (err?.name === 'ValidationError') {
    const details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
    return res.status(400).json({ message: Object.values(details)[0] || 'Validation failed', details });
  }
  if (err?.name === 'CastError') return res.status(400).json({ message: `Invalid value for ${err.path}` });
  if (err?.code === 11000) return res.status(409).json({ message: 'That value is already in use' });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ message: 'Request body is not valid JSON' });
  if (err?.type === 'entity.too.large') return res.status(413).json({ message: 'Request body is too large' });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
}

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Trimmed string or undefined. Anything that is not a string is ignored rather than cast. */
export const str = (v) => (typeof v === 'string' ? v.trim() : undefined);
