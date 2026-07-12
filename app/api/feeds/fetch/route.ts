import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import {
  classifyError,
  FeedResponse,
  normalizeItem,
  parser,
  validateHttpUrl,
} from "../_lib/feedParser";

import { feedFetchLimiter } from "@/app/lib/rateLimiter/feed";
import { createIdentifier } from "@/app/lib/rateLimiter/utils";

export async function GET(
  req: NextRequest
): Promise<NextResponse> {
  const raw = req.nextUrl.searchParams.get("url");

  if (!raw) {
    return NextResponse.json(
      {
        error: "Missing required query parameter: url",
      },
      {
        status: 400,
      }
    );
  }

  const validation = validateHttpUrl(raw);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: validation.message,
      },
      {
        status: 400,
      }
    );
  }

  /**
   * Hash the feed URL so Redis doesn't store long URLs.
   */
  const urlHash = crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex");

  /**
   * Rate limit by IP + feed.
   */
  const identifier = `${createIdentifier(
    "feed-fetch",
    req
  )}:${urlHash}`;

  const { success } =
    await feedFetchLimiter.limit(identifier);

  if (!success) {
    return NextResponse.json(
      {
        error:
          "Too many feed requests. Please try again later.",
      },
      {
        status: 429,
      }
    );
  }

  try {
    const feed = await parser.parseURL(raw);

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
  } catch (err) {
    const { status, message } = classifyError(err);

    return NextResponse.json(
      {
        error: message,
      },
      {
        status,
      }
    );
  }
}