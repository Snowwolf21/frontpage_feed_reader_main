import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "./FormInput";

interface ForgotPasswordFormProps {
  onError: (msg: string | null) => void;
  onSwitchView: (view: "login" | "signup" | "forgot") => void;
  status: string | null;
}

export function ForgotPasswordForm({ onError, onSwitchView, status }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();

      if (!response.ok && response.status !== 200) {
        onError(data.message || "Something went wrong. Please try again.");
        return;
      }

      setForgotSent(true);
    } catch {
      onError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (forgotSent) {
    return (
      <div className="text-center py-6">
        <div className="mb-4 text-4xl">📬</div>
        <p className="text-zinc-300 text-sm leading-relaxed">
          If that email is registered, a reset link has been sent. Check your inbox (and spam folder).
        </p>
        <button
          type="button"
          onClick={() => onSwitchView("login")}
          className="mt-6 text-sm text-zinc-400 hover:text-white underline cursor-pointer"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-zinc-400 mb-4">
        Enter your email and we&apos;ll send you a reset link valid for 10 minutes.
      </p>

      <FormInput
        label="Email address"
        id="forgot-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        onClick={() => onSwitchView("login")}
        className="mt-2 w-full text-center text-sm text-zinc-500 hover:text-white transition-colors cursor-pointer"
      >
        ← Back to login
      </button>
    </form>
  );
}
