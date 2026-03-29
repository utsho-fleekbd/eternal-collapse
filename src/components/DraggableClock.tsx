import { useState, useRef, useEffect, useCallback } from "react";
import { Clock, Infinity as InfinityIcon, GripVertical } from "lucide-react";

interface DraggableClockProps {
  mass: number;
  visible: boolean;
}

/**
 * A draggable clock that simulates gravitational time dilation.
 * Drag the slider to change the "orbital radius" and watch the clock tick slower.
 * τ/t = √(1 − Rₛ/r)
 */
export default function DraggableClock({ mass, visible }: DraggableClockProps) {
  const rs = 2 * mass; // Schwarzschild radius
  const [radius, setRadius] = useState(10); // in units of Rₛ multiplier
  const [properTime, setProperTime] = useState(0); // dilated seconds
  const [coordinateTime, setCoordinateTime] = useState(0); // distant observer seconds
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 120 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);
  const lastTick = useRef(Date.now());

  const r = radius * rs;
  const dilationFactor = r > rs ? Math.sqrt(1 - rs / r) : 0;

  // Animate clocks
  useEffect(() => {
    if (!visible) return;
    lastTick.current = Date.now();

    const tick = () => {
      const now = Date.now();
      const dt = (now - lastTick.current) / 1000; // real seconds elapsed
      lastTick.current = now;

      setCoordinateTime((prev) => prev + dt);
      setProperTime((prev) => prev + dt * dilationFactor);
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [visible, dilationFactor]);

  // Reset clocks when mass changes significantly
  const resetClocks = useCallback(() => {
    setProperTime(0);
    setCoordinateTime(0);
    lastTick.current = Date.now();
  }, []);

  // Drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    },
    [position],
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging]);

  if (!visible) return null;

  const formatTime = (t: number) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Analog clock angles
  const coordSec = (coordinateTime % 60) * 6;
  const coordMin = ((coordinateTime / 60) % 60) * 6;
  const coordHr = ((coordinateTime / 3600) % 12) * 30;

  const propSec = (properTime % 60) * 6;
  const propMin = ((properTime / 60) % 60) * 6;
  const propHr = ((properTime / 3600) % 12) * 30;

  return (
    <div
      className="fixed z-50 select-none"
      style={{ left: position.x, top: position.y }}
    >
      <div className="w-80 rounded-2xl border border-border bg-card/90 backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Drag handle */}
        <div
          onMouseDown={handleMouseDown}
          className="flex items-center justify-between p-3 pb-2 cursor-grab active:cursor-grabbing border-b border-border/50"
        >
          <h3 className="font-display text-base text-primary flex items-center gap-2">
            <Clock className="w-4 h-4" /> Time Dilation Clocks
          </h3>
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="p-4 space-y-4">
          {/* Radius control */}
          <div>
            <label className="font-body text-xs text-muted-foreground flex justify-between mb-1">
              <span>Observer Radius</span>
              <span className="text-foreground">
                {radius.toFixed(1)} Rₛ ({(r).toFixed(2)} units)
              </span>
            </label>
            <input
              type="range"
              min={1.01}
              max={50}
              step={0.01}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between font-body text-[9px] text-muted-foreground/60 mt-0.5">
              <span>Event Horizon</span>
              <span>Far away</span>
            </div>
          </div>

          {/* Dilation factor display */}
          <div className="rounded-xl bg-muted/50 border border-border/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-xs text-muted-foreground">
                τ/t = √(1 − Rₛ/r)
              </span>
              <span
                className="font-body text-sm font-semibold"
                style={{
                  color: `hsl(${120 * dilationFactor}, 70%, 50%)`,
                }}
              >
                {dilationFactor.toFixed(6)}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${dilationFactor * 100}%`,
                  background: `linear-gradient(90deg, hsl(0, 70%, 50%), hsl(${120 * dilationFactor}, 70%, 50%))`,
                }}
              />
            </div>
          </div>

          {/* Dual clocks */}
          <div className="grid grid-cols-2 gap-3">
            {/* Distant observer clock */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <InfinityIcon className="w-3 h-3 text-muted-foreground" />
                <span className="font-body text-[10px] text-muted-foreground">
                  Distant Observer
                </span>
              </div>
              <AnalogClock
                secAngle={coordSec}
                minAngle={coordMin}
                hrAngle={coordHr}
                color="hsl(210, 70%, 60%)"
                size={80}
              />
              <p className="font-body text-xs text-foreground mt-1 tabular-nums">
                {formatTime(coordinateTime)}
              </p>
            </div>

            {/* Local observer clock */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Clock className="w-3 h-3 text-primary" />
                <span className="font-body text-[10px] text-primary">
                  At {radius.toFixed(1)} Rₛ
                </span>
              </div>
              <AnalogClock
                secAngle={propSec}
                minAngle={propMin}
                hrAngle={propHr}
                color="hsl(330, 80%, 60%)"
                size={80}
              />
              <p className="font-body text-xs text-foreground mt-1 tabular-nums">
                {formatTime(properTime)}
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-1">
            <p className="font-body text-[10px] text-muted-foreground leading-tight">
              {radius <= 1.5
                ? "⚠️ Inside the photon sphere! Light cannot escape."
                : radius <= 3
                  ? "Inside ISCO — no stable orbits exist here."
                  : radius <= 5
                    ? "Strong gravitational field — noticeable time dilation."
                    : "Weak field — clocks nearly synchronized."}
            </p>
            <p className="font-body text-[10px] text-muted-foreground/60 leading-tight">
              1 hour here = {dilationFactor > 0 ? (1 / dilationFactor).toFixed(3) : "∞"} hours for distant observer
            </p>
          </div>

          <button
            onClick={resetClocks}
            className="w-full py-1.5 rounded-lg border border-border text-xs font-body text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Reset Clocks
          </button>
        </div>
      </div>
    </div>
  );
}

/** Simple SVG analog clock face */
function AnalogClock({
  secAngle,
  minAngle,
  hrAngle,
  color,
  size,
}: {
  secAngle: number;
  minAngle: number;
  hrAngle: number;
  color: string;
  size: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Face */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="hsl(260, 30%, 6%)"
        stroke="hsl(280, 30%, 25%)"
        strokeWidth={1.5}
      />
      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1 = cx + (r - 4) * Math.cos(angle);
        const y1 = cy + (r - 4) * Math.sin(angle);
        const x2 = cx + (r - 8) * Math.cos(angle);
        const y2 = cy + (r - 8) * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="hsl(330, 30%, 40%)"
            strokeWidth={1}
          />
        );
      })}
      {/* Hour hand */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + (r * 0.5) * Math.cos((hrAngle - 90) * (Math.PI / 180))}
        y2={cy + (r * 0.5) * Math.sin((hrAngle - 90) * (Math.PI / 180))}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Minute hand */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + (r * 0.7) * Math.cos((minAngle - 90) * (Math.PI / 180))}
        y2={cy + (r * 0.7) * Math.sin((minAngle - 90) * (Math.PI / 180))}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.8}
      />
      {/* Second hand */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + (r * 0.85) * Math.cos((secAngle - 90) * (Math.PI / 180))}
        y2={cy + (r * 0.85) * Math.sin((secAngle - 90) * (Math.PI / 180))}
        stroke="hsl(0, 70%, 55%)"
        strokeWidth={0.8}
        strokeLinecap="round"
      />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={2} fill={color} />
    </svg>
  );
}
