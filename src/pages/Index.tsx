import { useState } from "react";
import { PowerButton } from "@/components/scanner/PowerButton";
import { ScanStatusBar } from "@/components/scanner/ScanStatusBar";
import { IxTargetCard } from "@/components/scanner/IxTargetCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RedundancyGauge } from "@/components/dashboard/RedundancyGauge";
import { TimelineHeatmap } from "@/components/dashboard/TimelineHeatmap";
import { OperatorList } from "@/components/dashboard/OperatorList";
import { DashboardControls } from "@/components/dashboard/DashboardControls";
import { SnapshotSelector, ViewMode } from "@/components/dashboard/SnapshotSelector";
import { DotSpotlight } from "@/components/backgrounds/DotSpotlight";
import { MitigatorClientsDrawer } from "@/components/dashboard/MitigatorClientsDrawer";
import { TemporalDeltaCard } from "@/components/dashboard/TemporalDeltaCard";
import { CommunityCatalogCard } from "@/components/dashboard/CommunityCatalogCard";
import { MapaNordesteCard } from "@/components/dashboard/MapaNordesteCard";
import { EngenhariaTrafegoCard } from "@/components/dashboard/EngenhariaTrafegoCard";
import { PipelineHealthCard } from "@/components/dashboard/PipelineHealthCard";
import {
  DashboardFiltersProvider,
  useDashboardFilters,
} from "@/context/DashboardFiltersContext";
import { useScan } from "@/hooks/useScan";
import { useResults, useStats, useMitigadores } from "@/hooks/useResults";
import { useSnapshots } from "@/hooks/useSnapshots";
import type { Operator } from "@/data/mockData";
import type { KpiData, Snapshot } from "@/types/api";

const ESCOPO_MAP: Record<string, string> = {
  "MA": "MA",
  "CE": "CE",
  "MA+CE": "MA+CE",
  "Nordeste": "Nordeste",
};

interface DashboardProps {
  operators: Operator[];
  stats: KpiData | null;
  mode: ViewMode;
  onChangeMode: (m: ViewMode) => void;
  latest: Snapshot | null;
  totalSnapshots: number;
  loading: boolean;
  onSelectMitigador: (asn: number, nome: string) => void;
  selectedMit: { asn: number; nome: string } | null;
  onCloseMit: () => void;
}

function Dashboard({
  operators,
  stats,
  mode,
  onChangeMode,
  latest,
  totalSnapshots,
  loading,
  onSelectMitigador,
  selectedMit,
  onCloseMit,
}: DashboardProps) {
  const { filtered } = useDashboardFilters();

  const totalPrefixes = filtered.reduce((s, o) => s + o.prefixes24, 0);
  const withRedundancy = filtered.filter((o) => o.mitigators.length >= 2).length;
  const withoutRedundancy = filtered.filter((o) => o.mitigators.length === 1).length;
  const noMitigation = filtered.filter((o) => o.mitigators.length === 0).length;
  const attacks = filtered.filter((o) => o.status === "attack");
  const total = filtered.length || 1;
  const redundancyPct = stats?.redundancia_pct ?? Math.round((withRedundancy / total) * 100);

  const ceCount = filtered.filter((o) => (o.estado || "") === "CE").reduce((s, o) => s + o.prefixes24, 0);
  const maCount = filtered.filter((o) => (o.estado || "") === "MA").reduce((s, o) => s + o.prefixes24, 0);

  const allMitigators = stats?.top_mitigadores ?? [];

  return (
    <section className="space-y-5 sm:space-y-6 animate-fade-in">
      <SnapshotSelector
        mode={mode}
        onChange={onChangeMode}
        latest={latest}
        totalSnapshots={totalSnapshots}
      />

      <DashboardControls />

      {loading && (
        <p className="text-[10px] tracking-[0.32em] text-muted-foreground text-center">
          Carregando dados…
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard label="Mitigadores" value={allMitigators.length} hint="Clique para ver clientes" accent="primary">
          <ul className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {allMitigators.map((m) => (
              <li
                key={m.asn}
                className="flex items-center justify-between text-[11px] cursor-pointer hover:bg-secondary/40 rounded-md px-1 py-0.5 transition"
                onClick={() => onSelectMitigador(m.asn, m.nome)}
                title="Ver clientes deste mitigador"
              >
                <span className="font-mono text-foreground/80 tracking-wider truncate flex items-center gap-1">
                  {m.nome}
                  {m.tipo === "misto" && (
                    <span className="text-[8px] tracking-wider text-accent border border-accent/30 rounded px-1">
                      misto
                    </span>
                  )}
                </span>
                <span className="font-mono text-muted-foreground tabular-nums shrink-0 ml-2">{m.quantidade}</span>
              </li>
            ))}
            {allMitigators.length === 0 && (
              <li className="text-[10px] text-muted-foreground/60">Aguardando primeira coleta…</li>
            )}
          </ul>
        </KpiCard>

        <KpiCard
          label="Anúncios /24"
          value={(stats?.total_24 ?? totalPrefixes).toLocaleString("pt-BR")}
          hint="Prefixos detectados via BGP"
          accent="accent"
        >
          <div className="flex items-center justify-between text-[10px] tracking-[0.2em] text-muted-foreground">
            <span>CE · {ceCount}</span>
            <span>MA · {maCount}</span>
          </div>
        </KpiCard>

        <KpiCard label="Redundância" value={`${redundancyPct}%`} hint="ASNs com 2+ mitigadores" accent="normal">
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden flex">
            <div className="bg-status-normal" style={{ width: `${redundancyPct}%` }} />
            <div
              className="bg-status-attack"
              style={{ width: `${(withoutRedundancy / total) * 100}%` }}
            />
            <div
              className="bg-status-none"
              style={{ width: `${(noMitigation / total) * 100}%` }}
            />
          </div>
        </KpiCard>

        <KpiCard label="Padrões atípicos" value={attacks.length} hint="1 mitigador cobrindo ≥80%" accent="attack">
          {attacks.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">Nenhuma suspeita no recorte atual.</p>
          ) : (
            <ul className="space-y-1">
              {attacks.slice(0, 3).map((a) => (
                <li key={a.id} className="flex items-center justify-between text-[11px] gap-2">
                  <span className="truncate text-foreground/85">{a.name}</span>
                  <span className="font-mono text-status-attack tabular-nums shrink-0">{a.mitigatedPercent}%</span>
                </li>
              ))}
              {attacks.length > 3 && (
                <li className="text-[10px] tracking-[0.18em] text-muted-foreground pt-0.5">
                  +{attacks.length - 3} outras
                </li>
              )}
            </ul>
          )}
        </KpiCard>
      </div>

      {selectedMit && (
        <MitigatorClientsDrawer
          mitigadorAsn={selectedMit.asn}
          mitigadorNome={selectedMit.nome}
          onClose={onCloseMit}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2 min-w-0">
          <TimelineHeatmap />
        </div>
        <div className="min-w-0">
          <RedundancyGauge value={redundancyPct} sub={`${withRedundancy} de ${filtered.length} ASNs`} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="min-w-0">
          <MapaNordesteCard />
        </div>
        <div className="min-w-0">
          <TemporalDeltaCard />
        </div>
        <div className="min-w-0">
          <CommunityCatalogCard />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="min-w-0">
          <EngenhariaTrafegoCard snapshotId={mode === "all" ? "all" : "latest"} />
        </div>
        <div className="min-w-0">
          <PipelineHealthCard />
        </div>
      </div>

      <OperatorList />
    </section>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function Index() {
  const [escopoSelecionado, setEscopoSelecionado] = useState<"MA" | "CE" | "MA+CE" | "Nordeste">("MA+CE");
  const [hours, setHours] = useState(1);
  // Default "all" — agrega todas as coletas para evitar a tela vazia quando
  // a última coleta vem com 0 obs (cenário pré-fix dashboard-zero-data).
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedMit, setSelectedMit] = useState<{ asn: number; nome: string } | null>(null);

  const { state: scan, iniciarScan, cancelarScan } = useScan();
  const { snapshots, latest, refetch: refetchSnapshots } = useSnapshots();

  // refetch snapshots when scan ends
  if (scan.done && snapshots.length === 0) {
    refetchSnapshots();
  }

  const effectiveSnapshotId: number | "latest" | "all" | null =
    viewMode === "all" ? "all" : latest ? "latest" : null;

  const { operators, loading: loadingResults } = useResults(effectiveSnapshotId);
  const { stats, loading: loadingStats } = useStats(effectiveSnapshotId);

  const handleToggleScan = () => {
    if (scan.scanning) {
      cancelarScan();
    } else {
      iniciarScan(ESCOPO_MAP[escopoSelecionado] || "MA+CE");
    }
  };

  return (
    <>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <DotSpotlight />
      </div>

      <div className="relative space-y-12 sm:space-y-16">
        <section className="relative flex flex-col items-center gap-6 sm:gap-8 md:gap-10">
          <ScanStatusBar scanning={scan.scanning} done={scan.done} hours={hours} setHours={setHours} />

          {scan.scanning && (
            <div className="w-full max-w-md space-y-4">
              {/* Fase 1 — Descoberta */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] tracking-[0.18em] text-muted-foreground">
                  <span className="text-[9px] tracking-[0.28em] uppercase opacity-50">
                    {scan.scanPhase === "discovering"
                      ? "Vizinhos BGP"
                      : scan.scanPhase === "enriching"
                      ? "Geo-enriquecimento"
                      : "Fase 1 · Descoberta"}
                  </span>
                  <span className="tabular-nums shrink-0">
                    {scan.discovery
                      ? `${scan.discovery.current}/${scan.discovery.total}`
                      : scan.scanPhase === "collecting" || scan.scanPhase === "done"
                      ? `${scan.totalCandidates} candidatos`
                      : ""}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{
                      width:
                        scan.scanPhase === "collecting" || scan.scanPhase === "done"
                          ? "100%"
                          : scan.discovery?.total
                          ? `${(scan.discovery.current / scan.discovery.total) * 100}%`
                          : "4%",
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground/70 font-mono">
                  <span className="truncate">
                    {scan.scanPhase === "discovering" && scan.discovery
                      ? scan.discovery.mitigador ?? `AS${scan.discovery.asn}`
                      : scan.scanPhase === "enriching" && scan.discovery
                      ? `AS${scan.discovery.asn}`
                      : scan.scanPhase === "collecting" || scan.scanPhase === "done"
                      ? "Concluída"
                      : "Iniciando…"}
                  </span>
                  {scan.scanPhase === "enriching" && scan.discovery?.encontrados !== undefined && (
                    <span className="shrink-0 ml-2 not-italic text-accent">
                      {scan.discovery.encontrados} encontrados
                    </span>
                  )}
                </div>
              </div>

              {/* Fase 2 — Coleta BGP */}
              <div
                className="space-y-1 transition-opacity duration-500"
                style={{ opacity: scan.scanPhase === "collecting" || scan.scanPhase === "done" ? 1 : 0.3 }}
              >
                <div className="flex justify-between text-[10px] tracking-[0.18em] text-muted-foreground">
                  <span className="text-[9px] tracking-[0.28em] uppercase opacity-50">Fase 2 · Coleta BGP</span>
                  <span className="tabular-nums shrink-0">
                    {scan.collection ? `${scan.collection.current}/${scan.collection.total}` : ""}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: scan.collection
                        ? `${(scan.collection.current / Math.max(scan.collection.total, 1)) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground/70 font-mono">
                  {scan.collection
                    ? `AS${scan.collection.asn}`
                    : "Aguardando fase 1…"}
                </div>
              </div>
            </div>
          )}

          {scan.error && (
            <p className="text-[11px] text-status-attack tracking-wider">{scan.error}</p>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 flex-wrap w-full max-w-md sm:w-auto sm:max-w-none">
            <IxTargetCard
              label="Escopo: MA"
              active={escopoSelecionado === "MA"}
              onToggle={() => setEscopoSelecionado("MA")}
            />
            <IxTargetCard
              label="Escopo: CE"
              active={escopoSelecionado === "CE"}
              onToggle={() => setEscopoSelecionado("CE")}
            />
            <IxTargetCard
              label="Escopo: MA+CE"
              active={escopoSelecionado === "MA+CE"}
              onToggle={() => setEscopoSelecionado("MA+CE")}
            />
            <IxTargetCard
              label="Escopo: Nordeste"
              active={escopoSelecionado === "Nordeste"}
              onToggle={() => setEscopoSelecionado("Nordeste")}
            />
          </div>

          <PowerButton
            scanning={scan.scanning}
            onToggle={handleToggleScan}
            disabled={false}
          />
        </section>

        {snapshots.length > 0 ? (
          <DashboardFiltersProvider operators={operators}>
            <Dashboard
              operators={operators}
              stats={stats}
              mode={viewMode}
              onChangeMode={setViewMode}
              latest={latest}
              totalSnapshots={snapshots.length}
              loading={loadingResults || loadingStats}
              onSelectMitigador={(asn, nome) => setSelectedMit({ asn, nome })}
              selectedMit={selectedMit}
              onCloseMit={() => setSelectedMit(null)}
            />
          </DashboardFiltersProvider>
        ) : (
          <section className="rounded-3xl border border-dashed border-border/60 px-6 sm:px-8 py-10 sm:py-14 text-center">
            <p className="text-[10px] tracking-[0.32em] text-muted-foreground">
              Painel analítico
            </p>
            <p className="text-sm text-muted-foreground/80 mt-2">
              Aguardando a primeira coleta no banco. Inicie um scan acima ou aguarde o auto-scan (a cada 6h).
            </p>
          </section>
        )}
      </div>
    </>
  );
}
