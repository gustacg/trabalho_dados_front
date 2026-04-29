import { useEffect, useState } from "react";
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
import {
  DashboardFiltersProvider,
  useDashboardFilters,
} from "@/context/DashboardFiltersContext";
import { useScan } from "@/hooks/useScan";
import { useResults, useStats } from "@/hooks/useResults";
import { useSnapshots } from "@/hooks/useSnapshots";
import { getOperators } from "@/lib/api";
import type { Operator } from "@/data/mockData";
import type { Snapshot } from "@/types/api";

// Mapa de IXs selecionados (código UI) → nome completo da API
const IX_MAP: Record<"MA" | "CE", string> = {
  MA: "IX Maranhão",
  CE: "IX Ceará",
};

// ── Dashboard (com dados reais) ───────────────────────────────────────────────

interface DashboardProps {
  operators: Operator[];
  stats: {
    sem_mitigacao: number;
    operacao_normal: number;
    ataque_suspeito: number;
    total_prefixos_24: number;
    redundancia_pct: number;
    top_mitigadores: { nome: string; quantidade: number }[];
  } | null;
  mode: ViewMode;
  onChangeMode: (m: ViewMode) => void;
  latest: Snapshot | null;
  totalSnapshots: number;
  loading: boolean;
}

function Dashboard({
  operators,
  stats,
  mode,
  onChangeMode,
  latest,
  totalSnapshots,
  loading,
}: DashboardProps) {
  const { filtered } = useDashboardFilters();

  const totalPrefixes = filtered.reduce((s, o) => s + o.prefixes24, 0);
  const withRedundancy = filtered.filter((o) => o.mitigators.length >= 2).length;
  const withoutRedundancy = filtered.filter((o) => o.mitigators.length === 1).length;
  const noMitigation = filtered.filter((o) => o.mitigators.length === 0).length;
  const attacks = filtered.filter((o) => o.status === "attack");
  const total = filtered.length || 1;
  const redundancyPct = stats?.redundancia_pct ?? Math.round((withRedundancy / total) * 100);

  const ceCount = filtered.filter((o) => o.ix === "IX Ceará").reduce((s, o) => s + o.prefixes24, 0);
  const maCount = filtered.filter((o) => o.ix === "IX Maranhão").reduce((s, o) => s + o.prefixes24, 0);

  const allMitigators = stats?.top_mitigadores ?? [];
  const topMitigators = allMitigators.map((m, i) => ({
    asn: `#${i + 1}`,
    company: m.nome,
    count: m.quantidade,
  }));

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
        <KpiCard label="Mitigadores" value={allMitigators.length} hint="ASNs com mitigação ativa" accent="primary">
          <ul className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {topMitigators.map((m) => (
              <li key={m.asn} className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-foreground/80 tracking-wider truncate">{m.company}</span>
                <span className="font-mono text-muted-foreground tabular-nums shrink-0 ml-2">{m.count}</span>
              </li>
            ))}
          </ul>
        </KpiCard>

        <KpiCard
          label="Anúncios /24"
          value={(stats?.total_prefixos_24 ?? totalPrefixes).toLocaleString("pt-BR")}
          hint="Prefixos detectados via BGP"
          accent="accent"
        >
          <div className="flex items-center justify-between text-[10px] tracking-[0.2em] text-muted-foreground">
            <span>CE · {ceCount}</span>
            <span>MA · {maCount}</span>
          </div>
        </KpiCard>

        <KpiCard label="Redundância" value={`${redundancyPct}%`} hint="Operadoras com 2+ mitigadores" accent="normal">
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

        <KpiCard label="Em Ataque" value={attacks.length} hint="Suspeitas ativas de DDoS" accent="attack">
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

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2 min-w-0">
          <TimelineHeatmap />
        </div>
        <div className="min-w-0">
          <RedundancyGauge value={redundancyPct} sub={`${withRedundancy} de ${filtered.length} operadoras`} />
        </div>
      </div>

      <OperatorList />
    </section>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function Index() {
  const [selected, setSelected] = useState<("MA" | "CE")[]>(["MA", "CE"]);
  const [hours, setHours] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("latest");

  const [ixCounts, setIxCounts] = useState<{ ma: number; ce: number }>({ ma: 0, ce: 0 });

  useEffect(() => {
    Promise.all([
      getOperators("IX Maranhão"),
      getOperators("IX Ceará"),
    ]).then(([ma, ce]) => setIxCounts({ ma: ma.length, ce: ce.length })).catch(() => {});
  }, []);

  const { state: scan, iniciarScan, cancelarScan } = useScan();
  const { snapshots, latest, refetch: refetchSnapshots } = useSnapshots();

  // Quando uma coleta terminar, recarrega lista de snapshots para refletir o novo dado.
  useEffect(() => {
    if (scan.done) refetchSnapshots();
  }, [scan.done, refetchSnapshots]);

  // Resolve qual snapshot_id buscar conforme o modo selecionado.
  const effectiveSnapshotId: number | "all" | null =
    viewMode === "all" ? "all" : latest?.id ?? null;

  const { operators, loading: loadingResults } = useResults(effectiveSnapshotId);
  const { stats, loading: loadingStats } = useStats(effectiveSnapshotId);

  const toggle = (id: "MA" | "CE") =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const handleToggleScan = () => {
    if (scan.scanning) {
      cancelarScan();
    } else {
      if (selected.length === 0) return;
      const ixs = selected.map((s) => IX_MAP[s]);
      iniciarScan(ixs, `Scan ${new Date().toLocaleString("pt-BR")}`);
    }
  };

  const maCount = ixCounts.ma;
  const ceCount = ixCounts.ce;

  return (
    <>
      {/* Global background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <DotSpotlight />
      </div>

      <div className="relative space-y-12 sm:space-y-16">
        {/* Scanner section */}
        <section className="relative flex flex-col items-center gap-6 sm:gap-8 md:gap-10">
          <ScanStatusBar scanning={scan.scanning} done={scan.done} hours={hours} setHours={setHours} />

          {/* Progresso em tempo real */}
          {scan.scanning && scan.progress && (
            <div className="w-full max-w-md space-y-1.5">
              <div className="flex justify-between text-[10px] tracking-[0.18em] text-muted-foreground">
                <span className="truncate">{scan.progress.operadora}</span>
                <span className="tabular-nums shrink-0">
                  {scan.progress.current}/{scan.progress.total}
                </span>
              </div>
              <div className="h-1 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${(scan.progress.current / (scan.progress.total || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {scan.error && (
            <p className="text-[11px] text-status-attack tracking-wider">{scan.error}</p>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 flex-wrap w-full max-w-md sm:w-auto sm:max-w-none">
            <IxTargetCard
              label="IX Maranhão"
              count={maCount}
              active={selected.includes("MA")}
              onToggle={() => toggle("MA")}
            />
            <IxTargetCard
              label="IX Ceará"
              count={ceCount}
              active={selected.includes("CE")}
              onToggle={() => toggle("CE")}
            />
          </div>

          <PowerButton
            scanning={scan.scanning}
            onToggle={handleToggleScan}
            disabled={selected.length === 0 && !scan.scanning}
          />
        </section>

        {/* Dashboard sempre visível quando há ao menos uma coleta no banco */}
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
