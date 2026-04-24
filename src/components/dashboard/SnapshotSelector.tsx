import { Database, History } from "lucide-react";
import type { Snapshot } from "@/types/api";

export type ViewMode = "latest" | "all";

interface Props {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
  latest: Snapshot | null;
  totalSnapshots: number;
}

function formatRange(s: Snapshot): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  const inicio = fmt(s.iniciado_em);
  const fim = s.finalizado_em ? fmt(s.finalizado_em) : "—";
  return `${inicio} → ${fim}`;
}

export function SnapshotSelector({ mode, onChange, latest, totalSnapshots }: Props) {
  const latestLabel = latest
    ? latest.nome ?? `Coleta #${latest.id}`
    : "Nenhuma coleta finalizada";

  const latestRange = latest ? formatRange(latest) : null;

  return (
    <div className="rounded-3xl border border-border gradient-card shadow-card px-3 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="inline-flex p-1 rounded-full border border-border bg-secondary/40 shrink-0 self-start sm:self-center">
        <button
          onClick={() => onChange("latest")}
          disabled={!latest}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tracking-[0.18em] transition whitespace-nowrap ${
            mode === "latest"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          }`}
        >
          <History className="h-3 w-3" />
          Última coleta
        </button>
        <button
          onClick={() => onChange("all")}
          disabled={totalSnapshots === 0}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tracking-[0.18em] transition whitespace-nowrap ${
            mode === "all"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          }`}
        >
          <Database className="h-3 w-3" />
          Todas as coletas
        </button>
      </div>

      <div className="flex-1 min-w-0">
        {mode === "latest" ? (
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              Visualizando
            </span>
            <span className="text-sm text-foreground/90 truncate">{latestLabel}</span>
            {latestRange && (
              <span className="text-[10px] font-mono tracking-wider text-muted-foreground tabular-nums">
                {latestRange}
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              Visualizando
            </span>
            <span className="text-sm text-foreground/90">
              Agregado de {totalSnapshots} {totalSnapshots === 1 ? "coleta" : "coletas"}
            </span>
            <span className="text-[10px] tracking-wider text-muted-foreground">
              KPIs e operadoras consolidados de todas as coletas no banco
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
