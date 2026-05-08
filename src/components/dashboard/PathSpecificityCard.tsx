import { usePathSpecificity } from "@/hooks/usePathSpecificity";
import { Route } from "lucide-react";

interface Props {
  snapshotId?: number | "latest" | "all";
}

export function PathSpecificityCard({ snapshotId = "all" }: Props) {
  const { data, loading } = usePathSpecificity(snapshotId);

  const top = [...data]
    .sort(
      (a, b) =>
        Number(b.score_manipulacao ?? 0) - Number(a.score_manipulacao ?? 0)
    )
    .slice(0, 8);

  const colorByScore = (s: number) => {
    if (s >= 70) return "text-status-attack";
    if (s >= 40) return "text-accent";
    return "text-muted-foreground";
  };

  return (
    <div className="rounded-3xl border border-border gradient-card shadow-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] tracking-[0.32em] text-muted-foreground">
          Manipulação de rota (D.3)
        </p>
        <span className="text-[9px] tracking-[0.2em] text-muted-foreground/70 flex items-center gap-1">
          <Route className="h-3 w-3" />
          score 0–100
        </span>
      </div>

      {loading && data.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">Carregando…</p>
      ) : top.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Sem dados de path-specificity ainda.
        </p>
      ) : (
        <>
          <ul className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {top.map((d) => {
              const s = Number(d.score_manipulacao ?? 0);
              return (
                <li
                  key={`${d.snapshot_id}-${d.asn_origem}`}
                  className="rounded-lg bg-secondary/30 px-2 py-1.5"
                >
                  <div className="flex justify-between text-[11px]">
                    <span className="truncate text-foreground/85">
                      {d.nome_holder || `AS${d.asn_origem}`}
                    </span>
                    <span
                      className={`font-mono tabular-nums shrink-0 ml-2 ${colorByScore(s)}`}
                    >
                      {s.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[9px] mt-0.5 tracking-wider text-muted-foreground/70">
                    <span>spread {d.path_spread}</span>
                    <span>σ {Number(d.path_stddev ?? 0).toFixed(1)}</span>
                    <span>mit-trans {Number(d.pct_mit_transit_origem ?? 0).toFixed(0)}%</span>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="text-[9px] tracking-[0.2em] text-muted-foreground/60 mt-3">
            Spread alto + mit como penúltimo AS = injeção via scrubbing center
          </p>
        </>
      )}
    </div>
  );
}
