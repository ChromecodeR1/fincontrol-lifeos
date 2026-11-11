"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Plus, CreditCard, Car, Table2, Search, CheckCircle2, Clock, Trash2,
  RefreshCw, Activity, Brain, Target, Flame, Pencil,
  Image as ImageIcon, Download, Upload, Camera, User, FileText, HandCoins,
  Users, Share2, Layers, AlertTriangle, XCircle, Eye, EyeOff, Filter, Loader2,
  ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, ChevronRight, Check, X, RotateCcw,
  SlidersHorizontal, Settings, Fuel, Gauge, DollarSign, Award, Info, Landmark, PiggyBank,
  Sparkles, ExternalLink, ShoppingBag, Circle, Footprints, Lock, Timer, Heart, Calendar, MapPin,
  Sun, Moon, Cloud, Database, Server, ShieldCheck
} from "lucide-react";
import {
  ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, BarChart, Bar, LineChart, Line, ReferenceLine, Cell
} from "recharts";
import {
  ActiveTab, Transaction, CreditCardItem, BankItem, BankInstitution, StaticStatusItem, WishlistItem,
  BioLog, StravaStats, StravaActivity, BrainNote, PersonalOKR, CustomAlertRule, ChartThemeColors,
  CategoryCatalogItem, SystemLogEntry, ThemeMode, FlowType, TxStatus, APP_VERSION,
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
import { parseDateParts } from "./lib/domain/date-br";
import { BanksTab } from "./components/BanksTab";
import { VehiclesTab } from "./components/VehiclesTab";
import { InvestmentsTab } from "./components/InvestmentsTab";
import { AboutTab } from "./components/AboutTab";
import { AmbientFxMode, AMBIENT_FX_OPTIONS } from "./components/AmbientBackgroundFX";
import { AnimatedNumber144, AnimatedBRL144, AnimatedMetric144, AnimatedBRL, AnimatedMetric } from "./components/AnimatedNumber144";
import { SlidingSegmentedControl } from "./components/SlidingSegmentedControl";
import { triggerAuraBurst } from "./components/MotionEngine144";
import { verifyLiveCloudSyncStatus, LiveCloudSyncAuditResult, runForensicCloudRecovery } from "./lib/services/coindex-supabase";

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
  const rounded = Math.round(totalSec);
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
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
  bgFxMode?: AmbientFxMode;
  handleSelectBgFxMode?: (mode: AmbientFxMode) => void;
  cupertinoTheme?: "light" | "dark";
  toggleCupertinoTheme?: (theme: "light" | "dark") => void;
  handleLaunchFixedTransactions?: (targetMonth?: string) => Promise<{ createdCount: number; totalCount: number }>;
  filteredTransactions: Transaction[];
  transactions: Transaction[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleExportCSV: () => void;
  handleOpenNewTxModal: (defaultCategory?: string) => void;
  onAddTransaction?: (tx: Transaction) => Promise<void> | void;
  onSaveInvestmentTx?: (tx: Partial<Transaction>, isEdit?: boolean) => void;
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
  onUpdateSingleTransaction?: (id: string, updates: Partial<Transaction>) => void;
  onBatchUpdateStatus?: (txIds: string[], newStatus: TxStatus) => void;
  onBatchChangeCategory?: (txIds: string[], newCategory: string) => void;
  onBatchDeleteTransactions?: (txIds: string[]) => void;
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
  setStravaActivities?: React.Dispatch<React.SetStateAction<StravaActivity[]>>;
  stravaScopeMode?: "detailed" | "read_only" | null;
  stravaOauthUrl?: string;
  realBalanceOverride?: number;
  onSaveRealBalanceOverride?: (val: number) => void;
  visibleMarketCharts?: string[];
  onUpdateVisibleMarketCharts?: (charts: string[]) => void;
  simulatorMonthlyContribution?: number;
  onUpdateSimulatorMonthlyContribution?: (amount: number) => void;
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
  currentUserId?: string | null;
  pushFullStateToCloud?: (options?: { showToast?: boolean }) => Promise<{ ok: boolean; count?: number; error?: string }>;
  handleManualForceCloudSync?: () => Promise<void>;
  syncStatus?: "idle" | "success" | "error";
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

// ============================================================================
// SPRINT 47: CARD DO STRAVA PROGRESS + METAS ISOLADO COM REACT.MEMO (144HZ ZERO-JANK)
// Desacopla o scrubbing do mouse da árvore do SecondaryTabs para 144fps contínuos
// ============================================================================
// SPRINT 47 & 51: CARD DO STRAVA PROGRESS + METAS ISOLADO COM REACT.MEMO (144HZ ZERO-JANK)
// Desacopla o scrubbing do mouse da árvore do SecondaryTabs para 144fps contínuos
// ============================================================================
interface StravaProgressGridProps {
  stravaProgressPoints: any[];
  stravaSport: "run" | "all";
  setStravaSport: (s: "run" | "all") => void;
  stravaPeriod: "7D" | "1M" | "3M" | "6M" | "1Y";
  setStravaPeriod: (p: "7D" | "1M" | "3M" | "6M" | "1Y") => void;
  stravaGranularity: "per_run" | "weekly";
  setStravaGranularity: (g: "per_run" | "weekly") => void;
  selectedPointIndex: number;
  setSelectedPointIndex: (idx: number) => void;
  stravaGearRef: React.RefObject<HTMLButtonElement | null>;
  stravaSettingsOpen: boolean;
  setStravaSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  stravaChartSettings: ChartWidgetSettings;
  handleUpdateStravaChartSettings: (s: ChartWidgetSettings) => void;
  currentWeekStats: any;
  weeklyRunGoalKm: number;
  annualProgressStats: any;
  setEditWeeklyGoal: (v: string) => void;
  setEditAnnualGoal: (v: string) => void;
  setIsGoalsModalOpen: (open: boolean) => void;
  stravaYTicks: number[];
  stravaYTop: number;
}

const StravaProgressGrid = React.memo(function StravaProgressGrid(props: StravaProgressGridProps) {
  const {
    stravaProgressPoints,
    stravaSport,
    setStravaSport,
    stravaPeriod,
    setStravaPeriod,
    stravaGranularity,
    setStravaGranularity,
    selectedPointIndex,
    setSelectedPointIndex,
    stravaGearRef,
    stravaSettingsOpen,
    setStravaSettingsOpen,
    stravaChartSettings,
    handleUpdateStravaChartSettings,
    currentWeekStats,
    weeklyRunGoalKm,
    annualProgressStats,
    setEditWeeklyGoal,
    setEditAnnualGoal,
    setIsGoalsModalOpen,
    stravaYTicks,
    stravaYTop
  } = props;

  const activeStravaPoint =
    stravaProgressPoints[selectedPointIndex] ||
    stravaProgressPoints[stravaProgressPoints.length - 1] || {
      rangeLabel: "Treino Selecionado",
      distanceKm: 0,
      movingTimeMin: 0,
      elevationGain: 0,
      pace: "—",
      xLabel: ""
    };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* COLUNA ESQUERDA (lg:col-span-8): CARD DO GRÁFICO INTERATIVO STRAVA PROGRESS */}
      <div className="lg:col-span-8 bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          {/* Barra de Pílulas no Topo do Card */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            {/* À esquerda: Seletor de Granularidade e Esporte */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Pílula de Granularidade: [📍 Cada Corrida | 📅 Por Semana] */}
              <SlidingSegmentedControl
                options={[
                  { id: "per_run", label: "📍 Cada Corrida" },
                  { id: "weekly", label: "📅 Por Semana" }
                ]}
                value={stravaGranularity}
                onChange={(val) => setStravaGranularity(val as "per_run" | "weekly")}
                size="xs"
                activeColor="bg-[#FC4C02]"
              />

              {/* Pílula seletora de esporte */}
              <SlidingSegmentedControl
                options={[
                  { id: "run", label: "🏃 Corrida" },
                  { id: "all", label: "🔥 Todos" }
                ]}
                value={stravaSport}
                onChange={(val) => setStravaSport(val as "run" | "all")}
                size="xs"
                activeColor="bg-[#FC4C02]"
              />
            </div>

            {/* À direita: As 5 pílulas oficiais de período do Strava + Engrenagem */}
            <div className="flex items-center gap-1.5">
              <SlidingSegmentedControl
                options={[
                  { id: "7D", label: "7D" },
                  { id: "1M", label: "1M" },
                  { id: "3M", label: "3M" },
                  { id: "6M", label: "6M" },
                  { id: "1Y", label: "1Y" }
                ]}
                value={stravaPeriod}
                onChange={(val) => setStravaPeriod(val as "7D" | "1M" | "3M" | "6M" | "1Y")}
                size="xs"
                activeColor="bg-[#FC4C02]"
              />

              {/* Popover de Configurações */}
              <div className="relative">
                <button
                  ref={stravaGearRef}
                  type="button"
                  onClick={() => setStravaSettingsOpen((prev) => !prev)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-[var(--cupertino-border)] transition cursor-pointer"
                  title="Configurações do gráfico Strava"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>

                <ChartSettingsPopover
                  isOpen={stravaSettingsOpen}
                  onClose={() => setStravaSettingsOpen(false)}
                  anchorRef={stravaGearRef}
                  chartKind="area"
                  hasMultipleSeries={false}
                  settings={stravaChartSettings}
                  onChange={handleUpdateStravaChartSettings}
                />
              </div>
            </div>
          </div>

          {/* Cabeçalho Dinâmico de Telemetria Acima do Gráfico (4 Colunas) */}
          <div className="mb-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <h4 className="text-base sm:text-lg font-bold text-[var(--cupertino-text)] tracking-tight flex items-center gap-2">
                <Footprints className="w-4 h-4 text-[#FC4C02]" />
                <span>{activeStravaPoint.rangeLabel}</span>
              </h4>
              {activeStravaPoint.avgSpeedKmh && (
                <span className="text-xs font-mono font-bold text-orange-400 px-2 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/25">
                  ⚡ {activeStravaPoint.avgSpeedKmh} km/h
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-[var(--cupertino-border)] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Distância
                </span>
                <span className="tabular-nums text-2xl font-extrabold text-[var(--cupertino-text)]">
                  <AnimatedMetric value={activeStravaPoint.distanceKm} decimals={2} />{" "}
                  <span className="text-sm font-semibold text-slate-400">km</span>
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Pace Médio
                </span>
                <span className="tabular-nums text-2xl font-extrabold text-emerald-400">
                  {activeStravaPoint.pace || "—"}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Tempo Mov.
                </span>
                <span className="tabular-nums text-2xl font-extrabold text-[var(--cupertino-text)]">
                  {activeStravaPoint.movingTimeMin >= 60
                    ? `${Math.floor(activeStravaPoint.movingTimeMin / 60)}h ${String(Math.round(activeStravaPoint.movingTimeMin % 60)).padStart(2, "0")}m`
                    : `${Math.round(activeStravaPoint.movingTimeMin)}m`}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Ganho Elev.
                </span>
                <span className="tabular-nums text-2xl font-extrabold text-indigo-300">
                  <AnimatedMetric value={Math.round(activeStravaPoint.elevationGain)} decimals={0} />{" "}
                  <span className="text-sm font-semibold text-slate-400">m</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Área do Gráfico Recharts Estilo Strava Progress */}
        <div
          style={{ height: getChartHeightPx(stravaChartSettings.height, 240), width: "100%" }}
          className="w-full select-none"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stravaProgressPoints}
              syncId="coindex_strava_sync"
              margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
              accessibilityLayer={false}
              onMouseMove={(state: any) => {
                if (state && typeof state.activeTooltipIndex === "number" && state.activeTooltipIndex >= 0) {
                  setSelectedPointIndex(state.activeTooltipIndex);
                }
              }}
              onClick={(state: any) => {
                if (state && typeof state.activeTooltipIndex === "number" && state.activeTooltipIndex >= 0) {
                  setSelectedPointIndex(state.activeTooltipIndex);
                }
              }}
            >
              <defs>
                <linearGradient id="stravaOrangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FC4C02" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#FC4C02" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.15)" />

              <XAxis
                dataKey="xLabel"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                orientation="right"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, stravaYTop]}
                ticks={stravaYTicks}
                tickFormatter={(v) => `${v} km`}
                width={45}
              />

              <Tooltip
                content={() => null}
                cursor={{ stroke: "#FC4C02", strokeWidth: 1.5, strokeDasharray: "3 3" }}
              />

              {activeStravaPoint?.xLabel && (
                <ReferenceLine
                  x={activeStravaPoint.xLabel}
                  stroke="#FC4C02"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              )}

              <Area
                type="monotone"
                dataKey="distanceKm"
                name="Distância"
                stroke="#FC4C02"
                strokeWidth={2.5}
                fill="url(#stravaOrangeGrad)"
                isAnimationActive={false}
                dot={(props: any) => {
                  const { cx, cy, index } = props;
                  if (cx == null || cy == null || !Number.isFinite(cx) || !Number.isFinite(cy)) return null;
                  const isSel = index === selectedPointIndex;
                  if (isSel) {
                    return (
                      <g
                        key={`strava-dot-${index}`}
                        className="cursor-pointer"
                        onClick={() => setSelectedPointIndex(index)}
                      >
                        <circle cx={cx} cy={cy} r={11} fill="rgba(252, 76, 2, 0.25)" />
                        <circle cx={cx} cy={cy} r={6} fill="#FC4C02" stroke="#FFFFFF" strokeWidth={2.5} />
                      </g>
                    );
                  }
                  return (
                    <circle
                      key={`strava-dot-${index}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="#131824"
                      stroke="#FC4C02"
                      strokeWidth={2}
                      className="cursor-pointer transition-transform hover:scale-125"
                      onClick={() => setSelectedPointIndex(index)}
                    />
                  );
                }}
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* COLUNA DIREITA (lg:col-span-4): CARD DUPLO DE METAS (ESTA SEMANA + ESTE ANO) */}
      <div className="lg:col-span-4 bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] rounded-2xl p-5 shadow-lg flex flex-col justify-between relative">
        {/* Botão de Edição das Metas no Canto Superior Direito */}
        <button
          type="button"
          onClick={() => {
            setEditWeeklyGoal(String(weeklyRunGoalKm));
            setEditAnnualGoal(String(annualProgressStats.annualGoal));
            setIsGoalsModalOpen(true);
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-[var(--cupertino-border)] transition cursor-pointer"
          title="Editar metas de corrida"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        {/* Metade Superior: ESTA SEMANA */}
        <div className="flex flex-col items-center">
          <h5 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center">
            ESTA SEMANA
          </h5>

          <div className="text-2xl font-extrabold tabular-nums text-center text-[var(--cupertino-text)] mt-1">
            <AnimatedMetric value={currentWeekStats.weeklyCurrentKm} decimals={1} /> / {weeklyRunGoalKm} km
          </div>

          <div className="flex items-center justify-between gap-3 my-4 w-full px-2">
            {/* Dias da Semana (S T Q Q S S D) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {currentWeekStats.daysInfo.map((d: any, i: number) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-3.5 sm:w-4 h-1 rounded-full transition-colors ${
                      d.hasRun || d.isToday ? "bg-[#FC4C02]" : "bg-slate-700"
                    }`}
                  />
                  <span className="text-[10px] font-bold text-slate-400">{d.letter}</span>
                </div>
              ))}
            </div>

            {/* Anel Circular com Tênis de Corrida */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="24"
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="24"
                  stroke="#FC4C02"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={
                    2 *
                    Math.PI *
                    24 *
                    (1 - Math.min(1, currentWeekStats.weeklyCurrentKm / Math.max(1, weeklyRunGoalKm)))
                  }
                  strokeLinecap="round"
                  fill="none"
                  style={{
                    transition: "stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1)"
                  }}
                  className="animate-svg-draw"
                />
              </svg>
              {/* Ponto luminoso na ponta do arco */}
              <div className="absolute inset-0 flex items-center justify-center text-[#FC4C02]">
                <Footprints className="w-5 h-5 drop-shadow-[0_0_8px_rgba(252,76,2,0.6)]" />
              </div>
            </div>
          </div>

          {/* Rodapé de ESTA SEMANA */}
          <p className="text-center text-xs text-slate-400 font-medium">
            {currentWeekStats.weeklyHours}h {currentWeekStats.weeklyMins}min • {currentWeekStats.weeklyElev} m de subida
          </p>
        </div>

        {/* Divisor Separando as Duas Metades */}
        <div className="border-t border-[var(--cupertino-border)] pt-4 mt-4" />

        {/* Metade Inferior: ESTE ANO (Com Barra de Ritmo e Marcador HOJE) */}
        <div className="flex flex-col items-center">
          <h5 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center">
            ESTE ANO
          </h5>

          <div className="text-2xl font-extrabold tabular-nums text-center text-[var(--cupertino-text)] mt-1">
            <AnimatedMetric value={annualProgressStats.ytdKm} decimals={0} /> / {annualProgressStats.annualGoal} km
          </div>

          {/* Barra de Progresso Anual com Marcador HOJE com transição suave 750ms */}
          <div className="relative h-3.5 w-full bg-slate-800/90 rounded-sm overflow-visible my-5">
            <div
              className="bg-[#34D399] h-full rounded-l-sm"
              style={{
                width: `${annualProgressStats.progressPct}%`,
                transition: "width 750ms cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            />
            <div
              className="absolute -top-1 bottom-[-8px] w-[2px] bg-slate-300 pointer-events-none"
              style={{
                left: `${annualProgressStats.todayPct}%`,
                transition: "left 750ms cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-slate-300 whitespace-nowrap">
                HOJE
              </span>
            </div>
          </div>

          {/* Frase de Status do Ritmo */}
          <div className="text-center mt-3">
            {annualProgressStats.paceDeltaKm < 0 && (
              <span className="text-xs font-semibold text-[#FC4C02]">
                {Math.abs(annualProgressStats.paceDeltaKm)} km abaixo do ritmo
              </span>
            )}
            {annualProgressStats.paceDeltaKm > 0 && (
              <span className="text-xs font-semibold text-[#34D399]">
                {annualProgressStats.paceDeltaKm} km acima do ritmo
              </span>
            )}
            {annualProgressStats.paceDeltaKm === 0 && (
              <span className="text-xs font-semibold text-slate-300">
                Exatamente no ritmo da meta
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default function SecondaryTabs(props: SecondaryTabsProps) {
  const {
    activeTab, moneyBlur, currentUser, currentUserAvatar, themeMode, changeThemeMode,
    bgFxMode, handleSelectBgFxMode, cupertinoTheme, toggleCupertinoTheme,
    setShowChangelogModal, staticStatus, editingStatusId, setEditingStatusId, newStatusItem,
    setNewStatusItem, handleSaveStaticStatus, saveStaticStatus, filteredTransactions, transactions,
    searchQuery, setSearchQuery, handleExportCSV, handleOpenNewTxModal, onAddTransaction, onSaveInvestmentTx, onBatchImportTransactions, dailyQuotaInfo, cdiAnnualRate, getFlowType,
    banks, editingBankId, setEditingBankId, newBank, setNewBank, handleSaveBank, handleDeleteBank,
    cards, categoryColors, handleToggleStatus, handleStartEditTransaction, handleDeleteTransaction,
    onUpdateSingleTransaction, onBatchUpdateStatus, onBatchChangeCategory, onBatchDeleteTransactions,
    receivableItems, receivablesAnalytics, handleAssignDebtor, handlePartialPaymentReceivable,
    notify, editingCardId, setEditingCardId, newCard, setNewCard, handleSaveCard, handleDeleteCard,
    handlePayCardInvoice, wishlist, editingWishId, setEditingWishId, newWish, setNewWish,
    handleSaveWish, handleIncrementWish, handleDeleteWish, personalBudgetLimit, autoMetrics,
    chartTheme, updateChartThemeColor, stravaStats, stravaActivities = [], setStravaActivities, stravaScopeMode, stravaOauthUrl, isSyncingStrava, syncStravaFromApi,
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
    setSystemLogs, logFilter, setLogFilter,
    realBalanceOverride, onSaveRealBalanceOverride,
    visibleMarketCharts, onUpdateVisibleMarketCharts,
    simulatorMonthlyContribution, onUpdateSimulatorMonthlyContribution,
    currentUserId, pushFullStateToCloud, handleManualForceCloudSync, syncStatus = "idle"
  } = props;

  // SPRINT 64: Estado da Auditoria Verídica de Nuvem (Henrique Montenegro)
  const [cloudAudit, setCloudAudit] = useState<LiveCloudSyncAuditResult | null>(null);
  const [isAuditingCloud, setIsAuditingCloud] = useState<boolean>(false);

  const runCloudAudit = React.useCallback(async () => {
    if (!currentUserId) return;
    setIsAuditingCloud(true);
    try {
      const res = await verifyLiveCloudSyncStatus(currentUserId, transactions.length, cards.length);
      setCloudAudit(res);
    } catch (err) {
      console.error("[cloud-audit] Erro:", err);
    } finally {
      setIsAuditingCloud(false);
    }
  }, [currentUserId, transactions.length, cards.length]);

  // SPRINT 66: Resgate Forense de Lançamentos de Set/Out/Nov
  const [isRecovering, setIsRecovering] = useState<boolean>(false);
  const handleForensicRecoveryClick = React.useCallback(async () => {
    if (!currentUserId || isRecovering) return;
    setIsRecovering(true);
    try {
      notify("🩺 Iniciando Resgate Forense", "Varrendo cofres, backups e corrigindo datas invertidas no Supabase...", "info", "CONFIG");
      const res = await runForensicCloudRecovery(currentUserId, transactions);
      if (res.ok) {
        notify(
          "✅ Resgate Concluído com Sucesso!",
          `Foram resgatados/corrigidos ${res.recoveredCount} lançamentos. Total sincronizado: ${res.totalCount}.`,
          "success",
          "CONFIG"
        );
        if (handleManualForceCloudSync) {
          await handleManualForceCloudSync();
        }
        void runCloudAudit();
      } else {
        notify("⚠️ Resgate Forense", res.message || "Nenhum lançamento adicional localizado.", "warning", "CONFIG");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      notify("Erro no Resgate Forense", msg, "error", "CONFIG");
    } finally {
      setIsRecovering(false);
    }
  }, [currentUserId, isRecovering, transactions, notify, handleManualForceCloudSync, runCloudAudit]);

  useEffect(() => {
    if (activeTab === "settings" && currentUserId && !cloudAudit && !isAuditingCloud) {
      void runCloudAudit();
    }
  }, [activeTab, currentUserId, cloudAudit, isAuditingCloud, runCloudAudit]);

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
      color: "#FC4C02",
      chartType: "area",
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

  // SPRINT 41: Estados do Redesign do Painel Strava Progress & Widget de Metas
  const [stravaInnerTab, setStravaInnerTab] = useState<"progress" | "activities">("progress");
  const [stravaSport, setStravaSport] = useState<"run" | "all">("run");
  const [stravaPeriod, setStravaPeriod] = useState<"7D" | "1M" | "3M" | "6M" | "1Y">("3M");
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [editWeeklyGoal, setEditWeeklyGoal] = useState<string>("15");
  const [editAnnualGoal, setEditAnnualGoal] = useState<string>("500");
  const [weeklyRunGoalKm, setWeeklyRunGoalKm] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("fincontrol_weekly_run_goal_km");
        if (saved) return Number(saved) || 15;
      } catch {}
    }
    return 15;
  });

  // SPRINT 51: Granularidade Strava ("per_run" | "weekly") e Ponto Selecionado
  const [stravaGranularity, setStravaGranularity] = useState<"per_run" | "weekly">("per_run");
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(0);

  // SPRINT 51: Filtros da Tabela Detalhada Linha por Linha de Corridas
  const [runSearchQuery, setRunSearchQuery] = useState("");
  const [runDistFilter, setRunDistFilter] = useState<"all" | "3k" | "5k" | "10k" | "21k">("all");
  const [runMonthFilter, setRunMonthFilter] = useState<string>("all");

  // SPRINT 51: Modal de Registro Manual de Corrida
  const [isManualRunModalOpen, setIsManualRunModalOpen] = useState(false);
  const [manualRunDate, setManualRunDate] = useState(todayBR());
  const [manualRunTime, setManualRunTime] = useState("07:00");
  const [manualRunName, setManualRunName] = useState("");
  const [manualRunDistance, setManualRunDistance] = useState("");
  const [manualRunDurationMin, setManualRunDurationMin] = useState("");
  const [manualRunElevation, setManualRunElevation] = useState("");
  const [manualRunHr, setManualRunHr] = useState("");


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
    const sorted = [...filteredBioLogs].sort((a, b) => compareDatesBR(a.date, b.date));
    const initialLog = sorted[0];
    const currentLog = sorted[sorted.length - 1];
    const initialWeight = Number(initialLog.weight) || 0;
    const currentWeight = Number(currentLog.weight) || 0;
    const deltaWeight = safeSub(currentWeight, initialWeight);
    const deltaPct = initialWeight > 0 ? (deltaWeight / initialWeight) * 100 : 0;
    const currentBf = currentLog.bf != null ? Number(currentLog.bf) : null;

    // Se a pesagem atual não tiver percentual de gordura (bf), busca o último bf válido anterior
    let validBf: number | null = currentBf && currentBf > 0 ? currentBf : null;
    if (validBf == null) {
      for (let i = sorted.length - 1; i >= 0; i--) {
        const bVal = sorted[i].bf != null ? Number(sorted[i].bf) : 0;
        if (bVal > 0) {
          validBf = bVal;
          break;
        }
      }
    }

    const weights = sorted.map((l) => Number(l.weight) || 0).filter((w) => w > 0);
    const minWeight = weights.length > 0 ? Math.min(...weights) : currentWeight;
    const avgWeight = weights.length > 0 ? weights.reduce((acc, w) => acc + w, 0) / weights.length : currentWeight;
    const leanMass = validBf != null && currentWeight > 0 ? +(currentWeight * (1 - validBf / 100)).toFixed(1) : null;

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

    const validActs = acts.filter((a) => (Number(a.distanceKm) || 0) > 0 && paceStringToSeconds(a.pace) > 0);
    const validPaceSeconds = validActs.map((a) => paceStringToSeconds(a.pace));
    const bestPaceSec = validPaceSeconds.length > 0 ? Math.min(...validPaceSeconds) : Infinity;
    const bestAct = validActs.find((a) => paceStringToSeconds(a.pace) === bestPaceSec);
    const bestPaceStr = bestAct ? (bestAct.pace || secondsToPaceString(bestPaceSec)) : "—";
    const maxKm = acts.reduce((max, a) => Math.max(max, Number(a.distanceKm) || 0), 0);

    return {
      totalKm: Math.round(totalKm * 10) / 10,
      bestPaceStr,
      maxKm: Math.round(maxKm * 10) / 10,
      timeFormatted: `${hours}h ${String(mins).padStart(2, "0")}m`
    };
  }, [stravaActivities]);

  // ============================================================================
  // SPRINT 41: MOTOR DE TELEMETRIA STRAVA PROGRESS & WIDGET DE METAS
  // ============================================================================
  const effectiveStravaActivities = useMemo(() => {
    let acts = stravaActivities || [];
    if (stravaSport === "run") {
      acts = acts.filter((a) => {
        const t = (a.type || "").toLowerCase();
        return t.includes("run") || t.includes("corrida") || !t;
      });
    }
    return acts;
  }, [stravaActivities, stravaSport]);

  // Helper universal e robusto de parsing de data de atividades Strava
  const parseActDate = (dateStr?: string | null): Date | null => {
    if (!dateStr || typeof dateStr !== "string") return null;
    const s = dateStr.trim();
    if (
      s.toLowerCase().includes("semana") ||
      s.toLowerCase().includes("ano") ||
      s.toLowerCase().includes("hist") ||
      s.toLowerCase().includes("total")
    ) {
      return null;
    }
    const parts = parseDateParts(s);
    if (parts && parts.year >= 2000 && parts.month >= 1 && parts.month <= 12 && parts.day >= 1 && parts.day <= 31) {
      return new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0);
    }
    const isoMatch = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      const y = parseInt(isoMatch[1], 10);
      const m = parseInt(isoMatch[2], 10);
      const d = parseInt(isoMatch[3], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m - 1, d, 12, 0, 0);
      }
    }
    const brMatch = s.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (brMatch) {
      const d = parseInt(brMatch[1], 10);
      const m = parseInt(brMatch[2], 10);
      const y = parseInt(brMatch[3], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m - 1, d, 12, 0, 0);
      }
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const parseStravaActivityDate = (act: StravaActivity | { date?: string; isoDate?: string; start_date_local?: string }): Date | null => {
    if (!act) return null;
    if (act.isoDate && /^\d{4}-\d{2}-\d{2}$/.test(act.isoDate)) {
      const [y, m, d] = act.isoDate.split("-").map(Number);
      return new Date(y, m - 1, d, 12, 0, 0);
    }
    return parseActDate(act.date);
  };

  // Atividades reais com data identificável
  const datedActivities = useMemo(() => {
    return effectiveStravaActivities.filter((a) => {
      if (a.isSyntheticSummary) return false;
      const d = parseStravaActivityDate(a);
      return d !== null && Number(a.distanceKm) > 0;
    });
  }, [effectiveStravaActivities]);

  const hasDatedActivities = datedActivities.length > 0;

  const stravaRefDate = useMemo(() => {
    if (hasDatedActivities) {
      const timestamps = datedActivities
        .map((a) => parseStravaActivityDate(a)?.getTime() || 0)
        .filter((t) => t > 0);
      if (timestamps.length > 0) {
        const maxTs = Math.max(...timestamps);
        const now = new Date();
        return now.getTime() > maxTs ? now : new Date(maxTs);
      }
    }
    return new Date();
  }, [hasDatedActivities, datedActivities]);

  // Estatísticas Anuais (YTD) e Ritmo
  const annualProgressStats = useMemo(() => {
    let ytdKm = 0;
    if (stravaStats && Number(stravaStats.ytdKm) > 0) {
      ytdKm = Number(stravaStats.ytdKm);
    } else if (hasDatedActivities) {
      const now = new Date();
      const y = now.getFullYear();
      const yStart = new Date(y, 0, 1).getTime();
      const yEnd = new Date(y, 11, 31, 23, 59, 59).getTime();
      const yActs = datedActivities.filter((a) => {
        const ad = parseStravaActivityDate(a);
        return ad && ad.getTime() >= yStart && ad.getTime() <= yEnd;
      });
      const sum = yActs.reduce((s, a) => s + (Number(a.distanceKm) || 0), 0);
      ytdKm = Math.round(sum * 10) / 10;
    } else {
      ytdKm = 218;
    }

    const annualGoal = annualRunGoalKm > 0 ? annualRunGoalKm : 500;
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000) + 1;
    const totalDaysInYear =
      (now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || now.getFullYear() % 400 === 0 ? 366 : 365;
    const todayPct = Math.min(100, Math.max(0, (dayOfYear / totalDaysInYear) * 100));
    const expectedKmByToday = (dayOfYear / totalDaysInYear) * annualGoal;
    const paceDeltaKm = Math.round(ytdKm - expectedKmByToday);
    const progressPct = Math.min(100, (ytdKm / Math.max(1, annualGoal)) * 100);

    return {
      ytdKm,
      annualGoal,
      todayPct,
      expectedKmByToday,
      paceDeltaKm,
      progressPct
    };
  }, [stravaStats, hasDatedActivities, datedActivities, annualRunGoalKm]);

  const stravaProgressPoints = useMemo(() => {
    const ref = stravaRefDate;
    const monthsShort = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const monthsFull = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const daysShort = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // ========================================================================
    // SPRINT 51: MODO 1 — CADA CORRIDA INDIVIDUAL
    // ========================================================================
    if (stravaGranularity === "per_run") {
      let periodDays = 90;
      if (stravaPeriod === "7D") periodDays = 7;
      else if (stravaPeriod === "1M") periodDays = 30;
      else if (stravaPeriod === "3M") periodDays = 90;
      else if (stravaPeriod === "6M") periodDays = 180;
      else if (stravaPeriod === "1Y") periodDays = 365;

      const refTime = ref.getTime();
      const minTime = refTime - periodDays * 86400000;

      let matchingRuns = datedActivities.filter((a) => {
        const ad = parseStravaActivityDate(a);
        if (!ad) return false;
        const t = ad.getTime();
        return t >= minTime && t <= refTime + 86400000;
      });

      // Se na janela de tempo não houver corridas (ex: atleta não correu nos últimos 7 dias),
      // pegamos as últimas corridas mais recentes (até 12) para o gráfico nunca ficar vazio!
      if (matchingRuns.length === 0 && datedActivities.length > 0) {
        const sortedDesc = [...datedActivities].sort((a, b) => {
          const ta = parseStravaActivityDate(a)?.getTime() || 0;
          const tb = parseStravaActivityDate(b)?.getTime() || 0;
          return tb - ta;
        });
        matchingRuns = sortedDesc.slice(0, stravaPeriod === "7D" ? 7 : 12);
      }

      // Ordena cronologicamente: do mais antigo para o mais recente (para a linha fluir da esquerda para a direita)
      matchingRuns.sort((a, b) => {
        const ta = parseStravaActivityDate(a)?.getTime() || 0;
        const tb = parseStravaActivityDate(b)?.getTime() || 0;
        return ta - tb;
      });

      if (matchingRuns.length > 0) {
        return matchingRuns.map((act, idx) => {
          const d = parseStravaActivityDate(act) || new Date();
          const dayStr = String(d.getDate()).padStart(2, "0");
          const monNum = String(d.getMonth() + 1).padStart(2, "0");
          const monShort = monthsShort[d.getMonth()];
          const xLabel = `${dayStr}/${monNum}`;
          const dist = Number(act.distanceKm) || 0;
          const timeMin = Number(act.movingTimeMin) || Math.round((Number(act.movingTimeSec) || 0) / 60) || 0;
          const paceSec = dist > 0 && timeMin > 0 ? Math.round((timeMin * 60) / dist) : 0;
          const paceStr = act.pace || (paceSec > 0 ? secondsToPaceString(paceSec) : "—");
          const elev = Number(act.elevationGain) || 0;
          const avgSpeed = act.avgSpeedKmh || (dist > 0 && timeMin > 0 ? Math.round((dist / (timeMin / 60)) * 10) / 10 : undefined);

          return {
            xKey: String(act.id || `run_${idx}`),
            xLabel,
            label: `${act.name} (${act.date})`,
            monthShort: monShort,
            rangeLabel: `${act.name} • ${act.date}${act.startTime ? ` às ${act.startTime}` : ""}`,
            distanceKm: dist,
            movingTimeMin: timeMin,
            elevationGain: elev,
            pace: paceStr,
            avgSpeedKmh: avgSpeed,
            calories: Number(act.calories) || 0,
            act: act as StravaActivity | undefined
          };
        });
      }

      // Amostra fallback realista se ainda não sincronizou
      const sampleRuns = [
        { id: "s1", name: "Longão de Sábado", date: "12-10-2026", startTime: "06:30", distanceKm: 14.5, movingTimeMin: 78, elevationGain: 120, pace: "5:23 /km", avgSpeedKmh: 11.2, calories: 920 },
        { id: "s2", name: "Intervalado 8x400m", date: "15-10-2026", startTime: "07:15", distanceKm: 6.8, movingTimeMin: 33, elevationGain: 45, pace: "4:51 /km", avgSpeedKmh: 12.4, calories: 480 },
        { id: "s3", name: "Regenerativo Lagoa", date: "17-10-2026", startTime: "18:00", distanceKm: 5.0, movingTimeMin: 29, elevationGain: 30, pace: "5:48 /km", avgSpeedKmh: 10.3, calories: 350 },
        { id: "s4", name: "Ritmo Firme Parque", date: "20-10-2026", startTime: "06:45", distanceKm: 10.2, movingTimeMin: 51, elevationGain: 65, pace: "5:00 /km", avgSpeedKmh: 12.0, calories: 710 },
        { id: "s5", name: "Tiro 5k Recorde Pessoal", date: "24-10-2026", startTime: "07:00", distanceKm: 5.0, movingTimeMin: 23, elevationGain: 20, pace: "4:36 /km", avgSpeedKmh: 13.0, calories: 390 },
        { id: "s6", name: "Treino Progressivo", date: "27-10-2026", startTime: "17:45", distanceKm: 8.5, movingTimeMin: 44, elevationGain: 55, pace: "5:10 /km", avgSpeedKmh: 11.6, calories: 600 },
        { id: "s7", name: "Simulado Meia Maratona", date: "31-10-2026", startTime: "06:00", distanceKm: 21.1, movingTimeMin: 112, elevationGain: 180, pace: "5:18 /km", avgSpeedKmh: 11.3, calories: 1450 }
      ];
      return sampleRuns.map((r) => {
        const parts = r.date.split("-");
        const xLabel = `${parts[0]}/${parts[1]}`;
        return {
          xKey: r.id,
          xLabel,
          label: `${r.name} (${r.date})`,
          monthShort: "OUT",
          rangeLabel: `${r.name} • ${r.date} às ${r.startTime}`,
          distanceKm: r.distanceKm,
          movingTimeMin: r.movingTimeMin,
          elevationGain: r.elevationGain,
          pace: r.pace,
          avgSpeedKmh: r.avgSpeedKmh,
          calories: r.calories,
          act: r as unknown as StravaActivity | undefined
        };
      });
    }

    // ========================================================================
    // SPRINT 51: MODO 2 — POR SEMANA / PERÍODO AGRUPADO
    // ========================================================================
    // 1. Caso 7D: Agrupa dia a dia nos últimos 7 dias
    if (stravaPeriod === "7D") {
      const pts = [];
      const sampleDist = [0, 6.2, 0, 8.5, 0, 10.4, 4.2];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - i, 12, 0, 0);
        const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).getTime();
        const dEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();

        const acts = hasDatedActivities
          ? datedActivities.filter((a) => {
              const ad = parseStravaActivityDate(a);
              if (!ad) return false;
              const t = ad.getTime();
              return t >= dStart && t <= dEnd;
            })
          : [];

        const dist = Math.round(acts.reduce((s, a) => s + (Number(a.distanceKm) || 0), 0) * 100) / 100;
        const time = Math.round(acts.reduce((s, a) => s + (Number(a.movingTimeMin) || 0), 0));
        const elev = Math.round(acts.reduce((s, a) => s + (Number(a.elevationGain) || 0), 0));

        const dayStr = String(d.getDate()).padStart(2, "0");
        const monthStr = monthsShort[d.getMonth()];
        const weekDayStr = daysShort[d.getDay()];
        const idx = 6 - i;

        const finalDist = hasDatedActivities ? dist : sampleDist[idx];
        const finalTime = hasDatedActivities ? time : Math.round(finalDist * 5.4);
        const finalElev = hasDatedActivities ? elev : Math.round(finalDist * 9.5);
        const paceSec = finalDist > 0 && finalTime > 0 ? Math.round((finalTime * 60) / finalDist) : 0;
        const paceStr = paceSec > 0 ? secondsToPaceString(paceSec) : "—";
        const avgSpeed = finalDist > 0 && finalTime > 0 ? Math.round((finalDist / (finalTime / 60)) * 10) / 10 : undefined;

        pts.push({
          xKey: `day_${idx}`,
          xLabel: `${dayStr}/${String(d.getMonth() + 1).padStart(2, "0")}`,
          label: `${dayStr} ${monthStr}`,
          monthShort: monthStr,
          rangeLabel: `${weekDayStr}, ${dayStr} de ${monthsFull[d.getMonth()]}, ${d.getFullYear()}`,
          distanceKm: finalDist,
          movingTimeMin: finalTime,
          elevationGain: finalElev,
          pace: paceStr,
          avgSpeedKmh: avgSpeed,
          calories: 0,
          act: undefined as StravaActivity | undefined
        });
      }
      return pts;
    }

    // 2. Caso 1M, 3M, 6M: Agrupa semana a semana (Segunda a Domingo)
    if (stravaPeriod === "1M" || stravaPeriod === "3M" || stravaPeriod === "6M") {
      const numWeeks = stravaPeriod === "1M" ? 5 : stravaPeriod === "3M" ? 13 : 26;
      const dayOfWeek = ref.getDay();
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const currentMonday = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + diffToMon, 0, 0, 0, 0);

      const sample1M_dist = [21.5, 28.0, 32.4, 34.8, 14.5];
      const sample3M_dist = [14.2, 18.5, 21.0, 16.5, 22.8, 26.0, 18.2, 28.0, 31.2, 34.8, 22.4, 18.5, 12.0];
      const sample6M_dist = [
        8.5, 12.0, 15.4, 6.0, 18.2, 14.0, 21.5, 16.0, 24.8, 12.0,
        28.5, 8.0, 19.2, 22.0, 16.5, 25.4, 18.0, 31.2, 22.4, 28.0,
        34.8, 18.5, 24.0, 14.5, 9.8, 5.2
      ];

      const pts = [];

      for (let w = numWeeks - 1; w >= 0; w--) {
        const mon = new Date(currentMonday.getTime() - w * 7 * 86400000);
        mon.setHours(0, 0, 0, 0);
        const sun = new Date(mon.getTime() + 6 * 86400000);
        sun.setHours(23, 59, 59, 999);

        const acts = hasDatedActivities
          ? datedActivities.filter((a) => {
              const ad = parseStravaActivityDate(a);
              if (!ad) return false;
              const t = ad.getTime();
              return t >= mon.getTime() && t <= sun.getTime();
            })
          : [];

        const dist = Math.round(acts.reduce((s, a) => s + (Number(a.distanceKm) || 0), 0) * 100) / 100;
        const time = Math.round(acts.reduce((s, a) => s + (Number(a.movingTimeMin) || 0), 0));
        const elev = Math.round(acts.reduce((s, a) => s + (Number(a.elevationGain) || 0), 0));

        const monDay = String(mon.getDate()).padStart(2, "0");
        const sunDay = String(sun.getDate()).padStart(2, "0");
        const monM = monthsShort[mon.getMonth()].slice(0, 3);
        const sunM = monthsShort[sun.getMonth()].slice(0, 3);
        const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

        const rangeLabel = `${monDay} de ${cap(monM)}, ${mon.getFullYear()} - ${sunDay} de ${cap(sunM)}, ${sun.getFullYear()}`;
        const monthShort = monthsShort[sun.getMonth()];
        const idx = numWeeks - 1 - w;

        let finalDist = dist;
        let finalTime = time;
        let finalElev = elev;

        if (!hasDatedActivities) {
          if (numWeeks === 5) {
            finalDist = sample1M_dist[idx];
          } else if (numWeeks === 13) {
            finalDist = sample3M_dist[idx];
          } else {
            finalDist = sample6M_dist[idx];
          }
          finalTime = Math.round(finalDist * 5.51);
          finalElev = Math.round(finalDist * 9.8);
        }

        const paceSec = finalDist > 0 && finalTime > 0 ? Math.round((finalTime * 60) / finalDist) : 0;
        const paceStr = paceSec > 0 ? secondsToPaceString(paceSec) : "—";
        const avgSpeed = finalDist > 0 && finalTime > 0 ? Math.round((finalDist / (finalTime / 60)) * 10) / 10 : undefined;

        pts.push({
          xKey: `week_${idx}`,
          xLabel: `${monDay}/${String(mon.getMonth() + 1).padStart(2, "0")}`,
          label: monthShort,
          monthShort,
          rangeLabel,
          distanceKm: finalDist,
          movingTimeMin: finalTime,
          elevationGain: finalElev,
          pace: paceStr,
          avgSpeedKmh: avgSpeed,
          calories: 0,
          act: undefined as StravaActivity | undefined
        });
      }
      return pts;
    }

    // 3. Caso 1Y: Agrupa mês a mês nos últimos 12 meses
    const pts = [];
    const sample1Y_dist = [12.0, 16.5, 22.0, 25.4, 20.0, 24.5, 28.2, 22.0, 26.5, 21.4, 25.0, 8.5];

    for (let m = 11; m >= 0; m--) {
      const mDate = new Date(ref.getFullYear(), ref.getMonth() - m, 1, 0, 0, 0);
      const y = mDate.getFullYear();
      const monIdx = mDate.getMonth();
      const mStart = new Date(y, monIdx, 1, 0, 0, 0).getTime();
      const mEnd = new Date(y, monIdx + 1, 0, 23, 59, 59, 999).getTime();

      const acts = hasDatedActivities
        ? datedActivities.filter((a) => {
            const ad = parseStravaActivityDate(a);
            if (!ad) return false;
            const t = ad.getTime();
            return t >= mStart && t <= mEnd;
          })
        : [];

      const dist = Math.round(acts.reduce((s, a) => s + (Number(a.distanceKm) || 0), 0) * 100) / 100;
      const time = Math.round(acts.reduce((s, a) => s + (Number(a.movingTimeMin) || 0), 0));
      const elev = Math.round(acts.reduce((s, a) => s + (Number(a.elevationGain) || 0), 0));

      const monthShort = monthsShort[monIdx];
      const rangeLabel = `${monthsFull[monIdx]} de ${y}`;
      const idx = 11 - m;

      const finalDist = hasDatedActivities ? dist : sample1Y_dist[idx];
      const finalTime = hasDatedActivities ? time : Math.round(finalDist * 5.51);
      const finalElev = hasDatedActivities ? elev : Math.round(finalDist * 9.8);
      const paceSec = finalDist > 0 && finalTime > 0 ? Math.round((finalTime * 60) / finalDist) : 0;
      const paceStr = paceSec > 0 ? secondsToPaceString(paceSec) : "—";
      const avgSpeed = finalDist > 0 && finalTime > 0 ? Math.round((finalDist / (finalTime / 60)) * 10) / 10 : undefined;

      pts.push({
        xKey: `month_${idx}`,
        xLabel: monthShort,
        label: monthShort,
        monthShort,
        rangeLabel,
        distanceKm: finalDist,
        movingTimeMin: finalTime,
        elevationGain: finalElev,
        pace: paceStr,
        avgSpeedKmh: avgSpeed,
        calories: 0,
        act: undefined as StravaActivity | undefined
      });
    }
    return pts;
  }, [hasDatedActivities, datedActivities, stravaPeriod, stravaRefDate, stravaGranularity]);

  // Ponto padrão selecionado
  const lastActiveStravaPointIdx = useMemo(() => {
    if (stravaProgressPoints.length === 0) return 0;
    if (stravaPeriod === "1M" && !hasDatedActivities && stravaProgressPoints.length >= 4) {
      return 3; // Hero point da amostra (34.80 km)
    }
    if (stravaPeriod === "6M" && !hasDatedActivities && stravaProgressPoints.length >= 21) {
      return 20; // Hero point da amostra 6M (34.80 km)
    }
    if (stravaPeriod === "3M" && !hasDatedActivities && stravaProgressPoints.length >= 10) {
      return 9; // Hero point da amostra 3M (34.80 km)
    }
    for (let i = stravaProgressPoints.length - 1; i >= 0; i--) {
      if (stravaProgressPoints[i].distanceKm > 0) return i;
    }
    return Math.max(0, stravaProgressPoints.length - 1);
  }, [stravaProgressPoints, stravaPeriod, hasDatedActivities]);

  // SPRINT 51: Sincronização do selectedPointIndex com mudanças de período/granularidade
  useEffect(() => {
    if (stravaProgressPoints.length > 0) {
      if (selectedPointIndex >= stravaProgressPoints.length || selectedPointIndex < 0) {
        setSelectedPointIndex(lastActiveStravaPointIdx);
      }
    }
  }, [stravaProgressPoints, selectedPointIndex, lastActiveStravaPointIdx]);

  useEffect(() => {
    if (stravaProgressPoints.length > 0) {
      setSelectedPointIndex(lastActiveStravaPointIdx);
    }
  }, [stravaPeriod, stravaGranularity, lastActiveStravaPointIdx]);

  // SPRINT 51: Lista de todas as corridas reais para o Histórico Detalhado Linha por Linha
  const allDisplayRuns = useMemo(() => {
    const acts = datedActivities.length > 0
      ? datedActivities
      : (effectiveStravaActivities.length > 0 && !effectiveStravaActivities[0].isSyntheticSummary
          ? effectiveStravaActivities
          : []);
    if (acts.length > 0) {
      return [...acts].sort((a, b) => {
        const ta = parseStravaActivityDate(a)?.getTime() || 0;
        const tb = parseStravaActivityDate(b)?.getTime() || 0;
        return tb - ta;
      });
    }
    // Fallback com treinos ricos caso ainda não haja dados da API
    return [
      { id: "s7", name: "Simulado Meia Maratona", date: "31-10-2026", startTime: "06:00", distanceKm: 21.1, movingTimeMin: 112, elevationGain: 180, pace: "5:18 /km", avgSpeedKmh: 11.3, calories: 1450, type: "Run" },
      { id: "s6", name: "Treino Progressivo", date: "27-10-2026", startTime: "17:45", distanceKm: 8.5, movingTimeMin: 44, elevationGain: 55, pace: "5:10 /km", avgSpeedKmh: 11.6, calories: 600, type: "Run" },
      { id: "s5", name: "Tiro 5k Recorde Pessoal", date: "24-10-2026", startTime: "07:00", distanceKm: 5.0, movingTimeMin: 23, elevationGain: 20, pace: "4:36 /km", avgSpeedKmh: 13.0, calories: 390, type: "Run" },
      { id: "s4", name: "Ritmo Firme Parque", date: "20-10-2026", startTime: "06:45", distanceKm: 10.2, movingTimeMin: 51, elevationGain: 65, pace: "5:00 /km", avgSpeedKmh: 12.0, calories: 710, type: "Run" },
      { id: "s3", name: "Regenerativo Lagoa", date: "17-10-2026", startTime: "18:00", distanceKm: 5.0, movingTimeMin: 29, elevationGain: 30, pace: "5:48 /km", avgSpeedKmh: 10.3, calories: 350, type: "Run" },
      { id: "s2", name: "Intervalado 8x400m", date: "15-10-2026", startTime: "07:15", distanceKm: 6.8, movingTimeMin: 33, elevationGain: 45, pace: "4:51 /km", avgSpeedKmh: 12.4, calories: 480, type: "Run" },
      { id: "s1", name: "Longão de Sábado", date: "12-10-2026", startTime: "06:30", distanceKm: 14.5, movingTimeMin: 78, elevationGain: 120, pace: "5:23 /km", avgSpeedKmh: 11.2, calories: 920, type: "Run" }
    ] as StravaActivity[];
  }, [datedActivities, effectiveStravaActivities]);

  const filteredDisplayRuns = useMemo(() => {
    return allDisplayRuns.filter((act) => {
      if (runSearchQuery.trim()) {
        const q = runSearchQuery.toLowerCase();
        const matchName = (act.name || "").toLowerCase().includes(q);
        const matchDate = (act.date || "").toLowerCase().includes(q);
        if (!matchName && !matchDate) return false;
      }
      const dist = Number(act.distanceKm) || 0;
      if (runDistFilter === "3k" && dist < 3) return false;
      if (runDistFilter === "5k" && dist < 5) return false;
      if (runDistFilter === "10k" && dist < 10) return false;
      if (runDistFilter === "21k" && dist < 21) return false;

      if (runMonthFilter !== "all") {
        const actD = parseStravaActivityDate(act);
        if (actD) {
          const ym = `${actD.getFullYear()}-${String(actD.getMonth() + 1).padStart(2, "0")}`;
          if (ym !== runMonthFilter) return false;
        }
      }
      return true;
    });
  }, [allDisplayRuns, runSearchQuery, runDistFilter, runMonthFilter]);

  const maxDistanceInList = useMemo(() => {
    const max = Math.max(...filteredDisplayRuns.map((r) => Number(r.distanceKm) || 0), 10);
    return max > 0 ? max : 10;
  }, [filteredDisplayRuns]);

  const availableRunMonths = useMemo(() => {
    const set = new Set<string>();
    allDisplayRuns.forEach((r) => {
      const d = parseStravaActivityDate(r);
      if (d) {
        set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }
    });
    return Array.from(set).sort().reverse();
  }, [allDisplayRuns]);

  // SPRINT 55: A-04 — Recordes Pessoais (PRs) e Distribuição em Zonas de Pace
  interface StravaAthleticsTelemetry {
    pacePR: { paceStr: string; paceSec: number; act: StravaActivity } | null;
    longestRun: StravaActivity | null;
    best5k: { paceStr: string; timeMin: number; act: StravaActivity } | null;
    maxElevation: StravaActivity | null;
    zones: {
      z1: { km: number; pct: number; label: string; color: string };
      z2: { km: number; pct: number; label: string; color: string };
      z3: { km: number; pct: number; label: string; color: string };
      z4: { km: number; pct: number; label: string; color: string };
      totalKm: number;
    };
  }

  const stravaAthleticsTelemetry = useMemo<StravaAthleticsTelemetry>(() => {
    let pacePR: { paceStr: string; paceSec: number; act: StravaActivity } | null = null;
    let longestRun: StravaActivity | null = null;
    let best5k: { paceStr: string; timeMin: number; act: StravaActivity } | null = null;
    let maxElevation: StravaActivity | null = null;

    let z1Km = 0;
    let z2Km = 0;
    let z3Km = 0;
    let z4Km = 0;

    allDisplayRuns.forEach((act) => {
      const dist = Number(act.distanceKm) || 0;
      const timeMin = Number(act.movingTimeMin) || Math.round((Number(act.movingTimeSec) || 0) / 60) || 0;
      if (dist <= 0 || timeMin <= 0) return;

      const paceSec = Math.round((timeMin * 60) / dist);
      const paceStr = act.pace || secondsToPaceString(paceSec);

      if (dist >= 2 && paceSec >= 180) {
        if (!pacePR || paceSec < pacePR.paceSec) {
          pacePR = { paceStr, paceSec, act };
        }
      }

      if (!longestRun || dist > (Number(longestRun.distanceKm) || 0)) {
        longestRun = act;
      }

      if (dist >= 4.9 && dist <= 6.5) {
        if (!best5k || timeMin < best5k.timeMin) {
          best5k = { paceStr, timeMin, act };
        }
      }

      const elev = Number(act.elevationGain) || 0;
      if (!maxElevation || elev > (Number(maxElevation.elevationGain) || 0)) {
        maxElevation = act;
      }

      if (paceSec > 390) {
        z1Km += dist;
      } else if (paceSec >= 330) {
        z2Km += dist;
      } else if (paceSec >= 285) {
        z3Km += dist;
      } else {
        z4Km += dist;
      }
    });

    const totalZonedKm = z1Km + z2Km + z3Km + z4Km || 1;
    const z1Pct = Math.round((z1Km / totalZonedKm) * 100);
    const z2Pct = Math.round((z2Km / totalZonedKm) * 100);
    const z3Pct = Math.round((z3Km / totalZonedKm) * 100);
    const z4Pct = Math.max(0, 100 - (z1Pct + z2Pct + z3Pct));

    return {
      pacePR,
      longestRun,
      best5k,
      maxElevation,
      zones: {
        z1: { km: Math.round(z1Km * 10) / 10, pct: z1Pct, label: "Z1 — Leve / Regenerativo (> 6'30\")", color: "#38BDF8" },
        z2: { km: Math.round(z2Km * 10) / 10, pct: z2Pct, label: "Z2 — Aeróbico Base (5'30\" - 6'30\")", color: "#10B981" },
        z3: { km: Math.round(z3Km * 10) / 10, pct: z3Pct, label: "Z3 — Limiar / Ritmo (4'45\" - 5'30\")", color: "#F59E0B" },
        z4: { km: Math.round(z4Km * 10) / 10, pct: z4Pct, label: "Z4 — VO2max / Tiro (< 4'45\")", color: "#EF4444" },
        totalKm: Math.round(totalZonedKm * 10) / 10
      }
    };
  }, [allDisplayRuns]);

  const handleSaveManualRun = (e: React.FormEvent) => {
    e.preventDefault();
    const dist = parseFloat(manualRunDistance.replace(",", ".")) || 0;
    const timeMin = parseFloat(manualRunDurationMin.replace(",", ".")) || 0;
    if (dist <= 0 || timeMin <= 0) {
      alert("Por favor, preencha distância e duração válidas.");
      return;
    }
    const totalSec = Math.round(timeMin * 60);
    const elev = parseFloat(manualRunElevation.replace(",", ".")) || 0;
    const hr = parseFloat(manualRunHr.replace(",", ".")) || undefined;
    const speed = Math.round((dist / (timeMin / 60)) * 10) / 10;
    const cal = Math.round(dist * 65);

    const newAct: StravaActivity = {
      id: `manual_${Date.now()}`,
      name: manualRunName.trim() || "Corrida Manual",
      type: "Run",
      date: manualRunDate,
      isoDate: toSortableISO(manualRunDate),
      startTime: manualRunTime,
      distanceKm: Math.round(dist * 100) / 100,
      movingTimeMin: Math.round(timeMin),
      movingTimeSec: totalSec,
      pace: formatPace(totalSec, dist),
      avgSpeedKmh: speed,
      elevationGain: elev,
      averageHeartrate: hr,
      calories: cal,
      isSyntheticSummary: false
    };

    if (setStravaActivities) {
      setStravaActivities((prev) => {
        const next = [newAct, ...(prev || [])];
        try {
          localStorage.setItem("lifeos_strava_activities", JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    setIsManualRunModalOpen(false);
    setManualRunName("");
    setManualRunDistance("");
    setManualRunDurationMin("");
    setManualRunElevation("");
    setManualRunHr("");
  };

  // SPRINT 47: selectedPointIndex isolado no StravaProgressGrid memoizado para 144Hz zero-jank

  // Estatísticas da Semana Atual
  const currentWeekStats = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon, 0, 0, 0, 0);
    const sunday = new Date(monday.getTime() + 6 * 86400000);
    sunday.setHours(23, 59, 59, 999);

    const daysInfo: { letter: string; hasRun: boolean; isToday: boolean }[] = [];
    const letters = ["S", "T", "Q", "Q", "S", "S", "D"];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday.getTime() + i * 86400000);
      const isToday =
        now.getDate() === dayDate.getDate() &&
        now.getMonth() === dayDate.getMonth() &&
        now.getFullYear() === dayDate.getFullYear();

      const dStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0, 0).getTime();
      const dEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59, 999).getTime();

      let hasRun = false;
      if (hasDatedActivities) {
        hasRun = datedActivities.some((a) => {
          const ad = parseActDate(a.date);
          if (!ad) return false;
          const t = ad.getTime();
          return t >= dStart && t <= dEnd && (Number(a.distanceKm) || 0) > 0;
        });
      } else {
        hasRun = i === 1 || i === 3;
      }

      daysInfo.push({
        letter: letters[i],
        hasRun,
        isToday
      });
    }

    let finalKm = 0;
    let finalMin = 0;
    let finalElev = 0;

    if (hasDatedActivities) {
      const weekActs = datedActivities.filter((a) => {
        const ad = parseActDate(a.date);
        if (!ad) return false;
        const t = ad.getTime();
        return t >= monday.getTime() && t <= sunday.getTime();
      });
      finalKm = Math.round(weekActs.reduce((s, a) => s + (Number(a.distanceKm) || 0), 0) * 10) / 10;
      finalMin = Math.round(weekActs.reduce((s, a) => s + (Number(a.movingTimeMin) || 0), 0));
      finalElev = Math.round(weekActs.reduce((s, a) => s + (Number(a.elevationGain) || 0), 0));
    } else {
      finalKm = 8.5;
      finalMin = 46;
      finalElev = 74;
    }

    return {
      daysInfo,
      weeklyCurrentKm: finalKm,
      weeklyHours: Math.floor(finalMin / 60),
      weeklyMins: Math.round(finalMin % 60),
      weeklyElev: finalElev
    };
  }, [hasDatedActivities, datedActivities]);

  const handleSaveGoalsModal = (e: React.FormEvent) => {
    e.preventDefault();
    const w = Math.max(1, parseFloat(editWeeklyGoal) || 15);
    const a = Math.max(1, parseFloat(editAnnualGoal) || 500);
    setWeeklyRunGoalKm(w);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("fincontrol_weekly_run_goal_km", String(w));
      } catch {}
    }
    setAnnualRunGoalKm(a);
    updateGoalsStorage(personalBudgetLimit, monthlyInvestmentGoal, patrimonyTarget, a);
    setIsGoalsModalOpen(false);
  };

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
        onUpdateSingleTransaction={onUpdateSingleTransaction}
        onBatchUpdateStatus={onBatchUpdateStatus}
        onBatchChangeCategory={onBatchChangeCategory}
        onBatchDeleteTransactions={onBatchDeleteTransactions}
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

            {/* Segmented Control de Status com Motion Deslizante */}
            <SlidingSegmentedControl
              options={[
                { id: "all", label: "Todos" },
                { id: "pending", label: "Pendentes" },
                { id: "partial", label: "Parciais" },
                { id: "paid", label: "Quitados" }
              ]}
              value={receivableStatusFilter}
              onChange={(val) => setReceivableStatusFilter(val as any)}
              size="xs"
              activeColor="bg-amber-500 text-slate-950 shadow-sm"
            />
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
                          <div className="min-w-0 flex-1">
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
                          </div>
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
                                    onClick={(e) => {
                                      const val = parseFloat(pInput);
                                      if (val > 0) {
                                        triggerAuraBurst(e.currentTarget, "emerald");
                                        const dest = partialBank[item.id] || banks[0]?.name || "Nubank";
                                        handlePartialPaymentReceivable(item, val, dest);
                                        setPartialInputs((prev) => ({ ...prev, [item.id]: "" }));
                                      }
                                    }}
                                    className="flex-1 h-7 py-0.5 px-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold shadow transition flex items-center justify-center cursor-pointer apple-press"
                                  >
                                    + Abater
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      if (item.remaining > 0) {
                                        triggerAuraBurst(e.currentTarget, "emerald");
                                        const dest = partialBank[item.id] || banks[0]?.name || "Nubank";
                                        handlePartialPaymentReceivable(item, item.remaining, dest);
                                      }
                                    }}
                                    className="h-7 py-0.5 px-2 rounded-md bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold transition flex items-center justify-center cursor-pointer apple-press"
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
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 status-stamp-pop"
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
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStartEditTransaction(item)}
                                className="p-1 rounded-lg bg-white/10 text-slate-300 hover:text-white hover:bg-indigo-600 transition cursor-pointer living-edit"
                                title="Editar lançamento"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTransaction(item.id)}
                                className="p-1 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/30 hover:text-rose-300 border border-rose-500/25 transition cursor-pointer living-trash"
                                title="Excluir lançamento de devedor"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
  // ABA: INVESTIMENTOS & MERCADO AO VIVO (SPRINT 48)
  // ============================================================================
  if (activeTab === "investments") {
    return (
      <InvestmentsTab
        transactions={transactions}
        banks={banks}
        cards={cards}
        cdiAnnualRate={cdiAnnualRate}
        moneyBlur={moneyBlur}
        onSaveTransaction={onSaveInvestmentTx || ((tx) => { if (onAddTransaction && tx.id) void onAddTransaction(tx as Transaction); })}
        onDeleteTransaction={handleDeleteTransaction}
        notify={notify}
        realBalanceOverride={realBalanceOverride}
        onSaveRealBalanceOverride={onSaveRealBalanceOverride}
        visibleMarketCharts={visibleMarketCharts}
        onUpdateVisibleMarketCharts={onUpdateVisibleMarketCharts}
        simulatorMonthlyContribution={simulatorMonthlyContribution}
        onUpdateSimulatorMonthlyContribution={onUpdateSimulatorMonthlyContribution}
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
        onDeleteTransaction={handleDeleteTransaction}
        onEditTransaction={handleStartEditTransaction}
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

    const stravaYMaxRaw = Math.max(...stravaProgressPoints.map((p) => p.distanceKm), 10);
    const stravaYTop = Math.max(10, Math.ceil((stravaYMaxRaw * 1.15) / 5) * 5);
    const stravaYMid = Math.round(stravaYTop / 2);
    const stravaYTicks = [0, stravaYMid, stravaYTop];

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
                {/* Seletor Deslizante de Séries */}
                <SlidingSegmentedControl
                  options={[
                    { id: "all", label: "Peso + BF%" },
                    { id: "weight", label: "Só Peso (kg)" },
                    { id: "bf", label: "Só BF (%)" },
                    { id: "target", label: "Rumo à Meta" }
                  ]}
                  value={bioSeriesMode}
                  onChange={(val) => setBioSeriesMode(val as any)}
                  size="xs"
                  activeColor="bg-emerald-500 text-slate-950 shadow-sm"
                />

                {/* Seletor Deslizante de Período Rápido */}
                <SlidingSegmentedControl
                  options={[
                    { id: "1M", label: "1M" },
                    { id: "3M", label: "3M" },
                    { id: "6M", label: "6M" },
                    { id: "1A", label: "1A" },
                    { id: "Tudo", label: "Tudo" }
                  ]}
                  value={bioPeriodFilter}
                  onChange={(val) => setBioPeriodFilter(val as any)}
                  size="xs"
                  activeColor="bg-emerald-500 text-slate-950 shadow-sm"
                />

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

        {/* SPRINT 41, 46 & 51: PAINEL STRAVA PROGRESS REDESIGN, MOTOR DE CORRIDAS INDIVIDUAIS & METAS */}
        <div className="relative overflow-hidden bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] rounded-2xl p-5 shadow-xl space-y-5">
          {isSyncingStrava && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#FC4C02] cupertino-shimmer z-30" />
          )}

          {/* SPRINT 51: BANNER DE UPGRADE DE ESCOPO DO STRAVA (QUANDO TOKEN FOR RESTRITO A RESUMO) */}
          {(stravaScopeMode === "read_only" || effectiveStravaActivities.some((a) => a.isSyntheticSummary)) && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-cupertino-in">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 mt-0.5 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-200">
                    Autorização de Leitura de Cada Corrida Necessária
                  </h4>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    Seu token atual só permite ver o resumo estatístico (3 blocos). Clique ao lado para autorizar a leitura de <strong>CADA CORRIDA INDIVIDUAL</strong> no Strava.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const url = stravaOauthUrl || "/api/strava/auth";
                  window.open(url, "strava_oauth", "width=600,height=750");
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md shrink-0"
              >
                <span>🔓 Liberar Corridas Detalhadas (OAuth)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Abas Superiores de Navegação Interna: Progresso vs Atividades (Linha Laranja #FC4C02 Deslizante) */}
          <div className="flex items-center justify-between border-b border-[var(--cupertino-border)] pb-2">
            <SlidingSegmentedControl
              options={[
                { id: "progress", label: "Progresso" },
                {
                  id: "activities",
                  label: "Atividades",
                  badge: filteredDisplayRuns && filteredDisplayRuns.length > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      {filteredDisplayRuns.length}
                    </span>
                  ) : undefined
                }
              ]}
              value={stravaInnerTab}
              onChange={(val) => setStravaInnerTab(val as "progress" | "activities")}
              size="sm"
              indicatorVariant="underline"
              activeColor="bg-[#FC4C02] h-[3px]"
              className="bg-transparent border-0 p-0 shadow-none"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => syncStravaFromApi()}
                disabled={isSyncingStrava}
                className="px-3 py-1 rounded-xl bg-orange-600/30 border border-orange-500/30 hover:bg-orange-600/50 text-orange-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                {isSyncingStrava ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isSyncingStrava ? "Sincronizando..." : "Sincronizar Strava"}</span>
              </button>
            </div>
          </div>

          {/* VISÃO 1: PROGRESSO (GRID 12 COLUNAS: 8 COL GRÁFICO + 4 COL METAS) + TABELA DETALHADA LOGO ABAIXO */}
          {stravaInnerTab === "progress" && (
            <div className="space-y-6">
              <div className="relative">
                {isSyncingStrava && (
                  <div className="absolute inset-0 rounded-2xl cupertino-shimmer pointer-events-none z-20 opacity-40" />
                )}
                <StravaProgressGrid
                  stravaProgressPoints={stravaProgressPoints}
                  stravaSport={stravaSport}
                  setStravaSport={setStravaSport}
                  stravaPeriod={stravaPeriod}
                  setStravaPeriod={setStravaPeriod}
                  stravaGranularity={stravaGranularity}
                  setStravaGranularity={setStravaGranularity}
                  selectedPointIndex={selectedPointIndex}
                  setSelectedPointIndex={setSelectedPointIndex}
                  stravaGearRef={stravaGearRef}
                  stravaSettingsOpen={stravaSettingsOpen}
                  setStravaSettingsOpen={setStravaSettingsOpen}
                  stravaChartSettings={stravaChartSettings}
                  handleUpdateStravaChartSettings={handleUpdateStravaChartSettings}
                  currentWeekStats={currentWeekStats}
                  weeklyRunGoalKm={weeklyRunGoalKm}
                  annualProgressStats={annualProgressStats}
                  setEditWeeklyGoal={setEditWeeklyGoal}
                  setEditAnnualGoal={setEditAnnualGoal}
                  setIsGoalsModalOpen={setIsGoalsModalOpen}
                  stravaYTicks={stravaYTicks}
                  stravaYTop={stravaYTop}
                />
              </div>

              {/* SPRINT 55: A-04 — RECORDES PESSOAIS (PRs) & ZONAS DE PACE */}
              <div className="pt-5 border-t border-[var(--cupertino-border)] space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-300">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                        🏅 Recordes Pessoais (PRs) & Distribuição de Zonas de Pace
                      </h3>
                      <p className="text-xs text-slate-400">
                        Telemetria atlética avançada e categorização fisiológica de intensidade por velocidade.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4 Cards de PRs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* PR 1: Menor Pace */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-base">⚡</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Pace PR
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white block mt-1">Ritmo Mais Veloz</span>
                      <strong className="text-xl font-extrabold font-mono text-amber-400 block">
                        {stravaAthleticsTelemetry.pacePR?.paceStr || "—"}
                      </strong>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {stravaAthleticsTelemetry.pacePR ? `${stravaAthleticsTelemetry.pacePR.act.name} (${stravaAthleticsTelemetry.pacePR.act.date})` : "Sem registros"}
                    </p>
                  </div>

                  {/* PR 2: Maior Distância (Longão) */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-orange-500/30 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-base">🏃</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                          Maior Distância
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white block mt-1">Longão Máximo</span>
                      <strong className="text-xl font-extrabold font-mono text-orange-400 block">
                        {stravaAthleticsTelemetry.longestRun ? `${Number(stravaAthleticsTelemetry.longestRun.distanceKm).toFixed(1)} km` : "—"}
                      </strong>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {stravaAthleticsTelemetry.longestRun ? `${stravaAthleticsTelemetry.longestRun.name} (${stravaAthleticsTelemetry.longestRun.date})` : "Sem registros"}
                    </p>
                  </div>

                  {/* PR 3: Melhor 5K */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-base">🏆</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Melhor 5K
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white block mt-1">5 km Mais Rápido</span>
                      <strong className="text-xl font-extrabold font-mono text-emerald-400 block">
                        {stravaAthleticsTelemetry.best5k ? `${Math.round(stravaAthleticsTelemetry.best5k.timeMin)} min (${stravaAthleticsTelemetry.best5k.paceStr})` : "—"}
                      </strong>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {stravaAthleticsTelemetry.best5k ? `${stravaAthleticsTelemetry.best5k.act.name} (${stravaAthleticsTelemetry.best5k.act.date})` : "Sem registros de 5k"}
                    </p>
                  </div>

                  {/* PR 4: Maior Ganho de Altimetria */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-indigo-500/30 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-base">⛰️</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Altimetria Máx.
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white block mt-1">Maior Ganho Vertical</span>
                      <strong className="text-xl font-extrabold font-mono text-indigo-400 block">
                        {stravaAthleticsTelemetry.maxElevation ? `+${Math.round(Number(stravaAthleticsTelemetry.maxElevation.elevationGain) || 0)} m` : "—"}
                      </strong>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {stravaAthleticsTelemetry.maxElevation ? `${stravaAthleticsTelemetry.maxElevation.name} (${stravaAthleticsTelemetry.maxElevation.date})` : "Sem registros"}
                    </p>
                  </div>
                </div>

                {/* Barra de Distribuição em 4 Zonas de Intensidade de Pace */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Distribuição em 4 Zonas de Esforço Fisiológico</span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Total: {stravaAthleticsTelemetry.zones.totalKm} km analisados
                    </span>
                  </div>

                  {/* Barra horizontal segmentada */}
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                    <div style={{ width: `${stravaAthleticsTelemetry.zones.z1.pct}%` }} className="h-full bg-[#38BDF8] transition-all duration-500" title={`Z1: ${stravaAthleticsTelemetry.zones.z1.pct}%`} />
                    <div style={{ width: `${stravaAthleticsTelemetry.zones.z2.pct}%` }} className="h-full bg-[#10B981] transition-all duration-500" title={`Z2: ${stravaAthleticsTelemetry.zones.z2.pct}%`} />
                    <div style={{ width: `${stravaAthleticsTelemetry.zones.z3.pct}%` }} className="h-full bg-[#F59E0B] transition-all duration-500" title={`Z3: ${stravaAthleticsTelemetry.zones.z3.pct}%`} />
                    <div style={{ width: `${stravaAthleticsTelemetry.zones.z4.pct}%` }} className="h-full bg-[#EF4444] transition-all duration-500" title={`Z4: ${stravaAthleticsTelemetry.zones.z4.pct}%`} />
                  </div>

                  {/* Legenda das 4 zonas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono pt-1 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-400 block text-[10px]">Z1 Regenerativo (&gt;6&apos;30&quot;)</span>
                        <strong className="text-white">{stravaAthleticsTelemetry.zones.z1.km} km ({stravaAthleticsTelemetry.zones.z1.pct}%)</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-400 block text-[10px]">Z2 Aeróbico (5&apos;30&quot; - 6&apos;30&quot;)</span>
                        <strong className="text-white">{stravaAthleticsTelemetry.zones.z2.km} km ({stravaAthleticsTelemetry.zones.z2.pct}%)</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-400 block text-[10px]">Z3 Limiar (4&apos;45&quot; - 5&apos;30&quot;)</span>
                        <strong className="text-white">{stravaAthleticsTelemetry.zones.z3.km} km ({stravaAthleticsTelemetry.zones.z3.pct}%)</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-400 block text-[10px]">Z4 VO2max (&lt;4&apos;45&quot;)</span>
                        <strong className="text-white">{stravaAthleticsTelemetry.zones.z4.km} km ({stravaAthleticsTelemetry.zones.z4.pct}%)</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SPRINT 51: HISTÓRICO DETALHADO — CADA CORRIDA LINHA POR LINHA LOGO ABAIXO DO GRÁFICO */}
              <div className="pt-5 border-t border-[var(--cupertino-border)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-400">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                        🏃 Histórico Detalhado — Cada Corrida Linha por Linha
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30">
                          {filteredDisplayRuns.length} {filteredDisplayRuns.length === 1 ? "corrida" : "corridas"}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Passe o cursor ou clique em qualquer corrida para destacar e inspecionar seu ponto exato no gráfico acima.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsManualRunModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Registrar Corrida Manual</span>
                    </button>
                  </div>
                </div>

                {/* Barra de Filtros, Busca e Mês */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-white/[0.05]">
                  {/* Busca textual */}
                  <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou data..."
                      value={runSearchQuery}
                      onChange={(e) => setRunSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>

                  {/* Filtro por distância mínima */}
                  <SlidingSegmentedControl
                    options={[
                      { id: "all", label: "Todas" },
                      { id: "3k", label: "> 3km" },
                      { id: "5k", label: "> 5km" },
                      { id: "10k", label: "> 10km" },
                      { id: "21k", label: "> 21km" }
                    ]}
                    value={runDistFilter}
                    onChange={(val) => setRunDistFilter(val as any)}
                    size="xs"
                    activeColor="bg-[#FC4C02]"
                  />

                  {/* Filtro por Mês */}
                  {availableRunMonths.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">Mês:</span>
                      <select
                        value={runMonthFilter}
                        onChange={(e) => setRunMonthFilter(e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
                      >
                        <option value="all" className="bg-slate-900 text-white">Todos os Meses</option>
                        {availableRunMonths.map((ym) => (
                          <option key={ym} value={ym} className="bg-slate-900 text-white">
                            {ym}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Tabela de Corridas com Realce Bidirecional */}
                {filteredDisplayRuns.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-white/[0.08] shadow-inner">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/[0.08] bg-slate-950/70 text-slate-400 font-semibold">
                          <th className="py-3 px-3">Data & Hora</th>
                          <th className="py-3 px-3">Treino / Corrida</th>
                          <th className="py-3 px-3">Distância</th>
                          <th className="py-3 px-3 text-center">Pace Médio</th>
                          <th className="py-3 px-3 text-right">Vel. Média</th>
                          <th className="py-3 px-3 text-right">Tempo Mov.</th>
                          <th className="py-3 px-3 text-right">Elevação</th>
                          <th className="py-3 px-3 text-right">FC / Calorias</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {filteredDisplayRuns.map((act) => {
                          const isSelected =
                            stravaProgressPoints[selectedPointIndex]?.act?.id === act.id ||
                            stravaProgressPoints[selectedPointIndex]?.xKey === act.id;
                          const dist = Number(act.distanceKm) || 0;
                          const barPct = Math.min(100, Math.max(8, (dist / maxDistanceInList) * 100));

                          return (
                            <tr
                              key={act.id}
                              onClick={() => {
                                const pIdx = stravaProgressPoints.findIndex(
                                  (p) => p.act?.id === act.id || p.xKey === act.id
                                );
                                if (pIdx >= 0) setSelectedPointIndex(pIdx);
                              }}
                              onMouseEnter={() => {
                                const pIdx = stravaProgressPoints.findIndex(
                                  (p) => p.act?.id === act.id || p.xKey === act.id
                                );
                                if (pIdx >= 0) setSelectedPointIndex(pIdx);
                              }}
                              className={`transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-orange-500/15 border-l-4 border-l-[#FC4C02]"
                                  : "hover:bg-white/[0.04]"
                              }`}
                            >
                              <td className="py-3 px-3 font-mono tabular-nums text-slate-300 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-white">{act.date}</span>
                                  {act.startTime && (
                                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                      <Clock className="w-2.5 h-2.5" /> {act.startTime}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-3 font-semibold text-white">
                                <div className="flex items-center gap-2">
                                  {isSelected && (
                                    <span className="w-2 h-2 rounded-full bg-[#FC4C02] animate-pulse" />
                                  )}
                                  <span>{act.name}</span>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-300 border border-orange-500/30">
                                    🏃 {act.type || "Corrida"}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono tabular-nums font-extrabold text-orange-400 whitespace-nowrap text-sm">
                                    {dist.toFixed(2)} km
                                  </span>
                                  <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                                    <div
                                      className="h-full bg-gradient-to-r from-orange-600 to-amber-400 rounded-full"
                                      style={{ width: `${barPct}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 tabular-nums">
                                  {act.pace || "—"}
                                </span>
                              </td>

                              <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200 whitespace-nowrap">
                                {act.avgSpeedKmh ? `${act.avgSpeedKmh} km/h` : "—"}
                              </td>

                              <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300 whitespace-nowrap">
                                {act.movingTimeMin >= 60
                                  ? `${Math.floor(act.movingTimeMin / 60)}h ${String(Math.round(act.movingTimeMin % 60)).padStart(2, "0")}m`
                                  : `${act.movingTimeMin} min`}
                              </td>

                              <td className="py-3 px-3 text-right font-mono tabular-nums text-indigo-300 whitespace-nowrap">
                                {act.elevationGain > 0 ? `+${act.elevationGain} m` : "—"}
                              </td>

                              <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-300 whitespace-nowrap">
                                {act.averageHeartrate ? `${Math.round(act.averageHeartrate)} bpm` : ""}{" "}
                                {act.calories > 0 ? `• ${act.calories} kcal` : ""}
                                {!act.averageHeartrate && !act.calories && "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-white/[0.05] space-y-3">
                    <Footprints className="w-8 h-8 text-orange-500/40 mx-auto" />
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Nenhuma corrida encontrada para os filtros selecionados. Tente ajustar os filtros ou clique em <strong>&quot;Registrar Corrida Manual&quot;</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VISÃO 2: ATIVIDADES (TABELA COMPLETA DE TREINOS COM FEED OFICIAL E FILTROS) */}
          {stravaInnerTab === "activities" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-400">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      Minhas Corridas & Treinos Recentes
                      {filteredDisplayRuns && filteredDisplayRuns.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30">
                          {filteredDisplayRuns.length} {filteredDisplayRuns.length === 1 ? "registro" : "registros"}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">Telemetria detalhada do Strava com pace por quilômetro, altimetria acumulada e estimativa calórica.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsManualRunModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Registrar Corrida Manual</span>
                  </button>
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

              {/* Barra de Filtros, Busca e Mês */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-white/[0.05]">
                {/* Busca textual */}
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou data..."
                    value={runSearchQuery}
                    onChange={(e) => setRunSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
                  />
                </div>

                {/* Filtro por distância mínima */}
                <SlidingSegmentedControl
                  options={[
                    { id: "all", label: "Todas" },
                    { id: "3k", label: "> 3km" },
                    { id: "5k", label: "> 5km" },
                    { id: "10k", label: "> 10km" },
                    { id: "21k", label: "> 21km" }
                  ]}
                  value={runDistFilter}
                  onChange={(val) => setRunDistFilter(val as any)}
                  size="xs"
                  activeColor="bg-[#FC4C02]"
                />

                {/* Filtro por Mês */}
                {availableRunMonths.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">Mês:</span>
                    <select
                      value={runMonthFilter}
                      onChange={(e) => setRunMonthFilter(e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
                    >
                      <option value="all" className="bg-slate-900 text-white">Todos os Meses</option>
                      {availableRunMonths.map((ym) => (
                        <option key={ym} value={ym} className="bg-slate-900 text-white">
                          {ym}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {filteredDisplayRuns.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.08] bg-slate-950/60 text-slate-400">
                        <th className="py-3 px-3">Data & Hora</th>
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
                      {filteredDisplayRuns.map((act) => (
                        <tr key={act.id} className="hover:bg-white/[0.03] transition">
                          <td className="py-3 px-3 font-mono tabular-nums text-slate-300 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">{act.date}</span>
                              {act.startTime && (
                                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" /> {act.startTime}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-white">
                            {act.name}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-300 border border-orange-500/30">
                              🏃 {act.type || "Corrida"}
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
          )}
        </div>

        {/* MODAL DE EDIÇÃO DE METAS DE CORRIDA */}
        {isGoalsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-cupertino-in">
            <div className="bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--cupertino-border)]">
                <h4 className="text-sm font-extrabold text-[var(--cupertino-text)] flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-[#FC4C02]" />
                  Metas de Corrida Strava
                </h4>
                <button
                  type="button"
                  onClick={() => setIsGoalsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveGoalsModal} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Meta Semanal (km)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={editWeeklyGoal}
                    onChange={(e) => setEditWeeklyGoal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[var(--cupertino-border)] text-white text-sm outline-none focus:border-[#FC4C02]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Meta Anual (km)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={editAnnualGoal}
                    onChange={(e) => setEditAnnualGoal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[var(--cupertino-border)] text-white text-sm outline-none focus:border-[#FC4C02]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsGoalsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FC4C02] hover:bg-[#e04302] shadow-md transition"
                  >
                    Salvar Metas
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SPRINT 51: MODAL DE REGISTRO MANUAL DE CORRIDA */}
        {isManualRunModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-cupertino-in">
            <div className="bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] rounded-2xl p-6 shadow-2xl w-full max-w-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--cupertino-border)]">
                <h4 className="text-sm font-extrabold text-[var(--cupertino-text)] flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-[#FC4C02]" />
                  Registrar Treino de Corrida Manual
                </h4>
                <button
                  type="button"
                  onClick={() => setIsManualRunModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveManualRun} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nome do Treino / Atividade
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Corrida Matinal na Orla"
                    value={manualRunName}
                    onChange={(e) => setManualRunName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[var(--cupertino-border)] text-xs text-white focus:outline-none focus:border-[#FC4C02]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Data (DD-MM-YYYY)
                    </label>
                    <input
                      type="text"
                      required
                      value={manualRunDate}
                      onChange={(e) => setManualRunDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[var(--cupertino-border)] text-xs font-mono text-white focus:outline-none focus:border-[#FC4C02]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Horário de Início
                    </label>
                    <input
                      type="time"
                      value={manualRunTime}
                      onChange={(e) => setManualRunTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[var(--cupertino-border)] text-xs font-mono text-white focus:outline-none focus:border-[#FC4C02]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Distância (km)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Ex: 5.25"
                      value={manualRunDistance}
                      onChange={(e) => setManualRunDistance(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[var(--cupertino-border)] text-xs font-mono text-white focus:outline-none focus:border-[#FC4C02]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Tempo Total (minutos)
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      placeholder="Ex: 28"
                      value={manualRunDurationMin}
                      onChange={(e) => setManualRunDurationMin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[var(--cupertino-border)] text-xs font-mono text-white focus:outline-none focus:border-[#FC4C02]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Ganho de Elevação (m)
                    </label>
                    <input
                      type="number"
                      step="1"
                      placeholder="Ex: 45"
                      value={manualRunElevation}
                      onChange={(e) => setManualRunElevation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[var(--cupertino-border)] text-xs font-mono text-white focus:outline-none focus:border-[#FC4C02]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Freq. Cardíaca Média (bpm)
                    </label>
                    <input
                      type="number"
                      step="1"
                      placeholder="Ex: 155"
                      value={manualRunHr}
                      onChange={(e) => setManualRunHr(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[var(--cupertino-border)] text-xs font-mono text-white focus:outline-none focus:border-[#FC4C02]"
                    />
                  </div>
                </div>

                {/* Prévia Automática de Pace e Velocidade */}
                {parseFloat(manualRunDistance) > 0 && parseFloat(manualRunDurationMin) > 0 && (
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Pace Estimado</span>
                      <span className="font-bold text-emerald-400 text-sm">
                        {formatPace(parseFloat(manualRunDurationMin) * 60, parseFloat(manualRunDistance))}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Vel. Média</span>
                      <span className="font-bold text-white text-sm">
                        {(parseFloat(manualRunDistance) / (parseFloat(manualRunDurationMin) / 60)).toFixed(1)} km/h
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Calorias Est.</span>
                      <span className="font-bold text-amber-300 text-sm">
                        {Math.round(parseFloat(manualRunDistance) * 65)} kcal
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--cupertino-border)]">
                  <button
                    type="button"
                    onClick={() => setIsManualRunModalOpen(false)}
                    className="px-4 py-2 rounded-xl hover:bg-white/10 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#FC4C02] hover:bg-[#e04300] text-white text-xs font-bold transition cursor-pointer shadow-md"
                  >
                    Salvar Corrida
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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

            {/* Pílulas de Filtro Rápido Deslizante (Todos, Notas & Objetivos, Lista de Desejos) */}
            <SlidingSegmentedControl
              options={[
                {
                  id: "ALL",
                  label: "Todos",
                  icon: <Layers className="w-3.5 h-3.5" />,
                  badge: <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 font-mono tabular-nums">{notes.length}</span>
                },
                {
                  id: "NOTES",
                  label: "Notas & Objetivos",
                  icon: <FileText className="w-3.5 h-3.5" />,
                  badge: (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 font-mono tabular-nums">
                      {notes.filter((n) => n.itemType !== "wish" && (!n.price || n.price === 0)).length}
                    </span>
                  )
                },
                {
                  id: "WISHES",
                  label: "Lista de Desejos (R$)",
                  icon: <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />,
                  badge: (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 font-mono tabular-nums">
                      {notes.filter((n) => n.itemType === "wish" || (n.price != null && n.price > 0)).length}
                    </span>
                  )
                }
              ]}
              value={muralFilter}
              onChange={(val) => setMuralFilter(val as any)}
              size="sm"
              activeColor={muralFilter === "WISHES" ? "bg-amber-600 text-white" : "bg-[#0A84FF] text-white"}
            />

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
            <SlidingSegmentedControl
              options={[
                { id: "note", label: "Nota / Objetivo", icon: <FileText className="w-3.5 h-3.5" /> },
                { id: "wish", label: "Desejo de Compra (R$)", icon: <ShoppingBag className="w-3.5 h-3.5" /> }
              ]}
              value={newNote.itemType === "wish" ? "wish" : "note"}
              onChange={(val) => setNewNote({ ...newNote, itemType: val as "note" | "wish" })}
              fullWidth
              size="sm"
              activeColor={newNote.itemType === "wish" ? "bg-amber-600 text-white shadow-sm" : "bg-[#0A84FF] text-white shadow-sm"}
            />

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

        {/* SPRINT 64: CARD OFICIAL DE DIAGNÓSTICO DE COMPUTAÇÃO EM NUVEM (Henrique Montenegro) */}
        <div className="glass-card p-6 rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/20 via-slate-900/60 to-indigo-950/20 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm">
                  <Cloud className="w-5 h-5 text-sky-400" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                    ☁️ Verificação Oficial de Computação em Nuvem (Supabase PostgreSQL)
                  </h3>
                  <p className="text-[11px] font-mono text-sky-300">
                    Arquitetura 100% Nuvem Estrita • Assinado por Henrique Montenegro (Principal Cloud Architect & DBA)
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mt-1">
                Auditoria matemática em tempo real conectada diretamente ao servidor Supabase PostgreSQL. Todos os dados operam sob Soberania Estrita da Nuvem sem depender de cache local (<code className="text-sky-300">localStorage</code> zero-cache).
              </p>
            </div>

            {/* Indicador Principal 2 — Sincronizado com a Nuvem (SIM / NÃO) */}
            <div className="flex flex-col sm:items-end gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Integridade Multi-Device:</span>
              {cloudAudit ? (
                cloudAudit.isFullySynced && cloudAudit.isOnline && syncStatus !== "error" ? (
                  <div className="px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-[#30D158] font-black text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(48,209,88,0.25)]">
                    <CheckCircle2 className="w-5 h-5 text-[#30D158]" />
                    <span>Sincronizado com a Nuvem: SIM ✅</span>
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-[#FF453A] font-black text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(255,69,58,0.25)]">
                    <AlertTriangle className="w-5 h-5 text-[#FF453A]" />
                    <span>Sincronizado com a Nuvem: NÃO ⚠️</span>
                  </div>
                )
              ) : (
                <div className="px-4 py-2 rounded-2xl bg-slate-800/80 border border-white/10 text-slate-300 font-bold text-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Auditando Nuvem...</span>
                </div>
              )}
            </div>
          </div>

          {/* Grid de 4 Indicadores Verídicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Indicador Principal 1 — Status do Servidor */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-sky-400" /> Status do Servidor
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                {cloudAudit?.isOnline ? (
                  <>
                    <span className="text-sm font-extrabold text-[#30D158] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#30D158] animate-pulse" />
                      🟢 ONLINE
                    </span>
                    <span className="text-xs font-mono text-slate-400">({cloudAudit.latencyMs} ms)</span>
                  </>
                ) : (
                  <span className="text-sm font-extrabold text-[#FF453A] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF453A]" />
                    🔴 OFFLINE
                  </span>
                )}
              </div>
            </div>

            {/* Prova Real de Lançamentos */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Table2 className="w-3.5 h-3.5 text-indigo-400" /> Lançamentos
              </span>
              <div className="mt-2">
                <div className="text-sm font-extrabold text-white">
                  Nuvem: <span className="text-indigo-400">{cloudAudit ? cloudAudit.cloudTxCount : "..."}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Na tela: <span className="font-semibold text-slate-200">{transactions.length}</span>
                  {cloudAudit && cloudAudit.cloudTxCount === transactions.length ? (
                    <span className="ml-1 text-emerald-400 font-bold">✓ Bate 100%</span>
                  ) : cloudAudit ? (
                    <span className="ml-1 text-amber-400 font-bold">≠ Divergente</span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Prova Real de Cartões */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> Cartões no Cofre
              </span>
              <div className="mt-2">
                <div className="text-sm font-extrabold text-white">
                  Nuvem: <span className="text-cyan-400">{cloudAudit ? cloudAudit.cloudCardsCount : "..."}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Na tela: <span className="font-semibold text-slate-200">{cards.length}</span>
                  {cloudAudit && cloudAudit.cloudCardsCount === cards.length ? (
                    <span className="ml-1 text-emerald-400 font-bold">✓ Bate 100%</span>
                  ) : cloudAudit ? (
                    <span className="ml-1 text-amber-400 font-bold">≠ Divergente</span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Modo de Armazenamento e Hora */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Modo de Armazenamento
              </span>
              <div className="mt-2">
                <div className="text-[11px] font-bold text-emerald-300">
                  100% Nuvem Estrito
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Verificado: {cloudAudit?.checkedAt || "Aguardando teste..."}
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação Rápida no Card */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
            <div className="text-[11px] text-slate-400">
              {cloudAudit?.hasCloudVault ? (
                <span className="text-emerald-400 font-medium">
                  ✓ Registro mestre __COINDEX_CLOUD_VAULT_V3__ verificado e ativo no PostgreSQL.
                </span>
              ) : cloudAudit ? (
                <span className="text-amber-400 font-medium">
                  ⚠️ Cofre V3 não detectado. Clique em &quot;Forçar Gravação na Nuvem&quot; para criá-lo.
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={runCloudAudit}
                disabled={isAuditingCloud}
                className="px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-xs font-bold text-sky-300 flex items-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isAuditingCloud ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                🔍 Testar e Verificar Nuvem Agora
              </button>

              <button
                type="button"
                onClick={handleForensicRecoveryClick}
                disabled={isRecovering}
                className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-bold text-rose-300 flex items-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-sm"
                title="Resgata lançamentos com datas MDY invertidas ou armazenados no cofre/caches de Set/Out/Nov"
              >
                {isRecovering ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>🩺</span>
                )}
                Resgatar Lançamentos (Set/Out/Nov)
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (pushFullStateToCloud) {
                    await pushFullStateToCloud({ showToast: true });
                    void runCloudAudit();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                ⬆️ Forçar Gravação na Nuvem
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (handleManualForceCloudSync) {
                    await handleManualForceCloudSync();
                    void runCloudAudit();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-indigo-300 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                ⬇️ Recarregar Dados da Nuvem
              </button>
            </div>
          </div>
        </div>

        {/* SPRINT 53: CONTROLE DE TEMA (CLARO / ESCURO) */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--cupertino-border)] space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" /> Tema da Interface (Claro / Escuro)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                Alterne entre o tema Claro (Apple Cupertino Light Glass) e Escuro (Cyber-Glassmorphism Dark) com transição de alta fluidez.
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Modo de Exibição:</span>
              <SlidingSegmentedControl
                options={[
                  {
                    id: "light",
                    label: "Claro",
                    icon: <Sun className="w-3.5 h-3.5 text-amber-500" />
                  },
                  {
                    id: "dark",
                    label: "Escuro",
                    icon: <Moon className="w-3.5 h-3.5 text-sky-400" />
                  }
                ]}
                value={cupertinoTheme ?? "dark"}
                onChange={(val) => toggleCupertinoTheme?.(val as "light" | "dark")}
                size="sm"
                activeColor={cupertinoTheme === "light" ? "bg-white text-slate-900 shadow-sm" : "bg-slate-800 text-white shadow-sm"}
              />
            </div>
          </div>
        </div>

        {/* SPRINT 49 / SPRINT 53: CONTROLE UNIFICADO "REDUZIR ANIMAÇÕES: [SIM | NÃO]" */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--cupertino-border)] space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0A84FF]" /> Reduzir Animações (Atmosfera & Efeitos de Background)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                Alterne entre a experiência imersiva com efeitos atmosféricos Híbrido Copilot (Aurora + Micro-Grid + Spotlight) e o modo de alto rendimento sólido puro sem animações decorativas.
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">
                Reduzir Animações:
              </span>
              <SlidingSegmentedControl
                options={[
                  { id: "sim", label: "Sim" },
                  { id: "nao", label: "Não" }
                ]}
                value={bgFxMode === "none" ? "sim" : "nao"}
                onChange={(val) => {
                  if (val === "sim") {
                    handleSelectBgFxMode?.("none");
                  } else {
                    handleSelectBgFxMode?.("hybrid");
                  }
                }}
                size="sm"
                activeColor="bg-[#0A84FF] text-white"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-base">
                {bgFxMode === "none" ? "⬛" : "✨"}
              </span>
              <span>
                {bgFxMode === "none"
                  ? "Modo Econômico: Animações Reduzidas (Sólido Puro — efeitos decorativos e atmosferas desativados)"
                  : "144Hz ATIVO — Híbrido Copilot (Aurora Cupertino + Micro-Grid + Spotlight ativo em 144Hz)"}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${bgFxMode !== "none" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800 text-slate-300 border border-white/10"}`}>
              {bgFxMode !== "none" ? "144Hz ATIVO" : "ECONOMIA ATIVA"}
            </span>
          </div>
        </div>

        {/* PAINEL DE SISTEMAS INTEGRADOS (PATRIMÔNIO OFICIAL & STRAVA) */}
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-extrabold text-white">Sistemas Integrados & Cloud Sync</h3>
            <p className="text-xs text-slate-400">As conexões só são disparadas sob comando. Se houver falha, o status informa o diagnóstico de rede em tempo real.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
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
              {[...categoriesCatalog].sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })).map((cat) => {
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

  // ============================================================================
  // ABA 9: SOBRE O COINDEX OS (MANIFESTO, VERSÃO & TELEMETRIA 144Hz)
  // ============================================================================
  if (activeTab === "about") {
    return <AboutTab />;
  }

  return null;
}
