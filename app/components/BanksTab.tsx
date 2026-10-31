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

  const CardVisual = ({ card, globalIdx }: { card: CreditCardItem; globalIdx: number }) => {
    const exposure = calculateCardExposure(card, transactions);
    const usedLimit = exposure.used;
    const availableLimit = exposure.available;
    const usagePercent = exposure.usagePercent;
    const cardBank = banks.find((b) => b.id === card.bankId) || (card.bankName ? { name: card.bankName } : null);
    return (
      <div
        className={`p-6 rounded-3xl border relative overflow-hidden transition-all duration-300 shadow-2xl ${
          globalIdx % 2 === 0
            ? "bg-gradient-to-br from-indigo-950/90 via-slate-900 to-violet-950/80 border-indigo-500/30"
            : "bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 border-white/15"
        }`}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            {card.logoUrl ? (
              <img
                src={card.logoUrl}
                alt={card.name}
                className="w-10 h-10 rounded-2xl object-cover border border-white/20 shadow-md"
              />
            ) : (
              <div className="p-2.5 rounded-2xl bg-white/10 text-white">
                <CreditCard className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 block">
                  {card.brand}
                </span>
                {cardBank && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                    {cardBank.name}
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-base text-white mt-0.5">{card.name}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
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
                className="min-h-[36px] px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>💳 Pagar Fatura</span>
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
              className="min-h-[36px] min-w-[36px] p-2 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 transition flex items-center justify-center"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleDeleteCard(card.id)}
              className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-slate-400 hover:text-rose-400 transition flex items-center justify-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200/80 to-yellow-500/80 border border-amber-100/40" />
          <span className="text-xs font-mono tabular-nums text-slate-300">
            Fecha dia {card.closingDay} • Vence dia {card.dueDay}
          </span>
        </div>
        <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full transition-all duration-700 ${
              usagePercent >= 80 ? "bg-rose-500" : "bg-gradient-to-r from-indigo-400 to-emerald-400"
            }`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <div className={`grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs ${moneyBlur}`}>
          <div>
            <span className="text-slate-400 block text-[10px]">Limite Total</span>
            <strong className="text-xs text-white font-mono tabular-nums">{formatBRL(card.limit)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Fatura Aberta</span>
            <strong className="text-xs text-amber-300 font-mono tabular-nums">{formatBRL(usedLimit)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Disponível</span>
            <strong className="text-xs text-emerald-400 font-mono tabular-nums">{formatBRL(availableLimit)}</strong>
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
            <h2 className="text-lg font-extrabold text-white tracking-tight">Minhas Instituições Financeiras</h2>
            <p className="text-xs text-slate-400">
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
                  className="glass-card p-4 rounded-2xl border border-white/[0.08] flex flex-col justify-between gap-3 shadow-md"
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
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg transition"
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
              <h2 className="text-lg font-extrabold text-white tracking-tight">Meus Cartões de Crédito</h2>
              <p className="text-xs text-slate-400">
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
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg transition"
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
            <h2 className="text-lg font-extrabold text-white tracking-tight">Caixinhas de Objetivos & Reservas</h2>
            <p className="text-xs text-slate-400">
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
                <div key={w.id} className="glass-card p-5 rounded-3xl border border-white/[0.08] space-y-3 shadow-lg">
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
