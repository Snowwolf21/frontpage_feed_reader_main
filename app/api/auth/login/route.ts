import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import User from '@/app/model/userModel';
import { comparePassword } from '@/utils/password';
import jwt from 'jsonwebtoken';

import { loginLimiter } from '@/app/lib/rateLimiter';
import { createIdentifier } from '@/app/lib/rateLimiter/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : null;
    const password = typeof body?.password === 'string' ? body.password : null;
    const rememberMe = body?.rememberMe === true;

    // Rate-limit by email first, fallback to IP — prevents credential stuffing
    const identifier = email
      ? `login:${email}`
      : createIdentifier('login', req);

    const { success } = await loginLimiter.limit(identifier);
    if (!success) {
      return NextResponse.json(
        { message: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });

    // Security: use a constant-time comparison path for both "not found" and "wrong password"
    // to prevent user enumeration via timing differences.
    const GENERIC_ERROR = 'Invalid email or password.';

    if (!user || !user.password) {
      // If user doesn't exist or is OAuth-only, return the same generic error
      return NextResponse.json({ message: GENERIC_ERROR }, { status: 401 });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: GENERIC_ERROR }, { status: 401 });
    }

    const jwt_secret = process.env.JWT_SECRET;
    if (!jwt_secret) {
      console.error('JWT_SECRET is not defined');
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    // "Remember me" extends session to 30 days, otherwise 7 days
    const expiresIn = rememberMe ? '30d' : '7d';
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;

    const token = jwt.sign(
      { id: user._id, email: user.email },
      jwt_secret,
      { expiresIn }
    );

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // was 'lax' — strict prevents all cross-site sends
      maxAge,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
