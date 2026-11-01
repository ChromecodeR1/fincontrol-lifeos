"use client";

import React from "react";

interface CoindexLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  className?: string;
}

export function CoindexIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Coindex Icon"
    >
      <defs>
        {/* Superfície Cupertino Dark Slate */}
        <linearGradient id="cxSurface" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1C1C1E" />
          <stop offset="100%" stopColor="#0B0C0E" />
        </linearGradient>

        {/* Borda Externa em Gradiente Cupertino (#0A84FF -> #5E5CE6 -> #30D158) */}
        <linearGradient id="cxBorderGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#5E5CE6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#30D158" stopOpacity="0.4" />
        </linearGradient>

        {/* Faceta Superior do Prisma Cupertino */}
        <linearGradient id="cxTopFacet" x1="16" y1="21" x2="48" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0A84FF" />
          <stop offset="50%" stopColor="#5E5CE6" />
          <stop offset="100%" stopColor="#30D158" />
        </linearGradient>

        {/* Facetas Laterais do Prisma */}
        <linearGradient id="cxLeftFacet" x1="16" y1="21.5" x2="32" y2="50.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5E5CE6" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#0A84FF" stopOpacity="0.30" />
        </linearGradient>
        <linearGradient id="cxRightFacet" x1="48" y1="21.5" x2="32" y2="50.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#30D158" stopOpacity="0.30" />
        </linearGradient>

        {/* Barras de Índice Ascendentes Internas */}
        <linearGradient id="cxBar1" x1="23" y1="38" x2="23" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0A84FF" />
          <stop offset="100%" stopColor="#5E5CE6" />
        </linearGradient>
        <linearGradient id="cxBar2" x1="30" y1="39" x2="30" y2="20.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5E5CE6" />
          <stop offset="100%" stopColor="#64D2FF" />
        </linearGradient>
        <linearGradient id="cxBar3" x1="37" y1="40" x2="37" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#64D2FF" />
          <stop offset="100%" stopColor="#30D158" />
        </linearGradient>
      </defs>

      {/* Cartão de Fundo com Borda Fina Cupertino */}
      <rect width="64" height="64" rx="16" fill="url(#cxSurface)" />
      <rect
        x="1.5"
        y="1.5"
        width="61"
        height="61"
        rx="14.5"
        stroke="url(#cxBorderGrad)"
        strokeWidth="1.5"
      />

      {/* Fintech Prism — Facetas Isométricas 3D */}
      {/* Faceta Esquerda */}
      <path
        d="M16 21.5L32 31V50.5L16 41V21.5Z"
        fill="url(#cxLeftFacet)"
      />
      {/* Faceta Direita */}
      <path
        d="M32 31L48 21.5V41L32 50.5V31Z"
        fill="url(#cxRightFacet)"
      />

      {/* Camadas de Liquidez Isométricas */}
      <path
        d="M16 34.5L32 44L48 34.5"
        stroke="#5E5CE6"
        strokeOpacity="0.45"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M16 28L32 37.5L48 28"
        stroke="#0A84FF"
        strokeOpacity="0.45"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Contorno Isométrico do Prisma */}
      <path
        d="M32 12L48 21.5V41L32 50.5L16 41V21.5Z"
        stroke="url(#cxTopFacet)"
        strokeWidth="1.3"
        strokeOpacity="0.85"
        strokeLinejoin="round"
      />
      {/* Aresta Central Vertical */}
      <path
        d="M32 31V50.5"
        stroke="url(#cxTopFacet)"
        strokeWidth="1"
        strokeOpacity="0.4"
      />

      {/* Tampa Superior Translúcida (Glass Top) */}
      <path
        d="M32 12L48 21.5L32 31L16 21.5Z"
        fill="url(#cxTopFacet)"
        fillOpacity="0.25"
      />

      {/* Barras Ascendentes Internas */}
      <rect x="23" y="27" width="4.5" height="11" rx="2.25" fill="url(#cxBar1)" />
      <rect x="29.75" y="20.5" width="4.5" height="18.5" rx="2.25" fill="url(#cxBar2)" />
      <rect x="36.5" y="14" width="4.5" height="26" rx="2.25" fill="url(#cxBar3)" />

      {/* Trajetória Isométrica do Índice */}
      <path
        d="M25.25 27L32 20.5L38.75 14"
        stroke="#30D158"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.9"
      />

      {/* Vértice Luminoso no Ápice */}
      <circle cx="38.75" cy="14" r="3.5" fill="#0A84FF" fillOpacity="0.4" />
      <circle cx="38.75" cy="14" r="2" fill="#30D158" />
    </svg>
  );
}

export function CoindexLogoHorizontal({
  size = "md",
  showSubtitle = true,
  className = ""
}: CoindexLogoProps) {
  const iconDimensions =
    size === "sm" ? "w-8 h-8" : size === "lg" ? "w-11 h-11" : "w-9 h-9";
  const titleSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <CoindexIcon className={`${iconDimensions} shrink-0 rounded-2xl shadow-sm`} />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-semibold tracking-[-0.02em] text-white leading-none ${titleSize}`}>
            Coindex
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-mono font-semibold leading-none">
            OS
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] text-slate-400 font-medium tracking-normal mt-0.5">
            Personal Finance & BI
          </span>
        )}
      </div>
    </div>
  );
}
