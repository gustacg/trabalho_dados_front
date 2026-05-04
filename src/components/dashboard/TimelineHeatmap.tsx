import { Fragment, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTimeline } from "@/hooks/useTimeline";
import { useDashboardFilters } from "@/context/DashboardFiltersContext";
import type { TimelineBucket } from "@/types/api";

const PAGE_SIZE = 6;
const DAYS = 14;

function lastNDays(n: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

const colorForStatus = (status: string, pct: number | null = 0): string => {
  if (status === "ATAQUE_SUSPEITO") return "hsl(var(--status-attack))";
  if (status === "OPERACAO_NORMAL") {
    const op = Math.max(0.3, Math.min(1, (pct ?? 30) / 100));
    return `hsl(var(--status-normal) / ${op})`;
  }
  if (status === "SEM_MITIGACAO") return "hsl(var(--status-none) / 0.5)";
  return "hsl(222 22% 11%)"; // NO_DATA
};

const labelForStatus = (status: string): string => {
  if (status === "ATAQUE_SUSPEITO") return "Padrão atípico";
  if (status === "OPERACAO_NORMAL") return "Normal";
  if (status === "SEM_MITIGACAO") return "Sem mitigação";
  return "Sem dado";
};

interface RowAgg {
  asn: number;
  nome: string;
  estado: string | null;
  byBucket: Map<string, TimelineBucket>;
}

export function TimelineHeatmap() {
  const { data: buckets, loading } = useTimeline({ days: DAYS });
  const { ix } = useDashboardFilters();
  const [page, setPage] = useState(0);

  const days = useMemo(() => lastNDays(DAYS), []);

  const rows = useMemo<RowAgg[]>(() => {
    const map = new Map<number, RowAgg>();
    for (const b of buckets) {
      // Filtro pelo IX/região no contexto (se UF == MA/CE)
      if (ix === "IX Maranhão" && b.estado !== "MA") continue;
      if (ix === "IX Ceará" && b.estado !== "CE") continue;
      const cur = map.get(b.asn_origem) || {
        asn: b.asn_origem,
        nome: b.nome_holder || `AS${b.asn_origem}`,
        estado: b.estado,
        byBucket: new Map(),
      };
      cur.byBucket.set(b.bucket, b);
      map.set(b.asn_origem, cur);
    }
    return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [buckets, ix]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const slice = rows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const fmtBucketLabel = (iso: string, idx: number) => {
    if (idx % 2 !== 0) return "";
    const d = new Date(iso + "T00:00:00");
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  return (
    <div className="rounded-3xl border border-border gradient-card p-4 sm:p-6 shadow-card h-full w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-3">
        <p className="text-[10px] tracking-[0.32em] text-muted-foreground">Temporalidade · {DAYS}d</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground">
            <span className="h-3 w-3 rounded-md" style={{ background: "hsl(var(--status-none) / 0.5)" }} />
            <span>Sem mit.</span>
            <span className="h-3 w-3 rounded-md" style={{ background: "hsl(var(--status-normal) / 0.85)" }} />
            <span>Normal</span>
            <span className="h-3 w-3 rounded-md" style={{ background: "hsl(var(--status-attack))" }} />
            <span>Atípico</span>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="h-6 w-6 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground tabular-nums">
                {safePage + 1}/{totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                className="h-6 w-6 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && rows.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-8">Carregando timeline…</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-8">
          Sem dados para o intervalo (rode um scan ou aguarde o auto-scan).
        </p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="min-w-[520px]">
            <div
              className="grid gap-y-1"
              style={{ gridTemplateColumns: `140px repeat(${DAYS}, minmax(0, 1fr))` }}
            >
              <div />
              {days.map((d, i) => (
                <div
                  key={d}
                  className="text-[9px] text-muted-foreground tracking-wider text-center pb-2"
                >
                  {fmtBucketLabel(d, i)}
                </div>
              ))}
              {slice.map((row) => (
                <Fragment key={row.asn}>
                  <div className="flex items-center gap-2 pr-3 py-1 truncate">
                    <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums shrink-0">
                      AS{row.asn}
                    </span>
                    <span className="text-xs text-muted-foreground tracking-wide truncate">
                      {row.nome}
                    </span>
                  </div>
                  {days.map((d) => {
                    const cell = row.byBucket.get(d);
                    const status = cell?.status_ataque ?? "NO_DATA";
                    const pct = cell?.pct_mitigado_max ?? null;
                    const tip = `${row.nome} · ${d} · ${labelForStatus(status)}${
                      pct !== null ? ` (${pct}%)` : ""
                    }`;
                    return (
                      <div
                        key={`${row.asn}-${d}`}
                        className="aspect-square m-[2px] rounded-md transition-transform hover:scale-150 hover:z-10"
                        style={{ background: colorForStatus(status, pct) }}
                        title={tip}
                      />
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
