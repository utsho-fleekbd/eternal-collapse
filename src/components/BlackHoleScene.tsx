import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface BlackHoleSceneProps {
  mass: number;
  particleSpeed: number;
  diskRadius: number;
  celebrationMode: boolean;
}

function BlackHoleSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial color="#000000" />
    </mesh>
  );
}

function EventHorizonGlow() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1.05 + Math.sin(clock.elapsedTime * 0.5) * 0.02;
      ref.current.scale.set(s, s, s);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.1, 64, 64]} />
      <meshBasicMaterial color="#1a0020" transparent opacity={0.6} />
    </mesh>
  );
}

function AccretionDisk({ mass, particleSpeed, diskRadius, celebrationMode }: BlackHoleSceneProps) {
  const count = 3000;
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors, angles, radii, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const angles = new Float32Array(count);
    const radii = new Float32Array(count);
    const speeds = new Float32Array(count);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const r = diskRadius + Math.random() * diskRadius * 1.5;
      const angle = Math.random() * Math.PI * 2;
      radii[i] = r;
      angles[i] = angle;
      // Schwarzschild-inspired: speed ~ 1/sqrt(r)
      speeds[i] = (0.3 + Math.random() * 0.3) / Math.sqrt(r / diskRadius);

      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 2] = Math.sin(angle) * r;

      const hue = 0.9 + Math.random() * 0.1; // pink-purple range
      color.setHSL(hue, 0.8, 0.5 + Math.random() * 0.3);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors, angles, radii, speeds };
  }, [count, diskRadius]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;
    const col = geo.attributes.color.array as Float32Array;
    const speedMult = particleSpeed * (celebrationMode ? 2.5 : 1) * mass;
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      angles[i] += speeds[i] * speedMult * delta;
      const r = radii[i];
      pos[i * 3] = Math.cos(angles[i]) * r;
      pos[i * 3 + 2] = Math.sin(angles[i]) * r;

      if (celebrationMode) {
        // Heart-like pulsing colors
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
        size={celebrationMode ? 0.08 : 0.05}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

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

function GravitationalLensRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = Math.PI / 2 + Math.sin(clock.elapsedTime * 0.2) * 0.05;
    }
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.6, 0.02, 16, 100]} />
      <meshBasicMaterial color="#8b5cf6" transparent opacity={0.3} />
    </mesh>
  );
}

export default function BlackHoleScene({ mass, particleSpeed, diskRadius, celebrationMode }: BlackHoleSceneProps) {
  return (
    <div className="fixed inset-0">
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <color attach="background" args={['#050010']} />
        <ambientLight intensity={0.1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade speed={1} />
        <BlackHoleSphere />
        <EventHorizonGlow />
        <GravitationalLensRing />
        <AccretionDisk mass={mass} particleSpeed={particleSpeed} diskRadius={diskRadius} celebrationMode={celebrationMode} />
        <FloatingHearts active={celebrationMode} />
        <OrbitControls enablePan enableZoom enableRotate autoRotate autoRotateSpeed={celebrationMode ? 2 : 0.5} />
      </Canvas>
    </div>
  );
}
