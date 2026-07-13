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
    <footer className="mt-24 border-t border-border bg-warm">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.2fr_repeat(5,1fr)]">
        <div>
          <BrandLogo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">{brand.tagline}</p>
          <div className="mt-6 flex gap-3 text-xs text-muted-foreground">
            <a href={brand.socials.discord} className="hover:text-foreground">Discord</a>
            <a href={brand.socials.youtube} className="hover:text-foreground">YouTube</a>
            <a href={brand.socials.instagram} className="hover:text-foreground">Instagram</a>
            <a href={brand.socials.github} className="hover:text-foreground">GitHub</a>
          </div>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground">
              {col.title}
            </h3>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-8">
          <p>© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
          <p>Made with care for people who make things.</p>
        </div>
      </div>
    </footer>
  );
}
