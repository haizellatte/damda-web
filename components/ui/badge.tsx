import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "destructive" | "outline";

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  default:     "bg-surface text-foreground-muted border border-border",
  primary:     "bg-primary-subtle text-primary",
  success:     "bg-success-subtle text-success",
  warning:     "bg-warning-subtle text-warning",
  destructive: "bg-destructive-subtle text-destructive",
  outline:     "bg-transparent text-foreground border border-border",
};

const Badge = ({ variant = "default", children, className }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      variantClasses[variant],
      className,
    )}
  >
    {children}
  </span>
);

export default Badge;
