import { useDashboardFilters, SortKey } from "@/context/DashboardFiltersContext";
import { OperatorStatus } from "@/data/mockData";
import { ArrowDown, ArrowUp, AlertTriangle } from "lucide-react";

const statusLabel: Record<OperatorStatus, { text: string; cls: string }> = {
  attack: { text: "Padrão atípico", cls: "text-status-attack border-status-attack/30 bg-status-attack/5" },
  normal: { text: "Normal", cls: "text-status-normal border-status-normal/30 bg-status-normal/5" },
  none:   { text: "Sem mitigação", cls: "text-muted-foreground border-border bg-secondary/40" },
};

function HeaderCell({
  label,
  sortable,
  align = "left",
  className = "",
  k,
}: {
  label: string;
  k?: SortKey;
  sortable?: boolean;
  align?: "left" | "right";
  className?: string;
}) {
  const { sortKey, sortDir, setSort } = useDashboardFilters();
  const active = sortable && k && sortKey === k;
  return (
    <button
      type="button"
      disabled={!sortable || !k}
      onClick={() => k && setSort(k)}
      className={`text-[10px] tracking-[0.24em] ${
        active ? "text-foreground" : "text-muted-foreground"
      } ${sortable ? "hover:text-foreground transition cursor-pointer" : "cursor-default"} flex items-center gap-1 ${
        align === "right" ? "justify-end" : ""
      } ${className}`}
    >
      <span>{label}</span>
      {active && (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
    </button>
  );
}

export function OperatorList() {
  const { filtered, total } = useDashboardFilters();

  return (
    <div className="rounded-3xl border border-border gradient-card shadow-card overflow-hidden">
      <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b border-border/60">
        <div>
          <p className="text-[10px] tracking-[0.32em] text-muted-foreground">ASNs descobertos</p>
          <p className="text-[9px] tracking-[0.18em] text-muted-foreground/70 mt-0.5">
            Análise estatística — não acusatória
          </p>
        </div>
        <p className="text-[10px] tracking-[0.24em] text-muted-foreground tabular-nums">
          {filtered.length} de {total}
        </p>
      </div>

      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border/40 bg-secondary/20">
        <div className="col-span-4">
          <HeaderCell label="Holder · ASN" sortable k="name" />
        </div>
        <div className="col-span-3">
          <HeaderCell label="Mitigadores" />
        </div>
        <div className="col-span-1 text-right">
          <HeaderCell label="/24" sortable k="prefixes24" align="right" className="w-full justify-end" />
        </div>
        <div className="col-span-2">
          <HeaderCell label="Mitigação" sortable k="mitigatedPercent" />
        </div>
        <div className="col-span-2 text-right">
          <HeaderCell label="Status" sortable k="status" align="right" className="w-full justify-end" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-10">
          Nenhum ASN corresponde aos filtros (rode um scan se este for o primeiro acesso).
        </p>
      ) : (
        <ul className="divide-y divide-border/40">
          {filtered.map((op) => {
            const status = statusLabel[op.status];
            const barColor =
              op.status === "attack"
                ? "bg-status-attack"
                : op.status === "none"
                ? "bg-status-none"
                : "bg-status-normal";
            return (
              <li key={op.id} className="hover:bg-secondary/30 transition-colors">
                <div className="hidden md:grid grid-cols-12 items-center gap-4 px-6 py-4">
                  <div className="col-span-4 min-w-0">
                    <p className="font-medium tracking-wide truncate flex items-center gap-2">
                      {op.name}
                      {op.hasMixedMitigator && (
                        <span title="Inclui mitigador 'misto' (também trânsito) — leitura com cautela">
                          <AlertTriangle className="h-3 w-3 text-accent" />
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] tracking-[0.16em] text-muted-foreground truncate mt-0.5 font-mono">
                      AS{op.asn} · {op.estado || "—"} · {op.regiao || ""}
                    </p>
                  </div>

                  <div className="col-span-3 flex flex-wrap gap-1">
                    {op.mitigators.length === 0 ? (
                      <span className="text-muted-foreground/50 text-xs">—</span>
                    ) : (
                      op.mitigators.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 rounded-md bg-secondary/60 text-foreground/80 text-[10px] tracking-[0.14em] border border-border"
                        >
                          {m}
                        </span>
                      ))
                    )}
                  </div>

                  <div className="col-span-1 text-right font-mono text-sm text-muted-foreground tabular-nums">
                    {op.prefixes24}
                  </div>

                  <div className="col-span-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${op.mitigatedPercent}%` }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-9 text-right tabular-nums">
                      {op.mitigatedPercent}%
                    </span>
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] tracking-[0.2em] ${status.cls}`}
                      title={op.status === "attack"
                        ? "1 mitigador único cobrindo ≥80% — pode ser ataque OU configuração intencional. Análise estatística."
                        : undefined}
                    >
                      {status.text}
                    </span>
                  </div>
                </div>

                <div className="md:hidden px-4 py-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium tracking-wide truncate flex items-center gap-2">
                        {op.name}
                        {op.hasMixedMitigator && (
                          <span title="Mitigador misto"><AlertTriangle className="h-3 w-3 text-accent" /></span>
                        )}
                      </p>
                      <p className="text-[10px] tracking-[0.16em] text-muted-foreground truncate mt-0.5 font-mono">
                        AS{op.asn} · {op.estado || "—"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] tracking-[0.2em] shrink-0 ${status.cls}`}
                    >
                      {status.text}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {op.mitigators.length === 0 ? (
                      <span className="text-muted-foreground/50 text-xs">Sem mitigadores no path</span>
                    ) : (
                      op.mitigators.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 rounded-md bg-secondary/60 text-foreground/80 text-[10px] tracking-[0.14em] border border-border"
                        >
                          {m}
                        </span>
                      ))
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${op.mitigatedPercent}%` }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground tabular-nums shrink-0">
                      {op.mitigatedPercent}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] tracking-[0.18em] text-muted-foreground">
                    <span>Prefixos /24</span>
                    <span className="font-mono text-foreground/80 tabular-nums">{op.prefixes24}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
