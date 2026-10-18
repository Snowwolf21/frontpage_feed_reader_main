import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "./FormInput";
import { PasswordInput } from "./PasswordInput";
import { OAuthButtons } from "./OAuthButtons";

export const dynamic = "force-dynamic";
interface LoginFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  onError: (msg: string | null) => void;
  onLoading: (isLoading: boolean) => void;
  onSwitchView: (view: "login" | "signup" | "forgot") => void;
  status: string | null;
}

export function LoginForm({
  onClose,
  onSuccess,
  onError,
  onLoading,
  onSwitchView,
  status,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      onError("Enter your email.");
      return;
    }
    if (!password.trim()) {
      onError("Enter your password.");
      return;
    }

    onLoading(true);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password, rememberMe }),
      });
      const data = await response.json();

      if (!response.ok) {
        onError(data.message || "Something went wrong. Please try again.");
        onLoading(false);
        setIsSubmitting(false);
        return;
      }

      onSuccess?.();
      onClose();
      router.replace("/dashboard");
      router.refresh();
    } catch {
      onError("Network error. Please try again.");
      onLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormInput
        label="Email address"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="jane@example.com"
        title="Enter a valid email address."
        required
      />

      <PasswordInput
        label="Password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        rightLabelAction={
          <button
            type="button"
            onClick={() => onSwitchView("forgot")}
            className="text-xs font-medium text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        }
        required
      />

      <div className="flex items-center gap-2 py-2">
        <input
          type="checkbox"
          id="remember"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-white focus:ring-zinc-700"
        />
        <label htmlFor="remember" className="text-sm text-zinc-400">
          Remember me for 30 days
        </label>
      </div>

      {status && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
          {status}
        </p>
      )}

      <OAuthButtons />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full px-4 bg-white text-zinc-900 border-none py-6 text-lg font-bold shadow-lg shadow-white/5 cursor-pointer active:scale-[0.98] hover:scale-[1.01] hover:border-zinc-900/10 hover:bg-zinc-200/80 transition-transform duration-200"
      >
        {isSubmitting ? "Please wait..." : "Log in"}
      </Button>
    </form>
  );
}
