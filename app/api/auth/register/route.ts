import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import User from '@/app/model/userModel';
import { hashPassword } from '@/utils/password';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { firstName, lastName, username, email, password } = await req.json();

    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6 || password.length > 12) {
      return NextResponse.json({ message: 'Password must be between 6 and 12 characters' }, { status: 400 });
    }

    if (username.length < 3 || username.length > 15) {
      return NextResponse.json({ message: 'Username must be between 3 and 15 characters' }, { status: 400 });
    }

    // Check if email or username already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json({ message: 'Username already taken' }, { status: 409 });
    }

    // Await the asynchronous hashPassword call
    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
