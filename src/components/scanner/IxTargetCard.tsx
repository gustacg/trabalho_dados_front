interface Props {
  label: string;
  active: boolean;
  onToggle: () => void;
}

export function IxTargetCard({ label, active, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl border transition-all duration-300 w-full sm:w-auto sm:min-w-[200px] ${
        active
          ? "border-foreground/20 bg-foreground/[0.04]"
          : "border-border bg-card/40 hover:border-border/80 opacity-70 hover:opacity-100"
      }`}
    >
      <div className="text-left min-w-0">
        <p className="text-sm tracking-[0.08em] truncate">{label}</p>
      </div>
      <span
        className={`ml-auto h-2 w-2 rounded-full transition-all shrink-0 ${
          active ? "bg-foreground" : "bg-border"
        }`}
      />
    </button>
  );
}
