/**
 * Hook: useSnapshots
 * Lista todos os snapshots do backend e expõe o mais recente (status='done').
 */
import { useCallback, useEffect, useState } from "react";
import { getSnapshots } from "@/lib/api";
import type { Snapshot } from "@/types/api";

export function useSnapshots() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    getSnapshots()
      .then(setSnapshots)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao listar coletas"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Snapshots já vêm ordenados por iniciado_em desc no backend.
  const latest = snapshots.find((s) => s.status === "done") ?? null;

  return { snapshots, latest, loading, error, refetch };
}
