import { motion } from "framer-motion";
import responders from "@/assets/j-responders.jpg";

const quoteLines = [
  "“The hardest part is the beginning.",
  "If somebody can tell us exactly what is",
  "burning and where it is going while it is",
  "still small, that changes the whole day.”",
] as const;

/** Full-bleed portrait panel with a single voice from the field. */
export function QuoteBanner() {
  return (
    <section className="relative overflow-hidden bg-[var(--night)]">
      {/* SECTION_IMG_QUOTE: swap for a real responder photograph */}
      <div className="h-[86vh] w-full overflow-hidden" data-parallax="70">
        <motion.img
          src={responders}
          alt="Wildland firefighters preparing at the edge of an incident"
          className="h-full w-full object-cover object-left"
          loading="lazy"
          width={1600}
          height={1000}
          initial={{ scale: 1.08 }}
          whileInView={{ scale: 1.16 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 16, ease: "linear" }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,12,22,0.25)_0%,rgba(6,12,22,0.55)_46%,rgba(6,12,22,0.9)_100%)]" />
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto grid w-full max-w-7xl px-6 sm:px-10 lg:grid-cols-2">
          <div />
          <motion.div
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, amount: 0.4 }}
            variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.22, delayChildren: 0.1 } } }}
          >
            <blockquote className="text-[clamp(1.5rem,2.6vw,2.4rem)] font-medium leading-snug text-ink">
              {quoteLines.map((l) => (
                <span key={l} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    variants={{
                      hidden: { y: "105%", opacity: 0 },
                      shown: { y: "0%", opacity: 1, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } },
                    }}
                  >
                    {l}
                  </motion.span>
                </span>
              ))}
            </blockquote>
            <motion.p
              className="mt-8 flex items-center gap-3 text-sm text-ink/70"
              variants={{
                hidden: { opacity: 0, y: 14 },
                shown: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.35 } },
              }}
            >
              Wildland fire captain
              <span className="h-4 w-px bg-[var(--signal)]" aria-hidden />
              Northern California
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
