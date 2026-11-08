"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  Cloud,
  Layers,
  Compass,
  Target,
  HeartHandshake,
  Cpu,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Scale,
  BarChart3,
  Database,
  Code2,
  Globe2,
  RefreshCw,
  Award,
  Flame,
  Fingerprint,
  Coins,
  DollarSign,
  LineChart,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
  Milestone,
  Check,
  ExternalLink
} from "lucide-react";
import { CoindexLogoMonumental } from "./CoindexLogo";
import { TiltCard3D, triggerAuraBurst, useProximityBorderGlow } from "./MotionEngine144";
import { AnimatedNumber144 } from "./AnimatedNumber144";
import { SlidingSegmentedControl, SegmentOption } from "./SlidingSegmentedControl";
import {
  COINDEX_APP_VERSION,
  COINDEX_BUILD_DATE,
  COINDEX_RELEASE_CODENAME
} from "../lifeos-data";

/**
 * BentoCardWithGlow — Componente para encapsular o hook useProximityBorderGlow
 * mantendo renderização 144Hz acelerada por GPU.
 */
function BentoCardWithGlow({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, onMouseMove, onMouseLeave } = useProximityBorderGlow<HTMLDivElement>();
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`proximity-border-glow relative rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-slate-700/80 cupertino-card-hover ${className}`}
    >
      {children}
    </div>
  );
}

interface EngineeringEra {
  id: string;
  number: string;
  name: string;
  period: string;
  sprints: string;
  tagline: string;
  description: string;
  achievements: string[];
  techBadge: string;
  accentColor: string;
}

const ENGINEERING_ERAS: EngineeringEra[] = [
  {
    id: "era-1",
    number: "01",
    name: "Gênese & Simetria Contábil",
    period: "2024 – 2025",
    sprints: "Sprints 01 a 15",
    tagline: "A Fundação Matemática em Centavos Inteiros",
    description: "Concepção do motor contábil puro para erradicar de vez os erros de ponto flutuante. Criação da tabela avançada de lançamentos e isolamento do Livro Caixa como fonte única de verdade contábil.",
    achievements: [
      "Motor matemático finance.ts com safeAdd e safeSub em centavos inteiros",
      "Arquitetura de Livro Caixa com zero desvios contábeis",
      "Modelagem relacional de despesas fixas, variáveis e receitas"
    ],
    techBadge: "Pure TypeScript Math",
    accentColor: "from-emerald-500/20 via-emerald-500/5 to-transparent border-emerald-500/30 text-emerald-400"
  },
  {
    id: "era-2",
    number: "02",
    name: "Expansão de Domínios & Telemetria",
    period: "Início de 2026",
    sprints: "Sprints 16 a 30",
    tagline: "Vida Automotiva, Cartões e Fisiologia Atlética",
    description: "Extensão do ecossistema para além do saldo bancário: telemetria de consumo km/L com padrão Inmetro, segregação de faturas de cartão com parcelamentos futuros e integração oficial Strava API v3.",
    achievements: [
      "Módulo Veículos: odômetro, consumo médio ponderado e custo TCO por km",
      "Cálculo de exposição real de cartões e faturas parceladas a vencer",
      "Integração OAuth2 com Strava para ingestão de atividades esportivas"
    ],
    techBadge: "Strava v3 & Inmetro API",
    accentColor: "from-amber-500/20 via-amber-500/5 to-transparent border-amber-500/30 text-amber-400"
  },
  {
    id: "era-3",
    number: "03",
    name: "Engenharia 144Hz & Design Cupertino",
    period: "Meados de 2026",
    sprints: "Sprints 31 a 45",
    tagline: "Estética Apple Copilot Pure e Zero-Jank",
    description: "Revolução visual adotando a filosofia Cyber-Glassmorphism e Apple Copilot Pure. Migração para o Next.js 16 (App Router) com Turbopack, temas dinâmicos Claro/Escuro e GPU compositor.",
    achievements: [
      "Dual Theme dinâmico (Cupertino Light e Cyberpunk Dark)",
      "MotionEngine 144Hz com will-change, GPU composition e zero thread lock",
      "Migração estrutural para Next.js 16 com Turbopack nativo"
    ],
    techBadge: "Next.js 16 & Turbopack",
    accentColor: "from-blue-500/20 via-blue-500/5 to-transparent border-blue-500/30 text-blue-400"
  },
  {
    id: "era-4",
    number: "04",
    name: "Mercado Financeiro & B3 Ao Vivo",
    period: "Outubro de 2026",
    sprints: "Sprints 46 a 50",
    tagline: "Marcação a Mercado Contínua e CDI Real",
    description: "Criação do módulo especialista de Investimentos com cotações em tempo real via WebSocket e polling a cada 30 segundos. Cálculo do CDI diário oficial BCB SGS e reconciliação bidirecional estrita com o Caixa.",
    achievements: [
      "Stream ao vivo de cotações B3 (PETR4, VALE3, FIIs) e criptoativos",
      "Cálculo automático de juros compostos com curva real do CDI diário",
      "Motor cashbook-sync.ts eliminando qualquer divergência entre abas"
    ],
    techBadge: "Market WebSocket & BCB",
    accentColor: "from-purple-500/20 via-purple-500/5 to-transparent border-purple-500/30 text-purple-400"
  },
  {
    id: "era-5",
    number: "05",
    name: "Soberania Cloud-First Supabase",
    period: "Novembro de 2026",
    sprints: "Sprints 51 a 55",
    tagline: "A Nuvem como Fonte Única da Verdade",
    description: "Eliminação total de persistência local frágil. Todos os dados passam a viver exclusivamente na nuvem Supabase com isolamento RLS. Lançamento do Detector de Assinaturas, Edição Inline e Calendário Heatmap.",
    achievements: [
      "Arquitetura 100% Cloud Supabase SSOT sem dependências locais",
      "Detector automatizado de assinaturas periódicas e conciliador de faturas",
      "Edição inline por duplo clique e seleção em lote no Livro Caixa"
    ],
    techBadge: "Supabase Cloud SSOT",
    accentColor: "from-sky-500/20 via-sky-500/5 to-transparent border-sky-500/30 text-sky-400"
  },
  {
    id: "era-6",
    number: "06",
    name: "The Equilibrium Era & Manifesto",
    period: "Versão Atual • v0.44.1",
    sprints: "Sprints 56 a 57",
    tagline: "A Identidade Definitiva e a Simbiose de Vida",
    description: "Consagração do símbolo 'The Equilibrium Link' com máscaras alfa puras e aceleração GPU estrita. Publicação do Manifesto Editorial Coindex (Coin + Index + Co-Op) e telemetria de 144Hz sem engasgos.",
    achievements: [
      "Palco Monumental 'The Equilibrium Core' com loop contínuo 144Hz perfeito",
      "Redação do Manifesto da Tríade: O Ativo, O Catálogo e o Co-Piloto Soberano",
      "Ficha técnica oficial de 57 sprints de evolução contínua"
    ],
    techBadge: "Equilibrium 144Hz OS",
    accentColor: "from-cyan-500/25 via-blue-600/10 to-transparent border-cyan-400/40 text-cyan-300"
  }
];

export function AboutTab() {
  const [highlightSegment, setHighlightSegment] = useState<"all" | "left" | "right" | "weave">("all");
  const [isPulsing, setIsPulsing] = useState(false);
  const [pulseCycle, setPulseCycle] = useState(0);
  const [selectedEraId, setSelectedEraId] = useState<string>("era-6");
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTriggerPulse = useCallback((e: React.MouseEvent<HTMLElement>) => {
    triggerAuraBurst(e.currentTarget, "blue");
    setIsPulsing(true);
    setPulseCycle((c) => c + 1);

    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
    }
    pulseTimeoutRef.current = setTimeout(() => {
      setIsPulsing(false);
    }, 1500);
  }, []);

  const segmentOptions: SegmentOption<"all" | "left" | "right" | "weave">[] = [
    { id: "all", label: "Todos os Elementos" },
    { id: "left", label: "Elo Esquerdo (Titânio)" },
    { id: "right", label: "Elo Direito (Apple Blue)" },
    { id: "weave", label: "O Entrelaçamento (Equilíbrio)" }
  ];

  const currentEra = ENGINEERING_ERAS.find((e) => e.id === selectedEraId) || ENGINEERING_ERAS[5];

  return (
    <div className="space-y-14 pb-20 animate-fadeIn">
      {/* ========================================================================
          SEÇÃO 1: HERO DE ABERTURA MONUMENTAL & IDENTIDADE DO COINDEX OS
          ======================================================================== */}
      <TiltCard3D
        maxTilt={3.5}
        glare={true}
        className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/95 p-8 md:p-14 shadow-2xl backdrop-blur-2xl"
      >
        {/* Iluminação de Fundo Atmosférica Cibernética */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[680px] h-[380px] bg-gradient-to-b from-sky-500/25 via-blue-600/10 to-transparent blur-3xl rounded-full" />
        <div className="pointer-events-none absolute -bottom-28 right-1/4 w-[380px] h-[240px] bg-cyan-500/10 blur-3xl rounded-full" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo Monumental Interativa com Aceleração 144Hz */}
          <div
            className="relative mb-6 cursor-pointer"
            onClick={handleTriggerPulse}
            title="Clique para acelerar o motor 144Hz e disparar o pulso orbital"
          >
            <CoindexLogoMonumental
              enableMotion={true}
              isPulsing={isPulsing}
              highlightSegment={highlightSegment}
            />
          </div>

          {/* Botão de Disparo do Pulso 144Hz */}
          <button
            onClick={handleTriggerPulse}
            className="apple-press inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full text-xs font-semibold tracking-wide border border-blue-500/40 bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 hover:border-blue-400 transition-all duration-300 shadow-[0_0_18px_rgba(10,132,255,0.25)] cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 text-blue-400 ${isPulsing ? "animate-spin" : ""}`} />
            <span>⚡ Pulsar Motor 144Hz</span>
            {isPulsing && (
              <span className="text-[10px] text-sky-300 font-mono font-bold animate-pulse">
                OVERCLOCK
              </span>
            )}
          </button>

          {/* Tipografia de Alta Precisão & Naming */}
          <div className="space-y-3 mb-6">
            <div className="inline-flex items-center gap-3">
              <h1 className="text-4xl md:text-6xl font-black tracking-[0.14em] uppercase text-white drop-shadow-[0_2px_14px_rgba(255,255,255,0.18)]">
                COINDEX
              </h1>
              <span className="text-xs md:text-sm px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/40 font-mono font-black tracking-widest shadow-inner">
                OS
              </span>
            </div>
            <p className="text-base md:text-xl font-semibold text-slate-200 tracking-wide max-w-2xl mx-auto">
              {COINDEX_RELEASE_CODENAME}
            </p>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Onde a precisão cirúrgica de cada centavo encontra a expansão contínua da sua liberdade financeira e telemetria de longevidade.
            </p>
          </div>

          {/* Badges Oficiais de Telemetria e Versão */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              v{COINDEX_APP_VERSION} (Estável)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Build: {COINDEX_BUILD_DATE}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Motor 144Hz GPU Ativo
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-medium">
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              100% Cloud Supabase SSOT
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              Zero Rastreadores • Soberano
            </span>
          </div>
        </div>
      </TiltCard3D>

      {/* ========================================================================
          SEÇÃO 2: O MANIFESTO COINDEX (COIN + INDEX + CO-OP)
          ======================================================================== */}
      <div className="space-y-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Coins className="w-3.5 h-3.5" />
            Etimologia & Filosofia
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            O Manifesto Coindex: A Tríade da Soberania Pessoal
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed mt-2">
            O nome <strong className="text-white">COINDEX</strong> não nasceu de um gerador aleatório de marcas. Ele é a síntese harmônica de três pilares inegociáveis de engenharia que sustentam a plataforma:
          </p>
        </div>

        {/* Grade Tríplice: COIN + INDEX + CO-OP */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pilar 1: COIN */}
          <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-b from-amber-500/10 via-slate-900/60 to-slate-950/80 p-6 md:p-8 flex flex-col justify-between shadow-xl backdrop-blur-md transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  Pilar I • O Ativo & A Tangibilidade
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight mt-0.5">
                  COIN
                </h3>
                <p className="text-xs text-amber-300/80 font-medium">A Solidez do Capital e a Simetria do Centavo</p>
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed pt-1">
                Representa a moeda como tempo e energia de vida acumulados. No Coindex, nenhuma transação é uma estimativa estatística abstrata: <strong className="text-white">cada centavo é real, binário e sagrado</strong>.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Operamos com matemática em inteiros contábeis puros, erradicando desvios de arredondamento em ponto flutuante. Se o dinheiro existe, ele está no Livro Caixa sem fantasmas.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-amber-500/20 space-y-2 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Zero Floating-Point Drift</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Livro Caixa como SSOT Absoluto</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Fim dos Lançamentos Fantasmas</span>
              </div>
            </div>
          </div>

          {/* Pilar 2: INDEX */}
          <div className="rounded-2xl border border-blue-500/25 bg-gradient-to-b from-blue-500/10 via-slate-900/60 to-slate-950/80 p-6 md:p-8 flex flex-col justify-between shadow-xl backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:-translate-y-1">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
                <LineChart className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
                  Pilar II • O Catálogo & A Inteligência
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight mt-0.5">
                  INDEX
                </h3>
                <p className="text-xs text-blue-300/80 font-medium">A Estruturação Sistemática da Vida e do Mercado</p>
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed pt-1">
                Inspirado nos índices mestres da economia (CDI, Selic, IPCA, B3). O Coindex eleva o conceito de índice para <strong className="text-white">todas as dimensões da existência diária</strong>.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Indexamos a curva real de juros compostos, a telemetria Inmetro de consumo e TCO por quilômetro dos seus veículos, e as zonas de ritmo cardíaco (pace) das corridas no Strava.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-500/20 space-y-2 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>CDI Oficial BCB SGS + B3 Ao Vivo</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Telemetria Inmetro & TCO Veicular</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Índices Biológicos & Pace Strava</span>
              </div>
            </div>
          </div>

          {/* Pilar 3: CO-OP / COPILOT */}
          <div className="rounded-2xl border border-indigo-500/25 bg-gradient-to-b from-indigo-500/10 via-slate-900/60 to-slate-950/80 p-6 md:p-8 flex flex-col justify-between shadow-xl backdrop-blur-md transition-all duration-300 hover:border-indigo-500/40 hover:-translate-y-1">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Pilar III • A Parceria & A Soberania
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight mt-0.5">
                  CO-OP / COPILOT
                </h3>
                <p className="text-xs text-indigo-300/80 font-medium">A Cooperação Homem-Máquina com Privacidade Total</p>
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed pt-1">
                O software nunca deve ser um cemitério passivo de números digitados no vácuo. O Coindex <strong className="text-white">coopera ativamente como seu co-piloto diário</strong>.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ele detecta aumentos em assinaturas recorrentes, antecipa vencimentos críticos de cartão e consolida o ritual mensal do Coindex Wrapped. Tudo protegido por criptografia RLS na nuvem.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-indigo-500/20 space-y-2 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Supabase RLS com Criptografia</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Detector Preditivo de Assinaturas</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Zero Venda de Dados e Zero Ads</span>
              </div>
            </div>
          </div>
        </div>

        {/* MÓDULO INTERATIVO: A FILOSOFIA DO ELO (THE EQUILIBRIUM LINK EXPLORER) */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 md:p-10 shadow-xl backdrop-blur-md">
          <div className="max-w-2xl mx-auto text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              Anatomia Vetorial da Logo
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              A Geometria do Elo: Por que Dois Elos Entrelaçados?
            </h3>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Selecione uma das camadas abaixo para acender os anéis da logo monumental e compreender o equilíbrio over-under:
            </p>
          </div>

          {/* Seletor Segmentado Deslizante */}
          <div className="flex justify-center mb-6">
            <SlidingSegmentedControl
              options={segmentOptions}
              value={highlightSegment}
              onChange={(val) => setHighlightSegment(val)}
              activeColor="bg-[#0A84FF] text-white shadow-lg shadow-blue-500/30"
              size="md"
            />
          </div>

          {/* Card Explicativo Dinâmico da Camada */}
          <div className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-6 md:p-8 transition-all duration-300">
            {highlightSegment === "all" && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">A Simbiose Perfeita entre Rigor e Ambição</h4>
                    <p className="text-xs text-blue-400 font-mono">Dois Sistemas Integrados em Movimento Contínuo 144Hz</p>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed pt-1">
                  O <strong className="text-white">Coindex OS</strong> resolve o dilema moderno de quem acumula patrimônio mas perde a saúde e a paz de espírito. A logo expressa o entrelaçamento perpétuo onde o rigor sustenta a expansão e a ambição respeita o equilíbrio orgânico.
                </p>
              </div>
            )}

            {highlightSegment === "left" && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-200/10 border border-slate-300/30 text-slate-200">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">O Elo Esquerdo (Titânio) — A Fundação & O Controle</h4>
                    <p className="text-xs text-slate-400 font-mono">Letra &quot;C&quot; aberta em metal nobre • Centro cx=44</p>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed pt-1">
                  Representa a disciplina inegociável, o Livro Caixa contábil sem desvios de centavos, a contenção de desperdícios e a segurança do patrimônio construído. Sua curvatura esculpe a letra <strong className="text-white">&quot;C&quot; de Coindex</strong>, aberta para receber novos fluxos, mas inabalável como o titânio aeroespacial.
                </p>
              </div>
            )}

            {highlightSegment === "right" && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">O Elo Direito (Apple Blue) — A Expansão & O Futuro</h4>
                    <p className="text-xs text-sky-400 font-mono">Anel fechado infinito • Centro cx=76</p>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed pt-1">
                  O anel completo em azul Apple personifica a multiplicação patrimonial, o poder dos juros compostos, a marcação a mercado ao vivo, a telemetria biológica das corridas no Strava e a liberdade de explorar novos horizontes. É dinâmico, ilimitado e pulsa com luz orbital contínua.
                </p>
              </div>
            )}

            {highlightSegment === "weave" && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">O Ponto de Entrelaçamento — O Equilíbrio Perpétuo</h4>
                    <p className="text-xs text-cyan-400 font-mono">Over-Under Weave com máscara alfa pura de 3.5px</p>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed pt-1">
                  No topo, o anel azul da expansão passa por cima do titânio. Na base, o titânio passa por cima do azul. Esse entrelaçamento físico tridimensional demonstra que nenhum dos lados governa isolado: o controle financeiro financia sua expansão, e a expansão fornece oxigênio para manter o controle vivo e relevante.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================
          SEÇÃO 3: MISSÃO, VISÃO E OBJETIVOS ESTRATÉGICOS (BENTO GRID 144Hz)
          ======================================================================== */}
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            Diretrizes de Arquitetura
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Missão, Visão e 4 Objetivos Estratégicos
          </h2>
          <p className="text-slate-400 text-sm">
            Nossos alicerces de engenharia de software e design para transformar a vida financeira dos usuários.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Missão */}
          <BentoCardWithGlow className="lg:col-span-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 shadow-inner">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
                    Propósito Primordial
                  </span>
                  <h3 className="text-xl font-bold text-white">Missão</h3>
                </div>
              </div>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Proporcionar uma experiência <strong className="text-white">soberana, cinematográfica e matematicamente irrepreensível</strong> de gestão de patrimônio e vida, eliminando de vez a ansiedade financeira através do controle absoluto em tempo real.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Transparência radical, zero anúncios e zero comercialização de comportamento.</span>
            </div>
          </BentoCardWithGlow>

          {/* Visão */}
          <BentoCardWithGlow className="lg:col-span-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 shadow-inner">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">
                    O Futuro que Construímos
                  </span>
                  <h3 className="text-xl font-bold text-white">Visão</h3>
                </div>
              </div>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Ser o <strong className="text-white">sistema operacional pessoal definitivo da próxima década</strong>, unindo finanças de alta precisão, telemetria de longevidade e engenharia de software 144Hz com privacidade e soberania inegociáveis.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              <span>Unificação holística: Patrimônio, Veículos, Saúde e Sonhos.</span>
            </div>
          </BentoCardWithGlow>

          {/* 4 Objetivos Estratégicos */}
          <BentoCardWithGlow className="lg:col-span-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-inner">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Pilares de Execução
                </span>
                <h3 className="text-xl font-bold text-white">4 Objetivos Estratégicos</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-1.5 transition hover:border-slate-700">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Scale className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1. Simetria Contábil Estrita</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Zero centavos divergentes entre Livro Caixa, Bancos, Devedores e Cartões através do motor de reconciliação bidirecional do Livro Caixa como SSOT.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-1.5 transition hover:border-slate-700">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>2. Performance 144Hz Zero-Jank</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interface ultra-fluida acelerada por hardware (GPU compositor, will-change, 60-144fps), sem travamentos de thread na manipulação de grandes volumes.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-1.5 transition hover:border-slate-700">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>3. Inteligência em Tempo Real</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cotações de mercado via WebSocket e polling dinâmico a cada 30s, odômetro veicular preventivo e telemetria biológica com dados oficiais do Strava.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-1.5 transition hover:border-slate-700">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Cloud className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>4. Soberania e Nuvem Cloud-First</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  100% dos dados na nuvem Supabase, criptografados e sem dependências locais frágeis. Sincronização multi-dispositivo sem perdas de lançamentos.
                </p>
              </div>
            </div>
          </BentoCardWithGlow>
        </div>
      </div>

      {/* ========================================================================
          SEÇÃO 4: LINHA DO TEMPO DE EVOLUÇÃO & ENGENHARIA (6 GRANDES ERAS)
          ======================================================================== */}
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Milestone className="w-3.5 h-3.5" />
            Trajetória de Produto
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Linha do Tempo de Evolução & Engenharia
          </h2>
          <p className="text-slate-400 text-sm">
            57 Sprints de desenvolvimento contínuo divididas em 6 Eras Tecnológicas fundamentais:
          </p>
        </div>

        {/* Trilha de Seletor de Eras (Cards Horizontais) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {ENGINEERING_ERAS.map((era) => {
            const isSelected = era.id === selectedEraId;
            return (
              <button
                key={era.id}
                type="button"
                onClick={() => setSelectedEraId(era.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#0A84FF]/20 border-[#0A84FF] text-white shadow-lg shadow-blue-500/20 scale-[1.02]"
                    : "bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{era.number}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isSelected ? "bg-blue-500/30 text-blue-300" : "bg-slate-800 text-slate-400"}`}>
                      {era.period}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{era.name}</h4>
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-2 truncate">
                  {era.sprints}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detalhe da Era Selecionada */}
        <div className={`rounded-3xl border bg-gradient-to-br ${currentEra.accentColor} p-6 md:p-10 shadow-2xl backdrop-blur-xl transition-all duration-500`}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-white/10 text-white">
                  ERA {currentEra.number}
                </span>
                <span className="text-xs font-mono text-slate-300 font-bold">{currentEra.sprints}</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-mono text-slate-400">{currentEra.period}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white">{currentEra.name}</h3>
              <p className="text-xs md:text-sm text-cyan-200/90 font-medium mt-0.5">{currentEra.tagline}</p>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-mono font-semibold text-white">
              {currentEra.techBadge}
            </span>
          </div>

          <p className="text-sm md:text-base text-slate-200 leading-relaxed mb-6">
            {currentEra.description}
          </p>

          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Conquistas Centrais da Era:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentEra.achievements.map((ach, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-white/10 bg-slate-950/60 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300 leading-relaxed font-medium">{ach}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================
          SEÇÃO 5: OS 5 VALORES FUNDAMENTAIS
          ======================================================================== */}
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Cultura de Excelência
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Os 5 Valores Inegociáveis da Coindex
          </h2>
          <p className="text-slate-400 text-sm">
            Princípios invioláveis que guiam cada linha de código, componente e decisão arquitetural.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Valor 1 */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/40 hover:-translate-y-2 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Precisão no Centavo</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nada de arredondamentos mágicos ou registros fantasmas. A verdade contábil é binária e absoluta.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-emerald-400">
              #PrecisionFirst
            </div>
          </div>

          {/* Valor 2 */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-blue-500/40 hover:-translate-y-2 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Fluidez como Respeito</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uma interface lenta rouba o tempo do usuário. Cada micro-interação deve parecer palpável, elástica e instantânea.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-blue-400">
              #144HzCraft
            </div>
          </div>

          {/* Valor 3 */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-sky-500/40 hover:-translate-y-2 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Design que Acalma</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Finanças pessoais não devem causar ansiedade. Paleta cyberpunk discreta, tipografia suíça e clareza visual.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-sky-400">
              #CalmAndClarity
            </div>
          </div>

          {/* Valor 4 */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/40 hover:-translate-y-2 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Soberania na Nuvem</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seus dados pertencem a você em qualquer lugar. Supabase como SSOT único, sem armadilhas locais.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-indigo-400">
              #CloudFirstSSOT
            </div>
          </div>

          {/* Valor 5 */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-2 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Patrimônio + Saúde</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Não adianta acumular capital se o corpo e a mente falharem. O Strava e as finanças coexistem em simbiose.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-amber-400">
              #EquilibriumOS
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================
          SEÇÃO 6: RODAPÉ TÉCNICO EXECUTIVO & TELEMETRIA 144Hz
          ======================================================================== */}
      <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/70 to-slate-950 p-6 md:p-10 shadow-2xl backdrop-blur-md">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5" />
            Telemetria de Engenharia
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Ficha Técnica & Estatísticas de Execução
          </h2>
          <p className="text-slate-400 text-sm">
            Métricas de desempenho em tempo real monitoradas pelo motor 144Hz.
          </p>
        </div>

        {/* 4 Contadores Vivos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
            <div className="text-xs font-medium text-slate-400 mb-2">Taxa de Atualização</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight">
                <AnimatedNumber144 value={144} />
              </span>
              <span className="text-sm font-bold text-blue-400">Hz</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-2">GPU Accelerated</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
            <div className="text-xs font-medium text-slate-400 mb-2">Arquitetura de Dados</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl md:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                <AnimatedNumber144 value={100} />
              </span>
              <span className="text-sm font-bold text-emerald-400">%</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-2">Cloud Supabase SSOT</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
            <div className="text-xs font-medium text-slate-400 mb-2">Evolução Contínua</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl md:text-4xl font-black text-sky-400 font-mono tracking-tight">
                <AnimatedNumber144 value={57 + pulseCycle} />
              </span>
              <span className="text-sm font-bold text-sky-400">Sprints</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-2">Engenharia Ativa</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
            <div className="text-xs font-medium text-slate-400 mb-2">Latência de Reconciliação</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl md:text-4xl font-black text-indigo-400 font-mono tracking-tight">
                <AnimatedNumber144 value={0} />
              </span>
              <span className="text-sm font-bold text-indigo-400">ms</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-2">Zero Thread Block</span>
          </div>
        </div>

        {/* Ficha Técnica da Stack */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span>Stack Tecnológica Oficial</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Next.js 16.4 (App Router) • React 19 • TypeScript 5.7 • Tailwind CSS v4
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-400 pt-1">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Backend & Auth</span>
              <strong className="text-slate-200">Supabase Cloud + RLS</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Visualização & Gráficos</span>
              <strong className="text-slate-200">Recharts + SVG Custom</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Micro-Interações</span>
              <strong className="text-slate-200">MotionEngine 144Hz + CSS3D</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Integrações Ao Vivo</span>
              <strong className="text-slate-200">Strava API v3 + Market WebSocket</strong>
            </div>
          </div>
        </div>

        {/* Assinatura Final */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-semibold text-slate-400">COINDEX OS</span>
            <span>• The Equilibrium Link</span>
            <span>• Versão {COINDEX_APP_VERSION}</span>
          </div>
          <div>
            Engenharia de Software de Classe Mundial © 2026 Coindex Systems.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutTab;
