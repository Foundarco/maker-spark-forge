import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Github, Instagram, Linkedin, Youtube } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { brand } from "@/config/brand";
import ridge from "@/assets/j-ridge.jpg";

const colA = [
  { to: "/mission", label: "Mission" },
  { to: "/system", label: "The system" },
  { to: "/technology", label: "Technology" },
  { to: "/operations", label: "Operations Center" },
  { to: "/development", label: "Development status" },
] as const;

const colB = [
  { to: "/join", label: "Join the team" },
  { to: "/partners", label: "Partner with us" },
  { to: "/donate", label: "Support the mission" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
] as const;

const legal = [
  { to: "/legal/privacy", label: "Privacy" },
  { to: "/legal/terms", label: "Terms" },
  { to: "/legal/cookies", label: "Cookies" },
] as const;

const socials = [
  { href: brand.socials.instagram, label: "Instagram", Icon: Instagram },
  { href: brand.socials.linkedin, label: "LinkedIn", Icon: Linkedin },
  { href: brand.socials.youtube, label: "YouTube", Icon: Youtube },
  { href: brand.socials.github, label: "GitHub", Icon: Github },
] as const;

/** Full-bleed cinematic footer — media plate with the sitemap laid over it. */
export function Footer() {
  return (
    <footer className="relative isolate min-h-[86svh] overflow-hidden bg-[var(--night)] text-ink">
      <img
        src={ridge}
        alt=""
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        loading="lazy"
        width={1600}
        height={1000}
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,color-mix(in_oklab,_var(--night)_55%,_transparent),color-mix(in_oklab,_var(--night)_35%,_transparent)_35%,color-mix(in_oklab,_var(--night)_94%,_transparent))]"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex min-h-[86svh] w-full max-w-7xl flex-col justify-between px-6 pb-10 pt-24 sm:px-10"
      >
        <div className="max-w-3xl">
          <h2 className="display-cond text-[clamp(2.6rem,8vw,7rem)] leading-[0.86] text-ink">
            See it sooner.
          </h2>
          <p className="mt-5 max-w-md text-base text-ink/75">{brand.shortMission}</p>
        </div>

        <div className="mt-16 flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <BrandLogo />
            <div className="mt-8 grid grid-cols-2 gap-x-12 gap-y-3 sm:gap-x-16">
              <ul className="space-y-3">
                {colA.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm font-semibold text-ink/85 transition-colors hover:text-[var(--signal)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="space-y-3">
                {colB.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm font-semibold text-ink/85 transition-colors hover:text-[var(--signal)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:justify-end">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-ink/85 backdrop-blur transition-colors hover:bg-white/15 hover:text-ink"
              >
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-ink/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.legalName}. A mission-driven nonprofit organization.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <a className="hover:text-ink" href={`mailto:${brand.contact.general}`}>{brand.contact.general}</a>
            {legal.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-ink">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
