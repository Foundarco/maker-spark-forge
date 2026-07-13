import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "border border-border bg-card text-foreground hover:border-primary/50",
  ghost: "text-foreground hover:bg-muted",
};

export function CTAButton({
  children,
  variant = "primary",
  className = "",
  ...rest
}: { children: ReactNode; variant?: Variant; className?: string } & ComponentProps<typeof Link>) {
  return (
    <Link {...rest} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function CTAButtonA({
  children,
  variant = "primary",
  className = "",
  ...rest
}: { children: ReactNode; variant?: Variant; className?: string } & ComponentProps<"a">) {
  return (
    <a {...rest} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </a>
  );
}

export function CTAButtonBtn({
  children,
  variant = "primary",
  className = "",
  ...rest
}: { children: ReactNode; variant?: Variant; className?: string } & ComponentProps<"button">) {
  return (
    <button {...rest} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
