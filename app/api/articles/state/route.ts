import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import ArticleState from '@/app/model/articleStateModel';
import { getUserIdFromRequest } from '@/utils/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ states: [] }, { status: 200 });
    }

    const feedUrl = req.nextUrl.searchParams.get('feedUrl');
    const query = feedUrl ? { userId, feedUrl } : { userId };
    const states = await ArticleState.find(query).lean();

    return NextResponse.json({ states }, { status: 200 });
  } catch (error) {
    console.error('Get article states error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { feedUrl, articleId, read, bookmarked } = await req.json();

    if (typeof feedUrl !== 'string' || typeof articleId !== 'string') {
      return NextResponse.json({ message: 'feedUrl and articleId are required' }, { status: 400 });
    }

    const update: { read?: boolean; bookmarked?: boolean } = {};
    if (typeof read === 'boolean') update.read = read;
    if (typeof bookmarked === 'boolean') update.bookmarked = bookmarked;

    const state = await ArticleState.findOneAndUpdate(
      { userId, feedUrl, articleId },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ state }, { status: 200 });
  } catch (error) {
    console.error('Update article state error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
