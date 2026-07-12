import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import User from "@/app/model/userModel";
import { getUserIdFromRequest } from "@/utils/auth";

import { meLimiter } from "@/app/lib/rateLimiter";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const identifier = `me:${userId}`;

    const { success } = await meLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          message:
            "Too many profile requests. Please try again later.",
        },
        {
          status: 429,
        }
      );
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        user,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Fetch me error:", error);

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