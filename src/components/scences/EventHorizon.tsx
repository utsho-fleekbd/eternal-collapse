import * as THREE from "three";
import { useRef } from "react";

import { R_s } from "@/lib/utils";

export default function EventHorizon({ mass }: { mass: number }) {
  const rs = R_s(mass);
  const meshRef = useRef<THREE.Mesh>(null);
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[rs, 64, 64]} />
      <meshBasicMaterial color="#000000" />
    </mesh>
  );
}
