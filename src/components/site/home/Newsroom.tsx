import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import node from "@/assets/j-node.jpg";
import system from "@/assets/j-system.jpg";
import uav from "@/assets/j-uav.jpg";
import foothills from "@/assets/j-foothills.jpg";

const posts = [
  { img: node, tag: "Engineering", title: "Designing sensor nodes for terrain nobody visits", to: "/technology" as const },
  { img: uav, tag: "Airframe", title: "Why we fly a VTOL, not a quadcopter", to: "/technology" as const },
  { img: system, tag: "System", title: "The layers between an ignition and an answer", to: "/system" as const },
  { img: foothills, tag: "Programme", title: "Building in public: the honest development status", to: "/development" as const },
] as const;

/** Newsroom teaser — light cards that lift under the cursor. */
export function Newsroom() {
  return (
    <section className="px-4 pb-24 sm:px-6 sm:pb-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-[clamp(2rem,4.4vw,3.2rem)] font-extrabold tracking-tight text-ink"
          >
            From the workshop
          </motion.h2>
          <Link to="/development" className="btn-ghost">
            Everything we are building
          </Link>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.07, duration: 0.6 }}
              whileHover={{ y: -8 }}
            >
              <Link to={p.to} className="bento group flex h-full flex-col overflow-hidden bg-[var(--sheet)]">
                <div className="h-44 overflow-hidden">
                  <img
                    src={p.img}
                    alt=""
                    loading="lazy"
                    className="h-full w-full scale-105 object-cover transition-transform duration-[900ms] group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="label">{p.tag}</p>
                  <p className="mt-3 flex-1 text-lg font-bold leading-snug tracking-tight text-ink">{p.title}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)]">
                    Read
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
