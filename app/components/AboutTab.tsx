"use client";

import React from "react";
import {
  Sparkles,
  Compass,
  Target,
  ShieldCheck,
  Scale,
  DollarSign,
  Activity,
  Brain,
  Crosshair,
  Layers,
  HeartHandshake,
  CheckCircle2,
  BookmarkCheck
} from "lucide-react";
import { CoindexLogoMonumental } from "./CoindexLogo";
import { useProximityBorderGlow } from "./MotionEngine144";
import { COINDEX_APP_VERSION } from "../lifeos-data";

/**
 * BentoCardWithGlow — Card Bento com iluminação de borda reativa
 * à proximidade do cursor, alinhado à estética Cupertino Glassmorphism.
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
      className={`proximity-border-glow relative rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 md:p-8 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-slate-700/80 cupertino-card-hover ${className}`}
    >
      {children}
    </div>
  );
}

export function AboutTab() {
  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-20 animate-fadeIn">
      {/* ========================================================================
          SEÇÃO 1 — PALCO PRINCIPAL (LOGO OFICIAL NÍTIDA + IDENTIDADE + VERSÃO)
          ======================================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/95 p-8 md:p-14 shadow-2xl backdrop-blur-2xl">
        {/* Iluminação de Fundo Atmosférica Suave */}
        <div className="pointer-events-none absolute -top-36 left-1/2 -translate-x-1/2 w-[540px] h-[300px] bg-gradient-to-b from-[#0A84FF]/20 via-[#38BDF8]/10 to-transparent blur-3xl rounded-full" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Palco da Logo: 100% Vetorial, Nítida, sem scale/drop-shadow e com Halo Desacoplado */}
          <div className="relative group inline-flex items-center justify-center mb-6">
            {/* Halo de luz ambiente suave em div HTML separada atrás do SVG */}
            <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-[#0A84FF]/20 via-[#38BDF8]/10 to-transparent blur-2xl pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
            <CoindexLogoMonumental enableMotion={true} />
          </div>

          {/* Nome Oficial & Subtítulo */}
          <div className="space-y-3 mb-6">
            <h1 className="text-4xl md:text-5xl font-black tracking-[0.14em] uppercase text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.12)]">
              COINDEX
            </h1>
            <p className="text-sm md:text-base font-semibold text-sky-200/90 tracking-wide max-w-2xl mx-auto">
              Desenvolvimento Pessoal • Gestão Financeira • Saúde & Conhecimento
            </p>
          </div>

          {/* Pílula Discreta e Elegante com a Versão Atual */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/70 border border-slate-700/80 text-slate-300 text-xs font-mono font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#0A84FF] shadow-[0_0_8px_#0A84FF]" />
            <span>Versão {COINDEX_APP_VERSION}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================
          SEÇÃO 2 — O MANIFESTO (DESTAQUE EDITORIAL CENTRAL)
          ======================================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/50 p-8 md:p-12 shadow-2xl backdrop-blur-xl">
        <div className="max-w-3xl mx-auto space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A84FF]/10 border border-[#0A84FF]/25 text-[#0A84FF] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            O Manifesto
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Um Ponto de Clareza, Foco e Direção
          </h2>

          <div className="space-y-5 text-sm md:text-base text-slate-300 leading-relaxed font-normal">
            <p>
              Aqui concentro o controle do meu desenvolvimento pessoal, organização financeira, rotina de exercícios físicos, saúde e bem-estar, além do registro contínuo de conhecimentos adquiridos, ideias e insights relevantes.
            </p>

            <p>
              Este ambiente funciona como um sistema integrado de crescimento, onde cada decisão, hábito e aprendizado contribui diretamente para a construção dos meus objetivos pessoais, profissionais e financeiros. Através de acompanhamento constante, análise e ajustes estratégicos, transformo intenção em ação e ação em resultado.
            </p>
          </div>

          {/* Parágrafo 3 em Destaque Nobre */}
          <div className="relative mt-8 p-6 md:p-7 rounded-2xl bg-gradient-to-r from-[#0A84FF]/15 via-slate-800/60 to-slate-900/80 border-l-4 border-l-[#0A84FF] border border-white/10 shadow-lg text-slate-100">
            <p className="text-base md:text-lg font-medium leading-relaxed italic text-white/95">
              &ldquo;Mais do que organização, este é o meu ponto de clareza, foco e direção — o lugar onde estruturo o presente e projeto o futuro que desejo construir.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================
          SEÇÃO 3 — OS 4 PILARES DO ECOSSISTEMA (GRID BENTO 2x2)
          ======================================================================== */}
      <div className="space-y-6">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            Estrutura Integrada
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Os 4 Pilares do Ecossistema
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            As quatro dimensões fundamentais que conectam rotina, evolução e futuro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Pilar 1: Financeiro */}
          <BentoCardWithGlow className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Pilar I • Capital & Estratégia
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                  Organização Financeira & Patrimônio
                </h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Controle claro de entradas, saídas, compromissos e investimentos para construir segurança e liberdade com estratégia.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Clareza nos números para decisões conscientes e seguras.</span>
            </div>
          </BentoCardWithGlow>

          {/* Pilar 2: Saúde */}
          <BentoCardWithGlow className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0A84FF]/15 border border-[#0A84FF]/30 flex items-center justify-center text-[#0A84FF] shadow-inner">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0A84FF]">
                  Pilar II • Energia & Fisiologia
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                  Saúde, Exercícios & Bem-Estar
                </h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Acompanhamento constante de treinos, corridas e evolução física, mantendo corpo e mente em alta energia.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-[#0A84FF] shrink-0" />
              <span>Consistência física para sustentar alta produtividade.</span>
            </div>
          </BentoCardWithGlow>

          {/* Pilar 3: Conhecimento */}
          <BentoCardWithGlow className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400">
                  Pilar III • Aprendizado & Visão
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                  Conhecimento, Ideias & Insights
                </h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Espaço vivo para registrar aprendizados, estruturar planos, avaliar desejos e transformar ideias em projetos reais.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Registro ativo para transformar reflexão em execução prática.</span>
            </div>
          </BentoCardWithGlow>

          {/* Pilar 4: Hábitos */}
          <BentoCardWithGlow className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Crosshair className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  Pilar IV • Disciplina & Foco
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                  Hábitos, Metas & Direção
                </h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Conexão diária entre pequenas decisões e grandes objetivos pessoais, profissionais e financeiros.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Pequenas vitórias diárias compondo grandes conquistas de longo prazo.</span>
            </div>
          </BentoCardWithGlow>
        </div>
      </div>

      {/* ========================================================================
          SEÇÃO 4 — MISSÃO, VISÃO, VALORES & O SÍMBOLO DO EQUILÍBRIO
          ======================================================================== */}
      <div className="space-y-6">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            Propósito & Princípios
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Missão, Visão, Valores & O Símbolo do Equilíbrio
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            A bússola que orienta as decisões cotidianas e o equilíbrio contínuo da vida.
          </p>
        </div>

        {/* Tríade: Missão, Visão, Valores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Missão */}
          <BentoCardWithGlow className="flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A84FF]/15 border border-[#0A84FF]/30 flex items-center justify-center text-[#0A84FF]">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0A84FF]">
                Diretriz de Ação
              </span>
              <h3 className="text-lg font-bold text-white">Missão</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Transformar intenção em ação e ação em resultado por meio do acompanhamento constante, da clareza e do ajuste estratégico da rotina.
              </p>
            </div>
          </BentoCardWithGlow>

          {/* Visão */}
          <BentoCardWithGlow className="flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">
                Horizonte de Longo Prazo
              </span>
              <h3 className="text-lg font-bold text-white">Visão</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Estruturar o presente com consciência e construir de forma sólida e equilibrada o futuro pessoal, profissional e financeiro.
              </p>
            </div>
          </BentoCardWithGlow>

          {/* Valores */}
          <BentoCardWithGlow className="flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Conduta Inegociável
              </span>
              <h3 className="text-lg font-bold text-white">Valores</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Clareza, Disciplina, Constância, Evolução Contínua e Equilíbrio entre Patrimônio, Saúde e Conhecimento.
              </p>
            </div>
          </BentoCardWithGlow>
        </div>

        {/* Card Nobre: O Símbolo do Equilíbrio ("The Equilibrium Link") */}
        <div className="rounded-3xl border border-slate-800/90 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-slate-950 p-6 md:p-8 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 shrink-0 flex items-center justify-center">
              <Scale className="w-8 h-8 text-[#0A84FF]" />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">
                A Filosofia da Identidade Visual
              </span>
              <h4 className="text-lg font-bold text-white">
                O Símbolo do Equilíbrio (The Equilibrium Link)
              </h4>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Os dois elos entrelaçados representam a simbiose essencial para uma vida plena: o <strong className="text-white">Elo Esquerdo em Titânio</strong> personifica a disciplina, a clareza e a fundação segura; o <strong className="text-white">Elo Direito em Coindex Blue</strong> simboliza a expansão, os sonhos e o futuro. Ao se entrelaçarem continuamente, mostram que o controle financeiro sustenta a expansão, e a expansão dá propósito à disciplina.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================
          RODAPÉ MINIMALISTA
          ======================================================================== */}
      <div className="pt-6 border-t border-slate-800/80 text-center">
        <span className="text-xs font-mono text-slate-500 tracking-wider">
          COINDEX • Versão {COINDEX_APP_VERSION}
        </span>
      </div>
    </div>
  );
}

export default AboutTab;
