/**
 * Hook: useScan
 * POST /api/scan + SSE /api/scan/{id}/progress (refundação: escopo em vez de IXs).
 */
import { useCallback, useRef, useState } from "react";
import { startScan, subscribeToProgress } from "@/lib/api";
import type { DoneEvent, ProgressEvent } from "@/types/api";

export interface ScanState {
  scanning: boolean;
  snapshotId: number | null;
  progress: ProgressEvent | null;
  totalCandidates: number;
  done: boolean;
  error: string | null;
  escopo: string | null;
  mitigadorAtual: string | null;
}

export function useScan() {
  const [state, setState] = useState<ScanState>({
    scanning: false,
    snapshotId: null,
    progress: null,
    totalCandidates: 0,
    done: false,
    error: null,
    escopo: null,
    mitigadorAtual: null,
  });
  const cleanupRef = useRef<(() => void) | null>(null);

  const iniciarScan = useCallback(async (escopo: string) => {
    setState((s) => ({
      ...s,
      scanning: true,
      done: false,
      error: null,
      progress: null,
      snapshotId: null,
      escopo,
      mitigadorAtual: null,
    }));

    try {
      const result = await startScan(escopo);
      setState((s) => ({ ...s, snapshotId: result.snapshot_id }));

      const cleanup = subscribeToProgress(
        result.snapshot_id,
        (data: ProgressEvent) => {
          setState((s) => {
            const next: ScanState = { ...s, progress: data };
            if (data.count !== undefined && data.asn === undefined && data.mitigador === undefined) {
              next.totalCandidates = data.count;
            }
            if (data.mitigador) next.mitigadorAtual = data.mitigador;
            return next;
          });
        },
        (_data: DoneEvent) => {
          setState((s) => ({
            ...s,
            scanning: false,
            done: true,
            progress: null,
          }));
        },
        (msg) => {
          setState((s) => ({
            ...s,
            scanning: false,
            error: msg ?? "Conexão com o servidor perdida.",
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
