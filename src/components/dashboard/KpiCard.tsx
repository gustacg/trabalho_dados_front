interface Props {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "primary" | "accent" | "normal" | "attack";
  children?: React.ReactNode;
}

const accents = {
  primary: "bg-primary",
  accent: "bg-accent",
  normal: "bg-status-normal",
  attack: "bg-status-attack",
};

export function KpiCard({ label, value, hint, accent = "primary", children }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border gradient-card p-5 sm:p-6 shadow-card">
      <div className={`absolute top-0 left-5 sm:left-6 h-[2px] w-10 ${accents[accent]} rounded-full`} />
      <p className="text-[10px] tracking-[0.32em] text-muted-foreground mb-4 sm:mb-5">{label}</p>
      <p className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[0.02em] mb-1 tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground tracking-wide">{hint}</p>}
      {children && <div className="mt-3 sm:mt-4">{children}</div>}
    </div>
  );
}
