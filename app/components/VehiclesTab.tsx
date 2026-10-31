"use client";

import React, { useState, useEffect } from "react";
import { Fuel, Settings, Gauge, X, Award, Info } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Cell
} from "recharts";
import {
  Transaction,
  AutoInmetroConfig,
  DEFAULT_AUTO_INMETRO_CONFIG,
  DashboardWidgetConfig,
  ChartThemeColors,
  formatBRL,
  formatDateBR,
  CustomCyberTooltip
} from "@/app/lifeos-data";
import ChartCard from "./ChartCard";
import {
  ChartWidgetSettings,
  ChartWidgetSize,
  DEFAULT_CHART_WIDGET_SETTINGS
} from "./ChartSettingsPopover";

export interface VehiclesTabProps {
  autoMetrics: {
    autoTxs: Transaction[];
    maxKm: number;
    distanceDriven: number;
    avgKmPerLiter: number;
    costPerKm: number;
    fuelTotal: number;
    maintenanceTotal: number;
    totalAutoSpent: number;
    kmRecords: Array<{ date: string; km: number; [key: string]: unknown }>;
    [key: string]: unknown;
  };
  autoInmetroConfig?: AutoInmetroConfig;
  setAutoInmetroConfig?: (cfg: AutoInmetroConfig) => void;
  chartTheme: ChartThemeColors;
  updateChartThemeColor: (key: keyof ChartThemeColors, val: string) => void;
  handleOpenNewTxModal: (cat?: string) => void;
  notify: (title: string, subtitle?: string, type?: "success" | "warning" | "info", cat?: any) => void;
  moneyBlur: string;
  autoLayout?: DashboardWidgetConfig[];
  getAutoWidgetSettings?: (wId: string, section?: string) => ChartWidgetSettings;
  handleUpdateAutoWidgetSettings?: (wId: string, cfg: ChartWidgetSettings) => void;
  handleUpdateAutoWidgetSize?: (wId: string, size: ChartWidgetSize) => void;
  handleDragStartAutoWidget?: (id: string) => void;
  handleDragEnterAutoWidget?: (id: string) => void;
  handleDragEndAutoWidget?: () => void;
  draggingAutoWidgetId?: string | null;
  dragOverAutoWidgetId?: string | null;
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition text-xs";

export const VehiclesTab: React.FC<VehiclesTabProps> = ({
  autoMetrics,
  autoInmetroConfig,
  setAutoInmetroConfig,
  chartTheme,
  updateChartThemeColor,
  handleOpenNewTxModal,
  notify,
  moneyBlur,
  autoLayout,
  getAutoWidgetSettings,
  handleUpdateAutoWidgetSettings,
  handleUpdateAutoWidgetSize,
  handleDragStartAutoWidget,
  handleDragEnterAutoWidget,
  handleDragEndAutoWidget,
  draggingAutoWidgetId,
  dragOverAutoWidgetId
}) => {
  const [showInmetroModal, setShowInmetroModal] = useState(false);
  const [localInmetroConfig, setLocalInmetroConfig] = useState<AutoInmetroConfig>(
    autoInmetroConfig || DEFAULT_AUTO_INMETRO_CONFIG
  );

  useEffect(() => {
    if (autoInmetroConfig) {
      setLocalInmetroConfig(autoInmetroConfig);
    }
  }, [autoInmetroConfig]);

  const inmetroCfg = localInmetroConfig || DEFAULT_AUTO_INMETRO_CONFIG;

  // 1. Filtragem e Análise de Combustível
  const fuelTxs: Transaction[] = autoMetrics.autoTxs.filter(
    (t: Transaction) =>
      t.category.toLowerCase().includes("gasolina") ||
      t.category.toLowerCase().includes("combustível") ||
      (t.liters && t.liters > 0)
  );

  // Abastecimento Mais Caro em Destaque
  const mostExpensiveFuel = fuelTxs.reduce(
    (prev: Transaction | null, curr: Transaction) => (curr.amount > (prev?.amount || 0) ? curr : prev),
    null
  );

  // Consumo Real (km/l) por abastecimento consecutivo e comparação com INMETRO
  const sortedFuelAsc = [...fuelTxs].sort((a, b) => a.date.localeCompare(b.date));
  const fuelWithKmAndLiters = sortedFuelAsc.filter(
    (t: Transaction) => typeof t.km === "number" && t.km > 0 && typeof t.liters === "number" && t.liters > 0
  );

  const consumptionPoints: Array<{
    date: string;
    label: string;
    kmPerLiter: number;
    inmetroRef: number;
    fuelType: string;
    pricePerLiter: number;
    color: string;
    statusLabel: string;
    pctOfInmetro: number;
    distKm: number;
    liters: number;
    totalAmount: number;
    description: string;
  }> = [];

  for (let i = 1; i < fuelWithKmAndLiters.length; i++) {
    const prev = fuelWithKmAndLiters[i - 1];
    const curr = fuelWithKmAndLiters[i];
    const dist = (curr.km || 0) - (prev.km || 0);
    const lit = curr.liters || 0;
    if (dist > 0 && lit > 0) {
      const kml = Number((dist / lit).toFixed(2));
      const isEtanol =
        curr.description.toLowerCase().includes("etanol") ||
        curr.description.toLowerCase().includes("álcool") ||
        curr.category.toLowerCase().includes("etanol");
      const ref = isEtanol ? inmetroCfg.ethanolKmPerLiter : inmetroCfg.gasolineKmPerLiter;
      const pct = Math.round((kml / Math.max(0.1, ref)) * 100);

      let col = "#ef4444"; // Vermelho
      let status = "Ruim";
      if (pct >= inmetroCfg.greenThresholdPct) {
        col = "#10b981"; // Verde
        status = "Bom";
      } else if (pct >= inmetroCfg.yellowThresholdPct) {
        col = "#f59e0b"; // Amarelo
        status = "Mediano";
      }

      const priceL = curr.amount > 0 ? Number((curr.amount / lit).toFixed(2)) : 0;
      consumptionPoints.push({
        date: curr.date,
        label: formatDateBR(curr.date),
        kmPerLiter: kml,
        inmetroRef: ref,
        fuelType: isEtanol ? "Etanol" : "Gasolina",
        pricePerLiter: priceL,
        color: col,
        statusLabel: `${status} (${pct}% do INMETRO)`,
        pctOfInmetro: pct,
        distKm: dist,
        liters: lit,
        totalAmount: curr.amount,
        description: curr.description
      });
    }
  }

  const lastConsumption =
    consumptionPoints.length > 0 ? consumptionPoints[consumptionPoints.length - 1] : null;

  // Consumo do último abastecimento ou estimativa com base na distância percorrida e litros
  let effectiveLastKmL = lastConsumption?.kmPerLiter;
  let effectiveLastFuelType = lastConsumption?.fuelType || "Gasolina";
  let effectiveLastPct = lastConsumption?.pctOfInmetro;

  if (!effectiveLastKmL && fuelWithKmAndLiters.length >= 1 && autoMetrics.distanceDriven > 0) {
    const latestFuel = fuelWithKmAndLiters[fuelWithKmAndLiters.length - 1];
    if (latestFuel.liters && latestFuel.liters > 0) {
      effectiveLastKmL = Number((autoMetrics.distanceDriven / latestFuel.liters).toFixed(2));
      const isEtanol =
        latestFuel.description.toLowerCase().includes("etanol") ||
        latestFuel.description.toLowerCase().includes("álcool") ||
        latestFuel.category.toLowerCase().includes("etanol");
      effectiveLastFuelType = isEtanol ? "Etanol" : "Gasolina";
      const ref = isEtanol ? inmetroCfg.ethanolKmPerLiter : inmetroCfg.gasolineKmPerLiter;
      effectiveLastPct = Math.round((effectiveLastKmL / Math.max(0.1, ref)) * 100);
    }
  }

  let lastSemaforoBadge = "—";
  let lastSemaforoColor = "text-slate-400 border-white/10 bg-white/5";
  if (effectiveLastPct !== undefined) {
    if (effectiveLastPct >= inmetroCfg.greenThresholdPct) {
      lastSemaforoBadge = "🟢 Bom";
      lastSemaforoColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/15";
    } else if (effectiveLastPct >= inmetroCfg.yellowThresholdPct) {
      lastSemaforoBadge = "🟡 Mediano";
      lastSemaforoColor = "text-amber-400 border-amber-500/30 bg-amber-500/15";
    } else {
      lastSemaforoBadge = "🔴 Ruim";
      lastSemaforoColor = "text-rose-400 border-rose-500/30 bg-rose-500/15";
    }
  }

  // Semáforo do Consumo Médio Geral
  const avgPctOfInmetro = Math.round(
    (autoMetrics.avgKmPerLiter / Math.max(0.1, inmetroCfg.gasolineKmPerLiter)) * 100
  );
  let avgSemaforoColor = "text-rose-400 border-rose-500/30 bg-rose-500/15";
  let avgSemaforoBadge = "🔴 Ruim";
  if (avgPctOfInmetro >= inmetroCfg.greenThresholdPct) {
    avgSemaforoColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/15";
    avgSemaforoBadge = "🟢 Bom";
  } else if (avgPctOfInmetro >= inmetroCfg.yellowThresholdPct) {
    avgSemaforoColor = "text-amber-400 border-amber-500/30 bg-amber-500/15";
    avgSemaforoBadge = "🟡 Mediano";
  }

  // Gasto Mensal com Combustível (R$)
  const fuelByMonthMap = new Map<string, number>();
  fuelTxs.forEach((t: Transaction) => {
    const m = t.date.slice(0, 7);
    fuelByMonthMap.set(m, (fuelByMonthMap.get(m) || 0) + t.amount);
  });
  const fuelMonthlyData = Array.from(fuelByMonthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([m, total]) => {
      const [y, mm] = m.split("-");
      return {
        month: m,
        label: `${mm}/${y.slice(2)}`,
        total: Number(total.toFixed(2))
      };
    });

  // Preço por Litro ao Longo do Tempo (R$/L)
  const pricePerLiterData = sortedFuelAsc
    .filter((t: Transaction) => t.liters && t.liters > 0 && t.amount > 0)
    .map((t: Transaction) => ({
      date: t.date,
      label: formatDateBR(t.date),
      price: Number((t.amount / (t.liters || 1)).toFixed(2)),
      liters: t.liters,
      fuel: t.description.toLowerCase().includes("etanol") ? "Etanol" : "Gasolina"
    }));

  const autoWidgetsList = autoLayout || [
    { id: "auto_odometer", title: "Evolução do Odômetro (KM)", subtitle: "Progressão da quilometragem", visible: true, size: "half" as ChartWidgetSize },
    { id: "auto_consumption", title: "Consumo Real vs INMETRO (km/l)", subtitle: "Semáforo e referência PBEV", visible: true, size: "half" as ChartWidgetSize },
    { id: "auto_fuel_monthly", title: "Gasto com Combustível por Mês", subtitle: "Desembolso mensal em postos (R$)", visible: true, size: "half" as ChartWidgetSize },
    { id: "auto_price_per_liter", title: "Preço do Litro ao Longo do Tempo", subtitle: "Custo por litro pago na bomba", visible: true, size: "half" as ChartWidgetSize }
  ];

  const getAutoWidgetCfg = (wId: string): ChartWidgetSettings => {
    if (getAutoWidgetSettings) {
      return getAutoWidgetSettings(wId, "auto");
    }
    return DEFAULT_CHART_WIDGET_SETTINGS;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Aba Meus Veículos */}
      <div className="glass-card p-6 rounded-3xl border border-white/[0.08] flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-extrabold text-white tracking-tight">Telemetria & Gestão de Meus Veículos</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
              Ford Fiesta Sedan 1.0 Flex
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhe odômetro, consumo com semáforo comparado ao INMETRO, custos por km e abastecimentos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenNewTxModal("Gasolina/Combustível")}
            className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs text-white font-bold flex items-center gap-1.5 shadow-lg shadow-amber-600/20 transition"
          >
            <Fuel className="w-3.5 h-3.5" /> Posto Express (Abastecer)
          </button>

          <button
            type="button"
            onClick={() => setShowInmetroModal(true)}
            className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-indigo-300 font-bold flex items-center gap-1.5 transition"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-400" /> Configurar Metas INMETRO
          </button>

          <label className="flex items-center gap-2 min-h-[44px] text-xs text-slate-300 cursor-pointer bg-slate-950/80 px-3.5 py-2 rounded-xl border border-white/10">
            <span>Cor do Odômetro:</span>
            <input
              type="color"
              value={chartTheme.odometerLine}
              onChange={(e) => updateChartThemeColor("odometerLine", e.target.value)}
              className="color-circle"
            />
          </label>
        </div>
      </div>

      {/* Modal de Configuração das Referências do INMETRO */}
      {showInmetroModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-indigo-400" />
                <strong className="text-sm text-white font-extrabold">Configurar Referências INMETRO</strong>
              </div>
              <button
                type="button"
                onClick={() => setShowInmetroModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ajuste os valores de referência oficiais do INMETRO (PBEV) e os percentuais das faixas do semáforo de consumo.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Modelo / Referência Usada</label>
                <input
                  type="text"
                  value={localInmetroConfig.referenceNote}
                  onChange={(e) =>
                    setLocalInmetroConfig({ ...localInmetroConfig, referenceNote: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Gasolina (km/L INMETRO)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={localInmetroConfig.gasolineKmPerLiter}
                    onChange={(e) =>
                      setLocalInmetroConfig({
                        ...localInmetroConfig,
                        gasolineKmPerLiter: parseFloat(e.target.value) || 12.0
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Etanol (km/L INMETRO)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={localInmetroConfig.ethanolKmPerLiter}
                    onChange={(e) =>
                      setLocalInmetroConfig({
                        ...localInmetroConfig,
                        ethanolKmPerLiter: parseFloat(e.target.value) || 8.5
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-emerald-400 font-semibold block mb-1">Faixa Verde (% mínima)</label>
                  <input
                    type="number"
                    value={localInmetroConfig.greenThresholdPct}
                    onChange={(e) =>
                      setLocalInmetroConfig({
                        ...localInmetroConfig,
                        greenThresholdPct: parseInt(e.target.value) || 85
                      })
                    }
                    className={inputClass}
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Ex: a partir de 85%</span>
                </div>
                <div>
                  <label className="text-amber-400 font-semibold block mb-1">Faixa Amarela (% mínima)</label>
                  <input
                    type="number"
                    value={localInmetroConfig.yellowThresholdPct}
                    onChange={(e) =>
                      setLocalInmetroConfig({
                        ...localInmetroConfig,
                        yellowThresholdPct: parseInt(e.target.value) || 70
                      })
                    }
                    className={inputClass}
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Abaixo disso = Vermelho</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (setAutoInmetroConfig) {
                    setAutoInmetroConfig(localInmetroConfig);
                  }
                  setShowInmetroModal(false);
                  notify("Configuração Salva!", "Referências do INMETRO atualizadas com sucesso.", "success");
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition shadow-lg"
              >
                Salvar Parâmetros
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocalInmetroConfig(DEFAULT_AUTO_INMETRO_CONFIG);
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                title="Restaurar padrão Fiesta 2008"
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CARDS DE KPIS PRINCIPAIS (COM SEMÁFORO E EFICIÊNCIA DO ÚLTIMO TANQUE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="glass-card p-5 rounded-3xl border border-white/[0.08]">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
            Quilometragem Atual
          </span>
          <p className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {autoMetrics.maxKm.toLocaleString("pt-BR")} km
          </p>
          <span className="text-[11px] text-slate-400 font-mono tabular-nums">
            Rodado no período: {autoMetrics.distanceDriven} km
          </span>
        </div>

        {/* Consumo Médio com Semáforo */}
        <div className="glass-card p-5 rounded-3xl border border-indigo-500/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Consumo Médio</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${avgSemaforoColor}`}>
              {avgSemaforoBadge}
            </span>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {autoMetrics.avgKmPerLiter.toFixed(1)} km/L
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5 font-mono tabular-nums">
            {avgPctOfInmetro}% da ref. ({inmetroCfg.gasolineKmPerLiter} km/l)
          </span>
        </div>

        {/* Eficiência do Último Abastecimento */}
        <div className="glass-card p-5 rounded-3xl border border-amber-500/25">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Último Tanque</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${lastSemaforoColor}`}>
              {lastSemaforoBadge}
            </span>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {effectiveLastKmL ? `${effectiveLastKmL} km/L` : `${autoMetrics.avgKmPerLiter.toFixed(1)} km/L`}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5 font-mono tabular-nums">
            {effectiveLastPct !== undefined
              ? `${effectiveLastPct}% da ref. (${effectiveLastFuelType})`
              : "Aguardando abastecimento"}
          </span>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-amber-500/25">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
            Combustível Total
          </span>
          <p className={`text-2xl font-extrabold text-amber-400 font-mono tabular-nums ${moneyBlur}`}>
            {formatBRL(autoMetrics.fuelTotal)}
          </p>
          <span className="text-[11px] text-slate-400">{fuelTxs.length} abastecimentos registrados</span>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-rose-500/25">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
            Manutenção & Óleo
          </span>
          <p className={`text-2xl font-extrabold text-rose-400 font-mono tabular-nums ${moneyBlur}`}>
            {formatBRL(autoMetrics.maintenanceTotal)}
          </p>
          <span className="text-[11px] text-slate-400">Revisões e serviços preventivos</span>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-indigo-500/25">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
            Custo Médio / KM
          </span>
          <p className={`text-2xl font-extrabold text-indigo-400 font-mono tabular-nums ${moneyBlur}`}>
            {formatBRL(autoMetrics.costPerKm)}/km
          </p>
          <span className={`text-[11px] text-slate-400 font-mono tabular-nums ${moneyBlur}`}>
            Total gasto: {formatBRL(autoMetrics.totalAutoSpent)}
          </span>
        </div>
      </div>

      {/* DIAGNÓSTICO DE EFICIÊNCIA & METAS DO FORD FIESTA 1.0 */}
      <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-slate-950 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Eficiência de Combustível — Ford Fiesta Sedan 1.0 Flex</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                  Ciclo Misto PBEV
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Consumo real calculado pela distância percorrida entre abastecimentos dividida pelos litros do tanque.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenNewTxModal("Gasolina/Combustível")}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-amber-600/20 transition"
          >
            <Fuel className="w-3.5 h-3.5" /> Abastecer no Posto Express
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Box 1: Último Abastecimento */}
          <div className="p-4 rounded-2xl bg-slate-950/75 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Último Abastecimento
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${lastSemaforoColor}`}>
                {lastSemaforoBadge}
              </span>
            </div>
            {lastConsumption ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <strong className="text-2xl font-black text-white font-mono">
                    {lastConsumption.kmPerLiter}
                  </strong>
                  <span className="text-xs text-slate-400 font-bold">km/L</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {lastConsumption.distKm} km rodados com {lastConsumption.liters} L ({lastConsumption.fuelType})
                </span>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
                  <span>Data: {lastConsumption.label}</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    R$ {lastConsumption.pricePerLiter.toFixed(2)}/L
                  </span>
                </div>
              </div>
            ) : effectiveLastKmL ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <strong className="text-2xl font-black text-white font-mono">
                    {effectiveLastKmL}
                  </strong>
                  <span className="text-xs text-slate-400 font-bold">km/L</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Estimado com base no odômetro ({autoMetrics.distanceDriven} km rodados)
                </span>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
                  <span>Combustível: {effectiveLastFuelType}</span>
                  <span className="text-emerald-400 font-mono font-bold">{effectiveLastPct}% INMETRO</span>
                </div>
              </div>
            ) : (
              <div className="py-2">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Registre o próximo abastecimento no Posto Express com KM e litros para calcular a eficiência exata do tanque.
                </p>
              </div>
            )}
          </div>

          {/* Box 2: Comparativo com Metas INMETRO */}
          <div className="p-4 rounded-2xl bg-slate-950/75 border border-white/10 space-y-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Metas INMETRO (Fiesta 1.0)
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Gasolina Comum
                </span>
                <strong className="text-white font-mono">{inmetroCfg.gasolineKmPerLiter} km/L</strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Etanol Flex
                </span>
                <strong className="text-white font-mono">{inmetroCfg.ethanolKmPerLiter} km/L</strong>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Ref: {inmetroCfg.referenceNote || "INMETRO PBEV Fiesta Sedan 2008 1.0 Flex"}
            </span>
          </div>

          {/* Box 3: Diagnóstico & Média Geral */}
          <div className="p-4 rounded-2xl bg-slate-950/75 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Média Geral Acumulada
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${avgSemaforoColor}`}>
                {avgSemaforoBadge}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <strong className="text-2xl font-black text-white font-mono">
                {autoMetrics.avgKmPerLiter.toFixed(1)}
              </strong>
              <span className="text-xs text-slate-400 font-bold">km/L</span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              {avgPctOfInmetro}% da eficiência esperada pelo INMETRO
            </span>
            {/* Barra de progresso visual de eficiência */}
            <div className="space-y-1 pt-1">
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    avgPctOfInmetro >= inmetroCfg.greenThresholdPct
                      ? "bg-emerald-500"
                      : avgPctOfInmetro >= inmetroCfg.yellowThresholdPct
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, avgPctOfInmetro))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>0%</span>
                <span>{inmetroCfg.yellowThresholdPct}% (Amarelo)</span>
                <span>{inmetroCfg.greenThresholdPct}% (Verde)</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DESTAQUE: ABASTECIMENTO MAIS CARO & LEGENDA DO SEMÁFORO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Abastecimento Mais Caro */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Abastecimento Mais Caro Registrado
            </span>
            {mostExpensiveFuel && (
              <span className="font-mono text-xs text-slate-400">
                {formatDateBR(mostExpensiveFuel.date)}
              </span>
            )}
          </div>

          {mostExpensiveFuel ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <span className="text-[11px] text-slate-400 block">Valor Total</span>
                <strong className={`text-xl font-extrabold text-amber-400 font-mono tabular-nums ${moneyBlur}`}>
                  {formatBRL(mostExpensiveFuel.amount)}
                </strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Litros Abastecidos</span>
                <strong className="text-xl font-extrabold text-white font-mono tabular-nums">
                  {mostExpensiveFuel.liters ? `${mostExpensiveFuel.liters.toFixed(1)} L` : "—"}
                </strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Preço por Litro</span>
                <strong className={`text-xl font-extrabold text-emerald-400 font-mono tabular-nums ${moneyBlur}`}>
                  {mostExpensiveFuel.liters
                    ? formatBRL(mostExpensiveFuel.amount / mostExpensiveFuel.liters) + "/L"
                    : "—"}
                </strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Registro / Posto</span>
                <strong className="text-xs font-semibold text-slate-200 block truncate mt-1">
                  {mostExpensiveFuel.description}
                </strong>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3">Nenhum abastecimento registrado até o momento.</p>
          )}
        </div>

        {/* Legenda das Cores do Semáforo */}
        <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-3 text-xs shadow-xl">
          <div className="flex items-center gap-1.5 text-white font-extrabold text-sm border-b border-white/10 pb-2">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>Semáforo de Consumo & INMETRO</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <span className="font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Verde (Bom)
              </span>
              <span>≥ {inmetroCfg.greenThresholdPct}% da referência</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <span className="font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Amarelo (Mediano)
              </span>
              <span>
                {inmetroCfg.yellowThresholdPct}% a {inmetroCfg.greenThresholdPct - 1}% da ref.
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <span className="font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Vermelho (Ruim)
              </span>
              <span>Abaixo de {inmetroCfg.yellowThresholdPct}% da ref.</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 pt-1 leading-snug">
            Ref: {inmetroCfg.referenceNote} (Gasolina: {inmetroCfg.gasolineKmPerLiter} km/l | Etanol:{" "}
            {inmetroCfg.ethanolKmPerLiter} km/l).
          </p>
        </div>
      </div>

      {/* GRÁFICOS DO VEÍCULO */}
      <div className="grid grid-cols-12 gap-6">
        {autoWidgetsList
          .filter((w) => w.visible !== false)
          .map((widget) => {
            const widgetSize: ChartWidgetSize = widget.size ?? "half";
            const cfg = getAutoWidgetCfg(widget.id);

            return (
              <ChartCard
                key={widget.id}
                id={widget.id}
                title={widget.title}
                subtitle={widget.subtitle}
                chartKind={
                  widget.id === "auto_consumption" || widget.id === "auto_fuel_monthly" ? "bar" : "area"
                }
                hasMultipleSeries={widget.id === "auto_consumption"}
                size={widgetSize}
                onSizeChange={(nextSize) =>
                  handleUpdateAutoWidgetSize && handleUpdateAutoWidgetSize(widget.id, nextSize)
                }
                settings={cfg}
                defaultSettings={{ color: "auto", curveType: "monotone" }}
                onSettingsChange={(nextCfg) =>
                  handleUpdateAutoWidgetSettings &&
                  handleUpdateAutoWidgetSettings(widget.id, nextCfg)
                }
                onDragStartCard={(id) => handleDragStartAutoWidget && handleDragStartAutoWidget(id)}
                onDragEnterCard={(id) => handleDragEnterAutoWidget && handleDragEnterAutoWidget(id)}
                onDragEndCard={() => handleDragEndAutoWidget && handleDragEndAutoWidget()}
                isDragging={draggingAutoWidgetId === widget.id}
                isDropTarget={dragOverAutoWidgetId === widget.id}
                className="glass-card"
              >
                {/* Gráfico 1: Evolução do Odômetro (KM) */}
                {widget.id === "auto_odometer" && (
                  <div className="h-64 select-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart accessibilityLayer={false} data={autoMetrics.kmRecords}>
                        <defs>
                          <linearGradient id="colorKm" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartTheme.odometerLine} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={chartTheme.odometerLine} stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        {cfg.showGrid && (
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                        )}
                        <XAxis
                          dataKey="date"
                          stroke="#64748b"
                          fontSize={11}
                          tickFormatter={(v) => formatDateBR(v)}
                        />
                        <YAxis stroke="#64748b" fontSize={11} domain={["auto", "auto"]} />
                        <Tooltip cursor={false} content={<CustomCyberTooltip isCurrency={false} />} />
                        <Area
                          type={cfg.curveType}
                          dataKey="km"
                          name="Odômetro (KM)"
                          stroke={cfg.color && cfg.color !== "auto" ? cfg.color : chartTheme.odometerLine}
                          strokeWidth={cfg.strokeWidth}
                          dot={cfg.showDots}
                          fill="url(#colorKm)"
                          fillOpacity={cfg.fillArea ? 1 : 0}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Gráfico 2: Consumo (km/l) com Linha de Referência do INMETRO */}
                {widget.id === "auto_consumption" && (
                  <div className="space-y-3">
                    <div className="h-64 select-none">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart accessibilityLayer={false} data={consumptionPoints} barSize={28}>
                          {cfg.showGrid && (
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                          )}
                          <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} domain={[0, 18]} />
                          <Tooltip cursor={false} content={<CustomCyberTooltip isCurrency={false} />} />
                          {cfg.showLegend && <Legend wrapperStyle={{ fontSize: "11px" }} />}
                          <ReferenceLine
                            y={inmetroCfg.gasolineKmPerLiter}
                            label={{
                              value: `INMETRO Gasolina: ${inmetroCfg.gasolineKmPerLiter} km/l`,
                              fill: "#38bdf8",
                              fontSize: 10,
                              position: "top"
                            }}
                            stroke="#38bdf8"
                            strokeDasharray="4 4"
                          />
                          <Bar
                            dataKey="kmPerLiter"
                            name="Rendimento (km/L Real)"
                            fill={cfg.color && cfg.color !== "auto" ? cfg.color : "#10b981"}
                            radius={[6, 6, 0, 0]}
                            label={
                              cfg.showDataLabels ? { position: "top", fill: "#cbd5e1", fontSize: 10 } : false
                            }
                          >
                            {consumptionPoints.map((pt, pIdx) => (
                              <Cell key={`bar-cell-${pIdx}`} fill={pt.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legenda de pontos de consumo com semáforo */}
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                      {consumptionPoints.map((pt, pIdx) => (
                        <span
                          key={pIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-white/10"
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pt.color }} />
                          <span className="text-white font-mono tabular-nums">{pt.label}:</span>
                          <strong style={{ color: pt.color }} className="font-mono tabular-nums">
                            {pt.kmPerLiter} km/L
                          </strong>
                          <span className="text-slate-400">({pt.fuelType})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gráfico 3: Gasto com Combustível por Mês (R$) */}
                {widget.id === "auto_fuel_monthly" && (
                  <div className="h-64 select-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart accessibilityLayer={false} data={fuelMonthlyData} barSize={32}>
                        {cfg.showGrid && (
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                        )}
                        <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `R$${v}`} />
                        <Tooltip cursor={false} content={<CustomCyberTooltip isCurrency={true} />} />
                        {cfg.showLegend && <Legend wrapperStyle={{ fontSize: "11px" }} />}
                        <Bar
                          dataKey="total"
                          name="Total Combustível (R$)"
                          fill={cfg.color && cfg.color !== "auto" ? cfg.color : "#f59e0b"}
                          radius={[6, 6, 0, 0]}
                          label={
                            cfg.showDataLabels ? { position: "top", fill: "#cbd5e1", fontSize: 10 } : false
                          }
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Gráfico 4: Preço do Litro ao Longo do Tempo (R$/L) */}
                {widget.id === "auto_price_per_liter" && (
                  <div className="h-64 select-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart accessibilityLayer={false} data={pricePerLiterData}>
                        {cfg.showGrid && (
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                        )}
                        <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `R$${v}`} domain={["auto", "auto"]} />
                        <Tooltip cursor={false} content={<CustomCyberTooltip isCurrency={true} />} />
                        {cfg.showLegend && <Legend wrapperStyle={{ fontSize: "11px" }} />}
                        <Line
                          type={cfg.curveType}
                          dataKey="price"
                          name="Preço / Litro (R$)"
                          stroke={cfg.color && cfg.color !== "auto" ? cfg.color : "#38bdf8"}
                          strokeWidth={cfg.strokeWidth}
                          dot={cfg.showDots}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </ChartCard>
            );
          })}
      </div>

      {/* Histórico Automotivo com Datas em DD/MM/AAAA */}
      <div className="glass-card p-6 rounded-3xl border border-white/[0.08] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white">Histórico Completo do Veículo</h3>
            <p className="text-xs text-slate-400">Todos os abastecimentos e manutenções ordenados cronologicamente.</p>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-[11px] text-slate-300 font-mono tabular-nums">
            {autoMetrics.autoTxs.length} lançamento(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
          {autoMetrics.autoTxs.map((item: Transaction) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-slate-950/75 border border-white/[0.06] hover:border-white/[0.12] flex items-center justify-between text-xs transition"
            >
              <div>
                <span className="font-bold block text-white">{item.description}</span>
                <span className="text-slate-400 text-[11px]">
                  {formatDateBR(item.date)} • {item.category}
                  {item.liters ? ` • ${item.liters}L` : ""}
                </span>
              </div>
              <div className="text-right">
                <span className={`font-extrabold text-amber-400 block font-mono tabular-nums ${moneyBlur}`}>
                  {formatBRL(item.amount)}
                </span>
                {item.km && (
                  <span className="font-mono tabular-nums text-[11px] text-slate-400">
                    {item.km.toLocaleString("pt-BR")} km
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehiclesTab;
