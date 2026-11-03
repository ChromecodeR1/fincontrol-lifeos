# RAIO-X TÉCNICO COINDEX (DOSSIÊ COMPLETO DO SISTEMA)
> **Versão da Aplicação:** `0.29.0`  
> **Última Atualização:** 3 de Novembro de 2026 (Pós-Sprint 38 — Correção da Digitação de Data no TransactionModal, Reforma Slim de Valores a Receber e Central Analítica de Bioimpedância & Strava Progress)  
> **Propósito:** Fonte única da verdade (SSOT) técnica, arquitetural, contábil e de interface para sincronização contínua de contexto entre engenheiros e agentes de IA.

---

## 1. Visão Geral da Arquitetura & Stack Tecnológica

O **Coindex** é uma plataforma corporativa e pessoal de Business Intelligence (BI) financeiro, telemetria patrimonial, gestão de cartões de crédito e telemetria automotiva, construída sob a estética **Apple Copilot Pure — Cupertino Light & Dark** e princípios de Human Interface Design da Apple com inspiração no Copilot Money.

### Stack Base:
- **Framework:** Next.js 16.4.2 (App Router, Turbopack, Cache Components, Partial Prefetching).
- **Linguagem:** TypeScript 5 (Modo Estrito / Strict Mode habilitado).
- **Estilização & Design System:** Tailwind CSS v4 com temas dinâmicos Dual Theme Cupertino (Claro e Escuro via `data-theme`), Glassmorphism, scrollbars personalizadas discretas estilo macOS, tipografia tabular global (`tabular-nums`) e precisão óptica OpenType (`cv02-cv11`).
- **Visualização de Dados:** Recharts 2.x com Tooltips Cupertino Glassmorphism customizados, eixos travados no zero, área translúcida fluida estilo Copilot Money e supressão global de cursores e halos de foco brancos via CSS.
- **Backend & Persistência:**
  - Supabase PostgreSQL com Row Level Security (RLS) por usuário autenticado e isolamento de cache local por `userId`.
  - Sincronização offline-first: Hidratação instantânea via cache local (`localStorage`), migração automática no 1º acesso e espelhamento bidirecional resiliente em tempo real.
- **Ícones & Identidade:** Lucide-React + Nova Identidade Vetorial **Fintech Prism Cupertino** (`CoindexLogo`, `CoindexIcon` e `/icon.svg`) com gradiente Apple Blue -> Indigo -> Green.
- **Idioma:** 100% Português do Brasil (`pt-BR`).

---

## 2. Mapa Estrutural de Arquivos & Linhas de Referência

O código do Coindex é modularizado para evitar sobrecarga de componentes monolíticos. Abaixo está o índice exato de localização de cada subsistema:

```
fincontrol-lifeos/
├── app/
│   ├── page.tsx                           # Dashboard executivo principal, orquestrador de estado e layout
│   ├── SecondaryTabs.tsx                  # Renderizador de abas secundárias (Status, Histórico, Devedores, etc.)
│   ├── TransactionsTableAdvanced.tsx      # Tabela avançada de lançamentos, filtros popover e paginação
│   ├── lifeos-data.tsx                    # Schemas, interfaces, dados iniciais, cálculos contábeis e migrações
│   ├── schemas.ts                         # Schemas Zod de validação estrita
│   ├── globals.css                        # Tailwind v4, scrollbars cibernéticas e tema Cyberpunk Neon
│   ├── layout.tsx                         # RootLayout, fontes Geist e metadados de Favicon
│   ├── icon.svg                           # Favicon vetorial oficial da Fintech Prism
│   ├── lib/
│   │   ├── domain/
│   │   │   ├── date-br.ts                 # Motor de Datas Brasileiro Puro (DD-MM-YYYY, anti-UTC shift)
│   │   │   ├── finance.ts                 # Motor Contábil Puro (Centavos inteiros, restos exatos, competência/caixa)
│   │   │   ├── investment-yield.ts        # Motor de Rendimento Automático CDI e Capitalização Diária (Sprint 30)
│   │   │   └── user-storage.ts            # Isolamento de Cache por Usuário (userId namespace, tombstones & soft delete)
│   │   ├── services/coindex-supabase.ts   # CRUD completo e persistência no Supabase PostgreSQL
│   │   ├── services/spotify-supabase.ts   # Persistência de tokens e preferências Spotify
│   │   └── supabase/                      # Clientes Supabase Client & Server
│   ├── components/
│   │   ├── TransactionModal.tsx           # Modal completo de novo lançamento/edição (com indexador % CDI)
│   │   ├── SpotifyModule.tsx              # Player cibernético, telemetria e rateio familiar do Spotify
│   │   ├── VehiclesTab.tsx                # Telemetria automotiva, consumo km/L e Inmetro
│   │   ├── BanksTab.tsx                   # Gestão de contas bancárias, cartões e limites
│   │   ├── ChartSettingsPopover.tsx       # Popover de customização de cores/curvas/tipos de gráficos
│   │   ├── CoindexAuthScreen.tsx          # Tela de login/cadastro Supabase RLS cibernética
│   │   ├── ProfileModal.tsx               # Modal de perfil, avatar base64 e backup JSON
│   │   ├── CoindexLogo.tsx                # Componente da logo Fintech Prism (isométrica)
│   │   ├── ChartCard.tsx                  # Container arrastável (Drag-and-Drop) de cards Recharts
│   │   └── SpotifyLogo.tsx                # Ícone vetorial do Spotify
│   ├── api/
│   │   ├── auth/route.ts                  # Rota Next.js de autenticação e sessão
│   │   └── market-rates/route.ts          # Rota oficial BCB SGS (Taxa CDI 252 d.u. com cache 1h)
```

### Mapeamento Detalhado de Linhas:

#### `app/page.tsx` (4.993 linhas):
- **Linhas 60-175:** Importações de React, Lucide, Recharts, Schemas e Serviços Supabase.
- **Linha 207:** Componente `PatrimonyCyberTooltip` (Tooltip escuro com Acumulado, Aporte Bruto e Resgate).
- **Linha 250:** Componente principal `CoindexApp`.
- **Linhas 251-415:** Estados globais (`transactions`, `banks`, `cards`, `staticStatus`, `notes`, `dashboardLayout`).
- **Linhas 556-620:** Estados de modais (`showTxModal`, `showCommandModal`, `showProfileModal`, `confirmModal`).
- **Linhas 755-865:** Efeito de Hidratação Inicial (`initCoindex`) e normalização automática via `migrateLegacyCategory`.
- **Linhas 868-930:** Carregamento automático e Migração para Supabase (`fetchAllCoindexData`).
- **Linha 1316:** `useMemo(monthSummary)`: Cálculo adaptativo dos 4 KPIs do topo (modo mensal vs. Histórico Geral).
- **Linha 1392:** `useMemo(patrimonyChartData)`: Cálculo da evolução patrimonial com Aportes Brutos.
- **Linha 1408:** `useMemo(categoryChartData)`: Agrupamento para o gráfico Donut de despesas.
- **Linha 1448:** `useMemo(creditChartData)`: Exposição de cartões e cálculo de Safe-to-Spend.
- **Linhas 3422-3465:** Renderização de Notificações Toast Flutuantes (`toasts`).
- **Linhas 3466-3580:** **Sidebar Retrátil Lateral** com logo `CoindexLogoHorizontal` / `CoindexIcon`, menu e rodapé com perfil.
- **Linhas 3591-3755:** **Topbar** com Seletor de Mês, Sininho de Notificações e Botão de Modo Privacidade.
- **Linhas 3758-4060:** **Os 4 Cards de Resumo Financeiro (KPIs Slim)** com subtítulos e rodapés adaptativos.
- **Linhas 4065-4180:** **Gráfico "Evolução do Meu Patrimônio"** (Recharts AreaChart, Aportes Brutos, YAxis `[0, auto]`).
- **Linhas 4185-4295:** **Gráfico Donut "Para Onde Vai o Meu Dinheiro"** (Total centralizado em R$, ordenação decrescente).
- **Linhas 4300-4380:** Painel consolidado de Limites Bancários e Exposição por Banco.
- **Linhas 4628-4760:** Modal Command Palette (`Ctrl + K`).
- **Linhas 4766-4790:** Modal de Lançamentos (`TransactionModal`).
- **Linhas 4824-4930:** Modal de Exclusão Inteligente de Séries Parceladas.
- **Linhas 4949-4990:** Modal de Confirmação Customizado (Substituição de `window.confirm`).

#### `app/SecondaryTabs.tsx` (2.324 linhas):
- **Linha 279:** Aba `status` (Base Fixa Orçamentária, Renda Base, Custos Fixos, Aporte Base e Lançamento Automático de Fixos).
- **Linha 515:** Aba `transactions` (Tabela Avançada de Lançamentos).
- **Linha 538:** Aba `receivables` (Gestão de Devedores, Valores a Receber, Cobrança WhatsApp e Baixa Parcial/Total).
- **Linha 819:** Aba `cards` (Módulo de Cartões de Crédito, Faturas e `BanksTab`).
- **Linha 856:** Aba `auto` (Telemetria Automotiva, Histórico de Abastecimentos e `VehiclesTab`).
- **Linha 883:** Aba `bio` (Biohacking, Medições Corporais, Strava e Metas).
- **Linha 1002:** Aba `brain` (Mural Central de Anotações, Desejos de Compra e OKRs Pessoais).
- **Linha 1630:** Aba `settings` (Configurações, Conexões de Nuvem, Gestão de Categorias, Limites e Logs do Sistema).

#### `app/TransactionsTableAdvanced.tsx` (1.122 linhas):
- **Linhas 30-43:** Tipos de ordenação (`TxSortKey`) e interface de filtros de coluna (`TxColumnFilters`).
- **Linha 44:** Interface `TransactionsTableAdvancedProps` (incluindo gatilho `onNewTransaction`).
- **Linhas 165-220:** Motor de filtragem multi-coluna (Data, Descrição, Categoria, Tipo, Forma, Status e Valor).
- **Linhas 271-410:** Barra de ferramentas da tabela (Busca global, exportação CSV, botões de ação e `+ Novo Lançamento`).
- **Linhas 450-800:** Cabeçalho da tabela com popovers de filtro flutuantes (`z-[100]`, sem corte de container).
- **Linhas 810-1040:** Linhas da tabela com formatação tabular, badges de status e menu de ações rápidas.
- **Linhas 1050-1120:** Paginação inteligente e resumo de registros filtrados.

#### `app/lifeos-data.tsx` (1.530 linhas):
- **Linhas 31-280:** Interfaces principais do sistema TypeScript.
- **Linhas 352-368:** **Matemática Financeira Blindada** (`toCents`, `fromCents`, `safeAdd`, `safeSub`).
- **Linhas 370-392:** **Cálculo de Competência de Fatura de Cartão** (`getCardInvoiceCompetence`).
- **Linhas 449-570:** **Parser e Detector de Séries Parceladas** (`getInstallmentSeries`).
- **Linhas 615-670:** **Migrador de Categorias Legadas** (`migrateLegacyCategory`).
- **Linhas 673-750:** Catálogo Oficial de Categorias e Mapeamento de Cores.
- **Linhas 927-985:** **56 Registros Históricos Importados de Aporte/Resgate** (`PATRIMONIO_IMPORT_DATA`).
- **Linhas 1391-1490:** Função `calculatePatrimonyEvolution`: série de Aportes Brutos (`aportes >= 0`) e Acumulado Real.

---

## 3. Interfaces TypeScript Oficiais

```ts
// Transação Financeira Completa (Sprint 23)
export interface Transaction {
  id: string;
  date: string; // Formato DD-MM-YYYY (puro local anti-UTC shift)
  description: string;
  amount: number; // Armazenado como float, calculado via toCents/fromCents
  category: string;
  costType: "Fixo" | "Variável";
  paymentMethod: string;
  status: "Pago" | "Pendente" | "Na Fatura" | "Pendente / Na Fatura";
  flowType?: "INCOME" | "EXPENSE" | "INVESTMENT" | "NEUTRAL" | "RECEIVABLE";
  cardUsed?: string;
  cardId?: string; // Vínculo estável contra quebra ao renomear
  bankAccount?: string;
  bankId?: string; // Vínculo estável contra quebra ao renomear
  invoiceMonth?: string; // YYYY-MM da competência de fatura
  cashMonth?: string;    // YYYY-MM do mês de desembolso real
  km?: number;
  liters?: number;
  fuelType?: "Gasolina" | "Etanol";
  fullTank?: boolean;
  // Gestão de Séries Parceladas
  installmentInfo?: string;
  installmentGroupId?: string;
  installmentSeriesId?: string;
  // Transferência Neutra entre Contas Bancárias
  isTransfer?: boolean;
  sourceBank?: string;
  destinationBank?: string;
  // Rachar Gasto / Split de Despesas
  isSplit?: boolean;
  thirdPartyAmount?: number;
  thirdPartyName?: string;
  personalAmount?: number;
  linkedReceivableId?: string;
  isSplitChild?: boolean;
  linkedSplitParentId?: string;
  debtor?: string;
  paidAmount?: number;
  isInvoicePayment?: boolean;
  isReceivableSettlement?: boolean;
  wishlistId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string; // Soft delete / lápide local
  rev?: number;
}

// Instituição / Conta Bancária
export interface BankInstitution {
  id: string;
  name: string;
  logoUrl?: string;
  accountType?: "Conta Corrente" | "Conta Digital" | "Investimentos" | "Benefícios";
  balance?: number;
}

export interface BankItem extends BankInstitution {
  limit: number;
  limitType: string;
}

// Cartão de Crédito
export interface CreditCardItem {
  id: string;
  name: string;
  bankName: string;
  limit: number;
  closingDay: number; // Dia de corte da fatura
  dueDay: number;     // Dia de vencimento da fatura
  color?: string;
  brand?: string;
  logoUrl?: string;
}

// Item de Base Fixa / Orçamento
export interface StaticStatusItem {
  id: string;
  title: string;
  category: string;
  baseAmount: number;
  costType: "Fixo" | "Variável";
  type: "income" | "fixed_cost" | "investment";
  active: boolean;
}

// Mural de Anotações e Objetivos (integrado com Desejos)
export interface BrainNote {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  priority: "Essencial" | "Planejado" | "Desejo";
  itemType?: "note" | "wish";
  price?: number;
  completed?: boolean;
  targetMonth?: string;
  createdAt: string;
  updatedAt?: string;
}

// Notificações Toast Cibernéticas
export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: "success" | "warning" | "danger" | "info";
  duration?: number;
  category?: string;
}
```

---

## 4. Regras Contábeis e Motores Financeiros

### 1. Matemática de Centavos Inteiros (Lucas Viana):
- **Problema:** Erros inerentes ao padrão IEEE 754 de ponto flutuante em JavaScript (ex: `0.1 + 0.2 = 0.30000000000000004`).
- **Solução Implementada:** Todos os cálculos somatórios e subtrativos operam em centavos inteiros através de `toCents(val) = Math.round(val * 100)` e `fromCents(cents) = cents / 100`.
- **Funções Mandatórias:** `safeAdd(...values)` e `safeSub(a, b)` são utilizadas em todos os totais, resumos de faturas e KPIs.

### 2. Aportes Brutos & Patrimônio Real (Sprint 18 & 19):
- **Aporte Mensal:** É estritamente a soma bruta de registros da categoria `"Aporte"` (`aporteBruto >= 0`). **Nunca é subtraído por resgates**, eliminando aportes negativos no gráfico.
- **Resgates:** Lançamentos com a categoria `"Resgate"` (ou notas contendo "Resgate") são contabilizados como desinvestimento e destacados no Tooltip adicional.
- **Evolução Patrimonial:** `Patrimônio Acumulado = Saldo Anterior + Aportes Brutos - Resgates Brutos` (limitado ao piso zero). O eixo vertical do gráfico Recharts opera com `domain={[0, "auto"]}`.

### 3. Competência Real de Fatura de Cartão vs. Data da Compra:
- Compras no cartão de crédito possuem a data real da transação (`date`), mas sua liquidação financeira ocorre na fatura correspondente (`invoiceCompetence`).
- **Regra:** Se `dia_da_compra >= closingDay` do cartão, `invoiceCompetence = YYYY-(MM + 1)`. Caso contrário, `invoiceCompetence = YYYY-MM`.
- Isso garante que compras após o fechamento da fatura sejam provisionadas com precisão contábil no mês em que serão efetivamente pagas.

### 4. Transferência Neutra entre Contas Bancárias (Sprint 12):
- Transferências possuem `isTransfer: true` e especificam `sourceBank` e `destinationBank`.
- **Impacto no Orçamento:** Neutro (`R$ 0,00`). Não aumentam a receita e nem a despesa operacional mensal.
- **Impacto Bancário:** O saldo do banco de origem é debitado em `amount` e o banco de destino é creditado em `amount`.

### 5. Divisão de Despesas / Rachar Gastos (Sprint 13):
- Ao marcar `isSplit: true`, o usuário define `thirdPartyAmount` e o nome do devedor (`thirdPartyName`).
- O sistema calcula `personalAmount = safeSub(amount, thirdPartyAmount)`.
- Apenas `personalAmount` onera o termômetro de gastos pessoais do usuário.
- A fração de terceiros cria ou atualiza automaticamente um registro na aba **Valores A Receber** com status `"Pendente"` e link direto via `linkedReceivableId`.

### 6. Resumo Financeiro Inteligente Adaptativo por Período (Sprint 19):
- **Filtro Mensal:** Apresenta `Entradas`, `Saídas`, `Aportes Brutos` e `Saldo Livre (Safe-to-Spend)`.
- **Filtro "Histórico Completo" (`selectedMonth === "ALL"`):**
  - Título dinâmico: **"Resumo Financeiro — Histórico Geral"**.
  - Rótulos: `ENTRADAS TOTAIS (GERAL)`, `SAÍDAS & DESPESAS (GERAL)`, `APORTES BRUTOS (GERAL)` e `BALANÇO OPERACIONAL LÍQUIDO`.
  - **Fórmula do Balanço:** `Entradas Totais - Saídas Operacionais`.
  - O capital aportado em caixinhas e reservas é segregado no card de Aportes e no rodapé do 4º card, extinguindo o falso saldo negativo de anos de investimentos acumulados confrontados com meses recentes de salário.

---

## 5. Catálogo Oficial de Categorias & Desmembramento

Atualizado na Sprint 19 com a substituição de categorias compostas com barras por categorias autônomas:

| Categoria Oficial | Fluxo Contábil | Natureza Típica | Ícone Semântico |
| :--- | :--- | :--- | :--- |
| **Salário** | Receita | Renda Líquida Principal | `TrendingUp` |
| **Rendimentos** | Receita | Juros / Dividendos / CDI | `ArrowUpRight` |
| **Reembolso** | Receita | Devolução de Terceiros | `RotateCcw` |
| **Aporte** | Investimento | Reserva / Caixinhas / Ações | `TrendingUp` |
| **Resgate** | Investimento | Saque de Reserva / Desinvestimento | `ArrowDownRight` |
| **Transferência entre Contas** | Neutro | Movimentação Interna | `ArrowLeftRight` |
| **Moradia / Aluguel** | Despesa | Custo Fixo Habitacional | `Home` |
| **Condomínio** | Despesa | Custo Fixo Habitacional | `Building` |
| **Energia Elétrica** | Despesa | Custo Fixo Concessionária | `Zap` |
| **Internet** | Despesa | Custo Fixo Conectividade | `Wifi` |
| **Assinaturas** | Despesa | Serviços Recorrentes / SaaS | `Layers` |
| **Supermercado** | Despesa | Alimentação Essencial | `ShoppingCart` |
| **Farmácia** | Despesa | Saúde & Medicamentos | `PlusCircle` |
| **Seguro Auto** | Despesa | Proteção Veicular Fixa | `ShieldCheck` |
| **IPVA** | Despesa | Imposto Veicular Anual | `FileText` |
| **Licenciamento** | Despesa | Taxa Veicular Anual | `CheckSquare` |
| **Plano de Saúde** | Despesa | Benefício Médico Fixo | `Heart` |
| **Academia** | Despesa | Treino e Condicionamento | `Activity` |
| **Gasolina** | Despesa | Combustível Automotivo | `Fuel` |
| **Estacionamento** | Despesa | Mobilidade Urbana / Pedágio | `MapPin` |
| **Alimentação / Restaurante** | Despesa | Alimentação Externa Variável | `Utensils` |
| **Delivery** | Despesa | Pedidos de Comida / App | `Coffee` |
| **Lazer** | Despesa | Entretenimento e Passeios | `Smile` |
| **Vestuário** | Despesa | Roupas e Calçados | `ShoppingBag` |
| **Gastos Pessoais** | Despesa | Despesas Variáveis Pessoais | `Tag` |
| **Presentes** | Despesa | Presentes e Doações | `Gift` |
| **Educação / Cursos** | Despesa | Livros e Treinamentos | `BookOpen` |
| **Manutenção Veículo** | Despesa | Revisões, Pneus e Peças | `Wrench` |
| **Viagens** | Despesa | Hospedagem, Voos e Viagem | `Plane` |
| **A Receber** | Variável | Devedores / Empréstimos | `Clock` |
| **Outros** | Despesa | Despesas Gerais Diversas | `HelpCircle` |

---

## 6. Padrões de Interface & Design (03. Apple Copilot Pure — Cupertino Light & Dark)

1. **Dual Theme Motor CSS (Cupertino Dark & Cupertino Light):**
   - **Cupertino Dark (`html[data-theme="dark"]`):** Fundo base `#0B0C0E`, cards `rgba(20, 22, 26, 0.78)` com `backdrop-blur-xl`, bordas sutis `rgba(255, 255, 255, 0.08)` e textos em `#F5F5F7` e `#86868B`.
   - **Cupertino Light (`html[data-theme="light"]`):** Fundo base `#F2F2F7`, cards `#FFFFFF` translúcidos `rgba(255, 255, 255, 0.88)` com sombra suave `rgba(0, 0, 0, 0.06)`, bordas `rgba(0, 0, 0, 0.08)` e textos em `#1D1D1F` e `#6E6E73`.
   - **Segmented Control Apple na Topbar:** Alternância deslizante entre "☀️ Claro" e "🌙 Escuro", persistida no `localStorage` sob `coindex_cupertino_theme` e aplicada via atributo `data-theme` no `<html>`.
   - **Script Anti-Flicker:** Executado inline no `<head>` em `app/layout.tsx` para sincronização instantânea antes da hidratação do React.

2. **Formatação Tipográfica Apple SF Pro / Inter & Precisão Óptica:**
   - Tipografia do sistema: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif`.
   - Recursos OpenType de precisão óptica ativados: `font-feature-settings: "cv02", "cv03", "cv04", "cv11", "tnum"`.
   - Renderização anti-serrilhamento Apple: `-webkit-font-smoothing: antialiased` e `-moz-osx-font-smoothing: grayscale`.
   - Valores monetários (`R$`): `font-semibold tracking-[-0.03em] tabular-nums` (100% nítidos, sem text-shadow ou drop-shadow neon sobre os dígitos).
   - Títulos com `font-semibold tracking-[-0.02em]` e rótulos com `font-medium tracking-[0.02em]`.
   - Cantos arredondados squircle Apple (`rounded-2xl` / 20px) em cards, modais e botões.

3. **Slim KPI Cards no Padrão Cupertino:**
   - **Entradas / Receitas:** Apple Green (`var(--cupertino-green)` / `#30D158`), ícone `TrendingUp` em badge verde translúcido.
   - **Saídas & Despesas:** Apple Red (`var(--cupertino-red)` / `#FF453A`), ícone `TrendingDown` em badge vermelho translúcido.
   - **Aportes Brutos:** Apple Blue (`var(--cupertino-blue)` / `#0A84FF`), ícone `PiggyBank` em badge azul translúcido.
   - **Balanço / Saldo Livre:** Apple Cyan/Teal (`#64D2FF`) se positivo ou Apple Red (`#FF453A`) se negativo, com rodapé adaptativo de Safe-to-Spend.

4. **Recharts Cupertino & Redesign Copilot Money:**
   - **Evolução do Meu Patrimônio:** Eixo Y único à esquerda com formatação limpa (`R$ 0`, `R$ 1k`, `R$ 2k`), curva contínua fluida em Apple Blue (`#0A84FF`) com preenchimento em degradê translúcido (`stopOpacity` de `0.28` a `0.00`).
   - **Curva Suave de Aportes Brutos:** Opcional via toggle interativo de legenda, em Apple Indigo (`#5E5CE6`), sem torres/barras invasivas.
   - **Para Onde Vai o Meu Dinheiro (Donut):** Paleta oficial Apple Cupertino `['#0A84FF', '#30D158', '#FF9F0A', '#BF5AF2', '#FF453A', '#64D2FF', '#5E5CE6', '#8E8E93']`.
   - Tooltips Cupertino Glassmorphism (`bg-slate-900/95 border border-white/10 text-slate-300 shadow-xl backdrop-blur-md`).

5. **Identidade Visual — Fintech Prism Cupertino:**
   - Logo e Favicon em hexágono isométrico tridimensional com gradiente de alta fidelidade Apple: Blue (`#0A84FF`) -> Indigo (`#5E5CE6`) -> Mint Green (`#30D158`).
   - Botão de ação primária "+ Novo Lançamento" e item ativo da Sidebar em Apple System Blue (`#0A84FF` / `#0070E0`).

---

## 7. Histórico Completo de Sprints (Sprints 1 a 27)

- **Sprint 1 — Fundação Arquitetural:** Criação da estrutura base em Next.js App Router, estado reativo global, paleta Cyber-Glassmorphism e integração inicial com Supabase e Google Sheets.
- **Sprint 2 — Seleção Condicional de Pagamento:** Modal de Lançamentos inteligente: exibição condicional de seletores de Cartão de Crédito e Fatura ao escolher método de crédito, ou Banco Emissor para Pix/Débito.
- **Sprint 3 — Lógica de Patrimônio Real:** Separação entre fluxo operacional de caixa e fluxo de investimento (Aporte vs. Resgate), criando o primeiro gráfico acumulado de patrimônio.
- **Sprint 4 — Gestão Inteligente de Valores a Receber:** Módulo de controle de empréstimos e devedores com baixa parcial ou total, abatimento dinâmico e integração com a tabela principal.
- **Sprint 5 — Modo Posto Express & Telemetria Automotiva:** Atalho de abastecimento em 2 toques no modal de transações, cálculo automático de consumo médio (km/L), custo por km rodado e parâmetros Inmetro.
- **Sprint 6 — Automação "Lançar Fixos do Mês":** Gerador em lote de despesas fixas a partir do orçamento estático (`staticStatus`) com trava anti-duplicidade para evitar lançamentos repetidos no mesmo mês.
- **Sprint 7 — Gestão em Série de Compras Parceladas:** Parser e identificador de séries no formato `(x/n)`, modal inteligente para edição ou exclusão de parcelas futuras em lote e liberação imediata de limite no cartão.
- **Sprint 8 — Matemática Financeira Blindada & Competência de Faturas:** Eliminação definitiva de erros de ponto flutuante via inteiros (`toCents`/`fromCents`/`safeAdd`/`safeSub`), motor contábil de competência de faturas (`getCardInvoiceCompetence`) e fluxo de quitação com débito em conta.
- **Sprint 9 — Refinamento de Hierarquia Visual & WCAG:** Adoção estrita da tipografia tabular (`tabular-nums`), alinhamento monetário à direita, aumento de contraste visual e melhoria da ergonomia móvel.
- **Sprint 10 — Fonte Única da Verdade (SSOT) com Zod:** Criação de `app/schemas.ts` com validação estrita de dados em tempo de execução para transações, cartões, bancos e status.
- **Sprint 11 — Desacoplamento Modular (Fim do God Component):** Extração de submódulos pesados para componentes dedicados (`TransactionsTableAdvanced`, `TransactionModal`, `BanksTab`, `VehiclesTab`, `SpotifyModule`), virtualização de tabela e índices SQL para o Supabase.
- **Sprint 12 — Transferência Neutra entre Contas & Safe-to-Spend:** Suporte a lançamentos de transferência com impacto orçamentário neutro e cálculo do saldo livre projetado seguro para gastos.
- **Sprint 13 — Divisão de Contas Integrada (Rachar Gastos):** Função de dividir despesas no modal com segregação do gasto pessoal (`personalAmount`) e geração automática do crédito pendente na aba Valores A Receber.
- **Sprint 14 — Smart Auto-Fill no Modal de Lançamentos:** Autocomplete e preenchimento automático inteligente de categoria, método de pagamento e custo fixo/variável baseado no histórico de estabelecimentos anteriores.
- **Sprint 15 — Sistema de Toasts & Backup JSON:** Substituição de `window.alert` e `window.confirm` por Toasts e Modais cibernéticos nativos; criação da funcionalidade de exportação e restauração de backup `.json` completo no perfil do usuário.
- **Sprint 16 — Compactação de KPIs & Redesign de Gráficos:** Fim dos espaços vazios nos 4 cards de topo (Slim Cards), Donut "Para Onde Vai o Meu Dinheiro" com total centralizado e lista decrescente de categorias.
- **Sprint 17 — Higienização da Topbar & Badges de Tabela:** Remoção de duplicidades no topo (Ctrl+K e Perfil centralizados na Sidebar lateral), badges compactas e alinhamento dos cards de resumo em todas as abas secundárias.
- **Sprint 18 — Carga Oficial do Histórico de Patrimônio:** Importação e persistência no Supabase de 56 lançamentos históricos oficiais de Aportes e Resgates (`PATRIMONIO_IMPORT_DATA`), consolidação do BTG Pactual e ajuste do saldo da Caixinha Turbo para R$ 2.616,61.
- **Sprint 19 — Aportes Brutos, Resumo Adaptativo & Nova Logo Fintech Prism:**
  - Gráfico de Patrimônio exibindo Aportes Brutos reais (sem valores negativos), YAxis iniciado em zero e tooltip informativo de resgates.
  - Resumo financeiro inteligente adaptado ao Histórico Completo (`selectedMonth === "ALL"`), calculando o balanço operacional real sem distorções de anos de investimentos.
  - Correção de clipping em popovers de filtros da tabela (`z-[100]`) e ativação do botão `+ Novo Lançamento`.
  - Reforma e desmembramento de categorias compostas (`migrateLegacyCategory`).
  - Lançamento da nova identidade vetorial **Fintech Prism** (`app/icon.svg`, `CoindexLogo` e Favicon do navegador).
- **Sprint 20 — Design System Oficial "02. Cyberpunk Neon — Synthwave Spark":**
  - Eliminação definitiva do seletor de tema frágil na Topbar e unificação 100% no modo escuro Cyberpunk Neon (`color-scheme: dark !important;`).
  - Atmosfera com gradientes radiais Obsidian-Violeta e variáveis oficiais `--cyber-*` em `app/globals.css`.
  - Item ativo da Sidebar lateral estilizado com o gradiente Synthwave Spark (`#FF2A85` -> `#D946EF` -> `#8B5CF6`).
  - Botão principal `+ Novo Lançamento` com degradê laser vibrante e sombra neon (`#FF2A85` -> `#A855F7`).
  - KPIs do topo com acentos Neon Mint (`#00F5D4`), Laser Pink (`#FF2A85`), Electric Violet (`#C084FC`) e Coral (`#FF6B4A`).
  - Gráfico de Patrimônio com curvas magenta/purple e Donut estilizado com a paleta harmônica Synthwave.
  - Popovers de filtro e modais unificados no estilo vidro violeta escuro `bg-[#110724]/95` com checkboxes em `accent-[#FF2A85]`.
  - Logo Coindex e Favicon atualizados para a paleta Cyberpunk Neon (`#FF2A85` -> `#A855F7` -> `#00F5D4`).
- **Sprint 21 — Padronização Global de Datas DD-MM-YYYY & Motor Contábil Puro:**
  - **Motor de Datas Brasileiro (`app/lib/domain/date-br.ts`):**
    - Eliminação completa dos bugs de fuso horário UTC (`new Date("YYYY-MM-DD")` e `toISOString()` que avançavam para o dia seguinte às 21h em `America/Fortaleza` UTC-3).
    - Funções puras: `todayBR()` (retorna `"DD-MM-YYYY"` local), `todayISO()`, `formatDateBR()`, `toSortableISO()`, `addMonthsSafe()`, `daysInMonth()`, `getYearMonthKey()`, `compareDatesBR()`.
    - Exibição padronizada estritamente em `DD-MM-YYYY` em todas as tabelas, modais, cabeçalhos e relatórios CSV (`handleExportCSV`).
    - Campos nativos de `<input type="date">` sincronizados bidirecionalmente via `toSortableISO()` e `formatDateBR()`.
  - **Motor Contábil Puro e Centavos Blindados (`app/lib/domain/finance.ts`):**
    - `toCents()` com suporte a números e strings pt-BR (`"1.234,56"`), precisão de 15 dígitos e normalização estrita de `-0`.
    - Distribuição exata de parcelas (`distributeInstallments`): resto da divisão em centavos é alocado na 1ª parcela (`33,34 + 33,33 + 33,33 = 100,00`).
    - Agrupamento prioritário de parcelas via `installmentSeriesId` imutável (`generateInstallmentSeriesId`).
    - Competência de fatura (`invoiceCompetence`) vs. Mês de desembolso de caixa (`cashMonth`) via `calculateInvoiceAndCashMonths`: se `dueDay <= closingDay`, o desembolso real é projetado no mês seguinte para o *Safe-to-Spend*.
    - Neutralidade contábil estrita (`flowType: "NEUTRAL"`): quitações de fatura (`handlePayCardInvoice`) e liquidações de recebíveis/split (`handlePartialPaymentReceivable`) atualizam saldos em contas bancárias sem inflar as saídas operacionais ou entradas líquidas do mês.
- **Sprint 22 — Isolamento por Usuário no Cache Local, Soft Delete contra Ressurreição de Exclusões e Validação Zod com Quarentena:**
  - **Isolamento de Cache Local por Usuário (`app/lib/domain/user-storage.ts`):** Chaves no `localStorage` prefixadas pelo ID do usuário (`coindex_usr_${userId}_${key}`, fallback `coindex_guest_${key}`). `clearUserSessionStorage` remove dados privados e reseta o estado em memória para os valores iniciais padrão ao encerrar a sessão ("Sair da Conta"), impedindo contaminação entre contas no mesmo dispositivo.
  - **Remoção de Dados Pessoais do Bundle JS Público (`PATRIMONIO_IMPORT_DATA`):** Os 56 lançamentos históricos pessoais foram removidos de `INITIAL_TRANSACTIONS` e do carregamento automático de login. Contas novas iniciam 100% limpas. A carga do histórico foi movida para uma ação explícita no perfil (`onSeedPatrimonio`) protegida pela flag `patrimonio_seeded_${userId}`.
  - **Cálculo de Patrimônio com Reserva Inicial & Alerta de Déficit:** Suporte ao parâmetro `initialReserveBalance` / `initialPatrimony` em `calculatePatrimonyEvolution`. Quando os resgates superam o saldo acumulado (+ reserva inicial), a interface emite um banner visual de alerta amigável no padrão Cyberpunk em vez de mascarar com `Math.max(0, ...)`.
  - **Soft Delete e Lápides Locais (`recordTombstone`):** Inclusão de `deletedAt?: string` e `rev?: number` em `Transaction`, `CreditCardItem`, `BankInstitution`, `StaticStatusItem` e `BrainNote`. Sistema de lápides locais armazena os IDs excluídos no storage namespace do usuário, garantindo que sincronizações futuras com o Supabase ou restaurações parciais de cache nunca ressuscitem itens deletados.
  - **Indicador de Sincronização em Tempo Real:** Badge com status em tempo real (🟢 Sincronizado, 🟡 Sincronizando..., ⚪ Offline (Salvo Localmente), 🔴 Erro de Sync com timestamp da última operação) adicionado na Topbar ao lado do seletor de mês e no rodapé do perfil na Sidebar.
  - **Validação de Backup JSON com Zod & Quarentena (`FullBackupSchema`):** Exportação versionada (`schemaVersion: 2`) com data de geração em `DD-MM-YYYY`. Importação validada por Zod (`validateAndQuarantineBackup`), isolando registros corrompidos ou com schema inválido em relatório de quarentena (`quarantine.details`) registrado nos logs do sistema sem quebrar a tela. Modal de Perfil oferece escolha entre "Mesclar com dados atuais (Recomendado)" e "Substituir tudo".
- **Sprint 23 — Fonte Única de Tipos Zod, Catálogo 100% Limpo, Vínculo em Cascata Bancos/Cartões e Telemetria Automotiva Flex & TCO Real:**
  - **Higienização do Catálogo de Categorias & FlowType Obrigatório:**
    - Eliminação completa de barras compostas no catálogo e no migrador `migrateLegacyCategory`: `Moradia` e `Aluguel`, `Alimentação` e `Restaurante`, `Educação` e `Cursos`.
    - Adição de categorias essenciais: `Água & Gás`, `Celular / Telefonia`, `Impostos & Taxas`, `Transporte / Uber`, `Cuidados Pessoais` e `Receita Extra`.
    - Resolução determinística de fluxo financeiro via `resolveTransactionFlowType(tx, catalog)` com tipo unificado `FlowType = "INCOME" | "EXPENSE" | "INVESTMENT" | "NEUTRAL" | "RECEIVABLE"`.
    - Status Semânticos Oficiais: Separação de `Pendente / Na Fatura` em `Pago` (verde/CheckCircle2), `Pendente` (âmbar/Clock para boletos/contas) e `Na Fatura` (violeta/CreditCard para despesas de cartão), com filtro rápido dedicado `NA_FATURA` na `TransactionsTableAdvanced`.
    - Novos ícones semânticos em `renderCategorySemanticIcon`: `Bike` (Delivery), `FileCheck` (Licenciamento), `Pill` (Farmácia), `Landmark` (Aporte) e `Banknote` (Salário/Receitas).
  - **Proteção contra Quebra de Histórico ao Renomear Bancos ou Cartões:**
    - Inclusão dos campos de vínculo imutável `bankId?: string` e `cardId?: string` em `Transaction` e `TransactionSchema`.
    - Em `handleSaveBank` e `handleSaveCard`, sincronização em cascata automática de todas as transações vinculadas (`bankAccount`, `sourceBank`, `destinationBank`, `cardUsed`, `bankId`, `cardId`) tanto em memória quanto no `setUserItem` e Supabase PostgreSQL, assegurando que renomear instituições ou cartões nunca quebre os saldos históricos ou faturas em aberto.
  - **Telemetria Automotiva Flex & TCO Real (`app/components/VehiclesTab.tsx`):**
    - Suporte nativo ao tipo de combustível (`fuelType: "Gasolina" | "Etanol"`) e flag de tanque cheio (`fullTank: boolean`) no Posto Express e modo padrão, com validação inteligente emitindo aviso inline caso o odômetro digitado seja menor que o registro anterior.
    - **Calculadora Rápida Etanol vs. Gasolina:** Comparativo em tempo real entre a Regra dos 70% e a Paridade Real do Ford Fiesta 1.0 Flex (`ethanolKmPerLiter / gasolineKmPerLiter` = 70,8%), exibindo veredito dinâmico em Cyberpunk Neon, custo por km de cada combustível e projeção de economia por tanque cheio de 50L.
    - **Indicador de TCO (Custo Total de Propriedade por KM):** Consolidação contábil completa somando Combustível + Manutenção & Óleo + IPVA + Licenciamento + Seguro Auto + Estacionamento/Pedágio, exibindo o valor total acumulado e o custo real por km (`formatBRL(tcoPerKm)}/km`) com breakdown visual detalhado por categoria.
- **Sprint 24 — Refinamento Óptico WCAG no Cyberpunk Neon, Paleta Donut de Alto Contraste, ComposedChart Duplo no Patrimônio e Glossário nos KPIs:**
  - **Acessibilidade & Contraste WCAG AA/AAA no Cyberpunk Neon:**
    - Elevação sistemática de textos secundários de `text-slate-500` e `text-slate-600` para `text-slate-300` / `text-slate-400` (garantindo taxa de contraste `>= 7.4:1` sobre o fundo void `#07030f` e superfícies escuras).
    - Remoção do `drop-shadow` exagerado sobre os dígitos numéricos principais (`R$`), mantendo os números 100% nítidos e legíveis, concentrando o efeito laser neon nas bordas dos cards e nos badges de ícones.
    - Sinais matemáticos explícitos nos 4 KPIs (`+` para Entradas, `-` para Saídas, `+` para Aportes e `+`/`-` para Balanço Operacional).
    - Reset refinado de foco em gráficos Recharts em `app/globals.css`: supressão de contorno apenas para cliques de mouse (`:focus:not(:focus-visible)`), preservação de anel neon fino (`outline: 2px solid #00F5D4`) em `:focus-visible` para acessibilidade de navegação por teclado e conformidade com `@media (prefers-reduced-motion: reduce)`.
  - **Paleta de Alto Contraste Cromático no Gráfico Donut ("Para Onde Vai o Meu Dinheiro"):**
    - Substituição da paleta de tons próximos de roxo/rosa pela paleta Cyberpunk de 8 matizes cromáticos altamente distintos: Laser Pink (`#FF2A85`), Neon Mint (`#00F5D4`), Cyber Amber (`#FFB800`), Electric Sky (`#38BDF8`), Neon Purple (`#A855F7`), Synth Coral (`#FF6B4A`), Acid Lime (`#A3E635`) e Slate Outros (`#64748B`).
    - Exibição das Top 7 categorias de maior desembolso com agrupamento automático de `"Outros"` com cor fixa cinza-ardósia (`#64748B`), impedindo saturação visual.
  - **Gráfico de Evolução Patrimonial em Escala Dupla (`ComposedChart`):**
    - Substituição de `<AreaChart>` simples por `<ComposedChart>` com escala dupla equilibrada:
      * **Patrimônio Acumulado** como Área suave (`#FF2A85`, `yAxisId="left"`).
      * **Aportes Brutos Mensais** como Barras (`Bar`, `#A855F7`, `yAxisId="right"`).
      * **Resgates Mensais** como Barras (`Bar`, `#FF6B4A`, `yAxisId="right"`).
    - Seletor rápido de período do patrimônio (`6M`, `1A`, `Tudo`) com slicing cronológico preciso.
  - **Glossário de Fórmulas e Seletor de Regime Contábil nos 4 KPIs:**
    - Seletor rápido de visualização contábil: **Regime de Competência** (despesas na data da compra) vs. **Regime de Caixa** (despesas de cartão alocadas no mês do vencimento/pagamento da fatura via `cashMonth || invoiceMonth`).
    - Ícones informativos `"ⓘ"` (`Info`) com tooltips cyberpunk detalhando a fórmula exata e regra contábil de cada métrica: Entradas, Saídas, Aportes Brutos, Resultado Operacional e Safe-to-Spend Projetado.
- **Sprint 25 — UX Avançada: Botão "Desfazer" nos Toasts, Exportação CSV pt-BR com BOM UTF-8, Mini-Calculadora no Campo de Valor e Modo Privacidade Completo:**
  - **Toast com Ação de Desfazer (`onUndo`):**
    - Interface `ToastMessage` expandida com `onUndo?: () => void` e `undoLabel?: string`.
    - Ao excluir transações (`handleDeleteTransaction`), parcelas de compras parceladas (`handleConfirmDeleteInstallment`) ou alterar rapidamente o status de um lançamento (`handleToggleStatus`), o Toast flutuante exibe o botão `"↩ Desfazer"` ativo durante 5 segundos.
    - O clique no botão desfaz imediatamente a exclusão ou alteração de status em memória e no Supabase PostgreSQL, com confirmação visual via toast de sucesso.
  - **Exportação CSV Padrão Microsoft Excel Brasil (`exportTableCSV`):**
    - Respeita integralmente os filtros ativos na tabela (`processedTxs`).
    - Prefixo UTF-8 BOM (`\uFEFF`) garantindo abertura perfeita de acentos e caracteres em português no Excel sem telas de configuração de codificação.
    - Ponto-e-vírgula (`;`) como separador nativo para sistemas operacionais pt-BR.
    - Datas formatadas estritamente em `DD-MM-YYYY` e valores monetários com vírgula decimal pt-BR (`1234,56`).
    - Blindagem contra CSV Injection / Formula Injection: sanitização de células de texto iniciadas por `=`, `+`, `-` ou `@`, prefixando aspa simples (`'`).
    - Nomenclatura automática de download: `coindex_lancamentos_DD-MM-YYYY.csv`.
  - **Modal de Lançamento Turbinado (`TransactionModal.tsx`):**
    - **Mini-Calculadora no Campo de Valor:** Parser de expressões matemáticas puras (`evaluateMathExpression`) nos campos de valor (modo padrão, Posto Express e transferências entre contas). Permite somas, subtrações, divisões e multiplicações (ex: `45,90 + 12,50` -> `58,40`) calculadas automaticamente ao sair do campo (`onBlur`) ou ao pressionar `Enter`.
    - **Atalhos Rápidos de Data de 1 Clique:** Botões rápidos `"Hoje"` (`todayBR()`) e `"Ontem"` (`getYesterdayBR()`) ao lado de todos os seletores de data.
    - **Botão "Salvar e Criar Outro":** Permite registrar despesas ou receitas sucessivas com alta velocidade sem fechar e reabrir o modal, mantendo a data preenchida e resetando os demais campos com foco automático no valor.
  - **Modo Privacidade Completo & Busca sem Acento:**
    - Persistência da preferência de privacidade no `localStorage` (`coindex_privacy_mode`).
    - Máscara visual de desfoque (`moneyBlur`) aplicada universalmente ao valor central do Donut, tooltips de gráficos Recharts (`PatrimonyCyberTooltip` e `CustomCyberTooltip`), cards de KPIs, limites de cartões e saldos bancários.
    - Normalização Unicode NFD (`normalizeSearchText`) na busca da tabela avançada e na Command Palette (`Ctrl+K`), permitindo encontrar registros ignorando acentos gráficos e caixa alta/baixa (ex: "agua" encontra "Água & Gás", "uber" encontra "Transporte / Uber").
    - Interceptação de atalho global `Ctrl+K` e `Cmd+K` com `e.preventDefault()` e `e.stopPropagation()`.
- **Sprint 26 — Redesign do Gráfico "Evolução do Meu Patrimônio" Estilo Copilot Money & Reconexão Total do Menu de Personalização (`ChartSettingsPopover`):**
  - **Remoção das Torres (Barras) e Redesign Copilot Money:**
    - Removido completamente o `<ComposedChart>`, os componentes `<Bar>` de Aportes/Resgates e o eixo Y secundário (`yAxisId="right"`).
    - Gráfico reconstruído com `<AreaChart>` limpo, moderno e minimalista, dotado de um único eixo Y à esquerda (`axisLine={false}`, `tickLine={false}`, formatação limpa `R$ 0`, `R$ 1k`, `R$ 2k`, `R$ 3k`).
    - Cabeçalho interno do card estilo Copilot Money com valor de Patrimônio Acumulado em fonte `tabular-nums` destacada + badge inteligente com variação percentual e monetária líquida no período selecionado (`6M`, `1A`, `Tudo`).
    - Curva de Patrimônio Acumulado renderizada como linha fluida contínua com preenchimento em degradê suave translúcido (`fillOpacity` de `0.28` no topo até `0.00` na base).
    - Pílulas de legenda no canto superior transformadas em toggles interativos clicáveis: curva de Patrimônio Acumulado ativa por padrão em destaque, e toggle clicável para ligar/desligar a 2ª curva suave de Aportes Brutos (também como linha/área suave, nunca como barra).
    - Resgates e Aportes mensais preservados com riqueza de detalhes no `PatrimonyCyberTooltip` ao passar o mouse.
  - **Reconexão Total da Engrenagem (`ChartSettingsPopover`):**
    - **Tipo de Visualização (`chartType`):** Suporte funcional dinâmico a `"area"` (Área Copilot), `"line"` (Linha pura) e `"bar"` (Barras) tanto no menu quanto na renderização em tempo real.
    - **Estilo da Curva (`curveType`):** Conectado diretamente a `monotone` (Suave), `linear` (Reta) e `step` (Degrau).
    - **Paleta de Cores Cibernética:** Seletores de cor atualizados para a paleta Synthwave Spark / Cyberpunk Neon (Laser Pink `#FF2A85`, Neon Mint `#00F5D4`, Electric Violet `#A855F7`, etc.), eliminando cores fixas hardcoded.
    - **Opções Visuais e Toggles:** Switches conectados funcionalmente para Mostrar Grade (`showGrid`), Pontos na Linha (`showDots`), Preenchimento Degradê (`fillArea`), Altura do Gráfico (`height`: Compacto 240px, Padrão 288px, Expandido 384px) e Tamanho do Card (`1/1` tela cheia vs `1/2` meia tela).
    - **Persistência Global:** Salva no `localStorage` sob `lifeos_chart_configs_v1` e sincroniza no perfil do usuário (`setUserItem` e Supabase DB).
- **Sprint 27 — Implementação do Design System "Apple Copilot Pure — Cupertino Light & Dark" + Formatação Tipográfica Apple no Layout Atual:**
  - **Motor Dual Theme "Cupertino Dark" & "Cupertino Light" (`app/globals.css`):**
    - Implementação de variáveis CSS nativas (`--cupertino-bg`, `--cupertino-card`, `--cupertino-border`, `--cupertino-blue`, `--cupertino-green`, `--cupertino-red`, etc.) para dark mode (`#0B0C0E` / cards `rgba(20,22,26,0.78)`) e light mode (`#F2F2F7` / cards `rgba(255,255,255,0.88)`).
    - Mapeamento universal de superfícies legadas (`.bg-slate-950`, `.bg-slate-900`, `.bg-slate-800`), garantindo contraste automático imediato de textos, inputs e modais.
    - Script inline anti-flicker no `<head>` de `app/layout.tsx` para sincronização instantânea de tema antes do paint.
  - **Formatação Tipográfica Apple SF Pro / Inter:**
    - Família de fontes padrão Apple: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif`.
    - Ativação de precisão óptica e números tabulares: `font-feature-settings: "cv02", "cv03", "cv04", "cv11", "tnum"` com `-webkit-font-smoothing: antialiased`.
    - Dígitos monetários 100% nítidos com `font-semibold tracking-[-0.03em] tabular-nums`, removendo text-shadows e drop-shadows fluorescentes sobre números.
    - Cantos arredondados squircle Apple (`rounded-2xl` / 20px) sem filetes neon rosa/roxo.
  - **Segmented Control Apple na Topbar:**
    - Seletor deslizante nativo iOS/macOS com botões "☀️ Claro" e "🌙 Escuro", persistido no `localStorage` (`coindex_cupertino_theme`, padrão "dark").
  - **Padronização Cromática dos Componentes, KPIs, Gráficos e Identidade:**
    - Sidebar e botão "+ Novo Lançamento" atualizados para Apple System Blue (`#0A84FF` / `#0070E0`).
    - 4 KPIs Principais: Entradas (`#30D158`), Saídas (`#FF453A`), Aportes (`#0A84FF`), Balanço / Saldo Livre (`#64D2FF` / `#30D158` / `#FF453A`).
    - Gráfico de Patrimônio: Curva de Patrimônio Acumulado em `#0A84FF` e curva suave de Aportes Brutos em `#5E5CE6`.
    - Gráfico Donut de Despesas: Paleta oficial Apple Cupertino `['#0A84FF', '#30D158', '#FF9F0A', '#BF5AF2', '#FF453A', '#64D2FF', '#5E5CE6', '#8E8E93']`.
    - Identidade Visual: Logo `CoindexLogo` e Favicon `icon.svg` atualizados para o gradiente de alta fidelidade Cupertino (`#0A84FF` -> `#5E5CE6` -> `#30D158`).
- **Sprint 28 — Correção Global de Sobreposição / Stacking Context via Portals e Elevação Dinâmica, Contraste do Termômetro e Unificação de Controles Cupertino:**
  - **Arquitetura Anti-Stacking Context em Três Camadas:**
    - **Camada 1 (Portals com `react-dom`):** `ChartSettingsPopover` reconstruído usando `createPortal(..., document.body)` com `position: fixed` e coordenadas dinâmicas (`getBoundingClientRect()`), sincronizando no scroll e resize e fechando ao clicar fora ou pressionar `Esc`. Possui `z-[9999]` e `max-h-[82vh] overflow-y-auto`, eliminando qualquer sobreposição ou corte por cards inferiores.
    - **Camada 2 (Elevação Automática nos Cards):** `ChartCard` e containers do dashboard com elevação dinâmica (`popoverOpen ? "z-[80] overflow-visible" : "z-10 focus-within:z-[80]"`), complementado por regras em `app/globals.css`.
    - **Camada 3 (Tooltips `"ⓘ"`, Popovers de Filtro e Dropdown de Notificações):** Elevação para `z-[9999]` e classes de Cupertino Glassmorphism nos 7 popovers de coluna da tabela (`TransactionsTableAdvanced.tsx`), central de notificações da topbar e tooltips explicativos do regime contábil e dos 4 KPIs.
  - **Correção de Contraste e Visibilidade do Termômetro:**
    - Segregação óptica dos valores de consumo e teto no card "Termômetro de Gastos Pessoais": valor gasto destacado em verde/vermelho (`#30D158` / `#FF453A`), barra `/` em `text-slate-400` e limite orçamentário em `text-slate-300 font-semibold tabular-nums`, garantindo legibilidade instantânea em light e dark mode.
  - **Unificação dos Controles Segmentados e Cores no Padrão Cupertino:**
    - Pílulas selecionadas padronizadas com Apple Blue (`bg-[#0A84FF] text-white shadow-sm`): barra de filtros rápidos (`Todos | Fixos | Variáveis | Cartão | PIX`), seletores de curva, espessura, altura e zeros no popover de gráficos, abas de filtro na tabela de transações e filtros do mural de notas.
    - Seletor de cores no `ChartSettingsPopover` com anel indicador e checkmark nítidos, sincronizando a cor primária da curva e do degradê instantaneamente.
- **Sprint 29 — Dashboard 2.0 Estilo Copilot Money & Monarch: Bento Grid Inteligente, Curva de Ritmo de Gastos, Projeção 6M, Drill-Down no Donut e Radar de Pendências:**
  - **Hierarquia Bento & Ancoragem dos 4 Slim KPI Cards (Zona 1):**
    - Seção "Resumo Financeiro do Mês" permanentemente ancorada no topo do Dashboard com seletor de Regime Contábil (Competência vs. Caixa).
    - Mini-sparklines SVG puras nos 4 Slim KPI cards renderizando tendências históricas reais de 6 meses (Entradas em `#30D158`, Saídas em `#FF453A`, Aportes em `#0A84FF`, Balanço em `#64D2FF`).
    - Layout padrão inteligente Bento no `DEFAULT_DASHBOARD_LAYOUT` e botão "Restaurar Ordem": Linha 1 (Termômetro 1/1), Linha 2 (Patrimônio & Caixa 1/2 + Para Onde Vai o Meu Dinheiro 2.0 1/2), Linha 3 (Radar de Pendências 1/2 + Limites Bancários 1/2).
  - **Upgrade do Termômetro com Cota Diária e Alocação 50/30/20:**
    - Pílula Copilot Money com cálculo em tempo real da **Cota Diária Livre**: `Restante Livre / Dias Restantes no Mês` (`"Cota Diária Livre: R$ XX,XX / dia"`).
    - Barra segmentada da Alocação Real 50/30/20 com comparação óptica frente aos benchmarks clássicos: Fixos (`#0A84FF`, meta 50%), Variáveis/Pessoais (`#FF9F0A`, meta 30%) e Aportes/Reservas (`#30D158`, meta 20%).
  - **Multi-View Chart Estilo Copilot Money (3 Visões no Card Principal):**
    - Segmented control no cabeçalho alternando instantaneamente entre:
      * **Patrimônio:** Evolução histórica Copilot Money com eixos travados, degradê translúcido e toggle de Aportes.
      * **Ritmo no Mês (Pace):** Gráfico diário comparando linha linear ideal vs. curva real acumulada de gastos (verde quando dentro do ritmo, vermelho quando acima).
      * **Projeção 6M (Futuro):** Barras empilhadas dos próximos 6 meses somando custos fixos ativos (`staticStatus`) e parcelas futuras de cartões cadastradas, indicando comprometimento médio e % da renda base.
  - **"Para Onde Vai o Meu Dinheiro 2.0" com Drill-Down Interativo:**
    - Categorias no Donut interativas (`cursor-pointer`). Ao clicar em uma categoria, expande painel detalhado de drill-down com transações formatadas em `DD-MM-YYYY`, comparativo percentual `vs. mês anterior` e botão `"← Voltar"`.
  - **Widget "Radar de Pendências & Próximos Vencimentos":**
    - Sub-abas especializadas: Fixos a Lançar (com botão 1-clique "Lançar" individual e "Lançar Todos"), Contas Pendentes (com botão 1-clique "✓ Dar Baixa") e Vencimentos/Fechamentos de Faturas de Cartão.
- **Sprint 30 — Motor de Rendimento Automático de Investimentos via API Oficial do Banco Central do Brasil + Curva de Juros Acumulados CDI no Gráfico "Evolução do Meu Patrimônio":**
  - **Rota Oficial do Banco Central do Brasil (`app/api/market-rates/route.ts`):**
    - Consulta em tempo real à API oficial do Sistema Gerenciador de Séries Temporais (SGS) do Banco Central do Brasil (Série `4389`: CDI anualizada base 252 dias úteis).
    - Cache revalidado de 1 hora (`revalidate: 3600`) e fallback resiliente offline para `12.15% a.a.` em caso de instabilidade de rede.
    - Retorno estruturado: `{ cdiAnnualRate, dailyFactor252, updatedAt, source }`.
  - **Motor Matemático Puro de Capitalização Diária (`app/lib/domain/investment-yield.ts`):**
    - Cálculo composto em dias úteis (segunda a sexta, base 252 d.u./ano): `dailyRate = ((1 + cdiAnnualRate / 100) ** (1 / 252) - 1) * (cdiPercentage / 100)`.
    - Extração automática de percentual do CDI via Regex `/(\d+(?:[.,]\d+)?)\s*%\s*(?:do\s*)?CDI/i` (com fallback inteligente de 115% para Caixinha Turbo e 100% para outros aportes).
    - Acumulação composta de Rendimento Bruto (`grossYieldAccumulated`) e Rendimento Líquido Estimado (`netYieldEstimated`) via tabela regressiva de IR de Renda Fixa (22,5% até 180d, 20% até 360d, 17,5% até 720d e 15% acima).
    - Suporte a ajuste manual no centavo exato: **"Ajuste de Saldo Real do App (Nubank/BTG)"**, persistido no `localStorage`.
  - **Redesign Multi-Séries do Gráfico "Evolução do Meu Patrimônio":**
    - Cabeçalho executivo com Badge Cupertino ao vivo: `+R$ XXX,XX de Rendimento (115% CDI • BCB Ao Vivo)` e botão de calibração fina de saldo real.
    - Controle segmentado de visões de rendimento: **`[Bruto | Líquido IR | Só Aportes]`**.
    - Gráfico com duas áreas/linhas sobrepostas destacando visualmente os juros ganhos: **Patrimônio Total c/ CDI** (`acumulado`) e **Capital Aportado Puro** (`capitalAportadoPuro`), além de curva opcional de aportes no mês.
    - `PatrimonyCyberTooltip` renovado com tipografia tabular (`tabular-nums`) e 4 métricas alinhadas: Patrimônio Total c/ Juros, Capital Líquido Aportado, Rendimento Acumulado e Aportes/Resgates no mês.
  - **Campo de Indexador no Modal de Lançamentos (`TransactionModal.tsx`):**
    - Quando selecionada a categoria `"Aporte"`, exibe seletor de rendimento com presets rápidos: `115% CDI (Turbo)`, `100% CDI`, `120% CDI` e `Personalizado % CDI`.
  - **Integridade Contábil Rigorosa:** O rendimento da Caixinha valoriza o patrimônio líquido acumulado, mas NUNCA infla as receitas operacionais do mês nem o Saldo Livre para Gastar da conta corrente enquanto não resgatado.
- **Sprint 31 — Reformulação Arquitetural do Dashboard & Interface: Fusão do Layout "02. Linear Top-Nav Cockpit" com "03. Apple Wallet Split-View", Unificação Compacta de Cartões/Limites, Radar Poligonal de Saúde Financeira e Universal Drag-and-Drop:**
  - **Navegação "02. Linear Top-Nav Cockpit" com Modo Alternável (`app/page.tsx`):**
    - Implementação do estado persistido `navLayoutMode: "topnav" | "sidebar"` via `coindex_nav_mode` no `localStorage`.
    - Modo `topnav` (Padrão inicial): Oculta a barra lateral vertical em desktop (`lg:hidden`), liberando 100% da largura útil da tela (`ml-0 w-full`), renderizando uma barra de comandos no topo ultra-elegante (`h-14`) com:
      * Esquerda: Logo `CoindexIcon` + `Coindex` + botão de toggle de layout `"⇄ Barra Lateral"`.
      * Centro: Pílulas horizontais segmentadas para todas as abas principais com destaque em Apple Blue (`#0A84FF`), além de sub-barra de abas com scroll suave para dispositivos móveis (`< lg`).
      * Direita: Atalho de busca `⌘K`, seletor de mês compacto, pílula de status de sincronização (🟢), toggle de tema (☀️/🌙), modo privacidade (👁️), sino de notificações (🔔 com dropdown) e botão de ação rápida `+ Novo`.
    - Modo `sidebar`: Mantém a barra vertical esquerda retrátil com botão `"⇄ Barra Topo"` para fácil transição entre modos de visualização.
  - **Apple Wallet Stack & Limites Compactos (`wallet_card` em `app/page.tsx`):**
    - Fusão definitiva dos gráficos legados `credit_chart` e `bank_limits_chart` em um único card bento ultra-compacto.
    - Topo: Apple Wallet Stack com gradientes autênticos de cada emissor (Nubank purple, Inter orange, BTG navy, C6 carbon, XP graphite), microchip dourado, ícone contactless, empilhamento dinâmico (`-mt-10`), seleção por foco interativo (`selectedWalletCardId`), faturas atuais, limites e botão de pagamento.
    - Base: Barras lineares compactas de limites bancários com resumo consolidado (Limite Total, Disponível, % Usado) e barras de progresso ultrafinas (`h-1.5`).
  - **Novos Cards Analíticos dos Protótipos 02 e 03 (`app/page.tsx`):**
    - `category_chart`: Donut minimalista centralizado (`h-[175px]`) acompanhado de Grid de Categorias em 2 colunas com ícones semânticos, valores tabulares, percentuais e barras de progresso `h-1.5`, com expansão e drill-down interativo em drawer/modal.
    - `cashflow_recent`: Card híbrido com controle segmentado entre **Mini-Fluxo Mensal 6M** (barras agrupadas para Entradas, Saídas e Aportes) e **Feed de Lançamentos Recentes** (últimas 5 transações com badges de status clicáveis para alternância rápida entre Pago e Pendente).
    - `pending_radar`: Evolução com a 4ª aba **"Saúde (Score)"** trazendo um gráfico poligonal `<RadarChart>` (Recharts) com 5 eixos vitais (Poupança, Margem Livre, Controle Fixos, Saúde Limites, Teto Pessoal), pontuação global de 0 a 100 e diagnóstico inteligente de otimização.
  - **Universal Drag-and-Drop & Setas Rápidas de Reordenação (`app/components/ChartCard.tsx`):**
    - Suporte a tamanhos bento balanceados: `"two-thirds"` (col-span-8), `"third"` (col-span-4), `"half"` (col-span-6) e `"full"` (col-span-12) com grid de 12 colunas no padrão Split-View (68% Esquerda / 32% Direita).
    - Controles de reordenação em dobro: arrastar e soltar nativo via HTML5 Drag and Drop com indicador visual translúcido + setas de reordenação instantânea `[← | →]` no cabeçalho de cada card.
    - Layout persistido no `localStorage` sob a chave `coindex_dashboard_layout_v3`, com higienização automática contra cartões legados órfãos.
- **Sprint 32 — Retorno Exclusivo da Sidebar Lateral Retrátil com Gaveta, Correção Definitiva do Drag-and-Drop no Card "Radar de Pendências & Saúde Financeira" em Grid Único e Motor de Auto-Scroll Contínuo 60fps ao Arrastar Cards:**
  - **Retorno Exclusivo da Sidebar Lateral com Gaveta (`app/page.tsx`):**
    - Remoção completa do modo `navLayoutMode === "topnav"`, eliminando a barra de abas redundante no topo e os botões de alternância `⇄ Barra Topo` / `⇄ Barra Lateral`.
    - Preservação exclusiva da Sidebar Lateral Esquerda Retrátil (`sidebarOpen` / `setSidebarOpen`), com gaveta recolhível mantendo alinhamento de ícones quando recolhida, menu e ações rápidas quando expandida, e rodapé com perfil e status de sincronização.
    - Cabeçalho superior unificado com seletor de mês, status de sync em tempo real, sino de notificações (com central dropdown), alternador Cupertino claro/escuro, modo de privacidade por olho e botão `+ Novo Lançamento`.
  - **Grid Unificado 100% Ordenável & Auto-Cura de Layout (`app/lifeos-data.tsx` e `app/page.tsx`):**
    - Eliminação de qualquer divisão estática de colunas que isolasse cards do fluxo ordenável.
    - Todos os cards do Dashboard passam a ser renderizados dentro de um **container único `<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">`** iterando sobre o array `effectiveDashboardLayout`.
    - Definição oficial de `ALL_DASHBOARD_WIDGET_IDS`:
      * `"thermometer"` (Termômetro de Gastos Pessoais & Cota Diária)
      * `"patrimony"` (Central Analítica de Patrimônio & Caixa c/ Rendimento CDI)
      * `"wallet_limits"` (Cartões & Limites — Apple Wallet Stack)
      * `"expenses"` (Despesas Mensais & Categorias Compact)
      * `"cashflow_recents"` (Fluxo de Caixa & Atividades Recentes)
      * `"pendencies"` (Radar de Pendências & Saúde Financeira)
    - Função de auto-cura `normalizeDashboardLayout`: normaliza chaves legadas (`pending_radar`, `wallet_card`, `patrimony_chart`, etc.), higieniza duplicatas e injeta automaticamente qualquer ID faltante de `ALL_DASHBOARD_WIDGET_IDS` na hidratação inicial (`localStorage` e Supabase).
    - O card `"Radar de Pendências & Saúde Financeira"` passa a ser envolvido pelo `<ChartCard>` padrão com `draggable={true}`, `onDragStart`, `onDragEnter`, `onDragEnd`, setas de navegação e botão para o topo.
  - **Motor de Auto-Scroll Contínuo 60fps no Drag-and-Drop (`Edge Auto-Scroll`):**
    - Injeção de `mainScrollRef` no elemento `<main>` do Dashboard.
    - Listener global no `window` monitorando `clientY` durante o arraste (`draggingWidgetId !== null`).
    - Loop de alta performance `requestAnimationFrame`:
      * **Zona de Subida Automática (Topo):** Ativada quando `clientY < 160px`, rolando simultaneamente o container `<main>` e o `window` com velocidade proporcional `speed = Math.max(6, Math.round(((160 - clientY) / 160) * 28))`.
      * **Zona de Descida Automática (Base):** Ativada quando `clientY > window.innerHeight - 160px`, rolando para baixo com aceleração proporcional.
    - **Reordenação ao Vivo (`Live Reorder on DragEnter`):** Troca dinâmica e instantânea de posição dos cards no estado `dashboardLayout` durante o arraste, com destaque de anel `border-[#0A84FF] ring-2 ring-[#0A84FF]`, permitindo que o usuário visualize os cards trocando de lugar enquanto a página rola até o topo.
    - **Botão Rápido "⇈" (Enviar para o Topo):** Novo controle no cabeçalho do `<ChartCard>` que move qualquer card diretamente para a primeira posição com 1 clique.
- **Sprint 33 — Auditoria Técnica & Blindagem Matemática, Contábil e de Sincronização (Frentes A, B, C e D — Zero Alterações Visuais de UI):**
  - **Frente A (Cálculos Matemáticos, Finanças, Datas e Negócio):**
    - **AUD-01 (Precisão PU de 8 Casas na Capitalização Diária CDI em `investment-yield.ts`):** O loop diário em dias úteis (`252 d.u.`) opera agora com agrupamento em buckets de percentual de CDI (`cdiPercentage`) mantendo o saldo e o rendimento composto em ponto flutuante de alta precisão IEEE 754, aplicando arredondamento para centavos apenas nas fronteiras mensais de geração dos pontos do gráfico e totais finais. Elimina perda de micro-centavos por truncamento cumulativo em saldos menores.
    - **AUD-02 (Divisão Segura da Cota Diária Livre em `page.tsx` e `finance.ts`):** Proteção do cálculo de dias restantes com piso mínimo de 1 dia (`Math.max(1, totalDays - currentCalendarDate.day + 1)`), eliminando divisão por zero no último dia do mês e garantindo valor finito (`Number.isFinite`).
    - **AUD-03 (Parser Mini-Calculadora com Separador de Milhar pt-BR em `finance.ts` e `lifeos-data.tsx`):** Expressão regular aprimorada `expr.replace(/\.(?=\d{3}(?:[.,+\-*/\s)]|$))/g, "").replace(/,/g, ".")` removendo pontos de milhar apenas quando seguidos de 3 dígitos, aceitando fórmulas complexas como `"1.234,56 + 2.500"`.
    - **AUD-05 & AUD-13 (Ordenação Cronológica de Datas BR & Compatibilidade Bidirecional):** Substituição de `.localeCompare` lexicográfico em `DD-MM-YYYY` por `compareDatesBR(a, b)` (conversão para ISO `YYYY-MM-DD`) em `page.tsx` (linhas 1565 e 2850) e `VehiclesTab.tsx` (linha 173). Suporte bidirecional a `invoiceMonth ?? invoiceCompetence` e `cardUsed ?? cardName`.
    - **AUD-08 (Consumo Real km/L com Abastecimentos Parciais Intermediários em `VehiclesTab.tsx`):** Implementação de acumulador de litros e custos para abastecimentos com `fullTank: false`, calculando `deltaKm / totalPeriodLiters` de forma exata ao completar o ciclo no próximo tanque cheio (`fullTank !== false`). Proteção de divisão por zero em `tcoPerKm`.
    - **AUD-09, AUD-10, AUD-11, AUD-12, AUD-17, AUD-32 (Operadores Nulos, Rateio Pessoal e Deduplicação):** Substituição de `||` por `??` onde `0` é valor numérico válido (`limit`, `balance`, `personalAmount`). Subtração estrita de parcelas de terceiros nos lançamentos divididos (`isSplit`) e exclusão de filhos (`isSplitChild`) em visões operacionais. Deduplicação inteligente de custos fixos já faturados na Projeção 6M. Proteção finita com `Number.isFinite` no Radar de Saúde Financeira e Alocação 50/30/20. Blindagem de `isResgateCategory` para nunca classificar "Aporte" ou "Caixinha" como resgate.
  - **Frente B (Persistência, Sincronização, Integrações e Segurança):**
    - **AUD-04 (Tombstone Undo Resiliente em `user-storage.ts` e `lifeos-data.tsx`):** Exportação de `removeTombstone` e `removeTombstones` com suporte a chamadas flexíveis. Nas ações de "↩ Desfazer" de exclusões de lançamentos ou séries de parcelas no Toast, o tombstone é imediatamente removido do namespace do usuário e a marcação `deletedAt` é expurgada do objeto restaurado.
    - **AUD-14, AUD-21, AUD-22, AUD-24 (Paginação PostgREST 1.000 Linhas no Supabase & Safe Merge):** Implementação de loop paginado automático de 1.000 em 1.000 registros via `.range(page * 1000, (page + 1) * 1000 - 1)` em `fetchAllCoindexData`, ultrapassando o limite padrão silencioso do PostgREST. Coerção numérica segura com `Number()` e filtragem estrita de `!deleted_at`. Safe merge reativo na hidratação preservando lançamentos locais offline e respeitando tombstones.
    - **AUD-15 (Pace Exato Strava/Bio):** Função padronizada `formatPace(timeInSeconds, km)` gerando `"M:SS /km"` com arredondamento preciso de segundos `Math.round(timeInSeconds / km)`.
    - **AUD-18 & AUD-19 (Timeout AbortSignal e Blindagem de Fórmulas CSV):** Timeout estrito de 4500ms via `AbortSignal.timeout(4500)` na rota oficial do Banco Central (`/api/market-rates`). Regex avançada contra CSV/DDE Formula Injection (`/^[\s\t\r\n]*[=+\-@|]/`) na exportação de planilhas.
  - **Frente C (Next.js 16, TypeScript, Performance e Estabilidade):**
    - **AUD-26 (Instância Estática BRL_FORMATTER):** Formatador `BRL_FORMATTER` reutilizável em `finance.ts` eliminando instanciações repetitivas de `Intl.NumberFormat`.
    - **AUD-27 (Cancelamento Seguro do Drag-and-Drop em Edge Auto-Scroll):** Listeners de segurança no `window` para eventos de `"drop"`, `"dragend"` e `"blur"`, cancelando o loop de `requestAnimationFrame` e zerando referências de arraste em caso de soltura externa.
    - **AUD-28 (Tratamento Robusto de JSON em `/api/auth`):** Proteção com bloco `try/catch` ao parsear `request.json()` na rota de autenticação, retornando HTTP 400 com mensagem amigável para payloads malformados.
  - **Frente D (Dossier e Garantia de Zero Regressão Visual):**
    - 100% de preservação de todas as classes Tailwind, CSS, cores, componentes e estilos visuais.
    - Zero erros em `npx tsc --noEmit` e compilação de produção com sucesso.

- **Sprint 34 (Remoção dos Botões `<`, `>` e `⇈`, Motor de Auto-Distribuição Inteligente de Altura dos Cards sem Espaços Vazios, Arquitetura Cupertino Light 2.0 e Animações Apple Spring Engine):**
  - **Limpeza do Cabeçalho do `<ChartCard>`:** Remoção completa dos botões legados `<`, `>`, `⇈`. O cabeçalho agora contém estritamente: (1) `GripVertical` para reordenação livre via Drag-and-Drop, (2) botão de tamanho com rótulo real (`1/3`, `1/2`, `2/3`, `1/1`), e (3) engrenagem de configurações com menu portal desacoplado. O container de títulos foi flexibilizado com `min-w-0`, `overflow-hidden` e `text-ellipsis` evitando truncamento prematuro.
  - **Auto-Distribuição Inteligente de Altura dos Cards (Grid Bento 100% Otimizado):**
    - Contêiner de grade unificado configurado com `items-stretch` em `app/page.tsx`.
    - Raiz do `<ChartCard>` padronizada com `h-full flex flex-col justify-between cupertino-card-hover`, garantindo que cards em uma mesma linha alinhem suas alturas perfeitamente.
    - Container interno de conteúdo com `flex-1 flex flex-col justify-between`.
  - **Central Analítica de Patrimônio & Caixa (2/3) com Faixa Executiva de Telemetria:**
    - Área dos gráficos (Patrimônio, Ritmo/Pace e Projeção 6M) flexibilizada com `flex-1 min-h-[260px] w-full`.
    - Adição no rodapé do card da **Faixa Executiva de Telemetria Patrimonial** com 4 métricas compactas: (1) `Média de Aporte/Mês`, (2) `Melhor Mês da Série` (R$ e mês), (3) `Rendimento Médio CDI` (+R$/mês), e (4) `Projeção 12 Meses` (capitalização composta futura).
  - **Novo Layout de Categorias em 2 Linhas no Card de Despesas:**
    - Substituição da linha única comprimida por layout vertical de 2 linhas:
      - **Linha 1:** Ícone semântico + nome completo da categoria sem truncamento + pílula com `%` do total.
      - **Linha 2:** Valor em R$ com números tabulares alinhados à esquerda + barra de progresso suave (`h-1.5`) com a cor da categoria (`.progress-bar-apple`).
    - Grade com `gap-2.5` preenchendo 100% da coluna sem espaços ociosos.
  - **Arquitetura Cupertino Light 2.0 com View Transitions API:**
    - Criação da classe `.wallet-physical-card` no Apple Wallet Stack, blindando os gradientes de marca exclusivos dos cartões físicos virtuais (Nubank roxo, Inter laranja, BTG marinho) para nunca sofrerem clareamento no modo claro.
    - Hierarquia de 4 superfícies Apple no tema claro: Nível 0 (`#F2F2F7`), Nível 1 (`#FFFFFF` nos cards bento), Nível 2 (`#F5F5F7` em inputs e subcards) e Nível 3 (menus flutuantes com 96% de opacidade e blur 20px).
    - Alternância de tema via **View Transitions API** (`document.startViewTransition`) com expansão radial física a partir das coordenadas do clique do mouse (`clip-path: circle(...)`) em 550ms `cubic-bezier(0.22, 1, 0.36, 1)`.
  - **Apple Spring Motion Engine:**
    - Animação de entrada suave `@keyframes cupertinoFadeSlideUp` e classe `.animate-cupertino-in` com curva de aceleração de molas iOS (`cubic-bezier(0.16, 1, 0.3, 1)`) em todas as trocas de abas primárias, secundárias e sub-visões do dashboard.
    - Classe `.cupertino-card-hover` adicionando elevação tátil (`translate-y(-2px)`) e halo translúcido nos 4 Slim KPI cards e em todos os cards do dashboard.

- **Sprint 35 (Altura Compacta Funcional nos Gráficos, Compactação Vertical, Restauração da Paleta Cupertino Midnight Slate e Correção dos 4 KPIs no Modo Claro):**
  - **Reconexão Total da Opção de Altura dos Gráficos:**
    - Removidos `flex-1` e `min-h-[260px]` dos contêineres de gráficos da Central Analítica (Patrimônio, Ritmo/Pace, Projeção 6M), Donut de Despesas e Fluxo de Caixa 6M, que antes forçavam esticamento vertical e ignoravam o seletor.
    - Implementação do helper reativo `getChartHeightPx(chartId, defaultPx = 175)` em `app/page.tsx` conectado em tempo real a `getWidgetSettings` e `chartConfigs[chartId]?.height`.
    - Novos padrões de altura rigorosamente aplicados: `"compact"` (Compacta — novo padrão inicial) em **175px**, `"normal"` (Padrão) em **220px**, e `"tall"` / `"expanded"` (Ampla) em **290px**.
  - **Compactação do Card "Cartões & Limites (Apple Wallet)":**
    - Redução do padding dos cartões físicos (`p-3.5`), sobreposição ajustada para `-mt-12`, espaçamentos compactos nos cabeçalhos (`mb-2`) e rodapés (`mt-2 pt-1.5`).
    - Pílulas de limites consolidadas em barra slim (`py-1.5 px-2.5`) e lista de bancos slim (`py-1.5 px-2.5` com `max-h-36`), reduzindo a altura do card em mais de 110px para equilibrar a grade com a Central Analítica.
  - **Categorias sem Truncamento no Card de Despesas:**
    - Exibição em 1 coluna de largura total (`grid-cols-1`) quando o card estiver ao lado do Donut (e 2 colunas apenas quando em tela cheia `1/1`), garantindo que itens extensos como `"Combustível"`, `"Manutenção Veículo"` e `"Alimentação"` não sofram truncamento prematuro.
  - **Restauração da Paleta Escura Original "Cupertino Midnight Slate":**
    - Coesão visual restaurada em `app/globals.css` sob `:root, html[data-theme="dark"]`:
      - `--cupertino-bg: #0B0E14` (Fundo principal Midnight profundo e uniforme).
      - `--cupertino-sidebar: #0E121B` (Sidebar e Topbar integradas).
      - `--cupertino-card: #131824` (Cards principais em Grafite-Azulado escuro).
      - `--cupertino-card-elevated: #1A2030` (Sub-cards internos, inputs e pílulas).
      - `--cupertino-input: #0D111A`.
      - `--cupertino-border: rgba(255, 255, 255, 0.08)`.
    - Expurgados resquícios antigos de tons roxos (`rgba(19, 9, 39, 0.82)`) e fundos pretos soltos (`#07030f`), unificando `<main>`, sidebar, header e dashboard em `var(--cupertino-bg)`.
  - **Correção Definitiva dos 4 KPIs e Background no Modo Claro:**
    - **Bug 1 Solucionado:** Sob `html[data-theme="light"]`, aplicada a regra `background-image: none !important; background-color: #F8FAFC !important; border: 1px solid rgba(15, 23, 42, 0.08) !important;` na classe `.kpi-slim-card`, eliminando gradientes escuros inline que mantinham os cards pretos no tema claro.
    - Títulos dos 4 KPIs com legibilidade ideal em `#475569` (`.kpi-title`), e valores contrastados: Entradas (`#15803D`), Saídas (`#DC2626`), Aportes (`#0066CC`) e Saldo Líquido (`#0284C7`).
    - **Bug 2 Solucionado:** Removidas caixas brancas intermediárias. O fundo uniforme da página à direita da sidebar permanece cinza-gelo `#F2F4F8` (`var(--cupertino-bg)`), enquanto apenas os cards individuais permanecem brancos `#FFFFFF`.
    - **Bug 3 Solucionado:** Controles segmentados inativos estilizados com fundo `#EEF2F6` e texto `#334155`, e botões ativos com fundo `#0A84FF` e texto `#FFFFFF` puro.
- **Sprint 36 (Novembro de 2026 — Integração Strava API Oficial OAuth2, Suporte Dual de Escopo, Callback 1-Clique e Feed de Atividades na Aba Bio):**
  - **Rota Oficial Backend (`app/api/strava/route.ts`):**
    - Métodos `POST` e `GET` com suporte a timeouts controlados de 8000ms (`AbortSignal.timeout(8000)`).
    - Validação de `{ clientId, clientSecret, refreshToken }` com parsing tolerante de fallback para variáveis de ambiente.
    - Renovação automática de token no endpoint oficial Strava OAuth (`POST https://www.strava.com/oauth/token` com `grant_type: refresh_token`). Retorno com erro estruturado 401 caso chaves sejam recusadas.
    - Consultas simultâneas em paralelo: Perfil do Atleta (`/athlete`), Estatísticas Consolidadas (`/athletes/{id}/stats`) e Feed de Atividades (`/athlete/activities?per_page=30`).
    - **Algoritmo de Pace Sem Bug de :60:** Tratamento de arredondamento nos segundos para que `5:59.8` avance o minuto para `6:00/km` em vez do formato defeituoso `5:60/km`.
    - **Modo Dual de Escopo (`detailed` vs `read_only`):** Caso o token do usuário tenha apenas escopo básico `read` (retornando 401/403 na listagem detalhada de corridas), o sistema não lança erro; constrói cards consolidados reais a partir de `recent_run_totals`, `ytd_run_totals` e `all_run_totals` e fornece a URL direta de autorização para o escopo completo `activity:read_all`.
  - **Rota de Callback OAuth2 1-Clique (`app/api/strava/callback/route.ts`):**
    - Recebe `code`, `state` e troca pelo `refresh_token` permanente com escopo completo via `grant_type: authorization_code`.
    - Interface HTML autônoma estonteante com Design System Cupertino Midnight Slate, avatar do atleta, botão de cópia de token em 1 clique, integração por `postMessage` bidirecional com a aba do Coindex e auto-fechamento após 3,5 segundos.
  - **Blindagem do Frontend (`app/page.tsx` e `app/SecondaryTabs.tsx`):**
    - Validação estrita de `content-type: application/json` antes de efetuar parse do corpo retornado por `/api/strava`, impedindo que respostas 404/HTML de proxies quebrem a aplicação com syntax errors.
    - Persistência imediata no `localStorage` e no Supabase (`stravaConfig`, `stravaStats` e `stravaActivities`).
    - Novo componente e tabela de telemetria esportiva **"Minhas Corridas & Treinos Recentes"** na aba Bio, com data formatada, tipo, distância (km), duração (min), pace médio, altimetria (m) e calorias estimadas.
    - Aviso de upgrade com botão **"🔓 Liberar Atividades Detalhadas (OAuth)"** acionável em popup sem recarregar a aplicação.
- **Sprint 37 (Novembro de 2026 — Ingestão Bancária CSV/OFX, Mobile PWA & Bottom Bar, Simulador "Posso Comprar?", Fluidez 120Hz e Cibersegurança Zero-Trust):**
  - **Frente 1 (Rafael Albuquerque — Ingestão Bancária em `app/lib/domain/bank-ingest.ts` e `app/TransactionsTableAdvanced.tsx`):**
    - Parser client-side determinístico para extratos `.csv` (Nubank, Inter, BTG, C6, genéricos) e `.ofx` padrão Open Financial Exchange.
    - Geração de chave única `externalId` (`${date}_${toCents(amount)}_${normalizedDesc}`) para detecção e separação automática de transações novas vs. duplicadas.
    - Motor inteligente de auto-categorização baseado em catálogo oficial (Uber, iFood, Combustível, Supermercado, Assinaturas, etc.).
    - Botão `"📥 Importar Extrato (CSV/OFX)"` na barra superior com modal de drag-and-drop, preview detalhado e confirmação em lote em 1 clique.
  - **Frente 2 (Bianca Takahashi — Mobile PWA & Bottom Bar em `public/manifest.json`, `app/layout.tsx`, `app/page.tsx` e `app/TransactionsTableAdvanced.tsx`):**
    - Manifesto PWA oficial (`public/manifest.json`) com tema `#0B0E14` e modo standalone vinculado aos metadados Apple no `app/layout.tsx`.
    - Cupertino Mobile Bottom Navigation Bar (`lg:hidden fixed bottom-0 left-0 right-0 z-50`) com backdrop-blur-2xl e 5 atalhos para polegar (`Dashboard`, `Lançamentos`, botão central elevado `+ Novo`, `Veículos` e `Cartões`).
    - Visão responsiva em Cards Táteis Compactos (`md:hidden`) na tabela de lançamentos, mantendo a tabela completa em `hidden md:block`.
  - **Frente 3 (Ícaro Vasconcelos — Simulador "Posso Comprar?" em `app/lib/domain/purchase-simulator.ts` e `app/SecondaryTabs.tsx`):**
    - Motor preditivo puro calculando valor de parcelas (`1x` a `12x`), nova Cota Diária livre (`R$/dia`) com delta de redução e custo de oportunidade em 12 meses a `115% do CDI` na Caixinha Turbo.
    - Painel interativo na aba Segundo Cérebro (`activeTab === "brain"`), permitindo carregar desejos de compra em 1 clique e receber veredito comportamental (`APROVADO TRANQUILO`, `ATENÇÃO AO TETO MENSAL`, `RECOMENDADO ADIAR`).
  - **Frente 4 (Davi Kroner — Fluidez 120Hz em `app/TransactionsTableAdvanced.tsx` e `app/globals.css`):**
    - Utilização de `useDeferredValue` do React para que a digitação nas buscas textuais ocorra a 120fps com latência zero de teclado.
    - Otimização de renderização acelerada por GPU (`transform: translateZ(0)`, `backface-visibility: hidden`) e respeito estrito a `@media (prefers-reduced-motion: reduce)`.
  - **Frente 5 (Letícia Varella — Cibersegurança Zero-Trust em `next.config.ts` e `supabase/migrations/0001_coindex_zero_trust_rls.sql`):**
    - Headers de segurança HTTP estritos no `next.config.ts` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Robots-Tag: noindex, nofollow`, `Permissions-Policy`).
    - DDL e políticas documentadas de Row Level Security (RLS) estritas em todas as 9 tabelas do Supabase, com índices compostos por `(user_id, date)`.

  - **Hotfix Sprint 36.1 (Novembro de 2026 — Blindagem de Serialização do Strava e Prevenção de SyntheticEvent Circular):**
    - **Diagnóstico da Causa Raiz:** Ao disparar `onClick={syncStravaFromApi}` em botões de sincronização, o React repassava o evento `SyntheticEvent` (contendo referências circulares de DOM e `HTMLButtonElement`) como primeiro argumento. Como a função aceitava um `overrideConfig`, ela tratava o evento como credenciais, quebrando no `JSON.stringify` (`Converting circular structure to JSON --> starting at object with constructor 'HTMLButtonElement'`).
    - **Solução Arquitetural em 3 Pontos:**
      1. Guard anti-evento `isDomOrReactEvent(val)` em `app/page.tsx` para descartar qualquer objeto de evento do DOM/React passado como parâmetro e usar o estado `stravaConfig`.
      2. Higienização estrita com `toCleanStr` montando objeto plano `cleanPayload` com strings primitivas higienizadas antes de qualquer chamada a `JSON.stringify` (no `fetch("/api/strava")`, no `localStorage` e no Supabase).
      3. Binding limpo com arrow functions explícitas `onClick={() => syncStravaFromApi()}` em todos os botões do sistema (`app/SecondaryTabs.tsx`) e extração controlada de valores nos 4 inputs de credenciais.

  - **Hotfix Sprint 37.1 (Novembro de 2026 — Correção Definitiva dos Modais Fora de Centro via createPortal e Extinção do Transform Trap):**
    - **Diagnóstico da Causa Raiz:** No CSS, qualquer elemento ancestral com propriedade `transform` diferente de `none` (como `transform: translateY(0) scale(1)` ou `transform: translateZ(0)`) estabelece um novo *containing block* para elementos filhos com `position: fixed`. Isso fazia com que modais calculassem sua altura e posição relativa ao container de página de 5000px em vez da janela visível (`100dvh`), gerando modais esticados ou fora do centro.
    - **Soluções Implementadas:**
      1. Correção no `app/globals.css`: `@keyframes cupertinoFadeSlideUp` com `100% { opacity: 1; transform: none; }` e remoção de `transform: translateZ(0)` e `perspective: 1000px` de containers externos de página.
      2. Renderização de todos os modais (`TransactionModal`, modal de importação OFX/CSV, Command Palette `Ctrl+K`, `ProfileModal`, `deleteSeriesModal` e `confirmModal`) diretamente em `document.body` via `createPortal`.
      3. Overlays com `fixed inset-0 w-screen h-dvh z-[9999] overflow-hidden` e cards com `max-h-[86dvh]` com scroll interno customizado e cabeçalho/rodapé fixos.
      4. Substituição de resquícios de paleta roxa legada (`#110724`, `border-[#A855F7]`) pela paleta oficial Cupertino Glassmorphism (`bg-[var(--cupertino-card)] border border-[var(--cupertino-border)]`).

  - **Sprint 38 (Novembro de 2026 — Correção da Digitação de Data no TransactionModal, Reforma Slim de Valores a Receber e Central Analítica de Bioimpedância & Strava Progress):**
    - **Passo 1 — Correção da Digitação de Data (`SmartDateInputBR` em `app/components/TransactionModal.tsx` e blindagem em `app/lib/domain/date-br.ts`):**
      - Substituição dos campos nativos `<input type="date">` pelo componente inteligente `SmartDateInputBR` com máscara progressiva visual (`DD/MM/AAAA`), auto-commit de 8 dígitos para formato canônico `DD-MM-YYYY` e botão integrado com popover de calendário nativo via `.showPicker()`.
      - Extinção do bug de reset do dia e mês causado por strings temporárias emitidas pelos navegadores ao digitar o primeiro dígito do ano (ex: `"0002-11-03"`).
      - Blindagem em `app/lib/domain/date-br.ts` com guard `year < 1000` em `parseDateParts` para rejeitar anos parciais.
      - Botões de seleção rápida "Hoje" e "Ontem" com foco e preenchimento instantâneo.
    - **Passo 2 — Reforma Slim da Tabela de Valores a Receber (`app/SecondaryTabs.tsx`):**
      - **Preservação do Valor Original Quitado:** Extinção do `R$ 0,00` fantasma ao quitar 100% de uma dívida. A coluna "Restante / Total" preserva o valor integral emprestado em verde menta (`#30D158` / `text-emerald-400 font-extrabold`) com badge "100% Quitado".
      - **3 Estados Visuais Claros:** Pendente Integral (total devido em âmbar), Parcialmente Quitado (saldo restante em âmbar, micro barra de progresso horizontal e legenda `Pago: R$ X de R$ Y`) e 100% Quitado (valor total em verde com confirmação).
      - **Compactação Vertical Slim:** Linhas executivas de ~38px com `py-1.5 px-3`, coluna de data em linha única com `whitespace-nowrap tabular-nums min-w-[100px]` e inputs/botões de abatimento parcial compactados em `h-7` (28px).
      - **Barra de Ferramentas de Filtros & Ordenação Inteligente:** Campo de busca rápida por texto (descrição ou devedor), dropdown de devedores únicos, segmented control de situação (`[Todos | Pendentes | Parciais | Quitados]`) e cabeçalhos ordenáveis clicáveis (`Data`, `Descrição`, `Pessoa`, `Situação`, `Restante / Total`) com setas indicativas `ArrowUp` / `ArrowDown` / `ArrowUpDown`.
    - **Passo 3 — Central Analítica de Bioimpedância no Padrão Cupertino (`app/SecondaryTabs.tsx`):**
      - Conexão oficial do `ChartSettingsPopover` com persistência em chave dedicada `fincontrol_chart_settings_bio_weight_chart`, permitindo alternar tipo de gráfico (`area`, `line`, `bar`), curvatura (`monotone`, `linear`, `step`), cor da série e altura (`compact`: 175px, `normal`: 220px, `tall`: 290px).
      - Seletor de período dinâmico `[1M | 3M | 6M | 1A | Tudo]` e seletor de séries visíveis `[Peso + BF% | Só Peso (kg) | Só BF (%) | Rumo à Meta (78kg)]`.
      - Display executivo de alto impacto com Peso Atual em destaque (`text-3xl font-mono text-white`), badge colorida de variação no período (`-1.4 kg (-1.8%)` em verde ou rose) e badge de BF Atual (`15.2%`).
      - Linha de referência horizontal pontilhada (`ReferenceLine`) com a meta física (`Meta 78kg`).
      - Faixa inferior de telemetria com 4 mini-cards executivos: Peso Inicial do Período, Peso Mínimo Atingido, Média do Período e Massa Magra Estimada (kg).
    - **Passo 4 — Nova Central Analítica de Corridas & Pace — Strava Progress (`app/SecondaryTabs.tsx`):**
      - Novo card analítico completo posicionado acima do feed de atividades Strava.
      - Seletor de escala temporal no cabeçalho: `[Dia | Semana | Mês | Ano]`, com motor de agregação agrupando corridas semanais (com pace médio ponderado por distância) e mensais.
      - Seletor de métrica principal: `[Distância (km) | Pace Médio (/km) | Tempo (min) | Calorias]`.
      - Suporte ao `ChartSettingsPopover` (`strava_runs_chart`), altura dinâmica reativa e linha de meta semanal pontilhada (`ReferenceLine` com `annualRunGoalKm / 52` km/semana).
      - Tooltip de alta telemetria esportiva (`StravaCustomTooltip`) com data, nome da atividade, distância, pace formatado, tempo, calorias e altimetria acumulada.
      - Faixa inferior com 4 mini-cards executivos: Distância Total no Período, Melhor Pace Registrado, Maior Distância Única (Longão) e Total de Horas em Movimento (`Xh XXm`).

---

## 8. Comandos de Manutenção & Verificação Rápida

Antes de enviar qualquer commit ou deploy:
```bash
# 1. Verificação de Tipos TypeScript (Obrigatório - 0 erros)
npx tsc --noEmit

# 2. Simulação de Build de Produção
npm run build

# 3. Sincronização com o Repositório Remoto
git add .
git commit -m "feat/fix: mensagem semântica"
git push -u origin HEAD
```
