import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { Menu, X, ShoppingBag } from "lucide-react";

const nav = [
  { to: "/store", label: "Store" },
  { to: "/how-its-built", label: "How it's built" },
  { to: "/learn", label: "Learn" },
  { to: "/community", label: "Community" },
  { to: "/help", label: "Help" },
  { to: "/about", label: "About" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="shrink-0" aria-label="Home">
          <BrandLogo />
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-muted-foreground transition hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary/50 sm:inline-flex"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            Cart
          </Link>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-border md:hidden">
          <nav className="mx-auto grid w-full max-w-6xl gap-1 px-5 py-4" aria-label="Mobile">
            {[...nav, { to: "/cart", label: "Cart" }, { to: "/contact", label: "Contact" }].map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-base text-foreground hover:bg-muted"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
