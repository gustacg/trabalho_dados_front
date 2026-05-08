import { useMlFeatureImportance } from "@/hooks/useMl";
import { Brain } from "lucide-react";

export function MlFeatureImportanceCard() {
  const { data, loading } = useMlFeatureImportance();

  const ranking = data?.ranking ?? [];
  const top = ranking.slice(0, 10);
  const max = top[0]?.peso ?? 1;

  return (
    <div className="rounded-3xl border border-border gradient-card shadow-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] tracking-[0.32em] text-muted-foreground">
          Importance das features (ML)
        </p>
        <span className="text-[9px] tracking-[0.2em] text-muted-foreground/70 flex items-center gap-1">
          <Brain className="h-3 w-3" />
          {data?.shap_used ? "SHAP" : "RandomForest"}
        </span>
      </div>

      {loading && !data ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Carregando…
        </p>
      ) : !data || data.status === "no_data" || top.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Pipeline ML ainda não rodou. Aguarde próximo auto-scan.
        </p>
      ) : (
        <>
          <ul className="space-y-1.5">
            {top.map((f) => {
              const pct = max > 0 ? (f.peso / max) * 100 : 0;
              return (
                <li key={f.feature} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-foreground/85 truncate">
                      {f.feature}
                    </span>
                    <span className="font-mono text-muted-foreground tabular-nums shrink-0 ml-2">
                      {f.peso.toFixed(3)}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${pct.toFixed(1)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          {data.rodado_em && (
            <p className="text-[9px] tracking-[0.2em] text-muted-foreground/60 mt-3">
              Atualizado em{" "}
              {new Date(data.rodado_em).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
