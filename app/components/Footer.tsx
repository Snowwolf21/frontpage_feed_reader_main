import Link from "next/link";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface FooterProps extends HTMLAttributes<HTMLElement> {
  variant?: "landing" | "dashboard";
}

export const Footer = ({ className, variant = "landing", ...props }: FooterProps) => {
  const isLanding = variant === "landing";

  return (
    <footer
      className={cn(
        "p-8 border-t transition-colors duration-200",
        isLanding 
          ? "mt-24 border-zinc-900 bg-slate-900 text-zinc-400" 
          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 text-text-secondary",
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-sm font-semibold tracking-tight">
          © 2026 Frontpage. Crafted with care for the web.
        </div>
        <div className="flex gap-8 text-sm font-semibold tracking-tight">
          <Link
            href="#"
            className={cn(
              "transition-colors duration-200",
              isLanding
                ? "text-slate-300 hover:text-white"
                : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            )}
          >
            Privacy
          </Link>
          <Link
            href="#"
            className={cn(
              "transition-colors duration-200",
              isLanding
                ? "text-slate-300 hover:text-white"
                : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            )}
          >
            Terms
          </Link>
          <Link
            href="#"
            className={cn(
              "transition-colors duration-200",
              isLanding
                ? "text-slate-300 hover:text-white"
                : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            )}
          >
            Twitter
          </Link>
        </div>
      </div>
    </footer>
  );
};
