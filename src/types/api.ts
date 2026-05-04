/**
 * Tipos TypeScript que espelham os schemas Pydantic do backend (refundação).
 * Mapeamento status_ataque → status:
 *   "ATAQUE_SUSPEITO" → "attack"  (UI: "Padrão atípico")
 *   "OPERACAO_NORMAL" → "normal"
 *   "SEM_MITIGACAO"   → "none"
 */

export type AttackStatus = "ATAQUE_SUSPEITO" | "OPERACAO_NORMAL" | "SEM_MITIGACAO";
export type FrontendStatus = "attack" | "normal" | "none";

export function toFrontendStatus(s: AttackStatus): FrontendStatus {
  if (s === "ATAQUE_SUSPEITO") return "attack";
  if (s === "OPERACAO_NORMAL") return "normal";
  return "none";
}

export interface Snapshot {
  id: number;
  iniciado_em: string;
  finalizado_em: string | null;
  status: "running" | "done" | "error" | "cancelled";
  origem: "manual" | "auto" | "backfill";
  escopo: string;
  total_observacoes: number;
  total_asns_origem: number;
  total_mitigadores: number;
  erro_msg: string | null;
  parametros: Record<string, unknown> | null;
}

export interface MitigadorRef {
  asn: number;
  nome: string;
  pais: string;
  tipo: "puro" | "misto";
  observacao: string | null;
}

export interface AsnDescoberto {
  asn: number;
  nome_holder: string | null;
  pais: string | null;
  estado: string | null;
  cidade: string | null;
  regiao: string | null;
  ix_membership: string[];
  asn_seed_nome: string | null;
  primeiro_visto: string;
  ultimo_visto: string;
}

export interface AgregadoAsn {
  snapshot_id: number;
  asn_origem: number;
  total_24: number;
  com_mitigador: number;
  pct_mitigado: number;
  mitigadores_distintos: number[];
  qtd_mitigadores: number;
  status_ataque: AttackStatus;
  com_blackhole: number;
  com_prepending: number;
  as_path_length_avg: number | null;
  // joined
  nome_holder: string | null;
  estado: string | null;
  regiao: string | null;
  cidade?: string | null;
  ix_membership?: string[];
}

export interface AgregadoMitigador {
  snapshot_id: number;
  mitigador_asn: number;
  mitigador_nome: string;
  mitigador_tipo: "puro" | "misto";
  mitigador_pais?: string;
  total_clientes: number;
  total_24: number;
  asns_clientes: number[];
  pct_dominancia_avg: number | null;
}

export interface TimelineBucket {
  bucket: string; // YYYY-MM-DD
  asn_origem: number;
  nome_holder: string | null;
  estado: string | null;
  regiao: string | null;
  status_ataque: AttackStatus | "NO_DATA";
  pct_mitigado_max: number | null;
  snapshots_no_bucket: number;
}

export interface TemporalDelta {
  asn_origem: number;
  snapshot_atual: number;
  snapshot_anterior: number;
  status_anterior: AttackStatus;
  status_atual: AttackStatus;
  delta_pct: number;
  delta_qtd_mitigadores: number;
  nome_holder?: string | null;
  estado?: string | null;
  regiao?: string | null;
}

export interface HeatmapEstado {
  bucket: string;
  estado: string;
  asns_total: number;
  asns_em_ataque: number;
  pct_em_ataque: number;
}

export interface CommunityObservada {
  community: string;
  asn_dono: number | null;
  is_blackhole: boolean;
  rotulo: string | null;
  primeira_vez: string;
  ultima_vez: string;
  ocorrencias: number;
}

export interface KpiData {
  snapshot_id: number | null;
  total_asns: number;
  sem_mitigacao: number;
  operacao_normal: number;
  ataque_suspeito: number;
  total_24: number;
  redundancia_pct: number;
  top_mitigadores: { asn: number; nome: string; tipo: "puro" | "misto"; quantidade: number }[];
}

export interface ProgressEvent {
  current?: number;
  total?: number;
  asn?: number;
  status?: string;
  result?: string;
  error?: string;
  // discovery events
  mitigador?: string;
  count?: number;
  // snapshot event
  id?: number;
  escopo?: string;
}

export interface DoneEvent {
  snapshot_id: number;
  total_obs: number;
  total_asns: number;
  total_mits: number;
}

export interface ScanResult {
  snapshot_id: number;
  escopo: string;
}

export interface ClientesMitigador {
  mitigador_asn: number;
  snapshot_id: number;
  clientes: AgregadoAsn[];
}
