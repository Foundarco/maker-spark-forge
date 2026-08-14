import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Words } from "@/components/site/Reveal";
import node from "@/assets/j-node.jpg";
import system from "@/assets/j-system.jpg";
import uav from "@/assets/j-uav.jpg";
import foothills from "@/assets/j-foothills.jpg";

const posts = [
  { img: node, tag: "Engineering", title: "Designing sensor nodes for terrain nobody visits", to: "/technology" as const },
  { img: uav, tag: "Airframe", title: "Why we fly a VTOL, not a quadcopter", to: "/technology" as const },
  { img: system, tag: "System", title: "The nine layers between an ignition and an answer", to: "/system" as const },
  { img: foothills, tag: "Programme", title: "Building in public: the honest development status", to: "/development" as const },
] as const;

/** Newsroom grid closing the narrative. */
export function Newsroom() {
  return (
    <section className="relative bg-[oklch(0.97_0.012_95)] py-24 text-[oklch(0.16_0.02_260)] sm:py-32">
      {/* soft transition out of the cinematic dark section above */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-32 h-32 bg-[linear-gradient(180deg,rgba(6,12,22,1),rgba(6,12,22,0))]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-6 sm:px-10">
        <Reveal variant="mask">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="display-cond text-[clamp(2.4rem,6vw,5rem)] text-[oklch(0.12_0.02_260)]">
              <Words text="What’s happening" step={100} />
            </h2>
            <Link
              to="/development"
              className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.16_0.02_260/0.25)] px-5 py-2.5 text-sm font-medium text-[oklch(0.2_0.02_260)] transition-colors hover:bg-[oklch(0.16_0.02_260/0.07)]"
            >
              All updates
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((p, i) => (
            <Reveal key={p.title} delay={i * 110} variant="rise-rotate">
              <Link to={p.to} className="group block">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={p.img}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    width={800}
                    height={600}
                    className="h-56 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[oklch(0.5_0.02_260)]">
                  {p.tag}
                </p>
                <p className="mt-2 text-lg font-semibold leading-snug text-[oklch(0.12_0.02_260)]">{p.title}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
