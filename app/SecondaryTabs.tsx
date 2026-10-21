"use client";

import React, { useState, useEffect } from "react";
import {
  Plus, CreditCard, Car, Table2, Search, CheckCircle2, Clock, Trash2,
  Settings, RefreshCw, Wrench, Activity, Brain, Target, Flame, Pencil,
  Image as ImageIcon, Download, Upload, Camera, User, FileText, HandCoins,
  Users, Share2, Check, Layers, AlertTriangle, Save
} from "lucide-react";
import {
  ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, BarChart, Bar
} from "recharts";
import {
  ActiveTab, Transaction, CreditCardItem, StaticStatusItem, WishlistItem,
  BioLog, StravaStats, BrainNote, PersonalOKR, CustomAlertRule, ChartThemeColors,
  CategoryCatalogItem, SystemLogEntry, ThemeMode, FlowType, APP_VERSION,
  formatBRL, sanitizeText, compressImageFileToBase64, renderCategorySemanticIcon,
  CustomCyberTooltip, ThemeSegmentedControl, buildWhatsAppChargeText
} from "./lifeos-data";

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
    <div className="flex items-center gap-2 max-w-[190px]">
      <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <input
        type="text"
        placeholder="Nome do devedor..."
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
        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white focus:border-amber-400 outline-none text-xs"
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
  filteredTransactions: Transaction[];
  transactions: Transaction[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleExportCSV: () => void;
  handleOpenNewTxModal: (defaultCategory?: string) => void;
  getFlowType: (cat: string) => FlowType;
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
  handlePartialPaymentReceivable: (tx: Transaction, addAmount: number) => void;
  notify: (title: string, subtitle?: string, type?: "success" | "warning" | "info", cat?: any) => void;
  editingCardId: string | null;
  setEditingCardId: (id: string | null) => void;
  newCard: { name: string; brand: string; limit: string; closingDay: string; dueDay: string; logoUrl: string };
  setNewCard: React.Dispatch<React.SetStateAction<{ name: string; brand: string; limit: string; closingDay: string; dueDay: string; logoUrl: string }>>;
  handleSaveCard: (e: React.FormEvent) => void;
  handleDeleteCard: (id: string) => void;
  handlePayCardInvoice: (cardName: string) => void;
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
  newNote: { title: string; content: string; tag: BrainNote["tag"] };
  setNewNote: (val: any) => void;
  handleSaveNote: (e: React.FormEvent) => void;
  handleDeleteNote: (id: string) => void;
  handleExportFullBackupJSON: () => void;
  handleImportFullBackupJSON: (f: File) => void;
  handleUpdateProfileAvatar: (f: File) => void;
  sheetApiUrl: string;
  setSheetApiUrl: (u: string) => void;
  isSyncing: boolean;
  syncFromGoogleSheets: () => void;
  pushAllToGoogleSheets?: () => void;
  sheetsSyncStatus?: { state: "idle" | "success" | "error"; message: string; timestamp?: string };
  stravaConfig: { athleteId: string; clientId: string; clientSecret: string; refreshToken: string };
  setStravaConfig: (cfg: any) => void;
  stravaSyncStatus?: { state: "idle" | "success" | "error"; message: string; timestamp?: string };
  paymentMethods: string[];
  newMethodName: string;
  setNewMethodName: (v: string) => void;
  handleAddPaymentMethod: (e: React.FormEvent) => void;
  handleDeletePaymentMethod: (m: string) => void;
  categoriesCatalog: CategoryCatalogItem[];
  newCategoryForm: { name: string; flow: FlowType; isAuto: boolean; color: string };
  setNewCategoryForm: (v: any) => void;
  handleAddCustomCategory: (e: React.FormEvent) => void;
  handleDeleteCategory: (n: string) => void;
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
    setNewStatusItem, handleSaveStaticStatus, saveStaticStatus, filteredTransactions,
    searchQuery, setSearchQuery, handleExportCSV, handleOpenNewTxModal, getFlowType,
    cards, categoryColors, handleToggleStatus, handleStartEditTransaction, handleDeleteTransaction,
    receivableItems, receivablesAnalytics, handleAssignDebtor, handlePartialPaymentReceivable,
    notify, editingCardId, setEditingCardId, newCard, setNewCard, handleSaveCard, handleDeleteCard,
    handlePayCardInvoice, wishlist, editingWishId, setEditingWishId, newWish, setNewWish,
    handleSaveWish, handleIncrementWish, handleDeleteWish, personalBudgetLimit, autoMetrics,
    chartTheme, updateChartThemeColor, stravaStats, isSyncingStrava, syncStravaFromApi,
    bioLogs, editingBioId, setEditingBioId, newBio, setNewBio, handleSaveBioLog, handleDeleteBioLog,
    okrs, saveOkrs, newOkr, setNewOkr, handleAddOkr, notes, selectedNoteTag, setSelectedNoteTag,
    editingNoteId, setEditingNoteId, newNote, setNewNote, handleSaveNote, handleDeleteNote,
    handleExportFullBackupJSON, handleImportFullBackupJSON, handleUpdateProfileAvatar,
    sheetApiUrl, setSheetApiUrl, isSyncing, syncFromGoogleSheets, pushAllToGoogleSheets,
    sheetsSyncStatus, stravaConfig, setStravaConfig, stravaSyncStatus,
    paymentMethods, newMethodName, setNewMethodName, handleAddPaymentMethod, handleDeletePaymentMethod,
    categoriesCatalog, newCategoryForm, setNewCategoryForm, handleAddCustomCategory, handleDeleteCategory,
    monthlyInvestmentGoal, patrimonyTarget, annualRunGoalKm, setPersonalBudgetLimit,
    setMonthlyInvestmentGoal, setPatrimonyTarget, setAnnualRunGoalKm, updateGoalsStorage,
    alertRules, saveAlertRules, newAlert, setNewAlert, handleAddAlertRule, systemLogs,
    setSystemLogs, logFilter, setLogFilter
  } = props;

  const [customWishAmounts, setCustomWishAmounts] = useState<Record<string, string>>({});
  const [partialInputs, setPartialInputs] = useState<Record<string, string>>({});

  if (activeTab === "status") {
    const rendaBase = staticStatus.filter((i) => i.type === "Renda Base" || i.type === "Benefício").reduce((a, b) => a + b.amount, 0);
    const custoFixoBase = staticStatus.filter((i) => i.type === "Custo Fixo").reduce((a, b) => a + b.amount, 0);
    const aporteBase = staticStatus.filter((i) => i.type === "Meta Aporte").reduce((a, b) => a + b.amount, 0);
    const margemLivre = rendaBase - custoFixoBase - aporteBase;

    return (
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-2xl border border-indigo-500/30">
          <h2 className="text-lg font-extrabold text-white">Meu Status Atual</h2>
          <p className="text-xs text-slate-400 mt-0.5">Visualize quanto você ganha hoje, seus benefícios, seus gastos fixos mensais e quanto sobra livre no seu orçamento base.</p>
        </div>
        <div className={`grid grid-cols-1 sm:grid-cols-4 gap-4 ${moneyBlur}`}>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.07]"><span className="text-xs text-slate-400">Renda Mensal + Benefícios</span><p className="text-2xl font-extrabold text-emerald-400 mt-1">{formatBRL(rendaBase)}</p></div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.07]"><span className="text-xs text-slate-400">Total de Custos Fixos</span><p className="text-2xl font-extrabold text-rose-400 mt-1">{formatBRL(custoFixoBase)}</p></div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.07]"><span className="text-xs text-slate-400">Investimento Planejado</span><p className="text-2xl font-extrabold text-indigo-400 mt-1">{formatBRL(aporteBase)}</p></div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.07]"><span className="text-xs text-slate-400">Sobra Livre p/ Variáveis</span><p className="text-2xl font-extrabold text-sky-400 mt-1">{formatBRL(margemLivre)}</p></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/[0.07] overflow-x-auto">
            <h3 className="text-sm font-bold mb-1">Minha Estrutura Mensal Fixa</h3>
            <p className="text-xs text-slate-400 mb-4">Clique no lápis em qualquer item para atualizar valores sempre que seu salário ou contas mudarem.</p>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-slate-400">
                  <th className="py-3 px-3">Descrição</th><th className="py-3 px-3">Classificação</th><th className="py-3 px-3">Observações</th><th className="py-3 px-3 text-right">Valor Mensal</th><th className="py-3 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {staticStatus.map((st) => (
                  <tr key={st.id} className={`transition ${editingStatusId === st.id ? "bg-indigo-500/15" : "hover:bg-white/[0.02]"}`}>
                    <td className="py-3.5 px-3 font-semibold">{st.title}</td>
                    <td className="py-3.5 px-3"><span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${st.type === "Renda Base" || st.type === "Benefício" ? "bg-emerald-500/15 text-emerald-400" : st.type === "Meta Aporte" ? "bg-indigo-500/15 text-indigo-400" : "bg-rose-500/15 text-rose-400"}`}>{st.type}</span></td>
                    <td className="py-3.5 px-3 text-slate-400">{st.notes ? st.notes : "—"}</td>
                    <td className={`py-3.5 px-3 text-right font-bold ${moneyBlur}`}>{formatBRL(st.amount)}</td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button type="button" onClick={() => { setEditingStatusId(st.id); setNewStatusItem({ title: st.title, type: st.type, amount: String(st.amount), notes: st.notes }); }} className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/30 transition"><Pencil className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => saveStaticStatus(staticStatus.filter((i) => i.id !== st.id))} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form onSubmit={handleSaveStaticStatus} className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4 text-xs h-fit">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{editingStatusId ? "Editar Item do Status Atual" : "Adicionar Item ao Meu Status"}</h3>
              {editingStatusId && <button type="button" onClick={() => { setEditingStatusId(null); setNewStatusItem({ title: "", type: "Custo Fixo", amount: "", notes: "" }); }} className="text-[11px] text-rose-400 hover:underline">Cancelar</button>}
            </div>
            <input type="text" required placeholder="Descrição (Ex: Salário ACS, Academia...)" value={newStatusItem.title} onChange={(e) => setNewStatusItem({ ...newStatusItem, title: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
            <select value={newStatusItem.type} onChange={(e) => setNewStatusItem({ ...newStatusItem, type: e.target.value as StaticStatusItem["type"] })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10">
              <option value="Renda Base">Renda Base</option><option value="Benefício">Benefício</option><option value="Custo Fixo">Custo Fixo</option><option value="Meta Aporte">Meta Aporte</option>
            </select>
            <input type="number" step="0.01" required placeholder="Valor Mensal (R$)" value={newStatusItem.amount} onChange={(e) => setNewStatusItem({ ...newStatusItem, amount: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
            <input type="text" placeholder="Observação (Ex: Recebo no 5º dia útil)" value={newStatusItem.notes} onChange={(e) => setNewStatusItem({ ...newStatusItem, notes: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
            <button type="submit" className={`w-full py-2.5 rounded-xl text-white font-bold shadow-lg transition ${editingStatusId ? "bg-emerald-600 hover:bg-emerald-500" : "bg-indigo-600 hover:bg-indigo-500"}`}>{editingStatusId ? "✓ Salvar Alterações" : "+ Adicionar ao Painel"}</button>
          </form>
        </div>
      </div>
    );
  }

  if (activeTab === "transactions") {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-white">Lançamentos</h2>
            <p className="text-xs text-slate-400">Registre, pesquise e edite todas as suas entradas, gastos à vista ou parcelados, valores a receber e aportes.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input type="text" placeholder="Pesquisar descrição ou categoria..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-950 border border-white/10 outline-none" />
            </div>
            <button type="button" onClick={handleExportCSV} className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-200 font-semibold flex items-center gap-1.5"><Download className="w-3.5 h-3.5 text-indigo-400" /> Exportar CSV</button>
            <button type="button" onClick={() => handleOpenNewTxModal()} className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Novo Lançamento</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400">
                <th className="py-3.5 px-3">Data</th><th className="py-3.5 px-3">Descrição</th><th className="py-3.5 px-3">Categoria</th><th className="py-3.5 px-3">Custo</th><th className="py-3.5 px-3">Método</th><th className="py-3.5 px-3">Quilometragem</th><th className="py-3.5 px-3">Situação</th><th className="py-3.5 px-3 text-right">Valor</th><th className="py-3.5 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredTransactions.map((tx) => {
                const flow = getFlowType(tx.category);
                const matchedCard = cards.find((c) => c.name === tx.cardUsed);
                const displayLogo = tx.iconUrl ? tx.iconUrl : matchedCard?.logoUrl;
                const catColor = categoryColors[tx.category] ? categoryColors[tx.category] : "#6366f1";
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-3 font-mono text-slate-400">{tx.date}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-100">
                      <div className="flex items-center gap-2.5">
                        {displayLogo ? <img src={displayLogo} alt="Ícone" className="w-7 h-7 rounded-xl object-cover border border-white/15 shrink-0" /> : <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${catColor}20`, border: `1px solid ${catColor}45` }}>{renderCategorySemanticIcon(tx.category, catColor)}</div>}
                        <div>
                          <span>{tx.description}</span>
                          {tx.installmentInfo && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] font-mono">
                              <Layers className="w-2.5 h-2.5 inline mr-0.5" />{tx.installmentInfo}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5" style={{ backgroundColor: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />{tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${tx.costType === "Fixo" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-slate-800/80 text-slate-400"}`}>{tx.costType}</span></td>
                    <td className="py-3.5 px-3"><span className="font-medium text-slate-200">{tx.paymentMethod}</span>{tx.cardUsed && <span className="block text-[10px] text-indigo-400">{tx.cardUsed}</span>}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-400">{tx.km ? `${tx.km.toLocaleString("pt-BR")} km` : "—"}{tx.liters ? ` (${tx.liters}L)` : ""}</td>
                    <td className="py-3.5 px-3">
                      <button onClick={() => handleToggleStatus(tx)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${tx.status === "Pago" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"}`}>
                        {tx.status === "Pago" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{tx.status}
                      </button>
                    </td>
                    <td className={`py-3.5 px-3 text-right font-extrabold ${moneyBlur} ${flow === "INCOME" ? "text-emerald-400" : flow === "INVESTMENT" ? "text-indigo-400" : "text-rose-400"}`}>{flow === "INCOME" ? "+" : "-"} {formatBRL(tx.amount)}</td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button type="button" onClick={() => handleStartEditTransaction(tx)} className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/30 transition"><Pencil className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => handleDeleteTransaction(tx.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === "receivables") {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-amber-400" /> Valores a Receber 2.0 (Controle de Devedores e Abatimentos)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Todo lançamento com a categoria <strong>"A Receber"</strong> é espelhado aqui. Atribua o devedor, registre abatimentos parciais ou envie o resumo para o WhatsApp em 1 clique.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenNewTxModal("A Receber")}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" /> Novo Valor a Receber
          </button>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${moneyBlur}`}>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.07]">
            <span className="text-xs text-slate-400 block mb-1">Saldo Restante a Receber</span>
            <p className="text-2xl font-extrabold text-amber-400">{formatBRL(receivablesAnalytics.totalOpen)}</p>
            <span className="text-[11px] text-slate-400">Descontando abatimentos parciais</span>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.07]">
            <span className="text-xs text-slate-400 block mb-1">Total Já Recebido / Abatido</span>
            <p className="text-2xl font-extrabold text-emerald-400">{formatBRL(receivablesAnalytics.totalPaid)}</p>
            <span className="text-[11px] text-slate-400">Soma de quitações e pagamentos parciais</span>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.07]">
            <span className="text-xs text-slate-400 block mb-1">Volume Total Emprestado</span>
            <p className="text-2xl font-extrabold text-indigo-400">{formatBRL(receivablesAnalytics.totalLoaned)}</p>
            <span className="text-[11px] text-slate-400">{receivableItems.length} lançamentos vinculados</span>
          </div>
        </div>

        {receivablesAnalytics.openByPerson.filter((p) => p.aberto > 0).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {receivablesAnalytics.openByPerson
              .filter((p) => p.aberto > 0)
              .map((p) => (
                <div key={p.person} className="glass-card p-4 rounded-2xl border border-amber-500/25 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white block">{p.person}</span>
                    <span className={`text-sm font-extrabold text-amber-400 ${moneyBlur}`}>Deve: {formatBRL(p.aberto)}</span>
                    {p.pago > 0 && <span className={`block text-[10px] text-emerald-400 ${moneyBlur}`}>Já pagou: {formatBRL(p.pago)}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const personTxs = receivableItems.filter((i) => (i.debtorName.trim() ? i.debtorName.trim() : "Não Atribuído") === p.person);
                      const text = buildWhatsAppChargeText(p.person, personTxs);
                      navigator.clipboard.writeText(text);
                      notify("Resumo Copiado p/ WhatsApp!", `Cole na conversa com ${p.person}.`, "success");
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Resumo WhatsApp
                  </button>
                </div>
              ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Saldo Devedor Atual por Pessoa</h3>
              <p className="text-[11px] text-slate-400">Montante líquido em aberto que cada pessoa deve atualmente.</p>
            </div>
            <div className="h-64 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={receivablesAnalytics.openByPerson} barSize={34}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                  <XAxis dataKey="person" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip content={<CustomCyberTooltip isCurrency={true} />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="aberto" name="Saldo em Aberto (R$)" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Histórico por Pessoa: Total Emprestado vs. Total Pago</h3>
              <p className="text-[11px] text-slate-400">Comparativo acumulado entre tudo o que foi emprestado e o que já foi pago por pessoa.</p>
            </div>
            <div className="h-64 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={receivablesAnalytics.historyByPerson} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                  <XAxis dataKey="person" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip content={<CustomCyberTooltip isCurrency={true} />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="totalEmprestado" name="Total Emprestado" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pago" name="Total Pago" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Tabela de Atribuição de Devedores e Abatimento Parcial</h3>
            <p className="text-xs text-slate-400">
              Digite o nome da pessoa (salva automaticamente ao sair do campo), abata valores parciais ou clique em <strong>Pago</strong> para quitar 100%.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-slate-400">
                  <th className="py-3.5 px-3">Data</th>
                  <th className="py-3.5 px-3">Descrição Herdada</th>
                  <th className="py-3.5 px-3">Pessoa (Devedor)</th>
                  <th className="py-3.5 px-3">Abater Valor Parcial</th>
                  <th className="py-3.5 px-3">Situação (Sincronizada)</th>
                  <th className="py-3.5 px-3 text-right">Total / Restante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {receivableItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Nenhum lançamento classificado como "A Receber" até o momento.
                    </td>
                  </tr>
                ) : (
                  receivableItems.map((item) => {
                    const pInput = partialInputs[item.id] ? partialInputs[item.id] : "";
                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-3 font-mono text-slate-400">{item.date}</td>
                        <td className="py-3.5 px-3 font-semibold text-white">
                          {item.description}
                          {item.cardUsed && <span className="block text-[10px] text-indigo-400">{item.paymentMethod} • {item.cardUsed}</span>}
                        </td>
                        <td className="py-3.5 px-3">
                          <DebtorInputCell txId={item.id} initialValue={item.debtorName} onCommit={handleAssignDebtor} />
                        </td>
                        <td className="py-3.5 px-3">
                          {item.status === "Pago" ? (
                            <span className="text-[11px] text-emerald-400 font-semibold">100% Quitado</span>
                          ) : (
                            <div className="flex items-center gap-1.5 max-w-[180px]">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="Abater R$..."
                                value={pInput}
                                onChange={(e) => setPartialInputs((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                className="w-24 px-2 py-1 rounded-lg bg-slate-950 border border-white/10 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const val = parseFloat(pInput);
                                  if (val > 0) {
                                    handlePartialPaymentReceivable(item, val);
                                    setPartialInputs((prev) => ({ ...prev, [item.id]: "" }));
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition"
                              >
                                Abater
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition ${
                              item.status === "Pago"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {item.status === "Pago" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {item.status}
                          </button>
                        </td>
                        <td className={`py-3.5 px-3 text-right ${moneyBlur}`}>
                          <span className="font-extrabold text-amber-400 block">{formatBRL(item.remaining)}</span>
                          {item.effectivePaid > 0 && item.status !== "Pago" && (
                            <span className="text-[10px] text-emerald-400 block">
                              Pago: {formatBRL(item.effectivePaid)} de {formatBRL(item.amount)}
                            </span>
                          )}
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

  if (activeTab === "cards") {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-white">Meus Cartões de Crédito</h2>
              <p className="text-xs text-slate-400">Controle o limite total, o valor acumulado na fatura aberta e dê baixa na fatura em 1 clique quando pagar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {cards.map((card, idx) => {
                const usedLimit = props.transactions
                  .filter((t) => t.paymentMethod === "Cartão de Crédito" && t.cardUsed === card.name && t.status === "Pendente / Na Fatura")
                  .reduce((acc, curr) => acc + curr.amount, 0);
                const availableLimit = Math.max(0, card.limit - usedLimit);
                const usagePercent = Math.min(100, Math.round((usedLimit / Math.max(1, card.limit)) * 100));
                return (
                  <div key={card.id} className={`p-6 rounded-3xl border relative overflow-hidden transition-all duration-300 shadow-2xl ${idx % 2 === 0 ? "bg-gradient-to-br from-indigo-950/90 via-slate-900 to-violet-950/80 border-indigo-500/30" : "bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 border-white/15"}`}>
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        {card.logoUrl ? <img src={card.logoUrl} alt={card.name} className="w-10 h-10 rounded-2xl object-cover border border-white/20 shadow-md" /> : <div className="p-2.5 rounded-2xl bg-white/10 text-white"><CreditCard className="w-5 h-5" /></div>}
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 block">{card.brand}</span>
                          <h3 className="font-extrabold text-base text-white mt-0.5">{card.name}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {usedLimit > 0 && (
                          <button type="button" onClick={() => handlePayCardInvoice(card.name)} className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition">
                            Quitar Fatura
                          </button>
                        )}
                        <button type="button" onClick={() => { setEditingCardId(card.id); setNewCard({ name: card.name, brand: card.brand, limit: String(card.limit), closingDay: String(card.closingDay), dueDay: String(card.dueDay), logoUrl: card.logoUrl ? card.logoUrl : "" }); }} className="p-1.5 rounded-lg bg-white/10 text-slate-200 hover:bg-white/20 transition"><Pencil className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => handleDeleteCard(card.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200/80 to-yellow-500/80 border border-amber-100/40" />
                      <span className="text-xs font-mono text-slate-300">Fecha dia {card.closingDay} • Vence dia {card.dueDay}</span>
                    </div>
                    <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden mb-3">
                      <div className={`h-full transition-all duration-700 ${usagePercent >= 80 ? "bg-rose-500" : "bg-gradient-to-r from-indigo-400 to-emerald-400"}`} style={{ width: `${usagePercent}%` }} />
                    </div>
                    <div className={`grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs ${moneyBlur}`}>
                      <div><span className="text-slate-400 block text-[10px]">Limite Total</span><strong className="text-xs text-white">{formatBRL(card.limit)}</strong></div>
                      <div><span className="text-slate-400 block text-[10px]">Fatura Aberta</span><strong className="text-xs text-amber-300">{formatBRL(usedLimit)}</strong></div>
                      <div><span className="text-slate-400 block text-[10px]">Disponível</span><strong className="text-xs text-emerald-400">{formatBRL(availableLimit)}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSaveCard} className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-3.5 text-xs h-fit">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{editingCardId ? "Editar Cartão Selecionado" : "Cadastrar Novo Cartão"}</h3>
              {editingCardId && <button type="button" onClick={() => { setEditingCardId(null); setNewCard({ name: "", brand: "Mastercard Black", limit: "", closingDay: "25", dueDay: "5", logoUrl: "" }); }} className="text-[11px] text-rose-400 hover:underline">Cancelar</button>}
            </div>
            <input type="text" required placeholder="Nome do Cartão (Ex: Nubank Ultravioleta)" value={newCard.name} onChange={(e) => setNewCard({ ...newCard, name: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
            <div className="grid grid-cols-2 gap-2.5">
              <input type="text" placeholder="Bandeira" value={newCard.brand} onChange={(e) => setNewCard({ ...newCard, brand: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
              <input type="number" required placeholder="Limite Total (R$)" value={newCard.limit} onChange={(e) => setNewCard({ ...newCard, limit: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <input type="number" required placeholder="Dia do Fechamento" value={newCard.closingDay} onChange={(e) => setNewCard({ ...newCard, closingDay: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
              <input type="number" required placeholder="Dia do Vencimento" value={newCard.dueDay} onChange={(e) => setNewCard({ ...newCard, dueDay: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-2">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Anexar Logo do Banco (Nubank, Inter...)</label>
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) compressImageFileToBase64(f, (b64) => setNewCard((p) => ({ ...p, logoUrl: b64 }))); }} className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600/20 file:text-indigo-300 file:font-semibold" />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition">{editingCardId ? "✓ Salvar Alterações" : "+ Cadastrar Cartão"}</button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-white/[0.07]">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-white">Caixinhas de Objetivos e Lista de Desejos</h2>
              <p className="text-xs text-slate-400">Sempre que você adicionar um valor por aqui, ele será registrado automaticamente na aba <strong>Lançamentos</strong>.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wishlist.map((w) => {
                const pct = Math.min(100, Math.round((w.savedAmount / Math.max(1, w.targetAmount)) * 100));
                const missing = Math.max(0, w.targetAmount - w.savedAmount);
                const monthsNeeded = Math.ceil(missing / Math.max(1, personalBudgetLimit * 0.5));
                const customVal = customWishAmounts[w.id] ? customWishAmounts[w.id] : "";
                return (
                  <div key={w.id} className="glass-card p-5 rounded-2xl border border-white/[0.07] space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-sm block text-white">{w.title}</span>
                        <span className="text-[11px] text-indigo-400 font-medium">Guardado em: {w.institution ? w.institution : "Nubank Ultravioleta"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">{w.priority}</span>
                        <button type="button" onClick={() => { setEditingWishId(w.id); setNewWish({ title: w.title, institution: w.institution, targetAmount: String(w.targetAmount), savedAmount: String(w.savedAmount), priority: w.priority }); }} className="p-1 text-indigo-300 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => handleDeleteWish(w.id)} className="p-1 text-slate-500 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className={`flex justify-between text-xs text-slate-400 ${moneyBlur}`}>
                      <span>Já Guardado: {formatBRL(w.savedAmount)}</span>
                      <span>Objetivo: {formatBRL(w.targetAmount)}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${pct}%` }} /></div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                      <span className={moneyBlur}>Faltam {formatBRL(missing)} (~{monthsNeeded} meses)</span>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => handleIncrementWish(w, 50)} className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold transition">+ R$ 50</button>
                        <button type="button" onClick={() => handleIncrementWish(w, 100)} className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 font-bold transition">+ R$ 100</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 border-t border-white/[0.05]">
                      <input type="number" step="0.01" placeholder="Outro valor (R$)..." value={customVal} onChange={(e) => setCustomWishAmounts((prev) => ({ ...prev, [w.id]: e.target.value }))} className="flex-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 text-xs" />
                      <button type="button" onClick={() => { const val = parseFloat(customVal); if (val > 0) { handleIncrementWish(w, val); setCustomWishAmounts((prev) => ({ ...prev, [w.id]: "" })); } }} className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">Guardar</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSaveWish} className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-3.5 text-xs h-fit">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{editingWishId ? "Editar Caixinha Selecionada" : "Criar Nova Caixinha ou Objetivo"}</h3>
              {editingWishId && <button type="button" onClick={() => { setEditingWishId(null); setNewWish({ title: "", institution: cards[0] ? cards[0].name : "Nubank Ultravioleta", targetAmount: "", savedAmount: "0", priority: "Média" }); }} className="text-[11px] text-rose-400 hover:underline">Cancelar</button>}
            </div>
            <input type="text" required placeholder="Nome do Objetivo (Ex: Monitor, Viagem...)" value={newWish.title} onChange={(e) => setNewWish({ ...newWish, title: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
            <div>
              <label className="text-slate-400 block mb-1">Instituição / Banco Onde Está Guardado</label>
              <input type="text" required placeholder="Ex: Nubank Ultravioleta, Inter..." value={newWish.institution} onChange={(e) => setNewWish({ ...newWish, institution: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <input type="number" required placeholder="Valor Total (R$)" value={newWish.targetAmount} onChange={(e) => setNewWish({ ...newWish, targetAmount: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
              <input type="number" placeholder="Saldo Atual (R$)" value={newWish.savedAmount} onChange={(e) => setNewWish({ ...newWish, savedAmount: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
            </div>
            <select value={newWish.priority} onChange={(e) => setNewWish({ ...newWish, priority: e.target.value as WishlistItem["priority"] })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10">
              <option value="Alta">Prioridade Alta</option><option value="Média">Prioridade Média</option><option value="Baixa">Prioridade Baixa</option>
            </select>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition">{editingWishId ? "✓ Salvar Alterações" : "+ Criar Caixinha"}</button>
          </form>
        </div>
      </div>
    );
  }

  if (activeTab === "auto") {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-2xl border border-white/[0.07] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-white">Gestão do Meu Veículo</h2>
            <p className="text-xs text-slate-400 mt-0.5">Acompanhe a quilometragem atual, o consumo médio de combustível, os gastos com manutenção e quanto falta para as próximas revisões.</p>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <span>Cor da Linha do Odômetro:</span>
            <input type="color" value={chartTheme.odometerLine} onChange={(e) => updateChartThemeColor("odometerLine", e.target.value)} className="color-circle" />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-white/[0.07]"><span className="text-xs text-slate-400 block mb-1">Quilometragem Atual</span><p className="text-2xl font-extrabold text-white">{autoMetrics.maxKm.toLocaleString("pt-BR")} km</p><span className="text-[11px] text-slate-400">Distância registrada: {autoMetrics.distanceDriven} km</span></div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.07]"><span className="text-xs text-slate-400 block mb-1">Consumo Médio</span><p className="text-2xl font-extrabold text-emerald-400">{autoMetrics.avgKmPerLiter.toFixed(1)} km/L</p><span className="text-[11px] text-slate-400">Média por litro abastecido</span></div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.07]"><span className="text-xs text-slate-400 block mb-1">Gasto com Combustível</span><p className={`text-2xl font-extrabold text-amber-400 ${moneyBlur}`}>{formatBRL(autoMetrics.fuelTotal)}</p><span className="text-[11px] text-slate-400">Auxílio Combustível: R$ 741,00</span></div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.07]"><span className="text-xs text-slate-400 block mb-1">Manutenção e Troca de Óleo</span><p className={`text-2xl font-extrabold text-rose-400 ${moneyBlur}`}>{formatBRL(autoMetrics.maintenanceTotal)}</p><span className="text-[11px] text-slate-400">Cuidado preventivo do carro</span></div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.07]"><span className="text-xs text-slate-400 block mb-1">Custo Médio por KM</span><p className={`text-2xl font-extrabold text-indigo-400 ${moneyBlur}`}>{formatBRL(autoMetrics.costPerKm)}/km</p><span className={`text-[11px] text-slate-400 ${moneyBlur}`}>Total no carro: {formatBRL(autoMetrics.totalAutoSpent)}</span></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/[0.07]">
            <h3 className="text-sm font-bold mb-1">Evolução da Quilometragem</h3>
            <p className="text-xs text-slate-400 mb-4">Histórico do odômetro a cada abastecimento ou serviço realizado.</p>
            <div className="h-64 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={autoMetrics.kmRecords}>
                  <defs><linearGradient id="colorKm" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartTheme.odometerLine} stopOpacity={0.25} /><stop offset="95%" stopColor={chartTheme.odometerLine} stopOpacity={0.0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} /><YAxis stroke="#64748b" fontSize={11} domain={["auto", "auto"]} />
                  <Tooltip content={<CustomCyberTooltip isCurrency={false} />} cursor={{ stroke: chartTheme.odometerLine, strokeWidth: 1, strokeDasharray: "4 4", fill: "transparent" }} />
                  <Area type="monotone" dataKey="km" name="Quilometragem (KM)" stroke={chartTheme.odometerLine} strokeWidth={1.7} dot={{ r: 2.5, fill: chartTheme.odometerLine }} fill="url(#colorKm)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/[0.07]">
            <h3 className="text-sm font-bold mb-1">Histórico de Serviços e Abastecimentos</h3>
            <p className="text-xs text-slate-400 mb-4">Todos os lançamentos vinculados ao seu veículo.</p>
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {autoMetrics.autoTxs.map((item: Transaction) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-white/[0.06] flex items-center justify-between text-xs">
                  <div><span className="font-semibold block text-slate-100">{item.description}</span><span className="text-slate-400">{item.date} • {item.category}{item.liters ? ` • ${item.liters}L` : ""}</span></div>
                  <div className="text-right"><span className={`font-bold text-amber-400 block ${moneyBlur}`}>{formatBRL(item.amount)}</span>{item.km && <span className="font-mono text-[11px] text-slate-400">{item.km.toLocaleString("pt-BR")} km</span>}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "bio") {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/50 border border-orange-500/30 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-orange-400 flex items-center gap-1.5"><Flame className="w-4 h-4" /> Sincronização com o Strava</span>
            <h2 className="text-xl font-extrabold text-white">Minhas Corridas e Evolução Física</h2>
            <p className="text-xs text-slate-400">Acompanhe seus quilômetros corridos no ano, seu histórico total de treinos e a evolução do seu peso e percentual de gordura.</p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div><span className="text-xs text-slate-400 block">Corrido neste Ano</span><strong className="text-2xl font-extrabold text-orange-400">{stravaStats.ytdKm} km</strong><span className="block text-[11px] text-slate-400">{stravaStats.ytdRuns} corridas em 2026</span></div>
            <div className="border-l border-white/10 pl-6"><span className="text-xs text-slate-400 block">Bagagem Histórica Total</span><strong className="text-2xl font-extrabold text-emerald-400">{stravaStats.allTimeKm} km</strong><span className="block text-[11px] text-slate-400">{stravaStats.allTimeRuns} treinos acumulados</span></div>
            <button onClick={syncStravaFromApi} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition">
              <RefreshCw className={`w-4 h-4 ${isSyncingStrava ? "animate-spin" : ""}`} /> Atualizar pelo Strava
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold">Evolução de Peso (kg) e Taxa de Gordura (BF %)</h3>
                <p className="text-xs text-slate-400">Acompanhe o resultado da sua dieta e rotina de treinos ao longo do tempo.</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer"><span>Cor Peso:</span><input type="color" value={chartTheme.weightLine} onChange={(e) => updateChartThemeColor("weightLine", e.target.value)} className="color-circle" /></label>
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer"><span>Cor BF%:</span><input type="color" value={chartTheme.bfLine} onChange={(e) => updateChartThemeColor("bfLine", e.target.value)} className="color-circle" /></label>
              </div>
            </div>
            <div className="h-72 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bioLogs}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartTheme.weightLine} stopOpacity={0.25} /><stop offset="95%" stopColor={chartTheme.weightLine} stopOpacity={0.0} /></linearGradient>
                    <linearGradient id="colorBf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartTheme.bfLine} stopOpacity={0.25} /><stop offset="95%" stopColor={chartTheme.bfLine} stopOpacity={0.0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} /><YAxis stroke="#64748b" fontSize={11} domain={["auto", "auto"]} />
                  <Tooltip content={<CustomCyberTooltip isCurrency={false} />} cursor={{ stroke: chartTheme.weightLine, strokeWidth: 1, strokeDasharray: "4 4", fill: "transparent" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Area type="monotone" dataKey="weight" name="Peso Corporal (kg)" stroke={chartTheme.weightLine} strokeWidth={1.7} dot={{ r: 2.5, fill: chartTheme.weightLine }} fill="url(#colorWeight)" />
                  <Area type="monotone" dataKey="bf" name="Percentual de Gordura - BF (%)" stroke={chartTheme.bfLine} strokeWidth={1.7} dot={{ r: 2.5, fill: chartTheme.bfLine }} fill="url(#colorBf)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <form onSubmit={handleSaveBioLog} className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-3.5 text-xs h-fit">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{editingBioId ? "Editar Medição Selecionada" : "Registrar Nova Pesagem"}</h3>
              {editingBioId && <button type="button" onClick={() => { setEditingBioId(null); setNewBio({ date: new Date().toISOString().split("T")[0], weight: "", bf: "" }); }} className="text-[11px] text-rose-400 hover:underline">Cancelar</button>}
            </div>
            <input type="date" required value={newBio.date} onChange={(e) => setNewBio({ ...newBio, date: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
            <div className="grid grid-cols-2 gap-2.5">
              <input type="number" step="0.1" required placeholder="Peso (kg)" value={newBio.weight} onChange={(e) => setNewBio({ ...newBio, weight: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
              <input type="number" step="0.1" placeholder="BF % (Opcional)" value={newBio.bf} onChange={(e) => setNewBio({ ...newBio, bf: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition">{editingBioId ? "✓ Atualizar Medição" : "+ Salvar Medição"}</button>
          </form>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4">
          <div>
            <h3 className="text-sm font-bold">Histórico de Medições Corporais Registradas</h3>
            <p className="text-xs text-slate-400">Veja todos os registros salvos e clique no lápis caso queira corrigir o peso, adicionar o BF posteriormente ou excluir.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-slate-400">
                  <th className="py-3 px-3">Data</th><th className="py-3 px-3">Peso Corporal (kg)</th><th className="py-3 px-3">Taxa de BF (%)</th><th className="py-3 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {bioLogs.slice().reverse().map((b) => (
                  <tr key={b.id} className={`transition ${editingBioId === b.id ? "bg-indigo-500/15" : "hover:bg-white/[0.02]"}`}>
                    <td className="py-3 px-3 font-mono text-slate-400">{b.date}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{b.weight} kg</td>
                    <td className="py-3 px-3 font-bold text-indigo-400">{b.bf ? `${b.bf}%` : "—"}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button type="button" onClick={() => { setEditingBioId(b.id); setNewBio({ date: b.date, weight: String(b.weight), bf: b.bf ? String(b.bf) : "" }); }} className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/30 transition"><Pencil className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => handleDeleteBioLog(b.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
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

  if (activeTab === "brain") {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2"><Target className="w-5 h-5 text-indigo-400" /> Meus Grandes Objetivos do Ano</h2>
              <p className="text-xs text-slate-400">Acompanhe o progresso das suas metas de patrimônio, carreira, faculdade e saúde ao longo do ano.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {okrs.map((okr) => {
                const pct = Math.min(100, Math.round((okr.current / Math.max(1, okr.target)) * 100));
                return (
                  <div key={okr.id} className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.07] space-y-3">
                    <div className="flex justify-between items-start text-xs">
                      <div><strong className="text-slate-100 block">{okr.title}</strong><span className="text-[10px] text-slate-400">{okr.category}</span></div>
                      <button onClick={() => saveOkrs(okrs.filter((item) => item.id !== okr.id))} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-indigo-400 font-bold">{okr.current} / {okr.target} {okr.unit} ({pct}%)</span>
                      <input type="number" step="0.1" value={okr.current} onChange={(e) => saveOkrs(okrs.map((item) => (item.id === okr.id ? { ...item, current: Number(e.target.value) } : item)))} className="w-20 px-2 py-1 rounded-lg bg-slate-900 border border-white/10 text-right text-xs" />
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500" style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
          <form onSubmit={handleAddOkr} className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-3.5 text-xs h-fit">
            <h3 className="text-sm font-bold">Cadastrar Nova Meta Anual</h3>
            <input type="text" required placeholder="Nome da Meta (Ex: Reserva de 25 mil)" value={newOkr.title} onChange={(e) => setNewOkr({ ...newOkr, title: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
            <div className="grid grid-cols-3 gap-2">
              <input type="number" placeholder="Atual" value={newOkr.current} onChange={(e) => setNewOkr({ ...newOkr, current: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
              <input type="number" required placeholder="Meta" value={newOkr.target} onChange={(e) => setNewOkr({ ...newOkr, target: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
              <input type="text" placeholder="Unid (R$, %)" value={newOkr.unit} onChange={(e) => setNewOkr({ ...newOkr, unit: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition">+ Adicionar Meta</button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-white/[0.07]">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white">Mural de Anotações e Ideias Rápidas</h3>
                <p className="text-xs text-slate-400">Guarde lembretes de trabalho, estudos, links úteis e ideias do dia a dia.</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["ALL", "#Ideias", "#TrabalhoACS", "#Estudos", "#Pessoal", "#Links"].map((t) => (
                  <button key={t} type="button" onClick={() => setSelectedNoteTag(t)} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${selectedNoteTag === t ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400"}`}>{t === "ALL" ? "Todas" : t}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {notes.filter((n) => selectedNoteTag === "ALL" || n.tag === selectedNoteTag).map((n) => (
                <div key={n.id} className="glass-card p-5 rounded-2xl border border-white/[0.07] flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">{n.tag}</span>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => { setEditingNoteId(n.id); setNewNote({ title: n.title, content: n.content, tag: n.tag }); }} className="text-indigo-300 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => handleDeleteNote(n.id)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-white mb-1">{n.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{n.content}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{n.date}</span>
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={handleSaveNote} className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-3.5 text-xs h-fit">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{editingNoteId ? "Editar Anotação" : "Nova Anotação no Mural"}</h3>
              {editingNoteId && <button type="button" onClick={() => { setEditingNoteId(null); setNewNote({ title: "", content: "", tag: "#Ideias" }); }} className="text-[11px] text-rose-400 hover:underline">Cancelar</button>}
            </div>
            <input type="text" required placeholder="Título da nota ou ideia..." value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
            <select value={newNote.tag} onChange={(e) => setNewNote({ ...newNote, tag: e.target.value as BrainNote["tag"] })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10">
              <option value="#Ideias">#Ideias</option><option value="#TrabalhoACS">#TrabalhoACS</option><option value="#Estudos">#Estudos</option><option value="#Pessoal">#Pessoal</option><option value="#Links">#Links</option>
            </select>
            <textarea rows={4} required placeholder="Escreva sua anotação aqui..." value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10" />
            <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition">{editingNoteId ? "✓ Salvar Alterações" : "+ Fixar no Mural"}</button>
          </form>
        </div>
      </div>
    );
  }

  if (activeTab === "settings") {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center overflow-hidden">
                {currentUserAvatar ? <img src={currentUserAvatar} alt={currentUser ? currentUser : "Avatar"} className="w-full h-full object-cover" /> : <User className="w-7 h-7 text-indigo-300" />}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">Configurações Pessoais do Sistema</h2>
                <button type="button" onClick={() => setShowChangelogModal(true)} className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-mono font-bold transition">
                  Versão {APP_VERSION} (Ver Changelog)
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Personalize a aparência, métodos, categorias, cores circulares, sistemas integrados e auditoria de logs.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Aparência:</span>
              <ThemeSegmentedControl themeMode={themeMode} onChange={changeThemeMode} />
            </div>
            <button type="button" onClick={handleExportFullBackupJSON} className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition">
              <Download className="w-4 h-4" /> Baixar Backup (.JSON)
            </button>
            <label className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-indigo-300 cursor-pointer flex items-center gap-1.5 transition">
              <Upload className="w-4 h-4" /> Restaurar Backup
              <input type="file" accept=".json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFullBackupJSON(f); }} />
            </label>
            <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer flex items-center gap-2 transition">
              <Camera className="w-4 h-4" /> Foto de Perfil
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpdateProfileAvatar(f); }} />
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-base font-extrabold text-white">Sistemas Integrados</h3>
            <p className="text-xs text-slate-400">Preencha os campos tranquilamente — o sistema só tentará conectar quando você clicar no botão de sincronização.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* CARD GOOGLE SHEETS */}
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/25 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400"><Table2 className="w-5 h-5" /></div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Google Sheets Cloud DB</h4>
                      <p className="text-[11px] text-slate-400">Sincronização bidirecional somente sob comando (com diagnóstico de erro)</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sheetsSyncStatus?.state === "success" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : sheetsSyncStatus?.state === "error" ? "bg-rose-500/15 text-rose-300 border-rose-500/30" : "bg-slate-800 text-slate-400 border-white/10"}`}>
                    {sheetsSyncStatus?.state === "success" ? "Sincronizado" : sheetsSyncStatus?.state === "error" ? "Falha Detectada" : sheetApiUrl ? "URL Preenchida" : "Não Configurado"}
                  </span>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">URL do App da Web (Google Apps Script terminado em /exec)</label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={sheetApiUrl}
                    onChange={(e) => {
                      const c = e.target.value.trim();
                      setSheetApiUrl(c);
                      localStorage.setItem("lifeos_sheets_url", c);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10"
                  />
                </div>

                {sheetsSyncStatus && sheetsSyncStatus.state !== "idle" && (
                  <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                    sheetsSyncStatus.state === "error"
                      ? "bg-rose-950/60 border-rose-500/40 text-rose-200"
                      : "bg-emerald-950/50 border-emerald-500/30 text-emerald-200"
                  }`}>
                    <div className="flex items-start gap-2">
                      {sheetsSyncStatus.state === "error" ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong className="block font-bold">
                          {sheetsSyncStatus.state === "error" ? "Motivo da Falha na Integração:" : "Conexão Bem-Sucedida:"}
                        </strong>
                        <span>{sheetsSyncStatus.message}</span>
                        {sheetsSyncStatus.timestamp && (
                          <span className="block text-[10px] opacity-70 mt-1">Última tentativa: {sheetsSyncStatus.timestamp}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={syncFromGoogleSheets}
                  disabled={isSyncing}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                  Sincronizar e Baixar
                </button>
                {pushAllToGoogleSheets && (
                  <button
                    type="button"
                    onClick={pushAllToGoogleSheets}
                    disabled={isSyncing}
                    className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition"
                  >
                    <Save className="w-4 h-4" />
                    Enviar Lançamentos p/ Planilha
                  </button>
                )}
              </div>
            </div>

            {/* CARD STRAVA API */}
            <div className="glass-card p-6 rounded-2xl border border-orange-500/25 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-400"><Flame className="w-5 h-5" /></div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Strava Athlete API</h4>
                      <p className="text-[11px] text-slate-400">Importação de corridas sob comando (com diagnóstico de erro)</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stravaSyncStatus?.state === "success" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : stravaSyncStatus?.state === "error" ? "bg-rose-500/15 text-rose-300 border-rose-500/30" : stravaConfig.refreshToken ? "bg-orange-500/15 text-orange-300 border-orange-500/30" : "bg-slate-800 text-slate-400 border-white/10"}`}>
                    {stravaSyncStatus?.state === "success" ? "Sincronizado" : stravaSyncStatus?.state === "error" ? "Falha Detectada" : stravaConfig.refreshToken ? "Chaves Preenchidas" : "Pendente"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <input type="text" placeholder="Athlete ID (Apenas números)" value={stravaConfig.athleteId} onChange={(e) => { const n = { ...stravaConfig, athleteId: sanitizeText(e.target.value) }; setStravaConfig(n); localStorage.setItem("lifeos_strava_config", JSON.stringify(n)); }} className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10" />
                  <input type="text" placeholder="Client ID" value={stravaConfig.clientId} onChange={(e) => { const n = { ...stravaConfig, clientId: sanitizeText(e.target.value) }; setStravaConfig(n); localStorage.setItem("lifeos_strava_config", JSON.stringify(n)); }} className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10" />
                  <input type="password" placeholder="Client Secret" value={stravaConfig.clientSecret} onChange={(e) => { const n = { ...stravaConfig, clientSecret: e.target.value.trim() }; setStravaConfig(n); localStorage.setItem("lifeos_strava_config", JSON.stringify(n)); }} className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10" />
                  <input type="password" placeholder="Refresh Token" value={stravaConfig.refreshToken} onChange={(e) => { const n = { ...stravaConfig, refreshToken: e.target.value.trim() }; setStravaConfig(n); localStorage.setItem("lifeos_strava_config", JSON.stringify(n)); }} className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10" />
                </div>

                {stravaSyncStatus && stravaSyncStatus.state !== "idle" && (
                  <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                    stravaSyncStatus.state === "error"
                      ? "bg-rose-950/60 border-rose-500/40 text-rose-200"
                      : "bg-emerald-950/50 border-emerald-500/30 text-emerald-200"
                  }`}>
                    <div className="flex items-start gap-2">
                      {stravaSyncStatus.state === "error" ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong className="block font-bold">
                          {stravaSyncStatus.state === "error" ? "Motivo da Falha no Strava:" : "Strava Sincronizado:"}
                        </strong>
                        <span>{stravaSyncStatus.message}</span>
                        {stravaSyncStatus.timestamp && (
                          <span className="block text-[10px] opacity-70 mt-1">Última tentativa: {stravaSyncStatus.timestamp}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={syncStravaFromApi}
                disabled={isSyncingStrava}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncingStrava ? "animate-spin" : ""}`} />
                Testar e Sincronizar Strava
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white">Cadastrar Métodos de Pagamento</h3>
              <p className="text-[11px] text-slate-400">Adicione ou remova formas de pagamento disponíveis nos seus lançamentos.</p>
            </div>
            <form onSubmit={handleAddPaymentMethod} className="flex gap-2">
              <input type="text" required placeholder="Novo Método (Ex: Cartão ECX, Vale Refeição...)" value={newMethodName} onChange={(e) => setNewMethodName(e.target.value)} className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10" />
              <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">+ Cadastrar</button>
            </form>
            <div className="flex flex-wrap gap-2 pt-1">
              {paymentMethods.map((m) => (
                <span key={m} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-slate-200 font-semibold">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-400" /><span>{m}</span>
                  <button type="button" onClick={() => handleDeletePaymentMethod(m)} className="text-slate-500 hover:text-rose-400">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white">Cadastrar Categorias Personalizadas</h3>
              <p className="text-[11px] text-slate-400">Crie novas categorias de entradas, despesas, investimentos ou gastos do veículo.</p>
            </div>
            <form onSubmit={handleAddCustomCategory} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input type="text" required placeholder="Nome da Categoria..." value={newCategoryForm.name} onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })} className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10" />
                <select value={newCategoryForm.flow} onChange={(e) => setNewCategoryForm({ ...newCategoryForm, flow: e.target.value as FlowType })} className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10">
                  <option value="EXPENSE">Despesa / Saída</option><option value="INCOME">Receita / Entrada</option><option value="INVESTMENT">Aporte / Investimento</option>
                </select>
              </div>
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={newCategoryForm.isAuto} onChange={(e) => setNewCategoryForm({ ...newCategoryForm, isAuto: e.target.checked })} />
                  Pertence ao Meu Veículo (Solicitar KM/Litros)
                </label>
                <div className="flex items-center gap-2.5">
                  <input type="color" value={newCategoryForm.color} onChange={(e) => setNewCategoryForm({ ...newCategoryForm, color: e.target.value })} className="color-circle" />
                  <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">+ Criar Categoria</button>
                </div>
              </div>
            </form>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
              {categoriesCatalog.map((cat) => {
                const mappedCol = categoryColors[cat.name];
                const col = mappedCol ? mappedCol : "#6366f1";
                return (
                  <span key={cat.name} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: `${col}22`, color: col, border: `1px solid ${col}44` }}>
                    {renderCategorySemanticIcon(cat.name, col)}<span>{cat.name}</span>
                    {cat.name !== "A Receber" && (
                      <button type="button" onClick={() => handleDeleteCategory(cat.name)} className="hover:text-white ml-1">×</button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-bold text-white">Paleta de Cores dos Gráficos (Seletores Circulares)</h3>
            <p className="text-[11px] text-slate-400">Clique em qualquer círculo colorido abaixo para personalizar as linhas e barras dos seus gráficos.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {([
              { key: "patrimonyLine", label: "Linha de Patrimônio" }, { key: "aporteLine", label: "Linha de Aportes" },
              { key: "creditUsedBar", label: "Barra Crédito Usado" }, { key: "creditAvailableBar", label: "Barra Crédito Livre" },
              { key: "odometerLine", label: "Linha do Odômetro" }, { key: "weightLine", label: "Linha de Peso (kg)" },
              { key: "bfLine", label: "Linha de Gordura (BF%)" }
            ] as { key: keyof ChartThemeColors; label: string }[]).map((item) => (
              <label key={item.key} className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 flex flex-col items-center gap-2.5 cursor-pointer hover:border-indigo-500/40 transition text-center">
                <input type="color" value={chartTheme[item.key]} onChange={(e) => updateChartThemeColor(item.key, e.target.value)} className="color-circle" style={{ width: "32px", height: "32px" }} />
                <span className="text-[11px] text-slate-300 font-medium">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Meus Limites e Metas Anuais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Limite Gastos Pessoais (R$)</label>
                <input type="number" value={personalBudgetLimit} onChange={(e) => { const v = Number(e.target.value); setPersonalBudgetLimit(v); updateGoalsStorage(v, monthlyInvestmentGoal, patrimonyTarget, annualRunGoalKm); }} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Meta Aporte Mensal (R$)</label>
                <input type="number" value={monthlyInvestmentGoal} onChange={(e) => { const v = Number(e.target.value); setMonthlyInvestmentGoal(v); updateGoalsStorage(personalBudgetLimit, v, patrimonyTarget, annualRunGoalKm); }} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Alvo de Patrimônio (R$)</label>
                <input type="number" value={patrimonyTarget} onChange={(e) => { const v = Number(e.target.value); setPatrimonyTarget(v); updateGoalsStorage(personalBudgetLimit, monthlyInvestmentGoal, v, annualRunGoalKm); }} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Meta Corrida Strava (KM)</label>
                <input type="number" value={annualRunGoalKm} onChange={(e) => { const v = Number(e.target.value); setAnnualRunGoalKm(v); updateGoalsStorage(personalBudgetLimit, monthlyInvestmentGoal, patrimonyTarget, v); }} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-3 text-xs">
            <h3 className="text-sm font-bold text-white">Alertas de Revisão e Orçamento</h3>
            <form onSubmit={handleAddAlertRule} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input type="text" required placeholder="Título (Ex: Óleo 50k)" value={newAlert.title} onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })} className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10" />
              <input type="number" required placeholder="Alvo (KM ou R$)" value={newAlert.targetValue} onChange={(e) => setNewAlert({ ...newAlert, targetValue: e.target.value })} className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10" />
              <button type="submit" className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">+ Criar Alerta</button>
            </form>
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {alertRules.map((r) => (
                <div key={r.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.07] flex items-center justify-between">
                  <span><strong>{r.title}</strong> ({r.targetValue.toLocaleString("pt-BR")})</span>
                  <button onClick={() => saveAlertRules(alertRules.filter((item) => item.id !== r.id))} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-400" /> Registro de Logs e Auditoria de Ações</h3>
              <p className="text-[11px] text-slate-400">Histórico cronológico de acessos, lançamentos, parcelamentos, edições e alterações realizadas no sistema.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={logFilter} onChange={(e) => setLogFilter(e.target.value)} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs">
                <option value="ALL">Todos os Eventos ({systemLogs.length})</option>
                <option value="FINANCE">Finanças e Lançamentos</option>
                <option value="CONFIG">Configurações e Temas</option>
                <option value="AUTH">Acessos e Login</option>
                <option value="SECURITY">Segurança</option>
              </select>
              <button type="button" onClick={() => { setSystemLogs([]); localStorage.removeItem("lifeos_system_logs_v8"); }} className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-semibold transition">
                Limpar Logs
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-950 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Data e Hora</th><th className="py-2.5 px-3">Usuário</th><th className="py-2.5 px-3">Módulo</th><th className="py-2.5 px-3">Ação Registrada</th><th className="py-2.5 px-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {systemLogs.filter((l) => logFilter === "ALL" || l.category === logFilter).map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition">
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