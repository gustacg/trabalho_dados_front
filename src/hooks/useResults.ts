/**
 * Hook: useResults
 * Busca resultados de um snapshot e adapta ao formato do frontend.
 */
import { useEffect, useState } from "react";
import { getResults, getStats } from "@/lib/api";
import type { KpiData, ResultadoOperadora } from "@/types/api";
import { toFrontendStatus } from "@/types/api";
import type { Operator } from "@/data/mockData";

/** Converte ResultadoOperadora → Operator (formato do frontend existente) */
export function toOperator(r: ResultadoOperadora): Operator {
  const op = r.operadoras;
  return {
    id: String(r.id),
    name: op?.nome ?? `Operadora #${r.operadora_id}`,
    ix: (op?.ix ?? "Nacional") as Operator["ix"],
    mitigators: r.mitigadores_detectados,
    prefixes24: r.prefixos_24_total,
    mitigatedPercent: r.percentual_mitigado,
    status: toFrontendStatus(r.status_ataque),
  };
}

export function useResults(snapshotId: number | "all" | null) {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [raw, setRaw] = useState<ResultadoOperadora[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (snapshotId === null) return;
    setLoading(true);
    setError(null);

    getResults(snapshotId)
      .then((data) => {
        setRaw(data);
        setOperators(data.map(toOperator));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [snapshotId]);

  return { operators, raw, loading, error };
}

export function useStats(snapshotId: number | "all" | null) {
  const [stats, setStats] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (snapshotId === null) return;
    setLoading(true);
    setError(null);

    getStats(snapshotId)
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [snapshotId]);

  return { stats, loading, error };
}
