"use client";

import React from "react";

export type CoindexLogoVariant =
  | "equilibrium_link"
  | "kinetic_arc"
  | "ascending_bars"
  | "precision_quadrant";

export interface CoindexLogoVariantInfo {
  id: CoindexLogoVariant;
  name: string;
  tagline: string;
  desc: string;
}

export const COINDEX_LOGO_VARIANTS: CoindexLogoVariantInfo[] = [
  {
    id: "equilibrium_link",
    name: "The Equilibrium Link (Oficial)",
    tagline: "Dois Elos Entrelaçados em Over-Under",
    desc: "Elo esquerdo em Titânio desenhando o 'C' entrelaçado ao elo direito Apple Blue com pulso orbital contínuo."
  },
  {
    id: "kinetic_arc",
    name: "Kinetic Arc",
    tagline: "Apple Copilot & Aerodinâmica",
    desc: "Arco único fluido em vetor contínuo desenhando um 'C' ascendente em degradê azul e índigo."
  },
  {
    id: "ascending_bars",
    name: "Ascending Bars",
    tagline: "Inspiração Adidas & Precision",
    desc: "Três barras paralelas inclinadas a 35 graus com cantos arredondados na silhueta de um 'C'."
  },
  {
    id: "precision_quadrant",
    name: "Precision Quadrant",
    tagline: "Inspiração BMW & Braun",
    desc: "Emblema circular técnico dividido em quadrantes de alta precisão com abertura angular."
  }
];

export interface CoindexIconProps {
  className?: string;
  variant?: CoindexLogoVariant;
  enableMotion?: boolean;
}

export interface CoindexLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  className?: string;
  variant?: CoindexLogoVariant;
  enableMotion?: boolean;
}

/**
 * CoindexIcon — "The Equilibrium Link" (Opção 1)
 * Geometria SVG Exata (viewBox="0 0 120 84"):
 * - Elo Esquerdo: Letra "C" em Titânio (#F8FAFC), cx=44, cy=42, r=26, strokeWidth=10, aberto de -38° a +38°.
 * - Elo Direito: Anel Completo em Apple Blue (#0A84FF -> #38BDF8), cx=76, cy=42, r=26, strokeWidth=10.
 * - Over-Under Weave: Topo = Azul passa por cima com gap 3.5px; Base = Branco "C" passa por cima com gap 3.5px.
 * - Motions: Entrada cinética suave + Pulso de luz orbital contínuo (5.5s) + Física magnética no hover.
 */
export function CoindexIcon({
  className = "w-10 h-7",
  enableMotion = true
}: CoindexIconProps) {
  return (
    <svg
      viewBox="0 0 120 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(10,132,255,0.45)] ${className}`}
      aria-label="Coindex Equilibrium Link"
    >
      <defs>
        {/* Gradiente Oficial Apple Blue para o Elo Direito */}
        <linearGradient id="cxBlueGrad" x1="50" y1="16" x2="102" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0A84FF" />
          <stop offset="100%" stopColor="#0066CC" />
        </linearGradient>

        {/* Gradiente Especular Branco/Titânio para o Elo Esquerdo "C" */}
        <linearGradient id="cxTitaniumGrad" x1="18" y1="16" x2="65" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Feixe Especular do Pulso Orbital Contínuo */}
        <linearGradient id="coindexSpecularPulse" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0A84FF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ========================================================
          GRUPO ESQUERDO: ELO "C" EM TITÂNIO (cx=44, cy=42, r=26)
          Translada -1.5px no hover magnético
          ======================================================== */}
      <g className="transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-[1.5px]">
        {/* Camada 1: Arco Completo da Letra "C" */}
        <path
          d="M 64.49 25.99 A 26 26 0 1 0 64.49 58.01"
          stroke="url(#cxTitaniumGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={enableMotion ? "coindex-ring-draw" : ""}
          fill="none"
        />

        {/* Trilha do Pulso Orbital no Elo Esquerdo */}
        {enableMotion && (
          <path
            d="M 64.49 25.99 A 26 26 0 1 0 64.49 58.01"
            stroke="url(#coindexSpecularPulse)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            className="coindex-orbital-glow"
          />
        )}
      </g>

      {/* ========================================================
          INTERSECÇÃO SUPERIOR: ELO DIREITO AZUL PASSA POR CIMA
          Corte de 3.5px (strokeWidth=17) com a cor do fundo
          ======================================================== */}
      <path
        d="M 76 16 A 26 26 0 0 0 52 32"
        stroke="var(--cupertino-sidebar, #0B0E14)"
        strokeWidth="17"
        strokeLinecap="butt"
        fill="none"
        className="transition-colors duration-200"
      />

      {/* ========================================================
          GRUPO DIREITO: ANEL COMPLETO APPLE BLUE (cx=76, cy=42, r=26)
          Translada +1.5px no hover magnético
          ======================================================== */}
      <g className="transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[1.5px]">
        {/* Camada 2: Anel Completo Azul */}
        <circle
          cx="76"
          cy="42"
          r="26"
          stroke="url(#cxBlueGrad)"
          strokeWidth="10"
          className={enableMotion ? "coindex-ring-draw" : ""}
          fill="none"
        />

        {/* Trilha do Pulso Orbital no Elo Direito (Defasada em 2.75s para efeito infinito) */}
        {enableMotion && (
          <path
            d="M 102 42 A 26 26 0 1 1 50 42 A 26 26 0 1 1 102 42"
            stroke="url(#coindexSpecularPulse)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            className="coindex-orbital-glow"
            style={{ animationDelay: "-2.75s" }}
          />
        )}
      </g>

      {/* ========================================================
          INTERSECÇÃO INFERIOR: ELO ESQUERDO BRANCO "C" PASSA POR CIMA
          Corte de 3.5px (strokeWidth=17) com a cor do fundo
          ======================================================== */}
      <g className="transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-[1.5px]">
        {/* Recorte de fundo no azul */}
        <path
          d="M 44 68 A 26 26 0 0 0 64.49 58.01"
          stroke="var(--cupertino-sidebar, #0B0E14)"
          strokeWidth="17"
          strokeLinecap="round"
          fill="none"
          className="transition-colors duration-200"
        />

        {/* Arco Sobreposto do Elo Branco ("C") passando por cima na base */}
        <path
          d="M 44 68 A 26 26 0 0 0 64.49 58.01"
          stroke="url(#cxTitaniumGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

export function CoindexLogoHorizontal({
  size = "md",
  showSubtitle = true,
  className = "",
  enableMotion = true
}: CoindexLogoProps) {
  const iconDimensions =
    size === "sm" ? "w-9 h-[26px]" : size === "lg" ? "w-14 h-10" : "w-11 h-8";
  const titleSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className={`inline-flex items-center gap-3 select-none group cursor-pointer ${className}`}>
      <div className="transition-transform duration-300 group-hover:scale-105 shrink-0 flex items-center">
        <CoindexIcon className={iconDimensions} enableMotion={enableMotion} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`font-extrabold tracking-[0.12em] uppercase leading-none text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-sky-200 group-hover:to-white ${titleSize}`}
          >
            COINDEX
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-mono font-bold leading-none tracking-wider">
            OS
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] text-slate-400 font-medium tracking-normal mt-0.5 group-hover:text-slate-300 transition-colors">
            Personal Finance & BI
          </span>
        )}
      </div>
    </div>
  );
}

export const CoindexLogo = CoindexLogoHorizontal;
export default CoindexLogoHorizontal;
