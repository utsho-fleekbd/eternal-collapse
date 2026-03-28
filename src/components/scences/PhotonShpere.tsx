import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

import { R_photon } from "@/lib/utils";

export default function PhotonSphere({
  mass,
  visible,
}: {
  mass: number;
  visible: boolean;
}) {
  const rp = R_photon(mass);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.3;
      ref.current.rotation.x =
        Math.PI / 2 + Math.sin(clock.elapsedTime * 0.15) * 0.03;
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
