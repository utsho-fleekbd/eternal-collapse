import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface SpaghettificationDemoProps {
  mass: number;
  active: boolean;
}

/**
 * Spaghettification Demo
 * Drops an object toward the black hole, showing tidal stretching.
 * Tidal acceleration: ΔF ∝ 2GM·Δr/r³
 * The object stretches vertically and compresses horizontally.
 */
export default function SpaghettificationDemo({
  mass,
  active,
}: SpaghettificationDemoProps) {
  const rs = 2 * mass;
  const meshRef = useRef<THREE.Mesh>(null);
  const [dropping, setDropping] = useState(false);
  const [radius, setRadius] = useState(12);
  const [velocity, setVelocity] = useState(0);
  const [stretch, setStretch] = useState(1);

  const reset = () => {
    setRadius(12);
    setVelocity(0);
    setStretch(1);
    setDropping(false);
  };

  useFrame((_, delta) => {
    if (!active || !dropping) return;
    const dt = Math.min(delta, 0.03);

    // Gravitational acceleration
    const r = radius;
    if (r <= rs * 1.05) {
      reset();
      return;
    }

    const accel = mass / (r * r);
    const newVel = velocity + accel * dt * 2;
    const newR = r - newVel * dt;
    setVelocity(newVel);
    setRadius(Math.max(rs * 1.05, newR));

    // Tidal stretching: proportional to 2GM/r³
    // Normalized so it's visible
    const tidalForce = (2 * mass) / (newR * newR * newR);
    const stretchFactor = 1 + tidalForce * 50; // exaggerated for visualization
    const compressFactor = 1 / Math.sqrt(stretchFactor);
    setStretch(stretchFactor);

    if (meshRef.current) {
      meshRef.current.scale.set(
        compressFactor,
        Math.min(stretchFactor, 8),
        compressFactor,
      );
      meshRef.current.position.set(newR, 0, 0);
    }
  });

  if (!active) return null;

  const tidalForce = (2 * mass) / (radius * radius * radius);

  return (
    <group>
      {/* The object being spaghettified */}
      <mesh ref={meshRef} position={[radius, 0, 0]}>
        <capsuleGeometry args={[0.15, 0.4, 8, 16]} />
        <meshStandardMaterial
          color="hsl(200, 80%, 60%)"
          emissive="hsl(200, 80%, 30%)"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Controls */}
      <Html position={[0, -5, 0]} center>
        <div className="flex flex-col items-center gap-2 select-none">
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-xl p-3 min-w-[200px]">
            <p className="font-body text-[10px] text-muted-foreground text-center mb-2">
              Spaghettification Demo
            </p>
            <div className="font-body text-[9px] text-foreground/70 space-y-0.5 mb-2">
              <p>
                r = {radius.toFixed(2)} | Stretch: {stretch.toFixed(2)}×
              </p>
              <p>Tidal: ΔF ∝ {tidalForce.toFixed(4)}</p>
            </div>
            <div className="flex gap-2">
              {!dropping ? (
                <button
                  onClick={() => setDropping(true)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-primary/50 text-[10px] font-body text-primary hover:bg-primary/10 transition-colors"
                >
                  Drop Object
                </button>
              ) : (
                <button
                  onClick={reset}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-destructive/50 text-[10px] font-body text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
