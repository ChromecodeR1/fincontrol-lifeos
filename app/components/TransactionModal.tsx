"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Fuel, Wallet, X, Layers, Gauge, CreditCard, Loader2, ArrowLeftRight, Users, Sparkles } from "lucide-react";
import {
  BankItem,
  CategoryCatalogItem,
  CostType,
  CreditCardItem as CreditCardType,
  InstallmentSeriesData,
  PaymentMethod,
  Transaction,
  TxStatus,
  formatBRL,
  getAutomaticStatus,
  getCardInvoiceCompetence
} from "@/app/lifeos-data";

export interface TransactionFormState {
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
}

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSavingTx: boolean;
  editingTxId: string | null;
  isEditingSeries: boolean;
  editingSeriesData: InstallmentSeriesData | null;
  applyToAllSeries: boolean;
  setApplyToAllSeries: (val: boolean) => void;
  isPostoExpress: boolean;
  setIsPostoExpress: (val: boolean) => void;
  expressFuelType: "Gasolina" | "Etanol";
  setExpressFuelType: (val: "Gasolina" | "Etanol") => void;
  formState: TransactionFormState;
  setFormState: React.Dispatch<React.SetStateAction<TransactionFormState>>;
  cards: CreditCardType[];
  banks: BankItem[];
  categoriesCatalog: CategoryCatalogItem[];
  paymentMethods: string[];
  autoMetrics: {
    maxKm: number;
    [key: string]: unknown;
  };
  transactions?: Transaction[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSavingTx,
  editingTxId,
  isEditingSeries,
  editingSeriesData,
  applyToAllSeries,
  setApplyToAllSeries,
  isPostoExpress,
  setIsPostoExpress,
  expressFuelType,
  setExpressFuelType,
  formState,
  setFormState,
  cards,
  banks,
  categoriesCatalog,
  paymentMethods,
  autoMetrics,
  transactions = []
}) => {
  // SPRINT 14: Smart Auto-Fill & Memória Inteligente baseada no Histórico
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setHasAutoFilled(false);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Catálogo consolidado do histórico (agrupado por descrição limpa e ordenado por data mais recente)
  interface HistorySuggestion {
    cleanDescription: string;
    category: string;
    costType: CostType;
    paymentMethod: string;
    cardUsed?: string;
    bankAccount?: string;
    count: number;
    lastDate: string;
  }

  const historyCatalog = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const map = new Map<string, HistorySuggestion>();
    const sorted = [...transactions].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    for (const t of sorted) {
      if (t.isTransfer || t.category === "Transferência entre Contas" || t.isSplitChild) continue;
      if (!t.description) continue;

      const clean = t.description
        .replace(/\s*[\(\[]?\s*\d{1,2}\s*[\/|\\]\s*\d{1,2}\s*[\)\]]?\s*$/, "")
        .trim();
      if (!clean || clean.length < 2) continue;

      const key = clean.toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          cleanDescription: clean,
          category: t.category,
          costType: t.costType || "Variável",
          paymentMethod: t.paymentMethod,
          cardUsed: t.cardUsed,
          bankAccount: t.bankAccount,
          count: 1,
          lastDate: t.date
        });
      } else {
        existing.count += 1;
      }
    }
    return Array.from(map.values());
  }, [transactions]);

  // Sugestões filtradas em tempo real conforme a digitação do usuário
  const suggestions = useMemo(() => {
    if (editingTxId) return [];
    const q = (formState.description || "").trim().toLowerCase();
    if (q.length < 2) return [];

    return historyCatalog
      .filter((item) => item.cleanDescription.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.cleanDescription.toLowerCase().startsWith(q);
        const bStarts = b.cleanDescription.toLowerCase().startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return b.count - a.count;
      })
      .slice(0, 5);
  }, [formState.description, historyCatalog, editingTxId]);

  // Aplica o preenchimento inteligente a partir de um registro do histórico
  const applyAutoFill = (sug: HistorySuggestion) => {
    setFormState((prev) => {
      const isCredit = sug.paymentMethod === "Cartão de Crédito";
      let nextCardUsed = prev.cardUsed;
      let nextBankAccount = prev.bankAccount;

      if (isCredit) {
        nextCardUsed = sug.cardUsed || prev.cardUsed || cards[0]?.name || "";
        const matched = cards.find((c) => c.name === nextCardUsed);
        nextBankAccount =
          matched?.bankName ||
          (matched?.bankId ? banks.find((b) => b.id === matched.bankId)?.name : "") ||
          sug.bankAccount ||
          "";
      } else {
        nextBankAccount = sug.bankAccount || prev.bankAccount || banks[0]?.name || "";
      }

      return {
        ...prev,
        description: sug.cleanDescription,
        category: sug.category,
        costType: sug.costType,
        paymentMethod: sug.paymentMethod,
        cardUsed: nextCardUsed,
        bankAccount: nextBankAccount,
        status: getAutomaticStatus(sug.paymentMethod as PaymentMethod, sug.category)
      };
    });
    setHasAutoFilled(true);
    setShowSuggestions(false);
    setTimeout(() => {
      amountInputRef.current?.focus();
    }, 50);
  };

  const handleDescriptionChange = (val: string) => {
    setFormState((prev) => ({ ...prev, description: val }));
    if (editingTxId) return;

    const clean = val.trim().toLowerCase();
    if (clean.length >= 3) {
      const exactMatch = historyCatalog.find(
        (item) => item.cleanDescription.toLowerCase() === clean
      );
      if (exactMatch) {
        setFormState((prev) => {
          const isCredit = exactMatch.paymentMethod === "Cartão de Crédito";
          let nextCardUsed = prev.cardUsed;
          let nextBankAccount = prev.bankAccount;

          if (isCredit) {
            nextCardUsed = exactMatch.cardUsed || prev.cardUsed || cards[0]?.name || "";
            const matched = cards.find((c) => c.name === nextCardUsed);
            nextBankAccount =
              matched?.bankName ||
              (matched?.bankId ? banks.find((b) => b.id === matched.bankId)?.name : "") ||
              exactMatch.bankAccount ||
              "";
          } else {
            nextBankAccount = exactMatch.bankAccount || prev.bankAccount || banks[0]?.name || "";
          }

          return {
            ...prev,
            description: val,
            category: exactMatch.category,
            costType: exactMatch.costType,
            paymentMethod: exactMatch.paymentMethod,
            cardUsed: nextCardUsed,
            bankAccount: nextBankAccount,
            status: getAutomaticStatus(exactMatch.paymentMethod as PaymentMethod, exactMatch.category)
          };
        });
        setHasAutoFilled(true);
      }
    }
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleDescKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && suggestions.length > 0) {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && selectedIndex >= 0 && suggestions[selectedIndex]) {
      e.preventDefault();
      applyAutoFill(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl space-y-4 text-xs"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            {formState.isTransfer ? (
          <div className="space-y-3.5">
            <div className="p-3.5 rounded-2xl bg-sky-950/50 border border-sky-500/30 text-sky-200 text-xs space-y-1">
              <strong className="flex items-center gap-1.5 text-white">
                <ArrowLeftRight className="w-4 h-4 text-sky-400" /> Transferência Neutra entre Contas Bancárias
              </strong>
              <p className="text-[11px] text-slate-300">
                O valor é debitado da conta de origem e creditado na conta de destino sem inflar receitas ou despesas consolidadas do mês.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Conta de Origem (Sai de) *</label>
                <select
                  value={formState.sourceBank || formState.bankAccount || banks[0]?.name || ""}
                  onChange={(e) => {
                    const src = e.target.value;
                    setFormState((prev) => ({
                      ...prev,
                      sourceBank: src,
                      bankAccount: src,
                      description: `Transferência: ${src} ➔ ${prev.destinationBank || banks[1]?.name || "Conta"}`
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-semibold outline-none focus:border-sky-500 transition"
                >
                  {banks.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Conta de Destino (Entra em) *</label>
                <select
                  value={formState.destinationBank || banks[1]?.name || banks[0]?.name || ""}
                  onChange={(e) => {
                    const dst = e.target.value;
                    setFormState((prev) => ({
                      ...prev,
                      destinationBank: dst,
                      description: `Transferência: ${prev.sourceBank || prev.bankAccount || banks[0]?.name || "Conta"} ➔ ${dst}`
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-semibold outline-none focus:border-sky-500 transition"
                >
                  {banks.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Alerta de Origem e Destino Iguais */}
            {(formState.sourceBank || formState.bankAccount) === formState.destinationBank && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-[11px] font-bold">
                ⚠️ O banco de origem e o banco de destino não podem ser o mesmo! Selecione contas bancárias distintas.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Data da Transferência *</label>
                <input
                  type="date"
                  required
                  value={formState.date}
                  onChange={(e) => setFormState((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-sky-500 transition"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Valor Transferido (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0,00"
                  value={formState.amount}
                  onChange={(e) => setFormState((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono tabular-nums text-base font-extrabold outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Descrição</label>
              <input
                type="text"
                value={formState.description}
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Ex: Transferência de Reserva ou Alocação"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Situação</label>
              <select
                value={formState.status}
                onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value as TxStatus }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-sky-500 transition"
              >
                <option value="Pago">Concluída / Efetuada</option>
                <option value="Pendente / Na Fatura">Pendente / Agendada</option>
              </select>
            </div>
          </div>
        ) : isPostoExpress ? (
              <>
                <Fuel className="w-4 h-4 text-amber-400" />
                <span>{editingTxId ? "Editar Abastecimento" : "Posto Express (Abastecimento)"}</span>
              </>
            ) : (
              <span>{editingTxId ? "Editar Lançamento" : "Novo Lançamento"}</span>
            )}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aviso e Controle de Edição em Série para Compras Parceladas */}
        {editingTxId && isEditingSeries && editingSeriesData && (
          <div className="rounded-2xl p-3.5 bg-gradient-to-r from-violet-950/70 via-slate-900/90 to-indigo-950/70 border border-violet-500/40 space-y-2 shadow-lg shadow-violet-950/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-400" />
                <span className="font-extrabold text-violet-200 text-xs">Compra Parcelada Detectada</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono text-[11px] tabular-nums font-bold">
                {editingSeriesData.series.length} parcelas na série
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Esta transação faz parte de uma série parcelada ({editingSeriesData.currentInstallment || "?"}/{editingSeriesData.totalInstallments || editingSeriesData.series.length}).
            </p>
            <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyToAllSeries}
                onChange={(e) => setApplyToAllSeries(e.target.checked)}
                className="w-4 h-4 rounded border-violet-500/50 bg-slate-950 text-violet-500 focus:ring-violet-500 accent-violet-500 cursor-pointer"
              />
              <span className="font-bold text-white text-xs">
                Aplicar alterações em todas as parcelas desta série
              </span>
            </label>
            {applyToAllSeries && (
              <p className="text-[10px] text-slate-400 pl-6 leading-relaxed">
                A Categoria, Forma de Pagamento, Banco/Cartão e o Nome Base serão atualizados em todas as {editingSeriesData.series.length} parcelas. As datas de vencimento e os valores individuais de cada mês serão preservados.
              </p>
            )}
          </div>
        )}

        {/* Seletor de Modo: Padrão vs Posto Express vs Transferência */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-950 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setIsPostoExpress(false);
              setFormState((prev) => ({
                ...prev,
                isTransfer: false,
                category: prev.category === "Transferência entre Contas" ? "Alimentação" : prev.category
              }));
            }}
            className={`min-h-[44px] py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-center ${
              !isPostoExpress && !formState.isTransfer
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Wallet className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Padrão</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPostoExpress(true);
              setFormState((prev) => ({
                ...prev,
                isTransfer: false,
                category: "Gasolina/Combustível",
                description:
                  !prev.description || prev.description.toLowerCase().includes("abastecimento")
                    ? `Abastecimento ${expressFuelType === "Etanol" ? "Etanol" : "Gasolina Comum"}`
                    : prev.description
              }));
            }}
            className={`min-h-[44px] py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-center ${
              isPostoExpress && !formState.isTransfer
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Fuel className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Posto Express ⛽</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPostoExpress(false);
              const defaultSrc = formState.sourceBank || formState.bankAccount || banks[0]?.name || "Nubank";
              const defaultDst = formState.destinationBank || (banks.find((b) => b.name !== defaultSrc)?.name || banks[1]?.name || banks[0]?.name || "Inter");
              setFormState((prev) => ({
                ...prev,
                isTransfer: true,
                category: "Transferência entre Contas",
                paymentMethod: "PIX",
                costType: "Fixo",
                sourceBank: defaultSrc,
                bankAccount: defaultSrc,
                destinationBank: defaultDst,
                description: prev.description && !prev.description.includes("Transferência") ? prev.description : `Transferência: ${defaultSrc} ➔ ${defaultDst}`
              }));
            }}
            className={`min-h-[44px] py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-center ${
              formState.isTransfer
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Transferência 🔄</span>
          </button>
        </div>

        {isPostoExpress ? (
          <div className="space-y-3.5">
            {/* 1. Tipo de Combustível */}
            <div>
              <label className="text-slate-300 font-bold block mb-1.5">Tipo de Combustível</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setExpressFuelType("Gasolina");
                    setFormState((prev) => ({
                      ...prev,
                      category: "Gasolina/Combustível",
                      description:
                        !prev.description || prev.description.toLowerCase().includes("abastecimento")
                          ? "Abastecimento Gasolina Comum"
                          : prev.description
                    }));
                  }}
                  className={`min-h-[44px] py-2.5 px-3 rounded-2xl border font-bold flex items-center justify-center gap-2 transition ${
                    expressFuelType === "Gasolina"
                      ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-lg shadow-amber-500/10"
                      : "bg-slate-950 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <Fuel className="w-4 h-4 text-amber-400" />
                  <span>Gasolina Comum</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExpressFuelType("Etanol");
                    setFormState((prev) => ({
                      ...prev,
                      category: "Gasolina/Combustível",
                      description:
                        !prev.description || prev.description.toLowerCase().includes("abastecimento")
                          ? "Abastecimento Etanol"
                          : prev.description
                    }));
                  }}
                  className={`min-h-[44px] py-2.5 px-3 rounded-2xl border font-bold flex items-center justify-center gap-2 transition ${
                    expressFuelType === "Etanol"
                      ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-lg shadow-emerald-500/10"
                      : "bg-slate-950 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="text-base">🌱</span>
                  <span>Etanol (Álcool)</span>
                </button>
              </div>
            </div>

            {/* 2. Litros Abastecidos e Valor Total Pago */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Valor Total Pago (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={formState.amount}
                    onChange={(e) => setFormState((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm tabular-nums outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Litros Abastecidos</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 40.50"
                    value={formState.liters}
                    onChange={(e) => setFormState((prev) => ({ ...prev, liters: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm tabular-nums outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">L</span>
                </div>
              </div>
            </div>

            {/* 3. Preço por Litro Calculado em Tempo Real */}
            {Number(formState.amount) > 0 && Number(formState.liters) > 0 ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-500/15 border border-amber-500/30 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      Preço por Litro Calculado
                    </span>
                    <strong className="text-base font-extrabold text-amber-300 font-mono tabular-nums">
                      {formatBRL(Number(formState.amount) / Number(formState.liters))} / litro
                    </strong>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {expressFuelType === "Etanol" ? "Etanol Flex" : "Gasolina Comum"}
                  </span>
                  <span className="text-[11px] font-bold text-slate-300 font-mono tabular-nums">
                    {Number(formState.liters).toFixed(2)} L abastecidos
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 text-slate-400 text-[11px] flex items-center gap-2">
                <Fuel className="w-3.5 h-3.5 text-amber-400" />
                <span>Digite o Valor Pago e os Litros para calcular o Preço por Litro (R$/L) automaticamente.</span>
              </div>
            )}

            {/* 4. Odômetro / KM e Data */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold block">Odômetro / KM Atual</label>
                  {autoMetrics.maxKm > 0 && (
                    <span className="text-[10px] text-indigo-400 font-mono tabular-nums">
                      Ant.: {autoMetrics.maxKm.toLocaleString("pt-BR")} km
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Ex: 49120"
                    value={formState.km}
                    onChange={(e) => setFormState((prev) => ({ ...prev, km: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm tabular-nums outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">km</span>
                </div>
                {formState.km && autoMetrics.maxKm > 0 && Number(formState.km) > autoMetrics.maxKm && Number(formState.liters) > 0 && (
                  <span className="text-[10px] text-emerald-400 block mt-1 font-mono tabular-nums">
                    ⚡ +{Number(formState.km) - autoMetrics.maxKm} km (
                    {((Number(formState.km) - autoMetrics.maxKm) / Number(formState.liters)).toFixed(2)} km/L estimados)
                  </span>
                )}
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={formState.date}
                  onChange={(e) => setFormState((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500 text-xs tabular-nums"
                />
              </div>
            </div>

            {/* 5. Posto / Descrição */}
            <div>
              <label className="text-slate-400 block mb-1">Posto / Descrição</label>
              <input
                type="text"
                required
                placeholder="Ex: Posto Ipiranga, Shell, Abastecimento..."
                value={formState.description}
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500"
              />
            </div>

            {/* 6. Método de Pagamento & Conta / Cartão */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Forma de Pagamento</label>
                <select
                  value={formState.paymentMethod}
                  onChange={(e) => {
                    const m = e.target.value as PaymentMethod;
                    const isCredit = m === "Cartão de Crédito";
                    let nextCardUsed = formState.cardUsed;
                    let nextBankAccount = formState.bankAccount;
                    if (isCredit) {
                      nextCardUsed = nextCardUsed || cards[0]?.name || "";
                      const matched = cards.find((c) => c.name === nextCardUsed);
                      nextBankAccount =
                        matched?.bankName ||
                        (matched?.bankId ? banks.find((b) => b.id === matched.bankId)?.name : "") ||
                        "";
                    } else {
                      nextBankAccount = nextBankAccount || banks[0]?.name || "";
                    }
                    setFormState((prev) => ({
                      ...prev,
                      paymentMethod: m,
                      cardUsed: nextCardUsed,
                      bankAccount: nextBankAccount,
                      status: getAutomaticStatus(m, "Gasolina/Combustível")
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500"
                >
                  {paymentMethods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {formState.paymentMethod === "Cartão de Crédito" ? (
                <div>
                  <label className="text-slate-400 block mb-1">Qual Cartão de Crédito</label>
                  <select
                    value={formState.cardUsed}
                    onChange={(e) => {
                      const cName = e.target.value;
                      const matched = cards.find((c) => c.name === cName);
                      const bName =
                        matched?.bankName ||
                        (matched?.bankId ? banks.find((b) => b.id === matched.bankId)?.name : "") ||
                        "";
                      setFormState((prev) => ({ ...prev, cardUsed: cName, bankAccount: bName }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500"
                  >
                    <option value="">Selecione o cartão...</option>
                    {cards.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} {c.bankName ? `(${c.bankName})` : ""}
                      </option>
                    ))}
                  </select>
                  {(() => {
                    const matched = cards.find((c) => c.name === formState.cardUsed);
                    if (!matched?.closingDay) return null;
                    const comp = getCardInvoiceCompetence(formState.date, matched.closingDay);
                    const purchaseMonth = formState.date.slice(0, 7);
                    if (!comp || comp <= purchaseMonth) return null;
                    const [compY, compM] = comp.split("-");
                    return (
                      <div className="mt-1.5 p-2 rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-300 text-[10px] flex items-center gap-1.5 font-medium">
                        <CreditCard className="w-3 h-3 text-violet-400 shrink-0" />
                        <span>
                          Cai na fatura de <strong className="text-white font-mono tabular-nums">{compM}/{compY}</strong> devido ao fechamento dia {matched.closingDay}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div>
                  <label className="text-slate-400 block mb-1">Qual Banco / Conta</label>
                  <select
                    value={formState.bankAccount}
                    onChange={(e) => setFormState((prev) => ({ ...prev, bankAccount: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500"
                  >
                    <option value="">Selecione o banco...</option>
                    {banks.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name} {b.accountType ? `(${b.accountType})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* MODO PADRÃO */
          <div className="space-y-4">
            {(formState.category.toLowerCase().includes("combustível") ||
              formState.category.toLowerCase().includes("combustivel") ||
              formState.category.toLowerCase().includes("gasolina") ||
              formState.category.toLowerCase().includes("veículo") ||
              formState.category.toLowerCase().includes("veiculo")) && (
              <button
                type="button"
                onClick={() => {
                  setIsPostoExpress(true);
                  setFormState((prev) => ({
                    ...prev,
                    category:
                      prev.category.toLowerCase().includes("veículo") ||
                      prev.category.toLowerCase().includes("combustível") ||
                      prev.category.toLowerCase().includes("gasolina")
                        ? prev.category
                        : "Gasolina/Combustível",
                    description:
                      !prev.description || prev.description.toLowerCase().includes("abastecimento")
                        ? `Abastecimento ${expressFuelType === "Etanol" ? "Etanol" : "Gasolina Comum"}`
                        : prev.description
                  }));
                }}
                className="w-full p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-amber-400" />
                  Ativar Modo Posto Express para abastecimentos
                </span>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30 font-mono">
                  Calcular R$/L ⛽
                </span>
              </button>
            )}

            {/* 1. Descrição com Smart Auto-Fill e Memória Inteligente (Sprint 14) */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 block text-xs font-semibold">Descrição / Estabelecimento</label>
                {!editingTxId && hasAutoFilled && (
                  <span className="text-[11px] text-indigo-400 font-medium inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" /> Auto-preenchido
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  ref={descInputRef}
                  type="text"
                  required
                  placeholder="Ex: Supermercado, Netflix, Uber, Restaurante..."
                  value={formState.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 220);
                  }}
                  onKeyDown={handleDescKeyDown}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-indigo-500 transition"
                />
                {!editingTxId && suggestions.length > 0 && (
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowSuggestions((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300 p-1"
                    title="Alternar sugestões do seu histórico"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Micro-badge elegante com estilo Cyber-Glassmorphism (Sprint 14) */}
              {!editingTxId && hasAutoFilled && (
                <div className="mt-1.5 flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/60 border border-indigo-500/30 text-indigo-300 text-xs shadow-md animate-in fade-in slide-in-from-top-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>✨ Categoria e pagamento preenchidos pelo seu histórico</span>
                  </span>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setHasAutoFilled(false)}
                    className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer ml-2"
                  >
                    Fechar
                  </button>
                </div>
              )}

              {/* Dropdown de Sugestões Discretas do Histórico */}
              {!editingTxId && showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 p-1.5 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 z-50 space-y-1 max-h-56 overflow-y-auto">
                  <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center justify-between border-b border-white/5">
                    <span className="flex items-center gap-1 text-indigo-300">
                      <Sparkles className="w-3 h-3" /> Sugestões do seu Histórico
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">Use ↑↓ e Enter</span>
                  </div>
                  {suggestions.map((sug, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={sug.cleanDescription}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applyAutoFill(sug);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-3 group ${
                          isSelected
                            ? "bg-indigo-600/30 border-indigo-500/50 text-white"
                            : "hover:bg-indigo-600/20 hover:border-indigo-500/30 border-transparent text-slate-200"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-white group-hover:text-indigo-200 block truncate">
                            {sug.cleanDescription}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 flex-wrap">
                            <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/25">
                              {sug.category}
                            </span>
                            <span>•</span>
                            <span className="text-slate-300 font-medium">{sug.paymentMethod}</span>
                            {sug.cardUsed && (
                              <>
                                <span>•</span>
                                <span className="text-violet-300 font-mono">{sug.cardUsed}</span>
                              </>
                            )}
                            {sug.bankAccount && !sug.cardUsed && (
                              <>
                                <span>•</span>
                                <span className="text-sky-300 font-mono">{sug.bankAccount}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md shrink-0">
                          {sug.count}x
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Grid Ergonomicamente Otimizada: Valor Total (focado via Tab) e Data */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 text-xs font-semibold">Valor Total (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">R$</span>
                  <input
                    ref={amountInputRef}
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={formState.amount}
                    onChange={(e) => setFormState((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-indigo-500 font-mono tabular-nums transition"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1 text-xs font-semibold">Data</label>
                <input
                  type="date"
                  required
                  value={formState.date}
                  onChange={(e) => setFormState((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-indigo-500 tabular-nums text-xs transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Categoria</label>
                <select
                  value={formState.category}
                  onChange={(e) => {
                    const c = e.target.value;
                    const isFuel =
                      c.toLowerCase().includes("combustível") ||
                      c.toLowerCase().includes("combustivel") ||
                      c.toLowerCase().includes("gasolina") ||
                      c.toLowerCase().includes("veículo") ||
                      c.toLowerCase().includes("veiculo");
                    if (isFuel) {
                      setIsPostoExpress(true);
                    }
                    setFormState((prev) => ({
                      ...prev,
                      category: c,
                      status: getAutomaticStatus(prev.paymentMethod as PaymentMethod, c)
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-indigo-500"
                >
                  {categoriesCatalog.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Método de Pagamento</label>
                <select
                  value={formState.paymentMethod}
                  onChange={(e) => {
                    const m = e.target.value as PaymentMethod;
                    const isCredit = m === "Cartão de Crédito";
                    let nextCardUsed = formState.cardUsed;
                    let nextBankAccount = formState.bankAccount;
                    if (isCredit) {
                      nextCardUsed = nextCardUsed || cards[0]?.name || "";
                      const matched = cards.find((c) => c.name === nextCardUsed);
                      nextBankAccount =
                        matched?.bankName ||
                        (matched?.bankId ? banks.find((b) => b.id === matched.bankId)?.name : "") ||
                        "";
                    } else {
                      nextBankAccount = nextBankAccount || banks[0]?.name || "";
                    }
                    setFormState((prev) => ({
                      ...prev,
                      paymentMethod: m,
                      cardUsed: nextCardUsed,
                      bankAccount: nextBankAccount,
                      status: getAutomaticStatus(m, prev.category)
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-indigo-500"
                >
                  {paymentMethods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formState.paymentMethod === "Cartão de Crédito" ? (
              <div className={!editingTxId ? "grid grid-cols-2 gap-3" : ""}>
                <div>
                  <label className="text-slate-400 block mb-1">Qual Cartão de Crédito</label>
                  <select
                    value={formState.cardUsed}
                    onChange={(e) => {
                      const cName = e.target.value;
                      const matched = cards.find((c) => c.name === cName);
                      const bName =
                        matched?.bankName ||
                        (matched?.bankId ? banks.find((b) => b.id === matched.bankId)?.name : "") ||
                        "";
                      setFormState((prev) => ({ ...prev, cardUsed: cName, bankAccount: bName }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-indigo-500"
                  >
                    <option value="">Selecione o cartão...</option>
                    {cards.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} {c.bankName ? `(${c.bankName})` : ""}
                      </option>
                    ))}
                  </select>
                  {(() => {
                    const matched = cards.find((c) => c.name === formState.cardUsed);
                    if (!matched?.closingDay) return null;
                    const comp = getCardInvoiceCompetence(formState.date, matched.closingDay);
                    const purchaseMonth = formState.date.slice(0, 7);
                    if (!comp || comp <= purchaseMonth) return null;
                    const [compY, compM] = comp.split("-");
                    return (
                      <div className="mt-1.5 p-2 rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-300 text-[10px] flex items-center gap-1.5 font-medium">
                        <CreditCard className="w-3 h-3 text-violet-400 shrink-0" />
                        <span>
                          Cai na fatura de <strong className="text-white font-mono tabular-nums">{compM}/{compY}</strong> devido ao fechamento dia {matched.closingDay}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                {!editingTxId && (
                  <div>
                    <label className="text-slate-400 block mb-1">Parcelamento</label>
                    <select
                      value={formState.installments}
                      onChange={(e) => setFormState((prev) => ({ ...prev, installments: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-indigo-500 font-mono tabular-nums"
                    >
                      {Array.from({ length: 24 }, (_, idx) => idx + 1).map((n) => (
                        <option key={n} value={String(n)}>
                          {n}x {n === 1 ? "(À vista)" : "parcelas"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="text-slate-400 block mb-1">Qual Banco / Instituição</label>
                <select
                  value={formState.bankAccount}
                  onChange={(e) => setFormState((prev) => ({ ...prev, bankAccount: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-indigo-500"
                >
                  <option value="">Selecione o banco ou instituição...</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} {b.accountType ? `(${b.accountType})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formState.category === "A Receber" && (
              <div>
                <label className="text-amber-300 font-bold block mb-1">Nome da Pessoa (Devedor)</label>
                <input
                  type="text"
                  placeholder="Ex: Lucas, Matheus..."
                  value={formState.debtor}
                  onChange={(e) => setFormState((prev) => ({ ...prev, debtor: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-white"
                />
              </div>
            )}
            {/* SPRINT 13: Divisão de Gasto (Rachar Conta / Split Transaction) */}
            {formState.category !== "A Receber" && !formState.isTransfer && (
              <div className="rounded-2xl p-4 bg-slate-950/70 border border-amber-500/30 space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(formState.isSplit)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const total = Math.max(0, parseFloat(formState.amount) || 0);
                        const halfVal = total > 0 ? (total / 2).toFixed(2) : "";
                        const halfNum = parseFloat(halfVal) || 0;
                        setFormState((prev) => ({
                          ...prev,
                          isSplit: checked,
                          thirdPartyAmount: checked ? prev.thirdPartyAmount || halfVal : "",
                          thirdPartyName: checked ? prev.thirdPartyName || "" : "",
                          personalAmount: checked ? String(Math.max(0, Number((total - (parseFloat(prev.thirdPartyAmount || halfVal) || 0)).toFixed(2)))) : ""
                        }));
                      }}
                      className="w-4 h-4 rounded border-amber-500/50 bg-slate-900 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                    />
                    <span className="font-extrabold text-amber-200 text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>🤝 Dividir gasto com alguém (Rachar Gasto)</span>
                    </span>
                  </label>
                  {formState.isSplit && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                      Split Ativo
                    </span>
                  )}
                </div>

                {formState.isSplit && (
                  <div className="space-y-3 pt-1 border-t border-white/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-300 font-bold block text-xs">
                            Valor da Outra Pessoa (R$)
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const total = Math.max(0, parseFloat(formState.amount) || 0);
                              if (total > 0) {
                                const half = (total / 2).toFixed(2);
                                const halfNum = parseFloat(half);
                                setFormState((prev) => ({
                                  ...prev,
                                  thirdPartyAmount: half,
                                  personalAmount: String(Math.max(0, Number((total - halfNum).toFixed(2))))
                                }));
                              }
                            }}
                            className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-bold transition font-mono tabular-nums"
                            title="Dividir igualmente em duas partes"
                          >
                            50% / 50%
                          </button>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={formState.thirdPartyAmount || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const numVal = parseFloat(val) || 0;
                              const total = Math.max(0, parseFloat(formState.amount) || 0);
                              setFormState((prev) => ({
                                ...prev,
                                thirdPartyAmount: val,
                                personalAmount: String(Math.max(0, Number((total - numVal).toFixed(2))))
                              }));
                            }}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-white font-mono text-sm tabular-nums outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-300 font-bold block mb-1 text-xs">
                          Nome da Pessoa / Devedor
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Lucas, Mariana, Rafael..."
                          value={formState.thirdPartyName || ""}
                          onChange={(e) => setFormState((prev) => ({ ...prev, thirdPartyName: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-white text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Resumo Visual Claro */}
                    {(() => {
                      const total = Math.max(0, parseFloat(formState.amount) || 0);
                      const third = Math.max(0, parseFloat(formState.thirdPartyAmount || "0") || 0);
                      const personal = Math.max(0, Number((total - third).toFixed(2)));
                      const isOver = third >= total && total > 0;

                      return (
                        <div className="space-y-1.5">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-indigo-950/40 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">Impacto no Cartão/Banco</span>
                              <strong className="text-rose-400 font-mono tabular-nums">
                                - {formatBRL(total)}
                              </strong>
                            </div>
                            <div className="h-6 w-px bg-white/10 hidden sm:block" />
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">Seu Gasto Pessoal Real</span>
                              <strong className="text-emerald-400 font-mono tabular-nums">
                                {formatBRL(personal)}
                              </strong>
                            </div>
                            <div className="h-6 w-px bg-white/10 hidden sm:block" />
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">
                                A Receber ({formState.thirdPartyName ? formState.thirdPartyName : "Outra Pessoa"})
                              </span>
                              <strong className="text-amber-400 font-mono tabular-nums">
                                + {formatBRL(third)}
                              </strong>
                            </div>
                          </div>

                          {isOver && (
                            <p className="text-[11px] text-rose-400 font-medium pl-1">
                              ⚠️ O valor da outra pessoa deve ser menor que o valor total da despesa.
                            </p>
                          )}
                          {!isOver && third > 0 && (
                            <p className="text-[10px] text-slate-400 pl-1">
                              ✨ Um item será injetado automaticamente na aba <strong>Valores a Receber</strong> vinculado a {formState.thirdPartyName || "devedor"}.
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Odômetro / KM (Opcional)</label>
                <input
                  type="number"
                  placeholder="Ex: 49120"
                  value={formState.km}
                  onChange={(e) => setFormState((prev) => ({ ...prev, km: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Litros Abastecidos (Opcional)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 42.5"
                  value={formState.liters}
                  onChange={(e) => setFormState((prev) => ({ ...prev, liters: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono tabular-nums"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition flex items-center justify-center"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={
              isSavingTx ||
              (Boolean(formState.isTransfer) && (formState.sourceBank || formState.bankAccount) === formState.destinationBank) ||
              (Boolean(formState.isSplit) && (
                (parseFloat(formState.thirdPartyAmount || "0") || 0) <= 0 ||
                (parseFloat(formState.thirdPartyAmount || "0") || 0) >= (parseFloat(formState.amount || "0") || 0) ||
                !formState.thirdPartyName?.trim()
              ))
            }
            className={`min-h-[44px] px-5 py-2.5 rounded-xl text-white font-extrabold flex items-center justify-center gap-1.5 transition disabled:opacity-50 ${
              formState.isTransfer
                ? "bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/25"
                : isPostoExpress
                ? "bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/20"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {isSavingTx ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>
              {isSavingTx
                ? "Salvando..."
                : formState.isTransfer
                ? "Salvar Transferência"
                : isPostoExpress
                ? "Salvar Abastecimento"
                : "Salvar Lançamento"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
