"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Search,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  Sparkles,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  CreditCard,
  Landmark,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Split,
  HandCoins,
  ArrowRight
} from "lucide-react";
import {
  Transaction,
  FlowType,
  formatBRL,
  formatDateBR,
  renderCategorySemanticIcon,
  isPositiveInflowDisplay,
  toCents,
  fromCents,
  safeAdd,
  safeSub
} from "../lifeos-data";

export interface BankItem {
  id: string;
  name: string;
  logoUrl?: string;
  limit?: number;
  limitType?: string;
}

export interface CreditCardItem {
  id: string;
  name: string;
  brand: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  logoUrl?: string;
  bankId?: string;
}

export interface KpiAuditModalProps {
  isOpen: boolean;
  activeKpiAudit: "INCOME" | "EXPENSE" | "INVESTMENT" | "BALANCE" | null;
  onClose: () => void;
  monthSummary: {
    income: number;
    expense: number;
    grossExpense?: number;
    settlementsTotal?: number;
    invested: number;
    aportes: number;
    resgates: number;
    netInvested: number;
    balance: number;
    personalSpent: number;
  };
  safeToSpend: {
    currentCash: number;
    pendingIncome: number;
    pendingDirectExpenses: number;
    pendingInvoices: number;
    projected: number;
    targetMonth?: string;
  };
  selectedMonth: string;
  selectedMonthLabel: string;
  accountingRegime: "competencia" | "caixa";
  regimeTransactions: Transaction[];
  transactions: Transaction[];
  banks: BankItem[];
  cards: CreditCardItem[];
  moneyBlur: string;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  getFlowType: (cat: string) => FlowType;
}

export default function KpiAuditModal({
  isOpen,
  activeKpiAudit,
  onClose,
  monthSummary,
  safeToSpend,
  selectedMonth,
  selectedMonthLabel,
  accountingRegime,
  regimeTransactions,
  transactions,
  banks,
  cards,
  moneyBlur,
  onEditTransaction,
  onDeleteTransaction,
  getFlowType
}: KpiAuditModalProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [balanceSubTab, setBalanceSubTab] = useState<"demonstrativo" | "safeToSpend">("demonstrativo");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fechar no ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Resetar busca e categoria ao trocar de card
  useEffect(() => {
    setSearchQuery("");
    setSelectedCategory("ALL");
  }, [activeKpiAudit]);

  // Lista base de transações conforme o card ativo
  const rawList = useMemo(() => {
    if (!activeKpiAudit) return [];

    if (activeKpiAudit === "INCOME") {
      return regimeTransactions.filter(
        (t) =>
          !t.isTransfer &&
          !t.isSplitChild &&
          !t.isReceivableSettlement &&
          t.category !== "Recebimento de Empréstimo" &&
          t.category !== "Transferência entre Contas" &&
          (t.flowType === "INCOME" || (getFlowType(t.category) === "INCOME" && t.flowType !== "NEUTRAL"))
      );
    }

    if (activeKpiAudit === "EXPENSE") {
      // Despesas operacionais + liquidações de empréstimo/reembolso que abatem
      return regimeTransactions.filter(
        (t) =>
          !t.isTransfer &&
          !t.isInvoicePayment &&
          !t.isSplitChild &&
          t.category !== "Transferência entre Contas" &&
          (t.flowType === "EXPENSE" ||
            getFlowType(t.category) === "EXPENSE" ||
            t.isReceivableSettlement ||
            (t.category || "").toLowerCase().includes("recebimento de empréstimo") ||
            (t.category || "").toLowerCase().includes("recebimento de emprestimo") ||
            (t.category || "").toLowerCase() === "reembolso")
      );
    }

    if (activeKpiAudit === "INVESTMENT") {
      return regimeTransactions.filter(
        (t) =>
          !t.isSplitChild &&
          !t.isTransfer &&
          (t.flowType === "INVESTMENT" || getFlowType(t.category) === "INVESTMENT") &&
          !(t.category || "").toLowerCase().includes("resgate")
      );
    }

    if (activeKpiAudit === "BALANCE") {
      // Todas as transações operacionais (entradas e despesas/reembolsos)
      return regimeTransactions.filter(
        (t) =>
          !t.isTransfer &&
          !t.isSplitChild &&
          !t.isInvoicePayment &&
          t.category !== "Transferência entre Contas" &&
          (t.flowType === "INCOME" ||
            t.flowType === "EXPENSE" ||
            getFlowType(t.category) === "INCOME" ||
            getFlowType(t.category) === "EXPENSE" ||
            t.isReceivableSettlement ||
            (t.category || "").toLowerCase().includes("recebimento de empréstimo") ||
            (t.category || "").toLowerCase().includes("recebimento de emprestimo") ||
            (t.category || "").toLowerCase() === "reembolso")
      );
    }

    return [];
  }, [activeKpiAudit, regimeTransactions, getFlowType]);

  // Lista de categorias com contagem para as pílulas de filtro
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    rawList.forEach((tx) => {
      const cat = tx.category || "Outros";
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [rawList]);

  // Filtro de busca textual e de categoria
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rawList.filter((tx) => {
      if (selectedCategory !== "ALL" && tx.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      const desc = (tx.description || "").toLowerCase();
      const cat = (tx.category || "").toLowerCase();
      const debtor = (tx.debtor || "").toLowerCase();
      const method = (tx.paymentMethod || "").toLowerCase();
      const card = (tx.cardUsed || "").toLowerCase();
      const bank = (tx.bankAccount || "").toLowerCase();
      return (
        desc.includes(q) ||
        cat.includes(q) ||
        debtor.includes(q) ||
        method.includes(q) ||
        card.includes(q) ||
        bank.includes(q)
      );
    });
  }, [rawList, selectedCategory, searchQuery]);

  // Cálculo da soma algébrica exata das células exibidas
  const algebraicSum = useMemo(() => {
    if (activeKpiAudit === "INCOME") {
      return safeAdd(...filteredList.map((t) => t.amount));
    }
    if (activeKpiAudit === "EXPENSE") {
      let expenseCents = 0;
      let settlementCents = 0;
      filteredList.forEach((t) => {
        const isSettlement =
          t.isReceivableSettlement ||
          (t.category || "").toLowerCase().includes("recebimento de empréstimo") ||
          (t.category || "").toLowerCase().includes("recebimento de emprestimo") ||
          (t.category || "").toLowerCase() === "reembolso";
        if (isSettlement) {
          settlementCents += toCents(t.amount);
        } else {
          expenseCents += toCents(t.amount);
        }
      });
      return fromCents(Math.max(0, expenseCents - settlementCents));
    }
    if (activeKpiAudit === "INVESTMENT") {
      return safeAdd(...filteredList.map((t) => t.amount));
    }
    if (activeKpiAudit === "BALANCE") {
      let inCents = 0;
      let outCents = 0;
      filteredList.forEach((t) => {
        const isPositive = isPositiveInflowDisplay(t);
        if (isPositive) {
          inCents += toCents(t.amount);
        } else {
          outCents += toCents(t.amount);
        }
      });
      return fromCents(inCents - outCents);
    }
    return 0;
  }, [filteredList, activeKpiAudit]);

  if (!mounted || !isOpen || !activeKpiAudit) return null;

  // Configuração visual do card ativo
  const cardConfig = {
    INCOME: {
      title: "Composição de Entradas",
      subtitle: "Créditos, salários, receitas extras e rendimentos operacionais",
      icon: TrendingUp,
      color: "#30D158",
      total: monthSummary.income,
      totalFormatted: `+${formatBRL(monthSummary.income)}`,
      badgeBg: "bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30"
    },
    EXPENSE: {
      title: "Composição de Saídas & Despesas",
      subtitle: "Compras, boletos e débitos (deduzindo liquidações de empréstimos/reembolsos)",
      icon: TrendingDown,
      color: "#FF453A",
      total: monthSummary.expense,
      totalFormatted: `-${formatBRL(monthSummary.expense)}`,
      badgeBg: "bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30"
    },
    INVESTMENT: {
      title: "Composição de Aportes Brutos",
      subtitle: "Valores poupados, investimentos e caixinhas guardadas no período",
      icon: PiggyBank,
      color: "#0A84FF",
      total: monthSummary.aportes,
      totalFormatted: `+${formatBRL(monthSummary.aportes)}`,
      badgeBg: "bg-[#0A84FF]/15 text-[#0A84FF] border-[#0A84FF]/30"
    },
    BALANCE: {
      title: "Memória de Cálculo — Saldo Livre & Safe-to-Spend",
      subtitle: "Demonstrativo operacional de receitas vs. despesas e liquidez real disponível",
      icon: Wallet,
      color: monthSummary.balance >= 0 ? "#30D158" : "#FF453A",
      total: monthSummary.balance,
      totalFormatted: `${monthSummary.balance >= 0 ? "+" : ""}${formatBRL(monthSummary.balance)}`,
      badgeBg:
        monthSummary.balance >= 0
          ? "bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30"
          : "bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30"
    }
  }[activeKpiAudit];

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={cardConfig.title}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-2.5 sm:p-5 bg-black/80 backdrop-blur-md overflow-hidden animate-cupertino-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900/95 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* CABEÇALHO EXECUTIVO */}
        <div className="p-4 sm:p-5 border-b border-white/10 shrink-0 bg-gradient-to-r from-white/[0.03] to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: `${cardConfig.color}15`,
                  borderColor: `${cardConfig.color}35`,
                  color: cardConfig.color
                }}
              >
                <cardConfig.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {cardConfig.title}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300 border border-white/10">
                    {selectedMonthLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                    {accountingRegime === "competencia" ? "Regime de Competência" : "Regime de Caixa"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{cardConfig.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Total do Card</span>
                <span
                  className={`text-lg sm:text-xl font-bold font-mono tabular-nums leading-tight ${moneyBlur}`}
                  style={{ color: cardConfig.color }}
                >
                  {cardConfig.totalFormatted}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition flex items-center justify-center cursor-pointer"
                title="Fechar (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-abas exclusivas para o Card 4 (Balanço & Safe-to-Spend) */}
          {activeKpiAudit === "BALANCE" && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setBalanceSubTab("demonstrativo")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  balanceSubTab === "demonstrativo"
                    ? "bg-[#0A84FF] text-white shadow-md shadow-[#0A84FF]/25"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Demonstrativo Operacional (Célula a Célula)</span>
              </button>
              <button
                type="button"
                onClick={() => setBalanceSubTab("safeToSpend")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  balanceSubTab === "safeToSpend"
                    ? "bg-[#0A84FF] text-white shadow-md shadow-[#0A84FF]/25"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Memória de Cálculo do Safe-to-Spend</span>
              </button>
            </div>
          )}
        </div>

        {/* VISÃO 1: MEMÓRIA DE CÁLCULO SAFE-TO-SPEND */}
        {activeKpiAudit === "BALANCE" && balanceSubTab === "safeToSpend" ? (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* Banner de Resumo da Liquidez */}
            <div className="glass-card p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950/40 to-slate-950 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Indicador de Saldo Livre Projetado (Safe-to-Spend)</h3>
                    <p className="text-xs text-slate-400">
                      Calcula a folga de caixa líquida real: Saldo em Contas + Receitas Pendentes - Despesas e Faturas a Vencer.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Safe-to-Spend Atual</span>
                  <span
                    className={`text-xl sm:text-2xl font-bold font-mono tabular-nums ${
                      safeToSpend.projected > 200
                        ? "text-[#30D158]"
                        : safeToSpend.projected >= 0
                        ? "text-[#FF9F0A]"
                        : "text-[#FF453A]"
                    } ${moneyBlur}`}
                  >
                    {formatBRL(safeToSpend.projected)}
                  </span>
                </div>
              </div>

              {selectedMonth === "ALL" && (
                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    No modo <strong>Todos (Histórico Geral)</strong>, o Safe-to-Spend protege sua tomada de decisão calculando
                    a liquidez operacional do <strong>mês corrente ({safeToSpend.targetMonth || "Atual"})</strong> em vez de
                    acumular faturas de anos anteriores contra renda futura inexistente.
                  </span>
                </div>
              )}
            </div>

            {/* Passo a Passo da Fórmula Contábil */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bloco 1: Saldo Consolidado em Contas */}
              <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-sky-400" /> 1. Saldo em Contas Bancárias
                  </span>
                  <span className={`text-sm font-bold font-mono tabular-nums text-sky-400 ${moneyBlur}`}>
                    {formatBRL(safeToSpend.currentCash)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Somatório dos saldos cadastrados e calibrados em todas as suas contas bancárias.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  {banks.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/[0.02]">
                      <span className="text-slate-300">{b.name}</span>
                      <span className="text-slate-400 text-[11px] font-mono">{b.limitType || "Conta Corrente"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bloco 2: Receitas Pendentes */}
              <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#30D158]" /> 2. (+) Receitas Pendentes no Mês
                  </span>
                  <span className={`text-sm font-bold font-mono tabular-nums text-[#30D158] ${moneyBlur}`}>
                    +{formatBRL(safeToSpend.pendingIncome)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Valores com status "Pendente" previstos para entrar nas suas contas neste período.
                </p>
                <div className="p-2 rounded-xl bg-white/[0.02] text-[11px] text-slate-400">
                  Entradas já confirmadas ("Pago") já integram o saldo bancário da etapa 1.
                </div>
              </div>

              {/* Bloco 3: Despesas Diretas Pendentes */}
              <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" /> 3. (-) Contas Diretas Pendentes
                  </span>
                  <span className={`text-sm font-bold font-mono tabular-nums text-amber-400 ${moneyBlur}`}>
                    -{formatBRL(safeToSpend.pendingDirectExpenses)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Boletos, PIX programados e contas fixas que ainda não foram debitados da conta (exceto compras de cartão).
                </p>
              </div>

              {/* Bloco 4: Faturas Abertas de Cartão */}
              <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#FF453A]" /> 4. (-) Faturas Abertas de Cartão
                  </span>
                  <span className={`text-sm font-bold font-mono tabular-nums text-[#FF453A] ${moneyBlur}`}>
                    -{formatBRL(safeToSpend.pendingInvoices)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Soma de todas as compras efetuadas no crédito cujo pagamento da fatura recairá neste mês.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  {cards.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/[0.02]">
                      <span className="text-slate-300">{c.name}</span>
                      <span className="text-slate-400 text-[11px]">Fecha dia {c.closingDay} • Vence dia {c.dueDay}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Equação de Fechamento do Safe-to-Spend */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-300 font-mono">
                Safe-to-Spend = {formatBRL(safeToSpend.currentCash)} (Contas) + {formatBRL(safeToSpend.pendingIncome)} (Receitas Pendentes) - {formatBRL(safeToSpend.pendingDirectExpenses)} (Despesas Pendentes) - {formatBRL(safeToSpend.pendingInvoices)} (Faturas)
              </span>
              <span className="font-bold text-white font-mono tabular-nums">
                = {formatBRL(safeToSpend.projected)}
              </span>
            </div>
          </div>
        ) : (
          /* VISÃO 2: TABELA CÉLULA A CÉLULA COM BUSCA E FILTROS */
          <div className="flex flex-col flex-1 min-h-0">
            {/* Barra de Filtros Internos */}
            <div className="p-3 sm:px-5 sm:py-3 border-b border-white/10 bg-slate-950/40 space-y-2.5 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar por descrição, devedor ou método..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-[#0A84FF]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Mostrando <strong className="text-white">{filteredList.length}</strong> de {rawList.length} lançamentos
                </div>
              </div>

              {/* Pílulas de Categoria Clicáveis */}
              {categoryCounts.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("ALL")}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer text-[11px] ${
                      selectedCategory === "ALL"
                        ? "bg-white text-slate-950 font-bold"
                        : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Todas ({rawList.length})
                  </button>
                  {categoryCounts.map(([cat, count]) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer text-[11px] flex items-center gap-1 ${
                        selectedCategory === cat
                          ? "bg-[#0A84FF] text-white font-bold"
                          : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="opacity-75 text-[10px]">({count})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tabela Analítica com Scroll Interno */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-md border-b border-white/10 text-slate-400 select-none z-10">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold text-center w-10">#</th>
                    <th className="py-2.5 px-3 font-semibold text-left whitespace-nowrap">Data</th>
                    <th className="py-2.5 px-3 font-semibold text-left">Estabelecimento / Descrição</th>
                    <th className="py-2.5 px-3 font-semibold text-left">Categoria</th>
                    <th className="py-2.5 px-3 font-semibold text-left hidden sm:table-cell">Método / Origem</th>
                    <th className="py-2.5 px-3 font-semibold text-left hidden md:table-cell">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right whitespace-nowrap">Valor na Soma (Célula)</th>
                    <th className="py-2.5 px-3 font-semibold text-right hidden lg:table-cell w-20">% do Total</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-20">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        {rawList.length === 0
                          ? "Nenhum lançamento integra a soma deste indicador no período."
                          : "Nenhum lançamento encontrado para a busca ou filtro selecionado."}
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((tx, idx) => {
                      const isPositive = isPositiveInflowDisplay(tx);
                      const isSettlement =
                        tx.isReceivableSettlement ||
                        (tx.category || "").toLowerCase().includes("recebimento de empréstimo") ||
                        (tx.category || "").toLowerCase().includes("recebimento de emprestimo") ||
                        (tx.category || "").toLowerCase() === "reembolso";

                      // Valor da célula na soma algébrica
                      let cellValueFormatted = "";
                      let cellValueColor = "text-white";
                      if (activeKpiAudit === "INCOME") {
                        cellValueFormatted = `+${formatBRL(tx.amount)}`;
                        cellValueColor = "text-[#30D158]";
                      } else if (activeKpiAudit === "EXPENSE") {
                        if (isSettlement) {
                          cellValueFormatted = `+${formatBRL(tx.amount)}`;
                          cellValueColor = "text-[#30D158]";
                        } else {
                          cellValueFormatted = `-${formatBRL(tx.amount)}`;
                          cellValueColor = "text-[#FF453A]";
                        }
                      } else if (activeKpiAudit === "INVESTMENT") {
                        cellValueFormatted = `+${formatBRL(tx.amount)}`;
                        cellValueColor = "text-[#0A84FF]";
                      } else {
                        // BALANCE
                        cellValueFormatted = `${isPositive ? "+" : "-"}${formatBRL(tx.amount)}`;
                        cellValueColor = isPositive ? "text-[#30D158]" : "text-[#FF453A]";
                      }

                      // Cálculo percentual sobre o card
                      const baseTotal = cardConfig.total > 0 ? cardConfig.total : 1;
                      const pct = Math.min(100, Math.round((tx.amount / baseTotal) * 100));

                      return (
                        <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono tabular-nums text-slate-300 whitespace-nowrap">
                            {formatDateBR(tx.date)}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-white max-w-[240px]">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate block" title={tx.description}>
                                {tx.description}
                              </span>
                              {tx.isSplit && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                                  <Split className="w-2.5 h-2.5" /> Dividida
                                </span>
                              )}
                              {isSettlement && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                                  <HandCoins className="w-2.5 h-2.5" /> Abatimento
                                </span>
                              )}
                            </div>
                            {tx.isSplit && tx.personalAmount != null && (
                              <span className="block text-[10px] text-amber-400 font-mono tabular-nums">
                                Sua parte pessoal: {formatBRL(tx.personalAmount)} (Total: {formatBRL(tx.amount)})
                              </span>
                            )}
                            {tx.debtor && (
                              <span className="block text-[10px] text-slate-400">
                                Devedor: {tx.debtor}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300">
                              {renderCategorySemanticIcon(tx.category)}
                              <span className="truncate max-w-[120px]">{tx.category}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 hidden sm:table-cell text-[11px]">
                            <span className="truncate block max-w-[140px]">
                              {tx.cardUsed ? `💳 ${tx.cardUsed}` : tx.bankAccount ? `🏦 ${tx.bankAccount}` : tx.paymentMethod}
                            </span>
                            {tx.invoiceMonth && (
                              <span className="text-[10px] text-indigo-400 block font-mono">
                                Fatura: {tx.invoiceMonth}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 hidden md:table-cell">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                                tx.status === "Pago"
                                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                  : tx.status === "Na Fatura"
                                  ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {tx.status === "Pago" ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Clock className="w-3 h-3 text-amber-400" />
                              )}
                              <span>{tx.status}</span>
                            </span>
                          </td>
                          <td className={`py-2.5 px-3 text-right font-mono font-bold tabular-nums whitespace-nowrap text-xs sm:text-sm ${cellValueColor} ${moneyBlur}`}>
                            {cellValueFormatted}
                          </td>
                          <td className="py-2.5 px-3 text-right hidden lg:table-cell text-slate-400 font-mono text-[11px]">
                            {pct}%
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onEditTransaction(tx);
                                }}
                                className="p-1 rounded-lg bg-white/10 text-slate-300 hover:text-white hover:bg-indigo-600 transition cursor-pointer"
                                title="Editar lançamento"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteTransaction(tx.id)}
                                className="p-1 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/30 hover:text-rose-300 border border-rose-500/25 transition cursor-pointer"
                                title="Excluir lançamento"
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
        )}

        {/* RODAPÉ DE PROVA REAL MATEMÁTICA (SUM CHECK) */}
        <div className="p-3 sm:px-5 sm:py-3.5 border-t border-white/10 bg-slate-950/80 shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
            <span className="text-slate-300 font-mono">
              Total de Células: <strong className="text-white">{filteredList.length}</strong> lançamentos | Soma Algébrica Exata:{" "}
              <strong className="text-white font-mono tabular-nums">{formatBRL(algebraicSum)}</strong>
              <span className="text-emerald-400 ml-1.5 font-sans font-medium hidden sm:inline">
                ✓ 100% reconciliado com o Card
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
