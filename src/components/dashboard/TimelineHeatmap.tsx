import { Fragment, useMemo, useState } from "react";
import { buildTimeline } from "@/data/mockData";
import { useDashboardFilters } from "@/context/DashboardFiltersContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 6;

const colorFor = (v: number) => {
  if (v === 0) return "hsl(222 22% 11%)";
  if (v === 1) return "hsl(var(--primary) / 0.35)";
  if (v === 2) return "hsl(var(--accent) / 0.7)";
  return "hsl(var(--status-attack))";
};

export function TimelineHeatmap() {
  const { filtered } = useDashboardFilters();
  const rows = useMemo(() => buildTimeline(filtered), [filtered]);
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const slice = rows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="rounded-3xl border border-border gradient-card p-4 sm:p-6 shadow-card h-full w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-3">
        <p className="text-[10px] tracking-[0.32em] text-muted-foreground">Temporalidade · 24h</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground">
            <span>Baixo</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((v) => (
                <span key={v} className="h-3 w-3 rounded-md" style={{ background: colorFor(v) }} />
              ))}
            </div>
            <span>Crítico</span>
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

      {slice.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-8">Nenhuma operadora corresponde aos filtros.</p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="min-w-[520px]">
            <div className="grid gap-y-1" style={{ gridTemplateColumns: "100px repeat(24, minmax(0, 1fr))" }}>
              <div />
              {hours.map((h) => (
                <div key={h} className="text-[9px] text-muted-foreground tracking-wider text-center pb-2">
                  {h % 3 === 0 ? `${h}h` : ""}
                </div>
              ))}
              {slice.map((row) => {
                const dotColor = row.ix === "IX Maranhão" ? "hsl(var(--primary))" : "hsl(var(--accent))";
                return (
                  <Fragment key={row.name}>
                    <div className="flex items-center gap-2 pr-3 py-1 truncate">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
                      <span className="text-xs text-muted-foreground tracking-wide truncate">{row.name}</span>
                    </div>
                    {row.values.map((v, i) => (
                      <div
                        key={`${row.name}-${i}`}
                        className="aspect-square m-[2px] rounded-md transition-transform hover:scale-150 hover:z-10"
                        style={{ background: colorFor(v) }}
                        title={`${row.name} · ${i}h · severidade ${v}`}
                      />
                    ))}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
