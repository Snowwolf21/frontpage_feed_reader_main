import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import User from '@/app/model/userModel';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/utils/sendEmail';

import { forgotPasswordLimiter } from "@/app/lib/rateLimiter/auth";
import { createIdentifier } from "@/app/lib/rateLimiter/utils";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    
    const identifier = email
      ? `forgot-password:${email}`
      : createIdentifier("forgot-password", req);
    const { success } = await forgotPasswordLimiter.limit(identifier);
    if (!success) {
      return NextResponse.json({ message: 'Too many requests, please try again later' }, { status: 429 });
    }
    await connectDB();

    if (!email) {
      return NextResponse.json({ message: 'Email address is required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const jwt_secret = process.env.JWT_SECRET;
    if (!jwt_secret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      jwt_secret,
      { expiresIn: '10m' }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    await sendEmail(
      user.email,
      'Forgot Password',
      'You have been sent this email because you requested to reset your password. This link is valid for 10 minutes.',
      `
        <h1>Forgot Password</h1>
        <p>You have been sent this email because you requested to reset your password.</p>
        <p>Click the link below to reset your password (valid for 10 minutes):</p>
        <a href="${frontendUrl}/reset-password?token=${token}">Reset Password</a>
      `
    );

    return NextResponse.json({ message: 'Forgot password email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
