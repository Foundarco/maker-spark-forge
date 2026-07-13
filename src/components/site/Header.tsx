import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { BrandLogo } from "./BrandLogo";
import { Menu, X, ShoppingBag, ChevronDown } from "lucide-react";

type LinkItem = { to: string; label: string; desc?: string; params?: Record<string, string> };
type MegaSection = { heading?: string; links: LinkItem[] };
type NavItem =
  | { label: string; to: string }
  | { label: string; sections: MegaSection[]; featured?: { title: string; body: string; cta: { label: string; to: string } } };

const nav: NavItem[] = [
  {
    label: "Printers",
    sections: [
      {
        heading: "Shop printers",
        links: [
          { to: "/store/$slug", params: { slug: "core-printer" }, label: "The Core Printer", desc: "Our flagship desktop printer" },
          { to: "/store", label: "All printers", desc: "Browse the full lineup" },
          { to: "/compare", label: "Compare models", desc: "Specs side-by-side" },
        ],
      },
      {
        heading: "Add-ons",
        links: [
          { to: "/accessories", label: "Accessories", desc: "Build plates, nozzles, tools" },
          { to: "/upgrades", label: "Upgrades", desc: "Enclosures, extruders, sensors" },
          { to: "/parts", label: "Replacement parts", desc: "Every screw, every belt" },
        ],
      },
    ],
    featured: {
      title: "Now shipping",
      body: "The Core Printer — open frame, direct drive, endlessly repairable.",
      cta: { label: "Shop the Core", to: "/store" },
    },
  },
  {
    label: "Materials",
    sections: [
      {
        heading: "Buy materials",
        links: [
          { to: "/materials/filament", label: "Filament spools", desc: "PLA, PETG, TPU, ABS" },
          { to: "/materials/pellets", label: "Pellets", desc: "Bulk material for the Pellet System" },
          { to: "/materials", label: "All materials", desc: "Browse the catalog" },
        ],
      },
      {
        heading: "Sustainability",
        links: [
          { to: "/materials/recycling", label: "Recycling program", desc: "Send back spools & failed prints" },
        ],
      },
    ],
  },
  {
    label: "Software",
    sections: [
      {
        heading: "Tools",
        links: [
          { to: "/software/slicer", label: "LoomSlicer", desc: "Our free desktop slicer" },
          { to: "/software/app", label: "Mobile app", desc: "Monitor prints from anywhere" },
          { to: "/software/firmware", label: "Firmware", desc: "Open, versioned, changelog-first" },
        ],
      },
      {
        heading: "Resources",
        links: [
          { to: "/software/downloads", label: "Downloads", desc: "Slicer, firmware, drivers" },
          { to: "/software", label: "Software overview", desc: "How everything fits together" },
        ],
      },
    ],
    featured: {
      title: "LoomSlicer 2.0",
      body: "Rewritten from the ground up. Faster, prettier, and 100% free.",
      cta: { label: "See what's new", to: "/software/slicer" },
    },
  },
  {
    label: "Business",
    sections: [
      {
        heading: "Company",
        links: [
          { to: "/about", label: "About", desc: "Who we are, why we exist" },
          { to: "/mission", label: "Our mission", desc: "The 'why' behind the work" },
          { to: "/how-its-built", label: "How it's built", desc: "Engineering & manufacturing" },
          { to: "/careers", label: "Careers", desc: "Come build with us" },
          { to: "/press", label: "Press", desc: "Media kit & mentions" },
        ],
      },
      {
        heading: "Community",
        links: [
          { to: "/community", label: "Community", desc: "Forum, ambassadors, events" },
          { to: "/get-involved", label: "Get involved", desc: "Educators, testers, contributors" },
          { to: "/support-us", label: "Support us", desc: "Ways to help us grow" },
          { to: "/blog", label: "Blog", desc: "Field notes & release journals" },
        ],
      },
    ],
  },
  {
    label: "Support",
    sections: [
      {
        heading: "Get help",
        links: [
          { to: "/help", label: "Help center", desc: "Guides & repair walkthroughs" },
          { to: "/faq", label: "FAQ", desc: "Quick answers" },
          { to: "/contact", label: "Contact us", desc: "Talk to a human" },
        ],
      },
      {
        heading: "Policies",
        links: [
          { to: "/legal/warranty", label: "Warranty", desc: "One year, full coverage" },
          { to: "/legal/shipping-returns", label: "Shipping & returns", desc: "How we ship & handle returns" },
          { to: "/legal/privacy", label: "Privacy", desc: "How we handle your data" },
        ],
      },
    ],
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openWithDelay = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const closeWithDelay = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-background/60 backdrop-blur-md"
      }`}
      onMouseLeave={closeWithDelay}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" className="shrink-0" aria-label="Home">
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {nav.map((item) =>
            "to" in item ? (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                activeProps={{ className: "text-foreground bg-muted" }}
              >
                {item.label}
              </Link>
            ) : (
              <div
                key={item.label}
                onMouseEnter={() => openWithDelay(item.label)}
              >
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm transition hover:bg-muted hover:text-foreground ${
                    openMenu === item.label ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                  aria-expanded={openMenu === item.label}
                  onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition ${openMenu === item.label ? "rotate-180" : ""}`} />
                </button>
              </div>
            )
          )}
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mega menu panel */}
      {openMenu && (
        <div
          className="absolute inset-x-0 top-full hidden border-t border-border bg-background/95 backdrop-blur-xl shadow-xl lg:block"
          onMouseEnter={() => openWithDelay(openMenu)}
          onMouseLeave={closeWithDelay}
        >
          {nav.map((item) => {
            if ("to" in item || item.label !== openMenu) return null;
            return (
              <div key={item.label} className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-10 sm:px-8 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))_1.1fr]">
                {item.sections.map((sec, i) => (
                  <div key={i}>
                    {sec.heading && (
                      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {sec.heading}
                      </p>
                    )}
                    <ul className="space-y-1">
                      {sec.links.map((l) => (
                        <li key={l.to + l.label}>
                          <Link
                            to={l.to}
                            params={l.params}
                            className="group -mx-2 block rounded-lg px-3 py-2 transition hover:bg-muted"
                            onClick={() => setOpenMenu(null)}
                          >
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                              {l.label}
                            </p>
                            {l.desc && (
                              <p className="mt-0.5 text-xs text-muted-foreground">{l.desc}</p>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {item.featured && (
                  <div className="relative overflow-hidden rounded-2xl surface-dark p-6">
                    <div
                      className="pointer-events-none absolute inset-0 opacity-70"
                      style={{
                        background:
                          "radial-gradient(ellipse 80% 80% at 100% 0%, oklch(0.4 0.18 40 / 0.4), transparent 60%)",
                      }}
                      aria-hidden
                    />
                    <div className="relative">
                      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Featured</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{item.featured.title}</h3>
                      <p className="mt-2 text-sm text-white/70">{item.featured.body}</p>
                      <Link
                        to={item.featured.cta.to}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                        onClick={() => setOpenMenu(null)}
                      >
                        {item.featured.cta.label} →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto grid w-full max-w-7xl gap-1 px-5 py-4" aria-label="Mobile">
            {nav.map((item) =>
              "to" in item ? (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-semibold text-foreground hover:bg-muted"
                >
                  {item.label}
                </Link>
              ) : (
                <details key={item.label} className="group rounded-lg">
                  <summary className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-base font-semibold text-foreground hover:bg-muted">
                    {item.label}
                    <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                  </summary>
                  <div className="mt-1 space-y-3 pb-2 pl-3">
                    {item.sections.map((sec, i) => (
                      <div key={i}>
                        {sec.heading && (
                          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            {sec.heading}
                          </p>
                        )}
                        <ul className="space-y-0.5">
                          {sec.links.map((l) => (
                            <li key={l.to + l.label}>
                              <Link
                                to={l.to}
                                params={l.params}
                                onClick={() => setMobileOpen(false)}
                                className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                              >
                                {l.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              )
            )}
            <div className="mt-3 flex gap-2 border-t border-border pt-4">
              <Link
                to="/cart"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-full border border-border px-4 py-2.5 text-center text-sm font-medium"
              >
                Cart
              </Link>
              <Link
                to="/store"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Shop
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
