/**
 * Tipos compartilhados para a UI.
 * Refundação 2026-05-04: removidos `buildTimeline` e `timelineData` (mock random).
 * Mocks de fallback (`operators`, `topMitigators`) preservados — usados se a API
 * estiver offline em ambiente de desenvolvimento.
 */
export type OperatorStatus = "attack" | "normal" | "none";

export interface Operator {
  id: string;
  /** Nome exibido — pode ser holder anonimizado (OP-XXXX) ou holder real */
  name: string;
  /** Identificador de IX/região para filtros — ex.: "IX Maranhão" / estado / "—" */
  ix: string;
  /** Lista de NOMES de mitigadores detectados (não ASNs string) */
  mitigators: string[];
  prefixes24: number;
  mitigatedPercent: number;
  status: OperatorStatus;
  /** ASN de origem (numero) — usado para drill-down */
  asn?: number;
  /** UF normalizada para filtros */
  estado?: string | null;
  /** Região macro */
  regiao?: string | null;
  /** Flag: mitigador detectado é do tipo `misto` (Algar) — apresentação no UI */
  hasMixedMitigator?: boolean;
  /** Padrões observados */
  blackhole?: number;
  prepending?: number;
}

/** Fallback de operadoras — só usado se API estiver indisponível em dev */
export const operators: Operator[] = [];

export const topMitigators: { asn: string; company: string; count: number }[] = [];
