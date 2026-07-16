/**
 * Tests for GET /api/feeds/fetch
 *
 * External HTTP calls are intercepted by MSW so no real network requests are made.
 * The SSRF guard (validateSafeUrl) is tested against known private IPs directly.
 */
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// ── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("@/app/lib/rateLimiter/feed", () => ({
  feedFetchLimiter: {
    limit: vi.fn().mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: 0, pending: Promise.resolve() }),
  },
}));

// We need DNS to resolve cleanly for the public feed URL in tests
vi.mock("dns", () => ({
  default: {
    promises: {
      lookup: vi.fn().mockResolvedValue([{ address: "93.184.216.34", family: 4 }]),
    },
  },
  promises: {
    lookup: vi.fn().mockResolvedValue([{ address: "93.184.216.34", family: 4 }]),
  },
}));

import { feedFetchLimiter } from "@/app/lib/rateLimiter/feed";

// ── MSW Server ────────────────────────────────────────────────────────────────
const FEED_URL = "https://example-feed.com/feed.xml";

const VALID_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <link>https://example-feed.com</link>
    <description>A test feed</description>
    <item>
      <title>Article One</title>
      <link>https://example-feed.com/1</link>
      <guid>https://example-feed.com/1</guid>
      <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

const server = setupServer(
  http.get(FEED_URL, () =>
    HttpResponse.xml(VALID_RSS, { status: 200 })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Helper ────────────────────────────────────────────────────────────────────
function makeRequest(url: string | null) {
  const searchParams = url ? `?url=${encodeURIComponent(url)}` : "";
  return new NextRequest(`http://localhost/api/feeds/fetch${searchParams}`, {
    headers: { "x-real-ip": "1.2.3.4" },
  });
}

import { GET } from "@/app/api/feeds/fetch/route";

// ── Tests ────────────────────────────────────────────────────────────────────
describe("GET /api/feeds/fetch", () => {
  it("returns 400 when url param is missing", async () => {
    const res = await GET(makeRequest(null));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/missing/i);
  });

  it("returns 400 for a private IP (SSRF guard — 127.0.0.1)", async () => {
    const res = await GET(makeRequest("http://127.0.0.1/feed"));
    expect(res.status).toBe(400);
  });

  it("returns 400 for a private IP range (10.0.0.1)", async () => {
    const res = await GET(makeRequest("http://10.0.0.1/feed"));
    expect(res.status).toBe(400);
  });

  it("returns 400 for localhost by name", async () => {
    const res = await GET(makeRequest("http://localhost/feed"));
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-http URLs", async () => {
    const res = await GET(makeRequest("ftp://example.com/feed"));
    expect(res.status).toBe(400);
  });

  it("returns 200 with parsed FeedResponse for a valid RSS feed", async () => {
    const res = await GET(makeRequest(FEED_URL));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe("Test Feed");
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items[0].title).toBe("Article One");
  });

  it("returns 404/502 when remote feed server returns 404", async () => {
    server.use(
      http.get(FEED_URL, () => HttpResponse.json({}, { status: 404 }))
    );
    const res = await GET(makeRequest(FEED_URL));
    expect([404, 502]).toContain(res.status);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    vi.mocked(feedFetchLimiter.limit).mockResolvedValueOnce({
      success: false, limit: 10, remaining: 0, reset: 0, pending: Promise.resolve()
    });
    const res = await GET(makeRequest(FEED_URL));
    expect(res.status).toBe(429);
  });

  it("returns 504 when the remote server does not respond in time", async () => {
    server.use(
      // Simulate a slow server by returning a promise that never resolves inside a delay
      http.get(FEED_URL, async () => {
        // Delay longer than the route's 8s timeout — we rely on route's abort to resolve
        await new Promise((resolve) => setTimeout(resolve, 15000));
        return HttpResponse.xml(VALID_RSS);
      })
    );
    // This test can be slow if the timeout isn't firing; set a 10s test timeout
    const res = await GET(makeRequest(FEED_URL));
    expect(res.status).toBe(504);
  }, 12000);

  it("returns 413 when feed body exceeds 5 MB", async () => {
    // Generate a body string larger than 5MB
    const bigBody = "x".repeat(5 * 1024 * 1024 + 1);
    server.use(
      http.get(FEED_URL, () =>
        new HttpResponse(bigBody, {
          status: 200,
          headers: { "Content-Length": String(bigBody.length), "Content-Type": "text/xml" },
        })
      )
    );
    const res = await GET(makeRequest(FEED_URL));
    expect(res.status).toBe(413);
  });
});
