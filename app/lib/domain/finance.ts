/**
 * Motor Contábil e Financeiro Puro (Sprint 21)
 * Cálculos em centavos inteiros com arredondamento simétrico, sem erros de ponto flutuante IEEE 754.
 * Distribuição exata de resto em parcelas, competência vs. caixa e neutralidade contábil.
 */

import { addMonthsSafe, parseDateParts } from "./date-br";

export type FlowType = "INCOME" | "EXPENSE" | "INVESTMENT" | "NEUTRAL";

export interface InvoiceCompetenceResult {
  invoiceCompetence: string; // Ex: "2026-11"
  cashMonth: string;         // Ex: "2026-11" ou "2026-12" (quando vencimento cai no mês seguinte)
  labelBR: string;           // Ex: "11-2026"
  cashLabelBR: string;       // Ex: "12-2026"
}

export interface InstallmentSlice {
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  cents: number;
  isFirst: boolean;
}

/**
 * Normaliza e converte qualquer valor numérico ou string em formato brasileiro
 * ("1.234,56", "100.5", 1.005) em centavos inteiros (int).
 * Aplica precisão de 15 dígitos e arredondamento simétrico. Nunca produz -0.
 */
export function toCents(val: number | string | null | undefined): number {
  if (val === null || val === undefined) return 0;

  let num: number;
  if (typeof val === "string") {
    let clean = val.trim();
    if (!clean) return 0;
    // Se contém vírgula, trata como pt-BR (remove separadores de milhar e troca vírgula por ponto)
    if (clean.includes(",")) {
      clean = clean.replace(/\./g, "").replace(",", ".");
    }
    num = parseFloat(clean);
  } else {
    num = val;
  }

  if (isNaN(num) || !isFinite(num)) return 0;

  // Arredondamento simétrico de alta precisão
  const scaled = Math.abs(num) * 100;
  const rounded = Math.round(Number(scaled.toPrecision(15)));
  const res = Math.sign(num) * rounded;

  // Normalização estrita de -0
  return Object.is(res, -0) ? 0 : res;
}

/**
 * Converte centavos inteiros para float em reais (R$), normalizando -0 para 0.
 */
export function fromCents(cents: number | null | undefined): number {
  if (!cents || isNaN(cents)) return 0;
  const res = Math.round(Number(cents)) / 100;
  return Object.is(res, -0) ? 0 : res;
}

/**
 * Soma segura de múltiplos valores financeiros sem acúmulo de erro binário.
 */
export function safeAdd(...values: (number | string | null | undefined)[]): number {
  const sumCents = values.reduce<number>((acc, v) => acc + toCents(v), 0);
  return fromCents(sumCents);
}

/**
 * Subtração segura entre dois valores financeiros em centavos.
 */
export function safeSub(
  a: number | string | null | undefined,
  b: number | string | null | undefined
): number {
  return fromCents(toCents(a) - toCents(b));
}

/**
 * Formatador BRL estático reutilizável de alta performance (AUD-26)
 */
export const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Formata um número ou valor monetário em padrão pt-BR de Real (R$).
 */
export function formatBRL(val: number | string | null | undefined): string {
  const num = typeof val === "number" ? val : parseFloat(String(val || 0));
  const safeNum = isNaN(num) || !isFinite(num) ? 0 : num;
  return BRL_FORMATTER.format(safeNum);
}

/**
 * Calcula dias restantes no mês corrente com piso de 1 dia para evitar divisão por zero (AUD-02).
 * @param year Ano completo (ex: 2026)
 * @param month Mês (1-12)
 * @param currentDay Dia do mês (1-31)
 */
export function calculateRemainingDaysInMonth(year: number, month: number, currentDay: number): number {
  const totalDays = new Date(year, month, 0).getDate();
  return Math.max(1, totalDays - currentDay + 1);
}

/**
 * Calcula a cota diária livre com proteção contra divisão por zero e overflow.
 */
export function calculateDailyFreeQuota(remainingBudget: number, remainingDays: number): number {
  if (!Number.isFinite(remainingBudget) || remainingDays <= 0) return 0;
  const quota = remainingBudget / remainingDays;
  return Number.isFinite(quota) ? quota : 0;
}

/**
 * Avalia expressões matemáticas básicas suportando separador de milhar brasileiro (AUD-03).
 */
export function evaluateMathExpression(input: string): string {
  if (!input || !input.trim()) return "";
  let expr = input.trim();
  expr = expr.replace(/\s+/g, " ");
  // Remove pontos de milhar pt-BR seguidos de 3 dígitos
  expr = expr.replace(/\.(?=\d{3}(?:[.,+\-*/\s)]|$))/g, "").replace(/,/g, ".");

  if (/^[0-9]+(\.[0-9]+)?$/.test(expr)) {
    const n = parseFloat(expr);
    return isNaN(n) ? input : n.toFixed(2);
  }

  if (!/^[0-9+\-*/.()\s]+$/.test(expr)) {
    return input;
  }

  try {
    const fn = new Function(`"use strict"; return (${expr});`);
    const val = fn();
    if (typeof val === "number" && !isNaN(val) && isFinite(val) && val >= 0) {
      return val.toFixed(2);
    }
  } catch {
    // Retorna original se inválido
  }
  return input;
}

/**
 * Distribui um valor total exatamente em N parcelas sem perder nenhum centavo.
 * O resto da divisão de centavos é alocado prioritariamente na 1ª parcela.
 * Exemplo: R$ 100,00 em 3x -> 33,34 + 33,33 + 33,33 = 100,00 exatos.
 */
export function distributeInstallments(
  totalAmount: number | string,
  installmentsCount: number
): InstallmentSlice[] {
  const totalCents = toCents(totalAmount);
  const n = Math.max(1, Math.min(60, Math.floor(installmentsCount)));
  if (n <= 1) {
    return [
      {
        installmentNumber: 1,
        totalInstallments: 1,
        amount: fromCents(totalCents),
        cents: totalCents,
        isFirst: true
      }
    ];
  }

  const baseCents = Math.floor(totalCents / n);
  const remainderCents = totalCents - baseCents * n;

  const result: InstallmentSlice[] = [];
  for (let i = 1; i <= n; i++) {
    // Aloca o resto na primeira parcela
    const sliceCents = i === 1 ? baseCents + remainderCents : baseCents;
    result.push({
      installmentNumber: i,
      totalInstallments: n,
      amount: fromCents(sliceCents),
      cents: sliceCents,
      isFirst: i === 1
    });
  }
  return result;
}

/**
 * Gera um ID de série estável e único para um conjunto de parcelas.
 */
export function generateInstallmentSeriesId(
  description: string,
  dateStr: string,
  totalAmount: number | string
): string {
  const cleanDesc = description.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `series_${cleanDesc.slice(0, 10)}_${toCents(totalAmount)}_${time}_${random}`;
}

/**
 * Cálculo Contábil da Competência de Fatura vs. Mês de Desembolso de Caixa:
 * Se o dia da compra >= closingDay, a fatura pertence à competência do mês seguinte.
 * Se o dia de vencimento (dueDay) <= dia de fechamento (closingDay), o desembolso efetivo de caixa
 * ocorre no mês posterior ao mês de fechamento.
 */
export function calculateInvoiceAndCashMonths(
  purchaseDate: string,
  cardClosingDay?: number,
  cardDueDay?: number,
  includeClosingDayInCurrent = false
): InvoiceCompetenceResult {
  const parts = parseDateParts(purchaseDate);
  if (!parts) {
    const now = new Date();
    const ym = addMonthsSafe(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      invoiceCompetence: ym.key,
      cashMonth: ym.key,
      labelBR: ym.labelBR,
      cashLabelBR: ym.labelBR
    };
  }

  const { day, month, year } = parts;
  const isPostClosing = cardClosingDay && cardClosingDay > 0
    ? (includeClosingDayInCurrent ? day > cardClosingDay : day >= cardClosingDay)
    : false;

  // Competência da fatura
  const compYm = isPostClosing
    ? addMonthsSafe(year, month, 1)
    : addMonthsSafe(year, month, 0);

  // Mês de desembolso de caixa (cashMonth)
  // Se o dia de vencimento for numericamente menor ou igual ao dia de fechamento (ex: fecha dia 25, vence dia 05),
  // o desembolso ocorre no mês seguinte ao da fatura.
  const isDueNextMonth = Boolean(cardClosingDay && cardDueDay && cardDueDay <= cardClosingDay);
  const cashYm = isDueNextMonth
    ? addMonthsSafe(compYm.year, compYm.month, 1)
    : compYm;

  return {
    invoiceCompetence: compYm.key,
    cashMonth: cashYm.key,
    labelBR: compYm.labelBR,
    cashLabelBR: cashYm.labelBR
  };
}

/**
 * Função compatível com as chamadas legadas que esperam uma string "YYYY-MM".
 */
export function getCardInvoiceCompetence(
  purchaseDate: string,
  cardClosingDay?: number,
  cardDueDay?: number,
  includeClosingDayInCurrent = false
): string {
  return calculateInvoiceAndCashMonths(
    purchaseDate,
    cardClosingDay,
    cardDueDay,
    includeClosingDayInCurrent
  ).invoiceCompetence;
}

/**
 * Helper canônico para determinar se uma transação representa um fluxo positivo de entrada visual
 * (Recebimento de Empréstimo, Reembolso, Salário, Rendimentos, Receita Extra ou flowType === "INCOME").
 * Sprint 42: Garante o sinal "+ R$" e a cor Verde Esmeralda (#30D158 / text-emerald-400).
 */
export function isPositiveInflowDisplay(tx: {
  flowType?: string;
  category?: string;
  isReceivableSettlement?: boolean;
  description?: string;
}): boolean {
  if (tx.isReceivableSettlement) return true;
  const cat = (tx.category || "").toLowerCase();
  if (
    cat.includes("recebimento de empréstimo") ||
    cat.includes("recebimento de emprestimo") ||
    cat === "reembolso" ||
    cat === "salário" ||
    cat === "salario" ||
    cat === "rendimentos" ||
    cat === "receita extra"
  ) {
    return true;
  }
  return tx.flowType === "INCOME";
}

/**
 * Valida se um lançamento é neutro do ponto de vista do orçamento operacional
 * (Transferência entre contas ou pagamento de fatura bancária).
 * Nota: Liquidações de empréstimo/reembolso entram como crédito redutor de despesas operacionais.
 */
export function isNeutralFlow(tx: {
  flowType?: string;
  isTransfer?: boolean;
  isInvoicePayment?: boolean;
  isReceivableSettlement?: boolean;
  category?: string;
}): boolean {
  if (tx.isTransfer) return true;
  if (tx.isInvoicePayment) return true;
  if (tx.category === "Transferência entre Contas") return true;
  if (tx.flowType === "NEUTRAL" && !tx.isReceivableSettlement) return true;
  return false;
}

/**
 * Retorna o valor de despesa efetivamente pessoal do usuário (Sprint 40 e Sprint 42).
 * - Se for split child, transferência, pagamento de fatura ou fluxo neutro puro: retorna 0.
 * - Se for liquidação de empréstimo / reembolso (isReceivableSettlement: true): retorna o valor negativo
 *   (-amount em centavos normalizados), atuando como crédito que abate as saídas operacionais.
 * - Se for compra dividida (isSplit): entra pelo desembolso bruto total (amount integral), refletindo
 *   o que efetivamente saiu da conta/cartão até que ocorra o recebimento do devedor.
 * - Caso contrário: retorna amount integral em centavos normalizados.
 */
export function getEffectivePersonalAmount(tx: {
  amount?: number | string | null;
  personalAmount?: number | string | null;
  thirdPartyAmount?: number | string | null;
  isSplit?: boolean;
  isSplitChild?: boolean;
  isTransfer?: boolean;
  isInvoicePayment?: boolean;
  isReceivableSettlement?: boolean;
  flowType?: string;
  category?: string;
}): number {
  if (
    tx.isSplitChild ||
    tx.isTransfer ||
    tx.isInvoicePayment ||
    tx.category === "Transferência entre Contas"
  ) {
    return 0;
  }

  // Recebimento de empréstimo / liquidação abate a despesa pessoal como crédito
  if (
    tx.isReceivableSettlement ||
    (tx.category || "").toLowerCase().includes("recebimento de empréstimo") ||
    (tx.category || "").toLowerCase().includes("recebimento de emprestimo") ||
    (tx.category || "").toLowerCase() === "reembolso"
  ) {
    return -fromCents(Math.max(0, toCents(tx.amount)));
  }

  if (tx.flowType === "NEUTRAL") {
    return 0;
  }

  if (tx.isSplit) {
    // A compra dividida entra com o desembolso bruto total realizado pelo usuário
    return fromCents(Math.max(0, toCents(tx.amount)));
  }

  return fromCents(Math.max(0, toCents(tx.amount)));
}

/**
 * Retorna o valor de responsabilidade na Fatura / Limite do Cartão de Crédito (Sprint 40).
 * Uma despesa dividida (isSplit: true) no cartão do usuário cobra o valor INTEGRAL (tx.amount)
 * na fatura emitida pelo banco, excluindo apenas splits children para nunca duplicar.
 */
export function getEffectiveCardLiabilityAmount(tx: {
  amount?: number | string | null;
  isSplit?: boolean;
  isSplitChild?: boolean;
  isTransfer?: boolean;
  isInvoicePayment?: boolean;
  flowType?: string;
  category?: string;
}): number {
  if (
    tx.isSplitChild ||
    tx.isTransfer ||
    tx.isInvoicePayment ||
    tx.flowType === "NEUTRAL" ||
    tx.category === "Transferência entre Contas"
  ) {
    return 0;
  }

  return fromCents(Math.max(0, toCents(tx.amount)));
}
