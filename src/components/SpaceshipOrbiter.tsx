import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface SpaceshipOrbiterProps {
  mass: number;
  active: boolean;
}

/**
 * Spaceship Orbiter
 * A small spaceship orbiting at a user-chosen radius.
 * Shows live proper time vs coordinate time comparison.
 * v_orbital = √(GM/r), τ/t = √(1 - Rₛ/r - v²/c²)
 */
export default function SpaceshipOrbiter({
  mass,
  active,
}: SpaceshipOrbiterProps) {
  const rs = 2 * mass;
  const groupRef = useRef<THREE.Group>(null);
  const [orbitRadius, setOrbitRadius] = useState(5);
  const [angle, setAngle] = useState(0);
  const [properTime, setProperTime] = useState(0);
  const [coordinateTime, setCoordinateTime] = useState(0);
  const [orbiting, setOrbiting] = useState(true);

  const r = orbitRadius * rs;
  const dilationFactor =
    r > rs ? Math.sqrt(Math.max(0, 1 - rs / r)) : 0;

  useFrame((_, delta) => {
    if (!active || !orbiting) return;
    const dt = Math.min(delta, 0.05);

    // Orbital angular velocity: ω = √(GM/r³)
    const omega = Math.sqrt(mass / (r * r * r)) * 3;
    const newAngle = angle + omega * dt;
    setAngle(newAngle);

    // Update time
    setCoordinateTime((t) => t + dt);
    setProperTime((t) => t + dt * dilationFactor);

    if (groupRef.current) {
      groupRef.current.position.set(
        Math.cos(newAngle) * r,
        0,
        Math.sin(newAngle) * r,
      );
      groupRef.current.rotation.y = -newAngle + Math.PI / 2;
    }
  });

  const resetTimes = () => {
    setProperTime(0);
    setCoordinateTime(0);
  };

  if (!active) return null;

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    const ms = Math.floor((t % 1) * 10);
    return `${m}:${s.toString().padStart(2, "0")}.${ms}`;
  };

  return (
    <group>
      {/* Orbit path */}
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[r - 0.02, r + 0.02, 64]} />
        <meshBasicMaterial
          color="hsl(200, 60%, 40%)"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Spaceship */}
      <group ref={groupRef} position={[r, 0, 0]}>
        {/* Simple spaceship shape */}
        <mesh>
          <coneGeometry args={[0.12, 0.4, 6]} />
          <meshStandardMaterial
            color="hsl(200, 80%, 70%)"
            emissive="hsl(200, 80%, 40%)"
            emissiveIntensity={0.8}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Engine glow */}
        <mesh position={[0, -0.25, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="hsl(30, 100%, 60%)" />
        </mesh>

        {/* Live readout above ship */}
        <Html position={[0, 0.8, 0]} center style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg px-2 py-1 font-body text-[8px]">
            <div className="text-primary">τ = {formatTime(properTime)}</div>
            <div className="text-muted-foreground">
              t = {formatTime(coordinateTime)}
            </div>
          </div>
        </Html>
      </group>

      {/* Controls panel */}
      <Html position={[0, -6.5, 0]} center>
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-xl p-3 min-w-[220px] select-none">
          <p className="font-body text-[10px] text-primary text-center mb-2 font-semibold">
            🛸 Spaceship Orbiter
          </p>
          <label className="font-body text-[9px] text-muted-foreground flex justify-between mb-1">
            <span>Orbit Radius</span>
            <span className="text-foreground">{orbitRadius.toFixed(1)} Rₛ</span>
          </label>
          <input
            type="range"
            min={1.6}
            max={15}
            step={0.1}
            value={orbitRadius}
            onChange={(e) => setOrbitRadius(Number(e.target.value))}
            className="w-full accent-primary mb-2"
          />
          <div className="grid grid-cols-2 gap-1 font-body text-[9px] mb-2">
            <div className="bg-muted/50 rounded p-1.5">
              <div className="text-muted-foreground">τ/t ratio</div>
              <div className="text-foreground font-semibold">
                {dilationFactor.toFixed(4)}
              </div>
            </div>
            <div className="bg-muted/50 rounded p-1.5">
              <div className="text-muted-foreground">Time lost</div>
              <div className="text-foreground font-semibold">
                {(coordinateTime - properTime).toFixed(1)}s
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setOrbiting(!orbiting)}
              className="flex-1 px-2 py-1 rounded-lg border border-border text-[9px] font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              {orbiting ? "Pause" : "Resume"}
            </button>
            <button
              onClick={resetTimes}
              className="flex-1 px-2 py-1 rounded-lg border border-border text-[9px] font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset Clocks
            </button>
          </div>
        </div>
      </Html>
    </group>
  );
}
