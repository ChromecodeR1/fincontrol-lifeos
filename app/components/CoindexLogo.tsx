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
    desc: "Elo esquerdo em Titânio desenhando o 'C' entrelaçado ao elo direito Sapphire Blue com pulso orbital contínuo."
  },
  {
    id: "kinetic_arc",
    name: "Kinetic Arc",
    tagline: "Vetor Fluido & Aerodinâmica",
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
  showcase?: boolean;
}

export interface CoindexLogoMonumentalProps {
  className?: string;
  enableMotion?: boolean;
  isPulsing?: boolean;
  highlightSegment?: "all" | "left" | "right" | "weave";
  onClick?: (e: React.MouseEvent<SVGSVGElement>) => void;
}

export interface CoindexLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  className?: string;
  variant?: CoindexLogoVariant;
  enableMotion?: boolean;
}

/**
 * CoindexIcon — "The Equilibrium Link"
 * Geometria SVG Exata (viewBox="0 0 120 84"):
 * - Elo Esquerdo: Letra "C" em Titânio (#F8FAFC), cx=44, cy=42, r=26, strokeWidth=10, aberto de -38° a +38°.
 * - Elo Direito: Anel Completo em Apple Blue (#0A84FF -> #38BDF8), cx=76, cy=42, r=26, strokeWidth=10.
 * - Over-Under Weave: Máscaras alfa puras com folga de 3.5px sem cortes de fundo opacos.
 * - Motions: Aceleração GPU pura (transform: translateZ(0)) + Pulso orbital contínuo 144Hz normalizado.
 */
export function CoindexIcon({
  className = "w-10 h-7",
  enableMotion = true,
  showcase = false
}: CoindexIconProps) {
  if (showcase) {
    return <CoindexLogoMonumental className={className} enableMotion={enableMotion} />;
  }
  return (
    <svg
      viewBox="0 0 120 84"
      fill="none"
      shapeRendering="geometricPrecision"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-opacity duration-300 ${className}`}
      aria-label="Coindex Equilibrium Link"
    >
      <defs>
        {/* Gradiente Oficial Apple Blue para o Elo Direito */}
        <linearGradient id="cxBlueGradIcon" x1="50" y1="16" x2="102" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0A84FF" />
          <stop offset="100%" stopColor="#0066CC" />
        </linearGradient>

        {/* Gradiente Especular Titânio / Platina para o Elo Esquerdo "C" */}
        <linearGradient id="cxTitaniumGradIcon" x1="18" y1="16" x2="65" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Feixe Especular do Pulso Orbital Contínuo (144Hz) */}
        <linearGradient id="coindexSpecularPulseIcon" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0A84FF" stopOpacity="0" />
        </linearGradient>

        {/* Máscara Alfa Transparente: Intersecção Superior (Azul passa por cima) */}
        <mask id="cxWeaveMaskLeftIcon" maskUnits="userSpaceOnUse">
          <rect x="0" y="0" width="120" height="84" fill="#FFFFFF" />
          <path d="M 76 16 A 26 26 0 0 0 52 32" stroke="#000000" strokeWidth="17" strokeLinecap="round" fill="none" />
        </mask>

        {/* Máscara Alfa Transparente: Intersecção Inferior (Titânio passa por cima) */}
        <mask id="cxWeaveMaskRightIcon" maskUnits="userSpaceOnUse">
          <rect x="0" y="0" width="120" height="84" fill="#FFFFFF" />
          <path d="M 44 68 A 26 26 0 0 0 64.49 58.01" stroke="#000000" strokeWidth="17" strokeLinecap="round" fill="none" />
        </mask>
      </defs>

      {/* ========================================================
          ELO DIREITO: ANEL COMPLETO APPLE BLUE (cx=76, cy=42, r=26)
          ======================================================== */}
      <g
        className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[1.5px]"
        mask="url(#cxWeaveMaskRightIcon)"
      >
        <circle
          cx="76"
          cy="42"
          r="26"
          stroke="url(#cxBlueGradIcon)"
          strokeWidth="10"
          pathLength="100"
          className={enableMotion ? "coindex-ring-draw" : ""}
          fill="none"
        />

        {enableMotion && (
          <path
            pathLength="100"
            d="M 102 42 A 26 26 0 1 1 50 42 A 26 26 0 1 1 102 42"
            stroke="url(#coindexSpecularPulseIcon)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            className="coindex-orbital-glow"
            style={{ animationDelay: "-2.75s" }}
          />
        )}
      </g>

      {/* ========================================================
          ELO ESQUERDO: ELO "C" EM TITÂNIO (cx=44, cy=42, r=26)
          ======================================================== */}
      <g
        className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-[1.5px]"
        mask="url(#cxWeaveMaskLeftIcon)"
      >
        <path
          pathLength="100"
          d="M 64.49 25.99 A 26 26 0 1 0 64.49 58.01"
          stroke="url(#cxTitaniumGradIcon)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={enableMotion ? "coindex-ring-draw" : ""}
          fill="none"
        />

        {enableMotion && (
          <path
            pathLength="100"
            d="M 64.49 25.99 A 26 26 0 1 0 64.49 58.01"
            stroke="url(#coindexSpecularPulseIcon)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            className="coindex-orbital-glow"
          />
        )}
      </g>
    </svg>
  );
}

/**
 * CoindexLogoMonumental — Palco Monumental Interativo 144Hz da Logo "The Equilibrium Link"
 * Utilizado no módulo "Sobre" e em palcos heróicos do sistema.
 */
export function CoindexLogoMonumental({
  className = "w-60 h-42 md:w-72 md:h-50",
  enableMotion = true,
  isPulsing = false,
  highlightSegment = "all",
  onClick
}: CoindexLogoMonumentalProps) {
  // Configuração de opacidades com base no segmento focado
  const leftOpacity =
    highlightSegment === "right" ? 0.2 : highlightSegment === "weave" ? 0.55 : 1;
  const rightOpacity =
    highlightSegment === "left" ? 0.2 : highlightSegment === "weave" ? 0.55 : 1;
  const weaveHighlight = highlightSegment === "weave";

  const pulseDuration = isPulsing ? "1.4s" : "5.5s";

  return (
    <svg
      width={200}
      height={140}
      viewBox="0 0 120 84"
      fill="none"
      shapeRendering="geometricPrecision"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      className={`select-none ${className}`}
      aria-label="Coindex Equilibrium Link Monumental"
    >
      <defs>
        {/* Gradiente Oficial Apple Blue Monumental */}
        <linearGradient id="cxBlueGradMonumental" x1="50" y1="16" x2="102" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0A84FF" />
          <stop offset="100%" stopColor="#0066CC" />
        </linearGradient>

        {/* Gradiente Titânio / Platina Especular */}
        <linearGradient id="cxTitaniumGradMonumental" x1="18" y1="16" x2="65" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Feixe Especular Orbital 144Hz */}
        <linearGradient id="cxPulseMonumental" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0A84FF" stopOpacity="0" />
        </linearGradient>

        {/* Glow de Intersecção do Elo */}
        <radialGradient id="cxWeaveGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0A84FF" stopOpacity="0" />
        </radialGradient>

        {/* Máscara Alfa Transparente: Intersecção Superior */}
        <mask id="cxWeaveMaskLeftMonumental" maskUnits="userSpaceOnUse">
          <rect x="0" y="0" width="120" height="84" fill="#FFFFFF" />
          <path d="M 76 16 A 26 26 0 0 0 52 32" stroke="#000000" strokeWidth="17" strokeLinecap="round" fill="none" />
        </mask>

        {/* Máscara Alfa Transparente: Intersecção Inferior */}
        <mask id="cxWeaveMaskRightMonumental" maskUnits="userSpaceOnUse">
          <rect x="0" y="0" width="120" height="84" fill="#FFFFFF" />
          <path d="M 44 68 A 26 26 0 0 0 64.49 58.01" stroke="#000000" strokeWidth="17" strokeLinecap="round" fill="none" />
        </mask>
      </defs>

      {/* ========================================================
          CAMADA DE FUNDO ARQUITETURAL: RADAR DE PRECISÃO & GEOMETRIA
          ======================================================== */}
      <g className="text-slate-500 dark:text-slate-400 pointer-events-none">
        {/* Linha técnica do horizonte */}
        <line
          x1="6"
          y1="42"
          x2="114"
          y2="42"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeDasharray="1 5"
          strokeWidth="0.8"
        />

        {/* Radar concêntrico do Elo Esquerdo */}
        <circle
          cx="44"
          cy="42"
          r="41"
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeDasharray="2 4"
          strokeWidth="0.8"
          fill="none"
        />
        <circle
          cx="44"
          cy="42"
          r="16"
          stroke="currentColor"
          strokeOpacity="0.05"
          strokeDasharray="1 3"
          strokeWidth="0.8"
          fill="none"
        />
        {/* Cruz de mira no centro do nó esquerdo */}
        <line x1="44" y1="38" x2="44" y2="46" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.8" />
        <line x1="40" y1="42" x2="48" y2="42" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.8" />

        {/* Radar concêntrico do Elo Direito */}
        <circle
          cx="76"
          cy="42"
          r="41"
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeDasharray="2 4"
          strokeWidth="0.8"
          fill="none"
        />
        <circle
          cx="76"
          cy="42"
          r="16"
          stroke="currentColor"
          strokeOpacity="0.05"
          strokeDasharray="1 3"
          strokeWidth="0.8"
          fill="none"
        />
        {/* Cruz de mira no centro do nó direito */}
        <line x1="76" y1="38" x2="76" y2="46" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.8" />
        <line x1="72" y1="42" x2="80" y2="42" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.8" />
      </g>

      {/* ========================================================
          GRUPO DIREITO: ANEL COMPLETO APPLE BLUE (cx=76, cy=42, r=26)
          ======================================================== */}
      <g
        className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[1.5px]"
        style={{ opacity: rightOpacity }}
        mask="url(#cxWeaveMaskRightMonumental)"
      >
        <circle
          cx="76"
          cy="42"
          r="26"
          stroke="url(#cxBlueGradMonumental)"
          strokeWidth="10"
          pathLength="100"
          className={enableMotion ? "coindex-ring-draw" : ""}
          fill="none"
        />

        {enableMotion && (
          <path
            pathLength="100"
            d="M 102 42 A 26 26 0 1 1 50 42 A 26 26 0 1 1 102 42"
            stroke="url(#cxPulseMonumental)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            className="coindex-orbital-glow"
            style={{ animationDelay: isPulsing ? "-0.7s" : "-2.75s", animationDuration: pulseDuration }}
          />
        )}
      </g>

      {/* ========================================================
          GRUPO ESQUERDO: ELO "C" EM TITÂNIO (cx=44, cy=42, r=26)
          ======================================================== */}
      <g
        className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-[1.5px]"
        style={{ opacity: leftOpacity }}
        mask="url(#cxWeaveMaskLeftMonumental)"
      >
        <path
          pathLength="100"
          d="M 64.49 25.99 A 26 26 0 1 0 64.49 58.01"
          stroke="url(#cxTitaniumGradMonumental)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={enableMotion ? "coindex-ring-draw" : ""}
          fill="none"
        />

        {enableMotion && (
          <path
            pathLength="100"
            d="M 64.49 25.99 A 26 26 0 1 0 64.49 58.01"
            stroke="url(#cxPulseMonumental)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            className="coindex-orbital-glow"
            style={{ animationDuration: pulseDuration }}
          />
        )}
      </g>

      {/* ========================================================
          DESTAQUE DE ENTRELAÇAMENTO (WEAVE FOCUS)
          ======================================================== */}
      {weaveHighlight && (
        <g className="transition-opacity duration-300 pointer-events-none">
          <circle cx="60" cy="21.5" r="7" fill="url(#cxWeaveGlow)" className="animate-pulse" />
          <circle cx="60" cy="62.5" r="7" fill="url(#cxWeaveGlow)" className="animate-pulse" />
          <circle cx="60" cy="21.5" r="3.5" fill="#38BDF8" />
          <circle cx="60" cy="62.5" r="3.5" fill="#FFFFFF" />
        </g>
      )}
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
