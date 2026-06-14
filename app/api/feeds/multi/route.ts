import { NextRequest, NextResponse } from 'next/server';
import { MultiFeedEntry, normalizeItem, parser, validateHttpUrl } from '../_lib/feedParser';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const { urls } = body as { urls?: unknown };

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: 'Body must include a non-empty "urls" array.' }, { status: 400 });
  }

  if (urls.length > 20) {
    return NextResponse.json({ error: 'Maximum 20 URLs per request.' }, { status: 400 });
  }

  const urlStrings = urls.filter((url): url is string => typeof url === 'string');

  if (urlStrings.length !== urls.length) {
    return NextResponse.json({ error: 'Every entry in "urls" must be a string.' }, { status: 400 });
  }

  const results = await Promise.allSettled(
    urlStrings.map((url) =>
      validateHttpUrl(url).ok ? parser.parseURL(url) : Promise.reject(new Error('Invalid URL'))
    )
  );

  const feeds: MultiFeedEntry[] = results.map((result, index) => {
    const url = urlStrings[index];

    if (result.status === 'fulfilled') {
      const feed = result.value;
      return {
        url,
        ok: true,
        title: feed.title || 'Untitled Feed',
        description: feed.description || null,
        image: feed.image?.url || null,
        items: (feed.items || []).slice(0, 20).map(normalizeItem),
      };
    }

    return {
      url,
      ok: false,
      error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
    };
  });

  return NextResponse.json({ feeds });
}
