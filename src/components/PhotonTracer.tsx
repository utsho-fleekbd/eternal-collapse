import { useRef, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface PhotonTracerProps {
  mass: number;
  active: boolean;
}

interface Photon {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  trail: THREE.Vector3[];
  alive: boolean;
  age: number;
  impactParam: number; // b = impact parameter
}

/**
 * Photon Trajectory Shooter
 * Fire light rays at different impact parameters and watch them:
 * - Scatter (b > b_crit)
 * - Orbit (b ≈ b_crit = 3√3 M)
 * - Get captured (b < b_crit)
 */
export default function PhotonTracer({ mass, active }: PhotonTracerProps) {
  const rs = 2 * mass;
  const bCrit = 3 * Math.sqrt(3) * mass; // critical impact parameter
  const [photons, setPhotons] = useState<Photon[]>([]);
  const photonsRef = useRef<Photon[]>([]);
  const nextId = useRef(0);
  const [impactParam, setImpactParam] = useState(bCrit);

  const firePhoton = useCallback(() => {
    const b = impactParam;
    // Start from far right, moving left
    const startX = 15;
    const startY = b; // offset = impact parameter
    const pos = new THREE.Vector3(startX, 0, startY);
    const vel = new THREE.Vector3(-1.5, 0, 0); // moving in -x direction

    const photon: Photon = {
      id: nextId.current++,
      position: pos,
      velocity: vel,
      trail: [pos.clone()],
      alive: true,
      age: 0,
      impactParam: b,
    };

    photonsRef.current.push(photon);
    setPhotons([...photonsRef.current]);
  }, [impactParam]);

  const fireSpread = useCallback(() => {
    // Fire multiple photons at different impact parameters
    const params = [
      bCrit * 0.5,
      bCrit * 0.8,
      bCrit * 0.95,
      bCrit,
      bCrit * 1.05,
      bCrit * 1.2,
      bCrit * 1.5,
    ];
    params.forEach((b) => {
      const pos = new THREE.Vector3(15, 0, b);
      const vel = new THREE.Vector3(-1.5, 0, 0);
      photonsRef.current.push({
        id: nextId.current++,
        position: pos,
        velocity: vel,
        trail: [pos.clone()],
        alive: true,
        age: 0,
        impactParam: b,
      });
    });
    setPhotons([...photonsRef.current]);
  }, [bCrit]);

  const clearAll = useCallback(() => {
    photonsRef.current = [];
    setPhotons([]);
  }, []);

  useFrame((_, delta) => {
    if (!active) return;
    const dt = Math.min(delta, 0.03);
    let changed = false;

    for (const p of photonsRef.current) {
      if (!p.alive) continue;
      p.age += dt;

      const r = p.position.length();
      if (r < rs * 1.05 || p.age > 25 || r > 30) {
        p.alive = false;
        changed = true;
        continue;
      }

      // Gravity with relativistic correction
      const rDir = p.position.clone().normalize();
      const accelMag = (mass / (r * r)) * (1 + 3 * rs / r);
      const accel = rDir.multiplyScalar(-accelMag);

      p.velocity.add(accel.multiplyScalar(dt));
      // Keep photon at constant speed (speed of light = 1.5 in our units)
      p.velocity.normalize().multiplyScalar(1.5);
      p.position.add(p.velocity.clone().multiplyScalar(dt));

      if (p.trail.length > 300) p.trail.shift();
      p.trail.push(p.position.clone());
      changed = true;
    }

    photonsRef.current = photonsRef.current.filter(
      (p) => p.alive || p.age < 3,
    );

    if (changed) setPhotons([...photonsRef.current]);
  });

  if (!active) return null;

  return (
    <group>
      {/* Photon trails */}
      {photons.map((p) => {
        if (p.trail.length < 2) return null;
        const geo = new THREE.BufferGeometry().setFromPoints(p.trail);
        // Color based on fate: captured = red, scattered = green, critical = gold
        const ratio = p.impactParam / bCrit;
        const hue = ratio < 0.95 ? 0 : ratio > 1.05 ? 120 : 45;
        const color = new THREE.Color(`hsl(${hue}, 90%, 60%)`);

        return (
          <group key={p.id}>
            {p.alive && (
              <mesh position={p.position}>
                <sphereGeometry args={[0.05, 6, 6]} />
                <meshBasicMaterial color={color} />
              </mesh>
            )}
            <line geometry={geo}>
              <lineBasicMaterial
                color={color}
                transparent
                opacity={p.alive ? 0.8 : 0.3}
              />
            </line>
          </group>
        );
      })}

      {/* Critical impact parameter ring */}
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[bCrit - 0.02, bCrit + 0.02, 64]} />
        <meshBasicMaterial
          color="hsl(45, 90%, 50%)"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Controls */}
      <Html position={[12, -4, 0]} center>
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-xl p-3 min-w-[200px] select-none">
          <p className="font-body text-[10px] text-accent text-center mb-2 font-semibold">
            💡 Photon Trajectory Shooter
          </p>
          <label className="font-body text-[9px] text-muted-foreground flex justify-between mb-1">
            <span>Impact Parameter (b)</span>
            <span className="text-foreground">{impactParam.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={0.5}
            max={bCrit * 2}
            step={0.05}
            value={impactParam}
            onChange={(e) => setImpactParam(Number(e.target.value))}
            className="w-full accent-accent mb-1"
          />
          <p className="font-body text-[8px] text-muted-foreground/60 mb-2">
            b_crit = 3√3 M = {bCrit.toFixed(2)} (gold ring)
          </p>
          <div className="flex gap-1.5 mb-1.5">
            <button
              onClick={firePhoton}
              className="flex-1 px-2 py-1 rounded-lg border border-accent/50 text-[9px] font-body text-accent hover:bg-accent/10 transition-colors"
            >
              Fire One
            </button>
            <button
              onClick={fireSpread}
              className="flex-1 px-2 py-1 rounded-lg border border-accent/50 text-[9px] font-body text-accent hover:bg-accent/10 transition-colors"
            >
              Fire Spread
            </button>
          </div>
          <button
            onClick={clearAll}
            className="w-full px-2 py-1 rounded-lg border border-border text-[9px] font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear All
          </button>
          <div className="mt-2 font-body text-[8px] text-muted-foreground/60 space-y-0.5">
            <p>
              <span className="text-red-400">●</span> b {"<"} b_crit → captured
            </p>
            <p>
              <span className="text-yellow-400">●</span> b ≈ b_crit → orbits
            </p>
            <p>
              <span className="text-green-400">●</span> b {">"} b_crit →
              scattered
            </p>
          </div>
        </div>
      </Html>
    </group>
  );
}
