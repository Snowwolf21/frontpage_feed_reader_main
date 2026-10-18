import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PasswordStrengthMeter from "../PasswordStrengthMeter";
import { validatePasswordStrength } from "@/app/lib/passwordValidator";
import { FormInput } from "./FormInput";
import { PasswordInput } from "./PasswordInput";
import { OAuthButtons } from "./OAuthButtons";
export const dynamic = "force-dynamic";
const NAME_REGEX = /^[A-Za-z][A-Za-z'-]{1,49}$/;
const USERNAME_REGEX = /^[A-Za-z][A-Za-z0-9_]{2,14}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface SignupFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  onError: (msg: string | null) => void;
  onLoading: (isLoading: boolean) => void;
  onSwitchView: (view: "login" | "signup" | "forgot") => void;
  status: string | null;
}

export function SignupForm({
  onClose,
  onSuccess,
  onError,
  onLoading,
  onSwitchView,
  status,
}: SignupFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const trimmedEmail = email.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedUsername = username.trim();

    if (!EMAIL_REGEX.test(trimmedEmail)) return "Enter a valid email address.";
    if (!NAME_REGEX.test(trimmedFirstName)) return "First name must be 2-50 letters.";
    if (!NAME_REGEX.test(trimmedLastName)) return "Last name must be 2-50 letters.";
    if (!USERNAME_REGEX.test(trimmedUsername)) return "Username must start with a letter, 3-15 chars.";

    const passwordStrength = validatePasswordStrength(password);
    if (!passwordStrength.isStrong) {
      return passwordStrength.feedback[0] || "Password is not strong enough.";
    }

    if (!termsAccepted) {
      return "Please accept the terms to create an account.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onError(null);

    const validationError = validateForm();
    if (validationError) {
      onError(validationError);
      return;
    }

    onLoading(true);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        onError(data.message || "Something went wrong. Please try again.");
        onLoading(false);
        setIsSubmitting(false);
        return;
      }

      // Automatically log the user in after registration
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!loginResponse.ok) {
        onError("Account created. Please log in.");
        onSwitchView("login");
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
    <form className="space-y-2" onSubmit={handleSubmit}>
      
        <FormInput
          label="First name"
          id="firstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Jane"
          title="Use 2-50 letters. Apostrophes and hyphens are allowed."
          required
        />

        <FormInput
          label="Last name"
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Doe"
          title="Use 2-50 letters. Apostrophes and hyphens are allowed."
          required
        />
      

      <FormInput
        label="Username"
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="janedoe"
        title="Start with a letter. Use 3-15 letters, numbers, or underscores."
        minLength={3}
        maxLength={15}
        required
      />

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
        minLength={12}
        required
      />

      {password && <PasswordStrengthMeter password={password} showFeedback={true} />}

      <div className="flex items-start gap-2 py-2">
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-white focus:ring-zinc-700 mt-1"
          required
        />
        <label htmlFor="terms" className="text-xs text-zinc-500">
          I agree to the{" "}
          <Link href="#" className="underline hover:text-zinc-400">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline hover:text-zinc-400">
            Privacy Policy
          </Link>
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
        className="mt-2 w-full bg-white text-zinc-900 hover:bg-zinc-200 border-none py-6 text-lg font-bold shadow-lg shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Please wait..." : "Sign up"}
      </Button>
    </form>
  );
}
