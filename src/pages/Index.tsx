import { useState, useRef, useEffect, useCallback, lazy } from "react";

import {
  useKeyboardShortcuts,
  ShortcutsHelp,
} from "@/components/KeyboardShortcuts";

const TimeDilationPanel = lazy(() => import("@/components/TimeDilationPanel"));
const DraggableClock = lazy(() => import("@/components/DraggableClock"));
const BlackHole = lazy(() => import("@/components/scences/BlackHole"));
const ControlsHUD = lazy(() => import("@/components/ControlsHUD"));
const CosmicQuiz = lazy(() => import("@/components/CosmicQuiz"));

const DEFAULTS = {
  mass: 0.6,
  particleSpeed: 0.6,
  diskRadius: 4.4,
  innerDiskTemp: 10000,
  jetLength: 15,
};

export default function Index() {
  const [mass, setMass] = useState(DEFAULTS.mass);
  const [particleSpeed, setParticleSpeed] = useState(DEFAULTS.particleSpeed);
  const [diskRadius, setDiskRadius] = useState(DEFAULTS.diskRadius);
  const [innerDiskTemp, setInnerDiskTemp] = useState(DEFAULTS.innerDiskTemp);
  const [jetLength, setJetLength] = useState(DEFAULTS.jetLength);
  const [showGravitationalLensing, setShowGravitationalLensing] = useState(true);
  const [showPhotonSphere, setShowPhotonSphere] = useState(true);
  const [showISCO, setShowISCO] = useState(true);
  const [celebrationMode, setCelebrationMode] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [showTimeDilation, setShowTimeDilation] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showDraggableClock, setShowDraggableClock] = useState(false);

  // Tier 1 & 2 toggles
  const [showGeodesicTracer, setShowGeodesicTracer] = useState(false);
  const [showRedshift, setShowRedshift] = useState(false);
  const [showSpaghettification, setShowSpaghettification] = useState(false);
  const [showSpaceship, setShowSpaceship] = useState(false);
  const [showPhotonTracer, setShowPhotonTracer] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (celebrationMode && !audioRef.current) {
      const audio = new Audio(
        "https://cdn.pixabay.com/audio/2024/11/29/audio_d4b082c581.mp3",
      );
      audio.loop = true;
      audio.volume = 0.3;
      audio.play().catch(() => {});
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [celebrationMode]);

  useEffect(() => {
    const handler = () => setShowShortcutsHelp((v) => !v);
    document.addEventListener("toggle-shortcuts-help", handler);
    return () => document.removeEventListener("toggle-shortcuts-help", handler);
  }, []);

  const resetDefaults = useCallback(() => {
    setMass(DEFAULTS.mass);
    setParticleSpeed(DEFAULTS.particleSpeed);
    setDiskRadius(DEFAULTS.diskRadius);
    setInnerDiskTemp(DEFAULTS.innerDiskTemp);
    setJetLength(DEFAULTS.jetLength);
    setShowGravitationalLensing(true);
    setShowPhotonSphere(true);
    setShowISCO(true);
  }, []);

  useKeyboardShortcuts({
    onToggleControls: () => setControlsCollapsed((v) => !v),
    onToggleTimeDilation: () => setShowTimeDilation((v) => !v),
    onToggleLensing: () => setShowGravitationalLensing((v) => !v),
    onTogglePhotonSphere: () => setShowPhotonSphere((v) => !v),
    onToggleISCO: () => setShowISCO((v) => !v),
    onResetDefaults: resetDefaults,
  });

  return (
    <div className="relative min-h-screen overflow-hidden font-body">
      <BlackHole
        mass={mass}
        particleSpeed={particleSpeed}
        diskRadius={diskRadius}
        celebrationMode={celebrationMode}
        innerDiskTemp={innerDiskTemp}
        jetLength={jetLength}
        showGravitationalLensing={showGravitationalLensing}
        showPhotonSphere={showPhotonSphere}
        showISCO={showISCO}
        showGeodesicTracer={showGeodesicTracer}
        showRedshift={showRedshift}
        showSpaghettification={showSpaghettification}
        showSpaceship={showSpaceship}
        showPhotonTracer={showPhotonTracer}
      />

      <CosmicQuiz onSuccess={() => setCelebrationMode(true)} />

      <TimeDilationPanel mass={mass} visible={showTimeDilation} />
      <DraggableClock mass={mass} visible={showDraggableClock} />
      <ShortcutsHelp visible={showShortcutsHelp} />

      <ControlsHUD
        mass={mass}
        setMass={setMass}
        particleSpeed={particleSpeed}
        setParticleSpeed={setParticleSpeed}
        diskRadius={diskRadius}
        setDiskRadius={setDiskRadius}
        innerDiskTemp={innerDiskTemp}
        setInnerDiskTemp={setInnerDiskTemp}
        jetLength={jetLength}
        setJetLength={setJetLength}
        showGravitationalLensing={showGravitationalLensing}
        setShowGravitationalLensing={setShowGravitationalLensing}
        showPhotonSphere={showPhotonSphere}
        setShowPhotonSphere={setShowPhotonSphere}
        showISCO={showISCO}
        setShowISCO={setShowISCO}
        collapsed={controlsCollapsed}
        setCollapsed={setControlsCollapsed}
        showTimeDilation={showTimeDilation}
        setShowTimeDilation={setShowTimeDilation}
        showDraggableClock={showDraggableClock}
        setShowDraggableClock={setShowDraggableClock}
        showGeodesicTracer={showGeodesicTracer}
        setShowGeodesicTracer={setShowGeodesicTracer}
        showRedshift={showRedshift}
        setShowRedshift={setShowRedshift}
        showSpaghettification={showSpaghettification}
        setShowSpaghettification={setShowSpaghettification}
        showSpaceship={showSpaceship}
        setShowSpaceship={setShowSpaceship}
        showPhotonTracer={showPhotonTracer}
        setShowPhotonTracer={setShowPhotonTracer}
      />

      <div className="fixed bottom-4 left-4 z-30 font-body text-[10px] text-muted-foreground/50">
        Press{" "}
        <kbd className="px-1 py-0.5 rounded bg-muted/50 text-foreground/60 border border-border/30">
          ?
        </kbd>{" "}
        for shortcuts
      </div>
    </div>
  );
}
