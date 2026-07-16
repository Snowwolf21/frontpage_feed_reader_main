"use client";

import { useMemo } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Rss,
  Code,
  Palette,
  Terminal,
  Cpu,
  Brain,
  Folder,
} from "lucide-react";
import { useStore } from "@/app/store/useStore";

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case "all feeds":
      return <Rss className="h-4 w-4" />;
    case "frontend":
      return <Code className="h-4 w-4" />;
    case "design":
      return <Palette className="h-4 w-4" />;
    case "backend & devops":
    case "backend":
    case "devops":
      return <Terminal className="h-4 w-4" />;
    case "general tech":
    case "tech":
      return <Cpu className="h-4 w-4" />;
    case "ai & ml":
    case "ai":
    case "ml":
      return <Brain className="h-4 w-4" />;
    default:
      return <Folder className="h-4 w-4" />;
  }
}

export default function DashboardSidebar() {
  const {
    user,
    subscriptions,
    activeCategory,
    status,
    setActiveCategory,
    isSidebarCollapsed,
    toggleSidebar,
  } = useStore();

  const isGuest = !user;

  const categories = useMemo(
    () => ["All Feeds", ...Array.from(new Set(subscriptions.map((sub) => sub.category || "General")))],
    [subscriptions]
  );

  return (
    <aside 
      className={`hidden border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:block transition-all duration-300 ease-in-out relative ${
        isSidebarCollapsed ? "w-16 p-3 border-r" : "w-64 p-4 border-r"
      }`}
    >
      <button
        type="button"
        onClick={toggleSidebar}
        className="hidden md:flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-all z-40 mx-auto mb-4"
        aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>
      
      <div className="transition-all duration-200">
        {!isSidebarCollapsed && (
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {isGuest ? "Guest Feeds" : "My Feeds"}
          </div>
        )}
        <nav className="space-y-1">
          {categories.map((category) => {
            const count = category === "All Feeds" ? subscriptions.length : subscriptions.filter((item) => item.category === category).length;
            const icon = getCategoryIcon(category);

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                title={isSidebarCollapsed ? `${category} (${count})` : undefined}
                className={`flex w-full items-center rounded-md py-2 transition-all ${
                  isSidebarCollapsed 
                    ? "justify-center px-0 h-9 w-10 mx-auto" 
                    : "justify-between px-3"
                } ${
                  activeCategory === category
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <span className="flex items-center gap-3">
                  {icon}
                  {!isSidebarCollapsed && <span className="truncate">{category}</span>}
                </span>
                {!isSidebarCollapsed && (
                  <span className="text-xs opacity-60">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        {status && !isSidebarCollapsed && (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 rounded-md bg-zinc-100 p-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {status}
          </p>
        )}
      </div>
    </aside>
  );
}
