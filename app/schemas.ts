import { z } from "zod";
import type { CostType, TxStatus } from "./lifeos-data";

/**
 * Schemas de Validação Estrita (Sprint 10 - Lucas Viana)
 * Fonte Única da Verdade e integridade dos dados antes da persistência local e remota (Supabase).
 */

export const TransactionSchema = z
  .object({
    id: z.string().optional(),
    description: z
      .string({ error: "A descrição é obrigatória." })
      .trim()
      .min(1, "A descrição do lançamento não pode estar vazia."),
    amount: z
      .number({ error: "O valor deve ser numérico." })
      .positive("O valor deve ser estritamente maior que zero.")
      .finite("O valor numérico não pode ser infinito ou NaN."),
    date: z
      .string({ error: "A data é obrigatória." })
      .trim()
      .min(1, "A data do lançamento não pode estar vazia.")
      .regex(/^(\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4}|\d{2}\/\d{2}\/\d{4})/, "A data deve estar no formato DD-MM-AAAA ou AAAA-MM-DD."),
    category: z
      .string({ error: "A categoria é obrigatória." })
      .trim()
      .min(1, "Selecione uma categoria válida para o lançamento."),
    paymentMethod: z
      .string({ error: "A forma de pagamento é obrigatória." })
      .trim()
      .min(1, "Selecione a forma de pagamento."),
    costType: z.enum(["Fixo", "Variável"] as const, {
      error: "O tipo de custo deve ser 'Fixo' ou 'Variável'."
    }).default("Variável"),
    status: z.enum(["Pago", "Pendente / Na Fatura"] as const, {
      error: "A situação deve ser 'Pago' ou 'Pendente / Na Fatura'."
    }).default("Pago"),
    cardUsed: z.string().trim().optional(),
    bankAccount: z.string().trim().optional(),
    installmentInfo: z.string().optional(),
    installmentGroupId: z.string().optional(),
    invoiceMonth: z.string().optional(),
    debtor: z.string().trim().optional(),
    paidAmount: z.number().min(0, "O valor abatido não pode ser negativo.").optional(),
    km: z.number().min(0, "A quilometragem não pode ser negativa.").optional(),
    liters: z.number().min(0, "A litragem não pode ser negativa.").optional(),
    iconUrl: z.string().optional(),
    wishlistId: z.string().optional(),
    updatedAt: z.string().optional(),
    isTransfer: z.boolean().optional(),
    sourceBank: z.string().trim().optional(),
    destinationBank: z.string().trim().optional(),
    isSplit: z.boolean().optional(),
    thirdPartyAmount: z.number().positive("O valor da outra pessoa deve ser maior que zero.").optional(),
    thirdPartyName: z.string().trim().optional(),
    personalAmount: z.number().min(0, "A sua parte não pode ser negativa.").optional(),
    linkedReceivableId: z.string().optional(),
    isSplitChild: z.boolean().optional(),
    linkedSplitParentId: z.string().optional(),
    flowType: z.enum(["INCOME", "EXPENSE", "INVESTMENT", "NEUTRAL"] as const).optional(),
    installmentSeriesId: z.string().optional(),
    cashMonth: z.string().optional(),
    isInvoicePayment: z.boolean().optional(),
    isReceivableSettlement: z.boolean().optional(),
    deletedAt: z.string().optional(),
    rev: z.number().optional()
  })
  .refine(
    (data) => {
      if (data.isSplit) {
        if (!data.thirdPartyAmount || data.thirdPartyAmount <= 0 || data.thirdPartyAmount >= data.amount) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Ao dividir gasto, o valor da outra pessoa deve ser maior que zero e menor que o valor total.",
      path: ["thirdPartyAmount"]
    }
  )
  .refine(
    (data) => {
      if (data.isSplit) {
        if (!data.thirdPartyName || !data.thirdPartyName.trim()) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Ao dividir gasto, informe o nome da pessoa que irá reembolsar.",
      path: ["thirdPartyName"]
    }
  )
  .refine(
    (data) => {
      // Se for Cartão de Crédito, é altamente recomendado ter o cartão indicado se houver
      if (data.paymentMethod === "Cartão de Crédito" && !data.cardUsed) {
        return false;
      }
      return true;
    },
    {
      message: "Para compras no 'Cartão de Crédito', selecione qual cartão foi utilizado.",
      path: ["cardUsed"]
    }
  )
  .refine(
    (data) => {
      if (data.isTransfer) {
        if (data.sourceBank && data.destinationBank && data.sourceBank === data.destinationBank) {
          return false;
        }
      }
      return true;
    },
    {
      message: "O banco de origem e o banco de destino não podem ser o mesmo.",
      path: ["destinationBank"]
    }
  );

export type ValidatedTransaction = z.infer<typeof TransactionSchema>;

export const CreditCardSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({ error: "O nome do cartão é obrigatório." })
    .trim()
    .min(1, "O nome do cartão não pode estar vazio."),
  brand: z.string().trim().default("Mastercard Black"),
  limit: z
    .number({ error: "O limite deve ser um número válido." })
    .min(0, "O limite do cartão deve ser maior ou igual a zero.")
    .finite("O limite não pode ser infinito ou NaN."),
  closingDay: z
    .number({ error: "O dia de fechamento deve ser numérico." })
    .int("O dia de fechamento deve ser um número inteiro.")
    .min(1, "O dia de fechamento deve ser entre 1 e 31.")
    .max(31, "O dia de fechamento deve ser entre 1 e 31."),
  dueDay: z
    .number({ error: "O dia de vencimento deve ser numérico." })
    .int("O dia de vencimento deve ser um número inteiro.")
    .min(1, "O dia de vencimento deve ser entre 1 e 31.")
    .max(31, "O dia de vencimento deve ser entre 1 e 31."),
  bankId: z.string().optional(),
  bankName: z.string().optional(),
  logoUrl: z.string().optional(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().optional(),
  rev: z.number().optional()
});

export type ValidatedCreditCard = z.infer<typeof CreditCardSchema>;

export const BankInstitutionSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({ error: "O nome da instituição bancária é obrigatório." })
    .trim()
    .min(1, "O nome da instituição não pode estar vazio."),
  limit: z
    .number({ error: "O limite bancário deve ser numérico." })
    .min(0, "O limite bancário deve ser maior ou igual a zero.")
    .finite("O limite não pode ser infinito ou NaN.")
    .optional(),
  limitType: z.string().optional(),
  accountType: z
    .enum(["Conta Corrente", "Conta Digital", "Investimentos", "Benefícios"] as const)
    .optional(),
  color: z.string().optional(),
  logoUrl: z.string().optional(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().optional(),
  rev: z.number().optional()
});

export type ValidatedBank = z.infer<typeof BankInstitutionSchema>;

export const StaticStatusSchema = z.object({
  id: z.string().optional(),
  title: z
    .string({ error: "O título é obrigatório." })
    .trim()
    .min(1, "O título do item fixo não pode estar vazio."),
  type: z.enum(["Renda Base", "Benefício", "Custo Fixo", "Meta Aporte"] as const, {
    error: "O tipo deve ser Renda Base, Benefício, Custo Fixo ou Meta Aporte."
  }),
  amount: z
    .number({ error: "O valor deve ser numérico." })
    .positive("O valor deve ser estritamente maior que zero.")
    .finite("O valor não pode ser infinito ou NaN."),
  notes: z.string().optional().default(""),
  updatedAt: z.string().optional(),
  deletedAt: z.string().optional(),
  rev: z.number().optional()
});

export type ValidatedStaticStatus = z.infer<typeof StaticStatusSchema>;

/**
 * Funções Guard de Validação Prontas com Feedback Amigável
 */

export function validateTransactionData(
  input: unknown
): { success: true; data: ValidatedTransaction } | { success: false; error: string } {
  const result = TransactionSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstIssue = result.error.issues[0];
  return {
    success: false,
    error: firstIssue ? firstIssue.message : "Dados da transação inválidos."
  };
}

export function validateCreditCardData(
  input: unknown
): { success: true; data: ValidatedCreditCard } | { success: false; error: string } {
  const result = CreditCardSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstIssue = result.error.issues[0];
  return {
    success: false,
    error: firstIssue ? firstIssue.message : "Dados do cartão inválidos."
  };
}

export function validateBankData(
  input: unknown
): { success: true; data: ValidatedBank } | { success: false; error: string } {
  const result = BankInstitutionSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstIssue = result.error.issues[0];
  return {
    success: false,
    error: firstIssue ? firstIssue.message : "Dados do banco inválidos."
  };
}

export function validateStaticStatusData(
  input: unknown
): { success: true; data: ValidatedStaticStatus } | { success: false; error: string } {
  const result = StaticStatusSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstIssue = result.error.issues[0];
  return {
    success: false,
    error: firstIssue ? firstIssue.message : "Dados do item fixo inválidos."
  };
}

/**
 * Schema de Backup Completo e Motor de Quarentena (Sprint 22)
 * Valida a integridade do JSON de backup e isola registros corrompidos em quarentena sem travar a importação.
 */

export const FullBackupSchema = z.object({
  schemaVersion: z.number().optional().default(2),
  version: z.string().optional(),
  exportDateBR: z.string().optional(),
  exportDate: z.string().optional(),
  user: z
    .object({
      nickname: z.string().optional(),
      avatar: z.string().optional()
    })
    .optional(),
  transactions: z.array(z.unknown()).optional().default([]),
  banks: z.array(z.unknown()).optional().default([]),
  cards: z.array(z.unknown()).optional().default([]),
  staticStatus: z.array(z.unknown()).optional().default([]),
  wishlist: z.array(z.unknown()).optional().default([]),
  bioLogs: z.array(z.unknown()).optional().default([]),
  notes: z.array(z.unknown()).optional().default([]),
  okrs: z.array(z.unknown()).optional().default([]),
  alertRules: z.array(z.unknown()).optional().default([]),
  debtorMap: z.record(z.string(), z.any()).optional().default({}),
  categoriesCatalog: z.array(z.unknown()).optional().default([]),
  categoryColors: z.record(z.string(), z.string()).optional().default({}),
  paymentMethods: z.array(z.string()).optional().default([]),
  settings: z.record(z.string(), z.unknown()).optional().default({})
});

export type ValidatedFullBackup = z.infer<typeof FullBackupSchema>;

export interface QuarantineReport {
  totalParsed: number;
  totalValid: number;
  totalQuarantined: number;
  details: Array<{ entity: string; id?: string; error: string; raw: unknown }>;
}

export interface RestoredBackupData {
  schemaVersion: number;
  user?: { nickname?: string; avatar?: string };
  transactions: ValidatedTransaction[];
  cards: ValidatedCreditCard[];
  banks: ValidatedBank[];
  staticStatus: ValidatedStaticStatus[];
  wishlist: Array<Record<string, unknown>>;
  bioLogs: Array<Record<string, unknown>>;
  notes: Array<Record<string, unknown>>;
  okrs: Array<Record<string, unknown>>;
  alertRules: Array<Record<string, unknown>>;
  debtorMap: Record<string, any>;
  categoriesCatalog: Array<Record<string, unknown>>;
  categoryColors: Record<string, string>;
  paymentMethods: string[];
  settings: Record<string, unknown>;
  quarantine: QuarantineReport;
}

export function validateAndQuarantineBackup(rawInput: unknown): {
  success: boolean;
  data?: RestoredBackupData;
  error?: string;
} {
  const rootResult = FullBackupSchema.safeParse(rawInput);
  if (!rootResult.success) {
    return {
      success: false,
      error: rootResult.error.issues[0]?.message || "Estrutura do arquivo de backup inválida."
    };
  }

  const root = rootResult.data;
  const quarantine: QuarantineReport = {
    totalParsed: 0,
    totalValid: 0,
    totalQuarantined: 0,
    details: []
  };

  // 1. Transações
  const validTransactions: ValidatedTransaction[] = [];
  root.transactions.forEach((item, idx) => {
    quarantine.totalParsed++;
    const res = TransactionSchema.safeParse(item);
    if (res.success) {
      validTransactions.push(res.data);
      quarantine.totalValid++;
    } else {
      quarantine.totalQuarantined++;
      quarantine.details.push({
        entity: "transaction",
        id: (item as any)?.id || `idx-${idx}`,
        error: res.error.issues[0]?.message || "Erro de validação na transação.",
        raw: item
      });
    }
  });

  // 2. Cartões
  const validCards: ValidatedCreditCard[] = [];
  root.cards.forEach((item, idx) => {
    quarantine.totalParsed++;
    const res = CreditCardSchema.safeParse(item);
    if (res.success) {
      validCards.push(res.data);
      quarantine.totalValid++;
    } else {
      quarantine.totalQuarantined++;
      quarantine.details.push({
        entity: "card",
        id: (item as any)?.id || `idx-${idx}`,
        error: res.error.issues[0]?.message || "Erro de validação no cartão.",
        raw: item
      });
    }
  });

  // 3. Bancos
  const validBanks: ValidatedBank[] = [];
  root.banks.forEach((item, idx) => {
    quarantine.totalParsed++;
    const res = BankInstitutionSchema.safeParse(item);
    if (res.success) {
      validBanks.push(res.data);
      quarantine.totalValid++;
    } else {
      quarantine.totalQuarantined++;
      quarantine.details.push({
        entity: "bank",
        id: (item as any)?.id || `idx-${idx}`,
        error: res.error.issues[0]?.message || "Erro de validação no banco.",
        raw: item
      });
    }
  });

  // 4. Status Fixos
  const validStatus: ValidatedStaticStatus[] = [];
  root.staticStatus.forEach((item, idx) => {
    quarantine.totalParsed++;
    const res = StaticStatusSchema.safeParse(item);
    if (res.success) {
      validStatus.push(res.data);
      quarantine.totalValid++;
    } else {
      quarantine.totalQuarantined++;
      quarantine.details.push({
        entity: "staticStatus",
        id: (item as any)?.id || `idx-${idx}`,
        error: res.error.issues[0]?.message || "Erro de validação no item de status.",
        raw: item
      });
    }
  });

  return {
    success: true,
    data: {
      schemaVersion: root.schemaVersion,
      user: root.user,
      transactions: validTransactions,
      cards: validCards,
      banks: validBanks,
      staticStatus: validStatus,
      wishlist: root.wishlist as Array<Record<string, unknown>>,
      bioLogs: root.bioLogs as Array<Record<string, unknown>>,
      notes: root.notes as Array<Record<string, unknown>>,
      okrs: root.okrs as Array<Record<string, unknown>>,
      alertRules: root.alertRules as Array<Record<string, unknown>>,
      debtorMap: root.debtorMap,
      categoriesCatalog: root.categoriesCatalog as Array<Record<string, unknown>>,
      categoryColors: root.categoryColors,
      paymentMethods: root.paymentMethods,
      settings: root.settings,
      quarantine
    }
  };
}
