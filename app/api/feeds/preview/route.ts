import { NextRequest, NextResponse } from 'next/server';
import { FeedPreviewResponse, parser, validateHttpUrl } from '../_lib/feedParser';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const raw = req.nextUrl.searchParams.get('url');

  if (!raw) {
    return NextResponse.json({ error: 'Missing required query parameter: url' }, { status: 400 });
  }

  const validation = validateHttpUrl(raw);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  try {
    const feed = await parser.parseURL(raw);
    const response: FeedPreviewResponse = {
      title: feed.title || 'Untitled Feed',
      description: feed.description || null,
      link: feed.link || raw,
      image: feed.image?.url || null,
      itemCount: feed.items?.length ?? 0,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Could not load feed preview. Check the URL and try again.' }, { status: 422 });
  }
}
