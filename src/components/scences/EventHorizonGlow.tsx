import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

import { R_s } from "@/lib/utils";

export default function EventHorizonGlow({ mass }: { mass: number }) {
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
