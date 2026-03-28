import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChartNoAxesGantt } from "lucide-react";

interface TimeDilationPanelProps {
  mass: number;
  visible: boolean;
}

/**
 * Gravitational time dilation: τ/t = √(1 - Rₛ/r)
 * Shows how clocks tick slower at various radii near a Schwarzschild black hole.
 */
export default function TimeDilationPanel({
  mass,
  visible,
}: TimeDilationPanelProps) {
  const rs = 2 * mass;

  const rows = useMemo(() => {
    const radii = [
      { label: "100 Rₛ", r: 100 * rs },
      { label: "10 Rₛ", r: 10 * rs },
      { label: "5 Rₛ", r: 5 * rs },
      { label: "3 Rₛ (ISCO)", r: 3 * rs },
      { label: "1.5 Rₛ (Photon)", r: 1.5 * rs },
      { label: "1.1 Rₛ", r: 1.1 * rs },
      { label: "1.01 Rₛ", r: 1.01 * rs },
      { label: "1 Rₛ (Horizon)", r: rs },
    ];
    return radii.map(({ label, r }) => {
      const ratio = r > rs ? Math.sqrt(1 - rs / r) : 0;
      // How much slower: 1 hour at infinity = X at this radius
      const oneHourEquiv = ratio > 0 ? 1 / ratio : Infinity;
      return { label, r: r.toFixed(2), ratio, oneHourEquiv };
    });
  }, [rs, mass]);

  if (!visible) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="fixed top-4 left-4 z-40 w-72 rounded-2xl border border-border bg-card/85 backdrop-blur-lg overflow-hidden">
        <div className="p-4 pb-2">
          <h3 className="font-display text-lg text-primary flex items-center gap-2">
            <ChartNoAxesGantt /> Time Dilation
          </h3>
          <p className="font-body text-[10px] text-muted-foreground mt-1">
            τ/t = √(1 − Rₛ/r) — proper time vs coordinate time
          </p>
        </div>
        <div className="px-4 pb-4">
          <table className="w-full font-body text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left pb-1.5 font-medium">Radius</th>
                <th className="text-right pb-1.5 font-medium">τ/t</th>
                <th className="text-right pb-1.5 font-medium">
                  <Tooltip>
                    <TooltipTrigger className="cursor-help underline decoration-dotted">
                      1hr∞ =
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="max-w-[200px] text-xs"
                    >
                      How long 1 hour of distant-observer time takes at this
                      radius (gravitational time dilation).
                    </TooltipContent>
                  </Tooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const barWidth = row.ratio * 100;
                const isHorizon = row.ratio === 0;
                return (
                  <tr
                    key={row.label}
                    className="border-b border-border/30 last:border-0"
                  >
                    <td className="py-1.5 text-muted-foreground">
                      {row.label}
                    </td>
                    <td className="py-1.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${barWidth}%`,
                              background: isHorizon
                                ? "hsl(0, 70%, 50%)"
                                : `hsl(${120 * row.ratio}, 70%, 50%)`,
                            }}
                          />
                        </div>
                        <span
                          className={
                            isHorizon
                              ? "text-destructive font-semibold"
                              : "text-foreground"
                          }
                        >
                          {isHorizon ? "0" : row.ratio.toFixed(4)}
                        </span>
                      </div>
                    </td>
                    <td className="py-1.5 text-right text-foreground">
                      {isHorizon ? (
                        <span className="text-destructive font-semibold">
                          ∞
                        </span>
                      ) : (
                        `${row.oneHourEquiv.toFixed(2)}h`
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-2 text-[10px] text-muted-foreground leading-tight opacity-70">
            At the event horizon, time stops relative to a distant observer. A
            clock at 1.01 Rₛ ticks ~10× slower.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
