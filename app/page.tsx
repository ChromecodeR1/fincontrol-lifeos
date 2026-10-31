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
  AlertCircle,
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
  Database,
  Landmark,
  Fuel,
  Gauge,
  Layers,
  Trash2
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
  APP_VERSION,
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
  BankItem,
  BankInstitution,
  INITIAL_BANKS,
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
  renderCategorySemanticIcon,
  formatDateBR,
  isResgateCategory,
  AutoInmetroConfig,
  DEFAULT_AUTO_INMETRO_CONFIG,
  DEFAULT_AUTO_DASHBOARD_LAYOUT,
  getInstallmentSeries,
  parseInstallmentInfo,
  InstallmentSeriesData,
  toCents,
  fromCents,
  safeAdd,
  safeSub,
  getCardInvoiceCompetence,
  calculateCardExposure,
  calculateBankExposure,
  calculateBankBalance,
  calculatePatrimonyEvolution,
  calculateStaticStatusSummary
} from "./lifeos-data";
import {
  validateTransactionData,
  validateCreditCardData,
  validateBankData,
  validateStaticStatusData
} from "./schemas";
import {
  fetchAllCoindexData,
  migrateAllStateToSupabase,
  upsertTransactionsInDb,
  deleteTransactionInDb,
  deleteTransactionsInDb,
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
import { TransactionModal } from "./components/TransactionModal";
import { ProfileModal } from "./components/ProfileModal";

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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  // Notificações com opção "Visualizar"
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [bellViewMode, setBellViewMode] = useState<"unread" | "viewed">("unread");
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  // SPRINT 15: Modal de Confirmação Customizado (Clara Vance)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmLabel: "Excluir",
    cancelLabel: "Cancelar",
    danger: true,
    onConfirm: () => {}
  });

  const askConfirmation = useCallback(
    (config: {
      title: string;
      description: string;
      confirmLabel?: string;
      cancelLabel?: string;
      danger?: boolean;
      onConfirm: () => void;
    }) => {
      setConfirmModal({
        isOpen: true,
        title: config.title,
        description: config.description,
        confirmLabel: config.confirmLabel || "Confirmar",
        cancelLabel: config.cancelLabel || "Cancelar",
        danger: config.danger !== false,
        onConfirm: () => {
          config.onConfirm();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      });
    },
    []
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Dados Principais do Sistema
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [debtorMap, setDebtorMap] = useState<Record<string, string>>(INITIAL_DEBTOR_MAP);
  const [banks, setBanks] = useState<BankItem[]>(INITIAL_BANKS);
  const [cards, setCards] = useState<CreditCardItem[]>(INITIAL_CARDS);
  const [staticStatus, setStaticStatus] = useState<StaticStatusItem[]>(INITIAL_STATIC_STATUS);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const [bioLogs, setBioLogs] = useState<BioLog[]>(INITIAL_BIO_LOGS);
  const [notes, setNotes] = useState<BrainNote[]>(INITIAL_NOTES);
  const [okrs, setOkrs] = useState<PersonalOKR[]>(INITIAL_OKRS);
  const [alertRules, setAlertRules] = useState<CustomAlertRule[]>(INITIAL_ALERT_RULES);
  const [milestones] = useState<ChartMilestone[]>(INITIAL_MILESTONES);
  const [dashboardLayout, setDashboardLayout] = useState<DashboardWidgetConfig[]>(DEFAULT_DASHBOARD_LAYOUT);

  // Layout e Configurações dos Gráficos da Aba Meus Veículos (Requisitos 1 e 3)
  const [autoInmetroConfig, setAutoInmetroConfig] = useState<AutoInmetroConfig>(DEFAULT_AUTO_INMETRO_CONFIG);
  const [autoDashboardLayout, setAutoDashboardLayout] = useState<DashboardWidgetConfig[]>(DEFAULT_AUTO_DASHBOARD_LAYOUT);
  const [autoWidgetConfigs, setAutoWidgetConfigs] = useState<Record<string, ChartWidgetSettings>>({});
  const [draggingAutoWidgetId, setDraggingAutoWidgetId] = useState<string | null>(null);
  const [dragOverAutoWidgetId, setDragOverAutoWidgetId] = useState<string | null>(null);

  const getAutoWidgetSettings = (
    widgetId: string,
    defaultColor = "auto",
    fallbackCurve: ChartLineCurve = "monotone"
  ): ChartWidgetSettings => {
    const base: ChartWidgetSettings = {
      ...DEFAULT_CHART_WIDGET_SETTINGS,
      color: defaultColor,
      curveType: fallbackCurve
    };
    const saved: Partial<ChartWidgetSettings> | undefined = autoWidgetConfigs[widgetId];
    return saved ? { ...base, ...saved } : base;
  };

  const handleUpdateAutoWidgetSettings = (widgetId: string, next: ChartWidgetSettings) => {
    setAutoWidgetConfigs((prev) => {
      const updated = { ...prev, [widgetId]: next };
      try {
        localStorage.setItem("lifeos_auto_widget_configs_v1", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleUpdateAutoWidgetSize = (widgetId: string, nextSize: ChartWidgetSize) => {
    setAutoDashboardLayout((prev) => {
      const updated = prev.map((w) => (w.id === widgetId ? { ...w, size: nextSize } : w));
      try {
        localStorage.setItem("lifeos_auto_dash_layout_v1", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleDragStartAutoWidget = (id: string) => {
    setDraggingAutoWidgetId(id);
  };

  const handleDragEnterAutoWidget = (targetId: string) => {
    if (!draggingAutoWidgetId || draggingAutoWidgetId === targetId) return;
    setDragOverAutoWidgetId(targetId);
    setAutoDashboardLayout((prev) => {
      const fromIndex = prev.findIndex((w) => w.id === draggingAutoWidgetId);
      const toIndex = prev.findIndex((w) => w.id === targetId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev;
      const reordered = [...prev];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);
      return reordered;
    });
  };

  const handleDragEndAutoWidget = () => {
    setDraggingAutoWidgetId(null);
    setDragOverAutoWidgetId(null);
    setAutoDashboardLayout((cur) => {
      try {
        localStorage.setItem("lifeos_auto_dash_layout_v1", JSON.stringify(cur));
      } catch {}
      return cur;
    });
  };

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
  const [isEditingSeries, setIsEditingSeries] = useState(false);
  const [applyToAllSeries, setApplyToAllSeries] = useState(true);
  const [editingSeriesData, setEditingSeriesData] = useState<InstallmentSeriesData | null>(null);

  // Modal de Exclusão de Série Parcelada
  const [deleteSeriesModal, setDeleteSeriesModal] = useState<{
    isOpen: boolean;
    targetTx: Transaction | null;
    seriesData: InstallmentSeriesData | null;
  }>({
    isOpen: false,
    targetTx: null,
    seriesData: null
  });
  const [isDeletingSeries, setIsDeletingSeries] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isPostoExpress, setIsPostoExpress] = useState(false);
  const [expressFuelType, setExpressFuelType] = useState<"Gasolina" | "Etanol">("Gasolina");
  const [newTx, setNewTx] = useState<{
    date: string;
    description: string;
    amount: string;
    category: string;
    costType: CostType;
    paymentMethod: string;
    cardUsed: string;
    bankAccount: string;
    status: TxStatus;
    km: string;
    liters: string;
    installments: string;
    debtor: string;
    isTransfer?: boolean;
    sourceBank?: string;
    destinationBank?: string;
    isSplit?: boolean;
    thirdPartyAmount?: string;
    thirdPartyName?: string;
    personalAmount?: string;
    linkedReceivableId?: string;
  }>({
    date: "2026-10-20",
    description: "",
    amount: "",
    category: "Alimentação",
    costType: "Variável",
    paymentMethod: "PIX",
    cardUsed: "Nubank Ultravioleta",
    bankAccount: "Nubank",
    status: "Pago",
    km: "",
    liters: "",
    installments: "1",
    debtor: "",
    isTransfer: false,
    sourceBank: "Nubank",
    destinationBank: "Inter",
    isSplit: false,
    thirdPartyAmount: "",
    thirdPartyName: "",
    personalAmount: "",
    linkedReceivableId: ""
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
    logoUrl: "",
    bankId: ""
  });
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [newBank, setNewBank] = useState({ name: "", logoUrl: "", limit: "", limitType: "Cartão de Crédito" });
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
  const [newNote, setNewNote] = useState<{
    title: string;
    content: string;
    tag: BrainNote["tag"];
    itemType?: "note" | "wish";
    price?: string;
    description?: string;
    priority?: "Essencial" | "Planejado" | "Desejo";
    storeUrl?: string;
    completed?: boolean;
  }>({
    title: "",
    content: "",
    tag: "#Ideias",
    itemType: "note",
    price: "",
    description: "",
    priority: "Planejado",
    storeUrl: "",
    completed: false
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
      type: "success" | "warning" | "info" | "error" = "info",
      logCategory?: SystemLogEntry["category"]
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, subtitle, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500); // 3.5 segundos auto-fechamento suave (Sprint 15)

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
        const sBanks = localStorage.getItem("lifeos_banks_v1");
        if (sBanks) setBanks(JSON.parse(sBanks));
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
        const sAutoInmetro = localStorage.getItem("lifeos_auto_inmetro_v1");
        if (sAutoInmetro) setAutoInmetroConfig(JSON.parse(sAutoInmetro));
        const sAutoLayout = localStorage.getItem("lifeos_auto_dash_layout_v1");
        if (sAutoLayout) setAutoDashboardLayout(JSON.parse(sAutoLayout));
        const sAutoWidgetConfigs = localStorage.getItem("lifeos_auto_widget_configs_v1");
        if (sAutoWidgetConfigs) setAutoWidgetConfigs(JSON.parse(sAutoWidgetConfigs));
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
      const found = categoriesCatalog.find((c) => c.name.toLowerCase() === category.toLowerCase());
      if (found) return found.flow;
      const lower = category.toLowerCase();
      if (
        lower.includes("salário") ||
        lower.includes("benefício") ||
        lower.includes("comissão") ||
        lower.includes("rendimento") ||
        lower.includes("serviço")
      ) {
        return "INCOME";
      }
      if (
        lower.includes("aporte") ||
        lower.includes("investimento") ||
        lower.includes("caixinha") ||
        lower.includes("cripto") ||
        lower.includes("renda fixa") ||
        lower.includes("renda variável") ||
        lower.includes("lci") ||
        lower.includes("lca") ||
        lower.includes("resgate")
      ) {
        return "INVESTMENT";
      }
      return "EXPENSE";
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
      const nonTransferList = list.filter((t) => !t.isTransfer && !t.isSplitChild && t.category !== "Transferência entre Contas");
      const income = safeAdd(...nonTransferList.filter((t) => getFlowType(t.category) === "INCOME").map((t) => t.amount));
      const expense = safeAdd(
        ...nonTransferList
          .filter((t) => getFlowType(t.category) === "EXPENSE")
          .map((t) => (t.isSplit && t.personalAmount != null ? t.personalAmount : t.amount))
      );

      const investmentTxs = nonTransferList.filter((t) => getFlowType(t.category) === "INVESTMENT");
      const aportesMes = safeAdd(...investmentTxs.filter((t) => !isResgateCategory(t.category)).map((t) => t.amount));
      const resgatesMes = safeAdd(...investmentTxs.filter((t) => isResgateCategory(t.category)).map((t) => t.amount));

      const invested = safeSub(aportesMes, resgatesMes);
      const balance = safeSub(income, safeAdd(expense, invested));

      const personalSpent = safeAdd(
        ...nonTransferList
          .filter((t) => t.category === "Gastos Pessoais / Besteiras")
          .map((t) => (t.isSplit && t.personalAmount != null ? t.personalAmount : t.amount))
      );

      return {
        income,
        expense,
        invested,
        aportes: aportesMes,
        resgates: resgatesMes,
        balance,
        personalSpent
      };
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
    return calculatePatrimonyEvolution(transactions, HISTORICAL_INVESTMENTS);
  }, [transactions]);

  // UPDATE 2: Meses distintos no período e limite acumulado proporcional
  const filterMonthsCount = useMemo(() => {
    if (selectedMonth !== "ALL") return 1;
    const monthsSet = new Set(
      filteredTransactions.map((t) => t.date.slice(0, 7)).filter((m) => /^\d{4}-\d{2}$/.test(m))
    );
    return Math.max(1, monthsSet.size);
  }, [selectedMonth, filteredTransactions]);

  const effectivePersonalBudgetLimit = personalBudgetLimit * filterMonthsCount;

  // UPDATE 1 & SPRINT 16: Top 5 categorias estritamente de despesas reais (Donut)
  const categoryChartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions
      .filter((t) => {
        if (t.isTransfer || t.isSplitChild || t.category === "Transferência entre Contas") return false;
        const cLower = (t.category || "").toLowerCase();
        if (
          cLower.includes("recebimento") ||
          cLower.includes("resgate") ||
          cLower.includes("reembolso") ||
          cLower.includes("estorno") ||
          cLower.includes("a receber")
        ) return false;
        return getFlowType(t.category) === "EXPENSE";
      })
      .forEach((t) => {
        const val = t.isSplit && t.personalAmount != null ? t.personalAmount : t.amount;
        map.set(t.category, safeAdd(map.get(t.category) || 0, val));
      });
    const sorted = Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
        color: categoryColors[name] || "#6366f1"
      }))
      .sort((a, b) => b.value - a.value);

    if (sorted.length <= 5) return sorted;
    const top5 = sorted.slice(0, 5);
    const othersValue = sorted.slice(5).reduce((acc, curr) => safeAdd(acc, curr.value), 0);
    if (othersValue > 0) {
      top5.push({
        name: "Outros",
        value: othersValue,
        color: "#64748b"
      });
    }
    return top5;
  }, [filteredTransactions, getFlowType, categoryColors]);

  const creditChartData = useMemo(() => {
    return cards.map((c) => {
      const exposure = calculateCardExposure(c, transactions);
      return {
        name: c.name,
        usado: exposure.used,
        disponivel: exposure.available
      };
    });
  }, [cards, transactions]);

  // Safe-to-Spend: Indicador de Saldo Livre Projetado no Mês (Sprint 12 - Regra Contábil Estrita)
  const safeToSpend = useMemo(() => {
    // 1. Saldo Atual em Contas: somatório de saldos reais de todas as contas bancárias cadastradas
    const currentCash = safeAdd(...banks.map((b) => calculateBankBalance(b, transactions, getFlowType)));

    // 2. Receitas Pendentes do Mês (excluindo transferências)
    const pendingIncome = safeAdd(
      ...filteredTransactions
        .filter(
          (t) =>
            !t.isTransfer &&
            !t.isSplitChild &&
            t.category !== "Transferência entre Contas" &&
            getFlowType(t.category) === "INCOME" &&
            t.status !== "Pago"
        )
        .map((t) => t.amount)
    );

    // 3. Despesas / Contas Fixas Pendentes do Mês (exceto compras de cartão que entram na fatura para evitar dupla contagem)
    const pendingDirectExpenses = safeAdd(
      ...filteredTransactions
        .filter(
          (t) =>
            !t.isTransfer &&
            !t.isSplitChild &&
            t.category !== "Transferência entre Contas" &&
            getFlowType(t.category) === "EXPENSE" &&
            t.status !== "Pago" &&
            t.paymentMethod !== "Cartão de Crédito"
        )
        .map((t) => (t.isSplit && t.personalAmount != null ? t.personalAmount : t.amount))
    );

    // 4. Faturas Abertas de Cartão
    const pendingInvoices = safeAdd(
      ...cards.map((c) => {
        const exp = calculateCardExposure(c, transactions);
        return exp.used;
      })
    );

    // Saldo Livre Projetado = Saldo Atual em Contas + Receitas Pendentes do Mês - Despesas/Contas Fixas Pendentes do Mês
    const projected = safeSub(
      safeAdd(currentCash, pendingIncome),
      safeAdd(pendingDirectExpenses, pendingInvoices)
    );

    return {
      currentCash,
      pendingIncome,
      pendingDirectExpenses,
      pendingInvoices,
      projected
    };
  }, [banks, cards, transactions, filteredTransactions, getFlowType]);

  // Ranking e Análise de Limites por Banco (Requisito 7, Sprint 8 & SSOT Sprint 10)
  const bankLimitsAnalytics = useMemo(() => {
    const list = banks.map((bank) => {
      const exposure = calculateBankExposure(bank, cards, transactions);
      const bankCards = cards.filter((c) => c.bankId === bank.id);
      const totalLimit = exposure.limit;
      const usado = exposure.used;
      const disponivel = exposure.available;
      const pctUsado = totalLimit > 0 ? Math.min(100, Math.round((usado / totalLimit) * 100)) : 0;
      return {
        id: bank.id,
        name: bank.name,
        logoUrl: bank.logoUrl,
        limitType: bank.limitType || (bankCards.length > 0 ? "Cartão de Crédito" : "Crédito Global"),
        totalLimit,
        usado,
        disponivel,
        pctUsado
      };
    });

    // Ordenação do ranking do maior limite para o menor (Critério de aceite do Requisito 7)
    list.sort((a, b) => b.totalLimit - a.totalLimit);

    const globalTotalLimit = safeAdd(...list.map((b) => b.totalLimit));
    const globalTotalUsado = safeAdd(...list.map((b) => b.usado));
    const globalTotalDisponivel = Math.max(0, safeSub(globalTotalLimit, globalTotalUsado));
    const globalComprometimento =
      globalTotalLimit > 0 ? Math.min(100, Math.round((globalTotalUsado / globalTotalLimit) * 100)) : 0;

    return {
      banks: list,
      chartData: list.map((b) => ({
        name: b.name,
        usado: b.usado,
        disponivel: b.disponivel,
        total: b.totalLimit,
        limitType: b.limitType
      })),
      globalTotalLimit,
      globalTotalUsado,
      globalTotalDisponivel,
      globalComprometimento
    };
  }, [banks, cards, transactions]);

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

    if (monthSummary.personalSpent >= effectivePersonalBudgetLimit * 0.8) {
      list.push({
        id: `notif-budget-${selectedMonth}-${Math.floor(monthSummary.personalSpent / 25)}`,
        title:
          monthSummary.personalSpent > effectivePersonalBudgetLimit
            ? "Teto de Gastos Pessoais Excedido!"
            : "Alerta do Termômetro Pessoal",
        detail: `Utilizado ${formatBRL(monthSummary.personalSpent)} de ${formatBRL(effectivePersonalBudgetLimit)} ${
          filterMonthsCount > 1 ? `(${formatBRL(personalBudgetLimit)} × ${filterMonthsCount} meses)` : `em ${selectedMonth}`
        }.`,
        severity: monthSummary.personalSpent > effectivePersonalBudgetLimit ? "warning" : "info"
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
    effectivePersonalBudgetLimit,
    filterMonthsCount,
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
      "Cartão / Banco",
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
        escapeCell(t.cardUsed || t.bankAccount || "-"),
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
    setIsEditingSeries(false);
    setApplyToAllSeries(true);
    setEditingSeriesData(null);
    const cat = defaultCat || "Alimentação";
    const defaultMethod = "PIX";
    const isFuel =
      cat.toLowerCase().includes("gasolina") ||
      cat.toLowerCase().includes("combustível") ||
      cat.toLowerCase().includes("veículo");
    setIsPostoExpress(isFuel);
    setExpressFuelType("Gasolina");
    setNewTx({
      date: new Date().toISOString().split("T")[0],
      description: isFuel ? "Abastecimento Gasolina Comum" : "",
      amount: "",
      category: isFuel ? "Gasolina/Combustível" : cat,
      costType: "Variável",
      paymentMethod: defaultMethod,
      cardUsed: cards[0]?.name || "Nubank Ultravioleta",
      bankAccount: banks[0]?.name || "Nubank",
      status: getAutomaticStatus(defaultMethod, isFuel ? "Gasolina/Combustível" : cat),
      km: "",
      liters: "",
      installments: "1",
      debtor: "",
      isTransfer: false,
      sourceBank: banks[0]?.name || "Nubank",
      destinationBank: banks[1]?.name || banks[0]?.name || "Inter",
      isSplit: false,
      thirdPartyAmount: "",
      thirdPartyName: "",
      personalAmount: "",
      linkedReceivableId: ""
    });
    setShowTxModal(true);
  };

  const handleStartEditTransaction = (tx: Transaction) => {
    setEditingTxId(tx.id);
    const seriesData = getInstallmentSeries(tx, transactions);
    const hasSeries = seriesData.isInstallment && seriesData.series.length > 1;
    setIsEditingSeries(hasSeries);
    setApplyToAllSeries(hasSeries);
    setEditingSeriesData(hasSeries ? seriesData : null);

    const isFuel = Boolean(
      (tx.liters && tx.liters > 0) ||
      tx.category.toLowerCase().includes("gasolina") ||
      tx.category.toLowerCase().includes("combustível")
    );
    const isEtanol =
      tx.description.toLowerCase().includes("etanol") ||
      tx.description.toLowerCase().includes("álcool");
    setIsPostoExpress(isFuel);
    setExpressFuelType(isEtanol ? "Etanol" : "Gasolina");
    const matchedCard = tx.cardUsed ? cards.find((c) => c.name === tx.cardUsed) : undefined;
    const initialBank =
      tx.bankAccount ||
      matchedCard?.bankName ||
      (matchedCard?.bankId ? banks.find((b) => b.id === matchedCard.bankId)?.name : "") ||
      (tx.paymentMethod !== "Cartão de Crédito" ? tx.cardUsed : "") ||
      banks[0]?.name ||
      "";

    setNewTx({
      date: tx.date,
      description: hasSeries ? seriesData.baseDescription : tx.description,
      amount: String(tx.amount),
      category: tx.category,
      costType: tx.costType,
      paymentMethod: tx.paymentMethod,
      cardUsed: tx.cardUsed || cards[0]?.name || "Nubank Ultravioleta",
      bankAccount: initialBank,
      status: tx.status,
      km: tx.km ? String(tx.km) : "",
      liters: tx.liters ? String(tx.liters) : "",
      installments: "1",
      debtor: tx.debtor || debtorMap[tx.id] || "",
      isTransfer: Boolean(tx.isTransfer || tx.category === "Transferência entre Contas"),
      sourceBank: tx.sourceBank || initialBank,
      destinationBank: tx.destinationBank || (banks.find((b) => b.name !== initialBank)?.name || banks[1]?.name || "Inter"),
      isSplit: Boolean(tx.isSplit),
      thirdPartyAmount: tx.thirdPartyAmount != null ? String(tx.thirdPartyAmount) : "",
      thirdPartyName: tx.thirdPartyName || "",
      personalAmount: tx.personalAmount != null ? String(tx.personalAmount) : "",
      linkedReceivableId: tx.linkedReceivableId || ""
    });
    setShowTxModal(true);
  };

  // CRUD de Lançamentos Conectado ao Supabase
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = parseFloat(newTx.amount);
    const isCredit = newTx.paymentMethod === "Cartão de Crédito";
    const matchedCard = isCredit ? cards.find((c) => c.name === newTx.cardUsed) : undefined;
    const resolvedBank = isCredit
      ? (matchedCard?.bankName ||
          (matchedCard?.bankId ? banks.find((b) => b.id === matchedCard.bankId)?.name : undefined) ||
          newTx.bankAccount ||
          undefined)
      : (newTx.bankAccount || undefined);
    const savedCardUsed = isCredit ? (newTx.cardUsed || undefined) : undefined;

    const isTransferTx = Boolean(newTx.isTransfer || newTx.category === "Transferência entre Contas");
    const isSplitTx = Boolean(!isTransferTx && newTx.isSplit && newTx.category !== "A Receber");
    const parsedThirdAmount = isSplitTx && newTx.thirdPartyAmount ? parseFloat(newTx.thirdPartyAmount) : undefined;
    const cleanThirdName = isSplitTx && newTx.thirdPartyName ? sanitizeText(newTx.thirdPartyName) : undefined;
    const calculatedPersonal = isSplitTx && parsedThirdAmount != null
      ? safeSub(totalAmount, parsedThirdAmount)
      : undefined;

    // Validação Estrita com Schema Zod (Sprint 10 - Lucas Viana & Sprint 13)
    const validation = validateTransactionData({
      description: newTx.description,
      amount: totalAmount,
      date: newTx.date,
      category: newTx.category,
      paymentMethod: newTx.paymentMethod,
      costType: newTx.costType,
      status: newTx.status,
      cardUsed: savedCardUsed,
      bankAccount: resolvedBank,
      debtor: newTx.category === "A Receber" ? newTx.debtor : undefined,
      km: newTx.km ? Number(newTx.km) : undefined,
      liters: newTx.liters ? Number(newTx.liters) : undefined,
      isTransfer: isTransferTx,
      sourceBank: newTx.sourceBank || resolvedBank,
      destinationBank: newTx.destinationBank,
      isSplit: isSplitTx,
      thirdPartyAmount: parsedThirdAmount,
      thirdPartyName: cleanThirdName,
      personalAmount: calculatedPersonal,
      linkedReceivableId: newTx.linkedReceivableId || undefined
    });

    if (!validation.success) {
      notify("Atenção no Lançamento", validation.error, "warning", "FINANCE");
      return;
    }

    setIsSavingTx(true);
    const nowIso = new Date().toISOString();
    const installmentsCount = Math.max(1, Math.min(24, parseInt(newTx.installments || "1", 10)));

    try {
      if (editingTxId) {
        if (isEditingSeries && applyToAllSeries && editingSeriesData && editingSeriesData.series.length > 1) {
          const cleanBase = sanitizeText(newTx.description)
            .replace(/\s*[\(\[]?\s*\d{1,2}\s*[\/|\\]\s*\d{1,2}\s*[\)\]]?\s*$/, "")
            .trim();
          const seriesIds = new Set(editingSeriesData.series.map((t) => t.id));
          const totalCount = editingSeriesData.totalInstallments || editingSeriesData.series.length;
          const commonGroupId = editingSeriesData.groupId || `grp-${Date.now()}`;

          const editedItems: Transaction[] = [];
          const updated = transactions.map((t) => {
            if (seriesIds.has(t.id)) {
              const parsed = parseInstallmentInfo(t);
              const itemNum = parsed.current || (editingSeriesData.series.findIndex((s) => s.id === t.id) + 1);
              const itemInfo = `${itemNum}/${totalCount}`;
              const hasParenInOriginal = /\(\d{1,2}\/\d{1,2}\)/.test(t.description);
              const finalDescription = hasParenInOriginal ? `${cleanBase} (${itemInfo})` : cleanBase;

              const itemInvoiceMonth = isCredit ? getCardInvoiceCompetence(t.date, matchedCard?.closingDay) : undefined;

              const updatedItem: Transaction = {
                ...t,
                description: finalDescription,
                category: newTx.category,
                costType: newTx.costType,
                paymentMethod: newTx.paymentMethod,
                cardUsed: savedCardUsed,
                bankAccount: resolvedBank,
                installmentInfo: itemInfo,
                installmentGroupId: commonGroupId,
                invoiceMonth: itemInvoiceMonth,
                debtor: newTx.category === "A Receber" ? sanitizeText(newTx.debtor) : t.debtor,
                updatedAt: nowIso
              };
              editedItems.push(updatedItem);
              return updatedItem;
            }
            return t;
          });

          setTransactions(updated);
          localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));
          await upsertTransactionsInDb(editedItems, debtorMap);
          notify(
            "Série Parcelada Atualizada!",
            `${editedItems.length} parcelas de "${cleanBase}" atualizadas com sucesso.`,
            "success",
            "FINANCE"
          );
        } else {
          let editedItem: Transaction | null = null;
          const itemInvoiceMonth = isCredit ? getCardInvoiceCompetence(newTx.date, matchedCard?.closingDay) : undefined;

          const existingTx = transactions.find((t) => t.id === editingTxId);
          const existingChildId = existingTx?.linkedReceivableId;
          let childItemToUpsert: Transaction | null = null;
          let childIdToDelete: string | null = null;
          let finalLinkedReceivableId = existingChildId;

          if (isSplitTx && parsedThirdAmount && parsedThirdAmount > 0 && cleanThirdName) {
            const recId = existingChildId || `tx-split-rec-${Date.now()}`;
            finalLinkedReceivableId = recId;
            childItemToUpsert = {
              id: recId,
              date: newTx.date,
              description: `Divisão: ${sanitizeText(newTx.description)}`,
              amount: parsedThirdAmount,
              category: "A Receber",
              costType: "Variável",
              paymentMethod: "Outro",
              status: "Pendente / Na Fatura",
              debtor: cleanThirdName,
              paidAmount: 0,
              isSplitChild: true,
              linkedSplitParentId: editingTxId,
              updatedAt: nowIso
            };
          } else if (!isSplitTx && existingChildId) {
            childIdToDelete = existingChildId;
            finalLinkedReceivableId = undefined;
          }

          let updated = transactions.map((t) => {
            if (t.id === editingTxId) {
              editedItem = {
                ...t,
                date: newTx.date,
                description: sanitizeText(newTx.description),
                amount: totalAmount,
                category: newTx.category,
                costType: newTx.costType,
                paymentMethod: newTx.paymentMethod,
                cardUsed: savedCardUsed,
                bankAccount: resolvedBank,
                status: newTx.status,
                km: newTx.km ? Number(newTx.km) : undefined,
                liters: newTx.liters ? Number(newTx.liters) : undefined,
                invoiceMonth: itemInvoiceMonth,
                debtor: newTx.category === "A Receber" ? sanitizeText(newTx.debtor) : t.debtor,
                isTransfer: isTransferTx,
                sourceBank: newTx.sourceBank || resolvedBank,
                destinationBank: newTx.destinationBank,
                isSplit: isSplitTx,
                thirdPartyAmount: parsedThirdAmount,
                thirdPartyName: cleanThirdName,
                personalAmount: calculatedPersonal,
                linkedReceivableId: finalLinkedReceivableId,
                updatedAt: nowIso
              };
              return editedItem;
            }
            if (childItemToUpsert && t.id === childItemToUpsert.id) {
              return childItemToUpsert;
            }
            return t;
          });

          if (childIdToDelete) {
            updated = updated.filter((t) => t.id !== childIdToDelete);
            await deleteTransactionInDb(childIdToDelete);
          } else if (childItemToUpsert && !updated.some((t) => t.id === childItemToUpsert!.id)) {
            updated = [childItemToUpsert, ...updated];
          }

          const nextDebtorMap = { ...debtorMap };
          if (childItemToUpsert && cleanThirdName) {
            nextDebtorMap[childItemToUpsert.id] = cleanThirdName;
            setDebtorMap(nextDebtorMap);
            localStorage.setItem("lifeos_debtors_v8", JSON.stringify(nextDebtorMap));
          }

          setTransactions(updated);
          localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));
          const itemsToDb = editedItem
            ? (childItemToUpsert ? [editedItem, childItemToUpsert] : [editedItem])
            : [];
          if (itemsToDb.length > 0) await upsertTransactionsInDb(itemsToDb, nextDebtorMap);
          if (isPostoExpress && newTx.liters && Number(newTx.liters) > 0) {
            const priceL = (totalAmount / Number(newTx.liters)).toFixed(2);
            notify("Abastecimento Atualizado!", `${newTx.description} — ${newTx.liters}L a R$ ${priceL}/L`, "success", "FINANCE");
          } else {
            notify("Lançamento Atualizado", `${newTx.description} (${formatBRL(totalAmount)})`, "success", "FINANCE");
          }
        }
      } else if (installmentsCount > 1 && isCredit) {
        const groupId = `grp-${Date.now()}`;
        const totalCents = toCents(totalAmount);
        const baseSliceCents = Math.floor(totalCents / installmentsCount);
        const firstSliceCents = totalCents - baseSliceCents * (installmentsCount - 1);
        const baseSlice = fromCents(baseSliceCents);
        const firstSlice = fromCents(firstSliceCents);
        const createdList: Transaction[] = [];

        for (let i = 0; i < installmentsCount; i++) {
          const instDate = addMonthsToDate(newTx.date, i);
          const instInvoiceMonth = getCardInvoiceCompetence(instDate, matchedCard?.closingDay);
          createdList.push({
            id: `tx-${Date.now()}-${i}`,
            date: instDate,
            description: sanitizeText(newTx.description),
            amount: i === 0 ? firstSlice : baseSlice,
            category: newTx.category,
            costType: newTx.costType,
            paymentMethod: newTx.paymentMethod,
            cardUsed: savedCardUsed,
            bankAccount: resolvedBank,
            status: "Pendente / Na Fatura",
            installmentInfo: `${i + 1}/${installmentsCount}`,
            installmentGroupId: groupId,
            invoiceMonth: instInvoiceMonth,
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
        const itemInvoiceMonth = isCredit ? getCardInvoiceCompetence(newTx.date, matchedCard?.closingDay) : undefined;
        const parentId = `tx-${Date.now()}`;
        let childItem: Transaction | null = null;
        let childId: string | undefined = undefined;

        if (isSplitTx && parsedThirdAmount && parsedThirdAmount > 0 && cleanThirdName) {
          childId = `tx-split-rec-${Date.now()}`;
          childItem = {
            id: childId,
            date: newTx.date,
            description: `Divisão: ${sanitizeText(newTx.description)}`,
            amount: parsedThirdAmount,
            category: "A Receber",
            costType: "Variável",
            paymentMethod: "Outro",
            status: "Pendente / Na Fatura",
            debtor: cleanThirdName,
            paidAmount: 0,
            isSplitChild: true,
            linkedSplitParentId: parentId,
            updatedAt: nowIso
          };
        }

        const item: Transaction = {
          id: parentId,
          date: newTx.date,
          description: sanitizeText(newTx.description),
          amount: totalAmount,
          category: newTx.category,
          costType: newTx.costType,
          paymentMethod: newTx.paymentMethod,
          cardUsed: savedCardUsed,
          bankAccount: resolvedBank,
          status: newTx.status,
          km: newTx.km ? Number(newTx.km) : undefined,
          liters: newTx.liters ? Number(newTx.liters) : undefined,
          invoiceMonth: itemInvoiceMonth,
          debtor: newTx.category === "A Receber" ? sanitizeText(newTx.debtor) : undefined,
          isTransfer: isTransferTx,
          sourceBank: newTx.sourceBank || resolvedBank,
          destinationBank: newTx.destinationBank,
          isSplit: isSplitTx,
          thirdPartyAmount: parsedThirdAmount,
          thirdPartyName: cleanThirdName,
          personalAmount: calculatedPersonal,
          linkedReceivableId: childId,
          updatedAt: nowIso
        };

        const nextDebtorMap = { ...debtorMap };
        if (childItem && cleanThirdName) {
          nextDebtorMap[childItem.id] = cleanThirdName;
          setDebtorMap(nextDebtorMap);
          localStorage.setItem("lifeos_debtors_v8", JSON.stringify(nextDebtorMap));
        }

        const toSaveList = childItem ? [item, childItem] : [item];
        const updated = [...toSaveList, ...transactions];
        setTransactions(updated);
        localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));
        await upsertTransactionsInDb(toSaveList, nextDebtorMap);
        if (isPostoExpress && newTx.liters && Number(newTx.liters) > 0) {
          const priceL = (totalAmount / Number(newTx.liters)).toFixed(2);
          notify("Abastecimento Registrado!", `${item.description} — ${newTx.liters}L a R$ ${priceL}/L`, "success", "FINANCE");
        } else if (isSplitTx && cleanThirdName && parsedThirdAmount) {
          notify(
            "Gasto Dividido Registrado!",
            `${item.description} (${formatBRL(item.amount)}). Sua parte: ${formatBRL(calculatedPersonal || 0)} | A receber de ${cleanThirdName}: ${formatBRL(parsedThirdAmount)}`,
            "success",
            "FINANCE"
          );
        } else {
          notify("Lançamento Registrado!", `${item.description} — ${formatBRL(item.amount)}`, "success", "FINANCE");
        }
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
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    const seriesData = getInstallmentSeries(tx, transactions);
    if (seriesData.isInstallment && seriesData.series.length > 1) {
      setDeleteSeriesModal({
        isOpen: true,
        targetTx: tx,
        seriesData
      });
      return;
    }

    askConfirmation({
      title: "Excluir Lançamento?",
      description: `Deseja realmente excluir "${tx.description}" (${formatBRL(tx.amount)})? Esta ação é irreversível.`,
      confirmLabel: "Sim, Excluir",
      danger: true,
      onConfirm: async () => {
        const childId = tx.linkedReceivableId;
        const parentId = tx.linkedSplitParentId;

        const updated = transactions
          .filter((t) => t.id !== id && t.id !== childId)
          .map((t) => {
            if (parentId && t.id === parentId) {
              return {
                ...t,
                isSplit: false,
                thirdPartyAmount: undefined,
                thirdPartyName: undefined,
                personalAmount: undefined,
                linkedReceivableId: undefined
              };
            }
            return t;
          });

        setTransactions(updated);
        localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));
        await deleteTransactionInDb(id);
        if (childId) {
          await deleteTransactionInDb(childId);
        }
        notify("Lançamento Removido", `"${tx.description}" excluído com sucesso.`, "warning", "FINANCE");
      }
    });
  };

  const handleConfirmDeleteInstallment = async (deleteAll: boolean) => {
    if (!deleteSeriesModal.targetTx || !deleteSeriesModal.seriesData) return;
    setIsDeletingSeries(true);
    try {
      if (deleteAll) {
        const seriesList = deleteSeriesModal.seriesData.series;
        const idsToDelete = new Set(seriesList.map((t) => t.id));
        const updated = transactions.filter((t) => !idsToDelete.has(t.id));
        setTransactions(updated);
        localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));
        await deleteTransactionsInDb(Array.from(idsToDelete));
        notify(
          "Série Parcelada Removida",
          `Todas as ${idsToDelete.size} parcelas foram excluídas e o limite do cartão foi liberado.`,
          "warning",
          "FINANCE"
        );
      } else {
        const targetId = deleteSeriesModal.targetTx.id;
        const updated = transactions.filter((t) => t.id !== targetId);
        setTransactions(updated);
        localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));
        await deleteTransactionInDb(targetId);
        notify(
          "Parcela Removida",
          `A parcela (${deleteSeriesModal.targetTx.installmentInfo || "individual"}) foi excluída com sucesso.`,
          "warning",
          "FINANCE"
        );
      }
    } finally {
      setIsDeletingSeries(false);
      setDeleteSeriesModal({ isOpen: false, targetTx: null, seriesData: null });
    }
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

  const handlePartialPaymentReceivable = (tx: Transaction, addAmount: number, destBank?: string) => {
    if (isNaN(addAmount) || addAmount <= 0) {
      notify("Valor Inválido", "O valor a abater deve ser maior que zero.", "warning", "FINANCE");
      return;
    }
    const cleanAmount = fromCents(toCents(addAmount));
    const targetBank = destBank || banks[0]?.name || "Nubank";
    const currPaidCents = toCents(tx.paidAmount || 0);
    const addCents = toCents(cleanAmount);
    const txAmountCents = toCents(tx.amount);
    const nextPaidCents = Math.min(txAmountCents, currPaidCents + addCents);
    const nextPaid = fromCents(nextPaidCents);
    const nextStatus: TxStatus = nextPaidCents >= txAmountCents ? "Pago" : "Pendente / Na Fatura";
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split("T")[0];
    const debtorName = tx.debtor || debtorMap[tx.id] || "Devedor";

    const changedTx: Transaction = {
      ...tx,
      paidAmount: nextPaid,
      status: nextStatus,
      updatedAt: nowIso
    };

    const incomeTx: Transaction = {
      id: `tx-recv-${Date.now()}`,
      date: todayStr,
      description: `Recebimento: ${debtorName} (${tx.description})`,
      amount: cleanAmount,
      category: "Recebimento de Empréstimo",
      costType: "Variável",
      paymentMethod: "PIX",
      bankAccount: targetBank,
      status: "Pago",
      updatedAt: nowIso
    };

    const updated = [incomeTx, ...transactions.map((t) => (t.id === tx.id ? changedTx : t))];
    setTransactions(updated);
    localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));
    upsertTransactionsInDb([changedTx, incomeTx], debtorMap);
    notify(
      "Recebimento Registrado!",
      `Entrada de ${formatBRL(cleanAmount)} creditada em ${targetBank}.`,
      "success",
      "FINANCE"
    );
  };

  const saveStaticStatus = (items: StaticStatusItem[]) => {
    setStaticStatus(items);
    localStorage.setItem("lifeos_status_v8", JSON.stringify(items));
    syncStaticStatusListInDb(items);
  };

  const handleSaveStaticStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newStatusItem.amount);
    const validation = validateStaticStatusData({
      title: newStatusItem.title,
      type: newStatusItem.type,
      amount: val,
      notes: newStatusItem.notes
    });

    if (!validation.success) {
      notify("Validação de Base Fixa", validation.error, "warning", "CONFIG");
      return;
    }

    if (editingStatusId) {
      saveStaticStatus(
        staticStatus.map((s) =>
          s.id === editingStatusId
            ? {
                ...s,
                title: validation.data.title,
                type: validation.data.type,
                amount: validation.data.amount,
                notes: validation.data.notes || ""
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
          title: validation.data.title,
          type: validation.data.type,
          amount: validation.data.amount,
          notes: validation.data.notes || ""
        }
      ]);
    }
    setNewStatusItem({ title: "", type: "Custo Fixo", amount: "", notes: "" });
  };

  // Automação: Lançar Fixos do Mês com Trava Anti-Duplicidade (Etapa 6)
  const handleLaunchFixedTransactions = useCallback(
    async (targetMonthOverride?: string) => {
      const targetMonth =
        targetMonthOverride ||
        (selectedMonth && selectedMonth !== "ALL"
          ? selectedMonth
          : new Date().toISOString().slice(0, 7));

      const normalizeDesc = (str: string) =>
        str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();

      const txsInMonth = transactions.filter((t) => t.date.startsWith(targetMonth));
      const itemsToCreate: Transaction[] = [];
      const nowIso = new Date().toISOString();

      for (const item of staticStatus) {
        const itemTitleNorm = normalizeDesc(item.title);

        const isDuplicate = txsInMonth.some((t) => {
          const tDescNorm = normalizeDesc(t.description);
          const descMatch =
            tDescNorm === itemTitleNorm ||
            (itemTitleNorm.length >= 4 && tDescNorm.includes(itemTitleNorm)) ||
            (tDescNorm.length >= 4 && itemTitleNorm.includes(tDescNorm));

          const keywordMatch =
            (itemTitleNorm.includes("salario") && tDescNorm.includes("salario")) ||
            (itemTitleNorm.includes("aporte") && tDescNorm.includes("aporte")) ||
            (itemTitleNorm.includes("academia") && tDescNorm.includes("academia")) ||
            (itemTitleNorm.includes("internet") && tDescNorm.includes("internet")) ||
            (itemTitleNorm.includes("combustivel") && tDescNorm.includes("combustivel"));

          return descMatch || keywordMatch;
        });

        if (!isDuplicate) {
          // Extrai o dia preferencial das anotações se existir (Ex: "Dia 5", "5º dia útil", "Dia 10")
          let dayStr = "05";
          const dayMatch = item.notes ? item.notes.match(/(\d{1,2})[ºª]?\s*(?:dia|útil)?/i) : null;
          if (dayMatch && dayMatch[1]) {
            const d = Math.min(28, Math.max(1, parseInt(dayMatch[1], 10)));
            dayStr = String(d).padStart(2, "0");
          }

          // Data no mês sem risco de UTC-3
          const txDate = `${targetMonth}-${dayStr}`;

          let cat = "Moradia";
          let pMethod = "PIX";
          let cType: CostType = "Fixo";
          let status: TxStatus = "Pago";
          let cardUsed: string | undefined = undefined;
          let bankAccount: string | undefined = banks[0]?.name || "Nubank";

          if (item.type === "Renda Base") {
            cat = "Salário";
            pMethod = "PIX";
            status = "Pago";
            bankAccount =
              banks.find((b) => b.accountType === "Conta Corrente" || b.accountType === "Conta Digital")?.name ||
              banks[0]?.name ||
              "Nubank";
          } else if (item.type === "Benefício") {
            cat = "Benefícios (VA/Combustível)";
            pMethod = "Cartão ECX";
            status = "Pago";
            bankAccount =
              banks.find((b) => b.accountType === "Benefícios")?.name ||
              banks[0]?.name ||
              "Cartão ECX";
          } else if (item.type === "Meta Aporte") {
            cat = "Aporte / Investimento";
            pMethod = "PIX";
            status = "Pago";
            bankAccount =
              banks.find((b) => b.accountType === "Investimentos")?.name ||
              banks[0]?.name ||
              "Nubank";
          } else {
            // Custo Fixo
            const lowerTitle = item.title.toLowerCase();
            const lowerNotes = item.notes.toLowerCase();
            const isCredit =
              lowerNotes.includes("cartão") ||
              lowerNotes.includes("cartao") ||
              lowerTitle.includes("cartão") ||
              lowerTitle.includes("cartao");

            if (isCredit) {
              pMethod = "Cartão de Crédito";
              cardUsed = cards[0]?.name || "Nubank Ultravioleta";
              const matchedCard = cards.find((c) => c.name === cardUsed);
              bankAccount = matchedCard?.bankName || banks[0]?.name || "Nubank";
              status = "Pendente / Na Fatura";
            } else {
              pMethod = "PIX";
              status = "Pago";
              bankAccount = banks[0]?.name || "Nubank";
            }

            if (lowerTitle.includes("academia") || lowerTitle.includes("saúde") || lowerTitle.includes("saude")) {
              cat = "Saúde/Academia";
            } else if (
              lowerTitle.includes("internet") ||
              lowerTitle.includes("fibra") ||
              lowerTitle.includes("assinatura") ||
              lowerTitle.includes("netflix") ||
              lowerTitle.includes("spotify")
            ) {
              cat = "Assinaturas/Internet";
            } else if (
              lowerTitle.includes("luz") ||
              lowerTitle.includes("energia") ||
              lowerTitle.includes("água") ||
              lowerTitle.includes("aluguel") ||
              lowerTitle.includes("condomínio")
            ) {
              cat = "Moradia";
            } else if (lowerTitle.includes("seguro") || lowerTitle.includes("ipva") || lowerTitle.includes("manutenção")) {
              cat = "Manutenção";
            } else if (lowerTitle.includes("educação") || lowerTitle.includes("curso") || lowerTitle.includes("faculdade")) {
              cat = "Educação";
            }
          }

          itemsToCreate.push({
            id: `tx-fixo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            date: txDate,
            description: sanitizeText(item.title),
            amount: Number(item.amount),
            category: cat,
            costType: cType,
            paymentMethod: pMethod,
            cardUsed,
            bankAccount,
            status,
            updatedAt: nowIso
          });
        }
      }

      if (itemsToCreate.length > 0) {
        const nextTransactions = [...itemsToCreate, ...transactions];
        setTransactions(nextTransactions);
        localStorage.setItem("lifeos_txs_v8", JSON.stringify(nextTransactions));
        await upsertTransactionsInDb(itemsToCreate, debtorMap);

        const [y, m] = targetMonth.split("-");
        const monthLabel = `${m}/${y}`;
        notify(
          "Lançamentos Fixos Gerados!",
          `${itemsToCreate.length} lançamento(s) fixo(s) adicionado(s) a ${monthLabel} com trava anti-duplicidade.`,
          "success",
          "FINANCE"
        );
      } else {
        const [y, m] = targetMonth.split("-");
        const monthLabel = `${m}/${y}`;
        notify(
          "Tudo em Dia!",
          `Todos os ${staticStatus.length} itens da base fixa já estão lançados em ${monthLabel}.`,
          "info",
          "FINANCE"
        );
      }

      return { createdCount: itemsToCreate.length, totalCount: staticStatus.length };
    },
    [transactions, staticStatus, selectedMonth, banks, cards, debtorMap, notify]
  );

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    const lim = parseFloat(newCard.limit);
    const closing = Number(newCard.closingDay);
    const due = Number(newCard.dueDay);
    const matchedBank = banks.find((b) => b.id === newCard.bankId);

    const validation = validateCreditCardData({
      name: newCard.name,
      brand: newCard.brand || "Mastercard Black",
      limit: lim,
      closingDay: closing,
      dueDay: due,
      logoUrl: newCard.logoUrl || undefined,
      bankId: newCard.bankId || undefined,
      bankName: matchedBank?.name || undefined
    });

    if (!validation.success) {
      notify("Validação de Cartão", validation.error, "warning", "CONFIG");
      return;
    }

    const cardObj: CreditCardItem = {
      id: editingCardId || `card-${Date.now()}`,
      name: validation.data.name,
      brand: validation.data.brand,
      limit: validation.data.limit,
      closingDay: validation.data.closingDay,
      dueDay: validation.data.dueDay,
      logoUrl: validation.data.logoUrl || undefined,
      bankId: validation.data.bankId || undefined,
      bankName: validation.data.bankName || undefined
    };
    const updated = editingCardId ? cards.map((c) => (c.id === editingCardId ? cardObj : c)) : [...cards, cardObj];
    setCards(updated);
    localStorage.setItem("lifeos_cards_v8", JSON.stringify(updated));
    upsertCardInDb(cardObj);
    setEditingCardId(null);
    setNewCard({ name: "", brand: "Mastercard Black", limit: "", closingDay: "25", dueDay: "5", logoUrl: "", bankId: "" });
    notify("Cartão Salvo", `${cardObj.name} configurado com sucesso.`, "success", "CONFIG");
  };

  const handleDeleteCard = (id: string) => {
    const card = cards.find((c) => c.id === id);
    askConfirmation({
      title: "Excluir Cartão de Crédito?",
      description: `Tem certeza que deseja remover o cartão "${card?.name || id}"? Os lançamentos vinculados serão mantidos.`,
      confirmLabel: "Excluir Cartão",
      danger: true,
      onConfirm: () => {
        const updated = cards.filter((c) => c.id !== id);
        setCards(updated);
        localStorage.setItem("lifeos_cards_v8", JSON.stringify(updated));
        deleteCardInDb(id);
        notify("Cartão Removido", `"${card?.name || "Cartão"}" excluído com sucesso.`, "warning", "CONFIG");
      }
    });
  };


  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLimit = newBank.limit && !isNaN(parseFloat(newBank.limit)) ? parseFloat(newBank.limit) : undefined;

    const validation = validateBankData({
      name: newBank.name,
      limit: parsedLimit,
      limitType: newBank.limitType || "Cartão de Crédito",
      logoUrl: newBank.logoUrl || undefined
    });

    if (!validation.success) {
      notify("Validação de Instituição", validation.error, "warning", "CONFIG");
      return;
    }

    const bankObj: BankItem = {
      id: editingBankId || `bank-${Date.now()}`,
      name: sanitizeText(validation.data.name),
      logoUrl: validation.data.logoUrl || undefined,
      limit: validation.data.limit,
      limitType: validation.data.limitType || "Cartão de Crédito"
    };
    const updated = editingBankId
      ? banks.map((b) => (b.id === editingBankId ? bankObj : b))
      : [...banks, bankObj];
    setBanks(updated);
    localStorage.setItem("lifeos_banks_v1", JSON.stringify(updated));

    // SSOT: Se o nome do banco foi alterado, sincroniza nos cartões vinculados
    if (editingBankId) {
      const updatedCards = cards.map((c) =>
        c.bankId === editingBankId ? { ...c, bankName: bankObj.name } : c
      );
      setCards(updatedCards);
      localStorage.setItem("lifeos_cards_v8", JSON.stringify(updatedCards));
    }

    setEditingBankId(null);
    setNewBank({ name: "", logoUrl: "", limit: "", limitType: "Cartão de Crédito" });
    notify("Banco salvo", `${bankObj.name} ${parsedLimit ? `(Limite: ${formatBRL(parsedLimit)})` : ""}`, "success");
  };

  const handleDeleteBank = (id: string) => {
    const bank = banks.find((b) => b.id === id);
    askConfirmation({
      title: "Excluir Instituição Bancária?",
      description: `Tem certeza que deseja remover o banco "${bank?.name || id}"? Os cartões vinculados terão seu vínculo limpo.`,
      confirmLabel: "Excluir Banco",
      danger: true,
      onConfirm: () => {
        const updated = banks.filter((b) => b.id !== id);
        setBanks(updated);
        localStorage.setItem("lifeos_banks_v1", JSON.stringify(updated));
        const updatedCards = cards.map((c) => (c.bankId === id ? { ...c, bankId: undefined } : c));
        setCards(updatedCards);
        localStorage.setItem("lifeos_cards_v8", JSON.stringify(updatedCards));
        notify("Banco Removido", `"${bank?.name || "Banco"}" excluído com sucesso.`, "warning", "CONFIG");
      }
    });
  };
  const handlePayCardInvoice = async (cardName: string, originBankName?: string) => {
    const pendingTxs = transactions.filter(
      (t) =>
        t.paymentMethod === "Cartão de Crédito" &&
        t.cardUsed === cardName &&
        t.status === "Pendente / Na Fatura"
    );
    if (pendingTxs.length === 0) {
      notify("Fatura Sem Pendências", `O cartão ${cardName} não possui saldo utilizado em aberto.`, "info", "FINANCE");
      return;
    }

    const totalInvoice = safeAdd(...pendingTxs.map((t) => t.amount));
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split("T")[0];
    const resolvedOriginBank = originBankName || banks[0]?.name || "Nubank";

    // 1. Marca as transações da fatura como "Pago"
    const changedList: Transaction[] = [];
    const updated = transactions.map((t) => {
      if (
        t.paymentMethod === "Cartão de Crédito" &&
        t.cardUsed === cardName &&
        t.status === "Pendente / Na Fatura"
      ) {
        const paidTx: Transaction = {
          ...t,
          status: "Pago" as TxStatus,
          paidAmount: t.amount,
          updatedAt: nowIso
        };
        changedList.push(paidTx);
        return paidTx;
      }
      return t;
    });

    // 2. Gera a transação de saída correspondente no Banco escolhido
    const invoicePaymentTx: Transaction = {
      id: `tx-inv-${Date.now()}`,
      date: todayStr,
      description: `Pagamento Fatura ${cardName}`,
      amount: totalInvoice,
      category: "Pagamento de Fatura",
      costType: "Fixo",
      paymentMethod: "Débito em Conta",
      bankAccount: resolvedOriginBank,
      status: "Pago",
      updatedAt: nowIso
    };

    const finalUpdated = [invoicePaymentTx, ...updated];
    setTransactions(finalUpdated);
    localStorage.setItem("lifeos_txs_v8", JSON.stringify(finalUpdated));
    await upsertTransactionsInDb([invoicePaymentTx, ...changedList], debtorMap);

    notify(
      "Fatura Paga com Sucesso!",
      `Fatura de ${formatBRL(totalInvoice)} do cartão ${cardName} debitada de ${resolvedOriginBank}. Limite liberado!`,
      "success",
      "FINANCE"
    );
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
    if (inc === 0) return;
    const isWithdraw = inc < 0;
    const absVal = Math.round(Math.abs(inc) * 100) / 100;
    const newSaved = isWithdraw
      ? Math.max(0, Math.round((w.savedAmount - absVal) * 100) / 100)
      : Math.round((w.savedAmount + absVal) * 100) / 100;
    const updatedWish: WishlistItem = { ...w, savedAmount: newSaved };
    const updatedList = wishlist.map((item) => (item.id === w.id ? updatedWish : item));
    setWishlist(updatedList);
    localStorage.setItem("lifeos_wish_v8", JSON.stringify(updatedList));
    upsertWishInDb(updatedWish);

    const newTxItem: Transaction = {
      id: `tx-wish-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: isWithdraw ? `Resgate Caixinha: ${w.title}` : `Aporte Caixinha: ${w.title}`,
      amount: absVal,
      category: isWithdraw ? "Resgate Caixinha" : "Aporte / Investimento",
      costType: "Variável",
      paymentMethod: "PIX",
      bankAccount: w.institution || undefined,
      status: "Pago",
      wishlistId: w.id,
      updatedAt: new Date().toISOString()
    };
    const nextTxs = [newTxItem, ...transactions];
    setTransactions(nextTxs);
    localStorage.setItem("lifeos_txs_v8", JSON.stringify(nextTxs));
    upsertTransactionsInDb([newTxItem], debtorMap);
    if (isWithdraw) {
      notify("Resgate da Caixinha Realizado!", `- ${formatBRL(absVal)} de ${w.title} resgatados para sua conta.`, "info", "FINANCE");
    } else {
      notify("Guardado na Caixinha!", `+ ${formatBRL(absVal)} em ${w.title}`, "success", "FINANCE");
    }
  };

  const handleDeleteWish = (id: string) => {
    const item = wishlist.find((w) => w.id === id);
    askConfirmation({
      title: "Excluir Item do Mural?",
      description: `Deseja realmente remover "${item?.title || "este item"}" da sua lista?`,
      confirmLabel: "Excluir Item",
      danger: true,
      onConfirm: () => {
        const updated = wishlist.filter((w) => w.id !== id);
        setWishlist(updated);
        localStorage.setItem("lifeos_wish_v8", JSON.stringify(updated));
        deleteWishInDb(id);
        notify("Item Removido", `"${item?.title || "Item"}" excluído do mural.`, "info", "FINANCE");
      }
    });
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
    const finalDesc = (newNote.description || newNote.content || "").trim();
    const parsedPrice = newNote.itemType === "wish" && newNote.price ? Number(newNote.price) || 0 : undefined;
    const noteObj: BrainNote = {
      id: editingNoteId || `n-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      title: newNote.title.trim(),
      content: finalDesc,
      description: finalDesc,
      tag: newNote.tag,
      itemType: newNote.itemType || "note",
      price: parsedPrice,
      priority: newNote.itemType === "wish" ? newNote.priority || "Planejado" : undefined,
      storeUrl: newNote.storeUrl?.trim() || undefined,
      completed: Boolean(newNote.completed),
      completedAt: newNote.completed ? new Date().toISOString().split("T")[0] : undefined
    };
    const updated = editingNoteId
      ? notes.map((n) => (n.id === editingNoteId ? { ...n, ...noteObj } : n))
      : [noteObj, ...notes];
    setNotes(updated);
    localStorage.setItem("lifeos_notes_v8", JSON.stringify(updated));
    upsertNoteInDb(noteObj);
    setEditingNoteId(null);
    setNewNote({
      title: "",
      content: "",
      tag: "#Ideias",
      itemType: "note",
      price: "",
      description: "",
      priority: "Planejado",
      storeUrl: "",
      completed: false
    });
  };

  const handleToggleNoteCompleted = (id: string) => {
    const updated = notes.map((n) => {
      if (n.id !== id) return n;
      const nextCompleted = !n.completed;
      return {
        ...n,
        completed: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString().split("T")[0] : undefined
      };
    });
    setNotes(updated);
    localStorage.setItem("lifeos_notes_v8", JSON.stringify(updated));
    const target = updated.find((n) => n.id === id);
    if (target) upsertNoteInDb(target);
  };

  const handleDeleteNote = (id: string) => {
    const item = notes.find((n) => n.id === id);
    askConfirmation({
      title: "Excluir Anotação?",
      description: `Tem certeza que deseja excluir "${item?.title || "esta anotação"}"?`,
      confirmLabel: "Excluir",
      danger: true,
      onConfirm: () => {
        const updated = notes.filter((n) => n.id !== id);
        setNotes(updated);
        localStorage.setItem("lifeos_notes_v8", JSON.stringify(updated));
        deleteNoteInDb(id);
        notify("Anotação Removida", `"${item?.title || "Anotação"}" excluída.`, "info", "CONFIG");
      }
    });
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
    askConfirmation({
      title: "Excluir Forma de Pagamento?",
      description: `Tem certeza que deseja remover "${m}" das opções de pagamento?`,
      confirmLabel: "Excluir",
      danger: true,
      onConfirm: () => {
        const next = paymentMethods.filter((item) => item !== m);
        setPaymentMethods(next);
        syncPaymentMethodsInDb(next);
        notify("Forma de Pagamento Removida", `"${m}" foi removida.`, "info", "CONFIG");
      }
    });
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
    askConfirmation({
      title: "Excluir Categoria?",
      description: `Tem certeza que deseja excluir a categoria "${name}"?`,
      confirmLabel: "Excluir",
      danger: true,
      onConfirm: () => {
        const nextCatalog = categoriesCatalog.filter((c) => c.name !== name);
        setCategoriesCatalog(nextCatalog);
        syncCategoriesInDb(nextCatalog, categoryColors);
        notify("Categoria Removida", `"${name}" foi excluída.`, "info", "CONFIG");
      }
    });
  };

  // Edição de Métodos de Pagamento e Categorias mantendo histórico de lançamentos (Requisito 4)
  const handleUpdatePaymentMethod = (oldName: string, newName: string) => {
    const clean = sanitizeText(newName);
    if (!clean || clean === oldName) return;
    const nextMethods = paymentMethods.map((m) => (m === oldName ? clean : m));
    setPaymentMethods(nextMethods);
    syncPaymentMethodsInDb(nextMethods);

    let changed = false;
    const changedTxs: Transaction[] = [];
    const updatedTxs = transactions.map((t) => {
      if (t.paymentMethod === oldName) {
        changed = true;
        const up = { ...t, paymentMethod: clean, updatedAt: new Date().toISOString() };
        changedTxs.push(up);
        return up;
      }
      return t;
    });

    if (changed) {
      setTransactions(updatedTxs);
      localStorage.setItem("lifeos_txs_v8", JSON.stringify(updatedTxs));
      upsertTransactionsInDb(changedTxs, debtorMap);
    }

    notify(
      "Método de Pagamento Atualizado!",
      `"${oldName}" alterado para "${clean}" (${changedTxs.length} lançamento(s) atualizado(s)).`,
      "success",
      "CONFIG"
    );
  };

  const handleUpdateCategory = (
    oldName: string,
    updatedCat: CategoryCatalogItem,
    newColor: string
  ) => {
    const cleanName = sanitizeText(updatedCat.name);
    if (!cleanName) return;

    const nextCatalog = categoriesCatalog.map((c) =>
      c.name === oldName ? { ...updatedCat, name: cleanName } : c
    );
    const nextColors = { ...categoryColors };
    if (oldName !== cleanName) {
      delete nextColors[oldName];
    }
    nextColors[cleanName] = newColor;

    setCategoriesCatalog(nextCatalog);
    setCategoryColors(nextColors);
    syncCategoriesInDb(nextCatalog, nextColors);

    if (oldName !== cleanName) {
      let changed = false;
      const changedTxs: Transaction[] = [];
      const updatedTxs = transactions.map((t) => {
        if (t.category === oldName) {
          changed = true;
          const up = { ...t, category: cleanName, updatedAt: new Date().toISOString() };
          changedTxs.push(up);
          return up;
        }
        return t;
      });

      if (changed) {
        setTransactions(updatedTxs);
        localStorage.setItem("lifeos_txs_v8", JSON.stringify(updatedTxs));
        upsertTransactionsInDb(changedTxs, debtorMap);
      }
    }

    notify(
      "Categoria Atualizada!",
      `Categoria "${cleanName}" atualizada com sucesso.`,
      "success",
      "CONFIG"
    );
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
    const dump = {
      version: APP_VERSION,
      exportDate: new Date().toISOString(),
      user: {
        nickname: currentUser || "Usuário",
        avatar: currentUserAvatar || ""
      },
      transactions,
      banks,
      cards,
      staticStatus,
      wishlist,
      bioLogs,
      notes,
      okrs,
      alertRules,
      debtorMap,
      categoriesCatalog,
      categoryColors,
      paymentMethods,
      settings: {
        personalBudgetLimit,
        monthlyInvestmentGoal,
        patrimonyTarget,
        annualRunGoalKm,
        chartTheme,
        dashboardLayout,
        chartConfigs,
        themeMode
      }
    };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coindex-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Backup Exportado com Sucesso!", "Arquivo JSON gerado e salvo.", "success", "CONFIG");
  };

  const handleImportFullBackupJSON = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const raw = String(ev.target?.result);
        const d = JSON.parse(raw);
        if (!d || typeof d !== "object") {
          throw new Error("Formato inválido");
        }

        if (d.transactions && Array.isArray(d.transactions)) {
          setTransactions(d.transactions);
          localStorage.setItem("lifeos_txs_v8", JSON.stringify(d.transactions));
        }
        if (d.banks && Array.isArray(d.banks)) {
          setBanks(d.banks);
          localStorage.setItem("lifeos_banks_v1", JSON.stringify(d.banks));
        }
        if (d.cards && Array.isArray(d.cards)) {
          setCards(d.cards);
          localStorage.setItem("lifeos_cards_v8", JSON.stringify(d.cards));
        }
        if (d.staticStatus && Array.isArray(d.staticStatus)) {
          setStaticStatus(d.staticStatus);
          localStorage.setItem("lifeos_static_status_v8", JSON.stringify(d.staticStatus));
        }
        if (d.wishlist && Array.isArray(d.wishlist)) {
          setWishlist(d.wishlist);
          localStorage.setItem("lifeos_wish_v8", JSON.stringify(d.wishlist));
        }
        if (d.bioLogs && Array.isArray(d.bioLogs)) {
          setBioLogs(d.bioLogs);
          localStorage.setItem("lifeos_biologs_v8", JSON.stringify(d.bioLogs));
        }
        if (d.notes && Array.isArray(d.notes)) {
          setNotes(d.notes);
          localStorage.setItem("lifeos_notes_v8", JSON.stringify(d.notes));
        }
        if (d.okrs && Array.isArray(d.okrs)) {
          setOkrs(d.okrs);
          localStorage.setItem("lifeos_okrs_v8", JSON.stringify(d.okrs));
        }
        if (d.alertRules && Array.isArray(d.alertRules)) {
          setAlertRules(d.alertRules);
          localStorage.setItem("lifeos_alerts_v8", JSON.stringify(d.alertRules));
        }
        if (d.debtorMap && typeof d.debtorMap === "object") {
          setDebtorMap(d.debtorMap);
          localStorage.setItem("lifeos_debtors_v8", JSON.stringify(d.debtorMap));
        }
        if (d.categoriesCatalog && Array.isArray(d.categoriesCatalog)) {
          setCategoriesCatalog(d.categoriesCatalog);
        }
        if (d.categoryColors && typeof d.categoryColors === "object") {
          setCategoryColors(d.categoryColors);
        }
        if (d.paymentMethods && Array.isArray(d.paymentMethods)) {
          setPaymentMethods(d.paymentMethods);
        }
        if (d.user) {
          if (d.user.nickname) {
            setCurrentUser(d.user.nickname);
            localStorage.setItem("lifeos_nickname_v8", d.user.nickname);
          }
          if (d.user.avatar) {
            setCurrentUserAvatar(d.user.avatar);
            localStorage.setItem("lifeos_avatar_v8", d.user.avatar);
          }
        }
        if (d.settings) {
          if (d.settings.personalBudgetLimit != null) setPersonalBudgetLimit(d.settings.personalBudgetLimit);
          if (d.settings.monthlyInvestmentGoal != null) setMonthlyInvestmentGoal(d.settings.monthlyInvestmentGoal);
          if (d.settings.patrimonyTarget != null) setPatrimonyTarget(d.settings.patrimonyTarget);
          if (d.settings.annualRunGoalKm != null) setAnnualRunGoalKm(d.settings.annualRunGoalKm);
          if (d.settings.chartTheme) setChartTheme(d.settings.chartTheme);
          if (d.settings.themeMode) setThemeMode(d.settings.themeMode);
          if (d.settings.dashboardLayout) {
            setDashboardLayout(d.settings.dashboardLayout);
            localStorage.setItem("lifeos_dash_layout_v1", JSON.stringify(d.settings.dashboardLayout));
          }
          if (d.settings.chartConfigs) {
            setChartConfigs(d.settings.chartConfigs);
            localStorage.setItem("lifeos_chart_configs_v1", JSON.stringify(d.settings.chartConfigs));
          }
        }

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
            categoriesCatalog: d.categoriesCatalog || categoriesCatalog,
            categoryColors: d.categoryColors || categoryColors,
            paymentMethods: d.paymentMethods || paymentMethods,
            systemLogs,
            settings: {
              username: d.user?.nickname || currentUser || undefined,
              avatarUrl: d.user?.avatar || currentUserAvatar,
              themeMode: d.settings?.themeMode || themeMode,
              personalBudgetLimit: d.settings?.personalBudgetLimit || personalBudgetLimit,
              monthlyInvestmentGoal: d.settings?.monthlyInvestmentGoal || monthlyInvestmentGoal,
              patrimonyTarget: d.settings?.patrimonyTarget || patrimonyTarget,
              annualRunGoalKm: d.settings?.annualRunGoalKm || annualRunGoalKm,
              chartTheme: d.settings?.chartTheme || chartTheme,
              dashboardLayout: d.settings?.dashboardLayout || dashboardLayout,
              chartConfigs: d.settings?.chartConfigs || chartConfigs,
              readNotificationIds,
              stravaConfig,
              stravaStats
            }
          },
          d.debtorMap || debtorMap
        );

        notify(
          "Backup Restaurado com Sucesso!",
          "Todos os dados locais e na nuvem foram sincronizados.",
          "success",
          "CONFIG"
        );
      } catch {
        notify("Erro ao Restaurar Backup", "Arquivo JSON inválido ou corrompido.", "error", "CONFIG");
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

  const handleSaveUserProfile = (newNickname: string, newAvatar: string) => {
    setCurrentUser(newNickname);
    setCurrentUserAvatar(newAvatar);
    localStorage.setItem("coindex_username", newNickname);
    localStorage.setItem("coindex_avatar", newAvatar);
    updateUserSettingsInDb({ username: newNickname, avatarUrl: newAvatar });
    notify("Perfil Atualizado", "As informações do seu perfil foram salvas com sucesso.", "info");
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

      {/* TOASTS FLUTUANTES (Sprint 15 - Clara Vance) */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl text-xs flex items-start justify-between gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
              t.type === "error"
                ? "bg-slate-900/95 border-rose-500/50 text-rose-100 shadow-rose-950/40"
                : t.type === "warning"
                ? "bg-slate-900/95 border-amber-500/50 text-amber-100 shadow-amber-950/40"
                : t.type === "success"
                ? "bg-slate-900/95 border-emerald-500/50 text-emerald-100 shadow-emerald-950/40"
                : "bg-slate-900/95 border-indigo-500/50 text-slate-100 shadow-indigo-950/40"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {t.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : t.type === "warning" ? (
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
              className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
              title="Fechar"
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
              { id: "cards", label: "Bancos", icon: <CreditCard className="w-4 h-4" /> },
              { id: "spotify", label: "Spotify", icon: <SpotifyLogo size={16} /> },
              { id: "auto", label: "Meus Veículos", icon: <Car className="w-4 h-4" /> },
              { id: "bio", label: "Bio & Strava", icon: <Activity className="w-4 h-4" /> },
              { id: "brain", label: "Segundo Cérebro", icon: <Brain className="w-4 h-4" /> },
              { id: "settings", label: "Configurações", icon: <Settings className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`w-full min-h-[44px] px-3.5 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all duration-200 ${
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
          {sidebarOpen ? (
            <div
              onClick={() => setShowProfileModal(true)}
              className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/[0.06] hover:border-indigo-500/30 flex items-center gap-3 cursor-pointer transition group"
              title="Clique para editar seu perfil"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-950 border border-indigo-500/30 overflow-hidden flex items-center justify-center shrink-0">
                {currentUserAvatar ? (
                  <img src={currentUserAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <div className="overflow-hidden">
                <strong className="text-xs text-white block truncate group-hover:text-indigo-300 transition">
                  {currentUser}
                </strong>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" /> Supabase Ativo
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="w-full flex justify-center p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/[0.06] hover:border-indigo-500/30 transition group"
              title={`Perfil: ${currentUser} (Clique para editar)`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-950 border border-indigo-500/30 overflow-hidden flex items-center justify-center shrink-0">
                {currentUserAvatar ? (
                  <img src={currentUserAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                )}
              </div>
            </button>
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
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-white font-bold outline-none focus:border-indigo-500 transition"
              >
                <option value="2026-10">Outubro / 2026</option>
                <option value="2026-09">Setembro / 2026</option>
                <option value="2026-11">Novembro / 2026</option>
                <option value="2026-12">Dezembro / 2026</option>
                <option value="ALL">Histórico Completo</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <ThemeSegmentedControl themeMode={themeMode} onChange={changeThemeMode} />

              {/* SININHO DE NOTIFICAÇÕES */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBellDropdown((prev) => !prev)}
                  className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 relative transition flex items-center justify-center"
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
                className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border transition flex items-center justify-center ${
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
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition"
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
                  <h2 className="text-base font-semibold text-white tracking-tight">Painel Executivo Coindex</h2>
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
                        : widget.id === "credit_chart" || widget.id === "bank_limits_chart"
                        ? "bar"
                        : "kpi";

                    const cfg = getWidgetSettings(widget.id, "auto", curveType);
                    const primarySeriesColor = (fallbackHex: string) =>
                      cfg.color && cfg.color !== "auto" ? cfg.color : fallbackHex;

                    const personalPct = Math.min(
                      100,
                      Math.round((monthSummary.personalSpent / Math.max(1, effectivePersonalBudgetLimit)) * 100)
                    );
                    const totalExpenses = Math.max(1, categoryChartData.reduce((a, b) => a + b.value, 0));

                    const processedPatrimonyData = applyZeroHandling(
                      patrimonyChartData as unknown as Array<Record<string, unknown>>,
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
                          widget.id === "bank_limits_chart" ||
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
                                  <strong className={`text-white tabular-nums ${moneyBlur}`}>
                                    {formatBRL(Math.max(0, effectivePersonalBudgetLimit - monthSummary.personalSpent))}
                                  </strong>
                                </span>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`font-extrabold text-sm font-mono tabular-nums ${moneyBlur} ${
                                    personalPct >= 100 ? "text-rose-400" : "text-emerald-400"
                                  }`}
                                >
                                  {formatBRL(monthSummary.personalSpent)} / {formatBRL(effectivePersonalBudgetLimit)} ({personalPct}%)
                                </span>
                                {filterMonthsCount > 1 && (
                                  <span className="block text-[10px] text-slate-400 font-mono tabular-nums">
                                    ({formatBRL(personalBudgetLimit)} × {filterMonthsCount} meses)
                                  </span>
                                )}
                              </div>
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
                          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 ${moneyBlur}`}>
                            {/* Card 1: Entradas do Mês */}
                            <div className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-950/90 border border-emerald-500/25 flex flex-col justify-between shadow-lg">
                              <div>
                                <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">
                                  <span>Entradas do Mês</span>
                                  <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-400 leading-tight mt-0.5">
                                  {formatBRL(monthSummary.income)}
                                </p>
                              </div>
                              <div className="pt-1.5 mt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono tabular-nums">
                                <span className="flex items-center gap-1">
                                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                                  {monthSummary.incomeDiff >= 0
                                    ? `+${monthSummary.incomeDiff}%`
                                    : `${monthSummary.incomeDiff}%`}{" "}
                                  vs. mês anterior
                                </span>
                              </div>
                            </div>

                            {/* Card 2: Saídas & Despesas */}
                            <div className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-950/90 border border-rose-500/25 flex flex-col justify-between shadow-lg">
                              <div>
                                <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">
                                  <span>Saídas & Despesas</span>
                                  <div className="p-1 rounded-lg bg-rose-500/15 text-rose-400">
                                    <TrendingDown className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className="text-lg sm:text-xl font-bold font-mono tabular-nums text-rose-400 leading-tight mt-0.5">
                                  {formatBRL(monthSummary.expense)}
                                </p>
                              </div>
                              <div className="pt-1.5 mt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono tabular-nums">
                                <span className="flex items-center gap-1">
                                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                                  {monthSummary.expenseDiff >= 0
                                    ? `+${monthSummary.expenseDiff}%`
                                    : `${monthSummary.expenseDiff}%`}{" "}
                                  vs. mês anterior
                                </span>
                              </div>
                            </div>

                            {/* Card 3: Aportes no Mês */}
                            <div className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-950/90 border border-indigo-500/25 flex flex-col justify-between shadow-lg">
                              <div>
                                <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">
                                  <span>Aportes no Mês</span>
                                  <div className="p-1 rounded-lg bg-indigo-500/15 text-indigo-400">
                                    <PiggyBank className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className="text-lg sm:text-xl font-bold font-mono tabular-nums text-indigo-400 leading-tight mt-0.5">
                                  {formatBRL(monthSummary.invested)}
                                </p>
                              </div>
                              <div className="pt-1.5 mt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono tabular-nums">
                                <span>Meta: {formatBRL(monthlyInvestmentGoal)}</span>
                              </div>
                            </div>

                            {/* Card 4: Saldo Livre Líquido & Safe-to-Spend Compacto (Sprint 16 & 17) */}
                            <div className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-sky-950/40 to-slate-950/90 border border-sky-500/25 flex flex-col justify-between shadow-lg">
                              <div>
                                <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">
                                  <span>Saldo Livre Líquido</span>
                                  <div className="p-1 rounded-lg bg-sky-500/15 text-sky-400">
                                    <Wallet className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p
                                  className={`text-lg sm:text-xl font-bold font-mono tabular-nums leading-tight mt-0.5 ${
                                    monthSummary.balance >= 0 ? "text-sky-400" : "text-rose-400"
                                  }`}
                                >
                                  {formatBRL(monthSummary.balance)}
                                </p>
                              </div>

                              {/* Rodapé Compacto e Perfeitamente Alinhado com Tooltip de Detalhes */}
                              <div
                                className="pt-1.5 mt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] font-mono tabular-nums cursor-help"
                                title={`Safe-to-Spend: Contas (${formatBRL(safeToSpend.currentCash)}) + Entradas Pendentes (${formatBRL(safeToSpend.pendingIncome)}) - Fixos/Faturas Pendentes (${formatBRL(safeAdd(safeToSpend.pendingDirectExpenses, safeToSpend.pendingInvoices))}) | A Receber Aberto: ${formatBRL(receivablesAnalytics.totalOpen)}`}
                              >
                                <span className="text-slate-400 flex items-center gap-1 font-sans">
                                  <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                                  <span>Safe-to-Spend:</span>
                                </span>
                                <span
                                  className={`font-bold px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] border font-mono tabular-nums ${
                                    safeToSpend.projected > 200
                                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                      : safeToSpend.projected >= 0
                                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                      : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                                  }`}
                                >
                                  {formatBRL(safeToSpend.projected)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {widget.id === "patrimony_chart" && (
                          <div className="space-y-2.5">
                            {/* Pílulas Minimalistas de Legenda no Cabeçalho do Gráfico (Sprint 16) */}
                            <div className="flex items-center justify-end gap-2 text-xs">
                              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-white/5 font-medium text-slate-300 text-[11px]">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: primarySeriesColor(chartTheme.patrimonyLine) }}
                                />
                                <span>Patrimônio Acumulado</span>
                              </div>
                              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-white/5 font-medium text-slate-300 text-[11px]">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: chartTheme.aporteLine }}
                                />
                                <span>Aporte Mensal</span>
                              </div>
                            </div>

                            <div className="h-72 select-none">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                  data={processedPatrimonyData}
                                  accessibilityLayer={false}
                                  margin={{ top: 10, right: 12, left: 4, bottom: 0 }}
                                >
                                  <defs>
                                    <linearGradient id="gradPatrimony" x1="0" y1="0" x2="0" y2="1">
                                      <stop
                                        offset="0%"
                                        stopColor={primarySeriesColor(chartTheme.patrimonyLine)}
                                        stopOpacity={0.4}
                                      />
                                      <stop
                                        offset="50%"
                                        stopColor={primarySeriesColor(chartTheme.patrimonyLine)}
                                        stopOpacity={0.15}
                                      />
                                      <stop
                                        offset="100%"
                                        stopColor={primarySeriesColor(chartTheme.patrimonyLine)}
                                        stopOpacity={0.0}
                                      />
                                    </linearGradient>
                                    <linearGradient id="gradAporte" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor={chartTheme.aporteLine} stopOpacity={0.35} />
                                      <stop offset="50%" stopColor={chartTheme.aporteLine} stopOpacity={0.12} />
                                      <stop offset="100%" stopColor={chartTheme.aporteLine} stopOpacity={0.0} />
                                    </linearGradient>
                                  </defs>

                                  {cfg.showGrid && (
                                    <CartesianGrid
                                      vertical={false}
                                      strokeDasharray="3 3"
                                      stroke="rgba(148, 163, 184, 0.08)"
                                    />
                                  )}

                                  <XAxis
                                    dataKey="label"
                                    stroke="#64748b"
                                    fontSize={11}
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={10}
                                  />
                                  <YAxis
                                    stroke="#64748b"
                                    fontSize={11}
                                    width={56}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => {
                                      const num = Number(v) || 0;
                                      if (num === 0) return "R$ 0";
                                      if (Math.abs(num) >= 1000) {
                                        const k = num / 1000;
                                        return `R$ ${k % 1 === 0 ? k : k.toFixed(1).replace(".", ",")}k`;
                                      }
                                      return `R$ ${num}`;
                                    }}
                                  />
                                  <Tooltip content={<CustomCyberTooltip isCurrency={true} />} cursor={false} />
                                  {milestones.map((m) => (
                                    <ReferenceLine key={m.id} y={m.value} stroke={m.color} strokeDasharray="3 3" />
                                  ))}
                                  <Area
                                    type="monotone"
                                    dataKey="acumulado"
                                    name="Patrimônio Acumulado"
                                    stroke={primarySeriesColor(chartTheme.patrimonyLine)}
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#0f172a" }}
                                    fill="url(#gradPatrimony)"
                                    fillOpacity={1}
                                    connectNulls={true}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="aportado"
                                    name="Aporte Mensal"
                                    stroke={chartTheme.aporteLine}
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#0f172a" }}
                                    fill="url(#gradAporte)"
                                    fillOpacity={1}
                                    connectNulls={true}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        {widget.id === "category_chart" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            {/* Donut Moderno com Rótulo Centralizado Total Gasto (Sprint 16) */}
                            <div className="relative h-64 select-none flex items-center justify-center">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart accessibilityLayer={false}>
                                  <Pie
                                    data={categoryChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="68%"
                                    outerRadius="90%"
                                    paddingAngle={4}
                                    cornerRadius={6}
                                    stroke="none"
                                    label={false}
                                    labelLine={false}
                                  >
                                    {categoryChartData.map((entry, idx) => (
                                      <Cell
                                        key={`cell-${idx}`}
                                        fill={entry.color}
                                      />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomCyberTooltip isCurrency={true} />} cursor={false} />
                                </PieChart>
                              </ResponsiveContainer>

                              {/* Rótulo Central do Donut: TOTAL GASTO + Valor em R$ */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center select-none">
                                <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">
                                  Total Gasto
                                </span>
                                <span className={`text-base sm:text-lg font-extrabold text-white font-mono tabular-nums ${moneyBlur}`}>
                                  {formatBRL(totalExpenses)}
                                </span>
                              </div>
                            </div>

                            {/* Lista de Categorias com Bolinha Colorida Correspondente */}
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
                              {categoryChartData.map((cat) => {
                                const pct = Math.round((cat.value / totalExpenses) * 100);
                                return (
                                  <div
                                    key={cat.name}
                                    className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-slate-200 flex items-center gap-2">
                                        <span
                                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                                          style={{ backgroundColor: cat.color }}
                                        />
                                        {renderCategorySemanticIcon(cat.name, cat.color)}
                                        <span className="truncate max-w-[130px]">{cat.name}</span>
                                      </span>
                                      <span className={`font-bold text-white tabular-nums font-mono ${moneyBlur}`}>
                                        {formatBRL(cat.value)}{" "}
                                        <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all duration-300"
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
                              <BarChart data={creditChartData} barSize={28} accessibilityLayer={false}>
                                {cfg.showGrid && (
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                                )}
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => formatBRL(Number(v))} />
                                <Tooltip content={<CustomCyberTooltip isCurrency={true} />} cursor={false} />
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

                        {widget.id === "bank_limits_chart" && (
                          <div className="space-y-4">
                            {/* Resumo Consolidado de Limites Bancários */}
                            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs ${moneyBlur}`}>
                              <div className="p-3 rounded-2xl bg-slate-950/70 border border-indigo-500/20">
                                <span className="text-[10px] text-slate-400 block font-medium">Limite Total Geral</span>
                                <strong className="text-base font-extrabold text-white block mt-0.5">
                                  {formatBRL(bankLimitsAnalytics.globalTotalLimit)}
                                </strong>
                              </div>
                              <div className="p-3 rounded-2xl bg-slate-950/70 border border-rose-500/20">
                                <span className="text-[10px] text-slate-400 block font-medium">Total Usado / Faturas</span>
                                <strong className="text-base font-extrabold text-rose-400 block mt-0.5">
                                  {formatBRL(bankLimitsAnalytics.globalTotalUsado)}
                                </strong>
                              </div>
                              <div className="p-3 rounded-2xl bg-slate-950/70 border border-emerald-500/20">
                                <span className="text-[10px] text-slate-400 block font-medium">Disponível Geral</span>
                                <strong className="text-base font-extrabold text-emerald-400 block mt-0.5">
                                  {formatBRL(bankLimitsAnalytics.globalTotalDisponivel)}
                                </strong>
                              </div>
                            </div>

                            {/* Gráfico Recharts de Exposição por Banco */}
                            <div className="h-60 select-none">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={bankLimitsAnalytics.chartData} barSize={26} accessibilityLayer={false}>
                                  {cfg.showGrid && (
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                                  )}
                                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => formatBRL(Number(v))} />
                                  <Tooltip content={<CustomCyberTooltip isCurrency={true} />} cursor={false} />
                                  {cfg.showLegend && <Legend wrapperStyle={{ fontSize: "11px" }} />}
                                  <Bar
                                    dataKey="usado"
                                    name="Limite Usado (R$)"
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

                            {/* Ranking dos Bancos (Maior para Menor Limite - Requisito 7) */}
                            <div className="space-y-2 pt-1">
                              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                                <span className="font-bold flex items-center gap-1.5 text-indigo-300">
                                  <Landmark className="w-3.5 h-3.5" /> Ranking Bancário por Limite
                                </span>
                                <span>{bankLimitsAnalytics.banks.length} instituição(ões)</span>
                              </div>
                              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {bankLimitsAnalytics.banks.map((b, idx) => (
                                  <div
                                    key={b.id}
                                    className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-3 text-xs hover:border-white/10 transition"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                                          idx === 0
                                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                            : idx === 1
                                            ? "bg-slate-400/20 text-slate-200 border border-slate-400/40"
                                            : idx === 2
                                            ? "bg-amber-700/20 text-amber-400 border border-amber-700/40"
                                            : "bg-slate-800 text-slate-400"
                                        }`}
                                      >
                                        #{idx + 1}
                                      </span>
                                      {b.logoUrl ? (
                                        <img
                                          src={b.logoUrl}
                                          alt={b.name}
                                          className="w-6 h-6 rounded-lg object-cover border border-white/10"
                                        />
                                      ) : (
                                        <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-[11px]">
                                          {b.name.charAt(0)}
                                        </div>
                                      )}
                                      <div className="truncate">
                                        <strong className="text-white font-bold block truncate">{b.name}</strong>
                                        <span className="text-[10px] text-slate-400 block truncate">{b.limitType}</span>
                                      </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                      <span className={`font-mono font-bold text-white block ${moneyBlur}`}>
                                        {formatBRL(b.totalLimit)}
                                      </span>
                                      <div className="flex items-center justify-end gap-1.5 text-[10px] font-mono tabular-nums">
                                        <span className={`text-rose-400 ${moneyBlur}`}>U: {formatBRL(b.usado)}</span>
                                        <span className="text-slate-400">•</span>
                                        <span className={`text-emerald-400 ${moneyBlur}`}>D: {formatBRL(b.disponivel)}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
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
              selectedMonth={selectedMonth}
              handleLaunchFixedTransactions={handleLaunchFixedTransactions}
              filteredTransactions={filteredTransactions}
              transactions={transactions}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleExportCSV={handleExportCSV}
              handleOpenNewTxModal={handleOpenNewTxModal}
              getFlowType={getFlowType}
              banks={banks}
              editingBankId={editingBankId}
              setEditingBankId={setEditingBankId}
              newBank={newBank}
              setNewBank={setNewBank}
              handleSaveBank={handleSaveBank}
              handleDeleteBank={handleDeleteBank}
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
              handleToggleNoteCompleted={handleToggleNoteCompleted}
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
              handleUpdatePaymentMethod={handleUpdatePaymentMethod}
              categoriesCatalog={categoriesCatalog}
              newCategoryForm={newCategoryForm}
              setNewCategoryForm={setNewCategoryForm}
              handleAddCustomCategory={handleAddCustomCategory}
              handleDeleteCategory={handleDeleteCategory}
              handleUpdateCategory={handleUpdateCategory}
              autoInmetroConfig={autoInmetroConfig}
              setAutoInmetroConfig={(cfg) => {
                setAutoInmetroConfig(cfg);
                try {
                  localStorage.setItem("lifeos_auto_inmetro_v1", JSON.stringify(cfg));
                } catch {}
              }}
              autoLayout={autoDashboardLayout}
              setAutoLayout={setAutoDashboardLayout}
              getAutoWidgetSettings={getAutoWidgetSettings}
              handleUpdateAutoWidgetSettings={handleUpdateAutoWidgetSettings}
              handleUpdateAutoWidgetSize={handleUpdateAutoWidgetSize}
              handleDragStartAutoWidget={handleDragStartAutoWidget}
              handleDragEnterAutoWidget={handleDragEnterAutoWidget}
              handleDragEndAutoWidget={handleDragEndAutoWidget}
              draggingAutoWidgetId={draggingAutoWidgetId}
              dragOverAutoWidgetId={dragOverAutoWidgetId}
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
                  label: "Posto Express (Abastecer)",
                  action: () => {
                    setShowCommandModal(false);
                    handleOpenNewTxModal("Gasolina/Combustível");
                  },
                  icon: <Fuel className="w-3.5 h-3.5 text-amber-400" />
                },
                {
                  label: "Lançar Fixos do Mês (Trava Anti-Duplicidade)",
                  action: () => {
                    setShowCommandModal(false);
                    handleLaunchFixedTransactions();
                  },
                  icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />
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
                  label: "Ir para Valores A Receber",
                  action: () => {
                    setShowCommandModal(false);
                    setActiveTab("receivables");
                  },
                  icon: <HandCoins className="w-3.5 h-3.5 text-slate-300" />
                },
                {
                  label: "Ir para Meus Veículos",
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
      <TransactionModal
        isOpen={showTxModal}
        onClose={() => setShowTxModal(false)}
        onSubmit={handleSaveTransaction}
        isSavingTx={isSavingTx}
        editingTxId={editingTxId}
        isEditingSeries={isEditingSeries}
        editingSeriesData={editingSeriesData}
        applyToAllSeries={applyToAllSeries}
        setApplyToAllSeries={setApplyToAllSeries}
        isPostoExpress={isPostoExpress}
        setIsPostoExpress={setIsPostoExpress}
        expressFuelType={expressFuelType}
        setExpressFuelType={setExpressFuelType}
        formState={newTx}
        setFormState={setNewTx}
        cards={cards}
        banks={banks}
        categoriesCatalog={categoriesCatalog}
        paymentMethods={paymentMethods}
        autoMetrics={autoMetrics}
        transactions={transactions}
      />

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

      {/* MODAL DE EXCLUSÃO INTELIGENTE DE SÉRIE PARCELADA */}
      {deleteSeriesModal.isOpen && deleteSeriesModal.targetTx && deleteSeriesModal.seriesData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-rose-500/30 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Excluir Compra Parcelada</h3>
                  <p className="text-[11px] text-slate-400">Esta transação pertence a uma série parcelada</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteSeriesModal({ isOpen: false, targetTx: null, seriesData: null })}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Detalhes da Série */}
            <div className="rounded-2xl p-4 bg-slate-950/70 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm">
                  {deleteSeriesModal.seriesData.baseDescription}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono font-bold text-[10px] tabular-nums">
                  {deleteSeriesModal.seriesData.series.length} parcelas
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/5">
                <div>
                  <span className="text-slate-400 block">Parcela selecionada:</span>
                  <strong className="text-white font-mono tabular-nums">
                    {deleteSeriesModal.targetTx.installmentInfo || `Parcela ${deleteSeriesModal.seriesData.currentInstallment || 1}`}
                  </strong>
                  <span className="text-slate-400 block font-mono text-[10px] tabular-nums">
                    {formatBRL(deleteSeriesModal.targetTx.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total da série:</span>
                  <strong className="text-indigo-300 font-mono tabular-nums">
                    {formatBRL(deleteSeriesModal.seriesData.series.reduce((acc, s) => acc + s.amount, 0))}
                  </strong>
                  <span className="text-slate-400 block text-[10px]">
                    {deleteSeriesModal.targetTx.cardUsed || deleteSeriesModal.targetTx.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Destaque de Liberação de Limite */}
              {(() => {
                const pendingTxs = deleteSeriesModal.seriesData.series.filter(
                  (s) => s.status === "Pendente / Na Fatura"
                );
                const pendingTotal = pendingTxs.reduce((acc, s) => acc + s.amount, 0);
                if (pendingTotal <= 0) return null;
                return (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Limite a liberar no cartão:
                    </span>
                    <strong className="font-mono font-bold tabular-nums text-emerald-200">
                      {formatBRL(pendingTotal)}
                    </strong>
                  </div>
                );
              })()}
            </div>

            <p className="text-slate-300 text-[11px]">
              Como você deseja proceder com a exclusão desta transação?
            </p>

            {/* Ações */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isDeletingSeries}
                onClick={() => handleConfirmDeleteInstallment(true)}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
              >
                {isDeletingSeries ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Excluir todas as parcelas desta série</span>
              </button>

              <button
                type="button"
                disabled={isDeletingSeries}
                onClick={() => handleConfirmDeleteInstallment(false)}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-950 border border-rose-500/40 hover:bg-rose-500/10 text-rose-300 font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <span>Excluir apenas esta parcela</span>
              </button>

              <button
                type="button"
                disabled={isDeletingSeries}
                onClick={() => setDeleteSeriesModal({ isOpen: false, targetTx: null, seriesData: null })}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold flex items-center justify-center transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Perfil do Usuário com Backup Integrado (Sprint 15) */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUser}
        currentUserAvatar={currentUserAvatar}
        onSaveProfile={handleSaveUserProfile}
        onExportBackup={handleExportFullBackupJSON}
        onImportBackup={handleImportFullBackupJSON}
      />

      {/* MODAL DE CONFIRMAÇÃO CUSTOMIZADO (Sprint 15 - Clara Vance) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-950/95 border border-rose-500/30 p-6 shadow-2xl shadow-rose-950/40 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {confirmModal.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                {confirmModal.cancelLabel || "Cancelar"}
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-lg cursor-pointer ${
                  confirmModal.danger
                    ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmModal.confirmLabel || "Confirmar"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}