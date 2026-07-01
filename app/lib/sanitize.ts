import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window as unknown as Window & typeof globalThis;
const purify = DOMPurify(window);

// Whitelist of safe HTML tags for feed content
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span'
];

const ALLOWED_ATTRIBUTES = {
  'a': ['href', 'title', 'target', 'rel'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
  'code': ['class'],
  'pre': ['class'],
  '*': ['class'] // Allow class for styling
};

export function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: Object.values(ALLOWED_ATTRIBUTES).flat(),
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  
  });
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    // Block localhost for production
    if (process.env.NODE_ENV === 'production') {
      if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export function sanitizeInput(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"'`]/g, ''); // Remove dangerous characters
}
