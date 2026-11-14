"use client";

import React from "react";
import {
  todayBR,
  todayISO,
  parseDateParts,
  formatDateBR,
  toSortableISO,
  addMonthsSafe,
  addMonthsToDateBR,
  addMonthsToDateISO,
  getYearMonthKey,
  getYearMonthInfo,
  compareDatesBR,
  formatMonthShortLabelBR,
  daysInMonth
} from "./lib/domain/date-br";
import {
  toCents,
  fromCents,
  safeAdd,
  safeSub,
  formatBRL,
  distributeInstallments,
  generateInstallmentSeriesId,
  calculateInvoiceAndCashMonths,
  getCardInvoiceCompetence,
  isNeutralFlow,
  isPositiveInflowDisplay,
  getEffectivePersonalAmount,
  getEffectiveCardLiabilityAmount
} from "./lib/domain/finance";
import {
  InvestmentYieldConfig,
  calculatePortfolioCdiYield
} from "./lib/domain/investment-yield";
import {
  Banknote,
  CreditCard,
  PiggyBank,
  Utensils,
  Home,
  HeartPulse,
  Wifi,
  GraduationCap,
  Fuel,
  Wrench,
  Car,
  Briefcase,
  Coffee,
  ShoppingBag,
  Tag,
  HandCoins,
  Sun,
  Monitor,
  Moon,
  TrendingDown,
  ArrowLeftRight,
  Activity,
  FileText,
  Layers,
  Bike,
  FileCheck,
  Pill,
  Landmark
} from "lucide-react";

export type CostType = "Fixo" | "Variável";
export type PaymentMethod = string;
export type TxStatus = "Pago" | "Pendente" | "Na Fatura" | "Pendente / Na Fatura";
export type FlowType = "INCOME" | "EXPENSE" | "INVESTMENT" | "NEUTRAL" | "RECEIVABLE";
export type CurveType = "monotone" | "natural" | "linear" | "step";
export type ThemeMode = "branco" | "tradicional" | "noturno";
export type InvestmentBucket = "CDI" | "LCI" | "BTC" | "STOCKS" | "PAPER_CASH";

export type ActiveTab =
  | "dashboard"
  | "status"
  | "transactions"
  | "receivables"
  | "cards"
  | "investments"
  | "auto"
  | "bio"
  | "brain"
  | "spotify"
  | "settings"
  | "about";
export type DashboardWidgetId =
  | "thermometer"
  | "thermometer_card"
  | "patrimony"
  | "wallet_limits"
  | "expenses"
  | "cashflow_recents"
  | "pendencies"
  | "benefits_strava"
  | "kpis"
  | "credit_chart"
  | "bank_limits_chart"
  | "patrimony_chart"
  | "category_chart"
  | "pending_radar"
  | "wallet_card"
  | "cashflow_recent"
  | "auto_odometer"
  | "auto_consumption"
  | "auto_fuel_monthly"
  | "auto_price_per_liter";

export const ALL_DASHBOARD_WIDGET_IDS = [
  "thermometer",
  "patrimony",
  "wallet_limits",
  "expenses",
  "cashflow_recents",
  "pendencies"
] as const;

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  title: string;
  subtitle: string;
  visible: boolean;
  size?: "half" | "full" | "third" | "two-thirds";
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  costType: CostType;
  paymentMethod: PaymentMethod;
  cardUsed?: string;
  cardName?: string;
  cardId?: string;
  bankAccount?: string;
  bankId?: string;
  status: TxStatus;
  km?: number;
  liters?: number;
  fuelType?: "Gasolina" | "Etanol";
  fullTank?: boolean;
  iconUrl?: string;
  wishlistId?: string;
  updatedAt?: string;
  dbRowId?: string;
  installmentInfo?: string;
  installmentGroupId?: string;
  installmentSeriesId?: string;
  invoiceMonth?: string;
  invoiceCompetence?: string;
  cashMonth?: string;
  flowType?: FlowType;
  isInvoicePayment?: boolean;
  isReceivableSettlement?: boolean;
  debtor?: string;
  paidAmount?: number;
  isTransfer?: boolean;
  sourceBank?: string;
  destinationBank?: string;
  isSplit?: boolean;
  thirdPartyAmount?: number;
  thirdPartyName?: string;
  personalAmount?: number;
  linkedReceivableId?: string;
  isSplitChild?: boolean;
  linkedSplitParentId?: string;
  notes?: string;
  indexer?: string;
  cdiPercentage?: number;
  externalId?: string;
  deletedAt?: string;
  rev?: number;
  investmentBucket?: InvestmentBucket;
  assetTicker?: string;
  entryQuotePrice?: number;
  manualYieldPct?: number;
}

export type BankAccountType = "Conta Corrente" | "Conta Digital" | "Investimentos" | "Benefícios";

export interface BankInstitution {
  id: string;
  name: string;
  accountType?: "Conta Corrente" | "Conta Digital" | "Investimentos" | "Benefícios";
  color?: string;
  logoUrl?: string;
  limit?: number;
  limitType?: string;
  updatedAt?: string;
  deletedAt?: string;
  rev?: number;
}

export interface BankItem {
  id: string;
  name: string;
  logoUrl?: string;
  limit?: number;
  limitType?: string;
  accountType?: "Conta Corrente" | "Conta Digital" | "Investimentos" | "Benefícios";
  color?: string;
  updatedAt?: string;
  deletedAt?: string;
  rev?: number;
}

export interface AutoInmetroConfig {
  gasolineKmPerLiter: number;
  ethanolKmPerLiter: number;
  greenThresholdPct: number;
  yellowThresholdPct: number;
  referenceNote: string;
}

export const DEFAULT_AUTO_INMETRO_CONFIG: AutoInmetroConfig = {
  gasolineKmPerLiter: 12.0,
  ethanolKmPerLiter: 8.5,
  greenThresholdPct: 85,
  yellowThresholdPct: 70,
  referenceNote: "INMETRO PBEV Fiesta Sedan 2008 1.0 Flex (Ciclo Misto)"
};

export interface CreditCardItem {
  id: string;
  name: string;
  brand: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  logoUrl?: string;
  bankId?: string;
  bankName?: string;
  color?: string;
  updatedAt?: string;
  deletedAt?: string;
  rev?: number;
}

export type CreditCard = CreditCardItem;

export interface StaticStatusItem {
  id: string;
  title: string;
  type: "Renda Base" | "Benefício" | "Custo Fixo" | "Meta Aporte";
  amount: number;
  notes: string;
  updatedAt?: string;
  deletedAt?: string;
  rev?: number;
}

export interface WishlistItem {
  id: string;
  title: string;
  institution: string;
  targetAmount: number;
  savedAmount: number;
  priority: "Alta" | "Média" | "Baixa" | "Essencial" | "Planejado" | "Desejo";
  completed?: boolean;
  itemType?: "note" | "wish";
  price?: number;
  description?: string;
  storeUrl?: string;
  completedAt?: string;
}

export interface BioLog {
  id: string;
  date: string;
  weight: number;
  bf?: number;
}

export interface StravaStats {
  ytdKm: number;
  ytdRuns: number;
  allTimeKm: number;
  allTimeRuns: number;
  lastSync: string;
}

export interface StravaActivity {
  id: string;
  name: string;
  type: string;
  date: string;
  isoDate?: string;
  startTime?: string;
  distanceKm: number;
  movingTimeSec?: number;
  elapsedTimeSec?: number;
  durationMin?: number;
  movingTimeMin: number;
  paceSecondsPerKm?: number;
  pace: string;
  avgSpeedKmh?: number;
  elevationGain: number;
  averageHeartrate?: number;
  maxHeartrate?: number;
  calories: number;
  splitsMetric?: any[];
  isSyntheticSummary?: boolean;
}

export type BrainNotePriority = "Essencial" | "Planejado" | "Desejo";
export type BrainNoteItemType = "note" | "wish";

export interface BrainNote {
  id: string;
  date: string;
  title: string;
  content: string;
  tag: "#TrabalhoACS" | "#Ideias" | "#Estudos" | "#Pessoal" | "#Links";
  completed?: boolean;
  itemType?: "note" | "wish";
  price?: number;
  description?: string;
  priority?: "Essencial" | "Planejado" | "Desejo";
  storeUrl?: string;
  targetMonth?: string;
  completedAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  rev?: number;
}

export interface PersonalOKR {
  id: string;
  title: string;
  category: string;
  current: number;
  target: number;
  unit: string;
}

export interface CustomAlertRule {
  id: string;
  title: string;
  type: "ODOMETER_KM" | "FINANCIAL_CAP";
  targetValue: number;
  warningLead: number;
}

export interface ChartMilestone {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface ChartThemeColors {
  patrimonyLine: string;
  aporteLine: string;
  creditUsedBar: string;
  creditAvailableBar: string;
  odometerLine: string;
  weightLine: string;
  bfLine: string;
}

export interface CategoryCatalogItem {
  name: string;
  flow: FlowType;
  isAuto?: boolean;
}

export interface StoredUserAccount {
  username: string;
  passwordHash: string;
  salt: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  subtitle?: string;
  type: "success" | "warning" | "info" | "error";
  onUndo?: () => void;
  undoLabel?: string;
}

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  user: string;
  category: "AUTH" | "FINANCE" | "CONFIG" | "SECURITY";
  action: string;
  details: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  highlights: string[];
}

export const APP_VERSION = "0.51.2";
export const PREVIOUS_VERSION = "0.51.1";
export const COINDEX_APP_VERSION = "0.51.2";
export const COINDEX_BUILD_DATE = "Novembro de 2026";
export const COINDEX_RELEASE_CODENAME = "Equilibrium Wealth & Life OS";

export const CHANGELOG_HISTORY: ChangelogEntry[] = [
  {
    version: "0.51.2",
    date: "Nov/2026",
    title: "Sprint 72: Feixe de Luz Real na Linha do Gráfico, Cores Autênticas por Banco nos Cartões, Eliminação do Espaço Vazio na Central Analítica e Higienização de Limites",
    highlights: [
      "Feixe de Luz Real na Curva do Gráfico: Substituição completa do retângulo de luz por feixe de fótons que percorre estritamente a linha SVG (.coindex-photon-trace-path com stroke-dasharray), deslizando suavemente pelas cristas do gráfico de Patrimônio sem artefatos no fundo.",
      "Eliminação do Espaço Vazio na Central Analítica (page.tsx): Reorganização da linha flex no card de Patrimônio alinhando valor principal à esquerda e seletor [Bruto | Líquido IR | Só Aportes] à direita, com expansão vertical dinâmica do container do gráfico (min-h-[235px]).",
      "Cores Autênticas e Distintas por Banco (getCardBrandGradient): Identificação precisa das marcas dos cartões (Nubank Roxo Ultravioleta, Inter Laranja Carbono Metálico, Itaú Platinum Azul Meia-Noite c/ Titânio, BTG Azul Imperial, C6/XP Grafite Titânio), eliminando cartões roxos genéricos.",
      "Limpeza e Nitidez da Lista de Limites: Remoção da bandeira secundária redundante, exibição do ponto com a cor autêntica do banco, nome completo do cartão sem truncamento (Nubank, Inter, Itaú Platinum) e valores em linha única sem quebras.",
      "Higienização de Título de Widgets (Apple Wallet Purge): Remoção automática de menções a 'Apple Wallet' e marcas de terceiros em layouts atuais e migrações legadas no normalizeDashboardLayout.",
      "Alocação Real 50/30/20 & Saneamento de Abastecimento: Denominador consistente Math.max(income, totalDespesas + aportes, 1) com barras proporcionais limitadas a 100%, e blindagem para salvar correções de abastecimentos de 13-11-2026 sem restauração indevida."
    ]
  },
  {
    version: "0.51.1",
    date: "Nov/2026",
    title: "Sprint 71: Extermínio do Bug de Recálculo na Gasolina, Desacoplamento de Caches Paralelos e Desbloqueio de Alto Contraste do Lençol de Seda 3D",
    highlights: [
      "Extermínio do Retorno de Valores Antigos na Gasolina: Desacoplamento absoluto entre valor (amount) e litros no modal de lançamentos, remoção definitiva do cache paralelo obsoleto lifeos_fuel_logs_v1 e de refuels no Cloud Vault, garantindo que o pool de transações seja a única fonte de verdade.",
      "Deduplicação Semântica de Combustível no Supabase: Rastreamento nativo de dbRowId com desempate por updatedAt mais recente e maior revisão (rev desc), eliminando registros clonados que persistiam simultaneamente no banco.",
      "Desbloqueio de Camada Opaca no Background (page.tsx): Remoção da classe bg-[var(--cupertino-bg)] do elemento <main> e aplicação de transparência pura em .dashboard-main-content e .dashboard-root-wrapper, permitindo a visualização desobstruída do motor visual no fundo da tela.",
      "Lençol de Seda 3D Envelope Cross-Over: Nova geometria com 2 lençóis de 64 filamentos e 80 subdivisões com curvas paramétricas cruzadas gerando dobras tridimensionais, modo screen e bainhas especulares com shadowBlur e traço de 1.65px.",
      "Camada Base Sólida do Tema: Integração da cor de fundo #0B0E14 / #F2F4F8 diretamente na base do AmbientBackgroundFX, mantendo cards cyber-glassmorphism translúcidos e nítidos a 144Hz."
    ]
  },
  {
    version: "0.51.0",
    date: "Nov/2026",
    title: "Sprint 70: Suite de Física Óptica Coindex (Ondulação Acústica no Lençol de Seda 3D, Feixe de Fótons nos Gráficos, Borda de Safira Prismática nos Cards e Micro-Cáustica nos KPIs & Modais)",
    highlights: [
      "Ondulação Acústica no Lençol 3D (AmbientBackgroundFX): Captura global de ondas de choque em ripplesRef via pointerdown e na troca de abas, propagando deflexão harmônica amortecida radialmente nos 52 filamentos de seda com blindagem contra raio negativo e anel luminoso sutil no epicentro.",
      "Trilha de Fótons & Cortina Laser nos Gráficos (Recharts): Nova classe .coindex-chart-photon-overlay com feixe especular horizontal suave percorrendo os gráficos de Patrimônio, Strava Progress e Odômetro a cada 6.5s, acompanhado de bioluminescência fotônica nas curvas e mira laser nos tooltips.",
      "Borda de Safira Prismática (.coindex-sapphire-rim): Shading de proximidade angular em 144Hz que ilumina apenas o filete de 1px da borda do card mais próximo ao cursor com refração branco-perolada e ciano, preservando 100% intactos e nítidos os cartões de crédito e o card wallet_limits.",
      "Micro-Cáustica Interna nos 4 Slim KPIs (page.tsx): Efeito volumétrico de refração interna acompanhando o cursor do mouse em tempo real em cada um dos 4 cards de topo (verde nas Entradas, coral nas Saídas, azul nos Aportes e ciano no Saldo Livre) com nitidez absoluta dos números tabular-nums.",
      "Varredura Laser nos Modais (.coindex-modal-laser-sweep): Filete de luz laser suave de 1.5px no topo dos modais de Transação, Auditoria KPI e Perfil, preservando a integridade de portais e acessibilidade de movimento."
    ]
  },
  {
    version: "0.50.1",
    date: "Nov/2026",
    title: "Sprint 69: Motor Visual 'Coindex Caustic Silk Sheet 3D' (Lençol de Seda Paramétrico Tridimensional com 52 Filamentos, Dobras Cáusticas em Modo Screen e Bainhas Especulares a 144Hz)",
    highlights: [
      "Motor Caustic Silk Sheet 3D (AmbientBackgroundFX): Transição das antigas fitas 2D para um lençol de seda paramétrico tridimensional com física cáustica real, modelando a deformação de tecidos com curvatura Camber em arco côncavo/convexo e harmônicos senoidais duplos.",
      "Duplo Lençol Sobreposto (52 + 28 Filamentos): Composição volumétrica refinada entre o Lençol 1 Hero (52 filamentos contínuos no terço central) e o Lençol 2 Deep Sub-Veil (28 filamentos com contra-camber e defasagem angular no terço inferior), conferindo profundidade espacial de tecido duplo translúcido.",
      "Interpolação Spline 144Hz via quadraticCurveTo: 40 segmentos discretos conectados por curvas quadráticas suaves com pontos médios, eliminando qualquer aresta ou rigidez geométrica.",
      "Acúmulo Cáustico Óptico em Modo 'screen': No tema escuro, a sobreposição dos filamentos convergentes gera concentrações naturais de luz cáustica sem artifícios de ruído ou rasterização.",
      "Bainhas de Cetim Especulares (isRimEdge): Filamentos externos nas bordas superior e inferior renderizados com traço destacado (1.2px) e ganho de opacidade de até 2.4x, criando silhueta nítida e elegante.",
      "Gradiente Horizontal Perolado: Transição fluida horizontal pelas cores da paleta camaleão contextual da aba com realce de crista perolado especular em branco-prata translúcido.",
      "Interação Fluida com o Mouse (< 320px): Deformação elástica suave que eleva e expande os filamentos ao redor do cursor simulando vento e brisa com zero alocação de objetos em runtime."
    ]
  },
  {
    version: "0.50.0",
    date: "Nov/2026",
    title: "Sprint 68: Extinção do Posto Express com Bloco Automático para Gasolina, Zero Recálculo de Valores, Correção Definitiva de Edição no Supabase, Cálculo Fiel de 838 km e Micro-Motions Fluidos",
    highlights: [
      "Extinção do 'Posto Express ⛽' e Formulário Unificado: Remoção da aba bifurcada no TransactionModal; seleção da categoria 'Gasolina' expande automaticamente bloco elegante com Odômetro, Litros, Tanque Cheio [Sim | Parcial] e badge passivo de preço/litro somente leitura.",
      "Trava Estrita contra Recálculo Cruzado: O campo de Valor Total (R$) e Litros Abastecidos são 100% independentes — digitar litros nunca mais altera o valor total nem o preço da bomba.",
      "Correção Definitiva do Salvamento no Supabase ao Editar: Incremento garantido de 'rev = rev + 1', timestamp 'updatedAt' atualizado e ordenação determinística em deduplicateCloudTransactions por updatedAt desc e rev desc, eliminando retorno de valores antigos após F5.",
      "Cálculo Matemático Fiel de Quilometragem (838 km): Odômetro atual e distância percorrida passam a considerar todos os lançamentos veiculares (203.960 km - 203.122 km = 838 km reais) e ignoram testes de valor irrelevante.",
      "Reforma Limpa da Aba Meus Veículos: Remoção de duplicidades, exclusão da Calculadora Flex e menções a Etanol, botão único 'Registrar Abastecimento' integrado ao modal oficial, correção do botão 'Novo Item Preventivo' sem duplo '+' e organização em 4 linhas harmoniosas.",
      "Micro-Partículas Estelares Discretas (420 partículas): Densidade ampliada para 420 micro-pontos de luz com raio de 0.4px a 0.65px (média 0.5px) e opacidade sutil (0.05 a 0.20), sem textura granulada.",
      "Micro-Motions Fluidos (144Hz): Novas classes CSS .gauge-progress-bar com transição elástica de 700ms, efeito .liquid-progress-shimmer e feedback tátil .tactile-hover."
    ]
  },
  {
    version: "0.49.3",
    date: "Nov/2026",
    title: "Sprint 67: Alinhamento de Paridade Nuvem 1:1, Recorte Circular de Foto de Perfil com Zoom e Arraste, Identidade 100% Coindex, Compactação de Controles e Background Sem Textura Noise",
    highlights: [
      "Alinhamento de Paridade Nuvem 1:1 ('Sincronizado com a Nuvem: SIM'): Função syncAndCleanOrphanTransactionsInCloud que expurga transações fantasmas e tombstones remanescentes do Supabase, alinhando a contagem de lançamentos (104 = 104) e atestando integridade total.",
      "Modal de Prévia e Recorte Circular da Foto de Perfil (AvatarCropModal): Visor circular de 240px com arraste livre, trava inteligente de bordas, zoom de 1.0x a 3.0x via controle deslizante, botões e roda do mouse, exportando JPEG nítido e leve de 256x256.",
      "Identidade 100% Coindex: Remoção total de assinaturas de nomes pessoais e menções a marcas de terceiros ('Apple Copilot Pure', 'Apple Wallet', etc.) na interface do usuário, com novo título do card de nuvem 'Verificação de Computação em Nuvem (Coindex Cloud)'.",
      "Compactação dos Controles de Tema e Animações: Unificação dos cards de Tema da Interface e Reduzir Animações em duas janelinhas elegantes lado a lado (grid de 2 colunas), removendo o bloco inferior redundante de 144Hz.",
      "Ajuste Fino do Motor de Background: Remoção completa da camada de textura/ruído SVG anti-banding e aumento para 240 micro-partículas estelares bem pequenas (raio entre 0.4px e 1.1px, opacidade 0.06 a 0.22) sem orbs gigantes ou cruzes pesadas, preservando as Ondas de Seda e a Aurora Camaleão.",
      "Remoção de Backup do Modal de Perfil: Centralização definitiva da segurança de dados e backups exclusivamente na aba Configurações e no Protocolo Caixa-Preta."
    ]
  },
  {
    version: "0.49.2",
    date: "Nov/2026",
    title: "Sprint 66: Protocolo Caixa-Preta (Backup Físico Obrigatório Pré-Sprint, Snapshots Imutáveis no Navegador, Trava Anti-Exclusão e Persistência ISO YYYY-MM-DD)",
    highlights: [
      "Protocolo Caixa-Preta e Backup Físico Pré-Sprint: Implementação da regra pétrea com o script scripts/pre-sprint-backup.mjs ('npm run backup:db') que baixa 100% dos dados brutos do Supabase e salva em ./backups_seguranca/ com timestamp antes de qualquer alteração.",
      "Snapshots Imutáveis Locais no Navegador: Função saveImmutableSafetySnapshot que mantém uma lista rotativa dos últimos 10 estados completos sob chave blindada (coindex_blackbox_snapshots_${userId}), disparada no 1º acesso do dia, na mudança de versão e antes de Push/Pull/Exclusões.",
      "Seção Caixa-Preta na Interface: Disponibilizada na Central de Sincronização e na aba Configurações com botões de download instantâneo do backup JSON e restauração 1-clique dos pontos históricos.",
      "Diagnóstico Forense e Resgate de Set/Out/Nov: Identificada falha de formato onde DD-MM-YYYY disparava erro 22008 (dias > 12) e inversão MDY (dias <= 12) no PostgreSQL, revertendo as datas para ISO YYYY-MM-DD com des-inversão automática.",
      "Revogação Total de Exclusões Automáticas e Purgas: Proibição absoluta de chamadas .delete() em segundo plano no Supabase e de remoção cega de caches locais do usuário."
    ]
  },
  {
    version: "0.49.1",
    date: "Nov/2026",
    title: "Sprint 65: Delta Sync Ultra-Rápido (<100ms), Fim do Erro de Sync Travado, Deduplicação Automática de Lançamentos Clonados e Correção de Aportes no Inspetor Cloud",
    highlights: [
      "Fim do 'Erro de Sync' Travado na Topbar: Correção da causa raiz onde o debounced auto-sync de 600ms reenviava todas as transações de uma só vez; agora o auto-sync reativo grava SOMENTE o registro do Cofre Mestre V3 em tempo recorde (~40-80ms).",
      "Delta Sync Ultra-Rápido (<100ms): Lançamentos individuais criados, alterados ou com status alternado no CRUD salvam atomicamente via upsertTransactionInDb, garantindo latência quase imperceptível e alívio do tráfego de rede.",
      "Deduplicação Automática e Inteligente de Transações Clonadas (deduplicateCloudTransactions): Algoritmo com pontuação de qualidade heurística e clustering por ID determinístico e assinatura semântica (data, descrição normalizada, centavos, categoria, parcelas, pagamento) que elege a transação de maior qualidade e expurga os clones duplicados do banco.",
      "Purga Física e Segura no PostgreSQL (purgeDuplicateTransactionsInDb): Limpeza em segundo plano em lotes de 50 registros com blindagem absoluta do Cofre Mestre V3, fazendo com que as linhas duplicadas voltem à contagem real idêntica à tela (100% Sincronizado).",
      "Medição Física de Latência do PostgreSQL (pingSupabaseDatabase): Substituição do ping de rotas de terceiros por uma consulta HEAD direta e ultra-leve no Supabase via performance.now(), exibindo latência real de conexão.",
      "Correção do Contador de Aportes de Investimentos & B3: Filtro expandido para abranger categorias 'Aporte', 'Aporte / Investimento', 'Investimentos', flowType 'INVESTMENT' e gavetas alocadas (investmentBucket), exibindo o total verídico em vez de '0 aportes'.",
      "Polimento do Inspetor Cloud: Ajuste de layout em 'Veículos & Revisões:' com espaçamento flexível e shrink-0, além de banner de erro acionável com botão de reenvio atômico imediato ('Reenviar Agora')."
    ]
  },
  {
    version: "0.49.0",
    date: "Nov/2026",
    title: "Sprint 64: Arquitetura 100% Nuvem Estrita (Zero LocalStorage), Cross-PC Live Sync no Foco da Janela, Suavização Micro-Sutil da Poeira Estelar e Painel Verídico de Verificação Cloud",
    highlights: [
      "Suavização da Poeira Estelar (Ambient Background FX): Redução da opacidade base para faixa super discreta (0.04 a 0.16) com teto estrito de 0.22, halos de difração limitados a 0.06 e estrelas cadentes elegantes (0.16 máx), preservando integralmente a Aurora Camaleão e as Ondas de Seda.",
      "Arquitetura 100% Nuvem Estrita (Zero LocalStorage): Erradicação definitiva da hidratação local para Lançamentos, Cartões, Bancos, Investimentos, Veículos e Notas; purga proativa de chaves legadas e garantia de dados idênticos em múltiplos computadores.",
      "Cross-PC Live Sync no Foco da Janela: Listeners globais de window focus e visibilitychange com throttle seguro de 15s que consultam o Supabase em segundo plano ao alternar abas sem necessidade de recarregar a página (F5).",
      "Painel Oficial de Verificação Cloud nas Configurações: Diagnóstico verídico em tempo real com status do servidor (ONLINE/OFFLINE), latência em ms, pílula de integridade 'Sincronizado com a Nuvem: SIM / NÃO' e auditoria de contagem tela vs. nuvem.",
      "Botões de Ação Imediata: Auditoria ao vivo sob demanda ('Testar e Verificar Nuvem Agora'), envio forçado ('Forçar Gravação na Nuvem') e download completo ('Recarregar Dados da Nuvem')."
    ]
  },
  {
    version: "0.48.0",
    date: "Nov/2026",
    title: "Sprint 63: Upgrade Cinematográfico do Motor de Fundo Cupertino Ambient FX 2.0 (Poeira Estelar 3D com Difração de 4 Pontas, Ondas de Seda Harmônicas e Aurora Camaleão Contextual por Aba)",
    highlights: [
      "Poeira Estelar 3D em 3 Camadas de Profundidade: 115 micropartículas em órbita flutuante (Deep Space 65%, Crisp Starlight 25% com cruz de difração de 4 pontas ópticas e Foreground Bokeh Orbs 10%).",
      "Interatividade Física com Cursor (Mouse Breeze & Flare Boost): Brisa repulsora elástica num raio de 135px e brilho de flare amplificado em até +45% com amortecimento inercial.",
      "Estrelas Cadentes Cinematográficas (Shooting Stars): Rastro hiperbólico luminoso cruzando o terço superior do céu a cada 11–17s com desvanecimento suave.",
      "Ondas de Seda Harmônicas (Silk Contour Waves): 3 feixes com 5 fitas senoidais duplas ultrafinas (0.65px), gradiente horizontal cromático da paleta ativa e reflexo especular de luz na passagem do mouse.",
      "Aurora Camaleão Contextual por Aba: Transição contínua via interpolação LERP (0.035/frame) entre 6 paletas de humor cromático (Dashboard Indigo/Cyan, Transações Emerald, Investimentos Violet, Cartões Cyan/Sky, Bio Sunset Rose, Veículos Amber/Orange).",
      "Suporte Nativo ao Modo Claro (Cupertino Light Adaptive): Adaptação automática com fundo #F2F4F8, partículas em tons pastel suaves e opacidade calibrada para legibilidade máxima.",
      "Performance Extrema 144Hz GPU e Economia de Energia: Renderização direta via HTML5 Canvas 2D sem CSS transforms intrusivos (evita bugs de contêiner em modais via Portal) e congelamento automático de rAF em abas em segundo plano (document.hidden)."
    ]
  },
  {
    version: "0.47.0",
    date: "Nov/2026",
    title: "Sprint 62: Arquitetura Cloud-First Definitiva (Supabase PostgreSQL), UUIDs Determinísticos RFC 4122 v4, Cofre Mestre V3 Multi-Device e Central de Sincronização & Inspetor Cloud",
    highlights: [
      "Conversor Determinístico ensureValidUuid (FNV-1a 128-bit RFC 4122 v4) para erradicar rejeições de lote PostgreSQL 22P02 com compatibilidade total de strings arbitrárias.",
      "Túnel de descrição Base64 ||__CXM__: com preservação e restauração bidirecional transparente do ID original de cada lançamento financeiro.",
      "Blindagem do Cofre Mestre __COINDEX_CLOUD_VAULT_V3__ na tabela transactions utilizando estritamente as 9 colunas universais com valores padrão à prova de restrições SQL.",
      "Desacoplamento estrito de linhas do cofre em fetchAllCoindexData: 0% de interferência em métricas financeiras, balanços patrimoniais ou tabelas de lançamentos.",
      "Expansão total do Cofre Mestre para 100% dos módulos: Cartões, Bancos, Status, Notas, Desejos, Investimentos B3/CDI/BTC, Veículos (Preventiva/Odômetro), Bio & Strava e UI Settings.",
      "Sincronização Central Reativa (Auto-Sync) com debounce de 600ms e trava de hidratação inicial para evitar sobrescritas ou condições de corrida.",
      "Central de Sincronização & Inspetor Cloud (Supabase) via Portal: diagnóstico de latência em tempo real, telemetria dos 9 módulos, Envio Completo (Push) e Download com Substituição (Pull)."
    ]
  },
  {
    version: "0.46.1",
    date: "Nov/2026",
    title: "Sprint 61: Popover de Filtro Opaque Portal-Rendered, Scroll Cupertino Suave sem Setas, Busca Rápida de Categorias e Ocultação Estrita de Checkboxes",
    highlights: [
      "Filtros de coluna renderizados via createPortal com opacidade 100% (#0F1420 / #FFFFFF) e z-index [99999].",
      "Classe .cupertino-thin-scroll erradicando botões de setas ▲/▼ nativos do Windows no Chrome e Edge.",
      "Mini campo de busca em tempo real com auto-foco nos popovers de filtro de categoria.",
      "Migração em lote de lançamentos com categoria antiga para categorias do catálogo oficial.",
      "Coluna de checkboxes de seleção estritamente oculta até ativação do modo de seleção."
    ]
  },
  {
    version: "0.46.0",
    date: "Nov/2026",
    title: "Sprint 60: Soberania Estrita da Nuvem (Supabase SSOT), Eliminação Definitiva da Ressuscitação de Cartões/Bancos e Exclusão Instantânea no Cofre",
    highlights: [
      "Soberania Estrita da Nuvem (Supabase SSOT): Eliminação dos algoritmos aditivos mergeEntitiesSafe e rescueMissingBanksAndCards que ressuscitavam itens obsoletos do localStorage em outros computadores; o estado remoto do Supabase agora sobrescreve o cache local com autoridade absoluta.",
      "Expurgo de Chaves Legadas de Sessão: Limpeza proativa de chaves antigas de localStorage (lifeos_cards_v8, lifeos_banks_v1, coindex_vault_cards_backup, coindex_vault_banks_backup) ao inicializar e ao forçar sincronização.",
      "Desativação de Push Proativo no Init: Desativação do auto-heal automático na inicialização, impedindo que computadores secundários com dados locais defasados empurrem cartões ou bancos deletados de volta para o Supabase.",
      "Exclusão Atômica com Cofre Mestre: Ao excluir cartões ou bancos (handleDeleteCard / handleDeleteBank), registra tombstone, exclui na tabela dedicada e regrava imediatamente o registro mestre __COINDEX_CLOUD_VAULT__ sem o item.",
      "Botão de Exclusão Direta no Gerenciador de Cartões: Adição de ícone de lixeira (Trash2) em cada cartão no modal '⚙️ Ordenar Meus Cartões' do Dashboard para exclusão rápida e direta.",
      "Sincronização Manual Pura na Topbar: Ao clicar no badge de sincronização, limpa caches obsoletos, consulta o Supabase e reidrata a aplicação 100% com o estado mais recente da nuvem."
    ]
  },
  {
    version: "0.45.2",
    date: "Nov/2026",
    title: "Sprint 59: Auditoria Automotiva, Desduplicação de Abastecimentos, Personalização Preventiva e Seleção por Long-Press",
    highlights: [
      "Auditoria & Desduplicação Estrita de Combustível (vehicle-math / VehiclesTab): Eliminação de falsos positivos como 'Imposto' e deduplicação de transações por ID; correção da agregação mensal com parse canônico de YYYY-MM para datas DD-MM-AAAA, eliminando o corte de rótulo ('11/') e ordenando estritamente em ordem cronológica (MM/AA).",
      "Limpeza do Cabeçalho de Veículos: Unificação dos botões de abastecimento em um único botão '+ Registrar Abastecimento', e migração do seletor de cor do odômetro para o popover de configurações da engrenagem do próprio gráfico.",
      "Plano Preventivo por Odômetro 100% Personalizável: Adição de novos itens preventivos, edição completa de intervalos, custos e quilometragens com sincronização inteligente bidirecional (nextKm = lastKm + intervalKm / intervalKm = nextKm - lastKm), exclusão, restauração de padrões de fábrica e sincronização com o Cofre Mestre de Nuvem.",
      "Modo de Seleção Sob Demanda na Tabela (TransactionsTableAdvanced): Checkboxes ocultas por padrão (coluna Data como primeira coluna visível), ativadas por botão '☑️ Selecionar' ou Long-Press tátil de 320ms em qualquer linha/card; barra de ações em lote flutuante renderizada via createPortal fixa na tela com suporte a Esc para cancelamento."
    ]
  },
  {
    version: "0.45.1",
    date: "Nov/2026",
    title: "Sprint 58.1: Reforma Limpa da Aba Sobre com Manifesto Pessoal e Nitidez Vetorial Absoluta da Logo",
    highlights: [
      "Nitidez Vetorial Absoluta da Logo (CoindexLogo): Eliminação de transform: scale, will-change: transform e filtros CSS drop-shadow que causavam pixelização; dimensões nativas diretas (width={200} height={140} viewBox='0 0 120 84' shapeRendering='geometricPrecision'), halo de luz ambiente suave desacoplado em div HTML de fundo e deslocamento vetorial puro no hover (translate -1.5px/1.5px) com nitidez cristalina.",
      "Remoção do Card Torto no Palco Principal (AboutTab): Substituição do TiltCard3D por um palco reto, sóbrio e elegante em Cupertino Glassmorphism, alinhado ao design system da Apple.",
      "Expurgo Total de Jargões Técnicos: Remoção completa do botão de overclock de 144Hz, badges de telemetria de GPU/SSOT, seção de ficha técnica com contadores em Hz/ms e blocos de código/linguagens de programação, redirecionando o tom da página para o desenvolvimento pessoal.",
      "Manifesto Editorial & 4 Pilares do Ecossistema: Nova estrutura focada em Organização Financeira & Patrimônio, Saúde & Exercícios, Conhecimento & Insights e Hábitos & Metas, com Missão, Visão, Valores e o significado humano do Símbolo do Equilíbrio."
    ]
  },
  {
    version: "0.45.0",
    date: "Nov/2026",
    title: "Sprint 58: Persistência Absoluta Multi-Device via Túnel de Metadados Universal e Cofre Mestre Cloud Vault na Tabela Transactions do Supabase",
    highlights: [
      "Túnel Universal de Metadados (coindex-supabase): Codificação e decodificação transparente Base64 UTF-8 (encodeTxForSupabase/decodeTxFromSupabase) anexada à coluna 'description' das transações (||__CXM__:base64), blindando 100% dos dados de investimentos (gavetas BTC/CDI/LCI/STOCKS/PAPEL, preço de entrada, tickers, taxas CDI, bancos vinculados e rateios) contra divergências ou ausência de colunas remotas no PostgreSQL.",
      "Cofre Mestre Cloud Vault (__COINDEX_CLOUD_VAULT__): Registro determinístico e resiliente na tabela transactions que armazena em nuvem o estado global da conta — Calibração de Saldo Real (realBalanceOverride), modo de rendimento, seleção de gráficos de mercado ao vivo, slider do simulador de metas, cartões, bancos, notas e desejos.",
      "Sincronização Bidirecional & Auto-Heal: Hidratação inteligente no carregamento inicial unindo dados locais e da nuvem sem sobrescrita destrutiva; botão interativo na Topbar para sincronização manual imediata com feedback tátil de sucesso.",
      "Garantia Zero Migration: Funcionamento universal e imediato em qualquer ambiente ou computador sem necessidade de executar comandos manuais de migração DDL no banco de dados."
    ]
  },
  {
    version: "0.44.1",
    date: "Nov/2026",
    title: "Sprint 57: Correção do Motion da Logo Principal 144Hz e Reforma Cinemática da Página Sobre com Manifesto Editorial Aprofundado",
    highlights: [
      "Correção Cirúrgica de Motion na Logo (CoindexLogo): Eliminação de engasgos e saltos de quadro no pulso orbital 144Hz através de normalização vetorial (pathLength='100'), máscaras alfa puras (SVG mask) para entrelaçamento over-under sem cortes de fundo opacos e aceleração GPU estrita (transform: translateZ(0)).",
      "O Manifesto Coindex (Coin + Index + Co-Op): Redação aprofundada da tríade etimológica e conceitual do produto dividida em três pilares (O Ativo/Moeda, O Catálogo/Índice e a Parceria/Co-Op Copilot).",
      "Linha do Tempo de Evolução & Engenharia: Trilha cronológica interativa estruturada em 6 Grandes Eras Tecnológicas documentando a trajetória das 57 sprints de desenvolvimento contínuo da plataforma.",
      "Reforma Cinemática da Página Sobre (AboutTab): Reconstrução completa com Hero monumental imersivo, Bento Grid com iluminação de proximidade (useProximityBorderGlow), os 5 Valores Inegociáveis e telemetria de engenharia com contadores vivos a 144Hz."
    ]
  },
  {
    version: "0.44.0",
    date: "Nov/2026",
    title: "Sprint 56: Módulo 'Sobre' com Palco Monumental Interativo 144Hz da Logo 'The Equilibrium Link', Manifesto da Coindex e Telemetria de Engenharia",
    highlights: [
      "Palco Monumental 'The Equilibrium Core' (CoindexLogoMonumental): Geometria vetorial expandida com dupla órbita luminosa síncrona 144Hz, micro-grid arquitetural, anéis concêntricos de radar e física 3D TiltCard3D com reflexo especular.",
      "Botão '⚡ Pulsar Motor 144Hz': Micro-física tátil com dispersão de 22 partículas azuis em arco quântico (triggerAuraBurst), aceleração da rotação orbital por 1,5s e ciclo demonstrativo dos contadores numéricos.",
      "A Filosofia do Elo ('Por que The Equilibrium Link?'): Módulo educativo com controle segmentado deslizante (SlidingSegmentedControl) detalhando o Elo Esquerdo em Titânio (Clareza & Controle), o Elo Direito em Apple Blue (Expansão & Futuro) e o Ponto de Entrelaçamento Perpétuo.",
      "Manifesto Coindex (Missão, Visão e Objetivos Estratégicos): Bento Grid com iluminação de borda por proximidade (useProximityBorderGlow) consolidando os propósitos da plataforma.",
      "Os 5 Valores Inegociáveis da Coindex: Cards com iluminação spotlight destacando Precisão no Centavo, Fluidez como Respeito, Design que Acalma, Soberania na Nuvem e Patrimônio + Saúde em Harmonia.",
      "Telemetria de Engenharia & Ficha Técnica: 4 contadores vivos em tempo real (144 Hz, 100% Cloud Supabase, 56 Sprints e 0 ms de bloqueio de thread) e especificação completa da stack oficial."
    ]
  },
  {
    version: "0.43.0",
    date: "Nov/2026",
    title: "Mega-Sprint 55: Limite Real dos Cartões c/ Parcelas Futuras, Detector de Assinaturas, Edição Inline & Ações em Lote, Manutenção KM em Veículos, B3 Ao Vivo, Calendário Heatmap, PRs Strava e Coindex Wrapped",
    highlights: [
      "M-01 & M-02 (Limite Real dos Cartões & Radar de Assinaturas): Separação matemática contábil entre fatura do mês atual vs. parcelas futuras bloqueando o limite em CardExposure; detector automatizado de assinaturas recorrentes com projeção anual 12x e alertas de reajuste; conciliador relâmpago de extrato de fatura.",
      "M-03 (Edição Inline por Duplo Clique, Ações em Lote & Lançamento Rápido no Ctrl+K): Edição inline direta na tabela de lançamentos ao dar duplo clique em Data, Descrição, Categoria ou Valor; seleção múltipla por checkboxes com barra de ação flutuante (Marcar como Pago, Pendente, Mudar Categoria, Excluir); parser inteligente em linguagem natural no Ctrl+K (ex: 'gastei 35,90 uber pix').",
      "A-01 (Manutenção Preventiva por Odômetro em Veículos): Painel de 5 manutenções vitais periódicas (Óleo/Filtro, Alinhamento, Freios, Arrefecimento, Correia Dentada) com barras de desgaste, alertas de revisão próxima/vencida e botão de registro 1-clique integrado ao Livro Caixa.",
      "A-02 (Cotações B3 Ao Vivo & Simulador de Marcos Patrimoniais): Ingestão em tempo real de ações e FIIs da B3 (PETR4, VALE3, BBAS3, ITUB4, WEGE3, MXRF11, HGLG11, IVVB11) com dividendos mensais estimados por cota; linha do tempo interativa de marcos patrimoniais (R$ 5k a R$ 100k) com slider de aportes compostos.",
      "A-03 (Calendário Financeiro Heatmap & No-Spend Days): Nova sub-aba 📅 Calendário no widget de Fluxo de Caixa exibindo grade mensal de 7 colunas com pontos semânticos (entradas, saídas, investimentos), contador de streak sem gastos e detalhamento de lançamentos por dia.",
      "A-04 (Recordes Pessoais PRs & Zonas de Pace no Strava): 4 troféus de recordes atléticos (Pace PR, Longão, Melhor 5K, Maior Altimetria) e barra horizontal segmentada das 4 zonas de esforço cardiovascular (Regenerativo, Z2 Aeróbico, Limiar, Anaeróbico/VO2).",
      "Helena Costa Produto #1 (Central de Alertas Proativos Acionáveis): 4 gatilhos preditivos no sininho da Topbar (faturas a vencer em <= 5 dias, cobrança de devedores, revisões de km e déficit semanal de corridas) com botão de navegação direta 'Ir para [Aba] →'.",
      "Helena Costa Produto #2 (Ritual de Fechamento do Mês - Coindex Wrapped & Gaveta Mobile 'Mais'): Modal executivo Coindex Wrapped com classificação de performance financeira do mês, taxa de aporte, top 3 maiores gastos e telemetria consolidada; gaveta inferior estilo iOS Bottom Sheet no mobile para navegação instantânea em todos os 12 módulos."
    ]
  },
  {
    version: "0.42.0",
    date: "Nov/2026",
    title: "Sprint 54: Carrossel Vertical Apple Wallet de 3 Cartões Nítidos com Scroll no Mouse, Correção Matemática dos Limites de Cartões, Modal de Ordenação com Engrenagem e Polling de 30s no Mercado",
    highlights: [
      "Carrossel Vertical no Apple Wallet (Máx. 3 Cartões Nítidos): Visualização compacta de no máximo 3 cartões simultâneos com scroll fluído via roda do mouse (onWheel com debounce de 140ms e propagação isolada), botões de navegação ▲ / ▼ e indicador de janela (ex: 1-3 de 5).",
      "Bordas de Espiada (Peek Edges): Pequenas bordas sutis com leve desfoque e escala reduzida no topo e na base do stack indicando a existência de cartões anteriores ou posteriores na pilha.",
      "Nitidez Absoluta dos Textos dos Cartões: Eliminação definitiva do embaçamento em cartões de crédito físicos (BanksTab e Apple Wallet) através de reset de transform 3D para 'none' em repouso, font smoothing antialiased e elevação de camadas de texto para z-index superior.",
      "Remoção do Retângulo Azul de Seleção: Eliminação total dos anéis/bordas azuis nos cartões da Apple Wallet, adotando visual limpo com foco sem borda e elevação suave ao passar o cursor.",
      "Correção Matemática Total dos Limites no Rodapé (cardLimitsAnalytics): Substituição do cálculo legado de bancos pelo cálculo exclusivo da soma real de todos os cartões cadastrados pelo usuário (R$ 34.875 de limite total, total utilizado no mês e total disponível), com barras de progresso individuais por cartão.",
      "Modal '⚙️ Ordenar Meus Cartões': Abertura rápida através do ícone de engrenagem no cabeçalho do widget Apple Wallet ou botão de reordenação, permitindo reposicionar os cartões com persistência síncrona tripla (Supabase, localStorage e backup do vault).",
      "Micro-Motions nos Controles Superiores do ChartCard: Transições táteis de alta precisão ao passar o cursor sobre o botão de arraste (scale 1.25 em azul), botão de expansão (scaleX 1.1) e botão de configurações/engrenagem (rotação de 90° e 180° no clique).",
      "Atualização de Mercado a Cada 30 Segundos: Ajuste do intervalo de polling do mercado e criptomoedas para 30 segundos contínuos (30000ms) e remoção da contagem de segundos/relógio do badge '⚡ AO VIVO', mantendo o pulsar suave do ponto sonar verde."
    ]
  },
  {
    version: "0.41.0",
    date: "Nov/2026",
    title: "Sprint 53: Limpeza de UI, Correção de Tipografia nos Controles Deslizantes, Trava Correta de Animações, Topbar Compacta e WebSocket Binance em Tempo Real",
    highlights: [
      "Remoção da Sub-linha Acordeão e Chevrons na Tabela: Eliminação das sub-linhas e setas nas tabelas de Lançamentos e Valores a Receber, proporcionando linhas limpas, navegação ultra-direta e visual minimalista.",
      "Correção do Corte na Letra 'g' de 'Pagos': Ajuste de leading-normal, overflow-visible e respiro vertical (py-1.5 px-3.5) no componente SlidingSegmentedControl, eliminando qualquer corte horizontal da haste inferior da letra 'g'.",
      "Remoção da Barrinha Branca Vertical na Sidebar: Remoção do indicador vertical duplicado dentro do botão ativo na navegação lateral, mantendo apenas a pílula azul suave estilo macOS/iOS.",
      "Topbar Minimalista com Botão '+' Compacto: Substituição do botão largo '+ Novo Lançamento' por um botão quadrado compacto de alta precisão com ícone '+', liberando espaço e equilibrando o cabeçalho superior.",
      "Migração do Seletor de Tema (Claro / Escuro): Transferência do controle segmentado de tema da Topbar para a aba Configurações, agrupado na seção de aparência do sistema.",
      "Correção da Lógica Invertida de 'Reduzir Animações': Alinhamento semântico estrito onde 'Sim' ativa o Modo Econômico (Sólido Puro, data-animations='off') e 'Não' mantém o modo padrão 144Hz Híbrido Copilot (data-animations='on').",
      "Saneamento de Configurações: Remoção dos cards legados de seleção de logotipo (mantendo permanentemente o Equilibrium Link oficial) e do card obsoleto de Google Sheets Cloud DB.",
      "Correção do Duplo '+ + Novo Aporte': Eliminação do caractere '+' redundante no rótulo do botão de novo aporte no módulo de Investimentos.",
      "Cotações de BTC e Mercado em Tempo Real via WebSocket da Binance: Conexão WebSocket nativa contínua nos streams btcbrl@ticker, bnbbrl@ticker, ethbrl@ticker e solbrl@ticker da Binance com atualizações a cada segundo, badge pulsante '⚡ AO VIVO' e polling rápido sem cache de fallback."
    ]
  },
  {
    version: "0.40.0",
    date: "Nov/2026",
    title: "Sprint 52: Suite Completa de 18 Micro-Animações 144Hz GPU-Accelerated (Apple Spring, 3D Gyro Tilt, Acordeão Contábil, Laser Sync e Aura Burst)",
    highlights: [
      "Motor Central de Micro-Física (app/components/MotionEngine144.tsx): Utilitários acelerados por GPU em 144Hz com zero re-renders do React, integrando requestAnimationFrame coalescido e mutações diretas de propriedades CSS.",
      "Animação #1 (3D Gyroscope Card Tilt & Glare): Inclinação giroscópica 3D (±6deg) proporcional ao cursor nos cartões de crédito físicos de BanksTab e widget Apple Wallet, com camada holográfica (.holographic-foil-glare) e retorno elástico.",
      "Animação #2 (Apple Wallet Fan-Out): Expansão vertical suave entre os cartões empilhados no widget wallet_limits ao passar o cursor sobre a pilha (-mt-12 para -mt-7) com elevação individual do cartão sob foco.",
      "Animação #3 (Proximity Border Glow): Hook useProximityBorderGlow iluminando sutilmente a borda fina (1px) mais próxima do cursor nos Bento Cards (ChartCard).",
      "Animação #4 (Odometry Digit Roll): Efeito de rolagem vertical cilíndrica mecânica nos números em destaque com flash cromático sutil (verde/coral) mantendo alinhamento tabular.",
      "Animação #5 (Live Market Heartbeat Pulse & Sonar Dot): Ponto de radar pulsante (sonar-dot) com anel duplo animate-ping em verde/vermelho na extremidade dos gráficos de mercado e flash de batimento cardíaco ao atualizar cotação.",
      "Animação #6 (Liquid Unblur Wave no Modo Privacidade): Transição suave com filtro blur(8px) para blur(0px) e opacidade via curva cúbica Apple (340ms cubic-bezier(0.22, 1, 0.36, 1)).",
      "Animação #7 (Elastic Donut Slice Pull-Out): Destaque elástico na fatia ativa do Donut com outerRadius expandido e exibição dinâmica instantânea no centro do Donut (Nome, Valor R$ e % daquela fatia).",
      "Animação #8 (Synchronized Crosshair Laser Scrubbing): Scrubbing sincronizado simultâneo em todos os gráficos de mercado (syncId='coindex_market_sync') e Strava (syncId='coindex_strava_sync') com agulha laser vertical azul/laranja.",
      "Animação #9 & #10 (Apple Fitness Ring Draw & Agulha HOJE): Animação do anel circular de progresso semanal com strokeDashoffset (900ms) e ponto luminoso no topo; barra de ritmo anual com transição suave da barra verde-menta e agulha HOJE (750ms).",
      "Animação #11 (Magnetic Dock Sidebar): Transição magnética nos ícones da Sidebar esquerda com elevação tátil e indicador luminoso lateral deslizante.",
      "Animação #12 (Smooth Accordion Row Expansion): Sub-gaveta acordeão suave na tabela de Lançamentos e Valores a Receber para itens divididos, empréstimos ou abatimentos, revelando a árvore contábil completa (Original, Abatimentos e Saldo).",
      "Animação #13 (Living SVG Micro-Icons): Micro-animações táteis no hover dos botões de exclusão (Trash2 inclinado), edição (Pencil inclinado) e sino de notificações (bellSwing).",
      "Animação #14 (Inércia Física no Drag-and-Drop): Card inclinado com rotação sutil e sombra profunda durante o arraste com retorno elástico ao soltar.",
      "Animação #15 (Emerald Aura Burst & Confetti): Disparo de 22 micro-partículas vetoriais luminosas e anel expansivo ao clicar em 'Quitar 100%', '+ Abater', 'Pagar Fatura' ou guardar em desejos.",
      "Animação #16 (Elastic Status Stamp): Carimbo elástico tátil (.status-stamp-pop) com halo verde expansivo ao alternar status para Pago.",
      "Animação #17 (Superfície Líquida nas Barras de Progresso): Shimmer contínuo especular (.liquid-progress-shimmer) com ponto luminoso frontal (.liquid-progress-head) no termômetro pessoal e limites bancários.",
      "Animação #18 (Morphing Card-to-Modal nos 4 Slim KPIs): Abertura do Raio-X Contábil com expansão elástica iOS (scale 0.92 -> 1) e terminação estrita em transform: none para proteção absoluta de portais.",
      "Respeito Arquitetural ao Toggle 'Reduzir Animações': Exposição contínua do atributo data-animations='on' | 'off' no <html> com desativação total de durações quando desligado."
    ]
  },
  {
    version: "0.39.1",
    date: "Nov/2026",
    title: "Hotfix Sprint 49.1: Correção Global do Desalinhamento da Pílula Azul Deslizante em Todos os Controles Segmentados",
    highlights: [
      "Pixel-Perfect Bounding Box: Ancoragem absoluta estrita com top: 0 e left: 0 no indicador deslizante, eliminando o duplo deslocamento vertical e horizontal em containers flex items-center.",
      "Métricas Nativas offsetLeft / offsetTop: Posicionamento e dimensionamento diretos via offsetLeft, offsetTop, offsetWidth e offsetHeight do botão ativo relativo ao container pai.",
      "Eliminação de Layout Shift por Font-Weight: Padronização constante em font-semibold em ambos os estados (ativo e inativo), garantindo que a largura do botão não se altere após a medição.",
      "Sincronização com Fontes e Redimensionamento: Rastreamento em useLayoutEffect, requestAnimationFrame, ResizeObserver no container e botão ativo, e listener document.fonts.ready.",
      "Padronização Global dos Controles Unidos: Correção aplicada no componente universal SlidingSegmentedControl e em todos os seletores de filtros, regimes, períodos e abas do sistema."
    ]
  },
  {
    version: "0.39.0",
    date: "Nov/2026",
    title: "Sprint 51: Correção da Renderização do Gráfico Strava Progress, Ingestão Paginada de Corridas Individuais na API, Modo 'Cada Corrida' e Histórico Linha por Linha",
    highlights: [
      "Correção Definitiva da Linha do Gráfico Strava: Alinhamento estrito de chaveamento entre o XAxis (dataKey='xLabel') e os pontos temporais com ReferenceLine reativa, garantindo renderização contínua sem quebras de SVG e dot rendering seguro com Number.isFinite.",
      "Ingestão Paginada Completa na Rota /api/strava: Busca automática com per_page=200 em 2 páginas consecutivas no endpoint /athlete/activities, resgatando até 400 atividades individuais com datas e horários fidedignos em fuso local sem deslocamento de UTC.",
      "Modo 'Cada Corrida' (📍 Cada Corrida): Alternância flexível entre a visão corrida por corrida e agrupamento semanal ('📅 Por Semana'), com prévia de telemetria dinâmica de 4 colunas (Distância, Pace Médio, Tempo e Elevação).",
      "Histórico Detalhado Linha por Linha: Tabela rica sempre visível logo abaixo do gráfico com filtros de busca textual, distância mínima (>3km, >5km, >10km, >21km), filtro por mês e mini-barras proporcionais de distância.",
      "Interatividade Bidirecional Tabela x Gráfico: O foco, clique ou hover em qualquer linha da tabela destaca imediatamente o ponto correspondente na linha do tempo do gráfico Strava e posiciona a linha de referência do cursor.",
      "Registro Manual de Treinos: Modal integrado para inserção de corridas com cálculo automático em tempo real de pace médio, velocidade e calorias estimadas.",
      "Detecção e Alerta de Escopo Restrito: Banner intuitivo com link de autorização OAuth2 com 1 clique para liberar permissão de leitura de atividades completas (read,activity:read,activity:read_all,profile:read_all)."
    ]
  },
  {
    version: "0.38.0",
    date: "Nov/2026",
    title: "Sprint 50: Unificação Contábil do Livro Caixa (SSOT), Sincronização Bidirecional Estrita e Saneamento de Recebimentos Fantasmas",
    highlights: [
      "Livro Caixa como Fonte Única da Verdade (SSOT): Unificação contábil integral onde transações do Livro Caixa e módulos especialistas (Valores a Receber, Veículos, Investimentos e Bancos) mantêm sincronização bidirecional em tempo real com precisão matemática ao centavo.",
      "Expurgo de Recebimentos Fantasmas do Devedor Dio: Auditoria contábil automática que purga definitivamente os 8 recebimentos órfãos inflados em 30/10/2026, gerando tombstones imediatos no Supabase PostgreSQL.",
      "Reconciliação Simétrica da Dívida Parcial de Dio: Corrigido o abatimento parcial de R$ 500,00 da dívida de R$ 622,75 com descrição 'Recebimento Parcial: Dio (Saldo restante de 2025 à receber)' e vínculo relacional estrito.",
      "Seletor Inteligente em TransactionModal: Criação de lançamentos na categoria 'Recebimento de Empréstimo' permite escolher diretamente a dívida em aberto correspondente, sugerindo valor restante e vinculando o abatimento.",
      "Mão Dupla nos Ajustes de Recebimentos: Excluir ou alterar o valor de um recebimento no Livro Caixa recalcula instantaneamente o paidAmount da dívida mãe e reverte status para Pendente; excluir uma dívida expurga todos os recebimentos filhos.",
      "Telemetria Veicular Bidirecional: Ações de edição e exclusão direta no Histórico Completo de Veículos refletem instantaneamente no Livro Caixa com recálculo de odômetro, km/L e TCO."
    ]
  },
  {
    version: "0.37.0",
    date: "Nov/2026",
    title: "Sprint 49: Arquitetura 100% Cloud-First no Supabase, Motion Deslizante Horizontal (Sliding Pill) e Efeito Híbrido Copilot Fixo",
    highlights: [
      "Persistência 100% Cloud-First (Supabase SSOT): Eliminação da dependência de salvamento local; Desejos de Compra (BrainNote), cartões, bancos e veículos totalmente salvos e reconciliados no PostgreSQL na nuvem.",
      "Blindagem de Desejos de Compra: Envelope JSON determinístico garantindo que atributos de desejos (itemType, price, completed, targetMonth, priority, storeUrl) jamais sejam perdidos mesmo sob fallbacks de schema.",
      "SlidingSegmentedControl Universal: Motor de animação física Apple (280ms cubic-bezier(0.22, 1, 0.36, 1)) com translação suave do indicador deslizante horizontal em todas as barras de opções unidas do sistema.",
      "Barras Unidas com Motion Deslizante: Aplicado em Tema (Claro/Escuro), Regime (Competência/Caixa), Analítica de Patrimônio, Radar Financeiro, Fluxo de Caixa, Situação de Lançamentos, Devedores, Bioimpedância, Strava e Abas de Modal.",
      "Efeito Híbrido Fixo & Limpeza da Topbar: Remoção completa do botão 'Atmosfera' da barra superior; fundo visual fixado por padrão no modo Híbrido Copilot.",
      "Controle Unificado 'Reduzir Animações': Configuração unificada nas preferências [Sim | Não] permitindo alternar facilmente entre o visual imersivo a 144Hz e modo sólido puro de máxima economia de energia.",
      "Migração SQL PostgreSQL: Disponibilizada em supabase/migrations/0002_coindex_full_cloud_columns.sql com todas as colunas nativas e RLS multi-tenant."
    ]
  },
  {
    version: "0.36.0",
    date: "Nov/2026",
    title: "Sprint 48: Módulo de Investimentos & Mercado Ao Vivo (Wealth Core 144Hz, Multi-Charts e Simulador de Inflação)",
    highlights: [
      "Módulo Investimentos na Sidebar: Nova aba dedicada com sincronização bidirecional em tempo real com a tabela principal de Lançamentos.",
      "The Wealth Core & Marcação a Mercado: Hero card com total acumulado a mercado, custo depositado, rendimento líquido e barra dinâmica de alocação.",
      "Gavetas Especializadas de Ativos: Cards interativos com física 144Hz para Bitcoin & Cripto (BTC), CDI 115%, LCI/LCA isento de IR e Ações/FIIs.",
      "Terminal de Multi-Charts de Mercado Ao Vivo: Painel simultâneo de gráficos Recharts com cotações e séries temporais gratuitas de BTC, BNB, ETH, SOL, Dólar, Euro, CDI e IBOV.",
      "Simulador de Desvalorização do Dinheiro em Papel: Análise do impacto da inflação (IPCA ~4,5% a.a.) versus custo de oportunidade da Caixinha 115% CDI em 1, 3 e 5 anos.",
      "Reclassificação em 1-Clique: Pílulas dinâmicas com flash suave para movimentar aportes entre gavetas instantaneamente com recálculo a 144Hz."
    ]
  },
  {
    version: "0.35.1",
    date: "Nov/2026",
    title: "Hotfix Sprint 47.1: Blindagem de Persistência de Bancos e Cartões contra Sobrescrita do Supabase, União Aditiva Segura e Auto-Resgate no LocalStorage",
    highlights: [
      "Fim da Sobrescrita na Hidratação: Implementação do algoritmo mergeEntitiesSafe LWW com tombstones, impedindo que dados incompletos do Supabase apaguem bancos ou cartões criados localmente.",
      "Auto-Heal Push: Sincronização automática em background para o Supabase de cartões e bancos locais mais recentes ou não cadastrados remotamente.",
      "Persistência Síncrona Tripla: Gravação atômica instantânea no namespace isolado do usuário (lifeos_banks_v8/lifeos_cards_v8), na chave legada e no vault global de segurança (coindex_vault_*).",
      "Motor de Auto-Resgate (rescueMissingBanksAndCards): Varredura ampla no localStorage e análise reversa de transações para reconstruir automaticamente bancos e cartões faltantes.",
      "Blindagem de Schema e Retries no Supabase: Fallback automático com colunas mínimas universais em caso de incompatibilidade de colunas PostgreSQL (PGRST204 / 42703)."
    ]
  },
  {
    version: "0.35.0",
    date: "Nov/2026",
    title: "Sprint 47: Otimização Extrema de Performance para 144Hz Zero-Jank (Direct-DOM Ticker, GPU Compositor e Desacoplamento de Scrubbing)",
    highlights: [
      "Motor AnimatedNumber144: Ticker numérico 144Hz com interpolação direta no DOM via spanRef.current.textContent com ZERO re-renders do React durante o requestAnimationFrame.",
      "Pipeline GPU Compositor no Ambient FX: Aurora Orbs animadas exclusivamente via transform: translate3d(x,y,0) scale(s) e will-change: transform dentro de contain: strict.",
      "Spotlight Coalescido com CSS Variables: Rastreamento de cursor de 144fps via listener passivo e atualização de --spot-x/--spot-y sem chamada de setState.",
      "Pausa Inteligente em Aba Inativa: Suspensão automática de animações (animation-play-state: paused) sob document.hidden, economizando 100% de GPU e bateria.",
      "Isolamento de Scrubbing do Strava Progress: Card StravaProgressGrid isolado com React.memo e estado local para inspeção instantânea de telemetria a 144fps.",
      "Tuning de Backdrop-Filter: Calibração fina para blur(16px) saturate(150%) para rasterização sub-1.2ms em monitores 144Hz/240Hz 2K/4K."
    ]
  },
  {
    version: "0.34.0",
    date: "Nov/2026",
    title: "Sprint 46: Nova Logo Oficial 'The Equilibrium Link' com Motion Orbital na Sidebar e Favicon, Motor de Motions 120Hz e Loaders",
    highlights: [
      "Nova Logo Oficial The Equilibrium Link (Opção 1): Dois elos entrelaçados em over-under weave com gap de 3.5px, elo 'C' em Titânio (#F8FAFC) e anel em Apple Blue (#0A84FF).",
      "Motion Orbital e Física Magnética: Pulso contínuo de luz orbital em loop de 5.5s, traçado de entrada suave e repulsão magnética elástica no hover (+/-1.5px).",
      "Favicon Oficial Atualizado (app/icon.svg): Squircle premium Midnight (#0B0E14) com a geometria vetorial exata do Equilibrium Link em alta definição.",
      "Number Ticker 120Hz (AnimatedNumber): Animação fluida de transição numérica nos 4 Slim KPIs, Patrimônio Líquido, Donut e Metas Strava com curva quártica.",
      "Loaders Shimmer Contextuais: Shimmer contínuo nos estados de carregamento do Supabase, painel Strava Progress, taxa CDI BCB e importação bancária CSV/OFX."
    ]
  },
  {
    version: "0.33.0",
    date: "Nov/2026",
    title: "Sprint 45: Motor de Efeitos Especiais de Background 'Cupertino Ambient FX' (Aurora Mesh, Linear Grid, Titanium Light Rays, Spotlight e Híbrido)",
    highlights: [
      "Motor Cupertino Ambient FX: 6 modos atmosféricos selecionáveis em tempo real (Híbrido Copilot, Aurora Cupertino Mesh, Grade Arquitetural Linear, Feixes Titanium & Matte, Spotlight Interativo e Sólido Puro).",
      "Seletor Rápido na Topbar & Configurações: Popover intuitivo com ícone Sparkles na barra superior e painel visual completo na aba Configurações.",
      "Refração Real de Vidro Líquido: Ajuste fino de translucidez (--cupertino-card com backdrop-filter blur 20px saturate 160%) permitindo difração luminosa sob os cards Bento.",
      "Spotlight Interativo Otimizado: Rastreamento suave de cursor via requestAnimationFrame desativado automaticamente em telas touch e prefers-reduced-motion.",
      "Zero Block & Isolamento de Modais: Camada fixa z-0 com pointer-events-none garantindo ausência de containing block e clique sem obstrução."
    ]
  },
  {
    version: "0.32.0",
    date: "Nov/2026",
    title: "Sprint 44: Persistência Robusta de Datas, Last-Write-Wins (LWW), Unificação de Combustível em Gasolina e Ordenação A-Z de Categorias",
    highlights: [
      "Persistência Instantânea de Datas: Sincronização em tempo real de digitação no SmartDateInputBR com recálculo automático de competência e desembolso de caixa (cashMonth).",
      "Last-Write-Wins (LWW) & Resolução de Conflitos: Hidratação resiliente com comparação de updatedAt e versão (rev), reenviando registros locais mais recentes para o Supabase PostgreSQL.",
      "Unificação de Categorias de Combustível: Todas as variações legadas (Combustível, Posto, Etanol, etc.) normalizadas para 'Gasolina' (#f59e0b).",
      "Ordenação Alfabética A a Z: Catálogo de categorias 100% ordenado de A a Z em todas as interfaces (modais, filtros, tabelas e configurações) com locale pt-BR.",
      "Dupla Persistência Síncrona Atômica: setUserItem e localStorage.setItem disparados no mesmo tick em todas as mutações financeiras."
    ]
  },
  {
    version: "0.28.0",
    date: "Nov/2026",
    title: "Sprint 37: Ingestão Bancária CSV/OFX, Mobile PWA & Bottom Bar, Simulador Posso Comprar?, Fluidez 120Hz e Cibersegurança Zero-Trust",
    highlights: [
      "Ingestão Bancária CSV/OFX: Parser client-side determinístico com deduplicação automática (externalId) e motor inteligente de auto-categorização por palavras-chave.",
      "Modal de Importação de Extrato: Modal interativo com dropzone, separação clara entre novas transações e duplicadas e confirmação em lote em 1 clique.",
      "Mobile PWA & Bottom Navigation Bar: Manifest standalone, suporte a PWA e barra de navegação inferior ergonômica com 5 atalhos para polegar e botão central + Novo destacado.",
      "Visão Mobile em Cards Táteis: Interface responsiva (md:hidden) com cards compactos, badges de status interativas e botões de ação ágeis.",
      "Simulador 'Posso Comprar?': Painel com IA comportamental calculando impacto na Cota Diária (R$/dia), custo de oportunidade a 115% CDI e veredito em 3 níveis.",
      "Fluidez 120Hz & Otimização de GPU: useDeferredValue para buscas com latência zero e aceleração por hardware nos cards Bento Grid.",
      "Cibersegurança Zero-Trust: Headers estritos (X-Frame-Options DENY, nosniff, strict-origin) e políticas documentadas de Row Level Security."
    ]
  },
  {
    version: "0.27.0",
    date: "Nov/2026",
    title: "Sprint 35: Altura Compacta Funcional nos Gráficos, Paleta Cupertino Midnight e Correção dos KPIs no Modo Claro",
    highlights: [
      "Altura Compacta dos Gráficos: Reativação imediata do controle de altura na engrenagem (Compacta 175px como novo padrão, Padrão 220px e Ampla 290px), removendo esticamentos forçados de flexbox.",
      "Compactação da Apple Wallet: Redução da sobreposição dos cartões (-mt-12) e compactação das barras de resumo e bancos, reduzindo a altura do card em mais de 110px.",
      "Categorias sem Truncamento: Ajuste inteligente para 1 coluna à direita do Donut evitando corte precoce de nomes extensos como Combustível e Manutenção.",
      "Paleta Cupertino Midnight Slate: Unificação e harmonia no Modo Escuro (#0B0E14 fundo, #0E121B sidebar/topbar e #131824 cards), expurgando resquícios pretos e roxos.",
      "Correção Definitiva dos 4 KPIs no Modo Claro: Remoção de gradientes escuros com background-image: none, fundo #F8FAFC, títulos em slate #475569 e valores contrastados.",
      "Fundo Uniforme e Controles Segmentados: Cinza-gelo #F2F4F8 à direita da sidebar e botões inativos/ativos com contraste Apple Cupertino."
    ]
  },
  {
    version: "0.26.0",
    date: "Nov/2026",
    title: "Sprint 34: Auto-Distribuição de Altura, Arquitetura Cupertino Light 2.0 e Animações Apple Spring",
    highlights: [
      "Cabeçalho de Cards Limpo: Remoção dos botões legados (<, >, ⇈) mantendo GripVertical, botão de tamanho proporcional exato (1/3, 1/2, 2/3, 1/1) e engrenagem.",
      "Motor de Auto-Distribuição Inteligente: Cards com items-stretch e flex vertical preenchem 100% da grade Bento sem espaços ociosos.",
      "Central Analítica 2/3 com Faixa Executiva de Telemetria: 4 métricas compactas no rodapé (Média de Aporte, Melhor Mês, Rendimento Médio CDI e Projeção 12 Meses).",
      "Novo Layout de Categorias em 2 Linhas: Ícone + Nome completo + % na linha 1, Valor R$ tabular + barra suave h-1.5 na linha 2, eliminando truncamentos.",
      "Arquitetura Cupertino Light 2.0: 4 níveis de superfícies Apple, preservação dos cartões físicos virtuais (.wallet-physical-card) e View Transitions API com efeito circular circular wipe.",
      "Apple Spring Motion Engine: Animações de entrada com física de molas (cubic-bezier(0.16, 1, 0.3, 1)) e elevação tátil cupertino-card-hover."
    ]
  },
  {
    version: "0.11.0",
    date: "Out/2026",
    title: "Configurações por Gráfico, Reordenação Drag-and-Drop e Módulo Spotify Família",
    highlights: [
      "Configurações independentes por card no Dashboard (cor, curva, espessura, área, zeros, rótulos, grade e legenda).",
      "Reordenação por arrastar e soltar (GripVertical) e alternância entre meia largura (1/2) e largura total (1/1).",
      "Novo módulo Spotify Família com controle anual de cotas, destaque de atrasados/pendentes, baixa em lote em 2 toques e botão Cobrar.",
      "Persistência completa no Supabase com RLS por usuário."
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
  return raw
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/[<>]/g, "")
    .trim();
}

export function sanitizeImageSource(src?: string): string | undefined {
  if (!src) return undefined;
  const t = src.trim();
  if (t.startsWith("data:image/")) return t;
  if (t.startsWith("https://")) return sanitizeText(t);
  return undefined;
}

export function isResgateCategory(category?: string | null): boolean {
  if (!category) return false;
  const lower = category.toLowerCase().trim();
  // Se for explicitamente aporte ou investimento ou caixinha pura, nunca é resgate (AUD-17)
  if (lower.startsWith("aporte") || lower.startsWith("investimento") || lower === "caixinha") {
    return false;
  }
  return lower.includes("resgate");
}

export function normalizeStatus(st?: string, paymentMethod?: string): TxStatus {
  if (!st) return "Pago";
  const s = st.trim();
  if (s === "Pago") return "Pago";
  if (s === "Na Fatura") return "Na Fatura";
  if (s === "Pendente") return "Pendente";
  if (s === "Pendente / Na Fatura" || s.includes("Fatura")) {
    if (paymentMethod && paymentMethod.toLowerCase().includes("crédito")) return "Na Fatura";
    return "Pendente";
  }
  if (s.includes("Pendente")) {
    if (paymentMethod && paymentMethod.toLowerCase().includes("crédito")) return "Na Fatura";
    return "Pendente";
  }
  return "Pago";
}

// Motor de Datas e Calendário Seguro sem UTC Shift (Sprint 21)
export {
  todayBR,
  todayISO,
  parseDateParts,
  formatDateBR,
  toSortableISO,
  addMonthsSafe,
  addMonthsToDateBR,
  addMonthsToDateISO,
  getYearMonthKey,
  getYearMonthInfo,
  compareDatesBR,
  formatMonthShortLabelBR,
  daysInMonth,
  toCents,
  fromCents,
  safeAdd,
  safeSub,
  formatBRL,
  distributeInstallments,
  generateInstallmentSeriesId,
  calculateInvoiceAndCashMonths,
  getCardInvoiceCompetence,
  isNeutralFlow,
  isPositiveInflowDisplay,
  getEffectivePersonalAmount,
  getEffectiveCardLiabilityAmount
};

// Gerenciamento de Armazenamento por Usuário & Tombstones (Sprint 22 & 33)
export {
  getUserStorageKey,
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
  purgeAllEntityLocalCaches,
  saveImmutableSafetySnapshot,
  getImmutableSafetySnapshots,
  downloadSafetySnapshotJson,
  downloadCurrentStateJson,
  type SafetySnapshotItem
} from "./lib/domain/user-storage";

export function addMonthsToDate(dateStr: string, monthsToAdd: number): string {
  if (!dateStr) return "";
  const clean = dateStr.trim();
  if (/^\d{2}[-\/]\d{2}[-\/]\d{4}/.test(clean)) {
    return addMonthsToDateBR(clean, monthsToAdd);
  }
  return addMonthsToDateISO(clean, monthsToAdd);
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
    const partialNote =
      paid > 0 ? ` (Total: ${formatBRL(item.amount)} | Já abatido: ${formatBRL(paid)})` : "";
    return `• ${item.date.split("-").reverse().join("/")}: *${item.description}* — *${formatBRL(
      rem
    )}*${partialNote}`;
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

export interface InstallmentSeriesData {
  isInstallment: boolean;
  baseDescription: string;
  currentInstallment?: number;
  totalInstallments?: number;
  groupId?: string;
  series: Transaction[];
}

export function parseInstallmentInfo(tx: Transaction): {
  isInstallment: boolean;
  current?: number;
  total?: number;
  baseDescription: string;
} {
  const desc = tx.description || "";
  const suffixRegex = /\s*[\(\[]?\s*(\d{1,2})\s*[\/|\\]\s*(\d{1,2})\s*[\)\]]?\s*$/;
  const descMatch = desc.match(suffixRegex);

  let current: number | undefined;
  let total: number | undefined;

  if (tx.installmentInfo) {
    const infoMatch = tx.installmentInfo.match(/^(\d{1,2})\s*[\/|\\]\s*(\d{1,2})$/);
    if (infoMatch) {
      current = parseInt(infoMatch[1], 10);
      total = parseInt(infoMatch[2], 10);
    }
  }

  if (descMatch) {
    if (!current) current = parseInt(descMatch[1], 10);
    if (!total) total = parseInt(descMatch[2], 10);
  }

  const baseDescription = desc.replace(suffixRegex, "").trim();
  const isInstallment = Boolean(
    tx.installmentSeriesId ||
    tx.installmentGroupId ||
    (total && total > 1) ||
    Boolean(tx.installmentInfo && tx.installmentInfo.includes("/"))
  );

  return {
    isInstallment,
    current,
    total,
    baseDescription: baseDescription || desc
  };
}

export function getInstallmentSeries(
  targetTx: Transaction,
  allTransactions: Transaction[]
): InstallmentSeriesData {
  const parsedTarget = parseInstallmentInfo(targetTx);
  const seriesId = targetTx.installmentSeriesId || targetTx.installmentGroupId;

  if (seriesId) {
    const series = allTransactions
      .filter((t) => t.installmentSeriesId === seriesId || t.installmentGroupId === seriesId)
      .sort((a, b) => {
        const pa = parseInstallmentInfo(a);
        const pb = parseInstallmentInfo(b);
        if (pa.current && pb.current) return pa.current - pb.current;
        return compareDatesBR(a.date, b.date);
      });

    return {
      isInstallment: true,
      baseDescription: parsedTarget.baseDescription,
      currentInstallment: parsedTarget.current,
      totalInstallments: parsedTarget.total || series.length,
      groupId: seriesId,
      series: series.length > 0 ? series : [targetTx]
    };
  }

  if (!parsedTarget.isInstallment) {
    return {
      isInstallment: false,
      baseDescription: targetTx.description,
      series: [targetTx]
    };
  }

  const targetBase = parsedTarget.baseDescription.toLowerCase();
  const targetCard = targetTx.cardUsed || "";
  const targetMethod = targetTx.paymentMethod || "";

  const series = allTransactions
    .filter((t) => {
      if (t.id === targetTx.id) return true;
      const pt = parseInstallmentInfo(t);
      if (!pt.isInstallment) return false;
      if (pt.baseDescription.toLowerCase() !== targetBase) return false;
      if (t.paymentMethod !== targetMethod) return false;
      if ((t.cardUsed || "") !== targetCard) return false;
      return true;
    })
    .sort((a, b) => {
      const pa = parseInstallmentInfo(a);
      const pb = parseInstallmentInfo(b);
      if (pa.current && pb.current) return pa.current - pb.current;
      return compareDatesBR(a.date, b.date);
    });

  return {
    isInstallment: true,
    baseDescription: parsedTarget.baseDescription,
    currentInstallment: parsedTarget.current,
    totalInstallments: parsedTarget.total || series.length,
    groupId: undefined,
    series: series.length > 0 ? series : [targetTx]
  };
}

export async function hashPasswordPBKDF(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}::${password}::LIFEOS_PEPPER_v4`);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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
      let w = img.width,
        h = img.height;
      if (w > h && w > maxDim) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else if (h > maxDim) {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL("image/png", 0.88));
      }
    };
    if (typeof event.target?.result === "string") img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

/**
 * Normaliza e migra categorias legadas para o padrão oficial da Sprint 19 e 61
 */
export function migrateLegacyCategory(category?: string | null, description = ""): string {
  if (!category) return "Outros";
  const c = category.trim();
  const d = (description || "").toLowerCase();

  // SPRINT 61: Aporte / Investimento
  if (
    c === "Aporte / Investimento" ||
    c === "Aporte/Investimento" ||
    c === "Investimento" ||
    c === "Investimentos" ||
    c === "Aplicação" ||
    c === "Aplicacao" ||
    c === "Aporte"
  ) {
    return "Aporte";
  }

  // SPRINT 61: Benefícios (VA/Combustível)
  if (
    c === "Benefícios (VA/Combustível)" ||
    c === "Beneficios (VA/Combustivel)" ||
    c === "Benefícios" ||
    c === "Beneficios" ||
    c === "Benefício" ||
    c === "Beneficio" ||
    c === "Vale Alimentação" ||
    c === "Vale Alimentacao" ||
    c === "VA / VR" ||
    c === "VA/VR" ||
    c === "Cartão ECX" ||
    c === "Cartao ECX"
  ) {
    return "Alimentação";
  }

  // SPRINT 61: Manutenção Veículo
  if (
    c === "Manutenção" ||
    c === "Manutencao" ||
    c === "Manutenção Carro" ||
    c === "Manutencao Carro" ||
    c === "Oficina" ||
    c === "Manutenção Veículo" ||
    c === "Manutencao Veiculo"
  ) {
    return "Manutenção Veículo";
  }

  // SPRINT 61: Academia / Saúde
  if (
    c === "Selfiit" ||
    c === "Selfit" ||
    c === "Smartfit" ||
    c === "Smart Fit"
  ) {
    return "Academia";
  }
  if (c === "Saúde" || c === "Saude") {
    if (
      d.includes("selfiit") ||
      d.includes("selfit") ||
      d.includes("smart") ||
      d.includes("academia") ||
      d.includes("gym") ||
      d.includes("musculação") ||
      d.includes("musculacao")
    ) {
      return "Academia";
    }
  }

  // SPRINT 61: DSR / Salário / Hora Extra
  if (
    c === "DSR" ||
    c === "Hora extra 50%" ||
    c === "Hora Extra 50%" ||
    c === "Hora extra" ||
    c === "Hora Extra" ||
    c === "Salário DSR" ||
    c === "Salario DSR"
  ) {
    return "Salário";
  }

  // Moradia / Aluguel
  if (c === "Moradia / Aluguel" || c === "Moradia/Aluguel") {
    return d.includes("aluguel") || d.includes("condomínio") || d.includes("condominio") ? "Aluguel" : "Moradia";
  }

  // Alimentação / Restaurante
  if (c === "Alimentação / Restaurante" || c === "Alimentacao / Restaurante" || c === "Alimentação/Restaurante") {
    return d.includes("restaurante") || d.includes("bar") || d.includes("churrasco") || d.includes("jantar") || d.includes("almoço") || d.includes("almoco")
      ? "Restaurante"
      : "Alimentação";
  }

  // Educação / Cursos
  if (c === "Educação / Cursos" || c === "Educacao / Cursos" || c === "Educação/Cursos" || c === "Educacao/Cursos") {
    return d.includes("curso") || d.includes("udemy") || d.includes("alura") || d.includes("livro") || d.includes("bootcamp")
      ? "Cursos"
      : "Educação";
  }

  // Renomeações diretas
  if (
    c === "Gastos Pessoais / Besteiras" ||
    c === "Gastos pessoais/Besteiras" ||
    c === "Gastos Pessoais/Besteiras" ||
    c === "Gastos Pessoais / Besteira"
  ) {
    return "Gastos Pessoais";
  }
  if (
    c === "Estacionamento/Pedágio" ||
    c === "Estacionamento / Pedágio" ||
    c === "Estacionamento / Pedagio" ||
    c === "Estacionamento/Pedagio"
  ) {
    return "Estacionamento";
  }
  if (
    c === "Gasolina/Combustível" ||
    c === "Gasolina / Combustível" ||
    c === "Gasolina / Combustivel" ||
    c === "Gasolina/Combustivel" ||
    c === "Combustível (Gasolina / Etanol)" ||
    c === "Combustivel (Gasolina / Etanol)" ||
    c === "Combustível" ||
    c === "Combustivel" ||
    c === "Abastecimento Gasolina/Etanol" ||
    c === "Abastecimento Gasolina / Etanol" ||
    c === "Abastecimento" ||
    c === "Etanol" ||
    c === "Gasolina / Etanol" ||
    c === "Gasolina/Etanol" ||
    c === "Posto / Combustível" ||
    c === "Posto / Combustivel" ||
    c === "Posto"
  ) {
    return "Gasolina";
  }

  // Divisões baseadas em descrição
  if (c === "Saúde/Academia" || c === "Saúde / Academia" || c === "Saude/Academia" || c === "Saude / Academia") {
    return d.includes("academia") || d.includes("smart") || d.includes("gym") || d.includes("musculação")
      ? "Academia"
      : "Saúde";
  }
  if (
    c === "Assinaturas/Internet" ||
    c === "Assinaturas / Internet" ||
    c === "Assinatura/Internet" ||
    c === "Assinatura / Internet"
  ) {
    return d.includes("internet") || d.includes("fibra") || d.includes("wifi") || d.includes("provedor")
      ? "Internet"
      : "Assinaturas";
  }
  if (
    c === "IPVA/Licenciamento" ||
    c === "IPVA / Licenciamento" ||
    c === "Ipva/Licenciamento"
  ) {
    return d.includes("licenciamento") ? "Licenciamento" : "IPVA";
  }

  return c;
}

export function sortCategoriesAlphabetically<T extends { name: string }>(categories: T[]): T[] {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));
}

export const DEFAULT_CATEGORIES_CATALOG: CategoryCatalogItem[] = sortCategoriesAlphabetically([
  { name: "A Receber", flow: "RECEIVABLE" },
  { name: "Academia", flow: "EXPENSE" },
  { name: "Água & Gás", flow: "EXPENSE" },
  { name: "Alimentação", flow: "EXPENSE" },
  { name: "Aluguel", flow: "EXPENSE" },
  { name: "Aporte", flow: "INVESTMENT" },
  { name: "Assinaturas", flow: "EXPENSE" },
  { name: "Celular / Telefonia", flow: "EXPENSE" },
  { name: "Comissão", flow: "INCOME" },
  { name: "Cuidados Pessoais", flow: "EXPENSE" },
  { name: "Cursos", flow: "EXPENSE" },
  { name: "Delivery", flow: "EXPENSE" },
  { name: "Educação", flow: "EXPENSE" },
  { name: "Estacionamento", flow: "EXPENSE", isAuto: true },
  { name: "Farmácia", flow: "EXPENSE" },
  { name: "Gasolina", flow: "EXPENSE", isAuto: true },
  { name: "Gastos Pessoais", flow: "EXPENSE" },
  { name: "Impostos & Taxas", flow: "EXPENSE" },
  { name: "Internet", flow: "EXPENSE" },
  { name: "IPVA", flow: "EXPENSE", isAuto: true },
  { name: "Lazer", flow: "EXPENSE" },
  { name: "Licenciamento", flow: "EXPENSE", isAuto: true },
  { name: "Manutenção Veículo", flow: "EXPENSE", isAuto: true },
  { name: "Moradia", flow: "EXPENSE" },
  { name: "Pagamento de Fatura", flow: "NEUTRAL" },
  { name: "Recebimento de Empréstimo", flow: "INCOME" },
  { name: "Receita Extra", flow: "INCOME" },
  { name: "Rendimentos", flow: "INCOME" },
  { name: "Resgate", flow: "INVESTMENT" },
  { name: "Resgate Caixinha", flow: "INVESTMENT" },
  { name: "Restaurante", flow: "EXPENSE" },
  { name: "Salário", flow: "INCOME" },
  { name: "Saúde", flow: "EXPENSE" },
  { name: "Seguro", flow: "EXPENSE", isAuto: true },
  { name: "Serviços", flow: "INCOME" },
  { name: "Transferência entre Contas", flow: "NEUTRAL" },
  { name: "Transporte / Uber", flow: "EXPENSE" },
  { name: "Troca de Óleo", flow: "EXPENSE", isAuto: true }
]);

export const OFFICIAL_CATEGORIES = DEFAULT_CATEGORIES_CATALOG.map((c) => c.name);

export const DEFAULT_PAYMENT_METHODS: string[] = [
  "PIX",
  "Cartão de Débito",
  "Cartão de Crédito",
  "Cartão ECX",
  "Débito em Conta",
  "Dinheiro"
];

export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  "Salário": "#10b981",
  "Receita Extra": "#00F5D4",
  "Benefícios (VA/Combustível)": "#34d399",
  "Comissão": "#059669",
  "Serviços": "#2dd4bf",
  "Rendimentos": "#14b8a6",
  "Aporte": "#6366f1",
  "Aporte / Investimento": "#6366f1",
  "Resgate": "#f43f5e",
  "Resgate Caixinha": "#f43f5e",
  "Transferência entre Contas": "#0ea5e9",
  "Recebimento de Empréstimo": "#10b981",
  "Pagamento de Fatura": "#8b5cf6",
  "A Receber": "#f59e0b",
  "Alimentação": "#f43f5e",
  "Restaurante": "#fb7185",
  "Delivery": "#f97316",
  "Moradia": "#8b5cf6",
  "Aluguel": "#7c3aed",
  "Água & Gás": "#0284c7",
  "Celular / Telefonia": "#38bdf8",
  "Impostos & Taxas": "#e11d48",
  "Transporte / Uber": "#f59e0b",
  "Cuidados Pessoais": "#f472b6",
  "Gastos Pessoais": "#ec4899",
  "Saúde": "#06b6d4",
  "Farmácia": "#14b8a6",
  "Academia": "#14b8a6",
  "Assinaturas": "#8b5cf6",
  "Internet": "#3b82f6",
  "Lazer": "#a855f7",
  "Educação": "#0ea5e9",
  "Cursos": "#60a5fa",
  "Combustível (Gasolina / Etanol)": "#f59e0b",
  "Gasolina": "#f59e0b",
  "Manutenção": "#ea580c",
  "Manutenção Veículo": "#ea580c",
  "Troca de Óleo": "#d97706",
  "IPVA": "#e11d48",
  "Licenciamento": "#f43f5e",
  "Seguro": "#64748b",
  "Estacionamento": "#fbbf24",
  // Aliases de compatibilidade histórica
  "Moradia / Aluguel": "#8b5cf6",
  "Alimentação / Restaurante": "#f43f5e",
  "Educação / Cursos": "#0ea5e9",
  "Gastos Pessoais / Besteiras": "#ec4899",
  "Saúde/Academia": "#06b6d4",
  "Assinaturas/Internet": "#3b82f6",
  "Gasolina/Combustível": "#f59e0b",
  "IPVA/Licenciamento": "#e11d48",
  "Estacionamento/Pedágio": "#fbbf24"
};

export const DEFAULT_CHART_THEME: ChartThemeColors = {
  patrimonyLine: "#0A84FF",
  aporteLine: "#5E5CE6",
  creditUsedBar: "#FF453A",
  creditAvailableBar: "#30D158",
  odometerLine: "#FF9F0A",
  weightLine: "#30D158",
  bfLine: "#5E5CE6"
};

export const COLOR_PRESETS = [
  "#6366f1",
  "#10b981",
  "#f43f5e",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#3b82f6",
  "#14b8a6",
  "#eab308"
];

export const DEFAULT_DASHBOARD_LAYOUT: DashboardWidgetConfig[] = [
  {
    id: "thermometer",
    title: "Termômetro de Gastos Pessoais & Cota Diária",
    subtitle: "Consumo do teto mensal, cota diária livre e alocação 50/30/20",
    visible: true,
    size: "full"
  },
  {
    id: "patrimony",
    title: "Central Analítica de Patrimônio & Caixa",
    subtitle: "Evolução patrimonial c/ CDI, curva de ritmo diário e projeção de 6 meses",
    visible: true,
    size: "two-thirds"
  },
  {
    id: "wallet_limits",
    title: "Cartões & Limites",
    subtitle: "Stack de cartões físicos, faturas abertas e limites bancários",
    visible: true,
    size: "third"
  },
  {
    id: "expenses",
    title: "Despesas Mensais & Categorias Compact",
    subtitle: "Donut 03 compacto, grid de categorias e drill-down de lançamentos",
    visible: true,
    size: "half"
  },
  {
    id: "cashflow_recents",
    title: "Fluxo de Caixa & Atividades Recentes",
    subtitle: "Entradas vs Saídas últimos 6M e feed de lançamentos rápidos",
    visible: true,
    size: "half"
  },
  {
    id: "pendencies",
    title: "Radar de Pendências & Saúde Financeira",
    subtitle: "Radar poligonal de 5 eixos, fixos a lançar e contas pendentes",
    visible: true,
    size: "half"
  },
  {
    id: "benefits_strava",
    title: "Performance & Metas",
    subtitle: "Indicadores físicos e acompanhamento anual",
    visible: true,
    size: "half"
  }
];

export function normalizeDashboardLayout(layout: unknown): DashboardWidgetConfig[] {
  const legacyMap: Record<string, DashboardWidgetId> = {
    thermometer_card: "thermometer",
    patrimony_chart: "patrimony",
    wallet_card: "wallet_limits",
    credit_chart: "wallet_limits",
    bank_limits_chart: "wallet_limits",
    category_chart: "expenses",
    expenses_chart: "expenses",
    cashflow_recent: "cashflow_recents",
    pending_radar: "pendencies",
    pendencies_radar: "pendencies"
  };

  const currentList = Array.isArray(layout) ? layout : DEFAULT_DASHBOARD_LAYOUT;
  const result: DashboardWidgetConfig[] = [];
  const seen = new Set<string>();

  for (const item of currentList) {
    if (!item || typeof item !== "object") continue;
    const rawId = (item as { id?: string }).id;
    if (!rawId || rawId === "kpis") continue;
    const canonicalId = (legacyMap[rawId] || rawId) as DashboardWidgetId;

    if (seen.has(canonicalId)) continue;
    seen.add(canonicalId);

    const defaultDef = DEFAULT_DASHBOARD_LAYOUT.find((d) => d.id === canonicalId);
    if (!defaultDef && !ALL_DASHBOARD_WIDGET_IDS.includes(canonicalId as any) && canonicalId !== "benefits_strava") {
      continue;
    }

    const rawTitle = defaultDef?.title || (item as any).title || canonicalId;
    const cleanTitle = String(rawTitle)
      .replace(/\s*\(Apple Wallet\)/gi, "")
      .replace(/Apple Copilot Pure/gi, "Coindex")
      .replace(/Apple\s*/gi, "")
      .trim();

    const rawSubtitle = defaultDef?.subtitle || (item as any).subtitle || "";
    const cleanSubtitle = String(rawSubtitle)
      .replace(/\s*\(Apple Wallet\)/gi, "")
      .replace(/Apple Copilot Pure/gi, "Coindex")
      .replace(/Apple\s*/gi, "")
      .trim();

    result.push({
      id: canonicalId,
      title: cleanTitle,
      subtitle: cleanSubtitle,
      visible: (item as any).visible !== false,
      size: (item as any).size || defaultDef?.size || "half"
    });
  }

  // Auto-cura: Assegura que todos os IDs obrigatórios de ALL_DASHBOARD_WIDGET_IDS estejam presentes
  for (const reqId of ALL_DASHBOARD_WIDGET_IDS) {
    if (!seen.has(reqId)) {
      const def = DEFAULT_DASHBOARD_LAYOUT.find((d) => d.id === reqId);
      if (def) {
        result.push(def);
        seen.add(reqId);
      }
    }
  }

  // Performance & Metas se ainda não estiver presente
  if (!seen.has("benefits_strava")) {
    const def = DEFAULT_DASHBOARD_LAYOUT.find((d) => d.id === "benefits_strava");
    if (def) result.push(def);
  }

  return result;
}

/**
 * SPRINT 72: Identidade Visual Autêntica e Distinta por Banco/Cartão
 * Retorna gradiente autêntico, cor da borda, dot identificador e classes Tailwind
 * para que Nubank, Inter, Itaú, BTG e outros bancos nunca fiquem com a mesma cor.
 */
export interface CardBrandVisual {
  background: string;
  borderColor: string;
  dotColor: string;
  gradientClass: string;
}

export function getCardBrandGradient(cardName: string, bankName?: string, customColor?: string): CardBrandVisual {
  const text = `${cardName || ""} ${bankName || ""}`.toLowerCase();

  // 1. Nubank (Roxo Ultravioleta)
  if (text.includes("nubank") || text.includes("roxo") || text.includes("ultravioleta")) {
    return {
      background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 55%, #2E1065 100%)",
      borderColor: "rgba(192, 132, 252, 0.32)",
      dotColor: "#A855F7",
      gradientClass: "from-[#7C3AED] via-[#5B21B6] to-[#2E1065]"
    };
  }

  // 2. Inter (Laranja Carbono Metálico)
  if (text.includes("inter") || text.includes("laranja")) {
    return {
      background: "linear-gradient(135deg, #EA580C 0%, #C2410C 55%, #431407 100%)",
      borderColor: "rgba(251, 146, 60, 0.35)",
      dotColor: "#F97316",
      gradientClass: "from-[#EA580C] via-[#C2410C] to-[#431407]"
    };
  }

  // 3. Itaú Platinum / Personnalité / Uniclass (Azul Meia-Noite Profundo com reflexo Âmbar/Titânio)
  if (text.includes("itaú") || text.includes("itau") || text.includes("personnalite") || text.includes("uniclass")) {
    return {
      background: "linear-gradient(135deg, #1E293B 0%, #0F172A 60%, #9A3412 100%)",
      borderColor: "rgba(251, 146, 60, 0.30)",
      dotColor: "#EA580C",
      gradientClass: "from-[#1E293B] via-[#0F172A] to-[#9A3412]"
    };
  }

  // 4. BTG Pactual (Azul Imperial BTG)
  if (text.includes("btg") || text.includes("pactual")) {
    return {
      background: "linear-gradient(135deg, #1E3A8A 0%, #0F172A 65%, #020617 100%)",
      borderColor: "rgba(96, 165, 250, 0.30)",
      dotColor: "#3B82F6",
      gradientClass: "from-[#1E3A8A] via-[#0F172A] to-[#020617]"
    };
  }

  // 5. C6 / XP / Black / Carbon / Infinite (Grafite Titânio Escuro)
  if (text.includes("c6") || text.includes("xp") || text.includes("black") || text.includes("carbon") || text.includes("infinite")) {
    return {
      background: "linear-gradient(135deg, #334155 0%, #1E293B 60%, #090D16 100%)",
      borderColor: "rgba(148, 163, 184, 0.25)",
      dotColor: "#94A3B8",
      gradientClass: "from-[#334155] via-[#1E293B] to-[#090D16]"
    };
  }

  // 6. Bradesco / Santander (Vermelho Rubi Profundo)
  if (text.includes("bradesco") || text.includes("santander")) {
    return {
      background: "linear-gradient(135deg, #991B1B 0%, #7F1D1D 60%, #450A0A 100%)",
      borderColor: "rgba(248, 113, 113, 0.30)",
      dotColor: "#EF4444",
      gradientClass: "from-[#991B1B] via-[#7F1D1D] to-[#450A0A]"
    };
  }

  // Fallback seguro de titânio
  return {
    background: "linear-gradient(135deg, #1E293B 0%, #0F172A 65%, #020617 100%)",
    borderColor: "rgba(255, 255, 255, 0.15)",
    dotColor: "#0A84FF",
    gradientClass: "from-[#1E293B] via-[#0F172A] to-[#020617]"
  };
}

export const DEFAULT_AUTO_DASHBOARD_LAYOUT: DashboardWidgetConfig[] = [
  {
    id: "auto_odometer",
    title: "Evolução do Odômetro (KM)",
    subtitle: "Progressão da quilometragem a cada abastecimento ou serviço",
    visible: true,
    size: "half"
  },
  {
    id: "auto_consumption",
    title: "Consumo Real vs INMETRO (km/l)",
    subtitle: "Rendimento por abastecimento com semáforo de eficiência",
    visible: true,
    size: "half"
  },
  {
    id: "auto_fuel_monthly",
    title: "Gasto com Combustível por Mês",
    subtitle: "Histórico mensal de desembolso nos postos (R$)",
    visible: true,
    size: "half"
  },
  {
    id: "auto_price_per_liter",
    title: "Preço do Litro ao Longo do Tempo",
    subtitle: "Variação do custo por litro (R$/L) pago na bomba",
    visible: true,
    size: "half"
  }
];

export function renderCategorySemanticIcon(category: string, color: string = "currentColor") {
  const c = category.toLowerCase();
  const style = { color };
  if (c.includes("transferência") || c.includes("transferencia"))
    return <ArrowLeftRight className="w-3.5 h-3.5" style={style} />;
  if (c.includes("receber") || c.includes("recebimento")) return <HandCoins className="w-3.5 h-3.5" style={style} />;
  if (c.includes("salário") || c.includes("salario") || c.includes("comissão") || c.includes("comissao") || c.includes("rendimento") || c.includes("receita extra"))
    return <Banknote className="w-3.5 h-3.5" style={style} />;
  if (c.includes("benefício") || c.includes("beneficio") || c.includes("ecx") || c.includes("va"))
    return <CreditCard className="w-3.5 h-3.5" style={style} />;
  if (c.includes("resgate"))
    return <TrendingDown className="w-3.5 h-3.5" style={style} />;
  if (c.includes("aporte") || c.includes("investimento") || c.includes("reserva"))
    return <Landmark className="w-3.5 h-3.5" style={style} />;
  if (c.includes("delivery") || c.includes("ifood") || c.includes("entrega") || c.includes("uber eats"))
    return <Bike className="w-3.5 h-3.5" style={style} />;
  if (c.includes("farmácia") || c.includes("farmacia") || c.includes("remédio") || c.includes("remedio"))
    return <Pill className="w-3.5 h-3.5" style={style} />;
  if (c.includes("alimentação") || c.includes("alimentacao") || c.includes("mercado") || c.includes("restaurante"))
    return <Utensils className="w-3.5 h-3.5" style={style} />;
  if (c.includes("moradia") || c.includes("aluguel") || c.includes("casa"))
    return <Home className="w-3.5 h-3.5" style={style} />;
  if (c.includes("academia"))
    return <Activity className="w-3.5 h-3.5" style={style} />;
  if (c.includes("saúde") || c.includes("saude") || c.includes("médico") || c.includes("medico"))
    return <HeartPulse className="w-3.5 h-3.5" style={style} />;
  if (c.includes("internet") || c.includes("fibra"))
    return <Wifi className="w-3.5 h-3.5" style={style} />;
  if (c.includes("assinatura"))
    return <Layers className="w-3.5 h-3.5" style={style} />;
  if (c.includes("educação") || c.includes("educacao") || c.includes("faculdade") || c.includes("curso"))
    return <GraduationCap className="w-3.5 h-3.5" style={style} />;
  if (c.includes("gasolina") || c.includes("combustível") || c.includes("combustivel") || c.includes("etanol") || c.includes("posto"))
    return <Fuel className="w-3.5 h-3.5" style={style} />;
  if (c.includes("manutenção") || c.includes("manutencao") || c.includes("óleo") || c.includes("oleo") || c.includes("revisão") || c.includes("revisao"))
    return <Wrench className="w-3.5 h-3.5" style={style} />;
  if (c.includes("licenciamento"))
    return <FileCheck className="w-3.5 h-3.5" style={style} />;
  if (c.includes("ipva") || c.includes("seguro") || c.includes("estacionamento") || c.includes("veículo") || c.includes("veiculo"))
    return <Car className="w-3.5 h-3.5" style={style} />;
  if (c.includes("serviço") || c.includes("servico") || c.includes("trabalho"))
    return <Briefcase className="w-3.5 h-3.5" style={style} />;
  if (c.includes("lazer")) return <Coffee className="w-3.5 h-3.5" style={style} />;
  if (c.includes("pessoais") || c.includes("besteira") || c.includes("compra"))
    return <ShoppingBag className="w-3.5 h-3.5" style={style} />;
  return <Tag className="w-3.5 h-3.5" style={style} />;
}

export function resolveTransactionFlowType(
  tx: {
    category?: string;
    flowType?: FlowType;
    isTransfer?: boolean;
    isInvoicePayment?: boolean;
    isReceivableSettlement?: boolean;
    isSplit?: boolean;
    [key: string]: unknown;
  },
  catalog = DEFAULT_CATEGORIES_CATALOG
): FlowType {
  if (tx.isTransfer || tx.isInvoicePayment || tx.isReceivableSettlement) return "NEUTRAL";
  if (tx.flowType) return tx.flowType;

  const cat = (tx.category || "").trim().toLowerCase();
  if (
    cat.includes("transferência") ||
    cat.includes("transferencia") ||
    cat.includes("pagamento de fatura") ||
    cat.includes("pagamento fatura")
  ) {
    return "NEUTRAL";
  }
  if (
    cat.includes("recebimento de empréstimo") ||
    cat.includes("recebimento de emprestimo")
  ) {
    return "INCOME";
  }
  if (cat === "a receber" || cat.includes("a receber")) {
    return "RECEIVABLE";
  }
  const found = catalog.find((c) => c.name.toLowerCase() === cat);
  if (found) return found.flow;

  if (
    cat.includes("salário") ||
    cat.includes("salario") ||
    cat.includes("comissão") ||
    cat.includes("comissao") ||
    cat.includes("serviços") ||
    cat.includes("servicos") ||
    cat.includes("rendimentos") ||
    cat.includes("benefícios") ||
    cat.includes("beneficios") ||
    cat.includes("receita extra")
  ) {
    return "INCOME";
  }
  if (cat.includes("aporte") || cat.includes("investimento") || cat.includes("reserva") || cat.includes("resgate")) {
    return "INVESTMENT";
  }
  return "EXPENSE";
}

export function getAutomaticStatus(method: PaymentMethod, category?: string): TxStatus {
  if (category === "A Receber") return "Pendente";
  if (method === "Cartão de Crédito") return "Na Fatura";
  return "Pago";
}

export const INITIAL_BANKS: (BankInstitution & BankItem)[] = [
  { id: "b1", name: "Nubank", accountType: "Conta Digital", color: "#820ad1", limit: 4500, limitType: "Cartão de Crédito" },
  { id: "b2", name: "Inter", accountType: "Conta Digital", color: "#ff7a00", limit: 3000, limitType: "Cartão de Crédito" },
  { id: "b3", name: "BTG Pactual", accountType: "Investimentos", color: "#001e62", limit: 0, limitType: "Global" }
];

export const INITIAL_CARDS: CreditCardItem[] = [
  { id: "c1", name: "Nubank Ultravioleta", brand: "Mastercard Black", limit: 4500, closingDay: 25, dueDay: 2, bankId: "b1", bankName: "Nubank" },
  { id: "c2", name: "Inter Black", brand: "Mastercard Black", limit: 3000, closingDay: 10, dueDay: 17, bankId: "b2", bankName: "Inter" }
];

export interface PatrimonioImportItem {
  id: string;
  date: string;
  operation: "Aporte" | "Resgate";
  institution: string;
  modality: string;
  amount: number;
  notes?: string;
}

export const PATRIMONIO_IMPORT_DATA: PatrimonioImportItem[] = [
  { id: "patrimonio-import-01", date: "2025-12-09", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 999.99, notes: "Aporte inicial Caixinha Turbo" },
  { id: "patrimonio-import-02", date: "2025-12-09", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 1.00, notes: "" },
  { id: "patrimonio-import-03", date: "2025-12-10", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 624.71, notes: "" },
  { id: "patrimonio-import-04", date: "2025-12-18", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 558.47, notes: "" },
  { id: "patrimonio-import-05", date: "2025-12-18", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 80.00, notes: "" },
  { id: "patrimonio-import-06", date: "2025-12-22", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 5.00, notes: "" },
  { id: "patrimonio-import-07", date: "2025-12-23", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 97.83, notes: "" },
  { id: "patrimonio-import-08", date: "2025-12-23", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 5.00, notes: "" },
  { id: "patrimonio-import-09", date: "2025-12-29", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 50.00, notes: "" },
  { id: "patrimonio-import-10", date: "2026-01-04", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 20.00, notes: "" },
  { id: "patrimonio-import-11", date: "2026-01-06", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 250.00, notes: "" },
  { id: "patrimonio-import-12", date: "2026-01-16", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 200.00, notes: "" },
  { id: "patrimonio-import-13", date: "2026-01-24", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 500.00, notes: "" },
  { id: "patrimonio-import-14", date: "2026-01-28", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 500.00, notes: "" },
  { id: "patrimonio-import-15", date: "2026-01-28", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 500.00, notes: "" },
  { id: "patrimonio-import-16", date: "2026-02-11", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 461.70, notes: "" },
  { id: "patrimonio-import-17", date: "2026-02-27", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 500.00, notes: "" },
  { id: "patrimonio-import-18", date: "2026-03-07", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 605.04, notes: "" },
  { id: "patrimonio-import-19", date: "2026-03-12", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 1083.09, notes: "" },
  { id: "patrimonio-import-20", date: "2026-03-26", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 50.74, notes: "" },
  { id: "patrimonio-import-21", date: "2026-04-01", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 1284.90, notes: "" },
  { id: "patrimonio-import-22", date: "2026-04-02", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 300.00, notes: "" },
  { id: "patrimonio-import-23", date: "2026-04-06", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 527.01, notes: "" },
  { id: "patrimonio-import-24", date: "2026-04-07", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 447.04, notes: "" },
  { id: "patrimonio-import-25", date: "2026-04-09", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 2287.87, notes: "" },
  { id: "patrimonio-import-26", date: "2026-04-11", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 99.37, notes: "" },
  { id: "patrimonio-import-27", date: "2026-04-17", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 400.00, notes: "" },
  { id: "patrimonio-import-28", date: "2026-05-04", operation: "Aporte", institution: "BTG Pactual", modality: "Caixinha Turbo (115% CDI)", amount: 50.48, notes: "" },
  { id: "patrimonio-import-29", date: "2026-05-06", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 800.00, notes: "" },
  { id: "patrimonio-import-30", date: "2026-05-06", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 32.09, notes: "" },
  { id: "patrimonio-import-31", date: "2026-05-12", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 700.00, notes: "" },
  { id: "patrimonio-import-32", date: "2026-05-29", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 215.00, notes: "" },
  { id: "patrimonio-import-33", date: "2026-06-01", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 300.00, notes: "" },
  { id: "patrimonio-import-34", date: "2026-06-04", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 280.49, notes: "" },
  { id: "patrimonio-import-35", date: "2026-06-15", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 66.63, notes: "" },
  { id: "patrimonio-import-36", date: "2026-06-22", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 40.90, notes: "" },
  { id: "patrimonio-import-37", date: "2026-07-04", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 99.57, notes: "" },
  { id: "patrimonio-import-38", date: "2026-07-09", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 43.78, notes: "" },
  { id: "patrimonio-import-39", date: "2026-07-15", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 23.57, notes: "" },
  { id: "patrimonio-import-40", date: "2026-07-16", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 482.10, notes: "" },
  { id: "patrimonio-import-41", date: "2026-07-17", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 329.00, notes: "" },
  { id: "patrimonio-import-42", date: "2026-07-28", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 290.00, notes: "" },
  { id: "patrimonio-import-43", date: "2026-08-06", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 222.85, notes: "" },
  { id: "patrimonio-import-44", date: "2026-08-06", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 346.00, notes: "" },
  { id: "patrimonio-import-45", date: "2026-08-13", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 200.00, notes: "" },
  { id: "patrimonio-import-46", date: "2026-08-25", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 100.00, notes: "" },
  { id: "patrimonio-import-47", date: "2026-08-29", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 100.00, notes: "" },
  { id: "patrimonio-import-48", date: "2026-09-02", operation: "Resgate", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 126.83, notes: "" },
  { id: "patrimonio-import-49", date: "2026-09-03", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 600.00, notes: "" },
  { id: "patrimonio-import-50", date: "2026-09-05", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 70.25, notes: "" },
  { id: "patrimonio-import-51", date: "2026-09-05", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 62.66, notes: "" },
  { id: "patrimonio-import-52", date: "2026-09-10", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 152.37, notes: "" },
  { id: "patrimonio-import-53", date: "2026-09-10", operation: "Resgate", institution: "BTG Pactual", modality: "Caixinha Turbo (115% CDI)", amount: 50.48, notes: "" },
  { id: "patrimonio-import-54", date: "2026-09-10", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 182.97, notes: "" },
  { id: "patrimonio-import-55", date: "2026-09-22", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 260.00, notes: "" },
  { id: "patrimonio-import-56", date: "2026-10-06", operation: "Aporte", institution: "Nubank", modality: "Caixinha Turbo (115% CDI)", amount: 630.31, notes: "" }
];

export function convertPatrimonioItemToTransaction(item: PatrimonioImportItem): Transaction {
  const isAporte = item.operation === "Aporte";
  const desc = item.notes?.trim()
    ? item.notes.trim()
    : `${item.operation} ${item.modality} (${item.institution})`;

  return {
    id: item.id,
    date: item.date,
    description: desc,
    amount: item.amount,
    category: isAporte ? "Aporte / Investimento" : "Resgate",
    costType: isAporte ? "Fixo" : "Variável",
    paymentMethod: "PIX",
    bankAccount: item.institution,
    status: "Pago",
    indexer: item.modality,
    cdiPercentage: 115,
    notes: item.notes || undefined,
    updatedAt: `${item.date}T12:00:00Z`
  };
}

export const PATRIMONIO_IMPORT_TRANSACTIONS: Transaction[] = PATRIMONIO_IMPORT_DATA.map(
  convertPatrimonioItemToTransaction
);

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "tx-0", date: "05-09-2026", description: "Salário Líquido ACS (Setembro)", amount: 2071.81, category: "Salário", costType: "Fixo", paymentMethod: "PIX", status: "Pago", updatedAt: "2026-09-05T08:00:00Z" },
  { id: "tx-0c", date: "12-09-2026", description: "Despesas Gerais Setembro", amount: 1620.0, category: "Alimentação", costType: "Variável", paymentMethod: "Cartão ECX", status: "Pago", updatedAt: "2026-09-12T08:00:00Z" },
  { id: "tx-1", date: "05-10-2026", description: "Salário Líquido ACS Sistemas", amount: 2071.81, category: "Salário", costType: "Fixo", paymentMethod: "PIX", status: "Pago", updatedAt: "2026-10-05T08:00:00Z" },
  { id: "tx-2", date: "05-10-2026", description: "Auxílio Combustível + VA ACS", amount: 1365.0, category: "Benefícios (VA/Combustível)", costType: "Fixo", paymentMethod: "Cartão ECX", status: "Pago", updatedAt: "2026-10-05T08:00:00Z" },
  { id: "tx-4", date: "07-10-2026", description: "Mensalidade Academia", amount: 82.4, category: "Academia", costType: "Fixo", paymentMethod: "Cartão de Crédito", cardUsed: "Nubank Ultravioleta", status: "Pendente / Na Fatura", updatedAt: "2026-10-07T08:00:00Z" },
  { id: "tx-5", date: "08-10-2026", description: "Internet Fibra Residencial", amount: 68.17, category: "Internet", costType: "Fixo", paymentMethod: "PIX", status: "Pago", updatedAt: "2026-10-08T08:00:00Z" },
  { id: "tx-6", date: "09-10-2026", description: "Supermercado (Dieta da Semana)", amount: 618.0, category: "Alimentação", costType: "Variável", paymentMethod: "Cartão ECX", status: "Pago", updatedAt: "2026-10-09T08:00:00Z" },
  { id: "tx-7", date: "10-10-2026", description: "Abastecimento Gasolina Comum", amount: 260.0, category: "Gasolina", costType: "Variável", paymentMethod: "Cartão ECX", status: "Pago", km: 48200, liters: 44.1, updatedAt: "2026-10-10T08:00:00Z" },
  { id: "tx-8", date: "11-10-2026", description: "Troca de Óleo Sintético + Filtro", amount: 310.0, category: "Troca de Óleo", costType: "Variável", paymentMethod: "Cartão de Crédito", cardUsed: "Inter Black", status: "Pendente / Na Fatura", km: 48520, updatedAt: "2026-10-11T08:00:00Z" },
  { id: "tx-9", date: "12-10-2026", description: "Camisa Minimalista + Corte de Cabelo", amount: 185.0, category: "Gastos Pessoais", costType: "Variável", paymentMethod: "Cartão de Crédito", cardUsed: "Nubank Ultravioleta", status: "Pendente / Na Fatura", updatedAt: "2026-10-12T08:00:00Z" },
  { id: "tx-10", date: "15-10-2026", description: "Abastecimento Rotina ACS", amount: 245.0, category: "Gasolina", costType: "Variável", paymentMethod: "Cartão ECX", status: "Pago", km: 48890, liters: 41.5, updatedAt: "2026-10-15T08:00:00Z" },
  { id: "tx-11", date: "16-10-2026", description: "Compra Passada no Cartão (Fone Bluetooth)", amount: 220.0, category: "A Receber", costType: "Variável", paymentMethod: "Cartão de Crédito", cardUsed: "Nubank Ultravioleta", status: "Pendente / Na Fatura", debtor: "Lucas (Primo)", paidAmount: 70, updatedAt: "2026-10-16T08:00:00Z" },
  { id: "tx-12", date: "17-10-2026", description: "Empréstimo PIX Combustível", amount: 150.0, category: "A Receber", costType: "Variável", paymentMethod: "PIX", status: "Pago", debtor: "Matheus (ACS)", paidAmount: 150, updatedAt: "2026-10-17T08:00:00Z" }
];

export const INITIAL_DEBTOR_MAP: Record<string, string> = {
  "tx-11": "Lucas (Primo)",
  "tx-12": "Matheus (ACS)"
};

export const INITIAL_STATIC_STATUS: StaticStatusItem[] = [
  { id: "st-1", title: "Salário Líquido Base (ACS)", type: "Renda Base", amount: 2071.81, notes: "Crédito no 5º dia útil" },
  { id: "st-2", title: "Vale Alimentação (Cartão ECX)", type: "Benefício", amount: 624.0, notes: "Benefício alimentação" },
  { id: "st-3", title: "Auxílio Combustível", type: "Benefício", amount: 741.0, notes: "Deslocamento diário" },
  { id: "st-4", title: "Aporte Programado (70% Salário)", type: "Meta Aporte", amount: 1450.0, notes: "Prioridade nº 1 do mês" },
  { id: "st-5", title: "Mensalidade Academia", type: "Custo Fixo", amount: 82.4, notes: "Recorrente no cartão" },
  { id: "st-6", title: "Plano Internet Fibra", type: "Custo Fixo", amount: 68.17, notes: "Pagamento mensal" }
];

export const INITIAL_MILESTONES: ChartMilestone[] = [
  { id: "ms-1", label: "Teto Caixinha Turbo Nubank (5k)", value: 5000, color: "#a85f7" },
  { id: "ms-2", label: "1º Marco Reserva de Segurança (10k)", value: 10000, color: "#10b981" }
];

export const INITIAL_WISHLIST: WishlistItem[] = [
  { id: "w-1", title: "Caixinha Turbo (115% CDI)", institution: "Nubank", targetAmount: 5000, savedAmount: 2616.61, priority: "Alta" },
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
  {
    id: "n-1",
    date: "2026-10-14",
    title: "Automação de Relatórios SQL",
    content: "Criar view parametrizada para cruzar chamados recorrentes e reduzir retrabalho na ACS.",
    description: "Criar view parametrizada para cruzar chamados recorrentes e reduzir retrabalho na ACS.",
    tag: "#TrabalhoACS",
    itemType: "note",
    completed: false
  },
  {
    id: "n-2",
    date: "2026-10-15",
    title: "Ideia para o Aplicativo Mobile",
    content: "Criar atalho rápido para registrar abastecimento direto no posto pelo celular.",
    description: "Criar atalho rápido para registrar abastecimento direto no posto pelo celular.",
    tag: "#Ideias",
    itemType: "note",
    completed: false
  },
  {
    id: "n-3",
    date: "2026-10-16",
    title: "Revisão de DAX e Power BI",
    content: "Praticar funções CALCULATE, DATESYTD e inteligência de dados temporais neste fim de semana.",
    description: "Praticar funções CALCULATE, DATESYTD e inteligência de dados temporais neste fim de semana.",
    tag: "#Estudos",
    itemType: "note",
    completed: true,
    completedAt: "2026-10-18"
  },
  {
    id: "w-1",
    date: "2026-10-18",
    title: "Monitor Ultrawide 34 LG Curvo",
    content: "Upgrade de produtividade para desenvolvimento e análise de dados.",
    description: "Upgrade de produtividade para desenvolvimento e análise de dados.",
    tag: "#Ideias",
    itemType: "wish",
    price: 2199.9,
    priority: "Planejado",
    storeUrl: "https://www.kabum.com.br",
    completed: false
  },
  {
    id: "w-2",
    date: "2026-10-20",
    title: "Teclado Mecânico Ergonômico",
    content: "Switches brown silenciosos para digitação contínua e sem fadiga.",
    description: "Switches brown silenciosos para digitação contínua e sem fadiga.",
    tag: "#Pessoal",
    itemType: "wish",
    price: 450.0,
    priority: "Desejo",
    completed: true,
    completedAt: "2026-10-22"
  },
  {
    id: "w-3",
    date: "2026-10-22",
    title: "Fone com Cancelamento de Ruído Sony",
    content: "Foco profundo para estudo e trabalho em home office.",
    description: "Foco profundo para estudo e trabalho em home office.",
    tag: "#Estudos",
    itemType: "wish",
    price: 1250.0,
    priority: "Essencial",
    storeUrl: "https://www.amazon.com.br",
    completed: false
  }
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

interface TooltipPayloadEntry {
  name?: string;
  value?: number | string;
  color?: string;
  fill?: string;
}

interface CustomCyberTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  isCurrency?: boolean;
  moneyBlur?: string;
}

export function CustomCyberTooltip({
  active,
  payload,
  label,
  isCurrency = true,
  moneyBlur = ""
}: CustomCyberTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const displayLabel = label && /^\d{4}[-/]\d{2}[-/]\d{2}/.test(label) ? formatDateBR(label) : label;
  return (
    <div className="bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] shadow-[var(--cupertino-shadow)] backdrop-blur-md rounded-xl px-3.5 py-2.5 text-xs space-y-1">
      {displayLabel && <p className="font-semibold text-slate-300 border-b border-white/10 pb-1 mb-1">{displayLabel}</p>}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color ? entry.color : entry.fill ? entry.fill : "#6366f1" }}
            />
            {entry.name}:
          </span>
          <strong className={`text-white font-mono tabular-nums ${moneyBlur}`}>
            {isCurrency ? formatBRL(Number(entry.value)) : entry.value}
          </strong>
        </div>
      ))}
    </div>
  );
}

export function normalizeSearchText(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function evaluateMathExpression(input: string): string {
  if (!input || !input.trim()) return "";
  let expr = input.trim();
  expr = expr.replace(/\s+/g, " ");
  // Remove separadores de milhar pt-BR seguidos de 3 dígitos (AUD-03)
  expr = expr.replace(/\.(?=\d{3}(?:[.,+\-*/\s)]|$))/g, "").replace(/,/g, ".");
  
  if (/^[0-9]+(\.[0-9]+)?$/.test(expr)) {
    const n = parseFloat(expr);
    return isNaN(n) ? input : n.toFixed(2);
  }

  if (!/^[0-9+\-*/.()\s]+$/.test(expr)) {
    return input;
  }

  try {
    const fn = new Function(`"use strict"; return (${expr});`);
    const val = fn();
    if (typeof val === "number" && !isNaN(val) && isFinite(val) && val >= 0) {
      return val.toFixed(2);
    }
  } catch {
    // Retorna original se inválido
  }
  return input;
}

export function ThemeSegmentedControl({
  themeMode,
  onChange
}: {
  themeMode: ThemeMode;
  onChange: (m: ThemeMode) => void;
}) {
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

// ============================================================================
// SELETORES DERIVADOS PUROS (SSOT - Sprint 10 - Lucas Viana)
// Matemática operando estritamente em centavos inteiros (safeAdd / safeSub).
// ============================================================================

export interface CardExposure {
  cardName: string;
  limit: number;
  used: number; // Valor da fatura da competência atual (ou pendente)
  available: number; // Limite real restante descontando todo o comprometimento
  usagePercent: number;
  currentInvoice: number;
  futureInstallmentsBlocked: number;
  totalCommitted: number;
  currentInvoiceAmount?: number;
  totalCommittedLimit?: number;
}

export function calculateCardExposure(
  card: CreditCardItem,
  transactions: Transaction[],
  selectedMonth?: string
): CardExposure {
  const cardLimit = card.limit ?? 0;

  const isMatchingCard = (t: Transaction) =>
    !t.isSplitChild &&
    !t.deletedAt &&
    (t.cardUsed === card.name || (t.cardId && card.id && t.cardId === card.id)) &&
    (t.paymentMethod === "Cartão de Crédito" || Boolean(t.invoiceMonth));

  const refMonth =
    selectedMonth && selectedMonth !== "ALL" && /^\d{4}-\d{2}$/.test(selectedMonth)
      ? selectedMonth
      : "2026-11";

  // Transações não pagas do cartão
  const unpaidTxs = transactions.filter((t) => isMatchingCard(t) && t.status !== "Pago");

  let currentInvoiceCents = 0;
  let futureBlockedCents = 0;

  unpaidTxs.forEach((t) => {
    const comp = t.invoiceMonth || getCardInvoiceCompetence(t.date, card.closingDay, card.dueDay);
    const liability = getEffectiveCardLiabilityAmount(t);
    if (comp > refMonth) {
      futureBlockedCents += toCents(liability);
    } else {
      currentInvoiceCents += toCents(liability);
    }
  });

  const currentInvoice = fromCents(currentInvoiceCents);
  const futureInstallmentsBlocked = fromCents(futureBlockedCents);
  const totalCommitted = safeAdd(currentInvoice, futureInstallmentsBlocked);
  const available = Math.max(0, safeSub(cardLimit, totalCommitted));
  const usagePercent =
    cardLimit > 0
      ? Math.min(100, Math.max(0, Math.round((totalCommitted / cardLimit) * 100)))
      : 0;

  return {
    cardName: card.name,
    limit: cardLimit,
    used: currentInvoice,
    available,
    usagePercent,
    currentInvoice,
    futureInstallmentsBlocked,
    totalCommitted,
    currentInvoiceAmount: currentInvoice,
    totalCommittedLimit: totalCommitted
  };
}

export interface BankExposure {
  bankId: string;
  bankName: string;
  limit: number;
  used: number;
  available: number;
  linkedCardNames: string[];
}

export function calculateBankExposure(
  bank: BankItem,
  cards: CreditCardItem[],
  transactions: Transaction[]
): BankExposure {
  const bankCards = cards.filter((c) => c.bankId === bank.id);
  const calcLimit =
    bank.limit != null && bank.limit >= 0
      ? bank.limit
      : safeAdd(...bankCards.map((c) => c.limit ?? 0));
  const cardNames = new Set(bankCards.map((c) => c.name));
  const used = safeAdd(
    ...transactions
      .filter(
        (t) =>
          !t.isSplitChild &&
          !t.deletedAt &&
          (cardNames.has(t.cardUsed || "") ||
            (t.paymentMethod === "Cartão de Crédito" &&
              t.cardUsed?.toLowerCase().includes(bank.name.toLowerCase()))) &&
          t.status !== "Pago"
      )
      .map((t) => getEffectiveCardLiabilityAmount(t))
  );
  const available = Math.max(0, safeSub(calcLimit, used));
  return {
    bankId: bank.id,
    bankName: bank.name,
    limit: calcLimit,
    used,
    available,
    linkedCardNames: Array.from(cardNames)
  };
}

/**
 * Calcula o saldo real de uma conta bancária (Sprint 12 - Regra Contábil Estrita)
 * - Entradas confirmadas somam (+)
 * - Despesas diretas confirmadas (PIX/débito) subtraem (-)
 * - Aportes subtraem (-), Resgates somam (+)
 * - Transferências: subtrai se for o banco de origem (-), soma se for o banco de destino (+)
 */
export function calculateBankBalance(
  bank: BankItem,
  transactions: Transaction[],
  getFlowType: (cat: string) => FlowType
): number {
  let balanceCents = 0;
  const bName = bank.name.toLowerCase();

  for (const t of transactions) {
    if (t.status !== "Pago") continue;
    if (t.isSplitChild) continue;

    if (t.isTransfer || t.category === "Transferência entre Contas") {
      const isSource =
        (t.sourceBank && t.sourceBank.toLowerCase() === bName) ||
        (!t.sourceBank && t.bankAccount && t.bankAccount.toLowerCase() === bName);
      const isDest = t.destinationBank && t.destinationBank.toLowerCase() === bName;

      if (isSource && !isDest) {
        balanceCents -= toCents(t.amount);
      } else if (isDest && !isSource) {
        balanceCents += toCents(t.amount);
      }
      continue;
    }

    if (t.isInvoicePayment || t.category === "Pagamento de Fatura") {
      const isPaidByThisBank =
        (t.bankAccount && t.bankAccount.toLowerCase() === bName) ||
        (t.sourceBank && t.sourceBank.toLowerCase() === bName);
      if (isPaidByThisBank) {
        balanceCents -= toCents(t.amount);
      }
      continue;
    }

    if (t.isReceivableSettlement || t.category === "Recebimento de Empréstimo") {
      const isReceivedInThisBank =
        (t.bankAccount && t.bankAccount.toLowerCase() === bName) ||
        (t.destinationBank && t.destinationBank.toLowerCase() === bName);
      if (isReceivedInThisBank) {
        balanceCents += toCents(t.amount);
      }
      continue;
    }

    const isThisBank =
      (t.bankAccount && t.bankAccount.toLowerCase() === bName) ||
      (!t.bankAccount && t.cardUsed && t.cardUsed.toLowerCase().includes(bName));

    if (!isThisBank) continue;

    const flow = t.flowType || getFlowType(t.category);
    if (flow === "INCOME") {
      balanceCents += toCents(t.amount);
    } else if (flow === "EXPENSE") {
      if (t.paymentMethod !== "Cartão de Crédito") {
        balanceCents -= toCents(t.amount);
      }
    } else if (flow === "INVESTMENT") {
      if (isResgateCategory(t.category)) {
        balanceCents += toCents(t.amount);
      } else {
        balanceCents -= toCents(t.amount);
      }
    }
  }

  return fromCents(balanceCents);
}

export interface PatrimonyDataPoint {
  month: string;
  label: string;
  aportado: number;
  acumulado: number;
  resgatado?: number;
  capitalAportadoPuro?: number;
  rendimentoBruto?: number;
  rendimentoLiquido?: number;
  acumuladoComRendimento?: number;
  [key: string]: unknown;
}

const MONTH_NAMES_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export function formatMonthShortLabel(ym: string): string {
  const [yearStr, monthStr] = ym.split("-");
  const monthIdx = parseInt(monthStr, 10) - 1;
  const shortMonth = MONTH_NAMES_SHORT[monthIdx] || monthStr;
  const shortYear = yearStr ? yearStr.slice(2) : "";
  return `${shortMonth}/${shortYear}`;
}

export interface PatrimonyEvolutionResult {
  data: PatrimonyDataPoint[];
  hasDeficit: boolean;
  deficitAmount: number;
  totalAportes: number;
  totalResgates: number;
  saldoFinal: number;
  currentCapitalAportado?: number;
  grossYieldAccumulated?: number;
  netYieldEstimated?: number;
  saldoComRendimentoBruto?: number;
  saldoComRendimentoLiquido?: number;
  cdiAnnualRateUsed?: number;
  appliedCdiPercentage?: number;
  manualAdjustmentApplied?: number;
}

export function calculatePatrimonyEvolution(
  transactions: Transaction[],
  baseHistorical = HISTORICAL_INVESTMENTS,
  initialReserveBalance: number = 0,
  yieldConfig?: InvestmentYieldConfig
): PatrimonyEvolutionResult {
  const investTxs = transactions.filter((t) => {
    if (t.isSplitChild || t.deletedAt) return false;
    const c = t.category.toLowerCase();
    return (
      c.includes("aporte") ||
      c.includes("investimento") ||
      c.includes("resgate") ||
      c.includes("caixinha")
    );
  });

  const totAportes = safeAdd(
    ...investTxs.filter((t) => !isResgateCategory(t.category)).map((t) => t.amount)
  );
  const totResgates = safeAdd(
    ...investTxs.filter((t) => isResgateCategory(t.category)).map((t) => t.amount)
  );

  let hasOverallDeficit = false;
  let maxDeficit = 0;
  const totalCapacity = safeAdd(totAportes, initialReserveBalance);
  if (totResgates > totalCapacity) {
    hasOverallDeficit = true;
    maxDeficit = safeSub(totResgates, totalCapacity);
  }

  const hasEarlyHistory = investTxs.some((t) => getYearMonthKey(t.date) < "2026-05");

  // Se houver lançamentos de investimento (histórico real), aciona o motor puro de cálculo de rendimentos CDI
  if (hasEarlyHistory || investTxs.length > 0) {
    const yieldResult = calculatePortfolioCdiYield(investTxs, yieldConfig, initialReserveBalance);
    return {
      data: yieldResult.data,
      hasDeficit: yieldResult.hasDeficit,
      deficitAmount: yieldResult.deficitAmount,
      totalAportes: yieldResult.totalAportes,
      totalResgates: yieldResult.totalResgates,
      saldoFinal: yieldResult.saldoFinal,
      currentCapitalAportado: yieldResult.currentCapitalAportado,
      grossYieldAccumulated: yieldResult.grossYieldAccumulated,
      netYieldEstimated: yieldResult.netYieldEstimated,
      saldoComRendimentoBruto: yieldResult.saldoComRendimentoBruto,
      saldoComRendimentoLiquido: yieldResult.saldoComRendimentoLiquido,
      cdiAnnualRateUsed: yieldResult.cdiAnnualRateUsed,
      appliedCdiPercentage: yieldResult.appliedCdiPercentage,
      manualAdjustmentApplied: yieldResult.manualAdjustmentApplied
    };
  }

  if (investTxs.length === 0 && initialReserveBalance <= 0) {
    if (baseHistorical.length > 0) {
      const enrichedBase: PatrimonyDataPoint[] = baseHistorical.map((b) => ({
        ...b,
        capitalAportadoPuro: b.acumulado,
        rendimentoBruto: 0,
        rendimentoLiquido: 0,
        acumuladoComRendimento: b.acumulado
      }));
      const last = enrichedBase[enrichedBase.length - 1];
      const val = last?.acumulado || 8200;
      return {
        data: enrichedBase,
        hasDeficit: false,
        deficitAmount: 0,
        totalAportes: totAportes,
        totalResgates: totResgates,
        saldoFinal: val,
        currentCapitalAportado: val,
        grossYieldAccumulated: 0,
        netYieldEstimated: 0,
        saldoComRendimentoBruto: val,
        saldoComRendimentoLiquido: val
      };
    }

    return {
      data: [],
      hasDeficit: false,
      deficitAmount: 0,
      totalAportes: 0,
      totalResgates: 0,
      saldoFinal: 0,
      currentCapitalAportado: 0,
      grossYieldAccumulated: 0,
      netYieldEstimated: 0,
      saldoComRendimentoBruto: 0,
      saldoComRendimentoLiquido: 0
    };
  }

  const todayKey = getYearMonthKey(todayBR());
  return {
    data: [
      {
        month: todayKey,
        label: formatMonthShortLabel(todayKey),
        aportado: 0,
        acumulado: initialReserveBalance,
        resgatado: 0,
        capitalAportadoPuro: initialReserveBalance,
        rendimentoBruto: 0,
        rendimentoLiquido: 0,
        acumuladoComRendimento: initialReserveBalance
      }
    ],
    hasDeficit: false,
    deficitAmount: 0,
    totalAportes: 0,
    totalResgates: 0,
    saldoFinal: initialReserveBalance,
    currentCapitalAportado: initialReserveBalance,
    grossYieldAccumulated: 0,
    netYieldEstimated: 0,
    saldoComRendimentoBruto: initialReserveBalance,
    saldoComRendimentoLiquido: initialReserveBalance
  };
}

export interface StaticStatusSummary {
  rendaBase: number;
  custoFixoBase: number;
  aporteBase: number;
  margemLivre: number;
}

export function calculateStaticStatusSummary(items: StaticStatusItem[]): StaticStatusSummary {
  const rendaBase = safeAdd(
    ...items.filter((i) => i.type === "Renda Base" || i.type === "Benefício").map((i) => i.amount)
  );
  const custoFixoBase = safeAdd(
    ...items.filter((i) => i.type === "Custo Fixo").map((i) => i.amount)
  );
  const aporteBase = safeAdd(
    ...items.filter((i) => i.type === "Meta Aporte").map((i) => i.amount)
  );
  const margemLivre = safeSub(rendaBase, safeAdd(custoFixoBase, aporteBase));
  return {
    rendaBase,
    custoFixoBase,
    aporteBase,
    margemLivre
  };
}
export function calculateSplitAmounts(totalAmount: number, thirdPartyAmount: number): {
  personalAmount: number;
  thirdPartyAmount: number;
} {
  const cleanTotal = Math.max(0, Number(totalAmount) || 0);
  const cleanThird = Math.max(0, Math.min(cleanTotal, Number(thirdPartyAmount) || 0));
  const personal = safeSub(cleanTotal, cleanThird);
  return {
    personalAmount: personal,
    thirdPartyAmount: cleanThird
  };
}
