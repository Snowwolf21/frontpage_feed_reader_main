import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import {
  classifyError,
  FeedResponse,
  normalizeItem,
  validateHttpUrl,
} from "../_lib/feedParser";

import { feedFetchLimiter } from "@/app/lib/rateLimiter/feed";
import Parser from "rss-parser";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const raw = req.nextUrl.searchParams.get("url");

  if (!raw) {
    return NextResponse.json(
      { error: "Missing required query parameter: url" },
      { status: 400 }
    );
  }

  const validation = validateHttpUrl(raw);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.message },
      { status: 400 }
    );
  }

  // 1. Safe String-Based Key Extraction for the Rate Limiter
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realtimeIp = req.headers.get('x-real-ip');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realtimeIp ?? '127.0.0.1';

  const urlHash = crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex");

  const identifier = `feed-fetch:${clientIp}:${urlHash}`;

  const { success } = await feedFetchLimiter.limit(identifier);
  if (!success) {
    return NextResponse.json(
      { error: "Too many feed requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    // 2. Fetch the XML raw text directly via modern web platform APIs
    const fetchResponse = await fetch(raw, {
      method: "GET",
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/atom+xml, text/xml, application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(7000), // Strict 7-second runtime ceiling
    });

    if (!fetchResponse.ok) {
      return NextResponse.json(
        { error: `Remote feed server returned a non-success status code: ${fetchResponse.status}` },
        { status: fetchResponse.status === 404 ? 404 : 502 }
      );
    }

    const xmlText = await fetchResponse.text();

    // 3. Parse the data strings locally using purely string-bound execution blocks
    const safeParser = new Parser();
    const feed = await safeParser.parseString(xmlText);

    const response: FeedResponse = {
      title: feed.title || "Untitled Feed",
      description: feed.description || null,
      link: feed.link || raw,
      feedUrl: feed.feedUrl || raw,
      image: feed.image?.url || null,
      lastUpdated: feed.lastBuildDate || null,
      items: (feed.items || [])
        .slice(0, 50)
        .map(normalizeItem),
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorCode = err && typeof err === 'object' && 'code' in err ? (err as Record<string, unknown>).code : '';

    // Handle connection timeout errors gracefully
    if (errorMessage.includes('timeout') || errorCode === 'ECONNTIMEOUT' || (err instanceof Error && err.name === 'TimeoutError')) {
      return NextResponse.json(
        { error: "The remote feed server took too long to respond. Connection aborted." },
        { status: 504 }
      );
    }

    // Pass the remaining typed errors through your custom adapter
    const { status, message } = classifyError(err);
    return NextResponse.json({ error: message }, { status });
  }
}