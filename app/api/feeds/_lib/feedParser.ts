import Parser from 'rss-parser';

export type CustomItem = {
  author?: string;
  contentEncoded?: string;
  mediaContent?: { $: { url?: string } };
};

type CustomFeed = Record<string, never>;

export interface NormalizedItem {
  title: string;
  link: string;
  pubDate: string | null;
  author: string | null;
  summary: string | null;
  content: string | null;
  thumbnail: string | null;
  categories: string[];
  guid: string | null;
}

export interface FeedResponse {
  title: string;
  description: string | null;
  link: string;
  feedUrl: string;
  image: string | null;
  lastUpdated: string | null;
  items: NormalizedItem[];
}

export interface FeedPreviewResponse {
  title: string;
  description: string | null;
  link: string;
  image: string | null;
  itemCount: number;
}

export type MultiFeedEntry =
  | {
      url: string;
      ok: true;
      title: string;
      description: string | null;
      image: string | null;
      items: NormalizedItem[];
    }
  | { url: string; ok: false; error: string };

// Core Static Parser Configuration Instance
export const parser = new Parser<CustomFeed, CustomItem>({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/atom+xml, text/xml, application/xml;q=0.9,*/*;q=0.8',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

export function normalizeItem(item: Parser.Item & CustomItem): NormalizedItem {
  // Safe helper to extract string values from potentially complex feed shapes
  const extractString = (value: unknown): string | null => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && '_' in value) return String((value as unknown as { _?: unknown })._);
    return null;
  };

  const rawContent = item.contentEncoded || item.content || item.contentSnippet || '';

  return {
    title: item.title || 'Untitled',
    link: item.link || item.guid || '',
    pubDate: item.pubDate || item.isoDate || null,
    author: item.creator || item.author || null,
    summary: item.contentSnippet || null,
    content: typeof rawContent === 'string' ? rawContent : extractString(rawContent),
    thumbnail: item.mediaContent?.$?.url || null,
    categories: Array.isArray(item.categories) ? item.categories.filter((c): c is string => typeof c === 'string') : [],
    guid: item.guid || item.link || null,
  };
}

// Private / reserved IP ranges that must never be fetched from the server side.
// Prevents SSRF attacks targeting cloud metadata services, internal networks, etc.
const PRIVATE_IP_PATTERN =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.0\.0\.|::1$|fd[0-9a-f]{2}:|fc[0-9a-f]{2}:)/i;

/** Validates URL format AND ensures the hostname is not a private/loopback address. */
export async function validateSafeUrl(
  raw: string
): Promise<{ ok: true; url: URL } | { ok: false; message: string }> {
  const httpCheck = validateHttpUrl(raw);
  if (!httpCheck.ok) return httpCheck;

  const { hostname } = httpCheck.url;

  // Block bare IP addresses that are obviously private without DNS resolution
  if (PRIVATE_IP_PATTERN.test(hostname)) {
    return { ok: false, message: 'Requests to private or reserved IP addresses are not allowed.' };
  }

  // Block localhost by name
  if (hostname === 'localhost' || hostname.endsWith('.local')) {
    return { ok: false, message: 'Requests to localhost or local network hosts are not allowed.' };
  }

  return httpCheck;
}

export function validateHttpUrl(raw: string): { ok: true; url: URL } | { ok: false; message: string } {
  try {
    // Standardized WHATWG URL Constructor validation engine
    const parsed = new URL(raw);
    
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { ok: false, message: 'Only http and https URLs are allowed.' };
    }
    
    return { ok: true, url: parsed };
  } catch {
    return { ok: false, message: 'Invalid URL format.' };
  }
}

export function classifyError(err: unknown): { status: number; message: string } {
  const message = err instanceof Error ? err.message : String(err);
  
  // Safe runtime identification of native network system codes without relying on NodeJS globals
  const code = err && typeof err === 'object' && 'code' in err 
    ? String((err as Record<string, unknown>).code) 
    : '';

  if (message.includes('Status code') || code === 'ECONNRESET') {
    return { status: 502, message: `The feed server returned an error: ${message}` };
  }

  if (message.includes('timeout') || code === 'ETIMEDOUT' || code === 'ECONNTIMEOUT' || message.includes('abort')) {
    return { status: 504, message: 'The feed took too long to respond.' };
  }

  if (message.includes('Invalid XML') || message.includes('Non-whitespace') || message.includes('Unexpected close tag')) {
    return { status: 422, message: 'The URL did not return a valid RSS or Atom feed.' };
  }

  // Network or other external gateway connection errors should return 502 Bad Gateway
  return { status: 502, message: `Could not fetch feed: ${message}` };
}
