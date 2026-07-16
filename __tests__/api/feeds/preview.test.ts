/**
 * Tests for GET /api/feeds/preview
 */
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// ── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("@/app/lib/rateLimiter/feed", () => ({
  feedPreviewLimiter: {
    limit: vi.fn().mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: 0, pending: Promise.resolve() }),
  },
  feedFetchLimiter: {
    limit: vi.fn().mockResolvedValue({ success: true }),
  },
}));
vi.mock("@/app/lib/rateLimiter/utils", () => ({
  createIdentifier: vi.fn().mockReturnValue("test-identifier"),
}));
vi.mock("@/utils/auth", () => ({
  getUserIdFromRequest: vi.fn().mockReturnValue(null),
}));
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

// ── MSW Server ────────────────────────────────────────────────────────────────
const FEED_URL = "https://preview-example.com/feed.xml";

const VALID_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Preview Feed</title>
    <link>https://preview-example.com</link>
    <description>A preview test feed</description>
    <item>
      <title>Item One</title>
      <link>https://preview-example.com/1</link>
    </item>
    <item>
      <title>Item Two</title>
      <link>https://preview-example.com/2</link>
    </item>
  </channel>
</rss>`;

const server = setupServer(
  http.get(FEED_URL, () => HttpResponse.xml(VALID_RSS, { status: 200 }))
);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeRequest(url: string | null) {
  const params = url ? `?url=${encodeURIComponent(url)}` : "";
  return new NextRequest(`http://localhost/api/feeds/preview${params}`, {
    headers: { "x-real-ip": "1.2.3.4" },
  });
}

import { GET } from "@/app/api/feeds/preview/route";

describe("GET /api/feeds/preview", () => {
  it("returns 400 when url param is missing", async () => {
    const res = await GET(makeRequest(null));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/missing/i);
  });

  it("returns 400 for private IP (SSRF guard)", async () => {
    const res = await GET(makeRequest("http://192.168.1.1/feed"));
    expect(res.status).toBe(400);
  });

  it("returns 200 with FeedPreviewResponse for a valid feed", async () => {
    const res = await GET(makeRequest(FEED_URL));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe("Preview Feed");
    expect(typeof body.itemCount).toBe("number");
    expect(body.itemCount).toBeGreaterThan(0);
  });
});
