import { useTemporalDelta } from "@/hooks/useTemporalDelta";
import { ArrowRight, TrendingDown, TrendingUp, Minus } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  ATAQUE_SUSPEITO: "Padrão atípico",
  OPERACAO_NORMAL: "Normal",
  SEM_MITIGACAO: "Sem mit.",
};

const STATUS_RANK: Record<string, number> = {
  ATAQUE_SUSPEITO: 2,
  SEM_MITIGACAO: 1,
  OPERACAO_NORMAL: 0,
};

export function TemporalDeltaCard() {
  const { data, loading } = useTemporalDelta(20);

  return (
    <div className="rounded-3xl border border-border gradient-card shadow-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] tracking-[0.32em] text-muted-foreground">
          Comparação temporal · últimas mudanças
        </p>
        <p className="text-[10px] tracking-[0.2em] text-muted-foreground">
          {data.length} mudança{data.length === 1 ? "" : "s"}
        </p>
      </div>

      {loading && data.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">Carregando…</p>
      ) : data.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Nenhuma mudança significativa entre os 2 últimos snapshots.
        </p>
      ) : (
        <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {data.map((d) => {
            const piorou = (STATUS_RANK[d.status_atual] ?? 0) > (STATUS_RANK[d.status_anterior] ?? 0);
            const melhorou = (STATUS_RANK[d.status_atual] ?? 0) < (STATUS_RANK[d.status_anterior] ?? 0);
            const cls = piorou
              ? "border-status-attack/30 bg-status-attack/5"
              : melhorou
              ? "border-status-normal/30 bg-status-normal/5"
              : "border-border bg-secondary/30";
            const Icon = piorou ? TrendingUp : melhorou ? TrendingDown : Minus;
            return (
              <li
                key={d.asn_origem}
                className={`rounded-2xl border px-3 py-2 flex items-center gap-3 ${cls}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">
                    {d.nome_holder || `AS${d.asn_origem}`}
                  </p>
                  <p className="text-[10px] tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span>{STATUS_LABEL[d.status_anterior] ?? d.status_anterior}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>{STATUS_LABEL[d.status_atual] ?? d.status_atual}</span>
                  </p>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground tabular-nums shrink-0">
                  {d.delta_pct >= 0 ? "+" : ""}
                  {Number(d.delta_pct).toFixed(1)}%
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
