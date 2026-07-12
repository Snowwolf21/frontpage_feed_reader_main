import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Subscription from "@/app/model/subscriptionModel";
import { getUserIdFromRequest } from "@/utils/auth";

import { rssUnsubscribeLimiter } from "@/app/lib/rateLimiter";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Rate limit per user and subscription
    const identifier = `rss-unsubscribe:${userId}:${id}`;

    const { success } = await rssUnsubscribeLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          message:
            "Too many unsubscribe requests. Please try again later.",
        },
        {
          status: 429,
        }
      );
    }

    const deletedSub = await Subscription.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deletedSub) {
      return NextResponse.json(
        {
          message: "Subscription not found or unauthorized",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Unsubscribed successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Delete subscription error:", error);

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}