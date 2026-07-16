import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import {
  classifyError,
  FeedResponse,
  normalizeItem,
  validateSafeUrl,
} from "../_lib/feedParser";

import { feedFetchLimiter } from "@/app/lib/rateLimiter/feed";
import Parser from "rss-parser";

const MAX_FEED_BYTES = 5 * 1024 * 1024; // 5 MB hard cap — prevents OOM via huge feeds

async function fetchWithTimeoutAndRetry(
  url: string,
  options: RequestInit,
  timeoutMs: number = 4500,
  retries: number = 2
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timer);

      // If it returned a server error or rate limit, throw to retry it
      if (response.status === 429 || (response.status >= 500 && response.status <= 599)) {
        throw new Error(`HTTP status ${response.status}`);
      }

      return response;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt < retries - 1) {
        // Wait 500ms before retrying to allow socket release or remote rate limit resolution
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
  throw lastError;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const raw = req.nextUrl.searchParams.get("url");

  if (!raw) {
    return NextResponse.json(
      { error: "Missing required query parameter: url" },
      { status: 400 }
    );
  }

  // SSRF protection: block private/loopback IPs and local hostnames
  const validation = await validateSafeUrl(raw);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  // Rate limiting — prefer x-real-ip (trusted Vercel proxy) over x-forwarded-for (spoofable)
  const clientIp =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "127.0.0.1";

  const urlHash = crypto.createHash("sha256").update(raw).digest("hex");
  const identifier = `feed-fetch:${clientIp}:${urlHash}`;

  const { success } = await feedFetchLimiter.limit(identifier);
  if (!success) {
    return NextResponse.json(
      { error: "Too many feed requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const fetchResponse = await fetchWithTimeoutAndRetry(raw, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "application/rss+xml, application/atom+xml, text/xml, application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
      },
    });

    if (!fetchResponse.ok) {
      return NextResponse.json(
        {
          error: `Remote feed server returned status ${fetchResponse.status}`,
        },
        { status: fetchResponse.status === 404 ? 404 : 502 }
      );
    }

    // Enforce 5MB body size limit to prevent OOM from adversarial feeds
    const contentLength = fetchResponse.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_FEED_BYTES) {
      return NextResponse.json(
        { error: "Feed exceeds the maximum allowed size of 5 MB." },
        { status: 413 }
      );
    }

    // Stream body with manual byte counting — catches servers that lie about content-length
    const reader = fetchResponse.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: "Empty feed response." }, { status: 502 });
    }

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_FEED_BYTES) {
        reader.cancel();
        return NextResponse.json(
          { error: "Feed exceeds the maximum allowed size of 5 MB." },
          { status: 413 }
        );
      }
      chunks.push(value);
    }

    const xmlText = new TextDecoder().decode(
      chunks.reduce((acc, chunk) => {
        const merged = new Uint8Array(acc.length + chunk.length);
        merged.set(acc, 0);
        merged.set(chunk, acc.length);
        return merged;
      }, new Uint8Array(0))
    );

    const safeParser = new Parser();
    const feed = await safeParser.parseString(xmlText);

    const response: FeedResponse = {
      title: feed.title || "Untitled Feed",
      description: feed.description || null,
      link: feed.link || raw,
      feedUrl: feed.feedUrl || raw,
      image: feed.image?.url || null,
      lastUpdated: feed.lastBuildDate || null,
      items: (feed.items || []).slice(0, 50).map(normalizeItem),
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isTimeout =
      (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("abort");

    if (isTimeout) {
      return NextResponse.json(
        { error: "The remote feed server took too long to respond." },
        { status: 504 }
      );
    }

    if (errorMessage.startsWith("HTTP status ")) {
      const statusStr = errorMessage.replace("HTTP status ", "");
      const status = parseInt(statusStr, 10);
      return NextResponse.json(
        { error: `Remote feed server returned status ${status}` },
        { status: status === 404 ? 404 : 502 }
      );
    }

    const { status, message } = classifyError(err);
    return NextResponse.json({ error: message }, { status });
  }
}