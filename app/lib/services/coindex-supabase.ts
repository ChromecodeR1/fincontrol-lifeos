import { createClient } from "../supabase/client";
import { ChartWidgetSettings } from "../../components/ChartSettingsPopover";
import {
  Transaction,
  CreditCardItem,
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

export interface UserSettingsPayload {
  username?: string;
  avatarUrl?: string;
  themeMode?: ThemeMode;
  personalBudgetLimit?: number;
  monthlyInvestmentGoal?: number;
  patrimonyTarget?: number;
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

export async function fetchAllCoindexData(): Promise<{
  ok: boolean;
  isEmpty: boolean;
  data?: FullCoindexSnapshot;
  error?: string;
}> {
  try {
    const supabase = createClient();
    const userId = await getActiveUserId();
    if (!userId) {
      return { ok: false, isEmpty: true, error: "Utilizador não autenticado." };
    }

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
      logsRes
    ] = await Promise.all([
      supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("categories").select("*").eq("user_id", userId),
      supabase.from("payment_methods").select("*").eq("user_id", userId),
      supabase.from("credit_cards").select("*").eq("user_id", userId),
      supabase.from("wishlist_items").select("*").eq("user_id", userId),
      supabase.from("transactions").select("*").eq("user_id", userId).order("tx_date", { ascending: false }),
      supabase.from("static_status").select("*").eq("user_id", userId),
      supabase.from("bio_logs").select("*").eq("user_id", userId).order("log_date", { ascending: true }),
      supabase.from("personal_okrs").select("*").eq("user_id", userId),
      supabase.from("brain_notes").select("*").eq("user_id", userId).order("note_date", { ascending: false }),
      supabase.from("alert_rules").select("*").eq("user_id", userId),
      supabase.from("system_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(200)
    ]);

    const txRows = (txsRes.data ?? []) as Array<Record<string, unknown>>;
    const cardRows = (cardsRes.data ?? []) as Array<Record<string, unknown>>;
    const catRows = (catsRes.data ?? []) as Array<Record<string, unknown>>;

    const isEmpty = txRows.length === 0 && cardRows.length === 0 && catRows.length === 0;

    const transactions: Transaction[] = txRows.map((r) => ({
      id: String(r.id),
      date: String(r.tx_date),
      description: String(r.description),
      amount: Number(r.amount ?? 0),
      category: String(r.category),
      costType: (r.cost_type as CostType) ?? "Variável",
      paymentMethod: String(r.payment_method ?? "PIX"),
      cardUsed: r.card_used ? String(r.card_used) : undefined,
      bankAccount: (r as any).bank_account
        ? String((r as any).bank_account)
        : (String(r.payment_method) !== "Cartão de Crédito" && r.card_used ? String(r.card_used) : undefined),
      status: normalizeStatus(String(r.status ?? "Pendente")),
      km: r.km != null ? Number(r.km) : undefined,
      liters: r.liters != null ? Number(r.liters) : undefined,
      debtor: r.debtor ? String(r.debtor) : undefined,
      paidAmount: r.paid_amount != null ? Number(r.paid_amount) : 0,
      installmentInfo: r.installment_info ? String(r.installment_info) : undefined,
      installmentGroupId: r.installment_group_id ? String(r.installment_group_id) : undefined,
      wishlistId: r.wishlist_id ? String(r.wishlist_id) : undefined,
      iconUrl: r.icon_url ? String(r.icon_url) : undefined,
      updatedAt: r.updated_at ? String(r.updated_at) : new Date().toISOString()
    }));

    const cards: CreditCardItem[] = cardRows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      brand: String(r.brand ?? "Mastercard"),
      limit: Number(r.limit_amount ?? 0),
      closingDay: Number(r.closing_day ?? 25),
      dueDay: Number(r.due_day ?? 5),
      logoUrl: r.logo_url ? String(r.logo_url) : undefined
    }));

    const staticStatus: StaticStatusItem[] = ((statusRes.data ?? []) as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      title: String(r.title),
      type: r.item_type as StaticStatusItem["type"],
      amount: Number(r.amount ?? 0),
      notes: String(r.notes ?? "")
    }));

    const wishlist: WishlistItem[] = ((wishRes.data ?? []) as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      title: String(r.title),
      institution: String(r.institution ?? "Nubank"),
      targetAmount: Number(r.target_amount ?? 0),
      savedAmount: Number(r.saved_amount ?? 0),
      priority: (r.priority as WishlistItem["priority"]) ?? "Média"
    }));

    const bioLogs: BioLog[] = ((bioRes.data ?? []) as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      date: String(r.log_date),
      weight: Number(r.weight ?? 0),
      bf: r.bf != null ? Number(r.bf) : undefined
    }));

    const okrs: PersonalOKR[] = ((okrsRes.data ?? []) as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      title: String(r.title),
      category: String(r.category ?? "Finanças"),
      current: Number(r.current_val ?? 0),
      target: Number(r.target_val ?? 100),
      unit: String(r.unit ?? "R$")
    }));

    const notes: BrainNote[] = ((notesRes.data ?? []) as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      date: String(r.note_date),
      title: String(r.title),
      content: String(r.content ?? ""),
      tag: (r.tag as BrainNote["tag"]) ?? "#Ideias",
      completed: Boolean(r.completed),
      itemType: (r.item_type as "note" | "wish") ?? (r.price != null ? "wish" : "note"),
      price: r.price != null ? Number(r.price) : undefined,
      description: r.description ? String(r.description) : String(r.content || ""),
      priority: (r.priority as "Essencial" | "Planejado" | "Desejo") ?? undefined,
      storeUrl: r.store_url ? String(r.store_url) : undefined,
      completedAt: r.completed_at ? String(r.completed_at) : undefined
    }));

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
      data: {
        transactions,
        cards,
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
        settings
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
      const cardPayload = snapshot.cards.map((c) => ({
        id: c.id,
        user_id: userId,
        name: c.name,
        brand: c.brand,
        limit_amount: c.limit,
        closing_day: c.closingDay,
        due_day: c.dueDay,
        logo_url: c.logoUrl ?? null
      }));
      await supabase.from("credit_cards").upsert(cardPayload, { onConflict: "id,user_id" });
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
      const txPayload = snapshot.transactions.map((t) => ({
        id: t.id,
        user_id: userId,
        tx_date: t.date,
        description: t.description,
        amount: t.amount,
        category: t.category,
        cost_type: t.costType,
        payment_method: t.paymentMethod,
        card_used: t.cardUsed ?? t.bankAccount ?? null,
        status: t.status,
        km: t.km ?? null,
        liters: t.liters ?? null,
        debtor: t.debtor ?? (debtorMap ? debtorMap[t.id] : null) ?? null,
        paid_amount: t.paidAmount ?? (t.status === "Pago" ? t.amount : 0),
        installment_info: t.installmentInfo ?? null,
        installment_group_id: t.installmentGroupId ?? null,
        wishlist_id: t.wishlistId ?? null,
        icon_url: t.iconUrl ?? null,
        updated_at: t.updatedAt ?? new Date().toISOString()
      }));
      await supabase.from("transactions").upsert(txPayload, { onConflict: "id,user_id" });
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
      const notePayload = snapshot.notes.map((n) => ({
        id: n.id,
        user_id: userId,
        note_date: n.date,
        title: n.title,
        content: n.content,
        tag: n.tag
      }));
      await supabase.from("brain_notes").upsert(notePayload, { onConflict: "id,user_id" });
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
      message: `Sincronizado com o Supabase (${snapshot.transactions.length} lançamentos, ${snapshot.cards.length} cartões e módulos guardados).`
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

  const payload = txs.map((t) => ({
    id: t.id,
    user_id: userId,
    tx_date: t.date,
    description: t.description,
    amount: t.amount,
    category: t.category,
    cost_type: t.costType,
    payment_method: t.paymentMethod,
    card_used: t.cardUsed ?? t.bankAccount ?? null,
    status: t.status,
    km: t.km ?? null,
    liters: t.liters ?? null,
    debtor: t.debtor ?? (debtorMap ? debtorMap[t.id] : null) ?? null,
    paid_amount: t.paidAmount ?? (t.status === "Pago" ? t.amount : 0),
    installment_info: t.installmentInfo ?? null,
    installment_group_id: t.installmentGroupId ?? null,
    wishlist_id: t.wishlistId ?? null,
    icon_url: t.iconUrl ?? null,
    updated_at: t.updatedAt ?? new Date().toISOString()
  }));

  await supabase.from("transactions").upsert(payload, { onConflict: "id,user_id" });
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

export async function upsertCardInDb(card: CreditCardItem) {
  const supabase = createClient();
  const userId = await getActiveUserId();
  if (!userId) return;
  await supabase.from("credit_cards").upsert(
    {
      id: card.id,
      user_id: userId,
      name: card.name,
      brand: card.brand,
      limit_amount: card.limit,
      closing_day: card.closingDay,
      due_day: card.dueDay,
      logo_url: card.logoUrl ?? null
    },
    { onConflict: "id,user_id" }
  );
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
  const payload: Record<string, unknown> = {
    id: n.id,
    user_id: userId,
    note_date: n.date,
    title: n.title,
    content: n.content || n.description || "",
    tag: n.tag
  };
  if (n.completed !== undefined) payload.completed = n.completed;
  if (n.itemType !== undefined) payload.item_type = n.itemType;
  if (n.price !== undefined) payload.price = n.price;
  if (n.description !== undefined) payload.description = n.description;
  if (n.priority !== undefined) payload.priority = n.priority;
  if (n.storeUrl !== undefined) payload.store_url = n.storeUrl;
  if (n.completedAt !== undefined) payload.completed_at = n.completedAt;

  const { error } = await supabase.from("brain_notes").upsert(payload, { onConflict: "id,user_id" });
  if (error) {
    await supabase.from("brain_notes").upsert(
      {
        id: n.id,
        user_id: userId,
        note_date: n.date,
        title: n.title,
        content: n.content || n.description || "",
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