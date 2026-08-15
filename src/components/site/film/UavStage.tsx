import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { createElement as h, Suspense, useEffect, useMemo, useRef } from "react";
import { Box3, CatmullRomCurve3, Color, DirectionalLight, Group, MathUtils, Mesh, MeshStandardMaterial, Vector3 } from "three";
import uavAsset from "@/assets/athera-vtol.glb.asset.json";
import { uav } from "./uav";

// Nodes inside <Canvas> are created with createElement on purpose: the dev
// JSX-source plugin injects props that react-three-fiber rejects on three objects.

useGLTF.preload?.(uavAsset.url, true);

const shell = new MeshStandardMaterial({ color: "#e9eef3", metalness: 0.42, roughness: 0.34 });

/** silhouette against the bright sky → daylight filling the airframe */
const SILHOUETTE = new Color("#0d131c");
const DAYLIGHT = new Color("#eef2f6");
const litColor = new Color();

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

    // the reveal lifts it out of the cloud deck and fills it with daylight
    if (uav.reveal > 0) {
      const climb = Math.min(1, uav.reveal / 0.34);
      g.position.y += (1 - climb) * -2.6;
      g.rotation.y += uav.reveal * 0.9;
    }

    const fill = Math.min(1, Math.max(uav.light, uav.reveal * 1.4));
    litColor.copy(SILHOUETTE).lerp(DAYLIGHT, fill);
    shell.color.lerp(litColor, 1 - Math.exp(-4 * dt));
    shell.roughness = 0.42 - fill * 0.1;

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

/** Light rig that warms and brightens with the page's dawn value. */
function DawnRig() {
  const key = useRef<DirectionalLight>(null);
  const fill = useRef<DirectionalLight>(null);
  const warm = useMemo(() => new Color("#ffd6a1"), []);
  const cold = useMemo(() => new Color("#ffe6c2"), []);
  const tint = useMemo(() => new Color(), []);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    const l = uav.light;
    if (key.current) {
      key.current.intensity = MathUtils.damp(key.current.intensity, 2.1 + l * 1.6, 3, dt);
      tint.copy(cold).lerp(warm, l);
      key.current.color.lerp(tint, 1 - Math.exp(-4 * dt));
    }
    if (fill.current) {
      fill.current.intensity = MathUtils.damp(fill.current.intensity, 0.7 + l * 0.9, 3, dt);
    }
  });

  return h(
    "group",
    null,
    h("ambientLight", { intensity: 0.7 + uav.light * 0.8 }),
    h("directionalLight", { ref: key, position: [5, 6, 4], intensity: 2.1, color: "#ffe6c2" }),
    h("directionalLight", { ref: fill, position: [-6, -1, -5], intensity: 0.7, color: "#bfe4ff" }),
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
      h(DawnRig, null),
      h(Suspense, { fallback: null }, h(Airframe, null)),
    ),
  );
}
