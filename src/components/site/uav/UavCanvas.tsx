import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Environment, useGLTF } from "@react-three/drei";
import { createElement as h, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";
import { Box3, MeshStandardMaterial, Vector3 } from "three";
import uavAsset from "@/assets/athera-vtol.glb.asset.json";

// NOTE: every node inside <Canvas> is created with createElement on purpose.
// The dev JSX-source plugin injects `data-tsd-source` props, which react-three-fiber
// rejects when applying props to three.js objects.

useGLTF.preload?.(uavAsset.url, true);

const body = new MeshStandardMaterial({ color: "#eef2f6", metalness: 0.28, roughness: 0.36 });

type Mode = "orbit" | "scroll" | "float";

/** Athera VTOL — converted from the source CAD assembly. */
function Airframe({ mode, scrollRef }: { mode: Mode; scrollRef: React.RefObject<number> }) {
  const { scene } = useGLTF(uavAsset.url, true);
  const group = useRef<Group>(null);

  // Normalise the CAD assembly to a predictable ~2 unit span.
  const fit = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    return 2 / Math.max(size.x, size.y, size.z, 0.001);
  }, [scene]);

  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as Mesh;
      if (mesh.isMesh) mesh.material = body;
    });
  }, [scene]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const p = scrollRef.current ?? 0;
    if (mode === "orbit") {
      g.rotation.y += delta * 0.25;
      g.rotation.z = Math.sin(t * 0.6) * 0.05;
      g.position.y = Math.sin(t * 0.9) * 0.08;
    } else if (mode === "scroll") {
      const target = -0.5 + p * Math.PI * 1.6;
      g.rotation.y += (target - g.rotation.y) * Math.min(1, delta * 3);
      g.rotation.z = Math.sin(t * 0.5) * 0.06 - (p - 0.5) * 0.25;
      g.position.y = Math.sin(t * 0.8) * 0.06;
    } else {
      g.rotation.y = -0.9 + Math.sin(t * 0.25) * 0.18;
      g.rotation.z = Math.sin(t * 0.7) * 0.045;
      g.position.y = Math.sin(t * 0.85) * 0.1;
      g.position.x = Math.sin(t * 0.4) * 0.12;
    }
  });

  return h(
    "group",
    { ref: group },
    h(Center, null, h("primitive", { object: scene, rotation: [-Math.PI / 2, 0, 0], scale: fit })),
  );
}

/** Lightweight, always-on 3D stage for the airframe. Mounts only when in view. */
export function UavCanvas({
  mode = "float",
  className = "",
  scale = 1,
  tone = "light",
}: {
  mode?: Mode;
  className?: string;
  scale?: number;
  tone?: "light" | "dark";
}) {
  const host = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false), {
      rootMargin: "25% 0px",
    });
    io.observe(el);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const rect = el.getBoundingClientRect();
      const total = window.innerHeight + rect.height;
      scrollRef.current = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total));
    };
    raf = requestAnimationFrame(loop);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const scene = h(
    Suspense,
    { fallback: null },
    h("group", { scale }, h(Airframe, { mode, scrollRef })),
    h(Environment, { preset: tone === "dark" ? "night" : "city" }),
  );

  return h(
    "div",
    { ref: host, className },
    visible
      ? h(
          Canvas,
          {
            camera: { position: [0, 0.4, 6.2], fov: 32 },
            dpr: [1, 1.75],
            gl: { antialias: true, alpha: true, powerPreference: "high-performance" },
          },
          h("ambientLight", { intensity: tone === "dark" ? 0.55 : 0.9 }),
          h("directionalLight", { position: [4, 6, 5], intensity: tone === "dark" ? 1.7 : 2.2 }),
          h("directionalLight", { position: [-5, -2, -4], intensity: 0.5, color: "#7dd3fc" }),
          scene,
        )
      : null,
  );
}
