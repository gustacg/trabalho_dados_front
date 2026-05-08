import { useMlRandomForest } from "@/hooks/useMl";
import { Target } from "lucide-react";

interface BestMetrics {
  test_accuracy?: number;
  test_precision_macro?: number;
  test_recall_macro?: number;
  test_f1_macro?: number;
  cv_f1_macro?: number;
}

export function MlMetricsCard() {
  const { data, loading } = useMlRandomForest();

  const m = (data?.run.metricas as { best?: BestMetrics } | null)?.best;
  const params = data?.run.hiperparams as Record<string, unknown> | null;
  const classes = (data?.run.metricas as { classes?: string[] } | null)?.classes;
  const nTrain = (data?.run.metricas as { n_train?: number } | null)?.n_train;
  const nTest = (data?.run.metricas as { n_test?: number } | null)?.n_test;

  return (
    <div className="rounded-3xl border border-border gradient-card shadow-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] tracking-[0.32em] text-muted-foreground">
          Métricas do classificador
        </p>
        <span className="text-[9px] tracking-[0.2em] text-muted-foreground/70 flex items-center gap-1">
          <Target className="h-3 w-3" />
          RandomForest
        </span>
      </div>

      {loading && !data ? (
        <p className="text-xs text-muted-foreground text-center py-6">Carregando…</p>
      ) : !data || !m ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Pipeline ML ainda não rodou. Aguarde próximo auto-scan.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Metric label="Accuracy" value={pct(m.test_accuracy)} />
            <Metric label="F1 macro" value={pct(m.test_f1_macro)} accent />
            <Metric label="Precision" value={pct(m.test_precision_macro)} />
            <Metric label="Recall" value={pct(m.test_recall_macro)} />
          </div>
          <div className="text-[10px] tracking-[0.2em] text-muted-foreground space-y-0.5">
            <div className="flex justify-between">
              <span>CV f1 macro</span>
              <span className="font-mono tabular-nums">{pct(m.cv_f1_macro)}</span>
            </div>
            <div className="flex justify-between">
              <span>Treino / Teste</span>
              <span className="font-mono tabular-nums">
                {nTrain ?? "—"} / {nTest ?? "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Classes</span>
              <span className="font-mono text-[9px] tabular-nums shrink-0 ml-2 truncate">
                {classes?.join(" · ") ?? "—"}
              </span>
            </div>
          </div>
          {params && (
            <p className="text-[9px] tracking-[0.2em] text-muted-foreground/60 mt-3 truncate">
              Best: {Object.entries(params).map(([k, v]) => `${k}=${v}`).join(" · ")}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function pct(v: number | undefined) {
  if (v === undefined || v === null || Number.isNaN(v)) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/20 px-3 py-2">
      <p className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground">
        {label}
      </p>
      <p
        className={`text-base sm:text-lg font-semibold tabular-nums mt-1 ${
          accent ? "text-accent" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
