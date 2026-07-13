import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BrandLogo } from "./BrandLogo";
import { Menu, X, ShoppingBag } from "lucide-react";

const nav = [
  { to: "/store", label: "Store" },
  { to: "/how-its-built", label: "How it's built" },
  { to: "/learn", label: "Learn" },
  { to: "/community", label: "Community" },
  { to: "/help", label: "Support" },
  { to: "/about", label: "About" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-background/60 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" className="shrink-0" aria-label="Home">
          <BrandLogo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              activeProps={{ className: "text-foreground bg-muted" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-foreground/30 sm:inline-flex"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            Cart
          </Link>
          <Link
            to="/store"
            className="hidden rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 sm:inline-flex"
          >
            Shop
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
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto grid w-full max-w-7xl gap-1 px-5 py-4" aria-label="Mobile">
            {[...nav, { to: "/cart", label: "Cart" }, { to: "/contact", label: "Contact" }].map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base text-foreground hover:bg-muted"
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
