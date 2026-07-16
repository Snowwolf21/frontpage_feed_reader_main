"use client";

import { Moon, Plus, Sun, Compass, Newspaper, Rss } from "lucide-react";
import { useStore } from "@/app/store/useStore";
import { Button } from "@/components/ui/button";

export default function MobileNavigation() {
  const {
    theme,
    setTheme,
    setIsAddOpen,
    activeTab,
    setActiveTab,
    setViewMode,
  } = useStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-zinc-200 bg-white/95 pb-safe px-2 py-2.5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden">
      <Button
        variant="ghost"
        type="button"
        onClick={() => {
          setActiveTab("feed");
          setViewMode("sources");
        }}
        className={`flex flex-col items-center gap-0.5 text-[10px] h-auto p-0 font-normal hover:bg-transparent transition-colors ${
          activeTab === "feed"
            ? "text-indigo-650 dark:text-indigo-400 font-semibold"
            : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        <Rss className="h-5 w-5" />
        <span>Feed</span>
      </Button>

      <Button
        variant="ghost"
        type="button"
        onClick={() => setActiveTab("digest")}
        className={`flex flex-col items-center gap-0.5 text-[10px] h-auto p-0 font-normal hover:bg-transparent transition-colors ${
          activeTab === "digest"
            ? "text-indigo-650 dark:text-indigo-400 font-semibold"
            : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        <Newspaper className="h-5 w-5" />
        <span>Digest</span>
      </Button>

      <Button
        variant="ghost"
        type="button"
        onClick={() => setActiveTab("discover")}
        className={`flex flex-col items-center gap-0.5 text-[10px] h-auto p-0 font-normal hover:bg-transparent transition-colors ${
          activeTab === "discover"
            ? "text-indigo-650 dark:text-indigo-400 font-semibold"
            : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        <Compass className="h-5 w-5" />
        <span>Discover</span>
      </Button>

      <Button
        variant="ghost"
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="flex flex-col items-center gap-0.5 text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white h-auto p-0 font-normal hover:bg-transparent"
      >
        <Plus className="h-5 w-5" />
        <span>Add</span>
      </Button>

      <Button
        variant="ghost"
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex flex-col items-center gap-0.5 text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white h-auto p-0 font-normal hover:bg-transparent"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        <span>Theme</span>
      </Button>
    </nav>
  );
}
