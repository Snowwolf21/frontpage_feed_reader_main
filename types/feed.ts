
// Types// ─────────────────────────────────────────────

// The extra fields we ask rss-parser to pull from each item
export type CustomItem = {
  'contentEncoded'?: string;
  'mediaContent'?: { $: { url?: string } };
};

// The extra fields we ask rss-parser to pull from the feed itself
export type CustomFeed = Record<string, never>;

// What our API returns for a single article
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

// What our API returns for a full feed
export interface FeedResponse {
  title: string;
  description: string | null;
  link: string;
  feedUrl: string;
  image: string | null;
  lastUpdated: string | null;
  items: NormalizedItem[];
}

// What our API returns for a feed preview (no items)
export interface FeedPreviewResponse {
  title: string;
  description: string | null;
  link: string;
  image: string | null;
  itemCount: number;
}

// A single entry in the /multi response — either success or failure
export type MultiFeedEntry =
  | { url: string; ok: true;  title: string; description: string | null; image: string | null; items: NormalizedItem[] }
  | { url: string; ok: false; error: string };
