import { motion } from "framer-motion";
import { CountUp } from "@/components/site/CountUp";

const stats = [
  {
    value: "400+",
    label: "Recorded natural disasters worldwide each year",
    note: "EM-DAT, 2000–2023 average",
  },
  {
    value: "$150B+",
    label: "Annual disaster losses in the United States alone",
    note: "NOAA billion-dollar disaster record, recent years",
  },
  {
    value: "5x",
    label: "Increase in recorded weather-related disasters since the 1970s",
    note: "World Meteorological Organization",
  },
  {
    value: "60%",
    label: "Of the ground that burns has no camera and no lookout nearby",
    note: "Our own estimate for remote terrain",
  },
];

/** The scale of the problem, in numbers that are not ours to spin. */
export function DisasterStats() {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="label">The scale</p>
          <h2 className="mt-4 text-[clamp(2rem,4.6vw,3.6rem)] font-extrabold leading-[1.02] tracking-tight text-ink">
            It is not a bad year. It is a trend.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink/70">
            Hotter, drier, wetter, windier — depending where you stand. The one thing every version has in common
            is that the first hour decides how bad the rest of it gets.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.value}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="bento h-full bg-[var(--sheet)] p-7"
            >
              <CountUp
                value={s.value}
                className="block text-[clamp(2.4rem,5vw,3.4rem)] font-extrabold leading-none tracking-tight text-[var(--signal)]"
              />
              <p className="mt-4 text-base font-semibold leading-snug text-ink">{s.label}</p>
              <p className="mt-3 text-xs leading-relaxed text-ink/50">{s.note}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
