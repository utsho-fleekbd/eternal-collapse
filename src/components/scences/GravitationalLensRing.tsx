import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

import { R_s } from "@/lib/utils";

export default function GravitationalLensRing({
  mass,
  visible,
}: {
  mass: number;
  visible: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const rs = R_s(mass);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x =
        Math.PI / 2 + Math.sin(clock.elapsedTime * 0.2) * 0.05;
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
