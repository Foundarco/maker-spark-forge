import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The mission environment: California ridgelines, chaparral and conifer cover,
 * a distributed sensor network, a wildfire that builds from haze to flame, and
 * the UAV that investigates it.
 *
 * A single scroll value (0 → 1) drives everything. It arrives in a ref, is
 * damped once per frame, and is then read by every animated element — no React
 * state, no per-scroll re-render, one render loop.
 */

export type Progress = { current: number };

const SIGNAL = new THREE.Color("#f59e0b");
const DATA = new THREE.Color("#38bdf8");

const lerp = THREE.MathUtils.lerp;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (p: number, a: number, b: number) => {
  const t = clamp01((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------------ terrain */

/** Deterministic value noise + fBm — gives ridges, valleys and detail. */
function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v) * 2 - 1;
}
function fbm(x: number, y: number, oct = 5) {
  let f = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < oct; i++) {
    f += amp * vnoise(x * freq, y * freq);
    freq *= 2.03;
    amp *= 0.5;
  }
  return f;
}

const SCALE = 0.0075;
/** Terrain elevation in world units. */
function height(x: number, z: number) {
  const base = fbm(x * SCALE, z * SCALE, 7);
  // ridged component builds believable mountain spines
  const ridge = 1 - Math.abs(fbm(x * SCALE * 2.1 + 11, z * SCALE * 2.1 - 7, 3));
  const valley = Math.sin(x * 0.0032) * 0.35;
  const detail = fbm(x * SCALE * 7.3 + 3, z * SCALE * 7.3 - 5, 3) * 3.2;
  return base * 46 + ridge * ridge * 26 - 16 + valley * 20 + detail;
}

const GROUND = 900;

function Terrain() {
  const geo = useMemo(() => {
    const seg = 220;
    const g = new THREE.PlaneGeometry(GROUND, GROUND, seg, seg);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);

    const rock = new THREE.Color("#7d7466");
    const grass = new THREE.Color("#8d7f52");
    const brush = new THREE.Color("#59603f");
    const shade = new THREE.Color("#3d4437");
    const tmp = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = height(x, z);
      pos.setY(i, h);
      const slope = Math.abs(height(x + 4, z) - h) + Math.abs(height(x, z + 4) - h);
      const dry = clamp01((h + 10) / 55);
      tmp.copy(brush).lerp(grass, dry);
      tmp.lerp(rock, clamp01(slope * 0.14));
      tmp.lerp(shade, clamp01(0.42 - dry) * 0.7);
      const n = 0.9 + hash2(x * 0.7, z * 0.7) * 0.2;
      colors[i * 3] = tmp.r * n;
      colors[i * 3 + 1] = tmp.g * n;
      colors[i * 3 + 2] = tmp.b * n;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial vertexColors roughness={0.98} metalness={0} />
    </mesh>
  );
}

/** Instanced conifer cover — scale cue and vegetation realism, one draw call. */
function Vegetation() {
  const { geo, mat, count, matrices, tints } = useMemo(() => {
    const cone = new THREE.ConeGeometry(1.05, 3.4, 5, 1);
    cone.translate(0, 1.7, 0);
    const n = 9000;
    const m: THREE.Matrix4[] = [];
    const tints: number[] = [];
    const dummy = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const x = (hash2(i, 3.1) - 0.5) * 760;
      const z = (hash2(i, 7.7) - 0.5) * 760;
      const h = height(x, z);
      if (h < -8 || h > 46) continue;
      // clumped cover: skip where the vegetation noise field is low
      if (fbm(x * 0.012, z * 0.012, 3) < -0.05) continue;
      const s = 0.8 + hash2(i, 11.3) * 1.5;
      dummy.position.set(x, h - 0.3, z);
      dummy.rotation.set(hash2(i, 2.2) * 0.08, hash2(i, 5.2) * Math.PI, (hash2(i, 6.4) - 0.5) * 0.12);
      dummy.scale.set(s * 0.85, s * (0.8 + hash2(i, 4.4) * 0.9), s * 0.85);
      dummy.updateMatrix();
      m.push(dummy.matrix.clone());
      tints.push(0.6 + hash2(i, 8.8) * 0.7);
    }
    return {
      geo: cone,
      mat: new THREE.MeshStandardMaterial({ color: "#4a5238", roughness: 1, flatShading: true }),
      count: m.length,
      matrices: m,
      tints,
    };
  }, []);

  const ref = useRef<THREE.InstancedMesh>(null);
  const set = useRef(false);
  useFrame(() => {
    if (set.current || !ref.current) return;
    const col = new THREE.Color();
    matrices.forEach((mx, i) => {
      ref.current!.setMatrixAt(i, mx);
      const t = tints[i]!;
      col.setRGB(0.16 * t, 0.2 * t, 0.13 * t);
      ref.current!.setColorAt(i, col);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    set.current = true;
  });

  return <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false} />;
}

/* --------------------------------------------------------------- atmosphere */

const texCache = new Map<string, THREE.Texture>();
/** Soft, slightly turbulent puff sprite — reads as vapour, not a dot. */
function puffTexture() {
  const cached = texCache.get("puff");
  if (cached) return cached;
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.4, "rgba(255,255,255,0.45)");
  g.addColorStop(0.75, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  // break the perfect circle so puffs overlap like real vapour
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const r = size * (0.24 + hash2(i, 1.7) * 0.22);
    const x = size / 2 + Math.cos(a) * r;
    const y = size / 2 + Math.sin(a) * r;
    const rr = size * (0.05 + hash2(i, 9.1) * 0.09);
    const gg = ctx.createRadialGradient(x, y, 0, x, y, rr);
    gg.addColorStop(0, "rgba(0,0,0,0.5)");
    gg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gg;
    ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  const t = new THREE.CanvasTexture(c);
  texCache.set("puff", t);
  return t;
}

/** Dusk sky dome with sun glow low on the horizon. */
function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        vertexShader:
          "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: `
          varying vec3 vP;
          void main(){
            vec3 d = normalize(vP);
            float h = clamp(d.y * 0.5 + 0.5, 0.0, 1.0);
            vec3 haze = vec3(0.74, 0.55, 0.38);
            vec3 mid  = vec3(0.33, 0.40, 0.50);
            vec3 top  = vec3(0.07, 0.11, 0.18);
            vec3 c = mix(haze, mid, smoothstep(0.46, 0.60, h));
            c = mix(c, top, smoothstep(0.58, 0.92, h));
            vec3 sun = normalize(vec3(-0.72, 0.13, 0.42));
            float s = max(dot(d, sun), 0.0);
            c += vec3(1.0, 0.62, 0.28) * pow(s, 24.0) * 0.55;
            c += vec3(1.0, 0.70, 0.42) * pow(s, 4.0) * 0.10;
            gl_FragColor = vec4(c, 1.0);
          }
        `,
      }),
    [],
  );
  return (
    <mesh material={mat} renderOrder={-1}>
      <sphereGeometry args={[1400, 32, 24]} />
    </mesh>
  );
}

/** Horizontal haze bands — atmospheric perspective over the valleys. */
function Haze() {
  const geo = useMemo(() => {
    const n = 90;
    const pos = new Float32Array(n * 3);
    const size = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (hash2(i, 21.3) - 0.5) * 800;
      const z = (hash2(i, 4.9) - 0.5) * 800;
      pos[i * 3] = x;
      pos[i * 3 + 1] = height(x, z) + 6 + hash2(i, 8.2) * 18;
      pos[i * 3 + 2] = z;
      size[i] = 130 + hash2(i, 17.4) * 220;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("size", new THREE.BufferAttribute(size, 1));
    return g;
  }, []);

  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: puffTexture(),
        color: new THREE.Color("#c8b49a"),
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        sizeAttenuation: true,
        size: 180,
        fog: false,
      }),
    [],
  );

  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.0035;
  });
  return <points ref={ref} geometry={geo} material={mat} />;
}

/* ------------------------------------------------------------ sensor network */

const FIRE = new THREE.Vector3(150, 0, -210);
FIRE.y = height(FIRE.x, FIRE.z);

const NODE_POS = Array.from({ length: 26 }, (_, i) => {
  const x = (hash2(i, 31.7) - 0.5) * 520;
  const z = (hash2(i, 13.9) - 0.5) * 520;
  return new THREE.Vector3(x, height(x, z) + 3, z);
});
// nearest node to the fire becomes the detecting node
const ALERT_NODE = NODE_POS.reduce(
  (best, v, i) => (v.distanceTo(FIRE) < NODE_POS[best]!.distanceTo(FIRE) ? i : best),
  0,
);

function SensorNodes({ progress }: { progress: Progress }) {
  const dots = useRef<THREE.Points>(null);
  const links = useRef<THREE.LineSegments>(null);
  const alert = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);

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
        if (a.distanceTo(b) < 150) pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      });
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    const p = progress.current;
    const appear = ramp(p, 0.1, 0.19);
    const linked = ramp(p, 0.16, 0.3);
    const alerted = ramp(p, 0.26, 0.36);
    const fade = 1 - ramp(p, 0.86, 0.97) * 0.65;
    const t = clock.elapsedTime;
    if (dots.current) (dots.current.material as THREE.PointsMaterial).opacity = appear * fade;
    if (links.current)
      (links.current.material as THREE.LineBasicMaterial).opacity = linked * 0.34 * fade;
    if (alert.current) {
      const m = alert.current.material as THREE.MeshBasicMaterial;
      m.opacity = alerted * (0.55 + Math.sin(t * 3.4) * 0.25);
      alert.current.scale.setScalar(Math.max(0.001, alerted * 2.2));
    }
    if (ring.current) {
      const cyc = (t * 0.5) % 1;
      ring.current.scale.setScalar(Math.max(0.001, alerted * (6 + cyc * 90)));
      (ring.current.material as THREE.MeshBasicMaterial).opacity = alerted * (1 - cyc) * 0.35;
    }
  });

  return (
    <group>
      <points ref={dots} geometry={pointsGeo}>
        <pointsMaterial
          map={puffTexture()}
          color={DATA}
          size={7}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          fog={false}
        />
      </points>
      <lineSegments ref={links} geometry={linksGeo}>
        <lineBasicMaterial color={DATA} transparent opacity={0} fog={false} />
      </lineSegments>
      <mesh ref={alert} position={NODE_POS[ALERT_NODE]}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshBasicMaterial color={SIGNAL} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={ring} position={NODE_POS[ALERT_NODE]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1, 48]} />
        <meshBasicMaterial color={SIGNAL} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** The detection climbing out of the ridge toward the Operations Center. */
function AlertBeam({ progress }: { progress: Progress }) {
  const mesh = useRef<THREE.Mesh>(null);
  const base = NODE_POS[ALERT_NODE]!;
  useFrame(({ clock }) => {
    const p = progress.current;
    const a = ramp(p, 0.3, 0.4) * (1 - ramp(p, 0.5, 0.6));
    if (!mesh.current) return;
    const m = mesh.current.material as THREE.MeshBasicMaterial;
    m.opacity = a * (0.16 + Math.sin(clock.elapsedTime * 4) * 0.06);
    mesh.current.scale.y = Math.max(0.001, a);
  });
  return (
    <mesh ref={mesh} position={[base.x, base.y + 130, base.z]}>
      <cylinderGeometry args={[0.4, 1.4, 260, 10, 1, true]} />
      <meshBasicMaterial
        color={SIGNAL}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------- fire */

/** Smoke column that grows from faint haze to a full convection plume. */
function FireEvent({ progress }: { progress: Progress }) {
  const smoke = useRef<THREE.Points>(null);
  const glow = useRef<THREE.Sprite>(null);
  const flame = useRef<THREE.Sprite>(null);
  const light = useRef<THREE.PointLight>(null);

  const COUNT = 240;
  const { geo, seeds } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const size = new Float32Array(COUNT);
    const s: number[] = [];
    for (let i = 0; i < COUNT; i++) {
      s.push(hash2(i, 2.3));
      size[i] = 26 + hash2(i, 6.6) * 46;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("size", new THREE.BufferAttribute(size, 1));
    return { geo: g, seeds: s };
  }, []);

  useFrame(({ clock }) => {
    const p = progress.current;
    const t = clock.elapsedTime;
    // tension curve: faint haze early, full plume once detected and approached
    const grow = 0.16 + ramp(p, 0.2, 0.36) * 0.34 + ramp(p, 0.52, 0.72) * 0.5;
    const heat = ramp(p, 0.6, 0.74);

    if (smoke.current) {
      const arr = (smoke.current.geometry.attributes.position as THREE.BufferAttribute)
        .array as Float32Array;
      for (let i = 0; i < COUNT; i++) {
        const seed = seeds[i]!;
        const life = (seed + t * 0.035) % 1;
        const rise = life * 220 * grow;
        const spread = 6 + life * 90 * grow;
        const sway = Math.sin(t * 0.35 + seed * 12) * spread * 0.35;
        arr[i * 3] = FIRE.x + Math.cos(seed * 40) * spread * 0.5 + sway + life * 60;
        arr[i * 3 + 1] = FIRE.y + 4 + rise;
        arr[i * 3 + 2] = FIRE.z + Math.sin(seed * 27) * spread * 0.5 - life * 46;
      }
      (smoke.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      const m = smoke.current.material as THREE.PointsMaterial;
      m.opacity = 0.1 + grow * 0.3;
      m.color.setHex(0x8c8578).lerp(new THREE.Color("#4a4038"), heat * 0.5);
    }
    if (glow.current) {
      const m = glow.current.material as THREE.SpriteMaterial;
      m.opacity = heat * (0.45 + Math.sin(t * 2.4) * 0.08);
      const s = 34 * (1 + Math.sin(t * 1.6) * 0.05);
      glow.current.scale.set(s, s, 1);
    }
    if (flame.current) {
      const m = flame.current.material as THREE.SpriteMaterial;
      m.opacity = heat * (0.75 + Math.sin(t * 9.1) * 0.18);
      const s = 12 * (1 + Math.sin(t * 6.3) * 0.12);
      flame.current.scale.set(s * 1.4, s, 1);
    }
    if (light.current) light.current.intensity = heat * (620 + Math.sin(t * 7) * 160);
  });

  return (
    <group>
      <points ref={smoke} geometry={geo}>
        <pointsMaterial
          map={puffTexture()}
          color="#8c8578"
          size={42}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          fog={false}
        />
      </points>
      <sprite ref={flame as never} position={[FIRE.x + 2, FIRE.y + 4, FIRE.z]}>
        <spriteMaterial
          map={puffTexture()}
          color="#ff7a1a"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite ref={glow as never} position={[FIRE.x + 2, FIRE.y + 8, FIRE.z]}>
        <spriteMaterial
          map={puffTexture()}
          color="#ff8c3a"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <pointLight
        ref={light}
        position={[FIRE.x, FIRE.y + 12, FIRE.z]}
        color="#ff7a2a"
        distance={340}
        decay={2}
        intensity={0}
      />
    </group>
  );
}

/* --------------------------------------------------------------------- UAV */

/** Fixed-wing UAV — realistic proportions, matte aerospace materials. */
function buildUAV() {
  const g = new THREE.Group();
  const shell = new THREE.MeshStandardMaterial({ color: "#b9c0c7", roughness: 0.45, metalness: 0.35 });
  const dark = new THREE.MeshStandardMaterial({ color: "#2c333b", roughness: 0.6, metalness: 0.4 });
  const glass = new THREE.MeshStandardMaterial({ color: "#1b2733", roughness: 0.15, metalness: 0.8 });

  // fuselage: lathe profile, tapered nose and tail
  const profile: THREE.Vector2[] = [];
  const L = 5.6;
  for (let i = 0; i <= 22; i++) {
    const t = i / 22;
    const x = -L * 0.42 + t * L;
    const r = 0.46 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), 0.55);
    profile.push(new THREE.Vector2(Math.max(0.01, r), x));
  }
  const fuse = new THREE.Mesh(new THREE.LatheGeometry(profile, 20), shell);
  fuse.rotation.z = -Math.PI / 2;
  g.add(fuse);

  // wing: swept, tapered, slight dihedral
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0.9, 0);
  wingShape.lineTo(-0.85, 0);
  wingShape.lineTo(-0.6, 6.4);
  wingShape.lineTo(0.35, 6.4);
  wingShape.lineTo(0.9, 0);
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.11, bevelEnabled: false });
  wingGeo.rotateX(Math.PI / 2);
  [1, -1].forEach((s) => {
    const w = new THREE.Mesh(wingGeo, shell);
    w.scale.z = s;
    w.position.set(0.1, 0.12, 0);
    w.rotation.x = s * 0.05;
    g.add(w);
  });

  // twin tail booms + horizontal stabiliser
  [1, -1].forEach((s) => {
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.6, 8), dark);
    boom.rotation.z = Math.PI / 2;
    boom.position.set(-1.5, 0.15, s * 1.5);
    g.add(boom);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.05, 0.07), shell);
    fin.position.set(-3.1, 0.62, s * 1.5);
    g.add(fin);
  });
  const stab = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 3.1), shell);
  stab.position.set(-3.1, 1.06, 0);
  g.add(stab);

  // sensor turret + optics
  const turret = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 14), dark);
  turret.position.set(1.35, -0.42, 0);
  g.add(turret);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.19, 16), glass);
  lens.position.set(1.62, -0.46, 0);
  lens.rotation.y = Math.PI / 2;
  g.add(lens);

  // propeller disc (pusher)
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(0.95, 24),
    new THREE.MeshBasicMaterial({ color: "#101418", transparent: true, opacity: 0.28, side: THREE.DoubleSide }),
  );
  disc.position.set(-2.45, 0, 0);
  disc.rotation.y = Math.PI / 2;
  g.add(disc);

  const nav = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: SIGNAL }));
  nav.position.set(0.1, 0.2, 6.4);
  g.add(nav);
  const nav2 = nav.clone();
  nav2.position.z = -6.4;
  (nav2.material as THREE.MeshBasicMaterial) = new THREE.MeshBasicMaterial({ color: "#7ef29a" });
  g.add(nav2);

  g.scale.setScalar(1.6);
  return g;
}

function useFlightPath() {
  return useMemo(() => {
    const at = (x: number, z: number, alt: number) => new THREE.Vector3(x, height(x, z) + alt, z);
    const pts = [
      at(-380, 300, 78),
      at(-250, 190, 74),
      at(-140, 90, 70),
      at(-60, 10, 66),
      at(-20, -60, 64),
      at(10, -120, 62),
      at(60, -170, 58),
      at(FIRE.x - 70, FIRE.z - 20, 54),
      at(FIRE.x - 10, FIRE.z + 60, 44),
      at(FIRE.x + 60, FIRE.z + 10, 40),
      at(FIRE.x + 10, FIRE.z - 70, 44),
      at(FIRE.x - 60, FIRE.z - 20, 50),
    ];
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.4);
  }, []);
}

/** Scroll position → distance along the flight path, with intentional pauses. */
function flightT(p: number) {
  if (p < 0.12) return lerp(0.0, 0.1, ramp(p, 0, 0.12)); // establishing cruise
  if (p < 0.3) return lerp(0.1, 0.2, ramp(p, 0.12, 0.3)); // slow pass over the network
  if (p < 0.46) return 0.2 + ramp(p, 0.3, 0.46) * 0.02; // holding while ops reviews
  if (p < 0.78) return lerp(0.22, 0.82, ramp(p, 0.46, 0.78)); // dispatch → on scene
  return lerp(0.82, 1, ramp(p, 0.78, 1)); // orbit
}

function Aircraft({
  progress,
  uavRef,
}: {
  progress: Progress;
  uavRef: React.RefObject<THREE.Group | null>;
}) {
  const curve = useFlightPath();
  const mesh = useMemo(buildUAV, []);
  const trail = useRef<THREE.Line>(null);
  const trailGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(curve.getPoints(220)), [curve]);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const ahead = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const g = uavRef.current;
    if (!g) return;
    const t = Math.min(0.998, flightT(progress.current));
    curve.getPointAt(t, pos);
    curve.getPointAt(Math.min(0.999, t + 0.006), ahead);
    g.position.copy(pos);
    g.lookAt(ahead);
    const dir = ahead.clone().sub(pos).normalize();
    const bank = THREE.MathUtils.clamp(-dir.x * 0.8, -0.55, 0.55);
    g.rotation.z = lerp(g.rotation.z, bank, Math.min(1, delta * 3));

    if (trail.current) {
      const m = trail.current.material as THREE.LineBasicMaterial;
      m.opacity = ramp(progress.current, 0.46, 0.56) * 0.3 * (1 - ramp(progress.current, 0.95, 1));
      trail.current.geometry.setDrawRange(0, Math.floor(220 * t));
    }
  });

  return (
    <group>
      <group ref={uavRef}>
        <primitive object={mesh} />
      </group>
      {/* @ts-expect-error three line primitive */}
      <line ref={trail} geometry={trailGeo}>
        <lineBasicMaterial color={DATA} transparent opacity={0} fog={false} />
      </line>
    </group>
  );
}

/* ------------------------------------------------------------------ camera */

type Key = {
  p: number;
  /** camera offset relative to the UAV, in the UAV's own frame */
  chase?: [number, number, number];
  pos?: [number, number, number];
  look?: [number, number, number];
  fov?: number;
};

/**
 * One camera timeline. `chase` keys ride with the aircraft, `pos` keys are
 * world-anchored establishing / reveal shots. Everything blends smoothly.
 */
const KEYS: Key[] = [
  { p: 0.0, pos: [-430, 150, 430], look: [-120, -10, 30], fov: 50 }, // wide California
  { p: 0.08, chase: [-26, 7, 14], fov: 40 }, // alongside the UAV
  { p: 0.18, chase: [-16, 5, -20], fov: 42 }, // over the sensor nodes
  { p: 0.26, pos: [-30, 430, 150], look: [-20, 0, -40], fov: 48 }, // top-down coverage
  { p: 0.33, pos: [NODE_POS[ALERT_NODE]!.x - 40, NODE_POS[ALERT_NODE]!.y + 22, NODE_POS[ALERT_NODE]!.z + 46], look: [NODE_POS[ALERT_NODE]!.x, NODE_POS[ALERT_NODE]!.y, NODE_POS[ALERT_NODE]!.z], fov: 34 }, // detection
  { p: 0.4, pos: [NODE_POS[ALERT_NODE]!.x - 120, NODE_POS[ALERT_NODE]!.y + 150, NODE_POS[ALERT_NODE]!.z + 170], look: [NODE_POS[ALERT_NODE]!.x, NODE_POS[ALERT_NODE]!.y + 60, NODE_POS[ALERT_NODE]!.z], fov: 42 }, // alert climbs
  { p: 0.46, pos: [-120, 300, 320], look: [40, 40, -80], fov: 44 }, // ops center backdrop
  { p: 0.54, chase: [-34, 9, 22], fov: 38 }, // dispatch
  { p: 0.62, chase: [-22, 4, 8], fov: 34 }, // flight to incident
  { p: 0.63, chase: [6, 2.4, 9], fov: 30 }, // sensor perspective, fire ahead (RGB)
  { p: 0.7, chase: [4, 2.6, 10], fov: 32 }, // thermal pass
  { p: 0.78, pos: [FIRE.x + 150, FIRE.y + 130, FIRE.z + 190], look: [FIRE.x, FIRE.y + 20, FIRE.z], fov: 40 }, // intelligence / mapping
  { p: 0.86, pos: [FIRE.x - 210, FIRE.y + 90, FIRE.z + 260], look: [FIRE.x - 20, FIRE.y + 20, FIRE.z], fov: 44 }, // responder view
  { p: 0.93, pos: [40, 430, 430], look: [20, 10, -60], fov: 46 }, // whole system

  { p: 1.0, pos: [0, 700, 760], look: [0, 0, -80], fov: 50 }, // future
];

function Rig({ progress, uavRef }: { progress: Progress; uavRef: React.RefObject<THREE.Group | null> }) {
  const { camera } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const want = useMemo(() => new THREE.Vector3(), []);
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);
  const lookNow = useMemo(() => new THREE.Vector3(), []);
  const init = useRef(false);

  const resolve = (k: Key, outPos: THREE.Vector3, outLook: THREE.Vector3) => {
    const uav = uavRef.current;
    if (k.chase && uav) {
      outPos.set(k.chase[0], k.chase[1], k.chase[2]).applyQuaternion(uav.quaternion).add(uav.position);
      outLook.copy(uav.position);
      // look slightly ahead of the aircraft so the nose leads the frame
      tmpB.set(24, 0, 0).applyQuaternion(uav.quaternion);
      outLook.add(tmpB);
    } else {
      outPos.set(k.pos![0], k.pos![1], k.pos![2]);
      outLook.set(k.look![0], k.look![1], k.look![2]);
    }
  };

  useFrame((_, delta) => {
    const p = progress.current;
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1]!.p) i++;
    const a = KEYS[i]!;
    const b = KEYS[i + 1]!;
    const t = clamp01((p - a.p) / (b.p - a.p));
    const e = t * t * t * (t * (t * 6 - 15) + 10); // quintic ease

    resolve(a, want, look);
    resolve(b, tmpA, lookNow);
    want.lerp(tmpA, e);
    look.lerp(lookNow, e);

    const cam = camera as THREE.PerspectiveCamera;
    const fov = lerp(a.fov ?? 42, b.fov ?? 42, e);
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = lerp(cam.fov, fov, Math.min(1, delta * 4));
      cam.updateProjectionMatrix();
    }

    if (!init.current) {
      camera.position.copy(want);
      init.current = true;
    } else {
      // light damping only — the scroll value is already smoothed
      camera.position.lerp(want, Math.min(1, delta * 7));
    }
    camera.lookAt(look);
  });
  return null;
}

/** Damps the raw scroll value once per frame; everything else reads the result. */
function Damper({ raw, smooth }: { raw: Progress; smooth: Progress }) {
  useFrame((_, delta) => {
    const k = 1 - Math.pow(0.0018, Math.min(delta, 0.05));
    smooth.current += (raw.current - smooth.current) * k;
  });
  return null;
}

export default function MissionScene({ progress }: { progress: Progress }) {
  const uavRef = useRef<THREE.Group>(null);
  const smooth = useRef<{ current: number }>({ current: progress.current }).current;

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 50, near: 1, far: 4000, position: [-430, 150, 430] }}
      onCreated={({ scene, gl }) => {
        scene.fog = new THREE.FogExp2("#9a8c78", 0.0016);
        gl.setClearColor("#7d6d5c", 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
    >
      <Damper raw={progress} smooth={smooth} />
      <hemisphereLight args={["#9fb6d0", "#3a3427", 1.1]} />
      <directionalLight position={[-600, 180, 340]} intensity={2.1} color="#ffcf9a" />
      <directionalLight position={[420, 220, -400]} intensity={0.45} color="#8fb4ff" />
      <Sky />
      <Terrain />
      <Vegetation />
      <Haze />
      <SensorNodes progress={smooth} />
      <AlertBeam progress={smooth} />
      <FireEvent progress={smooth} />
      <Aircraft progress={smooth} uavRef={uavRef} />
      <Rig progress={smooth} uavRef={uavRef} />
    </Canvas>
  );
}
