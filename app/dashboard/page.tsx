import DashboardClient from './DashboardClient';
import data from '@/app/data/sample-feeds.json';

export default async function Dashboard() {
    return <DashboardClient sampleFeeds={data} />;
}
