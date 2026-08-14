import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { createElement as h, Suspense, useEffect, useMemo, useRef } from "react";
import { Box3, CatmullRomCurve3, Group, MathUtils, Mesh, MeshStandardMaterial, Vector3 } from "three";
import uavAsset from "@/assets/athera-vtol.glb.asset.json";
import { uav } from "./uav";

// Nodes inside <Canvas> are created with createElement on purpose: the dev
// JSX-source plugin injects props that react-three-fiber rejects on three objects.

useGLTF.preload?.(uavAsset.url, true);

const shell = new MeshStandardMaterial({ color: "#e9eef3", metalness: 0.42, roughness: 0.34 });

/**
 * Master flight curve.
 * 0.00 – 0.50  transit: far left, crosses the frame, climbs away
 * 0.50 – 1.00  mission: approach, suppression pass over target, pull away
 */
const route = new CatmullRomCurve3(
  [
    new Vector3(-5.4, 1.35, -6.6),
    new Vector3(-3.1, 0.95, -3.4),
    new Vector3(-1.0, 0.5, -0.4),
    new Vector3(1.4, 0.7, -1.4),
    new Vector3(3.2, 1.15, -4.2),
    new Vector3(1.4, 0.65, -5.0),
    new Vector3(-1.2, 0.25, -2.2),
    new Vector3(-0.35, -0.18, -0.2),
    new Vector3(0.9, -0.32, 0.5),
    new Vector3(2.1, 0.15, -1.6),
    new Vector3(1.1, 0.8, -5.4),
    new Vector3(-0.2, 1.1, -9.0),
  ],
  false,
  "catmullrom",
  0.42,
);

function Airframe() {
  const group = useRef<Group>(null);
  const tilt = useRef<Group>(null);
  const { scene } = useGLTF(uavAsset.url, true);

  const fit = useMemo(() => {
    const size = new Box3().setFromObject(scene).getSize(new Vector3());
    return 1.7 / Math.max(size.x, size.y, size.z, 0.001);
  }, [scene]);

  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as Mesh;
      if (mesh.isMesh) mesh.material = shell;
    });
  }, [scene]);

  const point = useMemo(() => new Vector3(), []);
  const ahead = useMemo(() => new Vector3(), []);
  const dir = useMemo(() => new Vector3(), []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(0.05, delta);
    const t = state.clock.elapsedTime;
    const p = Math.min(1, Math.max(0, uav.t));

    route.getPointAt(p, point);
    route.getPointAt(Math.min(1, p + 0.008), ahead);
    dir.copy(ahead).sub(point).normalize();

    g.position.x = MathUtils.damp(g.position.x, point.x, 3.6, dt);
    g.position.y = MathUtils.damp(g.position.y, point.y + Math.sin(t * 1.4) * 0.04, 3.2, dt);
    g.position.z = MathUtils.damp(g.position.z, point.z, 3.6, dt);

    const heading = Math.atan2(dir.x, dir.z);
    g.rotation.y = MathUtils.damp(g.rotation.y, heading, 4, dt);
    if (tilt.current) {
      const bank = Math.max(-0.6, Math.min(0.6, -dir.x * 1.05 + uav.bank));
      tilt.current.rotation.z = MathUtils.damp(tilt.current.rotation.z, bank, 3.2, dt);
      tilt.current.rotation.x = MathUtils.damp(
        tilt.current.rotation.x,
        -dir.y * 0.5 + Math.sin(t * 2.1) * 0.012,
        3.2,
        dt,
      );
    }

    const scale = 0.55 + uav.weight * 0.65;
    g.scale.setScalar(MathUtils.damp(g.scale.x || 0.2, scale, 3.5, dt));
  });

  return h(
    "group",
    { ref: group },
    h(
      "group",
      { ref: tilt },
      h("primitive", { object: scene, rotation: [-Math.PI / 2, 0, Math.PI / 2], scale: fit }),
    ),
  );
}

/**
 * One WebGL context for the whole page. Fixed to the viewport, transparent,
 * and completely idle whenever no act is asking for the aircraft.
 */
export default function UavStage() {
  const wrap = useRef<HTMLDivElement>(null);

  return h(
    "div",
    {
      ref: wrap,
      className: "pointer-events-none fixed inset-0 z-20",
      style: { opacity: 0 },
      "aria-hidden": true,
    },
    h(
      Canvas,
      {
        camera: { position: [0, 0.6, 6.4], fov: 34 },
        dpr: [1, Math.min(1.6, typeof window !== "undefined" ? window.devicePixelRatio : 1)],
        gl: { antialias: true, alpha: true, powerPreference: "high-performance" },
        frameloop: "always",
        onCreated: ({ setFrameloop }: { setFrameloop: (m: "always" | "never") => void }) => {
          const tick = () => {
            const on = uav.weight > 0.01;
            setFrameloop(on ? "always" : "never");
            if (wrap.current) wrap.current.style.opacity = uav.weight.toFixed(3);
            window.setTimeout(tick, 250);
          };
          tick();
        },
      },
      h("ambientLight", { intensity: 0.8 }),
      h("directionalLight", { position: [5, 6, 4], intensity: 2.3, color: "#ffe6c2" }),
      h("directionalLight", { position: [-6, -1, -5], intensity: 0.75, color: "#7dd3fc" }),
      h(Suspense, { fallback: null }, h(Airframe, null)),
    ),
  );
}
