import { Html } from '@react-three/drei';
import { useState } from 'react';

interface SceneTooltipProps {
  position: [number, number, number];
  label: string;
  description: string;
  color?: string;
}

export function SceneTooltip({ position, label, description, color = 'hsl(330,80%,60%)' }: SceneTooltipProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Html position={position} center style={{ pointerEvents: 'auto' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative cursor-help"
      >
        <div
          className="w-3 h-3 rounded-full border animate-pulse"
          style={{ borderColor: color, background: `${color}33` }}
        />
        {hovered && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-48 rounded-lg border border-border bg-card/95 backdrop-blur-md p-2 text-xs font-body z-50 shadow-lg">
            <p className="font-semibold text-foreground mb-0.5">{label}</p>
            <p className="text-muted-foreground leading-tight">{description}</p>
          </div>
        )}
      </div>
    </Html>
  );
}
