import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { lazy } from "react";

const EventHorizon = lazy(() => import("./EventHorizon"));
const EventHorizonGlow = lazy(() => import("./EventHorizonGlow"));
const PhotonSphere = lazy(() => import("./PhotonShpere"));
const ISCORing = lazy(() => import("./ISCORing"));
const GravitationalLensRing = lazy(() => import("./GravitationalLensRing"));
const AccretionDisk = lazy(() => import("./AssertionDisk"));
const RelativisticJets = lazy(() => import("./RelativisticJets"));
const FloatingHearts = lazy(() => import("./FloatingHeats"));
const GeodesicTracer = lazy(() => import("@/components/GeodesicTracer"));
const GravitationalRedshift = lazy(() => import("@/components/GravitationalRedshift"));
const SpaghettificationDemo = lazy(() => import("@/components/SpaghettificationDemo"));
const SpaceshipOrbiter = lazy(() => import("@/components/SpaceshipOrbiter"));
const PhotonTracer = lazy(() => import("@/components/PhotonTracer"));

export interface BlackHoleParams {
  mass: number;
  particleSpeed: number;
  diskRadius: number;
  celebrationMode: boolean;
  innerDiskTemp: number;
  jetLength: number;
  showGravitationalLensing: boolean;
  showPhotonSphere: boolean;
  showISCO: boolean;
  showGeodesicTracer: boolean;
  showRedshift: boolean;
  showSpaghettification: boolean;
  showSpaceship: boolean;
  showPhotonTracer: boolean;
}

export default function BlackHole(props: BlackHoleParams) {
  const {
    mass,
    celebrationMode,
    showGravitationalLensing,
    showPhotonSphere,
    showISCO,
    jetLength,
    showGeodesicTracer,
    showRedshift,
    showSpaghettification,
    showSpaceship,
    showPhotonTracer,
  } = props;
  return (
    <div className="fixed inset-0">
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <color attach="background" args={["#020008"]} />
        <ambientLight intensity={0.05} />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0.2}
          fade
          speed={0.5}
        />
        <EventHorizon mass={mass} />
        <EventHorizonGlow mass={mass} />
        <PhotonSphere mass={mass} visible={showPhotonSphere} />
        <ISCORing mass={mass} visible={showISCO} />
        <GravitationalLensRing mass={mass} visible={showGravitationalLensing} />
        <AccretionDisk {...props} />
        <RelativisticJets mass={mass} jetLength={jetLength} />
        <FloatingHearts active={celebrationMode} />

        {/* Tier 1 */}
        <GeodesicTracer mass={mass} active={showGeodesicTracer} />
        <GravitationalRedshift mass={mass} visible={showRedshift} />
        <SpaghettificationDemo mass={mass} active={showSpaghettification} />

        {/* Tier 2 */}
        <SpaceshipOrbiter mass={mass} active={showSpaceship} />
        <PhotonTracer mass={mass} active={showPhotonTracer} />

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          autoRotate
          autoRotateSpeed={celebrationMode ? 2 : 0.3}
        />
      </Canvas>
    </div>
  );
}
