"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Layers,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  ChevronDown
} from "lucide-react";
import {
  Transaction,
  CreditCardItem as CreditCardType,
  FlowType,
  formatBRL,
  formatDateBR,
  parseInstallmentInfo,
  renderCategorySemanticIcon
} from "./lifeos-data";

export type TxSortKey = "date" | "description" | "category" | "costType" | "paymentMethod" | "km" | "status" | "amount";
export type SortDirection = "asc" | "desc";

export interface TxColumnFilters {
  categories: string[];
  costTypes: string[];
  methods: string[];
  statuses: string[];
  hasKmOnly: boolean;
  minAmount: string;
  maxAmount: string;
  dateQuery: string;
}

export interface TransactionsTableAdvancedProps {
  filteredTransactions: Transaction[];
  cards: CreditCardType[];
  categoryColors: Record<string, string>;
  moneyBlur: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleExportCSV: () => void;
  handleOpenNewTxModal: () => void;
  handleToggleStatus: (tx: Transaction) => void;
  handleStartEditTransaction: (tx: Transaction) => void;
  handleDeleteTransaction: (id: string) => void;
  getFlowType: (cat: string) => FlowType;
}

// ==============================================================================
// COMPONENTE LINHA MEMOIZADA (React.memo para Alta Performance)
// ==============================================================================
interface TransactionRowProps {
  tx: Transaction;
  flow: FlowType;
  displayLogo?: string;
  catColor: string;
  moneyBlur: string;
  onToggleStatus: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionRow = React.memo<TransactionRowProps>(({
  tx,
  flow,
  displayLogo,
  catColor,
  moneyBlur,
  onToggleStatus,
  onEdit,
  onDelete
}) => {
  const inst = parseInstallmentInfo(tx);
  const label = tx.installmentInfo || (inst.current && inst.total ? `${inst.current}/${inst.total}` : null);
  const displayName = inst.isInstallment && label ? inst.baseDescription : tx.description;

  return (
    <tr className="hover:bg-white/[0.03] transition-colors">
      {/* Data Formatada com DD/MM/AAAA */}
      <td className="py-3.5 px-3 font-mono tabular-nums text-slate-300 whitespace-nowrap">
        {formatDateBR(tx.date)}
      </td>

      {/* Descrição & Selo de Parcela */}
      <td className="py-3.5 px-3 font-semibold text-slate-100">
        <div className="flex items-center gap-2.5">
          {displayLogo ? (
            <img
              src={displayLogo}
              alt="Ícone"
              className="w-7 h-7 rounded-xl object-cover border border-white/15 shrink-0"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${catColor}20`, border: `1px solid ${catColor}45` }}
            >
              {renderCategorySemanticIcon(tx.category, catColor)}
            </div>
          )}
          <div>
            <div className="flex items-center flex-wrap gap-1.5">
              <span>{displayName}</span>
              {label && (
                <span
                  className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-violet-300 border border-violet-500/30 text-[10px] font-mono tabular-nums inline-flex items-center gap-1 shadow-xs"
                  title={`Parcela ${label}`}
                >
                  <Layers className="w-2.5 h-2.5 text-violet-400 inline" />
                  <span>{label}</span>
                </span>
              )}
              {tx.isSplit && (
                <span
                  className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono tabular-nums inline-flex items-center gap-1 shadow-xs"
                  title={`Gasto dividido com ${tx.thirdPartyName || "alguém"}. Sua parte: ${formatBRL(tx.personalAmount ?? (tx.amount - (tx.thirdPartyAmount || 0)))}`}
                >
                  <span>🤝 Dividido</span>
                </span>
              )}
              {tx.isSplitChild && (
                <span
                  className="px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono tabular-nums inline-flex items-center gap-1 shadow-xs"
                  title="Item a receber gerado automaticamente por divisão de gasto"
                >
                  <span>🤝 Divisão a Receber</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Categoria */}
      <td className="py-3.5 px-3">
        <span
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5"
          style={{
            backgroundColor: `${catColor}22`,
            color: catColor,
            border: `1px solid ${catColor}44`
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
          {tx.category}
        </span>
      </td>

      {/* Custo Fixo / Variável */}
      <td className="py-3.5 px-3">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
            tx.costType === "Fixo"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              : "bg-slate-800/80 text-slate-400"
          }`}
        >
          {tx.costType}
        </span>
      </td>

      {/* Método de Pagamento & Conta / Cartão */}
      <td className="py-3.5 px-3">
        {tx.isTransfer || tx.category === "Transferência entre Contas" ? (
          <div>
            <span className="font-semibold text-sky-300 flex items-center gap-1">
              🔄 {tx.sourceBank || tx.bankAccount} ➔ {tx.destinationBank}
            </span>
            <span className="block text-[10px] text-slate-400">Transferência entre Contas</span>
          </div>
        ) : (
          <>
            <span className="font-medium text-slate-200">{tx.paymentMethod}</span>
            {tx.cardUsed && <span className="block text-[10px] text-indigo-400">{tx.cardUsed}</span>}
            {tx.bankAccount && !tx.cardUsed && (
              <span className="block text-[10px] text-sky-400">{tx.bankAccount}</span>
            )}
            {tx.bankAccount && tx.cardUsed && tx.bankAccount !== tx.cardUsed && (
              <span className="block text-[10px] text-slate-400">Banco: {tx.bankAccount}</span>
            )}
          </>
        )}
      </td>

      {/* Odômetro */}
      <td className="py-3.5 px-3 font-mono tabular-nums text-slate-400">
        {tx.km ? `${tx.km.toLocaleString("pt-BR")} km` : "—"}
        {tx.liters ? ` (${tx.liters}L)` : ""}
      </td>

      {/* Situação */}
      <td className="py-3.5 px-3">
        <button
          type="button"
          onClick={() => onToggleStatus(tx)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
            tx.status === "Pago"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
              : "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
          }`}
        >
          {tx.status === "Pago" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {tx.status}
        </button>
      </td>

      {/* Valor */}
      <td
        className={`py-3.5 px-3 text-right font-mono tabular-nums font-extrabold whitespace-nowrap ${moneyBlur} ${
          tx.isTransfer || tx.category === "Transferência entre Contas"
            ? "text-sky-400"
            : flow === "INCOME"
            ? "text-emerald-400"
            : flow === "INVESTMENT"
            ? "text-indigo-400"
            : "text-rose-400"
        }`}
      >
        <div>
          {tx.isTransfer || tx.category === "Transferência entre Contas"
            ? `⇆ ${formatBRL(tx.amount)}`
            : `${flow === "INCOME" ? "+" : "-"} ${formatBRL(tx.amount)}`}
          {tx.isSplit && (
            <span className="block text-[10px] text-amber-400 font-normal font-mono tabular-nums">
              Sua parte: {formatBRL(tx.personalAmount ?? (tx.amount - (tx.thirdPartyAmount || 0)))}
            </span>
          )}
        </div>
      </td>

      {/* Ações */}
      <td className="py-3.5 px-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(tx)}
            className="min-h-[36px] min-w-[36px] p-2 rounded-xl bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/30 transition flex items-center justify-center"
            title="Editar lançamento"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(tx.id)}
            className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 transition flex items-center justify-center"
            title="Excluir lançamento"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
});
TransactionRow.displayName = "TransactionRow";

// ==============================================================================
// TABELA PRINCIPAL DE LANÇAMENTOS OTIMIZADA
// ==============================================================================
export const TransactionsTableAdvanced: React.FC<TransactionsTableAdvancedProps> = ({
  filteredTransactions,
  cards,
  categoryColors,
  moneyBlur,
  searchQuery,
  setSearchQuery,
  handleExportCSV,
  handleOpenNewTxModal,
  handleToggleStatus,
  handleStartEditTransaction,
  handleDeleteTransaction,
  getFlowType
}) => {
  // Configurações de ordenação e filtros
  const [sortConfig, setSortConfig] = useState<{ key: TxSortKey; dir: SortDirection } | null>({
    key: "date",
    dir: "desc"
  });
  const [activeFilterPopover, setActiveFilterPopover] = useState<TxSortKey | null>(null);
  const [txStatusFilter, setTxStatusFilter] = useState<"ALL" | "PAGO" | "PENDENTE">("ALL");
  const [columnFilters, setColumnFilters] = useState<TxColumnFilters>({
    categories: [],
    costTypes: [],
    methods: [],
    statuses: [],
    hasKmOnly: false,
    minAmount: "",
    maxAmount: "",
    dateQuery: ""
  });

  // Janela de Renderização Progressiva (Progressive Windowing / Virtual Slice)
  const INITIAL_BATCH_SIZE = 60;
  const BATCH_INCREMENT = 50;
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH_SIZE);

  // Lista de categorias e métodos únicos para os popovers de filtro
  const allUniqueCategories = useMemo(
    () => Array.from(new Set(filteredTransactions.map((t) => t.category))).sort(),
    [filteredTransactions]
  );
  const allUniqueMethods = useMemo(
    () => Array.from(new Set(filteredTransactions.map((t) => t.paymentMethod))).sort(),
    [filteredTransactions]
  );

  // 1. Filtragem combinada por múltiplas colunas (com useMemo estrito)
  const processedTxs = useMemo(() => {
    let result = filteredTransactions.filter((tx) => {
      // Filtro rápido de situação
      if (txStatusFilter === "PAGO" && tx.status !== "Pago") return false;
      if (txStatusFilter === "PENDENTE" && tx.status === "Pago") return false;

      // Filtro de categorias por coluna
      if (columnFilters.categories.length > 0 && !columnFilters.categories.includes(tx.category)) {
        return false;
      }
      // Filtro de custos por coluna
      if (columnFilters.costTypes.length > 0 && !columnFilters.costTypes.includes(tx.costType)) {
        return false;
      }
      // Filtro de métodos por coluna
      if (columnFilters.methods.length > 0 && !columnFilters.methods.includes(tx.paymentMethod)) {
        return false;
      }
      // Filtro de situações por coluna
      if (columnFilters.statuses.length > 0 && !columnFilters.statuses.includes(tx.status)) {
        return false;
      }
      // Filtro de odômetro
      if (columnFilters.hasKmOnly && (!tx.km || tx.km <= 0)) {
        return false;
      }
      // Filtro de faixa de valor
      if (columnFilters.minAmount && tx.amount < parseFloat(columnFilters.minAmount)) {
        return false;
      }
      if (columnFilters.maxAmount && tx.amount > parseFloat(columnFilters.maxAmount)) {
        return false;
      }
      // Filtro de data
      if (columnFilters.dateQuery) {
        const q = columnFilters.dateQuery.toLowerCase();
        const brDate = formatDateBR(tx.date).toLowerCase();
        if (!brDate.includes(q) && !tx.date.includes(q)) return false;
      }

      return true;
    });

    // 2. Ordenação respeitando o tipo de dado
    if (sortConfig) {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        if (sortConfig.key === "date") {
          cmp = a.date.localeCompare(b.date);
        } else if (sortConfig.key === "amount") {
          cmp = a.amount - b.amount;
        } else if (sortConfig.key === "km") {
          cmp = (a.km || 0) - (b.km || 0);
        } else if (sortConfig.key === "description") {
          cmp = a.description.localeCompare(b.description, "pt-BR");
        } else if (sortConfig.key === "category") {
          cmp = a.category.localeCompare(b.category, "pt-BR");
        } else if (sortConfig.key === "costType") {
          cmp = a.costType.localeCompare(b.costType, "pt-BR");
        } else if (sortConfig.key === "paymentMethod") {
          cmp = a.paymentMethod.localeCompare(b.paymentMethod, "pt-BR");
        } else if (sortConfig.key === "status") {
          cmp = a.status.localeCompare(b.status, "pt-BR");
        }
        return sortConfig.dir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [filteredTransactions, txStatusFilter, columnFilters, sortConfig]);

  // Fatiamento progressivo para evitar freeze do DOM com milhares de itens
  const visibleTxs = useMemo(() => {
    return processedTxs.slice(0, visibleCount);
  }, [processedTxs, visibleCount]);

  const hasMore = visibleCount < processedTxs.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + BATCH_INCREMENT);
  }, []);

  const handleLoadAll = useCallback(() => {
    setVisibleCount(processedTxs.length);
  }, [processedTxs.length]);

  const hasActiveFiltersOrSort =
    txStatusFilter !== "ALL" ||
    columnFilters.categories.length > 0 ||
    columnFilters.costTypes.length > 0 ||
    columnFilters.methods.length > 0 ||
    columnFilters.statuses.length > 0 ||
    columnFilters.hasKmOnly ||
    Boolean(columnFilters.minAmount) ||
    Boolean(columnFilters.maxAmount) ||
    Boolean(columnFilters.dateQuery) ||
    (sortConfig !== null && (sortConfig.key !== "date" || sortConfig.dir !== "desc"));

  const handleClearFiltersAndSort = useCallback(() => {
    setSortConfig({ key: "date", dir: "desc" });
    setTxStatusFilter("ALL");
    setColumnFilters({
      categories: [],
      costTypes: [],
      methods: [],
      statuses: [],
      hasKmOnly: false,
      minAmount: "",
      maxAmount: "",
      dateQuery: ""
    });
    setActiveFilterPopover(null);
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, []);

  const toggleSort = useCallback((key: TxSortKey) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.dir === "asc") {
          return { key, dir: "desc" };
        }
        return null;
      }
      return { key, dir: key === "amount" || key === "km" ? "desc" : "asc" };
    });
  }, []);

  const renderSortArrow = useCallback((key: TxSortKey) => {
    if (sortConfig?.key === key) {
      return sortConfig.dir === "asc" ? (
        <ArrowUp className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
      ) : (
        <ArrowDown className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
      );
    }
    return <ArrowUpDown className="w-3 h-3 text-slate-400 hover:text-slate-200 opacity-70 shrink-0" />;
  }, [sortConfig]);

  // Lookup otimizado de cartões por nome para evitar O(N*M) lookups
  const cardMap = useMemo(() => {
    const map = new Map<string, CreditCardType>();
    cards.forEach((c) => map.set(c.name, c));
    return map;
  }, [cards]);

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-extrabold text-white tracking-tight">Livro Caixa & Lançamentos</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono tabular-nums font-bold">
              {processedTxs.length} de {filteredTransactions.length} registro(s)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Clique nos cabeçalhos para ordenar (cronológico, numérico ou alfabético) ou use o ícone de filtro para combinar critérios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Filtro Rápido de Situação */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-white/10 text-[11px]">
            <Filter className="w-3.5 h-3.5 text-indigo-400 ml-2 mr-1" />
            {[
              { id: "ALL", label: "Todos" },
              { id: "PAGO", label: "Pagos" },
              { id: "PENDENTE", label: "Na Fatura / Pendentes" }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setTxStatusFilter(st.id as "ALL" | "PAGO" | "PENDENTE")}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  txStatusFilter === st.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar descrição, método, pessoa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-950/90 border border-white/10 text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-200 font-bold flex items-center gap-1.5 transition"
            title="Exportar planilha compatível com Microsoft Excel"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" /> Exportar CSV
          </button>

          <button
            type="button"
            onClick={handleOpenNewTxModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Barra de Filtros Ativos e Botão de Limpar */}
      {hasActiveFiltersOrSort && (
        <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filtros e Ordenação Ativos:
            </span>
            {sortConfig && (
              <span className="px-2.5 py-1 rounded-xl bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-[11px] font-semibold flex items-center gap-1">
                Coluna: <strong className="text-white">{sortConfig.key}</strong> (
                {sortConfig.dir === "asc" ? "Crescente ↑" : "Decrescente ↓"})
              </span>
            )}
            {columnFilters.categories.length > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-slate-200 border border-white/10 text-[11px]">
                Categorias ({columnFilters.categories.length})
              </span>
            )}
            {columnFilters.costTypes.length > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-slate-200 border border-white/10 text-[11px]">
                Custo: {columnFilters.costTypes.join(", ")}
              </span>
            )}
            {columnFilters.methods.length > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-slate-200 border border-white/10 text-[11px]">
                Métodos ({columnFilters.methods.length})
              </span>
            )}
            {columnFilters.statuses.length > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-slate-200 border border-white/10 text-[11px]">
                Situação: {columnFilters.statuses.join(", ")}
              </span>
            )}
            {columnFilters.hasKmOnly && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-slate-200 border border-white/10 text-[11px]">
                Com Odômetro
              </span>
            )}
            {(columnFilters.minAmount || columnFilters.maxAmount) && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-slate-200 border border-white/10 text-[11px]">
                Faixa de Valor
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearFiltersAndSort}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-[11px] flex items-center gap-1.5 transition"
            title="Restaurar visualização original em 1 clique"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Limpar ordenação e filtros
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-slate-950/60 text-slate-400">
              {/* 1. DATA */}
              <th className="py-3.5 px-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSort("date")}
                    className="font-bold flex items-center gap-1 hover:text-white transition"
                    title="Clique para ordenar cronologicamente"
                  >
                    <span>Data</span>
                    {renderSortArrow("date")}
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveFilterPopover(activeFilterPopover === "date" ? null : "date")
                      }
                      className={`p-1 rounded hover:bg-white/10 transition ${
                        columnFilters.dateQuery ? "text-indigo-400 bg-indigo-500/20" : "text-slate-400"
                      }`}
                      title="Filtrar por data"
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                    {activeFilterPopover === "date" && (
                      <div className="absolute left-0 mt-2 p-3 w-56 rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-2xl z-50 space-y-2 text-xs">
                        <span className="font-bold text-white block">Filtrar por Data</span>
                        <input
                          type="text"
                          placeholder="Ex: 2026, 10/2026 ou 15/10"
                          value={columnFilters.dateQuery}
                          onChange={(e) =>
                            setColumnFilters({ ...columnFilters, dateQuery: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white outline-none text-xs"
                        />
                        <div className="flex justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => setColumnFilters({ ...columnFilters, dateQuery: "" })}
                            className="text-[10px] text-slate-400 hover:text-rose-400"
                          >
                            Limpar
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveFilterPopover(null)}
                            className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold"
                          >
                            Fechar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </th>

              {/* 2. DESCRIÇÃO */}
              <th className="py-3.5 px-3">
                <button
                  type="button"
                  onClick={() => toggleSort("description")}
                  className="font-bold flex items-center gap-1 hover:text-white transition"
                  title="Clique para ordenar alfabeticamente"
                >
                  <span>Descrição</span>
                  {renderSortArrow("description")}
                </button>
              </th>

              {/* 3. CATEGORIA */}
              <th className="py-3.5 px-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSort("category")}
                    className="font-bold flex items-center gap-1 hover:text-white transition"
                    title="Clique para ordenar por categoria"
                  >
                    <span>Categoria</span>
                    {renderSortArrow("category")}
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveFilterPopover(activeFilterPopover === "category" ? null : "category")
                      }
                      className={`p-1 rounded hover:bg-white/10 transition ${
                        columnFilters.categories.length > 0 ? "text-indigo-400 bg-indigo-500/20" : "text-slate-400"
                      }`}
                      title="Filtrar categorias"
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                    {activeFilterPopover === "category" && (
                      <div className="absolute left-0 mt-2 p-3 w-64 rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-2xl z-50 space-y-2 text-xs">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                          <span className="font-bold text-white">Selecionar Categorias</span>
                          <button
                            type="button"
                            onClick={() => setColumnFilters({ ...columnFilters, categories: [] })}
                            className="text-[10px] text-slate-400 hover:text-rose-400"
                          >
                            Todas
                          </button>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {allUniqueCategories.map((cat) => {
                            const checked = columnFilters.categories.includes(cat);
                            return (
                              <label
                                key={cat}
                                className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    const next = e.target.checked
                                      ? [...columnFilters.categories, cat]
                                      : columnFilters.categories.filter((c) => c !== cat);
                                    setColumnFilters({ ...columnFilters, categories: next });
                                  }}
                                />
                                <span className="truncate">{cat}</span>
                              </label>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveFilterPopover(null)}
                          className="w-full py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-[11px] mt-1"
                        >
                          Concluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </th>

              {/* 4. CUSTO */}
              <th className="py-3.5 px-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSort("costType")}
                    className="font-bold flex items-center gap-1 hover:text-white transition"
                    title="Clique para ordenar por tipo de custo"
                  >
                    <span>Custo</span>
                    {renderSortArrow("costType")}
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveFilterPopover(activeFilterPopover === "costType" ? null : "costType")
                      }
                      className={`p-1 rounded hover:bg-white/10 transition ${
                        columnFilters.costTypes.length > 0 ? "text-indigo-400 bg-indigo-500/20" : "text-slate-400"
                      }`}
                      title="Filtrar fixo ou variável"
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                    {activeFilterPopover === "costType" && (
                      <div className="absolute left-0 mt-2 p-3 w-44 rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-2xl z-50 space-y-2 text-xs">
                        <span className="font-bold text-white block">Tipo de Custo</span>
                        {["Fixo", "Variável"].map((cType) => (
                          <label
                            key={cType}
                            className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={columnFilters.costTypes.includes(cType)}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...columnFilters.costTypes, cType]
                                  : columnFilters.costTypes.filter((c) => c !== cType);
                                setColumnFilters({ ...columnFilters, costTypes: next });
                              }}
                            />
                            <span>{cType}</span>
                          </label>
                        ))}
                        <button
                          type="button"
                          onClick={() => setActiveFilterPopover(null)}
                          className="w-full py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px]"
                        >
                          Fechar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </th>

              {/* 5. MÉTODO */}
              <th className="py-3.5 px-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSort("paymentMethod")}
                    className="font-bold flex items-center gap-1 hover:text-white transition"
                    title="Clique para ordenar por método de pagamento"
                  >
                    <span>Método</span>
                    {renderSortArrow("paymentMethod")}
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveFilterPopover(activeFilterPopover === "paymentMethod" ? null : "paymentMethod")
                      }
                      className={`p-1 rounded hover:bg-white/10 transition ${
                        columnFilters.methods.length > 0 ? "text-indigo-400 bg-indigo-500/20" : "text-slate-400"
                      }`}
                      title="Filtrar métodos"
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                    {activeFilterPopover === "paymentMethod" && (
                      <div className="absolute left-0 mt-2 p-3 w-56 rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-2xl z-50 space-y-2 text-xs">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                          <span className="font-bold text-white">Métodos</span>
                          <button
                            type="button"
                            onClick={() => setColumnFilters({ ...columnFilters, methods: [] })}
                            className="text-[10px] text-slate-400 hover:text-rose-400"
                          >
                            Todos
                          </button>
                        </div>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {allUniqueMethods.map((m) => (
                            <label
                              key={m}
                              className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={columnFilters.methods.includes(m)}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...columnFilters.methods, m]
                                    : columnFilters.methods.filter((item) => item !== m);
                                  setColumnFilters({ ...columnFilters, methods: next });
                                }}
                              />
                              <span className="truncate">{m}</span>
                            </label>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveFilterPopover(null)}
                          className="w-full py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-[10px]"
                        >
                          Fechar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </th>

              {/* 6. ODÔMETRO */}
              <th className="py-3.5 px-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSort("km")}
                    className="font-bold flex items-center gap-1 hover:text-white transition"
                    title="Clique para ordenar por quilometragem"
                  >
                    <span>Odômetro</span>
                    {renderSortArrow("km")}
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveFilterPopover(activeFilterPopover === "km" ? null : "km")
                      }
                      className={`p-1 rounded hover:bg-white/10 transition ${
                        columnFilters.hasKmOnly ? "text-indigo-400 bg-indigo-500/20" : "text-slate-400"
                      }`}
                      title="Filtrar odômetro"
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                    {activeFilterPopover === "km" && (
                      <div className="absolute left-0 mt-2 p-3 w-48 rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-2xl z-50 space-y-2 text-xs">
                        <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={columnFilters.hasKmOnly}
                            onChange={(e) =>
                              setColumnFilters({ ...columnFilters, hasKmOnly: e.target.checked })
                            }
                          />
                          <span>Apenas com Odômetro</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveFilterPopover(null)}
                          className="w-full py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px]"
                        >
                          Fechar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </th>

              {/* 7. SITUAÇÃO */}
              <th className="py-3.5 px-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSort("status")}
                    className="font-bold flex items-center gap-1 hover:text-white transition"
                    title="Clique para ordenar por situação"
                  >
                    <span>Situação</span>
                    {renderSortArrow("status")}
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveFilterPopover(activeFilterPopover === "status" ? null : "status")
                      }
                      className={`p-1 rounded hover:bg-white/10 transition ${
                        columnFilters.statuses.length > 0 ? "text-indigo-400 bg-indigo-500/20" : "text-slate-400"
                      }`}
                      title="Filtrar situação"
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                    {activeFilterPopover === "status" && (
                      <div className="absolute left-0 mt-2 p-3 w-48 rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-2xl z-50 space-y-2 text-xs">
                        <span className="font-bold text-white block">Situação</span>
                        {["Pago", "Pendente / Na Fatura"].map((st) => (
                          <label
                            key={st}
                            className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={columnFilters.statuses.includes(st)}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...columnFilters.statuses, st]
                                  : columnFilters.statuses.filter((item) => item !== st);
                                setColumnFilters({ ...columnFilters, statuses: next });
                              }}
                            />
                            <span className="truncate">{st}</span>
                          </label>
                        ))}
                        <button
                          type="button"
                          onClick={() => setActiveFilterPopover(null)}
                          className="w-full py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px]"
                        >
                          Fechar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </th>

              {/* 8. VALOR */}
              <th className="py-3.5 px-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveFilterPopover(activeFilterPopover === "amount" ? null : "amount")
                      }
                      className={`p-1 rounded hover:bg-white/10 transition ${
                        columnFilters.minAmount || columnFilters.maxAmount
                          ? "text-indigo-400 bg-indigo-500/20"
                          : "text-slate-400"
                      }`}
                      title="Filtrar faixa de valor"
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                    {activeFilterPopover === "amount" && (
                      <div className="absolute right-0 mt-2 p-3 w-52 rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-2xl z-50 space-y-2 text-xs text-left">
                        <span className="font-bold text-white block">Faixa de Valor (R$)</span>
                        <input
                          type="number"
                          placeholder="Mínimo (R$)"
                          value={columnFilters.minAmount}
                          onChange={(e) =>
                            setColumnFilters({ ...columnFilters, minAmount: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white outline-none text-xs tabular-nums"
                        />
                        <input
                          type="number"
                          placeholder="Máximo (R$)"
                          value={columnFilters.maxAmount}
                          onChange={(e) =>
                            setColumnFilters({ ...columnFilters, maxAmount: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white outline-none text-xs tabular-nums"
                        />
                        <div className="flex justify-between pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              setColumnFilters({ ...columnFilters, minAmount: "", maxAmount: "" })
                            }
                            className="text-[10px] text-slate-400 hover:text-rose-400"
                          >
                            Limpar
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveFilterPopover(null)}
                            className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold"
                          >
                            Fechar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSort("amount")}
                    className="font-bold flex items-center gap-1 hover:text-white transition"
                    title="Clique para ordenar por valor"
                  >
                    <span>Valor</span>
                    {renderSortArrow("amount")}
                  </button>
                </div>
              </th>

              {/* 9. AÇÕES */}
              <th className="py-3.5 px-3 text-center">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.05]">
            {processedTxs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400">
                  Nenhum lançamento encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              visibleTxs.map((tx) => {
                const flow = getFlowType(tx.category);
                const matchedCard = tx.cardUsed ? cardMap.get(tx.cardUsed) : undefined;
                const displayLogo = tx.iconUrl ? tx.iconUrl : matchedCard?.logoUrl;
                const catColor = categoryColors[tx.category] || "#6366f1";
                return (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    flow={flow}
                    displayLogo={displayLogo}
                    catColor={catColor}
                    moneyBlur={moneyBlur}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleStartEditTransaction}
                    onDelete={handleDeleteTransaction}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Controle de Renderização Progressiva (Virtual Windowing Controls) */}
      {processedTxs.length > visibleCount && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-white/[0.06]">
          <span className="text-slate-400 font-mono tabular-nums">
            Exibindo <strong className="text-white">{visibleCount}</strong> de{" "}
            <strong className="text-white">{processedTxs.length}</strong> lançamentos filtrados
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadMore}
              className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 font-bold transition flex items-center gap-1.5"
            >
              <ChevronDown className="w-3.5 h-3.5" /> Carregar mais {Math.min(BATCH_INCREMENT, processedTxs.length - visibleCount)}
            </button>
            <button
              type="button"
              onClick={handleLoadAll}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 font-medium transition"
            >
              Exibir Todos ({processedTxs.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsTableAdvanced;
