import crypto from "crypto";

import { NextRequest, NextResponse } from "next/server";

import {
  MultiFeedEntry,
  normalizeItem,
  parser,
  validateHttpUrl,
} from "../_lib/feedParser";

import { multiFeedLimiter } from "@/app/lib/rateLimiter/feed";
import { createIdentifier } from "@/app/lib/rateLimiter/utils";
import { getUserIdFromRequest } from "@/utils/auth";

export async function POST(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const body = await req.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        {
          error: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const { urls } = body as {
      urls?: unknown;
    };

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        {
          error:
            'Body must include a non-empty "urls" array.',
        },
        {
          status: 400,
        }
      );
    }

    if (urls.length > 20) {
      return NextResponse.json(
        {
          error:
            "Maximum 20 feed URLs per request.",
        },
        {
          status: 400,
        }
      );
    }

    const urlStrings = urls.filter(
      (url): url is string =>
        typeof url === "string"
    );

    if (urlStrings.length !== urls.length) {
      return NextResponse.json(
        {
          error:
            'Every entry in "urls" must be a string.',
        },
        {
          status: 400,
        }
      );
    }

    // Validate URLs before fetching
    for (const url of urlStrings) {
      const validation = validateHttpUrl(url);

      if (!validation.ok) {
        return NextResponse.json(
          {
            error: `${url}: ${validation.message}`,
          },
          {
            status: 400,
          }
        );
      }
    }

    /**
     * Rate limit
     */

    const userId = getUserIdFromRequest(req);

    const requestHash = crypto
      .createHash("sha256")
      .update(urlStrings.sort().join(","))
      .digest("hex");

    const identifier = userId
      ? `multi-feed:${userId}:${requestHash}`
      : `${createIdentifier(
          "multi-feed",
          req
        )}:${requestHash}`;

    const { success } =
      await multiFeedLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          error:
            "Too many feed aggregation requests. Please try again later.",
        },
        {
          status: 429,
        }
      );
    }

    /**
     * Fetch feeds concurrently
     */

    const results =
      await Promise.allSettled(
        urlStrings.map((url) =>
          parser.parseURL(url)
        )
      );

    const feeds: MultiFeedEntry[] =
      results.map((result, index) => {
        const url = urlStrings[index];

        if (result.status === "fulfilled") {
          const feed = result.value;

          return {
            url,
            ok: true,
            title:
              feed.title ||
              "Untitled Feed",
            description:
              feed.description || null,
            image:
              feed.image?.url || null,
            items: (feed.items || [])
              .slice(0, 20)
              .map(normalizeItem),
          };
        }

        return {
          url,
          ok: false,
          error:
            result.reason instanceof Error
              ? result.reason.message
              : "Unknown error",
        };
      });

    return NextResponse.json(
      {
        feeds,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Multi-feed error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}