/**
 * Hook: useResults — busca agregado_asn_snapshot do backend novo.
 * Adapta para o tipo Operator usado pela UI.
 */
import { useEffect, useState } from "react";
import { getAgregadoAsns, getStats, getAgregadoMitigadores } from "@/lib/api";
import type { AgregadoAsn, AgregadoMitigador, KpiData } from "@/types/api";
import { toFrontendStatus } from "@/types/api";
import type { Operator } from "@/data/mockData";

export type SnapshotMode = number | "latest" | "all";

const ALGAR_ASNS = new Set<number>([16735, 53006]);
const MIXED_ASNS = new Set<number>([...ALGAR_ASNS]); // adicionar outros mistos se vierem

export function toOperator(r: AgregadoAsn, mitNomes: Map<number, string>): Operator {
  const mitNomesList = (r.mitigadores_distintos || [])
    .map((asn) => mitNomes.get(asn) || `AS${asn}`);
  const ix = r.ix_membership && r.ix_membership[0]
    ? r.ix_membership[0]
    : r.estado || r.regiao || "—";
  const hasMixed = (r.mitigadores_distintos || []).some((a) => MIXED_ASNS.has(a));
  return {
    id: `${r.snapshot_id}-${r.asn_origem}`,
    name: r.nome_holder || `AS${r.asn_origem}`,
    ix,
    mitigators: mitNomesList,
    prefixes24: r.total_24,
    mitigatedPercent: r.pct_mitigado,
    status: toFrontendStatus(r.status_ataque),
    asn: r.asn_origem,
    estado: r.estado,
    regiao: r.regiao,
    hasMixedMitigator: hasMixed,
    blackhole: r.com_blackhole,
    prepending: r.com_prepending,
  };
}

export function useResults(snapshotId: SnapshotMode | null) {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [raw, setRaw] = useState<AgregadoAsn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (snapshotId === null) return;
    setLoading(true);
    setError(null);

    Promise.all([
      getAgregadoAsns({ snapshotId }),
      getAgregadoMitigadores(snapshotId),
    ])
      .then(([data, mits]) => {
        const mitMap = new Map<number, string>();
        for (const m of mits) mitMap.set(m.mitigador_asn, m.mitigador_nome);
        // Dedupe defensivo por asn_origem (modo all)
        const seen = new Map<number, AgregadoAsn>();
        for (const r of data) {
          const cur = seen.get(r.asn_origem);
          if (!cur || r.snapshot_id > cur.snapshot_id) seen.set(r.asn_origem, r);
        }
        const dedup = Array.from(seen.values());
        setRaw(dedup);
        setOperators(dedup.map((r) => toOperator(r, mitMap)));
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [snapshotId]);

  return { operators, raw, loading, error };
}

export function useStats(snapshotId: SnapshotMode | null) {
  const [stats, setStats] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (snapshotId === null) return;
    setLoading(true);
    setError(null);

    getStats(snapshotId)
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [snapshotId]);

  return { stats, loading, error };
}

export function useMitigadores(snapshotId: SnapshotMode | null) {
  const [data, setData] = useState<AgregadoMitigador[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (snapshotId === null) return;
    setLoading(true);
    getAgregadoMitigadores(snapshotId)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [snapshotId]);

  return { data, loading };
}
