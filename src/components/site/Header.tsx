import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BrandLogo } from "./BrandLogo";
import { Menu, X, Phone } from "lucide-react";
import { brand } from "@/config/brand";

const nav = [
  { to: "/divisions", label: "Divisions" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/process", label: "Process" },
  { to: "/about", label: "About" },
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

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "border-b border-border bg-background/90 backdrop-blur-xl" : "border-b border-transparent bg-background"
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" className="shrink-0" aria-label={`${brand.name} home`}>
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rule-label text-muted-foreground transition hover:text-ink"
              activeProps={{ className: "text-ink" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${brand.phone.replace(/[^0-9+]/g, "")}`}
            className="hidden items-center gap-2 text-sm font-medium text-ink hover:text-muted-foreground sm:inline-flex"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {brand.phone}
          </a>
          <Link
            to="/contact"
            className="hidden items-center bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition hover:bg-ink sm:inline-flex"
          >
            Request an estimate
          </Link>
          <button
            className="inline-flex h-11 w-11 items-center justify-center border border-border lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto grid w-full max-w-7xl gap-1 px-5 py-4" aria-label="Mobile">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="border-b border-border/70 py-3 text-base font-semibold text-ink"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={`tel:${brand.phone.replace(/[^0-9+]/g, "")}`}
                className="border border-border px-4 py-3 text-center text-sm font-medium"
              >
                Call {brand.phone}
              </a>
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="bg-primary px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground"
              >
                Request an estimate
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
