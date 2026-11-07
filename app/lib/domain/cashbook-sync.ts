/**
 * Motor Contábil e de Sincronização Bidirecional do Livro Caixa (Sprint 50)
 * 
 * Regra Arquitetural Central:
 * A lista `transactions` (Livro Caixa) é a Fonte Única da Verdade (Single Source of Truth - SSOT).
 * Todos os módulos satélites (Valores a Receber, Meus Veículos, Investimentos, Bancos/Cartões)
 * mantêm sincronização bidirecional matemática estrita ao centavo, sem jamais divergir.
 */

import { Transaction, TxStatus, FlowType } from "@/app/lifeos-data";
import { safeAdd, safeSub, toCents, fromCents } from "./finance";
import { todayBR } from "./date-br";

export interface CashbookSyncResult {
  transactions: Transaction[];
  purgedIds: string[];
  updatedTxs: Transaction[];
  updatedCount: number;
}

/**
 * Normaliza strings para comparação insensível a acentos e maiúsculas.
 */
function normalizeStr(s?: string | null): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Valores conhecidos dos 8 lançamentos fantasmas do devedor Dio (data 30-10-2026).
 */
const KNOWN_DIO_PHANTOM_AMOUNTS = new Set([
  20.0, 62.88, 22.8, 30.8, 102.7, 20.64, 0.05
]);

/**
 * Reconciliação Bidirecional Estrita entre Valores a Receber e o Livro Caixa (Sprint 50).
 * 
 * 1. Purga recebimentos fantasmas/órfãos que não possuem dívida correspondente ou cuja dívida
 *    ativa está pendente com paidAmount === 0.
 * 2. Sincroniza dívida de Dio (Saldo restante de 2025 à receber) corrigindo lançamento de R$ 622,75
 *    para o abatimento real de R$ 500,00 com descrição descritiva.
 * 3. Garante que parent.paidAmount === sum(settlements.amount) com exatidão ao centavo.
 */
export function reconcileReceivablesAndCashbook(
  transactions: Transaction[],
  tombstones?: Set<string>
): CashbookSyncResult {
  const purgedIds: string[] = [];
  const updatedTxs: Transaction[] = [];
  let updatedCount = 0;

  // 1. Separar dívidas matriz (parents) e lançamentos de recebimento (settlements)
  const parents: Transaction[] = [];
  const settlements: Transaction[] = [];
  const otherTxs: Transaction[] = [];

  for (const t of transactions) {
    if (tombstones && tombstones.has(t.id)) {
      purgedIds.push(t.id);
      continue;
    }

    const isSettlement =
      t.isReceivableSettlement === true ||
      t.category === "Recebimento de Empréstimo" ||
      normalizeStr(t.category) === "recebimento de emprestimo";

    if (isSettlement) {
      settlements.push(t);
      continue;
    }

    const isParent =
      t.category === "A Receber" ||
      t.flowType === "RECEIVABLE" ||
      Boolean(t.isSplitChild && t.linkedSplitParentId);

    if (isParent) {
      parents.push(t);
    } else {
      otherTxs.push(t);
    }
  }

  // Mapeamentos de parents
  const parentById = new Map<string, Transaction>();
  parents.forEach((p) => parentById.set(p.id, p));

  // 2. Análise dos Lançamentos de Recebimento (Expurgo de Fantasmas e Correções)
  const validSettlements: Transaction[] = [];

  for (const st of settlements) {
    const descNorm = normalizeStr(st.description);
    const debtorNorm = normalizeStr(st.debtor);

    // REGRA 1 — Expurgo Específico dos 8 Fantasmas do Dio
    const isDioSettlement =
      debtorNorm.includes("dio") ||
      descNorm.includes("recebimento: dio") ||
      descNorm.includes("recebimento parcial: dio") ||
      descNorm.includes("emprestimo ao dio");

    if (isDioSettlement) {
      const isKnownPhantomAmount = KNOWN_DIO_PHANTOM_AMOUNTS.has(st.amount);
      const isDate30Oct2026 = st.date === "30-10-2026" || st.date === "30/10/2026";
      const isPhantomEmprestimoAoDio = descNorm.includes("emprestimo ao dio");

      // Se é um dos 8 lançamentos fantasmas de "Recebimento: Dio (Emprestimo ao Dio)"
      if (isPhantomEmprestimoAoDio && (isKnownPhantomAmount || isDate30Oct2026)) {
        purgedIds.push(st.id);
        continue;
      }
    }

    // REGRA GERAL 1 — Localização do Parent Debt
    let parent = st.linkedReceivableId ? parentById.get(st.linkedReceivableId) : undefined;

    // Se não encontrou por ID, tentar casar por devedor e descrição
    if (!parent) {
      parent = parents.find((p) => {
        const pDescNorm = normalizeStr(p.description);
        const pDebtorNorm = normalizeStr(p.debtor);

        const matchDebtor =
          (debtorNorm && pDebtorNorm && (pDebtorNorm.includes(debtorNorm) || debtorNorm.includes(pDebtorNorm))) ||
          (pDebtorNorm && descNorm.includes(pDebtorNorm));

        const matchDesc =
          pDescNorm &&
          (descNorm.includes(pDescNorm) || pDescNorm.split(" ").some((w) => w.length > 3 && descNorm.includes(w)));

        return matchDebtor && matchDesc;
      });
    }

    // Se não encontrou parent de jeito nenhum
    if (!parent) {
      // Recebimento órfão sem dívida mãe -> expurga para não inflar caixa
      purgedIds.push(st.id);
      continue;
    }

    // Se encontrou parent, mas a dívida mãe está pendente com paidAmount zerado
    const parentPaidCents = toCents(parent.paidAmount || 0);
    if (parentPaidCents === 0 && parent.status === "Pendente") {
      purgedIds.push(st.id);
      continue;
    }

    // REGRA 2 — Sincronização Exata de Valor Pago (ex: Dio Saldo restante de 2025 à receber R$ 500,00 de R$ 622,75)
    let finalAmount = st.amount;
    let finalDescription = st.description;
    let mutated = false;

    const isDioSaldo2025 =
      (debtorNorm.includes("dio") || normalizeStr(parent.debtor).includes("dio")) &&
      (descNorm.includes("saldo restante de 2025") || normalizeStr(parent.description).includes("saldo restante de 2025"));

    if (isDioSaldo2025) {
      // Se a dívida original é R$ 622,75 e foi abatido R$ 500,00, o lançamento do caixa deve ser exatamente R$ 500,00
      if (parent.amount === 622.75 && (st.amount === 622.75 || parent.paidAmount === 500.0)) {
        finalAmount = 500.0;
        finalDescription = "Recebimento Parcial: Dio (Saldo restante de 2025 à receber)";
        mutated = true;
      }
    }

    const correctedSettlement: Transaction = {
      ...st,
      amount: finalAmount,
      description: finalDescription,
      flowType: "INCOME",
      category: "Recebimento de Empréstimo",
      isReceivableSettlement: true,
      linkedReceivableId: parent.id,
      debtor: parent.debtor || st.debtor,
      status: "Pago"
    };

    if (
      mutated ||
      st.amount !== finalAmount ||
      st.description !== finalDescription ||
      st.flowType !== "INCOME" ||
      st.linkedReceivableId !== parent.id
    ) {
      updatedTxs.push(correctedSettlement);
      updatedCount++;
    }

    validSettlements.push(correctedSettlement);
  }

  // 3. Reconciliação dos Parents (Garantia de Simetria Matemática nos Centavos)
  const finalParents: Transaction[] = [];

  for (const p of parents) {
    // Buscar todos os recebimentos vivos vinculados a este parent
    const linked = validSettlements.filter((s) => s.linkedReceivableId === p.id);
    const settlementsSumCents = linked.reduce((acc, s) => acc + toCents(s.amount), 0);
    const settlementsSum = fromCents(settlementsSumCents);

    let updatedParent = { ...p };
    let parentMutated = false;

    // Se existem recebimentos vivos, o paidAmount do parent DEVE ser a soma exata deles
    if (linked.length > 0) {
      if (toCents(p.paidAmount || 0) !== settlementsSumCents) {
        updatedParent.paidAmount = settlementsSum;
        parentMutated = true;
      }
    } else {
      // Nenhum recebimento vivo vinculado
      // Se parent estava com paidAmount > 0, sintetizamos o recebimento no caixa para garantir a verdade contábil
      if (toCents(p.paidAmount || 0) > 0) {
        const syntheticAmount = p.paidAmount || 0;
        const synthId = `tx-recv-sync-${p.id}`;
        const isPartial = syntheticAmount < p.amount;
        const synthTx: Transaction = {
          id: synthId,
          date: p.date || todayBR(),
          description: isPartial
            ? `Recebimento Parcial: ${p.debtor || "Devedor"} (${p.description})`
            : `Recebimento: ${p.debtor || "Devedor"} (${p.description})`,
          amount: syntheticAmount,
          category: "Recebimento de Empréstimo",
          flowType: "INCOME",
          isReceivableSettlement: true,
          linkedReceivableId: p.id,
          debtor: p.debtor,
          costType: "Variável",
          paymentMethod: "PIX",
          bankAccount: "Nubank",
          status: "Pago",
          updatedAt: new Date().toISOString()
        };
        validSettlements.push(synthTx);
        updatedTxs.push(synthTx);
        updatedCount++;
      }
    }

    // Status do parent: Se o valor pago cobriu ou superou o total da dívida, status é Pago
    const totalCents = toCents(updatedParent.amount);
    const finalPaidCents = toCents(updatedParent.paidAmount || 0);

    const expectedStatus: TxStatus = finalPaidCents >= totalCents ? "Pago" : "Pendente";
    if (updatedParent.status !== expectedStatus) {
      updatedParent.status = expectedStatus;
      parentMutated = true;
    }

    if (parentMutated) {
      updatedParent.updatedAt = new Date().toISOString();
      updatedTxs.push(updatedParent);
      updatedCount++;
    }

    finalParents.push(updatedParent);
  }

  // Montar lista final consolidada
  const finalTransactions = [...validSettlements, ...finalParents, ...otherTxs];

  return {
    transactions: finalTransactions,
    purgedIds,
    updatedTxs,
    updatedCount
  };
}

/**
 * Cria ou atualiza abatimento de dívida na aba Valores a Receber,
 * gerando lançamento correspondente no Livro Caixa com 100% de simetria contábil.
 */
export function applyReceivableAbatement(
  transactions: Transaction[],
  targetDebt: Transaction,
  abatementAmount: number,
  destinationBank: string = "Nubank"
): {
  updatedTransactions: Transaction[];
  newSettlement: Transaction;
  updatedDebt: Transaction;
} {
  const cleanAmount = fromCents(toCents(abatementAmount));
  const currentPaid = targetDebt.paidAmount || 0;
  const newPaid = Math.min(targetDebt.amount, safeAdd(currentPaid, cleanAmount));
  const remaining = Math.max(0, safeSub(targetDebt.amount, newPaid));
  const nextStatus: TxStatus = remaining === 0 ? "Pago" : "Pendente";
  const nowIso = new Date().toISOString();
  const debtorName = targetDebt.debtor || "Devedor";

  const updatedDebt: Transaction = {
    ...targetDebt,
    paidAmount: newPaid,
    status: nextStatus,
    updatedAt: nowIso
  };

  const isPartial = remaining > 0;
  const newSettlement: Transaction = {
    id: `tx-recv-${Date.now()}`,
    date: todayBR(),
    description: isPartial
      ? `Recebimento Parcial: ${debtorName} (${targetDebt.description})`
      : `Recebimento: ${debtorName} (${targetDebt.description})`,
    amount: cleanAmount,
    category: "Recebimento de Empréstimo",
    flowType: "INCOME",
    isReceivableSettlement: true,
    linkedReceivableId: targetDebt.id,
    debtor: debtorName,
    costType: "Variável",
    paymentMethod: "PIX",
    bankAccount: destinationBank,
    status: "Pago",
    updatedAt: nowIso
  };

  const updatedTransactions = [
    newSettlement,
    ...transactions.map((t) => (t.id === targetDebt.id ? updatedDebt : t))
  ];

  return {
    updatedTransactions,
    newSettlement,
    updatedDebt
  };
}

/**
 * Sincroniza a exclusão de um lançamento de recebimento a partir do Livro Caixa,
 * subtraindo imediatamente o valor pago da dívida mãe e revertendo o status para Pendente.
 */
export function handleSettlementRemoval(
  transactions: Transaction[],
  settlementId: string
): {
  updatedTransactions: Transaction[];
  parentToUpdate?: Transaction;
} {
  const settlement = transactions.find((t) => t.id === settlementId);
  if (!settlement) {
    return { updatedTransactions: transactions };
  }

  const parentId = settlement.linkedReceivableId;
  let parentToUpdate: Transaction | undefined;

  const remainingTxs = transactions.filter((t) => t.id !== settlementId);

  if (parentId) {
    const parent = remainingTxs.find((t) => t.id === parentId);
    if (parent) {
      // Recomputar paidAmount do parent pela soma dos recebimentos restantes
      const otherSettlements = remainingTxs.filter((t) => t.linkedReceivableId === parentId);
      const remainingPaid = otherSettlements.reduce((sum, s) => safeAdd(sum, s.amount), 0);
      const remainingDebt = safeSub(parent.amount, remainingPaid);

      parentToUpdate = {
        ...parent,
        paidAmount: Math.max(0, remainingPaid),
        status: remainingDebt <= 0 ? "Pago" : "Pendente",
        updatedAt: new Date().toISOString()
      };
    }
  }

  const updatedTransactions = parentToUpdate
    ? remainingTxs.map((t) => (t.id === parentToUpdate!.id ? parentToUpdate! : t))
    : remainingTxs;

  return {
    updatedTransactions,
    parentToUpdate
  };
}

/**
 * Sincroniza a edição do valor de um recebimento no Livro Caixa,
 * atualizando instantaneamente o paidAmount da dívida correspondente.
 */
export function handleSettlementAmountChange(
  transactions: Transaction[],
  settlementId: string,
  newAmount: number
): {
  updatedTransactions: Transaction[];
  parentToUpdate?: Transaction;
  updatedSettlement?: Transaction;
} {
  const cleanAmount = fromCents(toCents(newAmount));
  let updatedSettlement: Transaction | undefined;
  let parentToUpdate: Transaction | undefined;

  const updated = transactions.map((t) => {
    if (t.id === settlementId) {
      updatedSettlement = {
        ...t,
        amount: cleanAmount,
        updatedAt: new Date().toISOString()
      };
      return updatedSettlement;
    }
    return t;
  });

  const parentId = updatedSettlement?.linkedReceivableId;
  if (parentId) {
    const parent = updated.find((t) => t.id === parentId);
    if (parent) {
      const linked = updated.filter(
        (t) => (t.isReceivableSettlement || t.category === "Recebimento de Empréstimo") && t.linkedReceivableId === parentId
      );
      const newPaid = linked.reduce((sum, s) => safeAdd(sum, s.amount), 0);
      const remainingDebt = safeSub(parent.amount, newPaid);

      parentToUpdate = {
        ...parent,
        paidAmount: Math.max(0, newPaid),
        status: remainingDebt <= 0 ? "Pago" : "Pendente",
        updatedAt: new Date().toISOString()
      };
    }
  }

  const finalTransactions = parentToUpdate
    ? updated.map((t) => (t.id === parentToUpdate!.id ? parentToUpdate! : t))
    : updated;

  return {
    updatedTransactions: finalTransactions,
    parentToUpdate,
    updatedSettlement
  };
}
