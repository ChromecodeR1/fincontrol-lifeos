"use client";

import React from "react";
import {
  Banknote, CreditCard, PiggyBank, Utensils, Home, HeartPulse,
  Wifi, GraduationCap, Fuel, Wrench, Car, Briefcase, Coffee,
  ShoppingBag, Tag, HandCoins, Sun, Monitor, Moon
} from "lucide-react";

export type CostType = "Fixo" | "Variável";
export type PaymentMethod = string;
export type TxStatus = "Pago" | "Pendente / Na Fatura";
export type FlowType = "INCOME" | "EXPENSE" | "INVESTMENT";
export type CurveType = "monotone" | "natural" | "linear" | "step";
export type ThemeMode = "branco" | "tradicional" | "noturno";
export type ActiveTab = "dashboard" | "status" | "transactions" | "receivables" | "cards" | "auto" | "bio" | "brain" | "settings";
export type DashboardWidgetId = "thermometer" | "kpis" | "credit_chart" | "patrimony_chart" | "category_chart" | "benefits_strava";

export interface DashboardWidgetConfig { id: DashboardWidgetId; title: string; subtitle: string; span: 1 | 2; }

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  costType: CostType;
  paymentMethod: PaymentMethod;
  cardUsed?: string;
  status: TxStatus;
  km?: number;
  liters?: number;
  iconUrl?: string;
  wishlistId?: string;
  updatedAt?: string;
  installmentInfo?: string;
  installmentGroupId?: string;
  debtor?: string;
  paidAmount?: number;
}

export interface CreditCardItem { id: string; name: string; brand: string; limit: number; closingDay: number; dueDay: number; logoUrl?: string; }
export interface StaticStatusItem { id: string; title: string; type: "Renda Base" | "Benefício" | "Custo Fixo" | "Meta Aporte"; amount: number; notes: string; }
export interface WishlistItem { id: string; title: string; institution: string; targetAmount: number; savedAmount: number; priority: "Alta" | "Média" | "Baixa"; }
export interface BioLog { id: string; date: string; weight: number; bf?: number; }
export interface StravaStats { ytdKm: number; ytdRuns: number; allTimeKm: number; allTimeRuns: number; lastSync: string; }
export interface BrainNote { id: string; date: string; title: string; content: string; tag: "#TrabalhoACS" | "#Ideias" | "#Estudos" | "#Pessoal" | "#Links"; }
export interface PersonalOKR { id: string; title: string; category: string; current: number; target: number; unit: string; }
export interface CustomAlertRule { id: string; title: string; type: "ODOMETER_KM" | "FINANCIAL_CAP"; targetValue: number; warningLead: number; }
export interface ChartMilestone { id: string; label: string; value: number; color: string; }
export interface ChartThemeColors { patrimonyLine: string; aporteLine: string; creditUsedBar: string; creditAvailableBar: string; odometerLine: string; weightLine: string; bfLine: string; }
export interface CategoryCatalogItem { name: string; flow: FlowType; isAuto?: boolean; }
export interface StoredUserAccount { username: string; passwordHash: string; salt: string; avatarUrl?: string; createdAt: string; }
export interface ToastMessage { id: string; title: string; subtitle?: string; type: "success" | "warning" | "info"; }
export interface SystemLogEntry { id: string; timestamp: string; user: string; category: "AUTH" | "FINANCE" | "CONFIG" | "SECURITY"; action: string; details: string; }
export interface ChangelogEntry { version: string; date: string; title: string; highlights: string[]; }

export const APP_VERSION = "1.0";
export const PREVIOUS_VERSION = "0.9";

export const CHANGELOG_HISTORY: ChangelogEntry[] = [
  {
    version: "1.0",
    date: "Out/2026",
    title: "Full Release: Arquitetura Modular, Parcelamento 1x–24x, Valores a Receber 2.0 e Mobile Nav",
    highlights: [
      "Engenharia Modular e API Route Backend (/api/sync) para proteger URLs e chaves sensíveis no servidor.",
      "Compras Parceladas (1x a 24x) com geração automática nos meses seguintes e cálculo real de limite comprometido.",
      "Valores a Receber 2.0: suporte a abatimento parcial, digitação otimizada (onBlur), resumo para WhatsApp em 1 clique e sincronização do devedor na planilha.",
      "KPIs Inteligentes com variação percentual (Mês Atual vs. Mês Anterior) e Patrimônio Dinâmico calculado por mês.",
      "Barra de Navegação Inferior (Bottom Nav) exclusiva para uso rápido no celular."
    ]
  },
  {
    version: "0.9",
    date: "Out/2026",
    title: "Módulo Valores a Receber, Sincronização Bidirecional Sheets e Toggle Minimalista",
    highlights: [
      "Aba Valores a Receber com espelhamento automático da categoria 'A Receber' e quitação bidirecional.",
      "Correção de conflito com Google Sheets por ID e carimbo updatedAt.",
      "Seletor deslizante minimalista de 3 ícones (Sol / Monitor / Lua) e cards em Sistemas Integrados."
    ]
  },
  {
    version: "0.8",
    date: "Out/2026",
    title: "Temas Visuais, Auditoria de Logs, Seletores Circulares e Histórico Corporal",
    highlights: [
      "3 Modos de Aparência (Claro, Tradicional e Noturno) e seletores de cor circulares.",
      "Painel de Registro de Logs e tabela de Histórico de Medições Corporais editável."
    ]
  }
];

export function sanitizeText(raw: string): string {
  if (!raw) return "";
  return raw.replace(/<\/?[^>]+(>|$)/g, "").replace(/javascript:/gi, "").replace(/on\w+\s*=/gi, "").replace(/[<>]/g, "").trim();
}

export function sanitizeImageSource(src?: string): string | undefined {
  if (!src) return undefined;
  const t = src.trim();
  if (t.startsWith("data:image/")) return t;
  if (t.startsWith("https://")) return sanitizeText(t);
  return undefined;
}

export function normalizeStatus(st?: string): TxStatus {
  if (!st) return "Pago";
  return st.includes("Pendente") ? "Pendente / Na Fatura" : "Pago";
}

export function formatBRL(val: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val ? val : 0);
}

export function addMonthsToDate(dateStr: string, monthsToAdd: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const targetYear = y + Math.floor((m - 1 + monthsToAdd) / 12);
  const targetMonth = ((m - 1 + monthsToAdd) % 12) + 1;
  const maxDaysInMonth = new Date(targetYear, targetMonth, 0).getDate();
  const safeDay = Math.min(d ? d : 1, maxDaysInMonth);
  return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
}

export function getPreviousMonthPrefix(monthPrefix: string): string {
  if (!monthPrefix || monthPrefix === "ALL" || !monthPrefix.includes("-")) return "";
  const [y, m] = monthPrefix.split("-").map(Number);
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, "0")}`;
}

export function buildWhatsAppChargeText(person: string, items: Transaction[]): string {
  const openItems = items.filter((i) => i.status !== "Pago");
  let totalRemaining = 0;
  const lines = openItems.map((item) => {
    const paid = item.paidAmount ? item.paidAmount : 0;
    const rem = Math.max(0, item.amount - paid);
    totalRemaining += rem;
    const partialNote = paid > 0 ? ` (Total: ${formatBRL(item.amount)} - Já abatido: ${formatBRL(paid)})` : "";
    return `• ${item.date.split("-").reverse().join("/")}: *${item.description}* — *${formatBRL(rem)}*${partialNote}`;
  });

  return [
    `Olá, *${person}*! Tudo bem?`,
    `Segue o resumo atualizado dos lançamentos em aberto:`,
    ``,
    ...lines,
    ``,
    `*Saldo Total a Receber:* ${formatBRL(totalRemaining)}`
  ].join("\n");
}

export async function hashPasswordPBKDF(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}::${password}::LIFEOS_PEPPER_v4`);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function validatePasswordRules(pw: string) {
  return {
    minLength: pw.length >= 8,
    hasUpper: /[A-Z]/.test(pw),
    hasLower: /[a-z]/.test(pw),
    hasNumber: /[0-9]/.test(pw),
    hasSpecial: /[^A-Za-z0-9]/.test(pw)
  };
}

export function compressImageFileToBase64(file: File, callback: (base64: string) => void) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 110;
      let w = img.width, h = img.height;
      if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
      else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (ctx) { ctx.drawImage(img, 0, 0, w, h); callback(canvas.toDataURL("image/png", 0.88)); }
    };
    if (typeof event.target?.result === "string") img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

export const DEFAULT_CATEGORIES_CATALOG: CategoryCatalogItem[] = [
  { name: "Salário", flow: "INCOME" },
  { name: "Benefícios (VA/Combustível)", flow: "INCOME" },
  { name: "Comissão", flow: "INCOME" },
  { name: "Serviços", flow: "INCOME" },
  { name: "Rendimentos", flow: "INCOME" },
  { name: "Aporte / Investimento", flow: "INVESTMENT" },
  { name: "A Receber", flow: "EXPENSE" },
  { name: "Alimentação", flow: "EXPENSE" },
  { name: "Moradia", flow: "EXPENSE" },
  { name: "Gastos Pessoais / Besteiras", flow: "EXPENSE" },
  { name: "Saúde/Academia", flow: "EXPENSE" },
  { name: "Assinaturas/Internet", flow: "EXPENSE" },
  { name: "Lazer", flow: "EXPENSE" },
  { name: "Educação", flow: "EXPENSE" },
  { name: "Gasolina/Combustível", flow: "EXPENSE", isAuto: true },
  { name: "Manutenção", flow: "EXPENSE", isAuto: true },
  { name: "Troca de Óleo", flow: "EXPENSE", isAuto: true },
  { name: "IPVA/Licenciamento", flow: "EXPENSE", isAuto: true },
  { name: "Seguro", flow: "EXPENSE", isAuto: true },
  { name: "Estacionamento/Pedágio", flow: "EXPENSE", isAuto: true }
];

export const DEFAULT_PAYMENT_METHODS: string[] = ["PIX", "Cartão de Débito", "Cartão de Crédito", "Cartão ECX", "Dinheiro"];

export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  "Salário": "#10b981", "Benefícios (VA/Combustível)": "#34d399", "Comissão": "#059669",
  "Serviços": "#2dd4bf", "Rendimentos": "#14b8a6", "Aporte / Investimento": "#6366f1",
  "A Receber": "#f59e0b", "Alimentação": "#f43f5e", "Moradia": "#8b5cf6",
  "Gastos Pessoais / Besteiras": "#ec4899", "Saúde/Academia": "#06b6d4", "Assinaturas/Internet": "#3b82f6",
  "Lazer": "#a855f7", "Educação": "#0ea5e9", "Gasolina/Combustível": "#f59e0b", "Manutenção": "#ea580c",
  "Troca de Óleo": "#d97706", "IPVA/Licenciamento": "#e11d48", "Seguro": "#64748b", "Estacionamento/Pedágio": "#fbbf24"
};

export const DEFAULT_CHART_THEME: ChartThemeColors = {
  patrimonyLine: "#818cf8", aporteLine: "#34d399", creditUsedBar: "#f43f5e",
  creditAvailableBar: "#10b981", odometerLine: "#f59e0b", weightLine: "#10b981", bfLine: "#818cf8"
};

export const COLOR_PRESETS = ["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#3b82f6", "#14b8a6", "#eab308"];

export const DEFAULT_DASHBOARD_LAYOUT: DashboardWidgetConfig[] = [
  { id: "thermometer", title: "Termômetro de Gastos Pessoais", subtitle: "Acompanhe quanto do seu orçamento livre do mês ainda está disponível para compras pessoais.", span: 2 },
  { id: "kpis", title: "Resumo Financeiro do Mês", subtitle: "Visão consolidada do que entrou, do que saiu, do saldo livre em conta e do total investido (com comparativo mensal).", span: 2 },
  { id: "patrimony_chart", title: "Evolução do Meu Patrimônio", subtitle: "Crescimento dinâmico das suas reservas somando os aportes reais de cada mês.", span: 1 },
  { id: "credit_chart", title: "Limite Disponível vs. Limite Usado", subtitle: "Veja quanto do seu crédito total está comprometido nas faturas (incluindo parcelas) e quanto está livre.", span: 1 },
  { id: "category_chart", title: "Para Onde Vai o Meu Dinheiro", subtitle: "Identifique rapidamente quais categorias representam a maior fatia das suas despesas no período.", span: 1 },
  { id: "benefits_strava", title: "Saldo de Benefícios e Meta de Corrida", subtitle: "Compare o auxílio recebido com seus gastos de mercado e posto, além do seu progresso anual no Strava.", span: 1 }
];

export function renderCategorySemanticIcon(category: string, color: string) {
  const c = category.toLowerCase();
  const style = { color };
  if (c.includes("receber")) return <HandCoins className="w-3.5 h-3.5" style={style} />;
  if (c.includes("salário") || c.includes("comissão") || c.includes("rendimento")) return <Banknote className="w-3.5 h-3.5" style={style} />;
  if (c.includes("benefício") || c.includes("ecx") || c.includes("va")) return <CreditCard className="w-3.5 h-3.5" style={style} />;
  if (c.includes("aporte") || c.includes("investimento") || c.includes("reserva")) return <PiggyBank className="w-3.5 h-3.5" style={style} />;
  if (c.includes("alimentação") || c.includes("mercado") || c.includes("restaurante")) return <Utensils className="w-3.5 h-3.5" style={style} />;
  if (c.includes("moradia") || c.includes("aluguel") || c.includes("casa")) return <Home className="w-3.5 h-3.5" style={style} />;
  if (c.includes("saúde") || c.includes("academia") || c.includes("médico")) return <HeartPulse className="w-3.5 h-3.5" style={style} />;
  if (c.includes("internet") || c.includes("assinatura")) return <Wifi className="w-3.5 h-3.5" style={style} />;
  if (c.includes("educação") || c.includes("faculdade") || c.includes("curso")) return <GraduationCap className="w-3.5 h-3.5" style={style} />;
  if (c.includes("gasolina") || c.includes("combustível") || c.includes("posto")) return <Fuel className="w-3.5 h-3.5" style={style} />;
  if (c.includes("manutenção") || c.includes("óleo") || c.includes("revisão")) return <Wrench className="w-3.5 h-3.5" style={style} />;
  if (c.includes("ipva") || c.includes("seguro") || c.includes("estacionamento") || c.includes("veículo")) return <Car className="w-3.5 h-3.5" style={style} />;
  if (c.includes("serviço") || c.includes("trabalho")) return <Briefcase className="w-3.5 h-3.5" style={style} />;
  if (c.includes("lazer")) return <Coffee className="w-3.5 h-3.5" style={style} />;
  if (c.includes("pessoais") || c.includes("besteira") || c.includes("compra")) return <ShoppingBag className="w-3.5 h-3.5" style={style} />;
  return <Tag className="w-3.5 h-3.5" style={style} />;
}

export function getAutomaticStatus(method: PaymentMethod, category?: string): TxStatus {
  if (category === "A Receber") return "Pendente / Na Fatura";
  return method === "Cartão de Crédito" ? "Pendente / Na Fatura" : "Pago";
}

export const INITIAL_CARDS: CreditCardItem[] = [
  { id: "c1", name: "Nubank Ultravioleta", brand: "Mastercard Black", limit: 4500, closingDay: 25, dueDay: 2 },
  { id: "c2", name: "Inter Black", brand: "Mastercard Black", limit: 3000, closingDay: 10, dueDay: 17 }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "tx-0", date: "2026-09-05", description: "Salário Líquido ACS (Setembro)", amount: 2071.81, category: "Salário", costType: "Fixo", paymentMethod: "PIX", status: "Pago", updatedAt: "2026-09-05T08:00:00Z" },
  { id: "tx-0b", date: "2026-09-06", description: "Aporte Mensal Setembro", amount: 1450.00, category: "Aporte / Investimento", costType: "Fixo", paymentMethod: "PIX", status: "Pago", updatedAt: "2026-09-06T08:00:00Z" },
  { id: "tx-0c", date: "2026-09-12", description: "Despesas Gerais Setembro", amount: 1620.00, category: "Alimentação", costType: "Variável", paymentMethod: "Cartão ECX", status: "Pago", updatedAt: "2026-09-12T08:00:00Z" },
  { id: "tx-1", date: "2026-10-05", description: "Salário Líquido ACS Sistemas", amount: 2071.81, category: "Salário", costType: "Fixo", paymentMethod: "PIX", status: "Pago", updatedAt: "2026-10-05T08:00:00Z" },
  { id: "tx-2", date: "2026-10-05", description: "Auxílio Combustível + VA ACS", amount: 1365.00, category: "Benefícios (VA/Combustível)", costType: "Fixo", paymentMethod: "Cartão ECX", status: "Pago", updatedAt: "2026-10-05T08:00:00Z" },
  { id: "tx-3", date: "2026-10-06", description: "Aporte Mensal Tesouro Selic / CDB", amount: 1450.00, category: "Aporte / Investimento", costType: "Fixo", paymentMethod: "PIX", status: "Pago", updatedAt: "2026-10-06T08:00:00Z" },
  { id: "tx-4", date: "2026-10-07", description: "Mensalidade Academia", amount: 82.40, category: "Saúde/Academia", costType: "Fixo", paymentMethod: "Cartão de Crédito", cardUsed: "Nubank Ultravioleta", status: "Pendente / Na Fatura", updatedAt: "2026-10-07T08:00:00Z" },
  { id: "tx-5", date: "2026-10-08", description: "Internet Fibra Residencial", amount: 68.17, category: "Assinaturas/Internet", costType: "Fixo", paymentMethod: "PIX", status: "Pago", updatedAt: "2026-10-08T08:00:00Z" },
  { id: "tx-6", date: "2026-10-09", description: "Supermercado (Dieta da Semana)", amount: 618.00, category: "Alimentação", costType: "Variável", paymentMethod: "Cartão ECX", status: "Pago", updatedAt: "2026-10-09T08:00:00Z" },
  { id: "tx-7", date: "2026-10-10", description: "Abastecimento Gasolina Comum", amount: 260.00, category: "Gasolina/Combustível", costType: "Variável", paymentMethod: "Cartão ECX", status: "Pago", km: 48200, liters: 44.1, updatedAt: "2026-10-10T08:00:00Z" },
  { id: "tx-8", date: "2026-10-11", description: "Troca de Óleo Sintético + Filtro", amount: 310.00, category: "Troca de Óleo", costType: "Variável", paymentMethod: "Cartão de Crédito", cardUsed: "Inter Black", status: "Pendente / Na Fatura", km: 48520, updatedAt: "2026-10-11T08:00:00Z" },
  { id: "tx-9", date: "2026-10-12", description: "Camisa Minimalista + Corte de Cabelo", amount: 185.00, category: "Gastos Pessoais / Besteiras", costType: "Variável", paymentMethod: "Cartão de Crédito", cardUsed: "Nubank Ultravioleta", status: "Pendente / Na Fatura", updatedAt: "2026-10-12T08:00:00Z" },
  { id: "tx-10", date: "2026-10-15", description: "Abastecimento Rotina ACS", amount: 245.00, category: "Gasolina/Combustível", costType: "Variável", paymentMethod: "Cartão ECX", status: "Pago", km: 48890, liters: 41.5, updatedAt: "2026-10-15T08:00:00Z" },
  { id: "tx-11", date: "2026-10-16", description: "Compra Passada no Cartão (Fone Bluetooth)", amount: 220.00, category: "A Receber", costType: "Variável", paymentMethod: "Cartão de Crédito", cardUsed: "Nubank Ultravioleta", status: "Pendente / Na Fatura", debtor: "Lucas (Primo)", paidAmount: 70, updatedAt: "2026-10-16T08:00:00Z" },
  { id: "tx-12", date: "2026-10-17", description: "Empréstimo PIX Combustível", amount: 150.00, category: "A Receber", costType: "Variável", paymentMethod: "PIX", status: "Pago", debtor: "Matheus (ACS)", paidAmount: 150, updatedAt: "2026-10-17T08:00:00Z" }
];

export const INITIAL_DEBTOR_MAP: Record<string, string> = {
  "tx-11": "Lucas (Primo)",
  "tx-12": "Matheus (ACS)"
};

export const INITIAL_STATIC_STATUS: StaticStatusItem[] = [
  { id: "st-1", title: "Salário Líquido Base (ACS)", type: "Renda Base", amount: 2071.81, notes: "Crédito no 5º dia útil" },
  { id: "st-2", title: "Vale Alimentação (Cartão ECX)", type: "Benefício", amount: 624.00, notes: "Benefício alimentação" },
  { id: "st-3", title: "Auxílio Combustível", type: "Benefício", amount: 741.00, notes: "Deslocamento diário" },
  { id: "st-4", title: "Aporte Programado (70% Salário)", type: "Meta Aporte", amount: 1450.00, notes: "Prioridade nº 1 do mês" },
  { id: "st-5", title: "Mensalidade Academia", type: "Custo Fixo", amount: 82.40, notes: "Recorrente no cartão" },
  { id: "st-6", title: "Plano Internet Fibra", type: "Custo Fixo", amount: 68.17, notes: "Pagamento mensal" }
];

export const INITIAL_MILESTONES: ChartMilestone[] = [
  { id: "ms-1", label: "Teto Caixinha Turbo Nubank (5k)", value: 5000, color: "#a855f7" },
  { id: "ms-2", label: "1º Marco Reserva de Segurança (10k)", value: 10000, color: "#10b981" }
];

export const INITIAL_WISHLIST: WishlistItem[] = [
  { id: "w-1", title: "Caixinha Turbo / Monitor Ultrawide", institution: "Nubank Ultravioleta", targetAmount: 1250, savedAmount: 450, priority: "Alta" },
  { id: "w-2", title: "Tênis de Corrida (Rodagem Strava)", institution: "Nubank Ultravioleta", targetAmount: 680, savedAmount: 300, priority: "Média" },
  { id: "w-3", title: "Kit Vestuário Minimalista", institution: "Inter Black", targetAmount: 400, savedAmount: 150, priority: "Baixa" }
];

export const INITIAL_BIO_LOGS: BioLog[] = [
  { id: "b-1", date: "2026-08-01", weight: 89.2, bf: 21.5 },
  { id: "b-2", date: "2026-08-15", weight: 88.4, bf: 20.8 },
  { id: "b-3", date: "2026-09-01", weight: 87.5, bf: 19.9 },
  { id: "b-4", date: "2026-09-15", weight: 86.8, bf: 19.2 },
  { id: "b-5", date: "2026-10-01", weight: 86.1, bf: 18.5 },
  { id: "b-6", date: "2026-10-15", weight: 85.4, bf: 17.9 }
];

export const INITIAL_NOTES: BrainNote[] = [
  { id: "n-1", date: "2026-10-14", title: "Automação de Relatórios SQL", content: "Criar view parametrizada para cruzar chamados recorrentes e reduzir retrabalho na ACS.", tag: "#TrabalhoACS" },
  { id: "n-2", date: "2026-10-15", title: "Ideia para o Aplicativo Mobile", content: "Criar atalho rápido para registrar abastecimento direto no posto pelo celular.", tag: "#Ideias" },
  { id: "n-3", date: "2026-10-16", title: "Revisão de DAX e Power BI", content: "Praticar funções CALCULATE, DATESYTD e inteligência de dados temporais neste fim de semana.", tag: "#Estudos" }
];

export const INITIAL_OKRS: PersonalOKR[] = [
  { id: "okr-1", title: "Construir Reserva Patrimonial", category: "Finanças", current: 11360, target: 25000, unit: "R$" },
  { id: "okr-2", title: "Conclusão de Ciência da Computação", category: "Carreira", current: 90, target: 100, unit: "%" },
  { id: "okr-3", title: "Volume Anual de Corrida (Strava)", category: "Saúde & Run", current: 342, target: 600, unit: "km" },
  { id: "okr-4", title: "Meta de Peso Corporal", category: "Bio", current: 85.4, target: 80.0, unit: "kg" }
];

export const INITIAL_ALERT_RULES: CustomAlertRule[] = [
  { id: "al-1", title: "Próxima Troca de Óleo Sintético", type: "ODOMETER_KM", targetValue: 49200, warningLead: 500 },
  { id: "al-2", title: "Revisão Preventiva de Freios e Alinhamento", type: "ODOMETER_KM", targetValue: 50000, warningLead: 800 }
];

export const HISTORICAL_INVESTMENTS = [
  { month: "2026-05", label: "Mai/26", aportado: 1100, acumulado: 4200 },
  { month: "2026-06", label: "Jun/26", aportado: 1250, acumulado: 5450 },
  { month: "2026-07", label: "Jul/26", aportado: 1300, acumulado: 6750 },
  { month: "2026-08", label: "Ago/26", aportado: 1450, acumulado: 8200 }
];

export function CustomCyberTooltip({ active, payload, label, isCurrency = true }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-2xl bg-[#090d1c]/95 border border-indigo-500/30 px-3.5 py-2.5 shadow-2xl backdrop-blur-xl text-xs space-y-1">
      {label && <p className="font-bold text-slate-200 border-b border-white/10 pb-1 mb-1">{label}</p>}
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color ? entry.color : entry.fill ? entry.fill : "#6366f1" }} />
            {entry.name}:
          </span>
          <strong className="text-white font-mono">
            {isCurrency ? formatBRL(Number(entry.value)) : entry.value}
          </strong>
        </div>
      ))}
    </div>
  );
}

export function ThemeSegmentedControl({ themeMode, onChange }: { themeMode: ThemeMode; onChange: (m: ThemeMode) => void }) {
  const options: { id: ThemeMode; icon: React.ReactNode; title: string }[] = [
    { id: "branco", icon: <Sun className="w-3.5 h-3.5" />, title: "Modo Claro" },
    { id: "tradicional", icon: <Monitor className="w-3.5 h-3.5" />, title: "Modo Tradicional" },
    { id: "noturno", icon: <Moon className="w-3.5 h-3.5" />, title: "Modo Noturno" }
  ];
  return (
    <div className="inline-flex items-center p-1 rounded-full bg-slate-900/90 border border-white/10 shadow-inner">
      {options.map((opt) => {
        const active = themeMode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            title={opt.title}
            onClick={() => onChange(opt.id)}
            className={`p-2 rounded-full transition-all duration-200 ${
              active
                ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md scale-105"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {opt.icon}
          </button>
        );
      })}
    </div>
  );
}