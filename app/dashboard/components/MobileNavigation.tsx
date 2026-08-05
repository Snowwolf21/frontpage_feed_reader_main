"use client";

import { Plus, Compass, Newspaper, Rss, FileUp } from "lucide-react";
import { useStore } from "@/app/store/useStore";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";

export default function MobileNavigation() {
  const {
    setIsAddOpen,
    activeTab,
    setActiveTab,
    setViewMode,
    importOpml,
  } = useStore(
    useShallow((s) => ({
      setIsAddOpen: s.setIsAddOpen,
      activeTab: s.activeTab,
      setActiveTab: s.setActiveTab,
      setViewMode: s.setViewMode,
      importOpml: s.importOpml,
    }))
  );

  const handleImportOpml = async (file: File | null) => {
    await importOpml(file);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-zinc-200 bg-white/95 pb-safe px-1 py-1 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden">
      <Button
        variant="ghost"
        type="button"
        onClick={() => {
          setActiveTab("feed");
          setViewMode("sources");
        }}
        className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] h-12 p-0 font-normal hover:bg-transparent transition-colors cursor-pointer rounded-xl ${
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
        className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] h-12 p-0 font-normal hover:bg-transparent transition-colors cursor-pointer rounded-xl ${
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
        className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] h-12 p-0 font-normal hover:bg-transparent transition-colors cursor-pointer rounded-xl ${
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
        className="flex-1 flex flex-col items-center justify-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white h-12 p-0 font-normal hover:bg-transparent cursor-pointer rounded-xl"
      >
        <Plus className="h-5 w-5" />
        <span>Add</span>
      </Button>

      <label className="flex-1 flex flex-col items-center justify-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer select-none h-12 p-0 rounded-xl">
        <FileUp className="h-5 w-5" />
        <span>Import</span>
        <input 
          type="file" 
          accept=".opml,.xml,text/xml" 
          className="sr-only" 
          onChange={(event) => handleImportOpml(event.target.files?.[0] || null)} 
        />
      </label>
    </nav>
  );
}
