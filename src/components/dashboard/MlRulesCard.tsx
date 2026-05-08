import { useMlApriori } from "@/hooks/useMl";
import { GitMerge } from "lucide-react";

export function MlRulesCard() {
  const { data, loading } = useMlApriori();

  const top = (data?.rules ?? []).slice(0, 12);

  return (
    <div className="rounded-3xl border border-border gradient-card shadow-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] tracking-[0.32em] text-muted-foreground">
          Regras Apriori
        </p>
        <span className="text-[9px] tracking-[0.2em] text-muted-foreground/70 flex items-center gap-1">
          <GitMerge className="h-3 w-3" />
          {data?.rules.length ?? 0} regras
        </span>
      </div>

      {loading && !data ? (
        <p className="text-xs text-muted-foreground text-center py-6">Carregando…</p>
      ) : !data || top.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Sem regras significativas ainda.
        </p>
      ) : (
        <>
          <ul className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {top.map((r) => (
              <li
                key={r.id}
                className="text-[10px] rounded-lg bg-secondary/30 px-2 py-1.5"
                title={`support=${r.support} · confidence=${r.confidence} · lift=${r.lift}`}
              >
                <div className="font-mono text-foreground/85 truncate">
                  <span className="text-muted-foreground">{r.antecedents}</span>
                  <span className="text-accent mx-1">⇒</span>
                  <span>{r.consequents}</span>
                </div>
                <div className="flex justify-between text-[9px] tracking-wider text-muted-foreground/70 mt-0.5">
                  <span>conf {(r.confidence * 100).toFixed(0)}%</span>
                  <span>lift {r.lift.toFixed(2)}</span>
                  <span>supp {(r.support * 100).toFixed(0)}%</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-[9px] tracking-[0.2em] text-muted-foreground/60 mt-3">
            Padrões frequentes em communities × mitigador × status
          </p>
        </>
      )}
    </div>
  );
}
