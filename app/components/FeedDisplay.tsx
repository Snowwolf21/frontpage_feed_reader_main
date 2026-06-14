import { ExternalLink, Rss } from 'lucide-react';
import { sanitizeHtml } from '@/app/lib/sanitize';

export interface Feed {
  title: string;
  feedUrl: string;
  siteUrl: string;
  description: string;
  format: string;
  notes?: string;
}

export interface Category {
  name: string;
  feeds: Feed[];
}

export interface SampleFeeds {
  title: string;
  description: string;
  categories: Category[];
}

export default function FeedDisplay({ data }: { data: SampleFeeds }) {
  return (
    <div className="space-y-12">
      {data.categories.map((category) => (
        <section key={category.name} className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 px-4">
              {category.name}
            </h2>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {category.feeds.map((feed) => (
              <div
                key={feed.feedUrl}
                className="group relative p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700 transition-colors">
                      <Rss className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <a
                      href={feed.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit ${feed.title} website`}
                      className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all transform translate-y-1 group-hover:translate-y-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {feed.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                      {sanitizeHtml(feed.description)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-md">
                      {feed.format}
                    </span>
                    {feed.notes && (
                      <span className="text-[10px] italic text-zinc-400 dark:text-zinc-500 truncate">
                        {feed.notes}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
