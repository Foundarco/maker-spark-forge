import { Link } from "@tanstack/react-router";
import { BrandLogo } from "./BrandLogo";
import { brand } from "@/config/brand";

const cols = [
  {
    title: "Studio",
    links: [
      { to: "/services", label: "Services" },
      { to: "/process", label: "Process" },
      { to: "/work", label: "Work" },
      { to: "/quote", label: "Request a quote" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/mission", label: "Mission" },
      { to: "/careers", label: "Careers" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { to: "/blog", label: "Journal" },
      { to: "/press", label: "Press" },
      { to: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/legal/privacy", label: "Privacy" },
      { to: "/legal/terms", label: "Terms" },
      { to: "/legal/cookies", label: "Cookies" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer
      className="mt-24 text-white"
      style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none h-24 w-full"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,255,255,0.14), transparent 60%)",
        }}
      />
      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-6 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.6fr_repeat(4,1fr)]">
          <div>
            <BrandLogo tone="light" />
            <p className="mt-5 max-w-xs text-sm text-white/70">{brand.tagline}</p>
            <p className="mt-4 max-w-xs text-sm text-white/50">
              A hardware product studio. Design, prototype, and manufacture — under one cloud.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/60">
              <a href={brand.socials.linkedin} className="hover:text-white">LinkedIn</a>
              <a href={brand.socials.instagram} className="hover:text-white">Instagram</a>
              <a href={brand.socials.youtube} className="hover:text-white">YouTube</a>
              <a href={brand.socials.github} className="hover:text-white">GitHub</a>
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-white/70 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
          <p>From idea to shelf — one team, one cloud.</p>
        </div>
      </div>
    </footer>
  );
}
