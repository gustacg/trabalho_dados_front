import { Search, ArrowUpDown } from "lucide-react";
import { useDashboardFilters, IxFilter, SortKey } from "@/context/DashboardFiltersContext";
import { OperatorStatus } from "@/data/mockData";

const ixOptions: { key: IxFilter; label: string }[] = [
  { key: "ALL", label: "Todos" },
  { key: "IX Maranhão", label: "MA" },
  { key: "IX Ceará", label: "CE" },
];

const statusOptions: { key: OperatorStatus; label: string; cls: string }[] = [
  { key: "attack", label: "Padrão atípico", cls: "text-status-attack border-status-attack/30" },
  { key: "normal", label: "Normal", cls: "text-status-normal border-status-normal/30" },
  { key: "none",   label: "Sem mitigação", cls: "text-muted-foreground border-border" },
];

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "status", label: "Status (criticidade)" },
  { key: "name", label: "Holder" },
  { key: "prefixes24", label: "Prefixos /24" },
  { key: "mitigatedPercent", label: "% Mitigação" },
];

export function DashboardControls() {
  const { ix, setIx, statuses, toggleStatus, search, setSearch, sortKey, sortDir, setSort } =
    useDashboardFilters();

  return (
    <div className="rounded-3xl border border-border gradient-card shadow-card px-3 sm:px-5 py-3 sm:py-4 flex flex-wrap items-center gap-2 sm:gap-4">
      <div className="inline-flex p-1 rounded-full border border-border bg-secondary/40">
        {ixOptions.map((o) => (
          <button
            key={o.key}
            onClick={() => setIx(o.key)}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] tracking-[0.18em] transition whitespace-nowrap ${
              ix === o.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {statusOptions.map((s) => {
          const active = statuses.includes(s.key);
          return (
            <button
              key={s.key}
              onClick={() => toggleStatus(s.key)}
              className={`px-2.5 py-1 rounded-full border text-[10px] tracking-[0.18em] transition whitespace-nowrap ${
                active ? `${s.cls} bg-secondary/60` : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/40 flex-1 min-w-[160px] sm:max-w-xs order-last sm:order-none w-full sm:w-auto">
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar holder, ASN ou mitigador"
          className="bg-transparent text-xs outline-none flex-1 min-w-0 placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="flex items-center gap-2 sm:ml-auto">
        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <select
          value={sortKey}
          onChange={(e) => setSort(e.target.value as SortKey, "asc")}
          className="bg-secondary border border-border rounded-full px-2.5 sm:px-3 py-1.5 text-[11px] tracking-[0.1em] text-foreground outline-none cursor-pointer max-w-[160px]"
          style={{ colorScheme: "dark" }}
        >
          {sortOptions.map((o) => (
            <option key={o.key} value={o.key} className="bg-popover text-foreground">
              {o.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setSort(sortKey)}
          className="px-2.5 py-1.5 rounded-full border border-border text-[10px] tracking-[0.18em] text-muted-foreground hover:text-foreground transition shrink-0"
          title="Inverter ordenação"
        >
          {sortDir === "asc" ? "↑" : "↓"}
        </button>
      </div>
    </div>
  );
}
