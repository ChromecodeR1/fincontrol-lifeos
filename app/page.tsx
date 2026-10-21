"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Wallet, PiggyBank, Plus, CreditCard, Car, LayoutDashboard, Table2, Search,
  AlertTriangle, Settings, RefreshCw, Gauge, Eye, EyeOff, Bell, Calendar,
  Activity, Brain, ClipboardList, Sparkles, Footprints, ChevronRight, Zap,
  ArrowUpRight, ArrowDownRight, Check, X, Lock, LogOut, UserPlus, Shield,
  Image as ImageIcon, GripVertical, Palette, Maximize2, Minimize2, RotateCcw,
  User, History, HandCoins, Layers
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  XAxis, YAxis, CartesianGrid, AreaChart, Area, ReferenceLine, BarChart, Bar
} from "recharts";

import {
  CostType, PaymentMethod, TxStatus, FlowType, CurveType, ThemeMode, ActiveTab,
  DashboardWidgetId, DashboardWidgetConfig, Transaction, CreditCardItem,
  StaticStatusItem, WishlistItem, BioLog, StravaStats, BrainNote, PersonalOKR,
  CustomAlertRule, ChartMilestone, ChartThemeColors, CategoryCatalogItem,
  StoredUserAccount, ToastMessage, SystemLogEntry, APP_VERSION, PREVIOUS_VERSION,
  CHANGELOG_HISTORY, DEFAULT_CATEGORIES_CATALOG, DEFAULT_PAYMENT_METHODS,
  DEFAULT_CATEGORY_COLORS, DEFAULT_CHART_THEME, COLOR_PRESETS,
  DEFAULT_DASHBOARD_LAYOUT, INITIAL_CARDS, INITIAL_TRANSACTIONS,
  INITIAL_DEBTOR_MAP, INITIAL_STATIC_STATUS, INITIAL_MILESTONES,
  INITIAL_WISHLIST, INITIAL_BIO_LOGS, INITIAL_NOTES, INITIAL_OKRS,
  INITIAL_ALERT_RULES, HISTORICAL_INVESTMENTS, sanitizeText, sanitizeImageSource,
  normalizeStatus, formatBRL, addMonthsToDate, getPreviousMonthPrefix,
  hashPasswordPBKDF, validatePasswordRules, compressImageFileToBase64,
  renderCategorySemanticIcon, getAutomaticStatus, CustomCyberTooltip,
  ThemeSegmentedControl
} from "./lifeos-data";

import SecondaryTabs from "./SecondaryTabs";

export default function LifeOSFinancialSystem() {
  const [accounts, setAccounts] = useState<StoredUserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authAvatarUrl, setAuthAvatarUrl] = useState("");
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showCommandBar, setShowCommandBar] = useState<boolean>(false);
  const [showChangelogModal, setShowChangelogModal] = useState<boolean>(false);
  const [commandQuery, setCommandQuery] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [themeMode, setThemeMode] = useState<ThemeMode>("noturno");
  const [logFilter, setLogFilter] = useState<string>("ALL");
  const [systemLogs, setSystemLogs] = useState<SystemLogEntry[]>([
    {
      id: "log-init-v10",
      timestamp: "20/10/2026 08:30:00",
      user: "Sistema",
      category: "CONFIG",
      action: `Sistema Iniciado na Versão ${APP_VERSION}`,
      details: "Temas visuais calibrados, compras parceladas (1x-24x), Valores a Receber 2.0 e barra mobile ativos."
    }
  ]);

  const [dashboardLayout, setDashboardLayout] = useState<DashboardWidgetConfig[]>(DEFAULT_DASHBOARD_LAYOUT);
  const [armedDragWidgetId, setArmedDragWidgetId] = useState<DashboardWidgetId | null>(null);
  const [draggedWidgetId, setDraggedWidgetId] = useState<DashboardWidgetId | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<DashboardWidgetId | null>(null);

  const [categoriesCatalog, setCategoriesCatalog] = useState<CategoryCatalogItem[]>(DEFAULT_CATEGORIES_CATALOG);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(DEFAULT_PAYMENT_METHODS);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>(DEFAULT_CATEGORY_COLORS);
  const [chartTheme, setChartTheme] = useState<ChartThemeColors>(DEFAULT_CHART_THEME);

  const [newMethodName, setNewMethodName] = useState("");
  const [newCategoryForm, setNewCategoryForm] = useState({ name: "", flow: "EXPENSE" as FlowType, isAuto: false, color: "#6366f1" });
  const [showQuickAddCatModal, setShowQuickAddCatModal] = useState(false);
  const [showQuickAddMethodModal, setShowQuickAddMethodModal] = useState(false);
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [receivableDebtors, setReceivableDebtors] = useState<Record<string, string>>(INITIAL_DEBTOR_MAP);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [cards, setCards] = useState<CreditCardItem[]>(INITIAL_CARDS);
  const [staticStatus, setStaticStatus] = useState<StaticStatusItem[]>(INITIAL_STATIC_STATUS);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

  const [wishlist, setWishlist] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const [editingWishId, setEditingWishId] = useState<string | null>(null);
  const [bioLogs, setBioLogs] = useState<BioLog[]>(INITIAL_BIO_LOGS);
  const [editingBioId, setEditingBioId] = useState<string | null>(null);
  const [notes, setNotes] = useState<BrainNote[]>(INITIAL_NOTES);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [selectedNoteTag, setSelectedNoteTag] = useState<string>("ALL");
  const [okrs, setOkrs] = useState<PersonalOKR[]>(INITIAL_OKRS);
  const [alertRules, setAlertRules] = useState<CustomAlertRule[]>(INITIAL_ALERT_RULES);

  const [showNotionChartConfig, setShowNotionChartConfig] = useState<boolean>(false);
  const [chartCurveType, setChartCurveType] = useState<CurveType>("monotone");
  const [chartStrokeWidth, setChartStrokeWidth] = useState<number>(1.6);
  const [showChartDots, setShowChartDots] = useState<boolean>(true);
  const [showChartGrid, setShowChartGrid] = useState<boolean>(true);
  const [chartMilestones, setChartMilestones] = useState<ChartMilestone[]>(INITIAL_MILESTONES);
  const [newMilestone, setNewMilestone] = useState({ label: "", value: "", color: "#a855f7" });

  const [stravaStats, setStravaStats] = useState<StravaStats>({ ytdKm: 342.6, ytdRuns: 68, allTimeKm: 1840.2, allTimeRuns: 345, lastSync: "Hoje, 08:30" });
  const [stravaConfig, setStravaConfig] = useState({ athleteId: "", clientId: "", clientSecret: "", refreshToken: "" });
  const [isSyncingStrava, setIsSyncingStrava] = useState(false);

  const [sheetApiUrl, setSheetApiUrl] = useState<string>("");
  const [personalBudgetLimit, setPersonalBudgetLimit] = useState<number>(250);
  const [monthlyInvestmentGoal, setMonthlyInvestmentGoal] = useState<number>(1450);
  const [patrimonyTarget, setPatrimonyTarget] = useState<number>(25000);
  const [annualRunGoalKm, setAnnualRunGoalKm] = useState<number>(600);

  const [selectedMonth, setSelectedMonth] = useState<string>("2026-10");
  const [filterPayment, setFilterPayment] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterCostType, setFilterCostType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [showNewTxModal, setShowNewTxModal] = useState(false);
  const [newTx, setNewTx] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    category: "Alimentação",
    costType: "Variável" as CostType,
    paymentMethod: "PIX" as PaymentMethod,
    cardUsed: INITIAL_CARDS[0].name,
    km: "",
    liters: "",
    iconUrl: "",
    wishlistId: "",
    installments: "1",
    debtor: ""
  });

  const [newStatusItem, setNewStatusItem] = useState({ title: "", type: "Custo Fixo" as StaticStatusItem["type"], amount: "", notes: "" });
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({ name: "", brand: "Mastercard Black", limit: "", closingDay: "25", dueDay: "5", logoUrl: "" });
  const [newWish, setNewWish] = useState({ title: "", institution: INITIAL_CARDS[0].name, targetAmount: "", savedAmount: "0", priority: "Média" as WishlistItem["priority"] });
  const [newBio, setNewBio] = useState({ date: new Date().toISOString().split("T")[0], weight: "", bf: "" });
  const [newNote, setNewNote] = useState({ title: "", content: "", tag: "#Ideias" as BrainNote["tag"] });
  const [newOkr, setNewOkr] = useState({ title: "", category: "Carreira", current: "0", target: "100", unit: "%" });
  const [newAlert, setNewAlert] = useState({ title: "", type: "ODOMETER_KM" as CustomAlertRule["type"], targetValue: "", warningLead: "500" });

  const applyDomTheme = useCallback((mode: ThemeMode) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("theme-branco", "theme-tradicional", "theme-noturno");
      document.documentElement.classList.add(`theme-${mode}`);
      document.body.classList.remove("theme-branco", "theme-tradicional", "theme-noturno");
      document.body.classList.add(`theme-${mode}`);
    }
  }, []);

  const registerLog = useCallback((action: string, details: string, category: "AUTH" | "FINANCE" | "CONFIG" | "SECURITY" = "FINANCE") => {
    const activeUser = currentUser ? currentUser : authUsername ? authUsername : "Sistema";
    const entry: SystemLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleString("pt-BR"),
      user: activeUser,
      category,
      action,
      details
    };
    setSystemLogs((prev) => {
      const updated = [entry, ...prev].slice(0, 250);
      localStorage.setItem("lifeos_system_logs_v8", JSON.stringify(updated));
      return updated;
    });
  }, [currentUser, authUsername]);

  const notify = useCallback((title: string, subtitle?: string, type: ToastMessage["type"] = "success", logCategory: "AUTH" | "FINANCE" | "CONFIG" | "SECURITY" = "FINANCE") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, subtitle, type }]);
    registerLog(title, subtitle ? subtitle : "Ação executada pelo usuário", logCategory);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800);
  }, [registerLog]);

  const changeThemeMode = useCallback((nextTheme: ThemeMode) => {
    setThemeMode(nextTheme);
    localStorage.setItem("lifeos_theme_mode_v8", nextTheme);
    applyDomTheme(nextTheme);
    notify("Aparência Atualizada!", `Modo ${nextTheme.toUpperCase()} ativado.`, "info", "CONFIG");
  }, [applyDomTheme, notify]);

  const getFlowType = useCallback((categoryName: string): FlowType => {
    const found = categoriesCatalog.find((c) => c.name === categoryName);
    if (found) return found.flow;
    const lower = categoryName.toLowerCase();
    if (lower.includes("salário") || lower.includes("benefício")) return "INCOME";
    if (lower.includes("aporte") || lower.includes("investimento")) return "INVESTMENT";
    return "EXPENSE";
  }, [categoriesCatalog]);

  const isAutoCategory = useCallback((categoryName: string): boolean => {
    const found = categoriesCatalog.find((c) => c.name === categoryName);
    if (found && found.isAuto) return true;
    const c = categoryName.toLowerCase();
    return c.includes("gasolina") || c.includes("manutenção") || c.includes("óleo") || c.includes("ipva") || c.includes("seguro") || c.includes("estacionamento");
  }, [categoriesCatalog]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandBar((prev) => !prev);
      }
      if (e.key === "Escape") {
        setShowCommandBar(false);
        setShowNewTxModal(false);
        setShowNotifications(false);
        setShowChangelogModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("lifeos_theme_mode_v8") as ThemeMode | null;
      const initialTheme: ThemeMode = savedTheme === "branco" || savedTheme === "tradicional" || savedTheme === "noturno" ? savedTheme : "noturno";
      setThemeMode(initialTheme);
      applyDomTheme(initialTheme);

      const savedLogs = localStorage.getItem("lifeos_system_logs_v8");
      if (savedLogs) setSystemLogs(JSON.parse(savedLogs));
      const savedDebtors = localStorage.getItem("lifeos_receivable_debtors_v9");
      if (savedDebtors) setReceivableDebtors(JSON.parse(savedDebtors));

      const savedAccounts = localStorage.getItem("lifeos_sec_accounts_v4");
      let parsedAccounts: StoredUserAccount[] = [];
      if (savedAccounts) {
        parsedAccounts = JSON.parse(savedAccounts);
        setAccounts(parsedAccounts);
        if (parsedAccounts.length === 0) setAuthMode("register");
      } else {
        setAuthMode("register");
      }

      const activeSession = sessionStorage.getItem("lifeos_active_user_v4");
      if (activeSession) {
        setCurrentUser(activeSession);
        const matched = parsedAccounts.find((a) => a.username === activeSession);
        if (matched?.avatarUrl) setCurrentUserAvatar(matched.avatarUrl);
      }

      const savedUrl = localStorage.getItem("lifeos_sheets_url");
      if (savedUrl) setSheetApiUrl(savedUrl);
      const savedLayout = localStorage.getItem("lifeos_dash_layout_v6");
      if (savedLayout) setDashboardLayout(JSON.parse(savedLayout));

      const savedCatalog = localStorage.getItem("lifeos_cat_catalog_v6");
      if (savedCatalog) {
        const parsedCat: CategoryCatalogItem[] = JSON.parse(savedCatalog);
        if (!parsedCat.some((c) => c.name === "A Receber")) parsedCat.splice(6, 0, { name: "A Receber", flow: "EXPENSE" });
        setCategoriesCatalog(parsedCat);
      }

      const savedMethods = localStorage.getItem("lifeos_pay_methods_v6");
      if (savedMethods) {
        const parsedM: string[] = JSON.parse(savedMethods);
        if (!parsedM.includes("Cartão ECX")) parsedM.push("Cartão ECX");
        setPaymentMethods(parsedM);
      }

      const savedCatColors = localStorage.getItem("lifeos_cat_colors_v5");
      if (savedCatColors) setCategoryColors({ ...DEFAULT_CATEGORY_COLORS, ...JSON.parse(savedCatColors) });
      const savedChartTheme = localStorage.getItem("lifeos_chart_theme_v6");
      if (savedChartTheme) setChartTheme({ ...DEFAULT_CHART_THEME, ...JSON.parse(savedChartTheme) });
      const savedStatus = localStorage.getItem("lifeos_static_status");
      if (savedStatus) setStaticStatus(JSON.parse(savedStatus));
      const savedCards = localStorage.getItem("lifeos_cards_v4");
      if (savedCards) setCards(JSON.parse(savedCards));

      const savedTxs = localStorage.getItem("lifeos_txs_v4");
      if (savedTxs) {
        const migrated: Transaction[] = JSON.parse(savedTxs).map((t: any) => ({ ...t, status: normalizeStatus(t.status) }));
        setTransactions(migrated);
      }

      const savedWish = localStorage.getItem("lifeos_wishlist_v5");
      if (savedWish) setWishlist(JSON.parse(savedWish));
      const savedBio = localStorage.getItem("lifeos_bio_v8");
      if (savedBio) setBioLogs(JSON.parse(savedBio));
      const savedNotes = localStorage.getItem("lifeos_notes_v10");
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      const savedMilestones = localStorage.getItem("lifeos_chart_milestones_v4");
      if (savedMilestones) setChartMilestones(JSON.parse(savedMilestones));
      const savedAlerts = localStorage.getItem("lifeos_alert_rules");
      if (savedAlerts) setAlertRules(JSON.parse(savedAlerts));
      const savedOkrs = localStorage.getItem("lifeos_okrs");
      if (savedOkrs) setOkrs(JSON.parse(savedOkrs));
      const savedStrava = localStorage.getItem("lifeos_strava_config");
      if (savedStrava) setStravaConfig(JSON.parse(savedStrava));

      const savedGoals = localStorage.getItem("lifeos_goals");
      if (savedGoals) {
        const parsed = JSON.parse(savedGoals);
        if (parsed.personalBudgetLimit) setPersonalBudgetLimit(Number(parsed.personalBudgetLimit));
        if (parsed.monthlyInvestmentGoal) setMonthlyInvestmentGoal(Number(parsed.monthlyInvestmentGoal));
        if (parsed.patrimonyTarget) setPatrimonyTarget(Number(parsed.patrimonyTarget));
        if (parsed.annualRunGoalKm) setAnnualRunGoalKm(Number(parsed.annualRunGoalKm));
      }
    } catch (e) {
      console.error("Erro ao inicializar:", e);
    }
  }, [applyDomTheme]);

  const saveDashboardLayout = (next: DashboardWidgetConfig[]) => { setDashboardLayout(next); localStorage.setItem("lifeos_dash_layout_v6", JSON.stringify(next)); };
  const saveReceivableDebtors = (next: Record<string, string>) => { setReceivableDebtors(next); localStorage.setItem("lifeos_receivable_debtors_v9", JSON.stringify(next)); };
  const saveStaticStatus = (items: StaticStatusItem[]) => { setStaticStatus(items); localStorage.setItem("lifeos_static_status", JSON.stringify(items)); };
  const saveCardsLocal = (items: CreditCardItem[]) => { setCards(items); localStorage.setItem("lifeos_cards_v4", JSON.stringify(items)); };
  const saveTransactionsLocal = (items: Transaction[]) => { setTransactions(items); localStorage.setItem("lifeos_txs_v4", JSON.stringify(items)); };
  const saveWishlistLocal = (items: WishlistItem[]) => { setWishlist(items); localStorage.setItem("lifeos_wishlist_v5", JSON.stringify(items)); };
  const saveBioLocal = (items: BioLog[]) => { setBioLogs(items); localStorage.setItem("lifeos_bio_v8", JSON.stringify(items)); };
  const saveNotesLocal = (items: BrainNote[]) => { setNotes(items); localStorage.setItem("lifeos_notes_v10", JSON.stringify(items)); };
  const saveMilestonesLocal = (items: ChartMilestone[]) => { setChartMilestones(items); localStorage.setItem("lifeos_chart_milestones_v4", JSON.stringify(items)); };
  const saveAlertRules = (rules: CustomAlertRule[]) => { setAlertRules(rules); localStorage.setItem("lifeos_alert_rules", JSON.stringify(rules)); };
  const saveOkrs = (items: PersonalOKR[]) => { setOkrs(items); localStorage.setItem("lifeos_okrs", JSON.stringify(items)); };

  const updateGoalsStorage = (budget: number, invest: number, patrimony: number, runKm: number) => {
    localStorage.setItem("lifeos_goals", JSON.stringify({ personalBudgetLimit: budget, monthlyInvestmentGoal: invest, patrimonyTarget: patrimony, annualRunGoalKm: runKm }));
  };

  const postToSheets = useCallback(async (payload: object) => {
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetApiUrl, payload })
      });
    } catch {
      if (sheetApiUrl && sheetApiUrl.startsWith("https://")) {
        try {
          await fetch(sheetApiUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [sheetApiUrl]);

  const syncFromGoogleSheets = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/sync?url=${encodeURIComponent(sheetApiUrl)}`);
      const data = await res.json();
      if (data.status === "success") {
        if (data.transactions?.length) {
          const localMap = new Map<string, Transaction>();
          transactions.forEach((t) => localMap.set(t.id, t));
          const mergedList: Transaction[] = [];
          const seenIds = new Set<string>();
          const nextDebtors = { ...receivableDebtors };

          data.transactions.forEach((r: any) => {
            const remoteId = sanitizeText(String(r["ID"]));
            seenIds.add(remoteId);
            const remoteUpdatedAt = r["UpdatedAt"] ? String(r["UpdatedAt"]) : undefined;
            const remoteDebtor = r["Devedor"] ? sanitizeText(String(r["Devedor"])) : undefined;
            const remotePaid = r["Valor_Pago_Parcial"] !== undefined && r["Valor_Pago_Parcial"] !== "" ? Number(r["Valor_Pago_Parcial"]) : undefined;

            const remoteTx: Transaction = {
              id: remoteId,
              date: sanitizeText(String(r["Data"]).slice(0, 10)),
              description: sanitizeText(String(r["Descrição"])),
              amount: Number(r["Valor"]) ? Number(r["Valor"]) : 0,
              category: sanitizeText(String(r["Categoria"])),
              costType: r["Tipo de Custo"] as CostType,
              paymentMethod: r["Método de Pagamento"] as PaymentMethod,
              cardUsed: r["Cartão Utilizado"] ? sanitizeText(String(r["Cartão Utilizado"])) : undefined,
              status: normalizeStatus(String(r["Status"])),
              km: r["Quilometragem (KM)"] ? Number(r["Quilometragem (KM)"]) : undefined,
              liters: r["Litros"] ? Number(r["Litros"]) : undefined,
              updatedAt: remoteUpdatedAt,
              installmentInfo: r["Parcela"] ? sanitizeText(String(r["Parcela"])) : undefined,
              debtor: remoteDebtor,
              paidAmount: remotePaid
            };

            const localItem = localMap.get(remoteId);
            if (localItem) {
              if (localItem.updatedAt && (!remoteUpdatedAt || localItem.updatedAt >= remoteUpdatedAt)) {
                mergedList.push({ ...remoteTx, ...localItem });
                postToSheets({ action: "UPDATE_TRANSACTION", data: localItem });
              } else {
                mergedList.push({ ...localItem, ...remoteTx });
                if (remoteDebtor) nextDebtors[remoteId] = remoteDebtor;
              }
            } else {
              mergedList.push(remoteTx);
              if (remoteDebtor) nextDebtors[remoteId] = remoteDebtor;
            }
          });

          transactions.forEach((localItem) => {
            if (!seenIds.has(localItem.id)) {
              mergedList.unshift(localItem);
              postToSheets({ action: "CREATE_TRANSACTION", data: localItem });
            }
          });
          saveTransactionsLocal(mergedList);
          saveReceivableDebtors(nextDebtors);
        }
        if (data.cards?.length) {
          saveCardsLocal(data.cards.map((c: any) => ({
            id: sanitizeText(String(c["ID"])),
            name: sanitizeText(String(c["Nome"])),
            brand: sanitizeText(String(c["Bandeira"])),
            limit: Number(c["Limite Total"]) ? Number(c["Limite Total"]) : 0,
            closingDay: Number(c["Dia Fechamento"]) ? Number(c["Dia Fechamento"]) : 1,
            dueDay: Number(c["Dia Vencimento"]) ? Number(c["Dia Vencimento"]) : 10
          })));
        }
        notify("Sincronização Inteligente Concluída!", "Dados locais e planilha sincronizados sem conflitos.", "success", "CONFIG");
      } else {
        notify("Conexão Pendente", "Configure o link da planilha em Sistemas Integrados.", "warning", "CONFIG");
      }
    } catch {
      notify("Falha ao sincronizar", "Verifique o link em Sistemas Integrados.", "warning", "CONFIG");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleWidgetDragStart = (e: React.DragEvent, id: DashboardWidgetId) => {
    if (armedDragWidgetId !== id) { e.preventDefault(); return; }
    setDraggedWidgetId(id);
  };
  const handleWidgetDragOver = (e: React.DragEvent, targetId: DashboardWidgetId) => {
    e.preventDefault();
    if (dragOverWidgetId !== targetId) setDragOverWidgetId(targetId);
  };
  const handleWidgetDrop = (targetId: DashboardWidgetId) => {
    if (!draggedWidgetId || draggedWidgetId === targetId) {
      setDraggedWidgetId(null); setDragOverWidgetId(null); setArmedDragWidgetId(null); return;
    }
    const current = [...dashboardLayout];
    const fromIdx = current.findIndex((w) => w.id === draggedWidgetId);
    const toIdx = current.findIndex((w) => w.id === targetId);
    if (fromIdx !== -1 && toIdx !== -1) {
      const [moved] = current.splice(fromIdx, 1);
      current.splice(toIdx, 0, moved);
      saveDashboardLayout(current);
      notify("Painel Reorganizado!", `"${moved.title}" mudou de posição.`, "info", "CONFIG");
    }
    setDraggedWidgetId(null); setDragOverWidgetId(null); setArmedDragWidgetId(null);
  };
  const toggleWidgetSpan = (id: DashboardWidgetId) => {
    saveDashboardLayout(dashboardLayout.map((w) => (w.id === id ? { ...w, span: (w.span === 2 ? 1 : 2) as 1 | 2 } : w)));
  };

  const updateCategoryColor = (category: string, color: string) => {
    const next = { ...categoryColors, [category]: color };
    setCategoryColors(next);
    localStorage.setItem("lifeos_cat_colors_v5", JSON.stringify(next));
  };
  const updateChartThemeColor = (key: keyof ChartThemeColors, color: string) => {
    const next = { ...chartTheme, [key]: color };
    setChartTheme(next);
    localStorage.setItem("lifeos_chart_theme_v6", JSON.stringify(next));
  };

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeText(newMethodName);
    if (!clean || paymentMethods.includes(clean)) return;
    const next = [...paymentMethods, clean];
    setPaymentMethods(next);
    localStorage.setItem("lifeos_pay_methods_v6", JSON.stringify(next));
    setNewTx((prev) => ({ ...prev, paymentMethod: clean }));
    setNewMethodName("");
    setShowQuickAddMethodModal(false);
    notify("Método Cadastrado!", clean, "success", "CONFIG");
  };
  const handleDeletePaymentMethod = (method: string) => {
    if (paymentMethods.length <= 1) return;
    const next = paymentMethods.filter((m) => m !== method);
    setPaymentMethods(next);
    localStorage.setItem("lifeos_pay_methods_v6", JSON.stringify(next));
    notify("Método Removido", method, "info", "CONFIG");
  };

  const handleAddCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeText(newCategoryForm.name);
    if (!clean || categoriesCatalog.some((c) => c.name.toLowerCase() === clean.toLowerCase())) return;
    const nextCatalog = [...categoriesCatalog, { name: clean, flow: newCategoryForm.flow, isAuto: newCategoryForm.isAuto }];
    setCategoriesCatalog(nextCatalog);
    localStorage.setItem("lifeos_cat_catalog_v6", JSON.stringify(nextCatalog));
    updateCategoryColor(clean, newCategoryForm.color);
    setNewTx((prev) => ({ ...prev, category: clean }));
    setNewCategoryForm({ name: "", flow: "EXPENSE", isAuto: false, color: "#6366f1" });
    setShowQuickAddCatModal(false);
    notify("Categoria Cadastrada!", clean, "success", "CONFIG");
  };
  const handleDeleteCategory = (name: string) => {
    if (categoriesCatalog.length <= 3 || name === "A Receber") return;
    const next = categoriesCatalog.filter((c) => c.name !== name);
    setCategoriesCatalog(next);
    localStorage.setItem("lifeos_cat_catalog_v6", JSON.stringify(next));
    notify("Categoria Removida", name, "info", "CONFIG");
  };

  const handleUpdateProfileAvatar = (file: File) => {
    compressImageFileToBase64(file, (base64) => {
      setCurrentUserAvatar(base64);
      if (currentUser) {
        const updated = accounts.map((acc) => (acc.username === currentUser ? { ...acc, avatarUrl: base64 } : acc));
        setAccounts(updated);
        localStorage.setItem("lifeos_sec_accounts_v4", JSON.stringify(updated));
        notify("Foto de Perfil Atualizada!", "Sua imagem foi salva.", "success", "CONFIG");
      }
    });
  };

  const handleRegisterAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const cleanUser = sanitizeText(authUsername);
    if (cleanUser.length < 3) { setAuthError("O usuário deve ter pelo menos 3 caracteres."); return; }
    if (accounts.some((acc) => acc.username === cleanUser)) { setAuthError("Este usuário já está cadastrado."); return; }
    const rules = validatePasswordRules(authPassword);
    if (!rules.minLength || !rules.hasUpper || !rules.hasLower || !rules.hasNumber || !rules.hasSpecial) {
      setAuthError("A senha precisa cumprir todos os requisitos abaixo."); return;
    }
    if (authPassword !== authConfirmPassword) { setAuthError("A confirmação de senha não confere."); return; }
    const randomBytes = new Uint8Array(16);
    window.crypto.getRandomValues(randomBytes);
    const salt = Array.from(randomBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    const passwordHash = await hashPasswordPBKDF(authPassword, salt);
    const newAccount: StoredUserAccount = {
      username: cleanUser,
      passwordHash,
      salt,
      avatarUrl: sanitizeImageSource(authAvatarUrl),
      createdAt: new Date().toISOString()
    };
    const updated = [...accounts, newAccount];
    setAccounts(updated);
    localStorage.setItem("lifeos_sec_accounts_v4", JSON.stringify(updated));
    sessionStorage.setItem("lifeos_active_user_v4", cleanUser);
    setCurrentUser(cleanUser);
    if (newAccount.avatarUrl) setCurrentUserAvatar(newAccount.avatarUrl);
    setAuthPassword("");
    setAuthConfirmPassword("");
    notify(`Bem-vindo à versão ${APP_VERSION}!`, `Conta segura criada para ${cleanUser}`, "success", "AUTH");
  };

  const handleLoginAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (Date.now() < lockoutUntil) {
      setAuthError(`Bloqueio temporário ativo. Aguarde ${Math.ceil((lockoutUntil - Date.now()) / 1000)}s.`); return;
    }
    const matched = accounts.find((acc) => acc.username === authUsername);
    const attemptedHash = matched ? await hashPasswordPBKDF(authPassword, matched.salt) : "";
    if (!matched || attemptedHash !== matched.passwordHash) {
      const nextFails = failedAttempts + 1;
      setFailedAttempts(nextFails);
      registerLog("Tentativa de Login Inválida", `Usuário informado: ${authUsername}`, "SECURITY");
      if (nextFails >= 5) {
        setLockoutUntil(Date.now() + 30000);
        setFailedAttempts(0);
        setAuthError("5 tentativas inválidas! Acesso bloqueado por 30 segundos.");
      } else {
        setAuthError("Usuário ou senha incorretos.");
      }
      return;
    }
    setFailedAttempts(0);
    sessionStorage.setItem("lifeos_active_user_v4", matched.username);
    setCurrentUser(matched.username);
    setCurrentUserAvatar(matched.avatarUrl ? matched.avatarUrl : "");
    setAuthPassword("");
    notify("Acesso Autorizado", `Bem-vindo, ${matched.username}!`, "success", "AUTH");
  };

  const handleLogout = () => {
    registerLog("Logout Realizado", `Sessão encerrada por ${currentUser}`, "AUTH");
    sessionStorage.removeItem("lifeos_active_user_v4");
    setCurrentUser(null);
    setAuthPassword("");
    setAuthMode("login");
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const mMonth = selectedMonth === "ALL" || tx.date.startsWith(selectedMonth);
      const mPay = filterPayment === "ALL" || tx.paymentMethod === filterPayment;
      const mCat = filterCategory === "ALL" || tx.category === filterCategory;
      const mCost = filterCostType === "ALL" || tx.costType === filterCostType;
      const mSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      return mMonth && mPay && mCat && mCost && mSearch;
    });
  }, [transactions, selectedMonth, filterPayment, filterCategory, filterCostType, searchQuery]);

  const receivableItems = useMemo(() => {
    return transactions
      .filter((tx) => tx.category === "A Receber")
      .map((tx) => {
        const mappedDebtor = receivableDebtors[tx.id] ? receivableDebtors[tx.id] : "";
        const debtorName = tx.debtor ? tx.debtor : mappedDebtor;
        const paidVal = tx.paidAmount ? tx.paidAmount : 0;
        const effectivePaid = tx.status === "Pago" ? tx.amount : Math.min(tx.amount, paidVal);
        const remaining = Math.max(0, Number((tx.amount - effectivePaid).toFixed(2)));
        return { ...tx, debtorName, effectivePaid, remaining };
      });
  }, [transactions, receivableDebtors]);

  const receivablesAnalytics = useMemo(() => {
    const byPerson: Record<string, { person: string; aberto: number; pago: number; totalEmprestado: number }> = {};
    let totalOpen = 0, totalPaid = 0;

    receivableItems.forEach((item) => {
      const trimmed = item.debtorName.trim();
      const personName = trimmed.length > 0 ? trimmed : "Não Atribuído";
      if (!byPerson[personName]) byPerson[personName] = { person: personName, aberto: 0, pago: 0, totalEmprestado: 0 };
      byPerson[personName].totalEmprestado += item.amount;
      byPerson[personName].pago += item.effectivePaid;
      byPerson[personName].aberto += item.remaining;
      totalPaid += item.effectivePaid;
      totalOpen += item.remaining;
    });

    const list = Object.values(byPerson).map((p) => ({
      person: p.person,
      aberto: Number(p.aberto.toFixed(2)),
      pago: Number(p.pago.toFixed(2)),
      totalEmprestado: Number(p.totalEmprestado.toFixed(2))
    }));

    return {
      totalOpen,
      totalPaid,
      totalLoaned: totalOpen + totalPaid,
      openByPerson: list.filter((p) => p.aberto > 0 || list.length <= 3),
      historyByPerson: list
    };
  }, [receivableItems]);

  const kpis = useMemo(() => {
    let totalIncome = 0, benefitsReceived = 0, cashExpenses = 0, creditExpenses = 0, totalInvested = 0, personalSpent = 0, fixedTotal = 0, variableTotal = 0, foodAndFuelSpent = 0;
    filteredTransactions.forEach((tx) => {
      const flow = getFlowType(tx.category);
      if (flow === "INCOME") {
        totalIncome += tx.amount;
        if (tx.category === "Benefícios (VA/Combustível)") benefitsReceived += tx.amount;
      } else if (flow === "INVESTMENT") {
        totalInvested += tx.amount;
      } else {
        if (tx.paymentMethod === "Cartão de Crédito" && tx.status === "Pendente / Na Fatura") creditExpenses += tx.amount;
        else cashExpenses += tx.amount;
        if (tx.costType === "Fixo") fixedTotal += tx.amount;
        else variableTotal += tx.amount;
        if (tx.category === "Gastos Pessoais / Besteiras") personalSpent += tx.amount;
        if (tx.category === "Alimentação" || tx.category === "Gasolina/Combustível") foodAndFuelSpent += tx.amount;
      }
    });

    const totalExpenses = cashExpenses + creditExpenses;
    const netCashBalance = totalIncome - cashExpenses - totalInvested;
    const benefitsBalance = benefitsReceived - foodAndFuelSpent;
    const savingsRate = totalIncome > 0 ? Math.round((totalInvested / totalIncome) * 100) : 0;

    const prevPrefix = getPreviousMonthPrefix(selectedMonth);
    let prevExpenses = 0, prevInvested = 0;
    if (prevPrefix) {
      transactions.filter((t) => t.date.startsWith(prevPrefix)).forEach((t) => {
        const flow = getFlowType(t.category);
        if (flow === "EXPENSE") prevExpenses += t.amount;
        else if (flow === "INVESTMENT") prevInvested += t.amount;
      });
    }
    const expenseVariationPct = prevExpenses > 0 ? Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100) : null;
    const investVariationPct = prevInvested > 0 ? Math.round(((totalInvested - prevInvested) / prevInvested) * 100) : null;

    return {
      totalIncome, benefitsReceived, foodAndFuelSpent, benefitsBalance, cashExpenses, creditExpenses,
      totalExpenses, totalInvested, netCashBalance, personalSpent, fixedTotal, variableTotal,
      savingsRate, expenseVariationPct, investVariationPct
    };
  }, [filteredTransactions, transactions, selectedMonth, getFlowType]);

  const creditAnalytics = useMemo(() => {
    let totalLimit = 0, totalUsed = 0;
    const byCard = cards.map((card) => {
      const used = transactions
        .filter((t) => t.paymentMethod === "Cartão de Crédito" && t.cardUsed === card.name && t.status === "Pendente / Na Fatura")
        .reduce((acc, curr) => acc + curr.amount, 0);
      const available = Math.max(0, card.limit - used);
      totalLimit += card.limit;
      totalUsed += used;
      return { name: card.name, usado: Number(used.toFixed(2)), disponivel: Number(available.toFixed(2)), limite: card.limit };
    });
    const totalAvailable = Math.max(0, totalLimit - totalUsed);
    const utilizationPct = totalLimit > 0 ? Math.min(100, Math.round((totalUsed / totalLimit) * 100)) : 0;
    return { totalLimit, totalUsed, totalAvailable, utilizationPct, byCard };
  }, [cards, transactions]);

  const autoMetrics = useMemo(() => {
    const autoTxs = transactions.filter((tx) => isAutoCategory(tx.category)).sort((a, b) => a.date.localeCompare(b.date));
    let fuelTotal = 0, maintenanceTotal = 0, otherAutoTotal = 0, totalLiters = 0;
    const kmRecords: { date: string; km: number; description: string; category: string; amount: number; liters?: number }[] = [];
    autoTxs.forEach((tx) => {
      if (tx.category === "Gasolina/Combustível") fuelTotal += tx.amount;
      else if (tx.category === "Manutenção" || tx.category === "Troca de Óleo") maintenanceTotal += tx.amount;
      else otherAutoTotal += tx.amount;
      if (tx.liters && tx.liters > 0) totalLiters += tx.liters;
      if (tx.km && tx.km > 0) kmRecords.push({ date: tx.date, km: tx.km, description: tx.description, category: tx.category, amount: tx.amount, liters: tx.liters });
    });
    const totalAutoSpent = fuelTotal + maintenanceTotal + otherAutoTotal;
    const minKm = kmRecords.length > 0 ? kmRecords[0].km : 0;
    const maxKm = kmRecords.length > 0 ? kmRecords[kmRecords.length - 1].km : 0;
    const distanceDriven = maxKm > minKm ? maxKm - minKm : 0;
    const costPerKm = distanceDriven > 0 ? totalAutoSpent / distanceDriven : 0;
    const avgKmPerLiter = distanceDriven > 0 && totalLiters > 0 ? distanceDriven / totalLiters : 11.4;
    return { autoTxs, fuelTotal, maintenanceTotal, otherAutoTotal, totalAutoSpent, kmRecords, maxKm, distanceDriven, costPerKm, avgKmPerLiter };
  }, [transactions, isAutoCategory]);

  const activeAlerts = useMemo(() => {
    const list: { id: string; title: string; detail: string; severity: "high" | "medium" }[] = [];
    alertRules.forEach((rule) => {
      if (rule.type === "ODOMETER_KM") {
        const rem = rule.targetValue - autoMetrics.maxKm;
        if (rem <= 0) list.push({ id: rule.id, title: `Prazo Atingido: ${rule.title}`, detail: `Veículo chegou a ${autoMetrics.maxKm} km (Alvo: ${rule.targetValue} km).`, severity: "high" });
        else if (rem <= rule.warningLead) list.push({ id: rule.id, title: `Manutenção Próxima: ${rule.title}`, detail: `Faltam ${rem.toLocaleString("pt-BR")} km para ${rule.targetValue.toLocaleString("pt-BR")} km.`, severity: "medium" });
      } else {
        const diff = rule.targetValue - kpis.totalExpenses;
        if (diff <= 0) list.push({ id: rule.id, title: `Limite Ultrapassado: ${rule.title}`, detail: `Despesas passaram de ${formatBRL(rule.targetValue)}.`, severity: "high" });
        else if (diff <= rule.warningLead) list.push({ id: rule.id, title: `Atenção ao Orçamento: ${rule.title}`, detail: `Restam ${formatBRL(diff)} para o limite.`, severity: "medium" });
      }
    });
    const budgetPct = Math.round((kpis.personalSpent / Math.max(1, personalBudgetLimit)) * 100);
    if (budgetPct >= 80) list.push({ id: "budget-alert", title: "Termômetro de Gastos Pessoais", detail: `Você utilizou ${budgetPct}% do limite de ${formatBRL(personalBudgetLimit)}.`, severity: budgetPct >= 100 ? "high" : "medium" });
    return list;
  }, [alertRules, autoMetrics.maxKm, kpis.personalSpent, kpis.totalExpenses, personalBudgetLimit]);

  const investmentChartData = useMemo(() => {
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const dynamicByMonth: Record<string, number> = {};
    transactions.forEach((t) => {
      if (getFlowType(t.category) === "INVESTMENT") {
        const mKey = t.date.slice(0, 7);
        const currentSum = dynamicByMonth[mKey] ? dynamicByMonth[mKey] : 0;
        dynamicByMonth[mKey] = currentSum + t.amount;
      }
    });

    const baseMonths = HISTORICAL_INVESTMENTS.map((h) => ({ ...h }));
    const lastBase = baseMonths[baseMonths.length - 1];
    let runningTotal = lastBase ? lastBase.acumulado : 8200;

    const allDynamicKeys = Object.keys(dynamicByMonth).filter((k) => k > "2026-08").sort();
    const result = baseMonths.map((b) => ({
      month: b.label,
      aportado: b.aportado,
      acumulado: b.acumulado,
      metaMensal: monthlyInvestmentGoal
    }));

    allDynamicKeys.forEach((mKey) => {
      const parts = mKey.split("-").map(Number);
      const y = parts[0] ? parts[0] : 2026;
      const m = parts[1] ? parts[1] : 1;
      const aportadoVal = dynamicByMonth[mKey] ? dynamicByMonth[mKey] : 0;
      runningTotal += aportadoVal;
      result.push({
        month: `${monthNames[m - 1]}/${String(y).slice(2)}`,
        aportado: Number(aportadoVal.toFixed(2)),
        acumulado: Number(runningTotal.toFixed(2)),
        metaMensal: monthlyInvestmentGoal
      });
    });

    return result;
  }, [transactions, monthlyInvestmentGoal, getFlowType]);

  const handleTurnTheMonth = async () => {
    const fixedItems = transactions.filter((t) => t.costType === "Fixo");
    if (fixedItems.length === 0) { notify("Nenhum item fixo", "Defina contas recorrentes como Fixo.", "warning"); return; }
    const baseMonth = selectedMonth === "ALL" ? new Date().toISOString().slice(0, 7) : selectedMonth;
    const [yearStr, monthStr] = baseMonth.split("-");
    let nextYear = parseInt(yearStr, 10), nextMonth = parseInt(monthStr, 10) + 1;
    if (nextMonth > 12) { nextMonth = 1; nextYear += 1; }
    const targetPrefix = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
    const uniqueByDesc = new Map<string, Transaction>();
    fixedItems.forEach((item) => { if (!uniqueByDesc.has(item.description)) uniqueByDesc.set(item.description, item); });
    const nowIso = new Date().toISOString();
    const clonedBatch: Transaction[] = Array.from(uniqueByDesc.values()).map((item, idx) => {
      const dayPart = item.date.slice(8, 10);
      return {
        ...item,
        id: `tx-rollover-${Date.now()}-${idx}`,
        date: `${targetPrefix}-${dayPart ? dayPart : "05"}`,
        status: getAutomaticStatus(item.paymentMethod, item.category),
        updatedAt: nowIso
      };
    });
    saveTransactionsLocal([...clonedBatch, ...transactions]);
    setSelectedMonth(targetPrefix);
    await postToSheets({ action: "BULK_CREATE_TRANSACTIONS", items: clonedBatch });
    notify(`Novo Mês Iniciado (${targetPrefix})!`, `${clonedBatch.length} itens fixos foram lançados.`, "success");
  };

  const handlePayCardInvoice = (cardName: string) => {
    let count = 0;
    const nowIso = new Date().toISOString();
    const updated = transactions.map((t) => {
      if (t.paymentMethod === "Cartão de Crédito" && t.cardUsed === cardName && t.status === "Pendente / Na Fatura") {
        count += 1;
        const nextTx: Transaction = { ...t, status: "Pago", updatedAt: nowIso };
        postToSheets({ action: "UPDATE_TRANSACTION", data: nextTx });
        return nextTx;
      }
      return t;
    });
    if (count === 0) { notify("Fatura já está em dia!", `Nenhum lançamento pendente em ${cardName}.`, "info"); return; }
    saveTransactionsLocal(updated);
    notify(`Fatura Quitada (${cardName})!`, `${count} lançamentos marcados como Pago.`, "success");
  };

  const syncStravaFromApi = async () => {
    if (!stravaConfig.clientId || !stravaConfig.clientSecret || !stravaConfig.refreshToken || !stravaConfig.athleteId) {
      notify("Conexão Strava Incompleta", "Preencha suas chaves em Sistemas Integrados.", "warning", "CONFIG");
      setActiveTab("settings"); return;
    }
    setIsSyncingStrava(true);
    try {
      const tokenRes = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: stravaConfig.clientId, client_secret: stravaConfig.clientSecret, refresh_token: stravaConfig.refreshToken, grant_type: "refresh_token" })
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) throw new Error("Token inválido");
      const statsRes = await fetch(`https://www.strava.com/api/v3/athletes/${encodeURIComponent(stravaConfig.athleteId)}/stats`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const stats = await statsRes.json();
      const ytdDist = stats.ytd_run_totals?.distance ? stats.ytd_run_totals.distance : 0;
      const allDist = stats.all_run_totals?.distance ? stats.all_run_totals.distance : 0;
      const ytdKmVal = Number((ytdDist / 1000).toFixed(1));
      setStravaStats({
        ytdKm: ytdKmVal,
        ytdRuns: stats.ytd_run_totals?.count ? stats.ytd_run_totals.count : 0,
        allTimeKm: Number((allDist / 1000).toFixed(1)),
        allTimeRuns: stats.all_run_totals?.count ? stats.all_run_totals.count : 0,
        lastSync: new Date().toLocaleDateString("pt-BR")
      });
      notify("Corridas Atualizadas!", `Você soma ${ytdKmVal} km neste ano.`, "success");
    } catch {
      notify("Falha ao conectar com o Strava", "Confira suas credenciais em Sistemas Integrados.", "warning", "CONFIG");
    } finally {
      setIsSyncingStrava(false);
    }
  };

  const handleOpenNewTxModal = (defaultCat?: string) => {
    setEditingTxId(null);
    const fallbackCat = categoriesCatalog[7] ? categoriesCatalog[7].name : "Alimentação";
    setNewTx({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      category: defaultCat ? defaultCat : fallbackCat,
      costType: "Variável",
      paymentMethod: paymentMethods[0] ? paymentMethods[0] : "PIX",
      cardUsed: cards[0] ? cards[0].name : "",
      km: "",
      liters: "",
      iconUrl: "",
      wishlistId: "",
      installments: "1",
      debtor: ""
    });
    setShowNewTxModal(true);
  };

  const handleStartEditTransaction = (tx: Transaction) => {
    setEditingTxId(tx.id);
    const defaultCard = cards[0] ? cards[0].name : "";
    const mappedDebtor = receivableDebtors[tx.id] ? receivableDebtors[tx.id] : "";
    setNewTx({
      date: tx.date,
      description: tx.description,
      amount: String(tx.amount),
      category: tx.category,
      costType: tx.costType,
      paymentMethod: tx.paymentMethod,
      cardUsed: tx.cardUsed ? tx.cardUsed : defaultCard,
      km: tx.km ? String(tx.km) : "",
      liters: tx.liters ? String(tx.liters) : "",
      iconUrl: tx.iconUrl ? tx.iconUrl : "",
      wishlistId: tx.wishlistId ? tx.wishlistId : "",
      installments: "1",
      debtor: tx.debtor ? tx.debtor : mappedDebtor
    });
    setShowNewTxModal(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDesc = sanitizeText(newTx.description);
    if (!cleanDesc || !newTx.amount) return;
    const numericAmount = Math.max(0, parseFloat(newTx.amount));
    const nowIso = new Date().toISOString();
    const cleanDebtor = sanitizeText(newTx.debtor);

    if (editingTxId) {
      let editedObj: Transaction | null = null;
      const updatedList = transactions.map((item) => {
        if (item.id === editingTxId) {
          editedObj = {
            ...item,
            date: newTx.date,
            description: cleanDesc,
            amount: numericAmount,
            category: newTx.category,
            costType: newTx.costType,
            paymentMethod: newTx.paymentMethod,
            cardUsed: newTx.paymentMethod === "Cartão de Crédito" ? newTx.cardUsed : item.cardUsed,
            status: item.paymentMethod !== newTx.paymentMethod ? getAutomaticStatus(newTx.paymentMethod, newTx.category) : item.status,
            km: isAutoCategory(newTx.category) && newTx.km ? parseInt(newTx.km, 10) : undefined,
            liters: isAutoCategory(newTx.category) && newTx.liters ? parseFloat(newTx.liters) : undefined,
            iconUrl: sanitizeImageSource(newTx.iconUrl),
            wishlistId: newTx.wishlistId ? newTx.wishlistId : undefined,
            debtor: newTx.category === "A Receber" ? (cleanDebtor ? cleanDebtor : item.debtor) : item.debtor,
            updatedAt: nowIso
          };
          return editedObj;
        }
        return item;
      });
      saveTransactionsLocal(updatedList);
      if (newTx.category === "A Receber" && cleanDebtor) {
        saveReceivableDebtors({ ...receivableDebtors, [editingTxId]: cleanDebtor });
      }
      setEditingTxId(null);
      setShowNewTxModal(false);
      notify("Lançamento Atualizado!", `${cleanDesc} (${formatBRL(numericAmount)})`, "success");
      if (editedObj) await postToSheets({ action: "UPDATE_TRANSACTION", data: editedObj });
    } else {
      const totalInstallments = Math.max(1, Math.min(24, parseInt(newTx.installments ? newTx.installments : "1", 10)));
      const baseInstallmentAmount = Math.floor((numericAmount / totalInstallments) * 100) / 100;
      const remainderCents = Number((numericAmount - baseInstallmentAmount * totalInstallments).toFixed(2));
      const groupId = totalInstallments > 1 ? `grp-${Date.now()}` : undefined;
      const createdBatch: Transaction[] = [];
      const nextDebtors = { ...receivableDebtors };

      for (let i = 0; i < totalInstallments; i++) {
        const txId = `tx-${Date.now()}-${i}`;
        const txDate = i === 0 ? newTx.date : addMonthsToDate(newTx.date, i);
        const instLabel = totalInstallments > 1 ? `${i + 1}/${totalInstallments}` : undefined;
        const exactInstallmentAmount = i === 0 ? Number((baseInstallmentAmount + remainderCents).toFixed(2)) : baseInstallmentAmount;

        const created: Transaction = {
          id: txId,
          date: txDate,
          description: cleanDesc,
          amount: exactInstallmentAmount,
          category: newTx.category,
          costType: newTx.costType,
          paymentMethod: newTx.paymentMethod,
          cardUsed: newTx.paymentMethod === "Cartão de Crédito" ? newTx.cardUsed : undefined,
          status: getAutomaticStatus(newTx.paymentMethod, newTx.category),
          km: i === 0 && isAutoCategory(newTx.category) && newTx.km ? parseInt(newTx.km, 10) : undefined,
          liters: i === 0 && isAutoCategory(newTx.category) && newTx.liters ? parseFloat(newTx.liters) : undefined,
          iconUrl: sanitizeImageSource(newTx.iconUrl),
          wishlistId: newTx.wishlistId ? newTx.wishlistId : undefined,
          updatedAt: nowIso,
          installmentInfo: instLabel,
          installmentGroupId: groupId,
          debtor: newTx.category === "A Receber" ? cleanDebtor : undefined,
          paidAmount: 0
        };
        createdBatch.push(created);
        if (newTx.category === "A Receber") nextDebtors[txId] = cleanDebtor;
      }

      saveTransactionsLocal([...createdBatch, ...transactions]);
      if (newTx.category === "A Receber") saveReceivableDebtors(nextDebtors);

      if (getFlowType(newTx.category) === "INVESTMENT" && newTx.wishlistId) {
        const targetWish = wishlist.find((w) => w.id === newTx.wishlistId);
        if (targetWish) {
          const nextSaved = targetWish.savedAmount + numericAmount;
          saveWishlistLocal(wishlist.map((w) => (w.id === targetWish.id ? { ...w, savedAmount: nextSaved } : w)));
          await postToSheets({ action: "UPDATE_WISH", id: targetWish.id, savedAmount: nextSaved });
        }
      }

      setShowNewTxModal(false);
      notify(
        totalInstallments > 1 ? `Compra Parcelada em ${totalInstallments}x Registrada!` : "Lançamento Registrado!",
        `${cleanDesc} (${totalInstallments > 1 ? `${totalInstallments}x de ${formatBRL(baseInstallmentAmount)}` : formatBRL(numericAmount)})`,
        "success"
      );

      if (createdBatch.length === 1) await postToSheets({ action: "CREATE_TRANSACTION", data: createdBatch[0] });
      else await postToSheets({ action: "BULK_CREATE_TRANSACTIONS", items: createdBatch });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const target = transactions.find((t) => t.id === id);
    saveTransactionsLocal(transactions.filter((t) => t.id !== id));
    notify("Lançamento Excluído", target ? target.description : "Registro removido", "info");
    await postToSheets({ action: "DELETE_TRANSACTION", id });
  };

  const handleToggleStatus = async (tx: Transaction) => {
    const nextStatus: TxStatus = tx.status === "Pago" ? "Pendente / Na Fatura" : "Pago";
    const nowIso = new Date().toISOString();
    const updatedTx: Transaction = {
      ...tx,
      status: nextStatus,
      paidAmount: nextStatus === "Pago" ? tx.amount : 0,
      updatedAt: nowIso
    };
    saveTransactionsLocal(transactions.map((item) => (item.id === tx.id ? updatedTx : item)));
    notify(
      tx.category === "A Receber" ? "Status Sincronizado (Lançamentos ⇄ A Receber)" : "Situação Alterada",
      `${tx.description} → ${nextStatus}`,
      "info"
    );
    await postToSheets({ action: "UPDATE_TRANSACTION", data: updatedTx });
  };

  const handleAssignDebtor = useCallback(async (txId: string, debtorName: string) => {
    const clean = sanitizeText(debtorName);
    const nowIso = new Date().toISOString();
    setReceivableDebtors((prev) => {
      const next = { ...prev, [txId]: clean };
      localStorage.setItem("lifeos_receivable_debtors_v9", JSON.stringify(next));
      return next;
    });
    let targetUpdated: Transaction | null = null;
    setTransactions((prev) => {
      const nextList = prev.map((t) => {
        if (t.id === txId) {
          targetUpdated = { ...t, debtor: clean, updatedAt: nowIso };
          return targetUpdated;
        }
        return t;
      });
      localStorage.setItem("lifeos_txs_v4", JSON.stringify(nextList));
      return nextList;
    });
    notify("Devedor Atribuído!", clean ? clean : "Não Atribuído", "info");
    if (targetUpdated) await postToSheets({ action: "UPDATE_TRANSACTION", data: targetUpdated });
  }, [notify, postToSheets]);

  const handlePartialPaymentReceivable = async (tx: Transaction, addAmount: number) => {
    const currentPaid = tx.paidAmount ? tx.paidAmount : 0;
    const nextPaid = Math.min(tx.amount, Number((currentPaid + addAmount).toFixed(2)));
    const isNowFullyPaid = nextPaid >= tx.amount;
    const nowIso = new Date().toISOString();

    const updatedTx: Transaction = {
      ...tx,
      paidAmount: nextPaid,
      status: isNowFullyPaid ? "Pago" : "Pendente / Na Fatura",
      updatedAt: nowIso
    };

    saveTransactionsLocal(transactions.map((item) => (item.id === tx.id ? updatedTx : item)));
    notify(
      isNowFullyPaid ? "Dívida 100% Quitada!" : `Abatimento de ${formatBRL(addAmount)} Registrado!`,
      `Restam ${formatBRL(Math.max(0, tx.amount - nextPaid))} em "${tx.description}".`,
      "success"
    );
    await postToSheets({ action: "UPDATE_TRANSACTION", data: updatedTx });
  };

  const handleExportCSV = () => {
    const headers = ["Data", "Descricao", "Parcela", "Categoria", "Tipo", "Metodo", "Cartao", "Status", "Valor"];
    const rows = filteredTransactions.map((t) => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.installmentInfo ? t.installmentInfo : "1/1",
      `"${t.category}"`,
      t.costType,
      t.paymentMethod,
      t.cardUsed ? t.cardUsed : "",
      t.status,
      t.amount.toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `lancamentos_fincontrol_v${APP_VERSION}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("Relatório Exportado!", "Arquivo CSV baixado.", "success");
  };

  const handleExportFullBackupJSON = () => {
    const backup = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      transactions,
      receivableDebtors,
      cards,
      staticStatus,
      wishlist,
      bioLogs,
      notes,
      okrs,
      alertRules,
      categoriesCatalog,
      paymentMethods,
      categoryColors,
      chartTheme,
      chartMilestones,
      themeMode
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_lifeos_v${APP_VERSION}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify("Backup Completo Gerado!", "Arquivo JSON salvo no seu computador.", "success", "CONFIG");
  };

  const handleImportFullBackupJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result ? String(ev.target.result) : "{}";
        const data = JSON.parse(raw);
        if (data.transactions) saveTransactionsLocal(data.transactions.map((t: any) => ({ ...t, status: normalizeStatus(t.status) })));
        if (data.receivableDebtors) saveReceivableDebtors(data.receivableDebtors);
        if (data.cards) saveCardsLocal(data.cards);
        if (data.staticStatus) saveStaticStatus(data.staticStatus);
        if (data.wishlist) saveWishlistLocal(data.wishlist);
        if (data.bioLogs) saveBioLocal(data.bioLogs);
        if (data.notes) saveNotesLocal(data.notes);
        if (data.categoriesCatalog) { setCategoriesCatalog(data.categoriesCatalog); localStorage.setItem("lifeos_cat_catalog_v6", JSON.stringify(data.categoriesCatalog)); }
        if (data.paymentMethods) { setPaymentMethods(data.paymentMethods); localStorage.setItem("lifeos_pay_methods_v6", JSON.stringify(data.paymentMethods)); }
        if (data.categoryColors) { setCategoryColors(data.categoryColors); localStorage.setItem("lifeos_cat_colors_v5", JSON.stringify(data.categoryColors)); }
        if (data.chartTheme) { setChartTheme(data.chartTheme); localStorage.setItem("lifeos_chart_theme_v6", JSON.stringify(data.chartTheme)); }
        if (data.themeMode) changeThemeMode(data.themeMode);
        notify("Backup Restaurado com Sucesso!", "Todos os seus dados foram carregados.", "success", "CONFIG");
      } catch {
        notify("Arquivo de Backup Inválido", "Selecione um arquivo .json válido.", "warning", "SECURITY");
      }
    };
    reader.readAsText(file);
  };

  const handleSaveStaticStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeText(newStatusItem.title);
    if (!cleanTitle || !newStatusItem.amount) return;
    if (editingStatusId) {
      saveStaticStatus(staticStatus.map((item) => item.id === editingStatusId ? { ...item, title: cleanTitle, type: newStatusItem.type, amount: parseFloat(newStatusItem.amount), notes: sanitizeText(newStatusItem.notes) } : item));
      setEditingStatusId(null);
      notify("Item Atualizado!", cleanTitle, "success");
    } else {
      const item: StaticStatusItem = { id: `st-${Date.now()}`, title: cleanTitle, type: newStatusItem.type, amount: parseFloat(newStatusItem.amount), notes: sanitizeText(newStatusItem.notes) };
      saveStaticStatus([...staticStatus, item]);
      notify("Adicionado ao Status Atual!", item.title, "success");
    }
    setNewStatusItem({ title: "", type: "Custo Fixo", amount: "", notes: "" });
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeText(newCard.name);
    if (!cleanName || !newCard.limit) return;
    if (editingCardId) {
      saveCardsLocal(cards.map((c) => c.id === editingCardId ? { ...c, name: cleanName, brand: sanitizeText(newCard.brand), limit: parseFloat(newCard.limit), closingDay: parseInt(newCard.closingDay, 10), dueDay: parseInt(newCard.dueDay, 10), logoUrl: sanitizeImageSource(newCard.logoUrl) } : c));
      setEditingCardId(null);
      notify("Cartão Atualizado!", cleanName, "success");
    } else {
      const created: CreditCardItem = { id: `card-${Date.now()}`, name: cleanName, brand: sanitizeText(newCard.brand), limit: parseFloat(newCard.limit), closingDay: parseInt(newCard.closingDay, 10), dueDay: parseInt(newCard.dueDay, 10), logoUrl: sanitizeImageSource(newCard.logoUrl) };
      saveCardsLocal([...cards, created]);
      notify("Novo Cartão Cadastrado!", created.name, "success");
      await postToSheets({ action: "CREATE_CARD", data: created });
    }
    setNewCard({ name: "", brand: "Mastercard Black", limit: "", closingDay: "25", dueDay: "5", logoUrl: "" });
  };

  const handleDeleteCard = async (id: string) => {
    saveCardsLocal(cards.filter((c) => c.id !== id));
    notify("Cartão Removido", "", "info");
    await postToSheets({ action: "DELETE_CARD", id });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLabel = sanitizeText(newMilestone.label);
    if (!cleanLabel || !newMilestone.value) return;
    const created: ChartMilestone = { id: `ms-${Date.now()}`, label: cleanLabel, value: parseFloat(newMilestone.value), color: newMilestone.color ? newMilestone.color : "#a855f7" };
    saveMilestonesLocal([...chartMilestones, created]);
    setNewMilestone({ label: "", value: "", color: "#a855f7" });
    notify("Meta Adicionada ao Gráfico!", `${cleanLabel} (${formatBRL(created.value)})`, "success", "CONFIG");
  };

  const handleSaveWish = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeText(newWish.title);
    if (!cleanTitle || !newWish.targetAmount) return;
    const savedVal = newWish.savedAmount ? parseFloat(newWish.savedAmount) : 0;
    if (editingWishId) {
      saveWishlistLocal(wishlist.map((w) => w.id === editingWishId ? { ...w, title: cleanTitle, institution: sanitizeText(newWish.institution), targetAmount: parseFloat(newWish.targetAmount), savedAmount: savedVal, priority: newWish.priority } : w));
      setEditingWishId(null);
      notify("Caixinha Atualizada!", cleanTitle, "success");
    } else {
      const inst = newWish.institution ? newWish.institution : "Nubank Ultravioleta";
      const created: WishlistItem = { id: `wish-${Date.now()}`, title: cleanTitle, institution: sanitizeText(inst), targetAmount: parseFloat(newWish.targetAmount), savedAmount: savedVal, priority: newWish.priority };
      saveWishlistLocal([...wishlist, created]);
      notify("Caixinha Criada!", `${created.title} (${created.institution})`, "success");
      await postToSheets({ action: "CREATE_WISH", data: created });
    }
    const defaultInst = cards[0] ? cards[0].name : "Nubank Ultravioleta";
    setNewWish({ title: "", institution: defaultInst, targetAmount: "", savedAmount: "0", priority: "Média" });
  };

  const handleIncrementWish = async (w: WishlistItem, increment: number) => {
    if (!increment || increment <= 0) return;
    const nextVal = w.savedAmount + increment;
    saveWishlistLocal(wishlist.map((item) => (item.id === w.id ? { ...item, savedAmount: nextVal } : item)));
    const todayDate = new Date().toISOString().split("T")[0];
    const matchedCard = cards.find((c) => c.name === w.institution);
    const instLabel = w.institution ? w.institution : "Reserva";
    const autoTx: Transaction = {
      id: `tx-wish-${Date.now()}`,
      date: todayDate,
      description: `Aporte Caixinha: ${w.title} (${instLabel})`,
      amount: increment,
      category: "Aporte / Investimento",
      costType: "Variável",
      paymentMethod: "PIX",
      cardUsed: w.institution,
      status: "Pago",
      iconUrl: matchedCard?.logoUrl,
      wishlistId: w.id,
      updatedAt: new Date().toISOString()
    };
    saveTransactionsLocal([autoTx, ...transactions]);
    notify(`Você guardou ${formatBRL(increment)}!`, `Somado na caixinha "${w.title}" e registrado em Lançamentos.`, "success");
    await postToSheets({ action: "UPDATE_WISH", id: w.id, savedAmount: nextVal });
    await postToSheets({ action: "CREATE_TRANSACTION", data: autoTx });
  };

  const handleDeleteWish = async (id: string) => {
    saveWishlistLocal(wishlist.filter((w) => w.id !== id));
    await postToSheets({ action: "DELETE_WISH", id });
  };

  const handleSaveBioLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBio.weight) return;
    const weightVal = parseFloat(newBio.weight);
    const bfVal = newBio.bf ? parseFloat(newBio.bf) : undefined;
    if (editingBioId) {
      const updated = bioLogs.map((b) => (b.id === editingBioId ? { ...b, date: newBio.date, weight: weightVal, bf: bfVal } : b)).sort((a, b) => a.date.localeCompare(b.date));
      saveBioLocal(updated);
      setEditingBioId(null);
      notify("Medição Corporal Atualizada!", `${weightVal} kg`, "success");
    } else {
      const created: BioLog = { id: `bio-${Date.now()}`, date: newBio.date, weight: weightVal, bf: bfVal };
      saveBioLocal([...bioLogs, created].sort((a, b) => a.date.localeCompare(b.date)));
      notify("Medição Corporal Registrada!", `${created.weight} kg`, "success");
      await postToSheets({ action: "CREATE_BIO", data: created });
    }
    setNewBio({ date: new Date().toISOString().split("T")[0], weight: "", bf: "" });
  };

  const handleDeleteBioLog = async (id: string) => {
    saveBioLocal(bioLogs.filter((b) => b.id !== id));
    notify("Medição Removida", "", "info");
    await postToSheets({ action: "DELETE_BIO", id });
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeText(newNote.title), cleanContent = sanitizeText(newNote.content);
    if (!cleanTitle || !cleanContent) return;
    if (editingNoteId) {
      const updated = notes.map((n) => (n.id === editingNoteId ? { ...n, title: cleanTitle, content: cleanContent, tag: newNote.tag } : n));
      saveNotesLocal(updated);
      setEditingNoteId(null);
      notify("Anotação Atualizada!", cleanTitle, "success");
    } else {
      const created: BrainNote = { id: `note-${Date.now()}`, date: new Date().toISOString().split("T")[0], title: cleanTitle, content: cleanContent, tag: newNote.tag };
      saveNotesLocal([created, ...notes]);
      notify("Anotação Salva no Mural!", created.tag, "success");
      await postToSheets({ action: "CREATE_NOTE", data: created });
    }
    setNewNote({ title: "", content: "", tag: "#Ideias" });
  };

  const handleDeleteNote = async (id: string) => {
    saveNotesLocal(notes.filter((n) => n.id !== id));
    await postToSheets({ action: "DELETE_NOTE", id });
  };

  const handleAddOkr = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeText(newOkr.title);
    if (!cleanTitle || !newOkr.target) return;
    const currVal = newOkr.current ? parseFloat(newOkr.current) : 0;
    const created: PersonalOKR = { id: `okr-${Date.now()}`, title: cleanTitle, category: sanitizeText(newOkr.category), current: currVal, target: parseFloat(newOkr.target), unit: sanitizeText(newOkr.unit) };
    saveOkrs([...okrs, created]);
    setNewOkr({ title: "", category: "Carreira", current: "0", target: "100", unit: "%" });
    notify("Meta Anual Adicionada!", created.title, "success");
  };

  const handleAddAlertRule = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeText(newAlert.title);
    if (!cleanTitle || !newAlert.targetValue) return;
    const warnVal = newAlert.warningLead ? parseFloat(newAlert.warningLead) : 500;
    const rule: CustomAlertRule = { id: `al-${Date.now()}`, title: cleanTitle, type: newAlert.type, targetValue: parseFloat(newAlert.targetValue), warningLead: warnVal };
    saveAlertRules([...alertRules, rule]);
    setNewAlert({ title: "", type: "ODOMETER_KM", targetValue: "", warningLead: "500" });
    notify("Alerta Criado com Sucesso!", rule.title, "success", "CONFIG");
  };

  const expensesByCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.forEach((tx) => {
      if (getFlowType(tx.category) === "EXPENSE") {
        const prev = map[tx.category] ? map[tx.category] : 0;
        map[tx.category] = prev + tx.amount;
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions, getFlowType]);

  const lastInv = investmentChartData[investmentChartData.length - 1];
  const currentTotalPatrimony = lastInv ? lastInv.acumulado : 0;
  const remainingPatrimonyToGoal = Math.max(0, patrimonyTarget - currentTotalPatrimony);
  const monthsToPatrimonyGoal = remainingPatrimonyToGoal > 0 ? Math.ceil(remainingPatrimonyToGoal / Math.max(1, monthlyInvestmentGoal)) : 0;

  const budgetPercentage = Math.min(100, Math.round((kpis.personalSpent / Math.max(1, personalBudgetLimit)) * 100));
  const budgetRemaining = personalBudgetLimit - kpis.personalSpent;
  const moneyBlur = privacyMode ? "blur-[7px] select-none transition-all duration-300" : "transition-all duration-300";
  const pwRules = validatePasswordRules(authPassword);

  const navGroups: { groupTitle: string; items: { id: ActiveTab; label: string; badge?: string; icon: React.ReactNode }[] }[] = [
    { groupTitle: "Visão Geral", items: [{ id: "dashboard", label: "Painel Principal", icon: <LayoutDashboard className="w-4 h-4" /> }, { id: "status", label: "Meu Status Atual", badge: "Fixo", icon: <ClipboardList className="w-4 h-4" /> }] },
    {
      groupTitle: "Minhas Finanças",
      items: [
        { id: "transactions", label: "Lançamentos", badge: String(filteredTransactions.length), icon: <Table2 className="w-4 h-4" /> },
        { id: "receivables", label: "Valores a Receber", badge: String(receivableItems.filter((i) => i.status !== "Pago").length), icon: <HandCoins className="w-4 h-4" /> },
        { id: "cards", label: "Cartões e Caixinhas", icon: <CreditCard className="w-4 h-4" /> }
      ]
    },
    { groupTitle: "Veículo e Saúde", items: [{ id: "auto", label: "Meu Veículo", icon: <Car className="w-4 h-4" /> }, { id: "bio", label: "Corpo e Corridas", badge: "Strava", icon: <Activity className="w-4 h-4" /> }] },
    { groupTitle: "Ideias e Ajustes", items: [{ id: "brain", label: "Mural e Metas do Ano", badge: String(notes.length), icon: <Brain className="w-4 h-4" /> }, { id: "settings", label: "Configurações", badge: `v${APP_VERSION}`, icon: <Settings className="w-4 h-4" /> }] }
  ];

  const renderDashboardWidgetContent = (widgetId: DashboardWidgetId) => {
    switch (widgetId) {
      case "thermometer":
        return (
          <div className="space-y-3" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${budgetPercentage >= 90 ? "bg-rose-500/20 text-rose-400" : budgetPercentage >= 75 ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                  <Gauge className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-300 font-semibold">
                  Consumido no Mês: <strong className={moneyBlur}>{formatBRL(kpis.personalSpent)}</strong> ({budgetPercentage}%)
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-400">Limite Definido: <strong className={`text-slate-100 ${moneyBlur}`}>{formatBRL(personalBudgetLimit)}</strong></span>
                <span className={`px-3 py-1 rounded-full font-bold ${moneyBlur} ${budgetRemaining >= 0 ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border border-rose-500/30"}`}>
                  {budgetRemaining >= 0 ? `Livre para Gastar: ${formatBRL(budgetRemaining)}` : `Acima do Limite: ${formatBRL(Math.abs(budgetRemaining))}`}
                </span>
              </div>
            </div>
            <div className="w-full h-3.5 bg-slate-950/90 rounded-full overflow-hidden border border-white/[0.07] p-0.5">
              <div className={`h-full rounded-full transition-all duration-700 ${budgetPercentage >= 90 ? "bg-gradient-to-r from-amber-500 to-rose-500" : budgetPercentage >= 75 ? "bg-gradient-to-r from-emerald-500 to-amber-500" : "bg-gradient-to-r from-emerald-500 to-teal-400"}`} style={{ width: `${budgetPercentage}%` }} />
            </div>
          </div>
        );

      case "kpis":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" onMouseDown={(e) => e.stopPropagation()}>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold">Total Recebido</span>
                <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400"><ArrowUpRight className="w-4 h-4" /></div>
              </div>
              <p className={`text-2xl font-extrabold text-emerald-400 tracking-tight ${moneyBlur}`}>{formatBRL(kpis.totalIncome)}</p>
              <p className="text-[11px] text-slate-400 mt-1">Soma de salário, benefícios e rendas extras</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold">Total Gasto</span>
                <div className="flex items-center gap-1.5">
                  {kpis.expenseVariationPct !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${kpis.expenseVariationPct <= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
                      {kpis.expenseVariationPct > 0 ? `↑ +${kpis.expenseVariationPct}%` : `↓ ${kpis.expenseVariationPct}%`} vs. mês ant.
                    </span>
                  )}
                  <div className="p-1.5 rounded-xl bg-rose-500/15 text-rose-400"><ArrowDownRight className="w-4 h-4" /></div>
                </div>
              </div>
              <p className={`text-2xl font-extrabold text-rose-400 tracking-tight ${moneyBlur}`}>{formatBRL(kpis.totalExpenses)}</p>
              <div className={`flex items-center justify-between text-[11px] text-slate-400 mt-1 ${moneyBlur}`}>
                <span>À Vista: {formatBRL(kpis.cashExpenses)}</span>
                <span className="text-amber-400 font-medium">Fatura: {formatBRL(kpis.creditExpenses)}</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold">Saldo Livre em Conta</span>
                <div className="p-1.5 rounded-xl bg-sky-500/15 text-sky-400"><Wallet className="w-4 h-4" /></div>
              </div>
              <p className={`text-2xl font-extrabold tracking-tight ${moneyBlur} ${kpis.netCashBalance >= 0 ? "text-sky-400" : "text-rose-500"}`}>{formatBRL(kpis.netCashBalance)}</p>
              <p className="text-[11px] text-slate-400 mt-1">Disponível após contas à vista e aportes</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/30">
              <div className="flex items-center justify-between text-xs text-indigo-300 mb-2">
                <span className="font-semibold">Guardado / Investido</span>
                <div className="flex items-center gap-1.5">
                  {kpis.investVariationPct !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${kpis.investVariationPct >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                      {kpis.investVariationPct >= 0 ? `↑ +${kpis.investVariationPct}%` : `↓ ${kpis.investVariationPct}%`}
                    </span>
                  )}
                  <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400"><PiggyBank className="w-4 h-4" /></div>
                </div>
              </div>
              <p className={`text-2xl font-extrabold text-indigo-400 tracking-tight ${moneyBlur}`}>{formatBRL(kpis.totalInvested)}</p>
              <p className={`text-[11px] text-emerald-400 mt-1 font-medium ${moneyBlur}`}>Meta: {formatBRL(monthlyInvestmentGoal)} • {kpis.savingsRate}% da renda</p>
            </div>
          </div>
        );

      case "credit_chart":
        return (
          <div className="space-y-4" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/30">
                {creditAnalytics.utilizationPct}% do Limite Total Ocupado
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer"><span>Usado:</span><input type="color" value={chartTheme.creditUsedBar} onChange={(e) => updateChartThemeColor("creditUsedBar", e.target.value)} className="color-circle" /></label>
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer"><span>Livre:</span><input type="color" value={chartTheme.creditAvailableBar} onChange={(e) => updateChartThemeColor("creditAvailableBar", e.target.value)} className="color-circle" /></label>
              </div>
            </div>
            <div className={`grid grid-cols-3 gap-3 text-xs ${moneyBlur}`}>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/[0.05]"><span className="text-slate-400 block text-[10px]">Limite Total Somado</span><strong className="text-sm text-white">{formatBRL(creditAnalytics.totalLimit)}</strong></div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/[0.05]"><span className="text-slate-400 block text-[10px]">Total Usado nas Faturas</span><strong className="text-sm" style={{ color: chartTheme.creditUsedBar }}>{formatBRL(creditAnalytics.totalUsed)}</strong></div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/[0.05]"><span className="text-slate-400 block text-[10px]">Limite Livre para Compras</span><strong className="text-sm" style={{ color: chartTheme.creditAvailableBar }}>{formatBRL(creditAnalytics.totalAvailable)}</strong></div>
            </div>
            <div className="h-60 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={creditAnalytics.byCard} barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} /><YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip content={<CustomCyberTooltip isCurrency={true} />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="usado" name="Fatura Aberta (Usado)" stackId="a" fill={chartTheme.creditUsedBar} radius={[0, 0, 6, 6]} />
                  <Bar dataKey="disponivel" name="Limite Disponível" stackId="a" fill={chartTheme.creditAvailableBar} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "patrimony_chart":
        return (
          <div className="space-y-4" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                {monthsToPatrimonyGoal > 0 ? `Projeção p/ Alvo (${formatBRL(patrimonyTarget)}): ~${monthsToPatrimonyGoal} meses` : "Alvo Patrimonial Atingido!"}
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer"><span>Patrimônio:</span><input type="color" value={chartTheme.patrimonyLine} onChange={(e) => updateChartThemeColor("patrimonyLine", e.target.value)} className="color-circle" /></label>
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer"><span>Aporte:</span><input type="color" value={chartTheme.aporteLine} onChange={(e) => updateChartThemeColor("aporteLine", e.target.value)} className="color-circle" /></label>
              </div>
            </div>

            {showNotionChartConfig && (
              <div draggable={false} onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }} onMouseDown={(e) => e.stopPropagation()} className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-3 text-xs animate-tab">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-300">Linha:</span>
                    {([{ id: "monotone", label: "Suave" }, { id: "natural", label: "Curva Fluida" }, { id: "linear", label: "Reta" }, { id: "step", label: "Degrau" }] as { id: CurveType; label: string }[]).map((c) => (
                      <button key={c.id} type="button" onClick={() => setChartCurveType(c.id)} className={`px-2 py-1 rounded-lg font-semibold transition ${chartCurveType === c.id ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"}`}>{c.label}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-semibold">Espessura ({chartStrokeWidth}px):</span>
                    <input type="range" min="1" max="3.5" step="0.1" value={chartStrokeWidth} onChange={(e) => setChartStrokeWidth(parseFloat(e.target.value))} className="w-24 accent-indigo-500 cursor-ew-resize" />
                  </div>
                </div>
                <form onSubmit={handleAddMilestone} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <input type="text" required placeholder="Nome da Meta (Ex: Teto Caixinha Nubank)" value={newMilestone.label} onChange={(e) => setNewMilestone({ ...newMilestone, label: e.target.value })} className="sm:col-span-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10" />
                  <input type="number" required placeholder="Valor R$ (Ex: 5000)" value={newMilestone.value} onChange={(e) => setNewMilestone({ ...newMilestone, value: e.target.value })} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10" />
                  <div className="flex items-center gap-2">
                    <input type="color" value={newMilestone.color} onChange={(e) => setNewMilestone({ ...newMilestone, color: e.target.value })} className="color-circle shrink-0" />
                    <button type="submit" className="flex-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">+ Meta</button>
                  </div>
                </form>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {chartMilestones.map((ms) => (
                    <span key={ms.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-white/10 text-[11px]">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ms.color }} />
                      <span>{ms.label}: {formatBRL(ms.value)}</span>
                      <button type="button" onClick={() => saveMilestonesLocal(chartMilestones.filter((i) => i.id !== ms.id))} className="text-slate-400 hover:text-rose-400">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="h-68 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={investmentChartData}>
                  <defs>
                    <linearGradient id="colorPatrimonio" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartTheme.patrimonyLine} stopOpacity={0.28} /><stop offset="95%" stopColor={chartTheme.patrimonyLine} stopOpacity={0.0} /></linearGradient>
                    <linearGradient id="colorAporte" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartTheme.aporteLine} stopOpacity={0.22} /><stop offset="95%" stopColor={chartTheme.aporteLine} stopOpacity={0.0} /></linearGradient>
                  </defs>
                  {showChartGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />}
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} /><YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip content={<CustomCyberTooltip isCurrency={true} />} cursor={{ stroke: chartTheme.patrimonyLine, strokeWidth: 1, strokeDasharray: "4 4", fill: "transparent" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {chartMilestones.map((ms) => (
                    <ReferenceLine key={ms.id} y={ms.value} stroke={ms.color} strokeDasharray="4 4" strokeWidth={1.2} label={{ value: ms.label, fill: ms.color, fontSize: 10, position: "insideTopLeft" }} />
                  ))}
                  <Area type={chartCurveType} dataKey="acumulado" name="Patrimônio Acumulado" stroke={chartTheme.patrimonyLine} strokeWidth={chartStrokeWidth} dot={showChartDots ? { r: 2.5, fill: chartTheme.patrimonyLine, strokeWidth: 0 } : false} activeDot={{ r: 4.5, fill: chartTheme.patrimonyLine, strokeWidth: 0 }} fillOpacity={1} fill="url(#colorPatrimonio)" />
                  <Area type={chartCurveType} dataKey="aportado" name="Aporte no Mês" stroke={chartTheme.aporteLine} strokeWidth={chartStrokeWidth} dot={showChartDots ? { r: 2.5, fill: chartTheme.aporteLine, strokeWidth: 0 } : false} activeDot={{ r: 4.5, fill: chartTheme.aporteLine, strokeWidth: 0 }} fillOpacity={1} fill="url(#colorAporte)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "category_chart": {
        const hoveredItem = hoveredPieIndex !== null ? expensesByCategoryData[hoveredPieIndex] : null;
        const centerTitle = hoveredItem ? hoveredItem.name : "Total de Saídas";
        const centerValue = hoveredItem ? hoveredItem.value : kpis.totalExpenses;
        const centerPct = hoveredItem && kpis.totalExpenses > 0 ? `${Math.round((hoveredItem.value / kpis.totalExpenses) * 100)}% do total` : `${expensesByCategoryData.length} categorias ativas`;

        return (
          <div className="space-y-4" onMouseDown={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-64 relative select-none flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expensesByCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={64} outerRadius={92} paddingAngle={4} cornerRadius={6} stroke="none" onMouseEnter={(_, idx) => setHoveredPieIndex(idx)} onMouseLeave={() => setHoveredPieIndex(null)}>
                      {expensesByCategoryData.map((entry, idx) => {
                        const mappedCol = categoryColors[entry.name];
                        const col = mappedCol ? mappedCol : COLOR_PRESETS[idx % COLOR_PRESETS.length];
                        const isHovered = hoveredPieIndex === idx;
                        return <Cell key={idx} fill={col} style={{ outline: "none", opacity: hoveredPieIndex === null || isHovered ? 1 : 0.45, filter: isHovered ? `drop-shadow(0 0 8px ${col}88)` : "none", transition: "all 0.25s ease" }} />;
                      })}
                    </Pie>
                    <Tooltip content={<CustomCyberTooltip isCurrency={true} />} cursor={false} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 truncate max-w-[115px]">{centerTitle}</span>
                  <strong className={`text-sm font-extrabold text-white mt-0.5 ${moneyBlur}`}>{formatBRL(centerValue)}</strong>
                  <span className="text-[10px] text-indigo-400 font-semibold mt-0.5">{centerPct}</span>
                </div>
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {expensesByCategoryData.map((item, idx) => {
                  const mappedCol = categoryColors[item.name];
                  const col = mappedCol ? mappedCol : COLOR_PRESETS[idx % COLOR_PRESETS.length];
                  const pct = kpis.totalExpenses > 0 ? Math.round((item.value / kpis.totalExpenses) * 100) : 0;
                  return (
                    <div key={item.name} onMouseEnter={() => setHoveredPieIndex(idx)} onMouseLeave={() => setHoveredPieIndex(null)} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.05] hover:border-indigo-500/30 transition space-y-1.5 cursor-pointer">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-semibold text-slate-200">
                          {renderCategorySemanticIcon(item.name, col)}
                          <span className="truncate max-w-[130px]">{item.name}</span>
                        </span>
                        <span className={`font-bold text-slate-100 ${moneyBlur}`}>{formatBRL(item.value)} <span className="text-[10px] text-slate-400">({pct}%)</span></span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: col }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      case "benefits_strava":
        return (
          <div className="space-y-4" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300">Comparativo entre o auxílio recebido e seus gastos de Alimentação e Combustível:</span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${kpis.benefitsBalance >= 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border-rose-500/30"}`}>
                {kpis.benefitsBalance >= 0 ? "Benefício Sobrando" : "Completando com o Salário"}
              </span>
            </div>
            <div className={`grid grid-cols-3 gap-3 text-xs ${moneyBlur}`}>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.05]"><span className="text-slate-400 block text-[10px]">Auxílio Recebido</span><strong className="text-sm text-emerald-400">{formatBRL(kpis.benefitsReceived)}</strong></div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.05]"><span className="text-slate-400 block text-[10px]">Gasto Mercado e Posto</span><strong className="text-sm text-rose-400">{formatBRL(kpis.foodAndFuelSpent)}</strong></div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.05]"><span className="text-slate-400 block text-[10px]">Diferença no Mês</span><strong className={`text-sm ${kpis.benefitsBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatBRL(kpis.benefitsBalance)}</strong></div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-orange-500/25 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-orange-400 flex items-center gap-1.5"><Footprints className="w-4 h-4" /> Quilometragem Anual de Corrida (Strava)</span>
                <span className="text-slate-300 font-bold">{stravaStats.ytdKm} / {annualRunGoalKm} km ({stravaStats.ytdRuns} corridas)</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${Math.min(100, (stravaStats.ytdKm / Math.max(1, annualRunGoalKm)) * 100)}%` }} />
              </div>
            </div>
          </div>
        );
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#040711] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[130px]" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-[130px]" />
        </div>
        <div className="w-full max-w-md rounded-3xl bg-slate-900/85 border border-white/15 backdrop-blur-2xl p-7 shadow-2xl relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30"><Shield className="w-6 h-6" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">FinControl Life OS</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">v{APP_VERSION}</span>
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Acesso Pessoal Protegido</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-white/10 text-xs font-bold">
            <button type="button" onClick={() => { setAuthMode("login"); setAuthError(""); }} className={`py-2.5 rounded-xl transition ${authMode === "login" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>Entrar na Minha Conta</button>
            <button type="button" onClick={() => { setAuthMode("register"); setAuthError(""); }} className={`py-2.5 rounded-xl transition ${authMode === "register" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>Criar Nova Conta</button>
          </div>
          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" /><span>{authError}</span>
            </div>
          )}
          <form onSubmit={authMode === "login" ? handleLoginAccount : handleRegisterAccount} className="space-y-4 text-xs">
            {authMode === "register" && (
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950/80 border border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center overflow-hidden shrink-0">
                  {authAvatarUrl ? <img src={authAvatarUrl} alt="Perfil" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-indigo-300" />}
                </div>
                <div className="flex-1">
                  <label className="text-slate-200 font-semibold block mb-1">Foto de Perfil (Opcional)</label>
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) compressImageFileToBase64(f, (b64) => setAuthAvatarUrl(b64)); }} className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-indigo-600/20 file:text-indigo-300 file:font-semibold" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Nome de Usuário</label>
              <input type="text" required autoComplete="off" placeholder="Ex: Cabral" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Sua Senha</label>
              <div className="relative">
                <input type={showAuthPassword ? "text" : "password"} required placeholder="••••••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-indigo-500 outline-none pr-10" />
                <button type="button" onClick={() => setShowAuthPassword(!showAuthPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-white">
                  {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {authMode === "register" && (
              <>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Confirmar Senha</label>
                  <input type={showAuthPassword ? "text" : "password"} required placeholder="Digite a mesma senha novamente" value={authConfirmPassword} onChange={(e) => setAuthConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-indigo-500 outline-none" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-white/10 space-y-1 text-[11px]">
                  <span className="font-bold text-slate-300 block mb-1">Requisitos de Segurança da Senha:</span>
                  <div className={pwRules.minLength ? "text-emerald-400" : "text-slate-500"}>✓ Mínimo de 8 caracteres</div>
                  <div className={pwRules.hasUpper ? "text-emerald-400" : "text-slate-500"}>✓ Pelo menos 1 letra MAIÚSCULA (A-Z)</div>
                  <div className={pwRules.hasLower ? "text-emerald-400" : "text-slate-500"}>✓ Pelo menos 1 letra minúscula (a-z)</div>
                  <div className={pwRules.hasNumber ? "text-emerald-400" : "text-slate-500"}>✓ Pelo menos 1 número (0-9)</div>
                  <div className={pwRules.hasSpecial ? "text-emerald-400" : "text-slate-500"}>✓ Pelo menos 1 caractere especial (@, #, $, !, %...)</div>
                </div>
              </>
            )}
            <button type="submit" className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition flex items-center justify-center gap-2 ${authMode === "login" ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500" : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500"}`}>
              {authMode === "login" ? <><Lock className="w-4 h-4" /> Entrar no Sistema</> : <><UserPlus className="w-4 h-4" /> Concluir Cadastro</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      data-theme={themeMode}
      className={`min-h-screen flex flex-col relative overflow-x-hidden pb-20 lg:pb-0 selection:bg-indigo-500 selection:text-white transition-colors duration-300 theme-${themeMode} ${
        themeMode === "branco"
          ? "bg-[#f1f5f9] text-[#0f172a]"
          : themeMode === "tradicional"
          ? "bg-[#0f172a] text-slate-100"
          : "bg-[#040711] text-slate-100"
      }`}
    >
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px) scale(0.995); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes toastSlideIn { from { opacity: 0; transform: translateX(40px) scale(0.95); } to { opacity: 1; transform: translateX(0) scale(1); } }
        .animate-tab { animation: fadeSlideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-toast { animation: toastSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .cyber-grid { background-size: 36px 36px; background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px); }
        .color-circle { -webkit-appearance: none; -moz-appearance: none; appearance: none; width: 24px; height: 24px; background-color: transparent; border: none; cursor: pointer; border-radius: 9999px; overflow: hidden; padding: 0; }
        .color-circle::-webkit-color-swatch-wrapper { padding: 0; }
        .color-circle::-webkit-color-swatch { border: 2px solid rgba(148,163,184,0.45); border-radius: 9999px; }
        .color-circle::-moz-color-swatch { border: 2px solid rgba(148,163,184,0.45); border-radius: 9999px; }

        /* 1. MODO NOTURNO (CYBER DARK) */
        .theme-noturno .glass-card {
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.78) 0%, rgba(9, 14, 28, 0.88) 100%);
          backdrop-filter: blur(16px);
          box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.07), 0 10px 30px -10px rgba(0, 0, 0, 0.5);
        }

        /* 2. MODO TRADICIONAL (SLATE CORPORATIVO) */
        .theme-tradicional {
          background-color: #0f172a !important;
          color: #f1f5f9 !important;
        }
        .theme-tradicional .cyber-grid {
          opacity: 0.35;
        }
        .theme-tradicional header,
        .theme-tradicional aside,
        .theme-tradicional nav {
          background-color: #1e293b !important;
          border-color: rgba(148, 163, 184, 0.22) !important;
        }
        .theme-tradicional .glass-card {
          background: linear-gradient(180deg, #1e293b 0%, #172033 100%) !important;
          border-color: rgba(148, 163, 184, 0.24) !important;
          box-shadow: 0 10px 25px -5px rgba(2, 6, 23, 0.45) !important;
        }
        .theme-tradicional [class*="bg-slate-950"] {
          background-color: #0f172a !important;
          border-color: rgba(148, 163, 184, 0.2) !important;
        }

        /* 3. MODO BRANCO (LIGHT / DIURNO COMPLETO) */
        .theme-branco {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
        }
        .theme-branco .cyber-grid {
          display: none !important;
        }
        .theme-branco header,
        .theme-branco aside,
        .theme-branco nav {
          background-color: rgba(255, 255, 255, 0.96) !important;
          border-color: #cbd5e1 !important;
          color: #0f172a !important;
          box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04) !important;
        }
        .theme-branco .glass-card {
          background: #ffffff !important;
          border-color: #cbd5e1 !important;
          color: #0f172a !important;
          box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06) !important;
        }
        .theme-branco h1,
        .theme-branco h2,
        .theme-branco h3,
        .theme-branco h4,
        .theme-branco strong,
        .theme-branco th,
        .theme-branco td,
        .theme-branco [class*="text-white"],
        .theme-branco [class*="text-slate-100"],
        .theme-branco [class*="text-slate-200"] {
          color: #0f172a !important;
        }
        .theme-branco [class*="text-slate-300"],
        .theme-branco [class*="text-slate-400"] {
          color: #475569 !important;
        }
        .theme-branco input:not([type="color"]):not([type="range"]),
        .theme-branco select,
        .theme-branco textarea {
          background-color: #f8fafc !important;
          color: #0f172a !important;
          border-color: #cbd5e1 !important;
        }
        .theme-branco [class*="bg-slate-950"],
        .theme-branco [class*="bg-slate-900"] {
          background-color: #f8fafc !important;
          color: #0f172a !important;
          border-color: #e2e8f0 !important;
        }
        .theme-branco thead {
          background-color: #f1f5f9 !important;
        }
        .theme-branco [class*="border-white"] {
          border-color: #e2e8f0 !important;
        }

        .recharts-wrapper, .recharts-surface, .recharts-layer, .recharts-sector, .recharts-curve, .recharts-dot, .recharts-active-dot, .recharts-tooltip-wrapper, svg, svg * {
          outline: none !important; box-shadow: none !important; -webkit-tap-highlight-color: transparent !important;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden cyber-grid">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="fixed bottom-20 lg:bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div key={t.id} className={`pointer-events-auto animate-toast p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 ${t.type === "success" ? "bg-slate-900/95 border-emerald-500/40 text-emerald-300" : t.type === "warning" ? "bg-slate-900/95 border-amber-500/40 text-amber-300" : "bg-slate-900/95 border-indigo-500/40 text-indigo-300"}`}>
            <div className="p-1.5 rounded-lg bg-white/5 mt-0.5">{t.type === "success" ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}</div>
            <div className="flex-1 text-xs">
              <strong className="block text-slate-100 font-semibold">{t.title}</strong>
              {t.subtitle && <span className="text-slate-400 text-[11px]">{t.subtitle}</span>}
            </div>
          </div>
        ))}
      </div>

      <header className="sticky top-0 z-40 bg-[#070b19]/80 backdrop-blur-xl border-b border-white/[0.07] px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Recolher ou Expandir Menu Lateral" className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all">
            <Wallet className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white">FinControl BI & Auto</h1>
              <button type="button" onClick={() => setShowChangelogModal(true)} title="Clique para abrir o Changelog de versões" className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-mono font-bold flex items-center gap-1 transition">
                <History className="w-3 h-3" /> v{APP_VERSION}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">ERP Pessoal de Finanças, Parcelamentos, Veículo, Saúde e Objetivos</p>
          </div>
        </div>

        <button onClick={() => setShowCommandBar(true)} className="hidden xl:flex items-center justify-between gap-8 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/[0.08] text-xs text-slate-400 transition group w-60">
          <span className="flex items-center gap-2"><Search className="w-3.5 h-3.5 text-indigo-400" /> Buscar aba ou comando...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-950 text-slate-300 rounded border border-slate-800">Ctrl K</kbd>
        </button>

        <div className="flex items-center gap-2">
          <ThemeSegmentedControl themeMode={themeMode} onChange={changeThemeMode} />

          <button onClick={() => setPrivacyMode(!privacyMode)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${privacyMode ? "bg-amber-500/15 border-amber-500/40 text-amber-400" : "bg-slate-900/80 border-white/[0.08] text-slate-300 hover:bg-slate-800"}`}>
            {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden md:inline">{privacyMode ? "Oculto" : "Privacidade"}</span>
          </button>

          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2.5 rounded-xl bg-slate-900/80 border border-white/[0.08] hover:bg-slate-800 text-slate-300 transition">
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold flex items-center justify-center text-white animate-pulse">{activeAlerts.length}</span>}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 rounded-2xl glass-card border border-white/15 shadow-2xl p-4 z-50 space-y-3 animate-tab">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Central de Avisos e Lembretes</span>
                  <button onClick={() => { setShowNotifications(false); setActiveTab("settings"); }} className="text-[11px] text-indigo-400 hover:underline font-medium">+ Configurar</button>
                </div>
                {activeAlerts.length === 0 ? <p className="text-xs text-slate-400 py-3 text-center">Tudo em dia! Nenhum alerta pendente.</p> : activeAlerts.map((al) => (
                  <div key={al.id} className={`p-3 rounded-xl border text-xs ${al.severity === "high" ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400"}`}>
                    <strong className="block mb-0.5">{al.title}</strong>
                    <span className="text-slate-300 text-[11px]">{al.detail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleTurnTheMonth} title="Lançar automaticamente todas as suas rendas e despesas fixas no próximo mês" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/30 text-xs font-semibold transition">
            <Calendar className="w-4 h-4" />
            <span className="hidden md:inline">Virar o Mês</span>
          </button>

          <button onClick={() => handleOpenNewTxModal()} className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition">
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>

          <label title="Clique para trocar sua foto de perfil" className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 cursor-pointer transition">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center overflow-hidden border border-white/20 shrink-0">
              {currentUserAvatar ? <img src={currentUserAvatar} alt={currentUser} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-white" />}
            </div>
            <span className="text-xs font-bold text-slate-200 hidden md:inline">{currentUser}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpdateProfileAvatar(f); }} />
          </label>

          <button onClick={handleLogout} title="Sair da Conta" className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1640px] w-full mx-auto relative z-10">
        <aside className={`${sidebarCollapsed ? "lg:w-20" : "lg:w-68"} hidden lg:flex bg-[#070b19]/60 backdrop-blur-xl border-r border-white/[0.06] p-4 flex-col gap-4 transition-all duration-300`}>
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-1">
              {!sidebarCollapsed && <span className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{group.groupTitle}</span>}
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} title={item.label} className={`group relative flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${isActive ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-400/30" : "text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400 border border-transparent"}`}>
                    <div className="flex items-center gap-3">
                      <span className={isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400 transition"}>{item.icon}</span>
                      {!sidebarCollapsed && <span className={isActive ? "!text-white" : ""}>{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && item.badge && <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${isActive ? "bg-white/20 !text-white" : "bg-slate-800/90 text-slate-400"}`}>{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}

          {!sidebarCollapsed && (
            <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-white/[0.06]">
              <button type="button" onClick={() => setShowChangelogModal(true)} className="px-3 py-2 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-white/[0.06] flex items-center justify-between text-[11px] transition">
                <span className="text-slate-400 flex items-center gap-1.5"><History className="w-3.5 h-3.5 text-indigo-400" /> Changelog</span>
                <span className="font-mono font-bold text-emerald-400">v{PREVIOUS_VERSION} → v{APP_VERSION}</span>
              </button>
              <button onClick={syncFromGoogleSheets} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900/90 border border-white/[0.08] hover:border-indigo-500/40 text-xs text-indigo-400 font-semibold transition">
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} /> Sincronizar Planilha
              </button>
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-semibold hover:bg-rose-500/20 transition">
                <LogOut className="w-3.5 h-3.5" /> Sair da Conta ({currentUser})
              </button>
            </div>
          )}
        </aside>

        <main key={activeTab} className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto animate-tab">
          {activeTab === "dashboard" ? (
            <div className="space-y-6">
              <div className="glass-card p-4 rounded-2xl border border-white/[0.07] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400"><LayoutDashboard className="w-4 h-4" /></div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-100">Painel Principal da Sua Vida Financeira</h2>
                    <p className="text-xs text-slate-400">Acompanhe seus resultados do mês e organize a posição dos blocos segurando pelo botão <strong>⋮⋮ Mover</strong>.</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input type="month" value={selectedMonth === "ALL" ? "" : selectedMonth} onChange={(e) => setSelectedMonth(e.target.value ? e.target.value : "ALL")} className="px-3 py-1.5 rounded-xl text-xs bg-slate-950/90 border border-white/10 text-slate-200 outline-none" />
                  <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="px-3 py-1.5 rounded-xl text-xs bg-slate-950/90 border border-white/10 text-slate-200 outline-none">
                    <option value="ALL">Todos os Métodos</option>
                    {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={filterCostType} onChange={(e) => setFilterCostType(e.target.value)} className="px-3 py-1.5 rounded-xl text-xs bg-slate-950/90 border border-white/10 text-slate-200 outline-none">
                    <option value="ALL">Fixos e Variáveis</option>
                    <option value="Fixo">Somente Fixos</option>
                    <option value="Variável">Somente Variáveis</option>
                  </select>
                  <button type="button" onClick={() => { saveDashboardLayout(DEFAULT_DASHBOARD_LAYOUT); notify("Ordem Original Restaurada!", "", "info", "CONFIG"); }} className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 flex items-center gap-1 transition">
                    <RotateCcw className="w-3.5 h-3.5" /> Restaurar Ordem
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dashboardLayout.map((widget) => {
                  const isBeingDragged = draggedWidgetId === widget.id;
                  const isDragTarget = dragOverWidgetId === widget.id && draggedWidgetId !== widget.id;
                  return (
                    <div
                      key={widget.id}
                      draggable={armedDragWidgetId === widget.id}
                      onDragStart={(e) => handleWidgetDragStart(e, widget.id)}
                      onDragOver={(e) => handleWidgetDragOver(e, widget.id)}
                      onDrop={() => handleWidgetDrop(widget.id)}
                      onDragEnd={() => { setDraggedWidgetId(null); setDragOverWidgetId(null); setArmedDragWidgetId(null); }}
                      className={`${widget.span === 2 ? "lg:col-span-2" : "lg:col-span-1"} glass-card p-5 sm:p-6 rounded-2xl border transition-all duration-200 ${isBeingDragged ? "opacity-40 scale-[0.98] border-indigo-500" : isDragTarget ? "border-emerald-400 ring-2 ring-emerald-500/30" : "border-white/[0.08]"}`}
                    >
                      <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-white/[0.06]">
                        <div>
                          <h3 className="text-sm font-bold text-white">{widget.title}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{widget.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {widget.id === "patrimony_chart" && (
                            <button
                              type="button"
                              onClick={() => setShowNotionChartConfig(!showNotionChartConfig)}
                              title="Personalizar gráfico e metas"
                              className={`p-1.5 rounded-lg border transition ${
                                showNotionChartConfig ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900/90 hover:bg-slate-800 border-white/10 text-slate-300"
                              }`}
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div onMouseDown={() => setArmedDragWidgetId(widget.id)} onMouseUp={() => setArmedDragWidgetId(null)} title="Segure aqui e arraste para mudar este bloco de lugar" className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-indigo-500/20 border border-white/10 text-[10px] text-slate-300 flex items-center gap-1 cursor-grab active:cursor-grabbing select-none transition">
                            <GripVertical className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="hidden sm:inline">Mover</span>
                          </div>
                          <button type="button" onClick={() => toggleWidgetSpan(widget.id)} className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-[10px] font-mono text-slate-300 flex items-center gap-1 transition">
                            {widget.span === 2 ? <><Minimize2 className="w-3 h-3 text-indigo-400" /> 100%</> : <><Maximize2 className="w-3 h-3 text-emerald-400" /> 1/2</>}
                          </button>
                        </div>
                      </div>
                      {renderDashboardWidgetContent(widget.id)}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <SecondaryTabs
              activeTab={activeTab}
              moneyBlur={moneyBlur}
              currentUser={currentUser}
              currentUserAvatar={currentUserAvatar}
              themeMode={themeMode}
              changeThemeMode={changeThemeMode}
              setShowChangelogModal={setShowChangelogModal}
              staticStatus={staticStatus}
              editingStatusId={editingStatusId}
              setEditingStatusId={setEditingStatusId}
              newStatusItem={newStatusItem}
              setNewStatusItem={setNewStatusItem}
              handleSaveStaticStatus={handleSaveStaticStatus}
              saveStaticStatus={saveStaticStatus}
              filteredTransactions={filteredTransactions}
              transactions={transactions}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleExportCSV={handleExportCSV}
              handleOpenNewTxModal={handleOpenNewTxModal}
              getFlowType={getFlowType}
              cards={cards}
              categoryColors={categoryColors}
              handleToggleStatus={handleToggleStatus}
              handleStartEditTransaction={handleStartEditTransaction}
              handleDeleteTransaction={handleDeleteTransaction}
              receivableItems={receivableItems}
              receivablesAnalytics={receivablesAnalytics}
              handleAssignDebtor={handleAssignDebtor}
              handlePartialPaymentReceivable={handlePartialPaymentReceivable}
              notify={notify}
              editingCardId={editingCardId}
              setEditingCardId={setEditingCardId}
              newCard={newCard}
              setNewCard={setNewCard}
              handleSaveCard={handleSaveCard}
              handleDeleteCard={handleDeleteCard}
              handlePayCardInvoice={handlePayCardInvoice}
              wishlist={wishlist}
              editingWishId={editingWishId}
              setEditingWishId={setEditingWishId}
              newWish={newWish}
              setNewWish={setNewWish}
              handleSaveWish={handleSaveWish}
              handleIncrementWish={handleIncrementWish}
              handleDeleteWish={handleDeleteWish}
              personalBudgetLimit={personalBudgetLimit}
              autoMetrics={autoMetrics}
              chartTheme={chartTheme}
              updateChartThemeColor={updateChartThemeColor}
              stravaStats={stravaStats}
              isSyncingStrava={isSyncingStrava}
              syncStravaFromApi={syncStravaFromApi}
              bioLogs={bioLogs}
              editingBioId={editingBioId}
              setEditingBioId={setEditingBioId}
              newBio={newBio}
              setNewBio={setNewBio}
              handleSaveBioLog={handleSaveBioLog}
              handleDeleteBioLog={handleDeleteBioLog}
              okrs={okrs}
              saveOkrs={saveOkrs}
              newOkr={newOkr}
              setNewOkr={setNewOkr}
              handleAddOkr={handleAddOkr}
              notes={notes}
              selectedNoteTag={selectedNoteTag}
              setSelectedNoteTag={setSelectedNoteTag}
              editingNoteId={editingNoteId}
              setEditingNoteId={setEditingNoteId}
              newNote={newNote}
              setNewNote={setNewNote}
              handleSaveNote={handleSaveNote}
              handleDeleteNote={handleDeleteNote}
              handleExportFullBackupJSON={handleExportFullBackupJSON}
              handleImportFullBackupJSON={handleImportFullBackupJSON}
              handleUpdateProfileAvatar={handleUpdateProfileAvatar}
              sheetApiUrl={sheetApiUrl}
              setSheetApiUrl={setSheetApiUrl}
              isSyncing={isSyncing}
              syncFromGoogleSheets={syncFromGoogleSheets}
              stravaConfig={stravaConfig}
              setStravaConfig={setStravaConfig}
              paymentMethods={paymentMethods}
              newMethodName={newMethodName}
              setNewMethodName={setNewMethodName}
              handleAddPaymentMethod={handleAddPaymentMethod}
              handleDeletePaymentMethod={handleDeletePaymentMethod}
              categoriesCatalog={categoriesCatalog}
              newCategoryForm={newCategoryForm}
              setNewCategoryForm={setNewCategoryForm}
              handleAddCustomCategory={handleAddCustomCategory}
              handleDeleteCategory={handleDeleteCategory}
              monthlyInvestmentGoal={monthlyInvestmentGoal}
              patrimonyTarget={patrimonyTarget}
              annualRunGoalKm={annualRunGoalKm}
              setPersonalBudgetLimit={setPersonalBudgetLimit}
              setMonthlyInvestmentGoal={setMonthlyInvestmentGoal}
              setPatrimonyTarget={setPatrimonyTarget}
              setAnnualRunGoalKm={setAnnualRunGoalKm}
              updateGoalsStorage={updateGoalsStorage}
              alertRules={alertRules}
              saveAlertRules={saveAlertRules}
              newAlert={newAlert}
              setNewAlert={setNewAlert}
              handleAddAlertRule={handleAddAlertRule}
              systemLogs={systemLogs}
              setSystemLogs={setSystemLogs}
              logFilter={logFilter}
              setLogFilter={setLogFilter}
            />
          )}
        </main>
      </div>

      {/* BARRA DE NAVEGAÇÃO INFERIOR MOBILE (BOTTOM NAV v1.0) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b19]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around">
        {[
          { id: "dashboard" as ActiveTab, label: "Painel", icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: "transactions" as ActiveTab, label: "Extrato", icon: <Table2 className="w-4 h-4" /> },
          { id: "receivables" as ActiveTab, label: "A Receber", icon: <HandCoins className="w-4 h-4" /> }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-semibold transition ${
              activeTab === item.id ? "text-indigo-400" : "text-slate-400"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        <button
          onClick={() => handleOpenNewTxModal()}
          className="p-3 -mt-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 border border-white/20"
        >
          <Plus className="w-5 h-5" />
        </button>

        {[
          { id: "cards" as ActiveTab, label: "Cartões", icon: <CreditCard className="w-4 h-4" /> },
          { id: "auto" as ActiveTab, label: "Veículo", icon: <Car className="w-4 h-4" /> },
          { id: "settings" as ActiveTab, label: "Ajustes", icon: <Settings className="w-4 h-4" /> }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-semibold transition ${
              activeTab === item.id ? "text-indigo-400" : "text-slate-400"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {showChangelogModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl glass-card border border-white/15 p-6 space-y-4 animate-tab max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2"><History className="w-4 h-4 text-emerald-400" /> Changelog — Evolução do Sistema (v{APP_VERSION})</h3>
              <button onClick={() => setShowChangelogModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              {CHANGELOG_HISTORY.map((rel) => (
                <div key={rel.version} className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">v{rel.version}</span>
                    <span className="text-slate-400 font-mono">{rel.date}</span>
                  </div>
                  <strong className="block text-sm text-white">{rel.title}</strong>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside">
                    {rel.highlights.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCommandBar && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center pt-24 p-4">
          <div className="w-full max-w-lg rounded-2xl glass-card border border-white/15 shadow-2xl overflow-hidden animate-tab">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Search className="w-4 h-4 text-indigo-400" />
              <input type="text" autoFocus placeholder="Digite o nome de uma aba ou comando..." value={commandQuery} onChange={(e) => setCommandQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none text-white" />
              <button onClick={() => setShowCommandBar(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto space-y-1 text-xs">
              {navGroups.flatMap((g) => g.items).filter((i) => i.label.toLowerCase().includes(commandQuery.toLowerCase())).map((item) => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setShowCommandBar(false); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-indigo-500/10 text-left transition">
                  <span className="flex items-center gap-2.5 text-slate-200">{item.icon} {item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showNewTxModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl glass-card border border-white/15 p-6 space-y-4 animate-tab max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-400" /> {editingTxId ? "Editar Lançamento" : "Novo Lançamento (v1.0)"}</h3>
              <button onClick={() => { setShowNewTxModal(false); setEditingTxId(null); }} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveTransaction} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-slate-400 mb-1">Data</label><input type="date" required value={newTx.date} onChange={(e) => setNewTx({ ...newTx, date: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" /></div>
                <div><label className="block text-slate-400 mb-1">Valor Total (R$)</label><input type="number" step="0.01" required placeholder="0,00" value={newTx.amount} onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" /></div>
              </div>
              <div><label className="block text-slate-400 mb-1">Descrição</label><input type="text" required placeholder="Ex: Abastecimento, Supermercado, Empréstimo..." value={newTx.description} onChange={(e) => setNewTx({ ...newTx, description: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400">Categoria</label>
                    <button type="button" onClick={() => setShowQuickAddCatModal(!showQuickAddCatModal)} className="text-[10px] text-indigo-400 hover:underline font-bold">+ Nova</button>
                  </div>
                  <select value={newTx.category} onChange={(e) => setNewTx({ ...newTx, category: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10">
                    {categoriesCatalog.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tipo de Custo</label>
                  <select value={newTx.costType} onChange={(e) => setNewTx({ ...newTx, costType: e.target.value as CostType })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10">
                    <option value="Variável">Variável</option><option value="Fixo">Fixo (Repete ao Virar o Mês)</option>
                  </select>
                </div>
              </div>

              {showQuickAddCatModal && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
                  <span className="font-bold text-indigo-400 block">Criar Nova Categoria Rápida:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Nome da Categoria" value={newCategoryForm.name} onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })} className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10" />
                    <select value={newCategoryForm.flow} onChange={(e) => setNewCategoryForm({ ...newCategoryForm, flow: e.target.value as FlowType })} className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10">
                      <option value="EXPENSE">Despesa</option><option value="INCOME">Receita</option><option value="INVESTMENT">Investimento</option>
                    </select>
                  </div>
                  <button type="button" onClick={handleAddCustomCategory} className="w-full py-1.5 rounded-lg bg-indigo-600 text-white font-bold">Salvar Categoria</button>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-indigo-400" /> Cor da Categoria "{newTx.category}"</span>
                  <input type="color" value={categoryColors[newTx.category] ? categoryColors[newTx.category] : "#6366f1"} onChange={(e) => updateCategoryColor(newTx.category, e.target.value)} className="color-circle" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {COLOR_PRESETS.map((hex) => (
                    <button key={hex} type="button" onClick={() => updateCategoryColor(newTx.category, hex)} className={`w-5 h-5 rounded-full transition transform ${categoryColors[newTx.category] === hex ? "scale-125 ring-2 ring-indigo-400" : "opacity-75 hover:opacity-100"}`} style={{ backgroundColor: hex }} />
                  ))}
                </div>
              </div>

              {getFlowType(newTx.category) === "INVESTMENT" && !editingTxId && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-1.5">
                  <label className="block text-indigo-400 font-semibold">Somar este Valor em Alguma Caixinha de Objetivo? (Opcional)</label>
                  <select value={newTx.wishlistId} onChange={(e) => setNewTx({ ...newTx, wishlistId: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-indigo-500/40 text-white">
                    <option value="">Não vincular (Apenas Aporte Geral)</option>
                    {wishlist.map((w) => <option key={w.id} value={w.id}>{w.title} ({w.institution}) — Guardado: {formatBRL(w.savedAmount)}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400">Método de Pagamento</label>
                    <button type="button" onClick={() => setShowQuickAddMethodModal(!showQuickAddMethodModal)} className="text-[10px] text-emerald-400 hover:underline font-bold">+ Novo</button>
                  </div>
                  <select value={newTx.paymentMethod} onChange={(e) => setNewTx({ ...newTx, paymentMethod: e.target.value as PaymentMethod })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10">
                    {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                {newTx.paymentMethod === "Cartão de Crédito" && (
                  <div>
                    <label className="block text-indigo-400 mb-1 font-semibold">Cartão Utilizado</label>
                    <select value={newTx.cardUsed} onChange={(e) => setNewTx({ ...newTx, cardUsed: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/50">
                      {cards.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {!editingTxId && (newTx.paymentMethod === "Cartão de Crédito" || newTx.category === "A Receber") && (
                <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-violet-400 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Parcelamento Automático</span>
                    <span className="text-[10px] text-slate-400">Divide o valor total e lança nos meses seguintes</span>
                  </div>
                  <select
                    value={newTx.installments}
                    onChange={(e) => setNewTx({ ...newTx, installments: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-violet-500/40 text-white font-bold"
                  >
                    {Array.from({ length: 24 }, (_, idx) => idx + 1).map((n) => (
                      <option key={n} value={String(n)}>
                        {n === 1 ? "1x (À Vista)" : `${n}x de ${newTx.amount ? formatBRL(parseFloat(newTx.amount) / n) : "R$ 0,00"}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {showQuickAddMethodModal && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex gap-2">
                  <input type="text" placeholder="Nome do Método (Ex: Cartão ECX)" value={newMethodName} onChange={(e) => setNewMethodName(e.target.value)} className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10" />
                  <button type="button" onClick={handleAddPaymentMethod} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold">Salvar</button>
                </div>
              )}

              {isAutoCategory(newTx.category) && (
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Quilometragem Atual (KM)" value={newTx.km} onChange={(e) => setNewTx({ ...newTx, km: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/50" />
                  <input type="number" step="0.1" placeholder="Litros Abastecidos" value={newTx.liters} onChange={(e) => setNewTx({ ...newTx, liters: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/50" />
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Anexar Imagem Personalizada (Opcional)</label>
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) compressImageFileToBase64(f, (b64) => setNewTx((p) => ({ ...p, iconUrl: b64 }))); }} className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-600/20 file:text-emerald-300 file:font-semibold" />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => { setShowNewTxModal(false); setEditingTxId(null); }} className="px-4 py-2.5 rounded-xl border border-white/10">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg">{editingTxId ? "✓ Salvar Alterações" : "Confirmar Lançamento"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}