/**
 * Motor Matemático de Rendimento Automático de Investimentos CDI (Sprint 30)
 * Capitalização diária composta em dias úteis (252 dias/ano)
 * Alinhado com a taxa CDI anualizada oficial do Banco Central do Brasil (SGS).
 */

import {
  parseDateParts,
  toSortableISO,
  formatMonthShortLabelBR,
  daysInMonth
} from "./date-br";
import { fromCents, toCents, safeAdd, safeSub } from "./finance";

export type YieldMode = "bruto" | "liquido" | "aportes";

export interface InvestmentYieldConfig {
  cdiAnnualRate?: number;       // Ex: 13.65 (13.65% a.a.) ou 12.15
  defaultCdiPercentage?: number;// Ex: 115 ou 100
  manualAdjustment?: number;    // Ex: +15.50 (Ajuste de Saldo Real do App Nubank/BTG)
  yieldMode?: YieldMode;        // "bruto" | "liquido" | "aportes"
}

export interface InvestmentTransactionLike {
  id?: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
  indexer?: string;
  cdiPercentage?: number;
  isSplitChild?: boolean;
  deletedAt?: string;
}

export interface MonthlyPatrimonyYieldPoint {
  month: string;                // "2026-10"
  label: string;                // "Out/26"
  aportado: number;             // Aportes brutos no mês (sempre >= 0)
  resgatado: number;            // Resgates no mês (sempre >= 0)
  capitalAportadoPuro: number;  // Capital investido líquido (Aportes - Resgates)
  rendimentoBruto: number;      // Rendimento CDI bruto acumulado até este mês
  rendimentoLiquido: number;    // Rendimento CDI líquido estimado acumulado (após IR)
  acumuladoComRendimento: number;// Capital + Rendimento Bruto (+ Ajuste manual)
  acumulado: number;            // Valor ativo exibido conforme o yieldMode selecionado
  [key: string]: unknown;
}

export interface PortfolioYieldResult {
  data: MonthlyPatrimonyYieldPoint[];
  currentCapitalAportado: number;
  grossYieldAccumulated: number;
  netYieldEstimated: number;
  saldoComRendimentoBruto: number;
  saldoComRendimentoLiquido: number;
  totalAportes: number;
  totalResgates: number;
  hasDeficit: boolean;
  deficitAmount: number;
  saldoFinal: number;
  cdiAnnualRateUsed: number;
  appliedCdiPercentage: number;
  manualAdjustmentApplied: number;
}

/**
 * Extrai percentual do CDI de textos como "Caixinha Turbo (115% CDI)" ou "CDB 100% CDI".
 * Se não encontrar padrão explícito, assume defaultPercent (padrão 100 ou 115 para Caixinha Turbo).
 */
export function extractCdiPercentage(text?: string, defaultPercent = 100): number {
  if (!text) return defaultPercent;
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*%\s*(?:do\s*)?CDI/i);
  if (match && match[1]) {
    const val = parseFloat(match[1].replace(",", "."));
    if (!isNaN(val) && val > 0) return val;
  }
  if (/caixinha\s*turbo/i.test(text)) {
    return 115;
  }
  return defaultPercent;
}

/**
 * Tabela regressiva oficial do Imposto de Renda para Renda Fixa / CDI:
 * - Até 180 dias: 22,5%
 * - De 181 a 360 dias: 20,0%
 * - De 361 a 720 dias: 17,5%
 * - Acima de 720 dias: 15,0%
 */
export function getRegressiveIRRate(daysElapsed: number): number {
  if (daysElapsed <= 180) return 0.225;
  if (daysElapsed <= 360) return 0.200;
  if (daysElapsed <= 720) return 0.175;
  return 0.150;
}

/**
 * Calcula o fator de rendimento diário para o número de dias úteis padrão (252 dias/ano).
 * dailyRate = ((1 + cdiAnnualRate / 100) ** (1 / 252) - 1) * (cdiPercentage / 100)
 */
export function calculateDailyCdiFactor(cdiAnnualRate: number, cdiPercentage = 100): number {
  if (cdiAnnualRate <= 0) return 0;
  const baseFactor = Math.pow(1 + cdiAnnualRate / 100, 1 / 252) - 1;
  return baseFactor * (cdiPercentage / 100);
}

/**
 * Determina se a data é um dia útil (segunda a sexta).
 * 0 = Domingo, 6 = Sábado
 */
export function isBusinessDay(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day);
  const dow = d.getDay();
  return dow >= 1 && dow <= 5;
}

function isResgateCategory(category: string): boolean {
  const lower = category.toLowerCase();
  return lower.includes("resgate");
}

/**
 * Motor Contábil Puro de Rendimentos CDI:
 * Percorre os dias úteis aplicando a taxa diária do CDI e acumulando o rendimento
 * composto em centavos inteiros, gerando os pontos mensais para os gráficos.
 */
export function calculatePortfolioCdiYield(
  transactions: InvestmentTransactionLike[],
  config: InvestmentYieldConfig = {},
  initialReserveBalance = 0
): PortfolioYieldResult {
  const cdiAnnual = typeof config.cdiAnnualRate === "number" && config.cdiAnnualRate > 0
    ? config.cdiAnnualRate
    : 13.65; // Taxa padrão do Banco Central
  const defaultCdiPct = config.defaultCdiPercentage || 115;
  const manualAdjustment = config.manualAdjustment || 0;
  const yieldMode = config.yieldMode || "bruto";

  // Filtra lançamentos de investimento válidos
  const investTxs = transactions.filter((t) => {
    if (t.isSplitChild || t.deletedAt) return false;
    const c = t.category.toLowerCase();
    return (
      c.includes("aporte") ||
      c.includes("investimento") ||
      c.includes("resgate") ||
      c.includes("caixinha")
    );
  });

  const totAportes = safeAdd(
    ...investTxs.filter((t) => !isResgateCategory(t.category)).map((t) => t.amount)
  );
  const totResgates = safeAdd(
    ...investTxs.filter((t) => isResgateCategory(t.category)).map((t) => t.amount)
  );

  let hasOverallDeficit = false;
  let maxDeficit = 0;
  const totalCapacity = safeAdd(totAportes, initialReserveBalance);
  if (totResgates > totalCapacity) {
    hasOverallDeficit = true;
    maxDeficit = safeSub(totResgates, totalCapacity);
  }

  if (investTxs.length === 0 && initialReserveBalance <= 0) {
    return {
      data: [],
      currentCapitalAportado: 0,
      grossYieldAccumulated: 0,
      netYieldEstimated: 0,
      saldoComRendimentoBruto: 0,
      saldoComRendimentoLiquido: 0,
      totalAportes: 0,
      totalResgates: 0,
      hasDeficit: false,
      deficitAmount: 0,
      saldoFinal: 0,
      cdiAnnualRateUsed: cdiAnnual,
      appliedCdiPercentage: defaultCdiPct,
      manualAdjustmentApplied: manualAdjustment
    };
  }

  // Agrupa transações por data no formato ordenável "YYYY-MM-DD"
  const txByDate = new Map<string, InvestmentTransactionLike[]>();
  let earliestDateISO = "2099-12-31";
  let latestDateISO = "1970-01-01";

  investTxs.forEach((t) => {
    const iso = toSortableISO(t.date);
    if (!iso) return;
    if (iso < earliestDateISO) earliestDateISO = iso;
    if (iso > latestDateISO) latestDateISO = iso;

    const list = txByDate.get(iso) || [];
    list.push(t);
    txByDate.set(iso, list);
  });

  // Se não houver transações mas tiver initialReserveBalance
  if (earliestDateISO === "2099-12-31") {
    earliestDateISO = "2026-05-01";
    latestDateISO = "2026-10-31";
  }

  // Define os limites temporais de início e fim da simulação
  const startParts = parseDateParts(earliestDateISO) || { year: 2025, month: 12, day: 9 };
  const endParts = parseDateParts(latestDateISO) || { year: 2026, month: 10, day: 31 };

  // Fator diário padrão
  const dailyRate = calculateDailyCdiFactor(cdiAnnual, defaultCdiPct);

  // Estados acumuladores em centavos inteiros
  let principalCents = toCents(initialReserveBalance);
  let runningWithYieldCents = toCents(initialReserveBalance);
  let grossYieldCents = 0;
  let netYieldCents = 0;

  // Mapa de agrupamento mensal de aportes e resgates brutos
  const monthAportesCents = new Map<string, number>();
  const monthResgatesCents = new Map<string, number>();

  investTxs.forEach((t) => {
    const ym = toSortableISO(t.date).slice(0, 7);
    const amtC = toCents(t.amount);
    if (isResgateCategory(t.category)) {
      monthResgatesCents.set(ym, (monthResgatesCents.get(ym) || 0) + amtC);
    } else {
      monthAportesCents.set(ym, (monthAportesCents.get(ym) || 0) + amtC);
    }
  });

  const monthlyPoints: MonthlyPatrimonyYieldPoint[] = [];

  let curYear = startParts.year;
  let curMonth = startParts.month;
  let curDay = startParts.day;
  let daysElapsed = 0;

  // Itera dia a dia cronologicamente calculando os rendimentos compostos
  while (
    curYear < endParts.year ||
    (curYear === endParts.year && curMonth < endParts.month) ||
    (curYear === endParts.year && curMonth === endParts.month && curDay <= endParts.day)
  ) {
    const ymKey = `${curYear}-${String(curMonth).padStart(2, "0")}`;
    const dateKey = `${ymKey}-${String(curDay).padStart(2, "0")}`;

    // Processa transações do dia
    const dailyTxs = txByDate.get(dateKey);
    if (dailyTxs && dailyTxs.length > 0) {
      for (const tx of dailyTxs) {
        const amtCents = toCents(tx.amount);
        if (isResgateCategory(tx.category)) {
          principalCents = Math.max(0, principalCents - amtCents);
          runningWithYieldCents = Math.max(0, runningWithYieldCents - amtCents);
        } else {
          principalCents += amtCents;
          runningWithYieldCents += amtCents;
        }
      }
    }

    // Capitalização diária em dias úteis
    daysElapsed++;
    if (isBusinessDay(curYear, curMonth, curDay) && runningWithYieldCents > 0) {
      const dayGrossCents = Math.round(runningWithYieldCents * dailyRate);
      grossYieldCents += dayGrossCents;
      runningWithYieldCents += dayGrossCents;

      const irRate = getRegressiveIRRate(daysElapsed);
      const dayNetCents = Math.round(dayGrossCents * (1 - irRate));
      netYieldCents += dayNetCents;
    }

    // Verifica se é o último dia do mês ou o último dia da simulação para salvar o ponto mensal
    const totalDaysInCurMonth = daysInMonth(curYear, curMonth);
    const isLastDayOfMonth = curDay === totalDaysInCurMonth;
    const isLastDayOfSim =
      curYear === endParts.year && curMonth === endParts.month && curDay === endParts.day;

    if (isLastDayOfMonth || isLastDayOfSim) {
      const aportadoMes = fromCents(monthAportesCents.get(ymKey) || 0);
      const resgatadoMes = fromCents(monthResgatesCents.get(ymKey) || 0);
      const capitalPuro = fromCents(principalCents);
      const rBruto = fromCents(grossYieldCents);
      const rLiquido = fromCents(netYieldCents);
      const adjCents = toCents(manualAdjustment);

      const totalComRendimentoBruto = fromCents(principalCents + grossYieldCents + adjCents);
      const totalComRendimentoLiquido = fromCents(principalCents + netYieldCents + adjCents);

      let activeAcumulado = totalComRendimentoBruto;
      if (yieldMode === "liquido") {
        activeAcumulado = totalComRendimentoLiquido;
      } else if (yieldMode === "aportes") {
        activeAcumulado = capitalPuro;
      }

      monthlyPoints.push({
        month: ymKey,
        label: formatMonthShortLabelBR(ymKey),
        aportado: aportadoMes,
        resgatado: resgatadoMes,
        capitalAportadoPuro: capitalPuro,
        rendimentoBruto: rBruto,
        rendimentoLiquido: rLiquido,
        acumuladoComRendimento: totalComRendimentoBruto,
        acumulado: activeAcumulado
      });
    }

    // Avança para o próximo dia
    curDay++;
    if (curDay > totalDaysInCurMonth) {
      curDay = 1;
      curMonth++;
      if (curMonth > 12) {
        curMonth = 1;
        curYear++;
      }
    }
  }

  const finalCapital = fromCents(principalCents);
  const finalGross = fromCents(grossYieldCents);
  const finalNet = fromCents(netYieldCents);
  const adjCents = toCents(manualAdjustment);
  const finalTotalBruto = fromCents(principalCents + grossYieldCents + adjCents);
  const finalTotalLiquido = fromCents(principalCents + netYieldCents + adjCents);

  let activeSaldoFinal = finalTotalBruto;
  if (yieldMode === "liquido") {
    activeSaldoFinal = finalTotalLiquido;
  } else if (yieldMode === "aportes") {
    activeSaldoFinal = finalCapital;
  }

  return {
    data: monthlyPoints,
    currentCapitalAportado: finalCapital,
    grossYieldAccumulated: finalGross,
    netYieldEstimated: finalNet,
    saldoComRendimentoBruto: finalTotalBruto,
    saldoComRendimentoLiquido: finalTotalLiquido,
    totalAportes: totAportes,
    totalResgates: totResgates,
    hasDeficit: hasOverallDeficit,
    deficitAmount: maxDeficit,
    saldoFinal: activeSaldoFinal,
    cdiAnnualRateUsed: cdiAnnual,
    appliedCdiPercentage: defaultCdiPct,
    manualAdjustmentApplied: manualAdjustment
  };
}
