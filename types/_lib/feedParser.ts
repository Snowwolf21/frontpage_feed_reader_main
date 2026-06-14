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

export const parser = new Parser<CustomFeed, CustomItem>({
  timeout: 10000,
  headers: {
    'User-Agent': 'RSS-Aggregator/1.0',
    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

export function normalizeItem(item: Parser.Item & CustomItem): NormalizedItem {
  return {
    title: item.title || 'Untitled',
    link: item.link || item.guid || '',
    pubDate: item.pubDate || item.isoDate || null,
    author: item.creator || item.author || null,
    summary: item.contentSnippet || null,
    content: item.contentEncoded || item.content || item.contentSnippet || null,
    thumbnail: item.mediaContent?.$?.url || null,
    categories: item.categories || [],
    guid: item.guid || item.link || null,
  };
}

export function validateHttpUrl(raw: string): { ok: true; url: URL } | { ok: false; message: string } {
  let parsed: URL;

  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, message: 'Invalid URL format.' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { ok: false, message: 'Only http and https URLs are allowed.' };
  }

  return { ok: true, url: parsed };
}

export function classifyError(err: unknown): { status: number; message: string } {
  const message = err instanceof Error ? err.message : String(err);
  const code = (err as NodeJS.ErrnoException).code;

  if (message.includes('Status code')) {
    return { status: 502, message: `The feed server returned an error: ${message}` };
  }

  if (message.includes('timeout') || code === 'ETIMEDOUT') {
    return { status: 504, message: 'The feed took too long to respond.' };
  }

  if (message.includes('Invalid XML') || message.includes('Non-whitespace')) {
    return { status: 422, message: 'The URL did not return a valid RSS or Atom feed.' };
  }

  return { status: 500, message: `Could not fetch feed: ${message}` };
}
