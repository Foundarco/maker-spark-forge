import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, Color, DoubleSide, Group, MathUtils, Mesh, Vector3 } from "three";

type SceneProps = {
  progress: MutableRefObject<number>;
  active: MutableRefObject<boolean>;
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const range = (value: number, start: number, end: number) => clamp((value - start) / (end - start));

function Aircraft({ progress, active }: SceneProps) {
  const aircraft = useRef<Group>(null);
  const propeller = useRef<Group>(null);
  const gimbal = useRef<Group>(null);
  const portLight = useRef<Mesh>(null);
  const starboardLight = useRef<Mesh>(null);
  const route = useMemo(
    () =>
      new CatmullRomCurve3(
        [
          new Vector3(-3.8, 1.35, -2),
          new Vector3(-2.4, 0.5, 0),
          new Vector3(1.2, 0.9, 0.5),
          new Vector3(3.4, 1.45, -0.2),
          new Vector3(1.2, -0.2, 0.8),
          new Vector3(-2.4, 0.2, 0.2),
          new Vector3(0.4, 0.8, 1),
          new Vector3(3.1, 0.15, 0),
          new Vector3(0.8, -0.7, 1.5),
          new Vector3(-1.7, 0.5, 0.5),
          new Vector3(0, 0.15, 2.4),
        ],
        false,
        "catmullrom",
        0.55,
      ),
    [],
  );

  useFrame((state, delta) => {
    if (!active.current || !aircraft.current) return;
    const p = clamp(progress.current);
    const point = route.getPointAt(p);
    const ahead = route.getPointAt(Math.min(1, p + 0.012));
    const direction = ahead.clone().sub(point).normalize();
    const bank = clamp(direction.y * -1.5 + Math.sin(p * 45) * 0.04, -0.42, 0.42);
    const opsMiniature = range(p, 0.36, 0.43) * (1 - range(p, 0.50, 0.57));
    const investigation = range(p, 0.68, 0.76) * (1 - range(p, 0.88, 0.94));
    const scale = MathUtils.lerp(0.28, 0.44, Math.sin(p * Math.PI)) * (1 - opsMiniature * 0.38) * (1 - investigation * 0.22);

    aircraft.current.position.lerp(point, 1 - Math.pow(0.00002, delta));
    aircraft.current.rotation.y = MathUtils.damp(aircraft.current.rotation.y, Math.atan2(direction.x, direction.z), 6, delta);
    aircraft.current.rotation.z = MathUtils.damp(aircraft.current.rotation.z, bank, 5, delta);
    aircraft.current.rotation.x = MathUtils.damp(aircraft.current.rotation.x, -direction.y * 0.34, 5, delta);
    aircraft.current.scale.setScalar(MathUtils.damp(aircraft.current.scale.x, scale, 5, delta));
    aircraft.current.position.y += Math.sin(state.clock.elapsedTime * 2.1) * 0.018;

    if (propeller.current) propeller.current.rotation.z -= delta * (38 + p * 34);
    if (gimbal.current) {
      gimbal.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.24;
      gimbal.current.rotation.x = -0.25 + investigation * 0.55;
    }
    const pulse = 1.2 + Math.sin(state.clock.elapsedTime * 8) * 0.7;
    if (portLight.current) portLight.current.scale.setScalar(pulse);
    if (starboardLight.current) starboardLight.current.scale.setScalar(pulse);

    const thermal = range(p, 0.79, 0.86) * (1 - range(p, 0.91, 0.96));
    state.scene.background = null;
    state.scene.fog?.color.lerpColors(new Color("#9cc9e8"), new Color("#2a092a"), thermal);
  });

  return (
    <group ref={aircraft} position={[-3.8, 1.35, -2]} rotation={[0, Math.PI / 2, 0]}>
      {/* aerodynamic fuselage */}
      <mesh castShadow rotation={[0, 0, Math.PI / 2]} scale={[1, 0.84, 0.78]}>
        <capsuleGeometry args={[0.34, 2.45, 12, 28]} />
        <meshStandardMaterial color="#e7ebed" metalness={0.56} roughness={0.26} />
      </mesh>
      <mesh position={[1.48, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.34, 0.72, 32]} />
        <meshStandardMaterial color="#d9dee1" metalness={0.5} roughness={0.25} />
      </mesh>
      <mesh position={[0.25, 0.12, -0.3]} scale={[0.85, 0.22, 0.12]}>
        <sphereGeometry args={[1, 28, 16]} />
        <meshPhysicalMaterial color="#18242c" metalness={0.7} roughness={0.18} clearcoat={1} />
      </mesh>

      {/* high-aspect wing, center fairing, ailerons */}
      <mesh position={[-0.05, 0.04, 0]} rotation={[0.04, 0, 0]} scale={[0.9, 0.075, 4.1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f0f2f2" metalness={0.42} roughness={0.3} />
      </mesh>
      <mesh position={[-0.42, 0.005, 0]} rotation={[0.04, 0, 0]} scale={[0.5, 0.035, 3.6]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#aeb8bd" metalness={0.5} roughness={0.34} />
      </mesh>
      <mesh position={[-1.14, 0.08, 0]} scale={[0.62, 0.075, 1.52]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#e9eded" metalness={0.44} roughness={0.28} />
      </mesh>
      <mesh position={[-1.35, 0.46, 0]} scale={[0.62, 0.72, 0.075]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#d7dcdf" metalness={0.45} roughness={0.3} />
      </mesh>

      {/* rear pusher motor and blurred propeller disc */}
      <mesh position={[-1.53, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.25, 0.42, 24]} />
        <meshStandardMaterial color="#59646a" metalness={0.9} roughness={0.18} />
      </mesh>
      <group ref={propeller} position={[-1.78, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh scale={[0.06, 1.25, 0.12]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#263238" metalness={0.65} roughness={0.25} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} scale={[0.06, 1.25, 0.12]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#263238" metalness={0.65} roughness={0.25} />
        </mesh>
        <mesh>
          <circleGeometry args={[1.28, 48]} />
          <meshBasicMaterial color="#d6edf7" transparent opacity={0.06} side={DoubleSide} depthWrite={false} />
        </mesh>
      </group>

      {/* stabilized RGB / thermal payload */}
      <group ref={gimbal} position={[0.74, -0.38, 0]}>
        <mesh>
          <sphereGeometry args={[0.27, 32, 20]} />
          <meshStandardMaterial color="#c8ced1" metalness={0.75} roughness={0.2} />
        </mesh>
        <mesh position={[0.2, -0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.095, 0.12, 0.12, 24]} />
          <meshPhysicalMaterial color="#101b22" metalness={0.55} roughness={0.12} clearcoat={1} />
        </mesh>
      </group>

      <mesh ref={portLight} position={[0, 0.08, 4.12]}>
        <sphereGeometry args={[0.045, 12, 8]} />
        <meshBasicMaterial color="#36f0a0" toneMapped={false} />
      </mesh>
      <mesh ref={starboardLight} position={[0, 0.08, -4.12]}>
        <sphereGeometry args={[0.045, 12, 8]} />
        <meshBasicMaterial color="#ff4d32" toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function MissionAircraftScene(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.2, 10], fov: 37, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      shadows={false}
      frameloop="always"
    >
      <fog attach="fog" args={["#9cc9e8", 12, 32]} />
      <ambientLight intensity={1.8} color="#cfe9ff" />
      <directionalLight position={[5, 8, 6]} intensity={4.2} color="#fff2d0" />
      <directionalLight position={[-4, 1, 5]} intensity={2.5} color="#5ab6f2" />
      <Aircraft {...props} />
    </Canvas>
  );
}