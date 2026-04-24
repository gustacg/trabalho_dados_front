export type OperatorStatus = "attack" | "normal" | "none";

export interface Operator {
  id: string;
  name: string;
  ix: "IX Maranhão" | "IX Ceará";
  mitigators: string[]; // ASNs
  prefixes24: number;
  mitigatedPercent: number;
  status: OperatorStatus;
}

export const operators: Operator[] = [
  { id: "1", name: "Brisanet Telecom", ix: "IX Ceará", mitigators: ["AS28126", "AS262907"], prefixes24: 412, mitigatedPercent: 96, status: "normal" },
  { id: "2", name: "MaraNet Provedor", ix: "IX Maranhão", mitigators: ["AS61568"], prefixes24: 128, mitigatedPercent: 41, status: "attack" },
  { id: "3", name: "Cabo Telecom NE", ix: "IX Ceará", mitigators: ["AS53062", "AS264479", "AS61832"], prefixes24: 287, mitigatedPercent: 99, status: "normal" },
  { id: "4", name: "Fortalnet Fibra", ix: "IX Ceará", mitigators: [], prefixes24: 64, mitigatedPercent: 0, status: "none" },
  { id: "5", name: "Imperatriz Online", ix: "IX Maranhão", mitigators: ["AS268874", "AS61945"], prefixes24: 156, mitigatedPercent: 88, status: "normal" },
  { id: "6", name: "São Luís Conecta", ix: "IX Maranhão", mitigators: ["AS262471"], prefixes24: 92, mitigatedPercent: 38, status: "attack" },
  { id: "7", name: "Caucaia Net", ix: "IX Ceará", mitigators: [], prefixes24: 31, mitigatedPercent: 0, status: "none" },
  { id: "8", name: "Sobral Fibra+", ix: "IX Ceará", mitigators: ["AS264112", "AS268001"], prefixes24: 178, mitigatedPercent: 92, status: "normal" },
  { id: "9", name: "Codó Telecom", ix: "IX Maranhão", mitigators: ["AS269311"], prefixes24: 47, mitigatedPercent: 33, status: "attack" },
  { id: "10", name: "Pacajus Provider", ix: "IX Ceará", mitigators: ["AS264820", "AS61644", "AS267123"], prefixes24: 224, mitigatedPercent: 97, status: "normal" },
  { id: "11", name: "Bacabal Web", ix: "IX Maranhão", mitigators: [], prefixes24: 22, mitigatedPercent: 0, status: "none" },
  { id: "12", name: "Crateús Conecta", ix: "IX Ceará", mitigators: ["AS268995", "AS262345"], prefixes24: 134, mitigatedPercent: 89, status: "normal" },
];

export const topMitigators = [
  { asn: "AS28126", company: "Brisanet", count: 412 },
  { asn: "AS53062", company: "Cabo Telecom", count: 287 },
  { asn: "AS264820", company: "Pacajus", count: 224 },
  { asn: "AS268874", company: "Imperatriz", count: 156 },
  { asn: "AS264112", company: "Sobral Fibra", count: 178 },
];

// Timeline heatmap: each operator x 24 hours, intensity = redundancy loss events (0-3)
export function buildTimeline(list: Operator[]) {
  return list.map((op) => ({
    name: op.name,
    ix: op.ix,
    values: Array.from({ length: 24 }, () => {
      if (op.status === "attack") return Math.random() > 0.55 ? Math.ceil(Math.random() * 3) : 0;
      if (op.status === "none") return Math.random() > 0.7 ? 1 : 0;
      return Math.random() > 0.9 ? 1 : 0;
    }),
  }));
}

export const timelineData = buildTimeline(operators.slice(0, 8));

export const stats = {
  totalPrefixes: operators.reduce((s, o) => s + o.prefixes24, 0),
  withRedundancy: operators.filter((o) => o.mitigators.length >= 2).length,
  withoutRedundancy: operators.filter((o) => o.mitigators.length === 1).length,
  noMitigation: operators.filter((o) => o.mitigators.length === 0).length,
  attack: operators.filter((o) => o.status === "attack").length,
  normal: operators.filter((o) => o.status === "normal").length,
  none: operators.filter((o) => o.status === "none").length,
};
