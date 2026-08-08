import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BrandLogo } from "./BrandLogo";
import { Menu, X, Phone, ChevronDown, ArrowRight, Sparkles } from "lucide-react";
import { brand } from "@/config/brand";
import { divisions } from "@/config/divisions";

const nav = [
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/process", label: "Process" },
  { to: "/about", label: "About" },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
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
        scrolled ? "border-b border-border bg-background/85 backdrop-blur-xl" : "border-b border-transparent bg-background"
      }`}
      onMouseLeave={() => setMegaOpen(false)}
    >
      {/* Rainbow division rule */}
      <div className="rainbow-rule h-[3px] w-full" aria-hidden />

      {/* Announcement strip */}
      <div className="hidden bg-ink text-white lg:block">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-2 text-[0.72rem] sm:px-8">
          <p className="flex items-center gap-2 text-white/80">
            <Sparkles className="h-3.5 w-3.5 text-[var(--acc-excavation)]" aria-hidden />
            All five McGuire divisions are now open and taking work.
          </p>
          <div className="flex items-center gap-5 text-white/60">
            <span>{brand.hours}</span>
            <span aria-hidden>·</span>
            <span>{brand.serviceArea}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" className="shrink-0 transition-transform hover:scale-[1.03]" aria-label={`${brand.name} home`}>
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <button
            type="button"
            onMouseEnter={() => setMegaOpen(true)}
            onClick={() => setMegaOpen((v) => !v)}
            aria-expanded={megaOpen}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
              megaOpen ? "bg-ink text-white" : "text-muted-foreground hover:bg-muted hover:text-ink"
            }`}
          >
            Divisions
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
          </button>
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onMouseEnter={() => setMegaOpen(false)}
              className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-muted hover:text-ink"
              activeProps={{ className: "bg-muted text-ink" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${brand.phone.replace(/[^0-9+]/g, "")}`}
            className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink transition hover:border-ink sm:inline-flex"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--acc-landscape)] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--acc-landscape)]" />
            </span>
            {brand.phone}
          </a>
          <Link
            to="/contact"
            className="group hidden items-center gap-2 rounded-full bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-all hover:shadow-[0_16px_36px_-16px_rgba(0,0,0,0.6)] sm:inline-flex"
          >
            Request an estimate
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Divisions mega menu */}
      {megaOpen ? (
        <div className="hidden border-t border-border bg-card shadow-[0_30px_60px_-40px_rgba(0,0,0,0.5)] lg:block">
          <div className="mx-auto grid w-full max-w-7xl gap-px bg-border px-0 sm:grid-cols-3 lg:grid-cols-5">
            {divisions.map((d) => (
              <Link
                key={d.slug}
                to="/divisions/$slug"
                params={{ slug: d.slug }}
                onClick={() => setMegaOpen(false)}
                style={{ ["--accent-color" as string]: d.accent }}
                className="group relative flex flex-col bg-card p-6 transition-colors hover:accent-wash"
              >
                <span className="absolute inset-x-0 top-0 h-[3px] scale-x-0 accent-bg transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
                <span className="rule-label accent-ink">{d.n}</span>
                <span className="display-cond mt-2 text-xl text-ink">{d.short}</span>
                <span className="mt-2 text-xs leading-relaxed text-muted-foreground">{d.tagline}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] accent-ink">
                  Open now
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 text-xs text-muted-foreground sm:px-8">
            <span>Five divisions. One accountable organization.</span>
            <Link to="/divisions" onClick={() => setMegaOpen(false)} className="font-semibold text-ink hover:underline">
              Explore the McGuire Group →
            </Link>
          </div>
        </div>
      ) : null}

      {mobileOpen ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto grid w-full max-w-7xl gap-1 px-5 py-4" aria-label="Mobile">
            <Link
              to="/divisions"
              onClick={() => setMobileOpen(false)}
              className="border-b border-border/70 py-3 text-base font-semibold text-ink"
            >
              Divisions
            </Link>
            <div className="grid grid-cols-2 gap-2 py-3">
              {divisions.map((d) => (
                <Link
                  key={d.slug}
                  to="/divisions/$slug"
                  params={{ slug: d.slug }}
                  onClick={() => setMobileOpen(false)}
                  style={{ ["--accent-color" as string]: d.accent }}
                  className="rounded-lg accent-wash px-3 py-2 text-sm font-semibold accent-ink"
                >
                  {d.short}
                </Link>
              ))}
            </div>
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
                className="rounded-full border border-border px-4 py-3 text-center text-sm font-medium"
              >
                Call {brand.phone}
              </a>
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-ink px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white"
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
