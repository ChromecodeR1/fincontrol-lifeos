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
      .regex(/^\d{4}-\d{2}-\d{2}/, "A data deve estar no formato AAAA-MM-DD."),
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
    linkedSplitParentId: z.string().optional()
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
  logoUrl: z.string().optional()
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
  logoUrl: z.string().optional()
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
  notes: z.string().optional().default("")
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
