import { Canvas, useFrame } from "@react-three/fiber";
import { Center, ContactShadows, Environment, Float, OrbitControls, useGLTF } from "@react-three/drei";
import { createElement as h, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";
import { Box3, MeshStandardMaterial, Vector3 } from "three";
import uavAsset from "@/assets/athera-vtol.glb.asset.json";

// Every node inside <Canvas> is created with createElement on purpose: the dev
// JSX-source plugin injects props that react-three-fiber rejects on three objects.

useGLTF.preload?.(uavAsset.url, true);

const shell = new MeshStandardMaterial({
  color: "#e6e7e2",
  metalness: 0.45,
  roughness: 0.35,
});

function Airframe({ spin }: { spin: number }) {
  const { scene } = useGLTF(uavAsset.url, true);
  const group = useRef<Group>(null);

  const fit = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    return 3.1 / Math.max(size.x, size.y, size.z, 0.001);
  }, [scene]);

  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as Mesh;
      if (mesh.isMesh) mesh.material = shell;
    });
  }, [scene]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += delta * spin;
    g.rotation.z = Math.sin(state.clock.elapsedTime * 0.6) * 0.06;
  });

  return h(
    "group",
    { ref: group },
    h(Center, null, h("primitive", { object: scene, rotation: [-Math.PI / 2, 0, 0], scale: fit })),
  );
}

/**
 * The aircraft, in the round.
 *
 * Light studio rig on a cream stage — visitors can grab it and turn it.
 * Mounts only while it is on screen so the page never pays for an idle
 * WebGL context.
 */
export function Uav3D({
  className = "",
  spin = 0.22,
  interactive = true,
}: {
  className?: string;
  spin?: number;
  interactive?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false), {
      rootMargin: "20% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return h(
    "div",
    { ref: host, className },
    visible
      ? h(
          Canvas,
          {
            camera: { position: [0, 0.7, 5.2], fov: 30 },
            dpr: [1, 1.7],
            gl: { antialias: true, alpha: true, powerPreference: "high-performance" },
          },
          h("ambientLight", { intensity: 1.1 }),
          h("directionalLight", { position: [4, 6, 5], intensity: 2.1 }),
          h("directionalLight", { position: [-5, 1, -4], intensity: 0.9, color: "#a8c0a0" }),
          h(
            Suspense,
            { fallback: null },
            h(Float, { speed: 1.1, rotationIntensity: 0.15, floatIntensity: 0.6 }, h(Airframe, { spin })),
            h(ContactShadows, {
              position: [0, -1.5, 0],
              opacity: 0.34,
              scale: 9,
              blur: 3,
              far: 4,
              color: "#4a5d45",
            }),
            h(Environment, { preset: "city" }),
          ),
          interactive
            ? h(OrbitControls, {
                enablePan: false,
                enableZoom: false,
                minPolarAngle: Math.PI * 0.22,
                maxPolarAngle: Math.PI * 0.62,
                rotateSpeed: 0.6,
              })
            : null,
        )
      : null,
  );
}
