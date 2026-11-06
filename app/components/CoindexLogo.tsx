"use client";

import React, { useState, useEffect } from "react";

export type CoindexLogoVariant =
  | "kinetic_arc"
  | "equilibrium_rings"
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
    id: "kinetic_arc",
    name: "Kinetic Arc (Padrão)",
    tagline: "Apple Copilot & Aerodinâmica",
    desc: "Arco único fluido em vetor contínuo desenhando um 'C' ascendente em degradê azul e índigo com ponto focal verde."
  },
  {
    id: "equilibrium_rings",
    name: "Equilibrium Rings",
    tagline: "Inspiração Audi & Bauhaus",
    desc: "Dois anéis entrelaçados com espessura calibrada e espaço negativo geométrico formando uma letra 'C' simétrica."
  },
  {
    id: "ascending_bars",
    name: "Ascending Bars",
    tagline: "Inspiração Adidas & Precision",
    desc: "Três barras paralelas inclinadas a 35 graus com cantos arredondados recortadas na curvatura de um 'C' financeiro."
  },
  {
    id: "precision_quadrant",
    name: "Precision Quadrant",
    tagline: "Inspiração BMW & Braun",
    desc: "Emblema circular técnico dividido em quadrantes de alta precisão com abertura angular formando 'C' e índice."
  }
];

interface CoindexIconProps {
  className?: string;
  variant?: CoindexLogoVariant;
}

interface CoindexLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  className?: string;
  variant?: CoindexLogoVariant;
}

export function CoindexIcon({ className = "w-9 h-9", variant: controlledVariant }: CoindexIconProps) {
  const [internalVariant, setInternalVariant] = useState<CoindexLogoVariant>("kinetic_arc");

  useEffect(() => {
    if (controlledVariant) {
      setInternalVariant(controlledVariant);
      return;
    }
    try {
      const saved = localStorage.getItem("coindex_logo_variant") as CoindexLogoVariant | null;
      if (saved && ["kinetic_arc", "equilibrium_rings", "ascending_bars", "precision_quadrant"].includes(saved)) {
        setInternalVariant(saved);
      }
    } catch {}

    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem("coindex_logo_variant") as CoindexLogoVariant | null;
        if (saved && ["kinetic_arc", "equilibrium_rings", "ascending_bars", "precision_quadrant"].includes(saved)) {
          setInternalVariant(saved);
        }
      } catch {}
    };

    window.addEventListener("coindex_logo_change", handleStorageChange);
    return () => window.removeEventListener("coindex_logo_change", handleStorageChange);
  }, [controlledVariant]);

  const activeVariant = controlledVariant || internalVariant;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Coindex Icon"
    >
      <defs>
        {/* Superfície Fundo Apple Dark Slate */}
        <linearGradient id="cxBg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#161A23" />
          <stop offset="100%" stopColor="#0B0E14" />
        </linearGradient>

        {/* Borda Sutil do Card */}
        <linearGradient id="cxBorder" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#5E5CE6" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#30D158" stopOpacity="0.25" />
        </linearGradient>

        {/* Gradiente Kinetic Arc (Azul -> Roxo Cupertino) */}
        <linearGradient id="cxKinetic" x1="12" y1="52" x2="52" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0A84FF" />
          <stop offset="65%" stopColor="#5E5CE6" />
          <stop offset="100%" stopColor="#64D2FF" />
        </linearGradient>

        {/* Gradiente Ascending Bars */}
        <linearGradient id="cxBarGrad1" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#0A84FF" />
          <stop offset="100%" stopColor="#64D2FF" />
        </linearGradient>
        <linearGradient id="cxBarGrad2" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#5E5CE6" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient id="cxBarGrad3" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#30D158" />
        </linearGradient>
      </defs>

      {/* Cartão Squircle de Base Apple (rx=16) */}
      <rect width="64" height="64" rx="16" fill="url(#cxBg)" />
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="15"
        stroke="url(#cxBorder)"
        strokeWidth="1.2"
      />

      {/* ========================================================
          VARIANTE 1: KINETIC ARC (PADRÃO - NIKE / APPLE COPILOT)
          Arco fluido contínuo com aerodinâmica em "C" e ápice luminoso
          ======================================================== */}
      {activeVariant === "kinetic_arc" && (
        <g>
          {/* Brilho halo traseiro */}
          <circle cx="32" cy="32" r="18" fill="#0A84FF" fillOpacity="0.08" filter="blur(8px)" />

          {/* Arco Dinâmico em 'C' */}
          <path
            d="M48 20 C 44 14, 20 12, 16 32 C 12 50, 42 54, 48 44"
            stroke="url(#cxKinetic)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Núcleo interno de velocidade */}
          <path
            d="M42 24 C 38 19, 24 18, 22 32 C 20 44, 38 46, 42 40"
            stroke="#FFFFFF"
            strokeOpacity="0.4"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Ponto focal de impulso no ápice */}
          <circle cx="48" cy="20" r="3.2" fill="#30D158" />
          <circle cx="48" cy="20" r="5" stroke="#30D158" strokeWidth="1" strokeOpacity="0.4" />
        </g>
      )}

      {/* ========================================================
          VARIANTE 2: EQUILIBRIUM RINGS (AUDI / BAUHAUS)
          Dois anéis entrelaçados formando a curva 'C' com espaço negativo
          ======================================================== */}
      {activeVariant === "equilibrium_rings" && (
        <g>
          {/* Anel Traseiro / Base (Azul Cupertino) */}
          <circle
            cx="28"
            cy="32"
            r="13"
            stroke="#0A84FF"
            strokeWidth="4"
            fill="none"
          />
          {/* Anel Frontal / Sobreposto (Branco Platina) */}
          <circle
            cx="36"
            cy="32"
            r="13"
            stroke="#F8FAFC"
            strokeWidth="4"
            fill="none"
          />
          {/* Mascaramento do entrelace para profundidade óptica */}
          <path
            d="M 28 19 A 13 13 0 0 1 41 32"
            stroke="#0A84FF"
            strokeWidth="4.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Ponto de equilíbrio */}
          <circle cx="32" cy="32" r="2.5" fill="#30D158" />
        </g>
      )}

      {/* ========================================================
          VARIANTE 3: ASCENDING BARS (ADIDAS / PRECISION)
          Três barras paralelas a 35 graus recortadas na silhueta em 'C'
          ======================================================== */}
      {activeVariant === "ascending_bars" && (
        <g transform="translate(32,32) rotate(-35) translate(-32,-32)">
          {/* Barra 1 - Início */}
          <rect x="20" y="24" width="6" height="16" rx="3" fill="url(#cxBarGrad1)" />
          {/* Barra 2 - Média */}
          <rect x="29" y="18" width="6" height="28" rx="3" fill="url(#cxBarGrad2)" />
          {/* Barra 3 - Ápice */}
          <rect x="38" y="12" width="6" height="40" rx="3" fill="url(#cxBarGrad3)" />
          {/* Arco envolvente sutil em C */}
          <path
            d="M 17 46 A 21 21 0 0 1 17 18"
            stroke="#FFFFFF"
            strokeOpacity="0.25"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      )}

      {/* ========================================================
          VARIANTE 4: PRECISION QUADRANT (BMW / BRAUN)
          Emblema circular concêntrico técnico com abertura em 'C'
          ======================================================== */}
      {activeVariant === "precision_quadrant" && (
        <g>
          {/* Anel Externo Calibrado */}
          <circle
            cx="32"
            cy="32"
            r="17"
            stroke="#E2E8F0"
            strokeOpacity="0.25"
            strokeWidth="2"
            fill="none"
          />
          {/* Arco de 290 graus formando o contorno do 'C' */}
          <path
            d="M 46 22 A 17 17 0 1 0 46 42"
            stroke="#0A84FF"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Núcleo Central de Moeda / Índice */}
          <circle cx="32" cy="32" r="7.5" fill="#161A23" stroke="#30D158" strokeWidth="2.5" />
          <circle cx="32" cy="32" r="3" fill="#30D158" />
          {/* Marcadores de quadrante ortogonal */}
          <line x1="32" y1="12" x2="32" y2="15" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="32" y1="49" x2="32" y2="52" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="12" y1="32" x2="15" y2="32" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.6" />
        </g>
      )}
    </svg>
  );
}

export function CoindexLogoHorizontal({
  size = "md",
  showSubtitle = true,
  className = "",
  variant
}: CoindexLogoProps) {
  const iconDimensions =
    size === "sm" ? "w-8 h-8" : size === "lg" ? "w-11 h-11" : "w-9 h-9";
  const titleSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className={`inline-flex items-center gap-3 select-none group cursor-pointer ${className}`}>
      <div className="transition-transform duration-300 group-hover:scale-105 shrink-0">
        <CoindexIcon className={`${iconDimensions} rounded-2xl shadow-sm`} variant={variant} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`font-extrabold tracking-[0.08em] text-white uppercase leading-none transition-colors duration-200 group-hover:text-[#64D2FF] ${titleSize}`}
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
