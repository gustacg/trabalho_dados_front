/**
 * Hook: useScan
 * Orquestra POST /api/scan + SSE /api/scan/{id}/progress
 * Retorna estado do scan e funções de controle.
 */
import { useCallback, useRef, useState } from "react";
import { startScan, subscribeToProgress } from "@/lib/api";
import type { DoneEvent, ProgressEvent } from "@/types/api";

export interface ScanState {
  scanning: boolean;
  snapshotId: number | null;
  progress: ProgressEvent | null;
  totalOperadoras: number;
  done: boolean;
  error: string | null;
}

export function useScan() {
  const [state, setState] = useState<ScanState>({
    scanning: false,
    snapshotId: null,
    progress: null,
    totalOperadoras: 0,
    done: false,
    error: null,
  });

  const cleanupRef = useRef<(() => void) | null>(null);

  const iniciarScan = useCallback(async (ixs: string[], nome?: string) => {
    if (ixs.length === 0) return;

    setState((s) => ({
      ...s,
      scanning: true,
      done: false,
      error: null,
      progress: null,
      snapshotId: null,
    }));

    try {
      const result = await startScan(ixs, nome);

      setState((s) => ({
        ...s,
        snapshotId: result.snapshot_id,
        totalOperadoras: result.total_operadoras,
      }));

      const cleanup = subscribeToProgress(
        result.snapshot_id,
        (data: ProgressEvent) => {
          setState((s) => ({ ...s, progress: data }));
        },
        (_data: DoneEvent) => {
          setState((s) => ({
            ...s,
            scanning: false,
            done: true,
            progress: null,
          }));
        },
        () => {
          setState((s) => ({
            ...s,
            scanning: false,
            error: "Conexão com o servidor perdida.",
          }));
        }
      );

      cleanupRef.current = cleanup;
    } catch (err) {
      setState((s) => ({
        ...s,
        scanning: false,
        error: err instanceof Error ? err.message : "Erro desconhecido",
      }));
    }
  }, []);

  const cancelarScan = useCallback(() => {
    cleanupRef.current?.();
    setState((s) => ({ ...s, scanning: false }));
  }, []);

  return { state, iniciarScan, cancelarScan };
}
