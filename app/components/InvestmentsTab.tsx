"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Activity,
  Layers,
  Settings2,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Info,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Percent,
  Calendar,
  Wallet,
  Sparkles,
  Zap
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { Transaction, BankItem, CreditCardItem, InvestmentBucket } from "../lifeos-data";
import { formatBRL } from "../lib/domain/finance";
import { todayBR, formatDateBR, toSortableISO, compareDatesBR } from "../lib/domain/date-br";
import { calculatePortfolioCdiYield } from "../lib/domain/investment-yield";
import { AnimatedNumber144, AnimatedBRL, AnimatedMetric } from "./AnimatedNumber144";
import { SlidingSegmentedControl } from "./SlidingSegmentedControl";
import { MarketPulseResponse, MarketTickerItem } from "../api/market-pulse/route";

export interface InvestmentsTabProps {
  transactions: Transaction[];
  banks: BankItem[];
  cards: CreditCardItem[];
  cdiAnnualRate?: number;
  moneyBlur?: string;
  onSaveTransaction: (tx: Partial<Transaction>, isEdit?: boolean) => void;
  onDeleteTransaction?: (id: string) => void;
  notify?: (title: string, message: string, type?: "success" | "warning" | "error" | "info") => void;
}

const BUCKET_CONFIG: Record<
  InvestmentBucket,
  { label: string; shortLabel: string; icon: string; color: string; bg: string; border: string; desc: string }
> = {
  BTC: {
    label: "Bitcoin & Cripto",
    shortLabel: "BTC",
    icon: "🟠",
    color: "#F7931A",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    desc: "Marcação a mercado ao vivo via Binance Public API com conversão satoshis"
  },
  CDI: {
    label: "CDI & Caixinhas",
    shortLabel: "CDI",
    icon: "🔵",
    color: "#0A84FF",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    desc: "Capitalização diária a 115% CDI (Nubank/Inter) com desconto de IR regressivo"
  },
  LCI: {
    label: "LCI & LCA",
    shortLabel: "LCI",
    icon: "🟢",
    color: "#30D158",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    desc: "Renda fixa isenta de Imposto de Renda (0% IR)"
  },
  STOCKS: {
    label: "Ações & FIIs",
    shortLabel: "Ações",
    icon: "🟣",
    color: "#AF52DE",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    desc: "Renda variável, fundos imobiliários e cotas de índices"
  },
  PAPER_CASH: {
    label: "Dinheiro em Papel",
    shortLabel: "Papel",
    icon: "💵",
    color: "#FFD60A",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    desc: "Espécie guardada em casa com simulação de corrosão inflacionária IPCA"
  }
};

const DEFAULT_VISIBLE_MARKET_CHARTS = ["BTC", "BNB", "ETH", "USD", "CDI", "IBOV"];
const ALL_AVAILABLE_MARKET_CHARTS = [
  { key: "BTC", name: "Bitcoin (BTC/BRL)", icon: "₿", group: "Cripto" },
  { key: "BNB", name: "BNB Chain (BNB/BRL)", icon: "🔶", group: "Cripto" },
  { key: "ETH", name: "Ethereum (ETH/BRL)", icon: "Ξ", group: "Cripto" },
  { key: "SOL", name: "Solana (SOL/BRL)", icon: "◎", group: "Cripto" },
  { key: "USD", name: "Dólar Comercial (USD/BRL)", icon: "💵", group: "Câmbio" },
  { key: "EUR", name: "Euro (EUR/BRL)", icon: "💶", group: "Câmbio" },
  { key: "CDI", name: "Taxa CDI / Selic (115%)", icon: "📊", group: "Macro" },
  { key: "IBOV", name: "Ibovespa (IBOV)", icon: "🇧🇷", group: "Macro" }
];

export function InvestmentsTab({
  transactions,
  banks,
  cards,
  cdiAnnualRate = 12.15,
  moneyBlur = "",
  onSaveTransaction,
  onDeleteTransaction,
  notify
}: InvestmentsTabProps) {
  // Sub-visões: Carteira de Investimentos vs Simulador de Papel
  const [subView, setSubView] = useState<"portfolio" | "paper">("portfolio");

  // Filtro de foco interativo nos cards de gavetas (Motion 144Hz)
  const [focusedBucket, setFocusedBucket] = useState<InvestmentBucket | null>(null);

  // Estado das Cotações Ao Vivo
  const [marketPulse, setMarketPulse] = useState<MarketPulseResponse | null>(null);
  const [isLoadingPulse, setIsLoadingPulse] = useState<boolean>(true);

  // Gráficos de mercado customizáveis visíveis
  const [visibleCharts, setVisibleCharts] = useState<string[]>(DEFAULT_VISIBLE_MARKET_CHARTS);
  const [isChartsSettingsOpen, setIsChartsSettingsOpen] = useState<boolean>(false);

  // Janela de tempo selecionada para os gráficos de mercado
  const [selectedChartRange, setSelectedChartRange] = useState<"24H" | "7D" | "1M" | "1Y">("1M");

  // Modal de Novo Investimento / Resgate
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTxType, setModalTxType] = useState<"Aporte" | "Resgate">("Aporte");
  const [modalBucket, setModalBucket] = useState<InvestmentBucket>("CDI");
  const [modalTicker, setModalTicker] = useState<string>("");
  const [modalAmount, setModalAmount] = useState<string>("");
  const [modalDate, setModalDate] = useState<string>(todayBR());
  const [modalBank, setModalBank] = useState<string>(banks[0]?.name || "Nubank");
  const [modalEntryQuote, setModalEntryQuote] = useState<string>("");
  const [flashingRowId, setFlashingRowId] = useState<string | null>(null);

  // Carrega preferências salvas do localStorage
  useEffect(() => {
    try {
      const savedCharts = localStorage.getItem("coindex_visible_market_charts");
      if (savedCharts) {
        const parsed = JSON.parse(savedCharts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVisibleCharts(parsed);
        }
      }
    } catch {
      // Ignora erro
    }
  }, []);

  // SPRINT 54: Busca cotações de mercado da rota /api/market-pulse (sem cache)
  const fetchMarketPulse = async () => {
    setIsLoadingPulse(true);
    try {
      const res = await fetch("/api/market-pulse", {
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        },
        cache: "no-store"
      });
      if (res.ok) {
        const data = (await res.json()) as MarketPulseResponse;
        setMarketPulse(data);
      }
    } catch (err) {
      console.warn("[InvestmentsTab] Erro ao carregar cotações de mercado:", err);
    } finally {
      setIsLoadingPulse(false);
    }
  };

  // SPRINT 54: Atualização de mercado a cada 30 segundos (30000ms) sem oscilação constante
  useEffect(() => {
    fetchMarketPulse();
    const interval = setInterval(() => {
      fetchMarketPulse();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Preço atual do Bitcoin em BRL
  const btcPrice = marketPulse?.tickers.BTC.priceBRL || 435800.0;

  // Lançamentos filtrados de investimentos (Aporte, Resgate ou flowType INVESTMENT)
  const investmentTxs = useMemo(() => {
    return transactions
      .filter((t) => {
        const cat = (t.category || "").trim().toLowerCase();
        return (
          cat === "aporte" ||
          cat === "resgate" ||
          cat.includes("invest") ||
          t.flowType === "INVESTMENT" ||
          t.investmentBucket != null
        );
      })
      .map((t) => {
        // Fallback padrão: se não tem bucket explícito, categoriza como CDI
        const bucket: InvestmentBucket = t.investmentBucket || "CDI";
        const isAporte = (t.category || "").toLowerCase() === "resgate" ? false : true;
        return {
          ...t,
          resolvedBucket: bucket,
          isAporte
        };
      })
      .sort((a, b) => compareDatesBR(b.date, a.date));
  }, [transactions]);

  // Cálculos por Gaveta / Segmento
  const bucketSummaries = useMemo(() => {
    const map: Record<
      InvestmentBucket,
      {
        deposited: number;
        redeemed: number;
        netDeposited: number;
        currentValue: number;
        profitBRL: number;
        profitPct: number;
        txCount: number;
        cryptoUnits?: number;
      }
    > = {
      BTC: { deposited: 0, redeemed: 0, netDeposited: 0, currentValue: 0, profitBRL: 0, profitPct: 0, txCount: 0, cryptoUnits: 0 },
      CDI: { deposited: 0, redeemed: 0, netDeposited: 0, currentValue: 0, profitBRL: 0, profitPct: 0, txCount: 0 },
      LCI: { deposited: 0, redeemed: 0, netDeposited: 0, currentValue: 0, profitBRL: 0, profitPct: 0, txCount: 0 },
      STOCKS: { deposited: 0, redeemed: 0, netDeposited: 0, currentValue: 0, profitBRL: 0, profitPct: 0, txCount: 0 },
      PAPER_CASH: { deposited: 0, redeemed: 0, netDeposited: 0, currentValue: 0, profitBRL: 0, profitPct: 0, txCount: 0 }
    };

    // 1. Processa Bitcoin com marcação a mercado realística
    let btcSatsTotal = 0;
    investmentTxs
      .filter((t) => t.resolvedBucket === "BTC")
      .forEach((t) => {
        map.BTC.txCount++;
        if (t.isAporte) {
          map.BTC.deposited += t.amount;
          const entryQuote = t.entryQuotePrice && t.entryQuotePrice > 0 ? t.entryQuotePrice : btcPrice;
          const sats = t.amount / entryQuote;
          btcSatsTotal += sats;
        } else {
          map.BTC.redeemed += t.amount;
          const entryQuote = t.entryQuotePrice && t.entryQuotePrice > 0 ? t.entryQuotePrice : btcPrice;
          const sats = t.amount / entryQuote;
          btcSatsTotal = Math.max(0, btcSatsTotal - sats);
        }
      });
    map.BTC.netDeposited = Math.max(0, map.BTC.deposited - map.BTC.redeemed);
    map.BTC.cryptoUnits = btcSatsTotal;
    map.BTC.currentValue = btcSatsTotal * btcPrice;
    map.BTC.profitBRL = map.BTC.currentValue - map.BTC.netDeposited;
    map.BTC.profitPct = map.BTC.netDeposited > 0 ? (map.BTC.profitBRL / map.BTC.netDeposited) * 100 : 0;

    // 2. Processa CDI conectado ao motor matemático de rendimento diário 115% CDI
    const cdiTxs = investmentTxs.filter((t) => t.resolvedBucket === "CDI");
    cdiTxs.forEach((t) => {
      map.CDI.txCount++;
      if (t.isAporte) map.CDI.deposited += t.amount;
      else map.CDI.redeemed += t.amount;
    });
    map.CDI.netDeposited = Math.max(0, map.CDI.deposited - map.CDI.redeemed);

    // Roda simulação de rendimento CDI composto
    const cdiYield = calculatePortfolioCdiYield(
      cdiTxs.map((t) => ({
        date: t.date,
        amount: t.amount,
        category: t.isAporte ? "Aporte" : "Resgate",
        cdiPercentage: 115
      })),
      {
        cdiAnnualRate,
        defaultCdiPercentage: 115,
        yieldMode: "liquido"
      }
    );
    map.CDI.currentValue = cdiYield.saldoComRendimentoLiquido || map.CDI.netDeposited;
    map.CDI.profitBRL = Math.max(0, map.CDI.currentValue - map.CDI.netDeposited);
    map.CDI.profitPct = map.CDI.netDeposited > 0 ? (map.CDI.profitBRL / map.CDI.netDeposited) * 100 : 0;

    // 3. Processa LCI (isento de IR, ~95% do CDI)
    const lciTxs = investmentTxs.filter((t) => t.resolvedBucket === "LCI");
    lciTxs.forEach((t) => {
      map.LCI.txCount++;
      if (t.isAporte) map.LCI.deposited += t.amount;
      else map.LCI.redeemed += t.amount;
    });
    map.LCI.netDeposited = Math.max(0, map.LCI.deposited - map.LCI.redeemed);
    // Simula rendimento de LCI ~95% CDI limpo
    const lciYieldFactor = 1 + (cdiAnnualRate * 0.95) / 100 * (30 / 365); // Estimativa mensal
    map.LCI.currentValue = map.LCI.netDeposited * lciYieldFactor;
    map.LCI.profitBRL = map.LCI.currentValue - map.LCI.netDeposited;
    map.LCI.profitPct = map.LCI.netDeposited > 0 ? (map.LCI.profitBRL / map.LCI.netDeposited) * 100 : 0;

    // 4. Processa Ações & FIIs
    const stockTxs = investmentTxs.filter((t) => t.resolvedBucket === "STOCKS");
    stockTxs.forEach((t) => {
      map.STOCKS.txCount++;
      if (t.isAporte) map.STOCKS.deposited += t.amount;
      else map.STOCKS.redeemed += t.amount;
    });
    map.STOCKS.netDeposited = Math.max(0, map.STOCKS.deposited - map.STOCKS.redeemed);
    // Variação padrão estimada +3,8% ou manual
    map.STOCKS.currentValue = map.STOCKS.netDeposited * 1.038;
    map.STOCKS.profitBRL = map.STOCKS.currentValue - map.STOCKS.netDeposited;
    map.STOCKS.profitPct = map.STOCKS.netDeposited > 0 ? (map.STOCKS.profitBRL / map.STOCKS.netDeposited) * 100 : 0;

    // 5. Processa Dinheiro em Papel (sem rendimento nominal, corrosão IPCA na sub-aba)
    const paperTxs = investmentTxs.filter((t) => t.resolvedBucket === "PAPER_CASH");
    paperTxs.forEach((t) => {
      map.PAPER_CASH.txCount++;
      if (t.isAporte) map.PAPER_CASH.deposited += t.amount;
      else map.PAPER_CASH.redeemed += t.amount;
    });
    map.PAPER_CASH.netDeposited = Math.max(0, map.PAPER_CASH.deposited - map.PAPER_CASH.redeemed);
    map.PAPER_CASH.currentValue = map.PAPER_CASH.netDeposited;
    map.PAPER_CASH.profitBRL = 0;
    map.PAPER_CASH.profitPct = 0;

    return map;
  }, [investmentTxs, btcPrice, cdiAnnualRate]);

  // Totais Gerais Consolidados
  const totalNetDeposited = useMemo(() => {
    return Object.values(bucketSummaries).reduce((acc, b) => acc + b.netDeposited, 0);
  }, [bucketSummaries]);

  const totalCurrentInvested = useMemo(() => {
    return Object.values(bucketSummaries).reduce((acc, b) => acc + b.currentValue, 0);
  }, [bucketSummaries]);

  const totalProfitBRL = totalCurrentInvested - totalNetDeposited;
  const totalProfitPct = totalNetDeposited > 0 ? (totalProfitBRL / totalNetDeposited) * 100 : 0;

  // Handler de reclassificação rápida 1-clique de gaveta
  const handleQuickReclassify = (txId: string, newBucket: InvestmentBucket) => {
    const targetTx = transactions.find((t) => t.id === txId);
    if (!targetTx) return;

    // Aciona efeito de flash suave na linha
    setFlashingRowId(txId);
    setTimeout(() => setFlashingRowId(null), 1200);

    const updatedTx: Partial<Transaction> = {
      ...targetTx,
      id: targetTx.id,
      investmentBucket: newBucket,
      // Se migrou para Bitcoin e não tinha cotação de entrada, preenche com cotação atual
      entryQuotePrice: newBucket === "BTC" && !targetTx.entryQuotePrice ? btcPrice : targetTx.entryQuotePrice,
      updatedAt: new Date().toISOString()
    };

    onSaveTransaction(updatedTx, true);
    notify?.(
      "Ativo Reclassificado",
      `Lançamento movido para a gaveta ${BUCKET_CONFIG[newBucket].label}.`,
      "success"
    );
  };

  // Abre modal para novo aporte ou resgate
  const handleOpenModal = (type: "Aporte" | "Resgate", defaultBucket: InvestmentBucket = "CDI") => {
    setModalTxType(type);
    setModalBucket(defaultBucket);
    setModalTicker(defaultBucket === "BTC" ? "BTC" : defaultBucket === "CDI" ? "Caixinha 115%" : "");
    setModalAmount("");
    setModalDate(todayBR());
    setModalBank(banks[0]?.name || "Nubank");
    setModalEntryQuote(defaultBucket === "BTC" ? String(Math.round(btcPrice)) : "");
    setIsModalOpen(true);
  };

  // Submissão do modal de aporte/resgate
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(modalAmount.replace(/\./g, "").replace(",", "."));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      notify?.("Valor Inválido", "Informe um valor numérico válido maior que zero.", "warning");
      return;
    }

    const parsedEntryQuote = modalEntryQuote ? parseFloat(modalEntryQuote.replace(/\./g, "").replace(",", ".")) : undefined;

    const newTx: Partial<Transaction> = {
      id: `inv-${Date.now()}`,
      date: modalDate,
      description: modalTicker ? `${modalTxType}: ${modalTicker}` : `${modalTxType} em ${BUCKET_CONFIG[modalBucket].label}`,
      amount: parsedAmount,
      category: modalTxType,
      costType: "Variável",
      paymentMethod: "Transferência / PIX",
      bankAccount: modalBank,
      status: "Pago",
      flowType: "INVESTMENT",
      investmentBucket: modalBucket,
      assetTicker: modalTicker || modalBucket,
      entryQuotePrice: modalBucket === "BTC" ? (parsedEntryQuote || btcPrice) : parsedEntryQuote,
      updatedAt: new Date().toISOString()
    };

    onSaveTransaction(newTx, false);
    setIsModalOpen(false);
    notify?.(
      `${modalTxType} Registrado`,
      `${formatBRL(parsedAmount)} alocado em ${BUCKET_CONFIG[modalBucket].label}.`,
      "success"
    );
  };

  // Alternador de gráficos visíveis
  const toggleChartVisibility = (chartKey: string) => {
    let next: string[];
    if (visibleCharts.includes(chartKey)) {
      if (visibleCharts.length <= 1) {
        notify?.("Aviso", "Mantenha ao menos um gráfico ativo no terminal.", "warning");
        return;
      }
      next = visibleCharts.filter((c) => c !== chartKey);
    } else {
      next = [...visibleCharts, chartKey];
    }
    setVisibleCharts(next);
    localStorage.setItem("coindex_visible_market_charts", JSON.stringify(next));
  };

  // Transações exibidas na lista sincronizada (com suporte a filtro por foco)
  const displayedTxs = useMemo(() => {
    if (!focusedBucket) return investmentTxs;
    return investmentTxs.filter((t) => t.resolvedBucket === focusedBucket);
  }, [investmentTxs, focusedBucket]);

  // Dados para o Simulador de Desvalorização do Dinheiro em Papel (Sub-Aba 2)
  const paperCashAmount = bucketSummaries.PAPER_CASH.netDeposited || 1000.0;
  const ipcaAnnualRate = 0.045; // 4,5% a.a.
  const cdiAnnualEffective = (cdiAnnualRate * 1.15) / 100; // ~14,0% a.a.

  const paperSimulationData = useMemo(() => {
    const points: Array<{ year: string; paperPurchasingPower: number; cdiNominal: number }> = [];
    for (let yr = 0; yr <= 5; yr++) {
      // Poder de compra real do papel cai por: (1 / (1 + ipca))^yr
      const purchasingPower = Math.round(paperCashAmount * Math.pow(1 - ipcaAnnualRate, yr) * 100) / 100;
      // Crescimento no CDI líquido estimado (descontando 15% IR sobre os rendimentos)
      const cdiGrowthGross = paperCashAmount * Math.pow(1 + cdiAnnualEffective, yr);
      const profit = cdiGrowthGross - paperCashAmount;
      const cdiLiquid = yr === 0 ? paperCashAmount : Math.round((paperCashAmount + profit * 0.85) * 100) / 100;

      points.push({
        year: yr === 0 ? "Hoje" : `${yr} Ano${yr > 1 ? "s" : ""}`,
        paperPurchasingPower: purchasingPower,
        cdiNominal: cdiLiquid
      });
    }
    return points;
  }, [paperCashAmount, cdiAnnualEffective]);

  return (
    <div className="space-y-6 animate-cupertino-in">
      {/* ==================================================================== */}
      {/* TOPO: PÍLULA SELETORA DE SUB-VISÕES & BOTÕES DE AÇÃO RÁPIDA           */}
      {/* ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
        {/* Pílula Alternadora Estilo Apple com Motion Deslizante */}
        <SlidingSegmentedControl
          options={[
            { id: "portfolio", label: "💎 Carteira de Investimentos & Mercado" },
            { id: "paper", label: "💵 Dinheiro em Papel (Inflação IPCA)" }
          ]}
          value={subView}
          onChange={(val) => setSubView(val as "portfolio" | "paper")}
          size="md"
          activeColor={
            subView === "portfolio"
              ? "bg-[#0A84FF] text-white shadow-md shadow-[#0A84FF]/25 font-bold"
              : "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-bold"
          }
        />

        {/* Ações: Atualizar Cotações + Novos Lançamentos */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchMarketPulse}
            disabled={isLoadingPulse}
            className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer disabled:opacity-50 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-500/20"
            title="Cotações de mercado ao vivo (atualização automática a cada 30 segundos)"
          >
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              <span className="font-bold text-emerald-300">AO VIVO</span>
            </span>
            {isLoadingPulse && <Loader2 className="w-3 h-3 animate-spin text-emerald-300 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal("Resgate")}
            className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Resgatar</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal("Aporte")}
            className="px-3.5 py-2 rounded-xl bg-[#0A84FF] hover:bg-[#0071E3] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-[#0A84FF]/25"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Aporte</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SUB-VISÃO 1: CARTEIRA DE INVESTIMENTOS & MERCADO AO VIVO              */}
      {/* ==================================================================== */}
      {subView === "portfolio" && (
        <div className="space-y-6">
          {/* A. HERO CENTRAL: "THE WEALTH CORE" */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/[0.08] relative overflow-hidden shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#0A84FF] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> The Wealth Core • Total Geral Investido
                </span>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold font-mono text-white tracking-tight tabular-nums ${moneyBlur}`}>
                    <AnimatedBRL value={totalCurrentInvested} />
                  </span>
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold border tabular-nums ${
                      totalProfitBRL >= 0
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {totalProfitBRL >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{totalProfitBRL >= 0 ? "+" : ""}{formatBRL(totalProfitBRL)} ({totalProfitPct >= 0 ? "+" : ""}{totalProfitPct.toFixed(2)}%)</span>
                  </div>
                </div>
              </div>

              {/* Informações de Custo Depositado */}
              <div className="flex items-center gap-4 text-xs sm:text-sm">
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Custo Saído do Bolso</span>
                  <strong className={`text-slate-200 font-mono tabular-nums text-base ${moneyBlur}`}>
                    {formatBRL(totalNetDeposited)}
                  </strong>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Cotação Atual BTC</span>
                  <strong className="text-amber-400 font-mono tabular-nums text-base">
                    {formatBRL(btcPrice)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Barra Multi-Segmentada de Alocação com Animação Fluida */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>Alocação por Categoria de Ativo</span>
                <span>{totalCurrentInvested > 0 ? "100% Alocado" : "Sem aportes"}</span>
              </div>
              <div className="h-3 w-full bg-slate-950/80 rounded-full overflow-hidden flex p-0.5 border border-white/10 shadow-inner">
                {totalCurrentInvested > 0 ? (
                  (Object.keys(BUCKET_CONFIG) as InvestmentBucket[]).map((bucket) => {
                    const bData = bucketSummaries[bucket];
                    const pct = (bData.currentValue / totalCurrentInvested) * 100;
                    if (pct <= 0) return null;
                    return (
                      <div
                        key={bucket}
                        style={{ width: `${pct}%`, backgroundColor: BUCKET_CONFIG[bucket].color }}
                        className="h-full rounded-sm transition-all duration-500 first:rounded-l-full last:rounded-r-full hover:opacity-90"
                        title={`${BUCKET_CONFIG[bucket].label}: ${formatBRL(bData.currentValue)} (${pct.toFixed(1)}%)`}
                      />
                    );
                  })
                ) : (
                  <div className="h-full w-full bg-slate-800 rounded-full" />
                )}
              </div>
            </div>
          </div>

          {/* B. GRID DE GAVETAS / SEGMENTOS (INTERATIVO COM HOVER SPOTLIGHT 144Hz) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["BTC", "CDI", "LCI", "STOCKS"] as InvestmentBucket[]).map((bucket) => {
              const cfg = BUCKET_CONFIG[bucket];
              const bData = bucketSummaries[bucket];
              const isFocused = focusedBucket === bucket;
              const isOtherFocused = focusedBucket !== null && !isFocused;

              return (
                <div
                  key={bucket}
                  onClick={() => setFocusedBucket(isFocused ? null : bucket)}
                  className={`glass-card p-5 rounded-3xl border transition-all duration-200 cursor-pointer relative overflow-hidden select-none ${
                    isFocused
                      ? `${cfg.border} ring-2 ring-[${cfg.color}] shadow-xl bg-slate-900/90`
                      : isOtherFocused
                      ? "border-white/[0.04] opacity-50 hover:opacity-80"
                      : "border-white/[0.08] hover:border-white/20 hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cfg.icon}</span>
                      <strong className="text-sm font-bold text-white">{cfg.label}</strong>
                    </div>
                    {isFocused && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A84FF] text-white">
                        Filtrando
                      </span>
                    )}
                  </div>

                  <div className="pt-3 space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Saldo Atualizado</span>
                      <strong className={`text-xl font-bold font-mono tabular-nums text-white block ${moneyBlur}`}>
                        <AnimatedBRL value={bData.currentValue} />
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                      <span className="text-slate-400">Depositado:</span>
                      <span className={`font-mono tabular-nums text-slate-200 ${moneyBlur}`}>
                        {formatBRL(bData.netDeposited)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Rendimento:</span>
                      <span
                        className={`font-mono font-bold tabular-nums ${
                          bData.profitBRL >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {bData.profitBRL >= 0 ? "+" : ""}{formatBRL(bData.profitBRL)} ({bData.profitPct >= 0 ? "+" : ""}{bData.profitPct.toFixed(1)}%)
                      </span>
                    </div>

                    {bucket === "BTC" && bData.cryptoUnits !== undefined && (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300 flex items-center justify-between mt-2">
                        <span>Saldo Cripto:</span>
                        <strong className="font-bold">{bData.cryptoUnits.toFixed(6)} BTC</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* C. TERMINAL DE MERCADO AO VIVO (MULTI-CHARTS SIMULTÂNEOS) */}
          <div className="glass-card p-6 sm:p-7 rounded-3xl border border-white/[0.08] space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0A84FF]" />
                  Terminal de Mercado Ao Vivo (Multi-Charts Simultâneos)
                </h3>
                <p className="text-xs text-slate-400">
                  Cotações em tempo real e séries temporais de ativos cripto, macroeconômicos e câmbio.
                </p>
              </div>

              {/* Botões de Ação: Selecionar Janela + Customizar Gráficos */}
              <div className="flex items-center gap-3">
                <SlidingSegmentedControl
                  options={[
                    { id: "24H", label: "24H" },
                    { id: "7D", label: "7D" },
                    { id: "1M", label: "1M" },
                    { id: "1Y", label: "1Y" }
                  ]}
                  value={selectedChartRange}
                  onChange={(val) => setSelectedChartRange(val as "24H" | "7D" | "1M" | "1Y")}
                  size="xs"
                  activeColor="bg-white/20 text-white"
                />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsChartsSettingsOpen(!isChartsSettingsOpen)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Personalizar Gráficos ({visibleCharts.length})</span>
                  </button>

                  {/* Popover de Customização de Gráficos */}
                  {isChartsSettingsOpen && (
                    <div className="absolute right-0 top-10 w-72 p-4 rounded-2xl bg-slate-900 border border-white/15 shadow-2xl z-30 space-y-3 animate-cupertino-in">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <strong className="text-xs font-bold text-white">Ativos Visíveis no Painel</strong>
                        <button
                          type="button"
                          onClick={() => setIsChartsSettingsOpen(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-60 overflow-y-auto">
                        {ALL_AVAILABLE_MARKET_CHARTS.map((item) => {
                          const isChecked = visibleCharts.includes(item.key);
                          return (
                            <label
                              key={item.key}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer text-xs text-slate-200"
                            >
                              <span className="flex items-center gap-2">
                                <span>{item.icon}</span>
                                <span>{item.name}</span>
                              </span>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleChartVisibility(item.key)}
                                className="rounded text-[#0A84FF] focus:ring-0 cursor-pointer"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grid dos Cards de Gráficos Ativos */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleCharts.map((key) => {
                const ticker: MarketTickerItem | undefined = marketPulse?.tickers[key as keyof typeof marketPulse.tickers];
                if (!ticker) return null;

                const isPositive = ticker.change24hPct >= 0;
                const strokeColor = isPositive ? "#30D158" : "#FF453A";
                const gradientId = `grad-${key}`;

                return (
                  <div
                    key={key}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08] relative group flex flex-col justify-between market-heartbeat-flash cupertino-card-hover"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative flex items-center justify-center w-2.5 h-2.5 shrink-0" title="Cotação Ao Vivo">
                            <span
                              className={`absolute w-full h-full rounded-full animate-ping opacity-75 ${
                                isPositive ? "bg-[#30D158]" : "bg-[#FF453A]"
                              }`}
                            />
                            <span
                              className={`relative w-2 h-2 rounded-full ${
                                isPositive ? "bg-[#30D158]" : "bg-[#FF453A]"
                              } shadow-[0_0_8px_currentColor]`}
                            />
                          </div>
                          <strong className="text-sm font-bold text-white">{ticker.name}</strong>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                            {ticker.symbol}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleChartVisibility(key)}
                          className="w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                          title="Remover gráfico do painel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-xl font-mono font-extrabold text-white tabular-nums">
                          {key === "CDI" ? `${ticker.priceBRL.toFixed(2)}% a.a.` : formatBRL(ticker.priceBRL)}
                        </span>
                        <span
                          className={`text-xs font-mono font-bold tabular-nums flex items-center gap-0.5 ${
                            isPositive ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {isPositive ? "+" : ""}{ticker.change24hPct.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Gráfico Recharts AreaChart com Scrubbing Sincronizado Crosshair Laser */}
                    <div className="h-28 w-full mt-3 relative select-none">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ticker.history} syncId="coindex_market_sync">
                          <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
                              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="time" hide />
                          <YAxis domain={["dataMin", "dataMax"]} hide />
                          <Tooltip
                            cursor={{ stroke: "#0A84FF", strokeWidth: 1.5, strokeDasharray: "4 3" }}
                            content={({ active, payload }) => {
                              if (!active || !payload || !payload.length) return null;
                              const val = Number(payload[0].value);
                              return (
                                <div className="p-2 rounded-xl bg-slate-900 border border-white/15 text-[11px] font-mono text-white shadow-xl">
                                  <span className="text-slate-400 block">{payload[0].payload.time}</span>
                                  <strong className="text-white block font-bold">
                                    {key === "CDI" ? `${val.toFixed(2)}%` : formatBRL(val)}
                                  </strong>
                                </div>
                              );
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="price"
                            stroke={strokeColor}
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-white/5 font-mono">
                      <span>Mín: {key === "CDI" ? `${ticker.low24h.toFixed(2)}%` : formatBRL(ticker.low24h)}</span>
                      <span>Máx: {key === "CDI" ? `${ticker.high24h.toFixed(2)}%` : formatBRL(ticker.high24h)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* D. SEÇÃO: MEUS APORTES & RESGATES SINCRONIZADOS (COM RECLASSIFICAÇÃO 1-CLIQUE) */}
          <div className="glass-card p-6 sm:p-7 rounded-3xl border border-white/[0.08] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Meus Aportes & Resgates Sincronizados ({displayedTxs.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Lançamentos integrados bidirecionalmente com a tabela principal. Alterne gavetas em 1 clique abaixo.
                </p>
              </div>

              {focusedBucket && (
                <button
                  type="button"
                  onClick={() => setFocusedBucket(null)}
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition cursor-pointer"
                >
                  Limpar Filtro ({BUCKET_CONFIG[focusedBucket].label}) ✕
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-slate-950/60 text-slate-400">
                    <th className="py-3 px-3">Data</th>
                    <th className="py-3 px-3">Descrição / Ativo</th>
                    <th className="py-3 px-3">Instituição</th>
                    <th className="py-3 px-3">Valor</th>
                    <th className="py-3 px-3 text-center">Classificação Rápida (1-Clique)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {displayedTxs.length > 0 ? (
                    displayedTxs.map((t) => {
                      const isFlashing = flashingRowId === t.id;
                      return (
                        <tr
                          key={t.id}
                          className={`transition-all duration-300 hover:bg-white/[0.03] ${
                            isFlashing ? "bg-emerald-500/20" : ""
                          }`}
                        >
                          <td className="py-3 px-3 font-mono tabular-nums text-slate-300">
                            {formatDateBR(t.date)}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-white block">{t.description}</span>
                            {t.resolvedBucket === "BTC" && t.entryQuotePrice && (
                              <span className="text-[10px] text-amber-300/80 font-mono">
                                Compra: {formatBRL(t.entryQuotePrice)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-300">{t.bankAccount || "Conta Principal"}</td>
                          <td className="py-3 px-3 font-mono font-bold tabular-nums">
                            <span className={t.isAporte ? "text-emerald-400" : "text-rose-400"}>
                              {t.isAporte ? "+ " : "- "}
                              {formatBRL(t.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {(["CDI", "BTC", "LCI", "STOCKS", "PAPER_CASH"] as InvestmentBucket[]).map((b) => {
                                const isCurrent = t.resolvedBucket === b;
                                const cfg = BUCKET_CONFIG[b];
                                return (
                                  <button
                                    key={b}
                                    type="button"
                                    onClick={() => handleQuickReclassify(t.id, b)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                                      isCurrent
                                        ? "bg-white text-slate-950 font-bold shadow-sm"
                                        : "bg-white/5 hover:bg-white/10 text-slate-400"
                                    }`}
                                    title={`Mover para ${cfg.label}`}
                                  >
                                    <span>{cfg.icon}</span>
                                    <span>{cfg.shortLabel}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Nenhum lançamento de investimento encontrado. Clique em "+ Novo Aporte" acima para começar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-VISÃO 2: DINHEIRO EM PAPEL (SIMULADOR DE DESVALORIZAÇÃO IPCA)     */}
      {/* ==================================================================== */}
      {subView === "paper" && (
        <div className="space-y-6">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/[0.08] relative overflow-hidden space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Simulador de Corrosão Inflacionária Real
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  O Custo Invisível do Dinheiro Guardado em Papel
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
                  O dinheiro físico debaixo do colchão perde poder de compra continuamente pela inflação oficial (IPCA ~4,5% a.a.) enquanto deixa de render na Caixinha 115% do CDI (~14,0% a.a.).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-[10px] text-amber-300 uppercase tracking-wider block font-semibold">Total em Espécie Guardado</span>
                <strong className={`text-2xl font-bold font-mono text-white tabular-nums ${moneyBlur}`}>
                  {formatBRL(paperCashAmount)}
                </strong>
              </div>
            </div>

            {/* 3 Cards de Projeção no Tempo (1, 3 e 5 Anos) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <strong className="text-sm font-bold text-white">Horizonte de 1 Ano</strong>
                  <span className="text-xs font-mono text-rose-400 font-bold">-4,5% IPCA</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Poder de Compra Real:</span>
                    <strong className="font-mono text-rose-300">{formatBRL(paperCashAmount * (1 - ipcaAnnualRate))}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Se estivesse na Caixinha:</span>
                    <strong className="font-mono text-emerald-400">{formatBRL(paperCashAmount * (1 + cdiAnnualEffective * 0.85))}</strong>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-[11px] text-amber-300/80 font-mono">
                    Perda Real vs. CDI: ~{formatBRL(paperCashAmount * (cdiAnnualEffective * 0.85 + ipcaAnnualRate))}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <strong className="text-sm font-bold text-white">Horizonte de 3 Anos</strong>
                  <span className="text-xs font-mono text-rose-400 font-bold">-12,9% IPCA</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Poder de Compra Real:</span>
                    <strong className="font-mono text-rose-300">{formatBRL(paperCashAmount * Math.pow(1 - ipcaAnnualRate, 3))}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Se estivesse na Caixinha:</span>
                    <strong className="font-mono text-emerald-400">{formatBRL(paperCashAmount * (1 + (Math.pow(1 + cdiAnnualEffective, 3) - 1) * 0.85))}</strong>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-[11px] text-amber-300/80 font-mono">
                    Perda Real vs. CDI: ~{formatBRL(paperCashAmount * 0.48)}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <strong className="text-sm font-bold text-white">Horizonte de 5 Anos</strong>
                  <span className="text-xs font-mono text-rose-400 font-bold">-20,7% IPCA</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Poder de Compra Real:</span>
                    <strong className="font-mono text-rose-300">{formatBRL(paperCashAmount * Math.pow(1 - ipcaAnnualRate, 5))}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Se estivesse na Caixinha:</span>
                    <strong className="font-mono text-emerald-400">{formatBRL(paperCashAmount * (1 + (Math.pow(1 + cdiAnnualEffective, 5) - 1) * 0.85))}</strong>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-[11px] text-amber-300/80 font-mono">
                    Perda Real vs. CDI: ~{formatBRL(paperCashAmount * 0.95)}
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico Comparativo: Curva de Desvalorização vs. Curva de Crescimento CDI */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Curva de Poder de Compra (Vermelho) vs. Caixinha 115% CDI (Verde)</span>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Papel Corroído (IPCA)
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Caixinha 115% CDI
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paperSimulationData}>
                    <XAxis dataKey="year" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `R$ ${Math.round(v)}`} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        return (
                          <div className="p-3 rounded-xl bg-slate-900 border border-white/15 text-xs font-mono space-y-1 shadow-xl">
                            <strong className="text-white block border-b border-white/10 pb-1">{payload[0].payload.year}</strong>
                            <div className="text-rose-400">Poder de Compra Real: {formatBRL(Number(payload[0].value))}</div>
                            <div className="text-emerald-400">Se Investido no CDI: {formatBRL(Number(payload[1].value))}</div>
                          </div>
                        );
                      }}
                    />
                    <Line type="monotone" dataKey="paperPurchasingPower" stroke="#FF453A" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="cdiNominal" stroke="#30D158" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL RÁPIDO: NOVO APORTE OU RESGATE DE INVESTIMENTO                 */}
      {/* ==================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-cupertino-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-white/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <strong className="text-base font-bold text-white flex items-center gap-2">
                <span>{modalTxType === "Aporte" ? "➕ Registrar Novo Aporte" : "➖ Registrar Resgate"}</span>
              </strong>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs">
              {/* Seletor de Gaveta */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Gaveta de Ativo / Destino:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(BUCKET_CONFIG) as InvestmentBucket[]).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setModalBucket(b);
                        if (b === "BTC") {
                          setModalTicker("BTC");
                          setModalEntryQuote(String(Math.round(btcPrice)));
                        } else if (b === "CDI") {
                          setModalTicker("Caixinha 115%");
                        }
                      }}
                      className={`p-2 rounded-xl text-left border transition cursor-pointer flex items-center gap-1.5 ${
                        modalBucket === b
                          ? "bg-[#0A84FF]/20 border-[#0A84FF] text-white font-bold"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>{BUCKET_CONFIG[b].icon}</span>
                      <span className="truncate">{BUCKET_CONFIG[b].shortLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticker / Nome do Ativo */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Nome do Ativo ou Aplicação:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BTC, Caixinha Nubank, CDB Inter 115%, LCI BTG"
                  value={modalTicker}
                  onChange={(e) => setModalTicker(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-[#0A84FF]"
                />
              </div>

              {/* Valor e Data */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Valor (R$):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={modalAmount}
                    onChange={(e) => setModalAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono font-bold focus:outline-none focus:border-[#0A84FF]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Data da Operação:
                  </label>
                  <input
                    type="date"
                    required
                    value={toSortableISO(modalDate) || modalDate}
                    onChange={(e) => setModalDate(formatDateBR(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono focus:outline-none focus:border-[#0A84FF]"
                  />
                </div>
              </div>

              {/* Instituição / Banco */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Instituição / Corretora:
                </label>
                <select
                  value={modalBank}
                  onChange={(e) => setModalBank(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-[#0A84FF]"
                >
                  {banks.map((b) => (
                    <option key={b.id} value={b.name} className="bg-slate-900 text-white">
                      {b.name}
                    </option>
                  ))}
                  <option value="Binance" className="bg-slate-900 text-white">Binance</option>
                  <option value="XP Investimentos" className="bg-slate-900 text-white">XP Investimentos</option>
                  <option value="Outro" className="bg-slate-900 text-white">Outro</option>
                </select>
              </div>

              {/* Cotação de Entrada (Se for Bitcoin) */}
              {modalBucket === "BTC" && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-amber-300">
                    <span>Cotação de Entrada BTC (R$):</span>
                    <button
                      type="button"
                      onClick={() => setModalEntryQuote(String(Math.round(btcPrice)))}
                      className="underline text-[10px] hover:text-white"
                    >
                      Usar Cotação Ao Vivo ({formatBRL(btcPrice)})
                    </button>
                  </div>
                  <input
                    type="number"
                    step="1"
                    placeholder={String(Math.round(btcPrice))}
                    value={modalEntryQuote}
                    onChange={(e) => setModalEntryQuote(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-amber-500/30 text-amber-300 font-mono font-bold focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition cursor-pointer ${
                    modalTxType === "Aporte"
                      ? "bg-[#0A84FF] hover:bg-[#0071E3] shadow-[#0A84FF]/25"
                      : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/25"
                  }`}
                >
                  {modalTxType === "Aporte" ? "Confirmar Aporte" : "Confirmar Resgate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
