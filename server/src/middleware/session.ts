import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

export const SESSION_COOKIE = 'shop_sid';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

declare module 'express-serve-static-core' {
  interface Request {
    sessionId: string;
  }
}

/**
 * Gives every visitor an anonymous session id in a signed, httpOnly cookie.
 * The id keys the server-side cart, so carts survive page reloads without an account.
 */
export const session: RequestHandler = (req, res, next) => {
  const existing: unknown = req.signedCookies?.[SESSION_COOKIE];
  const sessionId = typeof existing === 'string' && existing.length > 0 ? existing : randomUUID();

  req.sessionId = sessionId;
  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    // Behind HTTPS (e.g. Netlify) req.secure is true thanks to `trust proxy`, so the cookie is marked Secure.
    secure: req.secure,
    signed: true,
    maxAge: THIRTY_DAYS_MS,
  });
  next();
};
