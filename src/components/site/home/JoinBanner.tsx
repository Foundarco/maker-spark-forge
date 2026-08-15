import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Uav3D } from "./Uav3D";

/** Closing call — the aircraft drifts past one more time. */
export function JoinBanner() {
  return (
    <section className="px-4 pb-24 sm:px-6 sm:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="bento relative mx-auto flex max-w-7xl flex-col items-start gap-8 overflow-hidden bg-[var(--surface)] p-8 sm:p-16 lg:flex-row lg:items-center"
      >
        <div className="relative z-10 max-w-xl">
          <p className="label">Support the work</p>
          <h2 className="mt-4 text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold leading-[1.0] tracking-tight text-ink">
            Help us get there before the fire does.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink/70">
            Every dollar goes into sensors on the ground, hours on the bench and flights that prove the idea.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/donate" className="btn-leaf group">
              Support the mission
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link to="/partners" className="btn-ghost">
              Partner with us
            </Link>
          </div>
        </div>

        <Uav3D className="relative h-[300px] w-full lg:h-[360px] lg:flex-1" spin={0.35} interactive={false} />
      </motion.div>
    </section>
  );
}
