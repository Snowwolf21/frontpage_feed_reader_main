"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, LogOut, User, Bell, Shield } from "lucide-react";
import Link from "next/link";

export default function UserSettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all font-medium text-sm flex items-center justify-center cursor-pointer"
        aria-label="User settings"
      >
        <Settings className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-90 text-blue-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl py-2 z-60 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
          <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Account</p>
          </div>
          
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left text-zinc-700 dark:text-zinc-300">
            <User className="w-4 h-4 text-zinc-400" />
            <span>Profile Settings</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left text-zinc-700 dark:text-zinc-300">
            <Bell className="w-4 h-4 text-zinc-400" />
            <span>Notifications</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left text-zinc-700 dark:text-zinc-300">
            <Shield className="w-4 h-4 text-zinc-400" />
            <span>Security</span>
          </button>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 mx-2" />

          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-semibold">Log out</span>
          </Link>
        </div>
      )}
    </div>
  );
}
