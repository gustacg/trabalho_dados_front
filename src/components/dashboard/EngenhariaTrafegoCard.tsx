import { useEngenhariaTrafego } from "@/hooks/useEngenhariaTrafego";
import { Activity, GitBranch, AlertTriangle } from "lucide-react";

interface Props {
  snapshotId?: number | "latest" | "all";
}

export function EngenhariaTrafegoCard({ snapshotId = "all" }: Props) {
  const { data, loading } = useEngenhariaTrafego(snapshotId);

  // Métricas globais
  const totalAsns = data.length;
  const comTransitOrigem = data.filter((d) => (d.pct_mit_transit_origem ?? 0) > 0).length;
  const totalObs = data.reduce((s, d) => s + d.total_obs, 0);
  const totalPrep = data.reduce((s, d) => s + d.com_prepending, 0);
  const totalTransit = data.reduce((s, d) => s + d.mit_transit_origem, 0);
  const pctPrep = totalObs ? Math.round((totalPrep / totalObs) * 100) : 0;
  const pctTransit = totalObs ? Math.round((totalTransit / totalObs) * 100) : 0;

  // Top suspeitos: mit_transit_origem alto + path stddev alto
  const top = [...data]
    .sort(
      (a, b) =>
        (b.pct_mit_transit_origem ?? 0) - (a.pct_mit_transit_origem ?? 0) ||
        (b.as_path_stddev ?? 0) - (a.as_path_stddev ?? 0)
    )
    .slice(0, 6);

  return (
    <div className="rounded-3xl border border-border gradient-card shadow-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] tracking-[0.32em] text-muted-foreground">
          Engenharia de tráfego
        </p>
        <span className="text-[9px] tracking-[0.2em] text-muted-foreground/70">
          AS-PATH · prepending · transit
        </span>
      </div>

      {loading && data.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">Carregando…</p>
      ) : data.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Sem dados de engenharia de tráfego ainda.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Metric icon={GitBranch} label="ASNs analisados" value={totalAsns} />
            <Metric icon={Activity} label="Prepending" value={`${pctPrep}%`} />
            <Metric icon={AlertTriangle} label="Mit transit" value={`${pctTransit}%`} />
          </div>

          <p className="text-[10px] tracking-[0.2em] text-muted-foreground mb-2">
            Top suspeitos (mitigador como penúltimo AS)
          </p>
          <ul className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {top.map((d) => (
              <li
                key={`${d.snapshot_id}-${d.asn_origem}`}
                className="flex items-center justify-between text-[11px] gap-2 px-2 py-1 rounded-lg bg-secondary/30"
              >
                <span className="truncate text-foreground/85">
                  {d.nome_holder || `AS${d.asn_origem}`}
                </span>
                <span className="font-mono text-muted-foreground tabular-nums shrink-0">
                  {Number(d.pct_mit_transit_origem ?? 0).toFixed(0)}% · σ
                  {Number(d.as_path_stddev ?? 0).toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[9px] tracking-[0.2em] text-muted-foreground/60 mt-3">
            Fonte: vw_engenharia_trafego · {comTransitOrigem} ASN(s) com mitigador
            como transit penúltimo
          </p>
        </>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/20 px-3 py-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span className="text-[9px] tracking-[0.18em] uppercase">{label}</span>
      </div>
      <p className="text-base sm:text-lg font-semibold tabular-nums mt-1">{value}</p>
    </div>
  );
}
