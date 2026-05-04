/**
 * Cliente HTTP para a API BGP Mining (refundação).
 * Todas as funções usam VITE_API_URL (fallback: localhost:8000).
 */
import type {
  AgregadoAsn,
  AgregadoMitigador,
  AsnDescoberto,
  ClientesMitigador,
  CommunityObservada,
  DoneEvent,
  HeatmapEstado,
  KpiData,
  MitigadorRef,
  ProgressEvent,
  ScanResult,
  Snapshot,
  TemporalDelta,
  TimelineBucket,
} from "@/types/api";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

// ── Scan ─────────────────────────────────────────────────────────────────────

export async function startScan(escopo: string, parametros?: Record<string, unknown>): Promise<ScanResult> {
  return req<ScanResult>(`/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ escopo, parametros }),
  });
}

export function subscribeToProgress(
  snapshotId: number,
  onProgress: (data: ProgressEvent) => void,
  onDone: (data: DoneEvent) => void,
  onError?: (msg?: string) => void
): () => void {
  const es = new EventSource(`${BASE}/api/scan/${snapshotId}/progress`);
  es.addEventListener("progress", (e) => onProgress(JSON.parse((e as MessageEvent).data)));
  es.addEventListener("snapshot", (e) => onProgress(JSON.parse((e as MessageEvent).data)));
  es.addEventListener("discover", (e) => onProgress(JSON.parse((e as MessageEvent).data)));
  es.addEventListener("candidates", (e) => onProgress(JSON.parse((e as MessageEvent).data)));
  es.addEventListener("done", (e) => {
    onDone(JSON.parse((e as MessageEvent).data));
    es.close();
  });
  es.addEventListener("error", (e) => {
    const data = (e as MessageEvent).data;
    let msg: string | undefined;
    if (data) {
      try { msg = JSON.parse(data).error; } catch { msg = String(data); }
    }
    onError?.(msg);
    es.close();
  });
  return () => es.close();
}

// ── Snapshots ────────────────────────────────────────────────────────────────

export async function getSnapshots(): Promise<Snapshot[]> {
  return req<Snapshot[]>(`/api/snapshots`);
}

export async function getSnapshot(id: number): Promise<Snapshot> {
  return req<Snapshot>(`/api/snapshots/${id}`);
}

export async function cancelSnapshot(id: number): Promise<{ ok: boolean }> {
  return req<{ ok: boolean }>(`/api/snapshots/${id}`, { method: "DELETE" });
}

// ── ASNs ─────────────────────────────────────────────────────────────────────

export async function getAsns(filters?: { estado?: string; regiao?: string; ix?: string }): Promise<AsnDescoberto[]> {
  const p = new URLSearchParams();
  if (filters?.estado) p.set("estado", filters.estado);
  if (filters?.regiao) p.set("regiao", filters.regiao);
  if (filters?.ix) p.set("ix", filters.ix);
  const qs = p.toString() ? `?${p}` : "";
  return req<AsnDescoberto[]>(`/api/asns${qs}`);
}

// ── Agregados ────────────────────────────────────────────────────────────────

export async function getAgregadoAsns(opts?: {
  snapshotId?: number | "latest" | "all";
  estado?: string;
  regiao?: string;
  status?: string;
}): Promise<AgregadoAsn[]> {
  const p = new URLSearchParams();
  if (opts?.snapshotId !== undefined) p.set("snapshot_id", String(opts.snapshotId));
  if (opts?.estado) p.set("estado", opts.estado);
  if (opts?.regiao) p.set("regiao", opts.regiao);
  if (opts?.status) p.set("status", opts.status);
  const qs = p.toString() ? `?${p}` : "";
  return req<AgregadoAsn[]>(`/api/agregados/asns${qs}`);
}

export async function getAgregadoMitigadores(snapshotId?: number | "latest" | "all"): Promise<AgregadoMitigador[]> {
  const qs = snapshotId !== undefined ? `?snapshot_id=${snapshotId}` : "";
  return req<AgregadoMitigador[]>(`/api/agregados/mitigadores${qs}`);
}

export async function getClientesDeMitigador(
  mitigadorAsn: number,
  snapshotId?: number | "latest"
): Promise<ClientesMitigador> {
  const qs = snapshotId !== undefined ? `?snapshot_id=${snapshotId}` : "";
  return req<ClientesMitigador>(`/api/agregados/clientes/${mitigadorAsn}${qs}`);
}

// ── Timeline / Delta ─────────────────────────────────────────────────────────

export async function getTimeline(opts?: {
  days?: number;
  estado?: string;
  regiao?: string;
  asnOrigem?: number;
}): Promise<TimelineBucket[]> {
  const p = new URLSearchParams();
  if (opts?.days) p.set("days", String(opts.days));
  if (opts?.estado) p.set("estado", opts.estado);
  if (opts?.regiao) p.set("regiao", opts.regiao);
  if (opts?.asnOrigem) p.set("asn_origem", String(opts.asnOrigem));
  const qs = p.toString() ? `?${p}` : "";
  return req<TimelineBucket[]>(`/api/timeline${qs}`);
}

export async function getTemporalDelta(n: number = 50): Promise<TemporalDelta[]> {
  return req<TemporalDelta[]>(`/api/temporal-delta?n=${n}`);
}

// ── Communities ──────────────────────────────────────────────────────────────

export async function getCommunities(opts?: { limit?: number; apenasBlackhole?: boolean }): Promise<CommunityObservada[]> {
  const p = new URLSearchParams();
  if (opts?.limit) p.set("limit", String(opts.limit));
  if (opts?.apenasBlackhole) p.set("apenas_blackhole", "true");
  const qs = p.toString() ? `?${p}` : "";
  return req<CommunityObservada[]>(`/api/communities${qs}`);
}

// ── Mapa ─────────────────────────────────────────────────────────────────────

export async function getMapa(): Promise<HeatmapEstado[]> {
  return req<HeatmapEstado[]>(`/api/mapa`);
}

// ── Stats ────────────────────────────────────────────────────────────────────

export async function getStats(snapshotId?: number | "latest" | "all"): Promise<KpiData> {
  const qs = snapshotId !== undefined ? `?snapshot_id=${snapshotId}` : "";
  return req<KpiData>(`/api/stats${qs}`);
}

// ── Mitigadores Ref ──────────────────────────────────────────────────────────

export async function getMitigadoresRef(): Promise<MitigadorRef[]> {
  return req<MitigadorRef[]>(`/api/mitigadores`);
}
