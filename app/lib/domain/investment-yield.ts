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

export function isResgateCategory(category: string): boolean {
  if (!category) return false;
  const lower = category.toLowerCase().trim();
  // Se for explicitamente aporte ou investimento ou caixinha pura, nunca é resgate
  if (lower.startsWith("aporte") || lower.startsWith("investimento") || lower === "caixinha") {
    return false;
  }
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

  // Buckets de capitalização por percentual de CDI com precisão flutuante (AUD-01)
  interface YieldBucket {
    cdiPercentage: number;
    principal: number; // float em reais
    yieldGross: number; // float em reais
    yieldNet: number; // float em reais
  }

  const buckets = new Map<number, YieldBucket>();
  if (initialReserveBalance > 0) {
    buckets.set(defaultCdiPct, {
      cdiPercentage: defaultCdiPct,
      principal: initialReserveBalance,
      yieldGross: 0,
      yieldNet: 0
    });
  }

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

  // Itera dia a dia cronologicamente calculando os rendimentos compostos com 8+ casas de precisão (AUD-01)
  while (
    curYear < endParts.year ||
    (curYear === endParts.year && curMonth < endParts.month) ||
    (curYear === endParts.year && curMonth === endParts.month && curDay <= endParts.day)
  ) {
    const ymKey = `${curYear}-${String(curMonth).padStart(2, "0")}`;
    const dateKey = `${ymKey}-${String(curDay).padStart(2, "0")}`;

    // Processa transações do dia por bucket
    const dailyTxs = txByDate.get(dateKey);
    if (dailyTxs && dailyTxs.length > 0) {
      for (const tx of dailyTxs) {
        const amt = typeof tx.amount === "number" ? Math.abs(tx.amount) : Math.abs(parseFloat(String(tx.amount || 0)));
        if (isNaN(amt) || amt <= 0) continue;
        const pct = tx.cdiPercentage ?? extractCdiPercentage(tx.description || tx.category, defaultCdiPct);

        if (isResgateCategory(tx.category)) {
          let remainingToResgate = amt;
          const sortedBuckets = Array.from(buckets.values()).sort((a, b) => (a.cdiPercentage === pct ? -1 : 1));
          for (const b of sortedBuckets) {
            if (remainingToResgate <= 0) break;
            const bTotal = b.principal + b.yieldGross;
            if (bTotal <= 0) continue;
            const deduct = Math.min(bTotal, remainingToResgate);
            if (b.principal >= deduct) {
              b.principal -= deduct;
            } else {
              const fromYield = deduct - b.principal;
              b.principal = 0;
              b.yieldGross = Math.max(0, b.yieldGross - fromYield);
              b.yieldNet = Math.max(0, b.yieldNet - fromYield * 0.85);
            }
            remainingToResgate -= deduct;
          }
        } else {
          let b = buckets.get(pct);
          if (!b) {
            b = { cdiPercentage: pct, principal: 0, yieldGross: 0, yieldNet: 0 };
            buckets.set(pct, b);
          }
          b.principal += amt;
        }
      }
    }

    // Capitalização diária em dias úteis com taxa de cada bucket
    daysElapsed++;
    if (isBusinessDay(curYear, curMonth, curDay)) {
      const irRate = getRegressiveIRRate(daysElapsed);
      for (const b of buckets.values()) {
        const balance = b.principal + b.yieldGross;
        if (balance > 0) {
          const dailyFactor = calculateDailyCdiFactor(cdiAnnual, b.cdiPercentage);
          const dayGross = balance * dailyFactor;
          b.yieldGross += dayGross;
          b.yieldNet += dayGross * (1 - irRate);
        }
      }
    }

    // Consolida totais para o ponto mensal
    let totalPrincipalFloat = 0;
    let totalGrossYieldFloat = 0;
    let totalNetYieldFloat = 0;
    for (const b of buckets.values()) {
      totalPrincipalFloat += b.principal;
      totalGrossYieldFloat += b.yieldGross;
      totalNetYieldFloat += b.yieldNet;
    }

    // Verifica se é o último dia do mês ou o último dia da simulação para salvar o ponto mensal
    const totalDaysInCurMonth = daysInMonth(curYear, curMonth);
    const isLastDayOfMonth = curDay === totalDaysInCurMonth;
    const isLastDayOfSim =
      curYear === endParts.year && curMonth === endParts.month && curDay === endParts.day;

    if (isLastDayOfMonth || isLastDayOfSim) {
      const aportadoMes = fromCents(monthAportesCents.get(ymKey) || 0);
      const resgatadoMes = fromCents(monthResgatesCents.get(ymKey) || 0);
      const capitalPuro = Math.round(totalPrincipalFloat * 100) / 100;
      const rBruto = Math.round(totalGrossYieldFloat * 100) / 100;
      const rLiquido = Math.round(totalNetYieldFloat * 100) / 100;
      const adjReais = typeof manualAdjustment === "number" ? manualAdjustment : 0;

      const totalComRendimentoBruto = Math.round((totalPrincipalFloat + totalGrossYieldFloat + adjReais) * 100) / 100;
      const totalComRendimentoLiquido = Math.round((totalPrincipalFloat + totalNetYieldFloat + adjReais) * 100) / 100;

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

  let finalPrincipalFloat = 0;
  let finalGrossYieldFloat = 0;
  let finalNetYieldFloat = 0;
  for (const b of buckets.values()) {
    finalPrincipalFloat += b.principal;
    finalGrossYieldFloat += b.yieldGross;
    finalNetYieldFloat += b.yieldNet;
  }

  const finalCapital = Math.round(finalPrincipalFloat * 100) / 100;
  const finalGross = Math.round(finalGrossYieldFloat * 100) / 100;
  const finalNet = Math.round(finalNetYieldFloat * 100) / 100;
  const adjReais = typeof manualAdjustment === "number" ? manualAdjustment : 0;
  const finalTotalBruto = Math.round((finalPrincipalFloat + finalGrossYieldFloat + adjReais) * 100) / 100;
  const finalTotalLiquido = Math.round((finalPrincipalFloat + finalNetYieldFloat + adjReais) * 100) / 100;

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
