import React, { useMemo } from 'react';

interface Beam {
  top: number;
  widthPct: number;
  leftPct: number;
  gradient: string;
  glowColor: string;
  duration: number;
  delay: number;
}

interface GridShimmerBackgroundProps {
  className?: string;
  /** Grid cell size in px (both the static grid and the row spacing for beams). */
  cellSize?: number;
  /** Number of horizontal grid rows the static grid spans. */
  rows?: number;
  /** Beams per lit row. */
  beamsPerRow?: number;
  /**
   * How many rows, centered vertically, actually get animated beams.
   * The rest of the grid stays as plain static lines. Defaults to `rows` (all lit).
   */
  litRows?: number;
}

/** Builds a multi-stop rainbow streak by sweeping the hue wheel, not just two flat colors. */
const buildSpectrumGradient = (): { css: string; glowColor: string } => {
  const startHue = Math.floor(Math.random() * 360);
  const spread = 100 + Math.random() * 80; // how far around the wheel this streak travels
  const direction = Math.random() < 0.5 ? 1 : -1;
  const stops = [0, 15, 32, 50, 68, 85, 100];
  const sat = 70;
  const light = 32;
  const css = stops
    .map((pos, i) => {
      if (i === 0 || i === stops.length - 1) return `transparent ${pos}%`;
      const t = (i - 1) / (stops.length - 3); // 0..1 across the interior stops
      const hue = (startHue + direction * spread * t + 360) % 360;
      return `hsl(${hue}, ${sat}%, ${light}%) ${pos}%`;
    })
    .join(', ');
  const midHue = (startHue + (direction * spread) / 2 + 360) % 360;
  return {
    css: `linear-gradient(90deg, ${css})`,
    glowColor: `hsla(${midHue}, ${sat}%, ${light}%, 0.65)`,
  };
};

export const GridShimmerBackground: React.FC<GridShimmerBackgroundProps> = ({
  className = '',
  cellSize = 150,
  rows = 5,
  beamsPerRow = 1,
  litRows = rows,
}) => {
  const beams = useMemo<Beam[]>(() => {
    const list: Beam[] = [];
    const clampedLit = Math.min(litRows, rows);
    const startRow = Math.floor((rows - clampedLit) / 2);
    const endRow = startRow + clampedLit;
    for (let r = startRow; r < endRow; r++) {
      for (let b = 0; b < beamsPerRow; b++) {
        const { css, glowColor } = buildSpectrumGradient();
        list.push({
          top: r * cellSize,
          widthPct: 45 + Math.random() * 30,
          leftPct: Math.random() * 20,
          gradient: css,
          glowColor,
          duration: 2 + Math.random() * 2,
          delay: -(Math.random() * 6),
        });
      }
    }
    return list;
  }, [rows, beamsPerRow, litRows, cellSize]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden="true"
    >
      {/* Static faint grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: `${cellSize}px ${cellSize}px`,
          maskImage:
            'radial-gradient(80% 70% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(80% 70% at 50% 50%, black 30%, transparent 100%)',
        }}
      />

      {/* Animated color sweeps along grid rows */}
      <div className="absolute inset-0 overflow-hidden">
        {beams.map((beam, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 overflow-x-hidden"
            style={
              {
                top: beam.top - 6,
                height: 12,
                containerType: 'inline-size',
              } as React.CSSProperties
            }
          >
            <div
              style={{
                position: 'absolute',
                top: 5,
                left: `${beam.leftPct}%`,
                width: `${beam.widthPct}%`,
                height: 1,
                backgroundImage: beam.gradient,
                boxShadow: `0 0 8px 1px ${beam.glowColor}`,
                animation: `gridShimmerH ${beam.duration}s linear ${beam.delay}s infinite`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridShimmerBackground;
