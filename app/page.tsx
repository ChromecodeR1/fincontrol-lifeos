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
  Sun,
  Moon,
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
  Trash2,
  Info
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  LineChart,
  Line,
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
  PATRIMONIO_IMPORT_TRANSACTIONS,
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
  todayBR,
  todayISO,
  toSortableISO,
  compareDatesBR,
  getYearMonthKey,
  distributeInstallments,
  generateInstallmentSeriesId,
  calculateInvoiceAndCashMonths,
  isNeutralFlow,
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
  calculateStaticStatusSummary,
  migrateLegacyCategory,
  resolveTransactionFlowType,
  getUserItem,
  setUserItem,
  removeUserItem,
  recordTombstone,
  recordTombstones,
  getTombstones,
  isTombstoned,
  clearUserSessionStorage,
  normalizeSearchText,
  evaluateMathExpression
} from "./lifeos-data";
import {
  validateTransactionData,
  validateCreditCardData,
  validateBankData,
  validateStaticStatusData,
  validateAndQuarantineBackup
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

interface PatrimonyTooltipPayloadItem {
  payload?: {
    month: string;
    label: string;
    aportado: number;
    acumulado: number;
    resgatado?: number;
  };
}

interface PatrimonyCyberTooltipProps {
  active?: boolean;
  payload?: PatrimonyTooltipPayloadItem[];
  label?: string;
  moneyBlur?: string;
}

function PatrimonyCyberTooltip({ active, payload, label, moneyBlur = "" }: PatrimonyCyberTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] shadow-[var(--cupertino-shadow)] backdrop-blur-md rounded-xl px-3.5 py-2.5 text-xs space-y-1.5 min-w-[210px]">
      <p className="font-semibold text-slate-100 border-b border-white/10 pb-1 mb-1">
        {label || data.label}
      </p>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#0A84FF] shrink-0" />
          Patrimônio Acumulado:
        </span>
        <strong className={`text-white font-mono tabular-nums ${moneyBlur}`}>
          {formatBRL(data.acumulado)}
        </strong>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#5E5CE6] shrink-0" />
          Aportes Brutos no Mês:
        </span>
        <strong className={`text-[#5E5CE6] font-mono tabular-nums ${moneyBlur}`}>
          {formatBRL(data.aportado)}
        </strong>
      </div>
      {Boolean(data.resgatado && data.resgatado > 0) && (
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#FF453A] shrink-0" />
            Resgates no Mês:
          </span>
          <strong className={`text-[#FF453A] font-mono tabular-nums ${moneyBlur}`}>
            {formatBRL(data.resgatado || 0)}
          </strong>
        </div>
      )}
    </div>
  );
}

export default function CoindexApp() {
  const [isHydrated, setIsHydrated] = useState(false);

  // Autenticação e Estado no Supabase
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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

  // SPRINT 27: Design System Apple Cupertino (Dual Theme Claro / Escuro)
  const [cupertinoTheme, setCupertinoTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("coindex_cupertino_theme") as "light" | "dark" | null;
      const initial = saved === "light" ? "light" : "dark";
      setCupertinoTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
      if (initial === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  }, []);

  const toggleCupertinoTheme = useCallback((theme: "light" | "dark") => {
    setCupertinoTheme(theme);
    try {
      localStorage.setItem("coindex_cupertino_theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  }, []);

  const [privacyMode, setPrivacyMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("coindex_privacy_mode") === "true";
      } catch {}
    }
    return false;
  });

  const togglePrivacyMode = useCallback(() => {
    setPrivacyMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("coindex_privacy_mode", String(next));
      } catch {}
      return next;
    });
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("2026-10");
  const [accountingRegime, setAccountingRegime] = useState<"competencia" | "caixa">("competencia");
  const [patrimonyTimeRange, setPatrimonyTimeRange] = useState<"6M" | "1A" | "ALL">("ALL");
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
  const [showPatrimonyAportesCurve, setShowPatrimonyAportesCurve] = useState<boolean>(false);

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
        if (currentUser) {
          setUserItem("lifeos_chart_configs_v1", JSON.stringify(updated), currentUser);
        }
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
        if (currentUser) {
          setUserItem("lifeos_dash_layout_v1", JSON.stringify(updated), currentUser);
        }
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
  const [initialPatrimony, setInitialPatrimony] = useState<number>(0);
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
    fuelType?: "Gasolina" | "Etanol";
    fullTank?: boolean;
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
    linkedReceivableId: "",
    fuelType: "Gasolina",
    fullTank: true
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

  // Sistema de Notificações Flutuantes (Toasts com Undo Action + Gravação de Log no Supabase)
  const notify = useCallback(
    (
      title: string,
      subtitle?: string,
      type: "success" | "warning" | "info" | "error" = "info",
      logCategory?: SystemLogEntry["category"],
      onUndo?: () => void,
      undoLabel?: string
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const duration = onUndo ? 5000 : 3500;
      setToasts((prev) => [...prev.slice(-3), { id, title, subtitle, type, onUndo, undoLabel }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);

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

  // Atalho de Teclado Global: Ctrl + K / Cmd + K com e.preventDefault() estrito
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        e.stopPropagation();
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

        const sTxs = getUserItem("lifeos_txs_v8");
        if (sTxs) {
          const parsedTxs: Transaction[] = JSON.parse(sTxs);
          // Migração de categorias legadas (Sprint 19)
          const migratedTxs = parsedTxs.map((t) => ({
            ...t,
            category: migrateLegacyCategory(t.category, t.description)
          }));
          setTransactions(migratedTxs);
          setUserItem("lifeos_txs_v8", JSON.stringify(migratedTxs));
        }
        const sDebtors = localStorage.getItem("lifeos_debtors_v8");
        if (sDebtors) setDebtorMap(JSON.parse(sDebtors));
        const sBanks = localStorage.getItem("lifeos_banks_v1");
        if (sBanks) {
          const parsedBanks: BankItem[] = JSON.parse(sBanks);
          if (!parsedBanks.some((b) => b.name === "BTG Pactual")) {
            const btg = INITIAL_BANKS.find((b) => b.name === "BTG Pactual");
            if (btg) {
              const mergedBanks = [...parsedBanks, btg];
              setBanks(mergedBanks);
              localStorage.setItem("lifeos_banks_v1", JSON.stringify(mergedBanks));
            } else {
              setBanks(parsedBanks);
            }
          } else {
            setBanks(parsedBanks);
          }
        }
        const sCards = localStorage.getItem("lifeos_cards_v8");
        if (sCards) setCards(JSON.parse(sCards));
        const sStatus = localStorage.getItem("lifeos_status_v8");
        if (sStatus) setStaticStatus(JSON.parse(sStatus));
        const sWish = localStorage.getItem("lifeos_wish_v8");
        if (sWish) {
          const parsedWish: WishlistItem[] = JSON.parse(sWish);
          const caixinha = parsedWish.find((w) => w.title.toLowerCase().includes("caixinha"));
          if (caixinha && caixinha.savedAmount !== 2616.61) {
            caixinha.savedAmount = 2616.61;
            caixinha.title = "Caixinha Turbo (115% CDI)";
            caixinha.institution = "Nubank";
            setWishlist([...parsedWish]);
            localStorage.setItem("lifeos_wish_v8", JSON.stringify(parsedWish));
          } else {
            setWishlist(parsedWish);
          }
        }
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
          if (authData.user.id) setCurrentUserId(authData.user.id);
          setCurrentUser(authData.user.username);
          setCurrentUserAvatar(authData.user.avatarUrl || getUserItem("coindex_avatar", authData.user.id) || "");
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
        const tombstones = getTombstones(currentUserId);
        const res = await fetchAllCoindexData(tombstones);
        if (res.userId) setCurrentUserId(res.userId);
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
          // Migração de categorias legadas (Sprint 19)
          const migratedTxs = d.transactions.map((t) => ({
            ...t,
            category: migrateLegacyCategory(t.category, t.description)
          }));
          const finalTxs = migratedTxs;

          setTransactions(finalTxs);
          setUserItem("lifeos_txs_v8", JSON.stringify(finalTxs), res.userId || currentUserId);

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
          if (d.settings.initialPatrimony != null) setInitialPatrimony(d.settings.initialPatrimony);
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

  // SPRINT 18: Carga e Sincronização Oficial dos 56 Lançamentos de Aportes/Resgates com o Supabase
  const handleSyncOfficialPatrimonioData = useCallback(async () => {
    setIsSyncing(true);
    try {
      // 1. Identifica lançamentos faltantes e une à lista global
      const existingIds = new Set(transactions.map((t) => t.id));
      const missing = PATRIMONIO_IMPORT_TRANSACTIONS.filter((t) => !existingIds.has(t.id));
      const nextTxs = missing.length > 0 ? [...transactions, ...missing] : [...transactions];

      setTransactions(nextTxs);
      localStorage.setItem("lifeos_txs_v8", JSON.stringify(nextTxs));

      // 2. Garante o banco BTG Pactual cadastrado
      if (!banks.some((b) => b.name === "BTG Pactual")) {
        const btg = INITIAL_BANKS.find((b) => b.name === "BTG Pactual");
        if (btg) {
          const nextBanks = [...banks, btg];
          setBanks(nextBanks);
          localStorage.setItem("lifeos_banks_v1", JSON.stringify(nextBanks));
        }
      }

      // 3. Ajusta o saldo da Caixinha Turbo para R$ 2.616,61
      const updatedWishlist = wishlist.map((w) => {
        if (w.title.toLowerCase().includes("caixinha")) {
          return { ...w, title: "Caixinha Turbo (115% CDI)", savedAmount: 2616.61, institution: "Nubank" };
        }
        return w;
      });
      if (!updatedWishlist.some((w) => w.title.toLowerCase().includes("caixinha"))) {
        const caixinha = INITIAL_WISHLIST.find((w) => w.title.toLowerCase().includes("caixinha"));
        if (caixinha) updatedWishlist.push(caixinha);
      }
      setWishlist(updatedWishlist);
      localStorage.setItem("lifeos_wish_v8", JSON.stringify(updatedWishlist));

      // 4. Salva no banco de dados Supabase PostgreSQL
      await upsertTransactionsInDb(PATRIMONIO_IMPORT_TRANSACTIONS, debtorMap);
      setUserItem("patrimonio_seeded_" + (currentUserId || "default"), "true", currentUserId);
      notify(
        "Patrimônio Histórico Sincronizado!",
        "Os 56 lançamentos oficiais de Aporte e Resgate foram salvos no Supabase com sucesso.",
        "success",
        "CONFIG"
      );
    } catch (err: unknown) {
      console.error("Erro ao sincronizar aportes oficiais:", err);
      notify("Erro na Sincronização", "Não foi possível sincronizar o histórico oficial.", "error", "CONFIG");
    } finally {
      setIsSyncing(false);
    }
  }, [transactions, banks, wishlist, debtorMap, notify]);

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
    clearUserSessionStorage(currentUserId);
    localStorage.removeItem("lifeos_active_session");
    sessionStorage.removeItem("lifeos_active_session");
    setTransactions(INITIAL_TRANSACTIONS);
    setCards(INITIAL_CARDS);
    setBanks(INITIAL_BANKS);
    setStaticStatus(INITIAL_STATIC_STATUS);
    setWishlist(INITIAL_WISHLIST);
    setBioLogs(INITIAL_BIO_LOGS);
    setNotes(INITIAL_NOTES);
    setOkrs(INITIAL_OKRS);
    setAlertRules(INITIAL_ALERT_RULES);
    setDebtorMap(INITIAL_DEBTOR_MAP);
    setCurrentUserId(null);
    setCurrentUser(null);
    setCurrentUserAvatar("");
    setCloudLoadedForUser(null);
    setSheetsSyncStatus({
      state: "idle",
      message: "Sessão encerrada com sucesso.",
      timestamp: new Date().toLocaleTimeString("pt-BR")
    });
  };

  const getFlowType = useCallback(
    (category: string): FlowType => {
      const found = categoriesCatalog.find((c) => c.name.toLowerCase() === category.toLowerCase());
      if (found) return found.flow;
      const lower = category.toLowerCase();
      if (
        lower.includes("transferência") ||
        lower.includes("pagamento de fatura") ||
        lower.includes("pagamento fatura") ||
        lower.includes("recebimento de empréstimo")
      ) {
        return "NEUTRAL";
      }
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
      .filter((t) => (selectedMonth === "ALL" ? true : getYearMonthKey(t.date) === selectedMonth))
      .filter((t) => {
        if (quickFilter === "FIXO") return t.costType === "Fixo";
        if (quickFilter === "VARIAVEL") return t.costType === "Variável";
        if (quickFilter === "CARTAO") return t.paymentMethod === "Cartão de Crédito";
        if (quickFilter === "PIX") return t.paymentMethod === "PIX";
        return true;
      })
      .filter((t) => {
        if (!searchQuery.trim()) return true;
        const q = normalizeSearchText(searchQuery);
        return (
          normalizeSearchText(t.description).includes(q) ||
          normalizeSearchText(t.category).includes(q) ||
          normalizeSearchText(t.paymentMethod).includes(q) ||
          (t.debtor && normalizeSearchText(t.debtor).includes(q))
        );
      })
      .sort((a, b) => compareDatesBR(b.date, a.date));
  }, [transactions, selectedMonth, quickFilter, searchQuery]);

  const getTxMonthForRegime = useCallback((t: Transaction, regime: "competencia" | "caixa") => {
    if (regime === "caixa") {
      if (t.paymentMethod === "Cartão de Crédito") {
        return t.cashMonth || t.invoiceMonth || getYearMonthKey(t.date);
      }
      return t.cashMonth || getYearMonthKey(t.date);
    }
    return getYearMonthKey(t.date);
  }, []);

  const regimeTransactions = useMemo(() => {
    if (accountingRegime === "competencia" || selectedMonth === "ALL") {
      return filteredTransactions;
    }
    return transactions.filter((t) => {
      const txMonth = getTxMonthForRegime(t, "caixa");
      if (txMonth !== selectedMonth) return false;
      if (quickFilter === "FIXO" && t.costType !== "Fixo") return false;
      if (quickFilter === "VARIAVEL" && t.costType !== "Variável") return false;
      if (quickFilter === "CARTAO" && t.paymentMethod !== "Cartão de Crédito") return false;
      if (quickFilter === "PIX" && t.paymentMethod !== "PIX") return false;
      if (searchQuery.trim()) {
        const q = normalizeSearchText(searchQuery);
        return (
          normalizeSearchText(t.description).includes(q) ||
          normalizeSearchText(t.category).includes(q) ||
          normalizeSearchText(t.paymentMethod).includes(q) ||
          (t.debtor && normalizeSearchText(t.debtor).includes(q))
        );
      }
      return true;
    });
  }, [transactions, filteredTransactions, selectedMonth, accountingRegime, quickFilter, searchQuery, getTxMonthForRegime]);

  const monthSummary = useMemo(() => {
    const calcFor = (list: Transaction[]) => {
      const nonTransferList = list.filter(
        (t) => !isNeutralFlow(t) && !t.isSplitChild && getFlowType(t.category) !== "NEUTRAL"
      );
      const income = safeAdd(...nonTransferList.filter((t) => (t.flowType || getFlowType(t.category)) === "INCOME").map((t) => t.amount));
      const expense = safeAdd(
        ...nonTransferList
          .filter((t) => (t.flowType || getFlowType(t.category)) === "EXPENSE")
          .map((t) => (t.isSplit && t.personalAmount != null ? t.personalAmount : t.amount))
      );

      const investmentTxs = nonTransferList.filter((t) => (t.flowType || getFlowType(t.category)) === "INVESTMENT");
      const aportesMes = safeAdd(...investmentTxs.filter((t) => !isResgateCategory(t.category)).map((t) => t.amount));
      const resgatesMes = safeAdd(...investmentTxs.filter((t) => isResgateCategory(t.category)).map((t) => t.amount));

      const netInvested = safeSub(aportesMes, resgatesMes);

      // SPRINT 19 (Correção 2): No "Histórico Completo", o Balanço Operacional Real é (Entradas Totais - Saídas Operacionais)
      // No mês selecionado, considera o fluxo de caixa líquido abatendo os investimentos líquidos do mês
      const balance =
        selectedMonth === "ALL"
          ? safeSub(income, expense)
          : safeSub(income, safeAdd(expense, netInvested));

      const personalSpent = safeAdd(
        ...nonTransferList
          .filter((t) => t.category === "Gastos Pessoais" || t.category === "Gastos Pessoais / Besteiras")
          .map((t) => (t.isSplit && t.personalAmount != null ? t.personalAmount : t.amount))
      );

      return {
        income,
        expense,
        invested: aportesMes,
        aportes: aportesMes,
        resgates: resgatesMes,
        netInvested,
        balance,
        personalSpent
      };
    };

    const current = calcFor(regimeTransactions);
    const prevPrefix = getPreviousMonthPrefix(selectedMonth);
    const prevList = prevPrefix ? transactions.filter((t) => getTxMonthForRegime(t, accountingRegime) === prevPrefix) : [];
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
  }, [regimeTransactions, transactions, selectedMonth, accountingRegime, getFlowType, getTxMonthForRegime]);

  const allTimeReserva = useMemo(() => {
    const investTxs = transactions.filter(
      (t) => !t.isSplitChild && getFlowType(t.category) === "INVESTMENT"
    );
    const totAportes = safeAdd(
      ...investTxs.filter((t) => !isResgateCategory(t.category)).map((t) => t.amount)
    );
    const totResgates = safeAdd(
      ...investTxs.filter((t) => isResgateCategory(t.category)).map((t) => t.amount)
    );
    return {
      aportes: totAportes,
      resgates: totResgates,
      liquido: safeSub(totAportes, totResgates)
    };
  }, [transactions, getFlowType]);

  const patrimonyEvolution = useMemo(() => {
    return calculatePatrimonyEvolution(transactions, HISTORICAL_INVESTMENTS, initialPatrimony);
  }, [transactions, initialPatrimony]);
  const patrimonyChartData = patrimonyEvolution.data;

  const filteredPatrimonyChartData = useMemo(() => {
    const allData = patrimonyEvolution.data;
    if (!allData || allData.length === 0) return [];
    if (patrimonyTimeRange === "6M") return allData.slice(-6);
    if (patrimonyTimeRange === "1A") return allData.slice(-12);
    return allData;
  }, [patrimonyEvolution.data, patrimonyTimeRange]);

  const patrimonyStats = useMemo(() => {
    const data = filteredPatrimonyChartData || [];
    if (data.length === 0) {
      return {
        currentValue: patrimonyEvolution.saldoFinal || 0,
        startValue: 0,
        diffAmount: 0,
        diffPercent: 0,
        isPositive: true
      };
    }
    const first = data[0] as unknown as { acumulado: number };
    const last = data[data.length - 1] as unknown as { acumulado: number };
    const currentValue = last?.acumulado ?? patrimonyEvolution.saldoFinal ?? 0;
    const startValue = first?.acumulado ?? 0;
    const diffAmount = safeSub(currentValue, startValue);
    const diffPercent = startValue > 0 ? (diffAmount / startValue) * 100 : (currentValue > 0 ? 100 : 0);
    const isPositive = diffAmount >= 0;
    return {
      currentValue,
      startValue,
      diffAmount,
      diffPercent,
      isPositive
    };
  }, [filteredPatrimonyChartData, patrimonyEvolution.saldoFinal]);

  // UPDATE 2: Meses distintos no período e limite acumulado proporcional
  const filterMonthsCount = useMemo(() => {
    if (selectedMonth !== "ALL") return 1;
    const monthsSet = new Set(
      filteredTransactions.map((t) => getYearMonthKey(t.date)).filter((m) => /^\d{4}-\d{2}$/.test(m))
    );
    return Math.max(1, monthsSet.size);
  }, [selectedMonth, filteredTransactions]);

  const effectivePersonalBudgetLimit = personalBudgetLimit * filterMonthsCount;

  // SPRINT 27: Top 7 categorias estritamente de despesas reais com paleta Apple Cupertino
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
    // SPRINT 27: Paleta Apple Cupertino para Donut de Categorias
    const APPLE_DONUT_COLORS = [
      '#0A84FF', // Apple Blue
      '#30D158', // Apple Green
      '#FF9F0A', // Apple Orange
      '#BF5AF2', // Apple Purple
      '#FF453A', // Apple Red
      '#64D2FF', // Apple Cyan
      '#5E5CE6', // Apple Indigo
      '#8E8E93'  // Apple Gray (Outros)
    ];
    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], idx) => ({
        name,
        value,
        color: categoryColors[name] || APPLE_DONUT_COLORS[idx % (APPLE_DONUT_COLORS.length - 1)]
      }));

    if (sorted.length <= 7) return sorted;
    const top7 = sorted.slice(0, 7);
    const othersValue = sorted.slice(7).reduce((acc, curr) => safeAdd(acc, curr.value), 0);
    if (othersValue > 0) {
      top7.push({
        name: "Outros",
        value: othersValue,
        color: "#8E8E93"
      });
    }
    return top7;
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

    // 2. Receitas Pendentes do Mês (excluindo fluxos neutros e transferências)
    const pendingIncome = safeAdd(
      ...filteredTransactions
        .filter(
          (t) =>
            !isNeutralFlow(t) &&
            !t.isSplitChild &&
            getFlowType(t.category) !== "NEUTRAL" &&
            (t.flowType || getFlowType(t.category)) === "INCOME" &&
            t.status !== "Pago"
        )
        .map((t) => t.amount)
    );

    // 3. Despesas / Contas Fixas Pendentes do Mês (exceto compras de cartão que entram na fatura para evitar dupla contagem)
    const pendingDirectExpenses = safeAdd(
      ...filteredTransactions
        .filter(
          (t) =>
            !isNeutralFlow(t) &&
            !t.isSplitChild &&
            getFlowType(t.category) !== "NEUTRAL" &&
            (t.flowType || getFlowType(t.category)) === "EXPENSE" &&
            t.status !== "Pago" &&
            t.paymentMethod !== "Cartão de Crédito"
        )
        .map((t) => (t.isSplit && t.personalAmount != null ? t.personalAmount : t.amount))
    );

    // 4. Faturas Abertas de Cartão considerando mês de caixa (cashMonth)
    const pendingInvoices = safeAdd(
      ...cards.map((c) => {
        if (selectedMonth !== "ALL") {
          const cardCashTxs = transactions.filter(
            (t) =>
              !t.isSplitChild &&
              t.paymentMethod === "Cartão de Crédito" &&
              t.cardUsed === c.name &&
              t.status === "Pendente / Na Fatura" &&
              (t.cashMonth
                ? t.cashMonth === selectedMonth
                : t.invoiceMonth
                ? t.invoiceMonth === selectedMonth
                : getYearMonthKey(t.date) === selectedMonth)
          );
          return safeAdd(...cardCashTxs.map((t) => t.amount));
        }
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

    const isFuelCat = (c: string) => {
      const lower = c.toLowerCase();
      return lower.includes("combustível") || lower.includes("combustivel") || lower.includes("gasolina") || lower.includes("etanol");
    };

    let fuelTotal = 0;
    let maintenanceTotal = 0;
    let ipvaTotal = 0;
    let licenciamentoTotal = 0;
    let seguroTotal = 0;
    let estacionamentoTotal = 0;

    for (const t of autoTxs) {
      const lower = t.category.toLowerCase();
      if (isFuelCat(t.category) || (t.liters && t.liters > 0)) {
        fuelTotal += t.amount;
      } else if (lower.includes("ipva")) {
        ipvaTotal += t.amount;
      } else if (lower.includes("licenciamento")) {
        licenciamentoTotal += t.amount;
      } else if (lower.includes("seguro")) {
        seguroTotal += t.amount;
      } else if (lower.includes("estacionamento") || lower.includes("pedágio") || lower.includes("pedagio")) {
        estacionamentoTotal += t.amount;
      } else {
        maintenanceTotal += t.amount;
      }
    }

    const totalAutoSpent = fuelTotal + maintenanceTotal;
    const totalTCO = fuelTotal + maintenanceTotal + ipvaTotal + licenciamentoTotal + seguroTotal + estacionamentoTotal;
    const costPerKm = distanceDriven > 0 ? totalAutoSpent / distanceDriven : 0;
    const tcoPerKm = distanceDriven > 0 ? totalTCO / distanceDriven : 0;

    return {
      autoTxs: autoTxs.slice().reverse(),
      kmRecords: autoTxs.filter((t) => t.km).map((t) => ({ date: t.date, km: t.km })),
      maxKm,
      distanceDriven,
      avgKmPerLiter,
      fuelTotal,
      maintenanceTotal,
      ipvaTotal,
      licenciamentoTotal,
      seguroTotal,
      estacionamentoTotal,
      totalAutoSpent,
      totalTCO,
      costPerKm,
      tcoPerKm
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
      let str = String(val);
      // Blindagem contra CSV Injection / Injeção de Fórmulas no Excel (=, +, -, @)
      if (/^[=+\-@]/.test(str)) {
        str = `'${str}`;
      }
      str = str.replace(/"/g, '""').replace(/;/g, ",");
      return `"${str}"`;
    };

    const rows = filteredTransactions.map((t) => {
      const flow = t.flowType || getFlowType(t.category);
      const flowLabel =
        flow === "INCOME"
          ? "Entrada"
          : flow === "INVESTMENT"
          ? "Investimento"
          : flow === "NEUTRAL"
          ? "Neutro / Compensação"
          : "Saída";
      const formattedAmount = t.amount.toFixed(2).replace(".", ",");
      return [
        escapeCell(formatDateBR(t.date)),
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
      date: todayBR(),
      description: isFuel ? "Abastecimento Gasolina Comum" : "",
      amount: "",
      category: isFuel ? "Gasolina" : cat,
      costType: "Variável",
      paymentMethod: defaultMethod,
      cardUsed: cards[0]?.name || "Nubank Ultravioleta",
      bankAccount: banks[0]?.name || "Nubank",
      status: getAutomaticStatus(defaultMethod, isFuel ? "Gasolina" : cat),
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
      linkedReceivableId: tx.linkedReceivableId || "",
      fuelType: tx.fuelType || (isEtanol ? "Etanol" : "Gasolina"),
      fullTank: tx.fullTank ?? true
    });
    setShowTxModal(true);
  };

  // CRUD de Lançamentos Conectado ao Supabase
  const handleSaveTransaction = async (e: React.FormEvent, createAnother: boolean = false) => {
    e.preventDefault();
    const evaluatedAmountStr = evaluateMathExpression(newTx.amount);
    const totalAmount = parseFloat(evaluatedAmountStr) || 0;
    const isCredit = newTx.paymentMethod === "Cartão de Crédito";
    const matchedCard = isCredit ? cards.find((c) => c.name === newTx.cardUsed) : undefined;
    const resolvedBank = isCredit
      ? (matchedCard?.bankName ||
          (matchedCard?.bankId ? banks.find((b) => b.id === matchedCard.bankId)?.name : undefined) ||
          newTx.bankAccount ||
          undefined)
      : (newTx.bankAccount || undefined);
    const savedCardUsed = isCredit ? (newTx.cardUsed || undefined) : undefined;

    const matchedBank = banks.find((b) => b.name === resolvedBank || (resolvedBank && b.id === resolvedBank));
    const resolvedBankId = matchedBank?.id || (isCredit ? matchedCard?.bankId : undefined);
    const resolvedCardId = isCredit ? matchedCard?.id : undefined;

    const isTransferTx = Boolean(newTx.isTransfer || newTx.category === "Transferência entre Contas");
    const isSplitTx = Boolean(!isTransferTx && newTx.isSplit && newTx.category !== "A Receber");
    const parsedThirdAmount = isSplitTx && newTx.thirdPartyAmount ? parseFloat(newTx.thirdPartyAmount) : undefined;
    const cleanThirdName = isSplitTx && newTx.thirdPartyName ? sanitizeText(newTx.thirdPartyName) : undefined;
    const calculatedPersonal = isSplitTx && parsedThirdAmount != null
      ? safeSub(totalAmount, parsedThirdAmount)
      : undefined;

    const resolvedFlow = resolveTransactionFlowType(
      { category: newTx.category, isTransfer: isTransferTx, isSplit: isSplitTx },
      categoriesCatalog
    );
    const resolvedFuelType = newTx.fuelType || (isPostoExpress ? expressFuelType : undefined);
    const resolvedFullTank = newTx.fullTank !== false;

    // Alerta de Odômetro Menor
    if (newTx.km && autoMetrics.maxKm > 0 && Number(newTx.km) < autoMetrics.maxKm) {
      notify(
        "Odômetro Menor",
        `O KM digitado (${Number(newTx.km).toLocaleString("pt-BR")}) é menor que o registro anterior (${autoMetrics.maxKm.toLocaleString("pt-BR")} km).`,
        "warning",
        "CONFIG"
      );
    }

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
                flowType: resolvedFlow,
                costType: newTx.costType,
                paymentMethod: newTx.paymentMethod,
                cardUsed: savedCardUsed,
                bankAccount: resolvedBank,
                cardId: resolvedCardId,
                bankId: resolvedBankId,
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
          const invData = isCredit
            ? calculateInvoiceAndCashMonths(newTx.date, matchedCard?.closingDay, matchedCard?.dueDay)
            : null;
          const itemInvoiceMonth = invData?.invoiceCompetence;
          const itemCashMonth = invData?.cashMonth;

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
              flowType: "RECEIVABLE",
              costType: "Variável",
              paymentMethod: "Outro",
              status: "Pendente",
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
                flowType: resolvedFlow,
                costType: newTx.costType,
                paymentMethod: newTx.paymentMethod,
                cardUsed: savedCardUsed,
                bankAccount: resolvedBank,
                cardId: resolvedCardId,
                bankId: resolvedBankId,
                status: newTx.status,
                km: newTx.km ? Number(newTx.km) : undefined,
                liters: newTx.liters ? Number(newTx.liters) : undefined,
                fuelType: resolvedFuelType,
                fullTank: resolvedFullTank,
                invoiceMonth: itemInvoiceMonth,
                cashMonth: itemCashMonth,
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
        const slices = distributeInstallments(totalAmount, installmentsCount);
        const seriesId = generateInstallmentSeriesId(newTx.description, newTx.date, totalAmount);
        const createdList: Transaction[] = [];

        for (let i = 0; i < slices.length; i++) {
          const slice = slices[i];
          const instDate = addMonthsToDate(newTx.date, i);
          const invData = calculateInvoiceAndCashMonths(instDate, matchedCard?.closingDay, matchedCard?.dueDay);
          createdList.push({
            id: `tx-${Date.now()}-${i}`,
            date: instDate,
            description: sanitizeText(newTx.description),
            amount: slice.amount,
            category: newTx.category,
            flowType: resolvedFlow,
            costType: newTx.costType,
            paymentMethod: newTx.paymentMethod,
            cardUsed: savedCardUsed,
            bankAccount: resolvedBank,
            cardId: resolvedCardId,
            bankId: resolvedBankId,
            status: "Na Fatura",
            installmentInfo: `${slice.installmentNumber}/${slice.totalInstallments}`,
            installmentGroupId: seriesId,
            installmentSeriesId: seriesId,
            invoiceMonth: invData.invoiceCompetence,
            cashMonth: invData.cashMonth,
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
          `${installmentsCount}x de ${formatBRL(slices[slices.length - 1].amount)} salvas no Supabase.`,
          "success",
          "FINANCE"
        );
      } else {
        const invData = isCredit
          ? calculateInvoiceAndCashMonths(newTx.date, matchedCard?.closingDay, matchedCard?.dueDay)
          : null;
        const itemInvoiceMonth = invData?.invoiceCompetence;
        const itemCashMonth = invData?.cashMonth;
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
            flowType: "RECEIVABLE",
            costType: "Variável",
            paymentMethod: "Outro",
            status: "Pendente",
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
          flowType: resolvedFlow,
          costType: newTx.costType,
          paymentMethod: newTx.paymentMethod,
          cardUsed: savedCardUsed,
          bankAccount: resolvedBank,
          cardId: resolvedCardId,
          bankId: resolvedBankId,
          status: newTx.status,
          km: newTx.km ? Number(newTx.km) : undefined,
          liters: newTx.liters ? Number(newTx.liters) : undefined,
          fuelType: resolvedFuelType,
          fullTank: resolvedFullTank,
          invoiceMonth: itemInvoiceMonth,
          cashMonth: itemCashMonth,
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
      if (createAnother) {
        setNewTx((prev) => ({
          ...prev,
          description: "",
          amount: "",
          km: "",
          liters: "",
          thirdPartyAmount: "",
          thirdPartyName: "",
          personalAmount: "",
          installments: "1"
        }));
      } else {
        setShowTxModal(false);
      }
    }
  };

  const handleSaveAndNewTransaction = async (e: React.FormEvent) => {
    await handleSaveTransaction(e, true);
  };

  const handleToggleStatus = (tx: Transaction) => {
    let nextStatus: TxStatus;
    if (tx.status === "Pago") {
      nextStatus = tx.paymentMethod === "Cartão de Crédito" ? "Na Fatura" : "Pendente";
    } else {
      nextStatus = "Pago";
    }
    const previousTx = { ...tx };
    const changedItem: Transaction = {
      ...tx,
      status: nextStatus,
      paidAmount: nextStatus === "Pago" ? tx.amount : 0,
      updatedAt: new Date().toISOString()
    };
    const updated = transactions.map((t) => (t.id === tx.id ? changedItem : t));
    setTransactions(updated);
    setUserItem("lifeos_txs_v8", JSON.stringify(updated), currentUserId);
    upsertTransactionsInDb([changedItem], debtorMap);
    notify(
      "Situação Alterada",
      `${tx.description} marcado como ${nextStatus}.`,
      "info",
      "FINANCE",
      () => {
        const reverted = transactions.map((t) => (t.id === tx.id ? previousTx : t));
        setTransactions(reverted);
        setUserItem("lifeos_txs_v8", JSON.stringify(reverted), currentUserId);
        upsertTransactionsInDb([previousTx], debtorMap);
        notify("Alteração Desfeita!", `${tx.description} voltou para ${previousTx.status}.`, "info", "FINANCE");
      },
      "↩ Desfazer"
    );
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
      description: `Deseja realmente excluir "${tx.description}" (${formatBRL(tx.amount)})? Esta ação pode ser desfeita.`,
      confirmLabel: "Sim, Excluir",
      danger: true,
      onConfirm: async () => {
        const childId = tx.linkedReceivableId;
        const parentId = tx.linkedSplitParentId;
        const previousTransactions = [...transactions];
        const txsToRestore = transactions.filter((t) => t.id === id || t.id === childId);

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

        recordTombstone(id, currentUserId);
        if (childId) {
          recordTombstone(childId, currentUserId);
        }
        setTransactions(updated);
        setUserItem("lifeos_txs_v8", JSON.stringify(updated), currentUserId);
        await deleteTransactionInDb(id);
        if (childId) {
          await deleteTransactionInDb(childId);
        }
        notify(
          "Lançamento Removido",
          `"${tx.description}" excluído com sucesso.`,
          "warning",
          "FINANCE",
          () => {
            setTransactions(previousTransactions);
            setUserItem("lifeos_txs_v8", JSON.stringify(previousTransactions), currentUserId);
            upsertTransactionsInDb(txsToRestore, debtorMap);
            notify("Lançamento Restaurado!", `"${tx.description}" foi restaurado com sucesso.`, "success", "FINANCE");
          },
          "↩ Desfazer"
        );
      }
    });
  };

  const handleConfirmDeleteInstallment = async (deleteAll: boolean) => {
    if (!deleteSeriesModal.targetTx || !deleteSeriesModal.seriesData) return;
    setIsDeletingSeries(true);
    const previousTransactions = [...transactions];
    try {
      if (deleteAll) {
        const seriesList = deleteSeriesModal.seriesData.series;
        const idsToDelete = new Set(seriesList.map((t) => t.id));
        recordTombstones(Array.from(idsToDelete), currentUserId);
        const updated = transactions.filter((t) => !idsToDelete.has(t.id));
        setTransactions(updated);
        setUserItem("lifeos_txs_v8", JSON.stringify(updated), currentUserId);
        await deleteTransactionsInDb(Array.from(idsToDelete));
        notify(
          "Série Parcelada Removida",
          `Todas as ${idsToDelete.size} parcelas foram excluídas e o limite do cartão foi liberado.`,
          "warning",
          "FINANCE",
          () => {
            setTransactions(previousTransactions);
            setUserItem("lifeos_txs_v8", JSON.stringify(previousTransactions), currentUserId);
            upsertTransactionsInDb(seriesList, debtorMap);
            notify("Série Parcelada Restaurada!", `${seriesList.length} parcelas foram restauradas.`, "success", "FINANCE");
          },
          "↩ Desfazer"
        );
      } else {
        const targetId = deleteSeriesModal.targetTx.id;
        const deletedTx = deleteSeriesModal.targetTx;
        recordTombstone(targetId, currentUserId);
        const updated = transactions.filter((t) => t.id !== targetId);
        setTransactions(updated);
        setUserItem("lifeos_txs_v8", JSON.stringify(updated), currentUserId);
        await deleteTransactionInDb(targetId);
        notify(
          "Parcela Removida",
          `A parcela (${deletedTx.installmentInfo || "individual"}) foi excluída com sucesso.`,
          "warning",
          "FINANCE",
          () => {
            setTransactions(previousTransactions);
            setUserItem("lifeos_txs_v8", JSON.stringify(previousTransactions), currentUserId);
            upsertTransactionsInDb([deletedTx], debtorMap);
            notify("Parcela Restaurada!", `A parcela foi restaurada com sucesso.`, "success", "FINANCE");
          },
          "↩ Desfazer"
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
    const nowIso = todayISO();
    const todayStr = todayBR();
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
      flowType: "NEUTRAL",
      isReceivableSettlement: true,
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
          const cType: CostType = "Fixo";
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

    const oldCard = editingCardId ? cards.find((c) => c.id === editingCardId) : null;
    const updated = editingCardId ? cards.map((c) => (c.id === editingCardId ? cardObj : c)) : [...cards, cardObj];
    setCards(updated);
    localStorage.setItem("lifeos_cards_v8", JSON.stringify(updated));
    upsertCardInDb(cardObj);

    // Cascata SSOT: Ao renomear cartão, atualiza todas as transações vinculadas mantendo histórico e faturas
    if (editingCardId && oldCard && (oldCard.name !== cardObj.name || oldCard.bankName !== cardObj.bankName)) {
      const changedTxs: Transaction[] = [];
      const updatedTxs = transactions.map((t) => {
        if (t.cardId === editingCardId || (t.cardUsed && t.cardUsed === oldCard.name)) {
          const up: Transaction = {
            ...t,
            cardUsed: cardObj.name,
            cardId: cardObj.id,
            bankAccount: cardObj.bankName || t.bankAccount,
            bankId: cardObj.bankId || t.bankId,
            updatedAt: new Date().toISOString()
          };
          changedTxs.push(up);
          return up;
        }
        return t;
      });

      if (changedTxs.length > 0) {
        setTransactions(updatedTxs);
        setUserItem("lifeos_txs_v8", JSON.stringify(updatedTxs), currentUserId);
        void upsertTransactionsInDb(changedTxs, debtorMap);
      }
    }

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
        recordTombstone(id, currentUserId);
        const updated = cards.filter((c) => c.id !== id);
        setCards(updated);
        setUserItem("lifeos_cards_v8", JSON.stringify(updated), currentUserId);
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
    const oldBank = editingBankId ? banks.find((b) => b.id === editingBankId) : null;
    const updated = editingBankId
      ? banks.map((b) => (b.id === editingBankId ? bankObj : b))
      : [...banks, bankObj];
    setBanks(updated);
    localStorage.setItem("lifeos_banks_v1", JSON.stringify(updated));

    // SSOT Cascata: Sincroniza nos cartões vinculados e nas transações vinculadas mantendo integridade
    if (editingBankId && oldBank && oldBank.name !== bankObj.name) {
      const updatedCards = cards.map((c) =>
        c.bankId === editingBankId || c.bankName === oldBank.name
          ? { ...c, bankId: bankObj.id, bankName: bankObj.name }
          : c
      );
      setCards(updatedCards);
      localStorage.setItem("lifeos_cards_v8", JSON.stringify(updatedCards));

      const changedTxs: Transaction[] = [];
      const updatedTxs = transactions.map((t) => {
        let changed = false;
        let newAccount = t.bankAccount;
        let newSource = t.sourceBank;
        let newDest = t.destinationBank;
        let newBankId = t.bankId;

        if (t.bankId === editingBankId || t.bankAccount === oldBank.name) {
          newAccount = bankObj.name;
          newBankId = bankObj.id;
          changed = true;
        }
        if (t.sourceBank === oldBank.name) {
          newSource = bankObj.name;
          changed = true;
        }
        if (t.destinationBank === oldBank.name) {
          newDest = bankObj.name;
          changed = true;
        }

        if (changed) {
          const up: Transaction = {
            ...t,
            bankAccount: newAccount,
            sourceBank: newSource,
            destinationBank: newDest,
            bankId: newBankId,
            updatedAt: new Date().toISOString()
          };
          changedTxs.push(up);
          return up;
        }
        return t;
      });

      if (changedTxs.length > 0) {
        setTransactions(updatedTxs);
        setUserItem("lifeos_txs_v8", JSON.stringify(updatedTxs), currentUserId);
        void upsertTransactionsInDb(changedTxs, debtorMap);
      }
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
        (t.status === "Na Fatura" || t.status === "Pendente / Na Fatura")
    );
    if (pendingTxs.length === 0) {
      notify("Fatura Sem Pendências", `O cartão ${cardName} não possui saldo utilizado em aberto.`, "info", "FINANCE");
      return;
    }

    const totalInvoice = safeAdd(...pendingTxs.map((t) => t.amount));
    const nowIso = todayISO();
    const todayStr = todayBR();
    const resolvedOriginBank = originBankName || banks[0]?.name || "Nubank";

    // 1. Marca as transações da fatura como "Pago"
    const changedList: Transaction[] = [];
    const updated = transactions.map((t) => {
      if (
        t.paymentMethod === "Cartão de Crédito" &&
        t.cardUsed === cardName &&
        (t.status === "Na Fatura" || t.status === "Pendente / Na Fatura")
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

    // 2. Gera a transação de saída correspondente no Banco escolhido com neutralidade contábil
    const invoicePaymentTx: Transaction = {
      id: `tx-inv-${Date.now()}`,
      date: todayStr,
      description: `Pagamento Fatura ${cardName}`,
      amount: totalInvoice,
      category: "Pagamento de Fatura",
      flowType: "NEUTRAL",
      isInvoicePayment: true,
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
      date: todayBR(),
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
      : [...bioLogs, bioObj].sort((a, b) => compareDatesBR(a.date, b.date));
    setBioLogs(updated);
    localStorage.setItem("lifeos_bio_v8", JSON.stringify(updated));
    upsertBioLogInDb(bioObj);
    setEditingBioId(null);
    setNewBio({ date: todayBR(), weight: "", bf: "" });
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
      date: todayBR(),
      title: newNote.title.trim(),
      content: finalDesc,
      description: finalDesc,
      tag: newNote.tag,
      itemType: newNote.itemType || "note",
      price: parsedPrice,
      priority: newNote.itemType === "wish" ? newNote.priority || "Planejado" : undefined,
      storeUrl: newNote.storeUrl?.trim() || undefined,
      completed: Boolean(newNote.completed),
      completedAt: newNote.completed ? todayBR() : undefined
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
        completedAt: nextCompleted ? todayBR() : undefined
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
        recordTombstone(id, currentUserId);
        const updated = notes.filter((n) => n.id !== id);
        setNotes(updated);
        setUserItem("lifeos_notes_v8", JSON.stringify(updated), currentUserId);
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
      schemaVersion: 2,
      version: APP_VERSION,
      exportDateBR: todayBR(),
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
        initialPatrimony,
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
    a.download = `coindex-backup-${todayBR()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Backup Exportado com Sucesso!", "Arquivo JSON versionado (v2) gerado e salvo.", "success", "CONFIG");
  };

  const handleImportFullBackupJSON = async (file: File, mode: "merge" | "replace" = "merge") => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const raw = String(ev.target?.result);
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") {
          throw new Error("Formato JSON inválido");
        }

        const backupResult = validateAndQuarantineBackup(parsed);
        if (!backupResult.success || !backupResult.data) {
          throw new Error(backupResult.error || "Estrutura do arquivo de backup inválida.");
        }
        const valid = backupResult.data;
        const quarantine = valid.quarantine;

        // Se houver quarentena, registrar no log do sistema
        if (quarantine.totalQuarantined > 0) {
          const logText = `Registros inconsistentes isolados: ${quarantine.details.map((i: any) => `[${i.entity}] ${i.error}`).join("; ")}`;
          const entry: SystemLogEntry = {
            id: `log-quarantine-${Date.now()}`,
            timestamp: new Date().toLocaleString("pt-BR"),
            user: currentUser || "Sistema",
            category: "CONFIG",
            action: "Quarentena de Backup",
            details: logText
          };
          setSystemLogsState((prev) => [entry, ...prev].slice(0, 200));
          insertSystemLogInDb(entry);
        }

        let nextTransactions: Transaction[] = transactions;
        let nextCards: CreditCardItem[] = cards;
        let nextBanks: BankItem[] = banks;
        let nextStatus: StaticStatusItem[] = staticStatus;
        let nextWishlist: WishlistItem[] = wishlist;
        let nextBioLogs: BioLog[] = bioLogs;
        let nextNotes: BrainNote[] = notes;
        let nextOkrs: PersonalOKR[] = okrs;
        let nextAlerts: CustomAlertRule[] = alertRules;
        let nextDebtors: Record<string, any> = debtorMap;

        if (mode === "replace") {
          nextTransactions = valid.transactions as unknown as Transaction[];
          if (valid.cards && valid.cards.length > 0) nextCards = valid.cards as unknown as CreditCardItem[];
          if (valid.banks && valid.banks.length > 0) nextBanks = valid.banks as unknown as BankItem[];
          if (valid.staticStatus && valid.staticStatus.length > 0) nextStatus = valid.staticStatus as unknown as StaticStatusItem[];
          if (valid.wishlist) nextWishlist = valid.wishlist as unknown as WishlistItem[];
          if (valid.bioLogs) nextBioLogs = valid.bioLogs as unknown as BioLog[];
          if (valid.notes) nextNotes = valid.notes as unknown as BrainNote[];
          if (valid.okrs) nextOkrs = valid.okrs as unknown as PersonalOKR[];
          if (valid.alertRules) nextAlerts = valid.alertRules as unknown as CustomAlertRule[];
          if (valid.debtorMap) nextDebtors = valid.debtorMap;
        } else {
          // Mesclar sem duplicatas por ID
          const txMap = new Map<string, Transaction>(transactions.map((t: Transaction) => [t.id, t]));
          (valid.transactions as unknown as Transaction[]).forEach((t: Transaction) => txMap.set(t.id, t));
          nextTransactions = Array.from(txMap.values());

          if (valid.cards && valid.cards.length > 0) {
            const cardMap = new Map<string, CreditCardItem>(cards.map((c: CreditCardItem) => [c.id, c]));
            (valid.cards as unknown as CreditCardItem[]).forEach((c: CreditCardItem) => cardMap.set(c.id, c));
            nextCards = Array.from(cardMap.values());
          }
          if (valid.banks && valid.banks.length > 0) {
            const bankMap = new Map<string, BankItem>(banks.map((b: BankItem) => [b.id, b]));
            (valid.banks as unknown as BankItem[]).forEach((b: BankItem) => bankMap.set(b.id, b));
            nextBanks = Array.from(bankMap.values());
          }
          if (valid.staticStatus && valid.staticStatus.length > 0) {
            const statusMap = new Map<string, StaticStatusItem>(staticStatus.map((s: StaticStatusItem) => [s.id, s]));
            (valid.staticStatus as unknown as StaticStatusItem[]).forEach((s: StaticStatusItem) => statusMap.set(s.id, s));
            nextStatus = Array.from(statusMap.values());
          }
          if (valid.wishlist && valid.wishlist.length > 0) {
            const wishMap = new Map<string, WishlistItem>(wishlist.map((w: WishlistItem) => [w.id, w]));
            (valid.wishlist as unknown as WishlistItem[]).forEach((w: WishlistItem) => wishMap.set(w.id, w));
            nextWishlist = Array.from(wishMap.values());
          }
          if (valid.bioLogs && valid.bioLogs.length > 0) {
            const bioMap = new Map<string, BioLog>(bioLogs.map((b: BioLog) => [b.id, b]));
            (valid.bioLogs as unknown as BioLog[]).forEach((b: BioLog) => bioMap.set(b.id, b));
            nextBioLogs = Array.from(bioMap.values());
          }
          if (valid.notes && valid.notes.length > 0) {
            const noteMap = new Map<string, BrainNote>(notes.map((n: BrainNote) => [n.id, n]));
            (valid.notes as unknown as BrainNote[]).forEach((n: BrainNote) => noteMap.set(n.id, n));
            nextNotes = Array.from(noteMap.values());
          }
          if (valid.okrs && valid.okrs.length > 0) {
            const okrMap = new Map<string, PersonalOKR>(okrs.map((o: PersonalOKR) => [o.id, o]));
            (valid.okrs as unknown as PersonalOKR[]).forEach((o: PersonalOKR) => okrMap.set(o.id, o));
            nextOkrs = Array.from(okrMap.values());
          }
          if (valid.alertRules && valid.alertRules.length > 0) {
            const alertMap = new Map<string, CustomAlertRule>(alertRules.map((a: CustomAlertRule) => [a.id, a]));
            (valid.alertRules as unknown as CustomAlertRule[]).forEach((a: CustomAlertRule) => alertMap.set(a.id, a));
            nextAlerts = Array.from(alertMap.values());
          }
          if (valid.debtorMap) {
            nextDebtors = { ...debtorMap, ...valid.debtorMap };
          }
        }

        setTransactions(nextTransactions);
        setUserItem("lifeos_txs_v8", JSON.stringify(nextTransactions), currentUserId);

        setCards(nextCards);
        setUserItem("lifeos_cards_v8", JSON.stringify(nextCards), currentUserId);

        setBanks(nextBanks);
        setUserItem("lifeos_banks_v1", JSON.stringify(nextBanks), currentUserId);

        setStaticStatus(nextStatus);
        setUserItem("lifeos_status_v8", JSON.stringify(nextStatus), currentUserId);

        setWishlist(nextWishlist);
        setUserItem("lifeos_wish_v8", JSON.stringify(nextWishlist), currentUserId);

        setBioLogs(nextBioLogs);
        setUserItem("lifeos_bio_v8", JSON.stringify(nextBioLogs), currentUserId);

        setNotes(nextNotes);
        setUserItem("lifeos_notes_v8", JSON.stringify(nextNotes), currentUserId);

        setOkrs(nextOkrs);
        setUserItem("lifeos_okrs_v8", JSON.stringify(nextOkrs), currentUserId);

        setAlertRules(nextAlerts);
        setUserItem("lifeos_alerts_v8", JSON.stringify(nextAlerts), currentUserId);

        setDebtorMap(nextDebtors);
        setUserItem("lifeos_debtors_v8", JSON.stringify(nextDebtors), currentUserId);

        if (valid.categoriesCatalog && valid.categoriesCatalog.length > 0) {
          setCategoriesCatalog(valid.categoriesCatalog as unknown as CategoryCatalogItem[]);
        }
        if (valid.categoryColors && typeof valid.categoryColors === "object") {
          setCategoryColors(valid.categoryColors);
        }
        if (valid.paymentMethods && valid.paymentMethods.length > 0) {
          setPaymentMethods(valid.paymentMethods);
        }

        if (valid.user) {
          if (valid.user.nickname) {
            setCurrentUser(valid.user.nickname);
            setUserItem("coindex_username", valid.user.nickname, currentUserId);
          }
          if (valid.user.avatar) {
            setCurrentUserAvatar(valid.user.avatar);
            setUserItem("coindex_avatar", valid.user.avatar, currentUserId);
          }
        }

        const s = (valid.settings || {}) as Record<string, any>;
        if (s.personalBudgetLimit != null) setPersonalBudgetLimit(Number(s.personalBudgetLimit));
        if (s.monthlyInvestmentGoal != null) setMonthlyInvestmentGoal(Number(s.monthlyInvestmentGoal));
        if (s.patrimonyTarget != null) setPatrimonyTarget(Number(s.patrimonyTarget));
        if (s.initialPatrimony != null) setInitialPatrimony(Number(s.initialPatrimony));
        if (s.annualRunGoalKm != null) setAnnualRunGoalKm(Number(s.annualRunGoalKm));
        if (s.chartTheme) setChartTheme(s.chartTheme as ChartThemeColors);
        if (s.themeMode) setThemeMode(s.themeMode as ThemeMode);
        if (s.dashboardLayout) {
          setDashboardLayout(s.dashboardLayout as DashboardWidgetConfig[]);
          setUserItem("lifeos_dash_layout_v1", JSON.stringify(s.dashboardLayout), currentUserId);
        }
        if (s.chartConfigs) {
          setChartConfigs(s.chartConfigs as Record<string, ChartWidgetSettings>);
          setUserItem("lifeos_chart_configs_v1", JSON.stringify(s.chartConfigs), currentUserId);
        }

        await migrateAllStateToSupabase(
          {
            transactions: nextTransactions,
            cards: nextCards,
            staticStatus: nextStatus,
            wishlist: nextWishlist,
            bioLogs: nextBioLogs,
            notes: nextNotes,
            okrs: nextOkrs,
            alertRules: nextAlerts,
            categoriesCatalog: (valid.categoriesCatalog as unknown as CategoryCatalogItem[]) || categoriesCatalog,
            categoryColors: valid.categoryColors || categoryColors,
            paymentMethods: valid.paymentMethods || paymentMethods,
            systemLogs,
            settings: {
              username: valid.user?.nickname || currentUser || undefined,
              avatarUrl: valid.user?.avatar || currentUserAvatar,
              themeMode: (s.themeMode as ThemeMode) || themeMode,
              personalBudgetLimit: Number(s.personalBudgetLimit) || personalBudgetLimit,
              monthlyInvestmentGoal: Number(s.monthlyInvestmentGoal) || monthlyInvestmentGoal,
              patrimonyTarget: Number(s.patrimonyTarget) || patrimonyTarget,
              initialPatrimony: s.initialPatrimony != null ? Number(s.initialPatrimony) : initialPatrimony,
              annualRunGoalKm: Number(s.annualRunGoalKm) || annualRunGoalKm,
              chartTheme: (s.chartTheme as ChartThemeColors) || chartTheme,
              dashboardLayout: (s.dashboardLayout as DashboardWidgetConfig[]) || dashboardLayout,
              chartConfigs: (s.chartConfigs as Record<string, ChartWidgetSettings>) || chartConfigs,
              readNotificationIds,
              stravaConfig,
              stravaStats
            }
          },
          nextDebtors
        );

        if (quarantine.totalQuarantined > 0) {
          notify(
            "Backup Restaurado com Quarentena",
            `${valid.transactions.length} transações restauradas (${mode === "replace" ? "substituição" : "mesclagem"}). ${quarantine.totalQuarantined} registros inconsistentes foram isolados.`,
            "warning",
            "CONFIG"
          );
        } else {
          notify(
            "Backup Restaurado com Sucesso!",
            `${valid.transactions.length} transações e configurações validadas via Zod (${mode === "replace" ? "substituição" : "mesclagem"}).`,
            "success",
            "CONFIG"
          );
        }
      } catch (err: any) {
        notify("Erro ao Restaurar Backup", err?.message || "Arquivo JSON inválido ou corrompido.", "error", "CONFIG");
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

  const syncIndicator = useMemo(() => {
    if (isSyncing) {
      return {
        color: "text-amber-400 bg-amber-400/10 border-amber-400/30",
        dot: "bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]",
        label: "Sincronizando...",
        status: "syncing",
        timestamp: sheetsSyncStatus.timestamp || new Date().toLocaleTimeString("pt-BR")
      };
    }
    if (sheetsSyncStatus.state === "error") {
      return {
        color: "text-rose-400 bg-rose-400/10 border-rose-400/30",
        dot: "bg-rose-500 shadow-[0_0_8px_#f43f5e]",
        label: "Erro de Sync",
        status: "error",
        timestamp: sheetsSyncStatus.timestamp || ""
      };
    }
    if (currentUser && sheetsSyncStatus.state === "success") {
      return {
        color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
        dot: "bg-emerald-400 shadow-[0_0_8px_#10b981]",
        label: "Sincronizado",
        status: "synced",
        timestamp: sheetsSyncStatus.timestamp || ""
      };
    }
    return {
      color: "text-slate-400 bg-slate-400/10 border-slate-400/20",
      dot: "bg-slate-400",
      label: "Offline (Local)",
      status: "offline",
      timestamp: sheetsSyncStatus.timestamp || ""
    };
  }, [isSyncing, sheetsSyncStatus, currentUser]);

  const handleSeedPatrimonioHistory = handleSyncOfficialPatrimonioData;

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
          if (user.id) setCurrentUserId(user.id);
          setCurrentUser(user.username);
          if (user.avatarUrl) setCurrentUserAvatar(user.avatarUrl);
          setHasOwner(true);
          notify("Sessão Autenticada", `Bem-vindo ao Coindex, ${user.username}!`, "success", "AUTH");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex text-slate-100 bg-[#07030f]">
      <style jsx global>{`
        .glass-card {
          background: rgba(19, 9, 39, 0.82);
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
                ? "bg-[#110724]/95 border-rose-500/50 text-rose-100 shadow-rose-950/40"
                : t.type === "warning"
                ? "bg-[#110724]/95 border-amber-500/50 text-amber-100 shadow-amber-950/40"
                : t.type === "success"
                ? "bg-[#110724]/95 border-[#00F5D4]/50 text-cyan-100 shadow-[0_0_20px_rgba(0,245,212,0.15)]"
                : "bg-[#110724]/95 border-[#A855F7]/50 text-slate-100 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {t.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : t.type === "warning" ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : t.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-[#00F5D4] shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#A855F7] shrink-0 mt-0.5" />
              )}
              <div>
                <strong className="font-bold text-white block">{t.title}</strong>
                {t.subtitle && (
                  <span className="text-slate-300 text-[11px] leading-snug block mt-0.5">{t.subtitle}</span>
                )}
                {t.onUndo && (
                  <button
                    type="button"
                    onClick={() => {
                      t.onUndo?.();
                      setToasts((prev) => prev.filter((item) => item.id !== t.id));
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#00F5D4]/20 border border-white/20 hover:border-[#00F5D4]/40 text-[#00F5D4] font-bold text-[11px] transition cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.undoLabel || "↩ Desfazer"}</span>
                  </button>
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
                className={`w-full min-h-[44px] px-3.5 py-3 rounded-2xl font-medium flex items-center gap-3 transition-all duration-200 ${
                  activeTab === tab.id
                    ? tab.id === "spotify"
                      ? "bg-[#1DB954]/20 text-[#1DB954] ring-1 ring-[#1DB954]/40 shadow-sm"
                      : "bg-[#0A84FF] text-white shadow-sm font-semibold rounded-2xl"
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
                <span className={`text-[10px] flex items-center gap-1.5 font-medium ${syncIndicator.color.split(" ")[0]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${syncIndicator.dot}`} />
                  <span>{syncIndicator.label}</span>
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
                <option value="2026-10">Outubro / 2026 (Atual)</option>
                <option value="2026-09">Setembro / 2026</option>
                <option value="2026-08">Agosto / 2026</option>
                <option value="2026-07">Julho / 2026</option>
                <option value="2026-06">Junho / 2026</option>
                <option value="2026-05">Maio / 2026</option>
                <option value="2026-04">Abril / 2026</option>
                <option value="2026-03">Março / 2026</option>
                <option value="2026-02">Fevereiro / 2026</option>
                <option value="2026-01">Janeiro / 2026</option>
                <option value="2025-12">Dezembro / 2025</option>
                <option value="2026-11">Novembro / 2026 (Futuro)</option>
                <option value="2026-12">Dezembro / 2026 (Futuro)</option>
                <option value="ALL">Histórico Completo</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Indicador de Sincronização em Tempo Real (Sprint 22) */}
              <div
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium backdrop-blur-md transition ${syncIndicator.color}`}
                title={
                  syncIndicator.timestamp
                    ? `${syncIndicator.label} — Última sync: ${syncIndicator.timestamp}`
                    : syncIndicator.label
                }
              >
                <span className={`w-2 h-2 rounded-full ${syncIndicator.dot}`} />
                <span>{syncIndicator.label}</span>
                {syncIndicator.timestamp && (
                  <span className="text-[10px] opacity-70">({syncIndicator.timestamp})</span>
                )}
              </div>

              {/* SININHO DE NOTIFICAÇÕES */}
              <div className={`relative ${showBellDropdown ? "z-[9999]" : "z-40"}`}>
                <button
                  type="button"
                  onClick={() => setShowBellDropdown((prev) => !prev)}
                  className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 relative transition flex items-center justify-center cursor-pointer"
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
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[var(--cupertino-card)] backdrop-blur-2xl border border-[var(--cupertino-border)] shadow-[var(--cupertino-shadow)] p-4 z-[9999] text-xs space-y-3">
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
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Check className="w-3 h-3" /> Visualizar todas
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/5 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setBellViewMode("unread")}
                        className={`py-1.5 rounded-lg transition cursor-pointer ${
                          bellViewMode === "unread" ? "bg-[#0A84FF] text-white shadow-sm" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Pendentes ({unreadNotifications.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setBellViewMode("viewed")}
                        className={`py-1.5 rounded-lg transition cursor-pointer ${
                          bellViewMode === "viewed" ? "bg-[#0A84FF] text-white shadow-sm" : "text-slate-400 hover:text-white"
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

              {/* SELETOR SEGMENTED CONTROL APPLE (CLARO / ESCURO) */}
              <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => toggleCupertinoTheme("light")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                    cupertinoTheme === "light"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Tema Claro (Cupertino Light)"
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Claro</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleCupertinoTheme("dark")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                    cupertinoTheme === "dark"
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Tema Escuro (Cupertino Dark)"
                >
                  <Moon className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Escuro</span>
                </button>
              </div>

              {/* BOTÃO DE PRIVACIDADE SOMENTE COM O SÍMBOLO DO OLHO */}
              <button
                type="button"
                onClick={togglePrivacyMode}
                className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
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
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0A84FF] hover:bg-[#0070E0] text-white font-medium shadow-sm transition-all text-xs flex items-center gap-1.5 cursor-pointer"
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
                    <Filter className="w-3.5 h-3.5 text-[#0A84FF] ml-2 mr-1" />
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
                        className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                          quickFilter === f.id
                            ? "bg-[#0A84FF] text-white shadow-sm"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={resetDashboardLayout}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-[11px] text-slate-300 font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#0A84FF]" /> Restaurar Ordem
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

                    const chartHeightClass =
                      cfg.height === "compact"
                        ? "h-60"
                        : cfg.height === "tall"
                        ? "h-96"
                        : "h-72";

                    const effectiveChartType =
                      cfg.chartType ||
                      (widget.id === "patrimony_chart" ? "area" : widget.id === "category_chart" ? "pie" : "bar");

                    const primaryColor =
                      cfg.color && cfg.color !== "auto"
                        ? cfg.color
                        : widget.id === "patrimony_chart"
                        ? "#0A84FF"
                        : widget.id === "credit_chart"
                        ? "#5E5CE6"
                        : "#30D158";

                    const personalPct = Math.min(
                      100,
                      Math.round((monthSummary.personalSpent / Math.max(1, effectivePersonalBudgetLimit)) * 100)
                    );
                    const totalExpenses = Math.max(1, categoryChartData.reduce((a, b) => a + b.value, 0));

                    const processedPatrimonyData = applyZeroHandling(
                      filteredPatrimonyChartData as unknown as Array<Record<string, unknown>>,
                      ["acumulado", "aportado", "resgatado"],
                      cfg.zeroHandling
                    );

                    return (
                      <ChartCard
                        key={widget.id}
                        id={widget.id}
                        title={
                          widget.id === "kpis"
                            ? selectedMonth === "ALL"
                              ? "Resumo Financeiro — Histórico Geral"
                              : "Resumo Financeiro do Mês"
                            : widget.title
                        }
                        subtitle={
                          widget.id === "kpis"
                            ? selectedMonth === "ALL"
                              ? "Consolidado geral de todas as entradas, despesas operacionais e patrimônio guardado"
                              : widget.subtitle
                            : widget.subtitle
                        }
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
                              <div className="text-right flex items-baseline gap-1 justify-end">
                                <span
                                  className={`font-semibold text-sm font-mono tabular-nums ${moneyBlur} ${
                                    personalPct >= 100 ? "text-[#FF453A]" : "text-[#30D158]"
                                  }`}
                                >
                                  {formatBRL(monthSummary.personalSpent)}
                                </span>
                                <span className="text-slate-400 font-normal">/</span>
                                <span className={`text-slate-300 font-semibold tabular-nums text-sm font-mono ${moneyBlur}`}>
                                  {formatBRL(effectivePersonalBudgetLimit)}
                                </span>
                                <span className="text-slate-400 text-xs font-mono tabular-nums">
                                  ({personalPct}%)
                                </span>
                              </div>
                              {filterMonthsCount > 1 && (
                                <span className="block text-[10px] text-slate-400 font-mono tabular-nums">
                                  ({formatBRL(personalBudgetLimit)} × {filterMonthsCount} meses)
                                </span>
                              )}
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
                          <div className="space-y-3 mb-4">
                            {/* Barra de controle: Seletor de Regime Contábil */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
                              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <span>Regime Contábil:</span>
                                <div className="relative group/tip inline-flex items-center hover:z-[9999]">
                                  <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200 transition-colors cursor-help" />
                                  <div className="absolute top-full left-0 mt-1.5 hidden group-hover/tip:flex flex-col z-[9999] w-64 p-2.5 rounded-xl bg-slate-900/95 border border-white/15 text-[11px] normal-case tracking-normal text-slate-300 shadow-2xl backdrop-blur-md pointer-events-none">
                                    <strong className="text-white mb-1">Regimes de Visualização:</strong>
                                    <p className="text-slate-300">
                                      <strong className="text-[#0A84FF]">Competência:</strong> despesas alocadas pela data do lançamento/compra.
                                    </p>
                                    <p className="text-slate-300 mt-1">
                                      <strong className="text-[#FF453A]">Caixa:</strong> compras de cartão alocadas no mês do vencimento/pagamento da fatura.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-white/10 text-xs">
                                <button
                                  type="button"
                                  onClick={() => setAccountingRegime("competencia")}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    accountingRegime === "competencia"
                                      ? "bg-[#0A84FF] text-white shadow-sm"
                                      : "text-slate-400 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  Competência
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAccountingRegime("caixa")}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    accountingRegime === "caixa"
                                      ? "bg-[#0A84FF] text-white shadow-sm"
                                      : "text-slate-400 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  Caixa
                                </button>
                              </div>
                            </div>

                            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${moneyBlur}`}>
                              {/* Card 1: Entradas */}
                              <div className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-[#30D158]/10 via-slate-900/80 to-slate-950 border border-[#30D158]/20 flex flex-col justify-between shadow-sm">
                                <div>
                                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span>{selectedMonth === "ALL" ? "Entradas Totais (Geral)" : "Entradas do Mês"}</span>
                                      <div className="relative group/tip inline-flex items-center hover:z-[9999]">
                                        <Info className="w-3 h-3 text-slate-400 hover:text-slate-200 transition-colors cursor-help" />
                                        <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/tip:flex flex-col z-[9999] w-56 p-2 rounded-xl bg-slate-900/95 border border-[#30D158]/30 text-[11px] normal-case tracking-normal text-slate-300 shadow-2xl backdrop-blur-md pointer-events-none">
                                          <strong className="text-[#30D158] mb-0.5">Fórmula de Entradas:</strong>
                                          <span>Soma de créditos e receitas ativas (FlowType = INCOME), excluindo transferências neutras e estornos.</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="p-1 rounded-lg bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/25">
                                      <TrendingUp className="w-3.5 h-3.5" />
                                    </div>
                                  </div>
                                  <p className="text-lg sm:text-xl font-semibold tracking-[-0.03em] tabular-nums text-[#30D158] leading-tight mt-0.5">
                                    +{formatBRL(monthSummary.income)}
                                  </p>
                                </div>
                                <div className="pt-1.5 mt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 tabular-nums">
                                  {selectedMonth === "ALL" ? (
                                    <span>Média mensal: {formatBRL(monthSummary.income / filterMonthsCount)}</span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <ArrowUpRight className="w-3.5 h-3.5 text-[#30D158]" />
                                      {monthSummary.incomeDiff >= 0
                                        ? `+${monthSummary.incomeDiff}%`
                                        : `${monthSummary.incomeDiff}%`}{" "}
                                      vs. mês anterior
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Card 2: Saídas & Despesas */}
                              <div className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-[#FF453A]/10 via-slate-900/80 to-slate-950 border border-[#FF453A]/20 flex flex-col justify-between shadow-sm">
                                <div>
                                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span>{selectedMonth === "ALL" ? "Saídas & Despesas (Geral)" : "Saídas & Despesas"}</span>
                                      <div className="relative group/tip inline-flex items-center hover:z-[9999]">
                                        <Info className="w-3 h-3 text-slate-400 hover:text-slate-200 transition-colors cursor-help" />
                                        <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/tip:flex flex-col z-[9999] w-56 p-2 rounded-xl bg-slate-900/95 border border-[#FF453A]/30 text-[11px] normal-case tracking-normal text-slate-300 shadow-2xl backdrop-blur-md pointer-events-none">
                                          <strong className="text-[#FF453A] mb-0.5">Fórmula de Saídas:</strong>
                                          <span>Soma de débitos e faturas (FlowType = EXPENSE), respeitando a cota pessoal em despesas divididas (split).</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="p-1 rounded-lg bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/25">
                                      <TrendingDown className="w-3.5 h-3.5" />
                                    </div>
                                  </div>
                                  <p className="text-lg sm:text-xl font-semibold tracking-[-0.03em] tabular-nums text-[#FF453A] leading-tight mt-0.5">
                                    -{formatBRL(monthSummary.expense)}
                                  </p>
                                </div>
                                <div className="pt-1.5 mt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 tabular-nums">
                                  {selectedMonth === "ALL" ? (
                                    <span>Média mensal: {formatBRL(monthSummary.expense / filterMonthsCount)}</span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <ArrowDownRight className="w-3.5 h-3.5 text-[#FF453A]" />
                                      {monthSummary.expenseDiff >= 0
                                        ? `+${monthSummary.expenseDiff}%`
                                        : `${monthSummary.expenseDiff}%`}{" "}
                                      vs. mês anterior
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Card 3: Aportes Brutos */}
                              <div className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-[#0A84FF]/10 via-slate-900/80 to-slate-950 border border-[#0A84FF]/20 flex flex-col justify-between shadow-sm">
                                <div>
                                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span>{selectedMonth === "ALL" ? "Aportes Brutos (Geral)" : "Aportes no Mês"}</span>
                                      <div className="relative group/tip inline-flex items-center hover:z-[9999]">
                                        <Info className="w-3 h-3 text-slate-400 hover:text-slate-200 transition-colors cursor-help" />
                                        <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/tip:flex flex-col z-[9999] w-56 p-2 rounded-xl bg-slate-900/95 border border-[#0A84FF]/30 text-[11px] normal-case tracking-normal text-slate-300 shadow-2xl backdrop-blur-md pointer-events-none">
                                          <strong className="text-[#0A84FF] mb-0.5">Fórmula de Aportes:</strong>
                                          <span>Soma bruta de lançamentos de investimento e caixinhas (Aportes ≥ 0). Resgates não reduzem o aporte bruto.</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="p-1 rounded-lg bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/25">
                                      <PiggyBank className="w-3.5 h-3.5" />
                                    </div>
                                  </div>
                                  <p className="text-lg sm:text-xl font-semibold tracking-[-0.03em] tabular-nums text-[#0A84FF] leading-tight mt-0.5">
                                    +{formatBRL(monthSummary.aportes)}
                                  </p>
                                </div>
                                <div className="pt-1.5 mt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 tabular-nums">
                                  {selectedMonth === "ALL" ? (
                                    <span className="truncate" title={`Em Reserva (Líquido): ${formatBRL(allTimeReserva.liquido)} • Resgatado: ${formatBRL(allTimeReserva.resgates)}`}>
                                      Em Reserva (Líquido): <strong className="text-white">{formatBRL(allTimeReserva.liquido)}</strong> • Resgatado: {formatBRL(allTimeReserva.resgates)}
                                    </span>
                                  ) : (
                                    <span>Meta: {formatBRL(monthlyInvestmentGoal)}</span>
                                  )}
                                </div>
                              </div>

                              {/* Card 4: Saldo Livre / Balanço Operacional Líquido */}
                              <div className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-[#64D2FF]/10 via-slate-900/80 to-slate-950 border border-[#64D2FF]/20 flex flex-col justify-between shadow-sm">
                                <div>
                                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span>{selectedMonth === "ALL" ? "Balanço Operacional Líquido" : "Saldo Livre Líquido"}</span>
                                      <div className="relative group/tip inline-flex items-center hover:z-[9999]">
                                        <Info className="w-3 h-3 text-slate-400 hover:text-slate-200 transition-colors cursor-help" />
                                        <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/tip:flex flex-col z-[9999] w-60 p-2 rounded-xl bg-slate-900/95 border border-[#64D2FF]/30 text-[11px] normal-case tracking-normal text-slate-300 shadow-2xl backdrop-blur-md pointer-events-none">
                                          <strong className="text-[#64D2FF] mb-0.5">Resultado Operacional:</strong>
                                          <span>Entradas - (Despesas Operacionais + Investimento Líquido do período). Indica a folga de caixa líquida.</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="p-1 rounded-lg bg-[#64D2FF]/15 text-[#64D2FF] border border-[#64D2FF]/25">
                                      <Wallet className="w-3.5 h-3.5" />
                                    </div>
                                  </div>
                                  <p
                                    className={`text-lg sm:text-xl font-semibold tracking-[-0.03em] tabular-nums leading-tight mt-0.5 ${
                                      monthSummary.balance >= 0 ? "text-[#30D158]" : "text-[#FF453A]"
                                    }`}
                                  >
                                    {monthSummary.balance >= 0 ? "+" : ""}{formatBRL(monthSummary.balance)}
                                  </p>
                                </div>

                                {/* Rodapé Adaptativo */}
                                {selectedMonth === "ALL" ? (
                                  <div className="pt-1.5 mt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] tabular-nums">
                                    <span className="text-slate-400 flex items-center gap-1 font-sans">
                                      <Sparkles className="w-3 h-3 text-[#0A84FF] shrink-0" />
                                      <span>Patrimônio em Caixinhas:</span>
                                    </span>
                                    <span className="font-bold px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] border tabular-nums bg-[#0A84FF]/15 text-[#0A84FF] border-[#0A84FF]/30 shadow-none">
                                      {formatBRL(allTimeReserva.liquido)}
                                    </span>
                                  </div>
                                ) : (
                                  <div
                                    className="pt-1.5 mt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] tabular-nums"
                                  >
                                    <div className="flex items-center gap-1 text-slate-400 font-sans">
                                      <Sparkles className="w-3 h-3 text-[#0A84FF] shrink-0" />
                                      <span>Safe-to-Spend:</span>
                                      <div className="relative group/tip inline-flex items-center hover:z-[9999]">
                                        <Info className="w-3 h-3 text-slate-400 hover:text-slate-200 transition-colors cursor-help" />
                                        <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/tip:flex flex-col z-[9999] w-64 p-2 rounded-xl bg-slate-900/95 border border-white/15 text-[11px] normal-case tracking-normal text-slate-300 shadow-2xl backdrop-blur-md pointer-events-none">
                                          <strong className="text-white mb-0.5">Safe-to-Spend Projetado:</strong>
                                          <span>Saldo em Contas ({formatBRL(safeToSpend.currentCash)}) + Entradas Pendentes ({formatBRL(safeToSpend.pendingIncome)}) - Fixos/Faturas Pendentes ({formatBRL(safeAdd(safeToSpend.pendingDirectExpenses, safeToSpend.pendingInvoices))}).</span>
                                        </div>
                                      </div>
                                    </div>
                                    <span
                                      className={`font-semibold px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] border tabular-nums ${
                                        safeToSpend.projected > 200
                                          ? "bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30"
                                          : safeToSpend.projected >= 0
                                          ? "bg-[#FF9F0A]/15 text-[#FF9F0A] border-[#FF9F0A]/30"
                                          : "bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30"
                                      }`}
                                    >
                                      {formatBRL(safeToSpend.projected)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {widget.id === "patrimony_chart" && (
                          <div className="space-y-4">
                            {patrimonyEvolution.hasDeficit && (
                              <div className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-pulse">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                  <span>
                                    <strong className="text-rose-200">Aviso de Déficit:</strong> Os resgates registrados superam o total acumulado de aportes (+ reserva inicial) em{" "}
                                    <span className="font-mono font-bold text-white">{formatBRL(patrimonyEvolution.deficitAmount)}</span>.
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Cabeçalho Interno Estilo Copilot Money: KPI Destaque + Filtro + Legenda Interativa */}
                            <div className="flex flex-wrap items-end justify-between gap-3 pb-1 border-b border-white/5">
                              {/* KPI Destaque Copilot Money */}
                              <div>
                                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                                  Patrimônio Acumulado {patrimonyTimeRange === "ALL" ? "(Total)" : `(${patrimonyTimeRange})`}
                                </span>
                                <div className="flex flex-wrap items-baseline gap-2.5">
                                  <span className={`text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight ${moneyBlur}`}>
                                    {formatBRL(patrimonyStats.currentValue)}
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-mono font-bold tabular-nums border shadow-sm ${
                                      patrimonyStats.isPositive
                                        ? "bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30 shadow-none"
                                        : "bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30 shadow-none"
                                    }`}
                                    title="Variação líquida de patrimônio acumulado no período filtrado"
                                  >
                                    {patrimonyStats.isPositive ? (
                                      <ArrowUpRight className="w-3.5 h-3.5 text-[#30D158]" />
                                    ) : (
                                      <ArrowDownRight className="w-3.5 h-3.5 text-[#FF453A]" />
                                    )}
                                    <span>
                                      {patrimonyStats.isPositive ? "+" : ""}
                                      {formatBRL(patrimonyStats.diffAmount)} ({patrimonyStats.diffPercent >= 0 ? "+" : ""}
                                      {patrimonyStats.diffPercent.toFixed(1).replace(".", ",")}%)
                                    </span>
                                  </span>
                                </div>
                              </div>

                              {/* Controles: Seletor de Período & Toggles Clicáveis de Legenda */}
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Seletor de Período */}
                                <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-white/10 text-xs">
                                  {(["6M", "1A", "ALL"] as const).map((range) => (
                                    <button
                                      key={range}
                                      type="button"
                                      onClick={() => setPatrimonyTimeRange(range)}
                                      className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all ${
                                        patrimonyTimeRange === range
                                          ? "bg-[#0A84FF] text-white shadow-sm font-semibold"
                                          : "text-slate-400 hover:text-white hover:bg-white/5"
                                      }`}
                                    >
                                      {range === "ALL" ? "Tudo" : range}
                                    </button>
                                  ))}
                                </div>

                                {/* Pílula 1: Patrimônio Acumulado (Fixa em Destaque) */}
                                <div
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-white/10 text-slate-200 text-[11px] font-semibold shadow-xs"
                                  title="Série principal do patrimônio guardado"
                                >
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                                    style={{
                                      backgroundColor: primaryColor,
                                      boxShadow: `0 0 8px ${primaryColor}`
                                    }}
                                  />
                                  <span>Patrimônio Acumulado</span>
                                </div>

                                {/* Pílula 2: Toggle Clicável de Aportes Brutos */}
                                <button
                                  type="button"
                                  onClick={() => setShowPatrimonyAportesCurve((prev) => !prev)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer border ${
                                    showPatrimonyAportesCurve
                                      ? "bg-[#5E5CE6]/20 text-[#A5B4FC] border-[#5E5CE6]/50 shadow-sm"
                                      : "bg-slate-900/60 text-slate-400 border-white/5 opacity-70 hover:opacity-100"
                                  }`}
                                  title="Clique para ligar ou desligar a curva suave de Aportes Brutos"
                                >
                                  <span
                                    className={`w-2.5 h-2.5 rounded-full shrink-0 transition ${
                                      showPatrimonyAportesCurve
                                        ? "bg-[#5E5CE6] shadow-[0_0_8px_#5E5CE6]"
                                        : "bg-slate-600"
                                    }`}
                                  />
                                  <span>
                                    Aportes Brutos {showPatrimonyAportesCurve ? "" : "(oculto)"}
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* Gráfico Estilo Copilot Money com Eixo Único e Sem Torres/Barras */}
                            <div className={`${chartHeightClass} select-none transition-all duration-300`}>
                              <ResponsiveContainer width="100%" height="100%">
                                {effectiveChartType === "line" ? (
                                  <LineChart
                                    data={processedPatrimonyData}
                                    accessibilityLayer={false}
                                    margin={{ top: 12, right: 12, left: 4, bottom: 0 }}
                                  >
                                    {cfg.showGrid && (
                                      <CartesianGrid
                                        vertical={false}
                                        strokeDasharray="3 3"
                                        stroke="rgba(148, 163, 184, 0.12)"
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
                                      width={60}
                                      domain={[0, "auto"]}
                                      axisLine={false}
                                      tickLine={false}
                                      tickFormatter={(v) => {
                                        const num = Number(v) || 0;
                                        if (num <= 0) return "R$ 0";
                                        if (num >= 1000) {
                                          const k = num / 1000;
                                          return `R$ ${k % 1 === 0 ? k : k.toFixed(1).replace(".", ",")}k`;
                                        }
                                        return `R$ ${num}`;
                                      }}
                                    />
                                    <Tooltip content={<PatrimonyCyberTooltip moneyBlur={moneyBlur} />} cursor={false} />
                                    {milestones.map((m) => (
                                      <ReferenceLine key={m.id} y={m.value} stroke={m.color} strokeDasharray="3 3" />
                                    ))}
                                    <Line
                                      type={cfg.curveType || "monotone"}
                                      dataKey="acumulado"
                                      name="Patrimônio Acumulado"
                                      stroke={primaryColor}
                                      strokeWidth={cfg.strokeWidth || 2.5}
                                      dot={cfg.showDots ? { r: 3.5, fill: primaryColor, stroke: "#07030f", strokeWidth: 1.5 } : false}
                                      activeDot={{ r: 5, strokeWidth: 2, stroke: primaryColor, fill: "#0d061c" }}
                                      connectNulls={true}
                                    />
                                    {showPatrimonyAportesCurve && (
                                      <Line
                                        type={cfg.curveType || "monotone"}
                                        dataKey="aportado"
                                        name="Aportes Brutos"
                                        stroke="#5E5CE6"
                                        strokeWidth={Math.max(1.5, (cfg.strokeWidth || 2.5) - 0.5)}
                                        strokeDasharray="4 4"
                                        dot={cfg.showDots ? { r: 3, fill: "#5E5CE6", stroke: "#07030f", strokeWidth: 1.5 } : false}
                                        activeDot={{ r: 4, stroke: "#5E5CE6", fill: "#0d061c" }}
                                        connectNulls={true}
                                      />
                                    )}
                                  </LineChart>
                                ) : effectiveChartType === "bar" ? (
                                  <BarChart
                                    data={processedPatrimonyData}
                                    accessibilityLayer={false}
                                    margin={{ top: 12, right: 12, left: 4, bottom: 0 }}
                                  >
                                    {cfg.showGrid && (
                                      <CartesianGrid
                                        vertical={false}
                                        strokeDasharray="3 3"
                                        stroke="rgba(148, 163, 184, 0.12)"
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
                                      width={60}
                                      domain={[0, "auto"]}
                                      axisLine={false}
                                      tickLine={false}
                                      tickFormatter={(v) => {
                                        const num = Number(v) || 0;
                                        if (num <= 0) return "R$ 0";
                                        if (num >= 1000) {
                                          const k = num / 1000;
                                          return `R$ ${k % 1 === 0 ? k : k.toFixed(1).replace(".", ",")}k`;
                                        }
                                        return `R$ ${num}`;
                                      }}
                                    />
                                    <Tooltip content={<PatrimonyCyberTooltip moneyBlur={moneyBlur} />} cursor={false} />
                                    {milestones.map((m) => (
                                      <ReferenceLine key={m.id} y={m.value} stroke={m.color} strokeDasharray="3 3" />
                                    ))}
                                    <Bar
                                      dataKey="acumulado"
                                      name="Patrimônio Acumulado"
                                      fill={primaryColor}
                                      radius={[4, 4, 0, 0]}
                                      maxBarSize={36}
                                    />
                                    {showPatrimonyAportesCurve && (
                                      <Bar
                                        dataKey="aportado"
                                        name="Aportes Brutos"
                                        fill="#5E5CE6"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={28}
                                      />
                                    )}
                                  </BarChart>
                                ) : (
                                  /* Modo Padrão: AreaChart Estilo Copilot Money com Gradiente Translúcido */
                                  <AreaChart
                                    data={processedPatrimonyData}
                                    accessibilityLayer={false}
                                    margin={{ top: 12, right: 12, left: 4, bottom: 0 }}
                                  >
                                    <defs>
                                      <linearGradient id={`gradPatrimony_${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={primaryColor} stopOpacity={cfg.fillArea !== false ? 0.28 : 0} />
                                        <stop offset="100%" stopColor={primaryColor} stopOpacity={0.00} />
                                      </linearGradient>
                                      <linearGradient id={`gradAporte_${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#5E5CE6" stopOpacity={cfg.fillArea !== false ? 0.18 : 0} />
                                        <stop offset="100%" stopColor="#5E5CE6" stopOpacity={0.00} />
                                      </linearGradient>
                                    </defs>

                                    {cfg.showGrid && (
                                      <CartesianGrid
                                        vertical={false}
                                        strokeDasharray="3 3"
                                        stroke="rgba(148, 163, 184, 0.12)"
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
                                    {/* Eixo Esquerdo Único: Patrimônio Formatado */}
                                    <YAxis
                                      stroke="#64748b"
                                      fontSize={11}
                                      width={60}
                                      domain={[0, "auto"]}
                                      axisLine={false}
                                      tickLine={false}
                                      tickFormatter={(v) => {
                                        const num = Number(v) || 0;
                                        if (num <= 0) return "R$ 0";
                                        if (num >= 1000) {
                                          const k = num / 1000;
                                          return `R$ ${k % 1 === 0 ? k : k.toFixed(1).replace(".", ",")}k`;
                                        }
                                        return `R$ ${num}`;
                                      }}
                                    />
                                    <Tooltip content={<PatrimonyCyberTooltip moneyBlur={moneyBlur} />} cursor={false} />
                                    {milestones.map((m) => (
                                      <ReferenceLine key={m.id} y={m.value} stroke={m.color} strokeDasharray="3 3" />
                                    ))}
                                    <Area
                                      type={cfg.curveType || "monotone"}
                                      dataKey="acumulado"
                                      name="Patrimônio Acumulado"
                                      stroke={primaryColor}
                                      strokeWidth={cfg.strokeWidth || 2.5}
                                      dot={cfg.showDots ? { r: 3.5, fill: primaryColor, stroke: "#07030f", strokeWidth: 1.5 } : false}
                                      activeDot={{ r: 5, strokeWidth: 2, stroke: primaryColor, fill: "#0d061c" }}
                                      fill={cfg.fillArea !== false ? `url(#gradPatrimony_${widget.id})` : "none"}
                                      fillOpacity={1}
                                      connectNulls={true}
                                    />
                                    {showPatrimonyAportesCurve && (
                                      <Area
                                        type={cfg.curveType || "monotone"}
                                        dataKey="aportado"
                                        name="Aportes Brutos"
                                        stroke="#5E5CE6"
                                        strokeWidth={Math.max(1.5, (cfg.strokeWidth || 2.5) - 0.5)}
                                        dot={cfg.showDots ? { r: 3, fill: "#5E5CE6", stroke: "#07030f", strokeWidth: 1.5 } : false}
                                        activeDot={{ r: 4, stroke: "#5E5CE6", fill: "#0d061c" }}
                                        fill={cfg.fillArea !== false ? `url(#gradAporte_${widget.id})` : "none"}
                                        fillOpacity={1}
                                        connectNulls={true}
                                      />
                                    )}
                                  </AreaChart>
                                )}
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        {widget.id === "category_chart" && (
                          <div className={`grid ${cfg.showLegend !== false ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-4 items-center`}>
                            {/* Donut Moderno com Rótulo Centralizado Total Gasto (Sprint 16) */}
                            <div className={`relative ${chartHeightClass} select-none flex items-center justify-center`}>
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
                                    label={
                                      cfg.showDataLabels
                                        ? ({ percent }: { percent?: number }) =>
                                            percent && percent > 0.05
                                              ? `${Math.round((percent || 0) * 100)}%`
                                              : ""
                                        : false
                                    }
                                    labelLine={false}
                                  >
                                    {categoryChartData.map((entry, idx) => (
                                      <Cell
                                        key={`cell-${idx}`}
                                        fill={entry.color}
                                      />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomCyberTooltip isCurrency={true} moneyBlur={moneyBlur} />} cursor={false} />
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
                            {cfg.showLegend !== false && (
                              <div className={`space-y-2 max-h-64 overflow-y-auto pr-1 text-xs`}>
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
                            )}
                          </div>
                        )}

                        {widget.id === "credit_chart" && (
                          <div className={`${chartHeightClass} select-none transition-all duration-300`}>
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
                            <div className={`${chartHeightClass} select-none transition-all duration-300`}>
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={bankLimitsAnalytics.chartData} barSize={26} accessibilityLayer={false}>
                                  {cfg.showGrid && (
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                                  )}
                                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => formatBRL(Number(v))} />
                                  <Tooltip content={<CustomCyberTooltip isCurrency={true} moneyBlur={moneyBlur} />} cursor={false} />
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
              handleSyncOfficialPatrimonioData={handleSyncOfficialPatrimonioData}
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
          <div className="w-full max-w-lg rounded-3xl bg-[#110724]/95 backdrop-blur-2xl border border-[#A855F7]/35 shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(255,42,133,0.15)] overflow-hidden text-xs">
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
                    handleOpenNewTxModal("Gasolina");
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
                    togglePrivacyMode();
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
                .filter((item) => normalizeSearchText(item.label).includes(normalizeSearchText(commandQuery)))
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
        onSaveAndNew={handleSaveAndNewTransaction}
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
          <div className="w-full max-w-lg rounded-3xl bg-[#110724]/95 backdrop-blur-2xl border border-[#A855F7]/35 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(255,42,133,0.15)] space-y-4 text-xs max-h-[80vh] overflow-y-auto">
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
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#110724]/95 backdrop-blur-2xl border border-[#FF2A85]/40 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(255,42,133,0.2)] space-y-4 text-xs">
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
        onSeedPatrimonio={handleSyncOfficialPatrimonioData}
      />

      {/* MODAL DE CONFIRMAÇÃO CUSTOMIZADO (Sprint 15 - Clara Vance) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#110724]/95 backdrop-blur-2xl border border-[#FF2A85]/40 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(255,42,133,0.2)] space-y-4 animate-in fade-in zoom-in-95">
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
                    : "bg-[#0A84FF] hover:bg-[#0070E0] text-white shadow-sm"
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