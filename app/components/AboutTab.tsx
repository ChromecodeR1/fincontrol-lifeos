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
  Fingerprint
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
 * BentoCardWithGlow — Helper para isolar a instância do hook useProximityBorderGlow
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

export function AboutTab() {
  const [highlightSegment, setHighlightSegment] = useState<"all" | "left" | "right" | "weave">("all");
  const [isPulsing, setIsPulsing] = useState(false);
  const [pulseCycle, setPulseCycle] = useState(0);
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

  return (
    <div className="space-y-10 pb-16 animate-fadeIn">
      {/* ========================================================================
          BLOCO 1: HERO MONUMENTAL & VERSÃO DO COINDEX OS
          ======================================================================== */}
      <TiltCard3D
        maxTilt={3.5}
        glare={true}
        className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/95 p-8 md:p-14 shadow-2xl backdrop-blur-2xl"
      >
        {/* Iluminação de Fundo Atmosférica */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[620px] h-[360px] bg-gradient-to-b from-sky-500/25 via-blue-600/10 to-transparent blur-3xl rounded-full" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 w-[340px] h-[220px] bg-cyan-500/10 blur-3xl rounded-full" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo Monumental Interativa */}
          <div className="relative mb-6 cursor-pointer" onClick={handleTriggerPulse} title="Clique para pulsar o motor 144Hz">
            <CoindexLogoMonumental
              enableMotion={true}
              isPulsing={isPulsing}
              highlightSegment={highlightSegment}
            />
          </div>

          {/* Botão de Disparo do Pulso 144Hz */}
          <button
            onClick={handleTriggerPulse}
            className="apple-press inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full text-xs font-semibold tracking-wide border border-blue-500/40 bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 hover:border-blue-400 transition-all duration-300 shadow-[0_0_16px_rgba(10,132,255,0.25)]"
          >
            <Zap className={`w-3.5 h-3.5 text-blue-400 ${isPulsing ? "animate-spin" : ""}`} />
            <span>⚡ Pulsar Motor 144Hz</span>
            {isPulsing && <span className="text-[10px] text-sky-300 font-mono font-bold animate-pulse">OVERCLOCK</span>}
          </button>

          {/* Tipografia de Alta Precisão */}
          <div className="space-y-2 mb-6">
            <div className="inline-flex items-center gap-3">
              <h1 className="text-4xl md:text-6xl font-black tracking-[0.14em] uppercase text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]">
                COINDEX
              </h1>
              <span className="text-xs md:text-sm px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/40 font-mono font-black tracking-widest shadow-inner">
                OS
              </span>
            </div>
            <p className="text-sm md:text-lg font-medium text-slate-300 tracking-wide max-w-xl mx-auto">
              {COINDEX_RELEASE_CODENAME}
            </p>
          </div>

          {/* Badges Oficiais de Telemetria e Versão */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              v{COINDEX_APP_VERSION} (Estável)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs font-mono">
              Build: {COINDEX_BUILD_DATE}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Motor 144Hz GPU Ativo
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-medium">
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              100% Cloud Supabase SSOT
            </span>
          </div>
        </div>
      </TiltCard3D>

      {/* ========================================================================
          BLOCO 2: A FILOSOFIA DO ELO (THE EQUILIBRIUM LINK MANIFESTO)
          ======================================================================== */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 md:p-10 shadow-xl backdrop-blur-md">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            Geometria Sagrada do Produto
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            A Filosofia do Elo (The Equilibrium Link)
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Por que dois elos entrelaçados em vez de um símbolo financeiro convencional? Selecione as camadas para entender a anatomia do símbolo.
          </p>
        </div>

        {/* Seletor Segmentado Deslizante */}
        <div className="flex justify-center mb-8">
          <SlidingSegmentedControl
            options={segmentOptions}
            value={highlightSegment}
            onChange={(val) => setHighlightSegment(val)}
            activeColor="bg-[#0A84FF] text-white shadow-lg shadow-blue-500/30"
            size="md"
          />
        </div>

        {/* Card Explicativo Dinâmico de acordo com o segmento focado */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-6 md:p-8 transition-all duration-300">
          {highlightSegment === "all" && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">A Simbiose Perfeita entre Rigor e Ambição</h3>
                  <p className="text-xs text-blue-400 font-mono">Dois Sistemas Integrados em Movimento Contínuo</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed pt-2">
                O <strong className="text-white">Coindex OS</strong> não é uma simples planilha nem um app bancário engessado. Ele foi concebido para resolver o maior dilema humano contemporâneo: como construir um patrimônio exponencial sem sacrificar a saúde, a paz de espírito e a clareza do dia a dia. A logo expressa o entrelaçamento perpétuo onde controle sustenta a expansão e a ambição respeita o equilíbrio.
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
                  <h3 className="text-lg font-bold text-white">O Elo Esquerdo (Titânio) — A Fundação & O Controle</h3>
                  <p className="text-xs text-slate-400 font-mono">Letra &quot;C&quot; aberta em metal nobre • Centro cx=44</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed pt-2">
                Representa a disciplina inegociável, o Livro Caixa contábil sem desvios de centavos, a contenção de desperdícios e a segurança do patrimônio construído. Sua curvatura esculpe a letra <strong className="text-white">&quot;C&quot; de Coindex</strong>, aberta para receber novos fluxos, mas rígida e inabalável como o titânio aeroespacial.
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
                  <h3 className="text-lg font-bold text-white">O Elo Direito (Apple Blue) — A Expansão & O Futuro</h3>
                  <p className="text-xs text-sky-400 font-mono">Anel fechado infinito • Centro cx=76</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed pt-2">
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
                  <h3 className="text-lg font-bold text-white">O Ponto de Entrelaçamento — O Equilíbrio Perpétuo</h3>
                  <p className="text-xs text-cyan-400 font-mono">Over-Under Weave com folga de 3.5px</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed pt-2">
                No topo, o anel azul da expansão passa por cima do titânio. Na base, o titânio passa por cima do azul. Esse entrelaçamento físico tridimensional demonstra que nenhum dos lados governa isolado: o controle financeiro financia sua expansão, e a expansão fornece oxigênio para manter o controle vivo e relevante.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================
          BLOCO 3: BENTO GRID: MISSÃO, VISÃO E OBJETIVOS ESTRATÉGICOS
          ======================================================================== */}
      <div>
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            Manifesto Coindex
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Missão, Visão e Objetivos Estratégicos
          </h2>
          <p className="text-slate-400 text-sm">
            Nossos alicerces de engenharia e produto para transformar a vida financeira dos usuários.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Missão */}
          <BentoCardWithGlow className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
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
              <span>Transparência radical, zero anúncios, zero venda de dados.</span>
            </div>
          </BentoCardWithGlow>

          {/* Visão */}
          <BentoCardWithGlow className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
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
              <div className="p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Pilares de Execução
                </span>
                <h3 className="text-xl font-bold text-white">4 Objetivos Estratégicos</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/50 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Scale className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1. Simetria Contábil Estrita</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Zero centavos divergentes entre Livro Caixa, Bancos, Devedores e Cartões através do motor de reconciliação bidirecional do Livro Caixa como SSOT.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/50 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>2. Performance 144Hz Zero-Jank</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interface ultra-fluida acelerada por hardware (GPU compositor, will-change, 60-144fps), sem travamentos de thread na manipulação de grandes volumes.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/50 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>3. Inteligência em Tempo Real</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cotações de mercado via WebSocket e polling dinâmico a cada 30s, odômetro veicular preventivo e telemetria biológica com dados oficiais do Strava.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/50 space-y-1.5">
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
          BLOCO 4: OS 5 VALORES INEGIOCIÁVEIS DA COINDEX
          ======================================================================== */}
      <div>
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Cultura de Excelência
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Os 5 Valores Inegociáveis da Coindex
          </h2>
          <p className="text-slate-400 text-sm">
            Princípios invioláveis que guiam cada linha de código, design de componente e decisão arquitetural.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Valor 1 */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/40 hover:-translate-y-1 flex flex-col justify-between">
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
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-blue-500/40 hover:-translate-y-1 flex flex-col justify-between">
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
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-sky-500/40 hover:-translate-y-1 flex flex-col justify-between">
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
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/40 hover:-translate-y-1 flex flex-col justify-between">
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
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 flex flex-col justify-between">
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
          BLOCO 5: TELEMETRIA DE ENGENHARIA & FICHA TÉCNICA
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
                <AnimatedNumber144 value={56 + pulseCycle} />
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
              Next.js 16 (App Router) • React 19 • TypeScript 5.7 • Tailwind CSS v4
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
