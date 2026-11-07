"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Fuel,
  Settings,
  Gauge,
  X,
  Award,
  Info,
  Calculator,
  Zap,
  Car,
  ShieldCheck,
  Sparkles,
  Percent,
  CheckCircle2,
  AlertCircle,
  Wrench,
  FileCheck,
  Coins,
  Plus,
  Pencil,
  Trash2
} from "lucide-react";
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
  todayBR,
  compareDatesBR,
  CustomCyberTooltip
} from "@/app/lifeos-data";
import ChartCard from "./ChartCard";
import {
  ChartWidgetSettings,
  ChartWidgetSize,
  DEFAULT_CHART_WIDGET_SETTINGS
} from "./ChartSettingsPopover";
import { SlidingSegmentedControl } from "./SlidingSegmentedControl";
import {
  calculateVehicleConsumption,
  calculateVehicleTco,
  isFuelTransaction,
  calculateVehicleMaintenancePlan,
  VehicleMaintenanceItem
} from "../lib/domain/vehicle-math";

export interface VehiclesTabProps {
  autoMetrics: {
    autoTxs: Transaction[];
    maxKm: number;
    distanceDriven: number;
    avgKmPerLiter: number;
    costPerKm: number;
    tcoPerKm?: number;
    fuelTotal: number;
    maintenanceTotal: number;
    totalAutoSpent: number;
    totalTCO?: number;
    ipvaTotal?: number;
    licenciamentoTotal?: number;
    seguroTotal?: number;
    estacionamentoTotal?: number;
    kmRecords: Array<{ date: string; km: number; [key: string]: unknown }>;
    [key: string]: unknown;
  };
  autoInmetroConfig?: AutoInmetroConfig;
  setAutoInmetroConfig?: (cfg: AutoInmetroConfig) => void;
  chartTheme: ChartThemeColors;
  updateChartThemeColor: (key: keyof ChartThemeColors, val: string) => void;
  handleOpenNewTxModal: (cat?: string) => void;
  onAddTransaction?: (tx: Transaction) => Promise<void> | void;
  onDeleteTransaction?: (id: string) => void;
  onEditTransaction?: (tx: Transaction) => void;
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
  onAddTransaction,
  onDeleteTransaction,
  onEditTransaction,
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

  // Calculadora Rápida Etanol vs Gasolina Flex
  const [calcGasPrice, setCalcGasPrice] = useState<string>("5.99");
  const [calcEthPrice, setCalcEthPrice] = useState<string>("4.19");

  // SPRINT 55: A-01 — Histórico e Plano de Manutenção Preventiva por Odômetro
  const [maintenanceHistory, setMaintenanceHistory] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("lifeos_vehicle_maintenance_v1");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const maintenancePlan = useMemo(() => {
    return calculateVehicleMaintenancePlan(autoMetrics.maxKm || 0, maintenanceHistory);
  }, [autoMetrics.maxKm, maintenanceHistory]);

  const handleRegisterMaintenance = async (item: VehicleMaintenanceItem) => {
    const currentKm = autoMetrics.maxKm || 0;
    const nextHist = { ...maintenanceHistory, [item.id]: currentKm };
    setMaintenanceHistory(nextHist);
    if (typeof window !== "undefined") {
      localStorage.setItem("lifeos_vehicle_maintenance_v1", JSON.stringify(nextHist));
    }

    if (onAddTransaction) {
      await onAddTransaction({
        id: `tx-maint-${Date.now()}`,
        date: todayBR(),
        description: `Revisão: ${item.name}`,
        amount: item.estimatedCost,
        category: "Manutenção Veículo",
        costType: "Variável",
        paymentMethod: "PIX",
        bankAccount: "Nubank",
        status: "Pago",
        km: currentKm,
        updatedAt: new Date().toISOString()
      });
      notify("Revisão Registrada!", `${item.name} atualizada no odômetro (${currentKm.toLocaleString("pt-BR")} km) e lançada no Livro Caixa.`, "success");
    } else {
      notify("Revisão Registrada!", `${item.name} atualizada no odômetro (${currentKm.toLocaleString("pt-BR")} km).`, "success");
    }
  };

  // Estado e Fluxo do Modal de Abastecimento Rápido (Telemetria + Lançamentos)
  const [showQuickFuelModal, setShowQuickFuelModal] = useState(false);
  const [quickFuelDate, setQuickFuelDate] = useState(() => todayBR());
  const [quickFuelType, setQuickFuelType] = useState<"Gasolina" | "Etanol">("Gasolina");
  const [quickFuelAmount, setQuickFuelAmount] = useState("");
  const [quickFuelLiters, setQuickFuelLiters] = useState("");
  const [quickFuelPrice, setQuickFuelPrice] = useState("");
  const [quickFuelKm, setQuickFuelKm] = useState("");
  const [quickFuelFullTank, setQuickFuelFullTank] = useState(true);
  const [quickFuelMethod, setQuickFuelMethod] = useState("PIX");
  const [quickFuelBank, setQuickFuelBank] = useState("Nubank");
  const [isSubmittingQuickFuel, setIsSubmittingQuickFuel] = useState(false);

  const handleQuickAmountChange = (val: string) => {
    setQuickFuelAmount(val);
    const numA = parseFloat(val.replace(",", "."));
    const numL = parseFloat(quickFuelLiters.replace(",", "."));
    const numP = parseFloat(quickFuelPrice.replace(",", "."));
    if (!isNaN(numA) && numA > 0) {
      if (!isNaN(numL) && numL > 0) {
        setQuickFuelPrice((numA / numL).toFixed(2));
      } else if (!isNaN(numP) && numP > 0) {
        setQuickFuelLiters((numA / numP).toFixed(2));
      }
    }
  };

  const handleQuickLitersChange = (val: string) => {
    setQuickFuelLiters(val);
    const numL = parseFloat(val.replace(",", "."));
    const numP = parseFloat(quickFuelPrice.replace(",", "."));
    const numA = parseFloat(quickFuelAmount.replace(",", "."));
    if (!isNaN(numL) && numL > 0) {
      if (!isNaN(numP) && numP > 0) {
        setQuickFuelAmount((numL * numP).toFixed(2));
      } else if (!isNaN(numA) && numA > 0) {
        setQuickFuelPrice((numA / numL).toFixed(2));
      }
    }
  };

  const handleQuickPriceChange = (val: string) => {
    setQuickFuelPrice(val);
    const numP = parseFloat(val.replace(",", "."));
    const numL = parseFloat(quickFuelLiters.replace(",", "."));
    const numA = parseFloat(quickFuelAmount.replace(",", "."));
    if (!isNaN(numP) && numP > 0) {
      if (!isNaN(numL) && numL > 0) {
        setQuickFuelAmount((numL * numP).toFixed(2));
      } else if (!isNaN(numA) && numA > 0) {
        setQuickFuelLiters((numA / numP).toFixed(2));
      }
    }
  };

  const handleQuickFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let numA = parseFloat(quickFuelAmount.replace(",", "."));
    const numL = parseFloat(quickFuelLiters.replace(",", "."));
    const numP = parseFloat(quickFuelPrice.replace(",", "."));

    if ((isNaN(numA) || numA <= 0) && !isNaN(numL) && numL > 0 && !isNaN(numP) && numP > 0) {
      numA = Math.round(numL * numP * 100) / 100;
    }

    if (isNaN(numA) || numA <= 0) {
      notify("Valor Obrigatório", "Informe o valor total pago ou litros + preço por litro.", "warning", "CONFIG");
      return;
    }

    setIsSubmittingQuickFuel(true);
    const txId = `fuel_tx_${Date.now()}`;
    const normDate = formatDateBR(quickFuelDate) || todayBR();

    const newTx: Transaction = {
      id: txId,
      date: normDate,
      description: `Abastecimento ${quickFuelType === "Etanol" ? "Etanol" : "Gasolina Comum"}`,
      amount: numA,
      category: "Gasolina",
      flowType: "EXPENSE",
      costType: "Variável",
      paymentMethod: quickFuelMethod,
      bankAccount: quickFuelBank,
      status: "Pago",
      km: quickFuelKm ? parseFloat(quickFuelKm) : undefined,
      liters: !isNaN(numL) && numL > 0 ? numL : undefined,
      fuelType: quickFuelType,
      fullTank: quickFuelFullTank,
      updatedAt: new Date().toISOString()
    };

    // Salva na telemetria local (lifeos_fuel_logs_v1)
    try {
      const raw = localStorage.getItem("lifeos_fuel_logs_v1");
      const list = raw ? JSON.parse(raw) : [];
      const entry = {
        id: txId,
        date: normDate,
        liters: newTx.liters || 0,
        pricePerLiter: newTx.liters && newTx.liters > 0 ? numA / newTx.liters : numP || 0,
        totalAmount: numA,
        odometer: newTx.km || 0,
        fuelType: quickFuelType,
        fullTank: quickFuelFullTank,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem("lifeos_fuel_logs_v1", JSON.stringify([entry, ...list.filter((l: any) => l.id !== txId)]));
    } catch (err) {
      console.error("Erro ao salvar telemetria lifeos_fuel_logs_v1", err);
    }

    try {
      if (onAddTransaction) {
        await onAddTransaction(newTx);
      } else {
        handleOpenNewTxModal("Gasolina");
      }
      notify("Abastecimento Registrado!", `${formatBRL(numA)} salvo com sucesso nos lançamentos e telemetria.`, "success", "FINANCE");
      setShowQuickFuelModal(false);
      setQuickFuelAmount("");
      setQuickFuelLiters("");
      setQuickFuelPrice("");
      setQuickFuelKm("");
    } catch (err) {
      console.error("Erro ao registrar abastecimento rápido", err);
      notify("Erro ao Salvar", "Não foi possível registrar o abastecimento.", "warning", "FINANCE");
    } finally {
      setIsSubmittingQuickFuel(false);
    }
  };

  // 1. Filtragem e Análise de Combustível
  const fuelTxs: Transaction[] = autoMetrics.autoTxs.filter(
    (t: Transaction) =>
      t.category.toLowerCase().includes("gasolina") ||
      t.category.toLowerCase().includes("combustível") ||
      t.category.toLowerCase().includes("etanol") ||
      (t.liters && t.liters > 0)
  );

  // Pré-popula os preços da calculadora com o último registro de cada combustível se houver
  useEffect(() => {
    const lastGas = fuelTxs.find(
      (t) =>
        t.liters &&
        t.liters > 0 &&
        t.amount > 0 &&
        (t.fuelType === "Gasolina" ||
          (!t.fuelType && !t.description.toLowerCase().includes("etanol") && !t.category.toLowerCase().includes("etanol")))
    );
    if (lastGas && lastGas.liters) {
      setCalcGasPrice((lastGas.amount / lastGas.liters).toFixed(2));
    }
    const lastEth = fuelTxs.find(
      (t) =>
        t.liters &&
        t.liters > 0 &&
        t.amount > 0 &&
        (t.fuelType === "Etanol" || t.description.toLowerCase().includes("etanol") || t.category.toLowerCase().includes("etanol"))
    );
    if (lastEth && lastEth.liters) {
      setCalcEthPrice((lastEth.amount / lastEth.liters).toFixed(2));
    }
  }, [fuelTxs.length]);

  // Abastecimento Mais Caro em Destaque
  const mostExpensiveFuel = fuelTxs.reduce(
    (prev: Transaction | null, curr: Transaction) => (curr.amount > (prev?.amount || 0) ? curr : prev),
    null
  );

  // Consumo Real (km/l) por abastecimento consecutivo e comparação com INMETRO (AUD-05 e AUD-08 via vehicle-math)
  const sortedFuelAsc = [...fuelTxs].sort((a, b) => compareDatesBR(a.date, b.date));
  const consumptionResult = useMemo(
    () => calculateVehicleConsumption(autoMetrics.autoTxs, inmetroCfg),
    [autoMetrics.autoTxs, inmetroCfg]
  );
  const consumptionPoints = consumptionResult.consumptionPoints;
  const lastConsumption = consumptionResult.lastConsumption;
  const effectiveLastKmL = consumptionResult.effectiveLastKmL;
  const effectiveLastFuelType = consumptionResult.effectiveLastFuelType;
  const effectiveLastPct = consumptionResult.effectiveLastPct;
  const avgPctOfInmetro = consumptionResult.avgPctOfInmetro;

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
      <div className="glass-card px-4 py-2.5 rounded-2xl border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shadow-xl mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white tracking-tight">Telemetria & Gestão de Meus Veículos</h2>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] sm:text-[11px] font-bold">
              Ford Fiesta Sedan 1.0 Flex
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhe odômetro, consumo com semáforo comparado ao INMETRO, custos por km e abastecimentos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowQuickFuelModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-xs text-white font-extrabold flex items-center gap-1.5 shadow-lg shadow-amber-600/25 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> + Abastecimento Rápido
          </button>

          <button
            type="button"
            onClick={() => handleOpenNewTxModal("Gasolina")}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-amber-300 font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Fuel className="w-3.5 h-3.5 text-amber-400" /> Posto Express (Abastecer)
          </button>

          <button
            type="button"
            onClick={() => setShowInmetroModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-indigo-300 font-bold flex items-center gap-1.5 transition"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-400" /> Metas INMETRO
          </button>

          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-white/10">
            <span className="text-[11px]">Odômetro:</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
        <div className="glass-card px-3.5 py-2.5 rounded-2xl border border-white/[0.08] flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5 block">
            Quilometragem Atual
          </span>
          <p className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums leading-tight">
            {autoMetrics.maxKm.toLocaleString("pt-BR")} km
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
            Rodado: {autoMetrics.distanceDriven} km
          </span>
        </div>

        {/* Consumo Médio com Semáforo */}
        <div className="glass-card px-3.5 py-2.5 rounded-2xl border border-indigo-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400">Consumo Médio</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold border ${avgSemaforoColor}`}>
              {avgSemaforoBadge}
            </span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums leading-tight">
            {autoMetrics.avgKmPerLiter.toFixed(1)} km/L
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-400 block mt-0.5 font-mono tabular-nums">
            {avgPctOfInmetro}% da ref. ({inmetroCfg.gasolineKmPerLiter} km/l)
          </span>
        </div>

        {/* Eficiência do Último Abastecimento */}
        <div className="glass-card px-3.5 py-2.5 rounded-2xl border border-amber-500/25 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400">Último Tanque</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold border ${lastSemaforoColor}`}>
              {lastSemaforoBadge}
            </span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums leading-tight">
            {effectiveLastKmL ? `${effectiveLastKmL} km/L` : `${autoMetrics.avgKmPerLiter.toFixed(1)} km/L`}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-400 block mt-0.5 font-mono tabular-nums truncate">
            {effectiveLastPct !== undefined
              ? `${effectiveLastPct}% ref. (${effectiveLastFuelType})`
              : "Aguardando"}
          </span>
        </div>

        <div className="glass-card px-3.5 py-2.5 rounded-2xl border border-amber-500/25 flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5 block">
            Combustível Total
          </span>
          <p className={`text-lg sm:text-xl font-bold text-amber-400 font-mono tabular-nums leading-tight ${moneyBlur}`}>
            {formatBRL(autoMetrics.fuelTotal)}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{fuelTxs.length} abastecimentos</span>
        </div>

        <div className="glass-card px-3.5 py-2.5 rounded-2xl border border-rose-500/25 flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5 block">
            Manutenção & Óleo
          </span>
          <p className={`text-lg sm:text-xl font-bold text-rose-400 font-mono tabular-nums leading-tight ${moneyBlur}`}>
            {formatBRL(autoMetrics.maintenanceTotal)}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Revisões e preventivos</span>
        </div>

        <div className="glass-card px-3.5 py-2.5 rounded-2xl border border-indigo-500/25 flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5 block">
            Custo / KM (TCO)
          </span>
          <p className={`text-lg sm:text-xl font-bold text-indigo-400 font-mono tabular-nums leading-tight ${moneyBlur}`}>
            {formatBRL(autoMetrics.tcoPerKm ?? autoMetrics.costPerKm)}/km
          </p>
          <span className={`text-[10px] sm:text-[11px] text-slate-400 font-mono tabular-nums mt-0.5 ${moneyBlur}`}>
            TCO: {formatBRL(autoMetrics.totalTCO ?? autoMetrics.totalAutoSpent)}
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
            onClick={() => setShowQuickFuelModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-amber-600/20 transition cursor-pointer"
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

      {/* SPRINT 23: CALCULADORA RÁPIDA ETANOL VS. GASOLINA & TCO REAL POR KM */}
      {(() => {
        const gasPriceNum = parseFloat(calcGasPrice) || 0;
        const ethPriceNum = parseFloat(calcEthPrice) || 0;
        const parityRatio = gasPriceNum > 0 ? (ethPriceNum / gasPriceNum) * 100 : 0;
        const inmetroRatio = (inmetroCfg.ethanolKmPerLiter / Math.max(0.1, inmetroCfg.gasolineKmPerLiter)) * 100;
        const isEtanolAdvantage = parityRatio > 0 && parityRatio <= inmetroRatio;
        const gasKmCost = inmetroCfg.gasolineKmPerLiter > 0 && gasPriceNum > 0 ? gasPriceNum / inmetroCfg.gasolineKmPerLiter : 0;
        const ethKmCost = inmetroCfg.ethanolKmPerLiter > 0 && ethPriceNum > 0 ? ethPriceNum / inmetroCfg.ethanolKmPerLiter : 0;
        const costDiffPerKm = Math.abs(gasKmCost - ethKmCost);
        const tankKm = 50 * (isEtanolAdvantage ? inmetroCfg.ethanolKmPerLiter : inmetroCfg.gasolineKmPerLiter);
        const tankSavings = costDiffPerKm * tankKm;

        const tcoCalc = calculateVehicleTco(
          autoMetrics.autoTxs,
          autoMetrics.fuelTotal,
          autoMetrics.distanceDriven
        );
        const totalTCO = tcoCalc.totalTCO || autoMetrics.totalTCO || autoMetrics.totalAutoSpent;
        const tcoPerKm = tcoCalc.tcoPerKm || autoMetrics.tcoPerKm || autoMetrics.costPerKm;
        const tcoItems = tcoCalc.tcoItems.map((item) => ({
          ...item,
          icon:
            item.label === "Combustível"
              ? Fuel
              : item.label === "Manutenção & Revisões"
              ? Wrench
              : item.label === "IPVA" || item.label === "Licenciamento"
              ? FileCheck
              : item.label === "Seguro Auto"
              ? ShieldCheck
              : Coins
        }));

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. CALCULADORA RÁPIDA ETANOL VS GASOLINA */}
            <div className="glass-card p-6 rounded-3xl border border-[#FF2A85]/35 bg-gradient-to-br from-[#1b082e]/80 via-slate-900/90 to-slate-950 shadow-[0_10px_30px_rgba(0,0,0,0.65),0_0_20px_rgba(255,42,133,0.15)] space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-pink-500/20 text-[#FF2A85] border border-pink-500/30">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>Calculadora Flex — Etanol vs. Gasolina</span>
                      <span className="px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 text-[10px] font-mono">
                        Regra dos 70% + Paridade Real
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Compare os preços na bomba com a relação de consumo real do Ford Fiesta 1.0 ({inmetroCfg.ethanolKmPerLiter} / {inmetroCfg.gasolineKmPerLiter} km/L = {inmetroRatio.toFixed(1)}%).
                    </p>
                  </div>
                </div>
              </div>

              {/* Inputs de Preço na Bomba */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-1">
                  <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-amber-400" /> Gasolina Comum (R$/L)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={calcGasPrice}
                      onChange={(e) => setCalcGasPrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono font-bold text-sm outline-none focus:border-amber-400 transition"
                      placeholder="5,99"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Custo: {gasKmCost > 0 ? formatBRL(gasKmCost) : "—"}/km
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
                  <label className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                    <span className="text-xs">🌱</span> Etanol Flex (R$/L)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={calcEthPrice}
                      onChange={(e) => setCalcEthPrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono font-bold text-sm outline-none focus:border-emerald-400 transition"
                      placeholder="4,19"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Custo: {ethKmCost > 0 ? formatBRL(ethKmCost) : "—"}/km
                  </span>
                </div>
              </div>

              {/* Barra de Paridade Comparativa */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-indigo-400" /> Relação de Preço (Etanol ÷ Gasolina)
                  </span>
                  <strong className={`font-mono tabular-nums text-sm ${parityRatio <= inmetroRatio ? "text-emerald-400" : "text-amber-400"}`}>
                    {parityRatio > 0 ? `${parityRatio.toFixed(1)}%` : "—"}
                  </strong>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      parityRatio <= inmetroRatio ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-amber-500 shadow-[0_0_10px_#f59e0b]"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, parityRatio))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Regra Geral: 70,0%</span>
                  <span className="text-indigo-300 font-bold">Paridade Fiesta Flex: {inmetroRatio.toFixed(1)}%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Veredito Dinâmico */}
              {parityRatio > 0 && (
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isEtanolAdvantage
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      : "bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isEtanolAdvantage ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    )}
                    <strong className="text-sm font-black uppercase tracking-wide">
                      {isEtanolAdvantage ? "Veredito: Abasteça com ETANOL" : "Veredito: Abasteça com GASOLINA"}
                    </strong>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {isEtanolAdvantage ? (
                      <>
                        O preço do Etanol está em <strong className="text-emerald-400 font-mono">{parityRatio.toFixed(1)}%</strong> da Gasolina, abaixo do limite de <strong className="text-white font-mono">{inmetroRatio.toFixed(1)}%</strong> do seu Fiesta. Você economiza cerca de <strong className="text-emerald-400 font-mono">{formatBRL(costDiffPerKm)}</strong> por km rodado (~{formatBRL(tankSavings)} por tanque cheio).
                      </>
                    ) : (
                      <>
                        O preço do Etanol está em <strong className="text-amber-400 font-mono">{parityRatio.toFixed(1)}%</strong> da Gasolina, acima da paridade ideal de <strong className="text-white font-mono">{inmetroRatio.toFixed(1)}%</strong>. A Gasolina Comum oferece maior autonomia e menor custo por km ({formatBRL(gasKmCost)}/km vs {formatBRL(ethKmCost)}/km).
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* 2. CARD DE TCO (CUSTO TOTAL DE PROPRIEDADE POR KM) */}
            <div className="glass-card p-6 rounded-3xl border border-indigo-500/35 bg-gradient-to-br from-[#12082b]/80 via-slate-900/90 to-slate-950 shadow-[0_10px_30px_rgba(0,0,0,0.65),0_0_20px_rgba(99,102,241,0.15)] space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>TCO Real — Custo Total de Propriedade</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono">
                        Consolidado
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Soma de Combustível + Manutenção + IPVA + Licenciamento + Seguro Auto + Estacionamento dividida pela quilometragem percorrida.
                    </p>
                  </div>
                </div>
              </div>

              {/* Destaque TCO Total e TCO por KM */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Custo Real por KM (TCO/KM)
                  </span>
                  <strong className={`text-2xl font-black text-indigo-300 font-mono tabular-nums block ${moneyBlur}`}>
                    {formatBRL(tcoPerKm)}/km
                  </strong>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Com base em {autoMetrics.distanceDriven.toLocaleString("pt-BR")} km rodados
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-pink-500/30 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Desembolso Total com o Veículo
                  </span>
                  <strong className={`text-2xl font-black text-[#FF2A85] font-mono tabular-nums block ${moneyBlur}`}>
                    {formatBRL(totalTCO)}
                  </strong>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {autoMetrics.autoTxs.length} registros automotivos
                  </span>
                </div>
              </div>

              {/* Breakdown de Custos do TCO */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Composição do Custo de Propriedade
                </span>
                <div className="space-y-1.5">
                  {tcoItems.map((item) => {
                    const ItemIcon = item.icon;
                    const pct = totalTCO > 0 ? Math.round((item.amount / totalTCO) * 100) : 0;
                    return (
                      <div
                        key={item.label}
                        className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <ItemIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-200 font-medium">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2.5 font-mono">
                          <span className="text-[10px] text-slate-400 font-bold">{pct}%</span>
                          <strong className={`text-white tabular-nums ${moneyBlur}`}>
                            {formatBRL(item.amount)}
                          </strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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

      {/* SPRINT 55: A-01 — PLANO DE MANUTENÇÃO PREVENTIVA POR ODÔMETRO */}
      <div className="glass-card p-6 rounded-3xl border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                Plano de Manutenção Preventiva por Odômetro
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A84FF]/20 text-[#0A84FF] border border-[#0A84FF]/30">
                  Odômetro Atual: {(autoMetrics.maxKm || 0).toLocaleString("pt-BR")} km
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Acompanhe o desgaste natural dos 5 componentes vitais e antecipe trocas antes de quebras graves.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {maintenancePlan.map((item) => {
            const isDanger = item.urgency === "danger";
            const isWarning = item.urgency === "warning";
            const progressColor = isDanger ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500";
            const badgeBg = isDanger
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
              : isWarning
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-white/[0.06] hover:border-white/[0.12] flex flex-col justify-between space-y-3 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-extrabold text-white text-xs">{item.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border tabular-nums ${badgeBg}`}>
                      {isDanger
                        ? `Vencido (${Math.abs(item.remainingKm).toLocaleString("pt-BR")} km)`
                        : `Restam ${item.remainingKm.toLocaleString("pt-BR")} km`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-300 font-mono tabular-nums">
                    <span>Desgaste: <strong>{item.wearPercent}%</strong></span>
                    <span>Intervalo: {item.intervalKm.toLocaleString("pt-BR")} km</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${progressColor}`}
                      style={{ width: `${item.wearPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono tabular-nums pt-1">
                    <span>Última: {item.lastDoneKm.toLocaleString("pt-BR")} km</span>
                    <span>Próxima: {item.nextDueKm.toLocaleString("pt-BR")} km</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Est.: <strong className="text-white">{formatBRL(item.estimatedCost)}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRegisterMaintenance(item)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    title="Salvar revisão feita no odômetro atual e lançar despesa no Livro Caixa"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Registrar Revisão
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
              <div className="flex items-center gap-2.5">
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
                {(onEditTransaction || onDeleteTransaction) && (
                  <div className="flex items-center gap-1 pl-2 border-l border-white/10">
                    {onEditTransaction && (
                      <button
                        type="button"
                        onClick={() => onEditTransaction(item)}
                        className="p-1 rounded-lg bg-white/5 hover:bg-indigo-600/30 text-slate-400 hover:text-indigo-300 transition cursor-pointer"
                        title="Editar abastecimento"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteTransaction && (
                      <button
                        type="button"
                        onClick={() => onDeleteTransaction(item.id)}
                        className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition cursor-pointer"
                        title="Excluir abastecimento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Abastecimento Rápido com createPortal */}
      {showQuickFuelModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 w-screen h-dvh z-[9999] bg-black/65 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
          <form
            onSubmit={handleQuickFuelSubmit}
            className="relative w-full max-w-md max-h-[90dvh] flex flex-col overflow-hidden rounded-2xl bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] shadow-2xl my-auto text-xs"
          >
            {/* Header */}
            <div className="shrink-0 px-5 pt-4 pb-3 border-b border-[var(--cupertino-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Abastecimento Rápido</h3>
                  <p className="text-[10px] text-slate-400">Sincronização atômica na telemetria e lançamentos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickFuelModal(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5 overflow-y-auto">
              {/* Tipo de Combustível */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Tipo de Combustível</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickFuelType("Gasolina")}
                    className={`min-h-[40px] py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      quickFuelType === "Gasolina"
                        ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                        : "bg-slate-950 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Fuel className="w-3.5 h-3.5 text-amber-400" /> Gasolina
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickFuelType("Etanol")}
                    className={`min-h-[40px] py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      quickFuelType === "Etanol"
                        ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300"
                        : "bg-slate-950 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>🌱</span> Etanol
                  </button>
                </div>
              </div>

              {/* Grid 3 inputs: Valor, Litros, Preço/L */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Valor Total (R$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={quickFuelAmount}
                    onChange={(e) => handleQuickAmountChange(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-xs tabular-nums outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Litros (L)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={quickFuelLiters}
                    onChange={(e) => handleQuickLitersChange(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-xs tabular-nums outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">R$ / Litro</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.00"
                    value={quickFuelPrice}
                    onChange={(e) => handleQuickPriceChange(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-xs tabular-nums outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Data & Odômetro */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Data (DD/MM/AAAA)</label>
                  <input
                    type="text"
                    placeholder="DD-MM-AAAA"
                    value={quickFuelDate}
                    onChange={(e) => setQuickFuelDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-xs tabular-nums outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Odômetro (KM)</label>
                  <input
                    type="number"
                    placeholder={autoMetrics.maxKm > 0 ? `Ant.: ${autoMetrics.maxKm}` : "KM Atual"}
                    value={quickFuelKm}
                    onChange={(e) => setQuickFuelKm(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-xs tabular-nums outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Seletor Deslizante de Método de Cálculo: Reserva / Parcial vs Tanque Cheio */}
              <div>
                <label className="text-slate-400 block mb-1 text-xs">Método de Cálculo de Abastecimento</label>
                <SlidingSegmentedControl
                  options={[
                    { id: "partial", label: "⛽ Reserva / Parcial" },
                    { id: "full", label: "満 Tanque Cheio" }
                  ]}
                  value={quickFuelFullTank ? "full" : "partial"}
                  onChange={(val) => setQuickFuelFullTank(val === "full")}
                  fullWidth={true}
                  size="sm"
                  activeColor={quickFuelFullTank ? "bg-amber-600 text-white shadow-md shadow-amber-600/30" : "bg-[#0A84FF] text-white shadow-sm"}
                />
              </div>

              {/* Forma de Pagamento e Banco */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Pagamento</label>
                  <select
                    value={quickFuelMethod}
                    onChange={(e) => setQuickFuelMethod(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Banco / Conta</label>
                  <input
                    type="text"
                    value={quickFuelBank}
                    onChange={(e) => setQuickFuelBank(e.target.value)}
                    placeholder="Ex: Nubank"
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-5 py-3 border-t border-[var(--cupertino-border)] bg-[var(--cupertino-card)]/80 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuickFuelModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingQuickFuel}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold flex items-center gap-1.5 shadow-lg shadow-amber-600/25 transition cursor-pointer disabled:opacity-50"
              >
                <Fuel className="w-3.5 h-3.5" />
                <span>{isSubmittingQuickFuel ? "Salvando..." : "Salvar Abastecimento"}</span>
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
};

export default VehiclesTab;
