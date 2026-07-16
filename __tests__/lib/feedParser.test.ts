import { describe, it, expect } from "vitest";
import {
  normalizeItem,
  validateHttpUrl,
  classifyError,
} from "@/app/api/feeds/_lib/feedParser";
import type { CustomItem } from "@/app/api/feeds/_lib/feedParser";
import type Parser from "rss-parser";

// Helper: build a minimal parser item with optional overrides
function makeItem(
  overrides: Partial<Parser.Item & CustomItem> = {}
): Parser.Item & CustomItem {
  return {
    title: "Test Article",
    link: "https://example.com/article",
    pubDate: "Mon, 01 Jan 2024 00:00:00 GMT",
    isoDate: "2024-01-01T00:00:00.000Z",
    creator: "Jane Doe",
    contentSnippet: "Short summary",
    content: "<p>Full content</p>",
    categories: ["Tech", "News"],
    guid: "https://example.com/article#guid",
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
describe("normalizeItem", () => {
  it("maps all fields from a complete parser item", () => {
    const item = makeItem({
      contentEncoded: "<p>Encoded content</p>",
      mediaContent: { $: { url: "https://example.com/thumb.jpg" } },
    });

    const result = normalizeItem(item);

    expect(result.title).toBe("Test Article");
    expect(result.link).toBe("https://example.com/article");
    expect(result.pubDate).toBe("Mon, 01 Jan 2024 00:00:00 GMT");
    expect(result.author).toBe("Jane Doe");
    expect(result.summary).toBe("Short summary");
    // contentEncoded takes priority over content
    expect(result.content).toBe("<p>Encoded content</p>");
    expect(result.thumbnail).toBe("https://example.com/thumb.jpg");
    expect(result.categories).toEqual(["Tech", "News"]);
    expect(result.guid).toBe("https://example.com/article#guid");
  });

  it("falls back gracefully when optional fields are absent", () => {
    const result = normalizeItem(
      makeItem({
        title: undefined,
        link: undefined,
        pubDate: undefined,
        isoDate: undefined,   // must also clear isoDate — it is the fallback for pubDate
        creator: undefined,
        contentSnippet: undefined,
        content: undefined,
        categories: undefined,
        guid: undefined,
        mediaContent: undefined,
      })
    );

    expect(result.title).toBe("Untitled");
    expect(result.link).toBe("");
    expect(result.pubDate).toBeNull();
    expect(result.author).toBeNull();
    expect(result.summary).toBeNull();
    expect(result.content).toBe("");
    expect(result.thumbnail).toBeNull();
    expect(result.categories).toEqual([]);
    expect(result.guid).toBeNull();
  });

  it("prefers contentEncoded over content over contentSnippet", () => {
    const withAll = normalizeItem(
      makeItem({
        contentEncoded: "encoded",
        content: "content",
        contentSnippet: "snippet",
      })
    );
    expect(withAll.content).toBe("encoded");

    const withoutEncoded = normalizeItem(
      makeItem({
        contentEncoded: undefined,
        content: "content",
        contentSnippet: "snippet",
      })
    );
    expect(withoutEncoded.content).toBe("content");

    const snippetOnly = normalizeItem(
      makeItem({
        contentEncoded: undefined,
        content: undefined,
        contentSnippet: "snippet",
      })
    );
    expect(snippetOnly.content).toBe("snippet");
  });

  it("filters non-string values out of categories array", () => {
    const result = normalizeItem(
      makeItem({
        categories: ["Tech", 42 as unknown as string, null as unknown as string, "News"],
      })
    );
    expect(result.categories).toEqual(["Tech", "News"]);
  });

  it("falls back link → guid for the guid field", () => {
    const result = normalizeItem(
      makeItem({ guid: undefined, link: "https://example.com/link" })
    );
    expect(result.guid).toBe("https://example.com/link");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("validateHttpUrl", () => {
  it("returns ok: true for a valid https URL", () => {
    const result = validateHttpUrl("https://example.com/feed.xml");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.url.hostname).toBe("example.com");
    }
  });

  it("returns ok: true for a valid http URL", () => {
    const result = validateHttpUrl("http://feeds.example.org/rss");
    expect(result.ok).toBe(true);
  });

  it("rejects ftp:// protocol", () => {
    const result = validateHttpUrl("ftp://example.com/feed");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("http");
    }
  });

  it("rejects javascript: protocol", () => {
    const result = validateHttpUrl("javascript:alert(1)");
    expect(result.ok).toBe(false);
  });

  it("rejects malformed input", () => {
    const result = validateHttpUrl("not a url at all");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("Invalid URL");
    }
  });

  it("rejects empty string", () => {
    expect(validateHttpUrl("").ok).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("classifyError", () => {
  it("returns 504 for abort/timeout errors", () => {
    const abortError = Object.assign(new Error("abort"), { name: "AbortError" });
    expect(classifyError(abortError).status).toBe(504);

    const timeoutMsg = new Error("timeout exceeded");
    expect(classifyError(timeoutMsg).status).toBe(504);

    const etimedout = Object.assign(new Error("connection failed"), { code: "ETIMEDOUT" });
    expect(classifyError(etimedout).status).toBe(504);
  });

  it("returns 422 for invalid XML errors", () => {
    expect(classifyError(new Error("Invalid XML format")).status).toBe(422);
    expect(classifyError(new Error("Non-whitespace before first tag")).status).toBe(422);
    expect(classifyError(new Error("Unexpected close tag")).status).toBe(422);
  });

  it("returns 502 for connection reset", () => {
    const connReset = Object.assign(new Error("socket hang up"), { code: "ECONNRESET" });
    expect(classifyError(connReset).status).toBe(502);
  });

  it("returns 502 for unknown errors", () => {
    expect(classifyError(new Error("something weird")).status).toBe(502);
    expect(classifyError("a string error").status).toBe(502);
    expect(classifyError({ code: "EUNKNOWN" }).status).toBe(502);
  });
});
