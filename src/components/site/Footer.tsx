import { Link } from "@tanstack/react-router";
import { BrandLogo } from "./BrandLogo";
import { brand } from "@/config/brand";
import { stages } from "@/config/system";

const cols = [
  {
    title: "The system",
    links: [
      { to: "/system", label: "Architecture" },
      { to: "/technology", label: "Technology" },
      { to: "/operations", label: "Operations Center" },
      { to: "/development", label: "Development status" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { to: "/join", label: "Join the team" },
      { to: "/partners", label: "Partner with us" },
      { to: "/donate", label: "Support the mission" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Organization",
    links: [
      { to: "/mission", label: "Mission" },
      { to: "/about", label: "About" },
      { to: "/faq", label: "FAQ" },
      { to: "/client-login", label: "Portal" },
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
    <footer className="mt-24 border-t border-border bg-[var(--night)] text-foreground">
      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-20 sm:px-8">
        <div className="grid gap-14 md:grid-cols-[1.6fr_repeat(4,1fr)]">
          <div>
            <BrandLogo />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">{brand.shortMission}</p>
            <dl className="mt-7 space-y-2 text-sm text-muted-foreground">
              <div>
                <dt className="sr-only">Email</dt>
                <dd>
                  <a className="hover:text-primary" href={`mailto:${brand.contact.general}`}>
                    {brand.contact.general}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Operations Center</dt>
                <dd>{brand.hours}</dd>
              </div>
              <div>
                <dt className="sr-only">Status</dt>
                <dd>{brand.status}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-5 text-xs text-muted-foreground">
              <a href={brand.socials.linkedin} className="hover:text-foreground">LinkedIn</a>
              <a href={brand.socials.github} className="hover:text-foreground">GitHub</a>
              <a href={brand.socials.instagram} className="hover:text-foreground">Instagram</a>
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

        {/* Architecture index */}
        <div className="mt-20 border-t border-border pt-10">
          <h3 className="rule-label mb-6 text-muted-foreground">Detection to responder</h3>
          <ul className="grid gap-px bg-border sm:grid-cols-3 lg:grid-cols-9">
            {stages.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/system"
                  hash={p.slug}
                  className="group flex h-full flex-col bg-[var(--night)] px-4 py-5 transition-colors hover:bg-surface"
                >
                  <span className="font-mono text-xs tabular-nums" style={{ color: p.accent }}>{p.n}</span>
                  <span className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {brand.legalName}. A mission-driven nonprofit organization.</p>
          <p>{brand.status} · {brand.opsCenter}</p>
        </div>
      </div>
    </footer>
  );
}
