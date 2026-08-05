"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader } from "lucide-react";
import Logo from "@/components/ui/logo";
import { LoginForm } from "./auth/LoginForm";
import { SignupForm } from "./auth/SignupForm";
import { ForgotPasswordForm } from "./auth/ForgotPasswordForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "signup";
  onSuccess?: () => void;
}

type View = "login" | "signup" | "forgot";

export default function AuthModal({ isOpen, onClose, initialView = "login", onSuccess }: AuthModalProps) {
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <AuthModalContent key={initialView} initialView={initialView} onClose={onClose} onSuccess={onSuccess} />
        </div>
      )}
    </AnimatePresence>
  );
}

function AuthModalContent({
  initialView,
  onClose,
  onSuccess,
}: {
  initialView: View;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [view, setView] = useState<View>(initialView);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitchView = (newView: View) => {
    setStatus(null);
    setView(newView);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      exit={{ opacity: 0, scale: 0.9, rotateX: 10 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="relative w-full max-w-md overflow-hidden p-1 rounded-lg z-60"
      onClick={(e) => e.stopPropagation()}
    >
      {isLoading ? (
        <div className="flex h-64 w-full items-center justify-center rounded-lg bg-zinc-800">
          <Loader className="animate-spin w-10 h-10 text-white" />
        </div>
      ) : (
        <div className="bg-zinc-800 rounded-lg p-8 max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-6 top-6 text-zinc-500 hover:text-white transition-colors cursor-pointer z-60"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Logo & Heading Area */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ rotate: 45 }}
              whileHover={{ rotate: 135 }}
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-500 rotate-45 border border-white/20 mb-6 transition-colors duration-500 hover:bg-white/20"
            >
              <Logo />
            </motion.div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
              {view === "login" ? "Welcome back" : view === "signup" ? "Create account" : "Reset password"}
            </h2>
            {view !== "forgot" && (
              <p className="text-sm text-zinc-400">
                {view === "login" ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => handleSwitchView(view === "login" ? "signup" : "login")}
                  className="font-semibold ml-2 text-white hover:underline transition-colors cursor-pointer"
                  type="button"
                >
                  {view === "login" ? "Sign up" : "Log in"}
                </button>
              </p>
            )}
          </div>

          {/* Form Routing */}
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {view === "forgot" && (
                <ForgotPasswordForm
                  onError={setStatus}
                  onSwitchView={handleSwitchView}
                  status={status}
                />
              )}

              {view === "login" && (
                <LoginForm
                  onClose={onClose}
                  onSuccess={onSuccess}
                  onError={setStatus}
                  onLoading={setIsLoading}
                  onSwitchView={handleSwitchView}
                  status={status}
                />
              )}

              {view === "signup" && (
                <SignupForm
                  onClose={onClose}
                  onSuccess={onSuccess}
                  onError={setStatus}
                  onLoading={setIsLoading}
                  onSwitchView={handleSwitchView}
                  status={status}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
