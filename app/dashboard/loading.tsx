import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
            {/* Header Skeleton */}
            <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 z-50">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="w-24 h-6" />
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="w-20 h-9 rounded-lg" />
                </div>
            </header>

            <div className="flex flex-1 pt-16">
                {/* Sidebar Skeleton */}
                <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 p-4 hidden md:flex flex-col gap-6">
                    <div className="space-y-4">
                        <Skeleton className="w-32 h-4" />
                        <div className="space-y-2">
                            <Skeleton className="w-full h-8 rounded-md" />
                            <Skeleton className="w-full h-8 rounded-md" />
                            <Skeleton className="w-full h-8 rounded-md" />
                            <Skeleton className="w-full h-8 rounded-md" />
                        </div>
                    </div>
                    <div className="space-y-4 pt-4">
                        <Skeleton className="w-28 h-4" />
                        <div className="space-y-2">
                            <Skeleton className="w-full h-8 rounded-md" />
                            <Skeleton className="w-full h-8 rounded-md" />
                        </div>
                    </div>
                </aside>

                {/* Main Content Skeleton */}
                <main className="flex-1 p-6 md:p-10">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="space-y-2">
                            <Skeleton className="w-48 h-10" />
                            <Skeleton className="w-96 h-4" />
                        </div>

                        {/* Feed items grid/list */}
                        <div className="grid grid-cols-1 gap-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2 w-full">
                                            <Skeleton className="w-1/4 h-3" />
                                            <Skeleton className="w-3/4 h-6" />
                                        </div>
                                        <Skeleton className="w-20 h-20 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="w-full h-4" />
                                        <Skeleton className="w-full h-4" />
                                        <Skeleton className="w-2/3 h-4" />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Skeleton className="w-16 h-6 rounded-full" />
                                        <Skeleton className="w-16 h-6 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
