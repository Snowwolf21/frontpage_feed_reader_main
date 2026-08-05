import type { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export function FormInput({ label, id, className = "", ...props }: FormInputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-md font-medium text-zinc-300" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`block w-full rounded-xl border border-zinc-800 py-3 px-4 text-white bg-zinc-950 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-700 outline-none transition-all ${className}`}
        {...props}
      />
    </div>
  );
}
