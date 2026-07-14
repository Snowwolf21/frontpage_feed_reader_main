import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/app/config/db';
import User from '@/app/model/userModel';
import { hashPassword } from '@/utils/password';
import { sendEmail } from '@/utils/sendEmail';
import { resetPasswordLimiter } from '@/app/lib/rateLimiter/auth';
import { createIdentifier } from '@/app/lib/rateLimiter/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { token, password } = body;

    if (!token || typeof token !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json({ message: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 12 || password.length > 68) {
      return NextResponse.json(
        { message: 'Password must be between 12 and 68 characters' },
        { status: 400 }
      );
    }

    // Rate-limit by IP to prevent brute-forcing token space
    const identifier = createIdentifier('reset-password', req);
    const { success } = await resetPasswordLimiter.limit(identifier);
    if (!success) {
      return NextResponse.json(
        { message: 'Too many requests, please try again later' },
        { status: 429 }
      );
    }

    // Hash the incoming raw token to compare against the stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await connectDB();

    // Atomically find the user by hashed token and check expiry — one-time use
    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return NextResponse.json(
        { message: 'This password reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Atomically update password AND clear the token fields so it cannot be reused
    await User.updateOne(
      { _id: user._id, passwordResetToken: tokenHash },
      {
        $set: { password: hashedPassword },
        $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
      }
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

    await sendEmail(
      user.email,
      'Your Frontpage password has been reset',
      'Your password has been reset successfully.',
      `
        <h1>Password Reset Successful</h1>
        <p>Your Frontpage account password has been updated successfully.</p>
        <p>If you did not make this change, please contact support immediately.</p>
        <p><a href="${appUrl}" style="display:inline-block;padding:12px 24px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Log In</a></p>
      `
    );

    return NextResponse.json({ message: 'Password reset successfully. You can now log in.' }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
