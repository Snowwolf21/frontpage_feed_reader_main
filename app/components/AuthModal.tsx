"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff } from "lucide-react";
import Button from "./Button";
import Link from "next/link";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialView = "login" }: AuthModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <AuthModalContent key={initialView} initialView={initialView} onClose={onClose} />
        </div>
      )}
    </AnimatePresence>
  );
}

function AuthModalContent({
  initialView,
  onClose
}: {
  initialView: "login" | "signup";
  onClose: () => void
}) {
  const [view, setView] = useState<"login" | "signup">(initialView);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      exit={{ opacity: 0, scale: 0.9, rotateX: 10 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="relative w-full max-w-md overflow-hidden p-1 rounded-lg z-60"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-zinc-800 rounded-lg p-8">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-zinc-500 hover:text-white transition-colors cursor-pointer z-60"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-8">
          <motion.div
            initial={{ rotate: 45 }}
            whileHover={{ rotate: 135 }}
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-500 rotate-45 border border-white/20 mb-6 transition-colors duration-500 hover:bg-white/20"
          >
            <span className="text-white font-bold text-xl -rotate-45">F</span>
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
            {view === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-sm text-zinc-400">
            {view === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
            <button
              onClick={() => setView(view === "login" ? "signup" : "login")}
              className="font-semibold ml-2 text-white hover:underline transition-colors cursor-pointer"
            >
              {view === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}
          >
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-4"
            >
              {view === "signup" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">
                      First name
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-xl border border-zinc-800 py-3 px-4 text-white bg-zinc-950 placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-700 outline-none transition-all"
                      placeholder="Jane"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">
                      Last name
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-xl border border-zinc-800 py-3 px-4 text-white bg-zinc-950 placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-700 outline-none transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300"
                  aria-labelledby="email">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  className="block w-full rounded-xl border border-zinc-800 py-3 px-4 text-white bg-zinc-950 placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-700 outline-none transition-all"
                  placeholder="jane@example.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-zinc-300"
                    aria-labelledby="password">
                    Password
                  </label>
                  {view === "login" && (
                    <button className="text-xs font-medium text-zinc-500 hover:text-white transition-colors cursor-pointer">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="block w-full rounded-xl border border-zinc-800 py-3 px-4 text-white bg-zinc-950 placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-700 outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {view === "signup" && (
                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-white focus:ring-zinc-700"
                  />
                  <label htmlFor="terms" className="text-xs text-zinc-500">
                    I agree to the <Link href="#" className="underline">Terms</Link> and <Link href="#" className="underline">Privacy</Link>
                  </label>
                </div>
              )}

              {view === "login" && (
                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-white focus:ring-zinc-700"
                  />
                  <label htmlFor="remember" className="text-sm text-zinc-500">
                    Remember me
                  </label>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <Button
            type="submit"
            text={view === "login" ? "Log in" : "Create account"}
            fullWidth
            className="mt-2 bg-white text-zinc-900 hover:bg-zinc-200 border-none py-4 text-lg font-bold shadow-lg shadow-white/5"
          />
        </form>
      </div>
    </motion.div>
  );
}
