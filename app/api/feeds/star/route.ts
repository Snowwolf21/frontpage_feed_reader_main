import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import ArticleState from "@/app/model/articleStateModel";
import { getUserIdFromRequest } from "@/utils/auth";

import { starLimiter } from "@/lib/rateLimiter/star";
import { createIdentifier } from "@/app/lib/rateLimiter/utils";

export async function PATCH(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limit
    const identifier = createIdentifier(
      `article:star:${userId}`,
      req
    );

    const { success } = await starLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          message:
            "Too many star requests. Please try again later.",
        },
        { status: 429 }
      );
    }

    await connectDB();

    const { feedUrl, articleId, starred } = await req.json();

    if (
      typeof feedUrl !== "string" ||
      typeof articleId !== "string"
    ) {
      return NextResponse.json(
        {
          message: "feedUrl and articleId are required",
        },
        { status: 400 }
      );
    }

    if (typeof starred !== "boolean") {
      return NextResponse.json(
        {
          message: "starred must be a boolean",
        },
        { status: 400 }
      );
    }

    const articleState = await ArticleState.findOneAndUpdate(
      {
        userId,
        feedUrl,
        articleId,
      },
      {
        $set: {
          starred,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json(
      {
        state: articleState,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Star article error:", error);

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}