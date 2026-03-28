import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ControlsHUDProps {
  mass: number;
  setMass: (v: number) => void;
  particleSpeed: number;
  setParticleSpeed: (v: number) => void;
  diskRadius: number;
  setDiskRadius: (v: number) => void;
  innerDiskTemp: number;
  setInnerDiskTemp: (v: number) => void;
  jetLength: number;
  setJetLength: (v: number) => void;
  showGravitationalLensing: boolean;
  setShowGravitationalLensing: (v: boolean) => void;
  showPhotonSphere: boolean;
  setShowPhotonSphere: (v: boolean) => void;
  showISCO: boolean;
  setShowISCO: (v: boolean) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  showTimeDilation: boolean;
  setShowTimeDilation: (v: boolean) => void;
}

const Rs = (M: number) => (2 * M).toFixed(2);
const Rp = (M: number) => (3 * M).toFixed(2);
const Risco = (M: number) => (6 * M).toFixed(2);

const sliderTooltips: Record<string, string> = {
  'Black Hole Mass (M)': 'Mass in solar masses (M☉). Determines the Schwarzschild radius, photon sphere, and ISCO. Higher mass = stronger gravity.',
  'Orbital Speed': 'Multiplier for particle orbital velocity. Real accretion disks follow Keplerian orbits (v ∝ 1/√r).',
  'Disk Outer Radius': 'Outer edge of the accretion disk in gravitational radii. Material beyond this radius has not yet fallen inward.',
  'Inner Disk Temp': 'Temperature of the innermost disk region in Kelvin. Determines blackbody radiation color — hotter regions glow blue-white, cooler ones glow red.',
  'Jet Length': 'Length of relativistic jets ejected along the spin axis. Powered by magnetic fields threading the ergosphere.',
};

const toggleTooltips: Record<string, string> = {
  'Gravitational Lensing Ring': 'Simulates the Einstein ring — light from behind the black hole bent around it by spacetime curvature.',
  'Photon Sphere (1.5 Rₛ)': 'At r = 1.5 Rₛ, photons can orbit the black hole. Any closer and light spirals inward.',
  'ISCO (3 Rₛ)': 'Innermost Stable Circular Orbit — the closest stable orbit for matter. Inside this, particles plunge into the event horizon.',
  'Time Dilation Panel': 'Shows gravitational time dilation τ/t = √(1 − Rₛ/r) at various radii. Clocks tick slower near the event horizon.',
};

export default function ControlsHUD(props: ControlsHUDProps) {
  const {
    mass, setMass, particleSpeed, setParticleSpeed,
    diskRadius, setDiskRadius, innerDiskTemp, setInnerDiskTemp,
    jetLength, setJetLength,
    showGravitationalLensing, setShowGravitationalLensing,
    showPhotonSphere, setShowPhotonSphere,
    showISCO, setShowISCO,
    collapsed, setCollapsed,
    showTimeDilation, setShowTimeDilation,
  } = props;

  const [showInfo, setShowInfo] = useState(false);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed bottom-4 right-4 z-40 w-72 rounded-2xl border border-border bg-card/85 backdrop-blur-lg max-h-[85vh] overflow-hidden">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-between p-4 pb-2 cursor-pointer"
        >
          <h3 className="font-display text-xl text-primary">✦ Controls</h3>
          <span className="text-muted-foreground text-lg transition-transform" style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>▲</span>
        </button>

        {!collapsed && (
          <div className="px-5 pb-5 pt-1 overflow-y-auto max-h-[75vh] hud-scrollbar">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="mb-3 font-body text-xs text-muted-foreground underline hover:text-foreground transition-colors"
            >
              {showInfo ? 'Hide' : 'Show'} physics info
            </button>

            {showInfo && (
              <div className="mb-4 rounded-xl border border-border bg-muted/50 p-3 font-body text-xs text-muted-foreground space-y-1">
                <p><strong className="text-foreground">Schwarzschild Radius</strong> R<sub>s</sub> = 2GM/c² → <span className="text-accent">{Rs(mass)}</span></p>
                <p><strong className="text-foreground">Photon Sphere</strong> R<sub>ph</sub> = 1.5 R<sub>s</sub> → <span className="text-accent">{Rp(mass)}</span></p>
                <p><strong className="text-foreground">ISCO</strong> R<sub>isco</sub> = 3 R<sub>s</sub> → <span className="text-accent">{Risco(mass)}</span></p>
                <p><strong className="text-foreground">Inner Disk Temp</strong> → <span className="text-accent">{innerDiskTemp} K</span></p>
                <p className="pt-1 text-[10px] leading-tight opacity-70">
                  Particles follow Keplerian orbits (v ∝ 1/√r). Colors approximate blackbody radiation from accretion heating. Event horizon, photon sphere, and ISCO scale with mass.
                </p>
              </div>
            )}

            <SliderControl label="Black Hole Mass (M)" value={mass} min={0.5} max={3} step={0.1} onChange={setMass} unit="M☉" />
            <SliderControl label="Orbital Speed" value={particleSpeed} min={0.2} max={3} step={0.1} onChange={setParticleSpeed} unit="×" />
            <SliderControl label="Disk Outer Radius" value={diskRadius} min={2} max={8} step={0.1} onChange={setDiskRadius} unit="r" />
            <SliderControl label="Inner Disk Temp" value={innerDiskTemp} min={2000} max={15000} step={500} onChange={setInnerDiskTemp} unit="K" />
            <SliderControl label="Jet Length" value={jetLength} min={0} max={15} step={0.5} onChange={setJetLength} unit="r" />

            <div className="mt-3 space-y-2">
              <ToggleControl label="Gravitational Lensing Ring" checked={showGravitationalLensing} onChange={setShowGravitationalLensing} />
              <ToggleControl label="Photon Sphere (1.5 Rₛ)" checked={showPhotonSphere} onChange={setShowPhotonSphere} />
              <ToggleControl label="ISCO (3 Rₛ)" checked={showISCO} onChange={setShowISCO} />
              <ToggleControl label="Time Dilation Panel" checked={showTimeDilation} onChange={setShowTimeDilation} />
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

function SliderControl({ label, value, min, max, step, onChange, unit }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit: string;
}) {
  const tip = sliderTooltips[label];
  return (
    <div className="mb-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <label className="mb-1 flex justify-between font-body text-xs text-muted-foreground cursor-help">
            <span>{label}</span>
            <span className="text-foreground">{(value ?? 0).toFixed(step < 1 ? 1 : 0)} {unit}</span>
          </label>
        </TooltipTrigger>
        {tip && <TooltipContent side="left" className="max-w-[220px] text-xs">{tip}</TooltipContent>}
      </Tooltip>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-primary" />
    </div>
  );
}

function ToggleControl({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  const tip = toggleTooltips[label];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <label className="flex items-center gap-2 font-body text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
            className="rounded accent-primary" />
          <span>{label}</span>
        </label>
      </TooltipTrigger>
      {tip && <TooltipContent side="left" className="max-w-[220px] text-xs">{tip}</TooltipContent>}
    </Tooltip>
  );
}
