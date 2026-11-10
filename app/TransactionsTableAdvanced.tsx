"use client";

import React, { useState, useMemo, useCallback, useDeferredValue } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Filter,
  Download,
  Plus,
  Upload,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Layers,
  CheckCircle2,
  Clock,
  CreditCard,
  Pencil,
  Trash2,
  ChevronDown,
  X,
  FileText,
  Check,
  CheckSquare,
  Loader2
} from "lucide-react";
import {
  Transaction,
  CreditCardItem as CreditCardType,
  FlowType,
  TxStatus,
  OFFICIAL_CATEGORIES,
  formatBRL,
  formatDateBR,
  compareDatesBR,
  parseInstallmentInfo,
  renderCategorySemanticIcon,
  normalizeSearchText,
  isPositiveInflowDisplay
} from "./lifeos-data";
import {
  parseBankStatementFile,
  BankIngestResult,
  ParsedBankTransaction
} from "./lib/domain/bank-ingest";
import { SlidingSegmentedControl } from "./components/SlidingSegmentedControl";

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
  handleOpenNewTxModal?: () => void;
  onNewTransaction?: () => void;
  onBatchImportTransactions?: (txs: Transaction[]) => void;
  handleToggleStatus: (tx: Transaction) => void;
  handleStartEditTransaction: (tx: Transaction) => void;
  handleDeleteTransaction: (id: string) => void;
  getFlowType: (cat: string) => FlowType;
  onUpdateSingleTransaction?: (id: string, updates: Partial<Transaction>) => void;
  onBatchUpdateStatus?: (ids: string[], nextStatus: TxStatus) => void;
  onBatchChangeCategory?: (ids: string[], nextCategory: string) => void;
  onBatchDeleteTransactions?: (ids: string[]) => void;
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
  isSelected?: boolean;
  showCheckbox?: boolean;
  onToggleSelect?: (id: string) => void;
  onLongPress?: (id: string) => void;
  onToggleStatus: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onInlineSave?: (id: string, updates: Partial<Transaction>) => void;
}

const TransactionRow = React.memo<TransactionRowProps>(({
  tx,
  flow,
  displayLogo,
  catColor,
  moneyBlur,
  isSelected,
  showCheckbox = false,
  onToggleSelect,
  onLongPress,
  onToggleStatus,
  onEdit,
  onDelete,
  onInlineSave
}) => {
  const inst = parseInstallmentInfo(tx);
  const label = tx.installmentInfo || (inst.current && inst.total ? `${inst.current}/${inst.total}` : null);
  const displayName = inst.isInstallment && label ? inst.baseDescription : tx.description;

  const [inlineField, setInlineField] = useState<"date" | "description" | "category" | "amount" | null>(null);
  const [inlineVal, setInlineVal] = useState<string>("");
  const [justSaved, setJustSaved] = useState<boolean>(false);

  // SPRINT 59: Long-Press de 320ms para seleção rápida
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = () => {
    if (!onLongPress) return;
    longPressTimerRef.current = setTimeout(() => {
      onLongPress(tx.id);
      if (typeof window !== "undefined" && window.navigator?.vibrate) {
        window.navigator.vibrate(40);
      }
    }, 320);
  };

  const handlePointerUpOrCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleCommitInline = (field: "date" | "description" | "category" | "amount", val: string) => {
    setInlineField(null);
    if (!onInlineSave) return;
    if (field === "date") {
      const trimmed = val.trim();
      if (trimmed && trimmed !== tx.date) {
        onInlineSave(tx.id, { date: trimmed });
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 900);
      }
    } else if (field === "description") {
      const trimmed = val.trim();
      if (trimmed && trimmed !== tx.description) {
        onInlineSave(tx.id, { description: trimmed });
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 900);
      }
    } else if (field === "category") {
      const trimmed = val.trim();
      if (trimmed && trimmed !== tx.category) {
        onInlineSave(tx.id, { category: trimmed });
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 900);
      }
    } else if (field === "amount") {
      const parsed = parseFloat(val.replace(/\./g, "").replace(",", "."));
      if (!isNaN(parsed) && parsed > 0 && parsed !== tx.amount) {
        onInlineSave(tx.id, { amount: parsed });
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 900);
      }
    }
  };

  return (
    <tr
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUpOrCancel}
      onPointerLeave={handlePointerUpOrCancel}
      className={`hover:bg-white/[0.03] transition-colors select-none ${
        justSaved ? "bg-emerald-500/20" : isSelected ? "bg-[#0A84FF]/10" : ""
      }`}
    >
      {/* Checkbox de Seleção em Lote (exibido apenas se showCheckbox for true) */}
      {showCheckbox && (
        <td className="py-3.5 pl-3 pr-1 w-8 text-center">
          <input
            type="checkbox"
            checked={Boolean(isSelected)}
            onChange={() => onToggleSelect?.(tx.id)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#0A84FF] focus:ring-0 cursor-pointer"
          />
        </td>
      )}

      {/* Data Formatada com DD/MM/AAAA (Duplo Clique para Editar Inline) */}
      <td
        onDoubleClick={() => {
          setInlineField("date");
          setInlineVal(formatDateBR(tx.date));
        }}
        className="py-3.5 px-3 font-mono tabular-nums text-slate-300 whitespace-nowrap cursor-pointer hover:text-white"
        title="Duplo clique para editar data"
      >
        {inlineField === "date" ? (
          <input
            type="text"
            autoFocus
            value={inlineVal}
            onChange={(e) => setInlineVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCommitInline("date", inlineVal);
              if (e.key === "Escape") setInlineField(null);
            }}
            onBlur={() => handleCommitInline("date", inlineVal)}
            className="w-24 px-1.5 py-0.5 rounded bg-slate-900 border border-[#0A84FF] text-white font-mono text-xs outline-none shadow-sm"
          />
        ) : (
          formatDateBR(tx.date)
        )}
      </td>

      {/* Descrição & Selo de Parcela (Duplo Clique para Editar Inline) */}
      <td
        onDoubleClick={() => {
          setInlineField("description");
          setInlineVal(tx.description);
        }}
        className="py-3.5 px-3 font-semibold text-slate-100 cursor-pointer"
        title="Duplo clique para editar descrição"
      >
        {inlineField === "description" ? (
          <input
            type="text"
            autoFocus
            value={inlineVal}
            onChange={(e) => setInlineVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCommitInline("description", inlineVal);
              if (e.key === "Escape") setInlineField(null);
            }}
            onBlur={() => handleCommitInline("description", inlineVal)}
            className="w-full max-w-xs px-2 py-0.5 rounded bg-slate-900 border border-[#0A84FF] text-white text-xs outline-none shadow-sm"
          />
        ) : (
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
            <div className="min-w-0 flex-1">
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="truncate">{displayName}</span>
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
        )}
      </td>

      {/* Categoria (Duplo Clique para Alterar Categoria Inline) */}
      <td
        onDoubleClick={() => {
          setInlineField("category");
          setInlineVal(tx.category);
        }}
        className="py-3.5 px-3 cursor-pointer"
        title="Duplo clique para alterar categoria"
      >
        {inlineField === "category" ? (
          <select
            autoFocus
            value={inlineVal}
            onChange={(e) => {
              setInlineVal(e.target.value);
              handleCommitInline("category", e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setInlineField(null);
            }}
            onBlur={() => handleCommitInline("category", inlineVal)}
            className="px-2 py-0.5 rounded bg-slate-900 border border-[#0A84FF] text-white text-xs outline-none shadow-sm"
          >
            {OFFICIAL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900 text-white">
                {cat}
              </option>
            ))}
          </select>
        ) : (
          <span
            className="whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium leading-none"
            style={{
              backgroundColor: `${catColor}22`,
              color: catColor,
              border: `1px solid ${catColor}44`
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
            {tx.category}
          </span>
        )}
      </td>

      {/* Custo Fixo / Variável */}
      <td className="py-3.5 px-3">
        <span
          className={`whitespace-nowrap inline-flex items-center justify-center px-2.5 py-0.5 rounded text-xs font-medium leading-none ${
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
          className={`whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium leading-none transition ${
            tx.status === "Pago"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 status-stamp-pop"
              : tx.status === "Na Fatura"
              ? "bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25"
              : "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
          }`}
        >
          {tx.status === "Pago" ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : tx.status === "Na Fatura" ? (
            <CreditCard className="w-3 h-3" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          {tx.status}
        </button>
      </td>

      {/* Valor (Duplo Clique para Editar Inline) */}
      <td
        onDoubleClick={() => {
          setInlineField("amount");
          setInlineVal(String(tx.amount));
        }}
        className={`py-3.5 px-3 text-right font-mono tabular-nums font-extrabold whitespace-nowrap cursor-pointer ${moneyBlur} ${
          tx.isTransfer || tx.category === "Transferência entre Contas"
            ? "text-sky-400"
            : isPositiveInflowDisplay(tx)
            ? "text-[#30D158]"
            : flow === "INVESTMENT"
            ? "text-indigo-400"
            : "text-rose-400"
        }`}
        title="Duplo clique para editar valor"
      >
        {inlineField === "amount" ? (
          <input
            type="text"
            autoFocus
            value={inlineVal}
            onChange={(e) => setInlineVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCommitInline("amount", inlineVal);
              if (e.key === "Escape") setInlineField(null);
            }}
            onBlur={() => handleCommitInline("amount", inlineVal)}
            className="w-24 px-1.5 py-0.5 text-right rounded bg-slate-900 border border-[#0A84FF] text-white font-mono text-xs outline-none shadow-sm"
          />
        ) : (
          <div>
            {tx.isTransfer || tx.category === "Transferência entre Contas"
              ? `⇆ ${formatBRL(tx.amount)}`
              : `${isPositiveInflowDisplay(tx) ? "+" : "-"} ${formatBRL(tx.amount)}`}
            {tx.isSplit && (
              <span className="block text-[10px] text-amber-400 font-normal font-mono tabular-nums">
                Sua parte: {formatBRL(tx.personalAmount ?? (tx.amount - (tx.thirdPartyAmount || 0)))}
              </span>
            )}
          </div>
        )}
      </td>

      {/* Ações */}
      <td className="py-3.5 px-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(tx)}
            className="min-h-[36px] min-w-[36px] p-2 rounded-xl bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/30 transition flex items-center justify-center living-edit cursor-pointer"
            title="Editar lançamento"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(tx.id)}
            className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 transition flex items-center justify-center living-trash cursor-pointer"
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
  onNewTransaction,
  onBatchImportTransactions,
  handleToggleStatus,
  handleStartEditTransaction,
  handleDeleteTransaction,
  getFlowType,
  onUpdateSingleTransaction,
  onBatchUpdateStatus,
  onBatchChangeCategory,
  onBatchDeleteTransactions
}) => {
  // SPRINT 55 & 59: Seleção em Lote e Modo de Seleção sob demanda (Long-Press / Botão)
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [batchCategory, setBatchCategory] = useState<string>("");
  const showCheckboxes = isSelectionMode || selectedTxIds.size > 0;
  const longPressMobileRef = React.useRef<NodeJS.Timeout | null>(null);

  // SPRINT 59: Atalho Esc para fechar o modo de seleção e limpar seleções
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (isSelectionMode || selectedTxIds.size > 0)) {
        setIsSelectionMode(false);
        setSelectedTxIds(new Set());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelectionMode, selectedTxIds.size]);

  const handleLongPressRow = useCallback((id: string) => {
    setIsSelectionMode(true);
    setSelectedTxIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);
  // SPRINT 37: Fluidez 120Hz via useDeferredValue no Input de Busca (Davi Kroner)
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // SPRINT 37: Estados da Modal de Ingestão Bancária CSV/OFX (Rafael Albuquerque)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [ingestResult, setIngestResult] = useState<BankIngestResult | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isImportConfirming, setIsImportConfirming] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Configurações de ordenação e filtros
  const [sortConfig, setSortConfig] = useState<{ key: TxSortKey; dir: SortDirection } | null>({
    key: "date",
    dir: "desc"
  });
  const [activeFilterPopover, setActiveFilterPopover] = useState<TxSortKey | null>(null);
  const [txStatusFilter, setTxStatusFilter] = useState<"ALL" | "PAGO" | "PENDENTE" | "NA_FATURA">("ALL");
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
    () => Array.from(new Set(filteredTransactions.map((t) => t.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" })),
    [filteredTransactions]
  );
  const allUniqueMethods = useMemo(
    () => Array.from(new Set(filteredTransactions.map((t) => t.paymentMethod))).sort(),
    [filteredTransactions]
  );

  // Leitura do arquivo de extrato (.csv ou .ofx)
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;
    setIsParsingFile(true);
    try {
      const text = await file.text();
      const res = parseBankStatementFile(text, file.name, filteredTransactions);
      setIngestResult(res);
    } catch (err) {
      console.error("Erro ao analisar extrato bancário:", err);
    } finally {
      setIsParsingFile(false);
    }
  }, [filteredTransactions]);

  // Confirmação da importação em lote
  const handleConfirmBatchImport = useCallback(() => {
    if (!ingestResult || !onBatchImportTransactions) return;
    const toImport = ingestResult.transactions.filter((t) => t.selected);
    if (toImport.length === 0) return;

    const newTxs: Transaction[] = toImport.map((p) => ({
      id: `tx-ingest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: p.date,
      description: p.description,
      amount: p.amount,
      category: p.category,
      costType: p.costType,
      paymentMethod: p.paymentMethod,
      status: p.status,
      flowType: p.flowType,
      externalId: p.externalId,
      notes: `Importado via Extrato (${ingestResult.bankName})`
    }));

    setIsImportConfirming(true);
    setTimeout(() => {
      onBatchImportTransactions(newTxs);
      setImportSuccessMessage(`${newTxs.length} lançamentos importados com sucesso!`);
      setTimeout(() => {
        setIsImportConfirming(false);
        setImportSuccessMessage(null);
        setIsImportModalOpen(false);
        setIngestResult(null);
      }, 750);
    }, 450);
  }, [ingestResult, onBatchImportTransactions]);

  // 1. Filtragem combinada por múltiplas colunas e busca diferida a 120fps
  const processedTxs = useMemo(() => {
    const q = normalizeSearchText(deferredSearchQuery);
    let result = filteredTransactions.filter((tx) => {
      // Busca textual a 120Hz sem bloquear a digitação
      if (q) {
        const desc = normalizeSearchText(tx.description);
        const cat = normalizeSearchText(tx.category);
        const meth = normalizeSearchText(tx.paymentMethod);
        const debtor = normalizeSearchText(tx.debtor || "");
        const brDate = normalizeSearchText(formatDateBR(tx.date));
        if (!desc.includes(q) && !cat.includes(q) && !meth.includes(q) && !debtor.includes(q) && !brDate.includes(q)) {
          return false;
        }
      }
      // Filtro rápido de situação
      if (txStatusFilter === "PAGO" && tx.status !== "Pago") return false;
      if (txStatusFilter === "PENDENTE" && (tx.status === "Pago" || tx.status === "Na Fatura")) return false;
      if (txStatusFilter === "NA_FATURA" && tx.status !== "Na Fatura" && tx.status !== "Pendente / Na Fatura") return false;

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
        const q = normalizeSearchText(columnFilters.dateQuery);
        const brDate = normalizeSearchText(formatDateBR(tx.date));
        if (!brDate.includes(q) && !normalizeSearchText(tx.date).includes(q)) return false;
      }

      return true;
    });

    // 2. Ordenação respeitando o tipo de dado
    if (sortConfig) {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        if (sortConfig.key === "date") {
          cmp = compareDatesBR(a.date, b.date);
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

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedTxIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (selectedTxIds.size === visibleTxs.length) {
      setSelectedTxIds(new Set());
    } else {
      setSelectedTxIds(new Set(visibleTxs.map((t) => t.id)));
    }
  }, [selectedTxIds.size, visibleTxs]);

  const hasMore = visibleCount < processedTxs.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + BATCH_INCREMENT);
  }, []);

  const handleLoadAll = useCallback(() => {
    setVisibleCount(processedTxs.length);
  }, [processedTxs.length]);

  const exportTableCSV = useCallback(() => {
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

    const sanitizeCell = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return "";
      let str = String(val);
      // Blindagem contra CSV Injection / Injeção de Fórmulas no Excel (=, +, -, @, |) com whitespace padding (AUD-19)
      if (/^[\s\t\r\n]*[=+\-@|]/.test(str)) {
        str = `'${str}`;
      }
      str = str.replace(/"/g, '""').replace(/;/g, ",");
      return `"${str}"`;
    };

    const rows = processedTxs.map((t) => {
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
        sanitizeCell(formatDateBR(t.date)),
        sanitizeCell(t.description),
        sanitizeCell(t.category),
        sanitizeCell(flowLabel),
        sanitizeCell(t.costType),
        sanitizeCell(t.paymentMethod),
        sanitizeCell(t.cardUsed || t.bankAccount || "-"),
        sanitizeCell(t.status),
        `"${formattedAmount}"`,
        sanitizeCell(t.km != null ? t.km : ""),
        sanitizeCell(t.liters != null ? String(t.liters).replace(".", ",") : ""),
        sanitizeCell(t.debtor || ""),
        sanitizeCell(t.installmentInfo || "À vista")
      ].join(";");
    });

    const BOM = "\uFEFF";
    const csvContent = BOM + [headers.map((h) => `"${h}"`).join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const nowBR = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    link.download = `Lancamentos_Coindex_${nowBR}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [processedTxs, getFlowType]);

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
    <div className="glass-card px-4 py-3 rounded-2xl border border-white/[0.08] space-y-3.5 shadow-xl mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white tracking-tight">Livro Caixa & Lançamentos</h2>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] sm:text-[11px] font-mono tabular-nums font-bold">
              {processedTxs.length} de {filteredTransactions.length} registro(s)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Clique nos cabeçalhos para ordenar (cronológico, numérico ou alfabético) ou use o ícone de filtro para combinar critérios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Filtro Rápido de Situação Deslizante */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <SlidingSegmentedControl
              options={[
                { id: "ALL", label: "Todos" },
                { id: "PAGO", label: "Pagos" },
                { id: "NA_FATURA", label: "Na Fatura" },
                { id: "PENDENTE", label: "Pendentes" }
              ]}
              value={txStatusFilter}
              onChange={(val) => setTxStatusFilter(val as "ALL" | "PAGO" | "PENDENTE" | "NA_FATURA")}
              size="xs"
              activeColor="bg-[#0A84FF]"
            />
          </div>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar descrição, método, pessoa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-950/90 border border-white/10 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setIsSelectionMode((prev) => {
                const next = !prev;
                if (!next) setSelectedTxIds(new Set());
                return next;
              });
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              showCheckboxes
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                : "bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-300"
            }`}
            title="Ativar ou desativar modo de seleção em lote"
          >
            {showCheckboxes ? (
              <>
                <X className="w-3.5 h-3.5" /> ✕ Sair da Seleção
              </>
            ) : (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-[#0A84FF]" /> ☑️ Selecionar
              </>
            )}
          </button>

          <button
            type="button"
            onClick={exportTableCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-200 font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Exportar planilha compatível com Microsoft Excel"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" /> Exportar CSV
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-200 font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Importar extrato bancário em formato CSV ou OFX"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" /> Importar Extrato (CSV/OFX)
          </button>

          <button
            type="button"
            onClick={() => {
              if (onNewTransaction) onNewTransaction();
              else if (handleOpenNewTxModal) handleOpenNewTxModal();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#0A84FF] hover:bg-[#0070E0] text-white font-medium shadow-sm transition-all text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Barra de Filtros Ativos e Botão de Limpar */}
      {hasActiveFiltersOrSort && (
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-blue-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-400" /> Filtros e Ordenação Ativos:
            </span>
            {sortConfig && (
              <span className="px-2.5 py-1 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30 text-[11px] font-semibold flex items-center gap-1">
                Coluna: <strong className="text-white">{sortConfig.key}</strong> (
                {sortConfig.dir === "asc" ? "Crescente ↑" : "Decrescente ↓"})
              </span>
            )}
            {columnFilters.categories.length > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30 text-[11px] font-semibold">
                Categorias ({columnFilters.categories.length})
              </span>
            )}
            {columnFilters.costTypes.length > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30 text-[11px] font-semibold">
                Custo: {columnFilters.costTypes.join(", ")}
              </span>
            )}
            {columnFilters.methods.length > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30 text-[11px] font-semibold">
                Métodos ({columnFilters.methods.length})
              </span>
            )}
            {columnFilters.statuses.length > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30 text-[11px] font-semibold">
                Situação: {columnFilters.statuses.join(", ")}
              </span>
            )}
            {columnFilters.hasKmOnly && (
              <span className="px-2.5 py-1 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30 text-[11px] font-semibold">
                Com Odômetro
              </span>
            )}
            {(columnFilters.minAmount || columnFilters.maxAmount) && (
              <span className="px-2.5 py-1 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30 text-[11px] font-semibold">
                Faixa de Valor
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearFiltersAndSort}
            className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
            title="Restaurar visualização original em 1 clique"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Limpar ordenação e filtros
          </button>
        </div>
      )}

      {/* SPRINT 37: VISÃO RESPONSIVA EM CARDS TÁTEIS COMPACTOS (md:hidden - Bianca Takahashi) */}
      <div className="md:hidden space-y-2.5">
        {processedTxs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 glass-card rounded-2xl border border-white/[0.06]">
            Nenhum lançamento encontrado para os filtros selecionados.
          </div>
        ) : (
          visibleTxs.map((tx) => {
            const flow = getFlowType(tx.category);
            const inst = parseInstallmentInfo(tx);
            const label = tx.installmentInfo || (inst.current && inst.total ? `${inst.current}/${inst.total}` : null);
            const displayName = inst.isInstallment && label ? inst.baseDescription : tx.description;
            const isPositive = isPositiveInflowDisplay(tx);
            const isInvestment = flow === "INVESTMENT";
            const catColor = categoryColors[tx.category] || "#6366f1";

            return (
              <div
                key={`mobile-${tx.id}`}
                onPointerDown={() => {
                  longPressMobileRef.current = setTimeout(() => {
                    handleLongPressRow(tx.id);
                    if (typeof window !== "undefined" && window.navigator?.vibrate) {
                      window.navigator.vibrate(40);
                    }
                  }, 320);
                }}
                onPointerUp={() => {
                  if (longPressMobileRef.current) {
                    clearTimeout(longPressMobileRef.current);
                    longPressMobileRef.current = null;
                  }
                }}
                onPointerLeave={() => {
                  if (longPressMobileRef.current) {
                    clearTimeout(longPressMobileRef.current);
                    longPressMobileRef.current = null;
                  }
                }}
                className={`glass-card p-3.5 rounded-2xl border transition-all ${
                  selectedTxIds.has(tx.id) ? "border-[#0A84FF] bg-[#0A84FF]/10" : "border-white/[0.08]"
                } space-y-2.5 shadow-sm active:scale-[0.99] select-none`}
              >
                {/* Linha 1: Checkbox (se ativo) + Data + Categoria + Status */}
                <div className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    {showCheckboxes && (
                      <input
                        type="checkbox"
                        checked={selectedTxIds.has(tx.id)}
                        onChange={() => handleToggleSelect(tx.id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#0A84FF] focus:ring-0 cursor-pointer"
                      />
                    )}
                    <span className="font-mono tabular-nums text-slate-400 text-[11px]">
                      {formatDateBR(tx.date)}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        backgroundColor: `${catColor}15`,
                        color: catColor,
                        border: `1px solid ${catColor}30`
                      }}
                    >
                      {renderCategorySemanticIcon(tx.category)}
                      <span className="truncate max-w-[120px]">{tx.category}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(tx)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
                      tx.status === "Pago"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : tx.status === "Na Fatura" || tx.status === "Pendente / Na Fatura"
                        ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {tx.status === "Pago" ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Clock className="w-3 h-3 text-amber-400" />
                    )}
                    <span>{tx.status}</span>
                  </button>
                </div>

                {/* Linha 2: Descrição + Valor Tabular */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <strong className="text-white text-xs font-semibold block truncate">
                      {displayName}
                    </strong>
                    {label && (
                      <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30">
                        {label}
                      </span>
                    )}
                    {(tx.cardUsed || tx.bankAccount) && (
                      <span className="text-[11px] text-slate-400 block truncate">
                        {tx.cardUsed ? `💳 ${tx.cardUsed}` : `🏦 ${tx.bankAccount}`}
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <strong
                      className={`text-sm font-bold font-mono tabular-nums block ${
                        isPositive
                          ? "text-[#30D158]"
                          : isInvestment
                          ? "text-blue-400"
                          : "text-white"
                      } ${moneyBlur}`}
                    >
                      {tx.isTransfer ? "⇆ " : isPositive ? "+" : isInvestment ? "⚡ " : "- "}
                      {formatBRL(tx.amount)}
                    </strong>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {tx.costType}
                    </span>
                  </div>
                </div>

                {/* Linha 3: Método + Ações */}
                <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.05] text-[11px]">
                  <span className="text-slate-400 truncate max-w-[150px]">
                    {tx.paymentMethod}
                    {tx.debtor && ` • Dev: ${tx.debtor}`}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartEditTransaction(tx)}
                      className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/25 transition cursor-pointer"
                      title="Editar lançamento"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Excluir lançamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* VISÃO DESKTOP EM TABELA COMPLETA (hidden md:block) */}
      <div className="hidden md:block">
        <div
          className={`rounded-2xl border border-white/[0.06] transition-all relative ${
            activeFilterPopover ? "z-[80] min-h-[380px] overflow-visible pb-20" : "z-10 overflow-x-auto"
          }`}
        >
        <table className="w-full text-left border-collapse text-xs">
          <thead className="relative z-30">
            <tr className="border-b border-white/[0.08] bg-slate-950/80 text-slate-400">
              {/* SPRINT 55 & 59: MULTI-SELECT CHECKBOX (exibido apenas se showCheckboxes) */}
              {showCheckboxes && (
                <th className="py-3.5 pl-3 pr-1 w-8 text-center">
                  <input
                    type="checkbox"
                    aria-label="Selecionar todos os lançamentos visíveis"
                    className="w-4 h-4 rounded border-white/20 bg-black/40 text-[#0A84FF] accent-[#0A84FF] cursor-pointer"
                    checked={visibleTxs.length > 0 && selectedTxIds.size === visibleTxs.length}
                    onChange={handleToggleSelectAll}
                  />
                </th>
              )}

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
                      <div className="absolute left-0 mt-2 p-3 w-56 rounded-2xl bg-[var(--cupertino-card)] backdrop-blur-2xl border border-[var(--cupertino-border)] shadow-[var(--cupertino-shadow)] z-[9999] space-y-2 text-xs">
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
                            className="px-2.5 py-1 rounded-lg bg-[#0A84FF] hover:bg-[#0070E0] text-white text-[10px] font-medium shadow-sm transition cursor-pointer"
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
                      <div className="absolute left-0 mt-2 p-3 w-64 rounded-2xl bg-[var(--cupertino-card)] backdrop-blur-2xl border border-[var(--cupertino-border)] shadow-[var(--cupertino-shadow)] z-[9999] space-y-2 text-xs">
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
                                  className="accent-[#0A84FF] rounded cursor-pointer"
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
                          className="w-full py-1.5 rounded-xl bg-[#0A84FF] hover:bg-[#0070E0] text-white font-medium shadow-sm transition text-[11px] mt-1 cursor-pointer"
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
                      <div className="absolute left-0 mt-2 p-3 w-44 rounded-2xl bg-[var(--cupertino-card)] backdrop-blur-2xl border border-[var(--cupertino-border)] shadow-[var(--cupertino-shadow)] z-[9999] space-y-2 text-xs">
                        <span className="font-bold text-white block">Tipo de Custo</span>
                        {["Fixo", "Variável"].map((cType) => (
                          <label
                            key={cType}
                            className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="accent-[#0A84FF] rounded cursor-pointer"
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
                          className="w-full py-1.5 rounded-lg bg-[#0A84FF] hover:bg-[#0070E0] text-white font-medium shadow-sm transition text-[10px] cursor-pointer"
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
                      <div className="absolute left-0 mt-2 p-3 w-56 rounded-2xl bg-[var(--cupertino-card)] backdrop-blur-2xl border border-[var(--cupertino-border)] shadow-[var(--cupertino-shadow)] z-[9999] space-y-2 text-xs">
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
                                className="accent-[#0A84FF] rounded cursor-pointer"
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
                          className="w-full py-1.5 rounded-xl bg-[#0A84FF] hover:bg-[#0070E0] text-white font-medium shadow-sm transition text-[10px] cursor-pointer"
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
                      <div className="absolute left-0 mt-2 p-3 w-48 rounded-2xl bg-[var(--cupertino-card)] backdrop-blur-2xl border border-[var(--cupertino-border)] shadow-[var(--cupertino-shadow)] z-[9999] space-y-2 text-xs">
                        <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-[#0A84FF] rounded cursor-pointer"
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
                          className="w-full py-1.5 rounded-lg bg-[#0A84FF] hover:bg-[#0070E0] text-white font-medium shadow-sm transition text-[10px] cursor-pointer"
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
                      <div className="absolute left-0 mt-2 p-3 w-48 rounded-2xl bg-[var(--cupertino-card)] backdrop-blur-2xl border border-[var(--cupertino-border)] shadow-[var(--cupertino-shadow)] z-[9999] space-y-2 text-xs">
                        <span className="font-bold text-white block">Situação</span>
                        {["Pago", "Pendente / Na Fatura"].map((st) => (
                          <label
                            key={st}
                            className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="accent-[#0A84FF] rounded cursor-pointer"
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
                          className="w-full py-1.5 rounded-lg bg-[#0A84FF] hover:bg-[#0070E0] text-white font-medium shadow-sm transition text-[10px] cursor-pointer"
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
                      <div className="absolute right-0 mt-2 p-3 w-52 rounded-2xl bg-[var(--cupertino-card)] backdrop-blur-2xl border border-[var(--cupertino-border)] shadow-[var(--cupertino-shadow)] z-[9999] space-y-2 text-xs text-left">
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
                            className="px-2.5 py-1 rounded-lg bg-[#0A84FF] hover:bg-[#0070E0] text-white text-[10px] font-medium shadow-sm transition cursor-pointer"
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
                <td colSpan={10} className="py-10 text-center text-slate-400">
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
                    isSelected={selectedTxIds.has(tx.id)}
                    showCheckbox={showCheckboxes}
                    onToggleSelect={handleToggleSelect}
                    onLongPress={handleLongPressRow}
                    onInlineSave={onUpdateSingleTransaction}
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
      </div>

      {/* SPRINT 55 & 59: BARRA FLUTUANTE DE AÇÕES EM LOTE FIXA VIA CREATEPORTAL */}
      {selectedTxIds.size > 0 && typeof document !== "undefined" && createPortal(
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] flex flex-wrap items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-4 duration-200 text-xs">
          <div className="flex items-center gap-2 pr-3 border-r border-white/10 font-semibold text-white">
            <span className="w-6 h-6 rounded-full bg-[#0A84FF] text-white flex items-center justify-center text-[11px] font-bold">
              {selectedTxIds.size}
            </span>
            <span>selecionado{selectedTxIds.size > 1 ? "s" : ""}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onBatchUpdateStatus) {
                  onBatchUpdateStatus(Array.from(selectedTxIds), "Pago");
                  setSelectedTxIds(new Set());
                  setIsSelectionMode(false);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Marcar Pago
            </button>

            <button
              type="button"
              onClick={() => {
                if (onBatchUpdateStatus) {
                  onBatchUpdateStatus(Array.from(selectedTxIds), "Pendente");
                  setSelectedTxIds(new Set());
                  setIsSelectionMode(false);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" /> Marcar Pendente
            </button>

            {/* Mudar Categoria Dropdown */}
            <select
              value=""
              onChange={(e) => {
                if (e.target.value && onBatchChangeCategory) {
                  onBatchChangeCategory(Array.from(selectedTxIds), e.target.value);
                  setSelectedTxIds(new Set());
                  setIsSelectionMode(false);
                }
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-white/15 text-xs font-medium cursor-pointer outline-none focus:border-[#0A84FF]"
            >
              <option value="" disabled>Mudar Categoria...</option>
              {OFFICIAL_CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Excluir permanentemente ${selectedTxIds.size} lançamento(s)?`)) {
                  if (onBatchDeleteTransactions) {
                    onBatchDeleteTransactions(Array.from(selectedTxIds));
                    setSelectedTxIds(new Set());
                    setIsSelectionMode(false);
                  }
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedTxIds(new Set());
                setIsSelectionMode(false);
              }}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              title="Cancelar seleção (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>,
        document.body
      )}

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
              className="px-4 py-2 rounded-xl bg-[#0A84FF]/20 hover:bg-[#0A84FF]/30 text-[#0A84FF] border border-[#0A84FF]/40 font-semibold transition flex items-center gap-1.5 cursor-pointer"
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

      {/* SPRINT 37 & 37.1: MODAL DE INGESTÃO BANCÁRIA CSV / OFX VIA CREATEPORTAL */}
      {isImportModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 w-screen h-dvh z-[9999] bg-black/65 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
          <div className="relative w-full max-w-2xl max-h-[84dvh] flex flex-col overflow-hidden rounded-2xl bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] shadow-2xl my-auto text-xs p-6 space-y-4">
            {(isParsingFile || isImportConfirming) && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 cupertino-shimmer z-30" />
            )}
            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Importar Extrato Bancário</h3>
                  <p className="text-xs text-slate-400">Parser automático para arquivos .OFX e .CSV de qualquer banco com auto-categorização</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setIngestResult(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo: Dropzone ou Preview */}
            {importSuccessMessage ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 animate-cupertino-in">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h4 className="text-sm font-bold text-white">{importSuccessMessage}</h4>
                <p className="text-xs text-slate-400">Reconciliando saldo e tabela financeira...</p>
              </div>
            ) : !ingestResult ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-2xl p-8 text-center space-y-3 bg-slate-950/40 transition-colors my-auto"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Arraste seu arquivo .OFX ou .CSV</h4>
                  <p className="text-xs text-slate-400 mt-1">Compatível com Nubank, Inter, BTG Pactual, C6, Itaú, Bradesco e extratos padrão</p>
                </div>
                <div>
                  <label className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg transition">
                    <FileText className="w-4 h-4" />
                    <span>{isParsingFile ? "Analisando Extrato..." : "Selecionar do Computador"}</span>
                    <input
                      type="file"
                      accept=".csv,.ofx"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
                {isParsingFile && (
                  <div className="w-full space-y-2 mt-4 max-w-xs mx-auto">
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full w-full bg-emerald-500 cupertino-shimmer" />
                    </div>
                    <p className="text-[11px] text-emerald-400 font-mono animate-pulse">Processando extrato bancário...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 flex-1 overflow-hidden flex flex-col min-h-0">
                {/* Resumo da Ingestão */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {ingestResult.bankName} ({ingestResult.format})
                    </span>
                    <span className="text-slate-300">
                      <strong>{ingestResult.totalCount}</strong> linhas detectadas
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">
                      {ingestResult.newCount} novas
                    </span>
                    <span className="text-amber-400 font-bold">
                      {ingestResult.duplicateCount} já existentes (duplicadas)
                    </span>
                  </div>
                </div>

                {/* Tabela de Preview */}
                <div className="flex-1 overflow-y-auto rounded-xl border border-white/10 max-h-[45dvh] custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-950 z-10 border-b border-white/10 text-slate-400">
                      <tr>
                        <th className="p-2.5 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={ingestResult.transactions.length > 0 && ingestResult.transactions.every((t) => t.selected)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setIngestResult({
                                ...ingestResult,
                                transactions: ingestResult.transactions.map((t) => ({ ...t, selected: checked }))
                              });
                            }}
                            className="accent-emerald-500 rounded cursor-pointer"
                          />
                        </th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Data</th>
                        <th className="p-2.5">Descrição</th>
                        <th className="p-2.5">Categoria</th>
                        <th className="p-2.5 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {ingestResult.transactions.map((t, idx) => (
                        <tr key={t.id || idx} className="hover:bg-white/[0.02] transition">
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(t.selected)}
                              onChange={(e) => {
                                const next = [...ingestResult.transactions];
                                next[idx] = { ...next[idx], selected: e.target.checked };
                                setIngestResult({ ...ingestResult, transactions: next });
                              }}
                              className="accent-emerald-500 rounded cursor-pointer"
                            />
                          </td>
                          <td className="p-2.5">
                            {t.isDuplicate ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                Duplicada
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                Nova
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-mono tabular-nums text-slate-300 whitespace-nowrap">
                            {t.date}
                          </td>
                          <td className="p-2.5 font-medium text-white max-w-[200px] truncate" title={t.description}>
                            {t.description}
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={t.category}
                              onChange={(e) => {
                                const next = [...ingestResult.transactions];
                                next[idx] = { ...next[idx], category: e.target.value };
                                setIngestResult({ ...ingestResult, transactions: next });
                              }}
                              className="px-2 py-1 rounded bg-slate-900 border border-white/10 text-xs text-white outline-none w-32"
                            />
                          </td>
                          <td className={`p-2.5 text-right font-bold font-mono tabular-nums whitespace-nowrap ${
                            isPositiveInflowDisplay(t) ? "text-[#30D158]" : "text-white"
                          }`}>
                            {isPositiveInflowDisplay(t) ? "+" : "-"} {formatBRL(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Rodapé da Modal com Confirmação */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIngestResult(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-white/10 font-semibold transition cursor-pointer"
                  >
                    ← Trocar Arquivo
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsImportModalOpen(false);
                        setIngestResult(null);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmBatchImport}
                      disabled={isImportConfirming || !ingestResult.transactions.some((t) => t.selected)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition flex items-center gap-1.5 cursor-pointer apple-press"
                    >
                      {isImportConfirming ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Importando...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Confirmar Importação ({ingestResult.transactions.filter((t) => t.selected).length})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TransactionsTableAdvanced;
