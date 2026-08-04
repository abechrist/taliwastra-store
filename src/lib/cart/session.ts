export const CART_SESSION_COOKIE = 'taliwastra_session';

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export function cartCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  };
}
