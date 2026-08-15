import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Eye, Flame, PlaneTakeoff, Radio, Users } from "lucide-react";

const steps = [
  {
    id: "sense",
    icon: Radio,
    title: "Sense",
    line: "Low-cost nodes sit out in the terrain and read what is happening around them.",
    detail: "They cross-check each other, so one strange reading is not an alarm.",
  },
  {
    id: "review",
    icon: Users,
    title: "Review",
    line: "When the readings stop looking normal, a person picks up the alert.",
    detail: "Our Operations Center decides whether a mission happens at all.",
  },
  {
    id: "fly",
    icon: PlaneTakeoff,
    title: "Fly",
    line: "Once authorized, the aircraft flies the route by itself while an operator watches.",
    detail: "Vertical takeoff, fixed-wing cruise — it can launch from a truck.",
  },
  {
    id: "confirm",
    icon: Eye,
    title: "Confirm",
    line: "Camera and thermal read the ground together, through haze and canopy.",
    detail: "When both agree, the fire is confirmed rather than guessed.",
  },
  {
    id: "handoff",
    icon: Flame,
    title: "Hand off",
    line: "Location, imagery and everything that changed goes to the crews already moving.",
    detail: "A suppression attempt with a water payload is planned, not proven.",
  },
] as const;

/**
 * The chain, as something you play with.
 *
 * The row advances on its own, and any tile can be taken over by hover or
 * click. The panel underneath swaps with it.
 */
export function MissionFlow() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % steps.length), 3600);
    return () => window.clearInterval(id);
  }, [held]);

  const current = steps[active]!;
  const Icon = current.icon;

  return (
    <section className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <p className="label">How it works</p>
          <h2 className="mt-4 text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold leading-[1.02] tracking-tight text-ink">
            Five steps between a spark and a crew that knows.
          </h2>
        </motion.div>

        <div
          className="mt-12 grid gap-3 sm:grid-cols-5"
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
        >
          {steps.map((s, i) => {
            const on = i === active;
            const StepIcon = s.icon;
            return (
              <motion.button
                key={s.id}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.55 }}
                whileHover={{ y: -6 }}
                aria-pressed={on}
                className={`bento relative overflow-hidden p-5 text-left transition-colors ${
                  on ? "bg-[var(--signal)] text-[var(--on-signal)]" : "bg-[var(--sheet)] text-ink hover:bg-[var(--surface)]"
                }`}
              >
                <StepIcon className="h-6 w-6" aria-hidden />
                <p className="mt-6 text-xs font-bold tracking-[0.18em] opacity-60">0{i + 1}</p>
                <p className="mt-1 text-xl font-extrabold tracking-tight">{s.title}</p>
                {on ? (
                  <motion.span
                    layoutId="flow-underline"
                    className="absolute inset-x-5 bottom-4 h-[3px] rounded-full bg-[var(--sheet)]/70"
                  />
                ) : null}
              </motion.button>
            );
          })}
        </div>

        <div className="bento mt-3 overflow-hidden bg-[var(--surface)] p-8 sm:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6 sm:flex-row sm:items-center"
            >
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[var(--signal)] text-[var(--on-signal)]">
                <Icon className="h-7 w-7" aria-hidden />
              </span>
              <div>
                <p className="text-[clamp(1.4rem,3vw,2.1rem)] font-bold leading-snug tracking-tight text-ink">
                  {current.line}
                </p>
                <p className="mt-3 text-base text-ink/65">{current.detail}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
