import { X } from "lucide-react";
import { useMitigatorClients } from "@/hooks/useMitigatorClients";
import { toFrontendStatus } from "@/types/api";

interface Props {
  mitigadorAsn: number | null;
  mitigadorNome?: string;
  onClose: () => void;
}

const statusLabel: Record<string, { text: string; cls: string }> = {
  attack: { text: "Padrão atípico", cls: "text-status-attack border-status-attack/30 bg-status-attack/5" },
  normal: { text: "Normal", cls: "text-status-normal border-status-normal/30 bg-status-normal/5" },
  none:   { text: "Sem mitigação", cls: "text-muted-foreground border-border bg-secondary/40" },
};

export function MitigatorClientsDrawer({ mitigadorAsn, mitigadorNome, onClose }: Props) {
  const { data, loading } = useMitigatorClients(mitigadorAsn);

  if (mitigadorAsn === null) return null;

  return (
    <div className="rounded-3xl border border-border gradient-card shadow-card overflow-hidden animate-fade-in">
      <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b border-border/60">
        <div>
          <p className="text-[10px] tracking-[0.32em] text-muted-foreground">Clientes do mitigador</p>
          <p className="text-sm text-foreground/90 mt-1">
            {mitigadorNome ?? `AS${mitigadorAsn}`}
            <span className="text-[10px] font-mono tracking-wider text-muted-foreground ml-2">
              AS{mitigadorAsn}
            </span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition"
          aria-label="Fechar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground text-center py-8">Carregando clientes…</p>
      ) : !data || data.clientes.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-10">
          Nenhum cliente atribuído neste snapshot.
        </p>
      ) : (
        <ul className="divide-y divide-border/40">
          {data.clientes.map((c) => {
            const st = statusLabel[toFrontendStatus(c.status_ataque)];
            return (
              <li key={`${c.snapshot_id}-${c.asn_origem}`} className="hover:bg-secondary/30 transition-colors px-4 sm:px-6 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium tracking-wide truncate">
                      {c.nome_holder || `AS${c.asn_origem}`}
                    </p>
                    <p className="text-[10px] tracking-[0.16em] text-muted-foreground truncate mt-0.5">
                      AS{c.asn_origem} · {c.estado || "—"} · {c.regiao || ""}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] tracking-[0.2em] shrink-0 ${st.cls}`}
                  >
                    {st.text}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.min(100, c.pct_mitigado || 0)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground tabular-nums shrink-0">
                    {c.pct_mitigado}% · {c.total_24} /24
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
