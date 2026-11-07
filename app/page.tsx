"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
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
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Globe,
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
  Info,
  Zap,
  CalendarRange,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCheck,
  ArrowRightLeft,
  ShieldCheck,
  Table2
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
  ReferenceLine,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
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
  StravaActivity,
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
  ALL_DASHBOARD_WIDGET_IDS,
  normalizeDashboardLayout,
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
  formatMonthShortLabelBR,
  todayBR,
  todayISO,
  daysInMonth,
  addMonthsSafe,
  toSortableISO,
  compareDatesBR,
  getYearMonthKey,
  getEffectivePersonalAmount,
  getEffectiveCardLiabilityAmount,
  isPositiveInflowDisplay,
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
  removeTombstone,
  removeTombstones,
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
  upsertCardsInDb,
  deleteCardInDb,
  upsertBankInDb,
  upsertBanksInDb,
  deleteBankInDb,
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
import { TransactionModal, SmartDateInputBR } from "./components/TransactionModal";
import { ProfileModal } from "./components/ProfileModal";
import KpiAuditModal from "./components/KpiAuditModal";
import { AmbientBackgroundFX, AmbientFxMode, AMBIENT_FX_OPTIONS } from "./components/AmbientBackgroundFX";
import { SlidingSegmentedControl } from "./components/SlidingSegmentedControl";
import { AnimatedNumber144, AnimatedBRL144, AnimatedMetric144, AnimatedBRL, AnimatedMetric } from "./components/AnimatedNumber144";
import { TiltCard3D, triggerAuraBurst } from "./components/MotionEngine144";
import {
  calculateVehicleConsumption,
  calculateVehicleTco,
  isFuelTransaction
} from "./lib/domain/vehicle-math";
import { reconcileReceivablesAndCashbook } from "./lib/domain/cashbook-sync";

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
    capitalAportadoPuro?: number;
    rendimentoBruto?: number;
    rendimentoLiquido?: number;
    acumuladoComRendimento?: number;
  };
}

interface PatrimonyCyberTooltipProps {
  active?: boolean;
  payload?: PatrimonyTooltipPayloadItem[];
  label?: string;
  moneyBlur?: string;
  cdiPercentage?: number;
}

function PatrimonyCyberTooltip({ active, payload, label, moneyBlur = "", cdiPercentage = 115 }: PatrimonyCyberTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const totalComJuros = data.acumuladoComRendimento ?? data.acumulado ?? 0;
  const capitalPuro = data.capitalAportadoPuro ?? safeSub(totalComJuros, data.rendimentoBruto || 0);
  const rendimento = data.rendimentoBruto || 0;

  return (
    <div className="bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] shadow-[var(--cupertino-shadow)] backdrop-blur-md rounded-xl px-3.5 py-2.5 text-xs space-y-1.5 min-w-[240px]">
      <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
        <p className="font-semibold text-slate-100">
          {label || data.label}
        </p>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#0A84FF]/20 text-[#64D2FF] border border-[#0A84FF]/30 font-bold">
          {cdiPercentage}% CDI
        </span>
      </div>

      {/* 1. Patrimônio Total (c/ Juros) */}
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-[#0A84FF] shrink-0" />
          Patrimônio Total (c/ Juros):
        </span>
        <strong className={`text-white font-mono font-bold tabular-nums ${moneyBlur}`}>
          {formatBRL(totalComJuros)}
        </strong>
      </div>

      {/* 2. Capital Líquido Aportado */}
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#5E5CE6] shrink-0" />
          Capital Líquido Aportado:
        </span>
        <strong className={`text-[#A5B4FC] font-mono tabular-nums ${moneyBlur}`}>
          {formatBRL(capitalPuro)}
        </strong>
      </div>

      {/* 3. Rendimento Acumulado */}
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#30D158] shrink-0" />
          Rendimento Acumulado ({cdiPercentage}% CDI):
        </span>
        <strong className={`text-[#30D158] font-mono font-bold tabular-nums ${moneyBlur}`}>
          +{formatBRL(rendimento)}
        </strong>
      </div>

      {/* 4. Aportes e Resgates no Mês */}
      <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-white/5 text-[11px]">
        <span className="text-slate-400">
          Aportes no Mês: <strong className={`text-white font-mono tabular-nums ${moneyBlur}`}>{formatBRL(data.aportado)}</strong>
        </span>
        {Boolean(data.resgatado && data.resgatado > 0) && (
          <span className="text-[#FF453A]">
            Resgates: <strong className={`font-mono tabular-nums ${moneyBlur}`}>{formatBRL(data.resgatado || 0)}</strong>
          </span>
        )}
      </div>
    </div>
  );
}

function SparklineSvg({
  data,
  color,
  className = "w-16 h-7"
}: {
  data: number[];
  color: string;
  className?: string;
}) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 24;
  const paddingY = 4;
  const plotH = height - paddingY * 2;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 6) + 3;
    const y = height - paddingY - ((val - min) / range) * plotH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const lastPoint = points[points.length - 1].split(",");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} fill="none" preserveAspectRatio="none">
      <path
        d={pathD}
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-75 group-hover:opacity-100 transition-opacity"
      />
      <circle
        cx={lastPoint[0]}
        cy={lastPoint[1]}
        r="2"
        fill={color}
      />
    </svg>
  );
}

interface PaceTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color?: string; dataKey: string }>;
  label?: string;
  moneyBlur?: string;
}

function PaceCyberTooltip({ active, payload, label, moneyBlur = "" }: PaceTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const realItem = payload.find((p) => p.dataKey === "real");
  const idealItem = payload.find((p) => p.dataKey === "ideal");
  const realVal = realItem?.value ?? null;
  const idealVal = idealItem?.value ?? null;
  const diff = realVal != null && idealVal != null ? idealVal - realVal : null;

  return (
    <div className="bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] shadow-[var(--cupertino-shadow)] backdrop-blur-md rounded-xl px-3.5 py-2.5 text-xs space-y-1.5 min-w-[210px]">
      <p className="font-semibold text-slate-100 border-b border-white/10 pb-1 mb-1">{label}</p>
      {realVal != null && (
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: diff != null && diff < 0 ? "#FF453A" : "#30D158" }}
            />
            Gasto Real Acumulado:
          </span>
          <strong className={`text-white font-mono tabular-nums ${moneyBlur}`}>
            {formatBRL(realVal)}
          </strong>
        </div>
      )}
      {idealVal != null && (
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
            Ritmo Ideal Linear:
          </span>
          <strong className={`text-slate-300 font-mono tabular-nums ${moneyBlur}`}>
            {formatBRL(idealVal)}
          </strong>
        </div>
      )}
      {diff != null && (
        <div className="pt-1 border-t border-white/10 flex items-center justify-between gap-3 text-[11px]">
          <span className="text-slate-400">Situação:</span>
          <span
            className={`font-mono font-bold tabular-nums ${
              diff >= 0 ? "text-[#30D158]" : "text-[#FF453A]"
            }`}
          >
            {diff >= 0 ? `+${formatBRL(diff)} abaixo do teto` : `${formatBRL(Math.abs(diff))} acima do teto`}
          </span>
        </div>
      )}
    </div>
  );
}

interface ForecastPayloadItem {
  value: number;
  name: string;
  fill?: string;
  dataKey: string;
  payload: {
    label: string;
    fixedCosts: number;
    cardInstallments: number;
    totalCommitted: number;
    percentOfIncome: number;
  };
}

function ForecastCyberTooltip({
  active,
  payload,
  label,
  moneyBlur = ""
}: {
  active?: boolean;
  payload?: ForecastPayloadItem[];
  label?: string;
  moneyBlur?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div className="bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] shadow-[var(--cupertino-shadow)] backdrop-blur-md rounded-xl px-3.5 py-2.5 text-xs space-y-1.5 min-w-[220px]">
      <p className="font-semibold text-slate-100 border-b border-white/10 pb-1 mb-1">{label || d.label}</p>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#0A84FF] shrink-0" />
          Custos Fixos Ativos:
        </span>
        <strong className={`text-white font-mono tabular-nums ${moneyBlur}`}>
          {formatBRL(d.fixedCosts)}
        </strong>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#FF9F0A] shrink-0" />
          Parcelas de Cartão:
        </span>
        <strong className={`text-[#FF9F0A] font-mono tabular-nums ${moneyBlur}`}>
          {formatBRL(d.cardInstallments)}
        </strong>
      </div>
      <div className="pt-1 border-t border-white/10 flex items-center justify-between gap-3 text-[11px]">
        <span className="text-slate-300 font-semibold">Total Comprometido:</span>
        <strong className={`text-white font-mono font-bold tabular-nums ${moneyBlur}`}>
          {formatBRL(d.totalCommitted)} ({d.percentOfIncome}%)
        </strong>
      </div>
    </div>
  );
}

/**
 * HOTFIX SPRINT 47.1: Motor de Resgate & Merge Seguro LWW para Bancos e Cartões
 * Previne sobrescrita destrutiva pela nuvem e ressurgimento de itens excluídos via Tombstones.
 */
export function mergeEntitiesSafe<
  T extends { id: string; name?: string; updatedAt?: string; deletedAt?: string; rev?: number }
>(
  localList: T[],
  remoteList: T[],
  tombstones: Set<string>
): T[] {
  const mergedMap = new Map<string, T>();

  const isLocalNewerOrEqual = (local: T, remote: T): boolean => {
    const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
    const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
    if (localTime !== remoteTime) {
      return localTime >= remoteTime;
    }
    const localRev = local.rev ?? 0;
    const remoteRev = remote.rev ?? 0;
    if (localRev !== remoteRev) {
      return localRev >= remoteRev;
    }
    return true; // Empate: dá preferência absoluta ao local
  };

  // 1. Registra entidades remotas válidas
  for (const remote of remoteList) {
    if (!remote || !remote.id) continue;
    if (tombstones.has(remote.id) || remote.deletedAt) continue;
    mergedMap.set(remote.id, remote);
  }

  // 2. Mescla entidades locais com LWW (Last-Write-Wins)
  for (const local of localList) {
    if (!local || !local.id) continue;
    if (tombstones.has(local.id) || local.deletedAt) continue;

    const existing = mergedMap.get(local.id);
    if (!existing) {
      mergedMap.set(local.id, local);
    } else {
      if (isLocalNewerOrEqual(local, existing)) {
        mergedMap.set(local.id, local);
      }
    }
  }

  // 3. Desduplicação inteligente por nome canônico
  const byName = new Map<string, T>();
  for (const item of mergedMap.values()) {
    const normName = item.name ? item.name.trim().toLowerCase() : null;
    if (!normName) {
      byName.set(item.id, item);
      continue;
    }
    const existing = byName.get(normName);
    if (!existing) {
      byName.set(normName, item);
    } else {
      if (isLocalNewerOrEqual(item, existing)) {
        byName.set(normName, item);
      }
    }
  }

  return Array.from(byName.values());
}

/**
 * Varredor de Resgate Automático de Bancos e Cartões (Sprint 47.1)
 * Inspeciona todo o localStorage e histórico de transações para reconstruir instituições e cartões faltantes.
 */
export function rescueMissingBanksAndCards(
  currentBanks: BankItem[],
  currentCards: CreditCardItem[],
  currentTxs: Transaction[],
  tombstones: Set<string>
): { rescuedBanks: BankItem[]; rescuedCards: CreditCardItem[]; rescuedCount: number } {
  let rescuedCount = 0;
  const candidateBanks: BankItem[] = [...currentBanks];
  const candidateCards: CreditCardItem[] = [...currentCards];

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const totalKeys = window.localStorage.length;
      for (let i = 0; i < totalKeys; i++) {
        const key = window.localStorage.key(i);
        if (!key) continue;

        // Inspeciona chaves de bancos
        if (
          key.includes("banks_v8") ||
          key.includes("banks_v1") ||
          key.includes("vault_banks_backup") ||
          (key.startsWith("coindex_") && key.includes("banks"))
        ) {
          try {
            const raw = window.localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                for (const item of parsed) {
                  if (item && typeof item === "object" && item.id && item.name) {
                    if (!tombstones.has(item.id) && !item.deletedAt) {
                      candidateBanks.push(item);
                    }
                  }
                }
              }
            }
          } catch {
            // Ignora JSONs corrompidos
          }
        }

        // Inspeciona chaves de cartões
        if (
          key.includes("cards_v8") ||
          key.includes("vault_cards_backup") ||
          (key.startsWith("coindex_") && key.includes("cards"))
        ) {
          try {
            const raw = window.localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                for (const item of parsed) {
                  if (item && typeof item === "object" && item.id && item.name) {
                    if (!tombstones.has(item.id) && !item.deletedAt) {
                      candidateCards.push(item);
                    }
                  }
                }
              }
            }
          } catch {
            // Ignora JSONs corrompidos
          }
        }
      }
    } catch (e) {
      console.warn("[coindex] Erro ao varrer localStorage para resgate de bancos/cartões:", e);
    }
  }

  // Mescla inicial segura
  let rescuedBanks = mergeEntitiesSafe(candidateBanks, [], tombstones);
  let rescuedCards = mergeEntitiesSafe(candidateCards, [], tombstones);

  // Garante que bancos padrões essenciais existam caso não estejam tombstoned
  if (!rescuedBanks.some((b) => b.name === "BTG Pactual") && !tombstones.has("b3")) {
    const btg = INITIAL_BANKS.find((b) => b.name === "BTG Pactual");
    if (btg) rescuedBanks.push(btg);
  }
  if (!rescuedBanks.some((b) => b.name === "Nubank") && !tombstones.has("b1")) {
    const nu = INITIAL_BANKS.find((b) => b.name === "Nubank");
    if (nu) rescuedBanks.push(nu);
  }
  if (!rescuedBanks.some((b) => b.name === "Inter") && !tombstones.has("b2")) {
    const inter = INITIAL_BANKS.find((b) => b.name === "Inter");
    if (inter) rescuedBanks.push(inter);
  }

  // Garante cartões padrões se vazios
  if (rescuedCards.length === 0) {
    for (const initCard of INITIAL_CARDS) {
      if (!tombstones.has(initCard.id)) {
        rescuedCards.push(initCard);
      }
    }
  }

  // Inspeciona todas as transações ativas para auto-reconstrução de instituições e cartões
  for (const tx of currentTxs) {
    // 1. Resgate de Cartão citado em transação
    if (tx.cardUsed && typeof tx.cardUsed === "string" && tx.cardUsed.trim().length > 0) {
      const cardName = tx.cardUsed.trim();
      const cardExists = rescuedCards.some(
        (c) => c.name.toLowerCase() === cardName.toLowerCase() || (tx.cardId && c.id === tx.cardId)
      );
      if (!cardExists) {
        const slugId = tx.cardId || `card-rescued-${cardName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        if (!tombstones.has(slugId)) {
          rescuedCards.push({
            id: slugId,
            name: cardName,
            brand: "Mastercard Black",
            limit: 5000,
            closingDay: 25,
            dueDay: 5,
            bankName: tx.bankAccount || undefined,
            updatedAt: new Date().toISOString(),
            rev: 1
          });
          rescuedCount++;
        }
      }
    }

    // 2. Resgate de Bancos citados em transação
    const banksToCheck = [tx.bankAccount, tx.sourceBank, tx.destinationBank].filter(
      (b): b is string => Boolean(b && typeof b === "string" && b.trim().length > 0)
    );

    for (const bName of banksToCheck) {
      const cleanBName = bName.trim();
      if (["dinheiro", "pix", "ted", "doc", "boleto", "outros"].includes(cleanBName.toLowerCase())) {
        continue;
      }
      const bankExists = rescuedBanks.some(
        (b) => b.name.toLowerCase() === cleanBName.toLowerCase() || (tx.bankId && b.id === tx.bankId)
      );
      if (!bankExists) {
        const slugId = tx.bankId || `bank-rescued-${cleanBName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        if (!tombstones.has(slugId)) {
          rescuedBanks.push({
            id: slugId,
            name: cleanBName,
            limitType: "Cartão de Crédito",
            accountType: "Conta Digital",
            updatedAt: new Date().toISOString(),
            rev: 1
          });
          rescuedCount++;
        }
      }
    }
  }

  // Re-aplica merge final para ordenar e desduplicar
  rescuedBanks = mergeEntitiesSafe(rescuedBanks, [], tombstones);
  rescuedCards = mergeEntitiesSafe(rescuedCards, [], tombstones);

  return { rescuedBanks, rescuedCards, rescuedCount };
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

  const toggleCupertinoTheme = useCallback((theme: "light" | "dark", e?: React.MouseEvent) => {
    if (theme === cupertinoTheme) return;

    const applyTheme = () => {
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
    };

    if (typeof document !== "undefined" && "startViewTransition" in document) {
      const x = e ? e.clientX : window.innerWidth / 2;
      const y = e ? e.clientY : 0;
      const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const transition = (document as unknown as { startViewTransition: (cb: () => void) => { ready?: Promise<void> } }).startViewTransition(() => {
        applyTheme();
      });
      transition.ready?.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 550,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)"
          }
        );
      }).catch(() => {
        applyTheme();
      });
    } else {
      applyTheme();
    }
  }, [cupertinoTheme]);

  // SPRINT 45 / SPRINT 49: Motor de Efeitos de Background fixo em Híbrido Copilot (comutável via "Reduzir Animações" nas Configurações)
  const [bgFxMode, setBgFxMode] = useState<AmbientFxMode>("hybrid");

  useEffect(() => {
    try {
      const savedBgFx = localStorage.getItem("coindex_bg_fx_mode") as AmbientFxMode | null;
      if (savedBgFx && ["hybrid", "aurora", "grid", "rays", "spotlight", "none"].includes(savedBgFx)) {
        setBgFxMode(savedBgFx);
      }
    } catch {}
  }, []);

  const handleSelectBgFxMode = useCallback((mode: AmbientFxMode) => {
    setBgFxMode(mode);
    try {
      localStorage.setItem("coindex_bg_fx_mode", mode);
    } catch (err) {
      console.error("Erro ao salvar coindex_bg_fx_mode", err);
    }
  }, []);

  // SPRINT 52: Respeito Arquitetural ao Toggle "Reduzir Animações" (data-animations on/off)
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-animations", bgFxMode !== "none" ? "on" : "off");
    }
  }, [bgFxMode]);

  // SPRINT 52: Estado da Fatia Ativa no Donut Chart (Elastic Slice Pull-Out)
  const [donutHoverIndex, setDonutHoverIndex] = useState<number | null>(null);

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
  const [selectedWalletCardId, setSelectedWalletCardId] = useState<string | null>(null);
  const [walletCarouselIndex, setWalletCarouselIndex] = useState<number>(0);
  const [showReorderCardsModal, setShowReorderCardsModal] = useState<boolean>(false);
  const lastWalletWheelTime = useRef<number>(0);
  const [cashflowActiveTab, setCashflowActiveTab] = useState<"fluxo" | "recentes">("fluxo");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const periodDropdownRef = useRef<HTMLDivElement>(null);

  // Data de referência estável para SSR/Prerender (Next.js 16)
  const [currentCalendarDate, setCurrentCalendarDate] = useState({
    year: 2026,
    month: 11,
    day: 3,
    yearMonth: "2026-11"
  });

  useEffect(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    setCurrentCalendarDate({
      year: y,
      month: m,
      day,
      yearMonth: `${y}-${String(m).padStart(2, "0")}`
    });
  }, []);

  // Inicialização e persistência de período no localStorage (padrão estrito: 'ALL')
  useEffect(() => {
    try {
      const saved = localStorage.getItem("coindex_selected_month");
      if (!saved) {
        localStorage.setItem("coindex_selected_month", "ALL");
      } else if (saved !== selectedMonth) {
        setSelectedMonth(saved);
      }
      const savedRange = localStorage.getItem("coindex_custom_date_range");
      if (savedRange) {
        const parsed = JSON.parse(savedRange);
        if (parsed?.start) setCustomStartDate(parsed.start);
        if (parsed?.end) setCustomEndDate(parsed.end);
      }
    } catch {}
  }, []);

  const handleSelectPeriod = (newPeriod: string) => {
    setSelectedMonth(newPeriod);
    try {
      localStorage.setItem("coindex_selected_month", newPeriod);
    } catch {}
    if (newPeriod !== "CUSTOM") {
      setPeriodDropdownOpen(false);
    }
  };

  const handleApplyCustomRange = () => {
    if (!customStartDate && !customEndDate) return;
    setSelectedMonth("CUSTOM");
    try {
      localStorage.setItem("coindex_selected_month", "CUSTOM");
      localStorage.setItem(
        "coindex_custom_date_range",
        JSON.stringify({ start: customStartDate, end: customEndDate })
      );
    } catch {}
    setPeriodDropdownOpen(false);
  };

  useEffect(() => {
    if (!periodDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(e.target as Node)) {
        setPeriodDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPeriodDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [periodDropdownOpen]);

  const formatMonthFullLabel = useCallback((ymKey: string) => {
    if (!ymKey || !ymKey.includes("-")) return ymKey;
    const [y, m] = ymKey.split("-");
    const mNum = parseInt(m, 10);
    const monthNamesBR = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const monthName = monthNamesBR[mNum - 1] || m;
    return `${monthName} / ${y}`;
  }, []);

  const selectedPeriodLabel = useMemo(() => {
    if (selectedMonth === "ALL") {
      return "🌐 Todos (Histórico Completo)";
    }
    if (selectedMonth === "THIS_YEAR") {
      return `📅 Este Ano (${currentCalendarDate.year})`;
    }
    if (selectedMonth === "LAST_30_DAYS") {
      return "⚡ Últimos 30 Dias";
    }
    if (selectedMonth === "CUSTOM") {
      if (customStartDate && customEndDate) {
        return `🎯 ${customStartDate.replace(/-/g, "/")} a ${customEndDate.replace(/-/g, "/")}`;
      }
      if (customStartDate) {
        return `🎯 A partir de ${customStartDate.replace(/-/g, "/")}`;
      }
      if (customEndDate) {
        return `🎯 Até ${customEndDate.replace(/-/g, "/")}`;
      }
      return "🎯 Intervalo Personalizado";
    }
    const label = formatMonthFullLabel(selectedMonth);
    const isCurrent = selectedMonth === currentCalendarDate.yearMonth;
    return `${label}${isCurrent ? " (Atual)" : ""}`;
  }, [selectedMonth, currentCalendarDate, customStartDate, customEndDate, formatMonthFullLabel]);

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

  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    const curYM = currentCalendarDate.yearMonth;
    monthSet.add(curYM);

    // Futuros (1 a 2 meses à frente)
    const [curY, curM] = curYM.split("-").map(Number);
    monthSet.add(addMonthsSafe(curY, curM, 1).key);
    monthSet.add(addMonthsSafe(curY, curM, 2).key);

    // Passados (12 meses para trás)
    for (let i = 1; i <= 12; i++) {
      monthSet.add(addMonthsSafe(curY, curM, -i).key);
    }

    // Todos os meses reais com transações
    for (const t of transactions) {
      if (!t.deletedAt && t.date) {
        const ym = getYearMonthKey(t.date);
        if (/^\d{4}-\d{2}$/.test(ym)) {
          monthSet.add(ym);
        }
      }
    }

    return Array.from(monthSet).sort((a, b) => b.localeCompare(a));
  }, [transactions, currentCalendarDate.yearMonth]);
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
  // SPRINT 42: Modal Interativo de Auditoria Célula a Célula dos 4 Cards de Resumo Financeiro
  const [activeKpiAudit, setActiveKpiAudit] = useState<"INCOME" | "EXPENSE" | "INVESTMENT" | "BALANCE" | null>(null);

  // SPRINT 30: Motor de Rendimento Automático CDI via API do Banco Central
  const [marketRates, setMarketRates] = useState<{
    cdiAnnualRate: number;
    dailyFactor252: number;
    updatedAt: string;
    source: string;
  }>({
    cdiAnnualRate: 13.65,
    dailyFactor252: 0.000508,
    updatedAt: "29/10/2026",
    source: "BCB-SGS"
  });
  const [yieldMode, setYieldMode] = useState<"bruto" | "liquido" | "aportes">("bruto");
  const [manualAdjustment, setManualAdjustment] = useState<number>(0);
  const [showAdjustmentInput, setShowAdjustmentInput] = useState<boolean>(false);

  // SPRINT 29: Dashboard 2.0 States (Multi-View Patrimônio, Drill-Down Donut e Radar)
  const [patrimonyCardView, setPatrimonyCardView] = useState<"patrimony" | "pace" | "forecast">("patrimony");
  const [selectedCategoryDrillDown, setSelectedCategoryDrillDown] = useState<string | null>(null);
  const [radarActiveTab, setRadarActiveTab] = useState<"fixos" | "pendentes" | "faturas" | "saude">("fixos");

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
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const dragMouseYRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

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

  // SPRINT 35: Helper Reativo de Altura dos Gráficos com Compactação (175px / 220px / 290px)
  const getChartHeightPx = (chartId: string, defaultPx = 175): number => {
    const cfg = getWidgetSettings(chartId, "auto", curveType);
    const h = cfg.height || "compact";
    if (h === "compact") return 175;
    if (h === "normal") return 220;
    if (h === "tall" || (h as string) === "expanded") return 290;
    return defaultPx;
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
        localStorage.setItem("coindex_dashboard_layout_v3", JSON.stringify(updated));
        localStorage.setItem("lifeos_dash_layout_v1", JSON.stringify(updated));
        if (currentUser) {
          setUserItem("coindex_dashboard_layout_v3", JSON.stringify(updated), currentUserId);
          setUserItem("lifeos_dash_layout_v1", JSON.stringify(updated), currentUserId);
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
        localStorage.setItem("coindex_dashboard_layout_v3", JSON.stringify(currentLayout));
        localStorage.setItem("lifeos_dash_layout_v1", JSON.stringify(currentLayout));
        if (currentUser) {
          setUserItem("coindex_dashboard_layout_v3", JSON.stringify(currentLayout), currentUserId);
          setUserItem("lifeos_dash_layout_v1", JSON.stringify(currentLayout), currentUserId);
        }
      } catch {
        // Ignora erro local
      }
      if (currentUser) {
        void updateUserSettingsInDb({ dashboardLayout: currentLayout });
      }
      return currentLayout;
    });
  };

  // SPRINT 31: Reordenação Rápida via Setas [← | →] em ChartCard
  const handleMoveWidget = (widgetId: string, direction: "left" | "right") => {
    setDashboardLayout((prev) => {
      const currentIndex = prev.findIndex((w) => w.id === widgetId);
      if (currentIndex === -1) return prev;
      const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const reordered = [...prev];
      const [moved] = reordered.splice(currentIndex, 1);
      reordered.splice(targetIndex, 0, moved);
      try {
        localStorage.setItem("coindex_dashboard_layout_v3", JSON.stringify(reordered));
        localStorage.setItem("lifeos_dash_layout_v1", JSON.stringify(reordered));
        if (currentUser) {
          setUserItem("coindex_dashboard_layout_v3", JSON.stringify(reordered), currentUserId);
          setUserItem("lifeos_dash_layout_v1", JSON.stringify(reordered), currentUserId);
        }
      } catch {}
      if (currentUser) {
        void updateUserSettingsInDb({ dashboardLayout: reordered });
      }
      return reordered;
    });
  };

  // SPRINT 32: Botão Rápido Enviar para o Topo "⇈"
  const handleMoveToTop = (widgetId: string) => {
    setDashboardLayout((prev) => {
      const currentIndex = prev.findIndex((w) => w.id === widgetId);
      if (currentIndex <= 0) return prev;
      const reordered = [...prev];
      const [moved] = reordered.splice(currentIndex, 1);
      reordered.unshift(moved);
      try {
        localStorage.setItem("coindex_dashboard_layout_v3", JSON.stringify(reordered));
        localStorage.setItem("lifeos_dash_layout_v1", JSON.stringify(reordered));
        if (currentUser) {
          setUserItem("coindex_dashboard_layout_v3", JSON.stringify(reordered), currentUserId);
          setUserItem("lifeos_dash_layout_v1", JSON.stringify(reordered), currentUserId);
        }
      } catch {}
      if (currentUser) {
        void updateUserSettingsInDb({ dashboardLayout: reordered });
      }
      return reordered;
    });
    notify("Card no Topo", "O card foi movido diretamente para a primeira posição.", "success", "CONFIG");
  };

  // SPRINT 32: Motor Edge Auto-Scroll 60fps durante Drag-and-Drop
  useEffect(() => {
    if (!draggingWidgetId) {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      dragMouseYRef.current = null;
      return;
    }

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      dragMouseYRef.current = e.clientY;
    };

    // Safety listeners para cancelar arrasto caso o usuário solte fora ou mude de foco (AUD-27)
    const handleSafetyCancel = () => {
      setDraggingWidgetId(null);
      setDragOverWidgetId(null);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      dragMouseYRef.current = null;
    };

    window.addEventListener("dragover", handleWindowDragOver, { passive: false });
    window.addEventListener("drop", handleSafetyCancel);
    window.addEventListener("dragend", handleSafetyCancel);
    window.addEventListener("blur", handleSafetyCancel);

    const scrollLoop = () => {
      const clientY = dragMouseYRef.current;
      if (clientY !== null && typeof window !== "undefined") {
        const topThreshold = 160;
        const bottomThreshold = window.innerHeight - 160;

        if (clientY < topThreshold) {
          // Zona de Subida Automática (Topo)
          const speed = Math.max(6, Math.round(((topThreshold - clientY) / topThreshold) * 28));
          mainScrollRef.current?.scrollBy({ top: -speed, behavior: "auto" });
          window.scrollBy({ top: -speed, behavior: "auto" });
        } else if (clientY > bottomThreshold) {
          // Zona de Descida Automática (Base)
          const diff = clientY - bottomThreshold;
          const speed = Math.max(6, Math.round((diff / 160) * 28));
          mainScrollRef.current?.scrollBy({ top: speed, behavior: "auto" });
          window.scrollBy({ top: speed, behavior: "auto" });
        }
      }
      animFrameRef.current = requestAnimationFrame(scrollLoop);
    };

    animFrameRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("drop", handleSafetyCancel);
      window.removeEventListener("dragend", handleSafetyCancel);
      window.removeEventListener("blur", handleSafetyCancel);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      dragMouseYRef.current = null;
    };
  }, [draggingWidgetId]);

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
  const [stravaActivities, setStravaActivities] = useState<StravaActivity[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const s = localStorage.getItem("lifeos_strava_activities");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [stravaScopeMode, setStravaScopeMode] = useState<"detailed" | "read_only" | null>(null);
  const [stravaOauthUrl, setStravaOauthUrl] = useState<string>("");
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
    pricePerLiter?: string;
    indexer?: string;
    cdiPercentage?: string;
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
    pricePerLiter: "",
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
    fullTank: true,
    indexer: "115% CDI (Caixinha Turbo)",
    cdiPercentage: "115"
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

        const tombstonesOnStart = getTombstones(currentUserId);
        const sTxs = getUserItem("lifeos_txs_v8");
        let initialTxs: Transaction[] = [];
        if (sTxs) {
          const parsedTxs: Transaction[] = JSON.parse(sTxs);
          // Migração de categorias legadas (Sprint 19)
          const migratedTxs = parsedTxs.map((t) => ({
            ...t,
            category: migrateLegacyCategory(t.category, t.description)
          }));
          // SPRINT 50: Reconciliação Contábil Bidirecional no Carregamento Inicial
          const { transactions: reconciledTxs, purgedIds } = reconcileReceivablesAndCashbook(
            migratedTxs,
            tombstonesOnStart
          );
          if (purgedIds.length > 0) {
            recordTombstones(purgedIds, currentUserId);
          }
          initialTxs = reconciledTxs;
          setTransactions(reconciledTxs);
          setUserItem("lifeos_txs_v8", JSON.stringify(reconciledTxs), currentUserId);
          localStorage.setItem("lifeos_txs_v8", JSON.stringify(reconciledTxs));
        }
        const sDebtors = localStorage.getItem("lifeos_debtors_v8");
        if (sDebtors) setDebtorMap(JSON.parse(sDebtors));

        // SPRINT 47.1: Auto-Resgate e Sincronização Síncrona Tripla de Bancos e Cartões
        const { rescuedBanks, rescuedCards } = rescueMissingBanksAndCards(
          INITIAL_BANKS,
          INITIAL_CARDS,
          initialTxs,
          tombstonesOnStart
        );
        setBanks(rescuedBanks);
        setCards(rescuedCards);
        setUserItem("lifeos_banks_v8", JSON.stringify(rescuedBanks), currentUserId);
        localStorage.setItem("lifeos_banks_v1", JSON.stringify(rescuedBanks));
        localStorage.setItem("coindex_vault_banks_backup", JSON.stringify(rescuedBanks));
        setUserItem("lifeos_cards_v8", JSON.stringify(rescuedCards), currentUserId);
        localStorage.setItem("lifeos_cards_v8", JSON.stringify(rescuedCards));
        localStorage.setItem("coindex_vault_cards_backup", JSON.stringify(rescuedCards));
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
        const sStravaAct = localStorage.getItem("lifeos_strava_activities");
        if (sStravaAct) setStravaActivities(JSON.parse(sStravaAct));
        const sLayout = localStorage.getItem("coindex_dashboard_layout_v3") || localStorage.getItem("lifeos_dash_layout_v1");
        if (sLayout) setDashboardLayout(normalizeDashboardLayout(JSON.parse(sLayout)));
        const sChartConfigs = localStorage.getItem("lifeos_chart_configs_v1");
        if (sChartConfigs) setChartConfigs(JSON.parse(sChartConfigs));
        const sAutoInmetro = localStorage.getItem("lifeos_auto_inmetro_v1");
        if (sAutoInmetro) setAutoInmetroConfig(JSON.parse(sAutoInmetro));
        const sAutoLayout = localStorage.getItem("lifeos_auto_dash_layout_v1");
        if (sAutoLayout) setAutoDashboardLayout(JSON.parse(sAutoLayout));
        const sAutoWidgetConfigs = localStorage.getItem("lifeos_auto_widget_configs_v1");
        if (sAutoWidgetConfigs) setAutoWidgetConfigs(JSON.parse(sAutoWidgetConfigs));

        const sAdj = localStorage.getItem("coindex_patrimony_real_adjustment");
        if (sAdj) setManualAdjustment(parseFloat(sAdj) || 0);
        const sYMode = localStorage.getItem("coindex_patrimony_yield_mode") as "bruto" | "liquido" | "aportes" | null;
        if (sYMode && ["bruto", "liquido", "aportes"].includes(sYMode)) setYieldMode(sYMode);
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
          const targetUserId = res.userId || currentUserId;
          const currentTombstones = getTombstones(targetUserId);

          // Safe merge Last-Write-Wins (LWW) entre o Supabase e o estado local (Sprint 44)
          let localTxs: Transaction[] = [];
          try {
            const rawLocal = getUserItem("lifeos_txs_v8", targetUserId) || localStorage.getItem("lifeos_txs_v8");
            if (rawLocal) {
              localTxs = JSON.parse(rawLocal);
            }
          } catch (e) {
            console.error("Erro ao ler transações locais para LWW", e);
          }

          const remoteMap = new Map<string, Transaction>();
          finalTxs.forEach((t) => {
            if (!currentTombstones.has(t.id)) {
              remoteMap.set(t.id, t);
            }
          });

          const localNewerToSync: Transaction[] = [];
          const mergedMap = new Map<string, Transaction>(remoteMap);

          const isLocalNewer = (local: Transaction, remote: Transaction): boolean => {
            const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
            const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
            if (localTime !== remoteTime) {
              return localTime > remoteTime;
            }
            const localRev = local.rev ?? 0;
            const remoteRev = remote.rev ?? 0;
            return localRev > remoteRev;
          };

          localTxs.forEach((pt) => {
            if (currentTombstones.has(pt.id)) return;
            const remote = remoteMap.get(pt.id);
            if (!remote) {
              mergedMap.set(pt.id, pt);
              localNewerToSync.push(pt);
            } else if (isLocalNewer(pt, remote)) {
              mergedMap.set(pt.id, pt);
              localNewerToSync.push(pt);
            }
          });

          const rawMerged = Array.from(mergedMap.values()).sort((a, b) => compareDatesBR(b.date, a.date));

          // SPRINT 50: Reconciliação Contábil Bidirecional Central (SSOT) no Supabase Merge
          const { transactions: reconciledMerged, purgedIds, updatedTxs } = reconcileReceivablesAndCashbook(
            rawMerged,
            currentTombstones
          );

          if (purgedIds.length > 0) {
            recordTombstones(purgedIds, targetUserId);
            try {
              await deleteTransactionsInDb(purgedIds);
            } catch (err) {
              console.error("Erro ao expurgar recebimentos fantasmas no Supabase:", err);
            }
          }

          if (updatedTxs.length > 0) {
            try {
              await upsertTransactionsInDb(updatedTxs, debtorMap);
            } catch (err) {
              console.error("Erro ao sincronizar lançamentos corrigidos no Supabase:", err);
            }
          }

          const merged = reconciledMerged.sort((a, b) => compareDatesBR(b.date, a.date));

          setTransactions(merged);
          setUserItem("lifeos_txs_v8", JSON.stringify(merged), targetUserId);
          localStorage.setItem("lifeos_txs_v8", JSON.stringify(merged));

          if (localNewerToSync.length > 0) {
            try {
              await upsertTransactionsInDb(localNewerToSync, debtorMap);
            } catch (err) {
              console.error("Erro ao reenviar transações locais mais recentes ao Supabase:", err);
            }
          }

          // SPRINT 47.1: União Aditiva Segura (Non-Destructive Union Merge) por ID + Tombstone Check
          // 1. CARDS
          let localCardsForMerge: CreditCardItem[] = [];
          try {
            const rawLocalCards =
              getUserItem("lifeos_cards_v8", targetUserId) ||
              localStorage.getItem("lifeos_cards_v8") ||
              localStorage.getItem("coindex_vault_cards_backup");
            if (rawLocalCards) {
              localCardsForMerge = JSON.parse(rawLocalCards);
            }
          } catch (e) {
            console.error("Erro ao ler cartões locais para merge:", e);
          }
          if (localCardsForMerge.length === 0 && cards.length > 0) {
            localCardsForMerge = cards;
          }

          const mergedCards = mergeEntitiesSafe(localCardsForMerge, d.cards || [], currentTombstones);
          setCards(mergedCards);
          setUserItem("lifeos_cards_v8", JSON.stringify(mergedCards), targetUserId);
          localStorage.setItem("lifeos_cards_v8", JSON.stringify(mergedCards));
          localStorage.setItem("coindex_vault_cards_backup", JSON.stringify(mergedCards));

          // Auto-Heal Push: Envia cartões locais mais recentes ou não cadastrados no Supabase
          const remoteCardIds = new Set((d.cards || []).map((c) => c.id));
          const cardsToHeal = mergedCards.filter((c) => {
            if (!remoteCardIds.has(c.id)) return true;
            const remote = (d.cards || []).find((rc) => rc.id === c.id);
            if (!remote) return true;
            const localTime = c.updatedAt ? new Date(c.updatedAt).getTime() : 0;
            const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
            return localTime > remoteTime || (c.rev ?? 0) > (remote.rev ?? 0);
          });
          if (cardsToHeal.length > 0) {
            void upsertCardsInDb(cardsToHeal);
          }

          // 2. BANKS
          let localBanksForMerge: BankItem[] = [];
          try {
            const rawLocalBanks =
              getUserItem("lifeos_banks_v8", targetUserId) ||
              getUserItem("lifeos_banks_v1", targetUserId) ||
              localStorage.getItem("lifeos_banks_v1") ||
              localStorage.getItem("coindex_vault_banks_backup");
            if (rawLocalBanks) {
              localBanksForMerge = JSON.parse(rawLocalBanks);
            }
          } catch (e) {
            console.error("Erro ao ler bancos locais para merge:", e);
          }
          if (localBanksForMerge.length === 0 && banks.length > 0) {
            localBanksForMerge = banks;
          }

          const remoteBanks = d.banks || [];
          const mergedBanks = mergeEntitiesSafe(localBanksForMerge, remoteBanks, currentTombstones);
          setBanks(mergedBanks);
          setUserItem("lifeos_banks_v8", JSON.stringify(mergedBanks), targetUserId);
          localStorage.setItem("lifeos_banks_v1", JSON.stringify(mergedBanks));
          localStorage.setItem("coindex_vault_banks_backup", JSON.stringify(mergedBanks));

          // Auto-Heal Push: Envia bancos locais mais recentes ou não cadastrados no Supabase
          const remoteBankIds = new Set(remoteBanks.map((b) => b.id));
          const banksToHeal = mergedBanks.filter((b) => {
            if (!remoteBankIds.has(b.id)) return true;
            const remote = remoteBanks.find((rb) => rb.id === b.id);
            if (!remote) return true;
            const localTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
            return localTime > remoteTime || (b.rev ?? 0) > (remote.rev ?? 0);
          });
          if (banksToHeal.length > 0) {
            void upsertBanksInDb(banksToHeal);
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
          // 3. BRAIN NOTES & DESEJOS DE COMPRA (Auto-Heal e Sincronização Cloud SSOT)
          let localNotesForMerge: BrainNote[] = [];
          try {
            const rawLocalNotes = getUserItem("lifeos_notes_v8", targetUserId) || localStorage.getItem("lifeos_notes_v8");
            if (rawLocalNotes) {
              localNotesForMerge = JSON.parse(rawLocalNotes);
            }
          } catch (e) {
            console.error("Erro ao ler notas locais:", e);
          }
          const remoteNotes = d.notes || [];
          const mergedNotes = mergeEntitiesSafe(localNotesForMerge, remoteNotes, currentTombstones);
          setNotes(mergedNotes);

          // Push para nuvem: Envia desejos e notas locais não cadastrados no Supabase
          const remoteNoteIds = new Set(remoteNotes.map((n) => n.id));
          const notesToHeal = mergedNotes.filter((n) => !remoteNoteIds.has(n.id));
          notesToHeal.forEach((n) => void upsertNoteInDb(n));
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
            const normalized = normalizeDashboardLayout(d.settings.dashboardLayout);
            setDashboardLayout(normalized);
            localStorage.setItem("coindex_dashboard_layout_v3", JSON.stringify(normalized));
            localStorage.setItem("lifeos_dash_layout_v1", JSON.stringify(normalized));
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

  // HOTFIX SPRINT 38.1 — Reconciliação Retroativa Automática de Abastecimentos Órfãos e Normalização de Datas
  const hasRunFuelReconciliationRef = useRef(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (hasRunFuelReconciliationRef.current) return;
    if (!transactions || transactions.length === 0) return;
    hasRunFuelReconciliationRef.current = true;

    try {
      let hasChanges = false;
      // 1. Normalização de datas e categorias no array transactions existente
      const normalizedTxs = transactions.map((t) => {
        let changed = false;
        let nextDate = t.date;
        if (t.date && (t.date.includes("/") || /^\d{4}-\d{2}-\d{2}$/.test(t.date))) {
          const formatted = formatDateBR(t.date);
          if (formatted && formatted !== t.date) {
            nextDate = formatted;
            changed = true;
          }
        }
        let nextCategory = t.category;
        if (t.category === "Gasolina/Combustível") {
          nextCategory = "Gasolina";
          changed = true;
        }
        if (changed) {
          hasChanges = true;
          return { ...t, date: nextDate, category: nextCategory, updatedAt: new Date().toISOString() };
        }
        return t;
      });

      // 2. Scan de chaves de telemetria veicular em localStorage
      const candidateKeys = [
        "lifeos_fuel_logs_v1",
        "fuelLogs",
        "lifeos_fuel_logs",
        "vehicles",
        "lifeos_vehicles"
      ];

      const orphanFuelTxs: Transaction[] = [];

      for (const key of candidateKeys) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          let entries: any[] = [];
          if (Array.isArray(parsed)) {
            entries = parsed;
          } else if (parsed && Array.isArray(parsed.fuelLogs)) {
            entries = parsed.fuelLogs;
          } else if (parsed && typeof parsed === "object") {
            for (const val of Object.values(parsed)) {
              if (Array.isArray(val)) {
                entries.push(...val);
              }
            }
          }

          for (const entry of entries) {
            if (!entry) continue;
            const entryDate = formatDateBR(entry.date || entry.createdAt) || todayBR();
            const entryAmount = parseFloat(entry.totalAmount || entry.amount || entry.valor || "0") || 0;
            const entryLiters = parseFloat(entry.liters || entry.litros || "0") || 0;
            const entryKm = parseFloat(entry.odometer || entry.km || "0") || undefined;
            const entryFuelType = entry.fuelType || entry.tipo || "Gasolina";

            if (entryAmount <= 0 && entryLiters <= 0) continue;

            const entryId = entry.id ? `fuel_tx_${entry.id}` : `fuel_tx_${entryDate}_${Math.round(entryAmount * 100)}`;

            // Verifica se já existe em normalizedTxs ou orphanFuelTxs
            const alreadyExists = normalizedTxs.some(
              (t) =>
                t.id === entry.id ||
                t.id === entryId ||
                (t.date === entryDate &&
                  Math.round(t.amount * 100) === Math.round(entryAmount * 100) &&
                  (t.category === "Gasolina" || t.category === "Combustível (Gasolina / Etanol)"))
            ) || orphanFuelTxs.some((o) => o.id === entryId || o.id === entry.id);

            if (!alreadyExists && entryAmount > 0) {
              orphanFuelTxs.push({
                id: entryId,
                date: entryDate,
                description: entry.description || `Abastecimento - Posto Express (${entryFuelType})`,
                amount: entryAmount,
                category: "Gasolina",
                flowType: "EXPENSE",
                costType: "Variável",
                paymentMethod: entry.paymentMethod || "PIX",
                bankAccount: entry.bankAccount || banks[0]?.name || "Nubank",
                status: "Pago",
                km: entryKm,
                liters: entryLiters > 0 ? entryLiters : undefined,
                fuelType: entryFuelType === "Etanol" ? "Etanol" : "Gasolina",
                fullTank: entry.fullTank !== false,
                updatedAt: new Date().toISOString()
              });
            }
          }
        } catch {
          // Ignora JSON mal formatado na chave
        }
      }

      if (orphanFuelTxs.length > 0 || hasChanges) {
        const reconciledTxs = [...orphanFuelTxs, ...normalizedTxs];
        setTransactions(reconciledTxs);
        localStorage.setItem("lifeos_txs_v8", JSON.stringify(reconciledTxs));
        if (orphanFuelTxs.length > 0) {
          upsertTransactionsInDb(orphanFuelTxs, debtorMap).catch(console.error);
          notify(
            "Reconciliação de Abastecimentos",
            `${orphanFuelTxs.length} abastecimento(s) órfão(s) recuperado(s) e integrado(s) aos Lançamentos.`,
            "info",
            "FINANCE"
          );
        }
      }
    } catch (err) {
      console.error("Erro na auto-reconciliação de abastecimentos", err);
    }
  }, [isHydrated, transactions, banks, debtorMap, notify]);

  // SPRINT 30: Consulta Oficial ao SGS / Banco Central do Brasil para Taxa CDI
  useEffect(() => {
    let isMounted = true;
    fetch("/api/market-rates")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && typeof data.cdiAnnualRate === "number") {
          setMarketRates(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSetYieldMode = (mode: "bruto" | "liquido" | "aportes") => {
    setYieldMode(mode);
    localStorage.setItem("coindex_patrimony_yield_mode", mode);
  };

  const handleSaveManualAdjustment = (val: number) => {
    setManualAdjustment(val);
    localStorage.setItem("coindex_patrimony_real_adjustment", String(val));
    notify("Ajuste de Saldo Salvo", `Ajuste patrimonial de ${formatBRL(val)} calibrado com sucesso.`, "success");
  };

  const changeThemeMode = (m: ThemeMode) => {
    setThemeMode(m);
    localStorage.setItem("lifeos_theme_mode", m);
    updateUserSettingsInDb({ themeMode: m });
  };

  const resetDashboardLayout = () => {
    setDashboardLayout(DEFAULT_DASHBOARD_LAYOUT);
    localStorage.setItem("coindex_dashboard_layout_v3", JSON.stringify(DEFAULT_DASHBOARD_LAYOUT));
    localStorage.setItem("lifeos_dash_layout_v1", JSON.stringify(DEFAULT_DASHBOARD_LAYOUT));
    if (currentUser) {
      setUserItem("coindex_dashboard_layout_v3", JSON.stringify(DEFAULT_DASHBOARD_LAYOUT), currentUserId);
      setUserItem("lifeos_dash_layout_v1", JSON.stringify(DEFAULT_DASHBOARD_LAYOUT), currentUserId);
    }
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
        currentTxs = Array.from(mergedMap.values()).sort((a, b) => compareDatesBR(b.date, a.date));
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
  // HOTFIX SPRINT 36.1: Ignorar SyntheticEvent/HTMLButtonElement e garantir serialização 100% primitiva
  const isDomOrReactEvent = (val: unknown): boolean =>
    Boolean(
      val &&
        typeof val === "object" &&
        ("nativeEvent" in (val as Record<string, unknown>) ||
          "currentTarget" in (val as Record<string, unknown>) ||
          "target" in (val as Record<string, unknown>) ||
          (typeof Event !== "undefined" && val instanceof Event) ||
          (typeof HTMLElement !== "undefined" && val instanceof HTMLElement))
    );

  const toCleanStr = (v: unknown): string =>
    typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";

  const syncStravaFromApi = async (overrideConfig?: unknown) => {
    setIsSyncingStrava(true);

    // Ponto 1: Se o parâmetro for evento do DOM/React, ignore-o e use o stravaConfig atual
    const validOverride =
      overrideConfig &&
      typeof overrideConfig === "object" &&
      !isDomOrReactEvent(overrideConfig)
        ? (overrideConfig as Partial<StravaCredentials>)
        : undefined;

    const rawConfig = validOverride || stravaConfig;

    // Ponto 2: Objeto plano estritamente com strings primitivas higienizadas
    const cleanPayload: StravaCredentials = {
      athleteId: toCleanStr(rawConfig?.athleteId),
      clientId: toCleanStr(rawConfig?.clientId),
      clientSecret: toCleanStr(rawConfig?.clientSecret),
      refreshToken: toCleanStr(rawConfig?.refreshToken)
    };

    try {
      const res = await fetch("/api/strava", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanPayload)
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`A rota /api/strava retornou status ${res.status} (não-JSON).`);
      }

      const data = await res.json();
      if (!res.ok || data.ok === false) {
        const msg = data.error || data.message || "Falha ao sincronizar com o Strava.";
        setStravaSyncStatus({ state: "error", message: msg, timestamp: new Date().toLocaleTimeString("pt-BR") });
        notify("Integração Inválida", msg, "warning", "CONFIG");
        return;
      }

      const updatedStats: StravaStats = data.stats;
      setStravaStats(updatedStats);
      localStorage.setItem("lifeos_strava_stats", JSON.stringify(updatedStats));

      const updatedConfig: StravaCredentials = {
        athleteId: cleanPayload.athleteId,
        clientId: cleanPayload.clientId,
        clientSecret: cleanPayload.clientSecret,
        refreshToken: cleanPayload.refreshToken
      };
      let configChanged = false;
      if (data.newRefreshToken && typeof data.newRefreshToken === "string" && data.newRefreshToken !== cleanPayload.refreshToken) {
        updatedConfig.refreshToken = toCleanStr(data.newRefreshToken);
        configChanged = true;
      }
      if (data.athlete?.id && (!updatedConfig.athleteId || updatedConfig.athleteId === "")) {
        updatedConfig.athleteId = toCleanStr(data.athlete.id);
        configChanged = true;
      }
      if (configChanged) {
        setStravaConfig(updatedConfig);
        localStorage.setItem("lifeos_strava_config", JSON.stringify(updatedConfig));
      }

      if (data.activities && Array.isArray(data.activities)) {
        setStravaActivities(data.activities);
        localStorage.setItem("lifeos_strava_activities", JSON.stringify(data.activities));
      }

      if (data.scopeMode) {
        setStravaScopeMode(data.scopeMode);
      }
      if (data.scopeStatus === "needs_activity_scope") {
        setStravaScopeMode("read_only");
      }
      if (data.oauthUpgradeUrl) {
        setStravaOauthUrl(data.oauthUpgradeUrl);
      } else if (data.oauthUrl) {
        setStravaOauthUrl(data.oauthUrl);
      }

      await updateUserSettingsInDb({
        stravaConfig: updatedConfig,
        stravaStats: updatedStats
      });

      const okMsg = `Strava sincronizado! ${updatedStats.ytdKm} km corridos no ano (${updatedStats.ytdRuns} treinos).`;
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

  // Listener para Callback do Strava via OAuth2 (postMessage)
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "STRAVA_AUTH_SUCCESS") {
        const { refreshToken, athleteId } = event.data;
        if (refreshToken) {
          setStravaConfig((prev) => {
            const updated = {
              ...prev,
              refreshToken,
              athleteId: athleteId ? String(athleteId) : prev.athleteId
            };
            localStorage.setItem("lifeos_strava_config", JSON.stringify(updated));
            setTimeout(() => {
              syncStravaFromApi(updated);
            }, 300);
            return updated;
          });
          notify("Autorização Concluída", "Strava conectado com permissões completas!", "success", "CONFIG");
        }
      }
    };
    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, []);

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
        lower.includes("pagamento fatura")
      ) {
        return "NEUTRAL";
      }
      if (
        lower.includes("salário") ||
        lower.includes("benefício") ||
        lower.includes("comissão") ||
        lower.includes("rendimento") ||
        lower.includes("serviço") ||
        lower.includes("recebimento de empréstimo") ||
        lower.includes("recebimento de emprestimo")
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

  const getTxMonthForRegime = useCallback((t: Transaction, regime: "competencia" | "caixa") => {
    if (regime === "caixa") {
      if (t.paymentMethod === "Cartão de Crédito") {
        return t.cashMonth || t.invoiceMonth || getYearMonthKey(t.date);
      }
      return t.cashMonth || getYearMonthKey(t.date);
    }
    return getYearMonthKey(t.date);
  }, []);

  const isTxInSelectedPeriod = useCallback(
    (t: Transaction, regime: "competencia" | "caixa") => {
      if (selectedMonth === "ALL") return true;

      if (selectedMonth === "THIS_YEAR") {
        const txDateISO = toSortableISO(t.date);
        const targetYear = String(currentCalendarDate.year);
        return txDateISO.startsWith(targetYear);
      }

      if (selectedMonth === "LAST_30_DAYS") {
        const txDateISO = toSortableISO(t.date);
        const now = new Date();
        const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const past30ISO = `${past30.getFullYear()}-${String(past30.getMonth() + 1).padStart(2, "0")}-${String(past30.getDate()).padStart(2, "0")}`;
        const today = todayISO();
        return txDateISO >= past30ISO && txDateISO <= today;
      }

      if (selectedMonth === "CUSTOM") {
        const txDateISO = toSortableISO(t.date);
        const startISO = customStartDate ? toSortableISO(customStartDate) : "";
        const endISO = customEndDate ? toSortableISO(customEndDate) : "";
        if (startISO && txDateISO < startISO) return false;
        if (endISO && txDateISO > endISO) return false;
        return true;
      }

      // Regime Caixa vs Competência para Mês Específico ("YYYY-MM")
      if (regime === "caixa") {
        const txMonth = getTxMonthForRegime(t, "caixa");
        return txMonth === selectedMonth;
      }
      return getYearMonthKey(t.date) === selectedMonth;
    },
    [selectedMonth, currentCalendarDate.year, customStartDate, customEndDate, getTxMonthForRegime]
  );

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => isTxInSelectedPeriod(t, "competencia"))
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
  }, [transactions, isTxInSelectedPeriod, quickFilter, searchQuery]);

  const regimeTransactions = useMemo(() => {
    if (accountingRegime === "competencia" || selectedMonth === "ALL") {
      return filteredTransactions;
    }
    return transactions.filter((t) => {
      if (!isTxInSelectedPeriod(t, "caixa")) return false;
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
  }, [transactions, filteredTransactions, isTxInSelectedPeriod, accountingRegime, selectedMonth, quickFilter, searchQuery]);

  const monthSummary = useMemo(() => {
    const calcFor = (list: Transaction[]) => {
      // 1. Entradas (apenas receitas ativas, excluindo fluxos neutros, transferências e recebimentos de empréstimo)
      const incomeTxs = list.filter(
        (t) =>
          !t.isTransfer &&
          !t.isInvoicePayment &&
          !t.isSplitChild &&
          !t.isReceivableSettlement &&
          t.category !== "Recebimento de Empréstimo" &&
          t.category !== "Transferência entre Contas" &&
          (t.flowType === "INCOME" || (getFlowType(t.category) === "INCOME" && t.flowType !== "NEUTRAL"))
      );
      const income = safeAdd(...incomeTxs.map((t) => t.amount));

      // 2. Despesas brutas operacionais (compras normais e compras divididas entram com tx.amount desembolsado)
      const expenseTxs = list.filter(
        (t) =>
          !t.isTransfer &&
          !t.isInvoicePayment &&
          !t.isSplitChild &&
          t.category !== "Transferência entre Contas" &&
          (t.flowType === "EXPENSE" || getFlowType(t.category) === "EXPENSE")
      );
      const grossExpense = safeAdd(...expenseTxs.map((t) => t.amount));

      // 3. Abatimentos de Saídas: liquidações de empréstimos e reembolsos recebidos no período
      const settlementTxs = list.filter(
        (t) =>
          !t.isSplitChild &&
          (t.isReceivableSettlement ||
            (t.category || "").toLowerCase().includes("recebimento de empréstimo") ||
            (t.category || "").toLowerCase().includes("recebimento de emprestimo") ||
            (t.category || "").toLowerCase() === "reembolso")
      );
      const settlementsTotal = safeAdd(...settlementTxs.map((t) => t.amount));

      // Saídas & Despesas Líquidas = Despesas Brutas - Reembolsos/Liquidações Recebidas
      const expense = Math.max(0, safeSub(grossExpense, settlementsTotal));

      // 4. Aportes e Investimentos
      const investmentTxs = list.filter(
        (t) =>
          !t.isSplitChild &&
          !t.isTransfer &&
          (t.flowType === "INVESTMENT" || getFlowType(t.category) === "INVESTMENT")
      );
      const aportesMes = safeAdd(...investmentTxs.filter((t) => !isResgateCategory(t.category)).map((t) => t.amount));
      const resgatesMes = safeAdd(...investmentTxs.filter((t) => isResgateCategory(t.category)).map((t) => t.amount));

      const netInvested = safeSub(aportesMes, resgatesMes);

      // SPRINT 19 & SPRINT 42: No "Histórico Completo", o Balanço Operacional Real é (Entradas - Saídas Líquidas)
      // No mês selecionado, considera o fluxo de caixa líquido abatendo os investimentos líquidos do mês
      const isMultiMonthOrAll =
        selectedMonth === "ALL" ||
        selectedMonth === "THIS_YEAR" ||
        selectedMonth === "LAST_30_DAYS" ||
        selectedMonth === "CUSTOM";
      const balance =
        isMultiMonthOrAll
          ? safeSub(income, expense)
          : safeSub(income, safeAdd(expense, netInvested));

      const personalExpenseTxs = expenseTxs.filter(
        (t) => t.category === "Gastos Pessoais" || t.category === "Gastos Pessoais / Besteiras"
      );
      const grossPersonalSpent = safeAdd(...personalExpenseTxs.map((t) => t.amount));
      const personalSettlements = safeAdd(
        ...settlementTxs
          .filter((t) => (t.description || "").toLowerCase().includes("pessoal") || (t.category || "").toLowerCase().includes("pessoal"))
          .map((t) => t.amount)
      );
      const personalSpent = Math.max(0, safeSub(grossPersonalSpent, personalSettlements));

      return {
        income,
        expense,
        grossExpense,
        settlementsTotal,
        invested: aportesMes,
        aportes: aportesMes,
        resgates: resgatesMes,
        netInvested,
        balance,
        personalSpent
      };
    };

    const current = calcFor(regimeTransactions);
    const prevPrefix = /^\d{4}-\d{2}$/.test(selectedMonth) ? getPreviousMonthPrefix(selectedMonth) : "";
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

  const selectedMonthLabel = useMemo(() => {
    if (selectedMonth === "ALL") return "Todos (Histórico Geral)";
    if (selectedMonth === "THIS_YEAR") return `Ano ${currentCalendarDate.year}`;
    if (selectedMonth === "LAST_30_DAYS") return "Últimos 30 Dias";
    if (selectedMonth === "CUSTOM") return "Intervalo Personalizado";
    return formatMonthShortLabelBR(selectedMonth) || selectedMonth;
  }, [selectedMonth, currentCalendarDate.year]);

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
    return calculatePatrimonyEvolution(transactions, HISTORICAL_INVESTMENTS, initialPatrimony, {
      cdiAnnualRate: marketRates.cdiAnnualRate,
      defaultCdiPercentage: 115,
      manualAdjustment: manualAdjustment,
      yieldMode: yieldMode
    });
  }, [transactions, initialPatrimony, marketRates.cdiAnnualRate, manualAdjustment, yieldMode]);
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

  // SPRINT 34: Telemetria Patrimonial da Central Analítica (4 Métricas Executivas)
  const patrimonyTelemetry = useMemo(() => {
    const data = (filteredPatrimonyChartData && filteredPatrimonyChartData.length > 0)
      ? filteredPatrimonyChartData
      : (patrimonyEvolution.data || []);
    const monthsCount = Math.max(1, data.length);
    const totalAportesFiltered = data.reduce((acc, d) => acc + (Number((d as unknown as { aportado?: number }).aportado) || 0), 0);
    const avgAporte = Math.round(totalAportesFiltered / monthsCount);

    let bestMonth = {
      label: (data[data.length - 1] as unknown as { label?: string })?.label || "N/D",
      amount: 0
    };
    for (const item of data) {
      const row = item as unknown as { label?: string; aportado?: number };
      const val = Number(row.aportado) || 0;
      if (val > bestMonth.amount) {
        bestMonth = { label: row.label || "N/D", amount: val };
      }
    }

    const totalYield = yieldMode === "liquido"
      ? (patrimonyEvolution.netYieldEstimated || 0)
      : (patrimonyEvolution.grossYieldAccumulated || 0);
    const calculatedAvgYield = Math.round(totalYield / monthsCount);
    const cdiEffAnnual = ((marketRates?.cdiAnnualRate || 12.15) * ((patrimonyEvolution.appliedCdiPercentage || 115) / 100)) / 100;
    const currentVal = patrimonyStats.currentValue;
    const avgYieldMonth = calculatedAvgYield > 0 ? calculatedAvgYield : Math.round((currentVal * cdiEffAnnual) / 12);

    const monthlyRate = Math.pow(1 + cdiEffAnnual, 1 / 12) - 1;
    const aporteFuture = avgAporte > 0 ? avgAporte : 0;
    let projected = currentVal;
    for (let i = 0; i < 12; i++) {
      projected = (projected + aporteFuture) * (1 + monthlyRate);
    }
    const projected12M = Math.round(projected);

    return {
      avgAporte,
      bestMonth,
      avgYieldMonth,
      projected12M
    };
  }, [filteredPatrimonyChartData, patrimonyEvolution, yieldMode, marketRates, patrimonyStats.currentValue]);

  // UPDATE 2: Meses distintos no período e limite acumulado proporcional
  const filterMonthsCount = useMemo(() => {
    if (selectedMonth !== "ALL" && !["THIS_YEAR", "LAST_30_DAYS", "CUSTOM"].includes(selectedMonth)) return 1;
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
        const val = getEffectivePersonalAmount(t);
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
      const exposure = calculateCardExposure(c, transactions, selectedMonth);
      return {
        name: c.name,
        usado: exposure.used,
        disponivel: exposure.available
      };
    });
  }, [cards, transactions, selectedMonth]);

  // Safe-to-Spend: Indicador de Saldo Livre Projetado no Mês (Sprint 12 e Sprint 42 - Regra Contábil Estrita)
  const safeToSpend = useMemo(() => {
    // 1. Saldo Atual em Contas: somatório de saldos reais de todas as contas bancárias cadastradas
    const currentCash = safeAdd(...banks.map((b) => calculateBankBalance(b, transactions, getFlowType)));

    // Determina o mês de referência: se selectedMonth for ALL ou formato especial, usa o mês corrente (YYYY-MM)
    const currentMonthKey = currentCalendarDate.yearMonth;
    const targetMonth =
      selectedMonth !== "ALL" && /^\d{4}-\d{2}$/.test(selectedMonth)
        ? selectedMonth
        : currentMonthKey;

    const targetTxs = transactions.filter((t) => {
      const ym = getTxMonthForRegime(t, accountingRegime);
      return ym === targetMonth;
    });

    // 2. Receitas Pendentes do Mês Alvo (excluindo fluxos neutros e transferências)
    const pendingIncome = safeAdd(
      ...targetTxs
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

    // 3. Despesas / Contas Fixas Pendentes do Mês Alvo (exceto compras de cartão que entram na fatura para evitar dupla contagem)
    const pendingDirectExpenses = safeAdd(
      ...targetTxs
        .filter(
          (t) =>
            !isNeutralFlow(t) &&
            !t.isSplitChild &&
            getFlowType(t.category) !== "NEUTRAL" &&
            (t.flowType || getFlowType(t.category)) === "EXPENSE" &&
            t.status !== "Pago" &&
            t.paymentMethod !== "Cartão de Crédito"
        )
        .map((t) => t.amount)
    );

    // 4. Faturas Abertas de Cartão considerando mês de caixa (cashMonth) para o mês alvo
    const pendingInvoices = safeAdd(
      ...cards.map((c) => {
        const cardCashTxs = transactions.filter(
          (t) =>
            !t.isSplitChild &&
            t.paymentMethod === "Cartão de Crédito" &&
            t.cardUsed === c.name &&
            t.status !== "Pago" &&
            (t.cashMonth
              ? t.cashMonth === targetMonth
              : t.invoiceMonth
              ? t.invoiceMonth === targetMonth
              : getYearMonthKey(t.date) === targetMonth)
        );
        return safeAdd(...cardCashTxs.map((t) => t.amount));
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
      projected,
      targetMonth
    };
  }, [banks, cards, transactions, selectedMonth, currentCalendarDate.yearMonth, accountingRegime, getFlowType, getTxMonthForRegime]);

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

  // SPRINT 54: Análise Real e Consolidada dos Limites dos Cartões de Crédito (Apple Wallet SSOT)
  const cardLimitsAnalytics = useMemo(() => {
    const list = cards.map((card) => {
      const exposure = calculateCardExposure(card, transactions, selectedMonth);
      const limit = Number(card.limit || 0);
      const used = exposure.used;
      const available = exposure.available;
      const pctUsed = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
      return {
        id: card.id,
        name: card.name,
        bankName: card.bankName,
        brand: card.brand,
        limit,
        used,
        available,
        pctUsed
      };
    });

    const globalTotalLimit = cards.reduce((acc, c) => safeAdd(acc, Number(c.limit || 0)), 0);
    const globalTotalUsado = cards.reduce((acc, c) => safeAdd(acc, calculateCardExposure(c, transactions, selectedMonth).used), 0);
    const globalTotalDisponivel = Math.max(0, safeSub(globalTotalLimit, globalTotalUsado));
    const globalUsagePct = globalTotalLimit > 0 ? Math.min(100, Math.round((globalTotalUsado / globalTotalLimit) * 100)) : 0;

    return {
      cards: list,
      globalTotalLimit,
      globalTotalUsado,
      globalTotalDisponivel,
      globalUsagePct
    };
  }, [cards, transactions, selectedMonth]);

  // SPRINT 29: Mini-Sparklines SVG (Últimos 6 meses para os 4 Slim KPI Cards)
  const kpiSparklines = useMemo(() => {
    const refMonth =
      selectedMonth !== "ALL" && /^\d{4}-\d{2}$/.test(selectedMonth)
        ? selectedMonth
        : currentCalendarDate.yearMonth;
    const [yStr, mStr] = refMonth.split("-");
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10);
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      let year = y;
      let month = m - i;
      while (month <= 0) {
        month += 12;
        year -= 1;
      }
      months.push(`${year}-${String(month).padStart(2, "0")}`);
    }

    const incomeList: number[] = [];
    const expenseList: number[] = [];
    const aportesList: number[] = [];
    const balanceList: number[] = [];

    for (const ym of months) {
      const list = transactions.filter(
        (t) =>
          getTxMonthForRegime(t, accountingRegime) === ym &&
          !isNeutralFlow(t) &&
          !t.isSplitChild &&
          getFlowType(t.category) !== "NEUTRAL"
      );
      const inc = safeAdd(...list.filter((t) => (t.flowType || getFlowType(t.category)) === "INCOME").map((t) => t.amount));
      const exp = safeAdd(
        ...list
          .filter((t) => (t.flowType || getFlowType(t.category)) === "EXPENSE")
          .map((t) => (t.isSplit && t.personalAmount != null ? t.personalAmount : t.amount))
      );
      const inv = list.filter((t) => (t.flowType || getFlowType(t.category)) === "INVESTMENT");
      const ap = safeAdd(...inv.filter((t) => !isResgateCategory(t.category)).map((t) => t.amount));
      const resg = safeAdd(...inv.filter((t) => isResgateCategory(t.category)).map((t) => t.amount));
      const bal = safeSub(inc, safeAdd(exp, safeSub(ap, resg)));

      incomeList.push(inc);
      expenseList.push(exp);
      aportesList.push(ap);
      balanceList.push(bal);
    }

    return {
      income: incomeList,
      expense: expenseList,
      aportes: aportesList,
      balance: balanceList
    };
  }, [transactions, selectedMonth, currentCalendarDate.yearMonth, accountingRegime, getTxMonthForRegime, getFlowType]);

  // SPRINT 29: Cota Diária Livre (R$/dia)
  const dailyQuotaInfo = useMemo(() => {
    const currentYearMonth = currentCalendarDate.yearMonth;
    const targetMonth =
      selectedMonth !== "ALL" && /^\d{4}-\d{2}$/.test(selectedMonth)
        ? selectedMonth
        : currentYearMonth;
    const [yStr, mStr] = targetMonth.split("-");
    const totalDays = daysInMonth(parseInt(yStr, 10), parseInt(mStr, 10));

    let remainingDays: number;
    if (targetMonth === currentYearMonth) {
      remainingDays = Math.max(1, totalDays - currentCalendarDate.day + 1);
    } else if (targetMonth < currentYearMonth) {
      remainingDays = 1;
    } else {
      remainingDays = totalDays;
    }

    const remainingFree = Math.max(0, effectivePersonalBudgetLimit - monthSummary.personalSpent);
    const dailyBudget = remainingDays > 0 && Number.isFinite(remainingFree / remainingDays) ? remainingFree / remainingDays : 0;

    return {
      remainingDays,
      daysInMonth: totalDays,
      remainingFree,
      dailyBudget
    };
  }, [selectedMonth, effectivePersonalBudgetLimit, monthSummary.personalSpent, currentCalendarDate]);

  // SPRINT 29: Alocação Real 50/30/20 (Fixos vs. Variáveis vs. Aportes)
  const allocation503020 = useMemo(() => {
    const fixedTxs = regimeTransactions.filter(
      (t) =>
        !isNeutralFlow(t) &&
        !t.isSplitChild &&
        (t.flowType || getFlowType(t.category)) === "EXPENSE" &&
        t.costType === "Fixo"
    );
    const fixedTotal = safeAdd(
      ...fixedTxs.map((t) => getEffectivePersonalAmount(t))
    );

    const varTxs = regimeTransactions.filter(
      (t) =>
        !isNeutralFlow(t) &&
        !t.isSplitChild &&
        (t.flowType || getFlowType(t.category)) === "EXPENSE" &&
        t.costType !== "Fixo"
    );
    const variableTotal = safeAdd(
      ...varTxs.map((t) => getEffectivePersonalAmount(t))
    );

    const investTotal = monthSummary.aportes;

    const totalBase =
      monthSummary.income > 0
        ? monthSummary.income
        : Math.max(1, safeAdd(fixedTotal, variableTotal, investTotal));

    const pctFixed = totalBase > 0 && Number.isFinite(fixedTotal / totalBase) ? Math.min(100, Math.max(0, Math.round((fixedTotal / totalBase) * 100))) : 0;
    const pctVariable = totalBase > 0 && Number.isFinite(variableTotal / totalBase) ? Math.min(100, Math.max(0, Math.round((variableTotal / totalBase) * 100))) : 0;
    const pctInvest = totalBase > 0 && Number.isFinite(investTotal / totalBase) ? Math.min(100, Math.max(0, Math.round((investTotal / totalBase) * 100))) : 0;

    return {
      fixedTotal,
      variableTotal,
      investTotal,
      totalBase,
      pctFixed,
      pctVariable,
      pctInvest
    };
  }, [regimeTransactions, monthSummary.income, monthSummary.aportes, getFlowType]);

  // SPRINT 29: Multi-View - Curva de Ritmo de Gastos Diária (Pace)
  const paceChartData = useMemo(() => {
    const currentYearMonth = currentCalendarDate.yearMonth;
    const targetMonth =
      selectedMonth !== "ALL" && /^\d{4}-\d{2}$/.test(selectedMonth)
        ? selectedMonth
        : currentYearMonth;
    const [yStr, mStr] = targetMonth.split("-");
    const yearNum = parseInt(yStr, 10);
    const monthNum = parseInt(mStr, 10);
    const totalDays = daysInMonth(yearNum, monthNum);

    let maxDayTracked = totalDays;
    if (targetMonth === currentYearMonth) {
      maxDayTracked = currentCalendarDate.day;
    } else if (targetMonth > currentYearMonth) {
      maxDayTracked = 0;
    }

    const dailyPace = effectivePersonalBudgetLimit / totalDays;

    const personalExpenses = regimeTransactions.filter(
      (t) =>
        !isNeutralFlow(t) &&
        !t.isSplitChild &&
        (t.flowType || getFlowType(t.category)) === "EXPENSE" &&
        (t.category === "Gastos Pessoais" || t.category === "Gastos Pessoais / Besteiras" || t.costType !== "Fixo")
    );

    const spentByDay = new Map<number, number>();
    for (const t of personalExpenses) {
      let d = 1;
      if (t.date && t.date.includes("-")) {
        const parts = t.date.split("-");
        if (parts[0].length === 4) {
          d = parseInt(parts[2], 10);
        } else {
          d = parseInt(parts[0], 10);
        }
      }
      const amt = getEffectivePersonalAmount(t);
      spentByDay.set(d, (spentByDay.get(d) || 0) + amt);
    }

    let accumulated = 0;
    const data: Array<{
      day: number;
      dayLabel: string;
      ideal: number;
      real: number | null;
    }> = [];

    for (let day = 1; day <= totalDays; day++) {
      const ideal = Math.round(dailyPace * day);
      if (day <= maxDayTracked) {
        accumulated = safeAdd(accumulated, spentByDay.get(day) || 0);
        data.push({
          day,
          dayLabel: `Dia ${day}`,
          ideal,
          real: accumulated
        });
      } else {
        data.push({
          day,
          dayLabel: `Dia ${day}`,
          ideal,
          real: null
        });
      }
    }

    const currentReal = maxDayTracked > 0 ? (data[maxDayTracked - 1]?.real ?? 0) : 0;
    const currentIdeal = maxDayTracked > 0 ? (data[maxDayTracked - 1]?.ideal ?? 0) : 0;
    const isBelowPace = currentReal <= currentIdeal;
    const paceDiff = Math.abs(currentIdeal - currentReal);

    return {
      data,
      daysInMonth: totalDays,
      maxDayTracked,
      currentReal,
      currentIdeal,
      isBelowPace,
      paceDiff
    };
  }, [selectedMonth, effectivePersonalBudgetLimit, regimeTransactions, getFlowType, currentCalendarDate]);

  const staticStatusSummary = useMemo(() => calculateStaticStatusSummary(staticStatus), [staticStatus]);

  // SPRINT 29: Multi-View - Projeção 6 Meses de Comprometimento Futuro
  const forecast6MData = useMemo(() => {
    const currentYear = currentCalendarDate.year;
    const currentMonth = currentCalendarDate.month;

    const activeFixedItems = staticStatus.filter(
      (s) => s.type === "Custo Fixo" && !s.deletedAt
    );
    const fixedMonthlyTotal = safeAdd(...activeFixedItems.map((s) => s.amount));

    const baseIncome =
      staticStatusSummary.rendaBase > 0
        ? staticStatusSummary.rendaBase
        : monthSummary.income > 0
        ? monthSummary.income
        : 6000;

    const months: Array<{
      key: string;
      label: string;
      fixedCosts: number;
      cardInstallments: number;
      totalCommitted: number;
      percentOfIncome: number;
    }> = [];

    const monthNamesShort = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    for (let i = 1; i <= 6; i++) {
      const ym = addMonthsSafe(currentYear, currentMonth, i);
      const key = ym.key;
      const label = ym.shortLabel;

      const cardTxs = transactions.filter((t) => {
        if (t.isSplitChild || isNeutralFlow(t)) return false;
        const isCard = t.paymentMethod === "Cartão de Crédito" || Boolean(t.cardUsed) || Boolean(t.invoiceMonth);
        if (!isCard) return false;
        return (
          t.invoiceMonth === key ||
          t.cashMonth === key ||
          getTxMonthForRegime(t, "caixa") === key
        );
      });

      const cardTotal = safeAdd(
        ...cardTxs.map((t) => getEffectivePersonalAmount(t))
      );

      // Deduplicação inteligente de custos fixos já lançados na fatura ou transações futuras (AUD-11)
      const fixedTitles = new Set(activeFixedItems.map((s) => s.title.trim().toLowerCase()));
      const fixedAlreadyInCard = safeAdd(
        ...cardTxs
          .filter(
            (t) =>
              t.costType === "Fixo" ||
              fixedTitles.has((t.description || "").trim().toLowerCase()) ||
              fixedTitles.has((t.category || "").trim().toLowerCase())
          )
          .map((t) => getEffectivePersonalAmount(t))
      );
      const effectiveFixedMonthly = Math.max(0, safeSub(fixedMonthlyTotal, fixedAlreadyInCard));
      const totalCommitted = safeAdd(effectiveFixedMonthly, cardTotal);
      const percentOfIncome = Math.round((totalCommitted / Math.max(1, baseIncome)) * 100);

      months.push({
        key,
        label,
        fixedCosts: effectiveFixedMonthly,
        cardInstallments: cardTotal,
        totalCommitted,
        percentOfIncome
      });
    }

    const avgCommitted = Math.round(
      months.reduce((acc, cur) => acc + cur.totalCommitted, 0) / months.length
    );
    const avgPercent = Math.round(
      months.reduce((acc, cur) => acc + cur.percentOfIncome, 0) / months.length
    );
    const peakMonth = [...months].sort((a, b) => b.totalCommitted - a.totalCommitted)[0];

    return {
      months,
      baseIncome,
      avgCommitted,
      avgPercent,
      peakMonth
    };
  }, [staticStatus, staticStatusSummary.rendaBase, monthSummary.income, transactions, getTxMonthForRegime, currentCalendarDate]);

  // SPRINT 29: Drill-Down no Donut de Despesas
  const categoryDrillDownData = useMemo(() => {
    if (!selectedCategoryDrillDown) return null;

    const txs = regimeTransactions
      .filter(
        (t) =>
          t.category === selectedCategoryDrillDown &&
          !isNeutralFlow(t) &&
          !t.isSplitChild &&
          (t.flowType || getFlowType(t.category)) === "EXPENSE"
      )
      .sort((a, b) => compareDatesBR(b.date, a.date));

    const totalCurrent = safeAdd(
      ...txs.map((t) => (t.isSplit && t.personalAmount != null ? t.personalAmount : t.amount))
    );

    const prevPrefix = /^\d{4}-\d{2}$/.test(selectedMonth) ? getPreviousMonthPrefix(selectedMonth) : "";
    const prevTxs = prevPrefix
      ? transactions.filter(
          (t) =>
            getTxMonthForRegime(t, accountingRegime) === prevPrefix &&
            t.category === selectedCategoryDrillDown &&
            !isNeutralFlow(t) &&
            !t.isSplitChild &&
            (t.flowType || getFlowType(t.category)) === "EXPENSE"
        )
      : [];
    const totalPrev = safeAdd(
      ...prevTxs.map((t) => (t.isSplit && t.personalAmount != null ? t.personalAmount : t.amount))
    );

    const diffPercent =
      totalPrev > 0 ? Math.round(((totalCurrent - totalPrev) / totalPrev) * 100) : 0;

    return {
      categoryName: selectedCategoryDrillDown,
      txs,
      totalCurrent,
      totalPrev,
      diffPercent
    };
  }, [selectedCategoryDrillDown, regimeTransactions, selectedMonth, transactions, accountingRegime, getTxMonthForRegime, getFlowType]);

  // SPRINT 29: Radar de Pendências & Próximos Vencimentos
  const pendingRadarData = useMemo(() => {
    const targetMonth =
      selectedMonth && selectedMonth !== "ALL"
        ? selectedMonth
        : currentCalendarDate.yearMonth;

    const normalizeDesc = (str: string) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const txsInMonth = transactions.filter((t) => {
      const m = getTxMonthForRegime(t, accountingRegime);
      return m === targetMonth;
    });

    const unlaunchedFixed = staticStatus.filter((item) => {
      if (item.type !== "Custo Fixo" || item.deletedAt) return false;
      const itemTitleNorm = normalizeDesc(item.title);
      return !txsInMonth.some((t) => {
        const tDescNorm = normalizeDesc(t.description);
        return (
          tDescNorm === itemTitleNorm ||
          (itemTitleNorm.length >= 4 && tDescNorm.includes(itemTitleNorm)) ||
          (tDescNorm.length >= 4 && itemTitleNorm.includes(tDescNorm))
        );
      });
    });

    const pendingTxs = regimeTransactions.filter(
      (t) =>
        t.status === "Pendente" &&
        !isNeutralFlow(t) &&
        !t.isSplitChild &&
        (t.flowType || getFlowType(t.category)) === "EXPENSE"
    );
    const totalPendingAmount = safeAdd(
      ...pendingTxs.map((t) => (t.isSplit && t.personalAmount != null ? t.personalAmount : t.amount))
    );

    const currentDay = currentCalendarDate.day;
    const cardSchedules = cards.map((card) => {
      const closingDay = card.closingDay || 1;
      const dueDay = card.dueDay || 10;
      let daysToClose = closingDay - currentDay;
      if (daysToClose < 0) daysToClose += 30;
      let daysToDue = dueDay - currentDay;
      if (daysToDue < 0) daysToDue += 30;

      const exposure = calculateCardExposure(card, transactions, targetMonth);

      return {
        card,
        closingDay,
        dueDay,
        daysToClose,
        daysToDue,
        invoiceAmount: exposure.used
      };
    });

    return {
      targetMonth,
      unlaunchedFixed,
      pendingTxs,
      totalPendingAmount,
      cardSchedules
    };
  }, [selectedMonth, transactions, staticStatus, regimeTransactions, cards, accountingRegime, getTxMonthForRegime, getFlowType, currentCalendarDate]);

  // Lançador rápido individual de item fixo no radar
  const handleLaunchSingleFixed = useCallback((item: StaticStatusItem) => {
    const targetMonth =
      selectedMonth && selectedMonth !== "ALL" && /^\d{4}-\d{2}$/.test(selectedMonth)
        ? selectedMonth
        : todayISO().slice(0, 7);

    let dayStr = "05";
    const dayMatch = item.notes ? item.notes.match(/(\d{1,2})[ºª]?\s*(?:dia|útil)?/i) : null;
    if (dayMatch && dayMatch[1]) {
      const d = Math.min(28, Math.max(1, parseInt(dayMatch[1], 10)));
      dayStr = String(d).padStart(2, "0");
    }
    const [y, m] = targetMonth.split("-");
    const dateFormatted = `${dayStr}-${m}-${y}`;

    const resolvedOriginBank = banks[0]?.name || "Conta Corrente";
    const newTx: Transaction = {
      id: `tx-fixed-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: dateFormatted,
      description: item.title,
      amount: item.amount,
      category: "Moradia",
      costType: "Fixo",
      paymentMethod: "Débito em Conta",
      bankAccount: resolvedOriginBank,
      status: "Pendente",
      flowType: "EXPENSE",
      notes: item.notes || "Lançado via Radar de Pendências"
    };

    setTransactions((prev) => [newTx, ...prev]);
    void upsertTransactionsInDb([newTx], debtorMap);
    notify(
      "Fixo Lançado com Sucesso!",
      `"${item.title}" (${formatBRL(item.amount)}) inserido para ${targetMonth}.`,
      "success",
      "FINANCE"
    );
  }, [selectedMonth, banks, debtorMap, notify]);

  // SPRINT 37: Importação em Lote de Extrato Bancário (Rafael Albuquerque)
  const handleBatchImportTransactions = useCallback(
    (newTxs: Transaction[]) => {
      if (!newTxs || newTxs.length === 0) return;
      setTransactions((prev) => [...newTxs, ...prev]);
      void upsertTransactionsInDb(newTxs, debtorMap);
      notify(
        "Extrato Importado!",
        `${newTxs.length} lançamentos adicionados com sucesso à sua base.`,
        "success",
        "FINANCE"
      );
    },
    [debtorMap, notify]
  );

  // SPRINT 31: Helper de Gradiente das Marcas de Cartões Apple Wallet
  const getCardGradient = useCallback((cardName: string, bankName?: string): string => {
    const text = `${cardName} ${bankName || ""}`.toLowerCase();
    if (text.includes("nubank") || text.includes("roxo") || text.includes("ultravioleta")) {
      return "from-[#820AD1] via-[#5C069A] to-[#3B0463]";
    }
    if (text.includes("inter") || text.includes("laranja")) {
      return "from-[#FF7A00] via-[#E05D00] to-[#B34500]";
    }
    if (text.includes("btg") || text.includes("pactual")) {
      return "from-[#0C2340] via-[#103058] to-[#061424]";
    }
    if (text.includes("c6") || text.includes("carbon")) {
      return "from-[#242424] via-[#1A1A1A] to-[#0F0F0F]";
    }
    if (text.includes("xp") || text.includes("infinite")) {
      return "from-[#1F2421] via-[#2A2E2B] to-[#121413]";
    }
    if (text.includes("bradesco") || text.includes("elo")) {
      return "from-[#CC092F] via-[#990623] to-[#660417]";
    }
    if (text.includes("itau") || text.includes("itaú") || text.includes("personnalite")) {
      return "from-[#EC7000] via-[#C95A00] to-[#994400]";
    }
    if (text.includes("santander")) {
      return "from-[#EC0000] via-[#B80000] to-[#850000]";
    }
    return "from-slate-800 via-slate-850 to-slate-900";
  }, []);

  // SPRINT 31: Radar Poligonal de 5 Eixos de Saúde Financeira (Score 0-100)
  const financialHealthData = useMemo(() => {
    const incomeBase =
      monthSummary.income > 0 ? monthSummary.income : Math.max(1, staticStatusSummary.rendaBase || 6000);

    const safeScore = (v: number) => (Number.isFinite(v) ? Math.min(100, Math.max(0, Math.round(v))) : 0);

    // 1. Taxa de Poupança / Aportes (meta: >= 20%)
    const poupancaRate = incomeBase > 0 && Number.isFinite((monthSummary.aportes / incomeBase) * 100) ? (monthSummary.aportes / incomeBase) * 100 : 0;
    const scorePoupanca = safeScore((poupancaRate / 20) * 100);

    // 2. Margem Livre (meta: >= 20%)
    const marginRate = incomeBase > 0 && Number.isFinite((monthSummary.balance / incomeBase) * 100) ? (monthSummary.balance / incomeBase) * 100 : 0;
    const scoreMargem =
      marginRate >= 20
        ? 100
        : marginRate <= 0
        ? safeScore(50 + marginRate)
        : safeScore((marginRate / 20) * 100);

    // 3. Controle de Fixos (meta: <= 50% da receita)
    const pctFixed = allocation503020.pctFixed;
    const scoreFixos = pctFixed <= 50 ? 100 : safeScore(100 - (pctFixed - 50) * 2.5);

    // 4. Saúde dos Limites (meta: >= 70% livre)
    const totalLimit = cardLimitsAnalytics.globalTotalLimit > 0 ? cardLimitsAnalytics.globalTotalLimit : bankLimitsAnalytics.globalTotalLimit;
    const totalLivre = cardLimitsAnalytics.globalTotalLimit > 0 ? cardLimitsAnalytics.globalTotalDisponivel : bankLimitsAnalytics.globalTotalDisponivel;
    const livreRate = totalLimit > 0 && Number.isFinite((totalLivre / totalLimit) * 100) ? (totalLivre / totalLimit) * 100 : 100;
    const scoreLimites = livreRate >= 70 ? 100 : safeScore((livreRate / 70) * 100);

    // 5. Teto Pessoal (meta: <= 100%)
    const personalPct = safeScore(
      (monthSummary.personalSpent / Math.max(1, effectivePersonalBudgetLimit)) * 100
    );
    const scoreTeto =
      personalPct <= 80
        ? 100
        : personalPct <= 100
        ? safeScore(100 - (personalPct - 80) * 2.5)
        : safeScore(50 - (personalPct - 100) * 2);

    const overallScore = safeScore(
      (scorePoupanca + scoreMargem + scoreFixos + scoreLimites + scoreTeto) / 5
    );

    const radarChartData = [
      { subject: "Poupança", score: scorePoupanca, fullMark: 100 },
      { subject: "Margem Livre", score: scoreMargem, fullMark: 100 },
      { subject: "Controle Fixos", score: scoreFixos, fullMark: 100 },
      { subject: "Saúde Limites", score: scoreLimites, fullMark: 100 },
      { subject: "Teto Pessoal", score: scoreTeto, fullMark: 100 }
    ];

    const tips: string[] = [];
    if (scorePoupanca < 70)
      tips.push("Aumente seus aportes mensais para atingir a meta recomendada de 20% da receita.");
    if (scoreMargem < 70)
      tips.push("Sua margem de sobra está apertada. Reduza gastos variáveis para respirar melhor.");
    if (scoreFixos < 70)
      tips.push("Custos fixos acima de 50% da receita. Tente renegociar assinaturas e contas fixas.");
    if (scoreLimites < 70)
      tips.push("Uso de limites acima de 30%. Evite rotativo e antecipe pagamentos de faturas.");
    if (scoreTeto < 70)
      tips.push("Seus gastos pessoais ultrapassaram o teto estipulado para o mês.");

    const statusLabel =
      overallScore >= 85
        ? "Excelente"
        : overallScore >= 70
        ? "Bom"
        : overallScore >= 50
        ? "Atenção"
        : "Crítico";

    const statusColor =
      overallScore >= 85
        ? "text-[#30D158]"
        : overallScore >= 70
        ? "text-[#0A84FF]"
        : overallScore >= 50
        ? "text-[#FF9F0A]"
        : "text-[#FF453A]";

    return {
      overallScore,
      statusLabel,
      statusColor,
      radarChartData,
      tips,
      metrics: {
        poupancaRate,
        marginRate,
        pctFixed,
        livreRate,
        personalPct
      }
    };
  }, [
    monthSummary,
    staticStatusSummary.rendaBase,
    allocation503020.pctFixed,
    bankLimitsAnalytics,
    cardLimitsAnalytics,
    effectivePersonalBudgetLimit
  ]);

  // SPRINT 31: Fluxo de Caixa Mensal (Últimos 6 Meses)
  const cashflow6MData = useMemo(() => {
    const currentYear = currentCalendarDate.year;
    const currentMonth = currentCalendarDate.month;
    const monthNamesShort = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const list: Array<{
      key: string;
      label: string;
      entradas: number;
      saidas: number;
      aportes: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      let y = currentYear;
      let m = currentMonth - i;
      while (m <= 0) {
        m += 12;
        y -= 1;
      }
      const key = `${y}-${String(m).padStart(2, "0")}`;
      const label = `${monthNamesShort[m - 1]}/${String(y).slice(2)}`;

      const txsInM = transactions.filter((t) => {
        if (t.isSplitChild || isNeutralFlow(t)) return false;
        const mKey = getTxMonthForRegime(t, accountingRegime);
        return mKey === key;
      });

      let entradas = 0;
      let saidas = 0;
      let aportes = 0;

      for (const t of txsInM) {
        const flow = t.flowType || getFlowType(t.category);
        const val = t.isSplit && t.personalAmount != null ? t.personalAmount : t.amount;
        if (flow === "INCOME") {
          entradas = safeAdd(entradas, val);
        } else if (flow === "INVESTMENT") {
          aportes = safeAdd(aportes, val);
        } else if (flow === "EXPENSE") {
          saidas = safeAdd(saidas, val);
        }
      }

      list.push({ key, label, entradas, saidas, aportes });
    }

    return list;
  }, [currentCalendarDate, transactions, accountingRegime, getTxMonthForRegime, getFlowType]);

  // SPRINT 31: Últimos 5 Lançamentos Recentes
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .filter((t) => !t.isSplitChild)
      .sort((a, b) => {
        const comp = compareDatesBR(b.date, a.date);
        if (comp !== 0) return comp;
        return (b.updatedAt || "").localeCompare(a.updatedAt || "");
      })
      .slice(0, 5);
  }, [transactions]);

  // SPRINT 32: Normalização e auto-cura completa do layout do Dashboard (Grid único 100% ordenável)
  const effectiveDashboardLayout = useMemo(() => {
    return normalizeDashboardLayout(dashboardLayout);
  }, [dashboardLayout]);

  const autoMetrics = useMemo(() => {
    const autoCategories = new Set(categoriesCatalog.filter((c) => c.isAuto).map((c) => c.name));
    const autoTxs = transactions
      .filter((t) => autoCategories.has(t.category) || t.km != null || isFuelTransaction(t))
      .sort((a, b) => compareDatesBR(a.date, b.date));

    const inmetroCfg = autoInmetroConfig || DEFAULT_AUTO_INMETRO_CONFIG;
    const consumption = calculateVehicleConsumption(autoTxs, inmetroCfg);
    const tco = calculateVehicleTco(autoTxs, consumption.totalFuelCost, consumption.distanceDriven);

    return {
      autoTxs: autoTxs.slice().reverse(),
      kmRecords: autoTxs.filter((t) => t.km).map((t) => ({ date: t.date, km: t.km })),
      maxKm: consumption.maxKm,
      distanceDriven: consumption.distanceDriven,
      avgKmPerLiter: consumption.avgKmPerLiter,
      fuelTotal: tco.fuelTotal,
      maintenanceTotal: tco.maintenanceTotal,
      ipvaTotal: tco.ipvaTotal,
      licenciamentoTotal: tco.licenciamentoTotal,
      seguroTotal: tco.seguroTotal,
      estacionamentoTotal: tco.estacionamentoTotal,
      totalAutoSpent: safeAdd(tco.fuelTotal, tco.maintenanceTotal),
      totalTCO: tco.totalTCO,
      costPerKm:
        consumption.distanceDriven > 0
          ? Number((safeAdd(tco.fuelTotal, tco.maintenanceTotal) / consumption.distanceDriven).toFixed(2))
          : 0,
      tcoPerKm: tco.tcoPerKm,
      tcoItems: tco.tcoItems,
      consumptionPoints: consumption.consumptionPoints
    };
  }, [transactions, categoriesCatalog, autoInmetroConfig]);

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
    let openCents = 0;
    let paidCents = 0;
    const byPersonMap = new Map<
      string,
      { person: string; abertoCents: number; pagoCents: number; totalEmprestadoCents: number }
    >();

    receivableItems.forEach((item) => {
      const itemRemainingCents = toCents(item.remaining);
      const itemPaidCents = toCents(item.effectivePaid);
      const itemTotalCents = itemRemainingCents + itemPaidCents;

      openCents += itemRemainingCents;
      paidCents += itemPaidCents;

      const pName = item.debtorName.trim() ? item.debtorName.trim() : "Não Atribuído";
      const curr = byPersonMap.get(pName) || { person: pName, abertoCents: 0, pagoCents: 0, totalEmprestadoCents: 0 };
      curr.abertoCents += itemRemainingCents;
      curr.pagoCents += itemPaidCents;
      curr.totalEmprestadoCents += itemTotalCents;
      byPersonMap.set(pName, curr);
    });

    const totalOpen = fromCents(openCents);
    const totalPaid = fromCents(paidCents);
    const totalLoaned = fromCents(openCents + paidCents);

    const list = Array.from(byPersonMap.values()).map((p) => ({
      person: p.person,
      aberto: fromCents(p.abertoCents),
      pago: fromCents(p.pagoCents),
      totalEmprestado: fromCents(p.totalEmprestadoCents)
    }));

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
      description: isFuel ? "Abastecimento - Gasolina" : "",
      amount: "",
      category: isFuel ? "Gasolina" : cat,
      costType: "Variável",
      paymentMethod: defaultMethod,
      cardUsed: cards[0]?.name || "Nubank Ultravioleta",
      bankAccount: banks[0]?.name || "Nubank",
      status: getAutomaticStatus(defaultMethod, isFuel ? "Gasolina" : cat),
      km: "",
      liters: "",
      pricePerLiter: "",
      installments: "1",
      debtor: "",
      isTransfer: false,
      sourceBank: banks[0]?.name || "Nubank",
      destinationBank: banks[1]?.name || banks[0]?.name || "Inter",
      isSplit: false,
      thirdPartyAmount: "",
      thirdPartyName: "",
      personalAmount: "",
      linkedReceivableId: "",
      indexer: "115% CDI (Caixinha Turbo)",
      cdiPercentage: "115"
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
      pricePerLiter: tx.liters && tx.liters > 0 ? (tx.amount / tx.liters).toFixed(2) : "",
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
      fullTank: tx.fullTank ?? true,
      indexer: tx.indexer || (tx.category.toLowerCase().includes("aporte") ? "115% CDI (Caixinha Turbo)" : undefined),
      cdiPercentage: tx.cdiPercentage ? String(tx.cdiPercentage) : (tx.category.toLowerCase().includes("aporte") ? "115" : undefined)
    });
    setShowTxModal(true);
  };

  // CRUD de Lançamentos Conectado ao Supabase
  const handleSaveTransaction = async (e: React.FormEvent, createAnother: boolean = false) => {
    e.preventDefault();
    const evaluatedAmountStr = evaluateMathExpression(newTx.amount);
    let totalAmount = parseFloat(evaluatedAmountStr) || 0;
    const parsedLiters = parseFloat(newTx.liters?.replace(",", ".") || "0") || 0;
    const parsedPrice = parseFloat(newTx.pricePerLiter?.replace(",", ".") || "0") || 0;

    // Se o valor for 0 mas houver Litros e Preço/Litro no Posto Express, calcula automaticamente
    if (isPostoExpress && totalAmount <= 0 && parsedLiters > 0 && parsedPrice > 0) {
      totalAmount = Math.round(parsedLiters * parsedPrice * 100) / 100;
    }

    const normalizedDate = formatDateBR(newTx.date) || todayBR();
    const normalizedCategory = isPostoExpress
      ? "Gasolina"
      : (newTx.category === "Gasolina/Combustível" ? "Gasolina" : newTx.category);

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

    const isTransferTx = Boolean(newTx.isTransfer || normalizedCategory === "Transferência entre Contas");
    const isSplitTx = Boolean(!isTransferTx && newTx.isSplit && normalizedCategory !== "A Receber");
    const parsedThirdAmount = isSplitTx && newTx.thirdPartyAmount ? parseFloat(newTx.thirdPartyAmount) : undefined;
    const cleanThirdName = isSplitTx && newTx.thirdPartyName ? sanitizeText(newTx.thirdPartyName) : undefined;
    const calculatedPersonal = isSplitTx && parsedThirdAmount != null
      ? safeSub(totalAmount, parsedThirdAmount)
      : undefined;

    const resolvedFlow = resolveTransactionFlowType(
      { category: normalizedCategory, isTransfer: isTransferTx, isSplit: isSplitTx },
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
      date: normalizedDate,
      category: normalizedCategory,
      paymentMethod: newTx.paymentMethod,
      costType: newTx.costType,
      status: newTx.status,
      cardUsed: savedCardUsed,
      bankAccount: resolvedBank,
      debtor: normalizedCategory === "A Receber" ? newTx.debtor : undefined,
      km: newTx.km ? Number(newTx.km) : undefined,
      liters: newTx.liters ? Number(newTx.liters) : undefined,
      isTransfer: isTransferTx,
      sourceBank: newTx.sourceBank || resolvedBank,
      destinationBank: newTx.destinationBank,
      isSplit: isSplitTx,
      thirdPartyAmount: parsedThirdAmount,
      thirdPartyName: cleanThirdName,
      personalAmount: calculatedPersonal,
      linkedReceivableId: newTx.linkedReceivableId || undefined,
      indexer: newTx.indexer || undefined,
      cdiPercentage: newTx.cdiPercentage ? parseFloat(newTx.cdiPercentage) : undefined
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

              const instInvData = isCredit
                ? calculateInvoiceAndCashMonths(t.date, matchedCard?.closingDay, matchedCard?.dueDay)
                : null;
              const itemInvoiceMonth = isCredit ? instInvData?.invoiceCompetence : undefined;
              const itemCashMonth = isCredit ? instInvData?.cashMonth : getYearMonthKey(t.date);

              const updatedItem: Transaction = {
                ...t,
                description: finalDescription,
                category: normalizedCategory,
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
                cashMonth: itemCashMonth,
                debtor: normalizedCategory === "A Receber" ? sanitizeText(newTx.debtor) : t.debtor,
                rev: (t.rev ?? 0) + 1,
                updatedAt: nowIso
              };
              editedItems.push(updatedItem);
              return updatedItem;
            }
            return t;
          });

          setTransactions(updated);
          setUserItem("lifeos_txs_v8", JSON.stringify(updated), currentUserId);
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
            ? calculateInvoiceAndCashMonths(normalizedDate, matchedCard?.closingDay, matchedCard?.dueDay)
            : null;
          const itemInvoiceMonth = isCredit ? invData?.invoiceCompetence : undefined;
          const itemCashMonth = isCredit ? invData?.cashMonth : getYearMonthKey(normalizedDate);

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
              date: normalizedDate,
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

          const isSettlementEdit =
            normalizedCategory === "Recebimento de Empréstimo" ||
            Boolean(existingTx?.isReceivableSettlement);
          const settlementLinkedId = isSettlementEdit
            ? newTx.linkedReceivableId || existingTx?.linkedReceivableId
            : finalLinkedReceivableId;

          let updatedParentDebt: Transaction | null = null;
          let updatedEditedItem: Transaction | null = null;
          setTransactions((prev) => {
            let next = prev.map((t) => {
              if (t.id === editingTxId) {
                editedItem = {
                  ...t,
                  date: normalizedDate,
                  description: sanitizeText(newTx.description),
                  amount: totalAmount,
                  category: normalizedCategory,
                  flowType: isSettlementEdit ? "INCOME" : resolvedFlow,
                  isReceivableSettlement: isSettlementEdit ? true : t.isReceivableSettlement,
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
                  debtor: normalizedCategory === "A Receber" ? sanitizeText(newTx.debtor) : t.debtor,
                  isTransfer: isTransferTx,
                  sourceBank: newTx.sourceBank || resolvedBank,
                  destinationBank: newTx.destinationBank,
                  isSplit: isSplitTx,
                  thirdPartyAmount: parsedThirdAmount,
                  thirdPartyName: cleanThirdName,
                  personalAmount: calculatedPersonal,
                  linkedReceivableId: settlementLinkedId,
                  indexer: newTx.indexer,
                  cdiPercentage: newTx.cdiPercentage ? parseFloat(newTx.cdiPercentage) : undefined,
                  rev: (t.rev ?? 0) + 1,
                  updatedAt: nowIso
                };
                updatedEditedItem = editedItem;
                return editedItem;
              }
              if (childItemToUpsert && t.id === childItemToUpsert.id) {
                return childItemToUpsert;
              }
              return t;
            });

            // Se editou um recebimento com dívida vinculada, sincroniza o paidAmount da dívida mãe
            if (isSettlementEdit && settlementLinkedId) {
              const pDebt = next.find((t) => t.id === settlementLinkedId);
              if (pDebt) {
                const otherSettlements = next.filter(
                  (t) => t.linkedReceivableId === settlementLinkedId && t.id !== editingTxId
                );
                const newPaid = otherSettlements.reduce((sum, s) => safeAdd(sum, s.amount), totalAmount);
                updatedParentDebt = {
                  ...pDebt,
                  paidAmount: Math.max(0, newPaid),
                  status: newPaid >= pDebt.amount ? "Pago" : "Pendente",
                  updatedAt: nowIso
                };
                next = next.map((t) => (t.id === settlementLinkedId ? updatedParentDebt! : t));
              }
            }

            if (childIdToDelete) {
              next = next.filter((t) => t.id !== childIdToDelete);
            } else if (childItemToUpsert && !next.some((t) => t.id === childItemToUpsert!.id)) {
              next = [childItemToUpsert, ...next];
            }

            try {
              setUserItem("lifeos_txs_v8", JSON.stringify(next), currentUserId);
              localStorage.setItem("lifeos_txs_v8", JSON.stringify(next));
            } catch (err) {
              console.error("Erro ao salvar localStorage lifeos_txs_v8", err);
            }
            return next;
          });

          if (childIdToDelete) {
            await deleteTransactionInDb(childIdToDelete);
          }

          const nextDebtorMap = { ...debtorMap };
          if (childItemToUpsert && cleanThirdName) {
            nextDebtorMap[childItemToUpsert.id] = cleanThirdName;
            setDebtorMap(nextDebtorMap);
            localStorage.setItem("lifeos_debtors_v8", JSON.stringify(nextDebtorMap));
          }

          const finalEdited: Transaction | null = updatedEditedItem || editedItem;
          const itemsToDb: Transaction[] = [];
          if (finalEdited) itemsToDb.push(finalEdited);
          if (childItemToUpsert) itemsToDb.push(childItemToUpsert);
          if (updatedParentDebt) itemsToDb.push(updatedParentDebt);
          if (itemsToDb.length > 0) await upsertTransactionsInDb(itemsToDb, nextDebtorMap);

          // Sincroniza telemetria de combustível se aplicável
          if (isPostoExpress || (newTx.liters && Number(newTx.liters) > 0)) {
            try {
              const rawLogs = localStorage.getItem("lifeos_fuel_logs_v1");
              const logs = rawLogs ? JSON.parse(rawLogs) : [];
              const fuelEntry = {
                id: editingTxId,
                date: normalizedDate,
                liters: newTx.liters ? Number(newTx.liters) : 0,
                pricePerLiter: newTx.liters && Number(newTx.liters) > 0 ? totalAmount / Number(newTx.liters) : parsedPrice || 0,
                totalAmount: totalAmount,
                odometer: newTx.km ? Number(newTx.km) : 0,
                fuelType: resolvedFuelType || "Gasolina",
                fullTank: resolvedFullTank,
                updatedAt: nowIso
              };
              localStorage.setItem("lifeos_fuel_logs_v1", JSON.stringify([fuelEntry, ...logs.filter((l: any) => l.id !== editingTxId)]));
            } catch (fuelErr) {
              console.error("Erro ao sincronizar telemetria no edit", fuelErr);
            }
          }
          if (isPostoExpress && newTx.liters && Number(newTx.liters) > 0) {
            const priceL = (totalAmount / Number(newTx.liters)).toFixed(2);
            notify("Abastecimento Atualizado!", `${newTx.description} — ${newTx.liters}L a R$ ${priceL}/L`, "success", "FINANCE");
          } else {
            notify("Lançamento Atualizado", `${newTx.description} (${formatBRL(totalAmount)})`, "success", "FINANCE");
          }
        }
      } else if (installmentsCount > 1 && isCredit) {
        const slices = distributeInstallments(totalAmount, installmentsCount);
        const seriesId = generateInstallmentSeriesId(newTx.description, normalizedDate, totalAmount);
        const createdList: Transaction[] = [];

        for (let i = 0; i < slices.length; i++) {
          const slice = slices[i];
          const instDate = addMonthsToDate(normalizedDate, i);
          const invData = calculateInvoiceAndCashMonths(instDate, matchedCard?.closingDay, matchedCard?.dueDay);
          createdList.push({
            id: `tx-${Date.now()}-${i}`,
            date: instDate,
            description: sanitizeText(newTx.description),
            amount: slice.amount,
            category: normalizedCategory,
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
            debtor: normalizedCategory === "A Receber" ? sanitizeText(newTx.debtor) : undefined,
            rev: 1,
            updatedAt: nowIso
          });
        }
        const updated = [...createdList, ...transactions];
        setTransactions(updated);
        setUserItem("lifeos_txs_v8", JSON.stringify(updated), currentUserId);
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
          ? calculateInvoiceAndCashMonths(normalizedDate, matchedCard?.closingDay, matchedCard?.dueDay)
          : null;
        const itemInvoiceMonth = isCredit ? invData?.invoiceCompetence : undefined;
        const itemCashMonth = isCredit ? invData?.cashMonth : getYearMonthKey(normalizedDate);
        const parentId = `tx-${Date.now()}`;
        let childItem: Transaction | null = null;
        let childId: string | undefined = undefined;

        if (isSplitTx && parsedThirdAmount && parsedThirdAmount > 0 && cleanThirdName) {
          childId = `tx-split-rec-${Date.now()}`;
          childItem = {
            id: childId,
            date: normalizedDate,
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
            rev: 1,
            updatedAt: nowIso
          };
        }

        const isNewSettlement =
          normalizedCategory === "Recebimento de Empréstimo" || Boolean(newTx.linkedReceivableId);
        const resolvedLinkedId = isNewSettlement ? newTx.linkedReceivableId : childId;

        const item: Transaction = {
          id: parentId,
          date: normalizedDate,
          description: sanitizeText(newTx.description),
          amount: totalAmount,
          category: normalizedCategory,
          flowType: isNewSettlement ? "INCOME" : resolvedFlow,
          isReceivableSettlement: isNewSettlement ? true : undefined,
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
          debtor: normalizedCategory === "A Receber" ? sanitizeText(newTx.debtor) : (isNewSettlement ? newTx.debtor : undefined),
          isTransfer: isTransferTx,
          sourceBank: newTx.sourceBank || resolvedBank,
          destinationBank: newTx.destinationBank,
          isSplit: isSplitTx,
          thirdPartyAmount: parsedThirdAmount,
          thirdPartyName: cleanThirdName,
          personalAmount: calculatedPersonal,
          linkedReceivableId: resolvedLinkedId,
          indexer: newTx.indexer,
          cdiPercentage: newTx.cdiPercentage ? parseFloat(newTx.cdiPercentage) : undefined,
          rev: 1,
          updatedAt: nowIso
        };

        let updatedParentDebtForNew: Transaction | null = null;
        if (isNewSettlement && newTx.linkedReceivableId) {
          const pDebt = transactions.find((t) => t.id === newTx.linkedReceivableId);
          if (pDebt) {
            const existingSettlements = transactions.filter(
              (t) => t.linkedReceivableId === pDebt.id
            );
            const newPaid = existingSettlements.reduce((sum, s) => safeAdd(sum, s.amount), totalAmount);
            updatedParentDebtForNew = {
              ...pDebt,
              paidAmount: Math.max(0, newPaid),
              status: newPaid >= pDebt.amount ? "Pago" : "Pendente",
              updatedAt: nowIso
            };
          }
        }

        const nextDebtorMap = { ...debtorMap };
        if (childItem && cleanThirdName) {
          nextDebtorMap[childItem.id] = cleanThirdName;
          setDebtorMap(nextDebtorMap);
          localStorage.setItem("lifeos_debtors_v8", JSON.stringify(nextDebtorMap));
        }

        const toSaveList: Transaction[] = [
          item,
          ...(childItem ? [childItem] : []),
          ...(updatedParentDebtForNew ? [updatedParentDebtForNew] : [])
        ];
        setTransactions((prev) => {
          const next = [...toSaveList, ...prev.filter((t) => !toSaveList.some((s) => s.id === t.id))];
          try {
            setUserItem("lifeos_txs_v8", JSON.stringify(next), currentUserId);
            localStorage.setItem("lifeos_txs_v8", JSON.stringify(next));
          } catch (err) {
            console.error("Erro ao salvar localStorage lifeos_txs_v8", err);
          }
          return next;
        });
        await upsertTransactionsInDb(toSaveList, nextDebtorMap);

        // Registro Atômico na Telemetria de Combustível (lifeos_fuel_logs_v1)
        if (isPostoExpress || (item.liters && item.liters > 0)) {
          try {
            const rawLogs = localStorage.getItem("lifeos_fuel_logs_v1");
            const logs = rawLogs ? JSON.parse(rawLogs) : [];
            const fuelEntry = {
              id: item.id,
              date: normalizedDate,
              liters: item.liters || 0,
              pricePerLiter: item.liters && item.liters > 0 ? totalAmount / item.liters : parsedPrice || 0,
              totalAmount: totalAmount,
              odometer: item.km || 0,
              fuelType: resolvedFuelType || "Gasolina",
              fullTank: resolvedFullTank,
              createdAt: nowIso
            };
            localStorage.setItem(
              "lifeos_fuel_logs_v1",
              JSON.stringify([fuelEntry, ...logs.filter((l: any) => l.id !== item.id)])
            );
          } catch (fuelErr) {
            console.error("Erro ao salvar telemetria lifeos_fuel_logs_v1", fuelErr);
          }
        }
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

  // HOTFIX SPRINT 38.1 — Fluxo Atômico Único de Abastecimento (Telemetria + Lançamentos)
  const handleUnifiedAddFuel = useCallback(
    async (tx: Transaction) => {
      const normalizedDate = formatDateBR(tx.date) || todayBR();
      const normalizedTx: Transaction = {
        ...tx,
        date: normalizedDate,
        category: "Gasolina",
        flowType: "EXPENSE",
        costType: tx.costType || "Variável",
        status: tx.status || "Pago",
        updatedAt: new Date().toISOString()
      };

      // 1. Telemetria do Veículo em localStorage (lifeos_fuel_logs_v1)
      try {
        const existingFuelLogs = JSON.parse(localStorage.getItem("lifeos_fuel_logs_v1") || "[]");
        const fuelEntry = {
          id: normalizedTx.id,
          date: normalizedDate,
          liters: normalizedTx.liters || 0,
          pricePerLiter:
            normalizedTx.liters && normalizedTx.liters > 0
              ? normalizedTx.amount / normalizedTx.liters
              : 0,
          totalAmount: normalizedTx.amount,
          odometer: normalizedTx.km || 0,
          fuelType: normalizedTx.fuelType || "Gasolina",
          fullTank: normalizedTx.fullTank !== false,
          createdAt: new Date().toISOString()
        };
        const updatedFuelLogs = [fuelEntry, ...existingFuelLogs.filter((l: any) => l.id !== normalizedTx.id)];
        localStorage.setItem("lifeos_fuel_logs_v1", JSON.stringify(updatedFuelLogs));
      } catch (err) {
        console.error("Erro ao salvar telemetria lifeos_fuel_logs_v1", err);
      }

      // 2. Na Coleção Central de Lançamentos (transactions):
      setTransactions((prev) => {
        const next = [normalizedTx, ...prev.filter((t) => t.id !== normalizedTx.id)];
        try {
          localStorage.setItem("lifeos_txs_v8", JSON.stringify(next));
        } catch (err) {
          console.error("Erro ao salvar localStorage lifeos_txs_v8", err);
        }
        return next;
      });

      // 3. Sincronização com Supabase
      try {
        await upsertTransactionsInDb([normalizedTx], debtorMap);
      } catch (err) {
        console.error("Erro ao sincronizar abastecimento com Supabase", err);
      }

      notify(
        "Abastecimento Sincronizado!",
        `${normalizedTx.description} — ${formatBRL(normalizedTx.amount)} registrado nos Lançamentos e Telemetria.`,
        "success",
        "FINANCE"
      );
    },
    [debtorMap, notify]
  );

  const handleSaveInvestmentTx = useCallback(
    async (partialTx: Partial<Transaction>, isEdit?: boolean) => {
      const fullTx: Transaction = {
        id: partialTx.id || `inv-${Date.now()}`,
        date: formatDateBR(partialTx.date) || todayBR(),
        description: partialTx.description || "Aporte em Investimentos",
        amount: partialTx.amount || 0,
        category: partialTx.category || "Aporte",
        costType: partialTx.costType || "Variável",
        paymentMethod: partialTx.paymentMethod || "Transferência / PIX",
        status: partialTx.status || "Pago",
        flowType: partialTx.flowType || "INVESTMENT",
        bankAccount: partialTx.bankAccount || "Nubank",
        bankId: partialTx.bankId,
        investmentBucket: partialTx.investmentBucket || "CDI",
        assetTicker: partialTx.assetTicker,
        entryQuotePrice: partialTx.entryQuotePrice,
        manualYieldPct: partialTx.manualYieldPct,
        updatedAt: new Date().toISOString(),
        rev: ((partialTx as any).rev || 0) + 1
      };

      setTransactions((prev) => {
        let next: Transaction[];
        if (isEdit || prev.some((t) => t.id === fullTx.id)) {
          next = prev.map((t) => (t.id === fullTx.id ? { ...t, ...fullTx } : t));
        } else {
          next = [fullTx, ...prev];
        }
        setUserItem("lifeos_txs_v8", JSON.stringify(next), currentUserId);
        localStorage.setItem("lifeos_txs_v8", JSON.stringify(next));
        return next;
      });

      try {
        await upsertTransactionsInDb([fullTx], debtorMap);
      } catch (err) {
        console.error("Erro ao sincronizar investimento com Supabase", err);
      }
    },
    [currentUserId, debtorMap]
  );

  const handleToggleStatus = (tx: Transaction) => {
    let nextStatus: TxStatus;
    if (tx.status === "Pago") {
      nextStatus = tx.paymentMethod === "Cartão de Crédito" ? "Na Fatura" : "Pendente";
    } else {
      nextStatus = "Pago";
    }
    const previousTx = { ...tx };
    const isReceivableParent = tx.category === "A Receber" || tx.flowType === "RECEIVABLE";
    const linkedSettlements = isReceivableParent ? transactions.filter((t) => t.linkedReceivableId === tx.id) : [];
    const linkedSettlementIds = new Set(linkedSettlements.map((t) => t.id));

    const changedItem: Transaction = {
      ...tx,
      status: nextStatus,
      paidAmount: nextStatus === "Pago" ? tx.amount : 0,
      updatedAt: new Date().toISOString()
    };

    let nextList: Transaction[];
    if (isReceivableParent && nextStatus === "Pendente" && linkedSettlements.length > 0) {
      nextList = transactions
        .filter((t) => !linkedSettlementIds.has(t.id))
        .map((t) => (t.id === tx.id ? changedItem : t));
      recordTombstones(Array.from(linkedSettlementIds), currentUserId);
      void deleteTransactionsInDb(Array.from(linkedSettlementIds));
    } else if (isReceivableParent && nextStatus === "Pago" && linkedSettlements.length === 0) {
      const nowIso = new Date().toISOString();
      const settlementTx: Transaction = {
        id: `tx-recv-${Date.now()}`,
        date: todayBR(),
        description: `Recebimento: ${tx.debtor || debtorMap[tx.id] || "Devedor"} (${tx.description})`,
        amount: tx.amount,
        category: "Recebimento de Empréstimo",
        flowType: "INCOME",
        isReceivableSettlement: true,
        linkedReceivableId: tx.id,
        debtor: tx.debtor || debtorMap[tx.id] || "Devedor",
        costType: "Variável",
        paymentMethod: "PIX",
        bankAccount: banks[0]?.name || "Nubank",
        status: "Pago",
        updatedAt: nowIso
      };
      nextList = [settlementTx, ...transactions.map((t) => (t.id === tx.id ? changedItem : t))];
      void upsertTransactionsInDb([settlementTx, changedItem], debtorMap);
    } else {
      nextList = transactions.map((t) => (t.id === tx.id ? changedItem : t));
      void upsertTransactionsInDb([changedItem], debtorMap);
    }

    setTransactions(nextList);
    setUserItem("lifeos_txs_v8", JSON.stringify(nextList), currentUserId);
    localStorage.setItem("lifeos_txs_v8", JSON.stringify(nextList));

    notify(
      "Situação Alterada",
      `${tx.description} marcado como ${nextStatus}.`,
      "info",
      "FINANCE",
      () => {
        const reverted = transactions.map((t) => (t.id === tx.id ? previousTx : t));
        setTransactions(reverted);
        setUserItem("lifeos_txs_v8", JSON.stringify(reverted), currentUserId);
        localStorage.setItem("lifeos_txs_v8", JSON.stringify(reverted));
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
        const isSettlement = tx.isReceivableSettlement === true || tx.category === "Recebimento de Empréstimo";
        const childId = !isSettlement && tx.isSplit ? tx.linkedReceivableId : undefined;
        const parentSplitId = tx.linkedSplitParentId;
        const parentDebtId = isSettlement ? tx.linkedReceivableId : undefined;

        // Se deletou uma dívida de Valores a Receber, localiza todos os recebimentos filhos vinculados
        const childSettlements = !isSettlement ? transactions.filter((t) => t.linkedReceivableId === id) : [];
        const childSettlementIds = new Set(childSettlements.map((t) => t.id));

        const previousTransactions = [...transactions];
        const txsToRestore = transactions.filter(
          (t) => t.id === id || (childId && t.id === childId) || childSettlementIds.has(t.id)
        );

        // Se deletou um recebimento no Livro Caixa, subtrai imediatamente da dívida mãe e volta para Pendente
        let parentDebtToUpdate: Transaction | null = null;
        if (parentDebtId) {
          const parentDebt = transactions.find((t) => t.id === parentDebtId);
          if (parentDebt) {
            const remainingSettlements = transactions.filter(
              (t) => t.id !== id && t.linkedReceivableId === parentDebtId
            );
            const newPaid = remainingSettlements.reduce((sum, s) => safeAdd(sum, s.amount), 0);
            parentDebtToUpdate = {
              ...parentDebt,
              paidAmount: Math.max(0, newPaid),
              status: newPaid >= parentDebt.amount ? "Pago" : "Pendente",
              updatedAt: new Date().toISOString()
            };
          }
        }

        const updated = transactions
          .filter((t) => t.id !== id && (!childId || t.id !== childId) && !childSettlementIds.has(t.id))
          .map((t) => {
            if (parentDebtToUpdate && t.id === parentDebtToUpdate.id) {
              return parentDebtToUpdate;
            }
            if (parentSplitId && t.id === parentSplitId) {
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
        childSettlementIds.forEach((cid) => recordTombstone(cid, currentUserId));

        setTransactions(updated);
        setUserItem("lifeos_txs_v8", JSON.stringify(updated), currentUserId);
        localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));

        // Sincroniza exclusão de abastecimento no fuelLogs
        if (tx.category === "Gasolina" || tx.liters || tx.km) {
          try {
            const rawLogs = localStorage.getItem("lifeos_fuel_logs_v1");
            if (rawLogs) {
              const logs = JSON.parse(rawLogs);
              const filteredLogs = logs.filter((l: any) => l.id !== id);
              localStorage.setItem("lifeos_fuel_logs_v1", JSON.stringify(filteredLogs));
            }
          } catch (e) {
            console.error("Erro ao sincronizar exclusão em lifeos_fuel_logs_v1", e);
          }
        }

        await deleteTransactionInDb(id);
        if (childId) {
          await deleteTransactionInDb(childId);
        }
        for (const cid of childSettlementIds) {
          await deleteTransactionInDb(cid);
        }
        if (parentDebtToUpdate) {
          await upsertTransactionsInDb([parentDebtToUpdate], debtorMap);
        }

        notify(
          "Lançamento Removido",
          `"${tx.description}" excluído com sucesso.`,
          "warning",
          "FINANCE",
          () => {
            removeTombstone(id, currentUserId);
            if (childId) {
              removeTombstone(childId, currentUserId);
            }
            childSettlementIds.forEach((cid) => removeTombstone(cid, currentUserId));
            const cleanRestored = txsToRestore.map((t) => {
              const c = { ...t };
              delete c.deletedAt;
              return c;
            });
            setTransactions(previousTransactions);
            setUserItem("lifeos_txs_v8", JSON.stringify(previousTransactions), currentUserId);
            localStorage.setItem("lifeos_txs_v8", JSON.stringify(previousTransactions));
            upsertTransactionsInDb(cleanRestored, debtorMap);
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
            removeTombstones(Array.from(idsToDelete), currentUserId);
            const cleanSeries = seriesList.map((t) => {
              const c = { ...t };
              delete c.deletedAt;
              return c;
            });
            setTransactions(previousTransactions);
            setUserItem("lifeos_txs_v8", JSON.stringify(previousTransactions), currentUserId);
            upsertTransactionsInDb(cleanSeries, debtorMap);
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
            removeTombstone(targetId, currentUserId);
            const cleanDeleted = { ...deletedTx };
            delete cleanDeleted.deletedAt;
            setTransactions(previousTransactions);
            setUserItem("lifeos_txs_v8", JSON.stringify(previousTransactions), currentUserId);
            upsertTransactionsInDb([cleanDeleted], debtorMap);
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
    const totalAmount = tx.amount;
    const currPaid = tx.paidAmount || 0;
    const safePaid = Math.min(totalAmount, Math.max(0, safeAdd(currPaid, cleanAmount)));
    const safeRemaining = Math.max(0, safeSub(totalAmount, safePaid));
    const nextStatus: TxStatus = safeRemaining === 0 ? "Pago" : "Pendente";
    const nowIso = todayISO();
    const todayStr = todayBR();
    const debtorName = tx.debtor || debtorMap[tx.id] || "Devedor";
    const isPartial = safeRemaining > 0;

    const changedTx: Transaction = {
      ...tx,
      paidAmount: safePaid,
      status: nextStatus,
      updatedAt: nowIso
    };

    const incomeTx: Transaction = {
      id: `tx-recv-${Date.now()}`,
      date: todayStr,
      description: isPartial
        ? `Recebimento Parcial: ${debtorName} (${tx.description})`
        : `Recebimento: ${debtorName} (${tx.description})`,
      amount: cleanAmount,
      category: "Recebimento de Empréstimo",
      flowType: "INCOME",
      isReceivableSettlement: true,
      linkedReceivableId: tx.id,
      debtor: debtorName,
      costType: "Variável",
      paymentMethod: "PIX",
      bankAccount: targetBank,
      status: "Pago",
      updatedAt: nowIso
    };

    const updated = [incomeTx, ...transactions.map((t) => (t.id === tx.id ? changedTx : t))];
    setTransactions(updated);
    setUserItem("lifeos_txs_v8", JSON.stringify(updated), currentUserId);
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

    const prevCard = editingCardId ? cards.find((c) => c.id === editingCardId) : null;
    const cardObj: CreditCardItem = {
      id: editingCardId || `card-${Date.now()}`,
      name: validation.data.name,
      brand: validation.data.brand,
      limit: validation.data.limit,
      closingDay: validation.data.closingDay,
      dueDay: validation.data.dueDay,
      logoUrl: validation.data.logoUrl || undefined,
      bankId: validation.data.bankId || undefined,
      bankName: validation.data.bankName || undefined,
      updatedAt: new Date().toISOString(),
      rev: (prevCard?.rev ?? 0) + 1
    };

    const oldCard = editingCardId ? cards.find((c) => c.id === editingCardId) : null;
    const updated = editingCardId ? cards.map((c) => (c.id === editingCardId ? cardObj : c)) : [...cards, cardObj];
    setCards(updated);
    // Persistência Síncrona Tripla (Sprint 47.1)
    setUserItem("lifeos_cards_v8", JSON.stringify(updated), currentUserId);
    localStorage.setItem("lifeos_cards_v8", JSON.stringify(updated));
    localStorage.setItem("coindex_vault_cards_backup", JSON.stringify(updated));
    void upsertCardInDb(cardObj);

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
        // Persistência Síncrona Tripla (Sprint 47.1)
        setUserItem("lifeos_cards_v8", JSON.stringify(updated), currentUserId);
        localStorage.setItem("lifeos_cards_v8", JSON.stringify(updated));
        localStorage.setItem("coindex_vault_cards_backup", JSON.stringify(updated));
        void deleteCardInDb(id);
        notify("Cartão Removido", `"${card?.name || "Cartão"}" excluído com sucesso.`, "warning", "CONFIG");
      }
    });
  };

  // SPRINT 54: Ordenação dos Cartões e Persistência Tripla
  const handleReorderCards = useCallback((newCards: CreditCardItem[]) => {
    setCards(newCards);
    try {
      setUserItem("lifeos_cards_v8", JSON.stringify(newCards), currentUserId);
      localStorage.setItem("lifeos_cards_v8", JSON.stringify(newCards));
      localStorage.setItem("coindex_vault_cards_backup", JSON.stringify(newCards));
    } catch {}
    void upsertCardsInDb(newCards);
    notify("Ordem dos Cartões", "Ordem atualizada com sucesso!", "success", "CONFIG");
  }, [currentUserId, notify]);

  // SPRINT 54: Scroll via Roda do Mouse no Stack de Cartões (Apple Wallet) com Debounce
  const handleWalletWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastWalletWheelTime.current < 140) return;
    const maxIdx = Math.max(0, cards.length - 3);
    if (e.deltaY > 15) {
      setWalletCarouselIndex((prev) => Math.min(maxIdx, prev + 1));
      lastWalletWheelTime.current = now;
    } else if (e.deltaY < -15) {
      setWalletCarouselIndex((prev) => Math.max(0, prev - 1));
      lastWalletWheelTime.current = now;
    }
  }, [cards.length]);


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

    const prevBank = editingBankId ? banks.find((b) => b.id === editingBankId) : null;
    const bankObj: BankItem = {
      id: editingBankId || `bank-${Date.now()}`,
      name: sanitizeText(validation.data.name),
      logoUrl: validation.data.logoUrl || undefined,
      limit: validation.data.limit,
      limitType: validation.data.limitType || "Cartão de Crédito",
      updatedAt: new Date().toISOString(),
      rev: (prevBank?.rev ?? 0) + 1
    };
    const oldBank = editingBankId ? banks.find((b) => b.id === editingBankId) : null;
    const updated = editingBankId
      ? banks.map((b) => (b.id === editingBankId ? bankObj : b))
      : [...banks, bankObj];
    setBanks(updated);
    // Persistência Síncrona Tripla (Sprint 47.1)
    setUserItem("lifeos_banks_v8", JSON.stringify(updated), currentUserId);
    localStorage.setItem("lifeos_banks_v1", JSON.stringify(updated));
    localStorage.setItem("coindex_vault_banks_backup", JSON.stringify(updated));
    void upsertBankInDb(bankObj);

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
        recordTombstone(id, currentUserId);
        const updated = banks.filter((b) => b.id !== id);
        setBanks(updated);
        // Persistência Síncrona Tripla (Sprint 47.1)
        setUserItem("lifeos_banks_v8", JSON.stringify(updated), currentUserId);
        localStorage.setItem("lifeos_banks_v1", JSON.stringify(updated));
        localStorage.setItem("coindex_vault_banks_backup", JSON.stringify(updated));

        const updatedCards = cards.map((c) => (c.bankId === id ? { ...c, bankId: undefined } : c));
        setCards(updatedCards);
        setUserItem("lifeos_cards_v8", JSON.stringify(updatedCards), currentUserId);
        localStorage.setItem("lifeos_cards_v8", JSON.stringify(updatedCards));
        localStorage.setItem("coindex_vault_cards_backup", JSON.stringify(updatedCards));

        void deleteBankInDb(id);
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
        localStorage.setItem("lifeos_cards_v8", JSON.stringify(nextCards));
        localStorage.setItem("coindex_vault_cards_backup", JSON.stringify(nextCards));
        void upsertCardsInDb(nextCards);

        setBanks(nextBanks);
        setUserItem("lifeos_banks_v8", JSON.stringify(nextBanks), currentUserId);
        localStorage.setItem("lifeos_banks_v1", JSON.stringify(nextBanks));
        localStorage.setItem("coindex_vault_banks_backup", JSON.stringify(nextBanks));
        void upsertBanksInDb(nextBanks);

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
          const normalized = normalizeDashboardLayout(s.dashboardLayout);
          setDashboardLayout(normalized);
          setUserItem("coindex_dashboard_layout_v3", JSON.stringify(normalized), currentUserId);
          setUserItem("lifeos_dash_layout_v1", JSON.stringify(normalized), currentUserId);
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

  // SPRINT 52: Animação #6 Liquid Unblur Wave no Modo Privacidade
  const moneyBlur = privacyMode ? "privacy-blur select-none" : "privacy-unblur";

  const syncIndicator = useMemo(() => {
    if (isSyncing) {
      return {
        color: "text-amber-400 bg-amber-400/10 border-amber-400/30",
        dot: "bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]",
        label: "Sincronizando...",
        status: "syncing",
        icon: <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />,
        timestamp: sheetsSyncStatus.timestamp || new Date().toLocaleTimeString("pt-BR")
      };
    }
    if (sheetsSyncStatus.state === "error") {
      return {
        color: "text-rose-400 bg-rose-400/10 border-rose-400/30",
        dot: "bg-rose-500 shadow-[0_0_8px_#f43f5e]",
        label: "Erro de Sync",
        status: "error",
        icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
        timestamp: sheetsSyncStatus.timestamp || ""
      };
    }
    if (currentUser && sheetsSyncStatus.state === "success") {
      return {
        color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
        dot: "bg-emerald-400 shadow-[0_0_8px_#10b981]",
        label: "Sincronizado",
        status: "synced",
        icon: <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />,
        timestamp: sheetsSyncStatus.timestamp || ""
      };
    }
    return {
      color: "text-slate-400 bg-slate-400/10 border-slate-400/20",
      dot: "bg-slate-400",
      label: "Offline (Local)",
      status: "offline",
      icon: <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />,
      timestamp: sheetsSyncStatus.timestamp || ""
    };
  }, [isSyncing, sheetsSyncStatus, currentUser]);

  const handleSeedPatrimonioHistory = handleSyncOfficialPatrimonioData;

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
        <CoindexIcon className="w-16 h-11" />
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
    <div className="min-h-screen flex text-slate-100 bg-transparent dashboard-root-wrapper relative">
      {/* SPRINT 45: Motor de Efeitos Especiais de Background "Cupertino Ambient FX" */}
      <AmbientBackgroundFX mode={bgFxMode} />
      <style jsx global>{`
        .glass-card {
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
        className={`fixed inset-y-0 left-0 z-40 bg-[var(--cupertino-sidebar)] border-r border-[var(--cupertino-border)] backdrop-blur-2xl transition-all duration-200 flex flex-col justify-between ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <CoindexLogoHorizontal size="sm" />
            ) : (
              <div className="mx-auto group cursor-pointer" title="Coindex OS">
                <CoindexIcon className="w-10 h-7" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              title={sidebarOpen ? "Recolher Menu Lateral" : "Expandir Menu Lateral"}
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

            {sidebarOpen && (
              <button
                type="button"
                onClick={() => setShowCommandModal(true)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-white/[0.08] text-slate-400 hover:text-white text-xs flex items-center justify-between transition cursor-pointer"
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
                { id: "investments", label: "Investimentos", icon: <TrendingUp className="w-4 h-4" /> },
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
                  className={`group relative w-full min-h-[44px] px-3.5 py-3 rounded-2xl font-medium flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? tab.id === "spotify"
                        ? "bg-[#1DB954]/20 text-[#1DB954] ring-1 ring-[#1DB954]/40 shadow-sm"
                        : "bg-[#0A84FF] text-white shadow-sm font-semibold rounded-2xl"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                  title={tab.label}
                >
                  {/* Ícone e Rótulo da Aba */}
                  <div className="shrink-0 transition-transform duration-200 cubic-bezier(0.22, 1, 0.36, 1) group-hover:scale-125 group-hover:-translate-y-0.5">
                    {tab.icon}
                  </div>
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
                    {syncIndicator.status === "syncing" ? (
                      <Loader2 className="w-2.5 h-2.5 animate-spin shrink-0" />
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full ${syncIndicator.dot}`} />
                    )}
                    <span>{syncIndicator.label}</span>
                  </span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="w-full flex justify-center p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/[0.06] hover:border-indigo-500/30 transition group cursor-pointer"
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
              className="w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              title="Encerrar Sessão"
            >
              <LogOut className="w-4 h-4" />
              {sidebarOpen && <span>Sair da Conta</span>}
            </button>
          </div>
        </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className={`flex-1 transition-all duration-200 ${sidebarOpen ? "ml-64" : "ml-20"} bg-transparent dashboard-main-content relative z-10`}>
        {/* CABEÇALHO PRINCIPAL */}
        <header className="sticky top-0 z-30 border-b border-[var(--cupertino-border)] bg-[var(--cupertino-sidebar)]/85 backdrop-blur-xl px-4 lg:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* SELETOR INTELIGENTE CUPERTINO DE PERÍODO (Sprint 40.2) */}
              <div className="relative" ref={periodDropdownRef}>
                <button
                  type="button"
                  onClick={() => setPeriodDropdownOpen((prev) => !prev)}
                  aria-expanded={periodDropdownOpen}
                  aria-haspopup="true"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[var(--cupertino-card)] hover:bg-[var(--cupertino-card-hover)] border border-[var(--cupertino-border)] text-xs text-white font-bold outline-none flex items-center gap-2 cursor-pointer transition shadow-sm select-none"
                  title="Alterar período de visualização"
                >
                  <div className="flex items-center gap-1.5 truncate max-w-[210px] sm:max-w-[280px]">
                    {selectedMonth === "ALL" ? (
                      <Globe className="w-3.5 h-3.5 text-[#0A84FF] shrink-0" />
                    ) : selectedMonth === "LAST_30_DAYS" ? (
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : selectedMonth === "THIS_YEAR" ? (
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    ) : selectedMonth === "CUSTOM" ? (
                      <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Calendar className="w-3.5 h-3.5 text-[#0A84FF] shrink-0" />
                    )}
                    <span className="truncate">{selectedPeriodLabel}</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      periodDropdownOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Popover */}
                {periodDropdownOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-[var(--cupertino-border)] shadow-2xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150 text-xs"
                  >
                    {/* 1. Opção Principal em Destaque: TODOS */}
                    <div>
                      <button
                        type="button"
                        onClick={() => handleSelectPeriod("ALL")}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          selectedMonth === "ALL"
                            ? "bg-[#0A84FF]/20 border-[#0A84FF]/50 text-white shadow-sm"
                            : "bg-white/5 hover:bg-white/10 text-slate-200 border-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🌐</span>
                          <div className="text-left">
                            <span className="block font-bold">Todos (Histórico Completo)</span>
                            <span className="block text-[10px] text-slate-400 font-normal">
                              Visualizar todos os lançamentos sem restrição de data
                            </span>
                          </div>
                        </div>
                        {selectedMonth === "ALL" && (
                          <div className="w-5 h-5 rounded-full bg-[#0A84FF] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    </div>

                    {/* 2. Seção de Períodos Rápidos */}
                    <div className="space-y-1.5 pt-1 border-t border-white/5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Períodos Rápidos
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {/* Mês Atual */}
                        <button
                          type="button"
                          onClick={() => handleSelectPeriod(currentCalendarDate.yearMonth)}
                          className={`py-1.5 px-2 rounded-lg text-center transition cursor-pointer border ${
                            selectedMonth === currentCalendarDate.yearMonth
                              ? "bg-[#0A84FF] text-white border-[#0A84FF] font-bold shadow-sm"
                              : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-white/5 font-medium"
                          }`}
                        >
                          <span className="block text-[11px] truncate">Mês Atual</span>
                          <span className="block text-[9px] opacity-70 truncate">
                            {formatMonthFullLabel(currentCalendarDate.yearMonth).split("/")[0].trim()}
                          </span>
                        </button>

                        {/* Últimos 30 Dias */}
                        <button
                          type="button"
                          onClick={() => handleSelectPeriod("LAST_30_DAYS")}
                          className={`py-1.5 px-2 rounded-lg text-center transition cursor-pointer border ${
                            selectedMonth === "LAST_30_DAYS"
                              ? "bg-[#0A84FF] text-white border-[#0A84FF] font-bold shadow-sm"
                              : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-white/5 font-medium"
                          }`}
                        >
                          <span className="block text-[11px] truncate">Últimos 30 Dias</span>
                          <span className="block text-[9px] opacity-70 truncate">Móvel</span>
                        </button>

                        {/* Este Ano */}
                        <button
                          type="button"
                          onClick={() => handleSelectPeriod("THIS_YEAR")}
                          className={`py-1.5 px-2 rounded-lg text-center transition cursor-pointer border ${
                            selectedMonth === "THIS_YEAR"
                              ? "bg-[#0A84FF] text-white border-[#0A84FF] font-bold shadow-sm"
                              : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-white/5 font-medium"
                          }`}
                        >
                          <span className="block text-[11px] truncate">Este Ano</span>
                          <span className="block text-[9px] opacity-70 truncate">{currentCalendarDate.year}</span>
                        </button>
                      </div>
                    </div>

                    {/* 3. Seção de Meses Específicos */}
                    <div className="space-y-1.5 pt-1 border-t border-white/5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Meses Específicos
                      </span>
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {availableMonths.map((ym) => {
                          const isSelected = selectedMonth === ym;
                          const isCurrent = ym === currentCalendarDate.yearMonth;
                          const isFuture = ym > currentCalendarDate.yearMonth;
                          const label = formatMonthFullLabel(ym);

                          return (
                            <button
                              key={ym}
                              type="button"
                              onClick={() => handleSelectPeriod(ym)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer border ${
                                isSelected
                                  ? "bg-[#0A84FF]/20 border-[#0A84FF]/50 text-white font-bold"
                                  : "bg-transparent hover:bg-white/5 text-slate-300 border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="truncate">{label}</span>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                                    Atual
                                  </span>
                                )}
                                {isFuture && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25 text-[9px] font-medium">
                                    Futuro
                                  </span>
                                )}
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#0A84FF] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 4. Modo Data Personalizada (Custom Range) */}
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <SlidersHorizontal className="w-3 h-3 text-[#0A84FF]" /> Intervalo Personalizado
                        </span>
                        {selectedMonth === "CUSTOM" && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomStartDate("");
                              setCustomEndDate("");
                              handleSelectPeriod("ALL");
                            }}
                            className="text-[10px] text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Limpar
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-1">De (Data Inicial):</label>
                          <SmartDateInputBR
                            value={customStartDate}
                            onChange={(dateBR) => setCustomStartDate(dateBR)}
                            className="text-xs py-1.5 px-2 bg-slate-950/80 border-white/10 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-1">Até (Data Final):</label>
                          <SmartDateInputBR
                            value={customEndDate}
                            onChange={(dateBR) => setCustomEndDate(dateBR)}
                            className="text-xs py-1.5 px-2 bg-slate-950/80 border-white/10 rounded-lg text-white"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleApplyCustomRange}
                        disabled={!customStartDate && !customEndDate}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#0A84FF] hover:bg-[#0A84FF]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Filter className="w-3.5 h-3.5" />
                        <span>Aplicar Intervalo por Data</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Indicador de Sincronização em Tempo Real (Sprint 22 & 46) */}
                <div
                  className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium backdrop-blur-md transition-all duration-300 ${syncIndicator.color}`}
                  title={
                    syncIndicator.timestamp
                      ? `${syncIndicator.label} — Última sync: ${syncIndicator.timestamp}`
                      : syncIndicator.label
                  }
                >
                  {syncIndicator.icon}
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
                    className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 relative transition flex items-center justify-center cursor-pointer living-bell"
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

                      <SlidingSegmentedControl
                        options={[
                          { id: "unread", label: `Pendentes (${unreadNotifications.length})` },
                          { id: "viewed", label: `Visualizadas (${viewedNotifications.length})` }
                        ]}
                        value={bellViewMode}
                        onChange={(val) => setBellViewMode(val as "unread" | "viewed")}
                        size="xs"
                        fullWidth
                        activeColor="bg-[#0A84FF]"
                      />

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

                {/* BOTÃO NOVO LANÇAMENTO COMPACTO */}
                <button
                  type="button"
                  onClick={() => handleOpenNewTxModal()}
                  className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-[#0A84FF] hover:bg-[#0070E0] text-white flex items-center justify-center transition cursor-pointer shadow-sm apple-press"
                  title="Novo Lançamento"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

        {/* CORPO PRINCIPAL */}
        <main ref={mainScrollRef} className="max-w-7xl mx-auto px-4 lg:px-8 py-6 pb-24 bg-[var(--cupertino-bg)]">
          {activeTab === "dashboard" ? (
            <div key="tab-dashboard" className="space-y-6 animate-cupertino-in">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-white tracking-tight">Painel Executivo Coindex</h2>
                  <p className="text-xs text-slate-400">
                    Arraste pelo ícone de grade para reordenar, alterne o tamanho (1/2 ou 1/1) ou configure cada gráfico na engrenagem.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-[#0A84FF]" />
                    <SlidingSegmentedControl
                      options={[
                        { id: "ALL", label: "Todos" },
                        { id: "FIXO", label: "Fixos" },
                        { id: "VARIAVEL", label: "Variáveis" },
                        { id: "CARTAO", label: "Cartão" },
                        { id: "PIX", label: "PIX" }
                      ]}
                      value={quickFilter}
                      onChange={(val) => setQuickFilter(val as QuickFilterType)}
                      size="xs"
                      activeColor="bg-[#0A84FF]"
                    />
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

              {/* ZONA 1 ANCORADA: Resumo Financeiro do Mês (4 Slim KPI Cards com Mini-Sparklines SVG) */}
              <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-white/5">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#0A84FF]" />
                      {selectedMonth === "ALL"
                        ? "Resumo Financeiro — Histórico Geral"
                        : selectedMonth === "THIS_YEAR"
                        ? `Resumo Financeiro — Ano ${currentCalendarDate.year}`
                        : selectedMonth === "LAST_30_DAYS"
                        ? "Resumo Financeiro — Últimos 30 Dias"
                        : selectedMonth === "CUSTOM"
                        ? "Resumo Financeiro — Intervalo Personalizado"
                        : "Resumo Financeiro do Mês"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedMonth === "ALL" || selectedMonth === "THIS_YEAR" || selectedMonth === "LAST_30_DAYS" || selectedMonth === "CUSTOM"
                        ? "Consolidado geral de todas as entradas, despesas operacionais e patrimônio guardado"
                        : "Visão executiva com tendências históricas de 6 meses (sparklines)"}
                    </p>
                  </div>

                  {/* Barra de controle: Seletor de Regime Contábil */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>Regime:</span>
                      <div className="relative group/tip inline-flex items-center hover:z-[9999]">
                        <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200 transition-colors cursor-help" />
                        <div className="absolute top-full right-0 mt-1.5 hidden group-hover/tip:flex flex-col z-[9999] w-64 p-2.5 rounded-xl bg-slate-900/95 border border-white/15 text-[11px] normal-case tracking-normal text-slate-300 shadow-2xl backdrop-blur-md pointer-events-none">
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
                    <SlidingSegmentedControl
                      options={[
                        { id: "competencia", label: "Competência" },
                        { id: "caixa", label: "Caixa" }
                      ]}
                      value={accountingRegime}
                      onChange={(val) => setAccountingRegime(val as "competencia" | "caixa")}
                      size="xs"
                      activeColor="bg-[#0A84FF]"
                    />
                  </div>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${moneyBlur}`}>
                  {/* Card 1: Entradas */}
                  <div
                    onClick={() => setActiveKpiAudit("INCOME")}
                    className="kpi-slim-card px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-[#30D158]/10 via-slate-900/80 to-slate-950 border border-[#30D158]/20 flex flex-col justify-between shadow-sm relative overflow-hidden group cupertino-card-hover cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="kpi-title">{selectedMonth === "ALL" || selectedMonth === "THIS_YEAR" || selectedMonth === "LAST_30_DAYS" || selectedMonth === "CUSTOM" ? "Entradas Totais (Geral)" : "Entradas do Mês"}</span>
                          <div className="relative group/tip inline-flex items-center hover:z-[9999]" onClick={(e) => e.stopPropagation()}>
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
                      <p className="kpi-val-income text-lg sm:text-xl font-semibold tracking-[-0.03em] tabular-nums text-[#30D158] leading-tight mt-0.5">
                        +<AnimatedBRL value={monthSummary.income} />
                      </p>
                    </div>
                    <div className="pt-1.5 mt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 tabular-nums">
                      {selectedMonth === "ALL" || selectedMonth === "THIS_YEAR" || selectedMonth === "LAST_30_DAYS" || selectedMonth === "CUSTOM" ? (
                        <span>Média mensal: {formatBRL(monthSummary.income / filterMonthsCount)}</span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#30D158]" />
                          {monthSummary.incomeDiff >= 0
                            ? `+${monthSummary.incomeDiff}%`
                            : `${monthSummary.incomeDiff}%`}{" "}
                          vs. anterior
                        </span>
                      )}
                      <SparklineSvg data={kpiSparklines.income} color="#30D158" className="w-14 h-6 opacity-80" />
                    </div>
                  </div>

                  {/* Card 2: Saídas & Despesas */}
                  <div
                    onClick={() => setActiveKpiAudit("EXPENSE")}
                    className="kpi-slim-card px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-[#FF453A]/10 via-slate-900/80 to-slate-950 border border-[#FF453A]/20 flex flex-col justify-between shadow-sm relative overflow-hidden group cupertino-card-hover cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="kpi-title">{selectedMonth === "ALL" || selectedMonth === "THIS_YEAR" || selectedMonth === "LAST_30_DAYS" || selectedMonth === "CUSTOM" ? "Saídas & Despesas (Geral)" : "Saídas & Despesas"}</span>
                          <div className="relative group/tip inline-flex items-center hover:z-[9999]" onClick={(e) => e.stopPropagation()}>
                            <Info className="w-3 h-3 text-slate-400 hover:text-slate-200 transition-colors cursor-help" />
                            <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/tip:flex flex-col z-[9999] w-56 p-2 rounded-xl bg-slate-900/95 border border-[#FF453A]/30 text-[11px] normal-case tracking-normal text-slate-300 shadow-2xl backdrop-blur-md pointer-events-none">
                              <strong className="text-[#FF453A] mb-0.5">Fórmula de Saídas:</strong>
                              <span>Soma de débitos e faturas (FlowType = EXPENSE), deduzindo recebimentos de empréstimo e reembolsos como crédito.</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-1 rounded-lg bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/25">
                          <TrendingDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <p className="kpi-val-expense text-lg sm:text-xl font-semibold tracking-[-0.03em] tabular-nums text-[#FF453A] leading-tight mt-0.5">
                        -<AnimatedBRL value={monthSummary.expense} />
                      </p>
                    </div>
                    <div className="pt-1.5 mt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 tabular-nums">
                      {selectedMonth === "ALL" || selectedMonth === "THIS_YEAR" || selectedMonth === "LAST_30_DAYS" || selectedMonth === "CUSTOM" ? (
                        <span>Média mensal: {formatBRL(monthSummary.expense / filterMonthsCount)}</span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <ArrowDownRight className="w-3.5 h-3.5 text-[#FF453A]" />
                          {monthSummary.expenseDiff >= 0
                            ? `+${monthSummary.expenseDiff}%`
                            : `${monthSummary.expenseDiff}%`}{" "}
                          vs. anterior
                        </span>
                      )}
                      <SparklineSvg data={kpiSparklines.expense} color="#FF453A" className="w-14 h-6 opacity-80" />
                    </div>
                  </div>

                  {/* Card 3: Aportes Brutos */}
                  <div
                    onClick={() => setActiveKpiAudit("INVESTMENT")}
                    className="kpi-slim-card px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-[#0A84FF]/10 via-slate-900/80 to-slate-950 border border-[#0A84FF]/20 flex flex-col justify-between shadow-sm relative overflow-hidden group cupertino-card-hover cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="kpi-title">{selectedMonth === "ALL" || selectedMonth === "THIS_YEAR" || selectedMonth === "LAST_30_DAYS" || selectedMonth === "CUSTOM" ? "Aportes Brutos (Geral)" : "Aportes no Mês"}</span>
                          <div className="relative group/tip inline-flex items-center hover:z-[9999]" onClick={(e) => e.stopPropagation()}>
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
                      <p className="kpi-val-invest text-lg sm:text-xl font-semibold tracking-[-0.03em] tabular-nums text-[#0A84FF] leading-tight mt-0.5">
                        +<AnimatedBRL value={monthSummary.aportes} />
                      </p>
                    </div>
                    <div className="pt-1.5 mt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 tabular-nums">
                      {selectedMonth === "ALL" || selectedMonth === "THIS_YEAR" || selectedMonth === "LAST_30_DAYS" || selectedMonth === "CUSTOM" ? (
                        <span className="truncate" title={`Em Reserva (Líquido): ${formatBRL(allTimeReserva.liquido)}`}>
                          Reserva: <strong className="text-white">{formatBRL(allTimeReserva.liquido)}</strong>
                        </span>
                      ) : (
                        <span>Meta: {formatBRL(monthlyInvestmentGoal)}</span>
                      )}
                      <SparklineSvg data={kpiSparklines.aportes} color="#0A84FF" className="w-14 h-6 opacity-80" />
                    </div>
                  </div>

                  {/* Card 4: Saldo Livre Líquido */}
                  <div
                    onClick={() => setActiveKpiAudit("BALANCE")}
                    className="kpi-slim-card px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-[#64D2FF]/10 via-slate-900/80 to-slate-950 border border-[#64D2FF]/20 flex flex-col justify-between shadow-sm relative overflow-hidden group cupertino-card-hover cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="kpi-title">{selectedMonth === "ALL" || selectedMonth === "THIS_YEAR" || selectedMonth === "LAST_30_DAYS" || selectedMonth === "CUSTOM" ? "Balanço Operacional Líquido" : "Saldo Livre Líquido"}</span>
                          <div className="relative group/tip inline-flex items-center hover:z-[9999]" onClick={(e) => e.stopPropagation()}>
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
                        className={`kpi-val-balance text-lg sm:text-xl font-semibold tracking-[-0.03em] tabular-nums leading-tight mt-0.5 ${
                          monthSummary.balance >= 0 ? "text-[#30D158]" : "text-[#FF453A]"
                        }`}
                      >
                        {monthSummary.balance >= 0 ? "+" : ""}<AnimatedBRL value={monthSummary.balance} />
                      </p>
                    </div>

                    <div className="pt-1.5 mt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] tabular-nums">
                      {selectedMonth === "ALL" || selectedMonth === "THIS_YEAR" || selectedMonth === "LAST_30_DAYS" || selectedMonth === "CUSTOM" ? (
                        <div className="flex items-center gap-2 text-slate-400 font-sans">
                          <span className="truncate" title={`Em Reserva (Líquido): ${formatBRL(allTimeReserva.liquido)}`}>
                            Caixinhas: <strong className="text-white">{formatBRL(allTimeReserva.liquido)}</strong>
                          </span>
                          <span>•</span>
                          <div className="flex items-center gap-1 text-slate-400">
                            <Sparkles className="w-3 h-3 text-[#0A84FF] shrink-0" />
                            <span>Safe:</span>
                            <span
                              className={`font-semibold px-1 py-0.2 rounded text-[10px] border tabular-nums ${
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
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400 font-sans">
                          <Sparkles className="w-3 h-3 text-[#0A84FF] shrink-0" />
                          <span>Safe:</span>
                          <span
                            className={`font-semibold px-1 py-0.2 rounded text-[10px] border tabular-nums ${
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
                      <SparklineSvg data={kpiSparklines.balance} color="#64D2FF" className="w-14 h-6 opacity-80" />
                    </div>
                  </div>
                </div>
              </div>

              {/* GRID UNIFICADO 100% ORDENÁVEL (SPRINT 32) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {effectiveDashboardLayout
                  .filter((w) => w.visible !== false && w.id !== "kpis")
                  .map((widget) => {
                    const defaultSize: ChartWidgetSize =
                      widget.id === "patrimony" || widget.id === "patrimony_chart"
                        ? "two-thirds"
                        : widget.id === "wallet_limits" || widget.id === "wallet_card"
                        ? "third"
                        : widget.id === "thermometer" || widget.id === "thermometer_card"
                        ? "full"
                        : "half";
                    const widgetSize: ChartWidgetSize = widget.size ?? defaultSize;

                    const chartKind: ChartKind =
                      widget.id === "patrimony" || widget.id === "patrimony_chart"
                        ? "area"
                        : widget.id === "expenses" || widget.id === "category_chart"
                        ? "pie"
                        : widget.id === "cashflow_recents" || widget.id === "cashflow_recent"
                        ? "bar"
                        : "kpi";

                    const cfg = getWidgetSettings(widget.id, "auto", curveType);
                    const primarySeriesColor = (fallbackHex: string) =>
                      cfg.color && cfg.color !== "auto" ? cfg.color : fallbackHex;

                    const effectiveChartType =
                      cfg.chartType ||
                      (widget.id === "patrimony" || widget.id === "patrimony_chart"
                        ? "area"
                        : widget.id === "expenses" || widget.id === "category_chart"
                        ? "pie"
                        : "bar");

                    const primaryColor =
                      cfg.color && cfg.color !== "auto"
                        ? cfg.color
                        : widget.id === "patrimony" || widget.id === "patrimony_chart"
                        ? "#0A84FF"
                        : widget.id === "wallet_limits" || widget.id === "wallet_card"
                        ? "#5E5CE6"
                        : "#30D158";

                    const personalPct = Math.min(
                      100,
                      Math.round((monthSummary.personalSpent / Math.max(1, effectivePersonalBudgetLimit)) * 100)
                    );
                    const totalExpenses = Math.max(1, categoryChartData.reduce((a, b) => a + b.value, 0));

                    const processedPatrimonyData = applyZeroHandling(
                      filteredPatrimonyChartData as unknown as Array<Record<string, unknown>>,
                      ["acumulado", "aportado", "resgatado", "capitalAportadoPuro", "rendimentoBruto", "acumuladoComRendimento"],
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
                          widget.id === "patrimony" ||
                          widget.id === "patrimony_chart" ||
                          widget.id === "wallet_limits" ||
                          widget.id === "wallet_card" ||
                          widget.id === "expenses" ||
                          widget.id === "category_chart" ||
                          widget.id === "cashflow_recents" ||
                          widget.id === "cashflow_recent"
                        }
                        size={widgetSize}
                        onSizeChange={(nextSize) => handleUpdateWidgetSize(widget.id, nextSize)}
                        settings={cfg}
                        defaultSettings={{ color: "auto", curveType }}
                        onSettingsChange={(nextCfg) => handleUpdateWidgetSettings(widget.id, nextCfg)}
                        onCustomGearClick={
                          widget.id === "wallet_limits" || widget.id === "wallet_card"
                            ? () => setShowReorderCardsModal(true)
                            : undefined
                        }
                        customGearTitle={
                          widget.id === "wallet_limits" || widget.id === "wallet_card"
                            ? "⚙️ Ordenar Meus Cartões"
                            : undefined
                        }
                        onDragStartCard={handleDragStartWidget}
                        onDragEnterCard={handleDragEnterWidget}
                        onDragEndCard={handleDragEndWidget}
                        isDragging={draggingWidgetId === widget.id}
                        isDropTarget={dragOverWidgetId === widget.id}
                        className="glass-card"
                      >
                        {/* WIDGET 1: TERMÔMETRO + COTA DIÁRIA + ALOCAÇÃO 50/30/20 */}
                        {(widget.id === "thermometer" || widget.id === "thermometer_card") && (
                          <div className="space-y-4">
                            {/* Linha Superior: Status do Teto + Pílula Copilot de Cota Diária Livre */}
                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                              <div className="flex flex-wrap items-center gap-2.5">
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

                                {/* Pílula Copilot Money: Cota Diária Livre (R$/dia) */}
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A84FF]/15 border border-[#0A84FF]/30 text-[#64D2FF] text-xs font-semibold shadow-xs">
                                  <Zap className="w-3.5 h-3.5 text-[#0A84FF] shrink-0" />
                                  <span>
                                    Cota Diária Livre:{" "}
                                    <strong className={`font-mono text-white tabular-nums ${moneyBlur}`}>
                                      {formatBRL(dailyQuotaInfo.dailyBudget)} / dia
                                    </strong>
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-sans font-normal">
                                    ({dailyQuotaInfo.remainingDays} {dailyQuotaInfo.remainingDays === 1 ? "dia rest." : "dias rest."})
                                  </span>
                                </div>
                              </div>

                              <div className="text-right flex items-baseline gap-1 justify-end">
                                <span className="text-slate-400 text-xs mr-1">Gasto Pessoal:</span>
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
                            </div>

                            {/* Barra de Progresso do Teto Pessoal com Superfície Líquida 144Hz */}
                            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
                              <div
                                className={`h-full rounded-full transition-all duration-700 relative liquid-progress-shimmer ${
                                  personalPct >= 100
                                    ? "bg-gradient-to-r from-amber-500 to-rose-600"
                                    : "bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500"
                                }`}
                                style={{ width: `${personalPct}%` }}
                              >
                                <span className="liquid-progress-head" />
                              </div>
                            </div>

                            {/* Barra Segmentada da Alocação Real 50/30/20 */}
                            <div className="pt-2 border-t border-white/5 space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1.5">
                                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#0A84FF]" /> Alocação Real 50/30/20
                                </span>
                                <div className="flex flex-wrap items-center gap-3 text-[11px] tabular-nums font-mono">
                                  <span className="flex items-center gap-1 text-[#0A84FF]">
                                    <span className="w-2 h-2 rounded-full bg-[#0A84FF]" />
                                    Fixos: <strong>{allocation503020.pctFixed}%</strong> (Meta 50%) • {formatBRL(allocation503020.fixedTotal)}
                                  </span>
                                  <span className="flex items-center gap-1 text-[#FF9F0A]">
                                    <span className="w-2 h-2 rounded-full bg-[#FF9F0A]" />
                                    Variáveis: <strong>{allocation503020.pctVariable}%</strong> (Meta 30%) • {formatBRL(allocation503020.variableTotal)}
                                  </span>
                                  <span className="flex items-center gap-1 text-[#30D158]">
                                    <span className="w-2 h-2 rounded-full bg-[#30D158]" />
                                    Aportes: <strong>{allocation503020.pctInvest}%</strong> (Meta 20%) • {formatBRL(allocation503020.investTotal)}
                                  </span>
                                </div>
                              </div>

                              <div className="w-full h-2 rounded-full overflow-hidden bg-slate-950 border border-white/10 flex gap-0.5 p-0.5">
                                <div
                                  className="h-full rounded-l-full bg-[#0A84FF] transition-all duration-500"
                                  style={{ width: `${Math.min(100, allocation503020.pctFixed)}%` }}
                                  title={`Custos Fixos: ${allocation503020.pctFixed}%`}
                                />
                                <div
                                  className="h-full bg-[#FF9F0A] transition-all duration-500"
                                  style={{ width: `${Math.min(100, allocation503020.pctVariable)}%` }}
                                  title={`Gastos Variáveis: ${allocation503020.pctVariable}%`}
                                />
                                <div
                                  className="h-full rounded-r-full bg-[#30D158] transition-all duration-500"
                                  style={{ width: `${Math.min(100, allocation503020.pctInvest)}%` }}
                                  title={`Aportes/Investimentos: ${allocation503020.pctInvest}%`}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* WIDGET 2: CENTRAL ANALÍTICA MULTI-VIEW (Patrimônio, Ritmo/Pace e Projeção 6M) */}
                        {(widget.id === "patrimony" || widget.id === "patrimony_chart") && (
                          <div className="space-y-4 flex-1 flex flex-col justify-between">
                            {/* Segmented Control de 3 Visões Analíticas Estilo Copilot Money com Sliding Pill */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/5">
                              <SlidingSegmentedControl
                                options={[
                                  { id: "patrimony", label: "Patrimônio", icon: <TrendingUp className="w-3.5 h-3.5" /> },
                                  { id: "pace", label: "Ritmo no Mês", icon: <Activity className="w-3.5 h-3.5" /> },
                                  { id: "forecast", label: "Projeção 6M", icon: <CalendarRange className="w-3.5 h-3.5" /> }
                                ]}
                                value={patrimonyCardView}
                                onChange={(val) => setPatrimonyCardView(val as "patrimony" | "pace" | "forecast")}
                                size="xs"
                                activeColor="bg-[#0A84FF]"
                              />

                              {patrimonyCardView === "patrimony" && (
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Seletor de Período Deslizante */}
                                  <SlidingSegmentedControl
                                    options={[
                                      { id: "6M", label: "6M" },
                                      { id: "1A", label: "1A" },
                                      { id: "ALL", label: "Tudo" }
                                    ]}
                                    value={patrimonyTimeRange}
                                    onChange={(val) => setPatrimonyTimeRange(val as "6M" | "1A" | "ALL")}
                                    size="xs"
                                    activeColor="bg-[#0A84FF]"
                                  />

                                  {/* Toggle Clicável de Aportes Brutos */}
                                  <button
                                    type="button"
                                    onClick={() => setShowPatrimonyAportesCurve((prev) => !prev)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer border ${
                                      showPatrimonyAportesCurve
                                        ? "bg-[#5E5CE6]/20 text-[#A5B4FC] border-[#5E5CE6]/50 shadow-sm"
                                        : "bg-slate-900/60 text-slate-400 border-white/5 opacity-70 hover:opacity-100"
                                    }`}
                                    title="Ligar ou desligar curva de Aportes"
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full shrink-0 transition ${
                                        showPatrimonyAportesCurve ? "bg-[#5E5CE6]" : "bg-slate-600"
                                      }`}
                                    />
                                    <span>Aportes {showPatrimonyAportesCurve ? "" : "(oculto)"}</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* ABA 1: VISÃO PATRIMÔNIO ACUMULADO */}
                            {patrimonyCardView === "patrimony" && (
                              <div key="patrimony-view" className="space-y-3 flex-1 flex flex-col justify-between animate-cupertino-in">
                                {patrimonyEvolution.hasDeficit && (
                                  <div className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-pulse">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                      <span>
                                        <strong className="text-rose-200">Aviso de Déficit:</strong> Resgates superam aportes em{" "}
                                        <span className="font-mono font-bold text-white">{formatBRL(patrimonyEvolution.deficitAmount)}</span>.
                                      </span>
                                    </div>
                                  </div>
                                )}

                                <div className="flex flex-wrap items-center gap-2.5">
                                  <div className="flex flex-wrap items-baseline gap-2">
                                    <span className={`text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight ${moneyBlur}`}>
                                      <AnimatedBRL value={patrimonyStats.currentValue} />
                                    </span>
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-mono font-bold tabular-nums border ${
                                        patrimonyStats.isPositive
                                          ? "bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30"
                                          : "bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30"
                                      }`}
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

                                  {/* SPRINT 30 & 46: Badge Cupertino com Rendimento CDI Oficial BCB */}
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-xs">
                                    <span className="relative flex h-2 w-2 mr-0.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                    </span>
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>
                                      +<AnimatedBRL value={yieldMode === "liquido" ? (patrimonyEvolution.netYieldEstimated || 0) : (patrimonyEvolution.grossYieldAccumulated || 0)} /> de Rendimento
                                    </span>
                                    <span className="text-[10px] text-emerald-400/80 font-normal">
                                      ({patrimonyEvolution.appliedCdiPercentage || 115}% CDI • BCB Ao Vivo)
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setShowAdjustmentInput((prev) => !prev)}
                                      title="Calibrar Ajuste de Saldo Real do App (Nubank/BTG)"
                                      className="ml-1 text-emerald-400/70 hover:text-white cursor-pointer transition p-0.5 apple-press"
                                    >
                                      <SlidersHorizontal className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* SPRINT 30 / SPRINT 49: Toggle Rápido [Bruto | Líquido IR | Só Aportes] Deslizante */}
                                  <SlidingSegmentedControl
                                    options={[
                                      { id: "bruto", label: "Bruto" },
                                      { id: "liquido", label: "Líquido IR" },
                                      { id: "aportes", label: "Só Aportes" }
                                    ]}
                                    value={yieldMode}
                                    onChange={(val) => handleSetYieldMode(val as "bruto" | "liquido" | "aportes")}
                                    size="xs"
                                    activeColor="bg-[#0A84FF]"
                                    className="sm:ml-auto"
                                  />
                                </div>

                                {showAdjustmentInput && (
                                  <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs">
                                    <span className="text-slate-300 font-semibold text-[11px] shrink-0">
                                      Ajuste de Saldo Real do App (Nubank/BTG):
                                    </span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      placeholder="Ex: 0.00 ou -12.50"
                                      defaultValue={manualAdjustment || ""}
                                      id="patrimonyManualAdjustmentInput"
                                      className="w-32 px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs outline-none focus:border-emerald-400"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const el = document.getElementById("patrimonyManualAdjustmentInput") as HTMLInputElement;
                                        const val = parseFloat(el?.value) || 0;
                                        handleSaveManualAdjustment(val);
                                        setShowAdjustmentInput(false);
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 font-semibold cursor-pointer text-xs"
                                    >
                                      Salvar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setShowAdjustmentInput(false)}
                                      className="px-2 py-1 text-slate-400 hover:text-white text-xs cursor-pointer"
                                    >
                                      Fechar
                                    </button>
                                  </div>
                                )}

                                <div className="w-full select-none transition-all duration-300" style={{ height: `${getChartHeightPx("patrimony", 175)}px` }}>
                                  <ResponsiveContainer width="100%" height="100%">
                                    {effectiveChartType === "line" ? (
                                      <LineChart
                                        data={processedPatrimonyData}
                                        accessibilityLayer={false}
                                        margin={{ top: 12, right: 12, left: 4, bottom: 0 }}
                                      >
                                        {cfg.showGrid && (
                                          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                                        )}
                                        <XAxis dataKey="label" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} tickMargin={10} />
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
                                        <Tooltip content={<PatrimonyCyberTooltip moneyBlur={moneyBlur} cdiPercentage={patrimonyEvolution.appliedCdiPercentage || 115} />} cursor={false} />
                                        {milestones.map((m) => (
                                          <ReferenceLine key={m.id} y={m.value} stroke={m.color} strokeDasharray="3 3" />
                                        ))}
                                        <Line
                                          type={cfg.curveType || "monotone"}
                                          dataKey="acumulado"
                                          name={yieldMode === "aportes" ? "Capital Aportado" : "Patrimônio Total c/ CDI"}
                                          stroke={primaryColor}
                                          strokeWidth={cfg.strokeWidth || 2.5}
                                          dot={cfg.showDots ? { r: 3.5, fill: primaryColor, stroke: "#07030f", strokeWidth: 1.5 } : false}
                                          activeDot={{ r: 5, strokeWidth: 2, stroke: primaryColor, fill: "#0d061c" }}
                                          connectNulls={true}
                                        />
                                        {yieldMode !== "aportes" && (
                                          <Line
                                            type={cfg.curveType || "monotone"}
                                            dataKey="capitalAportadoPuro"
                                            name="Capital Aportado Puro"
                                            stroke="#5E5CE6"
                                            strokeWidth={Math.max(1.5, (cfg.strokeWidth || 2.5) - 0.5)}
                                            strokeDasharray="4 4"
                                            dot={cfg.showDots ? { r: 3, fill: "#5E5CE6", stroke: "#07030f", strokeWidth: 1.5 } : false}
                                            activeDot={{ r: 4, stroke: "#5E5CE6", fill: "#0d061c" }}
                                            connectNulls={true}
                                          />
                                        )}
                                        {showPatrimonyAportesCurve && (
                                          <Line
                                            type={cfg.curveType || "monotone"}
                                            dataKey="aportado"
                                            name="Aportes no Mês"
                                            stroke="#30D158"
                                            strokeWidth={Math.max(1.5, (cfg.strokeWidth || 2.5) - 0.5)}
                                            strokeDasharray="2 2"
                                            dot={cfg.showDots ? { r: 2.5, fill: "#30D158", stroke: "#07030f", strokeWidth: 1 } : false}
                                            activeDot={{ r: 3.5, stroke: "#30D158", fill: "#0d061c" }}
                                            connectNulls={true}
                                          />
                                        )}
                                      </LineChart>
                                    ) : (
                                      <AreaChart
                                        data={processedPatrimonyData}
                                        accessibilityLayer={false}
                                        margin={{ top: 12, right: 12, left: 4, bottom: 0 }}
                                      >
                                        <defs>
                                          <linearGradient id={`gradPatrimony_${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={primaryColor} stopOpacity={cfg.fillArea !== false ? 0.32 : 0} />
                                            <stop offset="100%" stopColor={primaryColor} stopOpacity={0.00} />
                                          </linearGradient>
                                          <linearGradient id={`gradCapitalPuro_${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#5E5CE6" stopOpacity={cfg.fillArea !== false ? 0.18 : 0} />
                                            <stop offset="100%" stopColor="#5E5CE6" stopOpacity={0.00} />
                                          </linearGradient>
                                          <linearGradient id={`gradAporte_${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#30D158" stopOpacity={cfg.fillArea !== false ? 0.12 : 0} />
                                            <stop offset="100%" stopColor="#30D158" stopOpacity={0.00} />
                                          </linearGradient>
                                        </defs>
                                        {cfg.showGrid && (
                                          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                                        )}
                                        <XAxis dataKey="label" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} tickMargin={10} />
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
                                        <Tooltip content={<PatrimonyCyberTooltip moneyBlur={moneyBlur} cdiPercentage={patrimonyEvolution.appliedCdiPercentage || 115} />} cursor={false} />
                                        {milestones.map((m) => (
                                          <ReferenceLine key={m.id} y={m.value} stroke={m.color} strokeDasharray="3 3" />
                                        ))}
                                        <Area
                                          type={cfg.curveType || "monotone"}
                                          dataKey="acumulado"
                                          name={yieldMode === "aportes" ? "Capital Aportado" : "Patrimônio Total c/ CDI"}
                                          stroke={primaryColor}
                                          strokeWidth={cfg.strokeWidth || 2.5}
                                          dot={cfg.showDots ? { r: 3.5, fill: primaryColor, stroke: "#07030f", strokeWidth: 1.5 } : false}
                                          activeDot={{ r: 5, strokeWidth: 2, stroke: primaryColor, fill: "#0d061c" }}
                                          fill={cfg.fillArea !== false ? `url(#gradPatrimony_${widget.id})` : "none"}
                                          fillOpacity={1}
                                          connectNulls={true}
                                        />
                                        {yieldMode !== "aportes" && (
                                          <Area
                                            type={cfg.curveType || "monotone"}
                                            dataKey="capitalAportadoPuro"
                                            name="Capital Aportado Puro"
                                            stroke="#5E5CE6"
                                            strokeWidth={Math.max(1.5, (cfg.strokeWidth || 2.5) - 0.5)}
                                            strokeDasharray="4 4"
                                            dot={cfg.showDots ? { r: 3, fill: "#5E5CE6", stroke: "#07030f", strokeWidth: 1.5 } : false}
                                            activeDot={{ r: 4, stroke: "#5E5CE6", fill: "#0d061c" }}
                                            fill={cfg.fillArea !== false ? `url(#gradCapitalPuro_${widget.id})` : "none"}
                                            fillOpacity={1}
                                            connectNulls={true}
                                          />
                                        )}
                                        {showPatrimonyAportesCurve && (
                                          <Area
                                            type={cfg.curveType || "monotone"}
                                            dataKey="aportado"
                                            name="Aportes no Mês"
                                            stroke="#30D158"
                                            strokeWidth={Math.max(1.5, (cfg.strokeWidth || 2.5) - 0.5)}
                                            strokeDasharray="2 2"
                                            dot={cfg.showDots ? { r: 2.5, fill: "#30D158", stroke: "#07030f", strokeWidth: 1 } : false}
                                            activeDot={{ r: 3.5, stroke: "#30D158", fill: "#0d061c" }}
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

                            {/* ABA 2: CURVA DE RITMO DE GASTOS DIÁRIA (PACE) */}
                            {patrimonyCardView === "pace" && (
                              <div key="pace-view" className="space-y-3 flex-1 flex flex-col justify-between animate-cupertino-in">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                  <div>
                                    <span className="text-slate-400 block text-[11px]">Gasto Real até Hoje:</span>
                                    <strong className={`text-xl font-bold font-mono tabular-nums text-white ${moneyBlur}`}>
                                      {formatBRL(paceChartData.currentReal)}
                                    </strong>
                                    <span className="text-slate-400 text-[11px] ml-2">
                                      (Ritmo Ideal: {formatBRL(paceChartData.currentIdeal)})
                                    </span>
                                  </div>

                                  <span
                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                                      paceChartData.isBelowPace
                                        ? "bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30"
                                        : "bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30"
                                    }`}
                                  >
                                    <Activity className="w-3.5 h-3.5" />
                                    {paceChartData.isBelowPace
                                      ? `-${formatBRL(paceChartData.paceDiff)} abaixo do ritmo (Saudável)`
                                      : `+${formatBRL(paceChartData.paceDiff)} acima do ritmo (Atenção)`}
                                  </span>
                                </div>

                                <div className="w-full select-none transition-all duration-300" style={{ height: `${getChartHeightPx("patrimony", 175)}px` }}>
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                      data={paceChartData.data}
                                      accessibilityLayer={false}
                                      margin={{ top: 12, right: 12, left: 4, bottom: 0 }}
                                    >
                                      <defs>
                                        <linearGradient id="gradPaceReal" x1="0" y1="0" x2="0" y2="1">
                                          <stop
                                            offset="0%"
                                            stopColor={paceChartData.isBelowPace ? "#30D158" : "#FF453A"}
                                            stopOpacity={0.25}
                                          />
                                          <stop
                                            offset="100%"
                                            stopColor={paceChartData.isBelowPace ? "#30D158" : "#FF453A"}
                                            stopOpacity={0.0}
                                          />
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                                      <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                                      <YAxis
                                        stroke="#64748b"
                                        fontSize={11}
                                        width={60}
                                        domain={[0, "auto"]}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `R$ ${Number(v) || 0}`}
                                      />
                                      <Tooltip content={<PaceCyberTooltip moneyBlur={moneyBlur} />} cursor={false} />
                                      <Line
                                        type="linear"
                                        dataKey="ideal"
                                        name="Ritmo Ideal Linear"
                                        stroke="#94A3B8"
                                        strokeDasharray="4 4"
                                        strokeWidth={1.75}
                                        dot={false}
                                      />
                                      <Area
                                        type="monotone"
                                        dataKey="real"
                                        name="Gasto Real Acumulado"
                                        stroke={paceChartData.isBelowPace ? "#30D158" : "#FF453A"}
                                        strokeWidth={2.5}
                                        fill="url(#gradPaceReal)"
                                        dot={false}
                                        connectNulls={false}
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            )}

                            {/* ABA 3: PROJEÇÃO 6 MESES DE COMPROMETIMENTO FUTURO */}
                            {patrimonyCardView === "forecast" && (
                              <div key="forecast-view" className="space-y-3 flex-1 flex flex-col justify-between animate-cupertino-in">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                  <div>
                                    <span className="text-slate-400 block text-[11px]">Comprometimento Médio Futuro:</span>
                                    <strong className={`text-xl font-bold font-mono tabular-nums text-white ${moneyBlur}`}>
                                      {formatBRL(forecast6MData.avgCommitted)} / mês
                                    </strong>
                                    <span className="text-[#0A84FF] text-[11px] font-semibold ml-2">
                                      ({forecast6MData.avgPercent}% da Renda Base)
                                    </span>
                                  </div>

                                  {forecast6MData.peakMonth && (
                                    <div className="text-right text-[11px]">
                                      <span className="text-slate-400 block">Mês de Pico:</span>
                                      <span className="text-amber-400 font-mono font-bold">
                                        {forecast6MData.peakMonth.label} ({formatBRL(forecast6MData.peakMonth.totalCommitted)})
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="w-full select-none transition-all duration-300" style={{ height: `${getChartHeightPx("patrimony", 175)}px` }}>
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                      data={forecast6MData.months}
                                      barSize={32}
                                      accessibilityLayer={false}
                                      margin={{ top: 12, right: 12, left: 4, bottom: 0 }}
                                    >
                                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                                      <XAxis dataKey="label" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                                      <YAxis
                                        stroke="#64748b"
                                        fontSize={11}
                                        width={60}
                                        domain={[0, "auto"]}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => {
                                          const num = Number(v) || 0;
                                          if (num >= 1000) return `R$ ${(num / 1000).toFixed(0)}k`;
                                          return `R$ ${num}`;
                                        }}
                                      />
                                      <Tooltip content={<ForecastCyberTooltip moneyBlur={moneyBlur} />} cursor={false} />
                                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                                      <Bar dataKey="fixedCosts" name="Custos Fixos Ativos" stackId="commit" fill="#0A84FF" />
                                      <Bar dataKey="cardInstallments" name="Parcelas de Cartão" stackId="commit" fill="#FF9F0A" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            )}

                            {/* SPRINT 34: Faixa Executiva de Telemetria Patrimonial (4 Métricas Compactas) */}
                            <div className="mt-auto pt-3.5 border-t border-[var(--cupertino-border)] grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col justify-between">
                                <span className="text-[10px] text-slate-400 font-medium">Média de Aporte/Mês</span>
                                <span className={`text-xs sm:text-sm font-semibold font-mono tabular-nums text-emerald-400 mt-0.5 ${moneyBlur}`}>
                                  {formatBRL(patrimonyTelemetry.avgAporte)}
                                </span>
                              </div>
                              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col justify-between">
                                <span className="text-[10px] text-slate-400 font-medium">Melhor Mês da Série</span>
                                <div className="flex items-baseline gap-1 mt-0.5 truncate">
                                  <span className="text-[10px] sm:text-xs text-slate-300 font-semibold shrink-0">{patrimonyTelemetry.bestMonth.label}:</span>
                                  <span className={`text-xs sm:text-sm font-semibold font-mono tabular-nums text-white truncate ${moneyBlur}`}>
                                    {formatBRL(patrimonyTelemetry.bestMonth.amount)}
                                  </span>
                                </div>
                              </div>
                              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col justify-between">
                                <span className="text-[10px] text-slate-400 font-medium">Rendimento Médio CDI</span>
                                <span className={`text-xs sm:text-sm font-semibold font-mono tabular-nums text-emerald-300 mt-0.5 ${moneyBlur}`}>
                                  +{formatBRL(patrimonyTelemetry.avgYieldMonth)}/mês
                                </span>
                              </div>
                              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col justify-between">
                                <span className="text-[10px] text-slate-400 font-medium">Projeção 12 Meses</span>
                                <span className={`text-xs sm:text-sm font-semibold font-mono tabular-nums text-[#64D2FF] mt-0.5 ${moneyBlur}`}>
                                  {formatBRL(patrimonyTelemetry.projected12M)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* WIDGET 3: PARA ONDE VAI O MEU DINHEIRO 2.0 COM DRILL-DOWN */}
                        {(widget.id === "expenses" || widget.id === "category_chart") && (
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                            {/* Donut Moderno com Rótulo Centralizado Total Gasto - col-span-12 lg:col-span-5 */}
                            <div className="relative select-none flex items-center justify-center lg:col-span-5" style={{ height: `${getChartHeightPx("expenses", 175)}px` }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart accessibilityLayer={false}>
                                  <Pie
                                    data={categoryChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={75}
                                    paddingAngle={4}
                                    cornerRadius={6}
                                    stroke="none"
                                  >
                                    {categoryChartData.map((entry, idx) => (
                                      <Cell
                                        key={`cell-${idx}`}
                                        fill={entry.color}
                                        stroke={donutHoverIndex === idx ? "#FFFFFF" : "none"}
                                        strokeWidth={donutHoverIndex === idx ? 2.5 : 0}
                                        style={{
                                          filter: donutHoverIndex === idx ? `drop-shadow(0 0 8px ${entry.color})` : "none",
                                          transform: donutHoverIndex === idx ? "scale(1.05)" : "none",
                                          transformOrigin: "center center",
                                          transition: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)",
                                          cursor: "pointer"
                                        }}
                                        onMouseEnter={() => setDonutHoverIndex(idx)}
                                        onMouseLeave={() => setDonutHoverIndex(null)}
                                      />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomCyberTooltip isCurrency={true} moneyBlur={moneyBlur} />} cursor={false} />
                                </PieChart>
                              </ResponsiveContainer>

                              {/* Rótulo Central Dinâmico do Donut (Animação #7 Elastic Pull-Out) */}
                              {donutHoverIndex !== null && categoryChartData[donutHoverIndex] ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center select-none animate-cupertino-in">
                                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-300 truncate max-w-[110px]">
                                    {categoryChartData[donutHoverIndex].name}
                                  </span>
                                  <span className={`text-xs sm:text-sm font-extrabold font-mono tabular-nums text-white ${moneyBlur}`}>
                                    {formatBRL(categoryChartData[donutHoverIndex].value)}
                                  </span>
                                  <span
                                    className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full mt-0.5"
                                    style={{
                                      backgroundColor: `${categoryChartData[donutHoverIndex].color}25`,
                                      color: categoryChartData[donutHoverIndex].color
                                    }}
                                  >
                                    {totalExpenses > 0
                                      ? `${((categoryChartData[donutHoverIndex].value / totalExpenses) * 100).toFixed(1)}%`
                                      : "0%"}
                                  </span>
                                </div>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center select-none">
                                  <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">
                                    Total Gasto
                                  </span>
                                  <span className={`text-sm sm:text-base font-extrabold text-white font-mono tabular-nums ${moneyBlur}`}>
                                    <AnimatedBRL value={totalExpenses} />
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* LADO DIREITO: GRID 2 COLUNAS DE CATEGORIAS OU DRILL-DOWN - col-span-12 lg:col-span-7 */}
                            <div className="lg:col-span-7">
                              {selectedCategoryDrillDown && categoryDrillDownData ? (
                                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 text-xs">
                                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedCategoryDrillDown(null)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                                    >
                                      <ArrowLeft className="w-3.5 h-3.5 text-[#0A84FF]" /> Voltar
                                    </button>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                        categoryDrillDownData.diffPercent >= 0
                                          ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                          : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                      }`}
                                    >
                                      {categoryDrillDownData.diffPercent >= 0
                                        ? `+${categoryDrillDownData.diffPercent}%`
                                        : `${categoryDrillDownData.diffPercent}%`}{" "}
                                      vs. anterior
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between px-1">
                                    <span className="font-bold text-white text-sm flex items-center gap-2">
                                      {renderCategorySemanticIcon(selectedCategoryDrillDown, "#0A84FF")}
                                      {selectedCategoryDrillDown}
                                    </span>
                                    <strong className={`text-white font-mono text-sm tabular-nums ${moneyBlur}`}>
                                      {formatBRL(categoryDrillDownData.totalCurrent)}
                                    </strong>
                                  </div>

                                  <div className="space-y-1.5">
                                    {categoryDrillDownData.txs.length === 0 ? (
                                      <p className="text-slate-400 text-center py-4">Nenhum lançamento no período.</p>
                                    ) : (
                                      categoryDrillDownData.txs.map((tx) => (
                                        <div
                                          key={tx.id}
                                          className="p-2 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs"
                                        >
                                          <div className="min-w-0 pr-2">
                                            <span className="text-[10px] font-mono text-slate-400 block tabular-nums">
                                              {formatDateBR(tx.date)} • {tx.paymentMethod}
                                            </span>
                                            <strong className="text-slate-200 block truncate">{tx.description}</strong>
                                          </div>
                                          <span className={`font-mono font-bold text-white shrink-0 tabular-nums ${moneyBlur}`}>
                                            {formatBRL(tx.isSplit && tx.personalAmount != null ? tx.personalAmount : tx.amount)}
                                          </span>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className={`grid ${widgetSize === "full" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-2 max-h-[280px] overflow-y-auto pr-1 text-xs`}>
                                  {categoryChartData.map((cat, catIdx) => {
                                    const pct = Math.round((cat.value / totalExpenses) * 100);
                                    const isHovered = donutHoverIndex === catIdx;
                                    return (
                                      <div
                                        key={cat.name}
                                        onClick={() => setSelectedCategoryDrillDown(cat.name)}
                                        onMouseEnter={() => setDonutHoverIndex(catIdx)}
                                        onMouseLeave={() => setDonutHoverIndex(null)}
                                        className={`p-2.5 rounded-xl bg-slate-950/60 border space-y-1.5 cursor-pointer transition group cupertino-card-hover ${
                                          isHovered
                                            ? "bg-slate-900 border-[#0A84FF]/60 shadow-[0_0_12px_rgba(10,132,255,0.2)] -translate-y-0.5"
                                            : "border-white/5 hover:bg-slate-900/90 hover:border-white/15"
                                        }`}
                                        title={`Clique para ver detalhamento de ${cat.name}`}
                                      >
                                        {/* Linha 1: Ícone + Nome Completo + Pílula com % */}
                                        <div className="flex items-center justify-between gap-2 min-w-0">
                                          <span className="font-semibold text-slate-200 flex items-center gap-1.5 min-w-0 truncate text-xs group-hover:text-white transition">
                                            <span
                                              className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                                              style={{ backgroundColor: cat.color }}
                                            />
                                            {renderCategorySemanticIcon(cat.name, cat.color)}
                                            <span className="truncate">{cat.name}</span>
                                          </span>
                                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400 shrink-0">
                                            {pct}%
                                          </span>
                                        </div>

                                        {/* Linha 2: Valor R$ tabular e barra de progresso h-1.5 */}
                                        <div className="space-y-1">
                                          <div className="flex items-center justify-between text-xs font-mono font-bold">
                                            <span className={`text-white tabular-nums ${moneyBlur}`}>
                                              {formatBRL(cat.value)}
                                            </span>
                                          </div>
                                          <div className="w-full h-1.5 bg-slate-900/80 rounded-full overflow-hidden relative">
                                            <div
                                              className="h-full rounded-full transition-all duration-300 progress-bar-apple relative liquid-progress-shimmer"
                                              style={{ width: `${pct}%`, backgroundColor: cat.color }}
                                            >
                                              <span className="liquid-progress-head" />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* WIDGET 4: RADAR DE PENDÊNCIAS & SAÚDE FINANCEIRA */}
                        {(widget.id === "pendencies" || widget.id === "pending_radar") && (
                          <div className="space-y-3 text-xs">
                            {/* Abas Internas do Radar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5">
                              <SlidingSegmentedControl
                                options={[
                                  {
                                    id: "fixos",
                                    label: "Fixos a Lançar",
                                    badge: pendingRadarData.unlaunchedFixed.length > 0 ? (
                                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-300 border border-amber-500/50">
                                        {pendingRadarData.unlaunchedFixed.length}
                                      </span>
                                    ) : undefined
                                  },
                                  {
                                    id: "pendentes",
                                    label: "Contas Pendentes",
                                    badge: pendingRadarData.pendingTxs.length > 0 ? (
                                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/50">
                                        {pendingRadarData.pendingTxs.length}
                                      </span>
                                    ) : undefined
                                  },
                                  {
                                    id: "faturas",
                                    label: "Vencimentos Cartões"
                                  },
                                  {
                                    id: "saude",
                                    label: "Saúde",
                                    icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
                                    badge: (
                                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${financialHealthData.statusColor}`}>
                                        {financialHealthData.overallScore}
                                      </span>
                                    )
                                  }
                                ]}
                                value={radarActiveTab}
                                onChange={(val) => setRadarActiveTab(val as "fixos" | "pendentes" | "faturas" | "saude")}
                                size="xs"
                                activeColor="bg-[#0A84FF]"
                              />

                              {radarActiveTab === "fixos" && pendingRadarData.unlaunchedFixed.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleLaunchFixedTransactions()}
                                  className="px-2.5 py-1 rounded-lg bg-[#0A84FF] hover:bg-[#0070E0] text-white font-medium text-[11px] transition cursor-pointer flex items-center gap-1"
                                >
                                  <Sparkles className="w-3 h-3" /> Lançar Todos
                                </button>
                              )}
                            </div>

                            {/* SUB-ABA 1: FIXOS A LANÇAR */}
                            {radarActiveTab === "fixos" && (
                              <div key="radar-fixos" className="space-y-2 max-h-60 overflow-y-auto pr-1 animate-cupertino-in">
                                {pendingRadarData.unlaunchedFixed.length === 0 ? (
                                  <div className="p-4 rounded-xl bg-slate-950/40 border border-emerald-500/20 text-center space-y-1">
                                    <CheckCircle2 className="w-6 h-6 text-[#30D158] mx-auto" />
                                    <p className="font-semibold text-white">Todos os fixos já lançados!</p>
                                    <p className="text-[11px] text-slate-400">
                                      Nenhum custo fixo pendente de registro em {pendingRadarData.targetMonth}.
                                    </p>
                                  </div>
                                ) : (
                                  pendingRadarData.unlaunchedFixed.map((item) => (
                                    <div
                                      key={item.id}
                                      className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-3 hover:border-white/15 transition"
                                    >
                                      <div className="min-w-0">
                                        <strong className="text-white block truncate">{item.title}</strong>
                                        <span className="text-[10px] text-slate-400 block truncate font-mono">
                                          {item.notes || "Custo Fixo"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className={`font-mono font-bold text-white tabular-nums ${moneyBlur}`}>
                                          {formatBRL(item.amount)}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleLaunchSingleFixed(item)}
                                          className="px-2 py-1 rounded-lg bg-[#0A84FF]/20 hover:bg-[#0A84FF] text-[#64D2FF] hover:text-white border border-[#0A84FF]/30 text-[11px] font-semibold transition cursor-pointer"
                                        >
                                          Lançar
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}

                            {/* SUB-ABA 2: CONTAS PENDENTES */}
                            {radarActiveTab === "pendentes" && (
                              <div key="radar-pendentes" className="space-y-2 max-h-60 overflow-y-auto pr-1 animate-cupertino-in">
                                {pendingRadarData.pendingTxs.length === 0 ? (
                                  <div className="p-4 rounded-xl bg-slate-950/40 border border-emerald-500/20 text-center space-y-1">
                                    <CheckCircle2 className="w-6 h-6 text-[#30D158] mx-auto" />
                                    <p className="font-semibold text-white">Tudo em dia!</p>
                                    <p className="text-[11px] text-slate-400">
                                      Nenhuma despesa pendente de pagamento no mês selecionado.
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="px-1 text-[11px] text-slate-400 flex items-center justify-between">
                                      <span>Total Pendente:</span>
                                      <strong className={`text-rose-400 font-mono font-bold tabular-nums ${moneyBlur}`}>
                                        {formatBRL(pendingRadarData.totalPendingAmount)}
                                      </strong>
                                    </div>
                                    {pendingRadarData.pendingTxs.map((tx) => (
                                      <div
                                        key={tx.id}
                                        className="p-2.5 rounded-xl bg-slate-950/60 border border-rose-500/20 flex items-center justify-between gap-3 hover:border-rose-500/30 transition"
                                      >
                                        <div className="min-w-0">
                                          <span className="text-[10px] font-mono text-slate-400 block tabular-nums">
                                            {formatDateBR(tx.date)}
                                          </span>
                                          <strong className="text-white block truncate">{tx.description}</strong>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className={`font-mono font-bold text-rose-300 tabular-nums ${moneyBlur}`}>
                                            {formatBRL(tx.isSplit && tx.personalAmount != null ? tx.personalAmount : tx.amount)}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleToggleStatus(tx)}
                                            className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-semibold transition cursor-pointer"
                                            title="Marcar como Pago"
                                          >
                                            ✓ Dar Baixa
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </>
                                )}
                              </div>
                            )}

                            {/* SUB-ABA 3: FATURAS & CARTÕES */}
                            {radarActiveTab === "faturas" && (
                              <div key="radar-faturas" className="space-y-2 max-h-60 overflow-y-auto pr-1 animate-cupertino-in">
                                {pendingRadarData.cardSchedules.map((item) => (
                                  <div
                                    key={item.card.id}
                                    className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-3"
                                  >
                                    <div className="min-w-0">
                                      <strong className="text-white block truncate">{item.card.name}</strong>
                                      <span className="text-[10px] text-slate-400 block font-mono">
                                        Fecha dia {item.closingDay} • Vence dia {item.dueDay}
                                      </span>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className={`font-mono font-bold text-white block ${moneyBlur}`}>
                                        {formatBRL(item.invoiceAmount)}
                                      </span>
                                      <span className="text-[10px] text-[#0A84FF] font-medium block">
                                        {item.daysToClose <= 5
                                          ? `Fecha em ${item.daysToClose}d`
                                          : `Vence em ${item.daysToDue}d`}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* SUB-ABA 4: SAÚDE FINANCEIRA (RADAR POLIGONAL 5 EIXOS) */}
                            {radarActiveTab === "saude" && (
                              <div key="radar-saude" className="space-y-3 animate-cupertino-in">
                                {/* Cabeçalho do Score */}
                                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-950/70 border border-white/5">
                                  <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-[#0A84FF]" />
                                    <div>
                                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Score de Saúde Financeira</span>
                                      <strong className="text-sm font-bold text-white flex items-center gap-1.5">
                                        <span className={`text-base font-extrabold ${financialHealthData.statusColor}`}>{financialHealthData.overallScore}</span>
                                        <span className="text-slate-400 text-xs">/ 100</span>
                                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${financialHealthData.statusColor} bg-white/5 border border-white/10`}>
                                          {financialHealthData.statusLabel}
                                        </span>
                                      </strong>
                                    </div>
                                  </div>
                                  <div className="text-right text-[11px] text-slate-400">
                                    <span>5 eixos avaliados</span>
                                  </div>
                                </div>

                                {/* Gráfico Radar Poligonal Recharts */}
                                <div className="h-56 select-none flex items-center justify-center">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="72%" data={financialHealthData.radarChartData}>
                                      <PolarGrid stroke="rgba(255, 255, 255, 0.12)" />
                                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                      <Radar name="Score" dataKey="score" stroke="#0A84FF" fill="#0A84FF" fillOpacity={0.35} />
                                    </RadarChart>
                                  </ResponsiveContainer>
                                </div>

                                {/* Dicas de Otimização */}
                                {financialHealthData.tips.length > 0 ? (
                                  <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                                    {financialHealthData.tips.map((tip, idx) => (
                                      <div key={idx} className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] flex items-start gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                        <span>{tip}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
                                    <span>Excelente! Todos os 5 indicadores de saúde financeira estão dentro da meta.</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* WIDGET 5: CARTÕES & LIMITES (APPLE WALLET STACK + MERCURY/LINEAR BARS) */}
                        {(widget.id === "wallet_limits" || widget.id === "wallet_card") && (() => {
                          const maxCarouselIndex = Math.max(0, cards.length - 3);
                          const clampedIndex = Math.min(walletCarouselIndex, maxCarouselIndex);
                          const visibleCards = cards.slice(clampedIndex, clampedIndex + 3);

                          return (
                          <div className="space-y-3">
                            {/* PARTE SUPERIOR: Apple Wallet Card Stack */}
                            <div>
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-[#0A84FF]" /> Meus Cartões ({cards.length})
                                  </span>
                                  {cards.length > 3 && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-mono">
                                      {clampedIndex + 1}-{Math.min(clampedIndex + 3, cards.length)} de {cards.length}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {cards.length > 3 && (
                                    <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/10">
                                      <button
                                        type="button"
                                        disabled={clampedIndex === 0}
                                        onClick={() => setWalletCarouselIndex((prev) => Math.max(0, prev - 1))}
                                        title="Cartão anterior (scroll para cima)"
                                        className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                                      >
                                        <ChevronUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={clampedIndex >= maxCarouselIndex}
                                        onClick={() => setWalletCarouselIndex((prev) => Math.min(maxCarouselIndex, prev + 1))}
                                        title="Próximo cartão (scroll para baixo)"
                                        className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                                      >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setShowReorderCardsModal(true)}
                                    title="⚙️ Ordenar Meus Cartões"
                                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                                  >
                                    <ArrowUpDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveTab("cards")}
                                    className="text-[11px] text-[#0A84FF] hover:underline cursor-pointer"
                                  >
                                    Gerenciar
                                  </button>
                                </div>
                              </div>

                              {cards.length === 0 ? (
                                <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 text-center space-y-2">
                                  <CreditCard className="w-8 h-8 text-slate-500 mx-auto" />
                                  <p className="text-sm font-semibold text-white">Nenhum cartão cadastrado</p>
                                  <p className="text-xs text-slate-400">Adicione seus cartões em Bancos & Cartões para visualizar o stack e faturas.</p>
                                  <button
                                    type="button"
                                    onClick={() => setActiveTab("cards")}
                                    className="mt-2 px-3 py-1.5 rounded-xl bg-[#0A84FF] text-white text-xs font-semibold cursor-pointer"
                                  >
                                    Adicionar Cartão
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onWheel={handleWalletWheel}
                                  className="relative pt-1 pb-2 group/wallet select-none"
                                >
                                  {clampedIndex > 0 && (
                                    <div
                                      aria-hidden="true"
                                      className="h-1.5 -mb-1 mx-4 rounded-t-xl bg-gradient-to-r from-slate-600/30 via-slate-500/40 to-slate-600/30 border-t border-x border-white/10 blur-[2px] opacity-40 scale-[0.96] pointer-events-none transition-all duration-300"
                                    />
                                  )}
                                  {visibleCards.map((card, idx) => {
                                    const exposure = calculateCardExposure(card, transactions, selectedMonth);
                                    const cardGradient = getCardGradient(card.name, card.bankName);
                                    const isFirst = idx === 0;

                                    return (
                                      <div
                                        key={card.id}
                                        style={{ zIndex: idx + 1 }}
                                        className={`relative transition-all duration-300 ease-out ${
                                          !isFirst ? "-mt-12 group-hover/wallet:-mt-8" : ""
                                        }`}
                                      >
                                        <TiltCard3D maxTilt={5}>
                                          <div
                                            className={`wallet-physical-card wallet-card-crisp relative rounded-2xl p-3.5 shadow-xl border border-white/15 bg-gradient-to-br ${cardGradient} outline-none focus:outline-none ring-0`}
                                          >
                                            <div className="relative z-20 antialiased backface-hidden">
                                              {/* Cabeçalho do Cartão */}
                                              <div className="flex items-center justify-between text-white mb-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                  <span className="font-bold text-sm tracking-tight truncate">{card.name}</span>
                                                  {card.brand && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm font-medium shrink-0">
                                                      {card.brand}
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-white/80 shrink-0">
                                                  <Zap className="w-3.5 h-3.5" />
                                                  <span className="text-[10px] font-mono tracking-widest">••••</span>
                                                </div>
                                              </div>

                                              {/* Valores do Cartão */}
                                              <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                  <span className="text-[10px] text-white/70 block uppercase tracking-wider">Fatura Atual</span>
                                                  <strong className={`text-base font-extrabold text-white block font-mono tabular-nums ${moneyBlur}`}>
                                                    {formatBRL(exposure.used)}
                                                  </strong>
                                                </div>
                                                <div className="text-right">
                                                  <span className="text-[10px] text-white/70 block uppercase tracking-wider">Disponível</span>
                                                  <strong className={`text-sm font-bold text-emerald-300 block font-mono tabular-nums ${moneyBlur}`}>
                                                    {formatBRL(exposure.available)}
                                                  </strong>
                                                  <span className={`text-[10px] text-white/60 block font-mono tabular-nums ${moneyBlur}`}>
                                                    Limite: {formatBRL(card.limit)}
                                                  </span>
                                                </div>
                                              </div>

                                              {/* Rodapé do Cartão */}
                                              <div className="mt-2 pt-1.5 border-t border-white/15 flex items-center justify-between text-[11px] text-white/80 font-mono">
                                                <span>Fecha dia {card.closingDay || "—"} • Vence dia {card.dueDay || "—"}</span>
                                                {exposure.used > 0 && (
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      triggerAuraBurst(e.currentTarget, "emerald");
                                                      handlePayCardInvoice(card.name, card.bankName || undefined);
                                                    }}
                                                    className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold text-[10px] transition cursor-pointer apple-press"
                                                  >
                                                    Pagar Fatura
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </TiltCard3D>
                                      </div>
                                    );
                                  })}
                                  {clampedIndex < maxCarouselIndex && (
                                    <div
                                      aria-hidden="true"
                                      className="h-1.5 -mt-1 mx-4 rounded-b-xl bg-gradient-to-r from-slate-600/30 via-slate-500/40 to-slate-600/30 border-b border-x border-white/10 blur-[2px] opacity-40 scale-[0.96] pointer-events-none transition-all duration-300"
                                    />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* PARTE INFERIOR: Barras de Limites Compactas Reais (SSOT Cartões de Crédito) */}
                            <div className="pt-2 border-t border-white/10 space-y-2.5">
                              {/* Pílulas Consolidadas */}
                              <div className={`grid grid-cols-3 gap-2 text-xs text-center ${moneyBlur}`}>
                                <div className="py-1.5 px-2.5 rounded-xl bg-slate-950/70 border border-white/10">
                                  <span className="text-[10px] text-slate-400 block">Limite Total</span>
                                  <strong className="text-xs sm:text-sm font-bold text-white block mt-0.5 tabular-nums">
                                    {formatBRL(cardLimitsAnalytics.globalTotalLimit)}
                                  </strong>
                                </div>
                                <div className="py-1.5 px-2.5 rounded-xl bg-slate-950/70 border border-emerald-500/20">
                                  <span className="text-[10px] text-emerald-400/80 block">Disponível</span>
                                  <strong className="text-xs sm:text-sm font-bold text-emerald-400 block mt-0.5 tabular-nums">
                                    {formatBRL(cardLimitsAnalytics.globalTotalDisponivel)}
                                  </strong>
                                </div>
                                <div className="py-1.5 px-2.5 rounded-xl bg-slate-950/70 border border-indigo-500/20">
                                  <span className="text-[10px] text-indigo-300 block">% Usado</span>
                                  <strong className="text-xs sm:text-sm font-bold text-indigo-300 block mt-0.5 tabular-nums">
                                    {cardLimitsAnalytics.globalUsagePct}%
                                  </strong>
                                </div>
                              </div>

                              {/* Lista de Barras de Progresso Slim */}
                              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                                {cardLimitsAnalytics.cards.map((c) => {
                                  const barColor =
                                    c.pctUsed >= 80 ? "bg-[#FF453A]" : c.pctUsed >= 50 ? "bg-[#FF9F0A]" : "bg-[#30D158]";

                                  return (
                                    <div key={c.id} className="py-1.5 px-2.5 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-slate-200 text-xs flex items-center gap-1.5 truncate">
                                          <CreditCard className="w-3.5 h-3.5 text-[#0A84FF] shrink-0" />
                                          <span className="truncate">{c.name}</span>
                                          {c.brand && (
                                            <span className="text-[9px] text-slate-400 px-1.5 py-0.2 rounded bg-white/5 shrink-0">
                                              {c.brand}
                                            </span>
                                          )}
                                        </span>
                                        <span className={`text-[11px] font-mono tabular-nums text-slate-300 ${moneyBlur}`}>
                                          <strong className="text-white">{formatBRL(c.used)}</strong> / {formatBRL(c.limit)} ({c.pctUsed}%)
                                        </span>
                                      </div>
                                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden relative">
                                        <div
                                          className={`h-full rounded-full transition-all duration-500 relative liquid-progress-shimmer ${barColor}`}
                                          style={{ width: `${c.pctUsed}%` }}
                                        >
                                          <span className="liquid-progress-head" />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          );
                        })()}

                        {/* WIDGET 6: FLUXO DE CAIXA & ATIVIDADES RECENTES */}
                        {(widget.id === "cashflow_recents" || widget.id === "cashflow_recent") && (
                          <div className="space-y-3 text-xs">
                            {/* Sub-abas do Cashflow */}
                            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                              <SlidingSegmentedControl
                                options={[
                                  { id: "fluxo", label: "Fluxo Mensal (6M)", icon: <TrendingUp className="w-3.5 h-3.5" /> },
                                  { id: "recentes", label: "Atividades Recentes", icon: <Clock className="w-3.5 h-3.5" /> }
                                ]}
                                value={cashflowActiveTab}
                                onChange={(val) => setCashflowActiveTab(val as "fluxo" | "recentes")}
                                size="xs"
                                activeColor="bg-[#0A84FF]"
                              />

                              <button
                                type="button"
                                onClick={() => setActiveTab("transactions")}
                                className="text-[11px] text-[#0A84FF] hover:underline cursor-pointer"
                              >
                                Ver Todos
                              </button>
                            </div>

                            {/* SUB-ABA 1: FLUXO MENSAL (6M) */}
                            {cashflowActiveTab === "fluxo" && (
                              <div key="cashflow-fluxo" className="space-y-2 animate-cupertino-in">
                                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                                  <span>Entradas, Saídas e Aportes (Últimos 6M)</span>
                                  <div className="flex items-center gap-3 font-mono text-[10px]">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#30D158]" /> Entradas</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF453A]" /> Saídas</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0A84FF]" /> Aportes</span>
                                  </div>
                                </div>

                                <div className="w-full select-none transition-all duration-300" style={{ height: `${getChartHeightPx("cashflow_recents", 175)}px` }}>
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashflow6MData} barGap={4} barSize={12} accessibilityLayer={false} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                                      <XAxis dataKey="label" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                                      <YAxis
                                        stroke="#64748b"
                                        fontSize={11}
                                        width={55}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => {
                                          const num = Number(v) || 0;
                                          if (num >= 1000) return `R$ ${(num / 1000).toFixed(0)}k`;
                                          return `R$ ${num}`;
                                        }}
                                      />
                                      <Tooltip content={<CustomCyberTooltip isCurrency={true} moneyBlur={moneyBlur} />} cursor={false} />
                                      <Bar dataKey="entradas" name="Entradas (R$)" fill="#30D158" radius={[4, 4, 0, 0]} />
                                      <Bar dataKey="saidas" name="Saídas (R$)" fill="#FF453A" radius={[4, 4, 0, 0]} />
                                      <Bar dataKey="aportes" name="Aportes (R$)" fill="#0A84FF" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            )}

                            {/* SUB-ABA 2: ATIVIDADES RECENTES */}
                            {cashflowActiveTab === "recentes" && (
                              <div key="cashflow-recentes" className="space-y-2 max-h-64 overflow-y-auto pr-1 animate-cupertino-in">
                                {recentTransactions.length === 0 ? (
                                  <p className="text-slate-400 text-center py-6">Nenhuma atividade recente encontrada.</p>
                                ) : (
                                  recentTransactions.map((tx) => {
                                    const flow = tx.flowType || getFlowType(tx.category);
                                    const isPositive = isPositiveInflowDisplay(tx);
                                    const isInvest = flow === "INVESTMENT";
                                    const isPaid = tx.status === "Pago";

                                    return (
                                      <div
                                        key={tx.id}
                                        className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-3 hover:border-white/15 transition text-xs"
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div
                                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                              isPositive
                                                ? "bg-[#30D158]/15 text-[#30D158]"
                                                : isInvest
                                                ? "bg-[#0A84FF]/15 text-[#0A84FF]"
                                                : "bg-[#FF453A]/15 text-[#FF453A]"
                                            }`}
                                          >
                                            {renderCategorySemanticIcon(tx.category, isPositive ? "#30D158" : isInvest ? "#0A84FF" : "#FF453A")}
                                          </div>
                                          <div className="min-w-0">
                                            <strong className="text-white block truncate">{tx.description}</strong>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                                              <span>{formatDateBR(tx.date)}</span>
                                              <span>•</span>
                                              <span className="truncate">{tx.category}</span>
                                              <span>•</span>
                                              <span className="text-slate-300">{tx.paymentMethod}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                          <span
                                            className={`font-mono font-bold tabular-nums text-xs sm:text-sm ${
                                              isPositive
                                                ? "text-[#30D158]"
                                                : isInvest
                                                ? "text-[#0A84FF]"
                                                : "text-[#FF453A]"
                                            } ${moneyBlur}`}
                                          >
                                            {tx.isTransfer ? "⇆ " : isPositive ? "+" : isInvest ? "⚡ " : "- "}{formatBRL(tx.isSplit && tx.personalAmount != null ? tx.personalAmount : tx.amount)}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleToggleStatus(tx)}
                                            title={isPaid ? "Status: Pago (Clique para marcar pendente)" : "Status: Pendente (Clique para marcar pago)"}
                                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                              isPaid
                                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                                                : "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
                                            }`}
                                          >
                                            {isPaid ? "✓ Pago" : "⏳ Pendente"}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* WIDGET 7: BENEFÍCIOS & STRAVA */}
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
            <div key="tab-spotify" className="animate-cupertino-in">
              <SpotifyModule ownerDisplayName={currentUser ?? ownerUsername ?? "Sabrino"} />
            </div>
          ) : (
            <div key={`tab-${activeTab}`} className="animate-cupertino-in">
              <SecondaryTabs
              activeTab={activeTab}
              moneyBlur={moneyBlur}
              currentUser={currentUser}
              currentUserAvatar={currentUserAvatar}
              themeMode={themeMode}
              changeThemeMode={changeThemeMode}
              bgFxMode={bgFxMode}
              handleSelectBgFxMode={handleSelectBgFxMode}
              cupertinoTheme={cupertinoTheme}
              toggleCupertinoTheme={toggleCupertinoTheme}
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
              onAddTransaction={handleUnifiedAddFuel}
              onSaveInvestmentTx={handleSaveInvestmentTx}
              onBatchImportTransactions={handleBatchImportTransactions}
              dailyQuotaInfo={dailyQuotaInfo}
              cdiAnnualRate={marketRates.cdiAnnualRate}
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
              stravaActivities={stravaActivities}
              setStravaActivities={setStravaActivities}
              stravaScopeMode={stravaScopeMode}
              stravaOauthUrl={stravaOauthUrl}
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
                const clean: StravaCredentials = {
                  athleteId: toCleanStr(cfg?.athleteId),
                  clientId: toCleanStr(cfg?.clientId),
                  clientSecret: toCleanStr(cfg?.clientSecret),
                  refreshToken: toCleanStr(cfg?.refreshToken)
                };
                setStravaConfig(clean);
                updateUserSettingsInDb({ stravaConfig: clean });
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
          </div>
          )}
        </main>
      </div>

      {/* SPRINT 37: CUPERTINO MOBILE BOTTOM BAR (Bianca Takahashi) */}
      <nav
        aria-label="Navegação Rápida Mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0E14]/85 backdrop-blur-2xl border-t border-[var(--cupertino-border)] px-4 py-2 flex items-center justify-around shadow-[0_-8px_24px_rgba(0,0,0,0.5)]"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 8px), 10px)" }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "dashboard" ? "text-[#0A84FF] font-semibold" : "text-slate-400 hover:text-white"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("transactions")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "transactions" ? "text-[#0A84FF] font-semibold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Table2 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Lançamentos</span>
        </button>

        {/* Botão Central Destacado + Novo */}
        <button
          type="button"
          onClick={() => handleOpenNewTxModal()}
          className="w-12 h-12 -mt-5 rounded-full bg-[#0A84FF] hover:bg-[#0070E0] text-white flex items-center justify-center shadow-lg shadow-[#0A84FF]/40 active:scale-95 transition-transform cursor-pointer border-2 border-[#0B0E14]"
          title="Novo Lançamento"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("auto")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "auto" ? "text-[#0A84FF] font-semibold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Car className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Veículos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cards")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "cards" ? "text-[#0A84FF] font-semibold" : "text-slate-400 hover:text-white"
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Cartões</span>
        </button>
      </nav>

      {/* COMMAND PALETTE MODAL (CTRL + K) VIA CREATEPORTAL */}
      {showCommandModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 w-screen h-dvh z-[9999] bg-black/65 backdrop-blur-md flex items-start justify-center pt-20 p-4 overflow-hidden">
          <div className="relative w-full max-w-lg max-h-[86dvh] flex flex-col overflow-hidden rounded-2xl bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] shadow-2xl text-xs">
            <div className="p-3.5 border-b border-white/10 flex items-center gap-2.5 bg-slate-950/70 shrink-0">
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
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex-1 overflow-y-auto space-y-1 custom-scrollbar">
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
        </div>,
        document.body
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

      {/* MODAL DE CHANGELOG VIA CREATEPORTAL */}
      {showChangelogModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 w-screen h-dvh z-[9999] bg-black/65 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
          <div className="relative w-full max-w-lg max-h-[86dvh] overflow-y-auto rounded-2xl bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] p-6 shadow-2xl space-y-4 text-xs my-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-white">Histórico de Versões (Changelog)</h3>
              <button
                type="button"
                onClick={() => setShowChangelogModal(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white cursor-pointer"
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
        </div>,
        document.body
      )}

      {/* MODAL DE ORDENAÇÃO DE CARTÕES (SPRINT 54) VIA CREATEPORTAL */}
      {showReorderCardsModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 w-screen h-dvh z-[9999] bg-black/65 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
          <div className="relative w-full max-w-md max-h-[86dvh] overflow-y-auto rounded-2xl bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] p-5 shadow-2xl space-y-4 text-xs my-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/25">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">⚙️ Ordenar Meus Cartões</h3>
                  <p className="text-[11px] text-slate-400">Defina a ordem de exibição na Apple Wallet e nos limites</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReorderCardsModal(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">
              Use as setas para reposicionar seus cartões. Os <strong className="text-white">3 primeiros</strong> cartões serão exibidos em destaque inicial no stack da Apple Wallet.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {cards.map((c, index) => {
                const isFirst = index === 0;
                const isLast = index === cards.length - 1;
                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-[11px] font-bold text-slate-400 shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white truncate">{c.name}</span>
                          {c.brand && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 shrink-0">
                              {c.brand}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Limite: {formatBRL(c.limit)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => {
                          const newCards = [...cards];
                          const temp = newCards[index - 1];
                          newCards[index - 1] = newCards[index];
                          newCards[index] = temp;
                          handleReorderCards(newCards);
                        }}
                        title="Mover para cima"
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#0A84FF]/20 hover:text-[#0A84FF] text-slate-300 flex items-center justify-center disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => {
                          const newCards = [...cards];
                          const temp = newCards[index + 1];
                          newCards[index + 1] = newCards[index];
                          newCards[index] = temp;
                          handleReorderCards(newCards);
                        }}
                        title="Mover para baixo"
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#0A84FF]/20 hover:text-[#0A84FF] text-slate-300 flex items-center justify-center disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowReorderCardsModal(false)}
                className="px-4 py-2 rounded-xl bg-[#0A84FF] hover:bg-[#0A84FF]/80 text-white font-semibold text-xs transition cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL DE EXCLUSÃO INTELIGENTE DE SÉRIE PARCELADA VIA CREATEPORTAL */}
      {deleteSeriesModal.isOpen && deleteSeriesModal.targetTx && deleteSeriesModal.seriesData && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 w-screen h-dvh z-[9999] bg-black/65 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
          <div className="relative w-full max-w-md max-h-[86dvh] overflow-y-auto rounded-2xl bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] p-6 shadow-2xl space-y-4 text-xs my-auto custom-scrollbar">
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
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition cursor-pointer"
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
        </div>,
        document.body
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

      {/* MODAL DE CONFIRMAÇÃO CUSTOMIZADO (Sprint 15 - Clara Vance) VIA CREATEPORTAL */}
      {confirmModal.isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 w-screen h-dvh z-[9999] bg-black/65 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
          <div className="relative w-full max-w-sm max-h-[86dvh] overflow-y-auto rounded-2xl bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] p-6 shadow-2xl space-y-4 my-auto custom-scrollbar">
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
        </div>,
        document.body
      )}

      {/* MODAL RAIO-X CONTÁBIL CÉLULA A CÉLULA DOS 4 KPIS (SPRINT 42) */}
      <KpiAuditModal
        isOpen={activeKpiAudit !== null}
        activeKpiAudit={activeKpiAudit}
        onClose={() => setActiveKpiAudit(null)}
        monthSummary={monthSummary}
        safeToSpend={safeToSpend}
        selectedMonth={selectedMonth}
        selectedMonthLabel={selectedMonthLabel}
        accountingRegime={accountingRegime}
        regimeTransactions={regimeTransactions}
        transactions={transactions}
        banks={banks}
        cards={cards}
        moneyBlur={moneyBlur}
        onEditTransaction={(tx) => {
          setActiveKpiAudit(null);
          handleStartEditTransaction(tx);
        }}
        onDeleteTransaction={(id) => {
          handleDeleteTransaction(id);
        }}
        getFlowType={getFlowType}
      />
    </div>
  );
}