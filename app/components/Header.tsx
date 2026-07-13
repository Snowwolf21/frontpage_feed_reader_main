"use client";

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
  text = "Frontpage",
  leftContent,
  rightContent,
  
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
            <Logo />
            <span className={`text-2xl font-bold tracking-wider font-sans  text-zinc-50`}>
              {text}
            </span>
          </div>
          {leftContent}
        </div>
        
        <div className="flex items-center gap-4">
          {rightContent}
          {!rightContent && (
            <div className="flex items-center gap-4">
              <button 
                onClick={openLogin}
                className="px-4 py-2 text-md font-semibold text-zinc-800  border rounded-md border-zinc-800 bg-slate-400  active:bg-slate-700/60 active:scale-95 sm:hover:text-slate-50 sm:hover:bg-slate-700/90 sm:hover:border-zinc-200 transition-colors duration-300 cursor-pointer"
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
