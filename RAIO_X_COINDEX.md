# RAIO-X TÉCNICO COINDEX (DOSSIÊ COMPLETO DO SISTEMA)
> **Versão da Aplicação:** `0.16.0`  
> **Última Atualização:** 31 de Outubro de 2026 (Pós-Sprint 24 — Refinamento Óptico WCAG no Cyberpunk Neon, Paleta Donut de Alto Contraste, ComposedChart Duplo no Patrimônio e Glossário nos KPIs)  
> **Propósito:** Fonte única da verdade (SSOT) técnica, arquitetural, contábil e de interface para sincronização contínua de contexto entre engenheiros e agentes de IA.

---

## 1. Visão Geral da Arquitetura & Stack Tecnológica

O **Coindex** é uma plataforma corporativa e pessoal de Business Intelligence (BI) financeiro, telemetria patrimonial, gestão de cartões de crédito e telemetria automotiva, construída sob a estética **Cyber-Glassmorphism** e design system **Cyberpunk Neon (Synthwave Spark)**.

### Stack Base:
- **Framework:** Next.js 16.4.2 (App Router, Turbopack, Cache Components, Partial Prefetching).
- **Linguagem:** TypeScript 5 (Modo Estrito / Strict Mode habilitado).
- **Estilização:** Tailwind CSS v4 com temas inline `@theme`, Glassmorphism, scrollbars personalizadas e tipografia tabular global (`tabular-nums`).
- **Visualização de Dados:** Recharts 2.x com Tooltips Cyber-Glassmorphism customizados, eixos travados no zero e supressão global de cursores e halos de foco brancos via CSS.
- **Backend & Persistência:**
  - Supabase PostgreSQL com Row Level Security (RLS) por usuário autenticado.
  - Sincronização offline-first: Hidratação instantânea via cache local (`localStorage`), migração automática no 1º acesso e espelhamento bidirecional resiliente em tempo real.
- **Ícones & Identidade:** Lucide-React + Nova Identidade Vetorial **Fintech Prism** (`CoindexIcon` e `/icon.svg`).
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
│   │   │   └── user-storage.ts            # Isolamento de Cache por Usuário (userId namespace, tombstones & soft delete)
│   │   ├── services/coindex-supabase.ts   # CRUD completo e persistência no Supabase PostgreSQL
│   │   ├── services/spotify-supabase.ts   # Persistência de tokens e preferências Spotify
│   │   └── supabase/                      # Clientes Supabase Client & Server
│   ├── components/
│   │   ├── TransactionModal.tsx           # Modal completo de novo lançamento/edição
│   │   ├── SpotifyModule.tsx              # Player cibernético, telemetria e rateio familiar do Spotify
│   │   ├── VehiclesTab.tsx                # Telemetria automotiva, consumo km/L e Inmetro
│   │   ├── BanksTab.tsx                   # Gestão de contas bancárias, cartões e limites
│   │   ├── ChartSettingsPopover.tsx       # Popover de customização de cores/curvas/tipos de gráficos
│   │   ├── CoindexAuthScreen.tsx          # Tela de login/cadastro Supabase RLS cibernética
│   │   ├── ProfileModal.tsx               # Modal de perfil, avatar base64 e backup JSON
│   │   ├── CoindexLogo.tsx                # Componente da logo Fintech Prism (isométrica)
│   │   ├── ChartCard.tsx                  # Container arrastável (Drag-and-Drop) de cards Recharts
│   │   └── SpotifyLogo.tsx                # Ícone vetorial do Spotify
│   └── api/auth/route.ts                  # Rota Next.js de autenticação e sessão
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

## 6. Padrões de Interface & Design (02. Cyberpunk Neon — Synthwave Spark)

1. **Paleta de Superfícies & Atmosfera Laser:**
   - Fundo base: Obsidian-Violet `--cyber-void: #07030f` com iluminação radial fixa (`#FF2A85` 14%, `#A855F7` 14% e `#6366F1` 10%).
   - Cards e Janelas: `--cyber-card: rgba(19, 9, 39, 0.82)` com `backdrop-blur-xl`, borda em Electric Purple `rgba(168, 85, 247, 0.20)` e inset laser superior `rgba(255, 42, 133, 0.18)`.
   - Modais e Popovers Flutuantes: `bg-[#110724]/95 backdrop-blur-2xl border border-[#A855F7]/35 shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(255,42,133,0.15)]`.
   - Inputs e Selects: `bg-[rgba(13,6,28,0.92)] text-slate-100 border-[#A855F7]/28` com foco vibrante em Neon Pink (`#FF2A85`).
   - Modo Escuro Permanente: `color-scheme: dark !important;` forçado em `html` e `body`, eliminando seletor de tema frágil e impedindo qualquer elemento branco indesejado.

2. **Slim KPI Cards no Padrão Synthwave Spark:**
   - **Entradas / Receitas:** Neon Mint/Cyan (`text-[#00F5D4] drop-shadow-[0_0_10px_rgba(0,245,212,0.22)]`) com borda `border-[#00F5D4]/25`.
   - **Saídas & Despesas:** Neon Laser Pink (`text-[#FF2A85] drop-shadow-[0_0_10px_rgba(255,42,133,0.25)]`) com borda `border-[#FF2A85]/30`.
   - **Aportes / Investimentos:** Electric Violet (`text-[#C084FC] drop-shadow-[0_0_10px_rgba(192,132,252,0.25)]`) com borda `border-[#A855F7]/30`.
   - **Saldo Livre / Balanço:** Synthwave Coral/Cyan com destaque limpo e rodapé adaptativo de Safe-to-Spend / Caixinhas.

3. **Recharts Synthwave & Zero White Rings:**
   - Reset global via `globals.css` das propriedades `:focus` e `:focus-visible` em `.recharts-wrapper`, `.recharts-surface` e `.recharts-sector`.
   - **Evolução do Meu Patrimônio:** Série Acumulado com linha `stroke="#FF2A85"` (3px) e gradiente vertical de `rgba(255,42,133,0.45)` para `rgba(168,85,247,0.02)`. Série Aportes Brutos com linha `stroke="#A855F7"` (2.5px) e gradiente vertical `rgba(168,85,247,0.35)`.
   - **Para Onde Vai o Meu Dinheiro:** Fatias com a paleta harmônica Synthwave `['#FF2A85', '#FF6B4A', '#A855F7', '#6366F1', '#00F5D4', '#F43F5E', '#D946EF', '#8B5CF6']`.
   - Tooltips cibernéticos violeta escuro (`bg-[#0d061c]/95 border border-[#FF2A85]/40 shadow-[0_0_20px_rgba(255,42,133,0.25)]`).

4. **Identidade Visual — Fintech Prism Logo & Favicon:**
   - Hexágono isométrico tridimensional em degradê Cyberpunk (`#FF2A85` -> `#A855F7` -> `#00F5D4`).
   - Camadas de liquidez isométricas (Liquidity Strata).
   - Três barras verticais ascendentes internas de índice com trajetória laser e vértice em Neon Cyan.

---

## 7. Histórico Completo de Sprints (Sprints 1 a 20)

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
