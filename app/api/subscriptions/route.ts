import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Subscription from '@/app/model/subscriptionModel';
import { getUserIdFromRequest } from '@/utils/auth';
import { validateSafeUrl } from '@/app/api/feeds/_lib/feedParser';
import {
  rssReadLimiter,
  rssSubscribeLimiter,
} from "@/app/lib/rateLimiter";




export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const identifier = `subscription-read:${userId}`;

    const { success } = await rssReadLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          message:
            "Too many subscription requests. Please try again later.",
        },
        {
          status: 429,
        }
      );
    }

    // Projection: exclude __v from response — don't expose internals
    const subscriptions = await Subscription.find({ userId }).lean().select('-__v');
    return NextResponse.json({ subscriptions }, { status: 200 });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { feedUrl, category } = await req.json();
    if (!feedUrl) {
      return NextResponse.json({ message: 'Feed URL is required' }, { status: 400 });
    }

    const identifier = `subscription-create:${userId}`;

    const { success } = await rssSubscribeLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          message:
            "Too many subscription creation requests. Please try again later.",
        },
        {
          status: 429,
        }
      );
    }

    // SSRF protection: validate URL isn't pointing at internal network
    const urlValidation = await validateSafeUrl(feedUrl);
    if (!urlValidation.ok) {
      return NextResponse.json({ message: urlValidation.message }, { status: 400 });
    }

    const feedMeta = { title: '', link: '', description: '' };
    try {
      const feedRes = await fetch(feedUrl, {
        headers: { Accept: 'application/rss+xml, text/xml, */*' },
        signal: AbortSignal.timeout(7000),
      });
      if (feedRes.ok) {
        const Parser = (await import('rss-parser')).default;
        const parser = new Parser();
        const text = await feedRes.text();
        const parsed = await parser.parseString(text);
        feedMeta.title = parsed.title || '';
        feedMeta.link = parsed.link || '';
        feedMeta.description = parsed.description || '';
      }
    } catch {
      // Non-fatal — we still save with a minimal title
    }

    const title = feedMeta.title || 'Untitled Feed';
    const siteUrl = feedMeta.link || urlValidation.url.origin;
    const description = feedMeta.description || '';

    // Check if duplicate
    const existing = await Subscription.findOne({ userId, feedUrl });
    if (existing) {
      return NextResponse.json({ message: 'You are already subscribed to this feed' }, { status: 409 });
    }

    const newSub = new Subscription({
      userId,
      title,
      feedUrl,
      siteUrl,
      description,
      category: category || 'General'
    });

    await newSub.save();
    return NextResponse.json({ subscription: newSub }, { status: 201 });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE is handled by /api/subscriptions/[id]/route.ts
// The route-level DELETE was removed — it used a query param (?id=) which
// never matched how DashboardClient calls DELETE /api/subscriptions/:id
