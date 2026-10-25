"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  Car,
  Activity,
  Brain,
  Settings,
  Plus,
  Bell,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  LayoutDashboard,
  HandCoins,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  Loader2,
  Command,
  Filter,
  Download,
  Database
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import SecondaryTabs from "./SecondaryTabs";
import CoindexAuthScreen from "./components/CoindexAuthScreen";
import { CoindexLogoHorizontal, CoindexIcon } from "./components/CoindexLogo";
import {
  CostType,
  TxStatus,
  FlowType,
  ThemeMode,
  ActiveTab,
  DashboardWidgetConfig,
  Transaction,
  CreditCardItem,
  StaticStatusItem,
  WishlistItem,
  BioLog,
  StravaStats,
  BrainNote,
  PersonalOKR,
  CustomAlertRule,
  ChartMilestone,
  ChartThemeColors,
  CategoryCatalogItem,
  ToastMessage,
  SystemLogEntry,
  CHANGELOG_HISTORY,
  sanitizeText,
  normalizeStatus,
  formatBRL,
  addMonthsToDate,
  getPreviousMonthPrefix,
  compressImageFileToBase64,
  DEFAULT_CATEGORIES_CATALOG,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_CATEGORY_COLORS,
  DEFAULT_CHART_THEME,
  DEFAULT_DASHBOARD_LAYOUT,
  getAutomaticStatus,
  INITIAL_CARDS,
  INITIAL_TRANSACTIONS,
  INITIAL_DEBTOR_MAP,
  INITIAL_STATIC_STATUS,
  INITIAL_MILESTONES,
  INITIAL_WISHLIST,
  INITIAL_BIO_LOGS,
  INITIAL_NOTES,
  INITIAL_OKRS,
  INITIAL_ALERT_RULES,
  HISTORICAL_INVESTMENTS,
  CustomCyberTooltip,
  ThemeSegmentedControl,
  renderCategorySemanticIcon
} from "./lifeos-data";
import {
  fetchAllCoindexData,
  migrateAllStateToSupabase,
  upsertTransactionsInDb,
  deleteTransactionInDb,
  upsertCardInDb,
  deleteCardInDb,
  syncStaticStatusListInDb,
  upsertWishInDb,
  deleteWishInDb,
  upsertBioLogInDb,
  deleteBioLogInDb,
  syncOkrsListInDb,
  upsertNoteInDb,
  deleteNoteInDb,
  syncCategoriesInDb,
  syncPaymentMethodsInDb,
  syncAlertRulesInDb,
  updateUserSettingsInDb,
  insertSystemLogInDb,
  clearSystemLogsInDb
} from "./lib/services/coindex-supabase";

import ChartCard from "./components/ChartCard";
import {
  ChartKind,
  ChartLineCurve,
  ChartWidgetSettings,
  ChartWidgetSize,
  DEFAULT_CHART_WIDGET_SETTINGS
} from "./components/ChartSettingsPopover";
import SpotifyLogo from "./components/SpotifyLogo";
import SpotifyModule from "./components/SpotifyModule";

type QuickFilterType = "ALL" | "FIXO" | "VARIAVEL" | "CARTAO" | "PIX";

interface StravaCredentials {
  athleteId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export default function CoindexApp() {
  const [isHydrated, setIsHydrated] = useState(false);

  // Autenticação e Estado no Supabase
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>("");
  const [hasOwner, setHasOwner] = useState<boolean>(false);
  const [ownerUsername, setOwnerUsername] = useState<string | null>(null);
  const [sheetsConfigured, setSheetsConfigured] = useState<boolean>(true);
  const [cloudAuthError, setCloudAuthError] = useState<string | null>(null);
  const [cloudLoadedForUser, setCloudLoadedForUser] = useState<string | null>(null);

  // Navegação, Command Palette (Ctrl+K), Filtros Rápidos e Tema
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [themeMode, setThemeMode] = useState<ThemeMode>("tradicional");
  const [privacyMode, setPrivacyMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("2026-10");
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>("ALL");
  const [curveType] = useState<ChartLineCurve>("monotone");
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  // Notificações com opção "Visualizar"
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [bellViewMode, setBellViewMode] = useState<"unread" | "viewed">("unread");
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Dados Principais do Sistema
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [debtorMap, setDebtorMap] = useState<Record<string, string>>(INITIAL_DEBTOR_MAP);
  const [cards, setCards] = useState<CreditCardItem[]>(INITIAL_CARDS);
  const [staticStatus, setStaticStatus] = useState<StaticStatusItem[]>(INITIAL_STATIC_STATUS);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const [bioLogs, setBioLogs] = useState<BioLog[]>(INITIAL_BIO_LOGS);
  const [notes, setNotes] = useState<BrainNote[]>(INITIAL_NOTES);
  const [okrs, setOkrs] = useState<PersonalOKR[]>(INITIAL_OKRS);
  const [alertRules, setAlertRules] = useState<CustomAlertRule[]>(INITIAL_ALERT_RULES);
  const [milestones] = useState<ChartMilestone[]>(INITIAL_MILESTONES);
  const [dashboardLayout, setDashboardLayout] = useState<DashboardWidgetConfig[]>(DEFAULT_DASHBOARD_LAYOUT);

  const [chartConfigs, setChartConfigs] = useState<Record<string, ChartWidgetSettings>>({});
  const [draggingWidgetId, setDraggingWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);

  const getWidgetSettings = (
    widgetId: string,
    defaultColor = "auto",
    fallbackCurve: ChartLineCurve = "monotone"
  ): ChartWidgetSettings => {
    const base: ChartWidgetSettings = {
      ...DEFAULT_CHART_WIDGET_SETTINGS,
      color: defaultColor,
      curveType: fallbackCurve
    };
    const saved: Partial<ChartWidgetSettings> | undefined = chartConfigs[widgetId];
    return saved ? { ...base, ...saved } : base;
  };

  const handleUpdateWidgetSettings = (widgetId: string, next: ChartWidgetSettings) => {
    setChartConfigs((prev) => {
      const updated = { ...prev, [widgetId]: next };
      try {
        localStorage.setItem("lifeos_chart_configs_v1", JSON.stringify(updated));
      } catch {
        // Ignora erro de quota local
      }
      if (currentUser) {
        void updateUserSettingsInDb({ chartConfigs: updated });
      }
      return updated;
    });
  };

  const handleUpdateWidgetSize = (widgetId: string, nextSize: ChartWidgetSize) => {
    setDashboardLayout((prev) => {
      const updated = prev.map((w) => (w.id === widgetId ? { ...w, size: nextSize } : w));
      try {
        localStorage.setItem("lifeos_dash_layout_v1", JSON.stringify(updated));
      } catch {
        // Ignora erro de quota local
      }
      if (currentUser) {
        void updateUserSettingsInDb({ dashboardLayout: updated });
      }
      return updated;
    });
  };

  const handleDragStartWidget = (id: string) => {
    setDraggingWidgetId(id);
  };

  const handleDragEnterWidget = (targetId: string) => {
    if (!draggingWidgetId || draggingWidgetId === targetId) return;
    setDragOverWidgetId(targetId);

    setDashboardLayout((prev) => {
      const fromIndex = prev.findIndex((w) => w.id === draggingWidgetId);
      const toIndex = prev.findIndex((w) => w.id === targetId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev;

      const reordered = [...prev];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);
      return reordered;
    });
  };

  const handleDragEndWidget = () => {
    setDraggingWidgetId(null);
    setDragOverWidgetId(null);
    setDashboardLayout((currentLayout) => {
      try {
        localStorage.setItem("lifeos_dash_layout_v1", JSON.stringify(currentLayout));
      } catch {
        // Ignora erro local
      }
      if (currentUser) {
        void updateUserSettingsInDb({ dashboardLayout: currentLayout });
      }
      return currentLayout;
    });
  };

  const applyZeroHandling = <T extends Record<string, unknown>>(
    rows: T[],
    numericKeys: string[],
    zeroHandling: "include" | "omit"
  ): T[] => {
    if (zeroHandling === "include") return rows;
    return rows.map((row) => {
      const clone: Record<string, unknown> = { ...row };
      for (const k of numericKeys) {
        if (Number(clone[k]) === 0) {
          clone[k] = null;
        }
      }
      return clone as T;
    });
  };

  // Catálogos e Cores
  const [categoriesCatalog, setCategoriesCatalog] = useState<CategoryCatalogItem[]>(DEFAULT_CATEGORIES_CATALOG);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>(DEFAULT_CATEGORY_COLORS);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(DEFAULT_PAYMENT_METHODS);
  const [chartTheme, setChartTheme] = useState<ChartThemeColors>(DEFAULT_CHART_THEME);

  // Metas
  const [personalBudgetLimit, setPersonalBudgetLimit] = useState(350);
  const [monthlyInvestmentGoal, setMonthlyInvestmentGoal] = useState(1450);
  const [patrimonyTarget, setPatrimonyTarget] = useState(25000);
  const [annualRunGoalKm, setAnnualRunGoalKm] = useState(600);

  // Integrações (Supabase Cloud Sync & Strava)
  const [sheetApiUrl, setSheetApiUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetsSyncStatus, setSheetsSyncStatus] = useState<{
    state: "idle" | "success" | "error";
    message: string;
    timestamp?: string;
  }>({ state: "idle", message: "" });

  const [stravaConfig, setStravaConfig] = useState<StravaCredentials>({
    athleteId: "",
    clientId: "",
    clientSecret: "",
    refreshToken: ""
  });
  const [stravaStats, setStravaStats] = useState<StravaStats>({
    ytdKm: 342,
    ytdRuns: 48,
    allTimeKm: 1280,
    allTimeRuns: 195,
    lastSync: "Local"
  });
  const [isSyncingStrava, setIsSyncingStrava] = useState(false);
  const [stravaSyncStatus, setStravaSyncStatus] = useState<{
    state: "idle" | "success" | "error";
    message: string;
    timestamp?: string;
  }>({ state: "idle", message: "" });

  // Logs
  const [systemLogs, setSystemLogsState] = useState<SystemLogEntry[]>([]);
  const [logFilter, setLogFilter] = useState("ALL");

  // Modal de Lançamento
  const [showTxModal, setShowTxModal] = useState(false);
  const [isSavingTx, setIsSavingTx] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTx, setNewTx] = useState({
    date: "2026-10-20",
    description: "",
    amount: "",
    category: "Alimentação",
    costType: "Variável" as CostType,
    paymentMethod: "PIX",
    cardUsed: "Nubank Ultravioleta",
    status: "Pago" as TxStatus,
    km: "",
    liters: "",
    installments: "1",
    debtor: ""
  });

  // Estados das Abas Secundárias
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [newStatusItem, setNewStatusItem] = useState({
    title: "",
    type: "Custo Fixo" as StaticStatusItem["type"],
    amount: "",
    notes: ""
  });
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({
    name: "",
    brand: "Mastercard Black",
    limit: "",
    closingDay: "25",
    dueDay: "5",
    logoUrl: ""
  });
  const [editingWishId, setEditingWishId] = useState<string | null>(null);
  const [newWish, setNewWish] = useState({
    title: "",
    institution: "Nubank Ultravioleta",
    targetAmount: "",
    savedAmount: "0",
    priority: "Média" as WishlistItem["priority"]
  });
  const [editingBioId, setEditingBioId] = useState<string | null>(null);
  const [newBio, setNewBio] = useState({ date: "2026-10-20", weight: "", bf: "" });
  const [newOkr, setNewOkr] = useState({
    title: "",
    category: "Finanças",
    current: "",
    target: "",
    unit: "R$"
  });
  const [selectedNoteTag, setSelectedNoteTag] = useState("ALL");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tag: "#Ideias" as BrainNote["tag"]
  });
  const [newMethodName, setNewMethodName] = useState("");
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: "",
    flow: "EXPENSE" as FlowType,
    isAuto: false,
    color: "#6366f1"
  });
  const [newAlert, setNewAlert] = useState({
    title: "",
    type: "ODOMETER_KM" as CustomAlertRule["type"],
    targetValue: "",
    warningLead: "500"
  });

  // Wrapper de Logs que limpa no Supabase quando a lista é zerada
  const setSystemLogs = useCallback((logs: SystemLogEntry[]) => {
    setSystemLogsState(logs);
    if (logs.length === 0) {
      clearSystemLogsInDb();
    }
  }, []);

  // Sistema de Notificações Flutuantes (Toasts + Gravação de Log no Supabase)
  const notify = useCallback(
    (
      title: string,
      subtitle?: string,
      type: "success" | "warning" | "info" = "info",
      logCategory?: SystemLogEntry["category"]
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, subtitle, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);

      if (logCategory) {
        const entry: SystemLogEntry = {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toLocaleString("pt-BR"),
          user: currentUser ? currentUser : "Sistema",
          category: logCategory,
          action: title,
          details: subtitle ? subtitle : ""
        };
        setSystemLogsState((prev) => {
          const updated = [entry, ...prev].slice(0, 200);
          localStorage.setItem("lifeos_system_logs_v8", JSON.stringify(updated));
          return updated;
        });
        insertSystemLogInDb(entry);
      }
    },
    [currentUser]
  );

  // Atalho de Teclado Global: Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (currentUser) setShowCommandModal((prev) => !prev);
      } else if (e.key === "Escape") {
        setShowCommandModal(false);
        setShowBellDropdown(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentUser]);

  // 1. Hidratação Inicial do Cache Local + Verificação de Sessão no Supabase
  useEffect(() => {
    async function initCoindex() {
      try {
        const savedReadNotifs = localStorage.getItem("lifeos_read_notifications_v1");
        if (savedReadNotifs) setReadNotificationIds(JSON.parse(savedReadNotifs));

        const sTxs = localStorage.getItem("lifeos_txs_v8");
        if (sTxs) setTransactions(JSON.parse(sTxs));
        const sDebtors = localStorage.getItem("lifeos_debtors_v8");
        if (sDebtors) setDebtorMap(JSON.parse(sDebtors));
        const sCards = localStorage.getItem("lifeos_cards_v8");
        if (sCards) setCards(JSON.parse(sCards));
        const sStatus = localStorage.getItem("lifeos_status_v8");
        if (sStatus) setStaticStatus(JSON.parse(sStatus));
        const sWish = localStorage.getItem("lifeos_wish_v8");
        if (sWish) setWishlist(JSON.parse(sWish));
        const sBio = localStorage.getItem("lifeos_bio_v8");
        if (sBio) setBioLogs(JSON.parse(sBio));
        const sNotes = localStorage.getItem("lifeos_notes_v8");
        if (sNotes) setNotes(JSON.parse(sNotes));
        const sOkrs = localStorage.getItem("lifeos_okrs_v8");
        if (sOkrs) setOkrs(JSON.parse(sOkrs));
        const sAlerts = localStorage.getItem("lifeos_alerts_v8");
        if (sAlerts) setAlertRules(JSON.parse(sAlerts));
        const sLogs = localStorage.getItem("lifeos_system_logs_v8");
        if (sLogs) setSystemLogsState(JSON.parse(sLogs));

        const sTheme = localStorage.getItem("lifeos_theme_mode") as ThemeMode | null;
        if (sTheme) setThemeMode(sTheme);
        const sUrl = localStorage.getItem("lifeos_sheets_url");
        if (sUrl) setSheetApiUrl(sUrl);
        const sStrava = localStorage.getItem("lifeos_strava_config");
        if (sStrava) setStravaConfig(JSON.parse(sStrava));
        const sStravaStats = localStorage.getItem("lifeos_strava_stats");
        if (sStravaStats) setStravaStats(JSON.parse(sStravaStats));
        const sLayout = localStorage.getItem("lifeos_dash_layout_v1");
        if (sLayout) setDashboardLayout(JSON.parse(sLayout));
        const sChartConfigs = localStorage.getItem("lifeos_chart_configs_v1");
        if (sChartConfigs) setChartConfigs(JSON.parse(sChartConfigs));
      } catch (e) {
        console.error("Erro ao ler cache local:", e);
      }

      try {
        const authRes = await fetch("/api/auth", { cache: "no-store" });
        const authData = await authRes.json();

        setHasOwner(Boolean(authData.hasOwner));
        setOwnerUsername(authData.ownerUsername || null);
        setSheetsConfigured(Boolean(authData.sheetsConfigured));
        setCloudAuthError(authData.cloudError || null);

        if (authData.authenticated && authData.user?.username) {
          setCurrentUser(authData.user.username);
          setCurrentUserAvatar(authData.user.avatarUrl || localStorage.getItem("coindex_avatar") || "");
        }
      } catch {
        // Continua com cache local se offline
      } finally {
        setIsHydrated(true);
      }
    }

    initCoindex();
  }, []);

  // 2. Carregamento Automático do Supabase (ou Migração Automática no 1º Acesso)
  useEffect(() => {
    if (!currentUser || cloudLoadedForUser === currentUser) return;

    async function syncInitialSupabaseData() {
      setIsSyncing(true);
      try {
        const res = await fetchAllCoindexData();
        if (!res.ok) {
          setSheetsSyncStatus({
            state: "error",
            message: res.error || "Não foi possível carregar os dados do Supabase.",
            timestamp: new Date().toLocaleTimeString("pt-BR")
          });
          return;
        }

        if (res.isEmpty) {
          // 1º Acesso no Supabase: sobe automaticamente tudo o que estava no navegador para o banco!
          const mig = await migrateAllStateToSupabase(
            {
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
              settings: {
                username: currentUser || undefined,
                avatarUrl: currentUserAvatar,
                themeMode,
                personalBudgetLimit,
                monthlyInvestmentGoal,
                patrimonyTarget,
                annualRunGoalKm,
                chartTheme,
                dashboardLayout,
                chartConfigs,
                readNotificationIds,
                stravaConfig,
                stravaStats
              }
            },
            debtorMap
          );

          if (mig.ok) {
            setSheetsSyncStatus({
              state: "success",
              message: mig.message,
              timestamp: new Date().toLocaleTimeString("pt-BR")
            });
            notify("Dados Migrados para o Supabase!", mig.message, "success", "CONFIG");
          }
        } else if (res.data) {
          const d = res.data;
          setTransactions(d.transactions);
          localStorage.setItem("lifeos_txs_v8", JSON.stringify(d.transactions));

          if (d.cards.length > 0) {
            setCards(d.cards);
            localStorage.setItem("lifeos_cards_v8", JSON.stringify(d.cards));
          }
          if (d.staticStatus.length > 0) {
            setStaticStatus(d.staticStatus);
            localStorage.setItem("lifeos_status_v8", JSON.stringify(d.staticStatus));
          }
          if (d.wishlist.length > 0) {
            setWishlist(d.wishlist);
            localStorage.setItem("lifeos_wish_v8", JSON.stringify(d.wishlist));
          }
          if (d.bioLogs.length > 0) {
            setBioLogs(d.bioLogs);
            localStorage.setItem("lifeos_bio_v8", JSON.stringify(d.bioLogs));
          }
          if (d.notes.length > 0) {
            setNotes(d.notes);
            localStorage.setItem("lifeos_notes_v8", JSON.stringify(d.notes));
          }
          if (d.okrs.length > 0) {
            setOkrs(d.okrs);
            localStorage.setItem("lifeos_okrs_v8", JSON.stringify(d.okrs));
          }
          if (d.alertRules.length > 0) {
            setAlertRules(d.alertRules);
            localStorage.setItem("lifeos_alerts_v8", JSON.stringify(d.alertRules));
          }
          if (d.categoriesCatalog.length > 0) {
            setCategoriesCatalog(d.categoriesCatalog);
            setCategoryColors(d.categoryColors);
          }
          if (d.paymentMethods.length > 0) {
            setPaymentMethods(d.paymentMethods);
          }
          if (d.systemLogs.length > 0) {
            setSystemLogsState(d.systemLogs);
          }

          if (d.settings.themeMode) setThemeMode(d.settings.themeMode);
          if (d.settings.avatarUrl) setCurrentUserAvatar(d.settings.avatarUrl);
          if (d.settings.personalBudgetLimit != null) setPersonalBudgetLimit(d.settings.personalBudgetLimit);
          if (d.settings.monthlyInvestmentGoal != null) setMonthlyInvestmentGoal(d.settings.monthlyInvestmentGoal);
          if (d.settings.patrimonyTarget != null) setPatrimonyTarget(d.settings.patrimonyTarget);
          if (d.settings.annualRunGoalKm != null) setAnnualRunGoalKm(d.settings.annualRunGoalKm);
          if (d.settings.chartTheme) setChartTheme(d.settings.chartTheme);
          if (d.settings.dashboardLayout) {
            setDashboardLayout(d.settings.dashboardLayout);
            localStorage.setItem("lifeos_dash_layout_v1", JSON.stringify(d.settings.dashboardLayout));
          }
          if (d.settings.chartConfigs) {
            setChartConfigs(d.settings.chartConfigs);
            localStorage.setItem("lifeos_chart_configs_v1", JSON.stringify(d.settings.chartConfigs));
          }
          if (d.settings.readNotificationIds) setReadNotificationIds(d.settings.readNotificationIds);
          if (d.settings.stravaConfig && d.settings.stravaConfig.athleteId) setStravaConfig(d.settings.stravaConfig);
          if (d.settings.stravaStats && d.settings.stravaStats.ytdKm != null) setStravaStats(d.settings.stravaStats);

          setSheetsSyncStatus({
            state: "success",
            message: `Conectado ao Supabase PostgreSQL (${d.transactions.length} lançamentos sincronizados).`,
            timestamp: new Date().toLocaleTimeString("pt-BR")
          });
        }

        setCloudLoadedForUser(currentUser);
      } finally {
        setIsSyncing(false);
      }
    }

    syncInitialSupabaseData();
  }, [currentUser, cloudLoadedForUser]);

  const changeThemeMode = (m: ThemeMode) => {
    setThemeMode(m);
    localStorage.setItem("lifeos_theme_mode", m);
    updateUserSettingsInDb({ themeMode: m });
  };

  const resetDashboardLayout = () => {
    setDashboardLayout(DEFAULT_DASHBOARD_LAYOUT);
    localStorage.setItem("lifeos_dash_layout_v1", JSON.stringify(DEFAULT_DASHBOARD_LAYOUT));
    updateUserSettingsInDb({ dashboardLayout: DEFAULT_DASHBOARD_LAYOUT });
    notify("Layout Restaurado", "A posição e tamanho padrão dos cards do Dashboard foram aplicados.", "info");
  };

  // Sincronização Completa Sob Comando (Importa Planilha Opcional + Sincroniza Tudo no Supabase)
  const syncFromGoogleSheets = useCallback(async () => {
    setIsSyncing(true);
    try {
      let currentTxs = [...transactions];
      const cleanUrl = sheetApiUrl.trim();

      if (cleanUrl) {
        if (!cleanUrl.startsWith("https://script.google.com/macros/s/") || !cleanUrl.endsWith("/exec")) {
          const msg = "URL do Google Apps Script inválida. Deve terminar em '/exec' (ou deixe em branco para sincronizar apenas com o Supabase).";
          setSheetsSyncStatus({ state: "error", message: msg, timestamp: new Date().toLocaleTimeString("pt-BR") });
          notify("Integração Inválida", msg, "warning", "CONFIG");
          return;
        }

        const res = await fetch(`/api/sync?url=${encodeURIComponent(cleanUrl)}`);
        const data = await res.json();
        if (!res.ok || data.status === "error") {
          const reason = data.message || "Falha ao ler planilha do Google Sheets.";
          setSheetsSyncStatus({ state: "error", message: reason, timestamp: new Date().toLocaleTimeString("pt-BR") });
          notify("Integração Inválida", reason, "warning", "CONFIG");
          return;
        }

        const cloudTxs: Transaction[] = Array.isArray(data.transactions) ? data.transactions : [];
        const mergedMap = new Map<string, Transaction>();
        currentTxs.forEach((t) => mergedMap.set(t.id, t));
        cloudTxs.forEach((ct) => {
          if (ct && ct.id) {
            mergedMap.set(ct.id, { ...ct, status: normalizeStatus(ct.status) });
          }
        });
        currentTxs = Array.from(mergedMap.values()).sort((a, b) => b.date.localeCompare(a.date));
        setTransactions(currentTxs);
        localStorage.setItem("lifeos_txs_v8", JSON.stringify(currentTxs));
      }

      const mig = await migrateAllStateToSupabase(
        {
          transactions: currentTxs,
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
          settings: {
            username: currentUser || undefined,
            avatarUrl: currentUserAvatar,
            themeMode,
            personalBudgetLimit,
            monthlyInvestmentGoal,
            patrimonyTarget,
            annualRunGoalKm,
            chartTheme,
            dashboardLayout,
            chartConfigs,
            readNotificationIds,
            stravaConfig,
            stravaStats
          }
        },
        debtorMap
      );

      if (!mig.ok) {
        setSheetsSyncStatus({ state: "error", message: mig.message, timestamp: new Date().toLocaleTimeString("pt-BR") });
        notify("Erro ao Sincronizar", mig.message, "warning", "CONFIG");
        return;
      }

      setSheetsSyncStatus({ state: "success", message: mig.message, timestamp: new Date().toLocaleTimeString("pt-BR") });
      notify("Supabase Sincronizado!", mig.message, "success", "CONFIG");
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Falha de rede";
      const msg = `Erro na sincronização: ${errMessage}`;
      setSheetsSyncStatus({ state: "error", message: msg, timestamp: new Date().toLocaleTimeString("pt-BR") });
      notify("Erro de Sincronização", msg, "warning", "CONFIG");
    } finally {
      setIsSyncing(false);
    }
  }, [
    sheetApiUrl,
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
    currentUser,
    currentUserAvatar,
    themeMode,
    personalBudgetLimit,
    monthlyInvestmentGoal,
    patrimonyTarget,
    annualRunGoalKm,
    chartTheme,
    dashboardLayout,
    chartConfigs,
    readNotificationIds,
    stravaConfig,
    stravaStats,
    debtorMap,
    notify
  ]);

  // Sincronização Manual do Strava via Backend Proxy (/api/strava) + Persistência no Supabase
  const syncStravaFromApi = async () => {
    setIsSyncingStrava(true);
    try {
      const res = await fetch("/api/strava", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stravaConfig)
      });

      const data = await res.json();
      if (!res.ok || data.status === "error") {
        const msg = data.message || "Falha ao sincronizar com o Strava.";
        setStravaSyncStatus({ state: "error", message: msg, timestamp: new Date().toLocaleTimeString("pt-BR") });
        notify("Integração Inválida", msg, "warning", "CONFIG");
        return;
      }

      const updatedStats: StravaStats = data.stats;
      setStravaStats(updatedStats);
      localStorage.setItem("lifeos_strava_stats", JSON.stringify(updatedStats));

      await updateUserSettingsInDb({
        stravaConfig,
        stravaStats: updatedStats
      });

      const okMsg = `Strava atualizado! ${updatedStats.ytdKm} km corridos no ano (${updatedStats.ytdRuns} treinos).`;
      setStravaSyncStatus({ state: "success", message: okMsg, timestamp: new Date().toLocaleTimeString("pt-BR") });
      notify("Strava Sincronizado!", okMsg, "success", "CONFIG");
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Falha de rede";
      const msg = `Erro de conexão com o Strava (${errMessage}).`;
      setStravaSyncStatus({ state: "error", message: msg, timestamp: new Date().toLocaleTimeString("pt-BR") });
      notify("Integração Inválida", msg, "warning", "CONFIG");
    } finally {
      setIsSyncingStrava(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" })
      });
    } catch {
      // Continua limpeza local
    }
    localStorage.removeItem("lifeos_active_session");
    sessionStorage.removeItem("lifeos_active_session");
    setCloudLoadedForUser(null);
    setCurrentUser(null);
  };

  const getFlowType = useCallback(
    (category: string): FlowType => {
      const found = categoriesCatalog.find((c) => c.name === category);
      return found ? found.flow : "EXPENSE";
    },
    [categoriesCatalog]
  );

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => (selectedMonth === "ALL" ? true : t.date.startsWith(selectedMonth)))
      .filter((t) => {
        if (quickFilter === "FIXO") return t.costType === "Fixo";
        if (quickFilter === "VARIAVEL") return t.costType === "Variável";
        if (quickFilter === "CARTAO") return t.paymentMethod === "Cartão de Crédito";
        if (quickFilter === "PIX") return t.paymentMethod === "PIX";
        return true;
      })
      .filter((t) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.paymentMethod.toLowerCase().includes(q) ||
          (t.debtor && t.debtor.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedMonth, quickFilter, searchQuery]);

  const monthSummary = useMemo(() => {
    const calcFor = (list: Transaction[]) => {
      const income = list.filter((t) => getFlowType(t.category) === "INCOME").reduce((a, b) => a + b.amount, 0);
      const expense = list.filter((t) => getFlowType(t.category) === "EXPENSE").reduce((a, b) => a + b.amount, 0);
      const invested = list.filter((t) => getFlowType(t.category) === "INVESTMENT").reduce((a, b) => a + b.amount, 0);
      const personalSpent = list
        .filter((t) => t.category === "Gastos Pessoais / Besteiras")
        .reduce((a, b) => a + b.amount, 0);
      return { income, expense, invested, balance: income - expense - invested, personalSpent };
    };

    const current = calcFor(filteredTransactions);
    const prevPrefix = getPreviousMonthPrefix(selectedMonth);
    const prevList = prevPrefix ? transactions.filter((t) => t.date.startsWith(prevPrefix)) : [];
    const prev = calcFor(prevList);

    const pctDiff = (currVal: number, prevVal: number) => {
      if (!prevVal) return 0;
      return Math.round(((currVal - prevVal) / prevVal) * 100);
    };

    return {
      ...current,
      incomeDiff: pctDiff(current.income, prev.income),
      expenseDiff: pctDiff(current.expense, prev.expense),
      investedDiff: pctDiff(current.invested, prev.invested)
    };
  }, [filteredTransactions, transactions, selectedMonth, getFlowType]);

  const patrimonyChartData = useMemo(() => {
    const base = [...HISTORICAL_INVESTMENTS];
    let runningTotal = base[base.length - 1]?.acumulado || 8200;

    const monthsMap = new Map<string, number>();
    transactions
      .filter((t) => getFlowType(t.category) === "INVESTMENT")
      .forEach((t) => {
        const m = t.date.slice(0, 7);
        if (m > "2026-08") {
          monthsMap.set(m, (monthsMap.get(m) || 0) + t.amount);
        }
      });

    Array.from(monthsMap.keys())
      .sort()
      .forEach((m) => {
        const ap = monthsMap.get(m) || 0;
        runningTotal += ap;
        const [y, mm] = m.split("-");
        base.push({ month: m, label: `${mm}/${y.slice(2)}`, aportado: ap, acumulado: runningTotal });
      });

    return base;
  }, [transactions, getFlowType]);

  const categoryChartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions
      .filter((t) => getFlowType(t.category) === "EXPENSE")
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
        color: categoryColors[name] || "#6366f1"
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, getFlowType, categoryColors]);

  const creditChartData = useMemo(() => {
    return cards.map((c) => {
      const usado = transactions
        .filter(
          (t) =>
            t.paymentMethod === "Cartão de Crédito" &&
            t.cardUsed === c.name &&
            t.status === "Pendente / Na Fatura"
        )
        .reduce((a, b) => a + b.amount, 0);
      return {
        name: c.name,
        usado: Number(usado.toFixed(2)),
        disponivel: Math.max(0, Number((c.limit - usado).toFixed(2)))
      };
    });
  }, [cards, transactions]);

  const autoMetrics = useMemo(() => {
    const autoCategories = new Set(categoriesCatalog.filter((c) => c.isAuto).map((c) => c.name));
    const autoTxs = transactions
      .filter((t) => autoCategories.has(t.category) || t.km != null)
      .sort((a, b) => a.date.localeCompare(b.date));

    const kms = autoTxs.map((t) => t.km || 0).filter((k) => k > 0);
    const maxKm = kms.length ? Math.max(...kms) : 0;
    const minKm = kms.length ? Math.min(...kms) : 0;
    const distanceDriven = Math.max(0, maxKm - minKm);
    const totalLiters = autoTxs.reduce((a, b) => a + (b.liters || 0), 0);
    const avgKmPerLiter = totalLiters > 0 && distanceDriven > 0 ? distanceDriven / totalLiters : 11.4;
    const fuelTotal = autoTxs.filter((t) => t.category.includes("Gasolina")).reduce((a, b) => a + b.amount, 0);
    const maintenanceTotal = autoTxs
      .filter((t) => !t.category.includes("Gasolina"))
      .reduce((a, b) => a + b.amount, 0);
    const totalAutoSpent = fuelTotal + maintenanceTotal;
    const costPerKm = distanceDriven > 0 ? totalAutoSpent / distanceDriven : 0;

    return {
      autoTxs: autoTxs.slice().reverse(),
      kmRecords: autoTxs.filter((t) => t.km).map((t) => ({ date: t.date, km: t.km })),
      maxKm,
      distanceDriven,
      avgKmPerLiter,
      fuelTotal,
      maintenanceTotal,
      totalAutoSpent,
      costPerKm
    };
  }, [transactions, categoriesCatalog]);

  const receivableItems = useMemo(() => {
    return transactions
      .filter((t) => t.category === "A Receber")
      .map((t) => {
        const debtorName = t.debtor ? t.debtor : debtorMap[t.id] ? debtorMap[t.id] : "";
        const effectivePaid = t.status === "Pago" ? t.amount : Math.min(t.amount, t.paidAmount || 0);
        const remaining = Math.max(0, Number((t.amount - effectivePaid).toFixed(2)));
        return { ...t, debtorName, effectivePaid, remaining };
      });
  }, [transactions, debtorMap]);

  const receivablesAnalytics = useMemo(() => {
    let totalOpen = 0;
    let totalPaid = 0;
    let totalLoaned = 0;
    const byPersonMap = new Map<
      string,
      { person: string; aberto: number; pago: number; totalEmprestado: number }
    >();

    receivableItems.forEach((item) => {
      totalOpen += item.remaining;
      totalPaid += item.effectivePaid;
      totalLoaned += item.amount;
      const pName = item.debtorName.trim() ? item.debtorName.trim() : "Não Atribuído";
      const curr = byPersonMap.get(pName) || { person: pName, aberto: 0, pago: 0, totalEmprestado: 0 };
      curr.aberto = Number((curr.aberto + item.remaining).toFixed(2));
      curr.pago = Number((curr.pago + item.effectivePaid).toFixed(2));
      curr.totalEmprestado = Number((curr.totalEmprestado + item.amount).toFixed(2));
      byPersonMap.set(pName, curr);
    });

    const list = Array.from(byPersonMap.values());
    return { totalOpen, totalPaid, totalLoaned, openByPerson: list, historyByPerson: list };
  }, [receivableItems]);

  const activeNotifications = useMemo(() => {
    const list: { id: string; title: string; detail: string; severity: "warning" | "info" }[] = [];

    if (monthSummary.personalSpent >= personalBudgetLimit * 0.8) {
      list.push({
        id: `notif-budget-${selectedMonth}-${Math.floor(monthSummary.personalSpent / 25)}`,
        title:
          monthSummary.personalSpent > personalBudgetLimit
            ? "Teto de Gastos Pessoais Excedido!"
            : "Alerta do Termômetro Pessoal",
        detail: `Utilizado ${formatBRL(monthSummary.personalSpent)} de ${formatBRL(personalBudgetLimit)} em ${selectedMonth}.`,
        severity: monthSummary.personalSpent > personalBudgetLimit ? "warning" : "info"
      });
    }

    alertRules.forEach((rule) => {
      if (rule.type === "ODOMETER_KM") {
        const diff = rule.targetValue - autoMetrics.maxKm;
        if (diff <= rule.warningLead) {
          list.push({
            id: `notif-rule-${rule.id}`,
            title: diff <= 0 ? `Manutenção Atingida: ${rule.title}` : `Próxima Revisão: ${rule.title}`,
            detail:
              diff <= 0
                ? `Odômetro atual (${autoMetrics.maxKm} km) atingiu a meta de ${rule.targetValue} km.`
                : `Restam ${diff} km para ${rule.title} (${rule.targetValue} km).`,
            severity: diff <= 0 ? "warning" : "info"
          });
        }
      }
    });

    if (receivablesAnalytics.totalOpen > 0) {
      list.push({
        id: `notif-receivables-${Math.round(receivablesAnalytics.totalOpen)}`,
        title: "Valores a Receber Pendentes",
        detail: `Há ${formatBRL(receivablesAnalytics.totalOpen)} em aberto para receber de terceiros.`,
        severity: "info"
      });
    }

    return list;
  }, [
    monthSummary.personalSpent,
    personalBudgetLimit,
    selectedMonth,
    alertRules,
    autoMetrics.maxKm,
    receivablesAnalytics.totalOpen
  ]);

  const unreadNotifications = useMemo(
    () => activeNotifications.filter((n) => !readNotificationIds.includes(n.id)),
    [activeNotifications, readNotificationIds]
  );

  const viewedNotifications = useMemo(
    () => activeNotifications.filter((n) => readNotificationIds.includes(n.id)),
    [activeNotifications, readNotificationIds]
  );

  const handleMarkNotificationViewed = (id: string) => {
    const next = Array.from(new Set([...readNotificationIds, id]));
    setReadNotificationIds(next);
    localStorage.setItem("lifeos_read_notifications_v1", JSON.stringify(next));
    updateUserSettingsInDb({ readNotificationIds: next });
  };

  const handleMarkAllNotificationsViewed = () => {
    const allIds = activeNotifications.map((n) => n.id);
    const next = Array.from(new Set([...readNotificationIds, ...allIds]));
    setReadNotificationIds(next);
    localStorage.setItem("lifeos_read_notifications_v1", JSON.stringify(next));
    updateUserSettingsInDb({ readNotificationIds: next });
    notify("Notificações Visualizadas", "Todos os alertas foram marcados como visualizados.", "success");
  };

  // Exportação CSV Padrão Excel Brasil
  const handleExportCSV = () => {
    const headers = [
      "Data",
      "Descrição",
      "Categoria",
      "Fluxo",
      "Tipo de Custo",
      "Método de Pagamento",
      "Cartão Utilizado",
      "Situação",
      "Valor (R$)",
      "Odômetro (KM)",
      "Litros",
      "Devedor",
      "Parcela"
    ];

    const escapeCell = (val: string | number | undefined) => {
      if (val === undefined || val === null) return "";
      const str = String(val).replace(/"/g, '""').replace(/;/g, ",");
      return `"${str}"`;
    };

    const rows = filteredTransactions.map((t) => {
      const flowLabel =
        getFlowType(t.category) === "INCOME"
          ? "Entrada"
          : getFlowType(t.category) === "INVESTMENT"
          ? "Investimento"
          : "Saída";
      const formattedAmount = t.amount.toFixed(2).replace(".", ",");
      return [
        escapeCell(t.date),
        escapeCell(t.description),
        escapeCell(t.category),
        escapeCell(flowLabel),
        escapeCell(t.costType),
        escapeCell(t.paymentMethod),
        escapeCell(t.cardUsed || "-"),
        escapeCell(t.status),
        `"${formattedAmount}"`,
        escapeCell(t.km != null ? t.km : ""),
        escapeCell(t.liters != null ? String(t.liters).replace(".", ",") : ""),
        escapeCell(t.debtor || debtorMap[t.id] || ""),
        escapeCell(t.installmentInfo || "À vista")
      ].join(";");
    });

    const BOM = "\uFEFF";
    const csvContent = BOM + [headers.map((h) => `"${h}"`).join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Relatorio_Coindex_${selectedMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify(
      "Relatório CSV Exportado!",
      "Arquivo gerado no padrão brasileiro para abrir direto no Excel.",
      "success",
      "FINANCE"
    );
  };

  const handleOpenNewTxModal = (defaultCat?: string) => {
    setEditingTxId(null);
    const cat = defaultCat || "Alimentação";
    setNewTx({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      category: cat,
      costType: "Variável",
      paymentMethod: "PIX",
      cardUsed: cards[0]?.name || "Nubank Ultravioleta",
      status: getAutomaticStatus("PIX", cat),
      km: "",
      liters: "",
      installments: "1",
      debtor: ""
    });
    setShowTxModal(true);
  };

  const handleStartEditTransaction = (tx: Transaction) => {
    setEditingTxId(tx.id);
    setNewTx({
      date: tx.date,
      description: tx.description,
      amount: String(tx.amount),
      category: tx.category,
      costType: tx.costType,
      paymentMethod: tx.paymentMethod,
      cardUsed: tx.cardUsed || cards[0]?.name || "Nubank Ultravioleta",
      status: tx.status,
      km: tx.km ? String(tx.km) : "",
      liters: tx.liters ? String(tx.liters) : "",
      installments: "1",
      debtor: tx.debtor || debtorMap[tx.id] || ""
    });
    setShowTxModal(true);
  };

  // CRUD de Lançamentos Conectado ao Supabase
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = parseFloat(newTx.amount);
    if (!newTx.description.trim() || isNaN(totalAmount) || totalAmount <= 0) return;

    setIsSavingTx(true);
    const nowIso = new Date().toISOString();
    const installmentsCount = Math.max(1, Math.min(24, parseInt(newTx.installments || "1", 10)));

    try {
      if (editingTxId) {
        let editedItem: Transaction | null = null;
        const updated = transactions.map((t) => {
          if (t.id === editingTxId) {
            editedItem = {
              ...t,
              date: newTx.date,
              description: sanitizeText(newTx.description),
              amount: totalAmount,
              category: newTx.category,
              costType: newTx.costType,
              paymentMethod: newTx.paymentMethod,
              cardUsed: newTx.paymentMethod === "Cartão de Crédito" ? newTx.cardUsed : undefined,
              status: newTx.status,
              km: newTx.km ? Number(newTx.km) : undefined,
              liters: newTx.liters ? Number(newTx.liters) : undefined,
              debtor: newTx.category === "A Receber" ? sanitizeText(newTx.debtor) : t.debtor,
              updatedAt: nowIso
            };
            return editedItem;
          }
          return t;
        });
        setTransactions(updated);
        localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));
        if (editedItem) await upsertTransactionsInDb([editedItem], debtorMap);
        notify("Lançamento Atualizado", `${newTx.description} (${formatBRL(totalAmount)})`, "success", "FINANCE");
      } else if (installmentsCount > 1 && newTx.paymentMethod === "Cartão de Crédito") {
        const groupId = `grp-${Date.now()}`;
        const baseSlice = Math.floor((totalAmount / installmentsCount) * 100) / 100;
        const firstSlice = Number((totalAmount - baseSlice * (installmentsCount - 1)).toFixed(2));
        const createdList: Transaction[] = [];

        for (let i = 0; i < installmentsCount; i++) {
          createdList.push({
            id: `tx-${Date.now()}-${i}`,
            date: addMonthsToDate(newTx.date, i),
            description: sanitizeText(newTx.description),
            amount: i === 0 ? firstSlice : baseSlice,
            category: newTx.category,
            costType: newTx.costType,
            paymentMethod: newTx.paymentMethod,
            cardUsed: newTx.cardUsed,
            status: "Pendente / Na Fatura",
            installmentInfo: `${i + 1}/${installmentsCount}`,
            installmentGroupId: groupId,
            debtor: newTx.category === "A Receber" ? sanitizeText(newTx.debtor) : undefined,
            updatedAt: nowIso
          });
        }
        const updated = [...createdList, ...transactions];
        setTransactions(updated);
        localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));
        await upsertTransactionsInDb(createdList, debtorMap);
        notify(
          "Compra Parcelada Criada!",
          `${installmentsCount}x de ${formatBRL(baseSlice)} salvas no Supabase.`,
          "success",
          "FINANCE"
        );
      } else {
        const item: Transaction = {
          id: `tx-${Date.now()}`,
          date: newTx.date,
          description: sanitizeText(newTx.description),
          amount: totalAmount,
          category: newTx.category,
          costType: newTx.costType,
          paymentMethod: newTx.paymentMethod,
          cardUsed: newTx.paymentMethod === "Cartão de Crédito" ? newTx.cardUsed : undefined,
          status: newTx.status,
          km: newTx.km ? Number(newTx.km) : undefined,
          liters: newTx.liters ? Number(newTx.liters) : undefined,
          debtor: newTx.category === "A Receber" ? sanitizeText(newTx.debtor) : undefined,
          updatedAt: nowIso
        };
        const updated = [item, ...transactions];
        setTransactions(updated);
        localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));
        await upsertTransactionsInDb([item], debtorMap);
        notify("Lançamento Registrado!", `${item.description} — ${formatBRL(item.amount)}`, "success", "FINANCE");
      }
    } finally {
      setIsSavingTx(false);
      setShowTxModal(false);
    }
  };

  const handleToggleStatus = (tx: Transaction) => {
    const nextStatus: TxStatus = tx.status === "Pago" ? "Pendente / Na Fatura" : "Pago";
    const changedItem: Transaction = {
      ...tx,
      status: nextStatus,
      paidAmount: nextStatus === "Pago" ? tx.amount : 0,
      updatedAt: new Date().toISOString()
    };
    const updated = transactions.map((t) => (t.id === tx.id ? changedItem : t));
    setTransactions(updated);
    localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));
    upsertTransactionsInDb([changedItem], debtorMap);
    notify("Situação Alterada", `${tx.description} marcado como ${nextStatus}.`, "info", "FINANCE");
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));
    deleteTransactionInDb(id);
    notify("Lançamento Removido", "Item excluído do Supabase com sucesso.", "warning", "FINANCE");
  };

  const handleAssignDebtor = (txId: string, debtorName: string) => {
    const clean = sanitizeText(debtorName);
    const nextMap = { ...debtorMap, [txId]: clean };
    setDebtorMap(nextMap);
    localStorage.setItem("lifeos_debtors_v8", JSON.stringify(nextMap));

    let changedTx: Transaction | null = null;
    const updated = transactions.map((t) => {
      if (t.id === txId) {
        changedTx = { ...t, debtor: clean, updatedAt: new Date().toISOString() };
        return changedTx;
      }
      return t;
    });
    setTransactions(updated);
    localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));
    if (changedTx) upsertTransactionsInDb([changedTx], nextMap);
    notify("Devedor Vinculado", `Atribuído a ${clean || "Não Atribuído"}.`, "success", "FINANCE");
  };

  const handlePartialPaymentReceivable = (tx: Transaction, addAmount: number) => {
    const currPaid = tx.paidAmount || 0;
    const nextPaid = Math.min(tx.amount, Number((currPaid + addAmount).toFixed(2)));
    const nextStatus: TxStatus = nextPaid >= tx.amount ? "Pago" : "Pendente / Na Fatura";
    const changedTx: Transaction = {
      ...tx,
      paidAmount: nextPaid,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };
    const updated = transactions.map((t) => (t.id === tx.id ? changedTx : t));
    setTransactions(updated);
    localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));
    upsertTransactionsInDb([changedTx], debtorMap);
    notify("Abatimento Registrado!", `Abatido ${formatBRL(addAmount)} em ${tx.description}.`, "success", "FINANCE");
  };

  const saveStaticStatus = (items: StaticStatusItem[]) => {
    setStaticStatus(items);
    localStorage.setItem("lifeos_status_v8", JSON.stringify(items));
    syncStaticStatusListInDb(items);
  };

  const handleSaveStaticStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newStatusItem.amount);
    if (!newStatusItem.title.trim() || isNaN(val)) return;
    if (editingStatusId) {
      saveStaticStatus(
        staticStatus.map((s) =>
          s.id === editingStatusId
            ? {
                ...s,
                title: newStatusItem.title,
                type: newStatusItem.type,
                amount: val,
                notes: newStatusItem.notes
              }
            : s
        )
      );
      setEditingStatusId(null);
    } else {
      saveStaticStatus([
        ...staticStatus,
        {
          id: `st-${Date.now()}`,
          title: newStatusItem.title,
          type: newStatusItem.type,
          amount: val,
          notes: newStatusItem.notes
        }
      ]);
    }
    setNewStatusItem({ title: "", type: "Custo Fixo", amount: "", notes: "" });
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    const lim = parseFloat(newCard.limit);
    if (!newCard.name.trim() || isNaN(lim)) return;
    const cardObj: CreditCardItem = {
      id: editingCardId || `card-${Date.now()}`,
      name: newCard.name,
      brand: newCard.brand,
      limit: lim,
      closingDay: Number(newCard.closingDay),
      dueDay: Number(newCard.dueDay),
      logoUrl: newCard.logoUrl || undefined
    };
    const updated = editingCardId ? cards.map((c) => (c.id === editingCardId ? cardObj : c)) : [...cards, cardObj];
    setCards(updated);
    localStorage.setItem("lifeos_cards_v8", JSON.stringify(updated));
    upsertCardInDb(cardObj);
    setEditingCardId(null);
    setNewCard({ name: "", brand: "Mastercard Black", limit: "", closingDay: "25", dueDay: "5", logoUrl: "" });
  };

  const handleDeleteCard = (id: string) => {
    const updated = cards.filter((c) => c.id !== id);
    setCards(updated);
    localStorage.setItem("lifeos_cards_v8", JSON.stringify(updated));
    deleteCardInDb(id);
  };

  const handlePayCardInvoice = (cardName: string) => {
    const changedList: Transaction[] = [];
    const updated = transactions.map((t) => {
      if (
        t.paymentMethod === "Cartão de Crédito" &&
        t.cardUsed === cardName &&
        t.status === "Pendente / Na Fatura"
      ) {
        const paidTx: Transaction = { ...t, status: "Pago", updatedAt: new Date().toISOString() };
        changedList.push(paidTx);
        return paidTx;
      }
      return t;
    });
    setTransactions(updated);
    localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));
    if (changedList.length > 0) upsertTransactionsInDb(changedList, debtorMap);
    notify("Fatura Quitada!", `Fatura do cartão ${cardName} marcada como Paga no Supabase.`, "success", "FINANCE");
  };

  const handleSaveWish = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newWish.targetAmount);
    const saved = parseFloat(newWish.savedAmount || "0");
    if (!newWish.title.trim() || isNaN(target)) return;
    const wishObj: WishlistItem = {
      id: editingWishId || `w-${Date.now()}`,
      title: newWish.title,
      institution: newWish.institution,
      targetAmount: target,
      savedAmount: saved,
      priority: newWish.priority
    };
    const updated = editingWishId
      ? wishlist.map((w) => (w.id === editingWishId ? wishObj : w))
      : [...wishlist, wishObj];
    setWishlist(updated);
    localStorage.setItem("lifeos_wish_v8", JSON.stringify(updated));
    upsertWishInDb(wishObj);
    setEditingWishId(null);
    setNewWish({
      title: "",
      institution: "Nubank Ultravioleta",
      targetAmount: "",
      savedAmount: "0",
      priority: "Média"
    });
  };

  const handleIncrementWish = (w: WishlistItem, inc: number) => {
    const updatedWish: WishlistItem = { ...w, savedAmount: w.savedAmount + inc };
    const updatedList = wishlist.map((item) => (item.id === w.id ? updatedWish : item));
    setWishlist(updatedList);
    localStorage.setItem("lifeos_wish_v8", JSON.stringify(updatedList));
    upsertWishInDb(updatedWish);

    const newTxItem: Transaction = {
      id: `tx-wish-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: `Aporte Caixinha: ${w.title}`,
      amount: inc,
      category: "Aporte / Investimento",
      costType: "Variável",
      paymentMethod: "PIX",
      status: "Pago",
      wishlistId: w.id,
      updatedAt: new Date().toISOString()
    };
    const nextTxs = [newTxItem, ...transactions];
    setTransactions(nextTxs);
    localStorage.setItem("lifeos_txs_v8", JSON.stringify(nextTxs));
    upsertTransactionsInDb([newTxItem], debtorMap);
    notify("Guardado na Caixinha!", `+ ${formatBRL(inc)} em ${w.title}`, "success", "FINANCE");
  };

  const handleDeleteWish = (id: string) => {
    const updated = wishlist.filter((w) => w.id !== id);
    setWishlist(updated);
    localStorage.setItem("lifeos_wish_v8", JSON.stringify(updated));
    deleteWishInDb(id);
  };

  const handleSaveBioLog = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newBio.weight);
    const bf = newBio.bf ? parseFloat(newBio.bf) : undefined;
    if (isNaN(w)) return;
    const bioObj: BioLog = {
      id: editingBioId || `bio-${Date.now()}`,
      date: newBio.date,
      weight: w,
      bf
    };
    const updated = editingBioId
      ? bioLogs.map((b) => (b.id === editingBioId ? bioObj : b))
      : [...bioLogs, bioObj].sort((a, b) => a.date.localeCompare(b.date));
    setBioLogs(updated);
    localStorage.setItem("lifeos_bio_v8", JSON.stringify(updated));
    upsertBioLogInDb(bioObj);
    setEditingBioId(null);
    setNewBio({ date: new Date().toISOString().split("T")[0], weight: "", bf: "" });
  };

  const handleDeleteBioLog = (id: string) => {
    const updated = bioLogs.filter((b) => b.id !== id);
    setBioLogs(updated);
    localStorage.setItem("lifeos_bio_v8", JSON.stringify(updated));
    deleteBioLogInDb(id);
  };

  const saveOkrs = (items: PersonalOKR[]) => {
    setOkrs(items);
    localStorage.setItem("lifeos_okrs_v8", JSON.stringify(items));
    syncOkrsListInDb(items);
  };

  const handleAddOkr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOkr.title.trim()) return;
    saveOkrs([
      ...okrs,
      {
        id: `okr-${Date.now()}`,
        title: newOkr.title,
        category: newOkr.category,
        current: Number(newOkr.current || 0),
        target: Number(newOkr.target || 100),
        unit: newOkr.unit || "R$"
      }
    ]);
    setNewOkr({ title: "", category: "Finanças", current: "", target: "", unit: "R$" });
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim()) return;
    const noteObj: BrainNote = {
      id: editingNoteId || `n-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      title: newNote.title,
      content: newNote.content,
      tag: newNote.tag
    };
    const updated = editingNoteId
      ? notes.map((n) => (n.id === editingNoteId ? noteObj : n))
      : [noteObj, ...notes];
    setNotes(updated);
    localStorage.setItem("lifeos_notes_v8", JSON.stringify(updated));
    upsertNoteInDb(noteObj);
    setEditingNoteId(null);
    setNewNote({ title: "", content: "", tag: "#Ideias" });
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem("lifeos_notes_v8", JSON.stringify(updated));
    deleteNoteInDb(id);
  };

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeText(newMethodName);
    if (!clean || paymentMethods.includes(clean)) return;
    const next = [...paymentMethods, clean];
    setPaymentMethods(next);
    syncPaymentMethodsInDb(next);
    setNewMethodName("");
  };

  const handleDeletePaymentMethod = (m: string) => {
    const next = paymentMethods.filter((item) => item !== m);
    setPaymentMethods(next);
    syncPaymentMethodsInDb(next);
  };

  const handleAddCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeText(newCategoryForm.name);
    if (!clean) return;
    const nextCatalog = [
      ...categoriesCatalog,
      { name: clean, flow: newCategoryForm.flow, isAuto: newCategoryForm.isAuto }
    ];
    const nextColors = { ...categoryColors, [clean]: newCategoryForm.color };
    setCategoriesCatalog(nextCatalog);
    setCategoryColors(nextColors);
    syncCategoriesInDb(nextCatalog, nextColors);
    setNewCategoryForm({ name: "", flow: "EXPENSE", isAuto: false, color: "#6366f1" });
  };

  const handleDeleteCategory = (name: string) => {
    const nextCatalog = categoriesCatalog.filter((c) => c.name !== name);
    setCategoriesCatalog(nextCatalog);
    syncCategoriesInDb(nextCatalog, categoryColors);
  };

  const updateChartThemeColor = (k: keyof ChartThemeColors, c: string) => {
    setChartTheme((prev) => {
      const next = { ...prev, [k]: c };
      updateUserSettingsInDb({ chartTheme: next });
      return next;
    });
  };

  const updateGoalsStorage = (b: number, i: number, p: number, r: number) => {
    localStorage.setItem("lifeos_goals_v8", JSON.stringify({ b, i, p, r }));
    updateUserSettingsInDb({
      personalBudgetLimit: b,
      monthlyInvestmentGoal: i,
      patrimonyTarget: p,
      annualRunGoalKm: r
    });
  };

  const saveAlertRules = (r: CustomAlertRule[]) => {
    setAlertRules(r);
    localStorage.setItem("lifeos_alerts_v8", JSON.stringify(r));
    syncAlertRulesInDb(r);
  };

  const handleAddAlertRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.title.trim() || !newAlert.targetValue) return;
    saveAlertRules([
      ...alertRules,
      {
        id: `al-${Date.now()}`,
        title: newAlert.title,
        type: newAlert.type,
        targetValue: Number(newAlert.targetValue),
        warningLead: Number(newAlert.warningLead || 500)
      }
    ]);
    setNewAlert({ title: "", type: "ODOMETER_KM", targetValue: "", warningLead: "500" });
  };

  const handleExportFullBackupJSON = () => {
    const dump = { transactions, cards, staticStatus, wishlist, bioLogs, notes, okrs, alertRules };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coindex-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  const handleImportFullBackupJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const d = JSON.parse(String(ev.target?.result));
        if (d.transactions) setTransactions(d.transactions);
        if (d.cards) setCards(d.cards);
        if (d.staticStatus) setStaticStatus(d.staticStatus);
        if (d.wishlist) setWishlist(d.wishlist);
        if (d.bioLogs) setBioLogs(d.bioLogs);
        if (d.notes) setNotes(d.notes);
        if (d.okrs) setOkrs(d.okrs);

        await migrateAllStateToSupabase(
          {
            transactions: d.transactions || transactions,
            cards: d.cards || cards,
            staticStatus: d.staticStatus || staticStatus,
            wishlist: d.wishlist || wishlist,
            bioLogs: d.bioLogs || bioLogs,
            notes: d.notes || notes,
            okrs: d.okrs || okrs,
            alertRules: d.alertRules || alertRules,
            categoriesCatalog,
            categoryColors,
            paymentMethods,
            systemLogs,
            settings: {
              username: currentUser || undefined,
              avatarUrl: currentUserAvatar,
              themeMode,
              personalBudgetLimit,
              monthlyInvestmentGoal,
              patrimonyTarget,
              annualRunGoalKm,
              chartTheme,
              dashboardLayout,
              chartConfigs,
              readNotificationIds,
              stravaConfig,
              stravaStats
            }
          },
          debtorMap
        );
        notify(
          "Backup Restaurado no Supabase!",
          "Todos os dados foram carregados e salvos na nuvem.",
          "success",
          "CONFIG"
        );
      } catch {
        notify("Erro no Backup", "Arquivo JSON inválido.", "warning");
      }
    };
    reader.readAsText(file);
  };

  const handleUpdateProfileAvatar = (file: File) => {
    compressImageFileToBase64(file, (b64) => {
      setCurrentUserAvatar(b64);
      localStorage.setItem("coindex_avatar", b64);
      updateUserSettingsInDb({ avatarUrl: b64 });
    });
  };

  const moneyBlur = privacyMode ? "blur-md select-none" : "";

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
        <CoindexIcon className="w-12 h-12 animate-pulse" />
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>Conectando ao Coindex & Supabase...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <CoindexAuthScreen
        hasOwner={hasOwner}
        ownerUsername={ownerUsername}
        sheetsConfigured={sheetsConfigured}
        cloudError={cloudAuthError}
        initialSheetUrl={sheetApiUrl}
        onAuthenticated={(user) => {
          setCurrentUser(user.username);
          if (user.avatarUrl) setCurrentUserAvatar(user.avatarUrl);
          setHasOwner(true);
          notify("Sessão Autenticada", `Bem-vindo ao Coindex, ${user.username}!`, "success", "AUTH");
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        themeMode === "branco"
          ? "bg-slate-100 text-slate-900"
          : themeMode === "noturno"
          ? "bg-black text-slate-100"
          : "bg-[#060913] text-slate-100"
      }`}
    >
      <style jsx global>{`
        .glass-card {
          background: ${themeMode === "branco"
            ? "rgba(255,255,255,0.94)"
            : themeMode === "noturno"
            ? "rgba(10,10,12,0.96)"
            : "rgba(15,23,42,0.72)"};
          backdrop-filter: blur(18px);
          transition: all 0.2s ease;
        }
        .color-circle {
          -webkit-appearance: none;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 9999px;
          cursor: pointer;
          background: transparent;
        }
        .color-circle::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        .color-circle::-webkit-color-swatch {
          border: 2px solid rgba(255, 255, 255, 0.25);
          border-radius: 9999px;
        }
      `}</style>

      {/* TOASTS FLUTUANTES */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl text-xs flex items-start justify-between gap-3 transition-all duration-200 ${
              t.type === "warning"
                ? "bg-slate-950/95 border-amber-500/50 text-amber-100"
                : t.type === "success"
                ? "bg-slate-950/95 border-emerald-500/50 text-emerald-100"
                : "bg-slate-950/95 border-indigo-500/50 text-slate-100"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {t.type === "warning" ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : t.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              )}
              <div>
                <strong className="font-bold text-white block">{t.title}</strong>
                {t.subtitle && (
                  <span className="text-slate-300 text-[11px] leading-snug block mt-0.5">{t.subtitle}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-slate-500 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* BARRA LATERAL RETRÁTIL COM LOGO COINDEX E MÓDULO SPOTIFY */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-slate-950/95 border-r border-white/[0.08] backdrop-blur-2xl transition-all duration-200 flex flex-col justify-between ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <CoindexLogoHorizontal size="sm" />
            ) : (
              <div className="mx-auto">
                <CoindexIcon className="w-9 h-9" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition"
              title={sidebarOpen ? "Recolher Menu Lateral" : "Expandir Menu Lateral"}
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {sidebarOpen && (
            <button
              type="button"
              onClick={() => setShowCommandModal(true)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-white/[0.08] text-slate-400 hover:text-white text-xs flex items-center justify-between transition"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ação rápida...</span>
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-white/10 text-[10px] font-mono text-slate-400">
                Ctrl K
              </kbd>
            </button>
          )}

          <nav className="space-y-1.5 text-xs">
            {[
              { id: "dashboard", label: "Dashboard & BI", icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: "status", label: "Meu Status Atual", icon: <SlidersHorizontal className="w-4 h-4" /> },
              { id: "transactions", label: "Lançamentos", icon: <Wallet className="w-4 h-4" /> },
              { id: "receivables", label: "Valores a Receber", icon: <HandCoins className="w-4 h-4" /> },
              { id: "cards", label: "Cartões & Caixinhas", icon: <CreditCard className="w-4 h-4" /> },
              { id: "spotify", label: "Spotify", icon: <SpotifyLogo size={16} /> },
              { id: "auto", label: "Meu Veículo (Auto)", icon: <Car className="w-4 h-4" /> },
              { id: "bio", label: "Bio & Strava", icon: <Activity className="w-4 h-4" /> },
              { id: "brain", label: "Segundo Cérebro", icon: <Brain className="w-4 h-4" /> },
              { id: "settings", label: "Configurações", icon: <Settings className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`w-full px-3.5 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all duration-200 ${
                  activeTab === tab.id
                    ? tab.id === "spotify"
                      ? "bg-[#1DB954]/20 text-[#1DB954] ring-1 ring-[#1DB954]/40 shadow-lg shadow-[#1DB954]/10"
                      : "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/25"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
                title={tab.label}
              >
                {tab.icon}
                {sidebarOpen && <span className="truncate">{tab.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/[0.08] space-y-3">
          {sidebarOpen && (
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-950 border border-indigo-500/30 overflow-hidden flex items-center justify-center shrink-0">
                {currentUserAvatar ? (
                  <img src={currentUserAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <div className="overflow-hidden">
                <strong className="text-xs text-white block truncate">{currentUser}</strong>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" /> Supabase Ativo
                </span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition"
            title="Encerrar Sessão"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Sair da Conta</span>}
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className={`flex-1 transition-all duration-200 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-slate-950/85 backdrop-blur-xl px-4 lg:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-white font-bold outline-none focus:border-indigo-500 transition"
              >
                <option value="2026-10">Outubro / 2026</option>
                <option value="2026-09">Setembro / 2026</option>
                <option value="2026-11">Novembro / 2026</option>
                <option value="2026-12">Dezembro / 2026</option>
                <option value="ALL">Histórico Completo</option>
              </select>

              <button
                type="button"
                onClick={() => setShowCommandModal(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 transition"
                title="Atalho de Comandos Rápidos (Ctrl + K)"
              >
                <Command className="w-3.5 h-3.5 text-indigo-400" />
                <span>Comandos</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-slate-400">
                  Ctrl+K
                </kbd>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <ThemeSegmentedControl themeMode={themeMode} onChange={changeThemeMode} />

              {/* SININHO DE NOTIFICAÇÕES */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBellDropdown((prev) => !prev)}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 relative transition"
                  title="Notificações"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                {showBellDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-2xl p-4 z-50 text-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <div>
                        <strong className="text-white font-bold block">Central de Notificações</strong>
                        <span className="text-[10px] text-slate-400">
                          {unreadNotifications.length} pendente(s) • {viewedNotifications.length} visualizada(s)
                        </span>
                      </div>
                      {unreadNotifications.length > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllNotificationsViewed}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition"
                        >
                          <Check className="w-3 h-3" /> Visualizar todas
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/5 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setBellViewMode("unread")}
                        className={`py-1.5 rounded-lg transition ${
                          bellViewMode === "unread" ? "bg-indigo-600 text-white" : "text-slate-400"
                        }`}
                      >
                        Pendentes ({unreadNotifications.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setBellViewMode("viewed")}
                        className={`py-1.5 rounded-lg transition ${
                          bellViewMode === "viewed" ? "bg-slate-800 text-white" : "text-slate-400"
                        }`}
                      >
                        Visualizadas ({viewedNotifications.length})
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {bellViewMode === "unread" ? (
                        unreadNotifications.length === 0 ? (
                          <p className="text-center text-slate-400 py-6">Nenhuma notificação nova no momento.</p>
                        ) : (
                          unreadNotifications.map((n) => (
                            <div
                              key={n.id}
                              className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-start justify-between gap-2.5"
                            >
                              <div className="space-y-0.5">
                                <strong
                                  className={`block font-bold ${
                                    n.severity === "warning" ? "text-amber-400" : "text-indigo-300"
                                  }`}
                                >
                                  {n.title}
                                </strong>
                                <p className="text-[11px] text-slate-300 leading-snug">{n.detail}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleMarkNotificationViewed(n.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold shrink-0 flex items-center gap-1 transition"
                              >
                                <Eye className="w-3 h-3" /> Visualizar
                              </button>
                            </div>
                          ))
                        )
                      ) : viewedNotifications.length === 0 ? (
                        <p className="text-center text-slate-400 py-6">Nenhuma notificação visualizada ainda.</p>
                      ) : (
                        viewedNotifications.map((n) => (
                          <div
                            key={n.id}
                            className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-start justify-between gap-2.5 opacity-70"
                          >
                            <div>
                              <strong className="block font-bold text-slate-300">{n.title}</strong>
                              <p className="text-[11px] text-slate-400">{n.detail}</p>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-bold shrink-0">✓ Vista</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* BOTÃO DE PRIVACIDADE SOMENTE COM O SÍMBOLO DO OLHO */}
              <button
                type="button"
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`p-2.5 rounded-xl border transition flex items-center justify-center ${
                  privacyMode
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                    : "bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-200"
                }`}
                title={
                  privacyMode
                    ? "Valores Censurados (Clique para visualizar)"
                    : "Visualizando Normal (Clique para censurar)"
                }
              >
                {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => handleOpenNewTxModal()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition"
              >
                <Plus className="w-4 h-4" /> Novo Lançamento
              </button>
            </div>
          </div>
        </header>

        {/* CORPO PRINCIPAL */}
        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 pb-24">
          {activeTab === "dashboard" ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-white tracking-tight">Painel Executivo Coindex</h2>
                  <p className="text-xs text-slate-400">
                    Arraste pelo ícone de grade para reordenar, alterne o tamanho (1/2 ou 1/1) ou configure cada gráfico na engrenagem.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-white/[0.08] text-[11px]">
                    <Filter className="w-3.5 h-3.5 text-indigo-400 ml-2 mr-1" />
                    {(
                      [
                        { id: "ALL", label: "Todos" },
                        { id: "FIXO", label: "Fixos" },
                        { id: "VARIAVEL", label: "Variáveis" },
                        { id: "CARTAO", label: "Cartão" },
                        { id: "PIX", label: "PIX" }
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setQuickFilter(f.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition ${
                          quickFilter === f.id
                            ? "bg-indigo-600 text-white shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={resetDashboardLayout}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-[11px] text-slate-300 font-semibold flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-400" /> Restaurar Ordem
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                {dashboardLayout
                  .filter((w) => w.visible !== false)
                  .map((widget) => {
                    const defaultSize: ChartWidgetSize =
                      widget.id === "thermometer" || widget.id === "kpis" ? "full" : "half";
                    const widgetSize: ChartWidgetSize = widget.size ?? defaultSize;

                    const chartKind: ChartKind =
                      widget.id === "patrimony_chart"
                        ? "area"
                        : widget.id === "category_chart"
                        ? "pie"
                        : widget.id === "credit_chart"
                        ? "bar"
                        : "kpi";

                    const cfg = getWidgetSettings(widget.id, "auto", curveType);
                    const primarySeriesColor = (fallbackHex: string) =>
                      cfg.color && cfg.color !== "auto" ? cfg.color : fallbackHex;

                    const personalPct = Math.min(
                      100,
                      Math.round((monthSummary.personalSpent / Math.max(1, personalBudgetLimit)) * 100)
                    );
                    const totalExpenses = Math.max(1, categoryChartData.reduce((a, b) => a + b.value, 0));

                    const processedPatrimonyData = applyZeroHandling(
                      patrimonyChartData as Array<Record<string, unknown>>,
                      ["acumulado", "aportado"],
                      cfg.zeroHandling
                    );

                    return (
                      <ChartCard
                        key={widget.id}
                        id={widget.id}
                        title={widget.title}
                        subtitle={widget.subtitle}
                        chartKind={chartKind}
                        hasMultipleSeries={
                          widget.id === "patrimony_chart" ||
                          widget.id === "credit_chart" ||
                          widget.id === "category_chart"
                        }
                        size={widgetSize}
                        onSizeChange={(nextSize) => handleUpdateWidgetSize(widget.id, nextSize)}
                        settings={cfg}
                        defaultSettings={{ color: "auto", curveType }}
                        onSettingsChange={(nextCfg) => handleUpdateWidgetSettings(widget.id, nextCfg)}
                        onDragStartCard={handleDragStartWidget}
                        onDragEnterCard={handleDragEnterWidget}
                        onDragEndCard={handleDragEndWidget}
                        isDragging={draggingWidgetId === widget.id}
                        isDropTarget={dragOverWidgetId === widget.id}
                        className="glass-card"
                      >
                        {widget.id === "thermometer" && (
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    personalPct >= 100
                                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                      : personalPct >= 80
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  }`}
                                >
                                  {personalPct >= 100
                                    ? "LIMITE ESTOURADO"
                                    : personalPct >= 80
                                    ? "ZONA DE ATENÇÃO"
                                    : "DENTRO DA META"}
                                </span>
                                <span className="text-slate-400">
                                  Restante livre:{" "}
                                  <strong className={`text-white ${moneyBlur}`}>
                                    {formatBRL(Math.max(0, personalBudgetLimit - monthSummary.personalSpent))}
                                  </strong>
                                </span>
                              </div>
                              <span
                                className={`font-extrabold text-sm ${moneyBlur} ${
                                  personalPct >= 100 ? "text-rose-400" : "text-emerald-400"
                                }`}
                              >
                                {formatBRL(monthSummary.personalSpent)} / {formatBRL(personalBudgetLimit)} ({personalPct}
                                %)
                              </span>
                            </div>
                            <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/10">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  personalPct >= 100
                                    ? "bg-gradient-to-r from-amber-500 to-rose-600"
                                    : "bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500"
                                }`}
                                style={{ width: `${personalPct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {widget.id === "kpis" && (
                          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${moneyBlur}`}>
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-950/90 border border-emerald-500/25 space-y-1">
                              <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>Entradas do Mês</span>
                                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                                  <TrendingUp className="w-4 h-4" />
                                </div>
                              </div>
                              <p className="text-2xl font-extrabold text-emerald-400">
                                {formatBRL(monthSummary.income)}
                              </p>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                                {monthSummary.incomeDiff >= 0
                                  ? `+${monthSummary.incomeDiff}%`
                                  : `${monthSummary.incomeDiff}%`}{" "}
                                vs. mês anterior
                              </span>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-950/90 border border-rose-500/25 space-y-1">
                              <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>Saídas & Despesas</span>
                                <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400">
                                  <TrendingDown className="w-4 h-4" />
                                </div>
                              </div>
                              <p className="text-2xl font-extrabold text-rose-400">
                                {formatBRL(monthSummary.expense)}
                              </p>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                                {monthSummary.expenseDiff >= 0
                                  ? `+${monthSummary.expenseDiff}%`
                                  : `${monthSummary.expenseDiff}%`}{" "}
                                vs. mês anterior
                              </span>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-950/90 border border-indigo-500/25 space-y-1">
                              <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>Aportes no Mês</span>
                                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                                  <PiggyBank className="w-4 h-4" />
                                </div>
                              </div>
                              <p className="text-2xl font-extrabold text-indigo-400">
                                {formatBRL(monthSummary.invested)}
                              </p>
                              <span className="text-[11px] text-slate-400 block">
                                Meta Mensal: {formatBRL(monthlyInvestmentGoal)}
                              </span>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-950/40 to-slate-950/90 border border-sky-500/25 space-y-1">
                              <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>Saldo Livre Líquido</span>
                                <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
                                  <Wallet className="w-4 h-4" />
                                </div>
                              </div>
                              <p
                                className={`text-2xl font-extrabold ${
                                  monthSummary.balance >= 0 ? "text-sky-400" : "text-rose-400"
                                }`}
                              >
                                {formatBRL(monthSummary.balance)}
                              </p>
                              <span className="text-[11px] text-slate-400 block">
                                A Receber Aberto: {formatBRL(receivablesAnalytics.totalOpen)}
                              </span>
                            </div>
                          </div>
                        )}

                        {widget.id === "patrimony_chart" && (
                          <div className="h-72 select-none">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={processedPatrimonyData}>
                                <defs>
                                  <linearGradient id="gradPatrimony" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                      offset="5%"
                                      stopColor={primarySeriesColor(chartTheme.patrimonyLine)}
                                      stopOpacity={0.35}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor={primarySeriesColor(chartTheme.patrimonyLine)}
                                      stopOpacity={0.0}
                                    />
                                  </linearGradient>
                                  <linearGradient id="gradAporte" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartTheme.aporteLine} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={chartTheme.aporteLine} stopOpacity={0.0} />
                                  </linearGradient>
                                </defs>
                                {cfg.showGrid && (
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                                )}
                                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} />
                                <Tooltip content={<CustomCyberTooltip isCurrency={true} />} />
                                {cfg.showLegend && <Legend wrapperStyle={{ fontSize: "11px" }} />}
                                {milestones.map((m) => (
                                  <ReferenceLine key={m.id} y={m.value} stroke={m.color} strokeDasharray="3 3" />
                                ))}
                                <Area
                                  type={cfg.curveType}
                                  dataKey="acumulado"
                                  name="Patrimônio Acumulado"
                                  stroke={primarySeriesColor(chartTheme.patrimonyLine)}
                                  strokeWidth={cfg.strokeWidth}
                                  dot={cfg.showDots}
                                  fill="url(#gradPatrimony)"
                                  fillOpacity={cfg.fillArea ? 1 : 0}
                                  connectNulls={true}
                                  label={
                                    cfg.showDataLabels
                                      ? { position: "top", fill: "#cbd5e1", fontSize: 10 }
                                      : false
                                  }
                                />
                                <Area
                                  type={cfg.curveType}
                                  dataKey="aportado"
                                  name="Aporte Mensal"
                                  stroke={chartTheme.aporteLine}
                                  strokeWidth={cfg.strokeWidth}
                                  dot={cfg.showDots}
                                  fill="url(#gradAporte)"
                                  fillOpacity={cfg.fillArea ? 1 : 0}
                                  connectNulls={true}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {widget.id === "category_chart" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            <div className="h-60 select-none">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={categoryChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={52}
                                    outerRadius={82}
                                    paddingAngle={3}
                                    label={cfg.showDataLabels}
                                  >
                                    {categoryChartData.map((entry, idx) => (
                                      <Cell
                                        key={`cell-${idx}`}
                                        fill={entry.color}
                                        stroke="rgba(15,23,42,0.8)"
                                        strokeWidth={2}
                                      />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomCyberTooltip isCurrency={true} />} />
                                  {cfg.showLegend && <Legend wrapperStyle={{ fontSize: "11px" }} />}
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 text-xs">
                              {categoryChartData.map((cat) => {
                                const pct = Math.round((cat.value / totalExpenses) * 100);
                                return (
                                  <div
                                    key={cat.name}
                                    className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                                        {renderCategorySemanticIcon(cat.name, cat.color)}
                                        <span className="truncate max-w-[120px]">{cat.name}</span>
                                      </span>
                                      <span className={`font-bold text-white ${moneyBlur}`}>
                                        {formatBRL(cat.value)} ({pct}%)
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full"
                                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {widget.id === "credit_chart" && (
                          <div className="h-64 select-none">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={creditChartData} barSize={28}>
                                {cfg.showGrid && (
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                                )}
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} />
                                <Tooltip content={<CustomCyberTooltip isCurrency={true} />} />
                                {cfg.showLegend && <Legend wrapperStyle={{ fontSize: "11px" }} />}
                                <Bar
                                  dataKey="usado"
                                  name="Fatura Aberta (R$)"
                                  fill={primarySeriesColor(chartTheme.creditUsedBar)}
                                  radius={[6, 6, 0, 0]}
                                  label={
                                    cfg.showDataLabels
                                      ? { position: "top", fill: "#cbd5e1", fontSize: 10 }
                                      : false
                                  }
                                />
                                <Bar
                                  dataKey="disponivel"
                                  name="Limite Disponível (R$)"
                                  fill={chartTheme.creditAvailableBar}
                                  radius={[6, 6, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {widget.id === "benefits_strava" && (
                          <div className="space-y-4 text-xs">
                            <div className="p-4 rounded-2xl bg-slate-950/75 border border-emerald-500/20 flex items-center justify-between">
                              <div>
                                <span className="text-slate-400 block">
                                  Benefícios Mensais (VA + Auxílio Combustível)
                                </span>
                                <strong className={`text-lg font-extrabold text-emerald-400 ${moneyBlur}`}>
                                  {formatBRL(1365)}
                                </strong>
                                <span className="text-[11px] text-slate-400 block">
                                  Gasto de Gasolina no Mês: {formatBRL(autoMetrics.fuelTotal)}
                                </span>
                              </div>
                              <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400">
                                <Car className="w-6 h-6" />
                              </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-950/75 border border-orange-500/25 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-orange-400 font-bold flex items-center gap-1">
                                    <Flame className="w-3.5 h-3.5" /> Meta Anual de Corrida (Strava)
                                  </span>
                                  <strong className="text-base text-white">
                                    {stravaStats.ytdKm} km / {annualRunGoalKm} km
                                  </strong>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-300 font-bold text-[11px]">
                                  {Math.min(100, Math.round((stravaStats.ytdKm / Math.max(1, annualRunGoalKm)) * 100))}%
                                </span>
                              </div>
                              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.round((stravaStats.ytdKm / Math.max(1, annualRunGoalKm)) * 100)
                                    )}%`
                                  }}
                                />
                              </div>
                              <div className="flex justify-between text-[11px] text-slate-400">
                                <span>{stravaStats.ytdRuns} corridas em 2026</span>
                                <span>Histórico Total: {stravaStats.allTimeKm} km</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </ChartCard>
                    );
                  })}
              </div>
            </div>
          ) : activeTab === "spotify" ? (
            <SpotifyModule ownerDisplayName={currentUser ?? ownerUsername ?? "Sabrino"} />
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
              sheetsSyncStatus={sheetsSyncStatus}
              setSheetsSyncStatus={setSheetsSyncStatus}
              stravaConfig={stravaConfig}
              setStravaConfig={(cfg: StravaCredentials) => {
                setStravaConfig(cfg);
                updateUserSettingsInDb({ stravaConfig: cfg });
              }}
              stravaSyncStatus={stravaSyncStatus}
              setStravaSyncStatus={setStravaSyncStatus}
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

      {/* COMMAND PALETTE MODAL (CTRL + K) */}
      {showCommandModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl overflow-hidden text-xs">
            <div className="p-3.5 border-b border-white/10 flex items-center gap-2.5 bg-slate-950/70">
              <Search className="w-4 h-4 text-indigo-400" />
              <input
                type="text"
                autoFocus
                placeholder="Digite um comando ou aba (Ex: novo, csv, spotify, receber, veiculo)..."
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="w-full bg-transparent text-white outline-none placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowCommandModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 max-h-72 overflow-y-auto space-y-1">
              {[
                {
                  label: "Criar Novo Lançamento",
                  action: () => {
                    setShowCommandModal(false);
                    handleOpenNewTxModal();
                  },
                  icon: <Plus className="w-3.5 h-3.5 text-emerald-400" />
                },
                {
                  label: "Novo Valor a Receber (Empréstimo)",
                  action: () => {
                    setShowCommandModal(false);
                    handleOpenNewTxModal("A Receber");
                  },
                  icon: <HandCoins className="w-3.5 h-3.5 text-amber-400" />
                },
                {
                  label: "Exportar Relatório CSV (Padrão Excel)",
                  action: () => {
                    setShowCommandModal(false);
                    handleExportCSV();
                  },
                  icon: <Download className="w-3.5 h-3.5 text-indigo-400" />
                },
                {
                  label: "Alternar Modo Privacidade (Olho)",
                  action: () => {
                    setShowCommandModal(false);
                    setPrivacyMode((p) => !p);
                  },
                  icon: <Eye className="w-3.5 h-3.5 text-sky-400" />
                },
                {
                  label: "Ir para Dashboard & BI",
                  action: () => {
                    setShowCommandModal(false);
                    setActiveTab("dashboard");
                  },
                  icon: <LayoutDashboard className="w-3.5 h-3.5 text-slate-300" />
                },
                {
                  label: "Ir para Spotify Família",
                  action: () => {
                    setShowCommandModal(false);
                    setActiveTab("spotify");
                  },
                  icon: <SpotifyLogo size={14} />
                },
                {
                  label: "Ir para Lançamentos",
                  action: () => {
                    setShowCommandModal(false);
                    setActiveTab("transactions");
                  },
                  icon: <Wallet className="w-3.5 h-3.5 text-slate-300" />
                },
                {
                  label: "Ir para Valores a Receber 2.0",
                  action: () => {
                    setShowCommandModal(false);
                    setActiveTab("receivables");
                  },
                  icon: <HandCoins className="w-3.5 h-3.5 text-slate-300" />
                },
                {
                  label: "Ir para Meu Veículo (Auto)",
                  action: () => {
                    setShowCommandModal(false);
                    setActiveTab("auto");
                  },
                  icon: <Car className="w-3.5 h-3.5 text-slate-300" />
                },
                {
                  label: "Ir para Configurações & Integrações",
                  action: () => {
                    setShowCommandModal(false);
                    setActiveTab("settings");
                  },
                  icon: <Settings className="w-3.5 h-3.5 text-slate-300" />
                }
              ]
                .filter((item) => item.label.toLowerCase().includes(commandQuery.toLowerCase()))
                .map((cmd, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={cmd.action}
                    className="w-full px-3.5 py-2.5 rounded-xl hover:bg-indigo-600/20 text-left text-slate-200 hover:text-white flex items-center gap-2.5 transition"
                  >
                    {cmd.icon}
                    <span className="font-semibold">{cmd.label}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LANÇAMENTO */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveTransaction}
            className="w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-white">
                {editingTxId ? "Editar Lançamento" : "Novo Lançamento"}
              </h3>
              <button
                type="button"
                onClick={() => setShowTxModal(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={newTx.date}
                  onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Valor Total (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Descrição</label>
              <input
                type="text"
                required
                placeholder="Ex: Supermercado, Gasolina, Empréstimo..."
                value={newTx.description}
                onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Categoria</label>
                <select
                  value={newTx.category}
                  onChange={(e) => {
                    const c = e.target.value;
                    setNewTx({ ...newTx, category: c, status: getAutomaticStatus(newTx.paymentMethod, c) });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-indigo-500"
                >
                  {categoriesCatalog.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Método de Pagamento</label>
                <select
                  value={newTx.paymentMethod}
                  onChange={(e) => {
                    const m = e.target.value;
                    setNewTx({ ...newTx, paymentMethod: m, status: getAutomaticStatus(m, newTx.category) });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-indigo-500"
                >
                  {paymentMethods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {newTx.paymentMethod === "Cartão de Crédito" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Cartão Utilizado</label>
                  <select
                    value={newTx.cardUsed}
                    onChange={(e) => setNewTx({ ...newTx, cardUsed: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white"
                  >
                    {cards.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {!editingTxId && (
                  <div>
                    <label className="text-slate-400 block mb-1">Parcelamento</label>
                    <select
                      value={newTx.installments}
                      onChange={(e) => setNewTx({ ...newTx, installments: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white"
                    >
                      {Array.from({ length: 24 }, (_, idx) => idx + 1).map((n) => (
                        <option key={n} value={String(n)}>
                          {n}x {n === 1 ? "(À vista)" : "parcelas"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {newTx.category === "A Receber" && (
              <div>
                <label className="text-amber-300 font-bold block mb-1">Nome da Pessoa (Devedor)</label>
                <input
                  type="text"
                  placeholder="Ex: Lucas, Matheus..."
                  value={newTx.debtor}
                  onChange={(e) => setNewTx({ ...newTx, debtor: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-white"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Odômetro / KM (Opcional)</label>
                <input
                  type="number"
                  placeholder="Ex: 49120"
                  value={newTx.km}
                  onChange={(e) => setNewTx({ ...newTx, km: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Litros Abastecidos (Opcional)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 42.5"
                  value={newTx.liters}
                  onChange={(e) => setNewTx({ ...newTx, liters: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTxModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSavingTx}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold flex items-center gap-1.5 transition"
              >
                {isSavingTx ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{isSavingTx ? "Salvando..." : "Salvar Lançamento"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE CHANGELOG */}
      {showChangelogModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl space-y-4 text-xs max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-white">Histórico de Versões (Changelog)</h3>
              <button
                type="button"
                onClick={() => setShowChangelogModal(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {CHANGELOG_HISTORY.map((ch) => (
              <div key={ch.version} className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-emerald-400 font-bold">
                    Versão {ch.version} — {ch.title}
                  </strong>
                  <span className="text-[10px] text-slate-400 font-mono">{ch.date}</span>
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {ch.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}