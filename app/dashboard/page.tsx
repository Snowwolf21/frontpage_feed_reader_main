import { promises as fs } from 'fs';
import path from 'path';
import DashboardClient from './DashboardClient';
import type { SampleFeeds } from '@/app/components/FeedDisplay';

export default async function Dashboard() {
    const dataPath = path.join(process.cwd(), 'app', 'data', 'sample-feeds.json');
    const fileContents = await fs.readFile(dataPath, 'utf8');
    const data: SampleFeeds = JSON.parse(fileContents);

    return <DashboardClient sampleFeeds={data} />;
}
