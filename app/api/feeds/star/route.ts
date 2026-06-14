import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Subscription from '@/app/model/subscriptionModel';
import { getUserIdFromRequest } from '@/utils/auth';
import { parser, validateHttpUrl } from '../_lib/feedParser';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const { url, title, category } = body as { url?: unknown; title?: unknown; category?: unknown };

  if (typeof url !== 'string' || !url) {
    return NextResponse.json({ error: 'Missing required field: url' }, { status: 400 });
  }

  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'You must be logged in to subscribe.' }, { status: 401 });
  }

  const validation = validateHttpUrl(url);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  await connectDB();

  const existing = await Subscription.findOne({ userId, feedUrl: url });
  if (existing) {
    return NextResponse.json({ error: 'You are already subscribed to this feed.' }, { status: 409 });
  }

  let feedTitle = typeof title === 'string' && title ? title : 'Untitled Feed';
  let description: string | null = null;

  try {
    const feed = await parser.parseURL(url);
    feedTitle = feed.title || feedTitle;
    description = feed.description || null;
  } catch (err) {
    console.log('Warning: could not fetch feed during subscription:', err);
  }

  const subscription = new Subscription({
    userId,
    title: feedTitle,
    feedUrl: url,
    siteUrl: validation.url.origin,
    description,
    category: typeof category === 'string' && category.trim() ? category.trim() : 'General',
  });

  try {
    await subscription.save();
  } catch {
    return NextResponse.json({ error: 'Failed to save subscription.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: subscription._id });
}
