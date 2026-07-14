import { NextRequest, NextResponse } from "next/server";
import { buildAuthUrl, isValidProvider } from "@/app/lib/oauth/providers";
import crypto from "crypto";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const provider = req.nextUrl.searchParams.get("provider");

    if (!provider || !isValidProvider(provider)) {
      return NextResponse.json(
        { error: "Invalid or missing OAuth provider query param." },
        { status: 400 }
      );
    }

    // Generate a secure random state to protect against CSRF
    const state = crypto.randomBytes(32).toString("hex");

    const authUrl = buildAuthUrl(provider, state);

    const response = NextResponse.redirect(authUrl);

    // Save the state in a secure, httpOnly cookie for validation in callback
    response.cookies.set(`oauth_state_${provider}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Must be lax to be sent on redirect landing
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth redirect error:", error);
    return NextResponse.json(
      { error: "Failed to initiate authentication flow." },
      { status: 500 }
    );
  }
}
