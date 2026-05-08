import { useMlKmeans } from "@/hooks/useMl";
import { Boxes } from "lucide-react";

export function MlClustersCard() {
  const { data, loading } = useMlKmeans();

  const k = (data?.run.metricas as { k_chosen?: number } | null)?.k_chosen;
  const sizes = (data?.run.metricas as { cluster_sizes?: Record<string, number> } | null)
    ?.cluster_sizes;
  const cross = (data?.run.metricas as {
    cross_tab_pct?: Record<string, Record<string, number>>;
  } | null)?.cross_tab_pct;
  const silh = (data?.run.metricas as { silhouettes?: number[] } | null)?.silhouettes;
  const silh_max = silh?.length ? Math.max(...silh) : null;

  const clusters = sizes ? Object.keys(sizes).map(Number).sort((a, b) => a - b) : [];

  return (
    <div className="rounded-3xl border border-border gradient-card shadow-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] tracking-[0.32em] text-muted-foreground">
          Agrupamentos (KMeans)
        </p>
        <span className="text-[9px] tracking-[0.2em] text-muted-foreground/70 flex items-center gap-1">
          <Boxes className="h-3 w-3" />
          k = {k ?? "?"}
        </span>
      </div>

      {loading && !data ? (
        <p className="text-xs text-muted-foreground text-center py-6">Carregando…</p>
      ) : !data || !sizes ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Pipeline ML ainda não rodou. Aguarde próximo auto-scan.
        </p>
      ) : (
        <>
          <ul className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {clusters.map((c) => {
              const dist = cross?.[String(c)] ?? {};
              const total = sizes[String(c)] ?? 0;
              return (
                <li
                  key={c}
                  className="rounded-2xl border border-border/60 bg-secondary/20 px-3 py-2"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-foreground/85">
                      Cluster {c}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      n = {total}
                    </span>
                  </div>
                  <div className="flex h-1.5 rounded-full overflow-hidden bg-secondary">
                    <Bar pct={dist.ATAQUE_SUSPEITO} className="bg-status-attack" />
                    <Bar pct={dist.OPERACAO_NORMAL} className="bg-status-normal" />
                    <Bar pct={dist.SEM_MITIGACAO} className="bg-status-none" />
                  </div>
                  <div className="flex justify-between text-[9px] mt-1 tracking-wider text-muted-foreground/70">
                    {dist.ATAQUE_SUSPEITO != null && (
                      <span className="text-status-attack">
                        atk {dist.ATAQUE_SUSPEITO?.toFixed(0)}%
                      </span>
                    )}
                    {dist.OPERACAO_NORMAL != null && (
                      <span className="text-status-normal">
                        nrm {dist.OPERACAO_NORMAL?.toFixed(0)}%
                      </span>
                    )}
                    {dist.SEM_MITIGACAO != null && (
                      <span className="text-muted-foreground">
                        sem {dist.SEM_MITIGACAO?.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {silh_max !== null && (
            <p className="text-[9px] tracking-[0.2em] text-muted-foreground/60 mt-3">
              Silhouette máx: {silh_max.toFixed(3)} · {data.clusters.length} ASNs atribuídos
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Bar({ pct, className }: { pct: number | undefined; className: string }) {
  if (!pct) return null;
  return <div className={`h-full ${className}`} style={{ width: `${pct}%` }} />;
}
