import { LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  className?: string;
  children?: ReactNode;
  fullWidth?: boolean;
  variant?: "primary" | "ghost" | "secondary";
}

export default function Button({
  text,
  icon: Icon,
  iconPosition = "left",
  className = "",
  children,
  fullWidth = false,
  variant = "primary",
  ...props
}: ButtonProps) {
  const baseStyles = "flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants = {
    primary: "rounded-lg bg-zinc-200 px-4 py-3 text-md font-semibold text-zinc-500 shadow-sm hover:bg-zinc-300 hover:text-zinc-900",
    secondary: "rounded-lg bg-zinc-100 px-4 py-3 text-md font-semibold text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 shadow-sm",
    ghost: "bg-transparent hover:text-zinc-700 p-1"
  };

  const combinedClassName = `
    ${baseStyles}
    ${variants[variant]}
    ${fullWidth ? "w-full" : "w-fit"}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={combinedClassName}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon className="h-5 w-5" />}
      {text || children}
      {Icon && iconPosition === "right" && <Icon className="h-5 w-5" />}
    </button>
  );
}
