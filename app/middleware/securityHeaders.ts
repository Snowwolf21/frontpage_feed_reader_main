import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Generate a secure, cryptographically random unique Nonce token per request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // 2. Set up a strict Content Security Policy utilizing the dynamic nonce string
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();

  // 3. Clone request headers to inject the nonce tracking reference for the Layout engine
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  // 4. Instantiate the response object passing downstream forward paths
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 5. Explicitly mirror the identical CSP structure to the active response headers
  response.headers.set('Content-Security-Policy', cspHeader);

  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Enable browser XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Enforce HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  return response;
}

// Optimized matcher to prevent running security computation loops across standard asset endpoints
export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
