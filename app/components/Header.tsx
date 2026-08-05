"use client";

import Logo from "@/components/ui/logo";
import { ReactNode, useState } from "react";
import AuthModal from "./AuthModal";
import Link from "next/link";

interface HeaderProps {
  text?: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  onOpenLogin?: () => void;
}

export const Header = ({
  text = "Frontpage",
  leftContent,
  rightContent,
  onOpenLogin,
}: HeaderProps) => {
  const [localAuthOpen, setLocalAuthOpen] = useState(false);

  const handleLoginClick = () => {
    if (onOpenLogin) {
      onOpenLogin();
    } else {
      setLocalAuthOpen(true);
    }
  };

  return (
    <header className="relative z-10 w-full">
      <div className="flex justify-between items-center p-6 mx-auto max-w-7xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg" aria-label="Frontpage Home">
            <Logo />
            <span className={`text-2xl font-bold tracking-wider font-sans text-zinc-50`}>
              {text}
            </span>
          </Link>
          {leftContent}
        </div>
        
        <div className="flex items-center gap-4">
          {rightContent}
          {!rightContent && (
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLoginClick}
                className="px-4 py-2 text-md font-semibold text-zinc-800 border rounded-md border-zinc-800 bg-slate-400 active:bg-slate-700/60 active:scale-95 sm:hover:text-slate-50 sm:hover:bg-slate-700/90 sm:hover:border-zinc-200 transition-colors duration-300 cursor-pointer"
              >
                Log in
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render local modal only if not overridden by parent callback */}
      {!onOpenLogin && (
        <AuthModal 
          isOpen={localAuthOpen} 
          onClose={() => setLocalAuthOpen(false)} 
          initialView="login"
        />
      )}
    </header>
  );
};
