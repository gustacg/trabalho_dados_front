import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { Operator, OperatorStatus } from "@/data/mockData";

export type IxFilter = "ALL" | "IX Maranhão" | "IX Ceará";
export type SortKey = "name" | "prefixes24" | "mitigatedPercent" | "status";
export type SortDir = "asc" | "desc";

interface Ctx {
  ix: IxFilter;
  setIx: (v: IxFilter) => void;
  statuses: OperatorStatus[];
  toggleStatus: (s: OperatorStatus) => void;
  search: string;
  setSearch: (s: string) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  setSort: (k: SortKey, d?: SortDir) => void;
  filtered: Operator[];
  total: number;
}

const C = createContext<Ctx | null>(null);

const statusRank: Record<OperatorStatus, number> = { attack: 0, none: 1, normal: 2 };

interface ProviderProps {
  children: ReactNode;
  /** ASNs descobertos (operators reais) — sobrescreve o mock */
  operators?: Operator[];
}

export function DashboardFiltersProvider({ children, operators }: ProviderProps) {
  const [ix, setIx] = useState<IxFilter>("ALL");
  const [statuses, setStatuses] = useState<OperatorStatus[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleStatus = (s: OperatorStatus) =>
    setStatuses((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const setSort = (k: SortKey, d?: SortDir) => {
    setSortKey(k);
    if (d) setSortDir(d);
    else if (k === sortKey) setSortDir((p) => (p === "asc" ? "desc" : "asc"));
    else setSortDir("asc");
  };

  const filtered = useMemo(() => {
    const all = operators ?? [];
    const q = search.trim().toLowerCase();
    let list = all.filter((o) => {
      // Filtro IX por estado: IX Maranhão → MA, IX Ceará → CE
      if (ix === "IX Maranhão" && (o.estado || "") !== "MA") return false;
      if (ix === "IX Ceará" && (o.estado || "") !== "CE") return false;
      if (statuses.length && !statuses.includes(o.status)) return false;
      if (q) {
        const inName = o.name.toLowerCase().includes(q);
        const inMit = o.mitigators.some((m) => m.toLowerCase().includes(q));
        const inAsn = String(o.asn ?? "").includes(q);
        if (!inName && !inMit && !inAsn) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      let r = 0;
      if (sortKey === "name") r = a.name.localeCompare(b.name);
      else if (sortKey === "prefixes24") r = a.prefixes24 - b.prefixes24;
      else if (sortKey === "mitigatedPercent") r = a.mitigatedPercent - b.mitigatedPercent;
      else r = statusRank[a.status] - statusRank[b.status];
      return sortDir === "asc" ? r : -r;
    });
    return list;
  }, [operators, ix, statuses, search, sortKey, sortDir]);

  const total = (operators ?? []).length;

  return (
    <C.Provider value={{ ix, setIx, statuses, toggleStatus, search, setSearch, sortKey, sortDir, setSort, filtered, total }}>
      {children}
    </C.Provider>
  );
}

export function useDashboardFilters() {
  const v = useContext(C);
  if (!v) throw new Error("useDashboardFilters must be used within DashboardFiltersProvider");
  return v;
}
