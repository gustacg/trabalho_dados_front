import { useState } from "react";
import { useCommunities } from "@/hooks/useCommunities";
import { Shield, ShieldOff } from "lucide-react";

export function CommunityCatalogCard() {
  const [apenasBlackhole, setApenasBlackhole] = useState(false);
  const { data, loading } = useCommunities({ limit: 50, apenasBlackhole });

  return (
    <div className="rounded-3xl border border-border gradient-card shadow-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-[10px] tracking-[0.32em] text-muted-foreground">
          Communities BGP observadas
        </p>
        <button
          onClick={() => setApenasBlackhole((v) => !v)}
          className={`flex items-center gap-1.5 text-[10px] tracking-[0.18em] px-2.5 py-1 rounded-full border transition ${
            apenasBlackhole
              ? "border-status-attack/30 text-status-attack bg-status-attack/5"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {apenasBlackhole ? <ShieldOff className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
          {apenasBlackhole ? "Apenas blackhole" : "Todas"}
        </button>
      </div>

      {loading && data.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">Carregando…</p>
      ) : data.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Nenhuma community observada ainda.
        </p>
      ) : (
        <ul className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {data.map((c) => (
            <li
              key={c.community}
              className="flex items-center justify-between text-xs px-2 py-1.5 rounded-md hover:bg-secondary/30 transition-colors"
            >
              <span className="font-mono text-foreground/85 tracking-wider truncate flex items-center gap-1.5">
                {c.is_blackhole && (
                  <ShieldOff className="h-3 w-3 text-status-attack shrink-0" />
                )}
                {c.community}
              </span>
              <span className="font-mono text-muted-foreground tabular-nums shrink-0 ml-2">
                {c.ocorrencias}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
