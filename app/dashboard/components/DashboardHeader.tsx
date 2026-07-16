"use client";

import Link from "next/link";
import {
  FileUp,
  LogIn,
  LogOut,
  Moon,
  Plus,
  SearchIcon,
  Sun,
  User,
} from "lucide-react";
import Logo from "@/components/ui/logo";
import { useStore } from "@/app/store/useStore";
import type { Subscription } from "@/app/store/useStore";

interface DashboardHeaderProps {
  sampleSubscriptions: Subscription[];
}

export default function DashboardHeader({ sampleSubscriptions }: DashboardHeaderProps) {
  const {
    user,
    search,
    theme,
    setSearch,
    setIsAddOpen,
    setIsAuthOpen,
    setTheme,
    setStatus,
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
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2 font-bold shrink-0">
            <Logo />
          </Link>
         
          <nav className="hidden items-center gap-4 text-sm font-medium text-zinc-500 md:flex">
            <button type="button" className="text-zinc-950 dark:text-white">Feed</button>
            <button type="button" onClick={() => setStatus("Digest — coming soon!")} className="hover:text-zinc-950 dark:hover:text-white transition-colors">Digest</button>
            <button type="button" onClick={() => setStatus("Discover — coming soon!")} className="hover:text-zinc-950 dark:hover:text-white transition-colors">Discover</button>
          </nav>
        </div>

        <div className="flex flex-1 md:flex-none justify-end items-center gap-2">
          <div className="relative w-full max-w-xs md:w-48">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search feeds"
              className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            aria-label="Add feed"
          >
            <Plus className="h-4 w-4" />
          </button>
          <label className="hidden md:flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
            <FileUp className="h-4 w-4" />
            <input 
              type="file" 
              accept=".opml,.xml,text/xml" 
              className="sr-only" 
              onChange={(event) => handleImportOpml(event.target.files?.[0] || null)} 
            />
          </label>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user ? (
            <div className="hidden md:flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              <User className="h-4 w-4 text-zinc-500" />
              <span className="hidden max-w-28 truncate sm:inline">{user.firstName || user.username || user.email}</span>
              <button type="button" onClick={handleLogout} aria-label="Log out">
                <LogOut className="h-4 w-4 text-zinc-500 hover:text-red-500" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="hidden md:flex h-9 items-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Log in</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
