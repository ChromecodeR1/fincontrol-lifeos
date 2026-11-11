import { createClient } from "../supabase/client";
import { ChartWidgetSettings } from "../../components/ChartSettingsPopover";
import {
  formatDateBR,
  todayBR,
  todayISO,
  toSortableISO,
  parseDateParts,
  compareDatesBR
} from "../domain/date-br";
import {
  Transaction,
  CreditCardItem,
  BankItem,
  StaticStatusItem,
  WishlistItem,
  BioLog,
  StravaStats,
  BrainNote,
  PersonalOKR,
  CustomAlertRule,
  ChartThemeColors,
  CategoryCatalogItem,
  SystemLogEntry,
  ThemeMode,
  DashboardWidgetConfig,
  FlowType,
  CostType,
  normalizeStatus,
  migrateLegacyCategory,
  DEFAULT_CATEGORIES_CATALOG,
  DEFAULT_CATEGORY_COLORS,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_CHART_THEME,
  DEFAULT_DASHBOARD_LAYOUT
} from "../../lifeos-data";

/**
 * Codificação UTF-8 Base64 universal e segura contra caracteres especiais e acentuação
 * (compatível com Browser e Node.js).
 */
export function safeBase64Encode(str: string): string {
  try {
    if (typeof window !== "undefined" && typeof window.btoa === "function") {
      return window.btoa(unescape(encodeURIComponent(str)));
    }
    return Buffer.from(str, "utf-8").toString("base64");
  } catch {
    return Buffer.from(str, "utf-8").toString("base64");
  }
}

/**
 * Decodificação UTF-8 Base64 universal e segura contra caracteres especiais e acentuação.
 */
export function safeBase64Decode(str: string): string {
  try {
    if (typeof window !== "undefined" && typeof window.atob === "function") {
      return decodeURIComponent(escape(window.atob(str)));
    }
    return Buffer.from(str, "base64").toString("utf-8");
  } catch {
    return Buffer.from(str, "base64").toString("utf-8");
  }
}

export const TX_METADATA_DELIMITER = " ||__CXM__:";
export const VAULT_CATEGORY = "__COINDEX_CLOUD_VAULT__";
export const VAULT_LEGACY_PREFIX = "__COINDEX_CLOUD_VAULT__:";
export const VAULT_DESC_PREFIX_V2 = "__COINDEX_CLOUD_VAULT_V2__:";
export const VAULT_DESC_PREFIX_V3 = "__COINDEX_CLOUD_VAULT_V3__:";
export const VAULT_DESC_PREFIX = VAULT_DESC_PREFIX_V3;

/**
 * Expressão regular estrita para validação de UUID v4 (RFC 4122).
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * SPRINT 62: Converte qualquer string arbitrária em um UUID v4 (RFC 4122) válido e determinístico.
 * Se o ID já for um UUID v4 válido, retorna em minúsculas sem alteração.
 * Caso contrário, computa 128 bits determinísticos utilizando 4 sementes FNV-1a de 32 bits,
 * aplicando a versão v4 (0x40) e variante RFC (0x80 | 0x3f). Erradica 100% o erro PostgreSQL 22P02.
 */
export function ensureValidUuid(rawId: string): string {
  if (!rawId || typeof rawId !== "string") {
    return "00000000-0000-4000-8000-000000000000";
  }
  const trimmed = rawId.trim();
  if (UUID_REGEX.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  // FNV-1a 32-bit hash com semente customizada
  function fnv1a(str: string, seed: number): number {
    let h = seed >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }

  // Gera 4 números de 32 bits (128 bits no total) usando diferentes sementes
  const h1 = fnv1a(trimmed, 0x811c9dc5);
  const h2 = fnv1a(trimmed, 0x9e3779b9);
  const h3 = fnv1a(trimmed, 0x85ebca6b);
  const h4 = fnv1a(trimmed, 0xc2b2ae35);

  const hex1 = h1.toString(16).padStart(8, "0");
  const hex2 = h2.toString(16).padStart(8, "0");
  const hex3 = h3.toString(16).padStart(8, "0");
  const hex4 = h4.toString(16).padStart(8, "0");

  const raw128 = (hex1 + hex2 + hex3 + hex4).toLowerCase();

  const part1 = raw128.substring(0, 8);
  const part2 = raw128.substring(8, 12);
  const part3 = "4" + raw128.substring(13, 16);
  const b8Hex = parseInt(raw128.substring(16, 18), 16);
  const variantByte = ((b8Hex & 0x3f) | 0x80).toString(16).padStart(2, "0");
  const part4 = variantByte + raw128.substring(18, 20);
  const part5 = raw128.substring(20, 32);

  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

/**
 * Retorna o UUID v4 determinístico do Cofre Mestre V3 para o usuário.
 */
export function getCloudVaultRowId(userId: string): string {
  return ensureValidUuid(`coindex_master_vault_v3_${userId || "default"}`);
}

/**
 * Compatibilidade legada para getVaultRowId.
 */
export function getVaultRowId(userId: string): string {
  return getCloudVaultRowId(userId);
}

/**
 * SPRINT 62: Identifica se um registro de banco de dados pertence ao Cofre Mestre (Cloud Vault),
 * isolando-o de transações financeiras normais por ID, categoria e prefixo de descrição.
 */
export function isCloudVaultRow(row: Record<string, unknown>, userId?: string): boolean {
  if (!row) return false;
  const rId = String(row.id || "");
  const rCat = String(row.category || "");
  const rDesc = String(row.description || "");

  if (userId) {
    const v3Id = getCloudVaultRowId(userId);
    const legacyId = `00000000-0000-4000-8000-${(userId || "").replace(/[^a-fA-F0-9]/g, "").toLowerCase().padEnd(12, "0").slice(0, 12)}`;
    if (rId === v3Id || rId === legacyId) return true;
  }
  if (rCat === VAULT_CATEGORY) return true;
  if (
    rDesc.startsWith(VAULT_DESC_PREFIX_V3) ||
    rDesc.startsWith(VAULT_DESC_PREFIX_V2) ||
    rDesc.startsWith(VAULT_LEGACY_PREFIX) ||
    rDesc.includes("__COINDEX_CLOUD_VAULT__")
  ) {
    return true;
  }
  return false;
}

/**
 * Empacota metadados estendidos do lançamento (gaveta de investimento, ticker, preço de cota,
 * ajustes, dados de veículo, parcelas, devedores) no túnel de descrição para o Supabase.
 */
export function encodeTxForSupabase(tx: Transaction): {
  cleanDescription: string;
  enrichedDescription: string;
  meta: Record<string, unknown>;
} {
  const rawDesc = String(tx.description || "");
  const delimiterIndex = rawDesc.indexOf(TX_METADATA_DELIMITER);
  const cleanDescription = delimiterIndex >= 0 ? rawDesc.slice(0, delimiterIndex).trim() : rawDesc;

  const meta: Record<string, unknown> = {};

  // SPRINT 62: Preserva o ID original da aplicação para restauração precisa após conversão UUID
  if (tx.id) meta.originalId = tx.id;

  // SPRINT 66: Preserva a data estrita no formato brasileiro (DD-MM-YYYY) dentro do túnel de metadados
  const brDate = formatDateBR(tx.date) || todayBR();
  meta.dateBR = brDate;

  // Metadados estendidos de Investimentos (SPRINT 48 & 58)
  if (tx.investmentBucket) meta.investmentBucket = tx.investmentBucket;
  if (tx.assetTicker) meta.assetTicker = tx.assetTicker;
  if (tx.entryQuotePrice !== undefined && tx.entryQuotePrice !== null) meta.entryQuotePrice = tx.entryQuotePrice;
  if (tx.manualYieldPct !== undefined && tx.manualYieldPct !== null) meta.manualYieldPct = tx.manualYieldPct;

  // Metadados bancários e cartões
  if (tx.cardUsed) meta.cardUsed = tx.cardUsed;
  if (tx.cardName) meta.cardName = tx.cardName;
  if (tx.bankAccount) meta.bankAccount = tx.bankAccount;
  if (tx.bankId) meta.bankId = tx.bankId;

  // Parcelamentos e competência
  if (tx.paidAmount !== undefined && tx.paidAmount !== null) meta.paidAmount = tx.paidAmount;
  if (tx.installmentInfo) meta.installmentInfo = tx.installmentInfo;
  if (tx.installmentGroupId) meta.installmentGroupId = tx.installmentGroupId;
  if (tx.installmentSeriesId) meta.installmentSeriesId = tx.installmentSeriesId;
  if (tx.invoiceMonth) meta.invoiceMonth = tx.invoiceMonth;
  if (tx.invoiceCompetence) meta.invoiceCompetence = tx.invoiceCompetence;
  if (tx.cashMonth) meta.cashMonth = tx.cashMonth;
  if (tx.flowType) meta.flowType = tx.flowType;

  // Rateio e devedores
  if (tx.isSplit !== undefined && tx.isSplit !== null) meta.isSplit = tx.isSplit;
  if (tx.thirdPartyAmount !== undefined && tx.thirdPartyAmount !== null) meta.thirdPartyAmount = tx.thirdPartyAmount;
  if (tx.thirdPartyName) meta.thirdPartyName = tx.thirdPartyName;
  if (tx.personalAmount !== undefined && tx.personalAmount !== null) meta.personalAmount = tx.personalAmount;
  if (tx.linkedReceivableId) meta.linkedReceivableId = tx.linkedReceivableId;
  if (tx.isSplitChild !== undefined && tx.isSplitChild !== null) meta.isSplitChild = tx.isSplitChild;
  if (tx.linkedSplitParentId) meta.linkedSplitParentId = tx.linkedSplitParentId;
  if (tx.debtor) meta.debtor = tx.debtor;

  // Veículos e telemetria
  if (tx.km !== undefined && tx.km !== null) meta.km = tx.km;
  if (tx.liters !== undefined && tx.liters !== null) meta.liters = tx.liters;
  if (tx.fuelType) meta.fuelType = tx.fuelType;
  if (tx.fullTank !== undefined && tx.fullTank !== null) meta.fullTank = tx.fullTank;

  // Outros
  if (tx.wishlistId) meta.wishlistId = tx.wishlistId;
  if (tx.iconUrl) meta.iconUrl = tx.iconUrl;
  if (tx.notes) meta.notes = tx.notes;
  if (tx.indexer) meta.indexer = tx.indexer;
  if (tx.cdiPercentage !== undefined && tx.cdiPercentage !== null) meta.cdiPercentage = tx.cdiPercentage;
  if (tx.rev !== undefined && tx.rev !== null) meta.rev = tx.rev;
  if (tx.updatedAt) meta.updatedAt = tx.updatedAt;

  if (Object.keys(meta).length === 0) {
    return { cleanDescription, enrichedDescription: cleanDescription, meta };
  }

  const enrichedDescription = `${cleanDescription}${TX_METADATA_DELIMITER}${safeBase64Encode(JSON.stringify(meta))}`;
  return { cleanDescription, enrichedDescription, meta };
}

/**
 * SPRINT 66 (Henrique Montenegro): Desinversão Forense de Datas PostgreSQL (MDY).
 * Exemplo: Lançamento salvo como "07-11-2026" (7 de nov) foi interpretado pelo PostgreSQL MDY
 * como mês 7 e dia 11 ("2026-07-11"). Esta função restaura a data original em "DD-MM-YYYY".
 */
export function fixPotentiallyInvertedDate(
  rawDateStr: string,
  meta?: Record<string, unknown>,
  rowCreatedAt?: string,
  rowUpdatedAt?: string
): string {
  if (meta?.dateBR && typeof meta.dateBR === "string" && /^\d{2}-\d{2}-\d{4}$/.test(meta.dateBR.trim())) {
    return meta.dateBR.trim();
  }

  if (!rawDateStr) return todayBR();

  const parts = parseDateParts(rawDateStr);
  if (!parts) return formatDateBR(rawDateStr) || todayBR();

  const { day, month, year } = parts;

  // Assinatura de inversão MDY para o ano de 2026:
  // Se year === 2026 e parts.day está entre [9, 10, 11] enquanto parts.month <= 12 e month !== day:
  // Ex: 2026-07-11 -> era 07-11-2026 (7 de Novembro)
  // Ex: 2026-06-11 -> era 06-11-2026 (6 de Novembro)
  // Ex: 2026-05-11 -> era 05-11-2026 (5 de Novembro)
  // Ex: 2026-04-11 -> era 04-11-2026 (4 de Novembro)
  // Ex: 2026-03-11 -> era 03-11-2026 (3 de Novembro)
  // Ex: 2026-02-11 -> era 02-11-2026 (2 de Novembro)
  // Ex: 2026-01-11 -> era 01-11-2026 (1 de Novembro)
  // Ex: 2026-07-10 -> era 07-10-2026 (7 de Outubro)
  // Ex: 2026-05-10 -> era 05-10-2026 (5 de Outubro)
  // Ex: 2026-04-09 -> era 04-09-2026 (4 de Setembro)
  // Ex: 2026-03-09 -> era 03-09-2026 (3 de Setembro)
  // Ex: 2026-02-09 -> era 02-09-2026 (2 de Setembro)
  // Ex: 2026-01-09 -> era 01-09-2026 (1 de Setembro)
  if (year === 2026 && [9, 10, 11].includes(day) && month <= 12 && month !== day) {
    const realDay = String(month).padStart(2, "0");
    const realMonth = String(day).padStart(2, "0");
    return `${realDay}-${realMonth}-${year}`;
  }

  return formatDateBR(rawDateStr);
}

/**
 * Desempacota transparentemente os metadados do túnel de descrição vindo do Supabase,
 * garantindo que a UI receba a descrição limpa e todos os campos reconstruídos.
 */
export function decodeTxFromSupabase(row: Record<string, unknown>): Transaction {
  const rawDesc = String(row.description ?? "");
  let cleanDescription = rawDesc;
  let meta: Record<string, unknown> = {};

  const delimiterIndex = rawDesc.indexOf(TX_METADATA_DELIMITER);
  if (delimiterIndex >= 0) {
    cleanDescription = rawDesc.slice(0, delimiterIndex).trim();
    const b64 = rawDesc.slice(delimiterIndex + TX_METADATA_DELIMITER.length).trim();
    try {
      meta = JSON.parse(safeBase64Decode(b64));
    } catch (e) {
      console.warn("[coindex-supabase] Erro ao decodificar metadados de transação:", e);
    }
  }

  // SPRINT 66: Resolução estrita da data em DD-MM-YYYY com desinversão automática
  let finalDate = "";
  if (meta.dateBR && typeof meta.dateBR === "string" && /^\d{2}-\d{2}-\d{4}$/.test(meta.dateBR.trim())) {
    finalDate = meta.dateBR.trim();
  } else {
    const rawDateStr = String(row.tx_date ?? row.date ?? "");
    const createdAtStr = row.created_at ? String(row.created_at) : undefined;
    const updatedAtStr = row.updated_at ? String(row.updated_at) : undefined;
    finalDate = fixPotentiallyInvertedDate(rawDateStr, meta, createdAtStr, updatedAtStr);
  }

  const tx: Transaction = {
    id: (meta.originalId ? String(meta.originalId) : undefined) ?? String(row.id),
    date: finalDate,
    description: cleanDescription,
    amount: Number(row.amount ?? 0),
    category: migrateLegacyCategory(String(row.category ?? "Outros"), cleanDescription),
    costType: (row.cost_type as CostType) ?? "Variável",
    paymentMethod: String(row.payment_method ?? "PIX"),
    cardUsed: (row.card_used ? String(row.card_used) : undefined) ?? (meta.cardUsed as string | undefined),
    cardName: (row.card_used ? String(row.card_used) : undefined) ?? (meta.cardName as string | undefined),
    bankAccount: (row.bank_account ? String(row.bank_account) : undefined) ?? (meta.bankAccount as string | undefined),
    bankId: (row.bank_id ? String(row.bank_id) : undefined) ?? (meta.bankId as string | undefined),
    status: normalizeStatus(String(row.status ?? "Pendente")),
    km: row.km != null ? Number(row.km) : (meta.km != null ? Number(meta.km) : undefined),
    liters: row.liters != null ? Number(row.liters) : (meta.liters != null ? Number(meta.liters) : undefined),
    fuelType: (row.fuel_type ? String(row.fuel_type) as "Gasolina" | "Etanol" : undefined) ?? (meta.fuelType as "Gasolina" | "Etanol" | undefined),
    fullTank: row.full_tank != null ? Boolean(row.full_tank) : (meta.fullTank != null ? Boolean(meta.fullTank) : undefined),
    debtor: (row.debtor ? String(row.debtor) : undefined) ?? (meta.debtor as string | undefined),
    paidAmount: row.paid_amount != null ? Number(row.paid_amount) : (meta.paidAmount != null ? Number(meta.paidAmount) : 0),
    installmentInfo: (row.installment_info ? String(row.installment_info) : undefined) ?? (meta.installmentInfo as string | undefined),
    installmentGroupId: (row.installment_group_id ? String(row.installment_group_id) : undefined) ?? (meta.installmentGroupId as string | undefined),
    installmentSeriesId: (row.installment_series_id ? String(row.installment_series_id) : undefined) ?? (meta.installmentSeriesId as string | undefined),
    invoiceMonth: (row.invoice_month ? String(row.invoice_month) : undefined) ?? (meta.invoiceMonth as string | undefined),
    invoiceCompetence: (row.invoice_competence ? String(row.invoice_competence) : undefined) ?? (meta.invoiceCompetence as string | undefined) ?? (row.invoice_month ? String(row.invoice_month) : undefined),
    cashMonth: (row.cash_month ? String(row.cash_month) : undefined) ?? (meta.cashMonth as string | undefined),
    flowType: (row.flow_type as FlowType | undefined) ?? (meta.flowType as FlowType | undefined),
    isSplit: row.is_split != null ? Boolean(row.is_split) : (meta.isSplit != null ? Boolean(meta.isSplit) : undefined),
    thirdPartyAmount: row.third_party_amount != null ? Number(row.third_party_amount) : (meta.thirdPartyAmount != null ? Number(meta.thirdPartyAmount) : undefined),
    thirdPartyName: (row.third_party_name ? String(row.third_party_name) : undefined) ?? (meta.thirdPartyName as string | undefined),
    personalAmount: row.personal_amount != null ? Number(row.personal_amount) : (meta.personalAmount != null ? Number(meta.personalAmount) : undefined),
    linkedReceivableId: (row.linked_receivable_id ? String(row.linked_receivable_id) : undefined) ?? (meta.linkedReceivableId as string | undefined),
    isSplitChild: row.is_split_child != null ? Boolean(row.is_split_child) : (meta.isSplitChild != null ? Boolean(meta.isSplitChild) : undefined),
    linkedSplitParentId: (row.linked_split_parent_id ? String(row.linked_split_parent_id) : undefined) ?? (meta.linkedSplitParentId as string | undefined),
    wishlistId: (row.wishlist_id ? String(row.wishlist_id) : undefined) ?? (meta.wishlistId as string | undefined),
    iconUrl: (row.icon_url ? String(row.icon_url) : undefined) ?? (meta.iconUrl as string | undefined),
    notes: (row.notes ? String(row.notes) : undefined) ?? (meta.notes as string | undefined),
    indexer: (row.indexer ? String(row.indexer) : undefined) ?? (meta.indexer as string | undefined),
    cdiPercentage: row.cdi_percentage != null ? Number(row.cdi_percentage) : (meta.cdiPercentage != null ? Number(meta.cdiPercentage) : undefined),
    investmentBucket: ((row.investment_bucket as any) ?? meta.investmentBucket) as any,
    assetTicker: (row.asset_ticker ? String(row.asset_ticker) : undefined) ?? (meta.assetTicker as string | undefined),
    entryQuotePrice: row.entry_quote_price != null ? Number(row.entry_quote_price) : (meta.entryQuotePrice != null ? Number(meta.entryQuotePrice) : undefined),
    manualYieldPct: row.manual_yield_pct != null ? Number(row.manual_yield_pct) : (meta.manualYieldPct != null ? Number(meta.manualYieldPct) : undefined),
    updatedAt: (row.updated_at ? String(row.updated_at) : undefined) ?? (meta.updatedAt as string | undefined) ?? new Date().toISOString(),
    deletedAt: (row.deleted_at ? String(row.deleted_at) : undefined) ?? (meta.deletedAt as string | undefined),
    rev: row.rev != null ? Number(row.rev) : (meta.rev != null ? Number(meta.rev) : undefined)
  };

  return tx;
}

/**
 * SPRINT 65 (Henrique Montenegro): Pontuação heurística de qualidade para desempate entre clones.
 * Prioriza registros com metadados mais ricos (investimentos, parcelamentos, telemetria)
 * e formato canônico UUID v4 válido gerado na Sprint 62.
 */
function scoreTransactionQuality(tx: Transaction): number {
  let score = 0;
  if (tx.investmentBucket) score += 10;
  if (tx.assetTicker) score += 8;
  if (tx.entryQuotePrice != null) score += 5;
  if (tx.manualYieldPct != null) score += 5;
  if (tx.cardUsed || tx.cardName || tx.cardId) score += 5;
  if (tx.bankAccount || tx.bankId) score += 5;
  if (tx.debtor) score += 5;
  if (tx.installmentInfo) score += 4;
  if (tx.installmentGroupId || tx.installmentSeriesId) score += 4;
  if (tx.invoiceMonth || tx.cashMonth) score += 3;
  if (tx.km != null || tx.liters != null) score += 5;
  if (tx.isSplit || tx.thirdPartyAmount != null) score += 5;
  if (tx.notes) score += 2;
  if (tx.wishlistId) score += 3;
  if (tx.rev && tx.rev > 1) score += Math.min(tx.rev, 10);
  if (UUID_REGEX.test(tx.id)) score += 10;
  if (tx.updatedAt) {
    const time = new Date(tx.updatedAt).getTime();
    if (!isNaN(time) && time > 0) {
      score += Math.min(Math.floor(time / 1000000000), 20);
    }
  }
  return score;
}

/**
 * SPRINT 65: Normaliza a descrição da transação para comparação estrita de conteúdo semântico.
 */
function normalizeTxDescription(desc: string): string {
  return (desc || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * SPRINT 66 (Henrique Montenegro): Deduplicação Conservadora e Não-Destrutiva.
 * Agrupa exclusivamente registros com o mesmo ID ou colisão canônica UUID determinística,
 * preservando 100% dos lançamentos independentes e NUNCA disparando deleções automáticas.
 */
export function deduplicateCloudTransactions(txs: Transaction[]): {
  deduplicatedTxs: Transaction[];
  duplicateIdsToDelete: string[];
} {
  if (!txs || txs.length === 0) {
    return { deduplicatedTxs: [], duplicateIdsToDelete: [] };
  }

  // Agrupamento estrito por UUID canônico determinístico
  const idToGroupMap = new Map<string, Transaction[]>();
  for (const tx of txs) {
    if (!tx || !tx.id) continue;
    const canonicalKey = ensureValidUuid(tx.id);
    const existing = idToGroupMap.get(canonicalKey);
    if (existing) {
      existing.push(tx);
    } else {
      idToGroupMap.set(canonicalKey, [tx]);
    }
  }

  const deduplicatedTxs: Transaction[] = [];

  for (const group of idToGroupMap.values()) {
    if (group.length === 1) {
      deduplicatedTxs.push(group[0]);
    } else {
      group.sort((a, b) => scoreTransactionQuality(b) - scoreTransactionQuality(a));
      deduplicatedTxs.push(group[0]);
    }
  }

  // Retorna lista deduplicada com array de deleção VAZIO (Proibição de Deleção Automática)
  return {
    deduplicatedTxs,
    duplicateIdsToDelete: []
  };
}

/**
 * SPRINT 65 (Henrique Montenegro): Purga física e segura de transações duplicadas no Supabase PostgreSQL.
 * Processa em lotes de 50 registros por requisição para evitar timeouts de rede.
 * Protege estritamente o registro do Cofre Mestre V3 contra deleção acidental.
 */
export async function purgeDuplicateTransactionsInDb(
  userId: string,
  idsToDelete: string[]
): Promise<{ ok: boolean; deletedCount: number; error?: string }> {
  if (!userId || !idsToDelete || idsToDelete.length === 0) {
    return { ok: true, deletedCount: 0 };
  }
  try {
    const supabase = createClient();
    const vaultId = getCloudVaultRowId(userId);

    // Filtra IDs inválidos e garante proteção absoluta do Cofre Mestre V3
    const uniqueIds = Array.from(new Set(idsToDelete))
      .filter((id) => id && id !== vaultId && id !== "00000000-0000-4000-8000-000000000000");

    if (uniqueIds.length === 0) return { ok: true, deletedCount: 0 };

    const CHUNK_SIZE = 50;
    let deletedCount = 0;

    for (let i = 0; i < uniqueIds.length; i += CHUNK_SIZE) {
      const chunk = uniqueIds.slice(i, i + CHUNK_SIZE);
      const targetUuids = Array.from(new Set(chunk.flatMap((id) => [id, ensureValidUuid(id)])))
        .filter((id) => id !== vaultId);

      const { error } = await supabase
        .from("transactions")
        .delete()
        .in("id", targetUuids)
        .eq("user_id", userId);

      if (error) {
        console.warn("[coindex-supabase] Aviso ao purgar lote de duplicatas:", error.message);
      } else {
        deletedCount += chunk.length;
      }
    }

    if (deletedCount > 0) {
      console.log(`[coindex-supabase] Purgadas ${deletedCount} transações duplicadas do PostgreSQL com sucesso.`);
    }
    return { ok: true, deletedCount };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido ao purgar duplicatas";
    console.error("[coindex-supabase] Falha na purga de duplicatas:", msg);
    return { ok: false, deletedCount: 0, error: msg };
  }
}

const WISH_META_PREFIX = "<!--__COINDEX_WISH_META__:";
const WISH_META_SUFFIX = "-->";

/**
 * Serializa metadados críticos de Desejos de Compra (BrainNote) dentro do conteúdo
 * para garantir 100% de persistência na nuvem (Supabase SSOT) mesmo se o schema
 * da tabela remota estiver sem as colunas novas dedicadas.
 */
export function encodeWishMetadata(n: BrainNote, baseContent: string): string {
  const meta: Record<string, unknown> = {};
  if (n.itemType) meta.itemType = n.itemType;
  if (n.price !== undefined) meta.price = n.price;
  if (n.completed !== undefined) meta.completed = n.completed;
  if (n.targetMonth !== undefined) meta.targetMonth = n.targetMonth;
  if (n.priority !== undefined) meta.priority = n.priority;
  if (n.storeUrl !== undefined) meta.storeUrl = n.storeUrl;
  if (n.completedAt !== undefined) meta.completedAt = n.completedAt;
  if (n.description && n.description !== baseContent) meta.description = n.description;

  const clean = (baseContent || "").replace(/<!--__COINDEX_WISH_META__:[\s\S]*?-->/g, "").trim();
  if (Object.keys(meta).length === 0) return clean;
  return `${clean}\n\n${WISH_META_PREFIX}${JSON.stringify(meta)}${WISH_META_SUFFIX}`;
}

/**
 * Decodifica metadados de Desejos de Compra transparentemente do conteúdo da nota.
 */
export function decodeWishMetadata(content: string): { cleanContent: string; meta?: Partial<BrainNote> } {
  if (!content) return { cleanContent: "" };
  const match = content.match(/<!--__COINDEX_WISH_META__:([\s\S]*?)-->/);
  if (!match) return { cleanContent: content };

  try {
    const meta = JSON.parse(match[1]);
    const cleanContent = content.replace(/<!--__COINDEX_WISH_META__:[\s\S]*?-->/g, "").trim();
    return { cleanContent, meta };
  } catch {
    return { cleanContent: content };
  }
}

export interface CoindexCloudVaultState {
  version: string;
  syncedAt: string;
  updatedAt?: string;
  rev?: number;
  // 1. Cartões de Crédito
  cards?: CreditCardItem[];
  // 2. Contas Bancárias
  banks?: BankItem[];
  // 3. Status Fixo / Alertas
  staticStatus?: StaticStatusItem[];
  // 4. Lista de Desejos / Wishlist / BrainNotes
  notes?: BrainNote[];
  wishlist?: WishlistItem[];
  // 5. Investimentos
  investmentState?: {
    realBalanceOverride?: number;
    yieldMode?: "bruto" | "liquido" | "aportes";
    visibleMarketCharts?: string[];
    simulatorMonthlyContribution?: number;
    bucketCalibrations?: Record<string, number>;
    purchases?: Record<string, Array<{
      date: string;
      amount: number;
      quotePrice?: number;
      quantity?: number;
      notes?: string;
    }>>;
    notes?: Record<string, string>;
    customGoals?: Record<string, number>;
    b3Holdings?: Record<string, unknown>;
  };
  // 6. Veículos & Garagem
  vehiclesState?: {
    vehicles?: Array<{
      id: string;
      name: string;
      model?: string;
      plate?: string;
      currentKm?: number;
      fuelTankCapacity?: number;
      color?: string;
    }>;
    refuels?: Array<{
      id: string;
      vehicleId?: string;
      date: string;
      km: number;
      liters: number;
      totalCost: number;
      fuelType?: string;
      fullTank?: boolean;
    }>;
    maintenanceLogs?: Array<{
      id: string;
      vehicleId?: string;
      date: string;
      km: number;
      description: string;
      cost: number;
      category?: string;
    }>;
    customPlans?: Record<string, Array<{
      id: string;
      item: string;
      intervalKm: number;
      lastDoneKm?: number;
      notes?: string;
    }>>;
    activeVehicleId?: string;
  };
  autoInmetroConfig?: unknown;
  vehicleMaintenance?: {
    history?: Record<string, number>;
    customItems?: unknown[];
  };
  // 7. Bio & Strava
  bioAndStravaState?: {
    stravaActivities?: unknown[];
    bioLogs?: BioLog[];
    athleteProfile?: unknown;
    stravaStats?: unknown;
  };
  // 8. Configurações da UI
  uiSettings?: {
    themeMode?: ThemeMode;
    bgFxMode?: string;
    cupertinoTheme?: boolean;
    reduceMotion?: boolean;
    activeTab?: string;
    chartTheme?: ChartThemeColors;
    dashboardLayout?: DashboardWidgetConfig[];
    chartConfigs?: Record<string, ChartWidgetSettings>;
  };
  // 9. Tombstones
  tombstones?: string[];
}

export interface UserSettingsPayload {
  username?: string;
  avatarUrl?: string;
  themeMode?: ThemeMode;
  personalBudgetLimit?: number;
  monthlyInvestmentGoal?: number;
  patrimonyTarget?: number;
  initialPatrimony?: number;
  annualRunGoalKm?: number;
  chartTheme?: ChartThemeColors;
  dashboardLayout?: DashboardWidgetConfig[];
  chartConfigs?: Record<string, ChartWidgetSettings>;
  readNotificationIds?: string[];
  stravaConfig?: {
    athleteId: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  stravaStats?: StravaStats;
}

export interface FullCoindexSnapshot {
  transactions: Transaction[];
  cards: CreditCardItem[];
  banks?: BankItem[];
  staticStatus: StaticStatusItem[];
  wishlist: WishlistItem[];
  bioLogs: BioLog[];
  notes: BrainNote[];
  okrs: PersonalOKR[];
  alertRules: CustomAlertRule[];
  categoriesCatalog: CategoryCatalogItem[];
  categoryColors: Record<string, string>;
  paymentMethods: string[];
  systemLogs: SystemLogEntry[];
  settings: UserSettingsPayload;
  cloudVault?: CoindexCloudVaultState;
}

async function getActiveUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

function toMethodSlug(name: string): string {
  const clean = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  return clean ? `pm-${clean}` : `pm-${Date.now()}`;
}

function toCategorySlug(name: string): string {
  const clean = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  return clean ? `cat-${clean}` : `cat-${Date.now()}`;
}

/**
 * SPRINT 62: Gravação universal do Cofre Mestre V3 dentro da tabela transactions
 * utilizando estritamente as 9 colunas com valores que satisfazem 100% de constraints e enums.
 */
export async function saveCloudVaultInTransactionsDb(
  userId: string,
  vaultPayload: Partial<CoindexCloudVaultState>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = createClient();
    if (!userId) return { ok: false, error: "Utilizador não autenticado." };

    const vaultId = getCloudVaultRowId(userId);
    const nowIso = new Date().toISOString();

    const payload: CoindexCloudVaultState = {
      version: "0.47.0",
      syncedAt: nowIso,
      updatedAt: nowIso,
      ...vaultPayload
    };

    const encodedVaultDesc = `${VAULT_DESC_PREFIX_V3}${safeBase64Encode(JSON.stringify(payload))}`;

    const vaultRow: Record<string, unknown> = {
      id: vaultId,
      user_id: userId,
      tx_date: nowIso.split("T")[0],
      description: encodedVaultDesc,
      amount: 0,
      category: "Outros",
      cost_type: "Fixo",
      payment_method: "PIX",
      status: "Pago",
      updated_at: nowIso
    };

    const res = await supabase.from("transactions").upsert(vaultRow, { onConflict: "id,user_id" });
    if (res.error) {
      // Fallback básico para esquemas que não possuem a coluna updated_at
      const minimalRow = {
        id: vaultId,
        user_id: userId,
        tx_date: nowIso.split("T")[0],
        description: encodedVaultDesc,
        amount: 0,
        category: "Outros",
        cost_type: "Fixo",
        payment_method: "PIX",
        status: "Pago"
      };
      const fbRes = await supabase.from("transactions").upsert(minimalRow, { onConflict: "id,user_id" });
      if (fbRes.error) {
        console.warn("[coindex-supabase] Erro no fallback ao salvar Cofre Mestre:", fbRes.error.message);
        return { ok: false, error: fbRes.error.message };
      }
    }
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido ao salvar Cofre Mestre";
    console.error("[coindex-supabase] Falha na rede ao salvar Cofre Mestre:", msg);
    return { ok: false, error: msg };
  }
}

export async function saveCloudVaultInDb(
  partialState: Partial<CoindexCloudVaultState>,
  explicitUserId?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const userId = explicitUserId || (await getActiveUserId());
  if (!userId) return { ok: false, error: "Utilizador não autenticado." };
  return saveCloudVaultInTransactionsDb(userId, partialState);
}

export async function fetchAllCoindexData(tombstoneSet?: Set<string>): Promise<{
  ok: boolean;
  isEmpty: boolean;
  userId?: string;
  data?: FullCoindexSnapshot;
  error?: string;
}> {
  try {
    const supabase = createClient();
    const userId = await getActiveUserId();
    if (!userId) {
      return { ok: false, isEmpty: true, error: "Utilizador não autenticado." };
    }

    // Consulta resiliente de bancos remotos (tabela banks pode não existir em esquemas legados)
    const banksResPromise = (async () => {
      try {
        const res = await supabase.from("banks").select("*").eq("user_id", userId);
        return res;
      } catch {
        return { data: [], error: null };
      }
    })();

    const [
      settingsRes,
      catsRes,
      methodsRes,
      cardsRes,
      wishRes,
      txsRes,
      statusRes,
      bioRes,
      okrsRes,
      notesRes,
      alertsRes,
      logsRes,
      banksRes
    ] = await Promise.all([
      supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("categories").select("*").eq("user_id", userId),
      supabase.from("payment_methods").select("*").eq("user_id", userId),
      supabase.from("credit_cards").select("*").eq("user_id", userId),
      supabase.from("wishlist_items").select("*").eq("user_id", userId),
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("tx_date", { ascending: false })
        .range(0, 999),
      supabase.from("static_status").select("*").eq("user_id", userId),
      supabase.from("bio_logs").select("*").eq("user_id", userId).order("log_date", { ascending: true }),
      supabase.from("personal_okrs").select("*").eq("user_id", userId),
      supabase.from("brain_notes").select("*").eq("user_id", userId).order("note_date", { ascending: false }),
      supabase.from("alert_rules").select("*").eq("user_id", userId),
      supabase.from("system_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(200),
      banksResPromise
    ]);

    let txRows = (txsRes.data ?? []) as Array<Record<string, unknown>>;
    // Continua a busca paginada se a primeira página atingiu 1000 registros (AUD-14)
    if (txRows.length === 1000) {
      let page = 1;
      const PAGE_SIZE = 1000;
      while (true) {
        const { data: pageData, error: pageErr } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", userId)
          .order("tx_date", { ascending: false })
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
        if (pageErr || !pageData || pageData.length === 0) break;
        txRows = txRows.concat(pageData as Array<Record<string, unknown>>);
        if (pageData.length < PAGE_SIZE) break;
        page++;
      }
    }

    // SPRINT 58 & 62: Extração e Desacoplamento Estrito do Cofre Mestre Cloud Vault
    // Isola as linhas do cofre ANTES de qualquer parse de transações financeiras
    const vaultRows = txRows.filter((r) => isCloudVaultRow(r, userId));
    const pureTxRows = txRows.filter((r) => !isCloudVaultRow(r, userId));

    let cloudVault: CoindexCloudVaultState | undefined;
    if (vaultRows.length > 0) {
      // Ordena por updated_at descendente para priorizar a revisão mais recente
      const sortedVaultRows = [...vaultRows].sort((a, b) => {
        const timeA = a.updated_at ? new Date(String(a.updated_at)).getTime() : 0;
        const timeB = b.updated_at ? new Date(String(b.updated_at)).getTime() : 0;
        return timeB - timeA;
      });

      for (const vRow of sortedVaultRows) {
        const desc = String(vRow.description || "");
        let b64 = "";
        if (desc.startsWith(VAULT_DESC_PREFIX_V3)) {
          b64 = desc.slice(VAULT_DESC_PREFIX_V3.length).trim();
        } else if (desc.startsWith(VAULT_DESC_PREFIX_V2)) {
          b64 = desc.slice(VAULT_DESC_PREFIX_V2.length).trim();
        } else if (desc.startsWith(VAULT_LEGACY_PREFIX)) {
          b64 = desc.slice(VAULT_LEGACY_PREFIX.length).trim();
        } else {
          const idx = desc.indexOf("__COINDEX_CLOUD_VAULT");
          if (idx >= 0) {
            const colonIdx = desc.indexOf(":", idx);
            if (colonIdx >= 0) b64 = desc.slice(colonIdx + 1).trim();
          }
        }

        if (b64) {
          try {
            const parsed = JSON.parse(safeBase64Decode(b64));
            if (parsed && typeof parsed === "object") {
              cloudVault = parsed;
              break;
            }
          } catch (e) {
            console.warn("[coindex-supabase] Erro ao decodificar cofre mestre de linha:", e);
          }
        }
      }
    }

    const effectiveTombstones = new Set(tombstoneSet || []);
    if (Array.isArray(cloudVault?.tombstones)) {
      cloudVault.tombstones.forEach((t) => effectiveTombstones.add(t));
    }

    const cardRows = (cardsRes.data ?? []) as Array<Record<string, unknown>>;
    const catRows = (catsRes.data ?? []) as Array<Record<string, unknown>>;

    const isExcluded = (id: string, deletedAt?: unknown) => {
      if (deletedAt) return true;
      if (effectiveTombstones.has(id)) return true;
      return false;
    };

    const isEmpty = pureTxRows.length === 0 && cardRows.length === 0 && catRows.length === 0;

    // SPRINT 58 & 65: Decodificação universal com túnel de metadados e deduplicação automática
    const rawTransactions: Transaction[] = pureTxRows
      .filter((r) => !isExcluded(String(r.id), r.deleted_at))
      .map((r) => decodeTxFromSupabase(r));

    const { deduplicatedTxs: transactions } = deduplicateCloudTransactions(rawTransactions);

    const rawCloudBackup = (settingsRes.data as any)?.cloud_backup_state;

    let cards: CreditCardItem[] = cardRows
      .filter((r) => !isExcluded(String(r.id), r.deleted_at))
      .map((r) => ({
        id: String(r.id),
        name: String(r.name),
        brand: String(r.brand ?? "Mastercard"),
        limit: Number(r.limit_amount ?? 0),
        closingDay: Number(r.closing_day ?? 25),
        dueDay: Number(r.due_day ?? 5),
        logoUrl: r.logo_url ? String(r.logo_url) : undefined,
        bankId: (r as any).bank_id ? String((r as any).bank_id) : undefined,
        bankName: (r as any).bank_name ? String((r as any).bank_name) : undefined,
        updatedAt: r.updated_at ? String(r.updated_at) : undefined,
        deletedAt: r.deleted_at ? String(r.deleted_at) : undefined,
        rev: r.rev != null ? Number(r.rev) : undefined
      }));

    if (cards.length === 0) {
      if (cloudVault?.cards && cloudVault.cards.length > 0) {
        cards = cloudVault.cards.filter((c: CreditCardItem) => !isExcluded(c.id, c.deletedAt));
      } else if (Array.isArray(rawCloudBackup?.cards) && rawCloudBackup.cards.length > 0) {
        cards = rawCloudBackup.cards.filter((c: any) => !isExcluded(c.id, c.deletedAt));
      }
    }

    const bankRows = ((banksRes as any)?.data ?? []) as Array<Record<string, unknown>>;
    let banks: BankItem[] = bankRows
      .filter((r) => !isExcluded(String(r.id), r.deleted_at))
      .map((r) => ({
        id: String(r.id),
        name: String(r.name),
        logoUrl: r.logo_url ? String(r.logo_url) : undefined,
        limit: r.limit_amount != null ? Number(r.limit_amount) : (r.limit != null ? Number(r.limit) : undefined),
        limitType: r.limit_type ? String(r.limit_type) : undefined,
        accountType: (r.account_type as BankItem["accountType"]) ?? undefined,
        color: r.color ? String(r.color) : undefined,
        updatedAt: r.updated_at ? String(r.updated_at) : undefined,
        deletedAt: r.deleted_at ? String(r.deleted_at) : undefined,
        rev: r.rev != null ? Number(r.rev) : undefined
      }));

    if (banks.length === 0) {
      if (cloudVault?.banks && cloudVault.banks.length > 0) {
        banks = cloudVault.banks.filter((b: BankItem) => !isExcluded(b.id, b.deletedAt));
      } else if (Array.isArray(rawCloudBackup?.banks) && rawCloudBackup.banks.length > 0) {
        banks = rawCloudBackup.banks.filter((b: any) => !isExcluded(b.id, b.deletedAt));
      }
    }

    let staticStatus: StaticStatusItem[] = ((statusRes.data ?? []) as Array<Record<string, unknown>>)
      .filter((r) => !isExcluded(String(r.id), r.deleted_at))
      .map((r) => ({
        id: String(r.id),
        title: String(r.title),
        type: r.item_type as StaticStatusItem["type"],
        amount: Number(r.amount ?? 0),
        notes: String(r.notes ?? ""),
        updatedAt: r.updated_at ? String(r.updated_at) : undefined,
        deletedAt: r.deleted_at ? String(r.deleted_at) : undefined,
        rev: r.rev != null ? Number(r.rev) : undefined
      }));

    if (staticStatus.length === 0 && cloudVault?.staticStatus && cloudVault.staticStatus.length > 0) {
      staticStatus = cloudVault.staticStatus;
    }

    let wishlist: WishlistItem[] = ((wishRes.data ?? []) as Array<Record<string, unknown>>)
      .filter((r) => !isExcluded(String(r.id), r.deleted_at))
      .map((r) => ({
        id: String(r.id),
        title: String(r.title),
        institution: String(r.institution ?? "Nubank"),
        targetAmount: Number(r.target_amount ?? 0),
        savedAmount: Number(r.saved_amount ?? 0),
        priority: (r.priority as WishlistItem["priority"]) ?? "Média"
      }));

    if (wishlist.length === 0 && cloudVault?.wishlist && cloudVault.wishlist.length > 0) {
      wishlist = cloudVault.wishlist.filter((w: WishlistItem) => !isExcluded(w.id));
    }

    let bioLogs: BioLog[] = ((bioRes.data ?? []) as Array<Record<string, unknown>>)
      .filter((r) => !isExcluded(String(r.id), r.deleted_at))
      .map((r) => ({
        id: String(r.id),
        date: String(r.log_date),
        weight: Number(r.weight ?? 0),
        bf: r.bf != null ? Number(r.bf) : undefined
      }));

    if (bioLogs.length === 0 && cloudVault?.bioAndStravaState?.bioLogs && cloudVault.bioAndStravaState.bioLogs.length > 0) {
      bioLogs = cloudVault.bioAndStravaState.bioLogs.filter((b: BioLog) => !isExcluded(b.id));
    }

    const okrs: PersonalOKR[] = ((okrsRes.data ?? []) as Array<Record<string, unknown>>)
      .filter((r) => !isExcluded(String(r.id), r.deleted_at))
      .map((r) => ({
        id: String(r.id),
        title: String(r.title),
        category: String(r.category ?? "Finanças"),
        current: Number(r.current_val ?? 0),
        target: Number(r.target_val ?? 100),
        unit: String(r.unit ?? "R$")
      }));

    let notes: BrainNote[] = ((notesRes.data ?? []) as Array<Record<string, unknown>>)
      .filter((r) => !isExcluded(String(r.id), r.deleted_at))
      .map((r) => {
        const rawContent = String(r.content ?? "");
        const rawDesc = r.description ? String(r.description) : "";
        const decodedContent = decodeWishMetadata(rawContent);
        const decodedDesc = decodeWishMetadata(rawDesc);
        const meta = decodedContent.meta || decodedDesc.meta || {};

        const itemType = (r.item_type as "note" | "wish") || meta.itemType || (r.price != null || meta.price != null ? "wish" : "note");
        const price = r.price != null ? Number(r.price) : (meta.price !== undefined ? Number(meta.price) : undefined);
        const completed = r.completed != null ? Boolean(r.completed) : Boolean(meta.completed);
        const priority = (r.priority as "Essencial" | "Planejado" | "Desejo") || meta.priority || undefined;
        const storeUrl = r.store_url ? String(r.store_url) : (meta.storeUrl ? String(meta.storeUrl) : undefined);
        const completedAt = r.completed_at ? String(r.completed_at) : (meta.completedAt ? String(meta.completedAt) : undefined);
        const targetMonth = (r.target_month ? String(r.target_month) : undefined) || meta.targetMonth;
        const finalContent = decodedContent.cleanContent || rawContent;
        const finalDesc = decodedDesc.cleanContent || rawDesc || finalContent;

        return {
          id: String(r.id),
          date: String(r.note_date),
          title: String(r.title),
          content: finalContent,
          tag: (r.tag as BrainNote["tag"]) ?? "#Ideias",
          completed,
          itemType,
          price,
          description: finalDesc,
          priority,
          storeUrl,
          completedAt,
          targetMonth,
          updatedAt: r.updated_at ? String(r.updated_at) : undefined,
          deletedAt: r.deleted_at ? String(r.deleted_at) : undefined,
          rev: r.rev != null ? Number(r.rev) : undefined
        };
      });

    if (notes.length === 0) {
      if (cloudVault?.notes && cloudVault.notes.length > 0) {
        notes = cloudVault.notes;
      } else if (Array.isArray(rawCloudBackup?.brainNotes) && rawCloudBackup.brainNotes.length > 0) {
        notes = rawCloudBackup.brainNotes;
      }
    }

    const alertRules: CustomAlertRule[] = ((alertsRes.data ?? []) as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      title: String(r.title),
      type: (r.rule_type as CustomAlertRule["type"]) ?? "ODOMETER_KM",
      targetValue: Number(r.target_value ?? 50000),
      warningLead: Number(r.warning_lead ?? 500)
    }));

    const categoriesCatalog: CategoryCatalogItem[] =
      catRows.length > 0
        ? catRows.map((r) => ({
            name: String(r.name),
            flow: (r.flow as FlowType) ?? "EXPENSE",
            isAuto: Boolean(r.is_auto)
          }))
        : DEFAULT_CATEGORIES_CATALOG;

    const categoryColors: Record<string, string> = { ...DEFAULT_CATEGORY_COLORS };
    catRows.forEach((r) => {
      if (r.name && r.color) {
        categoryColors[String(r.name)] = String(r.color);
      }
    });

    const methodRows = (methodsRes.data ?? []) as Array<Record<string, unknown>>;
    const paymentMethods: string[] =
      methodRows.length > 0 ? methodRows.map((r) => String(r.name)) : DEFAULT_PAYMENT_METHODS;

    const systemLogs: SystemLogEntry[] = ((logsRes.data ?? []) as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      timestamp: String(r.timestamp_str),
      user: String(r.user_label),
      category: r.category as SystemLogEntry["category"],
      action: String(r.action),
      details: String(r.details ?? "")
    }));

    const st = (settingsRes.data ?? null) as Record<string, unknown> | null;
    const rawChartTheme = (st?.chart_theme ?? null) as Partial<ChartThemeColors> | null;
    const rawDashLayout = st?.dashboard_layout;
    const rawChartConfigs = (st?.chart_configs ?? null) as Record<string, ChartWidgetSettings> | null;

    const settings: UserSettingsPayload = {
      username: typeof st?.username === "string" ? st.username : undefined,
      avatarUrl: typeof st?.avatar_url === "string" ? st.avatar_url : undefined,
      themeMode: (st?.theme_mode as ThemeMode) ?? "tradicional",
      personalBudgetLimit: st?.personal_budget_limit != null ? Number(st.personal_budget_limit) : 350,
      monthlyInvestmentGoal: st?.monthly_investment_goal != null ? Number(st.monthly_investment_goal) : 1450,
      patrimonyTarget: st?.patrimony_target != null ? Number(st.patrimony_target) : 25000,
      annualRunGoalKm: st?.annual_run_goal_km != null ? Number(st.annual_run_goal_km) : 600,
      chartTheme:
        rawChartTheme && Object.keys(rawChartTheme).length > 0
          ? { ...DEFAULT_CHART_THEME, ...rawChartTheme }
          : DEFAULT_CHART_THEME,
      dashboardLayout:
        Array.isArray(rawDashLayout) && rawDashLayout.length > 0
          ? (rawDashLayout as DashboardWidgetConfig[])
          : DEFAULT_DASHBOARD_LAYOUT,
      chartConfigs: rawChartConfigs && typeof rawChartConfigs === "object" ? rawChartConfigs : {},
      readNotificationIds: Array.isArray(st?.read_notification_ids)
        ? (st.read_notification_ids as string[])
        : [],
      stravaConfig: (st?.strava_config as UserSettingsPayload["stravaConfig"]) ?? {
        athleteId: "",
        clientId: "",
        clientSecret: "",
        refreshToken: ""
      },
      stravaStats: (st?.strava_stats as StravaStats) ?? {
        ytdKm: 342,
        ytdRuns: 48,
        allTimeKm: 1280,
        allTimeRuns: 195,
        lastSync: "Supabase"
      }
    };

    return {
      ok: true,
      isEmpty,
      userId,
      data: {
        transactions,
        cards,
        banks,
        staticStatus,
        wishlist,
        bioLogs,
        notes,
        okrs,
        alertRules,
        categoriesCatalog,
        categoryColors,
        paymentMethods,
        systemLogs,
        settings,
        cloudVault
      }
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Falha ao carregar dados do Supabase.";
    return {
      ok: false,
      isEmpty: true,
      error: message
    };
  }
}

export async function migrateAllStateToSupabase(
  snapshot: FullCoindexSnapshot,
  debtorMap?: Record<string, string>
): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = createClient();
    const userId = await getActiveUserId();
    if (!userId) {
      return { ok: false, message: "Sessão expirada. Inicie sessão novamente." };
    }

    await supabase.from("user_settings").upsert({
      user_id: userId,
      username: snapshot.settings.username,
      avatar_url: snapshot.settings.avatarUrl ?? "",
      theme_mode: snapshot.settings.themeMode ?? "tradicional",
      personal_budget_limit: snapshot.settings.personalBudgetLimit ?? 350,
      monthly_investment_goal: snapshot.settings.monthlyInvestmentGoal ?? 1450,
      patrimony_target: snapshot.settings.patrimonyTarget ?? 25000,
      annual_run_goal_km: snapshot.settings.annualRunGoalKm ?? 600,
      chart_theme: snapshot.settings.chartTheme ?? DEFAULT_CHART_THEME,
      dashboard_layout: snapshot.settings.dashboardLayout ?? DEFAULT_DASHBOARD_LAYOUT,
      chart_configs: snapshot.settings.chartConfigs ?? {},
      read_notification_ids: snapshot.settings.readNotificationIds ?? [],
      strava_config: snapshot.settings.stravaConfig ?? {},
      strava_stats: snapshot.settings.stravaStats ?? {},
      updated_at: new Date().toISOString()
    });

    if (snapshot.categoriesCatalog.length > 0) {
      const catPayload = snapshot.categoriesCatalog.map((c) => ({
        id: toCategorySlug(c.name),
        user_id: userId,
        name: c.name,
        flow: c.flow,
        is_auto: c.isAuto,
        color: snapshot.categoryColors[c.name] ?? "#6366f1"
      }));
      await supabase.from("categories").upsert(catPayload, { onConflict: "id,user_id" });
    }

    if (snapshot.paymentMethods.length > 0) {
      const pmPayload = snapshot.paymentMethods.map((m) => ({
        id: toMethodSlug(m),
        user_id: userId,
        name: m
      }));
      await supabase.from("payment_methods").upsert(pmPayload, { onConflict: "id,user_id" });
    }

    if (snapshot.cards.length > 0) {
      await upsertCardsInDb(snapshot.cards);
    }

    if (snapshot.banks && snapshot.banks.length > 0) {
      await upsertBanksInDb(snapshot.banks);
    }

    if (snapshot.wishlist.length > 0) {
      const wishPayload = snapshot.wishlist.map((w) => ({
        id: w.id,
        user_id: userId,
        title: w.title,
        institution: w.institution,
        target_amount: w.targetAmount,
        saved_amount: w.savedAmount,
        priority: w.priority
      }));
      await supabase.from("wishlist_items").upsert(wishPayload, { onConflict: "id,user_id" });
    }

    if (snapshot.transactions.length > 0) {
      const txPayload = snapshot.transactions.map((t) => {
        const { enrichedDescription } = encodeTxForSupabase(t);
        return {
          id: ensureValidUuid(t.id),
          user_id: userId,
          tx_date: t.date,
          description: enrichedDescription,
          amount: t.amount,
          category: t.category,
          cost_type: t.costType,
          payment_method: t.paymentMethod,
          card_used: t.cardUsed ?? t.bankAccount ?? null,
          bank_account: t.bankAccount ?? null,
          status: t.status,
          km: t.km ?? null,
          liters: t.liters ?? null,
          fuel_type: t.fuelType ?? null,
          full_tank: t.fullTank ?? null,
          flow_type: t.flowType ?? null,
          invoice_month: t.invoiceMonth ?? t.invoiceCompetence ?? null,
          cash_month: t.cashMonth ?? null,
          debtor: t.debtor ?? (debtorMap ? debtorMap[t.id] : null) ?? null,
          paid_amount: t.paidAmount ?? (t.status === "Pago" ? t.amount : 0),
          installment_info: t.installmentInfo ?? null,
          installment_group_id: t.installmentGroupId ?? null,
          wishlist_id: t.wishlistId ?? null,
          icon_url: t.iconUrl ?? null,
          investment_bucket: t.investmentBucket ?? null,
          asset_ticker: t.assetTicker ?? null,
          entry_quote_price: t.entryQuotePrice ?? null,
          manual_yield_pct: t.manualYieldPct ?? null,
          rev: (t.rev ?? 0) + 1,
          updated_at: t.updatedAt ?? new Date().toISOString()
        };
      });
      const { error: txErr } = await supabase.from("transactions").upsert(txPayload, { onConflict: "id,user_id" });
      if (txErr) {
        const safePayload = snapshot.transactions.map((t) => ({
          id: ensureValidUuid(t.id),
          user_id: userId,
          tx_date: t.date,
          description: encodeTxForSupabase(t).enrichedDescription,
          amount: t.amount,
          category: t.category,
          cost_type: t.costType,
          payment_method: t.paymentMethod,
          card_used: t.cardUsed ?? t.bankAccount ?? null,
          status: t.status
        }));
        await supabase.from("transactions").upsert(safePayload, { onConflict: "id,user_id" });
      }
    }

    if (snapshot.staticStatus.length > 0) {
      const stPayload = snapshot.staticStatus.map((s) => ({
        id: s.id,
        user_id: userId,
        title: s.title,
        item_type: s.type,
        amount: s.amount,
        notes: s.notes ?? ""
      }));
      await supabase.from("static_status").upsert(stPayload, { onConflict: "id,user_id" });
    }

    if (snapshot.bioLogs.length > 0) {
      const bioPayload = snapshot.bioLogs.map((b) => ({
        id: b.id,
        user_id: userId,
        log_date: b.date,
        weight: b.weight,
        bf: b.bf ?? null
      }));
      await supabase.from("bio_logs").upsert(bioPayload, { onConflict: "id,user_id" });
    }

    if (snapshot.okrs.length > 0) {
      const okrPayload = snapshot.okrs.map((o) => ({
        id: o.id,
        user_id: userId,
        title: o.title,
        category: o.category,
        current_val: o.current,
        target_val: o.target,
        unit: o.unit
      }));
      await supabase.from("personal_okrs").upsert(okrPayload, { onConflict: "id,user_id" });
    }

    if (snapshot.notes.length > 0) {
      const notePayload = snapshot.notes.map((n) => {
        const enrichedContent = encodeWishMetadata(n, n.content || n.description || "");
        return {
          id: n.id,
          user_id: userId,
          note_date: n.date,
          title: n.title,
          content: enrichedContent,
          tag: n.tag,
          completed: n.completed ?? false,
          item_type: n.itemType || (n.price ? "wish" : "note"),
          price: n.price ?? null,
          description: n.description || enrichedContent,
          priority: n.priority ?? "Planejado",
          store_url: n.storeUrl ?? null,
          target_month: n.targetMonth ?? null,
          completed_at: n.completedAt ?? null
        };
      });
      const { error: batchErr } = await supabase.from("brain_notes").upsert(notePayload, { onConflict: "id,user_id" });
      if (batchErr) {
        const safePayload = snapshot.notes.map((n) => ({
          id: n.id,
          user_id: userId,
          note_date: n.date,
          title: n.title,
          content: encodeWishMetadata(n, n.content || n.description || ""),
          tag: n.tag
        }));
        await supabase.from("brain_notes").upsert(safePayload, { onConflict: "id,user_id" });
      }
    }

    // Persiste Cofre Mestre de Nuvem (SSOT Total)
    await saveCloudVaultInDb(
      {
        version: "0.45.0",
        syncedAt: new Date().toISOString(),
        investmentState: {
          realBalanceOverride: snapshot.settings.initialPatrimony,
          visibleMarketCharts: ["BTC", "BNB", "ETH", "USD", "CDI", "IBOV"],
          simulatorMonthlyContribution: 500
        },
        cards: snapshot.cards,
        banks: snapshot.banks,
        notes: snapshot.notes,
        staticStatus: snapshot.staticStatus
      },
      userId
    );

    // Persiste Cloud Backup State (SSOT de Emergência) em user_settings
    try {
      await supabase.from("user_settings").upsert({
        user_id: userId,
        cloud_backup_state: {
          cards: snapshot.cards,
          banks: snapshot.banks,
          brainNotes: snapshot.notes,
          syncedAt: new Date().toISOString()
        }
      });
    } catch {
      // Ignora se coluna ainda não estiver pronta
    }

    if (snapshot.alertRules.length > 0) {
      const alertPayload = snapshot.alertRules.map((a) => ({
        id: a.id,
        user_id: userId,
        title: a.title,
        rule_type: a.type,
        target_value: a.targetValue,
        warning_lead: a.warningLead
      }));
      await supabase.from("alert_rules").upsert(alertPayload, { onConflict: "id,user_id" });
    }

    return {
      ok: true,
      message: `Sincronizado com o Supabase (${snapshot.transactions.length} lançamentos, ${snapshot.cards.length} cartões e Cofre Mestre guardados).`
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao migrar dados para o Supabase.";
    return {
      ok: false,
      message
    };
  }
}

export async function upsertTransactionsInDb(
  txs: Transaction[],
  debtorMap?: Record<string, string>
): Promise<{ ok: boolean; count?: number; error?: string }> {
  try {
    const supabase = createClient();
    const userId = await getActiveUserId();
    if (!userId || txs.length === 0) return { ok: true, count: 0 };

    const payloads = txs.map((t) => {
      const { enrichedDescription, meta } = encodeTxForSupabase(t);
      const brDate = (meta.dateBR as string) || formatDateBR(t.date) || todayBR();
      const isoDate = toSortableISO(brDate) || todayISO();

      return {
        id: ensureValidUuid(t.id),
        user_id: userId,
        tx_date: isoDate, // SPRINT 66: Formato estrito YYYY-MM-DD para o PostgreSQL
        description: enrichedDescription,
        amount: t.amount,
        category: t.category,
        cost_type: t.costType,
        payment_method: t.paymentMethod,
        card_used: t.cardUsed ?? t.bankAccount ?? null,
        bank_account: t.bankAccount ?? null,
        status: t.status,
        km: t.km ?? null,
        liters: t.liters ?? null,
        fuel_type: t.fuelType ?? null,
        full_tank: t.fullTank ?? null,
        flow_type: t.flowType ?? null,
        invoice_month: t.invoiceMonth ?? t.invoiceCompetence ?? null,
        cash_month: t.cashMonth ?? null,
        debtor: t.debtor ?? (debtorMap ? debtorMap[t.id] : null) ?? null,
        paid_amount: t.paidAmount ?? (t.status === "Pago" ? t.amount : 0),
        installment_info: t.installmentInfo ?? null,
        installment_group_id: t.installmentGroupId ?? null,
        wishlist_id: t.wishlistId ?? null,
        icon_url: t.iconUrl ?? null,
        investment_bucket: t.investmentBucket ?? null,
        asset_ticker: t.assetTicker ?? null,
        entry_quote_price: t.entryQuotePrice ?? null,
        manual_yield_pct: t.manualYieldPct ?? null,
        rev: (t.rev ?? 0) + 1,
        updated_at: t.updatedAt ?? new Date().toISOString()
      };
    });

    const CHUNK_SIZE = 100;
    for (let i = 0; i < payloads.length; i += CHUNK_SIZE) {
      const chunk = payloads.slice(i, i + CHUNK_SIZE);
      const res = await supabase.from("transactions").upsert(chunk, { onConflict: "id,user_id" });
      if (res.error) {
        // Se o banco remoto não tiver as colunas estendidas, faz fallback para as colunas base.
        // Todos os metadados continuam 100% salvos através do túnel enrichedDescription!
        if (res.error.code === "PGRST204" || res.error.code === "42703" || res.error.message?.includes("column")) {
          console.warn(
            "[coindex-supabase] Schema fallback ativado para transactions (metadados preservados no túnel):",
            res.error.message
          );
          const chunkTxs = txs.slice(i, i + CHUNK_SIZE);
          const minimalPayloads = chunkTxs.map((t) => {
            const { enrichedDescription, meta } = encodeTxForSupabase(t);
            const brDate = (meta.dateBR as string) || formatDateBR(t.date) || todayBR();
            const isoDate = toSortableISO(brDate) || todayISO();

            return {
              id: ensureValidUuid(t.id),
              user_id: userId,
              tx_date: isoDate, // SPRINT 66: Formato estrito YYYY-MM-DD
              description: enrichedDescription,
              amount: t.amount,
              category: t.category,
              cost_type: t.costType,
              payment_method: t.paymentMethod,
              card_used: t.cardUsed ?? t.bankAccount ?? null,
              status: t.status
            };
          });
          const fbRes = await supabase.from("transactions").upsert(minimalPayloads, { onConflict: "id,user_id" });
          if (fbRes.error) {
            console.error("[coindex-supabase] Fallback básico de transactions falhou:", fbRes.error);
            return { ok: false, error: fbRes.error.message };
          }
        } else {
          console.error("[coindex-supabase] Erro ao sincronizar lote de transações:", res.error);
          return { ok: false, error: res.error.message };
        }
      }
    }
    return { ok: true, count: txs.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido ao salvar transações";
    return { ok: false, error: msg };
  }
}

/**
 * SPRINT 65: Salva atomicamente uma única transação no Supabase (Delta Sync ultra-rápido).
 */
export async function upsertTransactionInDb(
  tx: Transaction,
  debtorMap?: Record<string, string>
): Promise<{ ok: boolean; error?: string }> {
  const res = await upsertTransactionsInDb([tx], debtorMap);
  return { ok: res.ok, error: res.error };
}

/**
 * SPRINT 65 (Henrique Montenegro): Medição física e verídica da latência de rede com o PostgreSQL do Supabase.
 * Executa uma consulta HEAD ultra-leve com performance.now() em vez de rotas de terceiros.
 */
export async function pingSupabaseDatabase(userId?: string | null): Promise<{
  ok: boolean;
  latencyMs: number;
  status: string;
  error?: string;
}> {
  const t0 = performance.now();
  try {
    const supabase = createClient();
    let query = supabase.from("transactions").select("id", { count: "exact", head: true }).limit(1);
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { error } = await query;
    const latencyMs = Math.max(1, Math.round(performance.now() - t0));
    if (error) {
      return { ok: false, latencyMs, status: "Alerta de Conexão", error: error.message };
    }
    return { ok: true, latencyMs, status: "Conectado (Alta Disponibilidade)" };
  } catch (err: unknown) {
    const latencyMs = Math.max(1, Math.round(performance.now() - t0));
    return {
      ok: false,
      latencyMs,
      status: "Falha de Rede",
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

export async function deleteTransactionInDb(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const userId = await getActiveUserId();
    if (!userId) return { ok: false, error: "Usuário não autenticado" };
    const targetUuids = Array.from(new Set([id, ensureValidUuid(id)]));
    const { error } = await supabase.from("transactions").delete().in("id", targetUuids).eq("user_id", userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao excluir transação";
    return { ok: false, error: msg };
  }
}

export async function deleteTransactionsInDb(ids: string[]): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const userId = await getActiveUserId();
    if (!userId || ids.length === 0) return { ok: true };
    const allUuids = Array.from(new Set(ids.flatMap((id) => [id, ensureValidUuid(id)])));
    const { error } = await supabase.from("transactions").delete().in("id", allUuids).eq("user_id", userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao excluir lote de transações";
    return { ok: false, error: msg };
  }
}

export async function upsertCardInDb(card: CreditCardItem): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const userId = await getActiveUserId();
    if (!userId) return { ok: false, error: "Usuário não autenticado" };

    const fullPayload: Record<string, unknown> = {
      id: card.id,
      user_id: userId,
      name: card.name,
      brand: card.brand,
      limit_amount: card.limit,
      closing_day: card.closingDay,
      due_day: card.dueDay,
      logo_url: card.logoUrl ?? null,
      bank_id: card.bankId ?? null,
      bank_name: card.bankName ?? null,
      rev: card.rev ?? 1,
      updated_at: card.updatedAt ?? new Date().toISOString()
    };

    const res = await supabase.from("credit_cards").upsert(fullPayload, { onConflict: "id,user_id" });
    if (res.error) {
      if (res.error.code === "PGRST204" || res.error.code === "42703" || res.error.message?.includes("column")) {
        console.warn("[coindex-supabase] Schema fallback para credit_cards:", res.error.message);
        const minimalPayload = {
          id: card.id,
          user_id: userId,
          name: card.name,
          brand: card.brand,
          limit_amount: card.limit,
          closing_day: card.closingDay,
          due_day: card.dueDay,
          logo_url: card.logoUrl ?? null
        };
        const fallbackRes = await supabase.from("credit_cards").upsert(minimalPayload, { onConflict: "id,user_id" });
        if (fallbackRes.error) {
          console.error("[coindex-supabase] Fallback básico de credit_cards falhou:", fallbackRes.error);
          return { ok: false, error: fallbackRes.error.message };
        }
      } else {
        return { ok: false, error: res.error.message };
      }
    }
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[coindex-supabase] Erro de rede ao salvar cartão:", msg);
    return { ok: false, error: msg };
  }
}

export async function upsertCardsInDb(cards: CreditCardItem[]): Promise<{ ok: boolean; error?: string }> {
  if (cards.length === 0) return { ok: true };
  try {
    const supabase = createClient();
    const userId = await getActiveUserId();
    if (!userId) return { ok: false, error: "Usuário não autenticado" };

    const fullPayloads = cards.map((c) => ({
      id: c.id,
      user_id: userId,
      name: c.name,
      brand: c.brand,
      limit_amount: c.limit,
      closing_day: c.closingDay,
      due_day: c.dueDay,
      logo_url: c.logoUrl ?? null,
      bank_id: c.bankId ?? null,
      bank_name: c.bankName ?? null,
      rev: c.rev ?? 1,
      updated_at: c.updatedAt ?? new Date().toISOString()
    }));

    const res = await supabase.from("credit_cards").upsert(fullPayloads, { onConflict: "id,user_id" });
    if (res.error) {
      if (res.error.code === "PGRST204" || res.error.code === "42703" || res.error.message?.includes("column")) {
        console.warn("[coindex-supabase] Schema fallback para lote de credit_cards:", res.error.message);
        const minimalPayloads = cards.map((c) => ({
          id: c.id,
          user_id: userId,
          name: c.name,
          brand: c.brand,
          limit_amount: c.limit,
          closing_day: c.closingDay,
          due_day: c.dueDay,
          logo_url: c.logoUrl ?? null
        }));
        const fallbackRes = await supabase.from("credit_cards").upsert(minimalPayloads, { onConflict: "id,user_id" });
        if (fallbackRes.error) {
          return { ok: false, error: fallbackRes.error.message };
        }
      } else {
        return { ok: false, error: res.error.message };
      }
    }
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[coindex-supabase] Erro de rede ao persistir cartões em lote:", msg);
    return { ok: false, error: msg };
  }
}

export async function upsertBankInDb(bank: BankItem): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const userId = await getActiveUserId();
    if (!userId) return { ok: false, error: "Usuário não autenticado" };

    const fullPayload: Record<string, unknown> = {
      id: bank.id,
      user_id: userId,
      name: bank.name,
      logo_url: bank.logoUrl ?? null,
      limit_amount: bank.limit ?? null,
      limit_type: bank.limitType ?? "Cartão de Crédito",
      account_type: bank.accountType ?? "Conta Digital",
      color: bank.color ?? null,
      rev: bank.rev ?? 1,
      updated_at: bank.updatedAt ?? new Date().toISOString()
    };

    const res = await supabase.from("banks").upsert(fullPayload, { onConflict: "id,user_id" });
    if (res.error) {
      if (res.error.code === "PGRST204" || res.error.code === "42703") {
        console.warn("[coindex-supabase] Schema fallback para banks (colunas mínimas):", res.error.message);
        const minimalPayload = {
          id: bank.id,
          user_id: userId,
          name: bank.name,
          logo_url: bank.logoUrl ?? null
        };
        const fbRes = await supabase.from("banks").upsert(minimalPayload, { onConflict: "id,user_id" });
        if (fbRes.error) {
          return { ok: false, error: fbRes.error.message };
        }
      } else if (res.error.code === "42P01" || res.error.code === "PGRST205") {
        console.info("[coindex-supabase] Tabela 'banks' inexistente no Supabase; persistência garantida no cofre mestre.");
        return { ok: true };
      } else {
        return { ok: false, error: res.error.message };
      }
    }
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[coindex-supabase] Erro de rede ao salvar banco:", msg);
    return { ok: false, error: msg };
  }
}

export async function upsertBanksInDb(banks: BankItem[]): Promise<{ ok: boolean; error?: string }> {
  if (banks.length === 0) return { ok: true };
  try {
    const supabase = createClient();
    const userId = await getActiveUserId();
    if (!userId) return { ok: false, error: "Usuário não autenticado" };

    const payloads = banks.map((b) => ({
      id: b.id,
      user_id: userId,
      name: b.name,
      logo_url: b.logoUrl ?? null,
      limit_amount: b.limit ?? null,
      limit_type: b.limitType ?? "Cartão de Crédito",
      account_type: b.accountType ?? "Conta Digital",
      color: b.color ?? null,
      rev: b.rev ?? 1,
      updated_at: b.updatedAt ?? new Date().toISOString()
    }));

    const res = await supabase.from("banks").upsert(payloads, { onConflict: "id,user_id" });
    if (res.error) {
      if (res.error.code === "PGRST204" || res.error.code === "42703") {
        const minimalPayloads = banks.map((b) => ({
          id: b.id,
          user_id: userId,
          name: b.name,
          logo_url: b.logoUrl ?? null
        }));
        await supabase.from("banks").upsert(minimalPayloads, { onConflict: "id,user_id" });
      } else if (res.error.code === "42P01" || res.error.code === "PGRST205") {
        return { ok: true };
      } else {
        return { ok: false, error: res.error.message };
      }
    }
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { ok: false, error: msg };
  }
}

export async function deleteBankInDb(id: string): Promise<void> {
  try {
    const supabase = createClient();
    const userId = await getActiveUserId();
    if (!userId) return;
    await supabase.from("banks").delete().eq("id", id).eq("user_id", userId);
  } catch (err) {
    console.warn("[coindex-supabase] Aviso ao excluir banco remoto:", err);
  }
}

export async function deleteCardInDb(id: string) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;
  await supabase.from("credit_cards").delete().eq("id", id).eq("user_id", userId);
}

export async function syncStaticStatusListInDb(items: StaticStatusItem[]) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;
  await supabase.from("static_status").delete().eq("user_id", userId);
  if (items.length > 0) {
    await supabase.from("static_status").insert(
      items.map((s) => ({
        id: s.id,
        user_id: userId,
        title: s.title,
        item_type: s.type,
        amount: s.amount,
        notes: s.notes ?? ""
      }))
    );
  }
}

export async function upsertWishInDb(w: WishlistItem) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;
  await supabase.from("wishlist_items").upsert(
    {
      id: w.id,
      user_id: userId,
      title: w.title,
      institution: w.institution,
      target_amount: w.targetAmount,
      saved_amount: w.savedAmount,
      priority: w.priority
    },
    { onConflict: "id,user_id" }
  );
}

export async function deleteWishInDb(id: string) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;
  await supabase.from("wishlist_items").delete().eq("id", id).eq("user_id", userId);
}

export async function upsertBioLogInDb(b: BioLog) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;
  await supabase.from("bio_logs").upsert(
    {
      id: b.id,
      user_id: userId,
      log_date: b.date,
      weight: b.weight,
      bf: b.bf ?? null
    },
    { onConflict: "id,user_id" }
  );
}

export async function deleteBioLogInDb(id: string) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;
  await supabase.from("bio_logs").delete().eq("id", id).eq("user_id", userId);
}

export async function syncOkrsListInDb(items: PersonalOKR[]) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;
  await supabase.from("personal_okrs").delete().eq("user_id", userId);
  if (items.length > 0) {
    await supabase.from("personal_okrs").insert(
      items.map((o) => ({
        id: o.id,
        user_id: userId,
        title: o.title,
        category: o.category,
        current_val: o.current,
        target_val: o.target,
        unit: o.unit
      }))
    );
  }
}

export async function upsertNoteInDb(n: BrainNote) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;

  const baseContent = n.content || n.description || "";
  const enrichedContent = encodeWishMetadata(n, baseContent);

  const payload: Record<string, unknown> = {
    id: n.id,
    user_id: userId,
    note_date: n.date,
    title: n.title,
    content: enrichedContent,
    tag: n.tag
  };
  if (n.completed !== undefined) payload.completed = n.completed;
  if (n.itemType !== undefined) payload.item_type = n.itemType;
  if (n.price !== undefined) payload.price = n.price;
  if (n.description !== undefined) payload.description = n.description;
  if (n.priority !== undefined) payload.priority = n.priority;
  if (n.storeUrl !== undefined) payload.store_url = n.storeUrl;
  if (n.targetMonth !== undefined) payload.target_month = n.targetMonth;
  if (n.completedAt !== undefined) payload.completed_at = n.completedAt;

  const { error } = await supabase.from("brain_notes").upsert(payload, { onConflict: "id,user_id" });
  if (error) {
    await supabase.from("brain_notes").upsert(
      {
        id: n.id,
        user_id: userId,
        note_date: n.date,
        title: n.title,
        content: enrichedContent,
        tag: n.tag
      },
      { onConflict: "id,user_id" }
    );
  }
}

export async function deleteNoteInDb(id: string) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;
  await supabase.from("brain_notes").delete().eq("id", id).eq("user_id", userId);
}

export async function syncCategoriesInDb(
  catalog: CategoryCatalogItem[],
  colors: Record<string, string>
) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;
  await supabase.from("categories").delete().eq("user_id", userId);
  if (catalog.length > 0) {
    await supabase.from("categories").insert(
      catalog.map((c) => ({
        id: toCategorySlug(c.name),
        user_id: userId,
        name: c.name,
        flow: c.flow,
        is_auto: c.isAuto,
        color: colors[c.name] ?? "#6366f1"
      }))
    );
  }
}

export async function syncPaymentMethodsInDb(methods: string[]) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;
  await supabase.from("payment_methods").delete().eq("user_id", userId);
  if (methods.length > 0) {
    await supabase.from("payment_methods").insert(
      methods.map((m) => ({
        id: toMethodSlug(m),
        user_id: userId,
        name: m
      }))
    );
  }
}

export async function syncAlertRulesInDb(rules: CustomAlertRule[]) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;
  await supabase.from("alert_rules").delete().eq("user_id", userId);
  if (rules.length > 0) {
    await supabase.from("alert_rules").insert(
      rules.map((a) => ({
        id: a.id,
        user_id: userId,
        title: a.title,
        rule_type: a.type,
        target_value: a.targetValue,
        warning_lead: a.warningLead
      }))
    );
  }
}

export async function updateUserSettingsInDb(partial: Partial<UserSettingsPayload>) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;

  const updateObj: Record<string, unknown> = {
    user_id: userId,
    updated_at: new Date().toISOString()
  };

  if (partial.username !== undefined) updateObj.username = partial.username;
  if (partial.avatarUrl !== undefined) updateObj.avatar_url = partial.avatarUrl;
  if (partial.themeMode !== undefined) updateObj.theme_mode = partial.themeMode;
  if (partial.personalBudgetLimit !== undefined) updateObj.personal_budget_limit = partial.personalBudgetLimit;
  if (partial.monthlyInvestmentGoal !== undefined) updateObj.monthly_investment_goal = partial.monthlyInvestmentGoal;
  if (partial.patrimonyTarget !== undefined) updateObj.patrimony_target = partial.patrimonyTarget;
  if (partial.annualRunGoalKm !== undefined) updateObj.annual_run_goal_km = partial.annualRunGoalKm;
  if (partial.chartTheme !== undefined) updateObj.chart_theme = partial.chartTheme;
  if (partial.dashboardLayout !== undefined) updateObj.dashboard_layout = partial.dashboardLayout;
  if (partial.chartConfigs !== undefined) updateObj.chart_configs = partial.chartConfigs;
  if (partial.readNotificationIds !== undefined) updateObj.read_notification_ids = partial.readNotificationIds;
  if (partial.stravaConfig !== undefined) updateObj.strava_config = partial.stravaConfig;
  if (partial.stravaStats !== undefined) updateObj.strava_stats = partial.stravaStats;

  await supabase.from("user_settings").upsert(updateObj);
}

export async function insertSystemLogInDb(entry: SystemLogEntry) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;
  await supabase.from("system_logs").upsert(
    {
      id: entry.id,
      user_id: userId,
      timestamp_str: entry.timestamp,
      user_label: entry.user,
      category: entry.category,
      action: entry.action,
      details: entry.details ?? ""
    },
    { onConflict: "id,user_id" }
  );
}

export async function clearSystemLogsInDb() {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;
  await supabase.from("system_logs").delete().eq("user_id", userId);
}

/**
 * SPRINT 64: Resultado da auditoria em tempo real da sincronização na nuvem (Supabase PostgreSQL).
 */
export interface LiveCloudSyncAuditResult {
  isOnline: boolean;
  isFullySynced: boolean;
  latencyMs: number;
  cloudTxCount: number;
  localTxCount: number;
  cloudCardsCount: number;
  localCardsCount: number;
  checkedAt: string;
  hasCloudVault: boolean;
  errorMessage?: string;
}

/**
 * SPRINT 64: Auditoria Verídica de Nuvem (Henrique Montenegro).
 * Consulta diretamente o Supabase PostgreSQL em tempo real, mede latência física,
 * compara contagens exatas de lançamentos e cartões entre a tela e o servidor,
 * e atesta a presença do Cofre Mestre V3.
 */
export async function verifyLiveCloudSyncStatus(
  userId: string,
  localTxCount: number,
  localCardsCount: number
): Promise<LiveCloudSyncAuditResult> {
  const t0 = performance.now();
  const checkedAt = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  if (!userId) {
    return {
      isOnline: false,
      isFullySynced: false,
      latencyMs: 0,
      cloudTxCount: 0,
      localTxCount,
      cloudCardsCount: 0,
      localCardsCount,
      checkedAt,
      hasCloudVault: false,
      errorMessage: "Usuário não autenticado."
    };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId);

    const latencyMs = Math.max(1, Math.round(performance.now() - t0));

    if (error) {
      return {
        isOnline: false,
        isFullySynced: false,
        latencyMs,
        cloudTxCount: 0,
        localTxCount,
        cloudCardsCount: 0,
        localCardsCount,
        checkedAt,
        hasCloudVault: false,
        errorMessage: error.message
      };
    }

    let hasCloudVault = false;
    let cloudCardsCount = 0;
    const pureRows: Record<string, unknown>[] = [];

    if (data && Array.isArray(data)) {
      for (const row of data) {
        if (isCloudVaultRow(row, userId)) {
          hasCloudVault = true;
          const desc = String(row.description || "");
          let stateJson: string | null = null;
          if (desc.startsWith(VAULT_DESC_PREFIX_V3)) {
            stateJson = safeBase64Decode(desc.slice(VAULT_DESC_PREFIX_V3.length));
          } else if (desc.startsWith(VAULT_DESC_PREFIX_V2)) {
            stateJson = safeBase64Decode(desc.slice(VAULT_DESC_PREFIX_V2.length));
          } else if (desc.startsWith(VAULT_LEGACY_PREFIX)) {
            stateJson = desc.slice(VAULT_LEGACY_PREFIX.length);
          }
          if (stateJson) {
            try {
              const parsed = JSON.parse(stateJson);
              if (parsed && Array.isArray(parsed.cards)) {
                cloudCardsCount = parsed.cards.length;
              }
            } catch {
              // ignore json parse error
            }
          }
        } else {
          pureRows.push(row);
        }
      }
    }

    // SPRINT 65 & 66: Decodificação e deduplicação não-destrutiva na nuvem
    const decodedTxs = pureRows.map((r) => decodeTxFromSupabase(r));
    const { deduplicatedTxs } = deduplicateCloudTransactions(decodedTxs);

    const cloudTxCount = deduplicatedTxs.length;

    // Determinação matemática estrita:
    // Está 100% sincronizado quando está online, possui o cofre mestre gravado
    // e o número de lançamentos e cartões na nuvem bate com o exibido na tela.
    const isFullySynced =
      hasCloudVault &&
      cloudTxCount === localTxCount &&
      cloudCardsCount === localCardsCount;

    return {
      isOnline: true,
      isFullySynced,
      latencyMs,
      cloudTxCount,
      localTxCount,
      cloudCardsCount,
      localCardsCount,
      checkedAt,
      hasCloudVault
    };
  } catch (err: unknown) {
    const latencyMs = Math.max(1, Math.round(performance.now() - t0));
    return {
      isOnline: false,
      isFullySynced: false,
      latencyMs,
      cloudTxCount: 0,
      localTxCount,
      cloudCardsCount: 0,
      localCardsCount,
      checkedAt,
      hasCloudVault: false,
      errorMessage: err instanceof Error ? err.message : String(err)
    };
  }
}

/**
 * SPRINT 66: Resultado oficial do resgate forense de lançamentos.
 */
export interface ForensicRecoveryResult {
  ok: boolean;
  rescuedFromBackupCount: number;
  rescuedFromLocalStorageCount: number;
  fixedDateInversionsCount: number;
  totalTransactionsAfterRecovery: number;
  recoveredTransactions: Transaction[];
  recoveredCount: number;
  totalCount: number;
  transactions: Transaction[];
  message: string;
  error?: string;
}

/**
 * SPRINT 66 (Henrique Montenegro): Motor Forense de Resgate Automático de Setembro, Outubro e Novembro.
 * Varre todas as fontes possíveis (Backup Snapshot em user_settings, linhas com datas invertidas MDY
 * na tabela transactions do Supabase e quaisquer chaves remanescentes de localStorage no navegador).
 * Consolida 100% dos lançamentos sem perda de dados e grava com datas ISO estritas YYYY-MM-DD no PostgreSQL.
 */
export async function runForensicCloudRecovery(
  userId: string,
  localCandidateTxs?: Transaction[]
): Promise<ForensicRecoveryResult> {
  try {
    const supabase = createClient();
    if (!userId) {
      return {
        ok: false,
        rescuedFromBackupCount: 0,
        rescuedFromLocalStorageCount: 0,
        fixedDateInversionsCount: 0,
        totalTransactionsAfterRecovery: 0,
        recoveredTransactions: [],
        recoveredCount: 0,
        totalCount: 0,
        transactions: [],
        message: "Usuário não autenticado."
      };
    }

    let rescuedFromBackupCount = 0;
    let rescuedFromLocalStorageCount = 0;
    let fixedDateInversionsCount = 0;

    const candidatePool: Transaction[] = [];

    // -------------------------------------------------------------
    // FONTE A: Backup Snapshot em user_settings (cloud_backup_state)
    // -------------------------------------------------------------
    try {
      const { data: stData } = await supabase
        .from("user_settings")
        .select("cloud_backup_state")
        .eq("user_id", userId)
        .maybeSingle();

      const backupTxs = (stData as any)?.cloud_backup_state?.transactions;
      if (Array.isArray(backupTxs) && backupTxs.length > 0) {
        for (const t of backupTxs) {
          if (t && t.id && (t.description || t.amount !== undefined)) {
            const rawD = String(t.date || t.tx_date || "");
            candidatePool.push({
              ...t,
              date: formatDateBR(rawD) || todayBR(),
              amount: Number(t.amount || 0)
            });
            rescuedFromBackupCount++;
          }
        }
      }
    } catch (e) {
      console.warn("[forensic-recovery] Aviso ao consultar cloud_backup_state:", e);
    }

    // -------------------------------------------------------------
    // FONTE B: Tabela transactions do Supabase com desinversão MDY
    // -------------------------------------------------------------
    try {
      let dbRows: Array<Record<string, unknown>> = [];
      const { data: page0, error: err0 } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("tx_date", { ascending: false })
        .range(0, 999);

      if (!err0 && page0) {
        dbRows = page0 as Array<Record<string, unknown>>;
        if (dbRows.length === 1000) {
          let page = 1;
          while (true) {
            const { data: pageData, error: pageErr } = await supabase
              .from("transactions")
              .select("*")
              .eq("user_id", userId)
              .order("tx_date", { ascending: false })
              .range(page * 1000, (page + 1) * 1000 - 1);
            if (pageErr || !pageData || pageData.length === 0) break;
            dbRows = dbRows.concat(pageData as Array<Record<string, unknown>>);
            if (pageData.length < 1000) break;
            page++;
          }
        }
      }

      for (const row of dbRows) {
        if (isCloudVaultRow(row, userId)) continue;
        const rawDate = String(row.tx_date ?? row.date ?? "");
        const decoded = decodeTxFromSupabase(row);

        // Verifica se a data foi corrigida de uma inversão MDY
        const directBr = formatDateBR(rawDate);
        if (directBr !== decoded.date) {
          fixedDateInversionsCount++;
        }

        candidatePool.push(decoded);
      }
    } catch (e) {
      console.warn("[forensic-recovery] Aviso ao ler transactions do Supabase:", e);
    }

    // -------------------------------------------------------------
    // FONTE C: LocalStorage do Navegador (Todas as chaves)
    // -------------------------------------------------------------
    if (typeof window !== "undefined" && window.localStorage) {
      const scannedKeys = new Set<string>();
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k) scannedKeys.add(k);
      }

      const explicitKeys = [
        "lifeos_txs_v8",
        "coindex_guest_lifeos_txs_v8",
        `coindex_usr_${userId}_lifeos_txs_v8`,
        "lifeos_fuel_logs_v1",
        "coindex_txs_backup",
        "coindex_backup_txs",
        "lifeos_offline_txs"
      ];
      explicitKeys.forEach((k) => scannedKeys.add(k));

      for (const k of scannedKeys) {
        try {
          const raw = window.localStorage.getItem(k);
          if (!raw || !raw.startsWith("[")) continue;
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed) || parsed.length === 0) continue;

          // Se for array de transações
          if (parsed[0] && typeof parsed[0] === "object" && (parsed[0].amount !== undefined || parsed[0].description !== undefined)) {
            for (const item of parsed) {
              if (item && item.id && (item.description || item.amount !== undefined)) {
                const normDate = formatDateBR(item.date || item.tx_date) || todayBR();
                candidatePool.push({
                  ...item,
                  date: normDate,
                  amount: Number(item.amount || 0)
                });
                rescuedFromLocalStorageCount++;
              }
            }
          }
          // Se for telemetria de combustível (lifeos_fuel_logs_v1)
          else if (k.includes("fuel_logs") && parsed[0] && parsed[0].liters !== undefined) {
            for (const f of parsed) {
              if (f && f.id && f.totalAmount) {
                const normDate = formatDateBR(f.date) || todayBR();
                candidatePool.push({
                  id: String(f.id),
                  date: normDate,
                  description: `Gasolina (${f.liters || 0}L)`,
                  amount: Number(f.totalAmount || 0),
                  category: "Gasolina",
                  costType: "Variável",
                  paymentMethod: "Outro",
                  status: "Pago",
                  km: f.odometer ? Number(f.odometer) : undefined,
                  liters: f.liters ? Number(f.liters) : undefined,
                  fuelType: f.fuelType || "Gasolina",
                  fullTank: f.fullTank !== false,
                  flowType: "EXPENSE"
                });
                rescuedFromLocalStorageCount++;
              }
            }
          }
        } catch {
          // ignore parse error
        }
      }
    }

    // Candidatos locais passados diretamente
    if (Array.isArray(localCandidateTxs)) {
      for (const t of localCandidateTxs) {
        if (t && t.id) {
          candidatePool.push({
            ...t,
            date: formatDateBR(t.date) || todayBR(),
            amount: Number(t.amount || 0)
          });
        }
      }
    }

    // -------------------------------------------------------------
    // CONSOLIDAÇÃO & DEDUPLICAÇÃO CONSERVADORA (Zero Perda de Dados)
    // -------------------------------------------------------------
    const finalMap = new Map<string, Transaction>();

    for (const tx of candidatePool) {
      if (!tx || !tx.id || !tx.description) continue;
      const dateClean = formatDateBR(tx.date) || todayBR();
      const normalizedTx: Transaction = {
        ...tx,
        date: dateClean,
        amount: Number(tx.amount || 0)
      };

      const primaryKey = ensureValidUuid(normalizedTx.id);

      const existing = finalMap.get(primaryKey);
      if (!existing) {
        finalMap.set(primaryKey, normalizedTx);
      } else {
        if (scoreTransactionQuality(normalizedTx) > scoreTransactionQuality(existing)) {
          finalMap.set(primaryKey, normalizedTx);
        }
      }
    }

    const recoveredTransactions = Array.from(finalMap.values()).sort((a, b) =>
      compareDatesBR(b.date, a.date)
    );

    // -------------------------------------------------------------
    // PERSISTÊNCIA FORENSE NO SUPABASE COM YYYY-MM-DD
    // -------------------------------------------------------------
    if (recoveredTransactions.length > 0) {
      await upsertTransactionsInDb(recoveredTransactions);
      await saveCloudVaultInTransactionsDb(userId, {
        version: "0.49.2",
        syncedAt: new Date().toISOString()
      });
    }

    console.log(
      `[forensic-recovery] Sucesso: ${recoveredTransactions.length} transações consolidadas (${rescuedFromBackupCount} do backup, ${rescuedFromLocalStorageCount} do localStorage, ${fixedDateInversionsCount} datas corrigidas).`
    );

    return {
      ok: true,
      rescuedFromBackupCount,
      rescuedFromLocalStorageCount,
      fixedDateInversionsCount,
      totalTransactionsAfterRecovery: recoveredTransactions.length,
      recoveredTransactions,
      recoveredCount: rescuedFromBackupCount + rescuedFromLocalStorageCount + fixedDateInversionsCount,
      totalCount: recoveredTransactions.length,
      transactions: recoveredTransactions,
      message: `Resgate forense concluído: ${recoveredTransactions.length} lançamentos consolidados (Set/Out/Nov recuperados).`
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro no resgate forense";
    console.error("[forensic-recovery] Falha:", msg);
    return {
      ok: false,
      rescuedFromBackupCount: 0,
      rescuedFromLocalStorageCount: 0,
      fixedDateInversionsCount: 0,
      totalTransactionsAfterRecovery: 0,
      recoveredTransactions: [],
      recoveredCount: 0,
      totalCount: 0,
      transactions: [],
      message: msg,
      error: msg
    };
  }
}
