/**
 * Motor Preditivo de Simulação de Compras "Posso Comprar?" (Sprint 37 — Ícaro Vasconcelos)
 * Cálculo de impacto na cota diária livre (R$/dia), custo de oportunidade no CDI e veredito comportamental.
 */

import { distributeInstallments, toCents, fromCents, formatBRL } from "./finance";

export interface PurchaseSimulationInput {
  itemPrice: number;
  installments: number; // 1 a 48
  freeMonthlyBalance: number; // Saldo livre estimado do mês (Rendas - Custos Fixos - Gastos Atuais)
  dailyQuota: number; // Cota Diária atual (R$/dia)
  remainingDays: number; // Dias restantes no mês corrente
  cdiAnnualRate?: number; // CDI Anualizado (ex: 0.1215 para 12.15% a.a. ou 12.15)
}

export type PurchaseVerdictType =
  | "APROVADO TRANQUILO"
  | "ATENÇÃO AO TETO MENSAL"
  | "RECOMENDADO ADIAR / PARCELAR SEM JUROS";

export interface PurchaseSimulationResult {
  itemPrice: number;
  installments: number;
  installmentAmount: number;
  installmentAmounts: number[];
  monthlyImpact: number;
  newDailyQuota: number;
  dailyQuotaReduction: number;
  cdi12mOpportunityCost: number; // Rendimento estimado a 115% do CDI em 12 meses
  cashOpportunityCost12m: number; // Rendimento líquido do valor à vista no CDI 12 meses
  installmentYieldAdvantage: number; // Rendimento gerado mantendo saldo na caixinha enquanto paga parcelas
  verdict: PurchaseVerdictType;
  verdictScore: number; // 0 a 100
  verdictBadgeColor: string; // Classes Tailwind
  verdictMessage: string;
  recommendation: string;
}

export function simulatePurchaseImpact(input: PurchaseSimulationInput): PurchaseSimulationResult {
  const itemPrice = Math.max(0, Number(input.itemPrice) || 0);
  const installments = Math.max(1, Math.min(48, Math.floor(Number(input.installments) || 1)));
  const freeMonthlyBalance = Number(input.freeMonthlyBalance) || 0;
  const dailyQuota = Math.max(0, Number(input.dailyQuota) || 0);
  const remainingDays = Math.max(1, Number(input.remainingDays) || 1);
  const rawCdi = Number(input.cdiAnnualRate) || 0;
  const cdiRate = rawCdi > 1 ? rawCdi / 100 : rawCdi > 0 ? rawCdi : 0.1215; // Suporta 12.15 e 0.1215 com fallback

  // Distribui parcelas exatas em centavos
  const slices = distributeInstallments(itemPrice, installments);
  const installmentAmounts = slices.map((s) => s.amount);
  const installmentAmount = installmentAmounts[0] || itemPrice;
  const monthlyImpact = installments === 1 ? itemPrice : installmentAmount;

  // Impacto na Cota Diária (R$/dia)
  const dailyQuotaReduction = fromCents(toCents(monthlyImpact / remainingDays));
  const newDailyQuota = fromCents(Math.max(0, toCents(dailyQuota) - toCents(dailyQuotaReduction)));

  // Custo de Oportunidade CDI em 12 meses (Caixinha Turbo a 115% do CDI)
  // Rendimento composto a 115% do CDI com desconto de IR da tabela regressiva (17.5% para 365 dias)
  const grossTurboRate = cdiRate * 1.15;
  const netTurboRate = grossTurboRate * (1 - 0.175);
  const cashOpportunityCost12m = fromCents(toCents(itemPrice * netTurboRate));
  const cdi12mOpportunityCost = cashOpportunityCost12m;

  // Rendimento ganho ao parcelar: capital inicial rende juros compostos enquanto as parcelas são debitadas
  const monthlyCompoundedRate = Math.pow(1 + grossTurboRate, 1 / 12) - 1;
  let runningBalance = itemPrice;
  let totalYieldInstallments = 0;
  for (let m = 0; m < installments; m++) {
    const monthYield = runningBalance * monthlyCompoundedRate;
    totalYieldInstallments += monthYield;
    const currentInstallment = installmentAmounts[m] || installmentAmount;
    runningBalance = Math.max(0, runningBalance + monthYield - currentInstallment);
  }
  const installmentYieldAdvantage = fromCents(
    Math.max(0, toCents(totalYieldInstallments * (1 - 0.175)))
  );

  // Veredito Comportamental Inteligente
  let verdict: PurchaseVerdictType;
  let verdictScore: number;
  let verdictBadgeColor: string;
  let verdictMessage: string;
  let recommendation: string;

  // Critérios:
  // 1. Aprovado Tranquilo: O impacto mensal consome menos de 35% do saldo livre e a nova cota diária permanece confortável (>= R$ 35/dia)
  // 2. Atenção ao Teto: O impacto cabe no saldo livre restante, mas consome entre 35% e 90%, ou reduz a cota diária para entre R$ 12 e R$ 35/dia
  // 3. Recomendado Adiar: O impacto supera o saldo livre ou reduz a cota diária para menos de R$ 12/dia
  const balanceConsumptionPct = freeMonthlyBalance > 0 ? (monthlyImpact / freeMonthlyBalance) * 100 : 100;

  if (balanceConsumptionPct <= 35 && (newDailyQuota >= 35 || dailyQuota === 0)) {
    verdict = "APROVADO TRANQUILO";
    verdictScore = Math.min(100, Math.round(95 - balanceConsumptionPct * 0.3));
    verdictBadgeColor = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    verdictMessage = `Sua margem de segurança financeira absorve esta compra sem estresse. Ela compromete apenas ${balanceConsumptionPct.toFixed(0)}% do seu saldo livre deste mês.`;
    recommendation =
      installments === 1
        ? `Se pagar à vista gerar desconto maior que ${formatBRL(cashOpportunityCost12m)}, pague à vista. Caso contrário, invista os ${formatBRL(itemPrice)} na Caixinha Turbo!`
        : `Parcelamento de ${installments}x de ${formatBRL(installmentAmount)} mantém sua cota diária saudável em ${formatBRL(newDailyQuota)}/dia. Rendimento estimado na caixinha durante o parcelamento: ${formatBRL(installmentYieldAdvantage)}.`;
  } else if (balanceConsumptionPct <= 90 && newDailyQuota >= 12) {
    verdict = "ATENÇÃO AO TETO MENSAL";
    verdictScore = Math.max(50, Math.round(80 - balanceConsumptionPct * 0.35));
    verdictBadgeColor = "bg-amber-500/15 text-amber-300 border-amber-500/30";
    verdictMessage = `A compra cabe no orçamento, porém consome ${balanceConsumptionPct.toFixed(0)}% do seu saldo livre e reduz sua cota diária de gastos para ${formatBRL(newDailyQuota)}/dia pelos próximos ${remainingDays} dias.`;
    recommendation =
      installments < 3 && itemPrice > 300
        ? `Considere simular em ${Math.min(6, installments + 2)}x sem juros para suavizar o impacto mensal para ${formatBRL(distributeInstallments(itemPrice, Math.min(6, installments + 2))[0]?.amount || 0)}/mês.`
        : `Monitore gastos variáveis com atenção para manter a cota diária de ${formatBRL(newDailyQuota)}/dia até o fim do mês.`;
  } else {
    verdict = "RECOMENDADO ADIAR / PARCELAR SEM JUROS";
    verdictScore = Math.max(15, Math.round(40 - Math.min(30, balanceConsumptionPct * 0.1)));
    verdictBadgeColor = "bg-rose-500/15 text-rose-300 border-rose-500/30";
    verdictMessage = `Esta compra neste formato pressiona criticamente o caixa (consumo de ${balanceConsumptionPct.toFixed(0)}% do saldo) ou derruba a cota diária para ${formatBRL(newDailyQuota)}/dia.`;
    recommendation =
      installments === 1 && itemPrice > 200
        ? `Se a compra for indispensável, opte por parcelar sem juros em 6x a 10x ou espere a virada da próxima fatura para não sufocar o mês atual.`
        : `Adie esta compra em 30 a 60 dias para acumular a meta na sua Lista de Desejos sem comprometer o fluxo de caixa.`;
  }

  return {
    itemPrice,
    installments,
    installmentAmount,
    installmentAmounts,
    monthlyImpact,
    newDailyQuota,
    dailyQuotaReduction,
    cdi12mOpportunityCost,
    cashOpportunityCost12m,
    installmentYieldAdvantage,
    verdict,
    verdictScore,
    verdictBadgeColor,
    verdictMessage,
    recommendation
  };
}
