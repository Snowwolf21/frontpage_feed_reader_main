import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Subscription from '@/app/model/subscriptionModel';
import { getUserIdFromRequest } from '@/utils/auth';
import { parser, validateHttpUrl } from '@/app/api/feeds/_lib/feedParser';
import { opmlImportLimiter } from '@/app/lib/rateLimiter/opml';
import { createIdentifier } from '@/app/lib/rateLimiter/utils';

type ImportedFeed = {
  title: string;
  feedUrl: string;
  siteUrl: string;
  description: string;
  category: string;
};

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function getAttribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'));
  return match ? decodeXml(match[1]) : null;
}

function parseOpml(xml: string) {
  const outlines = xml.match(/<outline\b[^>]*>/gi) || [];

  return outlines
    .map((outline) => {
      const feedUrl = getAttribute(outline, 'xmlUrl');
      if (!feedUrl) return null;

      return {
        feedUrl,
        title: getAttribute(outline, 'title') || getAttribute(outline, 'text') || feedUrl,
        category: getAttribute(outline, 'category') || 'Imported',
      };
    })
    .filter((feed): feed is { feedUrl: string; title: string; category: string } => Boolean(feed));
}

export async function POST(req: NextRequest) {
  try {
    
        await connectDB();
        const userId = getUserIdFromRequest(req);
    
        if (!userId) {
          return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

    const identifier = userId
      ? `opml-import:${userId}`
      : createIdentifier("opml-import", req);

    const { success } = await opmlImportLimiter.limit(identifier);
    if (!success) {
      return NextResponse.json({ message: 'Too many requests, please try again later' }, { status: 429 });
    }


    const formData = await req.formData();
    const file = formData.get('file');
    const rawText = formData.get('opml');
    const xml =
      file instanceof File
        ? await file.text()
        : typeof rawText === 'string'
          ? rawText
          : '';

    if (!xml.trim()) {
      return NextResponse.json({ message: 'Upload an OPML file or provide OPML text.' }, { status: 400 });
    }

    const parsedFeeds = parseOpml(xml);

    if (parsedFeeds.length === 0) {
      return NextResponse.json({ message: 'No RSS feed URLs were found in the OPML file.' }, { status: 400 });
    }

    const imported: ImportedFeed[] = [];
    const skipped: { feedUrl: string; reason: string }[] = [];

    for (const opmlFeed of parsedFeeds) {
      const validation = validateHttpUrl(opmlFeed.feedUrl);
      if (!validation.ok) {
        skipped.push({ feedUrl: opmlFeed.feedUrl, reason: validation.message });
        continue;
      }

      const existing = await Subscription.findOne({ userId, feedUrl: opmlFeed.feedUrl });
      if (existing) {
        skipped.push({ feedUrl: opmlFeed.feedUrl, reason: 'Already subscribed' });
        continue;
      }

      let title = opmlFeed.title;
      let siteUrl = validation.url.origin;
      let description = '';

      try {
        const feed = await parser.parseURL(opmlFeed.feedUrl);
        title = feed.title || title;
        siteUrl = feed.link || siteUrl;
        description = feed.description || '';
      } catch {
        skipped.push({ feedUrl: opmlFeed.feedUrl, reason: 'Feed could not be parsed' });
        continue;
      }

      const subscription = await Subscription.create({
        userId,
        title,
        feedUrl: opmlFeed.feedUrl,
        siteUrl,
        description,
        category: opmlFeed.category,
      });

      imported.push({
        title: subscription.title,
        feedUrl: subscription.feedUrl,
        siteUrl: subscription.siteUrl || siteUrl,
        description: subscription.description || '',
        category: subscription.category || 'Imported',
      });
    }

    return NextResponse.json({ imported, skipped }, { status: 200 });
  } catch (error) {
    console.error('OPML import error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
