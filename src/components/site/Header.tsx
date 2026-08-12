import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BrandLogo } from "./BrandLogo";
import { Menu, X, ArrowRight } from "lucide-react";
import { brand } from "@/config/brand";

const nav = [
  { to: "/mission", label: "Mission" },
  { to: "/system", label: "System" },
  { to: "/technology", label: "Technology" },
  { to: "/development", label: "Development" },
  { to: "/about", label: "About" },
] as const;

const secondary = [
  { to: "/operations", label: "Operations Center" },
  { to: "/partners", label: "Partners" },
  { to: "/join", label: "Join the team" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-gradient-to-b from-background/90 to-transparent"
      }`}
    >
      {/* Status strip */}
      <div className="hidden border-b border-border/60 bg-[var(--night)] lg:block">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-2 text-[0.7rem] sm:px-8">
          <p className="flex items-center gap-2 text-foreground/70">
            <span className="live-pulse h-1.5 w-1.5 rounded-full bg-[var(--signal)]" aria-hidden />
            {brand.mission01}
          </p>
          <div className="flex items-center gap-5 text-muted-foreground">
            <span>{brand.status}</span>
            <span aria-hidden>·</span>
            <Link to="/operations" className="text-foreground/80 hover:text-primary">
              {brand.opsCenter}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" className="shrink-0" aria-label={`${brand.name} home`}>
          <BrandLogo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/70 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/join"
            className="px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/70 hover:text-foreground"
          >
            Get involved
          </Link>
          <Link
            to="/donate"
            className="inline-flex min-h-[44px] items-center gap-2 bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-[var(--aid)]"
          >
            Support the mission
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="grid h-11 w-11 place-items-center border border-border text-foreground lg:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 top-20 z-40 overflow-y-auto bg-background px-5 pb-16 pt-8 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                className="display-cond border-b border-border py-5 text-3xl text-ink"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4">
              {secondary.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-muted-foreground"
                >
                  {n.label}
                </Link>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-3">
              <Link
                to="/donate"
                onClick={() => setMobileOpen(false)}
                className="inline-flex min-h-[48px] items-center justify-center bg-primary px-6 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground"
              >
                Support the mission
              </Link>
              <Link
                to="/join"
                onClick={() => setMobileOpen(false)}
                className="inline-flex min-h-[48px] items-center justify-center border border-border px-6 text-xs font-semibold uppercase tracking-[0.14em] text-foreground"
              >
                Build with us
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
