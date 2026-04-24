import { Power } from "lucide-react";

interface Props {
  scanning: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function PowerButton({ scanning, onToggle, disabled }: Props) {
  return (
    <div className="relative flex items-center justify-center w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[420px] md:h-[420px]">
      {/* Ambient halo */}
      <div
        className={`absolute inset-12 rounded-full blur-3xl transition-colors duration-700 ${
          scanning ? "bg-status-attack/40" : "bg-primary/30"
        }`}
      />

      {/* Outer rotating arc */}
      <svg
        viewBox="0 0 200 200"
        className={`absolute inset-0 w-full h-full ${scanning ? "animate-spin-slow" : ""}`}
        style={{ animationDuration: scanning ? "6s" : "30s" }}
      >
        <defs>
          <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={scanning ? "hsl(var(--status-attack))" : "hsl(var(--primary))"} stopOpacity="0" />
            <stop offset="50%" stopColor={scanning ? "hsl(var(--status-attack))" : "hsl(var(--primary-glow))"} stopOpacity="1" />
            <stop offset="100%" stopColor={scanning ? "hsl(var(--status-attack))" : "hsl(var(--primary))"} stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="92" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.4" />
        <path
          d="M 100 8 A 92 92 0 0 1 192 100"
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 100 192 A 92 92 0 0 1 8 100"
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Pulsing rings */}
      <span
        className={`absolute inset-16 rounded-full border ${
          scanning ? "border-status-attack/40 animate-pulse-ring" : "border-primary/30"
        }`}
        style={{ animationDuration: "2s" }}
      />
      <span
        className={`absolute inset-20 rounded-full border ${
          scanning ? "border-status-attack/30 animate-pulse-ring" : "border-primary/20"
        }`}
        style={{ animationDuration: "2.6s", animationDelay: "0.4s" }}
      />

      {/* Tick marks ring */}
      <svg viewBox="0 0 200 200" className="absolute inset-8 w-[calc(100%-4rem)] h-[calc(100%-4rem)] opacity-60">
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
          const r1 = 92;
          const r2 = i % 5 === 0 ? 84 : 88;
          const x1 = 100 + Math.cos(angle) * r1;
          const y1 = 100 + Math.sin(angle) * r1;
          const x2 = 100 + Math.cos(angle) * r2;
          const y2 = 100 + Math.sin(angle) * r2;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={scanning ? "hsl(var(--status-attack))" : "hsl(var(--primary))"}
              strokeWidth={i % 5 === 0 ? 1.5 : 0.6}
              opacity={0.5}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* The button itself */}
      <button
        onClick={onToggle}
        disabled={disabled}
        aria-label={scanning ? "Parar coleta" : "Iniciar coleta"}
        className="relative h-44 w-44 md:h-52 md:w-52 rounded-full text-foreground flex items-center justify-center transition-all duration-500 hover:scale-[1.04] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group overflow-hidden"
        style={{
          background: scanning
            ? "radial-gradient(circle at 50% 22%, hsl(350 95% 80%) 0%, hsl(350 90% 58%) 32%, hsl(350 85% 38%) 72%, hsl(350 65% 18%) 100%)"
            : "radial-gradient(circle at 50% 22%, hsl(215 100% 82%) 0%, hsl(215 100% 58%) 32%, hsl(215 100% 38%) 72%, hsl(215 80% 18%) 100%)",
          boxShadow: scanning
            ? "inset 0 -22px 42px hsl(350 70% 12% / 0.75), inset 0 22px 44px hsl(350 100% 85% / 0.55), 0 28px 70px hsl(350 90% 30% / 0.65), 0 0 130px hsl(350 90% 55% / 0.6)"
            : "inset 0 -22px 42px hsl(215 90% 14% / 0.75), inset 0 22px 44px hsl(215 100% 85% / 0.55), 0 28px 70px hsl(215 100% 28% / 0.65), 0 0 130px hsl(215 100% 55% / 0.55)",
        }}
      >
        {/* Top gloss — stretched to cover full top arc */}
        <span
          className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 75% 100% at 50% 0%, hsl(0 0% 100% / 0.55), transparent 70%)",
          }}
        />
        {/* Bottom shadow — softer */}
        <span
          className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
          style={{
            background: scanning
              ? "radial-gradient(ellipse 80% 100% at 50% 100%, hsl(350 70% 10% / 0.55), transparent 70%)"
              : "radial-gradient(ellipse 80% 100% at 50% 100%, hsl(215 90% 10% / 0.55), transparent 70%)",
          }}
        />

        <div className="relative flex flex-col items-center gap-2">
          <Power
            className={`h-14 w-14 md:h-16 md:w-16 stroke-[2.5] text-primary-foreground drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] ${
              scanning ? "animate-pulse" : ""
            }`}
          />
          <span className="text-[11px] tracking-[0.18em] text-primary-foreground/95 font-semibold">
            {scanning ? "Parar" : "Iniciar"}
          </span>
        </div>
      </button>
    </div>
  );
}
