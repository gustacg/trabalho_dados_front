/**
 * Hook: useScan
 * POST /api/scan + SSE /api/scan/{id}/progress (duas fases: descoberta + coleta).
 */
import { useCallback, useRef, useState } from "react";
import { startScan, subscribeToProgress } from "@/lib/api";
import type { DoneEvent, ProgressEvent } from "@/types/api";

export interface DiscoveryProgress {
  subPhase: "neighbor" | "enrich";
  mitigador?: string;
  current: number;
  total: number;
  asn?: number;
  encontrados?: number;
}

export interface CollectionProgress {
  current: number;
  total: number;
  asn?: number;
  status?: string;
}

export type ScanPhase = "idle" | "discovering" | "enriching" | "collecting" | "done";

export interface ScanState {
  scanning: boolean;
  snapshotId: number | null;
  scanPhase: ScanPhase;
  discovery: DiscoveryProgress | null;
  collection: CollectionProgress | null;
  totalCandidates: number;
  done: boolean;
  error: string | null;
  escopo: string | null;
}

export function useScan() {
  const [state, setState] = useState<ScanState>({
    scanning: false,
    snapshotId: null,
    scanPhase: "idle",
    discovery: null,
    collection: null,
    totalCandidates: 0,
    done: false,
    error: null,
    escopo: null,
  });
  const cleanupRef = useRef<(() => void) | null>(null);

  const iniciarScan = useCallback(async (escopo: string) => {
    setState({
      scanning: true,
      snapshotId: null,
      scanPhase: "idle",
      discovery: null,
      collection: null,
      totalCandidates: 0,
      done: false,
      error: null,
      escopo,
    });

    try {
      const result = await startScan(escopo);
      setState((s) => ({ ...s, snapshotId: result.snapshot_id }));

      const cleanup = subscribeToProgress(
        result.snapshot_id,
        (data: ProgressEvent) => {
          setState((s) => {
            const next: ScanState = { ...s };

            if (data.mitigador !== undefined) {
              // discover: vizinhos BGP por mitigador
              next.scanPhase = "discovering";
              next.discovery = {
                subPhase: "neighbor",
                mitigador: data.mitigador,
                asn: data.asn,
                current: data.current ?? 0,
                total: data.total ?? 0,
              };
            } else if (data.encontrados !== undefined) {
              // enrich_progress: geo-enriquecimento por candidato
              next.scanPhase = "enriching";
              next.discovery = {
                subPhase: "enrich",
                asn: data.asn,
                current: data.current ?? 0,
                total: data.total ?? 0,
                encontrados: data.encontrados,
              };
            } else if (data.count !== undefined && data.asn === undefined) {
              // candidates: fase 1 concluída
              next.totalCandidates = data.count;
              next.scanPhase = "collecting";
              next.discovery = null;
            } else if (data.current !== undefined && data.asn !== undefined) {
              // progress: coleta BGP por candidato
              next.scanPhase = "collecting";
              next.collection = {
                current: data.current,
                total: data.total ?? 0,
                asn: data.asn,
                status: data.status,
              };
            }

            return next;
          });
        },
        (_data: DoneEvent) => {
          setState((s) => ({
            ...s,
            scanning: false,
            scanPhase: "done",
            done: true,
            collection: null,
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
