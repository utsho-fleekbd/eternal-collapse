import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { BlackHoleParams } from "./BlackHole";
import { R_isco } from "@/lib/utils";

export default function AccretionDisk({
  mass,
  particleSpeed,
  diskRadius,
  celebrationMode,
  innerDiskTemp,
}: BlackHoleParams) {
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
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
          itemSize={3}
        />
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
