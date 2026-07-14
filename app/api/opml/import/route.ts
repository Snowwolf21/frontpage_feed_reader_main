import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import connectDB from '@/app/config/db';
import Subscription from '@/app/model/subscriptionModel';
import { getUserIdFromRequest } from '@/utils/auth';
import { validateHttpUrl } from '@/app/api/feeds/_lib/feedParser';
import { opmlImportLimiter } from '@/app/lib/rateLimiter/opml';

const MAX_OPML_BYTES = 2 * 1024 * 1024; // 2 MB max — prevents ReDoS and memory exhaustion

type ImportedFeed = {
  title: string;
  feedUrl: string;
  siteUrl: string;
  description: string;
  category: string;
};

type OpmlOutline = {
  '@_xmlUrl'?: string;
  '@_title'?: string;
  '@_text'?: string;
  '@_type'?: string;
  '@_htmlUrl'?: string;
  '@_category'?: string;
  outline?: OpmlOutline | OpmlOutline[];
};

/**
 * Recursively extracts RSS/Atom feed outlines from parsed OPML.
 * Replaces the old regex approach which was vulnerable to ReDoS on adversarial XML.
 */
function extractOutlines(
  node: OpmlOutline | OpmlOutline[],
  category = 'Imported'
): { feedUrl: string; title: string; category: string }[] {
  const nodes = Array.isArray(node) ? node : [node];
  const results: { feedUrl: string; title: string; category: string }[] = [];

  for (const n of nodes) {
    const feedUrl = n['@_xmlUrl'];
    const title = n['@_title'] || n['@_text'] || feedUrl || 'Untitled';
    const nodeCategory = n['@_category'] || category;

    if (feedUrl) {
      results.push({ feedUrl, title, category: nodeCategory });
    }

    // Recurse into nested outlines (OPML folders)
    if (n.outline) {
      results.push(...extractOutlines(n.outline, nodeCategory));
    }
  }

  return results;
}

function parseOpml(xml: string): { feedUrl: string; title: string; category: string }[] {
  const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    allowBooleanAttributes: true,
  });

  const parsed = xmlParser.parse(xml) as {
    opml?: { body?: { outline?: OpmlOutline | OpmlOutline[] } };
  };

  const body = parsed?.opml?.body;
  if (!body?.outline) return [];

  return extractOutlines(body.outline);
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const identifier = `opml-import:${userId}`;
    const { success } = await opmlImportLimiter.limit(identifier);
    if (!success) {
      return NextResponse.json(
        { message: 'Too many requests, please try again later' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const rawText = formData.get('opml');

    let xml = '';
    if (file instanceof File) {
      // Enforce size limit before reading into memory
      if (file.size > MAX_OPML_BYTES) {
        return NextResponse.json(
          { message: 'OPML file exceeds the 2 MB size limit.' },
          { status: 413 }
        );
      }
      xml = await file.text();
    } else if (typeof rawText === 'string') {
      if (rawText.length > MAX_OPML_BYTES) {
        return NextResponse.json(
          { message: 'OPML text exceeds the 2 MB size limit.' },
          { status: 413 }
        );
      }
      xml = rawText;
    }

    if (!xml.trim()) {
      return NextResponse.json(
        { message: 'Upload an OPML file or provide OPML text.' },
        { status: 400 }
      );
    }

    const parsedFeeds = parseOpml(xml);

    if (parsedFeeds.length === 0) {
      return NextResponse.json(
        { message: 'No RSS feed URLs were found in the OPML file.' },
        { status: 400 }
      );
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

      const subscription = await Subscription.create({
        userId,
        title: opmlFeed.title,
        feedUrl: opmlFeed.feedUrl,
        siteUrl: validation.url.origin,
        description: '',
        category: opmlFeed.category,
      });

      imported.push({
        title: subscription.title,
        feedUrl: subscription.feedUrl,
        siteUrl: subscription.siteUrl || validation.url.origin,
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
