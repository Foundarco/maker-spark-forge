import { Link } from "@tanstack/react-router";
import { BrandLogo } from "./BrandLogo";
import { brand } from "@/config/brand";

const cols = [
  {
    title: "Product",
    links: [
      { to: "/store", label: "Store" },
      { to: "/how-its-built", label: "How it's built" },
      { to: "/store/core-printer", label: "The Core Printer" },
    ],
  },
  {
    title: "Learn",
    links: [
      { to: "/learn", label: "Learning Center" },
      { to: "/help", label: "Help & repair" },
      { to: "/blog", label: "Blog" },
      { to: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Community",
    links: [
      { to: "/community", label: "Community" },
      { to: "/get-involved", label: "Get involved" },
      { to: "/support-us", label: "Support us" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/mission", label: "Mission & values" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/legal/privacy", label: "Privacy" },
      { to: "/legal/terms", label: "Terms" },
      { to: "/legal/shipping-returns", label: "Shipping & returns" },
      { to: "/legal/warranty", label: "Warranty" },
      { to: "/legal/cookies", label: "Cookies" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 surface-dark">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(5,1fr)]">
          <div>
            <BrandLogo tone="light" />
            <p className="mt-5 max-w-xs text-sm text-white/60">{brand.tagline}</p>
            <div className="mt-6 flex gap-4 text-xs text-white/50">
              <a href={brand.socials.discord} className="hover:text-white">Discord</a>
              <a href={brand.socials.youtube} className="hover:text-white">YouTube</a>
              <a href={brand.socials.instagram} className="hover:text-white">Instagram</a>
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
                    <Link
                      to={l.to}
                      className="text-sm text-white/70 hover:text-white"
                    >
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
          <p>Built to be understood, repaired, and improved.</p>
        </div>
      </div>
    </footer>
  );
}
