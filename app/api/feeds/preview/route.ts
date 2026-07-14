import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  FeedPreviewResponse,
  parser,
  validateSafeUrl,
} from "../_lib/feedParser";

import { feedPreviewLimiter } from "@/app/lib/rateLimiter/feed";
import { createIdentifier } from "@/app/lib/rateLimiter/utils";
import { getUserIdFromRequest } from "@/utils/auth";

export async function GET(
  req: NextRequest
): Promise<NextResponse> {
  try {
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

    const validation = await validateSafeUrl(raw);

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
     * Rate limiting
     */

    const userId = getUserIdFromRequest(req);

    const urlHash = crypto
      .createHash("sha256")
      .update(raw)
      .digest("hex");

    const identifier = userId
      ? `feed-preview:${userId}:${urlHash}`
      : `${createIdentifier(
          "feed-preview",
          req
        )}:${urlHash}`;

    const { success } =
      await feedPreviewLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          error:
            "Too many preview requests. Please try again later.",
        },
        {
          status: 429,
        }
      );
    }

    /**
     * Fetch preview
     */

    const feed = await parser.parseURL(raw);

    const response: FeedPreviewResponse = {
      title: feed.title || "Untitled Feed",
      description: feed.description || null,
      link: feed.link || raw,
      image: feed.image?.url || null,
      itemCount: feed.items?.length ?? 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Feed preview error:", error);

    return NextResponse.json(
      {
        error:
          "Could not load feed preview. Check the URL and try again.",
      },
      {
        status: 422,
      }
    );
  }
}