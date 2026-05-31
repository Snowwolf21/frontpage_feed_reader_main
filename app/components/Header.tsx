"use client";

import Link from "next/link";
import Logo from "@/components/ui/logo";
import { ReactNode, useState } from "react";
import AuthModal from "./AuthModal";


interface HeaderProps {
  logo?: ReactNode;
  text?: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  className?: string;
  textClassName?: string;
  containerClassName?: string;
  showDefaultAuth?: boolean;
}

export const Header = ({
  logo = <Logo />,
  text = "Frontpage",
  leftContent,
  rightContent,
  showDefaultAuth = true,
}: HeaderProps) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "signup">("login");

  const openLogin = () => {
    setAuthModalView("login");
    setIsAuthModalOpen(true);
  };

  

  return (
    <header className="relative z-10 w-full">
      <div className="flex justify-between items-center p-6 mx-auto max-w-7xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {logo}
            <span className={`text-2xl font-bold tracking-wider font-sans ${showDefaultAuth ? 'text-zinc-900': 'text-zinc-50'}`}>
              {text}
            </span>
          </div>
          {leftContent}
        </div>
        
        <div className="flex items-center gap-4">
          {rightContent}
          {showDefaultAuth && !rightContent && (
            <div className="flex items-center gap-4">
              <button 
                onClick={openLogin}
                className="px-4 py-2 text-md font-semibold text-zinc-800  border rounded-md border-zinc-800 bg-zinc-300 hover:text-zinc-50 hover:bg-zinc-500 transition-colors cursor-pointer"
              >
                Log in
              </button>
              
            </div>
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authModalView}
      />
    </header>
  );
};

