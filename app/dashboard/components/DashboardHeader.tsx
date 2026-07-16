"use client";

import { useMemo } from "react";
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
  Folder,
  ChevronDown,
} from "lucide-react";
import Logo from "@/components/ui/logo";
import { useStore } from "@/app/store/useStore";
import type { Subscription } from "@/app/store/useStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  sampleSubscriptions: Subscription[];
}

export default function DashboardHeader({ sampleSubscriptions }: DashboardHeaderProps) {
  const {
    user,
    search,
    theme,
    subscriptions,
    activeCategory,
    selectedFeedUrl,
    setSearch,
    setIsAddOpen,
    setIsAuthOpen,
    setTheme,
    importOpml,
    logout,
    setActiveCategory,
    setSelectedFeedUrl,
    activeTab,
    setActiveTab,
  } = useStore();

  const categories = useMemo(
    () => ["All Feeds", ...Array.from(new Set(subscriptions.map((sub) => sub.category || "General")))],
    [subscriptions]
  );

  const selectedSubscription = useMemo(
    () => subscriptions.find((sub) => sub.feedUrl === selectedFeedUrl),
    [subscriptions, selectedFeedUrl]
  );

  const handleImportOpml = async (file: File | null) => {
    await importOpml(file);
  };

  const handleLogout = async () => {
    await logout(sampleSubscriptions);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-3 md:gap-5">
          <Link href="/" className="flex items-center gap-2 font-bold shrink-0">
            <Logo />
          </Link>
         
          {/* Mobile Categories & Feed Sources Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 text-xs md:hidden shrink-0 h-9 px-3 border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 rounded-lg cursor-pointer transition-colors outline-none">
              <Folder className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span className="max-w-[90px] truncate">{selectedSubscription?.title || activeCategory}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-zinc-950 border border-zinc-800 text-zinc-50 p-2">
              <div className="px-2 py-1 text-xs font-bold text-zinc-500 uppercase tracking-wider">Categories</div>
              <DropdownMenuSeparator className="bg-zinc-800 my-1.5" />
              {categories.map((category) => {
                const categoryFeeds = subscriptions.filter(
                  (sub) => category === "All Feeds" || sub.category === category
                );

                return (
                  <DropdownMenuSub key={category}>
                    <DropdownMenuSubTrigger className="hover:bg-zinc-900 focus:bg-zinc-900 cursor-pointer">
                      <span className="truncate">{category} ({categoryFeeds.length})</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-64 bg-zinc-950 border border-zinc-800 text-zinc-50">
                      <DropdownMenuItem
                        onClick={() => {
                          setActiveCategory(category);
                          setSelectedFeedUrl(""); // Show all in this category
                        }}
                        className="hover:bg-zinc-900 focus:bg-zinc-900 cursor-pointer font-semibold"
                      >
                        All in {category}
                      </DropdownMenuItem>
                      {categoryFeeds.length > 0 && <DropdownMenuSeparator className="bg-zinc-800" />}
                      {categoryFeeds.map((feed) => (
                        <DropdownMenuItem
                          key={feed.feedUrl}
                          onClick={() => {
                            setActiveCategory(category);
                            setSelectedFeedUrl(feed.feedUrl);
                          }}
                          className={`hover:bg-zinc-900 focus:bg-zinc-900 cursor-pointer text-xs ${
                            selectedFeedUrl === feed.feedUrl ? "bg-zinc-900 font-bold" : ""
                          }`}
                        >
                          <span className="truncate">{feed.title}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <nav className="hidden items-center gap-1 bg-zinc-100/80 dark:bg-zinc-900/80 p-0.5 rounded-full border border-zinc-200/50 dark:border-zinc-850/50 md:flex">
            <button
              type="button"
              onClick={() => setActiveTab("feed")}
              aria-current={activeTab === "feed" ? "page" : undefined}
              className={`rounded-full px-3 py-1 text-xs transition-all duration-150 outline-none cursor-pointer ${
                activeTab === "feed"
                  ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-zinc-50 font-semibold"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Feed
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("digest")}
              aria-current={activeTab === "digest" ? "page" : undefined}
              className={`rounded-full px-3 py-1 text-xs transition-all duration-150 outline-none cursor-pointer ${
                activeTab === "digest"
                  ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-zinc-50 font-semibold"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Digest
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("discover")}
              aria-current={activeTab === "discover" ? "page" : undefined}
              className={`rounded-full px-3 py-1 text-xs transition-all duration-150 outline-none cursor-pointer ${
                activeTab === "discover"
                  ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-zinc-50 font-semibold"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Discover
            </button>
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
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 shrink-0 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsAddOpen(true)}
            className="hidden md:flex"
            aria-label="Add feed"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <label className="hidden md:flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
            <FileUp className="h-4 w-4" />
            <input 
              type="file" 
              accept=".opml,.xml,text/xml" 
              className="sr-only" 
              onChange={(event) => handleImportOpml(event.target.files?.[0] || null)} 
            />
          </label>
          {user ? (
            <div className="hidden md:flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              <User className="h-4 w-4 text-zinc-500" />
              <span className="hidden max-w-28 truncate sm:inline">{user.firstName || user.username || user.email}</span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={handleLogout} aria-label="Log out">
                <LogOut className="h-4 w-4 text-zinc-500 hover:text-red-500" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="hidden md:flex h-9 items-center gap-2 px-3 text-sm font-semibold"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Log in</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
