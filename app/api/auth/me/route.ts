import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import User from "@/app/model/userModel";
import { getUserIdFromRequest } from "@/utils/auth";
import { meLimiter } from "@/app/lib/rateLimiter";

export async function GET(req: NextRequest) {
  try {
    // 1. Instantly check credentials WITHOUT touching the database
    const userId = getUserIdFromRequest(req);

    // Secure Guest Control: Return a graceful 200 state instead of a noisy 401
    if (!userId) {
      return NextResponse.json(
        { 
          authenticated: false, 
          role: "guest",
          user: null 
        },
        { status: 200 } // Clean, fast, and does not flood your network logs
      );
    }

    // 2. Apply Rate Limiting immediately after validating the user ID
    const identifier = `me:${userId}`;
    const { success } = await meLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        { message: "Too many profile requests. Please try again later." },
        { status: 429 }
      );
    }

    // 3. Lazy connect to the database ONLY when we know it is a valid, throttled user
    await connectDB();

    // Use .lean() to optimize memory usage by skipping Mongoose document hydration
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        role: "user",
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch me error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
