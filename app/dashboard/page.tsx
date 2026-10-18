import DashboardClient from './DashboardClient';
import data from '@/app/data/sample-feeds.json';

export const dynamic = 'force-dynamic';
export default function Dashboard() {
    return <DashboardClient sampleFeeds={data} />;
}
