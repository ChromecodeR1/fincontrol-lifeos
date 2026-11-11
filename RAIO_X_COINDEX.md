# RAIO-X TÉCNICO COINDEX (DOSSIÊ COMPLETO DO SISTEMA)
> **Versão da Aplicação:** `0.49.2`  
> **Última Atualização:** 11 de Novembro de 2026 (Pós-Sprint 66 de Emergência — Resgate Forense de Lançamentos de Set/Out/Nov, Des-inversão MDY e Persistência Universal YYYY-MM-DD no PostgreSQL)  
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
│   │   │   ├── investment-yield.ts        # Motor de Rendimento Automático CDI e Capitalização Diária (Sprint 30/40)
│   │   │   ├── bank-ingest.ts             # Parser seguro client-side para extratos CSV (Nubank, Inter, BTG) e OFX
│   │   │   ├── purchase-simulator.ts      # Motor Preditivo de Simulação de Compras "Posso Comprar?"
│   │   │   ├── vehicle-math.ts            # Motor Ponderado de Consumo km/L e TCO sem duplicidade contábil
│   │   │   ├── cashbook-sync.ts           # Motor de Reconciliação e SSOT Bidirecional do Livro Caixa (Sprint 50)
│   │   │   └── user-storage.ts            # Isolamento de Cache por Usuário (userId namespace, tombstones & soft delete)
│   │   ├── services/coindex-supabase.ts   # CRUD completo e persistência no Supabase PostgreSQL
│   │   ├── services/spotify-supabase.ts   # Persistência de tokens e preferências Spotify
│   │   └── supabase/                      # Clientes Supabase Client & Server
│   ├── components/
│   │   ├── TransactionModal.tsx           # Modal completo de novo lançamento/edição (com SmartDateInputBR e Posto Express)
│   │   ├── SpotifyModule.tsx              # Player cibernético, telemetria e rateio familiar do Spotify
│   │   ├── VehiclesTab.tsx                # Telemetria automotiva, consumo km/L, Inmetro e TCO por km
│   │   ├── BanksTab.tsx                   # Gestão de contas bancárias, cartões e limites
│   │   ├── ChartSettingsPopover.tsx       # Popover de customização de cores/curvas/tipos de gráficos
│   │   ├── CoindexAuthScreen.tsx          # Tela de login/cadastro Supabase RLS cibernética
│   │   ├── ProfileModal.tsx               # Modal de perfil, avatar base64 e backup JSON
│   │   ├── KpiAuditModal.tsx              # Modal de auditoria analítica "Raio-X Célula a Célula" dos 4 KPIs (Sprint 42)
│   │   ├── CoindexLogo.tsx                # Componente da logo Fintech Prism (isométrica)
│   │   ├── ChartCard.tsx                  # Container arrastável (Drag-and-Drop) de cards Recharts
│   │   ├── AboutTab.tsx                   # Módulo "Sobre" com Manifesto, Versão Oficial e Telemetria 144Hz (Sprint 56)
│   │   └── SpotifyLogo.tsx                # Ícone vetorial do Spotify
│   ├── api/
│   │   ├── auth/route.ts                  # Rota Next.js de autenticação e sessão
│   │   ├── market-rates/route.ts          # Rota oficial BCB SGS (Taxa CDI 252 d.u. com cache 1h)
│   │   └── strava/
│   │       ├── route.ts                   # Rota de sincronização oficial Strava v3 (POST/GET)
│   │       └── callback/route.ts          # Callback OAuth2 do Strava com troca de code por tokens
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

  - **Hotfix Sprint 38.1 (Novembro de 2026 — Sincronização Atômica do Abastecimento "Posto Express" e Reconciliação de Órfãos):**
    - Fluxo atômico síncrono em `app/page.tsx`, `app/components/TransactionModal.tsx` e `app/components/VehiclesTab.tsx`.
    - Registro atômico e espelhado: qualquer abastecimento via Posto Express salva instantaneamente na telemetria veicular (`lifeos_fuel_logs_v1`) e na tabela contábil principal de transações (`lifeos_txs_v8`).
    - Algoritmo de auto-reconciliação de inicialização: reconcilia logs órfãos do `localStorage` com transações financeiras sem duplicidade de IDs.

  - **Sprint 39 (Novembro de 2026 — Refinamento Estrutural e Arquitetura de Domínio Isolada):**
    - Estruturação dos motores puros em `app/lib/domain/` (`bank-ingest.ts`, `purchase-simulator.ts`, `finance.ts`, `date-br.ts`).
    - Padronização das rotas backend oficiais Next.js App Router para Strava (`app/api/strava/route.ts` e `callback/route.ts`).
    - Preparação das bases matemáticas para auditoria de zero-defeito.

  - **Sprint 40 (Novembro de 2026 — Inspeção Premium & Blindagem Matemática Zero-Defect em Splits, Cartões, CDI, TCO e Strava):**
    - **Passo 1 — Unificação Matemática de Despesas Divididas (`isSplit`), Competência de Faturas e Limite Real de Cartões (`finance.ts`, `lifeos-data.tsx`, `page.tsx`):**
      - Funções puras `getEffectivePersonalAmount(tx)` e `getEffectiveCardLiabilityAmount(tx)` em `app/lib/domain/finance.ts`.
      - Despesas divididas computam apenas o `personalAmount` do usuário no orçamento, ritmo e gráficos, zerando filhos de split, transferências, faturas e recebimentos neutros.
      - `calculateCardExposure` e `calculateBankExposure` passam a computar separadamente o Limite Comprometido Total (todas as compras pendentes do cartão) e o Valor da Fatura da Competência Atual (`selectedMonth`), com limite disponível real estrito `Math.max(0, safeSub(cardLimit, totalCommittedLimit))`.
    - **Passo 2 — Blindagem de Resgates Pro-Rata e Prazo Médio Ponderado de IR no Motor CDI (`investment-yield.ts`):**
      - Resgates agora abatem proporcionalmente (pro-rata) o saldo total acumulado do bucket (`bTotal = b.principal + b.yieldGross`): `ratio = deduct / bTotal; b.principal *= (1 - ratio); b.yieldGross *= (1 - ratio); b.yieldNet *= (1 - ratio)`. Resgates de 100% zeram o principal e os rendimentos órfãos simultaneamente.
      - Prazo médio ponderado de IR: cálculo do timestamp de depósito ponderado pelos aportes ($\overline{T}_{next} = \frac{S \times \overline{T} + A \times T_{new}}{S + A}$), determinando dias corridos reais para a tabela regressiva da Receita Federal (22.5%, 20.0%, 17.5%, 15.0%).
    - **Passo 3 — Refinamento Matemático do Simulador Preditivo "Posso Comprar?" (`purchase-simulator.ts`):**
      - Proteção contra NaNs e Infinity: parcelamento de 1 a 48 vezes com distribuição exata em centavos inteiros via `distributeInstallments`.
      - Custo de oportunidade de 12 meses (`cashOpportunityCost12m`) e vantagem de rendimento composta durante o parcelamento (`installmentYieldAdvantage`) calculados com juros compostos mensais sobre o saldo residual na Caixinha Turbo (115% do CDI) com desconto de IR.
    - **Passo 4 — Overpayment Guard em Valores a Receber e Matemáticas de Bio & Strava (`SecondaryTabs.tsx`, `page.tsx`):**
      - Em `handlePartialPaymentReceivable`: `safePaid = Math.min(totalAmount, Math.max(0, safeAdd(currPaid, addAmount)))`, com quitação automática para `"Pago"` quando `safeRemaining === 0`.
      - Em `receivablesAnalytics`: totalização estrita em centavos inteiros (`toCents`/`fromCents`), garantindo a identidade contábil `totalLoaned === totalPaid + totalOpen`.
      - Em `bioTelemetry`: ordenação cronológica ascendente estrita antes de calcular variação de peso, e preservação do último `bf > 0` válido anterior para cálculo contínuo de massa magra (`leanMass`).
      - Em `secondsToPaceString`: arredondamento de segundos antes do módulo (`const rounded = Math.round(totalSec); const mins = Math.floor(rounded / 60); const secs = rounded % 60`), eliminando o bug `:60` e garantindo `0 <= secs <= 59`.
      - No card "Melhor Pace": busca o menor pace em segundos (`Math.min`) filtrando distâncias e paces válidos.
    - **Passo 5 — Criação do Motor Puro de Telemetria Automotiva & TCO (`vehicle-math.ts`, `VehiclesTab.tsx`, `page.tsx`):**
      - Criação de `app/lib/domain/vehicle-math.ts` com `calculateVehicleConsumption` e `calculateVehicleTco`.
      - 1º abastecimento (menor odômetro) tratado como Marco Zero Base sem contaminação matemática.
      - Média de consumo ponderada real: `km/L = totalTrackedKm / totalTrackedLiters`.
      - TCO por km (`tcoPerKm`) consolida combustível e custos veiculares não-combustível (Manutenção, IPVA, Licenciamento, Seguro, Estacionamento) sem duplicar gastos de postos.

  - **Hotfix Sprint 40.2 (Novembro de 2026 — Reformulação Completa do Seletor de Período da Topbar):**
    - Padrão inicial `"ALL"` (Histórico Completo) no estado `selectedMonth` e persistência no `localStorage` (`coindex_selected_month`).
    - Dropdown Popover Cupertino Glassmorphism substituindo `<select>` nativo na Topbar com 4 sessões:
      1. Opção principal em destaque: `🌐 Todos (Histórico Completo)`.
      2. Pílulas de atalho rápido: `[Mês Atual]`, `[Últimos 30 Dias]`, `[Este Ano]`.
      3. Grade de meses específicos com badges cronológicos `(Atual)` e `(Futuro)`.
      4. Intervalo customizado De/Até com validação estrita via `date-br.ts`.
    - Função unificada pura `isTxInSelectedPeriod` e sincronização adaptativa de todos os KPIs, cotas diárias e gráficos.

  - **Sprint 41 (Novembro de 2026 — Redesign Fiel do Painel Strava Progress + Widget de Metas "ESTA SEMANA / ESTE ANO" na Aba Bio & Strava):**
    - **Passo 1 — Estrutura Split-View Lado a Lado (`Progresso` 2/3 + `Metas` 1/3) em `SecondaryTabs.tsx`:**
      - Container unificado em Cupertino Glassmorphism (`bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] rounded-2xl p-5 shadow-xl`).
      - Abas superiores de navegação interna: `"Progresso"` (com sublinhado sólido Laranja Strava `#FC4C02` de 3px) e `"Atividades"` (com badge de contagem de treinos sincronizados).
      - Grid responsivo de 12 colunas: `lg:col-span-8` para o gráfico interativo Strava Progress e `lg:col-span-4` para o card duplo de metas.
    - **Passo 2 — Implementação Fiel do Card Esquerdo (Gráfico Estilo Strava Progress):**
      - Seletor de esporte (`🏃 Corrida` vs. `🔥 Todos os Esportes`) e as 5 pílulas oficiais do Strava: `[7D]`, `[1M]`, `[3M]`, `[6M]`, `[1Y]`, com realce em `#FC4C02`.
      - Motor de agrupamento de dados da API Strava com fallback inteligente: dia a dia para `7D`, semana a semana (Segunda a Domingo) para `1M`/`3M`/`6M`, e mês a mês para `1Y`.
      - Cabeçalho dinâmico de telemetria no topo do gráfico atualizado em tempo real no hover/clique: intervalo ativo (ex: `19 de Out, 2026 - 25 de Out, 2026`), `Distância` (ex: `34,80 km`), `Tempo` (ex: `3h 12m`), e `Ganho Elev.` (ex: `342 m`).
      - Recharts AreaChart com `type="linear"` (segmentos retos angulares idênticos ao Strava), degradê em Laranja Strava `#FC4C02` (`stopOpacity 0.35` a `0.02`), `CartesianGrid` sem linhas verticais, `YAxis` na direita (`orientation="right"`) com 3 ticks limpos (`0 km`, metade e topo), e bolinhas vazadas customizadas (`StravaProgressDot`) com centro escuro `#131824` e aro `#FC4C02`, halo pulsante no ponto ativo e `ReferenceLine` descendo verticalmente até a base do gráfico.
    - **Passo 3 — Implementação Fiel do Card Direito (Metas "ESTA SEMANA" e "ESTE ANO"):**
      - Card dividido em duas metades verticais com divisor sutil e botão de lápis para edição das metas semanais (`weeklyRunGoalKm`, padrão 15 km) e anuais (`annualRunGoalKm`, padrão 500 km) com persistência reativa em `localStorage`.
      - Metade Superior (`ESTA SEMANA`): contador em destaque `{weeklyCurrentKm} / {weeklyRunGoalKm} km`, dias da semana `S T Q Q S S D` com pílulas laranjas se houve treino ou é hoje, SVG circular de progresso com arco proporcional e ícone de tênis de corrida / `Footprints` no centro, e rodapé com horas, minutos e elevação acumulada.
      - Metade Inferior (`ESTE ANO`): contador acumulado `{Math.round(ytdKm)} / {annualGoal} km`, barra de progresso anual com marcador vertical e rótulo `HOJE` baseado na fração exata do dia no ano, e frase de status do ritmo (`X km abaixo do ritmo`, `X km acima do ritmo`, ou `Exatamente no ritmo da meta`).

  - **Sprint 42 (Novembro de 2026 — Correção Visual e Contábil + R$ Verde em Empréstimos, Exclusão Direta em Devedores e Modal Raio-X Célula por Célula nos 4 KPIs):**
    - **Passo 1 — Correção do Sinal (`+ R$` em Verde `#30D158`) para "Recebimento de Empréstimo" e Reconciliação Contábil:**
      - Criação da função pura `isPositiveInflowDisplay` em `app/lib/domain/finance.ts`, padronizando que lançamentos com `isReceivableSettlement: true`, categorias de empréstimo/reembolso (`"Recebimento de Empréstimo"`, `"Reembolso"`) ou receitas (`"Salário"`, `"Rendimentos"`, `"Receita Extra"`) renderizem obrigatoriamente com prefixo `+ R$` e cor Verde Esmeralda Cupertino (`text-[#30D158]` / `text-emerald-400`).
      - Aplicação de `isPositiveInflowDisplay` em `app/TransactionsTableAdvanced.tsx` (tabela desktop, cards mobile e prévia de importação CSV/OFX) e no feed de atividades recentes em `app/page.tsx`.
      - Alinhamento da matemática contábil de compras divididas (`isSplit`): a compra principal entra pelo desembolso bruto total (`tx.amount`), e o recebimento de empréstimo (`isReceivableSettlement: true`) atua como crédito redutor das Saídas Operacionais no período (`Math.max(0, safeSub(grossExpense, settlementsTotal))`). Ao somar algebricamente célula a célula na tabela (`-30,00 + 10,00 = -20,00`), o valor bate no centavo exato com o card `SAÍDAS & DESPESAS`, sem dupla contagem.
    - **Passo 2 — Exclusão Direta de Lançamento de Devedor na Janela de Devedores (`SecondaryTabs.tsx` e `page.tsx`):**
      - Adicionado botão nítido de **Excluir (`Trash2`)** em cada linha da tabela de atribuição de devedores na aba `receivables` (`app/SecondaryTabs.tsx`).
      - Ao excluir um recebível, remove-se o registro, grava-se o tombstone (`recordTombstone`), deleta-se do Supabase, limpam-se eventuais baixas órfãs vinculadas (`linkedReceivableId === id`), reverte-se a flag `isSplit` na transação pai caso seja split child, e ativa-se o Toast flutuante com botão `"↩ Desfazer"` de 5 segundos.
    - **Passo 3 — Cards de Resumo Financeiro 100% Interativos com Modal "Raio-X Contábil — Célula por Célula":**
      - Os 4 Slim KPI Cards do topo (`ENTRADAS`, `SAÍDAS & DESPESAS`, `APORTES` e `SALDO LIVRE LÍQUIDO`) tornaram-se interativos (`cursor-pointer group relative cupertino-card-hover`), com badge sutil de hover `"🔍 Raio-X"`.
      - Criação de `app/components/KpiAuditModal.tsx` renderizado via `createPortal(..., document.body)` em Cupertino Glassmorphism executivo.
      - Cabeçalho dinâmico com título temático, badges de período ativo, regime contábil (`Competência` vs. `Caixa`) e total do card em fonte grande `tabular-nums`.
      - Barra de busca interna e pílulas de filtro rápido por categoria com contagem de itens.
      - Tabela analítica completa célula a célula: `#`, `Data`, `Descrição`, `Categoria`, `Método/Origem`, `Status`, `Valor na Soma (Célula)`, `% do Total` e botões rápidos de **Editar (`Pencil`)** e **Excluir (`Trash2`)**.
      - Rodapé com prova real matemática (`Sum Check`): `Total de Células: N lançamentos | Soma Algébrica Exata: R$ XXX,XX (100% reconciliado com o Card)`.
      - Sub-aba exclusiva de **"Memória de Cálculo do Safe-to-Spend"** para o Card 4 (Balanço), detalhando Saldo em Contas (banco a banco), Receitas Pendentes, Contas Diretas Pendentes e Faturas de Cartão de Crédito.
      - Correção do `Safe-to-Spend` no modo `"ALL"` (`Histórico Geral`): utiliza a data de referência segura do mês corrente (`currentCalendarDate.yearMonth`), evitando o falso déficit de anos passados e garantindo compatibilidade total com o pré-renderizador do Next.js 16.

  - **Sprint 44 (Novembro de 2026 — Correção de Persistência ao Editar Data, Safe Merge Last-Write-Wins (LWW), Unificação de Combustível em Gasolina e Ordenação A-Z de Categorias):**
    - **Passo 1 — Persistência Robusta de Datas e Resolução LWW com Supabase:**
      - No `SmartDateInputBR`: disparo de `onChange` imediato no evento de digitação ao completar 8 dígitos válidos (`DD/MM/AAAA` ou `DD-MM-AAAA`), e `onBlur` com fallback de segurança para a data anterior válida ou `todayBR()`.
      - Normalização universal de data (`formatDateBR || todayBR()`) em todas as submissões (`handleFormSubmit` e `handleSaveAndNewClick`).
      - Em `app/page.tsx` (`handleSaveTransaction`): cálculo contábil de competência de fatura e caixa com base em `normalizedDate`. Isolamento estrito de `itemCashMonth` e anulação de `itemInvoiceMonth` para transações que não são cartão de crédito.
      - Edição de compras parceladas (`applyToAllSeries`): recálculo individual de `invoiceMonth` e `cashMonth` de cada parcela mantendo histórico contábil íntegro.
      - Dupla persistência síncrona atômica no mesmo tick (`setUserItem("lifeos_txs_v8")` + `localStorage.setItem("lifeos_txs_v8")`) em todos os 4 pontos de gravação.
      - Safe merge com Supabase via algoritmo Last-Write-Wins (LWW): comparação de `updatedAt` e `rev`. Registros locais mais recentes são preservados e reenviados ao banco de dados via `upsertTransactionsInDb`.
      - Atualização do payload de `upsertTransactionsInDb` e `migrateAllStateToSupabase` incluindo `bank_account`, `fuel_type`, `full_tank`, `flow_type`, `invoice_month`, `cash_month`, `rev` e `updated_at`.
    - **Passo 2 — Unificação Completa de Categorias de Combustível para "Gasolina":**
      - Em `migrateLegacyCategory` (`lifeos-data.tsx`): unificação determinística de todas as variações históricas ("Gasolina/Combustível", "Combustível (Gasolina / Etanol)", "Combustível", "Abastecimento", "Etanol", "Posto", etc.) para a categoria oficial `"Gasolina"` (`#f59e0b`).
      - Remoção de "Combustível (Gasolina / Etanol)" do catálogo padrão `DEFAULT_CATEGORIES_CATALOG`.
      - Atualização da regra de auto-categorização bancária em `app/lib/domain/bank-ingest.ts` (`OFFICIAL_AUTO_CATEGORY_RULES`) para categorizar postos diretamente como `"Gasolina"`.
      - Posto Express (`TransactionModal.tsx` e `page.tsx`): categoria `"Gasolina"` e descrição padrão `"Abastecimento - Gasolina"`.
    - **Passo 3 — Ordenação Alfabética Rigorosa de A a Z para Categorias:**
      - Criação da função pura `sortCategoriesAlphabetically` com `localeCompare("pt-BR", { sensitivity: "base" })`.
      - Catálogo `DEFAULT_CATEGORIES_CATALOG` e `OFFICIAL_CATEGORIES` pré-ordenados de A a Z.
      - No modal de transação (`TransactionModal.tsx`): `<select>` de categorias memoizado com ordenação alfabética `sortedCategories`.
      - Na tabela avançada (`TransactionsTableAdvanced.tsx`): `allUniqueCategories` ordenado com `localeCompare("pt-BR")`.
      - Na aba de Configurações (`SecondaryTabs.tsx`): listagem de badges de categorias ordenada de A a Z.

  - **Sprint 45 (Novembro de 2026 — Motor de Efeitos Especiais de Background "Cupertino Ambient FX" com 6 Modos Selecionáveis, Refração de Vidro Líquido e Spotlight Interativo):**
    - **Passo 1 — Componente Isolado `AmbientBackgroundFX.tsx`:**
      - Camada fixa de fundo (`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none` com `aria-hidden="true"` e `transform: none`), prevenindo estritamente a criação de containing block para modais e portais.
      - Suporte a 6 modos visuais em tempo real:
        1. `hybrid` (Híbrido Copilot - Padrão): Fusão de Aurora suave + Micro-Grade Linear + Spotlight interativo de cursor.
        2. `aurora` (Aurora Cupertino Mesh): Três esferas fluidas com desfoque profundo (`blur-[130px]`, `blur-[140px]`, `blur-[150px]`) nas cores da identidade Coindex (`#0A84FF`, `#5E5CE6`, `#30D158`) animadas com keyframes independentes (`cupertinoAuroraFloat1-3`).
        3. `grid` (Grade Arquitetural Linear): Malha arquitetônica minimalista de 28x28px com máscara radial difusa (`radial-gradient`).
        4. `rays` (Feixes Titanium & Matte): Luz volumétrica cônica superior (`conic-gradient` com `blur-[90px]`) combinada com camada de microtextura fosca sutil.
        5. `spotlight` (Spotlight Interativo): Rastreamento de cursor de alta performance com `requestAnimationFrame`, otimizado para desativar automaticamente em telas sensíveis ao toque ou sob preferência de redução de movimento (`prefers-reduced-motion`).
        6. `none` (Sólido Puro): Desativação completa dos efeitos visuais decorativos.
    - **Passo 2 — Controles e Seletores Rápidos de Atmosfera:**
      - Popover interativo na Topbar de navegação ao lado do alternador de tema Claro/Escuro, com acionamento pelo ícone `Sparkles` e persistência no `localStorage` sob a chave `coindex_bg_fx_mode`.
      - Painel visual completo com cards interativos na aba Configurações (`SecondaryTabs.tsx`).
    - **Passo 3 — Refinamento de Translucidez e Refração de Vidro Líquido (`globals.css`):**
      - `--cupertino-card` ajustado para `rgba(19, 24, 36, 0.78)` no modo escuro e `rgba(255, 255, 255, 0.84)` no modo claro, ambos com `backdrop-filter: blur(20px) saturate(160%)`.
      - Contêineres de página (`.dashboard-root-wrapper` e `.dashboard-main-content`) configurados como transparentes, permitindo difração luminosa autêntica sob os cards Bento Grid sem degradação de contraste ou legibilidade.

  - **Sprint 46 (Novembro de 2026 — Nova Logo Oficial "The Equilibrium Link" com Motion Orbital, Motor de Motions 120Hz Apple Spring, Number Ticker CountUp e Loaders Shimmer Contextuais):**
    - **Passo 1 — Nova Logo Oficial "The Equilibrium Link" (Opção 1) (`CoindexLogo.tsx` e `icon.svg`):**
      - Geometria vetorial exata em `viewBox="0 0 120 84"`:
        1. **Elo Esquerdo (Letra "C" em Titânio `#F8FAFC`):** Círculo centrado em `cx=44, cy=42, r=26` com `strokeWidth=10`, aberto de `-38°` a `+38°` com terminais limpos dentro do elo direito.
        2. **Elo Direito (Anel Completo Apple Blue `#0A84FF` -> `#38BDF8`):** Círculo centrado em `cx=76, cy=42, r=26` com `strokeWidth=10`.
        3. **Entrelaçamento Físico Real (Over-Under Weave):**
           - Na intersecção superior (`x ≈ 60, y ≈ 21`), o elo azul passa por cima do elo branco com recorte de `3.5px` (`strokeWidth=17`).
           - Na intersecção inferior (`x ≈ 60, y ≈ 63`), o elo branco ("C") passa por cima do elo azul com recorte de `3.5px` (`strokeWidth=17`).
      - Motions e Efeitos Especiais na Logo:
        - **Entrada Cinética (`coindex-ring-draw`):** Traçado suave de `650ms cubic-bezier(0.16, 1, 0.3, 1)`.
        - **Pulso de Luz Orbital Contínuo (`coindex-orbital-glow`):** Trilha specular secundária (`strokeDasharray="18 150"`) percorrendo os anéis em loop contínuo de `5.5s linear infinite`.
        - **Física Magnética no Hover:** Elo esquerdo translada `-1.5px` e elo direito `+1.5px` (`320ms cubic-bezier(0.22, 1, 0.36, 1)`) com halo luminoso `drop-shadow(0 0 12px rgba(10, 132, 255, 0.45))`.
        - **Wordmark `COINDEX`:** Tipografia geométrica pura (`font-extrabold tracking-[0.12em] uppercase`) com micro-shimmer metálico no hover.
      - **Favicon Oficial do Navegador (`app/icon.svg`):** Squircle premium Midnight `#0B0E14` (`viewBox="0 0 120 120"`, `rx=28`) com a geometria exata do Equilibrium Link centralizada para máxima nitidez em qualquer resolução (16px a 180px).
    - **Passo 2 — Motor de Interpolação Numérica `useAnimatedNumber` (120Hz CountUp) & Micro-Motions:**
      - Hook puro `useAnimatedNumber` com interpolação quártica `1 - Math.pow(1 - t, 4)` e respeito a `prefers-reduced-motion`.
      - Componentes `<AnimatedBRL />` e `<AnimatedMetric />` aplicados nos 4 Slim KPI cards, Total do Patrimônio Acumulado, Total Central do Donut de Despesas e métricas de distância do painel Strava Progress.
      - Regra Anti-Modal Trap: Container pai sem `transform` residual (`transform: none`), garantindo compatibilidade com modais em tela cheia (`100dvh`).
      - Classes táteis em `globals.css`: `.apple-press` (scale 0.97 nos botões), `@keyframes svgDrawIn` (traçado progressivo de gráficos e anéis de corrida) e `@keyframes rowSuccessFlash` (flash verde em linhas editadas).
    - **Passo 3 — Sistema de Loaders Contextuais & Shimmer Cupertino:**
      - Classe `.cupertino-shimmer` em `globals.css` com suporte nativo a temas Claro e Escuro.
      - **Loader 1 (Topbar & Sidebar):** Indicador de sync do Supabase com spinner girando (`Loader2`) durante `syncing` e transição com check verde (`✓ Sincronizado`).
      - **Loader 2 (Painel Strava Progress):** Barra superior indeterminada em `#FC4C02` + overlay `.cupertino-shimmer` durante `isSyncingStrava`.
      - **Loader 3 (Taxa CDI BCB):** Micro-dot pulsante (`animate-ping`) verde na badge `115% CDI • BCB Ao Vivo`.
      - **Loader 4 (Importação CSV/OFX e Modais):** Barra de progresso deslizante durante o processamento de arquivo e transição com check icon na confirmação da importação.

  - **Sprint 52 (Novembro de 2026 — Implementação da Suite Completa de 18 Micro-Animações 144Hz GPU-Accelerated: 3D Gyroscope Card Tilt & Glare, Apple Wallet Fan-Out, Proximity Border Glow, Odometry Digit Roll, Laser Sync e Aura Burst):**
    - **Regra de Ouro Arquitetural (144Hz & Proteção de Modais):**
      - Respeito global ao toggle `"Reduzir Animações"` (`Sim` = interações ativas; `Não` = desativadas, expondo `data-animations="on" | "off"` no `<html>`).
      - Proibição estrita de `transform` residual em containers estruturais (`100% { opacity: 1; transform: none; }`), protegendo o posicionamento em viewport de todos os modais em `createPortal`.
      - Todas as animações interativas de ponteiro utilizam `requestAnimationFrame` coalescido e mutação direta de variáveis CSS via `useRef`, com ZERO chamadas a `useState` por frame.
    - **Passo 1 — Motor Central de Micro-Física e Partículas (`app/components/MotionEngine144.tsx`):**
      - **Animação #15 (Emerald Aura Burst & Confetti):** Função `triggerAuraBurst(originEl, color)` disparando 22 micro-partículas vetoriais luminosas e onda de choque circular expansiva de 700ms em canvas dinâmico z-99999 auto-removível ao clicar em `"Quitar 100%"`, `"+ Abater"`, `"💳 Pagar Fatura"` ou guardar em desejos.
      - **Animação #1 (3D Gyroscope Tilt & Holographic Foil Glare):** Componente `TiltCard3D` calculando em rAF rotações suaves `rotateX` (±6deg) e `rotateY` (±6deg) proporcionais ao cursor com camada de brilho reflexivo holográfico (`.holographic-foil-glare`) em `BanksTab.tsx` e `page.tsx` (`wallet_limits`).
      - **Animação #3 (Iluminação de Borda por Proximidade):** Hook `useProximityBorderGlow` em `ChartCard.tsx` atualizando `--mouse-x` e `--mouse-y` para acender suavemente a borda fina (1px) mais próxima do cursor nos Bento Cards.
    - **Passo 2 — Tipografia Cinética, Pulso de Mercado e Onda de Privacidade:**
      - **Animação #4 (Odometry Digit Roll):** Transição vertical cilíndrica (`odometer-roll-up` / `odometer-roll-down`) em `AnimatedNumber144.tsx` com flash cromático sutil (verde se subiu, coral se desceu) sem deslocar `tabular-nums`.
      - **Animação #5 (Live Market Heartbeat Pulse & Sonar Dot):** Radar pulsante (`sonar-dot` com duplo anel `animate-ping`) verde `#30D158` / vermelho `#FF453A` na extremidade dos gráficos de mercado ao vivo em `InvestmentsTab.tsx` e flash de batimento cardíaco (`market-heartbeat-flash`).
      - **Animação #6 (Liquid Unblur Wave no Modo Privacidade):** Alternância do `privacyMode` com transição fluida `filter: blur(8px)` -> `blur(0px)` (`.privacy-blur` / `.privacy-unblur`) em 340ms cubic-bezier.
    - **Passo 3 — Gráficos Interativos: Donut Elástico, Agulha Laser Sincronizada e Anéis Apple Fitness:**
      - **Animação #7 (Liquid Morphing Donut / Elastic Slice Pull-Out):** Estado `donutHoverIndex` no gráfico `"Para Onde Vai o Meu Dinheiro"` (`app/page.tsx`); ao passar o cursor sobre uma fatia ou item da lista, destaca a fatia com escala/sombra e projeta dinamicamente no centro do Donut o nome, valor em R$ e % daquela categoria específica.
      - **Animação #8 (Synchronized Crosshair Laser Scrubbing):** Eixo de scrubbing simultâneo com `syncId="coindex_market_sync"` nos múltiplos gráficos de mercado e `syncId="coindex_strava_sync"` no Strava, com agulha laser vertical tracejada (`strokeWidth={1.5}`).
      - **Animação #9 & #10 (Apple Fitness Ring Draw & Agulha HOJE):** Anel circular semanal do Strava com transição de `strokeDashoffset` (900ms) e ponto luminoso no topo do arco; barra anual de ritmo com animação suave da barra verde-menta e agulha `HOJE` (750ms).
    - **Passo 4 — Dock Magnético, Gaveta Acordeão, Ícones Vivos e Inércia no DND:**
      - **Animação #2 (Apple Wallet Fan-Out):** Expansão vertical de espaçamento dos cartões empilhados em `wallet_limits` ao passar o mouse (`-mt-12` -> `group-hover/wallet:-mt-7`) com elevação individual sob o cursor (`hover:!-translate-y-2`).
      - **Animação #11 (Magnetic Dock Sidebar):** Transição magnética nos ícones de navegação da Sidebar esquerda (`group-hover:scale-125 group-hover:-translate-y-0.5`) com indicador luminoso lateral deslizante.
      - **Animação #12 (Smooth Accordion Row Expansion):** Sub-gaveta acordeão suave (`grid-template-rows: 0fr -> 1fr`) nas linhas do Livro Caixa (`TransactionsTableAdvanced.tsx`) e Valores a Receber (`SecondaryTabs.tsx`) com árvore contábil completa (`├─ Valor Original`, `├─ Pagamentos Recebidos`, `└─ Saldo Aberto`).
      - **Animação #13 (Living SVG Micro-Icons):** Micro-animações no hover de botões de exclusão (`.living-trash`), edição (`.living-edit`) e sino de notificações (`.living-bell` com `bellSwing`).
      - **Animação #14 (Inércia Física no Drag-and-Drop):** Card arrastado em `ChartCard.tsx` inclinado com `scale-[1.015] rotate-[1deg] ring-2 ring-[#0A84FF]` e retorno elástico ao soltar.
    - **Passo 5 — Carimbo Elástico, Superfície Líquida e Card-to-Modal Morph:**
      - **Animação #16 (Elastic Status Stamp):** Carimbo elástico `.status-stamp-pop` com halo verde expansivo ao alternar status para Pago.
      - **Animação #17 (Superfície Líquida nas Barras de Progresso):** Shimmer especular contínuo `.liquid-progress-shimmer` e ponto luminoso frontal `.liquid-progress-head` no termômetro pessoal e limites de cartões.
      - **Animação #18 (Morphing Card-to-Modal nos 4 Slim KPIs):** Abertura do modal Raio-X Contábil com curva elástica iOS (`@keyframes kpiModalExpandIn` de `scale(0.92) translateY(-14px)` para `transform: none` em 280ms).

  - **Hotfix Sprint 49.1 (Novembro de 2026 — Correção Global do Desalinhamento Vertical e Horizontal da Pílula Azul Deslizante em Todos os Controles Segmentados Unidos):**
    - **Diagnóstico da Causa-Raiz Geométrica:**
      - O indicador deslizante (`.absolute`) em `SlidingSegmentedControl.tsx` não continha propriedades explícitas de `top: 0` e `left: 0`. Em containers `flex items-center`, o posicionamento estático padrão `auto` empurrava a pílula para a linha base do flex, e o `transform: translate3d(x, y, 0)` era somado sobre essa posição já deslocada, empurrando a pílula para a borda inferior.
      - Além disso, a alternância de peso tipográfico entre `font-normal`/`font-semibold` para `font-bold` no item ativo causava expansão de largura (`offsetWidth`) posterior à medição, gerando desalinhamento horizontal visível em textos como `"Na Fatura"`.
    - **Solução Pixel-Perfect Bounding Box Implementada:**
      - **Ancoragem Absoluta Estrita:** `position: absolute; top: 0; left: 0; pointer-events: none; z-index: 0;` no elemento da pílula deslizante, garantindo que o `translate3d(x, y, 0)` parta da origem exata `(0, 0)` do container relativo.
      - **Métricas Fidedignas do DOM:** Leitura direta de `activeBtn.offsetLeft`, `activeBtn.offsetTop`, `activeBtn.offsetWidth` e `activeBtn.offsetHeight` relativos ao `offsetParent` com fallback robusto via `getBoundingClientRect()`.
      - **Estabilidade Tipográfica:** Padronização simétrica de `font-semibold` e `leading-none` tanto para o estado selecionado quanto não selecionado, eliminando qualquer layout shift na largura dos botões.
      - **Observabilidade Contínua:** Rastreamento reativo em `useLayoutEffect`, `requestAnimationFrame`, `ResizeObserver` (observando container e botão ativo) e listener de `document.fonts.ready` para carregamento assíncrono de fontes.
      - **Padronização Universal:** Aplicado em todos os controles unidos do sistema em `TransactionsTableAdvanced.tsx`, `page.tsx`, `SecondaryTabs.tsx`, `TransactionModal.tsx`, `VehiclesTab.tsx` e `InvestmentsTab.tsx`.

  - **Sprint 51 (Novembro de 2026 — Correção Definitiva da Renderização do Gráfico Strava Progress, Ingestão Paginada de Corridas Individuais na API, Modo 'Cada Corrida' e Histórico Detalhado Linha por Linha):**
    - **Passo 1 — Correção da Renderização do Gráfico em Linha Strava Progress (`AreaChart`):**
      - Resolução da causa-raiz: o `AreaChart` declarava `<XAxis dataKey="xLabel" />`, porém os objetos de ponto gerados no hook de agregação temporal não possuíam o atributo `xLabel`, quebrando os ticks e a continuidade visual do gráfico.
      - Alinhamento determinístico das chaves: tanto o eixo X quanto a linha de cursor do ponto selecionado (`<ReferenceLine x={activeStravaPoint.xLabel} />`) utilizam a chave `xLabel` preenchida em todos os modos (`per_run` e `weekly`).
      - Renderização contínua com curva suave `type="monotone"`, aceleração nativa via SVG com `isAnimationActive={false}` (elimina flash ou travamento de layout inicial) e renderização segura dos marcadores com `dot={(props) => Number.isFinite(cx) && Number.isFinite(cy)}`.
    - **Passo 2 — Ingestão Paginada de Atividades Individuais na Rota `/api/strava`:**
      - Fim do resumo restrito a 3 blocos sintéticos: a API agora efetua requisições paginadas (`per_page=200&page=1` e, se houver 200 itens, consulta imediata de `page=2`), resgatando até 400 atividades individuais por sincronização.
      - Parsing estrito e imutável de datas em fuso horário local (`parseStravaIsoDate`), extraindo strings diretas para `dateBR` (`DD-MM-YYYY`), `isoDate` (`YYYY-MM-DD`) e `startTime` (`HH:mm`), blindando contra desvios de timezone UTC.
      - Schema de telemetria atlética completa: inclusão de `durationMin`, `movingTimeSec`, `avgSpeedKmh`, `paceSecondsPerKm`, `averageHeartrate`, `maxHeartrate`, `elevationGain`, `calories` e `splitsMetric`.
      - Detecção de restrição de escopo (`needs_activity_scope`): geração automática de `oauthUpgradeUrl` com todos os escopos requeridos (`read,activity:read,activity:read_all,profile:read_all`) e fallback sintético semanal inteligente.
    - **Passo 3 — Modo "Cada Corrida" (📍 Cada Corrida) e Cabeçalho de Telemetria Dinâmica:**
      - Adição do seletor de granularidade `[📍 Cada Corrida | 📅 Por Semana]` com transição suave e foco instantâneo.
      - No modo `per_run`, cada corrida é plotada individualmente na ordem cronológica (da mais antiga à mais recente), permitindo inspeção ponto a ponto.
      - Cabeçalho dinâmico de 4 colunas acima do gráfico: `Distância`, `Pace Médio`, `Tempo Mov.` e `Ganho Elev.`, com badge de velocidade média `⚡ XX,X km/h`.
    - **Passo 4 — Histórico Detalhado Linha por Linha com Interatividade Bidirecional:**
      - Tabela `"🏃 Histórico Detalhado — Cada Corrida Linha por Linha"` posicionada estrategicamente logo abaixo do gráfico, sempre visível.
      - Barra de ferramentas atlética: busca textual por nome/data, filtros de distância mínima (`Todas`, `>3km`, `>5km`, `>10km`, `>21km`) e filtro por mês.
      - Interatividade bidirecional: focar ou passar o cursor em qualquer linha da tabela destaca imediatamente a corrida correspondente no gráfico de linha, sincronizando o dot e a linha de referência do cursor vertical.
      - Modal de Registro Manual de Corridas: formulário completo com cálculo automático em tempo real de pace, velocidade e calorias estimadas, salvando no estado e persistindo síncrono.
    - **Passo 5 — Banner de Upgrade de Escopo OAuth2:**
      - Alerta visual proativo avisando quando o token do usuário permite apenas a leitura estatística (3 blocos), com botão de 1 clique para autorização completa via popup OAuth2.

  - **Sprint 50 (Novembro de 2026 — Unificação Contábil do Livro Caixa como Fonte Única da Verdade, Sincronização Bidirecional Estrita e Saneamento dos Recebimentos Fantasmas do Devedor Dio):**
    - **Passo 1 — Criação do Motor Contábil Puro `app/lib/domain/cashbook-sync.ts`:**
      - A lista `transactions` (Livro Caixa) é consagrada como a Fonte Única da Verdade (SSOT). Todos os módulos satélites (Valores a Receber, Meus Veículos, Investimentos e Bancos) mantêm sincronização bidirecional estrita com precisão matemática em centavos inteiros (`toCents`, `fromCents`, `safeAdd`, `safeSub`).
      - Função pura `reconcileReceivablesAndCashbook(transactions, tombstones)`:
        - **Expurgo de Recebimentos Fantasmas / Órfãos:** Detecta e expurga os 8 lançamentos fantasmas em `30-10-2026` associados a `Recebimento: Dio (Emprestimo ao Dio)` (valores `R$ 20,00`, `R$ 20,00`, `R$ 62,88`, `R$ 22,80`, `R$ 30,80`, `R$ 102,70`, `R$ 20,64`, `R$ 0,05`), além de qualquer recebimento cujo empréstimo original não exista mais ou cuja dívida ativa esteja pendente com `paidAmount === 0`.
        - **Reconciliação Exata da Dívida Parcial do Dio:** Para a dívida `Saldo restante de 2025 à receber` (`amount = 622.75`, `paidAmount = 500.00`), o lançamento de recebimento no Livro Caixa tem seu valor corrigido automaticamente de `R$ 622,75` para `500.00`, descrição ajustada para `"Recebimento Parcial: Dio (Saldo restante de 2025 à receber)"`, categoria `"Recebimento de Empréstimo"`, `flowType: "INCOME"` e `isReceivableSettlement: true`.
        - **Simetria Matemática Estrita:** `parent.paidAmount` é sempre igual à soma exata em centavos dos lançamentos vivos de recebimento com `linkedReceivableId === parent.id`.
    - **Passo 2 — Interligação Bidirecional em Tempo Real (`Livro Caixa` <-> `Valores a Receber`):**
      - **Sentido 1 (`Valores a Receber` -> `Livro Caixa`):**
        - Cliques em `+ Abater` ou `Quitar 100%` geram lançamento de entrada no Livro Caixa com `category: "Recebimento de Empréstimo"`, `flowType: "INCOME"`, `isReceivableSettlement: true`, `linkedReceivableId: parent.id`, recalculando o `paidAmount` da dívida mãe.
        - Excluir uma dívida na aba `Valores a Receber` exclui atomicamente todos os recebimentos filhos no Livro Caixa e grava os tombstones no Supabase.
        - Alternar status entre Pago e Pendente na aba `Valores a Receber` cria ou remove o lançamento de liquidação correspondente no Livro Caixa.
      - **Sentido 2 (`Livro Caixa` -> `Valores a Receber`):**
        - Excluir uma linha de recebimento no Livro Caixa subtrai imediatamente o valor do `paidAmount` da dívida mãe e reverte o status para `"Pendente"`.
        - Editar o valor de um recebimento no Livro Caixa atualiza o `paidAmount` da dívida mãe centavo a centavo.
        - Criação de Novo Lançamento na categoria `"Recebimento de Empréstimo"` no `TransactionModal.tsx` exibe o seletor inteligente `"Vincular a qual dívida em aberto? (Valores a Receber)"`, preenchendo o valor restante e abatendo automaticamente a dívida ao salvar.
    - **Passo 3 — Interligação Bidirecional do Livro Caixa com Demais Módulos:**
      - **Meus Veículos <-> Livro Caixa:** Ações de edição e exclusão de abastecimentos no Histórico Completo de Veículos (`VehiclesTab.tsx`) refletem instantaneamente no Livro Caixa e vice-versa, com recálculo em tempo real de odômetro, consumo médio ponderado (km/L) e TCO.
      - **Investimentos <-> Livro Caixa:** Aportes e resgates alimentam os cofres patrimoniais em tempo real, sendo transações autênticas do Livro Caixa.
      - **Persistência 100% Nuvem (Supabase):** Gravação síncrona dos tombstones de recebimentos fantasmas no Supabase PostgreSQL via `deleteTransactionsInDb` e `upsertTransactionsInDb`, garantindo que jamais retornem após F5.

  - **Sprint 49 (Novembro de 2026 — Arquitetura 100% Cloud-First no Supabase, Motion Deslizante Horizontal "Sliding Pill" e Efeito Híbrido Fixo):**
    - **Passo 1 — Arquitetura 100% Cloud-First (Supabase SSOT) para Desejos de Compra, Cartões e Bancos:**
      - Eliminação estrita de dependência de dados armazenados exclusivamente no navegador. O Supabase PostgreSQL agora atua como Single Source of Truth (SSOT).
      - Resolução definitiva do problema de perda de metadados em Desejos de Compra (`BrainNote` com `itemType: "wish"`): implementação do mecanismo de envelope JSON determinístico (`<!--__COINDEX_WISH_META__:{...}-->`) nas funções `encodeWishMetadata` e `decodeWishMetadata` em `app/lib/services/coindex-supabase.ts`.
      - Garantia de preservação total de campos como `itemType`, `price`, `completed`, `targetMonth`, `priority`, `storeUrl` e `completedAt` mesmo caso o banco de dados opere com schema básico sob fallback.
      - Migração SQL oficial gerada em `supabase/migrations/0002_coindex_full_cloud_columns.sql` contendo todas as colunas nativas e políticas RLS multi-tenant para `brain_notes`, `credit_cards`, `banks`, `transactions` e `user_settings`.
      - Snapshot master na nuvem armazenado em `user_settings.cloud_backup_state` para restauração imediata entre dispositivos.
    - **Passo 2 — Remoção do Botão "Atmosfera" da Topbar & Efeito Híbrido Copilot Fixo:**
      - Eliminação completa do botão "✨ Atmosfera" da Topbar (`app/page.tsx`), simplificando a barra superior do dashboard.
      - Efeito de fundo `AmbientBackgroundFX` fixado por padrão no modo `"hybrid"` (Aurora Cupertino + Micro-Grid + Spotlight sutil).
      - Adição do controle unificado `"Reduzir Animações: [Sim | Não]"` na aba Configurações (`app/SecondaryTabs.tsx`):
        - `Sim`: ativa todos os efeitos atmosféricos Híbrido Copilot e motions a 144Hz.
        - `Não`: desativa efeitos para fundo sólido puro, proporcionando máxima economia de bateria e alta performance.
    - **Passo 3 — Motor Universal de Motion Deslizante Horizontal (`SlidingSegmentedControl`):**
      - Criação do componente `app/components/SlidingSegmentedControl.tsx` baseado em medições dinâmicas de `offsetLeft`, `offsetWidth` e animação física fluida `280ms cubic-bezier(0.22, 1, 0.36, 1)` com aceleração GPU por compositor (`translate3d`).
      - Suporte aos modos `"pill"` (pílula deslizante translúcida) e `"underline"` (linha de destaque inferior deslizante).
      - Implantação completa em todas as barras de opções unidas do sistema:
        1. **Tema Cupertino na Topbar:** `[☀️ Claro | 🌙 Escuro]`.
        2. **Regime Contábil:** `[Competência | Caixa]`.
        3. **Painel Dashboard (Quick Filters):** `[Todos | Fixos | Variáveis | Cartão | PIX]`.
        4. **Central Analítica de Patrimônio:** `[Patrimônio | Ritmo no Mês | Projeção 6M]`, `[6M | 1A | Tudo]` e `[Bruto | Líquido IR | Só Aportes]`.
        5. **Radar Financeiro & Fluxo:** `[Fixos a Lançar | Contas Pendentes | Vencimentos Cartões | Saúde]` e `[Fluxo Mensal (6M) | Atividades Recentes]`.
        6. **Tabela de Lançamentos:** Filtro de situação `[Todos | Pagos | Na Fatura | Pendentes]`.
        7. **Devedores (Valores a Receber):** Filtro de situação `[Todos | Pendentes | Parciais | Quitados]`.
        8. **Bioimpedância Física:** Seletor de séries `[Peso + BF% | Só Peso (kg) | Só BF (%) | Rumo à Meta]` e períodos `[1M | 3M | 6M | 1A | Tudo]`.
        9. **Strava Progress:** Abas superiores `[Progresso | Atividades]` com a linha laranja `#FC4C02` deslizando suavemente de um lado ao outro.
        10. **Segundo Cérebro (Mural Central):** Filtro `[Todos | Notas & Objetivos | Lista de Desejos (R$)]`.
        11. **Configurações:** Seletor `[Sim | Não]` de `"Reduzir Animações"`.
        12. **Modal de Abastecimento (Veículos):** Seletor de método de cálculo `[⛽ Reserva / Parcial | 満 Tanque Cheio]`.
        13. **Investimentos:** Sub-visão `[💎 Carteira de Investimentos & Mercado | 💵 Dinheiro em Papel (Inflação IPCA)]`.
        14. **Modal de Novo Lançamento (`TransactionModal`):** Abas no topo `[Padrão | Posto Express ⛽ | Transferência 🔄]`.

  - **Sprint 48 (Novembro de 2026 — Módulo de Investimentos & Mercado Ao Vivo: The Wealth Core 144Hz, Multi-Charts Simultâneos e Simulador de Inflação do Papel):**
    - **Passo 1 — Módulo Investimentos na Sidebar & Schema de Ativos:**
      - Adição da aba dedicada `investments` na sidebar esquerda e bottom bar mobile, com ícone `TrendingUp`.
      - Extensão da interface `Transaction` com campos de telemetria de investimentos: `investmentBucket` (`"CDI" | "LCI" | "BTC" | "STOCKS" | "PAPER_CASH"`), `assetTicker`, `entryQuotePrice` e `manualYieldPct`.
    - **Passo 2 — Rota de Mercado Ao Vivo (`app/api/market-pulse/route.ts`):**
      - Agregação paralela com timeout resiliente de 5s: Binance Public API (BTC/BRL, BNB/BRL, ETH/BRL, SOL/BRL), AwesomeAPI (USD/BRL, EUR/BRL) e Banco Central do Brasil SGS (Taxa CDI / Selic e Ibovespa).
      - Retorno de cotações em tempo real, variação 24h e séries temporais de 30 dias para plotagem de gráficos com fallback offline realista embutido.
    - **Passo 3 — The Wealth Core & Gavetas Especializadas (`app/components/InvestmentsTab.tsx`):**
      - Hero card monumental com total investido a mercado via `<AnimatedNumber144 />`, custo depositado saído do bolso, lucro acumulado em R$ e % e barra multi-segmentada de alocação fluida.
      - Grid de gavetas interativas com foco spotlight 144Hz: Bitcoin & Cripto (marcação a mercado e satoshis acumulados), CDI 115% com capitalização diária composta, LCI/LCA isento de IR e Ações/FIIs.
    - **Passo 4 — Sincronização Bidirecional e Reclassificação 1-Clique:**
      - Modal rápido de aporte e resgate conectado atomicamente à coleção central de `transactions` e storage triplo, capturando cotação de entrada em tempo real.
      - Seletor de gaveta 1-clique por linha na tabela de aportes: flash visual suave na linha, reclassificação instantânea e recálculo dinâmico dos saldos a 144Hz.
    - **Passo 5 — Terminal de Mercado Ao Vivo (Multi-Charts Simultâneos Customizáveis):**
      - Exibição paralela em grade Bento de gráficos Recharts `<AreaChart>` com degradê direcional dinâmico (verde/vermelho) para todos os ativos ativos, com seletores 24H/7D/1M/1Y e popover de customização persistido no localStorage.
    - **Passo 6 — Simulador de Desvalorização do Dinheiro em Papel:**
      - Sub-aba dedicada projetando a corrosão inflacionária real (IPCA ~4,5% a.a.) do dinheiro guardado em espécie versus o custo de oportunidade da Caixinha 115% CDI em horizontes de 1, 3 e 5 anos, com gráfico comparativo duplo.

  - **Hotfix Sprint 47.1 (Novembro de 2026 — Blindagem de Persistência de Bancos e Cartões contra Sobrescrita do Supabase, União Aditiva Segura e Auto-Resgate no LocalStorage):**
    - **Passo 1 — Fim da Sobrescrita na Hidratação com `mergeEntitiesSafe` (LWW + Tombstones):**
      - Diagnóstico da causa raiz: listas incompletas ou defasadas retornadas pelo Supabase (por latência ou falhas de schema) sobrescreviam cegamente `banks` e `cards` no `localStorage`, apagando cadastros recentes.
      - Criação da função pura `mergeEntitiesSafe`: mescla listas locais e remotas com resolução Last-Write-Wins (maior `rev` e `updatedAt`, com desempate pró-local), filtragem estrita de tombstones e desduplicação por ID e nome canônico.
      - **Auto-Heal Push:** identificação síncrona de entidades locais ausentes ou mais recentes que a nuvem, disparando o envio (`upsert`) em segundo plano para autorrecuperação do banco de dados remoto.
    - **Passo 2 — Persistência Síncrona Tripla em Bancos e Cartões:**
      - Gravação no mesmo tick em três camadas: (1) namespace do usuário (`lifeos_banks_v8` / `lifeos_cards_v8`), (2) chaves legadas (`lifeos_banks_v1` / `lifeos_cards_v8`), e (3) vault de emergência global (`coindex_vault_banks_backup` / `coindex_vault_cards_backup`).
      - Proteção total contra race conditions onde o `userId` leva centenas de milissegundos para hidratar na inicialização da sessão.
    - **Passo 3 — Blindagem de Schema e Retries no Supabase:**
      - Funções `upsertCardInDb`, `upsertCardsInDb`, `upsertBankInDb`, `upsertBanksInDb` e `deleteBankInDb` com captura de erros `PGRST204` / `42703` (colunas ausentes) e fallback automático para colunas base universais, além de tolerância a esquemas sem a tabela `banks`.
    - **Passo 4 — Motor de Auto-Resgate (`rescueMissingBanksAndCards`):**
      - Varredura de emergência no `initCoindex`: inspeciona todas as chaves de storage existentes no navegador (`coindex_guest_*`, `coindex_usr_*`, `vault_*`).
      - Análise reversa de transações: identifica cartões e instituições citados em lançamentos ativos (`cardUsed`, `bankAccount`, `sourceBank`, `destinationBank`) e os reconstrói automaticamente caso tenham sido expurgados em sessões anteriores.

  - **Sprint 47 (Novembro de 2026 — Otimização Extrema de Performance para 144Hz Zero-Jank: Ticker Direto no DOM, Pipeline GPU Compositor e Desacoplamento de Scrubbing nos Gráficos):**
    - **Passo 1 — Motor `AnimatedNumber144` (Direct-DOM Ticker a 144Hz/240Hz):**
      - Eliminação estrita de `useState` durante loops de `requestAnimationFrame` (prevenindo 144 re-renderizações por segundo da raiz `page.tsx`).
      - Interpolação matemática direta via `spanRef.current.textContent` utilizando curva exponencial suave (`1 - Math.pow(1 - progress, 4)`), com suporte a prefixos, sufixos, modo privacidade (`moneyBlur`) e respeito a `prefers-reduced-motion`.
      - Aplicação nos 4 Slim KPI cards, Patrimônio Acumulado, Donut de Despesas e métricas do Strava Progress.
    - **Passo 2 — Pipeline GPU Compositor 144Hz no `AmbientBackgroundFX`:**
      - Animação das esferas difusas da Aurora Cupertino exclusivamente no compositor via `transform: translate3d(x, y, 0) scale(s)` e `will-change: transform` dentro de `contain: strict`.
      - Spotlight de cursor 100% livre de re-renders: listener com `{ passive: true }` atualiza as propriedades CSS `--spot-x` e `--spot-y` de forma coalescida a cada quadro nativo via RAF.
      - Pausa inteligente em segundo plano: classe `.tab-inactive-paused` congela animações CSS sob `document.hidden`, zerando o consumo de GPU e bateria.
    - **Passo 3 — Logo "The Equilibrium Link" Otimizada para 144Hz:**
      - Aceleração por hardware com `will-change: transform` nos grupos `<g>` móveis do SVG da logo, garantindo transição de repulsão magnética de 320ms sem recálculo de layout.
    - **Passo 4 — Desacoplamento de Scrubbing no Strava Progress (`StravaProgressGrid`):**
      - Extração do grid de progresso e metas em subcomponente memoizado (`React.memo`) com estado local de `selectedPointIndex`.
      - Scrubbing interativo no gráfico Recharts roda a 144fps atualizando exclusivamente o card isolado, sem disparar render da árvore de abas secundárias.
      - Calibração de `backdrop-filter` para `blur(16px) saturate(150%)` reduzindo o tempo de rasterização para `< 1.2ms` em telas 2K/4K.

  - **Sprint 53 (Novembro de 2026 — Limpeza de UI, Correção de Tipografia nos Controles Deslizantes, Trava Correta de Animações, Topbar Compacta e WebSocket Binance em Tempo Real):**
    - **Passo 1 — Remoção da Sub-linha Acordeão e Chevrons na Tabela:**
      - Eliminação das sub-linhas acordeão (`|- Valor Total Original...`) e ícones de expansão chevron (`>`) nas tabelas de Lançamentos (`TransactionsTableAdvanced.tsx`) e Valores a Receber / Devedores (`SecondaryTabs.tsx`). As tabelas agora exibem linhas limpas, navegação ultra-direta e visual minimalista sem interferências verticais.
    - **Passo 2 — Correção do Corte na Letra 'g' de "Pagos":**
      - Substituição de `leading-none` por `leading-normal` com `overflow-visible` e acréscimo de respiro vertical (`py-1.5 px-3.5`) no componente `SlidingSegmentedControl.tsx`. O descendente inferior das letras `g`, `p`, `y` não sofre mais nenhum corte horizontal.
    - **Passo 3 — Remoção da Barrinha Branca Vertical na Sidebar:**
      - Exclusão do indicador vertical branco posicionado dentro do botão ativo na barra lateral esquerda em `app/page.tsx`, mantendo a estética visual homogênea e o preenchimento arredondado estilo Apple iOS/macOS.
    - **Passo 4 — Topbar Minimalista com Botão '+' Compacto:**
      - Substituição do botão largo com texto "+ Novo Lançamento" por um botão quadrado compacto (`min-h-[44px] min-w-[44px] rounded-xl`) contendo apenas o ícone vetorial `<Plus className="w-4 h-4" />` e atributo de acessibilidade `title="Novo Lançamento"`.
    - **Passo 5 — Migração do Seletor de Tema para as Configurações:**
      - Transferência do controle segmentado de tema (Claro / Escuro) do cabeçalho superior para a aba de Configurações em `SecondaryTabs.tsx`, consolidando todas as preferências de aparência e atmosfera em um único local.
    - **Passo 6 — Correção da Lógica Invertida de "Reduzir Animações":**
      - Alinhamento semântico estrito do controle: "Sim" ativa o Modo Econômico (Sólido Puro, `bgFxMode="none"`, `data-animations="off"`); "Não" mantém o modo ativo de alta fidelidade (144Hz Híbrido Copilot, `bgFxMode="hybrid"`, `data-animations="on"`).
    - **Passo 7 — Saneamento de Configurações:**
      - Remoção dos cards legados de seleção de logotipo (a geometria "The Equilibrium Link" é agora a identidade permanente oficial) e do card obsoleto de banco de dados Google Sheets, mantendo a arquitetura 100% orientada à nuvem Supabase.
    - **Passo 8 — Correção do Duplo '+ + Novo Aporte':**
      - Remoção do caractere textual `+` duplicado no botão de aporte em `InvestmentsTab.tsx`, exibindo harmoniosamente o ícone vetorial `<Plus />` seguido do texto "Novo Aporte".
    - **Passo 9 — Cotações em Tempo Real via WebSocket da Binance e Rota Sem Cache:**
      - Conexão nativa por WebSocket (`wss://stream.binance.com:9443/stream?streams=btcbrl@ticker/bnbbrl@ticker/ethbrl@ticker/solbrl@ticker`) atualizando instantaneamente as cotações a cada segundo com reconexão resiliente e badge pulsante `⚡ AO VIVO`.
      - Rota `/api/market-pulse` configurada com `dynamic = "force-dynamic"`, `revalidate = 0`, `cache: "no-store"` e cabeçalhos estritos anti-cache (`no-store, no-cache, max-age=0`), servindo como fallback confiável a cada 8 segundos para câmbio e CDI.

  - **Sprint 54 (Novembro de 2026 — Carrossel Vertical Apple Wallet de 3 Cartões Nítidos com Scroll no Mouse, Correção Matemática dos Limites de Cartões, Modal de Ordenação com Engrenagem e Polling de 30s no Mercado):**
    - **Passo 1 — Carrossel Vertical Apple Wallet com Limite Fixo de 3 Cartões Nítidos:**
      - Reestruturação do widget `wallet_limits` em `app/page.tsx` para exibir no máximo 3 cartões simultaneamente (`cards.slice(clampedIndex, clampedIndex + 3)`), garantindo que a pilha não estoure verticalmente a altura dos outros Bento cards.
      - Implementação de navegação por roda do mouse com `onWheel` coalescido (`handleWalletWheel`), debounce de 140ms (`lastWalletWheelTime`) e parada de propagação (`e.stopPropagation()`) para rolagem suave da pilha.
      - Adição de botões táteis no cabeçalho `▲ / ▼` com desativação nos limites superior e inferior, além de contador dinâmico de janela (`1-3 de 5`).
      - Inclusão de bordas de espiada (peek edges) no topo e no rodapé da pilha (`filter: blur(2px)`, opacidade 40%, escala 0.96) indicando visualmente cartões adjacentes fora do enquadramento.
    - **Passo 2 — Nitidez Absoluta das Camadas de Texto nos Cartões de Crédito:**
      - Ajuste arquitetural no componente `TiltCard3D` (`MotionEngine144.tsx`) redefinindo a transformação em repouso (`mouseLeave`) estritamente para `card.style.transform = "none"`, eliminando rasterização de texturas e subpixel blur causado por persistência de matrizes 3D.
      - Aplicação de regras CSS `wallet-card-crisp` com `-webkit-font-smoothing: antialiased` e elevação de camadas de tipografia para `relative z-20` em `app/page.tsx` e `BanksTab.tsx`.
    - **Passo 3 — Remoção do Retângulo Azul Seletor nos Cartões:**
      - Remoção dos contornos azuis (`ring-2 ring-[#0A84FF]`) nos cartões da Apple Wallet, aplicando foco limpo (`outline-none focus:outline-none ring-0`) e preservando a elegância visual nativa do iOS/macOS.
    - **Passo 4 — Correção Matemática Total dos Limites no Rodapé do Widget:**
      - Criação do hook memoizado `cardLimitsAnalytics` que calcula limites exclusivamente com base nos cartões de crédito reais cadastrados pelo usuário (`cards`):
        - Limite Global: soma estrita de `Number(c.limit || 0)` de todos os cartões cadastrados (R$ 34.875).
        - Usado Global: soma da fatura atual de cada cartão (`calculateCardExposure(c, transactions, selectedMonth).used`).
        - Disponível Global: `Math.max(0, safeSub(globalTotalLimit, globalTotalUsado))`.
        - % Usado Global: percentual real sobre o limite total dos cartões.
      - Substituição das barras legadas de bancos por barras de progresso individuais por cartão de crédito cadastrado, com identificação de bandeira, nome, valores e shimmer dinâmico.
    - **Passo 5 — Modal "⚙️ Ordenar Meus Cartões" e Micro-Motions no ChartCard:**
      - Conexão do botão de engrenagem no cabeçalho do widget `wallet_limits` via props `onCustomGearClick` e `customGearTitle` no componente `ChartCard.tsx`.
      - Criação do modal `showReorderCardsModal` renderizado via `createPortal`, permitindo reordenar a prioridade dos cartões com botões `▲ / ▼` e salvamento com persistência síncrona tripla (Supabase `upsertCardsInDb`, `localStorage` e backup).
      - Micro-motions táteis refinados nos três botões superiores do `ChartCard`: arraste com scale 1.25 em azul, redimensionamento com scaleX 1.1 e engrenagem com rotação de 90° no hover e 180° no clique.
    - **Passo 6 — Calibração do Polling de Mercado para 30 Segundos:**
      - Ajuste do intervalo de polling e conexão em `InvestmentsTab.tsx` para 30 segundos (`30000ms`), reduzindo tráfego desnecessário de rede.
      - Remoção da contagem de segundos e horário textual do botão `⚡ AO VIVO`, mantendo apenas o ponto luminoso sonar pulsante e o ícone de raio.

  - **Mega-Sprint 55 (Novembro de 2026 — Limite Real dos Cartões c/ Parcelas Futuras, Detector de Assinaturas, Edição Inline & Ações em Lote, Manutenção KM em Veículos, B3 Ao Vivo, Calendário Heatmap, PRs Strava e Coindex Wrapped):**
    - **Passo 1 (M-01 & M-02) — Limite Real c/ Parcelas Futuras, Radar de Assinaturas & Conciliador de Fatura:**
      - Separação matemática contábil na interface `CardExposure`: `currentInvoice` (fatura do mês de competência) vs. `futureInstallmentsBlocked` (soma de todas as parcelas futuras que bloqueiam o limite total do cartão).
      - Cálculo de disponível real: `availableLimit = Math.max(0, limit - (currentInvoice + futureInstallmentsBlocked))`.
      - Radar de assinaturas e despesas fixas recorrentes em `BanksTab.tsx` com detecção de padrões periódicos, custo mensal acumulado, projeção anual 12x e alertas visuais de aumento de preço.
      - Conciliador relâmpago de extrato de fatura bancária em `BanksTab.tsx` com marcação instantânea de lançamentos conferidos.
    - **Passo 2 (M-03) — Edição Inline por Duplo Clique, Ações em Lote & Lançamento Rápido no Ctrl+K:**
      - Edição inline direta na tabela de lançamentos (`TransactionsTableAdvanced.tsx`) ao dar duplo clique nas células de Data, Descrição, Categoria ou Valor, com suporte a teclado (Enter para salvar, Esc para cancelar) e micro-feedback tátil.
      - Seleção múltipla de transações por checkboxes com barra de ações flutuante na base da tela (`Marcar como Pago`, `Marcar como Pendente`, `Mudar Categoria`, `Excluir Selecionados`).
      - Parser em linguagem natural integrado à Command Palette (Ctrl+K) detectando comandos como `gastei 35,90 uber pix`, `recebi 500 salario santander`, `aporte 250 btc`, exibindo card de pré-visualização instantânea e gravação no Livro Caixa com 1 toque no Enter.
    - **Passo 3 (A-01) — Manutenção Preventiva por Odômetro em Veículos:**
      - Painel de 5 manutenções vitais preventivas por quilometragem em `VehiclesTab.tsx` e `app/lib/domain/vehicle-math.ts`: Óleo e Filtro (10.000 km), Alinhamento e Rodízio de Pneus (10.000 km), Pastilhas e Fluido de Freio (25.000 km), Arrefecimento e Velas (30.000 km) e Correia Dentada (50.000 km).
      - Barras de desgaste percentual dinâmico com níveis de urgência visual (ok, warning, danger) e botão `✓ Registrar Revisão Hoje` que insere automaticamente a despesa de manutenção no Livro Caixa e atualiza o histórico do odômetro.
    - **Passo 4 (A-02) — Cotações B3 Ao Vivo & Simulador de Marcos Patrimoniais:**
      - Ingestão contínua de cotações de ações e fundos imobiliários da B3 (`PETR4`, `VALE3`, `BBAS3`, `ITUB4`, `WEGE3`, `MXRF11`, `HGLG11`, `IVVB11`) através do endpoint `/api/market-pulse` com fallback resiliente e exibição de dividendos mensais estimados por cota no módulo de Investimentos.
      - Linha do tempo interativa com física 144Hz de marcos patrimoniais (R$ 5k, R$ 10k, R$ 25k, R$ 50k, R$ 100k) com slider dinâmico de aportes compostos (R$ 100 a R$ 5.000/mês).
    - **Passo 5 (A-03 Parte 2) — Calendário Financeiro Heatmap & No-Spend Days:**
      - Sub-aba `📅 Calendário` no widget `cashflow_recents` do Dashboard executivo, apresentando grade mensal completa de 7 colunas (DOM a SÁB) com pontos semânticos (verde para entradas, vermelho para saídas, azul para aportes).
      - Telemetria de "No-Spend Days" com streak contínuo de dias sem gastos e detalhamento instantâneo dos lançamentos ao clicar em qualquer dia do mês.
    - **Passo 6 (A-04) — Recordes Pessoais (PRs) e Zonas de Pace no Strava:**
      - 4 cards de troféus atléticos na aba Bio & Strava: Pace PR (km mais rápido), Longão (maior distância percorrida), Melhor 5K e Maior Altimetria acumulada.
      - Barra horizontal segmentada das 4 zonas de intensidade e esforço cardiovascular: Z1 Regenerativo (> 6'30"), Z2 Aeróbico (5'30" - 6'30"), Z3 Limiar (4'45" - 5'30") e Z4 Anaeróbico / VO2 Máx (< 4'45").
    - **Passo 7 (Helena Costa Produto #1 & #2) — Alertas Proativos Acionáveis, Coindex Wrapped & Gaveta Mobile:**
      - 4 regras preditivas no sininho de notificações da Topbar (faturas de cartão a vencer em até 5 dias, valores a receber em aberto, manutenções veiculares próximas e déficit semanal de treinos) com botão de navegação direta `Ir para [Aba] →`.
      - Modal executivo "Ritual de Fechamento do Mês (Coindex Wrapped)" com selo de performance (ex: Mês Frugal & Investidor 🏆), taxa de aporte, 4 KPIs mestres, top 3 maiores despesas, km de corrida/veículo e botão de copiar resumo formatado.
      - Gaveta inferior estilo iOS Bottom Sheet no mobile (`☰ Mais`) para acesso imediato a todos os 12 módulos e utilitários da plataforma em telas compactas.

  - **Sprint 56 (Novembro de 2026 — Módulo "Sobre" com Palco Monumental Interativo 144Hz da Logo "The Equilibrium Link", Manifesto Coindex de Missão/Visão/Valores, Telemetria de Engenharia e Versão Oficial v0.44.0):**
    - **Passo 1 — Constantes Oficiais de Versão e Navegação do Sistema:**
      - Exportação em `app/lifeos-data.tsx` das constantes oficiais: `COINDEX_APP_VERSION = "0.44.0"`, `COINDEX_BUILD_DATE = "Novembro de 2026"`, `COINDEX_RELEASE_CODENAME = "Equilibrium Wealth & Life OS"` e bump de `APP_VERSION = "0.44.0"`.
      - Adição da aba `"about"` à união tipada `ActiveTab`.
      - Inclusão do item `Sobre` na Sidebar Esquerda logo abaixo de `Configurações`, na Gaveta Mobile "Mais Módulos" e na Command Palette (`Ctrl + K`).
    - **Passo 2 — Palco Monumental Interativo "The Equilibrium Link" (`app/components/CoindexLogo.tsx`):**
      - Criação do componente `CoindexLogoMonumental` com renderização expandida vetorial `viewBox="0 0 120 84"`, background de precisão técnica arquitetural (radar concêntrico em `r=41`, `r=16` e cruz de mira nos nós `cx=44` e `cx=76`).
      - Suporte dinâmico a realce de segmentos via `highlightSegment` (`all`, `left`, `right`, `weave`) com transição suave de opacidade e pontos de entrelaçamento com glow pulsante.
      - Estado `isPulsing` com aceleração do ciclo orbital de luz para 1,4s e efeito sonoro visual.
    - **Passo 3 — Módulo "Sobre" com 5 Blocos Cinematográficos (`app/components/AboutTab.tsx`):**
      - **Bloco 1 (Hero Monumental & Versão):** `TiltCard3D` com física giroscópica em 144Hz, iluminação radial atmosférica, logo monumental interativa e botão `"⚡ Pulsar Motor 144Hz"` disparando 22 partículas azuis em arco quântico (`triggerAuraBurst`). Badges de telemetria de versão e status da nuvem.
      - **Bloco 2 (A Filosofia do Elo):** Seletor segmentado deslizante `SlidingSegmentedControl` interligado ao foco visual do elo da logo, com manifesto poético-técnico do Elo Esquerdo em Titânio (Fundação e Controle), Elo Direito em Apple Blue (Expansão e Futuro) e o Ponto de Entrelaçamento (Equilíbrio Perpétuo).
      - **Bloco 3 (Missão, Visão e 4 Objetivos Estratégicos):** Bento Grid interativo com iluminação de borda por proximidade do cursor (`useProximityBorderGlow`) detalhando os 4 pilares: Simetria Contábil Estrita, Performance 144Hz Zero-Jank, Inteligência em Tempo Real e Soberania Cloud-First.
      - **Bloco 4 (5 Valores Inegociáveis):** 5 cards estilizados destacando Precisão no Centavo (`#PrecisionFirst`), Fluidez como Respeito (`#144HzCraft`), Design que Acalma (`#CalmAndClarity`), Soberania na Nuvem (`#CloudFirstSSOT`) e Patrimônio + Saúde (`#EquilibriumOS`).
      - **Bloco 5 (Telemetria de Engenharia & Ficha Técnica):** 4 contadores vivos com o odômetro numérico `AnimatedNumber144` (144 Hz, 100% Cloud Supabase, 56 Sprints, 0 ms de bloqueio de thread), especificação detalhada da stack técnica e assinatura oficial de engenharia.
    - **Passo 4 — Integração na Interface Central (`app/SecondaryTabs.tsx` e `app/page.tsx`):**
      - Renderização direta do `<AboutTab />` quando `activeTab === "about"` no despachador de abas de `SecondaryTabs`.
      - Roteamento completo via Sidebar, Mobile Drawer e atalho rápido do teclado (`Ctrl + K`).

  - **Sprint 57 (Novembro de 2026 — Correção Cirúrgica de Motion na Logo Principal 144Hz e Reforma Cinemática da Página Sobre com Manifesto Editorial Aprofundado):**
    - **Passo 1 — Correção do Motion da Logo Principal (`app/components/CoindexLogo.tsx` e `app/globals.css`):**
      - Resolução definitiva de engasgos e saltos de quadro no pulso orbital 144Hz através de normalização vetorial com `pathLength="100"` nos elementos SVG e keyframes de `stroke-dashoffset` sincronizados (100 -> 0) com `stroke-dasharray: 16 84`, garantindo um loop contínuo e sem costura (zero subpixel discrepancy).
      - Substituição de recortes estáticos com cor de fundo (`var(--cupertino-sidebar)`) por máscaras alfa puras (`<mask id="...">`) com transparência real nos pontos de entrelaçamento over-under (folga de 3.5px), eliminando blocos sólidos e artefatos de renderização em diferentes temas ou gradientes.
      - Aceleração por hardware pura com `transform: translateZ(0)` e `will-change: transform` nos grupos vetoriais e `will-change: stroke-dashoffset` na classe `.coindex-orbital-glow`, erradicando cascatas de repintura (layer invalidation) no compositor.
    - **Passo 2 — Reforma Cinemática da Página "Sobre" (`app/components/AboutTab.tsx`):**
      - **Seção 1 (Hero de Abertura Monumental):** Palco heróico com a Logo Gigante Animada (`CoindexLogoMonumental`), tipografia suíça display, badges oficiais de telemetria da versão `v0.44.1 (Estável)` e botão tátil `"⚡ Pulsar Motor 144Hz"` com disparo quântico de 22 partículas azuis (`triggerAuraBurst`).
      - **Seção 2 (O Manifesto Coindex — Coin + Index + Co-Op):** Explicação aprofundada da tríade etimológica e de produto em 3 colunas monumentais: *COIN* (O Ativo, tangibilidade e motor contábil em centavos inteiros), *INDEX* (O Catálogo, cotações B3 ao vivo, telemetria Inmetro e zonas de pace Strava) e *CO-OP / COPILOT* (A Parceria, detecção de assinaturas, ritual Coindex Wrapped e soberania com Supabase RLS). Inclui o explorador interativo da geometria do elo com `SlidingSegmentedControl`.
      - **Seção 3 (Missão, Visão e 4 Objetivos Estratégicos):** Cards Bento em vidro translúcido Cupertino com iluminação reativa à proximidade do cursor (`useProximityBorderGlow`).
      - **Seção 4 (Linha do Tempo de Evolução & Engenharia):** Trilha visual interativa pelas 6 Grandes Eras de Engenharia da plataforma (Gênese Contábil, Expansão de Domínios, Engenharia 144Hz, Mercado Ao Vivo, Soberania Cloud-First e The Equilibrium Era).
      - **Seção 5 (Os 5 Valores Fundamentais):** Cards com micro-motions táteis de elevação (`hover:-translate-y-2`) destacando Precisão no Centavo, Fluidez como Respeito, Design que Acalma, Soberania na Nuvem e Patrimônio + Saúde.
      - **Seção 6 (Rodapé Técnico Executivo):** 4 odômetros numéricos vivos a 144Hz (`AnimatedNumber144`), especificação completa da stack técnica e créditos de arquitetura de software.


  - **Sprint 58 (Novembro de 2026 — Persistência Absoluta Multi-Device via Túnel de Metadados Universal e Cofre Mestre Cloud Vault na Tabela Transactions do Supabase):**
    - **Passo 1 — Túnel de Metadados Universal na Descrição (`app/lib/services/coindex-supabase.ts`):**
      - Diagnóstico e resolução da causa raiz de divergência entre múltiplos computadores: ausência de novas colunas no schema remoto do Supabase PostgreSQL (`investment_bucket`, `asset_ticker`, `entry_quote_price`, `manual_yield_pct`, etc.).
      - Implementação dos codificadores e decodificadores universais `encodeTxForSupabase(tx)` e `decodeTxFromSupabase(row)` com codificação UTF-8 Base64 universal (`safeBase64Encode` e `safeBase64Decode`) anexando o pacote delimitado ` ||__CXM__:<base64>` à coluna nativa `description` existente desde a Sprint 1.
      - Decodificação transparente na recuperação de lançamentos: strip da tag para que a interface exiba apenas o texto limpo da descrição, com hidratação imediata de 100% dos campos estendidos de investimentos, cartões, bancos e rateios.
      - Fallback de schema em `upsertTransactionsInDb`: persistência resiliente mesmo que o banco de dados remoto rejeite novas colunas, garantindo zero perda de dados.
    - **Passo 2 — Cofre Mestre de Nuvem (`__COINDEX_CLOUD_VAULT__`):**
      - Criação de uma linha determinística dedicada na própria tabela `transactions` (`id: 00000000-0000-4000-8000-<cleanUserId>`, categoria `__COINDEX_CLOUD_VAULT__`, valor 0, data `2099-12-31`).
      - Armazenamento em nuvem do estado global da aplicação: Calibração de Saldo Real (`realBalanceOverride`), modo de rendimento (`yieldMode`), seleção de gráficos ao vivo (`visibleMarketCharts`), slider de aportes (`simulatorMonthlyContribution`), cartões, bancos, notas e tombstones.
      - Filtro de isolamento estrito: a linha do cofre mestre é separada das transações normais, nunca sendo exibida na listagem contábil nem somada nos totais de receitas ou despesas.
    - **Passo 3 — Centralização e Propagação no Módulo de Investimentos (`app/components/InvestmentsTab.tsx` e `app/SecondaryTabs.tsx`):**
      - Elevação dos estados de calibração patrimonial e preferências da carteira de investimentos para `app/page.tsx`, repassados via props para `SecondaryTabs` e `InvestmentsTab`.
      - Integração do ajuste de saldo real (`realBalanceOverride`) ao somatório do valor total investido (*The Wealth Core*), com badge visual e gaveta de calibração rápida inline no card Hero.
      - Salvamento instantâneo em nuvem no cofre mestre ao alterar gráficos visíveis de mercado ou valor de aporte no simulador de marcos patrimoniais.
    - **Passo 4 — Sincronização Manual 1-Clique na Topbar (`app/page.tsx`):**
      - Transformação do badge de status de sincronização da Topbar (`🟢 Sincronizado`) em botão interativo (`handleManualForceCloudSync`).
      - Permite forçar o envio imediato de todas as transações locais e do cofre mestre com notificação toast de sucesso instantânea (`☁️ Sincronização Concluída: 100% dos dados salvos no Cofre Nuvem Supabase!`).
    - **Passo 5 — Garantia Zero Migration:**
      - Eliminação definitiva da necessidade de executar scripts SQL de migração DDL manuais no painel do Supabase; o sistema opera imediatamente em qualquer computador ou navegador a partir do primeiro login.


  - **Sprint 58.1 (Novembro de 2026 — Reforma Limpa da Aba Sobre com Manifesto Pessoal e Nitidez Vetorial Absoluta da Logo):**
    - **Passo 1 — Correção Definitiva da Logo Pixelada e Remoção do Card Torto (`app/components/CoindexLogo.tsx` e `app/components/AboutTab.tsx`):**
      - Diagnóstico da causa raiz: eliminação do container `<TiltCard3D>` (que causava inclinação e distorção óptica do card no palco principal) e remoção de `transform: scale(...)`, `will-change: transform` e filtros CSS `drop-shadow(...)` sobre o SVG da logo.
      - Renderização do SVG gigante com dimensões nativas diretas (`width={200} height={140} viewBox="0 0 120 84" shapeRendering="geometricPrecision"`).
      - Desacoplamento do halo de iluminação ambiente para uma `<div>` HTML de fundo (`absolute -inset-6 rounded-full bg-gradient-to-tr from-[#0A84FF]/20 via-[#38BDF8]/10 to-transparent blur-2xl`).
      - Micro-interação de hover restrita a deslocamento vetorial puro (`translate-x-[1.5px]` e `-translate-x-[1.5px]`), garantindo nitidez cristalina em 100% dos displays Retina e alta densidade.
    - **Passo 2 — Expurgo Total de Jargões Técnicos e Ficha de Engenharia (`app/components/AboutTab.tsx`):**
      - Remoção integral do botão de overclock de 144Hz, badges de telemetria de GPU/SSOT, seção de contadores em Hz/ms e blocos de código/linguagens de programação, redirecionando o tom da página para o desenvolvimento pessoal.
    - **Passo 3 — Nova Estrutura Editorial Focada em Propósito e Vida (`app/components/AboutTab.tsx`):**
      - **Seção 1 (Palco Principal):** Logo oficial The Equilibrium Link grande e nítida, tipografia limpa `COINDEX`, subtítulo `Desenvolvimento Pessoal • Gestão Financeira • Saúde & Conhecimento` e pílula discreta com `Versão 0.45.1`.
      - **Seção 2 (O Manifesto):** Card nobre de leitura contendo o manifesto pessoal de integração entre objetivos pessoais, profissionais e financeiros, destacando o Coindex como ponto de clareza, foco e direção.
      - **Seção 3 (Os 4 Pilares do Ecossistema):** Grid Bento 2x2 com iluminação de proximidade (`useProximityBorderGlow`) detalhando Organização Financeira & Patrimônio, Saúde & Bem-Estar, Conhecimento & Insights e Hábitos & Metas.
      - **Seção 4 (Missão, Visão, Valores & Símbolo do Equilíbrio):** Tríade institucional acompanhada da explicação do entrelaçamento contínuo entre o Elo Esquerdo em Titânio (disciplina, clareza e fundação) e o Elo Direito em Apple Blue (expansão, sonhos e futuro), finalizando com rodapé minimalista.

  - **Sprint 59 (Novembro de 2026 — Auditoria de Abastecimento, Odômetro Customizável e Modo de Seleção Sob Demanda v0.45.2):**
    - **Passo 1 — Auditoria Contábil de Combustível (`app/lib/domain/vehicle-math.ts` e `app/components/VehiclesTab.tsx`):**
      - Eliminação de falsos positivos (ex: "Imposto" contendo substring "posto") e deduplicação estrita de abastecimentos por ID.
      - Eixo X do gráfico "Gasto com Combustível por Mês" normalizado com parser cronológico canônico `MM/AA`, eliminando rótulos truncados como `11/`.
      - Unificação do cabeçalho da aba Veículos para um único botão `Registrar Abastecimento` e migração do seletor de cor do odômetro para a engrenagem do próprio widget.
    - **Passo 2 — Plano de Manutenção Preventiva 100% Customizável (`app/components/VehiclesTab.tsx`):**
      - Adição, edição, exclusão e restauração de padrões de itens de revisão preventiva por odômetro (`CustomMaintenanceDefinition`).
      - Sincronização bidirecional automática de quilometragem (`nextKm = lastKm + intervalKm`) e persistência no Cofre Nuvem `__COINDEX_CLOUD_VAULT__`.
    - **Passo 3 — Modo de Seleção Sob Demanda e Barra Flutuante via Portal (`app/TransactionsTableAdvanced.tsx`):**
      - Ativação do modo multi-select por botão `☑️ Selecionar` ou Long-Press de 320ms em qualquer linha/card da tabela.
      - Barra flutuante de ações em lote renderizada via `createPortal` com fixação central e atalho `Esc` para cancelamento instantâneo.

  - **Sprint 60 (Novembro de 2026 — Soberania Estrita da Nuvem Supabase SSOT e Fim do Merge Aditivo Local v0.46.0):**
    - **Passo 1 — Expurgo de Merge Aditivo e Chaves Fantasmas (`app/page.tsx`):**
      - Desativação completa de `mergeEntitiesSafe` e `rescueMissingBanksAndCards`. Supabase passa a ser 100% a única fonte da verdade (SSOT), sobrescrevendo o cache local sem ressuscitar entidades deletadas.
      - Purga proativa de chaves legadas de teste e backup no carregamento inicial (`lifeos_banks_v1`, `coindex_vault_cards_backup`, `coindex_vault_banks_backup`).
      - Desativação do Auto-Heal Push na inicialização: a nuvem só é modificada sob ação intencional do usuário.
    - **Passo 2 — Exclusão Atômica de Cartões e Bancos com Tombstone Imediato (`app/page.tsx`):**
      - Deleção síncrona na tabela `credit_cards` do Supabase e no cofre mestre `__COINDEX_CLOUD_VAULT__`.
      - Adição do botão de lixeira rápida (`🗑️`) dentro do modal "⚙️ Ordenar Meus Cartões".
    - **Passo 3 — Sincronização Forçada com Purga de Cache na Topbar (`app/page.tsx`):**
      - Clique no badge de sincronização purga o cache de sessão e re-hidrata a interface 100% diretamente da nuvem Supabase.

  - **Sprint 61 (Novembro de 2026 — Popovers em Portal Opaco sem Vazamento, Scrollbar Fina sem Setas e Higienização de Categorias v0.46.1):**
    - **Passo 1 — Popovers de Filtro em Portal 100% Opaco (`app/TransactionsTableAdvanced.tsx` e `app/globals.css`):**
      - Todos os 7 popovers de filtro de cabeçalho da tabela (`Data`, `Categoria`, `Custo`, `Método`, `Odômetro`, `Situação`, `Valor`) desacoplados das tags `<th>` e renderizados via `createPortal(..., document.body)` com `z-[99999]`.
      - Fundo 100% sólido e opaco (`#0F1420` no dark mode e `#FFFFFF` no light mode) sem transparência ou `backdrop-blur`, impedindo completamente que textos da tabela por trás vazem por transparência.
      - Posicionamento dinâmico calculado por `getBoundingClientRect()` com bounding box viewport safe e fechamento inteligente ao clicar fora, scrollar ou pressionar `Esc`.
    - **Passo 2 — Mini Busca Rápida e Scrollbar Fina estilo Cupertino (`app/TransactionsTableAdvanced.tsx` e `app/globals.css`):**
      - Mini campo de busca rápida (`🔍 Filtrar categoria...`) no topo do popover de categorias, com pesquisa em tempo real e botões "Todas" e "Limpar".
      - Nova classe CSS utilitária `.cupertino-thin-scroll` com largura de 5px, trilho transparente e supressão global de setas nativas do Windows (`::-webkit-scrollbar-button { display: none !important; }`).
    - **Passo 3 — Higienização Automática de Categorias Legadas (`app/lifeos-data.tsx`, `app/lib/services/coindex-supabase.ts` e `app/TransactionsTableAdvanced.tsx`):**
      - Padronização determinística em `migrateLegacyCategory`: `Aporte / Investimento` -> `Aporte`, `Benefícios (VA/Combustível)` -> `Alimentação`, `Manutenção` -> `Manutenção Veículo`, `Selfiit` -> `Academia`, `DSR` -> `Salário`.
      - Sanitização automática na decodificação de dados remotos (`decodeTxFromSupabase`) e filtro de busca da tabela.
      - Desduplicação case-insensitive via `Map` e ordenação alfabética estrita `localeCompare("pt-BR")` em `allUniqueCategories`.
    - **Passo 4 — Ocultação Estrita da Coluna de Checkboxes (`app/TransactionsTableAdvanced.tsx`):**
      - `<th>` e `<td>` da coluna de seleção estritamente omitidos do DOM quando `showCheckboxes === false`, garantindo que "Data" seja sempre a primeira coluna visível.

  - **Sprint 62 (Novembro de 2026 — Reengenharia 100% Cloud-First no Supabase PostgreSQL assinada por Henrique Montenegro v0.47.0):**
    - **Pilar 1 — Conversor Determinístico `ensureValidUuid` e Erradicação do Erro PostgreSQL 22P02 (`app/lib/services/coindex-supabase.ts`):**
      - Algoritmo gerador de 128 bits determinísticos baseado em 4 sementes FNV-1a de 32 bits com aplicação de máscara RFC 4122 v4 (`0x40` no byte de versão e `0x80 | 0x3f` no byte de variante).
      - Converte qualquer ID alfanumérico ou legado (ex: `tx-quick-...`, `tx-123...`) para um UUID v4 estritamente válido antes de qualquer `upsert` ou `delete` no PostgreSQL.
      - O ID original é preservado dentro do payload de metadados Base64 `||__CXM__:` (`meta.originalId`) e restaurado com 100% de fidelidade em `decodeTxFromSupabase`.
    - **Pilar 2 — Blindagem do Cofre Mestre V3 contra Restrições SQL e Filtros (`app/lib/services/coindex-supabase.ts`):**
      - O registro mestre `__COINDEX_CLOUD_VAULT_V3__` passa a ser gravado com UUID determinístico derivado do `userId` (`getCloudVaultRowId`) e utiliza estritamente as 9 colunas universais com valores padrão à prova de falhas: `category: "Outros"`, `cost_type: "Fixo"`, `payment_method: "PIX"`, `status: "Pago"`, `amount: 0`.
      - Supressão de enums ou categorias especiais (`"__COINDEX_CLOUD_VAULT__"`, `"Sistema"`) que poderiam ser rejeitados por triggers ou check constraints do PostgreSQL.
      - Detecção de linhas do cofre via `isCloudVaultRow` isolada antes de qualquer parsing contábil ou migração de categoria em `fetchAllCoindexData`; garantia de 0% de interferência em totais de receitas, despesas ou listagens de lançamentos.
    - **Pilar 3 — Expansão Universal do Cofre Mestre para 100% dos Módulos (`app/lib/services/coindex-supabase.ts` e `app/page.tsx`):**
      - O payload `CoindexCloudVaultState` agora abrange: Cartões de crédito, Contas bancárias, Status financeiro fixo, Desejos de compra (Wishlist), Notas (BrainNotes), Investimentos (B3, CDI, BTC, calibração de saldo real `realBalanceOverride`, modo de rendimento, aportes no simulador de marcos), Meus Veículos (odômetro, planos de revisão preventiva, histórico e telemetria de combustível), Bio & Strava e UI Settings (tema claro/escuro, modo de efeitos de fundo e layout do dashboard).
    - **Pilar 4 — Sincronização Central Reativa (Auto-Sync) com Debounce de 600ms (`app/page.tsx`):**
      - Criação da ref de segurança `isInitialCloudHydrationCompleteRef` para bloquear escritas prematuras antes do término do carregamento inicial.
      - Ref reativa `latestStateRef` mantendo o snapshot mais fresco de todos os estados sem re-renderizações parasitas.
      - `useEffect` reativo disparando `pushFullStateToCloud` com debounce de 600ms após qualquer alteração em qualquer módulo, atualizando o badge para `🟡 Salvando na Nuvem...` e, em seguida, para `🟢 Sincronizado` se `ok: true`.
    - **Pilar 5 — Modal Central de Sincronização & Inspetor Cloud via Portal (`app/page.tsx`):**
      - Clique no badge da Topbar abre o Inspetor de Nuvem renderizado via `createPortal` com design Cupertino Glassmorphism.
      - Exibe diagnóstico de rede em tempo real (latência em ms via ping, status PostgreSQL com RLS, usuário autenticado e URL mascarada).
      - Resumo de telemetria dos 9 módulos com contadores em tempo real.
      - Ação explícita `⬆️ Enviar Tudo Deste Computador para a Nuvem Agora (Push)` com verificação de leitura no banco.
      - Ação explícita `⬇️ Baixar da Nuvem e Substituir Este Computador (Pull)` com restauração completa de 100% dos dados.

  - **Sprint 63 (Novembro de 2026 — Upgrade Cinematográfico do Motor de Fundo Cupertino Ambient FX 2.0 v0.48.0):**
    - **Pilar 1 — Poeira Estelar 3D em 3 Camadas com Difração Óptica de 4 Pontas (`app/components/AmbientBackgroundFX.tsx`):**
      - Criação de 115 micropartículas em órbita estelar com distribuição de profundidade: Camada 1 (Deep Space, 65%, velocidade lenta e raio 0.4–0.9px), Camada 2 (Crisp Starlight, 25%, cruzes de difração óptica de 4 pontas desenhadas via `stroke` fino de 0.65px) e Camada 3 (Foreground Bokeh Orbs, 10%, discos translúcidos com desfoque e velocidade de paralaxe aumentada).
    - **Pilar 2 — Interatividade Física com Cursor e Brisa Elástica (`app/components/AmbientBackgroundFX.tsx`):**
      - Interação cinemática repulsora em raio de 135px ao redor do cursor do mouse, com velocidade angular derivada e amortecimento inercial (`damping = 0.94`).
      - Ganho de brilho e escala (`flareBoost` de até +45%) nas partículas próximas ao cursor.
    - **Pilar 3 — Estrelas Cadentes Cinematográficas (Shooting Stars):**
      - Disparo periódico de meteoros a cada 11–17 segundos no terço superior da tela com trajetória diagonal hiperbólica, gradiente linear e duração de 900ms.
    - **Pilar 4 — Ondas de Seda Harmônicas (Silk Contour Waves):**
      - Três feixes principais compostos por 5 fitas curvas ultrafinas com equação senoidal dupla harmônica (`y = sin(x*f1 + t) + sin(x*f2 - t*0.7)`), renderizadas com gradiente horizontal da paleta ativa e reflexo especular na passagem do cursor.
    - **Pilar 5 — Aurora Camaleão Contextual por Aba & Suporte Modo Claro:**
      - Sistema de transição suave LERP contínua (0.035/frame) entre 6 paletas de humor cromático de acordo com a aba ativa (`activeTab`): Dashboard (Indigo/Cyan), Transações (Emerald/Teal), Investimentos (Violet/Fuchsia), Cartões (Sky/Cyan), Bio & Strava (Sunset Rose) e Veículos (Amber/Orange).
      - Modo Claro adaptativo com fundo `#F2F4F8`, partículas e ondas em tons pastéis suaves sem perda de contraste do conteúdo.
    - **Pilar 6 — Performance Estrita a 144Hz e Blindagem Arquitetural:**
      - Container raiz estritamente fixo (`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none`) com `style={{ transform: "none" }}` para erradicar qualquer conflito de containing block em modais e popovers renderizados via `createPortal`.
      - Supressão de processamento e congelamento de `requestAnimationFrame` quando `document.hidden === true`.

  - **Sprint 64 (Novembro de 2026 — Arquitetura 100% Nuvem Estrita Zero-LocalStorage, Cross-PC Live Sync e Painel Verídico de Verificação Cloud assinada por Henrique Montenegro, Clara Vance e Davi Kroner v0.49.0):**
    - **Pilar 1 — Suavização da Poeira Estelar Micro-Sutil (`app/components/AmbientBackgroundFX.tsx`):**
      - Calibração da opacidade base (`baseAlpha`) de todas as 115 micropartículas para uma faixa super discreta entre `0.04` e `0.16` com teto absoluto estrito de `0.22` mesmo no ápice de cintilação (`twinkle`).
      - Redução do raio máximo da Camada 2 para `1.3px`, opacidade máxima de halo para `0.06` e micro-feixes em cruz de 4 pontas reduzidos para `2.5px` a `4.5px` com opacidade máxima de `0.10` sem branco estourado.
      - Efeito `Mouse Breeze` mantendo o deslocamento elástico mas com ampliação de luminosidade próxima ao cursor limitada a no máximo `+5%`.
      - Estrelas cadentes (Shooting Stars) calibradas com opacidade máxima de `0.16`, garantindo sofisticação ultra-elegante.
      - Preservação 100% intacta da Aurora Camaleão (`TAB_MOOD_PALETTES`) e das Ondas de Seda Harmônicas (`Silk Contour Waves`).
    - **Pilar 2 — Arquitetura 100% Nuvem Estrita (Zero LocalStorage para Entidades de Dados):**
      - Erradicação definitiva da leitura de dados de entidades a partir do navegador (`localStorage`) ao inicializar a sessão (`initCoindex`): Lançamentos, Cartões, Bancos, Investimentos, Orçamento Fixo, Veículos, Notas e Desejos passam a vir 100% do Supabase PostgreSQL.
      - Implementação da função `purgeAllEntityLocalCaches` em `app/lib/domain/user-storage.ts` para expurgo proativo de quaisquer caches legados (`lifeos_txs_v8`, `lifeos_cards_v8`, `lifeos_banks_v8`, `lifeos_status_v8`, `lifeos_notes_v8`, `coindex_vault_*`).
      - Eliminação de fusões aditivas (LWW) locais na inicialização: a carga remota da nuvem (`fetchAllCoindexData`) atua como autoridade suprema e única.
    - **Pilar 3 — Cross-PC Live Sync no Foco da Janela e Visibilidade (`app/page.tsx`):**
      - Adição de listeners globais para `window.focus` e `document.visibilitychange` com throttle de 15 segundos: ao alternar de aba no PC de casa ou do trabalho, o Coindex consulta o Supabase silenciosamente em segundo plano e atualiza a tela com o estado mais fresco sem necessidade de recarregar a página (F5).
    - **Pilar 4 — Auditoria Verídica de Nuvem e Função `verifyLiveCloudSyncStatus` (`app/lib/services/coindex-supabase.ts`):**
      - Criação da função de telemetria em tempo real que consulta o Supabase PostgreSQL, afere latência em ms via `performance.now()`, confere o número exato de lançamentos salvos no banco vs. exibidos na tela, atesta a existência do registro `__COINDEX_CLOUD_VAULT_V3__` e a quantidade de cartões salvos nele.
    - **Pilar 5 — Painel Oficial de Verificação Cloud nas Configurações (`app/SecondaryTabs.tsx`):**
      - Posicionado com destaque no topo da aba Configurações:
        1. Indicador Principal 1: Status do Servidor (`🟢 ONLINE` com latência em ms ou `🔴 OFFLINE`).
        2. Indicador Principal 2: Pílula grande `Sincronizado com a Nuvem: SIM ✅` (#30D158) ou `Sincronizado com a Nuvem: NÃO ⚠️` (#FF453A).
        3. Prova Real de Contagem lado a lado (Lançamentos na nuvem vs. na tela, Cartões na nuvem vs. na tela, Modo 100% Nuvem Estrito e timestamp da verificação).
        4. Botões de ação rápida: `🔍 Testar e Verificar Nuvem Agora`, `⬆️ Forçar Gravação na Nuvem` e `⬇️ Recarregar Dados da Nuvem`.

  - **Sprint 65 (Novembro de 2026 — Delta Sync Ultra-Rápido, Fim do Erro de Sync Travado, Deduplicação Automática e Correção de Aportes Cloud assinada por Henrique Montenegro v0.49.1):**
    - **Pilar 1 — Fim do "Erro de Sync" Travado e Delta Sync Ultra-Rápido (<100ms) (`app/page.tsx` e `app/lib/services/coindex-supabase.ts`):**
      - Desacoplamento do Auto-Sync Reativo de 600ms: em vez de disparar reenvio em massa de todas as 330 transações (que causava latência de 2203ms e travava o badge em vermelho), o auto-sync agora grava SOMENTE o registro do Cofre Mestre V3 (`saveCloudVaultInTransactionsDb`). A operação salva os 9 módulos num único payload ultra-compacto em apenas ~40-80ms.
      - Salvamento atômico individual (Delta Sync): Lançamentos criados, editados ou alternados no CRUD usam `upsertTransactionInDb` diretamente no instante da ação.
      - Auto-cura imediata: Toda operação concluída com êxito define `sheetsSyncStatus` como `state: "success"`, eliminando permanentemente avisos de erro estagnados na topbar.
    - **Pilar 2 — Deduplicação Automática e Inteligente de Transações Clonadas (`app/lib/services/coindex-supabase.ts`):**
      - Criação da função de pontuação heurística de qualidade `scoreTransactionQuality` (prioriza metadados ricos de investimentos, tickers, cotações, parcelas, telemetria de combustível e formato UUID v4 RFC 4122).
      - Implementação de `deduplicateCloudTransactions(txs)` com agrupamento em 2 fases: fase 1 por chave canônica determinística UUID e fase 2 por assinatura semântica de conteúdo (`date|normalizedDesc|cents|category|installment|costType|pm`).
      - Identifica clones originados durante a migração de IDs legados, elege o registro de maior qualidade e coleta os IDs obsoletos para deleção.
    - **Pilar 3 — Purga Física em Lote no Supabase PostgreSQL (`purgeDuplicateTransactionsInDb`):**
      - Remoção segura de registros duplicados em blocos de 50 IDs, com blindagem absoluta que impede qualquer exclusão da linha do Cofre Mestre V3.
      - Executada de forma assíncrona em segundo plano durante `fetchAllCoindexData` e na verificação ao vivo de `verifyLiveCloudSyncStatus`, restabelecendo a contagem de transações salva na nuvem exatamente igual à exibida na tela.
    - **Pilar 4 — Medição Real de Latência de Rede via Ping do PostgreSQL (`pingSupabaseDatabase`):**
      - Substituição do ping que consultava `/api/market-pulse` (Yahoo Finance / Brapi) por uma consulta HEAD direta e ultra-leve (`select("id", { count: "exact", head: true }).limit(1)`) com `performance.now()`.
      - Inspetor Cloud e auditoria agora refletem a latência física verdadeira do banco de dados (~30-80ms).
    - **Pilar 5 — Correção do Contador de Aportes de Investimentos & B3 e Polimento do Inspetor Cloud (`app/page.tsx`):**
      - Contador de aportes corrigido para considerar lançamentos com categoria `"Aporte"`, `"Aporte / Investimento"`, `"Investimentos"`, `flowType === "INVESTMENT"` ou `Boolean(t.investmentBucket)`, exibindo o total real de aportes realizados em vez de `0 aportes`.
      - Ajuste cosmético no item "Veículos & Revisões:" com `gap-2` e `shrink-0` para prevenir quebra de layout indesejada.
      - Banner de alerta com botão acionável de reenvio atômico imediato ("Reenviar Agora") no Inspetor Cloud sempre que um erro pontual for detectado.

  - **Sprint 66 de Emergência (Novembro de 2026 — Resgate Forense de Lançamentos de Set/Out/Nov, Des-inversão MDY e Persistência Universal YYYY-MM-DD no PostgreSQL assinada por Henrique Montenegro v0.49.2):**
    - **Pilar 1 — Diagnóstico Forense da Causa Raiz do Sumiço de Lançamentos:**
      - O frontend armazenava datas estritamente no padrão brasileiro `DD-MM-YYYY` (ex: `"07-11-2026"`). Ao enviar esse valor diretamente para a coluna `date` do PostgreSQL:
        1. Para dias `> 12` (ex: `"15-09-2026"`, `"20-10-2026"`), o PostgreSQL disparava o erro `22008 (date/time field value out of range)`, abortando todo o lote com "Erro de Sync" e mantendo esses registros salvos apenas localmente.
        2. Para dias `<= 12` (ex: `"07-11-2026"`, `"06-11-2026"`, `"05-10-2026"`), o parser do PostgreSQL em estilo `MDY` interpretava erroneamente o dia como mês e o mês como dia (ex: `2026-07-11`), arremessando as despesas de Setembro/Outubro/Novembro para os meses de Março a Julho.
        3. As purgas cegas de `localStorage` nas sprints anteriores limpavam o cache local do navegador onde esses lançamentos rejeitados ainda sobreviviam.
    - **Pilar 2 — Persistência Universal ISO YYYY-MM-DD no Supabase PostgreSQL:**
      - Em `upsertTransactionsInDb`, toda data de transação é convertida deterministicamente para ISO `YYYY-MM-DD` via `toSortableISO(t.date)` antes de ser enviada ao PostgreSQL.
      - A data original brasileira `DD-MM-YYYY` é simultaneamente encapsulada no túnel universal de metadados (`||__CXM__:`) sob a propriedade `meta.dateBR`.
    - **Pilar 3 — Decodificação Segura e Des-inversão Automática (`fixPotentiallyInvertedDate`):**
      - Na função `decodeTxFromSupabase`, a prioridade absoluta de leitura é dada ao `meta.dateBR`.
      - Na ausência do metadado, caso uma data do banco venha com ano `2026` e o suposto dia seja `[9, 10, 11]` com mês `<= 12`, a heurística desinverte o par (`realDay = month`, `realMonth = day`), restaurando a data brasileira autêntica.
    - **Pilar 4 — Proibição Absoluta de Exclusões e Purgas Automáticas em Segundo Plano:**
      - Remoção total de chamadas `.delete()` de tabelas de transações em background dentro de rotinas de auditoria, deduplicação ou consulta.
      - Desativação de purgas cegas de `localStorage` para transações (`lifeos_txs_v8`, `coindex_usr_*_txs*`) mantendo uma rede de segurança forense indelével.
    - **Pilar 5 — Motor Forense Multi-Camadas e Botão de Ação nas Configurações (`runForensicCloudRecovery`):**
      - Criação da ferramenta de auditoria e restauração `runForensicCloudRecovery(userId, localCandidates)` que examina o estado de backup em `user_settings`, transações no Supabase com des-inversão e todas as chaves históricas do navegador, unificando e persistindo os lançamentos no banco com datas corrigidas.
      - Adicionado botão interativo `🩺 Resgatar Lançamentos (Set/Out/Nov)` com feedback em tempo real no card de Auditoria Cloud na aba Configurações.

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
