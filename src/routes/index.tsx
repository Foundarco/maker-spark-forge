import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionLabel } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { CTAButton } from "@/components/site/CTAButton";
import { SystemArchitecture } from "@/components/site/SystemArchitecture";
import { SensorNetwork } from "@/components/site/SensorNetwork";
import { ThermalCompare } from "@/components/site/ThermalCompare";
import { MissionControl } from "@/components/site/MissionControl";
import { brand } from "@/config/brand";
import {
  media,
  sensing,
  opsResponsibilities,
  uavCapabilities,
  phases,
  fieldConstraints,
  expansion,
} from "@/config/system";
import { SITE_URL } from "@/lib/seo";

const title = `${brand.name} — See the fire sooner`;
const desc = brand.mission;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NGO",
          name: brand.legalName,
          url: `${SITE_URL}/`,
          slogan: brand.tagline,
          description: desc,
          email: brand.contact.general,
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* 01 — HERO */}
      <section className="hero-reveal relative isolate min-h-[92vh] overflow-hidden border-b border-border">
        <img
          src={media.heroImg}
          alt="Prototype fixed-wing UAV flying over smoke-covered California ridgelines at dusk"
          className="slow-pan absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1088}
          fetchPriority="high"
        />
        <div className="scrim-full absolute inset-0" aria-hidden />
        <div className="blueprint-grid absolute inset-0 text-white/40" aria-hidden />

        <div className="relative mx-auto flex min-h-[92vh] w-full max-w-7xl flex-col justify-end px-5 pb-20 pt-36 sm:px-8">
          <Reveal>
            <p className="flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--signal)]">
              <span className="live-pulse h-1.5 w-1.5 rounded-full bg-[var(--signal)]" aria-hidden />
              {brand.mission01}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="display-cond mt-7 max-w-4xl text-[clamp(3rem,10vw,8.5rem)] text-ink">
              See the fire<br />sooner.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-foreground/85 sm:text-xl">{brand.mission}</p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap gap-3">
              <CTAButton to="/system" variant="primary">Explore the system</CTAButton>
              <CTAButton to="/mission" variant="ghost" className="border border-border text-ink hover:bg-surface">
                Our mission
              </CTAButton>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <dl className="mt-16 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {brand.statusPoints.map((s) => (
                <div key={s.label} className="bg-background/70 px-5 py-4 backdrop-blur-sm">
                  <dt className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">{s.label}</dt>
                  <dd className="mt-2 text-sm text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* 02 — PROBLEM */}
      <Section wide>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <SectionLabel n="01" tone="light">The problem</SectionLabel>
            <h2 className="display-cond mt-7 text-[clamp(2.4rem,6vw,5rem)] text-ink">
              Wildfire<br />doesn't wait.
            </h2>
          </Reveal>
          <Reveal delay={120} className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>
              Something starts. Minutes pass before anyone knows. More pass before anyone can say what is actually
              happening — where exactly it is, how large, what is around it, whether it warrants a response at all.
            </p>
            <p>
              That gap is made of three separate problems: <span className="text-ink">detection</span> (noticing at all),
              <span className="text-ink"> verification</span> (confirming it is real), and{" "}
              <span className="text-ink">observation</span> (getting eyes on it). Each one costs time, and in remote
              terrain each one costs more.
            </p>
            <p>
              We are not claiming to solve fire. We are building a system aimed squarely at that gap: earlier signal
              from the ground, faster eyes from the air, and a clearer picture handed to the people responding.
            </p>
            <ul className="grid gap-px border border-border bg-border sm:grid-cols-3">
              {["Detection", "Verification", "Eyes on the situation"].map((k, i) => (
                <li key={k} className="bg-[var(--night)] px-5 py-6">
                  <span className="font-mono text-[0.62rem] tracking-[0.2em] text-[var(--signal)]">0{i + 1}</span>
                  <p className="mt-3 text-sm font-semibold text-ink">{k}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Time spent here is time the fire has to grow.</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* 03 — SYSTEM (centrepiece) */}
      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <Reveal>
            <SectionLabel n="02" tone="light">The architecture</SectionLabel>
            <h2 className="display-cond mt-7 max-w-4xl text-[clamp(2.4rem,6vw,5rem)] text-ink">
              One system. From detection to eyes on the fire.
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Nine stages, designed together. Select any stage to see what it is responsible for.
            </p>
          </Reveal>
          <Reveal delay={140} className="mt-14">
            <SystemArchitecture />
          </Reveal>
          <div className="mt-8">
            <CTAButton to="/system" variant="ghost" className="border border-border text-ink hover:bg-surface">
              Walk the full architecture
            </CTAButton>
          </div>
        </Section>
      </div>

      {/* 04 — SENSOR NETWORK */}
      <Section wide>
        <div className="grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <Reveal>
            <SectionLabel n="03" tone="light">Sensor network</SectionLabel>
            <h2 className="display-cond mt-7 text-[clamp(2.2rem,5vw,4.2rem)] text-ink">
              Detection starts on the ground.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Not one weather station — a distributed network. Nodes spread across terrain, each reporting local
              conditions over wireless links, each corroborating the others. A single anomalous reading is noise;
              a pattern across neighbours is a signal.
            </p>
            <ul className="mt-9 grid gap-px border border-border bg-border sm:grid-cols-2">
              {sensing.map((s) => (
                <li key={s.label} className="bg-[var(--night)] px-5 py-4">
                  <p className="text-sm font-semibold text-ink">{s.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.note}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-muted-foreground">
              Sensing set is in development. Final specifications are not fixed.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="blueprint-grid border border-border bg-[var(--night)] p-5 text-foreground/45">
              <SensorNetwork className="aspect-[10/9]" />
            </div>
            <figure className="mt-6 m-0">
              <img
                src={media.sensorImg}
                alt="Solar-powered environmental sensor node mounted on a mast in California chaparral"
                className="w-full border border-border object-cover"
                loading="lazy"
                width={1600}
                height={1104}
              />
              <figcaption className="mt-3 text-xs text-muted-foreground">
                Concept node — enclosure, solar, and radio in a field-service form factor.
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Section>

      {/* 05 — OPERATIONS CENTER */}
      <div className="relative isolate overflow-hidden border-y border-border">
        <img
          src={media.opsImg}
          alt="Operations center at night with wall displays and staffed workstations"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          loading="lazy"
          width={1600}
          height={1104}
        />
        <div className="scrim-full absolute inset-0" aria-hidden />
        <Section wide className="relative">
          <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal>
              <SectionLabel n="04" tone="light">{brand.opsCenter}</SectionLabel>
              <h2 className="display-cond mt-7 text-[clamp(2.2rem,5.4vw,4.6rem)] text-ink">
                When an alert comes in, someone is watching.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-foreground/85">
                The Operations Center is the part of this organization that already runs continuously. It is where
                detections are reviewed by people, incidents are opened, missions are coordinated, and the record of
                what happened is kept as it happens.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <CTAButton to="/operations" variant="primary">Inside the Operations Center</CTAButton>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <ul className="grid gap-px border border-border bg-border">
                {opsResponsibilities.map((r, i) => (
                  <li key={r} className="flex items-baseline gap-4 bg-background/70 px-5 py-3.5 backdrop-blur-sm">
                    <span className="font-mono text-[0.62rem] tabular-nums text-[var(--signal)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-foreground/85">{r}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Section>
      </div>

      {/* 06 — UAV */}
      <Section wide>
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Reveal>
            <SectionLabel n="05" tone="light">Autonomous UAV</SectionLabel>
            <h2 className="display-cond mt-7 text-[clamp(2.2rem,5vw,4.2rem)] text-ink">Then we send eyes.</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Ground sensors can tell you something changed. An aircraft can tell you what it is. Our UAV work is
              aimed at getting a camera and a thermal sensor over the coordinates quickly, with an operator in the
              loop and the Operations Center watching the feed.
            </p>
            <ul className="mt-9 grid gap-px border border-border bg-border">
              {uavCapabilities.map((c) => (
                <li key={c.title} className="flex flex-wrap items-baseline justify-between gap-3 bg-[var(--night)] px-5 py-4">
                  <div className="min-w-[14rem] flex-1">
                    <p className="text-sm font-semibold text-ink">{c.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.body}</p>
                  </div>
                  <span className="border border-border px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-foreground/70">
                    {c.state}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-muted-foreground">
              No part of this aircraft is deployed operationally. Capabilities described are design intent under active development.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <img
              src={media.benchImg}
              alt="Partially assembled UAV airframe with camera payload on an engineering workbench"
              className="w-full border border-border object-cover"
              loading="lazy"
              width={1600}
              height={1104}
            />
          </Reveal>
        </div>
      </Section>

      {/* 07 — THERMAL + RGB */}
      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <Reveal>
              <SectionLabel n="06" tone="light">Thermal + visual</SectionLabel>
              <h2 className="display-cond mt-7 text-[clamp(2.2rem,5vw,4rem)] text-ink">
                Two ways of looking at the same ridge.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Optical imagery is how a person reads terrain, access, and context. Thermal is designed to show heat
                where smoke, canopy, or darkness hide it. Together with position and altitude, they turn "something
                happened near node 07" into a picture someone can act on.
              </p>
              <CTAButton to="/technology" variant="ghost" className="mt-8 border border-border text-ink hover:bg-surface">
                The technology
              </CTAButton>
            </Reveal>
            <Reveal delay={120}>
              <ThermalCompare />
            </Reveal>
          </div>
        </Section>
      </div>

      {/* 08 — MISSION CONTROL */}
      <Section wide>
        <Reveal>
          <SectionLabel n="07" tone="light">Mission control</SectionLabel>
          <h2 className="display-cond mt-7 max-w-3xl text-[clamp(2.2rem,5vw,4.2rem)] text-ink">
            Software is what makes it one system.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Sensors, alerts, aircraft, imagery, and the people coordinating them share one interface and one incident
            record. The concept view below mirrors the internal tools we are building for the Operations Center.
          </p>
        </Reveal>
        <Reveal delay={120} className="mt-12">
          <MissionControl />
        </Reveal>
      </Section>

      {/* 09 — WHY BOTH */}
      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <SectionLabel n="08" tone="light">Why the whole architecture</SectionLabel>
              <h2 className="display-cond mt-7 text-[clamp(2.2rem,5vw,4.2rem)] text-ink">
                A drone alone isn't the system.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <ul className="grid gap-px bg-border">
                {[
                  { k: "Sensors", v: "Distributed detection across terrain, continuously, without anyone watching a horizon." },
                  { k: "Operations Center", v: "Continuous human monitoring, judgement, and coordination — 24/7/365." },
                  { k: "UAV", v: "Rapid investigation that turns a signal into an observation." },
                  { k: "Software", v: "The connective layer: alerts, missions, imagery, and one incident record." },
                ].map((r) => (
                  <li key={r.k} className="grid gap-2 bg-[var(--night)] px-6 py-6 sm:grid-cols-[10rem_1fr] sm:gap-6">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[var(--signal)]">{r.k}</p>
                    <p className="text-base text-foreground/85">{r.v}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted-foreground">
                Any one of these on its own is a component. Integrated, they are a detection-to-responder pipeline —
                and that integration is the part we consider our real work.
              </p>
            </Reveal>
          </div>
        </Section>
      </div>

      {/* 10 — FIELD ENGINEERING */}
      <Section wide>
        <Reveal>
          <SectionLabel n="09" tone="light">Field engineering</SectionLabel>
          <h2 className="display-cond mt-7 max-w-3xl text-[clamp(2.2rem,5vw,4.2rem)] text-ink">Designed for the field.</h2>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            The environment is the specification. These are the constraints the hardware is being designed and tested
            against — not problems we expect to discover later.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <ul className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {fieldConstraints.map((f, i) => (
              <li key={f.title} className="bg-[var(--night)] px-6 py-7">
                <span className="font-mono text-[0.62rem] tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-base font-semibold text-ink">{f.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      {/* 11 — DEVELOPMENT STATUS */}
      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <Reveal>
            <SectionLabel n="10" tone="light">Where we actually are</SectionLabel>
            <h2 className="display-cond mt-7 max-w-3xl text-[clamp(2.2rem,5vw,4.2rem)] text-ink">
              Building Mission 01, in public.
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              We are early. Nothing here is deployed. This is the honest state of the programme.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <ol className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {phases.map((p) => (
                <li key={p.n} className="bg-[var(--night)] px-6 py-7">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-sm tabular-nums text-[var(--signal)]">{p.n}</span>
                    <span
                      className={`border px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.16em] ${
                        p.state === "Ahead"
                          ? "border-border text-muted-foreground"
                          : "border-[color:var(--signal)]/50 text-[var(--signal)]"
                      }`}
                    >
                      {p.state}
                    </span>
                  </div>
                  <p className="mt-4 text-lg font-semibold text-ink">{p.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>
          <div className="mt-8">
            <CTAButton to="/development" variant="ghost" className="border border-border text-ink hover:bg-surface">
              Full development status
            </CTAButton>
          </div>
        </Section>
      </div>

      {/* 12 — BIGGER VISION (secondary) */}
      <Section>
        <Reveal>
          <SectionLabel n="11" tone="light">Later, not now</SectionLabel>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Wildfire is only the beginning.</h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Wildfire is Mission 01 and it has our full attention. But the foundation — distributed sensing, autonomy,
            aerial imaging, and coordinated operations — is general. Once the wildfire system is proven, the same
            engineering could serve other emergencies.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <ul className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {expansion.map((e) => (
              <li key={e.title} className="bg-[var(--night)] px-5 py-6">
                <p className="text-sm font-semibold text-ink">{e.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{e.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      {/* 13 — HUMAN MISSION */}
      <div className="border-y border-border bg-[var(--night)]">
        <Section>
          <Reveal className="max-w-3xl">
            <SectionLabel n="12" tone="light">Why we're doing this</SectionLabel>
            <h2 className="display-cond mt-7 text-[clamp(2rem,4.6vw,3.6rem)] text-ink">
              Technology should serve people.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              When conditions are dangerous and time matters, decisions get made with whatever information is
              available. Better tools do not replace the people making those calls — they give them something clearer
              to work from, sooner. That is the whole ambition: put a better picture in the hands of the people who
              already run toward the problem.
            </p>
          </Reveal>
        </Section>
      </div>

      {/* 14 — CTA */}
      <Section wide className="text-center">
        <Reveal>
          <h2 className="display-cond mx-auto max-w-4xl text-[clamp(2.2rem,6vw,5rem)] text-ink">
            Build Mission 01 with us.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Engineers, robotics and software developers, researchers, fire professionals, mentors, sponsors, and
            manufacturing partners — this is the stage where help compounds.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <CTAButton to="/donate" variant="primary">Support the mission</CTAButton>
            <CTAButton to="/join" variant="ghost" className="border border-border text-ink hover:bg-surface">
              Build with us
            </CTAButton>
            <CTAButton to="/partners" variant="ghost" className="border border-border text-ink hover:bg-surface">
              Partner with us
            </CTAButton>
          </div>
          <p className="mt-10 text-xs text-muted-foreground">
            Research collaboration?{" "}
            <Link to="/partners" className="text-foreground/80 underline underline-offset-4 hover:text-primary">
              Research partnerships
            </Link>
          </p>
        </Reveal>
      </Section>
    </>
  );
}
