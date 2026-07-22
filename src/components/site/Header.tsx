import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { BrandLogo } from "./BrandLogo";
import { Menu, X, ChevronDown, ArrowUpRight } from "lucide-react";

type LinkItem = { to: string; label: string; desc?: string; params?: Record<string, string> };
type MegaSection = { heading?: string; links: LinkItem[] };
type NavItem =
  | { label: string; to: string }
  | { label: string; sections: MegaSection[]; featured?: { title: string; body: string; cta: { label: string; to: string } } };

const nav: NavItem[] = [
  {
    label: "Services",
    sections: [
      {
        heading: "What we do",
        links: [
          { to: "/services", label: "Product Development", desc: "Concept, industrial design, engineering" },
          { to: "/services", label: "Prototyping", desc: "3D print, CNC, electronics in-house" },
          { to: "/services", label: "Manufacturing", desc: "Tooling, assembly, QA, fulfillment" },
        ],
      },
      {
        heading: "Capabilities",
        links: [
          { to: "/services", label: "Mechanical engineering", desc: "CAD, DFM, structural analysis" },
          { to: "/services", label: "Electronics & firmware", desc: "PCB design, embedded software" },
          { to: "/services", label: "Certification & compliance", desc: "FCC, CE, UL, safety" },
        ],
      },
    ],
    featured: {
      title: "One team, end to end",
      body: "Skip the agency handoffs. Design, engineering, and manufacturing under one cloud.",
      cta: { label: "See how we work", to: "/process" },
    },
  },
  { label: "Process", to: "/process" },
  { label: "Work", to: "/work" },
  { label: "About", to: "/about" },
  { label: "Journal", to: "/blog" },
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
          ? "border-b border-sky-200/60 bg-white/85 backdrop-blur-xl"
          : "border-b border-transparent bg-white/60 backdrop-blur-md"
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
                className="rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition hover:bg-sky-100/60 hover:text-foreground"
                activeProps={{ className: "text-foreground bg-sky-100/60" }}
              >
                {item.label}
              </Link>
            ) : (
              <div key={item.label} onMouseEnter={() => openWithDelay(item.label)}>
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm transition hover:bg-sky-100/60 hover:text-foreground ${
                    openMenu === item.label ? "bg-sky-100/60 text-foreground" : "text-muted-foreground"
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
            to="/contact"
            className="hidden rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-medium text-ink hover:border-primary/40 sm:inline-flex"
          >
            Contact
          </Link>
          <Link
            to="/quote"
            className="hidden items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 sm:inline-flex"
          >
            Request a quote <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 lg:hidden"
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
          className="absolute inset-x-0 top-full hidden border-t border-sky-200/60 bg-white/95 backdrop-blur-xl shadow-xl lg:block"
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
                            className="group -mx-2 block rounded-lg px-3 py-2 transition hover:bg-sky-50"
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
                  <div
                    className="relative overflow-hidden rounded-2xl p-6"
                    style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)" }}
                  >
                    <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
                    <div className="relative">
                      <p className="text-xs font-semibold uppercase tracking-widest text-sky-200">Featured</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{item.featured.title}</h3>
                      <p className="mt-2 text-sm text-white/80">{item.featured.body}</p>
                      <Link
                        to={item.featured.cta.to}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white"
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
        <div className="border-t border-sky-200/60 bg-white lg:hidden">
          <nav className="mx-auto grid w-full max-w-7xl gap-1 px-5 py-4" aria-label="Mobile">
            {nav.map((item) =>
              "to" in item ? (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-semibold text-foreground hover:bg-sky-50"
                >
                  {item.label}
                </Link>
              ) : (
                <details key={item.label} className="group rounded-lg">
                  <summary className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-base font-semibold text-foreground hover:bg-sky-50">
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
                                className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-sky-50 hover:text-foreground"
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
            <div className="mt-3 flex gap-2 border-t border-sky-200/60 pt-4">
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-full border border-sky-200 px-4 py-2.5 text-center text-sm font-medium"
              >
                Contact
              </Link>
              <Link
                to="/quote"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Request a quote
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
