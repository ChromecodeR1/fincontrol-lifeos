/**
 * Motor Matemático de Telemetria Automotiva, Consumo e TCO (Sprint 40)
 * PBEV / INMETRO, Cálculo Ponderado de Consumo (km/L) e TCO sem dupla contagem contábil.
 */

import { compareDatesBR, formatDateBR } from "./date-br";
import { fromCents, toCents } from "./finance";

export interface VehicleTransactionLike {
  id: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
  km?: number;
  liters?: number;
  fuelType?: "Gasolina" | "Etanol" | "GNV" | "Diesel";
  fullTank?: boolean;
  costType?: string;
  flowType?: string;
  deletedAt?: string;
}

export interface InmetroReferenceConfig {
  gasolineKmPerLiter: number;
  ethanolKmPerLiter: number;
  greenThresholdPct: number;
  yellowThresholdPct: number;
}

export interface VehicleConsumptionPoint {
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
}

export interface VehicleConsumptionResult {
  consumptionPoints: VehicleConsumptionPoint[];
  distanceDriven: number;
  totalFuelLiters: number;
  totalFuelCost: number;
  avgKmPerLiter: number;
  fuelCostPerKm: number;
  lastConsumption: VehicleConsumptionPoint | null;
  effectiveLastKmL: number | undefined;
  effectiveLastFuelType: string;
  effectiveLastPct: number | undefined;
  avgPctOfInmetro: number;
  maxKm: number;
  minKm: number;
}

export interface VehicleTcoItem {
  label: string;
  amount: number;
  color: string;
  pct: number;
}

export interface VehicleTcoResult {
  totalTCO: number;
  tcoPerKm: number;
  fuelTotal: number;
  maintenanceTotal: number;
  ipvaTotal: number;
  licenciamentoTotal: number;
  seguroTotal: number;
  estacionamentoTotal: number;
  tcoItems: VehicleTcoItem[];
}

export function isFuelTransaction(tx: { category?: string; description?: string; liters?: number; fuelType?: string }): boolean {
  if (tx.liters && tx.liters > 0) return true;
  if (tx.fuelType && ["Gasolina", "Etanol", "Diesel", "GNV"].includes(tx.fuelType)) return true;

  const cat = (tx.category || "").toLowerCase().trim();
  const desc = (tx.description || "").toLowerCase().trim();

  // Exclusão estrita de falsos positivos conhecidos (como Impostos, IPVA, Seguro)
  if (
    cat.includes("imposto") ||
    desc.includes("imposto") ||
    cat.includes("ipva") ||
    desc.includes("ipva") ||
    cat.includes("licenciamento") ||
    desc.includes("licenciamento") ||
    cat.includes("seguro") ||
    cat.includes("multa")
  ) {
    return false;
  }

  // Categorias canônicas de combustível
  if (
    cat === "gasolina" ||
    cat === "etanol" ||
    cat === "combustível" ||
    cat === "combustivel" ||
    cat === "abastecimento" ||
    cat.includes("combustível") ||
    cat.includes("combustivel") ||
    cat.includes("gasolina") ||
    cat.includes("etanol")
  ) {
    return true;
  }

  // Descrições específicas de abastecimento ou postos de combustível
  if (
    desc.includes("abastecimento") ||
    desc.includes("gasolina") ||
    desc.includes("etanol") ||
    desc.includes("diesel") ||
    desc.includes("gnv") ||
    /\bposto\b/i.test(desc) ||
    /\bipiranga\b/i.test(desc) ||
    /\bshell\b/i.test(desc) ||
    /\bpetrobras\b/i.test(desc)
  ) {
    return true;
  }

  return false;
}

export function calculateVehicleConsumption(
  transactions: VehicleTransactionLike[],
  inmetroCfg: InmetroReferenceConfig
): VehicleConsumptionResult {
  const fuelTxs = transactions
    .filter((t) => !t.deletedAt && isFuelTransaction(t))
    .sort((a, b) => compareDatesBR(a.date, b.date));

  const fuelWithKmAndLiters = fuelTxs.filter(
    (t) => typeof t.km === "number" && t.km > 0 && typeof t.liters === "number" && t.liters > 0
  );

  const kms = fuelWithKmAndLiters.map((t) => t.km as number);
  const maxKm = kms.length ? Math.max(...kms) : 0;
  const minKm = kms.length ? Math.min(...kms) : 0;
  const distanceDriven = Math.max(0, maxKm - minKm);

  const totalFuelLiters = fuelTxs.reduce((acc, t) => acc + (t.liters || 0), 0);
  const totalFuelCost = fuelTxs.reduce((acc, t) => acc + (t.amount || 0), 0);

  const consumptionPoints: VehicleConsumptionPoint[] = [];

  let accumulatedPartialLiters = 0;
  let accumulatedPartialCost = 0;
  let lastAnchorKm = fuelWithKmAndLiters.length > 0 ? (fuelWithKmAndLiters[0].km || 0) : 0;
  let totalTrackedKm = 0;
  let totalTrackedLiters = 0;

  for (let i = 1; i < fuelWithKmAndLiters.length; i++) {
    const curr = fuelWithKmAndLiters[i];
    const lit = curr.liters || 0;
    const cost = curr.amount || 0;

    const isPartial = curr.fullTank === false;
    accumulatedPartialLiters += lit;
    accumulatedPartialCost += cost;

    if (!isPartial || i === fuelWithKmAndLiters.length - 1) {
      const dist = (curr.km || 0) - lastAnchorKm;
      const totalPeriodLiters = accumulatedPartialLiters;

      if (dist > 0 && totalPeriodLiters > 0) {
        totalTrackedKm += dist;
        totalTrackedLiters += totalPeriodLiters;

        const kml = Number((dist / totalPeriodLiters).toFixed(2));
        const isEtanol =
          curr.fuelType === "Etanol" ||
          (curr.description && curr.description.toLowerCase().includes("etanol")) ||
          (curr.category && curr.category.toLowerCase().includes("etanol"));
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

        const priceL = totalPeriodLiters > 0 ? Number((accumulatedPartialCost / totalPeriodLiters).toFixed(2)) : 0;
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
          liters: totalPeriodLiters,
          totalAmount: accumulatedPartialCost,
          description: curr.description || "Abastecimento"
        });
      }

      lastAnchorKm = curr.km || 0;
      accumulatedPartialLiters = 0;
      accumulatedPartialCost = 0;
    }
  }

  const lastConsumption = consumptionPoints.length > 0 ? consumptionPoints[consumptionPoints.length - 1] : null;

  let effectiveLastKmL = lastConsumption?.kmPerLiter;
  let effectiveLastFuelType = lastConsumption?.fuelType || "Gasolina";
  let effectiveLastPct = lastConsumption?.pctOfInmetro;

  if (!effectiveLastKmL && fuelWithKmAndLiters.length >= 1 && distanceDriven > 0) {
    const latestFuel = fuelWithKmAndLiters[fuelWithKmAndLiters.length - 1];
    if (latestFuel.liters && latestFuel.liters > 0) {
      effectiveLastKmL = Number((distanceDriven / latestFuel.liters).toFixed(2));
      const isEtanol =
        (latestFuel.description && latestFuel.description.toLowerCase().includes("etanol")) ||
        (latestFuel.category && latestFuel.category.toLowerCase().includes("etanol"));
      effectiveLastFuelType = isEtanol ? "Etanol" : "Gasolina";
      const ref = isEtanol ? inmetroCfg.ethanolKmPerLiter : inmetroCfg.gasolineKmPerLiter;
      effectiveLastPct = Math.round((effectiveLastKmL / Math.max(0.1, ref)) * 100);
    }
  }

  // Média ponderada real: km/L = totalTrackedKm / totalTrackedLiters (fallback para distanceDriven / totalFuelLiters)
  const avgKmPerLiter =
    totalTrackedKm > 0 && totalTrackedLiters > 0
      ? Number((totalTrackedKm / totalTrackedLiters).toFixed(2))
      : distanceDriven > 0 && totalFuelLiters > 0
      ? Number((distanceDriven / totalFuelLiters).toFixed(2))
      : inmetroCfg.gasolineKmPerLiter;

  const fuelCostPerKm =
    distanceDriven > 0 && totalFuelCost > 0
      ? Number((totalFuelCost / distanceDriven).toFixed(2))
      : 0;

  const avgPctOfInmetro = Math.round((avgKmPerLiter / Math.max(0.1, inmetroCfg.gasolineKmPerLiter)) * 100);

  return {
    consumptionPoints,
    distanceDriven,
    totalFuelLiters,
    totalFuelCost,
    avgKmPerLiter,
    fuelCostPerKm,
    lastConsumption,
    effectiveLastKmL,
    effectiveLastFuelType,
    effectiveLastPct,
    avgPctOfInmetro,
    maxKm,
    minKm
  };
}

export function calculateVehicleTco(
  transactions: VehicleTransactionLike[],
  fuelTotalOverride?: number,
  distanceDrivenOverride?: number
): VehicleTcoResult {
  let fuelCents = typeof fuelTotalOverride === "number" ? toCents(fuelTotalOverride) : 0;
  let maintCents = 0;
  let ipvaCents = 0;
  let licCents = 0;
  let seguroCents = 0;
  let estacCents = 0;

  for (const t of transactions) {
    if (t.deletedAt) continue;
    const cat = (t.category || "").toLowerCase();
    const desc = (t.description || "").toLowerCase();
    const amtC = toCents(t.amount || 0);
    if (amtC <= 0) continue;

    // Se for combustível e não temos override, computa fuelCents
    if (isFuelTransaction(t)) {
      if (typeof fuelTotalOverride !== "number") {
        fuelCents += amtC;
      }
      // Se tiver fuelTotalOverride, IGNORA para evitar dupla contagem!
      continue;
    }

    // Despesas Veiculares não-combustível
    if (cat.includes("ipva") || desc.includes("ipva")) {
      ipvaCents += amtC;
    } else if (cat.includes("licenciamento") || desc.includes("licenciamento")) {
      licCents += amtC;
    } else if (cat.includes("seguro") || desc.includes("seguro auto") || desc.includes("seguro veic")) {
      seguroCents += amtC;
    } else if (
      cat.includes("estacionamento") ||
      cat.includes("pedágio") ||
      cat.includes("pedagio") ||
      desc.includes("estacionamento") ||
      desc.includes("pedagio")
    ) {
      estacCents += amtC;
    } else if (
      cat.includes("veículo") ||
      cat.includes("veiculo") ||
      cat.includes("manutenção") ||
      cat.includes("manutencao") ||
      cat.includes("lavagem") ||
      cat.includes("multa") ||
      cat.includes("acessórios") ||
      desc.includes("oficina") ||
      desc.includes("mecanico") ||
      desc.includes("pneu") ||
      desc.includes("óleo") ||
      desc.includes("oleo")
    ) {
      maintCents += amtC;
    }
  }

  const fuelTotal = fromCents(fuelCents);
  const maintenanceTotal = fromCents(maintCents);
  const ipvaTotal = fromCents(ipvaCents);
  const licenciamentoTotal = fromCents(licCents);
  const seguroTotal = fromCents(seguroCents);
  const estacionamentoTotal = fromCents(estacCents);

  const totalTcoCents = fuelCents + maintCents + ipvaCents + licCents + seguroCents + estacCents;
  const totalTCO = fromCents(totalTcoCents);

  const distance = typeof distanceDrivenOverride === "number" && distanceDrivenOverride > 0 ? distanceDrivenOverride : 0;
  const tcoPerKm = distance > 0 ? Number((totalTCO / distance).toFixed(2)) : 0;

  const rawItems = [
    { label: "Combustível", amount: fuelTotal, color: "#f59e0b" },
    { label: "Manutenção & Revisões", amount: maintenanceTotal, color: "#ef4444" },
    { label: "IPVA", amount: ipvaTotal, color: "#a855f7" },
    { label: "Licenciamento", amount: licenciamentoTotal, color: "#06b6d4" },
    { label: "Seguro Auto", amount: seguroTotal, color: "#3b82f6" },
    { label: "Estacionamento / Pedágio", amount: estacionamentoTotal, color: "#10b981" }
  ].filter((i) => i.amount > 0);

  const tcoItems: VehicleTcoItem[] = rawItems.map((item) => ({
    ...item,
    pct: totalTCO > 0 ? Math.round((item.amount / totalTCO) * 100) : 0
  }));

  return {
    totalTCO,
    tcoPerKm,
    fuelTotal,
    maintenanceTotal,
    ipvaTotal,
    licenciamentoTotal,
    seguroTotal,
    estacionamentoTotal,
    tcoItems
  };
}

// ============================================================================
// SPRINT 55: A-01 — PLANO DE MANUTENÇÃO PREVENTIVA POR ODÔMETRO
// ============================================================================

export interface VehicleMaintenanceItem {
  id: string;
  name: string;
  intervalKm: number;
  lastDoneKm: number;
  nextDueKm: number;
  remainingKm: number;
  wearPercent: number; // 0 a 100%
  urgency: "ok" | "warning" | "danger";
  estimatedCost: number;
  description: string;
}

export interface CustomMaintenanceDefinition {
  id: string;
  name: string;
  intervalKm: number;
  estimatedCost: number;
  description: string;
  lastDoneKm?: number;
}

export const DEFAULT_MAINTENANCE_SCHEDULE: CustomMaintenanceDefinition[] = [
  {
    id: "oil_filter",
    name: "Óleo do Motor & Filtros",
    intervalKm: 10000,
    estimatedCost: 350,
    description: "Troca do óleo lubrificante sintético, filtro de óleo, combustível e ar do motor."
  },
  {
    id: "alignment_tires",
    name: "Alinhamento & Rodízio de Pneus",
    intervalKm: 10000,
    estimatedCost: 180,
    description: "Alinhamento computadorizado 3D, balanceamento das 4 rodas e rodízio em X."
  },
  {
    id: "brakes_pads",
    name: "Pastilhas & Fluido de Freio",
    intervalKm: 25000,
    estimatedCost: 550,
    description: "Inspeção e substituição das pastilhas de freio dianteiras e sangria do fluido DOT 4."
  },
  {
    id: "coolant_plugs",
    name: "Arrefecimento & Velas de Ignição",
    intervalKm: 30000,
    estimatedCost: 480,
    description: "Limpeza do radiador com aditivo orgânico e troca do jogo de velas de ignição."
  },
  {
    id: "timing_belt",
    name: "Correia Dentada & Tensores",
    intervalKm: 50000,
    estimatedCost: 1200,
    description: "Substituição preventiva do kit de correia sincronizadora, polias e correia de acessórios."
  }
];

export function calculateVehicleMaintenancePlan(
  currentOdometerKm: number,
  maintenanceHistory: Record<string, number> = {},
  customSchedule?: CustomMaintenanceDefinition[]
): VehicleMaintenanceItem[] {
  const currentKm = Math.max(0, currentOdometerKm || 0);
  const schedule = customSchedule && customSchedule.length > 0 ? customSchedule : DEFAULT_MAINTENANCE_SCHEDULE;

  return schedule.map((item) => {
    let lastDone = item.lastDoneKm;
    if (typeof lastDone !== "number" || isNaN(lastDone)) {
      lastDone = maintenanceHistory[item.id];
    }
    if (typeof lastDone !== "number" || isNaN(lastDone)) {
      if (currentKm >= item.intervalKm) {
        lastDone = Math.floor(currentKm / item.intervalKm) * item.intervalKm;
      } else {
        lastDone = 0;
      }
    }

    const interval = Math.max(1, item.intervalKm || 10000);
    const nextDue = lastDone + interval;
    const remainingKm = nextDue - currentKm;
    const kmSinceLast = Math.max(0, currentKm - lastDone);
    const wearPercent = Math.min(100, Math.max(0, Math.round((kmSinceLast / interval) * 100)));

    let urgency: "ok" | "warning" | "danger" = "ok";
    if (remainingKm <= 0) {
      urgency = "danger";
    } else if (remainingKm <= 1000 || wearPercent >= 90) {
      urgency = "warning";
    }

    return {
      id: item.id,
      name: item.name,
      intervalKm: interval,
      lastDoneKm: lastDone,
      nextDueKm: nextDue,
      remainingKm,
      wearPercent,
      urgency,
      estimatedCost: item.estimatedCost || 0,
      description: item.description || ""
    };
  });
}
