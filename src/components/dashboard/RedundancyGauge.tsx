interface Props {
  value: number; // 0-100
  label?: string;
  sub?: string;
}

const TICKS = 50;
const RADIUS = 80;
const CX = 100;
const CY = 100;

export function RedundancyGauge({ value, label = "redundância", sub }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const activeTicks = Math.round((clamped / 100) * TICKS);

  return (
    <div className="rounded-3xl border border-border gradient-card p-5 sm:p-6 shadow-card flex flex-col w-full max-w-full overflow-hidden">
      <p className="text-[10px] tracking-[0.32em] text-muted-foreground mb-2">Redundância Geral</p>

      <div className="relative flex-1 flex items-center justify-center min-h-[160px]">
        <svg viewBox="0 0 200 120" className="w-full max-w-[280px] h-auto">
          {/* Tick marks across half circle (-180° to 0°) */}
          {Array.from({ length: TICKS }).map((_, i) => {
            const angle = Math.PI + (i / (TICKS - 1)) * Math.PI;
            const x1 = CX + Math.cos(angle) * RADIUS;
            const y1 = CY + Math.sin(angle) * RADIUS;
            const x2 = CX + Math.cos(angle) * (RADIUS - 14);
            const y2 = CY + Math.sin(angle) * (RADIUS - 14);
            const isActive = i < activeTicks;
            const isAccent = i === activeTicks - 1;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={
                  isAccent
                    ? "hsl(var(--accent))"
                    : isActive
                    ? "hsl(var(--primary))"
                    : "hsl(var(--border))"
                }
                strokeWidth={isAccent ? 2.5 : 1.5}
                strokeLinecap="round"
                opacity={isActive ? 0.95 : 0.5}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 pointer-events-none">
          <p className="text-4xl sm:text-5xl font-semibold tracking-[0.02em] tabular-nums">{clamped}%</p>
          <p className="text-[10px] tracking-[0.32em] text-muted-foreground mt-1">{label}</p>
        </div>
      </div>

      {sub && <p className="text-center text-xs text-muted-foreground tracking-wide mt-2">{sub}</p>}
    </div>
  );
}
