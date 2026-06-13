import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Subscription from '@/app/model/subscriptionModel';
import { getUserIdFromRequest } from '@/utils/auth';
import Parser from 'rss-parser';

const parser = new Parser();

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const subscriptions = await Subscription.find({ userId });
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

    // Try parsing the feed to validate it and auto-fill metadata
    let feedMeta;
    try {
      feedMeta = await parser.parseURL(feedUrl);
    } catch (err) {
      console.error(`Failed to parse feed at ${feedUrl}:`, err);
      return NextResponse.json({ message: 'Invalid RSS/Atom feed URL or feed is offline' }, { status: 400 });
    }

    const title = feedMeta.title || 'Untitled Feed';
    const siteUrl = feedMeta.link || '';
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

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Subscription ID is required' }, { status: 400 });
    }

    const deletedSub = await Subscription.findOneAndDelete({ _id: id, userId });
    if (!deletedSub) {
      return NextResponse.json({ message: 'Subscription not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Unsubscribed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete subscription error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
