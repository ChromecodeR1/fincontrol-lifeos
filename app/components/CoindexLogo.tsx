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
        <linearGradient id="cxGradPrimary" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="55%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id="cxSurface" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#090D16" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#cxSurface)" />
      <rect
        x="1.5"
        y="1.5"
        width="61"
        height="61"
        rx="14.5"
        stroke="url(#cxGradPrimary)"
        strokeOpacity="0.45"
        strokeWidth="2"
      />
      {/* Arco em C geométrico representando Cofre + Índice */}
      <path
        d="M39 19H26.5C21.8056 19 18 22.8056 18 27.5V36.5C18 41.1944 21.8056 45 26.5 45H39"
        stroke="url(#cxGradPrimary)"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      {/* Vetor de ascensão financeira interno */}
      <path
        d="M29 36L35.5 29.5L39.5 33.5L47.5 25.5"
        stroke="#10B981"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="47.5" cy="25.5" r="3.5" fill="#10B981" />
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
      <CoindexIcon className={`${iconDimensions} shrink-0 shadow-lg shadow-indigo-500/15 rounded-2xl`} />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-extrabold tracking-tight text-white leading-none ${titleSize}`}>
            Coindex
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono font-semibold leading-none">
            OS
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] text-slate-400 font-medium tracking-wide mt-0.5">
            Personal Finance & BI
          </span>
        )}
      </div>
    </div>
  );
}