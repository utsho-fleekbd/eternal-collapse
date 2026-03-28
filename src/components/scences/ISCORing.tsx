import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

import { R_isco } from "@/lib/utils";

export default function ISCORing({
  mass,
  visible,
}: {
  mass: number;
  visible: boolean;
}) {
  const risco = R_isco(mass);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x =
        Math.PI / 2 + Math.sin(clock.elapsedTime * 0.1) * 0.02;
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
