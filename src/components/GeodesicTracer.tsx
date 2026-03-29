import { useRef, useMemo, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface GeodesicTracerProps {
  mass: number;
  active: boolean;
}

interface Particle {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  trail: THREE.Vector3[];
  alive: boolean;
  type: "timelike" | "lightlike";
  age: number;
}

/**
 * Geodesic Particle Tracer
 * Launches test particles that follow Schwarzschild geodesics.
 * Uses Newtonian approximation with relativistic corrections for visualization.
 * F = -GM/r² with effective potential: V_eff = -M/r + L²/(2r²) - ML²/r³
 */
export default function GeodesicTracer({ mass, active }: GeodesicTracerProps) {
  const rs = 2 * mass;
  const particlesRef = useRef<Particle[]>([]);
  const trailMeshRefs = useRef<Map<number, THREE.BufferGeometry>>(new Map());
  const nextId = useRef(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  const launchParticle = useCallback(
    (type: "timelike" | "lightlike") => {
      const angle = Math.random() * Math.PI * 2;
      const startR = 8 + Math.random() * 4;
      const pos = new THREE.Vector3(
        Math.cos(angle) * startR,
        (Math.random() - 0.5) * 0.5,
        Math.sin(angle) * startR,
      );

      // Tangential velocity for interesting orbits
      const speed = type === "lightlike" ? 1.2 : 0.3 + Math.random() * 0.4;
      const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));
      // Add slight radial component for non-circular orbits
      const radial = new THREE.Vector3(
        -Math.cos(angle),
        0,
        -Math.sin(angle),
      ).multiplyScalar(0.1 * (Math.random() - 0.3));
      const vel = tangent.multiplyScalar(speed).add(radial);

      const particle: Particle = {
        id: nextId.current++,
        position: pos,
        velocity: vel,
        trail: [pos.clone()],
        alive: true,
        type,
        age: 0,
      };

      particlesRef.current.push(particle);
      setParticles([...particlesRef.current]);
    },
    [],
  );

  useFrame((_, delta) => {
    if (!active) return;
    const dt = Math.min(delta, 0.05);
    let changed = false;

    for (const p of particlesRef.current) {
      if (!p.alive) continue;
      p.age += dt;

      // Kill old particles or captured ones
      const r = p.position.length();
      if (r < rs * 1.05 || p.age > 30 || r > 50) {
        p.alive = false;
        changed = true;
        continue;
      }

      // Schwarzschild-like gravity: a = -GM/r² * r̂
      // With pseudo-relativistic correction near rs
      const rDir = p.position.clone().normalize();
      const GM = mass;
      const accelMag = GM / (r * r) * (1 + 3 * rs / r); // relativistic boost near horizon
      const accel = rDir.multiplyScalar(-accelMag);

      // Velocity Verlet integration
      p.velocity.add(accel.multiplyScalar(dt));
      p.position.add(p.velocity.clone().multiplyScalar(dt));

      // Store trail
      if (p.trail.length > 200) p.trail.shift();
      p.trail.push(p.position.clone());
      changed = true;
    }

    // Cleanup dead particles older than 2s
    const before = particlesRef.current.length;
    particlesRef.current = particlesRef.current.filter(
      (p) => p.alive || p.age < 2,
    );
    if (particlesRef.current.length !== before) changed = true;

    if (changed) {
      setParticles([...particlesRef.current]);
    }
  });

  if (!active) return null;

  return (
    <group>
      {/* Launch button in 3D space */}
      <Html position={[0, 6, 0]} center>
        <div className="flex gap-2 select-none">
          <button
            onClick={() => launchParticle("timelike")}
            className="px-3 py-1.5 rounded-lg bg-card/90 border border-border text-[10px] font-body text-primary hover:bg-muted/70 backdrop-blur-sm transition-colors"
          >
            🚀 Launch Particle
          </button>
          <button
            onClick={() => launchParticle("lightlike")}
            className="px-3 py-1.5 rounded-lg bg-card/90 border border-border text-[10px] font-body text-accent hover:bg-muted/70 backdrop-blur-sm transition-colors"
          >
            💡 Launch Photon
          </button>
        </div>
      </Html>

      {/* Render particles and trails */}
      {particles.map((p) => (
        <ParticleTrail key={p.id} particle={p} rs={rs} />
      ))}
    </group>
  );
}

function ParticleTrail({
  particle,
  rs,
}: {
  particle: Particle;
  rs: number;
}) {
  const points = useMemo(() => particle.trail, [particle.trail]);

  const lineGeometry = useMemo(() => {
    if (points.length < 2) return null;
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  const color =
    particle.type === "lightlike"
      ? new THREE.Color("hsl(45, 100%, 70%)")
      : new THREE.Color("hsl(200, 80%, 60%)");

  const fadeColor = particle.alive ? 1 : Math.max(0, 1 - (particle.age - 28) / 2);

  return (
    <group>
      {/* Particle head */}
      {particle.alive && (
        <mesh position={particle.position}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
      {/* Trail */}
      {lineGeometry && (
        <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 * fadeColor }))} />
      )}
    </group>
  );
}
