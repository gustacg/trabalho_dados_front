import { useMemo } from "react";
import { useMapa } from "@/hooks/useMapa";

const ESTADOS_NE = ["MA", "PI", "CE", "RN", "PB", "PE", "AL", "SE", "BA"];

const ESTADO_NOMES: Record<string, string> = {
  MA: "Maranhão", PI: "Piauí", CE: "Ceará", RN: "Rio G. Norte",
  PB: "Paraíba", PE: "Pernambuco", AL: "Alagoas", SE: "Sergipe", BA: "Bahia",
};

function colorForPct(pct: number | null | undefined): string {
  if (pct == null) return "hsl(222 22% 16%)";
  if (pct === 0) return "hsl(var(--status-normal) / 0.35)";
  if (pct < 25) return "hsl(var(--status-normal) / 0.55)";
  if (pct < 50) return "hsl(var(--accent) / 0.7)";
  if (pct < 75) return "hsl(var(--accent) / 0.95)";
  return "hsl(var(--status-attack))";
}

export function MapaNordesteCard() {
  const { data, loading } = useMapa();

  const byUf = useMemo(() => {
    const m = new Map<string, { asns_total: number; asns_em_ataque: number; pct: number | null }>();
    for (const r of data) {
      const cur = m.get(r.estado);
      if (!cur || r.asns_total > cur.asns_total) {
        m.set(r.estado, {
          asns_total: r.asns_total,
          asns_em_ataque: r.asns_em_ataque,
          pct: r.pct_em_ataque,
        });
      }
    }
    return m;
  }, [data]);

  return (
    <div className="rounded-3xl border border-border gradient-card shadow-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] tracking-[0.32em] text-muted-foreground">
          Mapa regional · Nordeste
        </p>
        <div className="flex items-center gap-1.5 text-[9px] tracking-[0.2em] text-muted-foreground">
          <span>0%</span>
          <div className="flex gap-1">
            {[null, 0, 30, 60, 90].map((v, i) => (
              <span
                key={i}
                className="h-3 w-3 rounded"
                style={{ background: colorForPct(v as number | null) }}
              />
            ))}
          </div>
          <span>100%</span>
        </div>
      </div>

      {loading && data.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">Carregando…</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
          {ESTADOS_NE.map((uf) => {
            const v = byUf.get(uf);
            const pct = v?.pct ?? null;
            const tip = v
              ? `${ESTADO_NOMES[uf]}: ${v.asns_em_ataque}/${v.asns_total} ASN(s) com padrão atípico (${pct}%)`
              : `${ESTADO_NOMES[uf]}: sem dados`;
            return (
              <div
                key={uf}
                title={tip}
                className="rounded-2xl border border-border/60 px-3 py-3 flex flex-col gap-1.5 transition-transform hover:scale-[1.02]"
                style={{ background: colorForPct(pct) }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.2em] text-foreground/85">{uf}</span>
                  {pct != null && (
                    <span className="text-[10px] font-mono tabular-nums text-foreground/85">
                      {pct.toFixed(0)}%
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-wider text-foreground/70 truncate">
                  {ESTADO_NOMES[uf]}
                </span>
                <span className="text-[10px] font-mono tabular-nums text-foreground/60">
                  {v ? `${v.asns_em_ataque}/${v.asns_total}` : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[9px] tracking-[0.2em] text-muted-foreground mt-3">
        Granularidade por estado · agregação anonimizada · cor = % ASNs em padrão atípico
      </p>
    </div>
  );
}
