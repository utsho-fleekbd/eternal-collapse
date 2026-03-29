import { useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface GravitationalRedshiftProps {
  mass: number;
  visible: boolean;
}

/**
 * Gravitational Redshift Visualization
 * Shows how light wavelength stretches as it climbs out of a gravity well.
 * λ_obs/λ_emit = 1/√(1 - Rₛ/r)
 * Displays colored rings at various radii showing the observed color shift.
 */
export default function GravitationalRedshift({
  mass,
  visible,
}: GravitationalRedshiftProps) {
  const rs = 2 * mass;

  const rings = useMemo(() => {
    const radii = [
      { r: 1.5, label: "1.5 Rₛ" },
      { r: 2, label: "2 Rₛ" },
      { r: 3, label: "3 Rₛ" },
      { r: 5, label: "5 Rₛ" },
      { r: 8, label: "8 Rₛ" },
    ];

    return radii.map(({ r, label }) => {
      const actualR = r * rs;
      // Redshift factor z = 1/√(1 - Rs/r) - 1
      const z = actualR > rs ? 1 / Math.sqrt(1 - rs / actualR) - 1 : Infinity;

      // Map emitted blue light (450nm) to observed wavelength
      const emittedWavelength = 450; // nm (blue)
      const observedWavelength = emittedWavelength * (1 + z);

      // Convert wavelength to color
      const color = wavelengthToColor(observedWavelength);

      return { r: actualR, label, z, observedWavelength, color };
    });
  }, [rs]);

  if (!visible) return null;

  return (
    <group>
      {rings.map((ring, i) => (
        <group key={i}>
          <mesh rotation-x={Math.PI / 2}>
            <ringGeometry args={[ring.r - 0.03, ring.r + 0.03, 64]} />
            <meshBasicMaterial
              color={new THREE.Color(ring.color)}
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Html
            position={[ring.r + 0.3, 0.4, 0]}
            center
            style={{ pointerEvents: "none" }}
          >
            <div className="whitespace-nowrap font-body text-[8px] text-foreground/80 bg-card/70 backdrop-blur-sm px-1.5 py-0.5 rounded border border-border/30">
              <span style={{ color: ring.color }}>●</span> {ring.label} — z={ring.z.toFixed(2)} — {Math.round(ring.observedWavelength)}nm
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

/** Convert wavelength (nm) to hex color string. Rough visible spectrum mapping. */
function wavelengthToColor(wavelength: number): string {
  let r = 0, g = 0, b = 0;

  if (wavelength < 380) {
    // UV — show as deep violet
    r = 0.4; g = 0; b = 0.6;
  } else if (wavelength < 440) {
    r = -(wavelength - 440) / 60;
    g = 0;
    b = 1;
  } else if (wavelength < 490) {
    r = 0;
    g = (wavelength - 440) / 50;
    b = 1;
  } else if (wavelength < 510) {
    r = 0;
    g = 1;
    b = -(wavelength - 510) / 20;
  } else if (wavelength < 580) {
    r = (wavelength - 510) / 70;
    g = 1;
    b = 0;
  } else if (wavelength < 645) {
    r = 1;
    g = -(wavelength - 645) / 65;
    b = 0;
  } else if (wavelength <= 780) {
    r = 1;
    g = 0;
    b = 0;
  } else {
    // Infrared — deep red
    r = 0.5;
    g = 0;
    b = 0;
  }

  // Intensity falloff at edges
  let factor = 1;
  if (wavelength < 420) factor = 0.3 + 0.7 * (wavelength - 380) / 40;
  else if (wavelength > 700) factor = 0.3 + 0.7 * (780 - wavelength) / 80;

  const toHex = (c: number) => {
    const val = Math.round(Math.min(1, c * factor) * 255);
    return val.toString(16).padStart(2, "0");
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
