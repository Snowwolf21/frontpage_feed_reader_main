import type { InputHTMLAttributes, ReactNode } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  rightLabelAction?: ReactNode;
}

export function PasswordInput({
  label,
  id,
  rightLabelAction,
  className = "",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-md font-medium text-zinc-300" htmlFor={id}>
          {label}
        </label>
        {rightLabelAction}
      </div>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          className={`block w-full rounded-xl border border-zinc-800 py-2.5 px-4 pr-12 text-white bg-zinc-950 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-700 outline-none transition-all ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
        >
          {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
