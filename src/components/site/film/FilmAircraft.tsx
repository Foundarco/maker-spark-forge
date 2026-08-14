import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { createElement as h, Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { Box3, CatmullRomCurve3, Group, MathUtils, Mesh, MeshStandardMaterial, Vector3 } from "three";
import uavAsset from "@/assets/athera-vtol.glb.asset.json";

// Every node inside <Canvas> is created with createElement on purpose: the dev
// JSX-source plugin injects props that react-three-fiber rejects on three objects.

useGLTF.preload?.(uavAsset.url, true);

const shell = new MeshStandardMaterial({ color: "#e9eef3", metalness: 0.42, roughness: 0.34 });

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const win = (v: number, a: number, b: number, c: number, d: number) => range(v, a, b) * (1 - range(v, c, d));

/**
 * Flight path through the film. The aircraft enters from the far left at dawn,
 * is escorted across the terrain, shrinks into a mission object while the world
 * becomes a map, then accelerates back into the landscape for the incident.
 */
const route = new CatmullRomCurve3(
  [
    new Vector3(-6.4, 1.9, -6.5), // 01 distant entry
    new Vector3(-3.2, 1.1, -2.2), // 02 camera catches it
    new Vector3(-0.6, 0.55, 0.4), // 03 escort / passes near
    new Vector3(2.4, 1.15, -1.6), // 04 climbs away over sensor terrain
    new Vector3(0.9, 1.6, -4.2), // 05 anomaly, high and small
    new Vector3(0.15, 1.15, -6.6), // 06 ops map: mission object
    new Vector3(-2.6, 0.9, -4.0), // 07 dispatch turn
    new Vector3(-1.1, 0.35, -0.6), // 08 accelerates back in
    new Vector3(1.9, 0.05, 0.8), // 09 rgb pass
    new Vector3(0.6, -0.25, -0.4), // 10 thermal orbit
    new Vector3(-1.6, -0.15, -1.2), // 11 confirmation
    new Vector3(0.2, -0.55, 0.6), // 12 suppression run
    new Vector3(2.2, 0.25, -1.4), // 13 reassessment climb
    new Vector3(0.4, 0.9, -3.6), // 14 handoff
    new Vector3(-0.2, 1.3, -8.5), // 15 pull back
  ],
  false,
  "catmullrom",
  0.4,
);

function Airframe({ progress }: { progress: RefObject<number> }) {
  const group = useRef<Group>(null);
  const tilt = useRef<Group>(null);
  const beacon = useRef<Mesh>(null);
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
    const p = clamp(progress.current ?? 0);
    const t = state.clock.elapsedTime;

    route.getPointAt(p, point);
    route.getPointAt(Math.min(1, p + 0.01), ahead);
    dir.copy(ahead).sub(point);
    const speed = dir.length();
    dir.normalize();

    // continuous, damped travel — motion carries on when scroll input pauses
    g.position.x = MathUtils.damp(g.position.x, point.x, 3.4, dt);
    g.position.y = MathUtils.damp(g.position.y, point.y + Math.sin(t * 1.5) * 0.045, 3.0, dt);
    g.position.z = MathUtils.damp(g.position.z, point.z, 3.4, dt);

    const heading = Math.atan2(dir.x, dir.z);
    const bank = clamp(-dir.x * 1.1 + Math.sin(t * 0.9) * 0.05, -0.5, 0.5);
    g.rotation.y = MathUtils.damp(g.rotation.y, heading, 4, dt);
    if (tilt.current) {
      tilt.current.rotation.z = MathUtils.damp(tilt.current.rotation.z, bank, 3.2, dt);
      tilt.current.rotation.x = MathUtils.damp(
        tilt.current.rotation.x,
        -dir.y * 0.55 + Math.sin(t * 2.3) * 0.012 + speed * 0.06,
        3.2,
        dt,
      );
    }

    // mission-object phase: shrinks over the map, expands back for dispatch
    const asMarker = win(p, 0.33, 0.38, 0.42, 0.47);
    const investigating = win(p, 0.55, 0.6, 0.86, 0.92);
    const scale = (1 - asMarker * 0.72) * (1 + investigating * 0.12);
    g.scale.setScalar(MathUtils.damp(g.scale.x || 0.2, scale, 3.5, dt));

    if (beacon.current) {
      const pulse = 0.5 + Math.abs(Math.sin(t * 3.2)) * 0.9;
      (beacon.current.material as MeshStandardMaterial).emissiveIntensity = pulse * 2.2;
    }
  });

  return h(
    "group",
    { ref: group, position: [-6.4, 1.9, -6.5] },
    h(
      "group",
      { ref: tilt },
      h("primitive", { object: scene, rotation: [-Math.PI / 2, 0, Math.PI / 2], scale: fit }),
      h(
        "mesh",
        { ref: beacon, position: [0, 0.12, -0.55] },
        h("sphereGeometry", { args: [0.035, 10, 10] }),
        h("meshStandardMaterial", {
          color: "#ffd9a1",
          emissive: "#ff9d3c",
          emissiveIntensity: 2,
          toneMapped: false,
        }),
      ),
    ),
  );
}

/** Transparent WebGL layer holding the film's protagonist. */
export default function FilmAircraft({
  progress,
  active,
}: {
  progress: RefObject<number>;
  active: RefObject<boolean>;
}) {
  return h(
    Canvas,
    {
      camera: { position: [0, 0.6, 6.4], fov: 34 },
      dpr: [1, Math.min(1.6, typeof window !== "undefined" ? window.devicePixelRatio : 1)],
      gl: { antialias: true, alpha: true, powerPreference: "high-performance" },
      frameloop: "always",
      onCreated: ({ setFrameloop }: { setFrameloop: (m: "always" | "never") => void }) => {
        // pause GPU work whenever the stage leaves the viewport
        const tick = () => {
          setFrameloop(active.current ? "always" : "never");
          window.setTimeout(tick, 400);
        };
        tick();
      },
    },
    h("ambientLight", { intensity: 0.75 }),
    h("directionalLight", { position: [5, 6, 4], intensity: 2.4, color: "#ffe6c2" }),
    h("directionalLight", { position: [-6, -1, -5], intensity: 0.7, color: "#7dd3fc" }),
    h(Suspense, { fallback: null }, h(Airframe, { progress })),
  );
}
