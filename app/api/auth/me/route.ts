import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import User from '@/app/model/userModel';
import { getUserIdFromRequest } from '@/utils/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Fetch me error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
