import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, fetchOAuthProfile, isValidProvider } from "@/app/lib/oauth/providers";
import connectDB from "@/app/config/db";
import User from "@/app/model/userModel";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const provider = req.nextUrl.searchParams.get("provider");
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

  if (!provider || !isValidProvider(provider)) {
    return NextResponse.redirect(`${appUrl}/?error=invalid_provider`);
  }

  // Validate state to prevent CSRF
  const cookieState = req.cookies.get(`oauth_state_${provider}`)?.value;
  if (!state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(`${appUrl}/?error=state_mismatch`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/?error=missing_code`);
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenRes = await exchangeCodeForToken(provider, code);

    // 2. Fetch user profile from the provider
    const profile = await fetchOAuthProfile(provider, tokenRes.access_token);

    if (!profile.email) {
      return NextResponse.redirect(`${appUrl}/?error=email_required`);
    }

    await connectDB();

    // 3. Find or create the user in MongoDB
    // First try by oauthProvider + oauthId
    let user = await User.findOne({ oauthProvider: provider, oauthId: profile.id });

    if (!user) {
      // Fallback: search by email to link accounts
      user = await User.findOne({ email: profile.email.toLowerCase() });

      if (user) {
        // Link the existing account to this OAuth provider
        user.oauthProvider = provider;
        user.oauthId = profile.id;
        if (profile.avatarUrl && !user.avatarUrl) {
          user.avatarUrl = profile.avatarUrl;
        }
        await user.save();
      } else {
        // Create a new user
        const nameParts = profile.name.trim().split(/\s+/);
        const firstName = nameParts[0] || "OAuth";
        const lastName = nameParts.slice(1).join(" ") || "User";

        // Generate a unique username between 3 and 15 chars
        let baseUsername = profile.name.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 10);
        if (baseUsername.length < 3) {
          baseUsername = "user_" + baseUsername;
        }
        let username = baseUsername;
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
          const existing = await User.findOne({ username });
          if (!existing) {
            isUnique = true;
          } else {
            // Append short random suffix
            const suffix = crypto.randomBytes(2).toString("hex");
            username = (baseUsername.slice(0, 10) + suffix).slice(0, 15);
            attempts++;
          }
        }

        user = await User.create({
          firstName,
          lastName,
          username,
          email: profile.email.toLowerCase(),
          oauthProvider: provider,
          oauthId: profile.id,
          avatarUrl: profile.avatarUrl,
        });
      }
    } else {
      // Update avatar if changed
      if (profile.avatarUrl && user.avatarUrl !== profile.avatarUrl) {
        user.avatarUrl = profile.avatarUrl;
        await user.save();
      }
    }

    // 4. Generate JWT session token
    const jwt_secret = process.env.JWT_SECRET;
    if (!jwt_secret) {
      console.error("JWT_SECRET is not defined");
      return NextResponse.redirect(`${appUrl}/?error=server_error`);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      jwt_secret,
      { expiresIn: "7d" } // standard session duration
    );

    const response = NextResponse.redirect(`${appUrl}/dashboard`);

    // 5. Set session cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    // 6. Clean up the oauth_state cookie
    response.cookies.delete(`oauth_state_${provider}`);

    return response;
  } catch (error) {
    console.error(`OAuth callback error for ${provider}:`, error);
    return NextResponse.redirect(`${appUrl}/?error=authentication_failed`);
  }
}
