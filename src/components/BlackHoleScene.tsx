import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { SceneTooltip } from './SceneTooltips';

export interface BlackHoleParams {
  mass: number;
  particleSpeed: number;
  diskRadius: number;
  celebrationMode: boolean;
  innerDiskTemp: number;
  jetLength: number;
  showGravitationalLensing: boolean;
  showPhotonSphere: boolean;
  showISCO: boolean;
}

/* ── Schwarzschild helpers ─────────────────────────────── */
const R_s = (M: number) => 2 * M; // Schwarzschild radius (G=c=1 units, scaled)
const R_photon = (M: number) => 1.5 * R_s(M);
const R_isco = (M: number) => 3 * R_s(M);

/* ── Black Hole Sphere (event horizon) ─────────────────── */
function EventHorizon({ mass }: { mass: number }) {
  const rs = R_s(mass);
  const meshRef = useRef<THREE.Mesh>(null);
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[rs, 64, 64]} />
      <meshBasicMaterial color="#000000" />
    </mesh>
  );
}

/* ── Event Horizon Glow (Hawking-radiation-inspired ring) */
function EventHorizonGlow({ mass }: { mass: number }) {
  const rs = R_s(mass);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1.0 + Math.sin(clock.elapsedTime * 0.5) * 0.015;
      ref.current.scale.set(s, s, s);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[rs * 1.02, 64, 64]} />
      <meshBasicMaterial color="#1a0a00" transparent opacity={0.5} />
    </mesh>
  );
}

/* ── Photon Sphere ─────────────────────────────────────── */
function PhotonSphere({ mass, visible }: { mass: number; visible: boolean }) {
  const rp = R_photon(mass);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.3;
      ref.current.rotation.x = Math.PI / 2 + Math.sin(clock.elapsedTime * 0.15) * 0.03;
    }
  });
  if (!visible) return null;
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[rp, 0.015, 16, 128]} />
      <meshBasicMaterial color="#ffcc00" transparent opacity={0.25} />
    </mesh>
  );
}

/* ── ISCO Ring ─────────────────────────────────────────── */
function ISCORing({ mass, visible }: { mass: number; visible: boolean }) {
  const risco = R_isco(mass);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = Math.PI / 2 + Math.sin(clock.elapsedTime * 0.1) * 0.02;
    }
  });
  if (!visible) return null;
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[risco, 0.012, 16, 128]} />
      <meshBasicMaterial color="#00ccff" transparent opacity={0.2} />
    </mesh>
  );
}

/* ── Gravitational Lensing Ring ────────────────────────── */
function GravitationalLensRing({ mass, visible }: { mass: number; visible: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const rs = R_s(mass);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = Math.PI / 2 + Math.sin(clock.elapsedTime * 0.2) * 0.05;
    }
  });
  if (!visible) return null;
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[rs * 1.3, 0.025, 16, 100]} />
      <meshBasicMaterial color="#ffaa44" transparent opacity={0.15} />
    </mesh>
  );
}

/* ── Accretion Disk ────────────────────────────────────── */
function AccretionDisk({ mass, particleSpeed, diskRadius, celebrationMode, innerDiskTemp }: BlackHoleParams) {
  const count = 4000;
  const pointsRef = useRef<THREE.Points>(null);
  const risco = R_isco(mass);

  const { positions, colors, angles, radii, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const angles = new Float32Array(count);
    const radii = new Float32Array(count);
    const speeds = new Float32Array(count);
    const color = new THREE.Color();
    const innerR = Math.max(risco, diskRadius * 0.5);

    for (let i = 0; i < count; i++) {
      const r = innerR + Math.random() * diskRadius * 2;
      const angle = Math.random() * Math.PI * 2;
      radii[i] = r;
      angles[i] = angle;
      // Keplerian: v ∝ 1/√r
      speeds[i] = (0.3 + Math.random() * 0.2) / Math.sqrt(r / innerR);

      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
      positions[i * 3 + 2] = Math.sin(angle) * r;

      // Blackbody-inspired coloring: hotter near center
      const tempFactor = 1 - (r - innerR) / (diskRadius * 2);
      const temp = innerDiskTemp * tempFactor;
      if (temp > 8000) {
        color.setHSL(0.6, 0.3, 0.7 + Math.random() * 0.2); // blue-white
      } else if (temp > 5000) {
        color.setHSL(0.12, 0.6, 0.6 + Math.random() * 0.2); // yellow-white
      } else if (temp > 3000) {
        color.setHSL(0.08, 0.8, 0.4 + Math.random() * 0.2); // orange
      } else {
        color.setHSL(0.02, 0.7, 0.3 + Math.random() * 0.15); // deep red
      }
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors, angles, radii, speeds };
  }, [count, diskRadius, risco, innerDiskTemp]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;
    const col = geo.attributes.color.array as Float32Array;
    const speedMult = particleSpeed * (celebrationMode ? 2 : 1) * mass;
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      angles[i] += speeds[i] * speedMult * delta;
      const r = radii[i];
      pos[i * 3] = Math.cos(angles[i]) * r;
      pos[i * 3 + 2] = Math.sin(angles[i]) * r;

      if (celebrationMode) {
        const t = angles[i] + Date.now() * 0.001;
        const hue = (Math.sin(t) * 0.05 + 0.95) % 1;
        color.setHSL(hue, 1, 0.6 + Math.sin(t * 3) * 0.2);
        col[i * 3] = color.r;
        col[i * 3 + 1] = color.g;
        col[i * 3 + 2] = color.b;
      }
    }
    geo.attributes.position.needsUpdate = true;
    if (celebrationMode) geo.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={celebrationMode ? 0.06 : 0.04}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Relativistic Jets ─────────────────────────────────── */
function RelativisticJets({ mass, jetLength }: { mass: number; jetLength: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 600;
  const rs = R_s(mass);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const spread = 0.15 + Math.random() * 0.1;
      const y = (Math.random() * jetLength) * (i % 2 === 0 ? 1 : -1);
      const angle = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(angle) * spread * (rs * 0.3);
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(angle) * spread * (rs * 0.3);
    }
    return arr;
  }, [count, jetLength, rs]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      pos[i * 3 + 1] += dir * delta * 3;
      if (Math.abs(pos[i * 3 + 1]) > jetLength) {
        pos[i * 3 + 1] = dir * 0.5;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (jetLength <= 0) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#6699ff" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ── Floating Hearts (celebration) ─────────────────────── */
function FloatingHearts({ active }: { active: boolean }) {
  const count = 50;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current || !active) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += delta * 2;
      if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = -10;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#ff69b4" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ── Main Scene ────────────────────────────────────────── */
export default function BlackHoleScene(props: BlackHoleParams) {
  const { mass, celebrationMode, showGravitationalLensing, showPhotonSphere, showISCO, jetLength } = props;
  return (
    <div className="fixed inset-0">
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <color attach="background" args={['#020008']} />
        <ambientLight intensity={0.05} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.2} fade speed={0.5} />
        <EventHorizon mass={mass} />
        <EventHorizonGlow mass={mass} />
        <PhotonSphere mass={mass} visible={showPhotonSphere} />
        <ISCORing mass={mass} visible={showISCO} />
        <GravitationalLensRing mass={mass} visible={showGravitationalLensing} />
        <AccretionDisk {...props} />
        <RelativisticJets mass={mass} jetLength={jetLength} />
        <FloatingHearts active={celebrationMode} />

        {/* Scene tooltips */}
        <SceneTooltip
          position={[R_s(mass) + 0.3, 0.5, 0]}
          label="Event Horizon"
          description="The boundary beyond which nothing — not even light — can escape. Radius = 2GM/c²."
          color="hsl(0,0%,50%)"
        />
        {showPhotonSphere && (
          <SceneTooltip
            position={[R_photon(mass), 0.8, 0]}
            label="Photon Sphere"
            description="At 1.5× the Schwarzschild radius, photons orbit the black hole in unstable circular orbits."
            color="hsl(50,100%,50%)"
          />
        )}
        {showISCO && (
          <SceneTooltip
            position={[R_isco(mass), 0.8, 0]}
            label="ISCO"
            description="Innermost Stable Circular Orbit (3Rₛ). The last stable orbit before matter plunges inward."
            color="hsl(190,100%,50%)"
          />
        )}
        {jetLength > 0 && (
          <SceneTooltip
            position={[0, jetLength * 0.6, 0]}
            label="Relativistic Jet"
            description="Collimated beams of plasma ejected at near light-speed along the black hole's spin axis."
            color="hsl(220,100%,70%)"
          />
        )}

        <OrbitControls enablePan enableZoom enableRotate autoRotate autoRotateSpeed={celebrationMode ? 2 : 0.3} />
      </Canvas>
    </div>
  );
}
