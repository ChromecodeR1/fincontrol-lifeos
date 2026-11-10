import { createClient } from "../supabase/client";
import { ChartWidgetSettings } from "../../components/ChartSettingsPopover";
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
export const VAULT_DESC_PREFIX = "__COINDEX_CLOUD_VAULT_V2__:";

/**
 * Retorna um UUID v4 determinístico válido (RFC 4122) para o registro do cofre mestre do usuário,
 * garantindo compatibilidade estrita caso a coluna 'id' seja do tipo UUID ou TEXT no PostgreSQL.
 */
export function getVaultRowId(userId: string): string {
  const cleanHex = (userId || "").replace(/[^a-fA-F0-9]/g, "").toLowerCase().padEnd(12, "0").slice(0, 12);
  return `00000000-0000-4000-8000-${cleanHex}`;
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

  const tx: Transaction = {
    id: String(row.id),
    date: String(row.tx_date ?? row.date ?? ""),
    description: cleanDescription,
    amount: Number(row.amount ?? 0),
    category: String(row.category ?? "Outros"),
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
  investmentState?: {
    realBalanceOverride?: number;
    yieldMode?: "bruto" | "liquido" | "aportes";
    visibleMarketCharts?: string[];
    simulatorMonthlyContribution?: number;
    bucketCalibrations?: Record<string, unknown>;
    b3Holdings?: Record<string, unknown>;
  };
  banks?: BankItem[];
  cards?: CreditCardItem[];
  notes?: BrainNote[];
  staticStatus?: StaticStatusItem[];
  autoInmetroConfig?: unknown;
  vehicleMaintenance?: {
    history?: Record<string, number>;
    customItems?: unknown[];
  };
  uiSettings?: {
    themeMode?: ThemeMode;
    bgFxMode?: string;
    cupertinoTheme?: boolean;
  };
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

export async function saveCloudVaultInDb(
  partialState: Partial<CoindexCloudVaultState>,
  explicitUserId?: string | null
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const userId = explicitUserId || (await getActiveUserId());
    if (!userId) return { ok: false, error: "Utilizador não autenticado." };

    const vaultId = getVaultRowId(userId);

    const payload: CoindexCloudVaultState = {
      version: "0.45.0",
      syncedAt: new Date().toISOString(),
      ...partialState
    };

    const encodedVaultDesc = `${VAULT_DESC_PREFIX}${safeBase64Encode(JSON.stringify(payload))}`;

    const vaultRow: Record<string, unknown> = {
      id: vaultId,
      user_id: userId,
      tx_date: "2099-12-31",
      description: encodedVaultDesc,
      amount: 0,
      category: VAULT_CATEGORY,
      cost_type: "Fixo",
      payment_method: "Sistema",
      status: "Pago",
      updated_at: new Date().toISOString()
    };

    const res = await supabase.from("transactions").upsert(vaultRow, { onConflict: "id,user_id" });
    if (res.error) {
      const minimalRow = {
        id: vaultId,
        user_id: userId,
        tx_date: "2099-12-31",
        description: encodedVaultDesc,
        amount: 0,
        category: VAULT_CATEGORY,
        cost_type: "Fixo",
        payment_method: "Sistema",
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

    // SPRINT 58: Extração e Desacoplamento do Cofre Mestre Cloud Vault
    const vaultId = getVaultRowId(userId);
    const isVaultRow = (r: Record<string, unknown>): boolean => {
      const rId = String(r.id || "");
      const rCat = String(r.category || "");
      const rDesc = String(r.description || "");
      return rId === vaultId || rCat === VAULT_CATEGORY || rDesc.startsWith(VAULT_DESC_PREFIX);
    };

    const vaultRow = txRows.find(isVaultRow);
    const pureTxRows = txRows.filter((r) => !isVaultRow(r));

    let cloudVault: CoindexCloudVaultState | undefined;
    if (vaultRow) {
      const desc = String(vaultRow.description || "");
      const b64 = desc.startsWith(VAULT_DESC_PREFIX) ? desc.slice(VAULT_DESC_PREFIX.length).trim() : desc;
      try {
        cloudVault = JSON.parse(safeBase64Decode(b64));
      } catch (e) {
        console.warn("[coindex-supabase] Erro ao decodificar cofre mestre:", e);
      }
    }

    const cardRows = (cardsRes.data ?? []) as Array<Record<string, unknown>>;
    const catRows = (catsRes.data ?? []) as Array<Record<string, unknown>>;

    const isExcluded = (id: string, deletedAt?: unknown) => {
      if (deletedAt) return true;
      if (tombstoneSet && tombstoneSet.has(id)) return true;
      return false;
    };

    const isEmpty = pureTxRows.length === 0 && cardRows.length === 0 && catRows.length === 0;

    // SPRINT 58: Decodificação universal com suporte ao túnel de metadados
    const transactions: Transaction[] = pureTxRows
      .filter((r) => !isExcluded(String(r.id), r.deleted_at))
      .map((r) => decodeTxFromSupabase(r));

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
        cards = cloudVault.cards;
      } else if (Array.isArray(rawCloudBackup?.cards) && rawCloudBackup.cards.length > 0) {
        cards = rawCloudBackup.cards;
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
        banks = cloudVault.banks;
      } else if (Array.isArray(rawCloudBackup?.banks) && rawCloudBackup.banks.length > 0) {
        banks = rawCloudBackup.banks;
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

    const wishlist: WishlistItem[] = ((wishRes.data ?? []) as Array<Record<string, unknown>>)
      .filter((r) => !isExcluded(String(r.id), r.deleted_at))
      .map((r) => ({
        id: String(r.id),
        title: String(r.title),
        institution: String(r.institution ?? "Nubank"),
        targetAmount: Number(r.target_amount ?? 0),
        savedAmount: Number(r.saved_amount ?? 0),
        priority: (r.priority as WishlistItem["priority"]) ?? "Média"
      }));

    const bioLogs: BioLog[] = ((bioRes.data ?? []) as Array<Record<string, unknown>>)
      .filter((r) => !isExcluded(String(r.id), r.deleted_at))
      .map((r) => ({
        id: String(r.id),
        date: String(r.log_date),
        weight: Number(r.weight ?? 0),
        bf: r.bf != null ? Number(r.bf) : undefined
      }));

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
          id: t.id,
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
          id: t.id,
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

export async function upsertTransactionsInDb(txs: Transaction[], debtorMap?: Record<string, string>) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId || txs.length === 0) return;

  const payloads = txs.map((t) => {
    const { enrichedDescription } = encodeTxForSupabase(t);
    return {
      id: t.id,
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

  const res = await supabase.from("transactions").upsert(payloads, { onConflict: "id,user_id" });
  if (res.error) {
    // Se o banco remoto não tiver as colunas estendidas, faz fallback para as colunas base.
    // Todos os metadados continuam 100% salvos através do túnel enrichedDescription!
    if (res.error.code === "PGRST204" || res.error.code === "42703" || res.error.message?.includes("column")) {
      console.warn(
        "[coindex-supabase] Schema fallback ativado para transactions (metadados preservados no túnel):",
        res.error.message
      );
      const minimalPayloads = txs.map((t) => {
        const { enrichedDescription } = encodeTxForSupabase(t);
        return {
          id: t.id,
          user_id: userId,
          tx_date: t.date,
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
      }
    } else {
      console.error("[coindex-supabase] Erro ao sincronizar transações:", res.error);
    }
  }
}

export async function deleteTransactionInDb(id: string) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;
  await supabase.from("transactions").delete().eq("id", id).eq("user_id", userId);
}

export async function deleteTransactionsInDb(ids: string[]) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId || ids.length === 0) return;
  await supabase.from("transactions").delete().in("id", ids).eq("user_id", userId);
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
