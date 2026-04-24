/**
 * Tipos TypeScript que espelham os schemas Pydantic do backend.
 * Mapeamento: backend (Python) → frontend (TypeScript)
 *   status_ataque: "ATAQUE_SUSPEITO" → status: "attack"
 *   status_ataque: "OPERACAO_NORMAL" → status: "normal"
 *   status_ataque: "SEM_MITIGACAO"   → status: "none"
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
  nome: string | null;
  iniciado_em: string;
  finalizado_em: string | null;
  status: "running" | "done" | "error";
  total_operadoras: number;
  ixs_selecionados: string[];
  periodo: string;
}

export interface ResultadoOperadora {
  id: number;
  snapshot_id: number;
  operadora_id: number;
  asns_analisados: number[];
  prefixos_24_total: number;
  prefixos_24_amostrados: number;
  prefixos_com_mitigador: number;
  percentual_mitigado: number;
  mitigadores_detectados: string[];
  qtd_mitigadores_distintos: number;
  status_ataque: AttackStatus;
  mitigador_dominante: string | null;
  percentual_dominancia: number | null;
  timestamp_coleta: string;
  // joined
  operadoras?: {
    id: number;
    nome: string;
    asns: number[];
    ix: string;
    cidade: string;
    estado: string;
  };
}

export interface KpiData {
  total_operadoras: number;
  sem_mitigacao: number;
  operacao_normal: number;
  ataque_suspeito: number;
  total_prefixos_24: number;
  redundancia_pct: number;
  top_mitigadores: { nome: string; quantidade: number }[];
}

export interface ProgressEvent {
  current: number;
  total: number;
  operadora: string;
  status: "collecting" | "classified" | "error" | "db_error";
  result?: AttackStatus;
  error?: string;
}

export interface DoneEvent {
  snapshot_id: number;
  total: number;
}

export interface ScanResult {
  snapshot_id: number;
  total_operadoras: number;
}
