"use client";

import React, { useState, useEffect } from "react";
import {
  Plus, CreditCard, Car, Table2, Search, CheckCircle2, Clock, Trash2,
  RefreshCw, Activity, Brain, Target, Flame, Pencil,
  Image as ImageIcon, Download, Upload, Camera, User, FileText, HandCoins,
  Users, Share2, Layers, AlertTriangle, XCircle, Eye, EyeOff, Filter, Loader2,
  ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, Check, X, RotateCcw,
  SlidersHorizontal, Settings, Fuel, Gauge, DollarSign, Award, Info, Landmark,
  Sparkles, ExternalLink, ShoppingBag, Circle
} from "lucide-react";
import {
  ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, BarChart, Bar, LineChart, Line, ReferenceLine, Cell
} from "recharts";
import {
  ActiveTab, Transaction, CreditCardItem, BankItem, BankInstitution, StaticStatusItem, WishlistItem,
  BioLog, StravaStats, BrainNote, PersonalOKR, CustomAlertRule, ChartThemeColors,
  CategoryCatalogItem, SystemLogEntry, ThemeMode, FlowType, APP_VERSION,
  formatBRL, sanitizeText, compressImageFileToBase64, renderCategorySemanticIcon,
  CustomCyberTooltip, ThemeSegmentedControl, buildWhatsAppChargeText,
  formatDateBR, AutoInmetroConfig, DEFAULT_AUTO_INMETRO_CONFIG, DashboardWidgetConfig,
  parseInstallmentInfo, toCents, fromCents, safeAdd, safeSub,
  calculateCardExposure, calculateBankExposure, calculateStaticStatusSummary
} from "./lifeos-data";
import ChartCard from "./components/ChartCard";
import {
  ChartKind,
  ChartLineCurve,
  ChartWidgetSettings,
  ChartWidgetSize,
  DEFAULT_CHART_WIDGET_SETTINGS
} from "./components/ChartSettingsPopover";
import { TransactionsTableAdvanced } from "./TransactionsTableAdvanced";
import { BanksTab } from "./components/BanksTab";
import { VehiclesTab } from "./components/VehiclesTab";

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
    <div className="flex items-center gap-2 max-w-[195px]">
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
        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-amber-500/30 text-white placeholder-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs transition-all"
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
  notify: (title: string, subtitle?: string, type?: "success" | "warning" | "info", cat?: any) => void;
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
    searchQuery, setSearchQuery, handleExportCSV, handleOpenNewTxModal, getFlowType,
    banks, editingBankId, setEditingBankId, newBank, setNewBank, handleSaveBank, handleDeleteBank,
    cards, categoryColors, handleToggleStatus, handleStartEditTransaction, handleDeleteTransaction,
    receivableItems, receivablesAnalytics, handleAssignDebtor, handlePartialPaymentReceivable,
    notify, editingCardId, setEditingCardId, newCard, setNewCard, handleSaveCard, handleDeleteCard,
    handlePayCardInvoice, wishlist, editingWishId, setEditingWishId, newWish, setNewWish,
    handleSaveWish, handleIncrementWish, handleDeleteWish, personalBudgetLimit, autoMetrics,
    chartTheme, updateChartThemeColor, stravaStats, isSyncingStrava, syncStravaFromApi,
    bioLogs, editingBioId, setEditingBioId, newBio, setNewBio, handleSaveBioLog, handleDeleteBioLog,
    okrs, saveOkrs, newOkr, setNewOkr, handleAddOkr, notes, selectedNoteTag, setSelectedNoteTag,
    editingNoteId, setEditingNoteId, newNote, setNewNote, handleSaveNote, handleDeleteNote, handleToggleNoteCompleted,
    handleExportFullBackupJSON, handleImportFullBackupJSON, handleUpdateProfileAvatar,
    sheetApiUrl, setSheetApiUrl, isSyncing, syncFromGoogleSheets,
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
        : new Date().toISOString().slice(0, 7);

    const normalizeDesc = (str: string) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const txsInMonth = transactions.filter((t) => t.date.startsWith(targetMonth));

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
            <button type="submit" className={`w-full py-3 rounded-xl text-white font-extrabold shadow-lg transition-all ${editingStatusId ? "bg-emerald-600 hover:bg-emerald-500" : "bg-indigo-600 hover:bg-indigo-500"}`}>
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
          <div>
            <h3 className="text-sm font-extrabold text-white">Tabela de Atribuição de Devedores e Abatimento Parcial</h3>
            <p className="text-xs text-slate-400">
              Digite o nome da pessoa (salva ao sair do campo), abata valores parciais ou clique na situação para quitar 100%.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-slate-950/60 text-slate-400">
                  <th className="py-3.5 px-3">Data</th>
                  <th className="py-3.5 px-3">Descrição</th>
                  <th className="py-3.5 px-3">Pessoa (Devedor)</th>
                  <th className="py-3.5 px-3">Abater Valor Parcial</th>
                  <th className="py-3.5 px-3">Situação</th>
                  <th className="py-3.5 px-3 text-right">Restante / Total</th>
                  <th className="py-3.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {receivableItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Nenhum lançamento classificado como "A Receber" até o momento.
                    </td>
                  </tr>
                ) : (
                  receivableItems.map((item) => {
                    const pInput = partialInputs[item.id] ? partialInputs[item.id] : "";
                    return (
                      <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3.5 px-3 font-mono tabular-nums text-slate-300">{formatDateBR(item.date)}</td>
                        <td className="py-3.5 px-3 font-semibold text-white">
                          {item.description}
                          {item.cardUsed && <span className="block text-[10px] text-indigo-400">{item.paymentMethod} • {item.cardUsed}</span>}
                          {item.bankAccount && !item.cardUsed && <span className="block text-[10px] text-sky-400">{item.paymentMethod} • {item.bankAccount}</span>}
                        </td>
                        <td className="py-3.5 px-3">
                          <DebtorInputCell txId={item.id} initialValue={item.debtorName} onCommit={handleAssignDebtor} />
                        </td>
                        <td className="py-3.5 px-3">
                          {item.status === "Pago" ? (
                            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Quitado
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1.5 min-w-[210px] max-w-[230px]">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="R$..."
                                  value={pInput}
                                  onChange={(e) =>
                                    setPartialInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                                  }
                                  className="w-20 min-h-[36px] px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-indigo-500 font-mono tabular-nums"
                                />
                                <select
                                  value={partialBank[item.id] || banks[0]?.name || ""}
                                  onChange={(e) =>
                                    setPartialBank((prev) => ({ ...prev, [item.id]: e.target.value }))
                                  }
                                  className="flex-1 min-h-[36px] px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-[11px] text-white outline-none focus:border-indigo-500 truncate"
                                  title="Banco / Conta de destino para o valor recebido"
                                >
                                  {banks.map((b) => (
                                    <option key={b.id} value={b.name}>
                                      {b.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center gap-1.5">
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
                                  className="flex-1 min-h-[36px] py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold shadow-md transition flex items-center justify-center"
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
                                  className="min-h-[36px] py-1.5 px-2.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold transition flex items-center justify-center"
                                  title="Quitar 100% do saldo restante e creditar receita"
                                >
                                  Quitar 100%
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.status !== "Pago" && item.remaining > 0) {
                                const dest = partialBank[item.id] || banks[0]?.name || "Nubank";
                                handlePartialPaymentReceivable(item, item.remaining, dest);
                              } else {
                                handleToggleStatus(item);
                              }
                            }}
                            className={`whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium leading-none transition ${
                              item.status === "Pago"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                            }`}
                            title={item.status === "Pago" ? "Reabrir lançamento" : "Quitar lançamento integralmente"}
                          >
                            {item.status === "Pago" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {item.status}
                          </button>
                        </td>
                        <td className={`py-3.5 px-3 text-right ${moneyBlur}`}>
                          <span className="font-extrabold text-amber-400 block font-mono tabular-nums">{formatBRL(item.remaining)}</span>
                          {item.effectivePaid > 0 && item.status !== "Pago" && (
                            <span className="text-[10px] text-emerald-400 block font-mono tabular-nums">
                              Pago: {formatBRL(item.effectivePaid)} de {formatBRL(item.amount)}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleStartEditTransaction(item)}
                            className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white hover:bg-indigo-600 transition"
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
              onClick={syncStravaFromApi}
              disabled={isSyncingStrava}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
            >
              {isSyncingStrava ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{isSyncingStrava ? "Sincronizando..." : "Atualizar pelo Strava"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-white">Curva de Peso (kg) e Gordura Corporal (BF %)</h3>
                <p className="text-xs text-slate-400">Histórico visual das suas pesagens e avaliações físicas.</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer"><span>Peso:</span><input type="color" value={chartTheme.weightLine} onChange={(e) => updateChartThemeColor("weightLine", e.target.value)} className="color-circle" /></label>
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer"><span>BF%:</span><input type="color" value={chartTheme.bfLine} onChange={(e) => updateChartThemeColor("bfLine", e.target.value)} className="color-circle" /></label>
              </div>
            </div>
            <div className="h-72 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bioLogs} accessibilityLayer={false}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartTheme.weightLine} stopOpacity={0.25} /><stop offset="95%" stopColor={chartTheme.weightLine} stopOpacity={0.0} /></linearGradient>
                    <linearGradient id="colorBf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartTheme.bfLine} stopOpacity={0.25} /><stop offset="95%" stopColor={chartTheme.bfLine} stopOpacity={0.0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(v) => formatDateBR(v)} />
                  <YAxis stroke="#64748b" fontSize={11} domain={["auto", "auto"]} />
                  <Tooltip content={<CustomCyberTooltip isCurrency={false} />} cursor={false} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Area type="monotone" dataKey="weight" name="Peso Corporal (kg)" stroke={chartTheme.weightLine} strokeWidth={2} fill="url(#colorWeight)" />
                  <Area type="monotone" dataKey="bf" name="Gordura - BF (%)" stroke={chartTheme.bfLine} strokeWidth={2} fill="url(#colorBf)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <form onSubmit={handleSaveBioLog} className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-3.5 text-xs h-fit">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">{editingBioId ? "Editar Medição" : "Nova Pesagem"}</h3>
              {editingBioId && (
                <button type="button" onClick={() => { setEditingBioId(null); setNewBio({ date: new Date().toISOString().split("T")[0], weight: "", bf: "" }); }} className="text-[11px] text-rose-400 hover:underline">
                  Cancelar
                </button>
              )}
            </div>
            <input type="date" required value={newBio.date} onChange={(e) => setNewBio({ ...newBio, date: e.target.value })} className={inputClass} />
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
            <button type="submit" className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg transition">
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
                className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  muralFilter === "ALL"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/20"
                    : "bg-slate-900/90 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Todos
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 font-mono tabular-nums">{notes.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setMuralFilter("NOTES")}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  muralFilter === "NOTES"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/20"
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
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                    selectedNoteTag === t
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-slate-900 text-slate-400 hover:text-white"
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
                              <Circle className="w-5 h-5 text-slate-500 hover:text-emerald-400 transition" />
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
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                  newNote.itemType !== "wish"
                    ? "bg-indigo-600 text-white shadow"
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
            <ThemeSegmentedControl themeMode={themeMode} onChange={changeThemeMode} />
            <button type="button" onClick={handleExportFullBackupJSON} className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition">
              <Download className="w-3.5 h-3.5" /> Backup (.JSON)
            </button>
            <label className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-indigo-300 cursor-pointer flex items-center gap-1.5 transition">
              <Upload className="w-3.5 h-3.5" /> Restaurar
              <input type="file" accept=".json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFullBackupJSON(f); }} />
            </label>
            <label className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 transition shadow-sm">
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
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
              >
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>{isSyncing ? "Sincronizando Planilha..." : "Sincronizar Planilha"}</span>
              </button>
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
                        <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sincronizado</>
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
                      const n = { ...stravaConfig, athleteId: sanitizeText(e.target.value) };
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
                      const n = { ...stravaConfig, clientId: sanitizeText(e.target.value) };
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
                      const n = { ...stravaConfig, clientSecret: e.target.value.trim() };
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
                      const n = { ...stravaConfig, refreshToken: e.target.value.trim() };
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
              </div>

              <button
                type="button"
                onClick={syncStravaFromApi}
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
                    ? "bg-indigo-600 hover:bg-indigo-500"
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
                        : "bg-indigo-600 hover:bg-indigo-500"
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
