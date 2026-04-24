/**
 * Cliente HTTP para a API BGP Mining.
 * Todas as funções usam VITE_API_URL (fallback: localhost:8000).
 */
import type {
  DoneEvent,
  KpiData,
  ProgressEvent,
  ResultadoOperadora,
  ScanResult,
  Snapshot,
} from "@/types/api";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ── Scan ─────────────────────────────────────────────────────────────────────

export async function startScan(
  ixs: string[],
  nome?: string
): Promise<ScanResult> {
  const res = await fetch(`${BASE}/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ixs, nome }),
  });
  if (!res.ok) throw new Error(`Erro ao iniciar scan: HTTP ${res.status}`);
  return res.json();
}

/**
 * Assina o SSE de progresso de um snapshot.
 * Retorna função de cleanup (fechar EventSource).
 */
export function subscribeToProgress(
  snapshotId: number,
  onProgress: (data: ProgressEvent) => void,
  onDone: (data: DoneEvent) => void,
  onError?: () => void
): () => void {
  const es = new EventSource(`${BASE}/api/scan/${snapshotId}/progress`);
  es.addEventListener("progress", (e) => onProgress(JSON.parse(e.data)));
  es.addEventListener("done", (e) => {
    onDone(JSON.parse(e.data));
    es.close();
  });
  es.addEventListener("error", () => {
    onError?.();
    es.close();
  });
  return () => es.close();
}

// ── Snapshots ─────────────────────────────────────────────────────────────────

export async function getSnapshots(): Promise<Snapshot[]> {
  const res = await fetch(`${BASE}/api/snapshots`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getSnapshot(id: number): Promise<Snapshot> {
  const res = await fetch(`${BASE}/api/snapshots/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Results ───────────────────────────────────────────────────────────────────

export async function getResults(
  snapshotId: number | "all",
  status?: string,
  ix?: string
): Promise<ResultadoOperadora[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (ix) params.set("ix", ix);
  const qs = params.toString() ? `?${params}` : "";
  const res = await fetch(`${BASE}/api/results/${snapshotId}${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function getStats(snapshotId: number | "all"): Promise<KpiData> {
  const res = await fetch(`${BASE}/api/stats/${snapshotId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Operators ─────────────────────────────────────────────────────────────────

export async function getOperators(ix?: string, estado?: string) {
  const params = new URLSearchParams();
  if (ix) params.set("ix", ix);
  if (estado) params.set("estado", estado);
  const qs = params.toString() ? `?${params}` : "";
  const res = await fetch(`${BASE}/api/operators${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Mitigators ────────────────────────────────────────────────────────────────

export async function getMitigators(
  snapshotId?: number
): Promise<{ nome: string; quantidade: number }[]> {
  const qs = snapshotId ? `?snapshot_id=${snapshotId}` : "";
  const res = await fetch(`${BASE}/api/mitigators${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
