import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Enable browser XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production' && request.headers.get('x-forwarded-proto') !== 'https') {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }

  // Strict-Transport-Security header
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // 1. FIXED: Dynamically inject local development channels only outside production
  const connectSrc = process.env.NODE_ENV === 'production'
    ? "connect-src 'self';"
    : "connect-src 'self' ws://127.0.0.1:* ws://localhost:* http://localhost:* http://127.0.0.1:* http://localhost:3000;";

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; ` +
    `script-src 'self' 'unsafe-inline' 'unsafe-eval'; ` +
    `style-src 'self' 'unsafe-inline'; ` +
    `img-src 'self' data: https:; ` +
    `font-src 'self' data:; ` +
    `${connectSrc} ` + // Injected fixed dynamic target
    `frame-ancestors 'none'; ` +
    `base-uri 'self'; ` +
    `form-action 'self'`
  );

  return response;
}

export const config = {
  // 2. FIXED: Removed _next/static exclusion so headers apply to dev server runtime frames
  matcher: ['/((?!_next/image|favicon.ico|api).*)'],
};
