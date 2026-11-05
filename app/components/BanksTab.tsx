"use client";

import React, { useState } from "react";
import { CreditCard, Pencil, Trash2, Image as ImageIcon, X, Check } from "lucide-react";
import {
  BankItem,
  CreditCardItem,
  Transaction,
  WishlistItem,
  formatBRL,
  compressImageFileToBase64,
  calculateCardExposure,
  calculateBankExposure,
  calculateBankBalance,
  FlowType
} from "@/app/lifeos-data";

export interface BanksTabProps {
  banks: BankItem[];
  editingBankId: string | null;
  setEditingBankId: (id: string | null) => void;
  newBank: { name: string; logoUrl: string; limit?: string; limitType?: string };
  setNewBank: React.Dispatch<React.SetStateAction<{ name: string; logoUrl: string; limit?: string; limitType?: string }>>;
  handleSaveBank: (e: React.FormEvent) => void;
  handleDeleteBank: (id: string) => void;
  cards: CreditCardItem[];
  editingCardId: string | null;
  setEditingCardId: (id: string | null) => void;
  newCard: { name: string; brand: string; limit: string; closingDay: string; dueDay: string; logoUrl: string; bankId: string };
  setNewCard: React.Dispatch<React.SetStateAction<{ name: string; brand: string; limit: string; closingDay: string; dueDay: string; logoUrl: string; bankId: string }>>;
  handleSaveCard: (e: React.FormEvent) => void;
  handleDeleteCard: (id: string) => void;
  handlePayCardInvoice: (cardName: string, originBankName: string) => void;
  transactions: Transaction[];
  wishlist: WishlistItem[];
  editingWishId: string | null;
  setEditingWishId: (id: string | null) => void;
  newWish: { title: string; institution: string; targetAmount: string; savedAmount: string; priority: WishlistItem["priority"] };
  setNewWish: React.Dispatch<React.SetStateAction<{ title: string; institution: string; targetAmount: string; savedAmount: string; priority: WishlistItem["priority"] }>>;
  handleSaveWish: (e: React.FormEvent) => void;
  handleIncrementWish: (w: WishlistItem, delta: number) => void;
  handleDeleteWish: (id: string) => void;
  personalBudgetLimit: number;
  moneyBlur: string;
  getFlowType?: (cat: string) => FlowType;
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition text-xs";

export const BanksTab: React.FC<BanksTabProps> = ({
  banks,
  editingBankId,
  setEditingBankId,
  newBank,
  setNewBank,
  handleSaveBank,
  handleDeleteBank,
  cards,
  editingCardId,
  setEditingCardId,
  newCard,
  setNewCard,
  handleSaveCard,
  handleDeleteCard,
  handlePayCardInvoice,
  transactions,
  wishlist,
  editingWishId,
  setEditingWishId,
  newWish,
  setNewWish,
  handleSaveWish,
  handleIncrementWish,
  handleDeleteWish,
  personalBudgetLimit,
  moneyBlur,
  getFlowType
}) => {
  const [payingInvoiceCard, setPayingInvoiceCard] = useState<{ card: CreditCardItem; usedLimit: number } | null>(null);
  const [paymentOriginBank, setPaymentOriginBank] = useState<string>("");
  const [customWishAmounts, setCustomWishAmounts] = useState<Record<string, string>>({});

  // Agrupar cartões por banco
  const banksWithCards = banks.map((bank) => ({
    bank,
    cards: cards.filter((c) => c.bankId === bank.id)
  }));
  const unlinkedCards = cards.filter((c) => !c.bankId);

  // SPRINT 43: Helper de Gradiente das Marcas de Cartões Apple Wallet
  const getCardGradient = (cardName: string, bankName?: string, globalIdx: number = 0): string => {
    const text = `${cardName} ${bankName || ""}`.toLowerCase();
    if (text.includes("nubank") || text.includes("roxo") || text.includes("ultravioleta")) {
      return "from-[#8A05BE] via-[#5C0380] to-[#2B003D]";
    }
    if (text.includes("inter") || text.includes("laranja")) {
      return "from-[#FF7A00] via-[#D65F00] to-[#5C2300]";
    }
    if (text.includes("btg") || text.includes("pactual")) {
      return "from-[#001E62] via-[#0A1128] to-[#000511]";
    }
    if (text.includes("c6") || text.includes("carbon")) {
      return "from-[#242424] via-[#171717] to-[#0A0A0A]";
    }
    if (text.includes("xp") || text.includes("infinite")) {
      return "from-[#121A17] via-[#0B0F0E] to-[#050706]";
    }
    if (text.includes("bradesco")) {
      return "from-[#CC092F] via-[#990623] to-[#660417]";
    }
    if (text.includes("itau") || text.includes("itaú") || text.includes("personnalite")) {
      return "from-[#EC7000] via-[#C95A00] to-[#994400]";
    }
    if (text.includes("santander")) {
      return "from-[#EC0000] via-[#B80000] to-[#850000]";
    }
    return globalIdx % 2 === 0
      ? "from-indigo-950/90 via-slate-900 to-violet-950/80"
      : "from-slate-900 via-zinc-900 to-slate-950";
  };

  // SPRINT 43: Helper de Micro-Badge da Bandeira do Cartão
  const renderBrandBadge = (brand: string) => {
    const bLower = (brand || "").toLowerCase();
    if (bLower.includes("master")) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="flex items-center -space-x-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EB001B]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] opacity-90" />
          </span>
          <span className="text-[10px] tracking-wider uppercase font-semibold text-white/60 truncate">
            {brand || "Mastercard"}
          </span>
        </div>
      );
    }
    if (bLower.includes("visa")) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-black italic tracking-tighter text-[#1A1F71] bg-white px-1 py-0.5 rounded-[2px] leading-none shrink-0 shadow-xs">
            VISA
          </span>
          <span className="text-[10px] tracking-wider uppercase font-semibold text-white/60 truncate">
            {brand.toUpperCase() === "VISA" ? "Visa Platinum" : brand}
          </span>
        </div>
      );
    }
    if (bLower.includes("elo")) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#EF3E42] via-[#F89F1E] to-[#00A4E4] shrink-0" />
          <span className="text-[10px] tracking-wider uppercase font-semibold text-white/60 truncate">
            {brand || "Elo Nanquim"}
          </span>
        </div>
      );
    }
    if (bLower.includes("amex") || bLower.includes("american")) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-black tracking-tighter text-white bg-[#006FCF] px-1 py-0.5 rounded-[2px] leading-none shrink-0">
            AMEX
          </span>
          <span className="text-[10px] tracking-wider uppercase font-semibold text-white/60 truncate">
            {brand}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <CreditCard className="w-3 h-3 text-white/60 shrink-0" />
        <span className="text-[10px] tracking-wider uppercase font-semibold text-white/60 truncate">
          {brand || "Cartão de Crédito"}
        </span>
      </div>
    );
  };

  const CardVisual = ({ card, globalIdx }: { card: CreditCardItem; globalIdx: number }) => {
    const exposure = calculateCardExposure(card, transactions);
    const usedLimit = exposure.used;
    const availableLimit = exposure.available;
    const usagePercent = exposure.usagePercent;
    const cardBank = banks.find((b) => b.id === card.bankId) || (card.bankName ? banks.find((b) => b.name === card.bankName) || { name: card.bankName, logoUrl: undefined } : null);
    const cardGradient = getCardGradient(card.name, cardBank?.name, globalIdx);

    return (
      <div
        className={`wallet-physical-card relative overflow-hidden rounded-2xl border border-white/12 p-4 sm:p-5 shadow-xl transition-all duration-200 hover:-translate-y-0.5 bg-gradient-to-br ${cardGradient}`}
      >
        {/* Brilho reflexivo diagonal em overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.10),transparent_60%)]" />

        {/* Cabeçalho do Cartão */}
        <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
          {/* Lado Esquerdo */}
          <div className="flex items-center gap-3 min-w-0">
            {card.logoUrl ? (
              <img
                src={card.logoUrl}
                alt={card.name}
                className="w-10 h-10 rounded-2xl object-cover ring-1 ring-white/15 shadow-md shrink-0"
              />
            ) : cardBank?.logoUrl ? (
              <img
                src={cardBank.logoUrl}
                alt={card.name}
                className="w-10 h-10 rounded-2xl object-cover ring-1 ring-white/15 shadow-md shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl ring-1 ring-white/15 shadow-md flex items-center justify-center font-bold text-white shrink-0 bg-white/10 backdrop-blur-md">
                <CreditCard className="w-5 h-5 text-white/90" />
              </div>
            )}
            <div className="min-w-0">
              {/* Linha 1: Micro-badge da bandeira em caixa alta */}
              {renderBrandBadge(card.brand)}
              {/* Linha 2: Nome do cartão */}
              <h3 className="text-lg font-bold tracking-[-0.02em] text-white truncate max-w-[180px] sm:max-w-[240px] leading-tight mt-0.5">
                {card.name}
              </h3>
            </div>
          </div>

          {/* Lado Direito */}
          <div className="flex items-center gap-1.5 shrink-0">
            {usedLimit > 0 && (
              <button
                type="button"
                onClick={() => {
                  const defaultBank =
                    card.bankName ||
                    (card.bankId ? banks.find((b) => b.id === card.bankId)?.name : "") ||
                    banks[0]?.name ||
                    "";
                  setPaymentOriginBank(defaultBank);
                  setPayingInvoiceCard({ card, usedLimit });
                }}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all shadow-sm cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>Pagar Fatura</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setEditingCardId(card.id);
                setNewCard({
                  name: card.name,
                  brand: card.brand,
                  limit: String(card.limit),
                  closingDay: String(card.closingDay),
                  dueDay: String(card.dueDay),
                  logoUrl: card.logoUrl ? card.logoUrl : "",
                  bankId: card.bankId ? card.bankId : ""
                });
              }}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-white/10 shrink-0"
              title="Editar Cartão"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleDeleteCard(card.id)}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer border border-white/10 shrink-0"
              title="Excluir Cartão"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Faixa Intermediária Apple Card: Chip EMV + NFC + Datas do Ciclo */}
        <div className="relative z-10 flex items-center justify-between gap-3 my-3">
          {/* Chip EMV Fiel em SVG + Aproximação Contactless NFC */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-7 rounded-md bg-gradient-to-br from-[#F6D365] via-[#D4AF37] to-[#AA7C11] p-[1px] shadow-sm relative overflow-hidden flex items-center justify-center border border-amber-300/40 shrink-0">
              <svg viewBox="0 0 40 28" className="w-full h-full" fill="none" stroke="rgba(0,0,0,0.32)" strokeWidth="1">
                <rect x="3" y="3" width="34" height="22" rx="3" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="0.8" />
                <path d="M 3 14 L 14 14" />
                <path d="M 26 14 L 37 14" />
                <path d="M 14 3 L 14 25" />
                <path d="M 26 3 L 26 25" />
                <path d="M 14 9 L 26 9" />
                <path d="M 14 19 L 26 19" />
                <circle cx="20" cy="14" r="2.5" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="0.8" />
              </svg>
            </div>
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-white/45 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8.5 16.5a5 5 0 0 1 0-7" />
              <path d="M12 19a8.5 8.5 0 0 0 0-14" />
              <path d="M15.5 21.5a12 12 0 0 0 0-19" />
            </svg>
          </div>

          {/* Pílula Translúcida Sofisticada com Datas de Fechamento e Vencimento */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/25 backdrop-blur-md border border-white/10 text-[11px] font-medium text-white/75 shadow-inner shrink-0">
            <span>Fecha dia <strong className="text-white font-semibold">{card.closingDay || "—"}</strong></span>
            <span className="text-white/30">•</span>
            <span>Vence dia <strong className="text-white font-semibold">{card.dueDay || "—"}</strong></span>
          </div>
        </div>

        {/* Micro-linha de Status de Limite */}
        <div className="relative z-10 flex items-center justify-between text-[11px] mb-1.5 font-medium">
          <span className="text-white/60">Uso do limite</span>
          <span
            className={`font-semibold tabular-nums ${
              usagePercent > 90
                ? "text-rose-400"
                : usagePercent > 70
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {usagePercent.toFixed(1).replace(".", ",")}% utilizado
          </span>
        </div>

        {/* Barra de Progresso */}
        <div className="relative z-10 h-2 w-full rounded-full bg-black/35 border border-white/5 overflow-hidden p-[1px]">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out min-w-[6px] ${
              usagePercent >= 90
                ? "bg-gradient-to-r from-amber-500 to-rose-500"
                : usagePercent >= 70
                ? "bg-gradient-to-r from-amber-400 to-amber-500"
                : "bg-gradient-to-r from-indigo-400 to-emerald-400"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, usagePercent))}%` }}
          />
        </div>

        {/* Dock Métrico em 3 Colunas (Apple SF Pro Typography) */}
        <div className={`relative z-10 mt-3.5 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 items-end ${moneyBlur}`}>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-0.5 block">
              Limite Total
            </span>
            <strong className="text-sm sm:text-base font-sans font-bold tracking-[-0.03em] tabular-nums text-white block">
              {formatBRL(card.limit)}
            </strong>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-0.5 block">
              Fatura Aberta
            </span>
            <strong
              className={`text-sm sm:text-base font-sans font-bold tracking-[-0.03em] tabular-nums block ${
                usedLimit > 0 ? "text-[#FF9F0A]" : "text-slate-300"
              }`}
            >
              {formatBRL(usedLimit)}
            </strong>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-0.5 block text-right">
              Disponível
            </span>
            <strong className="text-sm sm:text-base font-sans font-bold tracking-[-0.03em] tabular-nums text-[#30D158] block text-right">
              {formatBRL(availableLimit)}
            </strong>
          </div>
        </div>
      </div>
    );
  };

  let globalCardIdx = 0;

  return (
    <div className="space-y-8">
      {/* SEÇÃO: MEUS BANCOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Minhas Instituições Financeiras</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cadastre seus bancos, defina limites (cartão de crédito, cheque especial ou global) e vincule seus cartões.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {banks.map((bank) => {
              const exposure = calculateBankExposure(bank, cards, transactions);
              const calcLimit = exposure.limit;
              const used = exposure.used;
              const available = exposure.available;
              const bankCards = cards.filter((c) => c.bankId === bank.id);
              const bankBalance = calculateBankBalance(bank, transactions, getFlowType || (() => "EXPENSE"));

              return (
                <div
                  key={bank.id}
                  className="glass-card px-3.5 py-2.5 rounded-2xl border border-white/[0.08] flex flex-col justify-between gap-2.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {bank.logoUrl ? (
                        <img
                          src={bank.logoUrl}
                          alt={bank.name}
                          className="w-9 h-9 rounded-xl object-cover border border-white/20"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-extrabold text-sm">
                          {bank.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-sm text-white block">{bank.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {bank.limitType || (bankCards.length > 0 ? "Cartão de Crédito" : "Global")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBankId(bank.id);
                          setNewBank({
                            name: bank.name,
                            logoUrl: bank.logoUrl || "",
                            limit: bank.limit ? String(bank.limit) : "",
                            limitType: bank.limitType || "Cartão de Crédito"
                          });
                        }}
                        className="p-1.5 rounded-lg bg-white/10 text-slate-200 hover:bg-white/20 transition"
                        title="Editar banco e limites"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBank(bank.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition"
                        title="Excluir banco"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 text-[11px] space-y-1">
                    <div className="flex justify-between items-center pb-1 mb-1 border-b border-white/5">
                      <span className="text-slate-300 font-semibold">Saldo em Conta:</span>
                      <strong className={`font-mono tabular-nums font-extrabold ${bankBalance >= 0 ? "text-sky-300" : "text-rose-400"} ${moneyBlur}`}>
                        {formatBRL(bankBalance)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Limite:</span>
                      <strong className={`text-white font-mono tabular-nums ${moneyBlur}`}>
                        {formatBRL(calcLimit)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Usado:</span>
                      <span className={`text-rose-400 font-semibold font-mono tabular-nums ${moneyBlur}`}>
                        {formatBRL(used)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Disponível:</span>
                      <span className={`text-emerald-400 font-semibold font-mono tabular-nums ${moneyBlur}`}>
                        {formatBRL(available)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {banks.length === 0 && (
              <p className="text-xs text-slate-400 col-span-full">Nenhum banco cadastrado ainda.</p>
            )}
          </div>
        </div>

        {/* Formulário de Banco com Limite e Tipo */}
        <form
          onSubmit={handleSaveBank}
          className="glass-card p-5 rounded-3xl border border-white/[0.08] space-y-3 text-xs h-fit shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white">
              {editingBankId ? "Editar Instituição & Limite" : "Cadastrar Instituição"}
            </h3>
            {editingBankId && (
              <button
                type="button"
                onClick={() => {
                  setEditingBankId(null);
                  setNewBank({ name: "", logoUrl: "", limit: "", limitType: "Cartão de Crédito" });
                }}
                className="text-[11px] text-rose-400 hover:underline"
              >
                Cancelar
              </button>
            )}
          </div>

          <div>
            <label className="text-[11px] text-slate-300 font-semibold block mb-1">Nome do Banco</label>
            <input
              type="text"
              required
              placeholder="Ex: Nubank, Inter, Itaú..."
              value={newBank.name}
              onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-300 font-semibold block mb-1">Limite Total (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 5000"
                value={newBank.limit || ""}
                onChange={(e) => setNewBank({ ...newBank, limit: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-semibold block mb-1">Tipo de Limite</label>
              <select
                value={newBank.limitType || "Cartão de Crédito"}
                onChange={(e) => setNewBank({ ...newBank, limitType: e.target.value })}
                className={inputClass}
              >
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cheque Especial">Cheque Especial</option>
                <option value="Crédito Pessoal">Crédito Pessoal</option>
                <option value="Conta Especial">Conta Especial</option>
                <option value="Limite Global">Limite Global</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-2">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Logo (Opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f)
                  compressImageFileToBase64(f, (b64) =>
                    setNewBank((p) => ({ ...p, logoUrl: b64 }))
                  );
              }}
              className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600/20 file:text-indigo-300 file:font-semibold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#0A84FF] hover:bg-[#0070E0] text-white font-semibold shadow-sm transition cursor-pointer"
          >
            {editingBankId ? "✓ Salvar Banco e Limites" : "+ Cadastrar Banco"}
          </button>
        </form>
      </div>

      {/* SEÇÃO: CARTÕES POR BANCO */}
      <div className="space-y-8 pt-4 border-t border-white/[0.07]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Meus Cartões de Crédito</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Controle o limite total, a fatura aberta e dê baixa integral na fatura em 1 clique.
              </p>
            </div>

            {/* Cartões agrupados por banco */}
            {banksWithCards.map(
              ({ bank, cards: bankCards }) =>
                bankCards.length > 0 && (
                  <div key={bank.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      {bank.logoUrl ? (
                        <img src={bank.logoUrl} alt={bank.name} className="w-5 h-5 rounded-md object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-md bg-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-[10px]">
                          {bank.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">{bank.name}</span>
                      <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {bankCards.map((card) => {
                        const idx = globalCardIdx++;
                        return <CardVisual key={card.id} card={card} globalIdx={idx} />;
                      })}
                    </div>
                  </div>
                )
            )}

            {/* Cartões sem banco vinculado */}
            {unlinkedCards.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Sem banco vinculado
                  </span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {unlinkedCards.map((card) => {
                    const idx = globalCardIdx++;
                    return <CardVisual key={card.id} card={card} globalIdx={idx} />;
                  })}
                </div>
              </div>
            )}

            {cards.length === 0 && (
              <p className="text-xs text-slate-400">Nenhum cartão cadastrado ainda.</p>
            )}
          </div>

          {/* Formulário de Cartão */}
          <form
            onSubmit={handleSaveCard}
            className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-3.5 text-xs h-fit shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">
                {editingCardId ? "Editar Cartão" : "Cadastrar Novo Cartão"}
              </h3>
              {editingCardId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCardId(null);
                    setNewCard({
                      name: "",
                      brand: "Mastercard Black",
                      limit: "",
                      closingDay: "25",
                      dueDay: "5",
                      logoUrl: "",
                      bankId: ""
                    });
                  }}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Cancelar
                </button>
              )}
            </div>
            <input
              type="text"
              required
              placeholder="Nome do Cartão (Ex: Nubank Ultravioleta)"
              value={newCard.name}
              onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Bandeira"
                value={newCard.brand}
                onChange={(e) => setNewCard({ ...newCard, brand: e.target.value })}
                className={inputClass}
              />
              <input
                type="number"
                required
                placeholder="Limite Total (R$)"
                value={newCard.limit}
                onChange={(e) => setNewCard({ ...newCard, limit: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="number"
                required
                placeholder="Dia Fechamento"
                value={newCard.closingDay}
                onChange={(e) => setNewCard({ ...newCard, closingDay: e.target.value })}
                className={inputClass}
              />
              <input
                type="number"
                required
                placeholder="Dia Vencimento"
                value={newCard.dueDay}
                onChange={(e) => setNewCard({ ...newCard, dueDay: e.target.value })}
                className={inputClass}
              />
            </div>
            {/* Vincular ao banco */}
            <div>
              <label className="text-slate-400 block mb-1">Banco / Instituição</label>
              <select
                value={newCard.bankId}
                onChange={(e) => setNewCard({ ...newCard, bankId: e.target.value })}
                className={inputClass}
              >
                <option value="">— Sem vínculo —</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-2">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Logo do Cartão (Opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f)
                    compressImageFileToBase64(f, (b64) =>
                      setNewCard((p) => ({ ...p, logoUrl: b64 }))
                    );
                }}
                className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600/20 file:text-indigo-300 file:font-semibold"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#0A84FF] hover:bg-[#0070E0] text-white font-semibold shadow-sm transition cursor-pointer"
            >
              {editingCardId ? "✓ Salvar Alterações" : "+ Cadastrar Cartão"}
            </button>
          </form>
        </div>
      </div>

      {/* SEÇÃO: CAIXINHAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-white/[0.07]">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Caixinhas de Objetivos & Reservas</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Guardar qualquer valor aqui gera automaticamente um lançamento de aporte no seu histórico.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishlist.map((w) => {
              const pct = Math.min(100, Math.round((w.savedAmount / Math.max(1, w.targetAmount)) * 100));
              const missing = Math.max(0, w.targetAmount - w.savedAmount);
              const monthsNeeded = Math.ceil(missing / Math.max(1, personalBudgetLimit * 0.5));
              const customVal = customWishAmounts[w.id] ? customWishAmounts[w.id] : "";
              return (
                <div key={w.id} className="glass-card p-4 rounded-2xl border border-white/[0.08] space-y-3 shadow-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-sm block text-white">{w.title}</span>
                      <span className="text-[11px] text-indigo-400 font-medium">
                        Instituição: {w.institution ? w.institution : "Nubank"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                        {w.priority}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingWishId(w.id);
                          setNewWish({
                            title: w.title,
                            institution: w.institution,
                            targetAmount: String(w.targetAmount),
                            savedAmount: String(w.savedAmount),
                            priority: w.priority
                          });
                        }}
                        className="p-1 text-indigo-300 hover:text-white"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWish(w.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className={`flex justify-between text-xs text-slate-400 ${moneyBlur}`}>
                    <span>
                      Guardado: <strong className="text-emerald-400 font-mono tabular-nums">{formatBRL(w.savedAmount)}</strong>
                    </span>
                    <span>
                      Meta: <strong className="text-white font-mono tabular-nums">{formatBRL(w.targetAmount)}</strong>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                    <span className={`font-mono tabular-nums ${moneyBlur}`}>
                      Faltam {formatBRL(missing)} (~{monthsNeeded}m)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleIncrementWish(w, 50)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold transition"
                      >
                        + R$ 50
                      </button>
                      <button
                        type="button"
                        onClick={() => handleIncrementWish(w, 100)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 font-bold transition"
                      >
                        + R$ 100
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.05]">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Outro valor (R$)..."
                      value={customVal}
                      onChange={(e) => setCustomWishAmounts((prev) => ({ ...prev, [w.id]: e.target.value }))}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = parseFloat(customVal);
                        if (val > 0) {
                          handleIncrementWish(w, val);
                          setCustomWishAmounts((prev) => ({ ...prev, [w.id]: "" }));
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                    >
                      Guardar
                    </button>
                    {w.savedAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const val = parseFloat(customVal);
                          if (val > 0) {
                            handleIncrementWish(w, -val);
                            setCustomWishAmounts((prev) => ({ ...prev, [w.id]: "" }));
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
                        title="Resgatar valor para sua conta"
                      >
                        Resgatar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleSaveWish}
          className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-3.5 text-xs h-fit shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white">
              {editingWishId ? "Editar Caixinha" : "Nova Caixinha / Meta"}
            </h3>
            {editingWishId && (
              <button
                type="button"
                onClick={() => {
                  setEditingWishId(null);
                  setNewWish({
                    title: "",
                    institution: cards[0] ? cards[0].name : "Nubank Ultravioleta",
                    targetAmount: "",
                    savedAmount: "0",
                    priority: "Média"
                  });
                }}
                className="text-[11px] text-rose-400 hover:underline"
              >
                Cancelar
              </button>
            )}
          </div>
          <input
            type="text"
            required
            placeholder="Nome do Objetivo (Ex: Viagem, PS5...)"
            value={newWish.title}
            onChange={(e) => setNewWish({ ...newWish, title: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            required
            placeholder="Instituição (Ex: Nubank, Inter...)"
            value={newWish.institution}
            onChange={(e) => setNewWish({ ...newWish, institution: e.target.value })}
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="number"
              required
              placeholder="Alvo Total (R$)"
              value={newWish.targetAmount}
              onChange={(e) => setNewWish({ ...newWish, targetAmount: e.target.value })}
              className={inputClass}
            />
            <input
              type="number"
              placeholder="Já Guardado (R$)"
              value={newWish.savedAmount}
              onChange={(e) => setNewWish({ ...newWish, savedAmount: e.target.value })}
              className={inputClass}
            />
          </div>
          <select
            value={newWish.priority}
            onChange={(e) => setNewWish({ ...newWish, priority: e.target.value as WishlistItem["priority"] })}
            className={inputClass}
          >
            <option value="Alta">Prioridade Alta</option>
            <option value="Média">Prioridade Média</option>
            <option value="Baixa">Prioridade Baixa</option>
          </select>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg transition"
          >
            {editingWishId ? "✓ Salvar Alterações" : "+ Criar Caixinha"}
          </button>
        </form>
      </div>

      {/* Modal de Pagamento e Fechamento de Fatura em 1 Clique */}
      {payingInvoiceCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Pagar Fatura de Cartão</h3>
                  <p className="text-[11px] text-slate-400">{payingInvoiceCard.card.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPayingInvoiceCard(null)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl p-4 bg-slate-950/70 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-semibold">Valor da Fatura Aberta:</span>
                <strong className="text-lg font-mono font-extrabold text-amber-400 tabular-nums">
                  {formatBRL(payingInvoiceCard.usedLimit)}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                <span>
                  Fechamento dia {payingInvoiceCard.card.closingDay} • Vence dia {payingInvoiceCard.card.dueDay}
                </span>
                <span className="font-mono text-indigo-300 font-bold tabular-nums">
                  {
                    transactions.filter(
                      (t) =>
                        t.paymentMethod === "Cartão de Crédito" &&
                        t.cardUsed === payingInvoiceCard.card.name &&
                        t.status === "Pendente / Na Fatura"
                    ).length
                  }{" "}
                  compras pendentes
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">Debitar da Conta / Banco de Origem:</label>
              <select
                value={
                  paymentOriginBank ||
                  payingInvoiceCard.card.bankName ||
                  (payingInvoiceCard.card.bankId
                    ? banks.find((b) => b.id === payingInvoiceCard.card.bankId)?.name
                    : "") ||
                  banks[0]?.name ||
                  ""
                }
                onChange={(e) => setPaymentOriginBank(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-emerald-500 text-xs"
              >
                {banks.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} {b.accountType ? `(${b.accountType})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] leading-relaxed">
              ⚡ Ao confirmar, todas as compras em aberto deste cartão serão marcadas como <strong>Pagas</strong>{" "}
              (liberando o limite de {formatBRL(payingInvoiceCard.usedLimit)} imediatamente) e um lançamento de saída
              será registrado no banco selecionado.
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayingInvoiceCard(null)}
                className="min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition text-xs flex items-center justify-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const defaultBank =
                    payingInvoiceCard.card.bankName ||
                    (payingInvoiceCard.card.bankId
                      ? banks.find((b) => b.id === payingInvoiceCard.card.bankId)?.name
                      : "") ||
                    banks[0]?.name ||
                    "Nubank";
                  const chosenBank = paymentOriginBank || defaultBank;
                  handlePayCardInvoice(payingInvoiceCard.card.name, chosenBank);
                  setPayingInvoiceCard(null);
                }}
                className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition text-xs"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Pagamento</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BanksTab;
