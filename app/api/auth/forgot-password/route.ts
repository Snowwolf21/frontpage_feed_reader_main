import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import User, { generatePasswordResetToken } from '@/app/model/userModel';
import { sendEmail } from '@/utils/sendEmail';
import { forgotPasswordLimiter } from "@/app/lib/rateLimiter/auth";
import { createIdentifier } from "@/app/lib/rateLimiter/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : null;

    // Always rate-limit first (by email or IP) before hitting DB
    const identifier = email
      ? `forgot-password:${email}`
      : createIdentifier("forgot-password", req);
    const { success } = await forgotPasswordLimiter.limit(identifier);
    if (!success) {
      return NextResponse.json(
        { message: 'Too many requests, please try again later' },
        { status: 429 }
      );
    }

    if (!email) {
      return NextResponse.json({ message: 'Email address is required' }, { status: 400 });
    }

    await connectDB();

    // Security: always return the same message regardless of whether the email exists.
    // This prevents user enumeration attacks.
    const genericResponse = NextResponse.json(
      { message: "If that email is registered, you'll receive a password reset link shortly." },
      { status: 200 }
    );

    const user = await User.findOne({ email });
    if (!user) {
      // Do NOT leak that the user doesn't exist — return same generic 200
      return genericResponse;
    }

    // OAuth-only accounts have no password to reset
    if (user.oauthProvider && !user.password) {
      return genericResponse;
    }

    const { rawToken, tokenHash } = generatePasswordResetToken();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store the HASH in the database, never the raw token
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: tokenHash,
          passwordResetExpires: expiry,
        },
      }
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    // Put the RAW token in the URL (not the hash) — never expose the hash
    const resetLink = `${appUrl}/reset-password?token=${rawToken}`;

    await sendEmail(
      user.email,
      'Reset your Frontpage password',
      `Reset your password: ${resetLink} (valid for 10 minutes)`,
      `
        <h1>Password Reset</h1>
        <p>You requested a password reset for your Frontpage account.</p>
        <p>Click the link below to reset your password. This link is valid for <strong>10 minutes</strong> and can only be used once.</p>
        <p><a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `
    );

    return genericResponse;
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
