import { usePipelineHealth } from "@/hooks/usePipelineHealth";
import { Activity, Database, AlertCircle, MapPin } from "lucide-react";

function formatDuracao(seg: number): string {
  if (!seg || seg <= 0) return "—";
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}m`;
  return `${m}m`;
}

export function PipelineHealthCard() {
  const { data, loading } = usePipelineHealth();

  const semGeoColor =
    (data?.pct_sem_geo ?? 0) > 50
      ? "text-status-attack"
      : (data?.pct_sem_geo ?? 0) > 20
      ? "text-status-warning"
      : "text-status-normal";

  return (
    <div className="rounded-3xl border border-border gradient-card shadow-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] tracking-[0.32em] text-muted-foreground">
          Saúde do pipeline
        </p>
        {data && data.snapshots_erro > 0 && (
          <span className="text-[9px] tracking-[0.2em] text-status-attack">
            {data.snapshots_erro} erro{data.snapshots_erro === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {loading && !data ? (
        <p className="text-xs text-muted-foreground text-center py-6">Carregando…</p>
      ) : !data ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Métricas indisponíveis.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Stat
              icon={Activity}
              label="Duração média"
              value={formatDuracao(data.duracao_media_seg)}
              sub={`máx ${formatDuracao(data.duracao_max_seg)}`}
            />
            <Stat
              icon={Database}
              label="Snapshots c/ obs"
              value={`${data.snapshots_com_obs}/${data.snapshots_recentes}`}
              sub={data.snapshots_zerados ? `${data.snapshots_zerados} zerado(s)` : "todos OK"}
            />
            <Stat
              icon={MapPin}
              label="Sem geoloc"
              value={`${data.pct_sem_geo}%`}
              sub={`${data.asns_sem_estado}/${data.asns_total} ASNs`}
              valueClass={semGeoColor}
            />
            <Stat
              icon={AlertCircle}
              label="Refresh pendente"
              value={data.asns_pendentes_refresh}
              sub={data.asns_pendentes_refresh > 0 ? "rode /admin/refresh-asns" : "tudo enriquecido"}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  valueClass,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/20 px-3 py-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span className="text-[9px] tracking-[0.18em] uppercase">{label}</span>
      </div>
      <p className={`text-base sm:text-lg font-semibold tabular-nums mt-1 ${valueClass ?? ""}`}>
        {value}
      </p>
      {sub && (
        <p className="text-[9px] tracking-wide text-muted-foreground/70 mt-0.5 truncate">{sub}</p>
      )}
    </div>
  );
}
