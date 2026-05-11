import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

const Card = ({ children, className, onClick }: CardProps) => (
  <div
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={
      onClick
        ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); }
        : undefined
    }
    className={cn(
      "rounded-xl border border-border bg-card shadow-card",
      onClick && "cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className,
    )}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("px-4 pt-4 pb-2", className)}>{children}</div>
);

const CardContent = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("px-4 py-2", className)}>{children}</div>
);

const CardFooter = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("px-4 pt-2 pb-4", className)}>{children}</div>
);

export { Card, CardHeader, CardContent, CardFooter };
