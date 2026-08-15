import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ridge from "@/assets/j-ridge.jpg";
import node from "@/assets/j-node.jpg";
import ops from "@/assets/wf-ops.jpg";

const chapters = [
  {
    img: ridge,
    alt: "A ridgeline of dry timber at first light",
    kicker: "Our mission",
    title: "Nobody is out there.",
    body: "Fire, flood, wind — the worst of it happens on ground with no camera, no lookout and no crew within an hour. By the time it is reported, it is usually already worth reporting.",
  },
  {
    img: node,
    alt: "A small sensor node mounted on a tree in dry brush",
    kicker: "The idea",
    title: "Put cheap eyes on the ground.",
    body: "A node is small, quiet and inexpensive enough to leave in the terrain. On its own it means little. In a mesh, a change that several nodes agree on is worth a look.",
  },
  {
    img: ops,
    alt: "An operations console with maps and imagery",
    kicker: "The rule",
    title: "Autonomous, never unsupervised.",
    body: "The system can watch, fly and read the ground by itself. Whether a mission happens, where it may go and when it stops stays with a person.",
  },
] as const;

function Chapter({ c, i }: { c: (typeof chapters)[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.02, 1.12]);
  const flip = i % 2 === 1;

  return (
    <div
      ref={ref}
      className={`grid items-center gap-6 lg:grid-cols-2 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}
    >
      <div className="bento relative h-[52vh] min-h-[340px] overflow-hidden bg-[var(--surface)]">
        <motion.img
          src={c.img}
          alt={c.alt}
          loading="lazy"
          style={{ y, scale }}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-5 top-5 rounded-full bg-[var(--sheet)]/90 px-3 py-1 text-xs font-bold tracking-[0.16em] text-ink/70 uppercase backdrop-blur">
          0{i + 1}
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="bento h-full bg-[var(--sheet)] p-8 sm:p-12"
      >
        <p className="label">{c.kicker}</p>
        <h3 className="mt-4 text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold leading-[1.02] tracking-tight text-ink">
          {c.title}
        </h3>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/70">{c.body}</p>
      </motion.div>
    </div>
  );
}

/** The story, told in three alternating chapters with drifting imagery. */
export function StoryScroll() {
  return (
    <section className="px-4 pb-8 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {chapters.map((c, i) => (
          <Chapter key={c.title} c={c} i={i} />
        ))}
      </div>
    </section>
  );
}
