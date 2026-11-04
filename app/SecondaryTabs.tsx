"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Plus, CreditCard, Car, Table2, Search, CheckCircle2, Clock, Trash2,
  RefreshCw, Activity, Brain, Target, Flame, Pencil,
  Image as ImageIcon, Download, Upload, Camera, User, FileText, HandCoins,
  Users, Share2, Layers, AlertTriangle, XCircle, Eye, EyeOff, Filter, Loader2,
  ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, Check, X, RotateCcw,
  SlidersHorizontal, Settings, Fuel, Gauge, DollarSign, Award, Info, Landmark, PiggyBank,
  Sparkles, ExternalLink, ShoppingBag, Circle
} from "lucide-react";
import {
  ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, BarChart, Bar, LineChart, Line, ReferenceLine, Cell
} from "recharts";
import {
  ActiveTab, Transaction, CreditCardItem, BankItem, BankInstitution, StaticStatusItem, WishlistItem,
  BioLog, StravaStats, StravaActivity, BrainNote, PersonalOKR, CustomAlertRule, ChartThemeColors,
  CategoryCatalogItem, SystemLogEntry, ThemeMode, FlowType, APP_VERSION,
  formatBRL, sanitizeText, compressImageFileToBase64, renderCategorySemanticIcon,
  CustomCyberTooltip, ThemeSegmentedControl, buildWhatsAppChargeText,
  formatDateBR, todayBR, toSortableISO, getYearMonthKey, compareDatesBR, AutoInmetroConfig, DEFAULT_AUTO_INMETRO_CONFIG, DashboardWidgetConfig,
  parseInstallmentInfo, toCents, fromCents, safeAdd, safeSub,
  calculateCardExposure, calculateBankExposure, calculateStaticStatusSummary
} from "./lifeos-data";
import ChartCard from "./components/ChartCard";
import ChartSettingsPopover, {
  ChartKind,
  ChartLineCurve,
  ChartWidgetSettings,
  ChartWidgetSize,
  ChartHeightSetting,
  DEFAULT_CHART_WIDGET_SETTINGS
} from "./components/ChartSettingsPopover";
import { TransactionsTableAdvanced } from "./TransactionsTableAdvanced";
import { simulatePurchaseImpact } from "./lib/domain/purchase-simulator";
import { BanksTab } from "./components/BanksTab";
import { VehiclesTab } from "./components/VehiclesTab";

/**
 * Formata ritmo/pace esportivo exato em min:seg /km (AUD-15).
 */
export function formatPace(timeInSeconds: number, km: number): string {
  if (!km || km <= 0 || !timeInSeconds || timeInSeconds <= 0) return "—";
  const totalSecPerKm = Math.round(timeInSeconds / km);
  const mins = Math.floor(totalSecPerKm / 60);
  const secs = totalSecPerKm % 60;
  return `${mins}:${String(secs).padStart(2, "0")} /km`;
}

/**
 * Converte string de ritmo/pace ("5:42 /km" ou "5:42") em segundos totais por quilômetro.
 */
export function paceStringToSeconds(paceStr: string): number {
  if (!paceStr) return 0;
  const clean = paceStr.replace("/km", "").trim();
  const parts = clean.split(":");
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : Math.round(val * 60);
}

/**
 * Converte segundos por quilômetro em string formatada "M:SS /km".
 */
export function secondsToPaceString(totalSec: number): string {
  if (!totalSec || totalSec <= 0 || !isFinite(totalSec)) return "—";
  const mins = Math.floor(totalSec / 60);
  const secs = Math.round(totalSec % 60);
  return `${mins}:${String(secs).padStart(2, "0")} /km`;
}

/**
 * Helper de Altura Reativa dos Gráficos (175px / 220px / 290px).
 */
export function getChartHeightPx(h?: ChartHeightSetting, defaultPx = 220): number {
  if (h === "compact") return 175;
  if (h === "normal") return 220;
  if (h === "tall" || (h as string) === "expanded") return 290;
  return defaultPx;
}

export const toCleanStr = (v: unknown): string =>
  typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";


const DebtorInputCell = React.memo(function DebtorInputCell({
  txId,
  initialValue,
  onCommit
}: {
  txId: string;
  initialValue: string;
  onCommit: (id: string, val: string) => void;
}) {
  const [localVal, setLocalVal] = useState(initialValue);
  useEffect(() => {
    setLocalVal(initialValue);
  }, [initialValue]);

  return (
    <div className="flex items-center gap-1.5 max-w-[195px]">
      <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <input
        type="text"
        placeholder="Atribuir pessoa..."
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={() => {
          if (localVal.trim() !== initialValue.trim()) {
            onCommit(txId, localVal);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="w-full px-2 py-1 rounded-lg bg-slate-950/90 border border-amber-500/30 text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20 outline-none text-xs transition-all"
      />
    </div>
  );
});

export interface SecondaryTabsProps {
  activeTab: ActiveTab;
  moneyBlur: string;
  currentUser: string | null;
  currentUserAvatar: string;
  themeMode: ThemeMode;
  changeThemeMode: (m: ThemeMode) => void;
  setShowChangelogModal: (v: boolean) => void;
  staticStatus: StaticStatusItem[];
  editingStatusId: string | null;
  setEditingStatusId: (id: string | null) => void;
  newStatusItem: { title: string; type: StaticStatusItem["type"]; amount: string; notes: string };
  setNewStatusItem: (val: any) => void;
  handleSaveStaticStatus: (e: React.FormEvent) => void;
  saveStaticStatus: (items: StaticStatusItem[]) => void;
  selectedMonth?: string;
  handleLaunchFixedTransactions?: (targetMonth?: string) => Promise<{ createdCount: number; totalCount: number }>;
  filteredTransactions: Transaction[];
  transactions: Transaction[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleExportCSV: () => void;
  handleOpenNewTxModal: (defaultCategory?: string) => void;
  onAddTransaction?: (tx: Transaction) => Promise<void> | void;
  onBatchImportTransactions?: (txs: Transaction[]) => void;
  dailyQuotaInfo?: { dailyBudget: number; remainingDays: number; remainingFree: number };
  cdiAnnualRate?: number;
  getFlowType: (cat: string) => FlowType;
  banks: BankItem[];
  editingBankId: string | null;
  setEditingBankId: (id: string | null) => void;
  newBank: { name: string; logoUrl: string; limit?: string; limitType?: string };
  setNewBank: (val: any) => void;
  handleSaveBank: (e: React.FormEvent) => void;
  handleDeleteBank: (id: string) => void;
  cards: CreditCardItem[];
  categoryColors: Record<string, string>;
  handleToggleStatus: (tx: Transaction) => void;
  handleStartEditTransaction: (tx: Transaction) => void;
  handleDeleteTransaction: (id: string) => void;
  receivableItems: (Transaction & { debtorName: string; effectivePaid: number; remaining: number })[];
  receivablesAnalytics: {
    totalOpen: number;
    totalPaid: number;
    totalLoaned: number;
    openByPerson: { person: string; aberto: number; pago: number; totalEmprestado: number }[];
    historyByPerson: { person: string; aberto: number; pago: number; totalEmprestado: number }[];
  };
  handleAssignDebtor: (txId: string, debtorName: string) => void;
  handlePartialPaymentReceivable: (tx: Transaction, addAmount: number, destBank?: string) => void;
  notify: (title: string, subtitle?: string, type?: "success" | "warning" | "info" | "error", cat?: any, onUndo?: () => void, undoLabel?: string) => void;
  editingCardId: string | null;
  setEditingCardId: (id: string | null) => void;
  newCard: { name: string; brand: string; limit: string; closingDay: string; dueDay: string; logoUrl: string; bankId: string };
  setNewCard: React.Dispatch<React.SetStateAction<{ name: string; brand: string; limit: string; closingDay: string; dueDay: string; logoUrl: string; bankId: string }>>;
  handleSaveCard: (e: React.FormEvent) => void;
  handleDeleteCard: (id: string) => void;
  handlePayCardInvoice: (cardName: string, originBankName?: string) => void;
  wishlist: WishlistItem[];
  editingWishId: string | null;
  setEditingWishId: (id: string | null) => void;
  newWish: { title: string; institution: string; targetAmount: string; savedAmount: string; priority: WishlistItem["priority"] };
  setNewWish: (val: any) => void;
  handleSaveWish: (e: React.FormEvent) => void;
  handleIncrementWish: (w: WishlistItem, inc: number) => void;
  handleDeleteWish: (id: string) => void;
  personalBudgetLimit: number;
  autoMetrics: any;
  chartTheme: ChartThemeColors;
  updateChartThemeColor: (k: keyof ChartThemeColors, c: string) => void;
  stravaStats: StravaStats;
  stravaActivities?: StravaActivity[];
  stravaScopeMode?: "detailed" | "read_only" | null;
  stravaOauthUrl?: string;
  isSyncingStrava: boolean;
  syncStravaFromApi: () => void;
  bioLogs: BioLog[];
  editingBioId: string | null;
  setEditingBioId: (id: string | null) => void;
  newBio: { date: string; weight: string; bf: string };
  setNewBio: (val: any) => void;
  handleSaveBioLog: (e: React.FormEvent) => void;
  handleDeleteBioLog: (id: string) => void;
  okrs: PersonalOKR[];
  saveOkrs: (items: PersonalOKR[]) => void;
  newOkr: { title: string; category: string; current: string; target: string; unit: string };
  setNewOkr: (val: any) => void;
  handleAddOkr: (e: React.FormEvent) => void;
  notes: BrainNote[];
  selectedNoteTag: string;
  setSelectedNoteTag: (t: string) => void;
  editingNoteId: string | null;
  setEditingNoteId: (id: string | null) => void;
  newNote: any;
  setNewNote: (val: any) => void;
  handleSaveNote: (e: React.FormEvent) => void;
  handleDeleteNote: (id: string) => void;
  handleToggleNoteCompleted?: (id: string) => void;
  handleExportFullBackupJSON: () => void;
  handleImportFullBackupJSON: (f: File) => void;
  handleUpdateProfileAvatar: (f: File) => void;
  sheetApiUrl: string;
  setSheetApiUrl: (u: string) => void;
  isSyncing: boolean;
  syncFromGoogleSheets: () => void;
  handleSyncOfficialPatrimonioData?: () => void;
  sheetsSyncStatus?: { state: "idle" | "success" | "error"; message: string; timestamp?: string };
  setSheetsSyncStatus?: (st: { state: "idle" | "success" | "error"; message: string; timestamp?: string }) => void;
  stravaConfig: { athleteId: string; clientId: string; clientSecret: string; refreshToken: string };
  setStravaConfig: (cfg: any) => void;
  stravaSyncStatus?: { state: "idle" | "success" | "error"; message: string; timestamp?: string };
  setStravaSyncStatus?: (st: { state: "idle" | "success" | "error"; message: string; timestamp?: string }) => void;
  paymentMethods: string[];
  newMethodName: string;
  setNewMethodName: (v: string) => void;
  handleAddPaymentMethod: (e: React.FormEvent) => void;
  handleDeletePaymentMethod: (m: string) => void;
  handleUpdatePaymentMethod?: (oldName: string, newName: string) => void;
  categoriesCatalog: CategoryCatalogItem[];
  newCategoryForm: { name: string; flow: FlowType; isAuto: boolean; color: string };
  setNewCategoryForm: (v: any) => void;
  handleAddCustomCategory: (e: React.FormEvent) => void;
  handleDeleteCategory: (n: string) => void;
  handleUpdateCategory?: (oldName: string, updatedCat: CategoryCatalogItem, newColor: string) => void;
  autoInmetroConfig?: AutoInmetroConfig;
  setAutoInmetroConfig?: (cfg: AutoInmetroConfig) => void;
  autoLayout?: DashboardWidgetConfig[];
  setAutoLayout?: (l: DashboardWidgetConfig[]) => void;
  getAutoWidgetSettings?: (widgetId: string, defaultColor?: string, fallbackCurve?: any) => ChartWidgetSettings;
  handleUpdateAutoWidgetSettings?: (widgetId: string, next: ChartWidgetSettings) => void;
  handleUpdateAutoWidgetSize?: (widgetId: string, nextSize: ChartWidgetSize) => void;
  handleDragStartAutoWidget?: (id: string) => void;
  handleDragEnterAutoWidget?: (id: string) => void;
  handleDragEndAutoWidget?: () => void;
  draggingAutoWidgetId?: string | null;
  dragOverAutoWidgetId?: string | null;
  monthlyInvestmentGoal: number;
  patrimonyTarget: number;
  annualRunGoalKm: number;
  setPersonalBudgetLimit: (v: number) => void;
  setMonthlyInvestmentGoal: (v: number) => void;
  setPatrimonyTarget: (v: number) => void;
  setAnnualRunGoalKm: (v: number) => void;
  updateGoalsStorage: (b: number, i: number, p: number, r: number) => void;
  alertRules: CustomAlertRule[];
  saveAlertRules: (r: CustomAlertRule[]) => void;
  newAlert: { title: string; type: CustomAlertRule["type"]; targetValue: string; warningLead: string };
  setNewAlert: (v: any) => void;
  handleAddAlertRule: (e: React.FormEvent) => void;
  systemLogs: SystemLogEntry[];
  setSystemLogs: (l: SystemLogEntry[]) => void;
  logFilter: string;
  setLogFilter: (f: string) => void;
}

export default function SecondaryTabs(props: SecondaryTabsProps) {
  const {
    activeTab, moneyBlur, currentUser, currentUserAvatar, themeMode, changeThemeMode,
    setShowChangelogModal, staticStatus, editingStatusId, setEditingStatusId, newStatusItem,
    setNewStatusItem, handleSaveStaticStatus, saveStaticStatus, filteredTransactions, transactions,
    searchQuery, setSearchQuery, handleExportCSV, handleOpenNewTxModal, onAddTransaction, onBatchImportTransactions, dailyQuotaInfo, cdiAnnualRate, getFlowType,
    banks, editingBankId, setEditingBankId, newBank, setNewBank, handleSaveBank, handleDeleteBank,
    cards, categoryColors, handleToggleStatus, handleStartEditTransaction, handleDeleteTransaction,
    receivableItems, receivablesAnalytics, handleAssignDebtor, handlePartialPaymentReceivable,
    notify, editingCardId, setEditingCardId, newCard, setNewCard, handleSaveCard, handleDeleteCard,
    handlePayCardInvoice, wishlist, editingWishId, setEditingWishId, newWish, setNewWish,
    handleSaveWish, handleIncrementWish, handleDeleteWish, personalBudgetLimit, autoMetrics,
    chartTheme, updateChartThemeColor, stravaStats, stravaActivities = [], stravaScopeMode, stravaOauthUrl, isSyncingStrava, syncStravaFromApi,
    bioLogs, editingBioId, setEditingBioId, newBio, setNewBio, handleSaveBioLog, handleDeleteBioLog,
    okrs, saveOkrs, newOkr, setNewOkr, handleAddOkr, notes, selectedNoteTag, setSelectedNoteTag,
    editingNoteId, setEditingNoteId, newNote, setNewNote, handleSaveNote, handleDeleteNote, handleToggleNoteCompleted,
    handleExportFullBackupJSON, handleImportFullBackupJSON, handleUpdateProfileAvatar,
    sheetApiUrl, setSheetApiUrl, isSyncing, syncFromGoogleSheets, handleSyncOfficialPatrimonioData,
    sheetsSyncStatus, setSheetsSyncStatus, stravaConfig, setStravaConfig, stravaSyncStatus, setStravaSyncStatus,
    paymentMethods, newMethodName, setNewMethodName, handleAddPaymentMethod, handleDeletePaymentMethod,
    handleUpdatePaymentMethod, categoriesCatalog, newCategoryForm, setNewCategoryForm, handleAddCustomCategory, handleDeleteCategory,
    handleUpdateCategory, autoInmetroConfig, setAutoInmetroConfig, autoLayout, setAutoLayout,
    getAutoWidgetSettings, handleUpdateAutoWidgetSettings, handleUpdateAutoWidgetSize,
    handleDragStartAutoWidget, handleDragEnterAutoWidget, handleDragEndAutoWidget,
    draggingAutoWidgetId, dragOverAutoWidgetId,
    monthlyInvestmentGoal, patrimonyTarget, annualRunGoalKm, setPersonalBudgetLimit,
    setMonthlyInvestmentGoal, setPatrimonyTarget, setAnnualRunGoalKm, updateGoalsStorage,
    alertRules, saveAlertRules, newAlert, setNewAlert, handleAddAlertRule, systemLogs,
    setSystemLogs, logFilter, setLogFilter
  } = props;

  const [partialInputs, setPartialInputs] = useState<Record<string, string>>({});
  const [partialBank, setPartialBank] = useState<Record<string, string>>({});
  const [noteSearch, setNoteSearch] = useState("");
  const [muralFilter, setMuralFilter] = useState<"ALL" | "NOTES" | "WISHES">("ALL");
  const [logSearch, setLogSearch] = useState("");
  const [showStravaSecrets, setShowStravaSecrets] = useState(false);
  const [isLaunchingFixed, setIsLaunchingFixed] = useState(false);

  // SPRINT 37: Estados do Simulador "Posso Comprar?" (Ícaro Vasconcelos)
  const [simulatedPrice, setSimulatedPrice] = useState<string>("350");
  const [simulatedInstallments, setSimulatedInstallments] = useState<number>(1);
  const [selectedSimulatedWishId, setSelectedSimulatedWishId] = useState<string | null>(null);

  // Estados de Edição de Métodos de Pagamento e Categorias (Requisito 4)
  const [editingMethodName, setEditingMethodName] = useState<string | null>(null);
  const [editMethodInput, setEditMethodInput] = useState("");
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [editCategoryForm, setEditCategoryForm] = useState({
    name: "",
    flow: "EXPENSE" as FlowType,
    isAuto: false,
    color: "#6366f1"
  });

  // SPRINT 38: Estados de Filtros e Ordenação da Tabela de Valores a Receber (Passo 2)
  const [receivableSearch, setReceivableSearch] = useState("");
  const [receivableDebtorFilter, setReceivableDebtorFilter] = useState("ALL");
  const [receivableStatusFilter, setReceivableStatusFilter] = useState<"all" | "pending" | "partial" | "paid">("all");
  const [receivableSortCol, setReceivableSortCol] = useState<"date" | "debtor" | "description" | "amount" | "status">("date");
  const [receivableSortDir, setReceivableSortDir] = useState<"asc" | "desc">("desc");

  // SPRINT 38: Estados da Central Analítica de Bioimpedância (Passo 3)
  const [bioPeriodFilter, setBioPeriodFilter] = useState<"1M" | "3M" | "6M" | "1A" | "Tudo">("6M");
  const [bioSeriesMode, setBioSeriesMode] = useState<"all" | "weight" | "bf" | "target">("all");
  const [bioSettingsOpen, setBioSettingsOpen] = useState(false);
  const bioGearRef = useRef<HTMLButtonElement | null>(null);
  const [bioSettings, setBioSettings] = useState<ChartWidgetSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("fincontrol_chart_settings_bio_weight_chart");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {
      ...DEFAULT_CHART_WIDGET_SETTINGS,
      color: "#30D158",
      chartType: "area",
      height: "normal"
    };
  });
  const handleUpdateBioSettings = (next: ChartWidgetSettings) => {
    setBioSettings(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("fincontrol_chart_settings_bio_weight_chart", JSON.stringify(next));
      } catch {}
    }
  };

  // SPRINT 38: Estados da Central Analítica de Corridas & Pace — Strava Progress (Passo 4)
  const [stravaTimeScale, setStravaTimeScale] = useState<"Dia" | "Semana" | "Mês" | "Ano">("Semana");
  const [stravaMetric, setStravaMetric] = useState<"distance" | "pace" | "time" | "calories">("distance");
  const [stravaSettingsOpen, setStravaSettingsOpen] = useState(false);
  const stravaGearRef = useRef<HTMLButtonElement | null>(null);
  const [stravaChartSettings, setStravaChartSettings] = useState<ChartWidgetSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("fincontrol_chart_settings_strava_runs_chart");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {
      ...DEFAULT_CHART_WIDGET_SETTINGS,
      color: "#FF9F0A",
      chartType: "bar",
      height: "normal"
    };
  });
  const handleUpdateStravaChartSettings = (next: ChartWidgetSettings) => {
    setStravaChartSettings(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("fincontrol_chart_settings_strava_runs_chart", JSON.stringify(next));
      } catch {}
    }
  };

  // Lista de Devedores Únicos para Filtro
  const uniqueDebtors = useMemo(() => {
    const set = new Set<string>();
    receivableItems.forEach((item) => {
      const name = item.debtorName?.trim();
      if (name) set.add(name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [receivableItems]);

  // Lançamentos a Receber Filtrados e Ordenados
  const processedReceivables = useMemo(() => {
    return receivableItems
      .filter((item) => {
        // Busca textual
        if (receivableSearch.trim()) {
          const q = receivableSearch.toLowerCase().trim();
          const matchesDesc = (item.description || "").toLowerCase().includes(q);
          const matchesDebtor = (item.debtorName || "").toLowerCase().includes(q);
          if (!matchesDesc && !matchesDebtor) return false;
        }
        // Filtro por devedor
        if (receivableDebtorFilter !== "ALL") {
          const itemDebtor = item.debtorName?.trim() || "";
          if (itemDebtor !== receivableDebtorFilter) return false;
        }
        // Filtro por situação
        const isPaid = item.status === "Pago" || item.remaining <= 0;
        const isPartial = !isPaid && item.effectivePaid > 0 && item.remaining > 0;
        const isPending = !isPaid && item.effectivePaid === 0;

        if (receivableStatusFilter === "pending" && !isPending) return false;
        if (receivableStatusFilter === "partial" && !isPartial) return false;
        if (receivableStatusFilter === "paid" && !isPaid) return false;

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (receivableSortCol === "date") {
          cmp = compareDatesBR(a.date, b.date);
        } else if (receivableSortCol === "debtor") {
          cmp = (a.debtorName || "").localeCompare(b.debtorName || "");
        } else if (receivableSortCol === "description") {
          cmp = (a.description || "").localeCompare(b.description || "");
        } else if (receivableSortCol === "amount") {
          cmp = a.amount - b.amount;
        } else if (receivableSortCol === "status") {
          cmp = (a.status || "").localeCompare(b.status || "");
        }
        return receivableSortDir === "asc" ? cmp : -cmp;
      });
  }, [receivableItems, receivableSearch, receivableDebtorFilter, receivableStatusFilter, receivableSortCol, receivableSortDir]);

  const handleToggleReceivableSort = (col: "date" | "debtor" | "description" | "amount" | "status") => {
    if (receivableSortCol === col) {
      setReceivableSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setReceivableSortCol(col);
      setReceivableSortDir("asc");
    }
  };

  const renderSortIcon = (col: "date" | "debtor" | "description" | "amount" | "status") => {
    if (receivableSortCol !== col) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 inline ml-1 opacity-40 group-hover:opacity-100 transition-opacity" />;
    }
    return receivableSortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-amber-400 inline ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-amber-400 inline ml-1" />
    );
  };

  // Filtro de bioimpedância por período
  const filteredBioLogs = useMemo(() => {
    const sorted = [...bioLogs].sort((a, b) => compareDatesBR(a.date, b.date));
    if (bioPeriodFilter === "Tudo" || sorted.length === 0) return sorted;

    const days =
      bioPeriodFilter === "1M" ? 30 :
      bioPeriodFilter === "3M" ? 90 :
      bioPeriodFilter === "6M" ? 180 : 365;
    const now = new Date();
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const filtered = sorted.filter((l) => {
      const iso = toSortableISO(l.date);
      if (!iso) return true;
      const d = new Date(iso + "T12:00:00");
      return !isNaN(d.getTime()) && d >= cutoff;
    });

    return filtered.length > 0 ? filtered : sorted;
  }, [bioLogs, bioPeriodFilter]);

  // Telemetria executiva de bioimpedância
  const bioTelemetry = useMemo(() => {
    if (filteredBioLogs.length === 0) {
      return {
        currentWeight: 0,
        initialWeight: 0,
        deltaWeight: 0,
        deltaPct: 0,
        currentBf: null as number | null,
        minWeight: 0,
        avgWeight: 0,
        leanMass: null as number | null
      };
    }
    const initialLog = filteredBioLogs[0];
    const currentLog = filteredBioLogs[filteredBioLogs.length - 1];
    const initialWeight = Number(initialLog.weight) || 0;
    const currentWeight = Number(currentLog.weight) || 0;
    const deltaWeight = currentWeight - initialWeight;
    const deltaPct = initialWeight > 0 ? (deltaWeight / initialWeight) * 100 : 0;
    const currentBf = currentLog.bf != null ? Number(currentLog.bf) : null;

    const weights = filteredBioLogs.map((l) => Number(l.weight) || 0).filter((w) => w > 0);
    const minWeight = weights.length > 0 ? Math.min(...weights) : currentWeight;
    const avgWeight = weights.length > 0 ? weights.reduce((acc, w) => acc + w, 0) / weights.length : currentWeight;
    const leanMass = currentBf != null && currentWeight > 0 ? currentWeight * (1 - currentBf / 100) : null;

    return {
      currentWeight,
      initialWeight,
      deltaWeight,
      deltaPct,
      currentBf,
      minWeight,
      avgWeight,
      leanMass
    };
  }, [filteredBioLogs]);

  // Agregação temporal dos treinos Strava
  const aggregatedStravaData = useMemo(() => {
    if (!stravaActivities || stravaActivities.length === 0) return [];

    const sorted = [...stravaActivities].sort((a, b) => compareDatesBR(a.date, b.date));

    if (stravaTimeScale === "Dia") {
      return sorted.map((act, i) => {
        const paceSec = paceStringToSeconds(act.pace);
        return {
          key: act.id || `${act.date}_${i}`,
          label: formatDateBR(act.date),
          date: act.date,
          name: act.name,
          distance: Number(act.distanceKm) || 0,
          time: Number(act.movingTimeMin) || 0,
          paceSec,
          paceStr: act.pace || secondsToPaceString(paceSec),
          elevation: Number(act.elevationGain) || 0,
          calories: Number(act.calories) || 0
        };
      });
    }

    if (stravaTimeScale === "Semana") {
      const map = new Map<string, {
        key: string;
        label: string;
        date: string;
        runs: StravaActivity[];
      }>();

      sorted.forEach((act) => {
        const iso = toSortableISO(act.date);
        const d = iso ? new Date(iso + "T12:00:00") : new Date();
        const startOfYear = new Date(d.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
        const weekKey = `${d.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
        const label = `Sem ${weekNumber}/${String(d.getFullYear()).slice(-2)}`;

        if (!map.has(weekKey)) {
          map.set(weekKey, { key: weekKey, label, date: act.date, runs: [] });
        }
        map.get(weekKey)!.runs.push(act);
      });

      return Array.from(map.values()).map((group) => {
        const totalKm = group.runs.reduce((acc, r) => acc + (Number(r.distanceKm) || 0), 0);
        const totalTimeMin = group.runs.reduce((acc, r) => acc + (Number(r.movingTimeMin) || 0), 0);
        const totalCalories = group.runs.reduce((acc, r) => acc + (Number(r.calories) || 0), 0);
        const totalElevation = group.runs.reduce((acc, r) => acc + (Number(r.elevationGain) || 0), 0);
        const totalSec = totalTimeMin * 60;
        const paceSec = totalKm > 0 ? Math.round(totalSec / totalKm) : 0;
        const count = group.runs.length;

        return {
          key: group.key,
          label: group.label,
          date: group.date,
          name: `${count} ${count === 1 ? "corrida" : "corridas"} na semana`,
          distance: Math.round(totalKm * 100) / 100,
          time: Math.round(totalTimeMin),
          paceSec,
          paceStr: secondsToPaceString(paceSec),
          elevation: totalElevation,
          calories: totalCalories
        };
      });
    }

    if (stravaTimeScale === "Mês") {
      const map = new Map<string, {
        key: string;
        label: string;
        date: string;
        runs: StravaActivity[];
      }>();

      sorted.forEach((act) => {
        const ym = getYearMonthKey(act.date);
        if (!map.has(ym)) {
          map.set(ym, { key: ym, label: ym, date: act.date, runs: [] });
        }
        map.get(ym)!.runs.push(act);
      });

      return Array.from(map.values()).map((group) => {
        const totalKm = group.runs.reduce((acc, r) => acc + (Number(r.distanceKm) || 0), 0);
        const totalTimeMin = group.runs.reduce((acc, r) => acc + (Number(r.movingTimeMin) || 0), 0);
        const totalCalories = group.runs.reduce((acc, r) => acc + (Number(r.calories) || 0), 0);
        const totalElevation = group.runs.reduce((acc, r) => acc + (Number(r.elevationGain) || 0), 0);
        const totalSec = totalTimeMin * 60;
        const paceSec = totalKm > 0 ? Math.round(totalSec / totalKm) : 0;
        const count = group.runs.length;

        return {
          key: group.key,
          label: group.label,
          date: group.date,
          name: `${count} ${count === 1 ? "treino" : "treinos"} no mês`,
          distance: Math.round(totalKm * 100) / 100,
          time: Math.round(totalTimeMin),
          paceSec,
          paceStr: secondsToPaceString(paceSec),
          elevation: totalElevation,
          calories: totalCalories
        };
      });
    }

    // Escala: Ano
    const map = new Map<string, {
      key: string;
      label: string;
      date: string;
      runs: StravaActivity[];
    }>();

    sorted.forEach((act) => {
      const iso = toSortableISO(act.date);
      const yr = iso ? iso.slice(0, 4) : "2026";
      if (!map.has(yr)) {
        map.set(yr, { key: yr, label: yr, date: act.date, runs: [] });
      }
      map.get(yr)!.runs.push(act);
    });

    return Array.from(map.values()).map((group) => {
      const totalKm = group.runs.reduce((acc, r) => acc + (Number(r.distanceKm) || 0), 0);
      const totalTimeMin = group.runs.reduce((acc, r) => acc + (Number(r.movingTimeMin) || 0), 0);
      const totalCalories = group.runs.reduce((acc, r) => acc + (Number(r.calories) || 0), 0);
      const totalElevation = group.runs.reduce((acc, r) => acc + (Number(r.elevationGain) || 0), 0);
      const totalSec = totalTimeMin * 60;
      const paceSec = totalKm > 0 ? Math.round(totalSec / totalKm) : 0;
      const count = group.runs.length;

      return {
        key: group.key,
        label: group.label,
        date: group.date,
        name: `${count} ${count === 1 ? "treino" : "treinos"} em ${group.label}`,
        distance: Math.round(totalKm * 100) / 100,
        time: Math.round(totalTimeMin),
        paceSec,
        paceStr: secondsToPaceString(paceSec),
        elevation: totalElevation,
        calories: totalCalories
      };
    });
  }, [stravaActivities, stravaTimeScale]);

  // Telemetria executiva das corridas Strava
  const stravaTelemetry = useMemo(() => {
    const acts = stravaActivities || [];
    const totalKm = acts.reduce((acc, a) => acc + (Number(a.distanceKm) || 0), 0);
    const totalTimeMin = acts.reduce((acc, a) => acc + (Number(a.movingTimeMin) || 0), 0);
    const hours = Math.floor(totalTimeMin / 60);
    const mins = Math.round(totalTimeMin % 60);

    let bestPaceSec = Infinity;
    let bestPaceStr = "—";
    let maxKm = 0;

    acts.forEach((a) => {
      const km = Number(a.distanceKm) || 0;
      if (km > maxKm) maxKm = km;
      const sec = paceStringToSeconds(a.pace);
      if (sec > 0 && sec < bestPaceSec) {
        bestPaceSec = sec;
        bestPaceStr = a.pace || secondsToPaceString(sec);
      }
    });

    return {
      totalKm: Math.round(totalKm * 10) / 10,
      bestPaceStr: bestPaceSec < Infinity ? bestPaceStr : "—",
      maxKm: Math.round(maxKm * 10) / 10,
      timeFormatted: `${hours}h ${String(mins).padStart(2, "0")}m`
    };
  }, [stravaActivities]);

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all";

  // ============================================================================
  // ABA 1: MEU STATUS ATUAL
  // ============================================================================
  if (activeTab === "status") {
    const { rendaBase, custoFixoBase, aporteBase, margemLivre } = calculateStaticStatusSummary(staticStatus);

    const targetMonth =
      props.selectedMonth && props.selectedMonth !== "ALL"
        ? props.selectedMonth
        : getYearMonthKey(todayBR());

    const normalizeDesc = (str: string) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const txsInMonth = transactions.filter((t) => getYearMonthKey(t.date) === targetMonth);

    const checkIsLaunched = (title: string) => {
      const itemTitle = normalizeDesc(title);
      return txsInMonth.some((t) => {
        const tDesc = normalizeDesc(t.description);
        const descMatch =
          tDesc === itemTitle ||
          (itemTitle.length >= 4 && tDesc.includes(itemTitle)) ||
          (tDesc.length >= 4 && itemTitle.includes(tDesc));
        const keywordMatch =
          (itemTitle.includes("salario") && tDesc.includes("salario")) ||
          (itemTitle.includes("aporte") && tDesc.includes("aporte")) ||
          (itemTitle.includes("academia") && tDesc.includes("academia")) ||
          (itemTitle.includes("internet") && tDesc.includes("internet")) ||
          (itemTitle.includes("combustivel") && tDesc.includes("combustivel"));
        return descMatch || keywordMatch;
      });
    };

    const pendingFixedCount = staticStatus.filter((item) => !checkIsLaunched(item.title)).length;

    const handleLaunchFixedClick = async () => {
      if (props.handleLaunchFixedTransactions) {
        setIsLaunchingFixed(true);
        try {
          await props.handleLaunchFixedTransactions(targetMonth);
        } finally {
          setIsLaunchingFixed(false);
        }
      }
    };

    const [tY, tM] = targetMonth.split("-");
    const targetMonthDisplay = `${tM}/${tY}`;

    return (
      <div className="space-y-6">
        <div className="glass-card px-4 py-2.5 rounded-2xl border border-indigo-500/30 shadow-xl flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white tracking-tight">Meu Status Financeiro Atual</h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] sm:text-[11px] font-bold font-mono">
                {targetMonthDisplay}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Estrutura fixa de ganhos, benefícios, custos recorrentes e margem livre planejada para o mês.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLaunchFixedClick}
              disabled={isLaunchingFixed}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                pendingFixedCount > 0
                  ? "bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-amber-500/20 border border-amber-400/30 active:scale-95"
                  : "bg-slate-900/90 border border-emerald-500/30 text-emerald-300 hover:bg-slate-900 cursor-pointer"
              }`}
              title={
                pendingFixedCount > 0
                  ? `Lançar ${pendingFixedCount} itens fixos pendentes em ${targetMonthDisplay}`
                  : `Todos os itens fixos já foram lançados para ${targetMonthDisplay}`
              }
            >
              {isLaunchingFixed ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
              ) : pendingFixedCount > 0 ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              ) : (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>
                {pendingFixedCount > 0
                  ? `⚡ Lançar Fixos no Mês Atual (${pendingFixedCount} pendente${pendingFixedCount > 1 ? "s" : ""})`
                  : "✓ Fixos do Mês Já Lançados"}
              </span>
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 ${moneyBlur}`}>
          <div className="glass-card px-3.5 py-2.5 rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/30 to-slate-950/80 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5 block">Renda Mensal + Benefícios</span>
            <p className="text-lg sm:text-xl font-bold text-emerald-400 font-mono tabular-nums leading-tight">{formatBRL(rendaBase)}</p>
          </div>
          <div className="glass-card px-3.5 py-2.5 rounded-2xl border border-rose-500/25 bg-gradient-to-br from-rose-950/30 to-slate-950/80 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5 block">Total de Custos Fixos</span>
            <p className="text-lg sm:text-xl font-bold text-rose-400 font-mono tabular-nums leading-tight">{formatBRL(custoFixoBase)}</p>
          </div>
          <div className="glass-card px-3.5 py-2.5 rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/30 to-slate-950/80 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5 block">Investimento Planejado</span>
            <p className="text-lg sm:text-xl font-bold text-indigo-400 font-mono tabular-nums leading-tight">{formatBRL(aporteBase)}</p>
          </div>
          <div className="glass-card px-3.5 py-2.5 rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-950/30 to-slate-950/80 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5 block">Sobra Livre p/ Variáveis</span>
            <p className="text-lg sm:text-xl font-bold text-sky-400 font-mono tabular-nums leading-tight">{formatBRL(margemLivre)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/[0.08] overflow-x-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white mb-0.5">Minha Estrutura Mensal Fixa</h3>
                <p className="text-xs text-slate-400">Clique no lápis para editar valores ou use o botão no topo para lançar no mês.</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded-xl bg-slate-950 border border-white/10">
                {staticStatus.length} itens cadastrados
              </span>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-slate-400">
                  <th className="py-3 px-3">Descrição</th>
                  <th className="py-3 px-3">Classificação</th>
                  <th className="py-3 px-3">Status em {targetMonthDisplay}</th>
                  <th className="py-3 px-3">Observações</th>
                  <th className="py-3 px-3 text-right">Valor Mensal</th>
                  <th className="py-3 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {staticStatus.map((st) => {
                  const isLaunched = checkIsLaunched(st.title);
                  return (
                    <tr key={st.id} className={`transition-colors ${editingStatusId === st.id ? "bg-indigo-500/15" : "hover:bg-white/[0.03]"}`}>
                      <td className="py-3.5 px-3 font-semibold text-white">{st.title}</td>
                      <td className="py-3.5 px-3">
                        <span className={`whitespace-nowrap inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium leading-none ${
                          st.type === "Renda Base" || st.type === "Benefício"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : st.type === "Meta Aporte"
                            ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                            : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                        }`}>
                          {st.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {isLaunched ? (
                          <span className="whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium leading-none bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <Check className="w-3 h-3 text-emerald-400" /> Lançado
                          </span>
                        ) : (
                          <span className="whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium leading-none bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3 text-amber-400" /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">{st.notes ? st.notes : "—"}</td>
                      <td className={`py-3.5 px-3 text-right font-extrabold text-white tabular-nums ${moneyBlur}`}>{formatBRL(st.amount)}</td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStatusId(st.id);
                              setNewStatusItem({ title: st.title, type: st.type, amount: String(st.amount), notes: st.notes });
                            }}
                            className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/30 transition"
                            title="Editar item"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => saveStaticStatus(staticStatus.filter((i) => i.id !== st.id))}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 transition"
                            title="Excluir item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <form onSubmit={handleSaveStaticStatus} className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4 text-xs h-fit shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">{editingStatusId ? "Editar Item Selecionado" : "Adicionar Item Fixo"}</h3>
              {editingStatusId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingStatusId(null);
                    setNewStatusItem({ title: "", type: "Custo Fixo", amount: "", notes: "" });
                  }}
                  className="text-[11px] text-rose-400 hover:underline font-semibold"
                >
                  Cancelar
                </button>
              )}
            </div>
            <input type="text" required placeholder="Descrição (Ex: Salário, Internet...)" value={newStatusItem.title} onChange={(e) => setNewStatusItem({ ...newStatusItem, title: e.target.value })} className={inputClass} />
            <select value={newStatusItem.type} onChange={(e) => setNewStatusItem({ ...newStatusItem, type: e.target.value as StaticStatusItem["type"] })} className={inputClass}>
              <option value="Renda Base">Renda Base</option>
              <option value="Benefício">Benefício</option>
              <option value="Custo Fixo">Custo Fixo</option>
              <option value="Meta Aporte">Meta Aporte</option>
            </select>
            <input type="number" step="0.01" required placeholder="Valor Mensal (R$)" value={newStatusItem.amount} onChange={(e) => setNewStatusItem({ ...newStatusItem, amount: e.target.value })} className={inputClass} />
            <input type="text" placeholder="Observação (Ex: Dia 5)" value={newStatusItem.notes} onChange={(e) => setNewStatusItem({ ...newStatusItem, notes: e.target.value })} className={inputClass} />
            <button type="submit" className={`w-full py-3 rounded-xl text-white font-semibold shadow-sm transition-all cursor-pointer ${editingStatusId ? "bg-emerald-600 hover:bg-emerald-500" : "bg-[#0A84FF] hover:bg-[#0070E0]"}`}>
              {editingStatusId ? "✓ Salvar Alterações" : "+ Adicionar ao Meu Status"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ABA 2: LANÇAMENTOS (ORDENAÇÃO, FILTROS POR COLUNA E VIRTUALIZAÇÃO PROGRESSIVA)
  // ============================================================================
  if (activeTab === "transactions") {
    return (
      <TransactionsTableAdvanced
        filteredTransactions={filteredTransactions}
        cards={cards}
        categoryColors={categoryColors}
        moneyBlur={moneyBlur}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleExportCSV={handleExportCSV}
        handleOpenNewTxModal={handleOpenNewTxModal}
        onNewTransaction={handleOpenNewTxModal}
        onBatchImportTransactions={onBatchImportTransactions}
        handleToggleStatus={handleToggleStatus}
        handleStartEditTransaction={handleStartEditTransaction}
        handleDeleteTransaction={handleDeleteTransaction}
        getFlowType={getFlowType}
      />
    );
  }

  // ============================================================================
  // ABA 3: VALORES A RECEBER
  // ============================================================================
  if (activeTab === "receivables") {
    return (
      <div className="space-y-6">
        <div className="glass-card px-4 py-2.5 rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 shadow-xl mb-3">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2 tracking-tight">
              <HandCoins className="w-4 h-4 text-amber-400" /> Valores A Receber
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Todo lançamento com a categoria <strong>"A Receber"</strong> aparece aqui. Atribua o devedor, registre abatimentos parciais ou copie o resumo de cobrança para o WhatsApp.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenNewTxModal("A Receber")}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Valor a Receber
          </button>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 ${moneyBlur}`}>
          <div className="glass-card px-3.5 py-2.5 rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/30 to-slate-950/80 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5 block">Saldo Restante a Receber</span>
            <p className="text-lg sm:text-xl font-bold text-amber-400 font-mono tabular-nums leading-tight">{formatBRL(receivablesAnalytics.totalOpen)}</p>
            <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Descontando abatimentos parciais</span>
          </div>
          <div className="glass-card px-3.5 py-2.5 rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/30 to-slate-950/80 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5 block">Total Já Recebido / Abatido</span>
            <p className="text-lg sm:text-xl font-bold text-emerald-400 font-mono tabular-nums leading-tight">{formatBRL(receivablesAnalytics.totalPaid)}</p>
            <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Soma de quitações e pagamentos</span>
          </div>
          <div className="glass-card px-3.5 py-2.5 rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/30 to-slate-950/80 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5 block">Volume Total Emprestado</span>
            <p className="text-lg sm:text-xl font-bold text-indigo-400 font-mono tabular-nums leading-tight">{formatBRL(receivablesAnalytics.totalLoaned)}</p>
            <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{receivableItems.length} lançamentos vinculados</span>
          </div>
        </div>

        {receivablesAnalytics.openByPerson.filter((p) => p.aberto > 0).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {receivablesAnalytics.openByPerson
              .filter((p) => p.aberto > 0)
              .map((p) => {
                const paidPct = Math.min(100, Math.round((p.pago / Math.max(1, p.totalEmprestado)) * 100));
                return (
                  <div key={p.person} className="glass-card px-3.5 py-2.5 rounded-2xl border border-amber-500/25 space-y-2 shadow-md">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-white block">{p.person}</span>
                        <span className={`text-xs font-bold text-amber-400 font-mono tabular-nums ${moneyBlur}`}>Em aberto: {formatBRL(p.aberto)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const personTxs = receivableItems.filter((i) => (i.debtorName.trim() ? i.debtorName.trim() : "Não Atribuído") === p.person);
                          const text = buildWhatsAppChargeText(p.person, personTxs);
                          navigator.clipboard.writeText(text);
                          notify("Resumo Copiado p/ WhatsApp!", `Cole na conversa com ${p.person}.`, "success");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        <Share2 className="w-3 h-3" /> WhatsApp
                      </button>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${paidPct}%` }} />
                    </div>
                    <div className={`flex justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono tabular-nums ${moneyBlur}`}>
                      <span>Pago: {formatBRL(p.pago)} ({paidPct}%)</span>
                      <span>Total: {formatBRL(p.totalEmprestado)}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-white">Saldo Devedor Atual por Pessoa</h3>
              <p className="text-[11px] text-slate-400">Montante líquido em aberto que cada pessoa deve atualmente.</p>
            </div>
            <div className="h-64 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={receivablesAnalytics.openByPerson} barSize={34} accessibilityLayer={false}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                  <XAxis dataKey="person" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => formatBRL(Number(v))} />
                  <Tooltip content={<CustomCyberTooltip isCurrency={true} />} cursor={false} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="aberto" name="Saldo em Aberto (R$)" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-white">Histórico por Pessoa: Emprestado vs. Pago</h3>
              <p className="text-[11px] text-slate-400">Comparativo acumulado entre tudo o que foi emprestado e o que já foi restituído.</p>
            </div>
            <div className="h-64 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={receivablesAnalytics.historyByPerson} barSize={24} accessibilityLayer={false}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                  <XAxis dataKey="person" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => formatBRL(Number(v))} />
                  <Tooltip content={<CustomCyberTooltip isCurrency={true} />} cursor={false} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="totalEmprestado" name="Total Emprestado" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pago" name="Total Pago" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-white">Tabela de Atribuição de Devedores e Abatimento Parcial</h3>
              <p className="text-xs text-slate-400">
                Digite o nome da pessoa (salva ao sair do campo), abata valores parciais ou clique na situação para quitar 100%.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Mostrando <strong className="text-amber-400">{processedReceivables.length}</strong> de {receivableItems.length}
            </div>
          </div>

          {/* SPRINT 38: Barra de Ferramentas de Filtros e Ordenação Inteligente */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/40 border border-white/[0.08]">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              {/* Campo de Busca Rápida */}
              <div className="relative flex-1 min-w-[180px] max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por descrição ou devedor..."
                  value={receivableSearch}
                  onChange={(e) => setReceivableSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none transition"
                />
                {receivableSearch && (
                  <button
                    type="button"
                    onClick={() => setReceivableSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Dropdown de Filtro por Devedor */}
              <div className="relative">
                <select
                  value={receivableDebtorFilter}
                  onChange={(e) => setReceivableDebtorFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-200 focus:border-amber-400 outline-none transition cursor-pointer"
                >
                  <option value="ALL">Todos os Devedores ({uniqueDebtors.length})</option>
                  {uniqueDebtors.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Segmented Control de Status */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
              {(
                [
                  { id: "all", label: "Todos" },
                  { id: "pending", label: "Pendentes" },
                  { id: "partial", label: "Parciais" },
                  { id: "paid", label: "Quitados" }
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setReceivableStatusFilter(st.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    receivableStatusFilter === st.id
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-slate-950/60 text-slate-400 select-none">
                  <th
                    className="py-2 px-3 font-semibold text-left cursor-pointer group"
                    onClick={() => handleToggleReceivableSort("date")}
                  >
                    <span className="inline-flex items-center">
                      Data {renderSortIcon("date")}
                    </span>
                  </th>
                  <th
                    className="py-2 px-3 font-semibold text-left cursor-pointer group"
                    onClick={() => handleToggleReceivableSort("description")}
                  >
                    <span className="inline-flex items-center">
                      Descrição {renderSortIcon("description")}
                    </span>
                  </th>
                  <th
                    className="py-2 px-3 font-semibold text-left cursor-pointer group"
                    onClick={() => handleToggleReceivableSort("debtor")}
                  >
                    <span className="inline-flex items-center">
                      Pessoa (Devedor) {renderSortIcon("debtor")}
                    </span>
                  </th>
                  <th className="py-2 px-3 font-semibold text-left">Abater Valor Parcial</th>
                  <th
                    className="py-2 px-3 font-semibold text-left cursor-pointer group"
                    onClick={() => handleToggleReceivableSort("status")}
                  >
                    <span className="inline-flex items-center">
                      Situação {renderSortIcon("status")}
                    </span>
                  </th>
                  <th
                    className="py-2 px-3 font-semibold text-right cursor-pointer group"
                    onClick={() => handleToggleReceivableSort("amount")}
                  >
                    <span className="inline-flex items-center justify-end">
                      Restante / Total {renderSortIcon("amount")}
                    </span>
                  </th>
                  <th className="py-2 px-3 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {processedReceivables.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      {receivableItems.length === 0
                        ? "Nenhum lançamento classificado como \"A Receber\" até o momento."
                        : "Nenhum lançamento encontrado para os filtros selecionados."}
                    </td>
                  </tr>
                ) : (
                  processedReceivables.map((item) => {
                    const pInput = partialInputs[item.id] ? partialInputs[item.id] : "";
                    const isPaid = item.status === "Pago" || item.remaining <= 0;
                    const isPartial = !isPaid && item.effectivePaid > 0 && item.remaining > 0;
                    const paidPct = Math.min(100, Math.round((item.effectivePaid / Math.max(1, item.amount)) * 100));

                    return (
                      <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-1.5 px-3 font-mono tabular-nums text-slate-300 whitespace-nowrap min-w-[100px]">
                          {formatDateBR(item.date)}
                        </td>
                        <td className="py-1.5 px-3 font-semibold text-white max-w-[240px]">
                          <span className="truncate block">{item.description}</span>
                          {item.cardUsed && (
                            <span className="block text-[10px] text-indigo-400 truncate">
                              {item.paymentMethod} • {item.cardUsed}
                            </span>
                          )}
                          {item.bankAccount && !item.cardUsed && (
                            <span className="block text-[10px] text-sky-400 truncate">
                              {item.paymentMethod} • {item.bankAccount}
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-3">
                          <DebtorInputCell txId={item.id} initialValue={item.debtorName} onCommit={handleAssignDebtor} />
                        </td>
                        <td className="py-1.5 px-3">
                          {isPaid ? (
                            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Quitado
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1 min-w-[200px] max-w-[220px]">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="R$..."
                                  value={pInput}
                                  onChange={(e) =>
                                    setPartialInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                                  }
                                  className="w-16 h-7 px-2 py-0.5 rounded-md bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-indigo-500 font-mono tabular-nums"
                                />
                                <select
                                  value={partialBank[item.id] || banks[0]?.name || ""}
                                  onChange={(e) =>
                                    setPartialBank((prev) => ({ ...prev, [item.id]: e.target.value }))
                                  }
                                  className="flex-1 h-7 px-1.5 py-0.5 rounded-md bg-slate-950 border border-white/10 text-[10px] text-white outline-none focus:border-indigo-500 truncate"
                                  title="Banco / Conta de destino para o valor recebido"
                                >
                                  {banks.map((b) => (
                                    <option key={b.id} value={b.name}>
                                      {b.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = parseFloat(pInput);
                                    if (val > 0) {
                                      const dest = partialBank[item.id] || banks[0]?.name || "Nubank";
                                      handlePartialPaymentReceivable(item, val, dest);
                                      setPartialInputs((prev) => ({ ...prev, [item.id]: "" }));
                                    }
                                  }}
                                  className="flex-1 h-7 py-0.5 px-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold shadow transition flex items-center justify-center cursor-pointer"
                                >
                                  + Abater
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (item.remaining > 0) {
                                      const dest = partialBank[item.id] || banks[0]?.name || "Nubank";
                                      handlePartialPaymentReceivable(item, item.remaining, dest);
                                    }
                                  }}
                                  className="h-7 py-0.5 px-2 rounded-md bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold transition flex items-center justify-center cursor-pointer"
                                  title="Quitar 100% do saldo restante e creditar receita"
                                >
                                  Quitar 100%
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-1.5 px-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (!isPaid && item.remaining > 0) {
                                const dest = partialBank[item.id] || banks[0]?.name || "Nubank";
                                handlePartialPaymentReceivable(item, item.remaining, dest);
                              } else {
                                handleToggleStatus(item);
                              }
                            }}
                            className={`whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium leading-none transition ${
                              isPaid
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                            }`}
                            title={isPaid ? "Reabrir lançamento" : "Quitar lançamento integralmente"}
                          >
                            {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {isPaid ? "Pago" : "Pendente"}
                          </button>
                        </td>
                        <td className={`py-1.5 px-3 text-right ${moneyBlur}`}>
                          {isPaid ? (
                            <div className="flex flex-col items-end">
                              <span className="font-extrabold text-emerald-400 font-mono tabular-nums text-sm">
                                {formatBRL(item.amount)}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/90 font-medium">
                                <CheckCircle2 className="w-2.5 h-2.5" /> 100% Quitado
                              </span>
                            </div>
                          ) : isPartial ? (
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-amber-400 font-mono tabular-nums text-sm">
                                {formatBRL(item.remaining)}
                              </span>
                              <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                                <div
                                  className="h-full bg-emerald-400 rounded-full"
                                  style={{ width: `${paidPct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-emerald-400 font-mono tabular-nums mt-0.5">
                                Pago: {formatBRL(item.effectivePaid)} de {formatBRL(item.amount)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-amber-400 font-mono tabular-nums text-sm">
                                {formatBRL(item.amount)}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                                Total em aberto
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleStartEditTransaction(item)}
                            className="p-1 rounded-lg bg-white/10 text-slate-300 hover:text-white hover:bg-indigo-600 transition"
                            title="Editar lançamento"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ============================================================================
  // ABA 4: BANCOS
  // ============================================================================
  if (activeTab === "cards") {
    return (
      <BanksTab
        getFlowType={getFlowType}
        banks={banks}
        editingBankId={editingBankId}
        setEditingBankId={setEditingBankId}
        newBank={newBank}
        setNewBank={setNewBank}
        handleSaveBank={handleSaveBank}
        handleDeleteBank={handleDeleteBank}
        cards={cards}
        editingCardId={editingCardId}
        setEditingCardId={setEditingCardId}
        newCard={newCard}
        setNewCard={setNewCard}
        handleSaveCard={handleSaveCard}
        handleDeleteCard={handleDeleteCard}
        handlePayCardInvoice={handlePayCardInvoice}
        transactions={transactions}
        wishlist={wishlist}
        editingWishId={editingWishId}
        setEditingWishId={setEditingWishId}
        newWish={newWish}
        setNewWish={setNewWish}
        handleSaveWish={handleSaveWish}
        handleIncrementWish={handleIncrementWish}
        handleDeleteWish={handleDeleteWish}
        personalBudgetLimit={personalBudgetLimit}
        moneyBlur={moneyBlur}
      />
    );
  }

  // ============================================================================
  // ABA 5: MEUS VEÍCULOS (TELEMETRIA, ANÁLISE DE CONSUMO, INMETRO E SEMÁFORO)
  // ============================================================================
  if (activeTab === "auto") {
    return (
      <VehiclesTab
        autoMetrics={autoMetrics}
        autoInmetroConfig={autoInmetroConfig}
        setAutoInmetroConfig={setAutoInmetroConfig}
        chartTheme={chartTheme}
        updateChartThemeColor={updateChartThemeColor}
        handleOpenNewTxModal={handleOpenNewTxModal}
        onAddTransaction={onAddTransaction}
        notify={notify}
        moneyBlur={moneyBlur}
        autoLayout={autoLayout}
        getAutoWidgetSettings={getAutoWidgetSettings}
        handleUpdateAutoWidgetSettings={handleUpdateAutoWidgetSettings}
        handleUpdateAutoWidgetSize={handleUpdateAutoWidgetSize}
        handleDragStartAutoWidget={handleDragStartAutoWidget}
        handleDragEnterAutoWidget={handleDragEnterAutoWidget}
        handleDragEndAutoWidget={handleDragEndAutoWidget}
        draggingAutoWidgetId={draggingAutoWidgetId}
        dragOverAutoWidgetId={dragOverAutoWidgetId}
      />
    );
  }

  // ============================================================================
  // ABA 6: BIO & STRAVA
  // ============================================================================
  if (activeTab === "bio") {
    const StravaCustomTooltip = ({ active, payload, label }: any) => {
      if (!active || !payload || !payload.length) return null;
      const item = payload[0]?.payload;
      if (!item) return null;
      return (
        <div className="glass-card p-3 rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl text-xs space-y-1.5 min-w-[200px]">
          <div className="border-b border-white/10 pb-1.5 flex justify-between items-center gap-2">
            <span className="font-bold text-white tracking-tight">{item.label || label}</span>
            {item.date && (
              <span className="text-[10px] text-slate-400 font-mono tabular-nums">{formatDateBR(item.date)}</span>
            )}
          </div>
          {item.name && (
            <p className="text-[11px] text-orange-300 font-medium truncate max-w-[220px]">{item.name}</p>
          )}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] pt-1">
            <div>
              <span className="text-slate-400 block text-[10px]">Distância</span>
              <strong className="text-orange-400 font-mono tabular-nums">{Number(item.distance || 0).toFixed(1)} km</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Pace Médio</span>
              <strong className="text-emerald-400 font-mono tabular-nums">{item.paceStr || secondsToPaceString(item.paceSec)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Tempo</span>
              <strong className="text-slate-200 font-mono tabular-nums">{Math.round(item.time || 0)} min</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Calorias</span>
              <strong className="text-amber-300 font-mono tabular-nums">
                {item.calories > 0 ? `${Math.round(item.calories)} kcal` : "—"}
              </strong>
            </div>
            {item.elevation > 0 && (
              <div className="col-span-2 pt-0.5 border-t border-white/5">
                <span className="text-slate-400 text-[10px]">Altimetria Acumulada: </span>
                <strong className="text-indigo-300 font-mono tabular-nums">+{item.elevation} m</strong>
              </div>
            )}
          </div>
        </div>
      );
    };

    const renderBioChart = () => {
      const chartType = bioSettings.chartType || "area";
      const strokeColor = bioSettings.color === "auto" ? (chartTheme.weightLine || "#30D158") : bioSettings.color;
      const bfColor = chartTheme.bfLine || "#6366f1";
      const curveType = bioSettings.curveType || "monotone";
      const strokeWidth = bioSettings.strokeWidth || 2.5;

      const showWeight = bioSeriesMode === "all" || bioSeriesMode === "weight" || bioSeriesMode === "target";
      const showBf = (bioSeriesMode === "all" || bioSeriesMode === "bf") && filteredBioLogs.some((l) => l.bf != null);
      const showTarget = bioSeriesMode === "target" || bioSeriesMode === "all";

      const commonAxesAndDefs = (
        <>
          <defs>
            <linearGradient id="bioColorWeight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.28} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="bioColorBf" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={bfColor} stopOpacity={0.28} />
              <stop offset="95%" stopColor={bfColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          {bioSettings.showGrid !== false && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
          )}
          <XAxis
            dataKey="date"
            stroke="#64748b"
            fontSize={11}
            tickFormatter={(v) => formatDateBR(v)}
          />
          <YAxis
            yAxisId="weight"
            stroke="#64748b"
            fontSize={11}
            domain={["auto", "auto"]}
            tickFormatter={(v) => `${Number(v).toFixed(0)}kg`}
          />
          {showBf && (
            <YAxis
              yAxisId="bf"
              orientation="right"
              stroke="#64748b"
              fontSize={11}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `${Number(v).toFixed(0)}%`}
            />
          )}
          <Tooltip content={<CustomCyberTooltip isCurrency={false} />} cursor={false} />
          {bioSettings.showLegend !== false && <Legend wrapperStyle={{ fontSize: "11px" }} />}
          {showTarget && (
            <ReferenceLine
              yAxisId="weight"
              y={78.0}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: "Meta 78kg", fill: "#f59e0b", fontSize: 10, position: "insideTopRight" }}
            />
          )}
        </>
      );

      if (chartType === "bar") {
        return (
          <BarChart data={filteredBioLogs} barSize={20} accessibilityLayer={false}>
            {commonAxesAndDefs}
            {showWeight && (
              <Bar yAxisId="weight" dataKey="weight" name="Peso (kg)" fill={strokeColor} radius={[4, 4, 0, 0]} />
            )}
            {showBf && (
              <Bar yAxisId="bf" dataKey="bf" name="Gordura - BF (%)" fill={bfColor} radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        );
      }

      if (chartType === "line") {
        return (
          <LineChart data={filteredBioLogs} accessibilityLayer={false}>
            {commonAxesAndDefs}
            {showWeight && (
              <Line
                yAxisId="weight"
                type={curveType}
                dataKey="weight"
                name="Peso (kg)"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                dot={bioSettings.showDots ? { r: 3, fill: strokeColor } : false}
                activeDot={{ r: 5 }}
              />
            )}
            {showBf && (
              <Line
                yAxisId="bf"
                type={curveType}
                dataKey="bf"
                name="Gordura - BF (%)"
                stroke={bfColor}
                strokeWidth={strokeWidth}
                dot={bioSettings.showDots ? { r: 3, fill: bfColor } : false}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        );
      }

      // Default: area
      return (
        <AreaChart data={filteredBioLogs} accessibilityLayer={false}>
          {commonAxesAndDefs}
          {showWeight && (
            <Area
              yAxisId="weight"
              type={curveType}
              dataKey="weight"
              name="Peso (kg)"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill="url(#bioColorWeight)"
              dot={bioSettings.showDots ? { r: 3, fill: strokeColor } : false}
              activeDot={{ r: 5 }}
            />
          )}
          {showBf && (
            <Area
              yAxisId="bf"
              type={curveType}
              dataKey="bf"
              name="Gordura - BF (%)"
              stroke={bfColor}
              strokeWidth={strokeWidth}
              fill="url(#bioColorBf)"
              dot={bioSettings.showDots ? { r: 3, fill: bfColor } : false}
              activeDot={{ r: 5 }}
            />
          )}
        </AreaChart>
      );
    };

    const renderStravaChart = () => {
      const chartType = stravaChartSettings.chartType || "bar";
      const strokeColor = stravaChartSettings.color === "auto" ? "#FF9F0A" : stravaChartSettings.color;
      const curveType = stravaChartSettings.curveType || "monotone";
      const strokeWidth = stravaChartSettings.strokeWidth || 2.5;

      const dataKey =
        stravaMetric === "distance"
          ? "distance"
          : stravaMetric === "pace"
          ? "paceSec"
          : stravaMetric === "time"
          ? "time"
          : "calories";

      const metricLabel =
        stravaMetric === "distance"
          ? "Distância (km)"
          : stravaMetric === "pace"
          ? "Pace Médio (/km)"
          : stravaMetric === "time"
          ? "Tempo (min)"
          : "Calorias (kcal)";

      const yTickFormatter = (v: number) => {
        if (stravaMetric === "distance") return `${v.toFixed(0)}km`;
        if (stravaMetric === "pace") return secondsToPaceString(v);
        if (stravaMetric === "time") return `${Math.round(v)}m`;
        return `${Math.round(v)}`;
      };

      const weeklyGoalKm = Math.round(annualRunGoalKm / 52);
      const showWeeklyGoal = stravaTimeScale === "Semana" && stravaMetric === "distance" && weeklyGoalKm > 0;

      const commonAxesAndDefs = (
        <>
          <defs>
            <linearGradient id="stravaColorMetric" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.28} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          {stravaChartSettings.showGrid !== false && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
          )}
          <XAxis
            dataKey="label"
            stroke="#64748b"
            fontSize={11}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            domain={["auto", "auto"]}
            tickFormatter={yTickFormatter}
          />
          <Tooltip content={<StravaCustomTooltip />} cursor={false} />
          {stravaChartSettings.showLegend !== false && <Legend wrapperStyle={{ fontSize: "11px" }} />}
          {showWeeklyGoal && (
            <ReferenceLine
              y={weeklyGoalKm}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: `Meta: ${weeklyGoalKm} km/sem`, fill: "#f59e0b", fontSize: 10, position: "insideTopRight" }}
            />
          )}
        </>
      );

      if (chartType === "area") {
        return (
          <AreaChart data={aggregatedStravaData} accessibilityLayer={false}>
            {commonAxesAndDefs}
            <Area
              type={curveType}
              dataKey={dataKey}
              name={metricLabel}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill="url(#stravaColorMetric)"
              dot={stravaChartSettings.showDots ? { r: 3, fill: strokeColor } : false}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        );
      }

      if (chartType === "line") {
        return (
          <LineChart data={aggregatedStravaData} accessibilityLayer={false}>
            {commonAxesAndDefs}
            <Line
              type={curveType}
              dataKey={dataKey}
              name={metricLabel}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              dot={stravaChartSettings.showDots ? { r: 3, fill: strokeColor } : false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        );
      }

      // Default: bar
      return (
        <BarChart data={aggregatedStravaData} barSize={stravaTimeScale === "Dia" ? 16 : 28} accessibilityLayer={false}>
          {commonAxesAndDefs}
          <Bar dataKey={dataKey} name={metricLabel} fill={strokeColor} radius={[6, 6, 0, 0]} />
        </BarChart>
      );
    };

    return (
      <div className="space-y-6">
        <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/50 border border-orange-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl mb-3">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-orange-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> Telemetria Esportiva Strava
            </span>
            <h2 className="text-base font-semibold text-white tracking-tight">Minhas Corridas & Evolução Corporal</h2>
            <p className="text-xs text-slate-400">Acompanhe o volume de corridas do ano e a curva de peso corporal e percentual de gordura (BF%).</p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 block">Acumulado no Ano</span>
              <strong className="text-lg sm:text-xl font-bold font-mono tabular-nums text-orange-400 leading-tight">{stravaStats.ytdKm} km</strong>
              <span className="block text-[10px] sm:text-[11px] text-slate-400">{stravaStats.ytdRuns} corridas em 2026</span>
            </div>
            <div className="border-l border-white/10 pl-5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 block">Histórico Total</span>
              <strong className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-400 leading-tight">{stravaStats.allTimeKm} km</strong>
              <span className="block text-[10px] sm:text-[11px] text-slate-400">{stravaStats.allTimeRuns} treinos totais</span>
            </div>
            <button
              type="button"
              onClick={() => syncStravaFromApi()}
              disabled={isSyncingStrava}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              {isSyncingStrava ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{isSyncingStrava ? "Sincronizando..." : "Atualizar pelo Strava"}</span>
            </button>
          </div>
        </div>

        {stravaScopeMode === "read_only" && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs animate-cupertino-in">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-amber-200 block font-semibold">
                  Modo Leitura Básico Ativo (Escopo: read)
                </strong>
                <p className="text-slate-300 text-[11px]">
                  Os dados acumulados do ano estão sincronizados. Para carregar suas últimas 30 corridas detalhadas com altimetria e calorias, autorize o escopo completo:
                </p>
              </div>
            </div>
            {stravaOauthUrl && (
              <button
                type="button"
                onClick={() => window.open(stravaOauthUrl, "strava_oauth", "width=600,height=750")}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <span>🔓 Liberar Atividades Detalhadas (OAuth)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SPRINT 38: CENTRAL ANALÍTICA DE BIOIMPEDÂNCIA */}
          <div className="lg:col-span-2 glass-card p-5 sm:p-6 rounded-3xl border border-white/[0.08] flex flex-col justify-between space-y-4">
            {/* Cabeçalho de Controles & Períodos */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/5">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Curva de Peso (kg) e Gordura Corporal (BF %)
                </h3>
                <p className="text-xs text-slate-400">Histórico visual das suas pesagens e avaliações físicas.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Seletor de Séries */}
                <select
                  value={bioSeriesMode}
                  onChange={(e) => setBioSeriesMode(e.target.value as any)}
                  className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-200 outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="all">Peso + BF%</option>
                  <option value="weight">Só Peso (kg)</option>
                  <option value="bf">Só BF (%)</option>
                  <option value="target">Rumo à Meta (78kg)</option>
                </select>

                {/* Seletor de Período Rápido */}
                <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
                  {(["1M", "3M", "6M", "1A", "Tudo"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setBioPeriodFilter(p)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        bioPeriodFilter === p
                          ? "bg-emerald-500 text-slate-950 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Botão de Engrenagem / Popover */}
                <div className="relative">
                  <button
                    ref={bioGearRef}
                    type="button"
                    onClick={() => setBioSettingsOpen((prev) => !prev)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
                    title="Configurações do gráfico de bioimpedância"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>

                  <ChartSettingsPopover
                    isOpen={bioSettingsOpen}
                    onClose={() => setBioSettingsOpen(false)}
                    anchorRef={bioGearRef}
                    chartKind={bioSettings.chartType || "area"}
                    hasMultipleSeries={true}
                    settings={bioSettings}
                    onChange={handleUpdateBioSettings}
                  />
                </div>
              </div>
            </div>

            {/* Display Executivo no Topo */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight tabular-nums">
                  {bioTelemetry.currentWeight > 0 ? `${bioTelemetry.currentWeight.toFixed(1)} kg` : "—"}
                </span>
                {bioTelemetry.initialWeight > 0 && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tabular-nums border ${
                      bioTelemetry.deltaWeight <= 0
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {bioTelemetry.deltaWeight <= 0 ? "▼" : "▲"}
                    {Math.abs(bioTelemetry.deltaWeight).toFixed(1)} kg ({bioTelemetry.deltaPct >= 0 ? "+" : ""}
                    {bioTelemetry.deltaPct.toFixed(1)}%)
                  </span>
                )}
              </div>

              {bioTelemetry.currentBf != null && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 tabular-nums">
                    BF Atual: {bioTelemetry.currentBf.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            {/* Gráfico Recharts Dinâmico */}
            <div
              style={{ height: getChartHeightPx(bioSettings.height, 220) }}
              className="w-full select-none"
            >
              <ResponsiveContainer width="100%" height="100%">
                {renderBioChart()}
              </ResponsiveContainer>
            </div>

            {/* Faixa Inferior de Telemetria com 4 Mini-Cards Executivos */}
            <div className="pt-3 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Peso Inicial ({bioPeriodFilter})</span>
                <p className="text-sm font-bold text-white font-mono tabular-nums mt-0.5">
                  {bioTelemetry.initialWeight > 0 ? `${bioTelemetry.initialWeight.toFixed(1)} kg` : "—"}
                </p>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Mínimo Atingido</span>
                <p className="text-sm font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
                  {bioTelemetry.minWeight > 0 ? `${bioTelemetry.minWeight.toFixed(1)} kg` : "—"}
                </p>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Média do Período</span>
                <p className="text-sm font-bold text-sky-400 font-mono tabular-nums mt-0.5">
                  {bioTelemetry.avgWeight > 0 ? `${bioTelemetry.avgWeight.toFixed(1)} kg` : "—"}
                </p>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Massa Magra Est.</span>
                <p className="text-sm font-bold text-indigo-300 font-mono tabular-nums mt-0.5">
                  {bioTelemetry.leanMass != null ? `${bioTelemetry.leanMass.toFixed(1)} kg` : "—"}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveBioLog} className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-3.5 text-xs h-fit">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">{editingBioId ? "Editar Medição" : "Nova Pesagem"}</h3>
              {editingBioId && (
                <button type="button" onClick={() => { setEditingBioId(null); setNewBio({ date: todayBR(), weight: "", bf: "" }); }} className="text-[11px] text-rose-400 hover:underline">
                  Cancelar
                </button>
              )}
            </div>
            <input type="date" required value={toSortableISO(newBio.date) || newBio.date} onChange={(e) => setNewBio({ ...newBio, date: formatDateBR(e.target.value) })} className={inputClass} />
            <div className="grid grid-cols-2 gap-2.5">
              <input type="number" step="0.1" required placeholder="Peso (kg)" value={newBio.weight} onChange={(e) => setNewBio({ ...newBio, weight: e.target.value })} className={inputClass} />
              <input type="number" step="0.1" placeholder="BF % (Opcional)" value={newBio.bf} onChange={(e) => setNewBio({ ...newBio, bf: e.target.value })} className={inputClass} />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg transition">
              {editingBioId ? "✓ Atualizar Medição" : "+ Salvar Medição"}
            </button>
          </form>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-extrabold text-white">Histórico de Medições Corporais</h3>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-slate-950/60 text-slate-400">
                  <th className="py-3 px-3">Data</th><th className="py-3 px-3">Peso (kg)</th><th className="py-3 px-3">BF (%)</th><th className="py-3 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {bioLogs.slice().reverse().map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.03] transition">
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-300">{formatDateBR(b.date)}</td>
                    <td className="py-3 px-3 font-extrabold font-mono tabular-nums text-emerald-400">{b.weight} kg</td>
                    <td className="py-3 px-3 font-extrabold font-mono tabular-nums text-indigo-400">{b.bf ? `${b.bf}%` : "—"}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button type="button" onClick={() => { setEditingBioId(b.id); setNewBio({ date: b.date, weight: String(b.weight), bf: b.bf ? String(b.bf) : "" }); }} className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/30 transition"><Pencil className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => handleDeleteBioLog(b.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SPRINT 38: CENTRAL ANALÍTICA DE CORRIDAS & PACE (STRAVA PROGRESS) */}
        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/[0.08] flex flex-col justify-between space-y-4">
          {/* Cabeçalho de Controles, Métricas e Escala Temporal */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-500/15 text-orange-400">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-white tracking-tight">
                  Central Analítica de Corridas & Pace — Strava Progress
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Volume acumulado, ritmo médio e calorias por período com meta semanal.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Seletor de Métrica Principal */}
              <select
                value={stravaMetric}
                onChange={(e) => setStravaMetric(e.target.value as any)}
                className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-200 outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="distance">Distância (km)</option>
                <option value="pace">Pace Médio (/km)</option>
                <option value="time">Tempo (min)</option>
                <option value="calories">Calorias (kcal)</option>
              </select>

              {/* Seletor de Escala Temporal */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
                {(["Dia", "Semana", "Mês", "Ano"] as const).map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setStravaTimeScale(sc)}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      stravaTimeScale === sc
                        ? "bg-orange-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>

              {/* Botão de Engrenagem / Popover */}
              <div className="relative">
                <button
                  ref={stravaGearRef}
                  type="button"
                  onClick={() => setStravaSettingsOpen((prev) => !prev)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
                  title="Configurações do gráfico Strava"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>

                <ChartSettingsPopover
                  isOpen={stravaSettingsOpen}
                  onClose={() => setStravaSettingsOpen(false)}
                  anchorRef={stravaGearRef}
                  chartKind={stravaChartSettings.chartType || "bar"}
                  hasMultipleSeries={false}
                  settings={stravaChartSettings}
                  onChange={handleUpdateStravaChartSettings}
                />
              </div>
            </div>
          </div>

          {/* Gráfico Recharts Dinâmico */}
          <div
            style={{ height: getChartHeightPx(stravaChartSettings.height, 220) }}
            className="w-full select-none"
          >
            {aggregatedStravaData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-950/40 border border-white/5">
                <Flame className="w-8 h-8 text-orange-500/30 mb-2" />
                <p className="text-xs text-slate-400">
                  Nenhum treino disponível para a escala <strong>{stravaTimeScale}</strong>.
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Sincronize pelo Strava para carregar suas atividades recentes.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {renderStravaChart()}
              </ResponsiveContainer>
            )}
          </div>

          {/* Faixa Inferior de Telemetria com 4 Mini-Cards Executivos */}
          <div className="pt-3 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Distância Total</span>
              <p className="text-sm font-bold text-orange-400 font-mono tabular-nums mt-0.5">
                {stravaTelemetry.totalKm > 0 ? `${stravaTelemetry.totalKm} km` : "—"}
              </p>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Melhor Pace</span>
              <p className="text-sm font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
                {stravaTelemetry.bestPaceStr}
              </p>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Maior Distância</span>
              <p className="text-sm font-bold text-sky-400 font-mono tabular-nums mt-0.5">
                {stravaTelemetry.maxKm > 0 ? `Longão: ${stravaTelemetry.maxKm} km` : "—"}
              </p>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Horas em Movimento</span>
              <p className="text-sm font-bold text-amber-300 font-mono tabular-nums mt-0.5">
                {stravaTelemetry.timeFormatted}
              </p>
            </div>
          </div>
        </div>

        {/* SESSÃO 3: FEED DE CORRIDAS & ATIVIDADES STRAVA */}
        <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  Minhas Corridas & Treinos Recentes
                  {stravaActivities && stravaActivities.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      {stravaActivities.length} {stravaActivities.length === 1 ? "registro" : "registros"}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">Telemetria oficial do Strava com pace por quilômetro, altimetria acumulada e estimativa calórica.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {stravaScopeMode === "read_only" && stravaOauthUrl && (
                <button
                  type="button"
                  onClick={() => window.open(stravaOauthUrl, "strava_oauth", "width=600,height=750")}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>🔓 Liberar Atividades Detalhadas (OAuth)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => syncStravaFromApi()}
                disabled={isSyncingStrava}
                className="px-3.5 py-1.5 rounded-xl bg-orange-600/30 border border-orange-500/30 hover:bg-orange-600/50 text-orange-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                {isSyncingStrava ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>{isSyncingStrava ? "Sincronizando..." : "Atualizar Feed"}</span>
              </button>
            </div>
          </div>

          {stravaActivities && stravaActivities.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-slate-950/60 text-slate-400">
                    <th className="py-3 px-3">Data</th>
                    <th className="py-3 px-3">Atividade</th>
                    <th className="py-3 px-3">Tipo</th>
                    <th className="py-3 px-3 text-right">Distância</th>
                    <th className="py-3 px-3 text-right">Tempo</th>
                    <th className="py-3 px-3 text-right">Pace Médio</th>
                    <th className="py-3 px-3 text-right">Altimetria</th>
                    <th className="py-3 px-3 text-right">Calorias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {stravaActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-white/[0.03] transition">
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-300 whitespace-nowrap">
                        {act.date}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {act.name}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-300 border border-orange-500/30">
                          {act.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold font-mono tabular-nums text-orange-400 whitespace-nowrap">
                        {act.distanceKm} km
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300 whitespace-nowrap">
                        {act.movingTimeMin} min
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400 font-bold whitespace-nowrap">
                        {act.pace}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-indigo-300 whitespace-nowrap">
                        {act.elevationGain > 0 ? `+${act.elevationGain} m` : "—"}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-300 whitespace-nowrap">
                        {act.calories > 0 ? `${act.calories} kcal` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-white/[0.05] space-y-3">
              <Flame className="w-8 h-8 text-orange-500/40 mx-auto" />
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Nenhuma atividade sincronizada no feed ainda. Clique em <strong>&quot;Atualizar pelo Strava&quot;</strong> para consultar a API oficial.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // ABA 7: SEGUNDO CÉREBRO & MURAL DE ANOTAÇÕES E DESEJOS (UPDATE 4 COMPLETO)
  // ============================================================================
  if (activeTab === "brain") {
    // Desejos de Compra e Cálculos dos KPIs
    const wishItems = notes.filter((n) => n.itemType === "wish" || (n.price != null && n.price > 0));
    const pendingWishesTotal = safeAdd(...wishItems.filter((w) => !w.completed).map((w) => w.price || 0));
    const completedWishesTotal = safeAdd(...wishItems.filter((w) => Boolean(w.completed)).map((w) => w.price || 0));
    const totalWishesValue = safeAdd(pendingWishesTotal, completedWishesTotal);
    const conqueredPercentage = totalWishesValue > 0
      ? Math.min(100, Math.round((completedWishesTotal / totalWishesValue) * 100))
      : 0;

    const comparisonChartData = [
      {
        categoria: "Ainda Quero",
        valor: pendingWishesTotal,
        fill: "#f59e0b"
      },
      {
        categoria: "Já Comprei",
        valor: completedWishesTotal,
        fill: "#10b981"
      }
    ];

    const visibleNotes = notes
      .filter((n) => {
        if (muralFilter === "NOTES") return n.itemType !== "wish" && (!n.price || n.price === 0);
        if (muralFilter === "WISHES") return n.itemType === "wish" || (n.price != null && n.price > 0);
        return true;
      })
      .filter((n) => selectedNoteTag === "ALL" || n.tag === selectedNoteTag)
      .filter((n) => {
        if (!noteSearch.trim()) return true;
        const q = noteSearch.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          (n.content && n.content.toLowerCase().includes(q)) ||
          (n.description && n.description.toLowerCase().includes(q))
        );
      });

    const handleStartEditNote = (n: BrainNote) => {
      setEditingNoteId(n.id);
      setNewNote({
        title: n.title,
        content: n.content || n.description || "",
        description: n.description || n.content || "",
        tag: n.tag,
        itemType: n.itemType || (n.price ? "wish" : "note"),
        price: n.price != null ? String(n.price) : "",
        priority: n.priority || "Planejado",
        storeUrl: n.storeUrl || "",
        completed: Boolean(n.completed)
      });
    };

    const handleCancelEditNote = () => {
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

    const onToggleNote = (id: string) => {
      if (handleToggleNoteCompleted) {
        handleToggleNoteCompleted(id);
      }
    };

    return (
      <div className="space-y-8">
        {/* SEÇÃO 1: GRANDES OBJETIVOS DO ANO (OKRS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-4 sm:p-5 rounded-2xl border border-white/[0.08] space-y-3.5 shadow-xl">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2 tracking-tight">
                <Target className="w-4 h-4 text-indigo-400" /> Meus Grandes Objetivos do Ano (OKRs)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Atualize o valor alcançado diretamente no card para acompanhar a barra de progresso.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {okrs.map((okr) => {
                const pct = Math.min(100, Math.round((okr.current / Math.max(1, okr.target)) * 100));
                return (
                  <div key={okr.id} className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/[0.07] space-y-2.5">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <strong className="text-white font-bold block">{okr.title}</strong>
                        <span className="text-[10px] text-slate-400">{okr.category}</span>
                      </div>
                      <button onClick={() => saveOkrs(okrs.filter((item) => item.id !== okr.id))} className="text-slate-400 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-indigo-400 font-extrabold font-mono tabular-nums">{okr.current} / {okr.target} {okr.unit} ({pct}%)</span>
                      <input
                        type="number"
                        step="0.1"
                        value={okr.current}
                        onChange={(e) => saveOkrs(okrs.map((item) => (item.id === okr.id ? { ...item, current: Number(e.target.value) } : item)))}
                        className="w-20 px-2 py-1 rounded-lg bg-slate-900 border border-white/10 text-right text-xs text-white outline-none focus:border-indigo-500 font-mono tabular-nums"
                      />
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleAddOkr} className="glass-card p-4 sm:p-5 rounded-2xl border border-white/[0.08] space-y-3 text-xs h-fit shadow-xl">
            <h3 className="text-sm font-extrabold text-white">Cadastrar Nova Meta Anual</h3>
            <input type="text" required placeholder="Título da Meta..." value={newOkr.title} onChange={(e) => setNewOkr({ ...newOkr, title: e.target.value })} className={inputClass} />
            <div className="grid grid-cols-3 gap-2">
              <input type="number" placeholder="Atual" value={newOkr.current} onChange={(e) => setNewOkr({ ...newOkr, current: e.target.value })} className={inputClass} />
              <input type="number" required placeholder="Alvo" value={newOkr.target} onChange={(e) => setNewOkr({ ...newOkr, target: e.target.value })} className={inputClass} />
              <input type="text" placeholder="Unid (R$, km)" value={newOkr.unit} onChange={(e) => setNewOkr({ ...newOkr, unit: e.target.value })} className={inputClass} />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-[#0A84FF] hover:bg-[#0070E0] text-white font-semibold shadow-sm transition cursor-pointer">
              + Adicionar Meta
            </button>
          </form>
        </div>

        {/* SEÇÃO 2: PAINEL EXECUTIVO DE DESEJOS DE COMPRA (KPIS + GRÁFICO COMPARATIVO RECHARTS) */}
        <div className="glass-card px-4 py-3 rounded-2xl border border-white/[0.08] space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Painel de Desejos & Metas de Consumo
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Acompanhe o que você ainda planeja comprar versus o que já conquistou, evitando compras por impulso.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tabular-nums bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {wishItems.length} desejos cadastrados
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* KPIs */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="px-3.5 py-2.5 rounded-2xl bg-slate-950/80 border border-amber-500/25 space-y-1">
                <span className="text-[10px] sm:text-[11px] text-amber-300/80 uppercase tracking-wider font-extrabold block">
                  Ainda Quero Comprar
                </span>
                <strong className="text-lg sm:text-xl font-bold text-amber-400 font-mono tabular-nums block leading-tight">
                  {formatBRL(pendingWishesTotal)}
                </strong>
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-mono tabular-nums">
                  {wishItems.filter((w) => !w.completed).length} pendente(s)
                </span>
              </div>

              <div className="px-3.5 py-2.5 rounded-2xl bg-slate-950/80 border border-emerald-500/25 space-y-1">
                <span className="text-[10px] sm:text-[11px] text-emerald-300/80 uppercase tracking-wider font-extrabold block">
                  Já Comprei
                </span>
                <strong className="text-lg sm:text-xl font-bold text-emerald-400 font-mono tabular-nums block leading-tight">
                  {formatBRL(completedWishesTotal)}
                </strong>
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-mono tabular-nums">
                  {wishItems.filter((w) => Boolean(w.completed)).length} conquistado(s)
                </span>
              </div>

              <div className="px-3.5 py-2.5 rounded-2xl bg-slate-950/80 border border-indigo-500/25 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] text-indigo-300/80 uppercase tracking-wider font-extrabold">
                    Conquistado
                  </span>
                  <span className="text-xs font-extrabold text-white font-mono tabular-nums">
                    {conqueredPercentage}%
                  </span>
                </div>
                <strong className="text-sm font-extrabold text-white font-mono tabular-nums block truncate">
                  {formatBRL(completedWishesTotal)} / {formatBRL(totalWishesValue)}
                </strong>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${conqueredPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Gráfico Comparativo Recharts */}
            <div className="lg:col-span-5 h-36 select-none bg-slate-950/60 p-2.5 rounded-2xl border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={comparisonChartData}
                  barSize={20}
                  accessibilityLayer={false}
                  margin={{ top: 8, right: 30, left: 10, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    fontSize={10}
                    tickFormatter={(v) => formatBRL(Number(v))}
                  />
                  <YAxis
                    type="category"
                    dataKey="categoria"
                    stroke="#cbd5e1"
                    fontSize={11}
                    width={85}
                  />
                  <Tooltip content={<CustomCyberTooltip isCurrency={true} />} cursor={false} />
                  <Bar dataKey="valor" name="Montante" radius={[0, 6, 6, 0]}>
                    {comparisonChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SPRINT 37: SEÇÃO 2.5 — SIMULADOR PREDITIVO "POSSO COMPRAR?" (Ícaro Vasconcelos) */}
        {(() => {
          const remainingDays = dailyQuotaInfo?.remainingDays || 15;
          const freeBalance = dailyQuotaInfo?.remainingFree || (personalBudgetLimit > 0 ? personalBudgetLimit * 0.4 : 1200);
          const dailyQuota = dailyQuotaInfo?.dailyBudget || (personalBudgetLimit > 0 ? personalBudgetLimit / 30 : 65);
          const cdiRate = cdiAnnualRate || 0.1215;
          const parsedPrice = parseFloat(simulatedPrice) || 0;
          const simResult = simulatePurchaseImpact({
            itemPrice: parsedPrice,
            installments: simulatedInstallments,
            freeMonthlyBalance: freeBalance,
            dailyQuota,
            remainingDays,
            cdiAnnualRate: cdiRate
          });

          return (
            <div className="glass-card p-5 sm:p-6 rounded-3xl border border-amber-500/25 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      🧠 Simulador Preditivo: Posso Comprar?
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        IA Comportamental
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Analise instantaneamente o impacto de qualquer compra sobre a sua Cota Diária e compare com o rendimento CDI.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    Cota Diária Base: <strong className="text-white font-mono tabular-nums">{formatBRL(dailyQuota)}/dia</strong> ({remainingDays} dias rest.)
                  </span>
                </div>
              </div>

              {/* Pílulas de Seleção Rápida a partir dos Desejos Cadastrados */}
              {wishItems.filter((w) => !w.completed && w.price && w.price > 0).length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Carregar Desejo Cadastrado:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {wishItems
                      .filter((w) => !w.completed && w.price && w.price > 0)
                      .map((wish) => (
                        <button
                          key={`sim-wish-${wish.id}`}
                          type="button"
                          onClick={() => {
                            setSimulatedPrice(String(wish.price || 0));
                            setSelectedSimulatedWishId(wish.id);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 cursor-pointer ${
                            selectedSimulatedWishId === wish.id
                              ? "bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm"
                              : "bg-slate-900/90 text-slate-300 hover:text-white border-white/10"
                          }`}
                        >
                          <span>{wish.title}</span>
                          <strong className="font-mono tabular-nums text-[11px]">
                            {formatBRL(wish.price || 0)}
                          </strong>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Controles de Entrada: Valor e Parcelamento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Valor do Item (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 350,00"
                    value={simulatedPrice}
                    onChange={(e) => {
                      setSimulatedPrice(e.target.value);
                      setSelectedSimulatedWishId(null);
                    }}
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Condição de Pagamento</label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[1, 2, 3, 6, 10, 12].map((num) => (
                      <button
                        key={`installment-${num}`}
                        type="button"
                        onClick={() => setSimulatedInstallments(num)}
                        className={`flex-1 min-w-[55px] py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          simulatedInstallments === num
                            ? "bg-[#0A84FF] text-white border-[#0A84FF] shadow-sm"
                            : "bg-slate-900 text-slate-400 hover:text-white border-white/10"
                        }`}
                      >
                        {num === 1 ? "1x (À vista)" : `${num}x`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Painel de Resultados: 3 Mini KPIs + Veredito */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    {simulatedInstallments === 1 ? "Impacto à Vista" : "Parcela Mensal"}
                  </span>
                  <strong className="text-base font-extrabold font-mono tabular-nums text-white">
                    {formatBRL(simResult.monthlyImpact)}
                  </strong>
                  <span className="text-[10px] text-slate-400 block">
                    {simulatedInstallments > 1
                      ? `${simResult.installments}x de ${formatBRL(simResult.installmentAmount)}`
                      : "Pagamento único no mês"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Nova Cota Diária
                  </span>
                  <strong className="text-base font-extrabold font-mono tabular-nums text-emerald-400">
                    {formatBRL(simResult.newDailyQuota)} / dia
                  </strong>
                  <span className="text-[10px] text-rose-400 font-bold block">
                    -{formatBRL(simResult.dailyQuotaReduction)}/dia de margem
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Custo de Oportunidade CDI
                  </span>
                  <strong className="text-base font-extrabold font-mono tabular-nums text-indigo-400">
                    +{formatBRL(simResult.cdi12mOpportunityCost)}
                  </strong>
                  <span className="text-[10px] text-slate-400 block">
                    Em 12M na Caixinha Turbo (115% CDI)
                  </span>
                </div>
              </div>

              {/* Veredito Comportamental da IA */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${simResult.verdictBadgeColor}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md font-extrabold text-[11px] tracking-wide uppercase border bg-white/10">
                      {simResult.verdict}
                    </span>
                    <span className="font-mono tabular-nums text-[11px] font-bold">
                      Índice de Segurança: {simResult.verdictScore}/100
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs">
                    {simResult.verdictMessage}
                  </p>
                  <p className="text-[11px] font-medium text-amber-200">
                    💡 <strong>Dica da IA:</strong> {simResult.recommendation}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* SEÇÃO 3: MURAL DE ANOTAÇÕES, OBJETIVOS & LISTA DE DESEJOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-white/[0.07]">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-400" /> Mural Central & Segundo Cérebro
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Organize anotações, metas e desejos de compra com controle interativo de conclusão.</p>
              </div>
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar nota ou desejo..."
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Pílulas de Filtro Rápido (Todos, Notas & Objetivos, Lista de Desejos) */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMuralFilter("ALL")}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  muralFilter === "ALL"
                    ? "bg-[#0A84FF] text-white shadow-sm ring-1 ring-white/20"
                    : "bg-slate-900/90 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Todos
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 font-mono tabular-nums">{notes.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setMuralFilter("NOTES")}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  muralFilter === "NOTES"
                    ? "bg-[#0A84FF] text-white shadow-sm ring-1 ring-white/20"
                    : "bg-slate-900/90 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Notas & Objetivos
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 font-mono tabular-nums">
                  {notes.filter((n) => n.itemType !== "wish" && (!n.price || n.price === 0)).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMuralFilter("WISHES")}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  muralFilter === "WISHES"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-1 ring-white/20"
                    : "bg-slate-900/90 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Lista de Desejos (R$)
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 font-mono tabular-nums">
                  {notes.filter((n) => n.itemType === "wish" || (n.price != null && n.price > 0)).length}
                </span>
              </button>
            </div>

            {/* Pílulas de Tags Temáticas */}
            <div className="flex flex-wrap gap-1.5">
              {["ALL", "#Ideias", "#TrabalhoACS", "#Estudos", "#Pessoal", "#Links"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedNoteTag(t)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                    selectedNoteTag === t
                      ? "bg-[#0A84FF] text-white shadow-sm"
                      : "bg-slate-900 text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t === "ALL" ? "Todas as Tags" : t}
                </button>
              ))}
            </div>

            {/* Cards do Mural */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {visibleNotes.map((n) => {
                const isWish = n.itemType === "wish" || (n.price != null && n.price > 0);
                return (
                  <div
                    key={n.id}
                    className={`glass-card p-5 rounded-3xl border transition flex flex-col justify-between space-y-3.5 relative overflow-hidden ${
                      n.completed
                        ? "border-emerald-500/30 bg-emerald-950/[0.08]"
                        : "border-white/[0.08] hover:border-indigo-500/30"
                    }`}
                  >
                    <div>
                      {/* Topo do Card: Check, Badges e Ações */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Botão de Check Interativo */}
                          <button
                            type="button"
                            onClick={() => onToggleNote(n.id)}
                            className="p-1 rounded-full hover:scale-110 transition shrink-0"
                            title={n.completed ? "Desmarcar conclusão" : isWish ? "Marcar como Já Comprado" : "Marcar como Concluído"}
                          >
                            {n.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-400 hover:text-emerald-400 transition" />
                            )}
                          </button>

                          {/* Selo de Conquistado / Realizado */}
                          {n.completed && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              ✓ {isWish ? "Conquistado" : "Realizado"}
                            </span>
                          )}

                          {/* Badge de Tipo / Tag */}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                            {n.tag}
                          </span>

                          {/* Badge de Prioridade (Termômetro de Impulso para Desejos) */}
                          {isWish && n.priority && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                n.priority === "Essencial"
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                  : n.priority === "Planejado"
                                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                                  : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              }`}
                            >
                              {n.priority === "Essencial"
                                ? "🔥 Essencial"
                                : n.priority === "Planejado"
                                ? "🎯 Planejado"
                                : "💭 Desejo"}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditNote(n)}
                            className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-white/5 transition"
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(n.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Título */}
                      <h4
                        className={`font-extrabold text-sm mb-1.5 leading-snug ${
                          n.completed ? "line-through text-slate-400" : "text-white"
                        }`}
                      >
                        {n.title}
                      </h4>

                      {/* Descrição / Conteúdo */}
                      <p
                        className={`text-xs leading-relaxed whitespace-pre-line ${
                          n.completed ? "text-slate-400" : "text-slate-300"
                        }`}
                      >
                        {n.description || n.content}
                      </p>

                      {/* Linha de Valor e Link da Loja para Desejos */}
                      {isWish && (
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-950/70 border border-white/5 mt-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-slate-400 block font-medium">Valor Estimado</span>
                            <strong className="text-base font-extrabold font-mono tabular-nums text-amber-400">
                              {formatBRL(n.price || 0)}
                            </strong>
                          </div>
                          {n.storeUrl && (
                            <a
                              href={n.storeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold inline-flex items-center gap-1.5 transition"
                              title="Abrir página da loja em nova aba"
                            >
                              🔗 Ver Loja <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Rodapé: Datas */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/5 font-mono tabular-nums">
                      <span>Criado: {formatDateBR(n.date)}</span>
                      {n.completed && n.completedAt && (
                        <span className="text-emerald-400 font-bold">Concluído: {formatDateBR(n.completedAt)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FORMULÁRIO DE CRIAÇÃO / EDIÇÃO */}
          <form
            onSubmit={handleSaveNote}
            className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4 text-xs h-fit"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">
                {editingNoteId ? "Editar Item" : "Novo Registro no Mural"}
              </h3>
              {editingNoteId && (
                <button
                  type="button"
                  onClick={handleCancelEditNote}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Cancelar
                </button>
              )}
            </div>

            {/* Alternador de Modo: Nota/Objetivo vs Desejo de Compra */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setNewNote({ ...newNote, itemType: "note" })}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  newNote.itemType !== "wish"
                    ? "bg-[#0A84FF] text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Nota / Objetivo
              </button>
              <button
                type="button"
                onClick={() => setNewNote({ ...newNote, itemType: "wish" })}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                  newNote.itemType === "wish"
                    ? "bg-amber-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Desejo de Compra (R$)
              </button>
            </div>

            {/* Título */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Título *</label>
              <input
                type="text"
                required
                placeholder={newNote.itemType === "wish" ? "Ex: Monitor Ultrawide 34 LG..." : "Ex: Revisão de DAX e SQL..."}
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Tag Categoria */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Tag de Contexto</label>
              <select
                value={newNote.tag}
                onChange={(e) => setNewNote({ ...newNote, tag: e.target.value as BrainNote["tag"] })}
                className={inputClass}
              >
                <option value="#Ideias">#Ideias</option>
                <option value="#TrabalhoACS">#TrabalhoACS</option>
                <option value="#Estudos">#Estudos</option>
                <option value="#Pessoal">#Pessoal</option>
                <option value="#Links">#Links</option>
              </select>
            </div>

            {/* Campos Específicos para Desejo de Compra */}
            {newNote.itemType === "wish" && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">Preço Estimado (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0,00"
                      value={newNote.price || ""}
                      onChange={(e) => setNewNote({ ...newNote, price: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">Prioridade / Impulso</label>
                    <select
                      value={newNote.priority || "Planejado"}
                      onChange={(e) => setNewNote({ ...newNote, priority: e.target.value as any })}
                      className={inputClass}
                    >
                      <option value="Essencial">🔥 Essencial</option>
                      <option value="Planejado">🎯 Planejado</option>
                      <option value="Desejo">💭 Desejo / Impulso</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Link da Loja (Opcional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newNote.storeUrl || ""}
                    onChange={(e) => setNewNote({ ...newNote, storeUrl: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {/* Descrição / Conteúdo */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">
                {newNote.itemType === "wish" ? "Motivo da Compra / Detalhes" : "Conteúdo da Nota / Meta"}
              </label>
              <textarea
                rows={3}
                placeholder={
                  newNote.itemType === "wish"
                    ? "Por que você precisa disso? Qual problema vai resolver?"
                    : "Descreva suas ideias, pontos de estudo ou metas..."
                }
                value={newNote.description || newNote.content || ""}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value, description: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Checkbox de Conclusão / Comprado */}
            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-950 border border-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(newNote.completed)}
                onChange={(e) => setNewNote({ ...newNote, completed: e.target.checked })}
                className="w-4 h-4 rounded accent-emerald-500"
              />
              <span className="text-xs text-slate-300 font-medium">
                {newNote.itemType === "wish" ? "Marcar como Já Comprado / Conquistado" : "Marcar como Já Concluído / Realizado"}
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
            >
              {editingNoteId
                ? "✓ Salvar Alterações"
                : newNote.itemType === "wish"
                ? "+ Adicionar à Lista de Desejos"
                : "+ Fixar no Mural"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ABA 8: CONFIGURAÇÕES, INTEGRAÇÕES CLOUD & AUDITORIA DE LOGS
  // ============================================================================
  if (activeTab === "settings") {
    const visibleLogs = systemLogs
      .filter((l) => logFilter === "ALL" || l.category === logFilter)
      .filter((l) => !logSearch.trim() || l.action.toLowerCase().includes(logSearch.toLowerCase()) || l.details.toLowerCase().includes(logSearch.toLowerCase()));

    return (
      <div className="space-y-6">
        <div className="glass-card px-4 py-2.5 rounded-2xl border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 shadow-xl mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden">
                {currentUserAvatar ? <img src={currentUserAvatar} alt={currentUser ? currentUser : "Avatar"} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-indigo-300" />}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-tight">Configurações Pessoais do Sistema</h2>
                <button type="button" onClick={() => setShowChangelogModal(true)} className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-mono font-bold transition">
                  v{APP_VERSION} (Changelog)
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Gerencie aparência, sistemas integrados, métodos, categorias e backups.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-[#0A84FF]/15 border border-[#0A84FF]/30 text-xs font-semibold text-[#0A84FF] flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#0A84FF]" /> Apple Copilot Pure
            </span>
            <button type="button" onClick={handleExportFullBackupJSON} className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition">
              <Download className="w-3.5 h-3.5" /> Backup (.JSON)
            </button>
            <label className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-indigo-300 cursor-pointer flex items-center gap-1.5 transition">
              <Upload className="w-3.5 h-3.5" /> Restaurar
              <input type="file" accept=".json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFullBackupJSON(f); }} />
            </label>
            <label className="px-3 py-1.5 rounded-xl bg-[#0A84FF] hover:bg-[#0070E0] text-white text-xs font-medium cursor-pointer flex items-center gap-1.5 transition shadow-sm">
              <Camera className="w-3.5 h-3.5" /> Foto de Perfil
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpdateProfileAvatar(f); }} />
            </label>
          </div>
        </div>

        {/* PAINEL DE SISTEMAS INTEGRADOS (GOOGLE SHEETS & STRAVA) */}
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-extrabold text-white">Sistemas Integrados & Cloud Sync</h3>
            <p className="text-xs text-slate-400">As conexões só são disparadas quando você clica no botão de sincronizar. Se houver falha, o status fica vermelho informando o motivo.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* CARD GOOGLE SHEETS */}
            <div className={`glass-card p-6 rounded-3xl border flex flex-col justify-between space-y-4 transition-all ${
              sheetsSyncStatus?.state === "error" ? "border-rose-500/60" : "border-emerald-500/25"
            }`}>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-xl ${sheetsSyncStatus?.state === "error" ? "bg-rose-500/15 text-rose-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                      <Table2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Google Sheets Cloud DB</h4>
                      <p className="text-[11px] text-slate-400">Sincronização bidirecional sob comando</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border flex items-center gap-1 ${
                    sheetsSyncStatus?.state === "error"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                      : sheetsSyncStatus?.state === "success"
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : sheetApiUrl
                      ? "bg-slate-800 text-slate-300 border-white/10"
                      : "bg-slate-900 text-slate-400 border-white/5"
                  }`}>
                    {sheetsSyncStatus?.state === "error" ? (
                      <><XCircle className="w-3.5 h-3.5 text-rose-400" /> Integração Inválida</>
                    ) : sheetsSyncStatus?.state === "success" ? (
                      <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sincronizado</>
                    ) : sheetApiUrl ? (
                      "Pronto p/ Sincronizar"
                    ) : (
                      "Não Configurado"
                    )}
                  </span>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">URL do App da Web (Google Apps Script terminado em /exec)</label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={sheetApiUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSheetApiUrl(val);
                      localStorage.setItem("lifeos_sheets_url", val.trim());
                      if (setSheetsSyncStatus) setSheetsSyncStatus({ state: "idle", message: "" });
                    }}
                    className={inputClass}
                  />
                </div>

                {sheetsSyncStatus && sheetsSyncStatus.state !== "idle" && (
                  <div className={`p-3.5 rounded-2xl border text-[11px] flex items-start gap-2.5 ${
                    sheetsSyncStatus.state === "error"
                      ? "bg-rose-950/70 border-rose-500/50 text-rose-200"
                      : "bg-emerald-950/50 border-emerald-500/30 text-emerald-200"
                  }`}>
                    {sheetsSyncStatus.state === "error" ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="block font-bold">
                        {sheetsSyncStatus.state === "error" ? "Integração Inválida:" : "Sincronização Concluída:"}
                      </strong>
                      <span>{sheetsSyncStatus.message}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={syncFromGoogleSheets}
                disabled={isSyncing}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
              >
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>{isSyncing ? "Sincronizando Planilha..." : "Sincronizar Planilha"}</span>
              </button>
            </div>

            {/* CARD IMPORTAÇÃO OFICIAL HISTÓRICA DO PATRIMÔNIO (SPRINT 18) */}
            <div className="glass-card p-6 rounded-3xl border border-indigo-500/25 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
                      <PiggyBank className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Histórico Oficial do Patrimônio</h4>
                      <p className="text-[11px] text-slate-400">56 lançamentos oficiais (2025-12 a 2026-10)</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold border bg-indigo-500/15 text-indigo-300 border-indigo-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Oficial Planilha
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Carga histórica certificada com os 56 aportes e resgates da Caixinha Turbo Nubank e BTG Pactual, totalizando <strong className="text-white">R$ 10.956,85</strong> em aportes e saldo líquido exato de <strong className="text-emerald-400 font-mono">R$ 2.616,61</strong>.
                </p>
              </div>

              {handleSyncOfficialPatrimonioData && (
                <button
                  type="button"
                  onClick={handleSyncOfficialPatrimonioData}
                  disabled={isSyncing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                >
                  {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span>Sincronizar 56 Lançamentos com o Supabase</span>
                </button>
              )}
            </div>

            {/* CARD STRAVA API */}
            <div className={`glass-card p-6 rounded-3xl border flex flex-col justify-between space-y-4 transition-all ${
              stravaSyncStatus?.state === "error" ? "border-rose-500/60" : "border-orange-500/25"
            }`}>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-xl ${stravaSyncStatus?.state === "error" ? "bg-rose-500/15 text-rose-400" : "bg-orange-500/15 text-orange-400"}`}>
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Strava Athlete API</h4>
                      <p className="text-[11px] text-slate-400">Importação oficial via OAuth2</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowStravaSecrets((p) => !p)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition"
                      title={showStravaSecrets ? "Ocultar chaves" : "Visualizar chaves"}
                    >
                      {showStravaSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border flex items-center gap-1 ${
                      stravaSyncStatus?.state === "error"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                        : stravaSyncStatus?.state === "success"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : stravaConfig.refreshToken
                        ? "bg-orange-500/15 text-orange-300 border-orange-500/30"
                        : "bg-slate-900 text-slate-400 border-white/5"
                    }`}>
                      {stravaSyncStatus?.state === "error" ? (
                        <><XCircle className="w-3.5 h-3.5 text-rose-400" /> Integração Inválida</>
                      ) : stravaSyncStatus?.state === "success" ? (
                        <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Conectado / Sincronizado</>
                      ) : stravaConfig.refreshToken ? (
                        "Pronto p/ Sincronizar"
                      ) : (
                        "Pendente"
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Athlete ID (Numérico)"
                    value={stravaConfig.athleteId}
                    onChange={(e) => {
                      const val = toCleanStr(e.target.value);
                      const n = {
                        athleteId: val,
                        clientId: toCleanStr(stravaConfig.clientId),
                        clientSecret: toCleanStr(stravaConfig.clientSecret),
                        refreshToken: toCleanStr(stravaConfig.refreshToken)
                      };
                      setStravaConfig(n);
                      localStorage.setItem("lifeos_strava_config", JSON.stringify(n));
                      if (setStravaSyncStatus) setStravaSyncStatus({ state: "idle", message: "" });
                    }}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Client ID (Numérico)"
                    value={stravaConfig.clientId}
                    onChange={(e) => {
                      const val = toCleanStr(e.target.value);
                      const n = {
                        athleteId: toCleanStr(stravaConfig.athleteId),
                        clientId: val,
                        clientSecret: toCleanStr(stravaConfig.clientSecret),
                        refreshToken: toCleanStr(stravaConfig.refreshToken)
                      };
                      setStravaConfig(n);
                      localStorage.setItem("lifeos_strava_config", JSON.stringify(n));
                      if (setStravaSyncStatus) setStravaSyncStatus({ state: "idle", message: "" });
                    }}
                    className={inputClass}
                  />
                  <input
                    type={showStravaSecrets ? "text" : "password"}
                    placeholder="Client Secret"
                    value={stravaConfig.clientSecret}
                    onChange={(e) => {
                      const val = toCleanStr(e.target.value);
                      const n = {
                        athleteId: toCleanStr(stravaConfig.athleteId),
                        clientId: toCleanStr(stravaConfig.clientId),
                        clientSecret: val,
                        refreshToken: toCleanStr(stravaConfig.refreshToken)
                      };
                      setStravaConfig(n);
                      localStorage.setItem("lifeos_strava_config", JSON.stringify(n));
                      if (setStravaSyncStatus) setStravaSyncStatus({ state: "idle", message: "" });
                    }}
                    className={inputClass}
                  />
                  <input
                    type={showStravaSecrets ? "text" : "password"}
                    placeholder="Refresh Token"
                    value={stravaConfig.refreshToken}
                    onChange={(e) => {
                      const val = toCleanStr(e.target.value);
                      const n = {
                        athleteId: toCleanStr(stravaConfig.athleteId),
                        clientId: toCleanStr(stravaConfig.clientId),
                        clientSecret: toCleanStr(stravaConfig.clientSecret),
                        refreshToken: val
                      };
                      setStravaConfig(n);
                      localStorage.setItem("lifeos_strava_config", JSON.stringify(n));
                      if (setStravaSyncStatus) setStravaSyncStatus({ state: "idle", message: "" });
                    }}
                    className={inputClass}
                  />
                </div>

                {stravaSyncStatus && stravaSyncStatus.state !== "idle" && (
                  <div className={`p-3.5 rounded-2xl border text-[11px] flex items-start gap-2.5 ${
                    stravaSyncStatus.state === "error"
                      ? "bg-rose-950/70 border-rose-500/50 text-rose-200"
                      : "bg-emerald-950/50 border-emerald-500/30 text-emerald-200"
                  }`}>
                    {stravaSyncStatus.state === "error" ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="block font-bold">
                        {stravaSyncStatus.state === "error" ? "Integração Inválida:" : "Strava Conectado:"}
                      </strong>
                      <span>{stravaSyncStatus.message}</span>
                    </div>
                  </div>
                )}

                {stravaScopeMode === "read_only" && stravaOauthUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(stravaOauthUrl, "strava_oauth", "width=600,height=750")}
                    className="w-full py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>🔓 Liberar Atividades Detalhadas (OAuth)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => syncStravaFromApi()}
                disabled={isSyncingStrava}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg transition"
              >
                {isSyncingStrava ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>{isSyncingStrava ? "Sincronizando Strava..." : "Sincronizar Strava"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* MÉTODOS E CATEGORIAS COM AÇÃO DE EDITAR (Requisito 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MÉTODOS DE PAGAMENTO */}
          <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">
                {editingMethodName ? "Editar Método de Pagamento" : "Métodos de Pagamento"}
              </h3>
              {editingMethodName && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMethodName(null);
                    setEditMethodInput("");
                  }}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingMethodName) {
                  if (props.handleUpdatePaymentMethod) {
                    props.handleUpdatePaymentMethod(editingMethodName, editMethodInput);
                  }
                  setEditingMethodName(null);
                  setEditMethodInput("");
                } else {
                  handleAddPaymentMethod(e);
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                required
                placeholder={editingMethodName ? "Nome do Método..." : "Novo Método (Ex: Vale Refeição...)"}
                value={editingMethodName ? editMethodInput : newMethodName}
                onChange={(e) => {
                  if (editingMethodName) setEditMethodInput(e.target.value);
                  else setNewMethodName(e.target.value);
                }}
                className={inputClass}
              />
              <button
                type="submit"
                className={`px-4 py-2.5 rounded-xl text-white font-extrabold shrink-0 transition ${
                  editingMethodName
                    ? "bg-[#0A84FF] hover:bg-[#0070E0]"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {editingMethodName ? "✓ Salvar" : "+ Cadastrar"}
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-1">
              {paymentMethods.map((m) => (
                <span
                  key={m}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-slate-200 font-semibold transition ${
                    editingMethodName === m
                      ? "bg-indigo-600/30 border-indigo-500 text-white"
                      : "bg-slate-950 border-white/10"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{m}</span>
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMethodName(m);
                        setEditMethodInput(m);
                      }}
                      className="text-slate-400 hover:text-indigo-300 p-0.5 rounded transition"
                      title={`Editar método ${m}`}
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePaymentMethod(m)}
                      className="text-slate-400 hover:text-rose-400 p-0.5"
                      title="Excluir método"
                    >
                      ×
                    </button>
                  </div>
                </span>
              ))}
            </div>
          </div>

          {/* CATEGORIAS PERSONALIZADAS */}
          <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">
                {editingCategoryName ? "Editar Categoria Personalizada" : "Categorias Personalizadas"}
              </h3>
              {editingCategoryName && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategoryName(null);
                    setEditCategoryForm({
                      name: "",
                      flow: "EXPENSE",
                      isAuto: false,
                      color: "#6366f1"
                    });
                  }}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingCategoryName) {
                  if (props.handleUpdateCategory) {
                    props.handleUpdateCategory(
                      editingCategoryName,
                      {
                        name: editCategoryForm.name,
                        flow: editCategoryForm.flow,
                        isAuto: editCategoryForm.isAuto
                      },
                      editCategoryForm.color
                    );
                  }
                  setEditingCategoryName(null);
                  setEditCategoryForm({
                    name: "",
                    flow: "EXPENSE",
                    isAuto: false,
                    color: "#6366f1"
                  });
                } else {
                  handleAddCustomCategory(e);
                }
              }}
              className="space-y-2.5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nome da Categoria..."
                  value={editingCategoryName ? editCategoryForm.name : newCategoryForm.name}
                  onChange={(e) => {
                    if (editingCategoryName)
                      setEditCategoryForm({ ...editCategoryForm, name: e.target.value });
                    else setNewCategoryForm({ ...newCategoryForm, name: e.target.value });
                  }}
                  className={inputClass}
                />
                <select
                  value={editingCategoryName ? editCategoryForm.flow : newCategoryForm.flow}
                  onChange={(e) => {
                    const f = e.target.value as FlowType;
                    if (editingCategoryName) setEditCategoryForm({ ...editCategoryForm, flow: f });
                    else setNewCategoryForm({ ...newCategoryForm, flow: f });
                  }}
                  className={inputClass}
                >
                  <option value="EXPENSE">Despesa / Saída</option>
                  <option value="INCOME">Receita / Entrada</option>
                  <option value="INVESTMENT">Aporte / Investimento</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCategoryName ? editCategoryForm.isAuto : newCategoryForm.isAuto}
                    onChange={(e) => {
                      if (editingCategoryName)
                        setEditCategoryForm({ ...editCategoryForm, isAuto: e.target.checked });
                      else setNewCategoryForm({ ...newCategoryForm, isAuto: e.target.checked });
                    }}
                  />
                  <span>Vincular aos Veículos (KM/L)</span>
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={editingCategoryName ? editCategoryForm.color : newCategoryForm.color}
                    onChange={(e) => {
                      if (editingCategoryName)
                        setEditCategoryForm({ ...editCategoryForm, color: e.target.value });
                      else setNewCategoryForm({ ...newCategoryForm, color: e.target.value });
                    }}
                    className="color-circle"
                  />
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-xl text-white font-extrabold transition ${
                      editingCategoryName
                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-lg"
                        : "bg-[#0A84FF] hover:bg-[#0070E0]"
                    }`}
                  >
                    {editingCategoryName ? "✓ Salvar Alterações" : "+ Criar Categoria"}
                  </button>
                </div>
              </div>
            </form>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
              {categoriesCatalog.map((cat) => {
                const col = categoryColors[cat.name] || "#6366f1";
                const isBeingEdited = editingCategoryName === cat.name;
                return (
                  <span
                    key={cat.name}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                      isBeingEdited ? "ring-2 ring-indigo-400 scale-105" : ""
                    }`}
                    style={{ backgroundColor: `${col}22`, color: col, border: `1px solid ${col}44` }}
                  >
                    {renderCategorySemanticIcon(cat.name, col)}
                    <span>{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryName(cat.name);
                        setEditCategoryForm({
                          name: cat.name,
                          flow: cat.flow,
                          isAuto: Boolean(cat.isAuto),
                          color: col
                        });
                      }}
                      className="hover:text-white p-0.5 ml-1 transition"
                      title={`Editar categoria ${cat.name}`}
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                    {cat.name !== "A Receber" && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.name)}
                        className="hover:text-white ml-0.5"
                        title="Excluir categoria"
                      >
                        ×
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* PALETA DE CORES DOS GRÁFICOS */}
        <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4 text-xs">
          <h3 className="text-sm font-extrabold text-white">Paleta de Cores dos Gráficos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {([
              { key: "patrimonyLine", label: "Patrimônio" },
              { key: "aporteLine", label: "Aportes" },
              { key: "creditUsedBar", label: "Crédito Usado" },
              { key: "creditAvailableBar", label: "Crédito Livre" },
              { key: "odometerLine", label: "Odômetro" },
              { key: "weightLine", label: "Peso (kg)" },
              { key: "bfLine", label: "Gordura (BF%)" }
            ] as { key: keyof ChartThemeColors; label: string }[]).map((item) => (
              <label key={item.key} className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 flex flex-col items-center gap-2 cursor-pointer hover:border-indigo-500/40 transition text-center">
                <input type="color" value={chartTheme[item.key]} onChange={(e) => updateChartThemeColor(item.key, e.target.value)} className="color-circle" style={{ width: "32px", height: "32px" }} />
                <span className="text-[11px] text-slate-300 font-semibold">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* METAS E ALERTAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4 text-xs">
            <h3 className="text-sm font-extrabold text-white">Meus Limites e Metas Anuais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Limite Gastos Pessoais (R$)</label>
                <input type="number" value={personalBudgetLimit} onChange={(e) => { const v = Number(e.target.value); setPersonalBudgetLimit(v); updateGoalsStorage(v, monthlyInvestmentGoal, patrimonyTarget, annualRunGoalKm); }} className={inputClass} />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Meta Aporte Mensal (R$)</label>
                <input type="number" value={monthlyInvestmentGoal} onChange={(e) => { const v = Number(e.target.value); setMonthlyInvestmentGoal(v); updateGoalsStorage(personalBudgetLimit, v, patrimonyTarget, annualRunGoalKm); }} className={inputClass} />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Alvo de Patrimônio (R$)</label>
                <input type="number" value={patrimonyTarget} onChange={(e) => { const v = Number(e.target.value); setPatrimonyTarget(v); updateGoalsStorage(personalBudgetLimit, monthlyInvestmentGoal, v, annualRunGoalKm); }} className={inputClass} />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Meta Corrida Strava (KM)</label>
                <input type="number" value={annualRunGoalKm} onChange={(e) => { const v = Number(e.target.value); setAnnualRunGoalKm(v); updateGoalsStorage(personalBudgetLimit, monthlyInvestmentGoal, patrimonyTarget, v); }} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-3 text-xs">
            <h3 className="text-sm font-extrabold text-white">Alertas de Revisão Automotiva</h3>
            <form onSubmit={handleAddAlertRule} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input type="text" required placeholder="Ex: Troca de Óleo" value={newAlert.title} onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })} className={inputClass} />
              <input type="number" required placeholder="KM Alvo (Ex: 50000)" value={newAlert.targetValue} onChange={(e) => setNewAlert({ ...newAlert, targetValue: e.target.value })} className={inputClass} />
              <button type="submit" className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition">+ Criar Alerta</button>
            </form>
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {alertRules.map((r) => (
                <div key={r.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.07] flex items-center justify-between">
                  <span><strong>{r.title}</strong> (<span className="font-mono tabular-nums">{r.targetValue.toLocaleString("pt-BR")} km</span>)</span>
                  <button onClick={() => saveAlertRules(alertRules.filter((item) => item.id !== r.id))} className="text-slate-400 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AUDITORIA DE LOGS COM BUSCA */}
        <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" /> Registro de Logs & Auditoria
              </h3>
              <p className="text-[11px] text-slate-400">Histórico cronológico de eventos e alterações do sistema.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
                <input
                  type="text"
                  placeholder="Filtrar ação nos logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <select value={logFilter} onChange={(e) => setLogFilter(e.target.value)} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white">
                <option value="ALL">Todos ({systemLogs.length})</option>
                <option value="FINANCE">Finanças</option>
                <option value="CONFIG">Configurações</option>
                <option value="AUTH">Acessos</option>
              </select>
              <button type="button" onClick={() => { setSystemLogs([]); localStorage.removeItem("lifeos_system_logs_v8"); }} className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold transition">
                Limpar Logs
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-950 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Data e Hora</th>
                  <th className="py-2.5 px-3">Usuário</th>
                  <th className="py-2.5 px-3">Módulo</th>
                  <th className="py-2.5 px-3">Ação Registrada</th>
                  <th className="py-2.5 px-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {visibleLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.03] transition">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{log.user}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${log.category === "SECURITY" || log.category === "AUTH" ? "bg-amber-500/15 text-amber-300" : log.category === "CONFIG" ? "bg-indigo-500/15 text-indigo-300" : "bg-emerald-500/15 text-emerald-300"}`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">{log.action}</td>
                    <td className="py-2.5 px-3 text-slate-400">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
