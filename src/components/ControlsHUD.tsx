interface ControlsHUDProps {
  mass: number;
  setMass: (v: number) => void;
  particleSpeed: number;
  setParticleSpeed: (v: number) => void;
  diskRadius: number;
  setDiskRadius: (v: number) => void;
}

export default function ControlsHUD({ mass, setMass, particleSpeed, setParticleSpeed, diskRadius, setDiskRadius }: ControlsHUDProps) {
  return (
    <div className="fixed bottom-4 right-4 z-40 w-64 rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-lg">
      <h3 className="mb-4 font-display text-xl text-primary">✦ Controls</h3>

      <div className="mb-3">
        <label className="mb-1 flex justify-between font-body text-xs text-muted-foreground">
          <span>Black Hole Mass</span>
          <span>{mass.toFixed(1)}</span>
        </label>
        <input type="range" min="0.5" max="3" step="0.1" value={mass}
          onChange={e => setMass(Number(e.target.value))}
          className="w-full accent-primary" />
      </div>

      <div className="mb-3">
        <label className="mb-1 flex justify-between font-body text-xs text-muted-foreground">
          <span>Particle Speed</span>
          <span>{particleSpeed.toFixed(1)}</span>
        </label>
        <input type="range" min="0.2" max="3" step="0.1" value={particleSpeed}
          onChange={e => setParticleSpeed(Number(e.target.value))}
          className="w-full accent-primary" />
      </div>

      <div>
        <label className="mb-1 flex justify-between font-body text-xs text-muted-foreground">
          <span>Disk Radius</span>
          <span>{diskRadius.toFixed(1)}</span>
        </label>
        <input type="range" min="2" max="6" step="0.1" value={diskRadius}
          onChange={e => setDiskRadius(Number(e.target.value))}
          className="w-full accent-primary" />
      </div>
    </div>
  );
}
