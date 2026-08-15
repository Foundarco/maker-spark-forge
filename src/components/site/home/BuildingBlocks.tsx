import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import bench from "@/assets/wf-bench.jpg";
import uav from "@/assets/j-uav.jpg";

type Tile = {
  span: string;
  tone: "signal" | "sheet" | "surface" | "photo";
  label: string;
  title: string;
  body?: string;
  img?: string;
  alt?: string;
  to?: "/development" | "/join";
  cta?: string;
};

const tiles: Tile[] = [
  {
    span: "sm:col-span-2 sm:row-span-2",
    tone: "signal",
    label: "Where we are",
    title: "Prototype, in progress.",
    body: "We describe what exists as built, what is on the bench as prototype and what is ahead as intent. Nothing gets promoted before it is tested.",
    to: "/development" as const,
    cta: "Development status",
  },
  { span: "", tone: "sheet", label: "Coverage by design", title: "24/7/365", body: "Operations Center staffed around the clock." },
  { span: "", tone: "sheet", label: "Structure", title: "Nonprofit", body: "Mission-driven, built in the open." },
  { span: "sm:col-span-2", tone: "photo", img: bench, alt: "Prototype sensor hardware on a workbench", label: "On the bench", title: "Sensor nodes" },
  { span: "", tone: "photo", img: uav, alt: "The VTOL airframe on a field stand", label: "Airframe", title: "VTOL" },
  {
    span: "",
    tone: "surface",
    label: "Get involved",
    title: "Build with us.",
    body: "Engineers, pilots and partners welcome.",
    to: "/join" as const,
    cta: "Join the team",
  },
];

/** A bento board of what actually exists today — no inflated numbers. */
export function BuildingBlocks() {
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold leading-[1.02] tracking-tight text-ink"
        >
          Where we actually stand.
        </motion.h2>

        <div className="mt-12 grid auto-rows-[190px] gap-3 sm:grid-cols-4">
          {tiles.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className={t.span}
            >
              {t.tone === "photo" ? (
                <div className="bento group relative h-full overflow-hidden">
                  <img
                    src={t.img}
                    alt={t.alt}
                    loading="lazy"
                    className="h-full w-full scale-105 object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,color-mix(in_oklab,var(--night)_78%,transparent))]" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-ink/70">{t.label}</p>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">{t.title}</p>
                  </div>
                </div>
              ) : (
                <div
                  className={`bento flex h-full flex-col justify-between p-6 ${
                    t.tone === "signal"
                      ? "bg-[var(--signal)] text-[var(--on-signal)]"
                      : t.tone === "surface"
                        ? "bg-[var(--surface)] text-ink"
                        : "bg-[var(--sheet)] text-ink"
                  }`}
                >
                  <p className={`text-[0.68rem] font-bold uppercase tracking-[0.18em] ${t.tone === "signal" ? "opacity-70" : "text-ink/45"}`}>
                    {t.label}
                  </p>
                  <div>
                    <p className="text-[clamp(1.6rem,3vw,2.6rem)] font-extrabold leading-tight tracking-tight">{t.title}</p>
                    {t.body ? (
                      <p className={`mt-2 text-sm leading-relaxed ${t.tone === "signal" ? "opacity-85" : "text-ink/65"}`}>
                        {t.body}
                      </p>
                    ) : null}
                    {t.to ? (
                      <Link
                        to={t.to}
                        className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline ${
                          t.tone === "signal" ? "" : "text-[var(--signal)]"
                        }`}
                      >
                        {t.cta}
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </Link>
                    ) : null}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
