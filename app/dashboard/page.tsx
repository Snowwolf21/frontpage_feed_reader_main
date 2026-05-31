import Link from "next/link";
import { Plus, SearchIcon } from "lucide-react";
import UserSettingsMenu from "@/components/UserSettingsMenu";
import { Header } from "@/app/components/Header";
import FeedDisplay, { SampleFeeds, Category } from "@/app/components/FeedDisplay";
import { promises as fs } from 'fs';
import path from 'path';

export default async function Dashboard() {
    // Simulate data fetching delay to show the skeleton
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Fetch sample feeds from the data file
    const dataPath = path.join(process.cwd(), 'app', 'data', 'sample-feeds.json');
    const fileContents = await fs.readFile(dataPath, 'utf8');
    const data: SampleFeeds = JSON.parse(fileContents);

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
            <Header 
                className="fixed top-0 left-0 right-0"
                containerClassName="p-4 max-w-none"
                textClassName="text-xl text-white tracking-tight"
                showDefaultAuth={false}
                leftContent={
                    <div className="space-x-4 ml-4 flex items-center gap-4 font-medium tracking-wide">
                        <Link href='' className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                            Feed
                        </Link>
                        <Link href='' className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                            Digest
                        </Link>
                        <Link href='' className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                            Discover
                        </Link>
                    </div>
                }
                rightContent={
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 relative">
                            <input type="text" placeholder="Search" className="py-2 pl-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all font-medium text-sm" />
                            <button className="absolute left-2">
                                <SearchIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                            </button>
                        </div>
                        <button className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all font-medium text-sm">
                            <Plus className="w-4 h-4 " />
                        </button>
                        <UserSettingsMenu />
                    </div>
                }
            />


            <div className="flex flex-1 pt-16">
                {/* Sidebar */}
                <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 p-4 hidden md:flex flex-col gap-6">
                    <div>
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">Feeds</h3>
                        <nav className="space-y-1">
                            <button className="w-full text-left px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-medium mb-2">
                                All Feeds
                            </button>
                            {data.categories.map((category: Category) => (
                                <button 
                                    key={category.name}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors text-sm font-medium"
                                >
                                    {category.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                <main className="flex-1 p-6 md:p-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-12">
                            <h1 className="text-5xl font-extrabold mb-4 tracking-tight bg-linear-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
                                Discover Feeds
                            </h1>
                            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl">
                                Explore our curated selection of high-quality sources to get started with your personalized feed reader experience.
                            </p>
                        </div>

                        <FeedDisplay data={data} />

                    </div>
                </main>
            </div>
        </div>
    );
}
