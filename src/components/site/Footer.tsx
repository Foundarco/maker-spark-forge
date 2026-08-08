import { Link } from "@tanstack/react-router";
import { BrandLogo } from "./BrandLogo";
import { brand } from "@/config/brand";

const cols = [
  {
    title: "Work",
    links: [
      { to: "/services", label: "Services" },
      { to: "/projects", label: "Projects" },
      { to: "/process", label: "Process" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/careers", label: "Careers" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { to: "/faq", label: "FAQ" },
      { to: "/blog", label: "Journal" },
      { to: "/help", label: "Homeowner help" },
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
    <footer className="mt-24 bg-ink text-white">
      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-20 sm:px-8">
        <div className="grid gap-14 md:grid-cols-[1.6fr_repeat(4,1fr)]">
          <div>
            <BrandLogo tone="light" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/70">{brand.shortMission}</p>
            <dl className="mt-7 space-y-2 text-sm text-white/70">
              <div>
                <dt className="sr-only">Phone</dt>
                <dd>
                  <a className="hover:text-white" href={`tel:${brand.phone.replace(/[^0-9+]/g, "")}`}>
                    {brand.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Email</dt>
                <dd>
                  <a className="hover:text-white" href={`mailto:${brand.contact.estimates}`}>
                    {brand.contact.estimates}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Hours</dt>
                <dd>{brand.hours}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-5 text-xs text-white/50">
              <a href={brand.socials.instagram} className="hover:text-white">Instagram</a>
              <a href={brand.socials.facebook} className="hover:text-white">Facebook</a>
              <a href={brand.socials.linkedin} className="hover:text-white">LinkedIn</a>
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="rule-label mb-5 text-white/40">{col.title}</h3>
              <ul className="space-y-3">
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
        <div className="mt-16 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {brand.name}. Licensed &amp; insured. All rights reserved.</p>
          <p>{brand.serviceArea}</p>
        </div>
      </div>
    </footer>
  );
}
