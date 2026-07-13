import type { ReactNode, ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { Section, Eyebrow } from "./Section";
import { Card } from "./Card";
import { CTAButton } from "./CTAButton";
import { ArrowRight, Check } from "lucide-react";
import { Placeholder } from "./Placeholder";

export type Feature = {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  body: string;
};

export function FeaturePage({
  eyebrow,
  title,
  lede,
  primaryCta,
  secondaryCta,
  features,
  bullets,
  heroImage,
  heroImageAlt,
  extra,
  finalCta,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  primaryCta?: { to: string; label: string };
  secondaryCta?: { to: string; label: string };
  features?: Feature[];
  bullets?: string[];
  heroImage?: string;
  heroImageAlt?: string;
  extra?: ReactNode;
  finalCta?: { title: string; body?: string; to: string; label: string };
}) {
  return (
    <>
      <section className="relative overflow-hidden surface-dark">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 70% 30%, oklch(0.35 0.15 40 / 0.5), transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, oklch(0.3 0.1 260 / 0.3), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 pb-20 pt-20 sm:px-8 sm:pt-24 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            {eyebrow ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                {eyebrow}
              </span>
            ) : null}
            <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-tight text-white sm:text-6xl md:text-7xl">
              {title}
            </h1>
            {lede ? (
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">{lede}</p>
            ) : null}
            {(primaryCta || secondaryCta) && (
              <div className="mt-10 flex flex-wrap gap-3">
                {primaryCta && (
                  <CTAButton to={primaryCta.to} variant="primary">
                    {primaryCta.label} <ArrowRight className="h-4 w-4" />
                  </CTAButton>
                )}
                {secondaryCta && (
                  <CTAButton to={secondaryCta.to} variant="light">
                    {secondaryCta.label}
                  </CTAButton>
                )}
              </div>
            )}
          </div>
          {heroImage ? (
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-primary/20 blur-3xl" aria-hidden />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40">
                <img
                  src={heroImage}
                  alt={heroImageAlt ?? ""}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-primary/20 blur-3xl" aria-hidden />
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-black/30">
                <div className="grid h-full place-items-center text-sm text-white/50">
                  <Placeholder>[PLACEHOLDER hero visual]</Placeholder>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {features && features.length > 0 && (
        <Section wide>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title}>
                {f.icon && (
                  <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {bullets && bullets.length > 0 && (
        <section className="bg-surface">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
            <Eyebrow>What's included</Eyebrow>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-sm text-foreground">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {extra}

      {finalCta && (
        <Section wide>
          <div className="relative overflow-hidden rounded-[2rem] surface-dark px-8 py-16 sm:px-14 sm:py-20">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(ellipse 60% 80% at 100% 50%, oklch(0.4 0.18 40 / 0.5), transparent 60%)",
              }}
              aria-hidden
            />
            <div className="relative grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-end">
              <div>
                <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                  {finalCta.title}
                </h2>
                {finalCta.body && (
                  <p className="mt-4 max-w-xl text-lg text-white/70">{finalCta.body}</p>
                )}
              </div>
              <div className="flex md:justify-end">
                <Link
                  to={finalCta.to}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white/90"
                >
                  {finalCta.label} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
