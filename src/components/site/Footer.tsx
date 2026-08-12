import { Link } from "@tanstack/react-router";
import { BrandLogo } from "./BrandLogo";
import { brand } from "@/config/brand";
import { programs } from "@/config/programs";

const cols = [
  {
    title: "Response",
    links: [
      { to: "/response", label: "How we respond" },
      { to: "/where-we-work", label: "Where we work" },
      { to: "/impact", label: "Impact" },
      { to: "/request-help", label: "Request help" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { to: "/donate", label: "Give" },
      { to: "/volunteer", label: "Volunteer" },
      { to: "/partners", label: "Partner with us" },
      { to: "/careers", label: "Careers" },
    ],
  },
  {
    title: "Organization",
    links: [
      { to: "/mission", label: "Mission" },
      { to: "/about", label: "About" },
      { to: "/stories", label: "Field stories" },
      { to: "/contact", label: "Contact" },
    ],
  },

  {
    title: "Legal",
    links: [
      { to: "/faq", label: "FAQ" },
      { to: "/legal/privacy", label: "Privacy" },
      { to: "/legal/terms", label: "Terms" },
      { to: "/legal/cookies", label: "Cookies" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-[var(--night)] text-foreground">
      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-20 sm:px-8">
        <div className="grid gap-14 md:grid-cols-[1.6fr_repeat(4,1fr)]">
          <div>
            <BrandLogo />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">{brand.shortMission}</p>
            <dl className="mt-7 space-y-2 text-sm text-muted-foreground">
              <div>
                <dt className="sr-only">Emergency line</dt>
                <dd>
                  <a className="hover:text-primary" href={`tel:${brand.phone.replace(/[^0-9+]/g, "")}`}>
                    {brand.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Email</dt>
                <dd>
                  <a className="hover:text-primary" href={`mailto:${brand.contact.general}`}>
                    {brand.contact.general}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Hours</dt>
                <dd>{brand.hours}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-5 text-xs text-muted-foreground">
              <a href={brand.socials.instagram} className="hover:text-foreground">Instagram</a>
              <a href={brand.socials.facebook} className="hover:text-foreground">Facebook</a>
              <a href={brand.socials.linkedin} className="hover:text-foreground">LinkedIn</a>
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="rule-label mb-5 text-muted-foreground">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-foreground/75 hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Program index */}
        <div className="mt-20 border-t border-border pt-10">
          <h3 className="rule-label mb-6 text-muted-foreground">The response cycle</h3>
          <ul className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {programs.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/response"
                  hash={p.slug}
                  className="group flex h-full flex-col bg-[var(--night)] px-5 py-6 transition-colors hover:bg-surface"
                >
                  <span className="display-cond text-2xl" style={{ color: p.accent }}>{p.n}</span>
                  <span className="mt-3 text-sm font-semibold text-ink">{p.name}</span>
                  <span className="mt-1 text-xs text-muted-foreground">{p.discipline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {brand.legalName}. A registered nonprofit organization.</p>
          <p>{brand.serviceArea}</p>
        </div>
      </div>
    </footer>
  );
}
