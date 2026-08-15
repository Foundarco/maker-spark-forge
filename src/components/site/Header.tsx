import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { Menu, X, ArrowUpRight } from "lucide-react";

const nav = [
  { to: "/technology", label: "Technology" },
  { to: "/system", label: "System" },
  { to: "/mission", label: "Mission" },
  { to: "/development", label: "Development" },
] as const;

const secondary = [
  { to: "/operations", label: "Operations Center" },
  { to: "/about", label: "About" },
  { to: "/partners", label: "Partners" },
  { to: "/join", label: "Join the team" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
] as const;

/**
 * Floating overlay navigation. Over the film hero it sits wide and
 * transparent; past the hero it condenses into a compact glass pill.
 */
export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [condensed, setCondensed] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setCondensed(true);
      return;
    }
    const onScroll = () => setCondensed(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6">
        <div
          className={`pointer-events-auto flex w-full items-center justify-between transition-all duration-500 ease-out ${
            condensed
              ? "max-w-3xl gap-4 rounded-full border border-[var(--hair)] bg-[color-mix(in_oklab,var(--sheet)_88%,transparent)] px-2 py-1.5 shadow-[0_18px_50px_-30px_color-mix(in_oklab,var(--ink)_60%,transparent)] backdrop-blur-xl sm:px-2.5"
              : "max-w-7xl gap-6 rounded-full border border-transparent px-2 py-3 sm:px-4"
          }`}
        >
          <Link to="/" aria-label="Clovr Labs home" className="shrink-0">
            <BrandLogo className={condensed ? "[&_span:last-child>span:last-child]:hidden" : ""} />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`text-sm font-medium text-ink/80 transition-colors hover:text-ink ${condensed ? "text-[0.82rem]" : ""}`}
                activeProps={{ className: "text-[var(--signal)]" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
            <Link
              to="/partners"
              className={`inline-flex items-center whitespace-nowrap rounded-full border border-[color-mix(in_oklab,var(--ink)_25%,transparent)] font-semibold leading-none text-ink transition-colors hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)] ${
                condensed ? "px-3.5 py-2 text-[0.78rem]" : "px-5 py-2.5 text-sm"
              }`}
            >
              Partner with us
            </Link>
            <Link
              to="/donate"
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--signal)] font-semibold leading-none text-[var(--on-signal)] transition-colors hover:bg-[var(--ink)] ${
                condensed ? "px-3.5 py-2 text-[0.78rem]" : "px-5 py-2.5 text-sm"
              }`}
            >
              Support us
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[color-mix(in_oklab,var(--ink)_25%,transparent)] text-ink lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-[var(--background)] px-6 pb-16 pt-24 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {[...nav, ...secondary].map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                className="display-cond border-b border-[var(--hair)] py-4 text-3xl font-extrabold tracking-tight text-ink"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-8 flex flex-col gap-3">
              <Link
                to="/donate"
                onClick={() => setMobileOpen(false)}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--signal)] px-6 text-sm font-semibold text-[var(--on-signal)]"
              >
                Support the mission
              </Link>
              <Link
                to="/join"
                onClick={() => setMobileOpen(false)}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--ink)_25%,transparent)] px-6 text-sm font-semibold text-ink"
              >
                Build with us
              </Link>
            </div>
          </nav>
        </div>
      ) : null}

      {isHome ? null : <div className="h-24" aria-hidden />}
    </>
  );
}
