"use client";

import Link from "next/link";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { useState } from "react";
import AuthModal from "./components/AuthModal";
import { useSkipToMain } from "./hooks/useSkipToMain";

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { mainRef, skipToMain } = useSkipToMain();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100">
      {/* Skip to main content link */}
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          skipToMain();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:bg-blue-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-50" />

      <Header />

      <main
        ref={mainRef}
        id="main"
        tabIndex={-1}
        className="relative flex flex-col items-center justify-center mt-20 px-6 text-center max-w-4xl mx-auto focus:outline-none"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance text-zinc-900">
          All your news in one <span className="text-zinc-400">beautiful</span> place.
        </h1>

        <p className="text-lg md:text-xl text-zinc-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Frontpage brings together your favorite RSS feeds into a clean, distraction-free reading experience. Fast,
          modern, and completely yours.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-900 font-bold rounded-2xl hover:bg-zinc-100 transition-all shadow-xl shadow-zinc-200/50 active:scale-[0.98] cursor-pointer focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
            aria-label="Sign up for a free account"
          >
            Get Started for Free
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-zinc-800 text-white font-semibold rounded-2xl border border-zinc-700 hover:bg-zinc-900 transition-all shadow-sm active:scale-[0.98] focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          >
            Try as Guest
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-2xl bg-zinc-700 border border-zinc-700 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-500">
            <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="1" />
                <path d="M12 1v6m0 6v6" />
                <path d="M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24" />
              </svg>
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">Infinite Feeds</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Add any RSS or Atom feed. Organize them into collections that make sense for you.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-700 border border-zinc-700 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-500">
            <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2L15.09 8.26H22L17.55 12.5L19.64 18.74L12 14.5L4.36 18.74L6.45 12.5L2 8.26H8.91L12 2" />
              </svg>
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">Pure Reading</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              No ads, no tracking, no clutter. Just the content you want in a beautiful interface.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-700 border border-zinc-700 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-500">
            <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">Sync Anywhere</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Your feeds and read state stay in sync across all your devices seamlessly.
            </p>
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView="signup"
      />
    </div>
  );
}
