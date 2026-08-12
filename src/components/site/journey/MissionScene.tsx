import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Procedural mission environment: California ridgelines, a distributed sensor
 * network, a fire event, and the UAV that investigates it. Everything is driven
 * by a single scroll progress value (0 → 1) held in a ref so scrolling never
 * triggers React re-renders.
 *
 * No external models or textures — geometry is generated at runtime to keep the
 * payload small.
 */

export type Progress = { current: number };

const SIGNAL = new THREE.Color("#f59e0b");
const DATA = new THREE.Color("#38bdf8");

/** Layered sine ridges — deterministic, cheap, and readable as terrain. */
function height(x: number, z: number) {
  return (
    Math.sin(x * 0.055) * 5.2 +
    Math.cos(z * 0.043) * 4.4 +
    Math.sin((x + z) * 0.021) * 6.5 +
    Math.sin(x * 0.13 + z * 0.09) * 1.6
  );
}

const lerp = THREE.MathUtils.lerp;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** eased 0→1 ramp between a and b */
const ramp = (p: number, a: number, b: number) => {
  const t = clamp01((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const FIRE = new THREE.Vector3(34, 0, -22);
FIRE.y = height(FIRE.x, FIRE.z);

const NODE_POS = [
  [-46, 18], [-32, -8], [-18, 26], [-6, 2], [4, -26], [12, 22],
  [22, -4], [30, 30], [38, 8], [46, -20], [-40, -30], [0, 40],
].map(([x, z]) => new THREE.Vector3(x!, height(x!, z!) + 1.1, z!));

const ALERT_NODE = 6;

function Terrain() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(220, 220, 128, 128);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, height(pos.getX(i), pos.getZ(i)));
    }
    g.computeVertexNormals();
    return g;
  }, []);

  const wire = useMemo(() => {
    const g = new THREE.PlaneGeometry(220, 220, 44, 44);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, height(pos.getX(i), pos.getZ(i)) + 0.12);
    return new THREE.WireframeGeometry(g);
  }, []);

  return (
    <group>
      <mesh geometry={geo} receiveShadow={false}>
        <meshLambertMaterial color="#5c6b7f" flatShading />
      </mesh>
      <lineSegments geometry={wire}>
        <lineBasicMaterial color={DATA} transparent opacity={0.16} />
      </lineSegments>
    </group>
  );
}

function SensorNodes({ progress }: { progress: Progress }) {
  const group = useRef<THREE.Group>(null);
  const dots = useRef<THREE.Points>(null);
  const links = useRef<THREE.LineSegments>(null);
  const alert = useRef<THREE.Mesh>(null);

  const pointsGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(NODE_POS.flatMap((v) => [v.x, v.y, v.z]), 3),
    );
    return g;
  }, []);

  const linksGeo = useMemo(() => {
    const pts: number[] = [];
    NODE_POS.forEach((a, i) => {
      NODE_POS.forEach((b, j) => {
        if (j <= i) return;
        if (a.distanceTo(b) < 30) pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      });
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    const p = progress.current;
    const appear = ramp(p, 0.08, 0.2);
    const linked = ramp(p, 0.14, 0.28);
    const alerted = ramp(p, 0.24, 0.34);
    if (group.current) group.current.visible = appear > 0.01;
    if (dots.current) (dots.current.material as THREE.PointsMaterial).opacity = appear;
    if (links.current)
      (links.current.material as THREE.LineBasicMaterial).opacity = linked * 0.55;
    if (alert.current) {
      const t = clock.elapsedTime;
      const s = alerted * (1.6 + Math.sin(t * 3.2) * 0.5);
      alert.current.scale.setScalar(Math.max(0.001, s));
      (alert.current.material as THREE.MeshBasicMaterial).opacity = alerted * 0.5;
    }
  });

  return (
    <group ref={group}>
      <points ref={dots} geometry={pointsGeo}>
        <pointsMaterial color={DATA} size={2.4} sizeAttenuation transparent opacity={0} />
      </points>
      <lineSegments ref={links} geometry={linksGeo}>
        <lineBasicMaterial color={DATA} transparent opacity={0} />
      </lineSegments>
      <mesh ref={alert} position={NODE_POS[ALERT_NODE]}>
        <sphereGeometry args={[1.4, 16, 16]} />
        <meshBasicMaterial color={SIGNAL} transparent opacity={0} />
      </mesh>
    </group>
  );
}

/** Alert travelling from the detecting node up to the operations layer. */
function AlertBeam({ progress }: { progress: Progress }) {
  const line = useRef<THREE.Line>(null);
  const geo = useMemo(() => {
    const from = NODE_POS[ALERT_NODE]!;
    const to = new THREE.Vector3(from.x, 78, from.z);
    return new THREE.BufferGeometry().setFromPoints([from, to]);
  }, []);
  useFrame(() => {
    const a = ramp(progress.current, 0.3, 0.42) * (1 - ramp(progress.current, 0.55, 0.68));
    if (line.current) (line.current.material as THREE.LineDashedMaterial).opacity = a * 0.8;
  });
  return (
    // @ts-expect-error three primitive line element
    <line ref={line} geometry={geo}>
      <lineBasicMaterial color={SIGNAL} transparent opacity={0} />
    </line>
  );
}

/** Fire event: glow disc, ember particles and drifting smoke column. */
/** Soft round sprite used for smoke and haze particles. */
let softTex: THREE.Texture | null = null;
function soft() {
  if (softTex) return softTex;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,255,255,0.42)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  softTex = new THREE.CanvasTexture(c);
  return softTex;
}

function FireEvent({ progress }: { progress: Progress }) {
  const glow = useRef<THREE.Sprite>(null);
  const smoke = useRef<THREE.Points>(null);
  const light = useRef<THREE.PointLight>(null);

  const smokeGeo = useMemo(() => {
    const n = 320;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const t = i / n;
      arr[i * 3] = FIRE.x + (Math.random() - 0.5) * (3 + t * 26);
      arr[i * 3 + 1] = FIRE.y + t * 46 + Math.random() * 2;
      arr[i * 3 + 2] = FIRE.z + (Math.random() - 0.5) * (3 + t * 22) - t * 12;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    const p = progress.current;
    const on = ramp(p, 0.22, 0.36);
    const t = clock.elapsedTime;
    if (glow.current) {
      (glow.current.material as THREE.SpriteMaterial).opacity =
        on * (0.4 + Math.sin(t * 2.1) * 0.08);
      glow.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.06);
    }
    if (light.current) light.current.intensity = on * (26 + Math.sin(t * 3) * 6);
    if (smoke.current) {
      (smoke.current.material as THREE.PointsMaterial).opacity = on * 0.3;
      smoke.current.rotation.y = t * 0.02;
    }
  });

  return (
    <group>
      <sprite ref={glow as never} position={[FIRE.x, FIRE.y + 2.6, FIRE.z]} scale={[16, 16, 1]}>
        <spriteMaterial
          map={soft()}
          color="#ff9a3c"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <pointLight ref={light} position={[FIRE.x, FIRE.y + 6, FIRE.z]} color="#ff8a3c" distance={90} intensity={0} />
      <points ref={smoke} geometry={smokeGeo}>
        <pointsMaterial map={soft()} color="#9aa2ad" size={9} sizeAttenuation transparent opacity={0} depthWrite={false} alphaTest={0.01} />
      </points>
    </group>
  );
}

/** Fixed-wing UAV built from primitives — a vehicle, not a toy. */
function buildUAV() {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: "#cfd6de", roughness: 0.55, metalness: 0.25 });
  const dark = new THREE.MeshStandardMaterial({ color: "#3a424c", roughness: 0.6, metalness: 0.3 });

  const fuse = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 3.1, 6, 12), body);
  fuse.rotation.z = Math.PI / 2;
  g.add(fuse);

  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 9.4), body);
  wing.position.set(0.1, 0.18, 0);
  g.add(wing);

  const tailPlane = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 3), body);
  tailPlane.position.set(-1.9, 0.25, 0);
  g.add(tailPlane);

  [-1.4, 1.4].forEach((z) => {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.09), dark);
    fin.position.set(-1.9, 0.75, z);
    g.add(fin);
  });

  const payload = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 14), dark);
  payload.position.set(1.1, -0.42, 0);
  g.add(payload);

  const nav = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshBasicMaterial({ color: SIGNAL }),
  );
  nav.position.set(0.1, 0.24, 4.7);
  g.add(nav);

  g.scale.setScalar(0.9);
  return g;
}

function useFlightPath() {
  return useMemo(() => {
    const pts = [
      new THREE.Vector3(-78, 30, 48),
      new THREE.Vector3(-50, 26, 28),
      new THREE.Vector3(-22, 24, 8),
      new THREE.Vector3(-30, 20, -20),
      new THREE.Vector3(-4, 19, -34),
      new THREE.Vector3(20, 16, -34),
      FIRE.clone().add(new THREE.Vector3(-4, 14, 10)),
      FIRE.clone().add(new THREE.Vector3(14, 12, -6)),
      FIRE.clone().add(new THREE.Vector3(-2, 13, -20)),
    ];
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.35);
  }, []);
}

/** Maps scroll progress to a position along the flight path. */
function flightT(p: number) {
  if (p < 0.1) return lerp(0, 0.1, ramp(p, 0, 0.1));
  if (p < 0.48) return lerp(0.1, 0.16, ramp(p, 0.1, 0.48));
  return lerp(0.16, 1, ramp(p, 0.48, 0.86));
}

function Aircraft({ progress, uavRef }: { progress: Progress; uavRef: React.RefObject<THREE.Group | null> }) {
  const curve = useFlightPath();
  const mesh = useMemo(buildUAV, []);
  const trail = useRef<THREE.Line>(null);
  const trailGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(curve.getPoints(160)), [curve]);

  useFrame((_, delta) => {
    const g = uavRef.current;
    if (!g) return;
    const t = flightT(progress.current);
    const pos = curve.getPointAt(Math.min(0.999, t));
    const ahead = curve.getPointAt(Math.min(0.999, t + 0.004));
    g.position.copy(pos);
    g.lookAt(ahead);
    // subtle bank into the turn
    const turn = ahead.clone().sub(pos).normalize();
    const bank = THREE.MathUtils.clamp(-turn.x * 0.9, -0.5, 0.5);
    g.rotation.z = lerp(g.rotation.z, bank, Math.min(1, delta * 2));

    if (trail.current) {
      const m = trail.current.material as THREE.LineBasicMaterial;
      m.opacity = ramp(progress.current, 0.46, 0.58) * 0.35 * (1 - ramp(progress.current, 0.92, 1));
      (trail.current.geometry as THREE.BufferGeometry).setDrawRange(0, Math.floor(160 * t));
    }
  });

  return (
    <group>
      <group ref={uavRef}>
        <primitive object={mesh} />
      </group>
      {/* @ts-expect-error three primitive line element */}
      <line ref={trail} geometry={trailGeo}>
        <lineBasicMaterial color={DATA} transparent opacity={0} />
      </line>
    </group>
  );
}

type Key = { p: number; pos: [number, number, number]; look: [number, number, number] };

const KEYS: Key[] = [
  { p: 0.0, pos: [-6, 26, 96], look: [-44, 26, 44] },
  { p: 0.1, pos: [-24, 28, 68], look: [-4, 12, 4] },
  { p: 0.2, pos: [-6, 30, 52], look: [4, 6, -4] },
  { p: 0.3, pos: [18, 14, 12], look: [22, 4, -6] },
  { p: 0.42, pos: [14, 96, 44], look: [10, 0, -8] },
  { p: 0.5, pos: [-24, 34, 24], look: [-18, 18, -6] },
  { p: 0.62, pos: [-6, 30, -6], look: [10, 14, -26] },
  { p: 0.74, pos: [40, 28, 6], look: [FIRE.x, FIRE.y + 4, FIRE.z] },
  { p: 0.84, pos: [FIRE.x + 26, FIRE.y + 22, FIRE.z + 26], look: [FIRE.x, FIRE.y + 2, FIRE.z] },
  { p: 0.92, pos: [10, 74, 70], look: [4, 0, -8] },
  { p: 1.0, pos: [0, 132, 150], look: [0, 0, -6] },
];

function Rig({ progress, uavRef }: { progress: Progress; uavRef: React.RefObject<THREE.Group | null> }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);
  const chaseOffset = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const p = progress.current;
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1]!.p) i++;
    const a = KEYS[i]!;
    const b = KEYS[i + 1]!;
    const t = clamp01((p - a.p) / (b.p - a.p));
    const e = t * t * (3 - 2 * t);
    desired.set(
      lerp(a.pos[0], b.pos[0], e),
      lerp(a.pos[1], b.pos[1], e),
      lerp(a.pos[2], b.pos[2], e),
    );
    target.set(
      lerp(a.look[0], b.look[0], e),
      lerp(a.look[1], b.look[1], e),
      lerp(a.look[2], b.look[2], e),
    );

    // chase the aircraft through the flight chapter
    const chase = ramp(p, 0.55, 0.62) * (1 - ramp(p, 0.76, 0.84));
    const uav = uavRef.current;
    if (chase > 0.01 && uav) {
      chaseOffset.set(-14, 6, 10).applyQuaternion(uav.quaternion).add(uav.position);
      desired.lerp(chaseOffset, chase);
      target.lerp(uav.position, chase);
    }

    camera.position.lerp(desired, Math.min(1, delta * 2.6));
    camera.lookAt(target);
  });
  return null;
}

function Atmosphere() {
  const dust = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const n = 500;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 240;
      arr[i * 3 + 1] = Math.random() * 70;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 240;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);
  useFrame(({ clock }) => {
    if (dust.current) dust.current.rotation.y = clock.elapsedTime * 0.008;
  });
  return (
    <points ref={dust} geometry={geo}>
      <pointsMaterial map={soft()} color="#c3ccd7" size={1.1} sizeAttenuation transparent opacity={0.25} depthWrite={false} />
    </points>
  );
}


/** Dusk gradient dome — atmosphere and depth behind the ridgelines. */
function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {},
        vertexShader:
          "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: `
          varying vec3 vP;
          void main(){
            float h = clamp(normalize(vP).y * 0.5 + 0.5, 0.0, 1.0);
            vec3 low = vec3(0.62, 0.34, 0.16);
            vec3 mid = vec3(0.20, 0.26, 0.36);
            vec3 top = vec3(0.05, 0.08, 0.14);
            vec3 c = mix(low, mid, smoothstep(0.42, 0.56, h));
            c = mix(c, top, smoothstep(0.56, 0.85, h));
            gl_FragColor = vec4(c, 1.0);
          }
        `,
      }),
    [],
  );
  return <mesh material={mat} scale={[1, 1, 1]}><sphereGeometry args={[420, 32, 24]} /></mesh>;
}

export default function MissionScene({ progress }: { progress: Progress }) {
  const uavRef = useRef<THREE.Group>(null);
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 42, near: 0.5, far: 900, position: [-64, 22, 74] }}
      onCreated={({ scene, gl }) => {
        scene.fog = new THREE.FogExp2("#2b394d", 0.0032);
        gl.setClearColor("#131c27", 1);
      }}
    >
      <ambientLight intensity={0.5} color="#9db4cc" />
      <hemisphereLight args={["#93b0cf", "#242a33", 1.1]} />
      <directionalLight position={[-70, 48, 46]} intensity={1.15} color="#ffd3a3" />
      <directionalLight position={[60, 26, -60]} intensity={0.5} color="#7fb6ff" />
      <Sky />
      <Terrain />
      <Atmosphere />
      <SensorNodes progress={progress} />
      <AlertBeam progress={progress} />
      <FireEvent progress={progress} />
      <Aircraft progress={progress} uavRef={uavRef} />
      <Rig progress={progress} uavRef={uavRef} />
    </Canvas>
  );
}
