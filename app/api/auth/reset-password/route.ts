import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import User from '@/app/model/userModel';
import jwt from 'jsonwebtoken';
import { hashPassword } from '@/utils/password';
import { sendEmail } from '@/utils/sendEmail';
import crypto from "crypto";
import { resetPasswordLimiter } from '@/app/lib/rateLimiter/auth';
export async function POST(req: NextRequest) {
  try {

    const body = await req.json();

if (typeof body !== "object" || body === null) {
  return NextResponse.json(
    { message: "Invalid request body" },
    { status: 400 }
  );
}

    const { token, password } = body;

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const identifier = `"reset-password": ${tokenHash}`;
    const { success } = await resetPasswordLimiter.limit(identifier);
    if (!success) {
      return NextResponse.json({ message: 'Too many requests, please try again later' }, { status: 429 });
    }

   

    if (!token || !password) {
      return NextResponse.json({ message: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 8 || password.length >= 64) {
      return NextResponse.json({ message: 'Password must be between 8 and 64 characters' }, { status: 400 });
    }

    const jwt_secret = process.env.JWT_SECRET;
    if (!jwt_secret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwt_secret) as { id: string };
    } catch {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    if (!decoded || !decoded.id) {
      return NextResponse.json({ message: 'Invalid token payload' }, { status: 400 });
    }
    await connectDB();
    const user = await User.findOne({ _id: decoded.id });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Await the asynchronous password hashing
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    await sendEmail(
      user.email,
      'Password reset successful',
      'Your password has been reset successfully',
      `
        <h1>Password Reset Successful</h1>
        <p>Your password has been reset successfully</p>
        <p>You can now log in using your new password:</p>
        <a href="${frontendUrl}">Login</a>
      `
    );

    return NextResponse.json({ message: 'Password reset successful' }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
