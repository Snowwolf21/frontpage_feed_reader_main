"use client";

import { FileUp, LogIn, LogOut, Moon, Plus, Sun } from "lucide-react";
import { useStore } from "@/app/store/useStore";
import type { Subscription } from "@/app/store/useStore";
import { Button } from "@/components/ui/button";

interface MobileNavigationProps {
  sampleSubscriptions: Subscription[];
}

export default function MobileNavigation({ sampleSubscriptions }: MobileNavigationProps) {
  const {
    user,
    theme,
    setTheme,
    setIsAddOpen,
    setIsAuthOpen,
    importOpml,
    logout,
  } = useStore();

  const handleImportOpml = async (file: File | null) => {
    await importOpml(file);
  };

  const handleLogout = async () => {
    await logout(sampleSubscriptions);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-zinc-200 bg-white/95 pb-safe px-2 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden">
      <Button
        variant="ghost"
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="flex flex-col items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white h-auto p-0 font-normal hover:bg-transparent"
      >
        <Plus className="h-5 w-5" />
        <span>Add</span>
      </Button>
      <label className="flex flex-col items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white cursor-pointer">
        <FileUp className="h-5 w-5" />
        <span>Import</span>
        <input 
          type="file" 
          accept=".opml,.xml,text/xml" 
          className="sr-only" 
          onChange={(event) => handleImportOpml(event.target.files?.[0] || null)} 
        />
      </label>
      <Button
        variant="ghost"
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex flex-col items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white h-auto p-0 font-normal hover:bg-transparent"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        <span>Theme</span>
      </Button>
      {user ? (
        <Button
          variant="ghost"
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 text-xs text-zinc-500 hover:text-red-500 h-auto p-0 font-normal hover:bg-transparent"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          type="button"
          onClick={() => setIsAuthOpen(true)}
          className="flex flex-col items-center gap-1 text-xs text-zinc-950 dark:text-white h-auto p-0 font-normal hover:bg-transparent"
        >
          <LogIn className="h-5 w-5" />
          <span>Log in</span>
        </Button>
      )}
    </nav>
  );
}
