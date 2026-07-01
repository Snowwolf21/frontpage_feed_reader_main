"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Loader } from "lucide-react";
import Button from "./Button";
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
  initialView: "login" | "signup";
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [view, setView] = useState<"login" | "signup">(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
 const [Loading, setLoading] = useState(false);
  const validateForm = () => {
    const trimmedEmail = email.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedUsername = username.trim();
   
    if (view === "signup") {
      if (!EMAIL_REGEX.test(trimmedEmail)) {
        return "Enter a valid email address.";
      }

      if (!NAME_REGEX.test(trimmedFirstName)) {
        return "First name must be 2-50 letters and may include apostrophes or hyphens.";
      }

      if (!NAME_REGEX.test(trimmedLastName)) {
        return "Last name must be 2-50 letters and may include apostrophes or hyphens.";
      }

      if (!USERNAME_REGEX.test(trimmedUsername)) {
        return "Username must start with a letter and use 3-15 letters, numbers, or underscores.";
      }

      // Use new password strength validator
      const passwordStrength = validatePasswordStrength(password);
      if (!passwordStrength.isStrong) {
        return passwordStrength.feedback[0] || "Password is not strong enough.";
      }
    }

    if (view === "login") {
      if (password.trim().length === 0) {
        return "Enter your password.";
      }

      const passwordStrength = validatePasswordStrength(password);
      if (!passwordStrength.isStrong) {
        return passwordStrength.feedback[0] || "Password is not strong enough.";
      }
    }

    return null;
  };
 const router = useRouter();
  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    const validationError = validateForm();
    if (validationError) {
      setStatus(validationError);
      return;
    }

    if (view === "signup" && !termsAccepted) {
      setStatus("Please accept the terms to create an account.");
      return;
    }

    setIsSubmitting(true);

    try {
     
      const endpoint = view === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        view === "login"
          ? { email: email.trim(), password }
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
      setLoading(false);
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
     {
      Loading? (
        <div className="h-full w-full flex items-center justify-center">
          <Loader className="animate-spin w-10 h-10" />
        </div>
      ):(
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
            {view === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-sm text-zinc-400">
            {view === "login" ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setStatus(null);
                setFirstName("");
                setLastName("");
                setUsername("");
                setEmail("");
                setPassword("");
                setTermsAccepted(false);
                setView(view === "login" ? "signup" : "login");
              }}
              className="font-semibold ml-2 text-white hover:underline transition-colors cursor-pointer"
              type="button"
            >
              {view === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
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
                      // pattern="[A-Za-z][A-Za-z'-]{1,49}"
                      title="Use 2-50 letters. Apostrophes and hyphens are allowed."
                      required={view === "signup"}
                      aria-describedby="firstName-help"
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
                      aria-describedby="lastName-help"
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
                    // pattern="[A-Za-z][A-Za-z0-9_]{2,14}"
                    title="Start with a letter. Use 3-15 letters, numbers, or underscores."
                    minLength={3}
                    maxLength={15}
                    required
                    aria-describedby="username-help"
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
                  // pattern="[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}"
                  title="Enter a valid email address."
                  required
                  aria-describedby="email-help"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-zinc-300" htmlFor="password">
                    Password
                  </label>
                  {view === "login" && (
                    <button type="button" className="text-xs font-medium text-zinc-500 hover:text-white transition-colors cursor-pointer">
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
                    aria-describedby="password-help"
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

              {/* Password Strength Meter for Signup */}
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
                    aria-describedby="terms-help"
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
                    className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-white focus:ring-zinc-700"
                    aria-describedby="remember-help"
                  />
                  <label htmlFor="remember" className="text-sm text-zinc-500">
                    Remember me
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
            
            text={isSubmitting ? "Please wait..." : view === "login" ? "Log in" : "Create account"}
            fullWidth
            disabled={isSubmitting}
            className="mt-2 bg-white text-zinc-900 hover:bg-zinc-200 border-none py-4 text-lg font-bold shadow-lg shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </form>
      </div>
      )
     }
    </motion.div>
  );
}
