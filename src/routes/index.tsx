import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Section, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { CTAButton } from "@/components/site/CTAButton";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";
import { productsQuery, postsQuery } from "@/lib/content.queries";
import { ArrowRight, Wrench, GraduationCap, Users, Eye } from "lucide-react";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery);
    context.queryClient.ensureQueryData(postsQuery);
  },
  component: HomePage,
});

const valueProps = [
  { icon: Users, title: "Community-first", body: "Owners help owners. Guides, models, and fixes live in the open." },
  { icon: GraduationCap, title: "Built to teach", body: "Every printer is a working lesson. Visible mechanism, labeled parts, real curriculum." },
  { icon: Wrench, title: "Repairable", body: "Standard fasteners. Printable spares. Step-by-step fixes for every common failure." },
  { icon: Eye, title: "Honest engineering", body: "We tell you what the machine is good at — and what it isn't." },
];

function HomePage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: posts } = useSuspenseQuery(postsQuery);
  const printer = products.find((p) => p.category === "printer") ?? products[0];
  const pellets = products.find((p) => p.category === "material");

  return (
    <>
      {/* HERO */}
      <Section className="pt-14 sm:pt-20">
        <div className="grid gap-10 md:grid-cols-[1.15fr_1fr] md:items-center">
          <div>
            <Eyebrow>{brand.name}</Eyebrow>
            <h1 className="text-4xl font-semibold leading-[1.02] text-ink sm:text-5xl md:text-6xl">
              {brand.shortMission}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              We make 3D printers that anyone can learn on, fix, and improve. Everything we build is designed to be understood — by a student, by a teacher, by you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton to="/store">See the printer <ArrowRight className="h-4 w-4" /></CTAButton>
              <CTAButton to="/mission" variant="secondary">Read our mission</CTAButton>
            </div>
          </div>
          <div className="relative">
            <div className="transparency-card aspect-[4/5] rounded-3xl p-6">
              <div className="grid h-full grid-rows-[1fr_auto] gap-4">
                <div
                  aria-hidden
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-soft via-warm to-accent"
                >
                  <div className="absolute inset-6 rounded-xl border border-dashed border-primary/50" />
                  <div className="absolute inset-x-10 top-10 h-1 rounded bg-primary/40" />
                  <div className="absolute inset-x-14 top-14 h-1 w-2/3 rounded bg-primary/30" />
                  <div className="absolute bottom-8 right-8 h-6 w-6 rounded-sm bg-primary/70" />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Visible mechanism</span>
                  <span><Placeholder>[PLACEHOLDER hero image]</Placeholder></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* VALUE PROPS */}
      <Section className="py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((v) => (
            <Card key={v.title}>
              <v.icon className="mb-4 h-6 w-6 text-primary" aria-hidden />
              <h3 className="text-lg font-semibold text-ink">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* PRODUCT TEASER */}
      <Section>
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <Eyebrow>The product</Eyebrow>
            <h2 className="text-3xl font-semibold sm:text-4xl">A printer, a material, and everything you need to learn.</h2>
          </div>
          <Link to="/store" className="hidden text-sm text-primary hover:underline sm:inline-flex">
            Visit the store →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {[printer, pellets].filter(Boolean).map((p) => (
            <Card key={p!.slug} className="p-0 overflow-hidden">
              <div aria-hidden className="aspect-[16/10] bg-gradient-to-br from-primary-soft to-accent">
                <div className="grid h-full place-items-center text-primary/60 text-sm">
                  <Placeholder>[PLACEHOLDER product image: {p!.name}]</Placeholder>
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{p!.category}</p>
                <h3 className="mt-1 text-xl font-semibold">{p!.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p!.tagline}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground"><Placeholder>{p!.price_display}</Placeholder></span>
                  <Link to="/store/$slug" params={{ slug: p!.slug }} className="text-sm font-medium text-primary hover:underline">
                    Learn more →
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* DIFFERENT */}
      <Section>
        <div className="transparency-card rounded-3xl p-8 sm:p-12">
          <Eyebrow>Why we're different</Eyebrow>
          <h2 className="text-3xl font-semibold sm:text-4xl">Printers that don't lock you out.</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            A lot of consumer printers are closed ecosystems: proprietary slicers, one-vendor materials, sealed cases. We think that's the opposite of what learning hardware should be. Ours opens up — mechanically, and philosophically.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { h: "You can see how it works", b: "No sealed shrouds. If a belt moves, you can watch it move." },
              { h: "You can fix it yourself", b: "Repair guides, printable spares, and standard hardware — no service center required." },
              { h: "You can teach with it", b: "Curriculum-ready lesson plans and Missions built into the Learning Center." },
            ].map((x) => (
              <div key={x.h} className="rounded-2xl bg-warm p-5">
                <h3 className="text-base font-semibold">{x.h}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{x.b}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* COMMUNITY PROOF */}
      <Section>
        <Eyebrow>The community</Eyebrow>
        <h2 className="mb-8 text-3xl font-semibold sm:text-4xl">Real people, printing real things.</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { name: "[PLACEHOLDER ambassador]", role: "Ambassador, [City]", quote: "[PLACEHOLDER short testimonial about teaching first-timers.]" },
            { name: "[PLACEHOLDER educator]", role: "STEM teacher", quote: "[PLACEHOLDER testimonial about classroom fit.]" },
            { name: "[PLACEHOLDER maker]", role: "Home user", quote: "[PLACEHOLDER testimonial about repair confidence.]" },
          ].map((c) => (
            <Card key={c.name}>
              <p className="text-sm leading-relaxed text-foreground">"{c.quote}"</p>
              <div className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* MISSION CTA */}
      <Section>
        <div className="grid gap-8 rounded-3xl bg-ink px-8 py-14 text-background sm:px-14 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary-soft/80">Our mission</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              To make 3D printing approachable, and to expand youth STEM education while we do it.
            </h2>
          </div>
          <div className="flex md:justify-end">
            <CTAButton to="/mission" variant="secondary" className="border-transparent bg-background text-foreground">
              Read the full story <ArrowRight className="h-4 w-4" />
            </CTAButton>
          </div>
        </div>
      </Section>

      {/* LATEST POSTS */}
      {posts.length > 0 && (
        <Section>
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-3xl font-semibold">From the blog</h2>
            <Link to="/blog" className="text-sm text-primary hover:underline">All posts →</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {posts.slice(0, 3).map((p) => (
              <Card key={p.slug} as="article">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.category}</p>
                <h3 className="mt-2 text-lg font-semibold leading-snug">
                  <Link to="/blog/$slug" params={{ slug: p.slug }} className="hover:underline">{p.title}</Link>
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
