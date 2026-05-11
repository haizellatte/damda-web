import { type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
  children: React.ReactNode;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.98]",
  secondary:
    "bg-primary-subtle text-primary hover:bg-orange-100 active:scale-[0.98]",
  outline:
    "border border-border bg-card text-foreground hover:bg-surface active:scale-[0.98]",
  ghost:
    "bg-transparent text-foreground-muted hover:bg-surface active:scale-[0.98]",
  destructive:
    "bg-destructive text-white hover:opacity-90 active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded-md gap-1.5",
  md: "h-10 px-4 text-sm rounded-lg gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
};

const Button = ({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = "button",
  "aria-label": ariaLabel,
  children,
  className,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex items-center justify-center font-medium",
        "transition-all duration-150 select-none cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        isDisabled && "opacity-40 cursor-not-allowed pointer-events-none",
        className,
      )}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
};

export default Button;
