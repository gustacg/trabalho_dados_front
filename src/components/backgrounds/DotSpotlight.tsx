import { cn } from "@/lib/utils";

export function DotSpotlight({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {/* Dots — opacidade reduzida */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--foreground) / 0.08) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
      {/* Spotlight beams */}
      <div
        className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full blur-3xl opacity-50 animate-spotlight"
        style={{
          background:
            "radial-gradient(circle, hsl(215 100% 60% / 0.35), transparent 70%)",
        }}
      />
      <div
        className="absolute -top-20 right-1/4 h-[500px] w-[500px] rounded-full blur-3xl opacity-40 animate-spotlight-2"
        style={{
          background:
            "radial-gradient(circle, hsl(215 100% 70% / 0.25), transparent 70%)",
        }}
      />
    </div>
  );
}
