"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import { validatePasswordStrength } from "@/app/lib/passwordValidator";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "signup";
  onSuccess?: () => void;
}

const NAME_REGEX = /^[A-Za-z][A-Za-z'-]{1,49}$/;
const USERNAME_REGEX = /^[A-Za-z][A-Za-z0-9_]{2,14}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

// OAuth provider button configuration
const OAUTH_PROVIDERS = [
  {
    id: "google",
    label: "Continue with Google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  {
    id: "github",
    label: "Continue with GitHub",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    label: "Continue with LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
] as const;

function AuthModalContent({
  initialView,
  onClose,
  onSuccess,
}: {
  initialView: "login" | "signup";
  onClose: () => void;
  onSuccess?: () => void;
}) {
  type View = "login" | "signup" | "forgot";

  const [view, setView] = useState<View>(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const resetFields = () => {
    setStatus(null);
    setFirstName("");
    setLastName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setTermsAccepted(false);
    setRememberMe(false);
    setForgotSent(false);
  };

  const validateForm = () => {
    const trimmedEmail = email.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedUsername = username.trim();

    if (view === "signup") {
      if (!EMAIL_REGEX.test(trimmedEmail)) return "Enter a valid email address.";
      if (!NAME_REGEX.test(trimmedFirstName)) return "First name must be 2-50 letters.";
      if (!NAME_REGEX.test(trimmedLastName)) return "Last name must be 2-50 letters.";
      if (!USERNAME_REGEX.test(trimmedUsername)) return "Username must start with a letter, 3-15 chars.";

      const passwordStrength = validatePasswordStrength(password);
      if (!passwordStrength.isStrong) {
        return passwordStrength.feedback[0] || "Password is not strong enough.";
      }
    }

    // NOTE: No password strength check on login — users with older passwords must not be locked out
    if (view === "login") {
      if (!email.trim()) return "Enter your email.";
      if (!password.trim()) return "Enter your password.";
    }

    return null;
  };

  const router = useRouter();

  const submitForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();

      if (!response.ok && response.status !== 200) {
        setStatus(data.message || "Something went wrong. Please try again.");
        return;
      }

      setForgotSent(true);
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setStatus(validationError);
      setIsLoading(false);
      return;
    }

    if (view === "signup" && !termsAccepted) {
      setStatus("Please accept the terms to create an account.");
      setIsLoading(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = view === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        view === "login"
          ? { email: email.trim(), password, rememberMe }
          : {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              username: username.trim(),
              email: email.trim(),
              password,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus(data.message || "Something went wrong. Please try again.");
        return;
      }

      if (view === "signup") {
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        if (!loginResponse.ok) {
          setStatus("Account created. Please log in.");
          setView("login");
          return;
        }
      }

      onSuccess?.();
      onClose();
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
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
          <button
            onClick={onClose}
            aria-label="Close modal"
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
              <Logo />
            </motion.div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
              {view === "login" ? "Welcome back" : view === "signup" ? "Create account" : "Reset password"}
            </h2>
            {view !== "forgot" && (
              <p className="text-sm text-zinc-400">
                {view === "login" ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => { resetFields(); setView(view === "login" ? "signup" : "login"); }}
                  className="font-semibold ml-2 text-white hover:underline transition-colors cursor-pointer"
                  type="button"
                >
                  {view === "login" ? "Sign up" : "Log in"}
                </button>
              </p>
            )}
          </div>

          {/* Forgot Password View */}
          {view === "forgot" && (
            <div>
              {forgotSent ? (
                <div className="text-center py-6">
                  <div className="mb-4 text-4xl">📬</div>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    If that email is registered, a reset link has been sent. Check your inbox (and spam folder).
                  </p>
                  <button
                    type="button"
                    onClick={() => { resetFields(); setView("login"); }}
                    className="mt-6 text-sm text-zinc-400 hover:text-white underline"
                  >
                    Back to login
                  </button>
                </div>
              ) : (
                <form onSubmit={submitForgotPassword} className="space-y-4">
                  <p className="text-sm text-zinc-400 mb-4">
                    Enter your email and we&apos;ll send you a reset link valid for 10 minutes.
                  </p>
                  <label className="block text-sm font-medium text-zinc-300" htmlFor="forgot-email">
                    Email address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-zinc-800 py-3 px-4 text-white bg-zinc-950 placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-700 outline-none transition-all"
                    placeholder="jane@example.com"
                    required
                  />
                  {status && (
                    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
                      {status}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 w-full bg-white text-zinc-900 hover:bg-zinc-200 border-none py-4 text-lg font-bold disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send reset link"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { resetFields(); setView("login"); }}
                    className="mt-2 w-full text-center text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    ← Back to login
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Login / Signup View */}
          {view !== "forgot" && (
            <>
              {/* OAuth Buttons */}
              <div className="space-y-2 mb-6">
                {OAUTH_PROVIDERS.map((provider) => (
                  <a
                    key={provider.id}
                    href={`/api/auth/oauth/redirect?provider=${provider.id}`}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 hover:border-zinc-500"
                  >
                    {provider.icon}
                    {provider.label}
                  </a>
                ))}
              </div>

              <div className="relative mb-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-700" />
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">or</span>
                <div className="h-px flex-1 bg-zinc-700" />
              </div>

              <form className="space-y-4" onSubmit={submitAuth}>
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
                          <label className="block text-sm font-medium text-zinc-300" htmlFor="firstName">
                            First name
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            className="block w-full rounded-xl border border-zinc-800 py-3 px-4 text-white bg-zinc-950 placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-700 outline-none transition-all"
                            placeholder="Jane"
                            title="Use 2-50 letters. Apostrophes and hyphens are allowed."
                            required={view === "signup"}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-zinc-300" htmlFor="lastName">
                            Last name
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            className="block w-full rounded-xl border border-zinc-800 py-3 px-4 text-white bg-zinc-950 placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-700 outline-none transition-all"
                            placeholder="Doe"
                            pattern="[A-Za-z][A-Za-z'-]{1,49}"
                            title="Use 2-50 letters. Apostrophes and hyphens are allowed."
                            required={view === "signup"}
                          />
                        </div>
                      </div>
                    )}

                    {view === "signup" && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-300" htmlFor="username">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          className="block w-full rounded-xl border border-zinc-800 py-3 px-4 text-white bg-zinc-950 placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-700 outline-none transition-all"
                          placeholder="janedoe"
                          title="Start with a letter. Use 3-15 letters, numbers, or underscores."
                          minLength={3}
                          maxLength={15}
                          required
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-zinc-300" htmlFor="email">
                        Email address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="block w-full rounded-xl border border-zinc-800 py-3 px-4 text-white bg-zinc-950 placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-700 outline-none transition-all"
                        placeholder="jane@example.com"
                        title="Enter a valid email address."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-zinc-300" htmlFor="password">
                          Password
                        </label>
                        {view === "login" && (
                          <button
                            type="button"
                            onClick={() => { resetFields(); setView("forgot"); }}
                            className="text-xs font-medium text-zinc-500 hover:text-white transition-colors cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className="block w-full rounded-xl border border-zinc-800 py-3 px-4 text-white bg-zinc-950 placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-700 outline-none transition-all"
                          placeholder="••••••••"
                          minLength={view === "signup" ? 12 : undefined}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {view === "signup" && password && (
                      <PasswordStrengthMeter password={password} showFeedback={true} />
                    )}

                    {view === "signup" && (
                      <div className="flex items-start gap-2 py-2">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={termsAccepted}
                          onChange={(event) => setTermsAccepted(event.target.checked)}
                          className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-white focus:ring-zinc-700 mt-1"
                          required
                        />
                        <label htmlFor="terms" className="text-xs text-zinc-500">
                          I agree to the <Link href="#" className="underline hover:text-zinc-400">Terms</Link> and{" "}
                          <Link href="#" className="underline hover:text-zinc-400">Privacy Policy</Link>
                        </label>
                      </div>
                    )}

                    {view === "login" && (
                      <div className="flex items-center gap-2 py-2">
                        <input
                          type="checkbox"
                          id="remember"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-white focus:ring-zinc-700"
                        />
                        <label htmlFor="remember" className="text-sm text-zinc-500">
                          Remember me for 30 days
                        </label>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {status && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
                    {status}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full bg-white text-zinc-900 hover:bg-zinc-200 border-none py-4 text-lg font-bold shadow-lg shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Please wait..." : view === "login" ? "Log in" : "Create account"}
                </Button>
              </form>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
