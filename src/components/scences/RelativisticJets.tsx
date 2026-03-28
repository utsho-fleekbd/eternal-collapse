import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { R_s } from "@/lib/utils";

export default function RelativisticJets({
  mass,
  jetLength,
}: {
  mass: number;
  jetLength: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const count = 600;
  const rs = R_s(mass);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const spread = 0.15 + Math.random() * 0.1;
      const y = Math.random() * jetLength * (i % 2 === 0 ? 1 : -1);
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
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#6699ff"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
