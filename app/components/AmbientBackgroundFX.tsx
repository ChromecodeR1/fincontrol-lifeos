"use client";

import React, { useEffect, useState, useRef } from "react";

export type AmbientFxMode = "hybrid" | "aurora" | "grid" | "rays" | "spotlight" | "none";

export interface AmbientBackgroundFXProps {
  mode?: AmbientFxMode;
}

export const AMBIENT_FX_OPTIONS: { id: AmbientFxMode; label: string; icon: string; desc: string }[] = [
  {
    id: "hybrid",
    label: "Híbrido Copilot (Padrão)",
    icon: "✨",
    desc: "Fusão Aurora Cupertino + Micro-Grid + Spotlight sutil"
  },
  {
    id: "aurora",
    label: "Aurora Cupertino Mesh",
    icon: "🌌",
    desc: "Nébulas dinâmicas em azul, violeta e verde esmeralda"
  },
  {
    id: "grid",
    label: "Grade Arquitetural Linear",
    icon: "📐",
    desc: "Malha minimalista com máscara radial difusa"
  },
  {
    id: "rays",
    label: "Feixes Titanium & Matte",
    icon: "💎",
    desc: "Luz volumétrica cônica superior e microtextura fosca"
  },
  {
    id: "spotlight",
    label: "Spotlight Interativo (Mouse)",
    icon: "🔦",
    desc: "Halo de luz reativo aos movimentos do cursor"
  },
  {
    id: "none",
    label: "Sólido Puro (Desativado)",
    icon: "⬛",
    desc: "Fundo liso sem efeitos decorativos"
  }
];

export const AmbientBackgroundFX: React.FC<AmbientBackgroundFXProps> = ({ mode = "hybrid" }) => {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Pausa Inteligente quando Aba Inativa (document.hidden) para poupar GPU/bateria
  useEffect(() => {
    const handleVisibility = () => {
      if (containerRef.current) {
        if (document.hidden) {
          containerRef.current.classList.add("tab-inactive-paused");
        } else {
          containerRef.current.classList.remove("tab-inactive-paused");
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // 2. Cursor Spotlight com requestAnimationFrame Coalescido e ZERO setState
  useEffect(() => {
    if (!mounted || (mode !== "spotlight" && mode !== "hybrid")) return;

    if (typeof window !== "undefined") {
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (isTouch || prefersReduced) return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      lastMousePos.current.x = e.clientX;
      lastMousePos.current.y = e.clientY;

      if (rafId.current !== null) return;

      rafId.current = window.requestAnimationFrame(() => {
        if (spotlightRef.current) {
          spotlightRef.current.style.setProperty("--spot-x", `${lastMousePos.current.x}px`);
          spotlightRef.current.style.setProperty("--spot-y", `${lastMousePos.current.y}px`);
        }
        rafId.current = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId.current) {
        window.cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [mounted, mode]);

  if (mode === "none") {
    return null;
  }

  const showAurora = mode === "aurora" || mode === "hybrid";
  const showGrid = mode === "grid" || mode === "hybrid";
  const showRays = mode === "rays";
  const showSpotlight = mode === "spotlight" || mode === "hybrid";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none [contain:strict]"
      aria-hidden="true"
      style={{ transform: "none" }}
    >
      {/* 1. AURORA CUPERTINO MESH (GPU Compositor puro com translate3d e will-change) */}
      {showAurora && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden [contain:strict]">
          {/* Esfera 1: Cupertino Blue (#0A84FF) - Topo Esquerdo */}
          <div
            className={`absolute -top-32 -left-32 w-[620px] h-[620px] rounded-full blur-[130px] transition-opacity duration-1000 [will-change:transform] ${
              mode === "hybrid" ? "opacity-[0.12] dark:opacity-[0.14]" : "opacity-[0.14] dark:opacity-[0.18]"
            }`}
            style={{
              background: "radial-gradient(circle, #0A84FF 0%, rgba(10, 132, 255, 0) 70%)",
              animation: "cupertinoAuroraFloat1 24s ease-in-out infinite alternate"
            }}
          />

          {/* Esfera 2: Cupertino Indigo/Purple (#5E5CE6) - Topo Direito */}
          <div
            className={`absolute -top-28 -right-28 w-[640px] h-[640px] rounded-full blur-[140px] transition-opacity duration-1000 [will-change:transform] ${
              mode === "hybrid" ? "opacity-[0.10] dark:opacity-[0.14]" : "opacity-[0.13] dark:opacity-[0.17]"
            }`}
            style={{
              background: "radial-gradient(circle, #5E5CE6 0%, rgba(94, 92, 230, 0) 70%)",
              animation: "cupertinoAuroraFloat2 28s ease-in-out infinite alternate"
            }}
          />

          {/* Esfera 3: Cupertino Emerald (#30D158) - Centro Inferior */}
          <div
            className={`absolute -bottom-40 left-1/4 w-[700px] h-[600px] rounded-full blur-[150px] transition-opacity duration-1000 [will-change:transform] ${
              mode === "hybrid" ? "opacity-[0.08] dark:opacity-[0.12]" : "opacity-[0.11] dark:opacity-[0.15]"
            }`}
            style={{
              background: "radial-gradient(circle, #30D158 0%, rgba(48, 209, 88, 0) 70%)",
              animation: "cupertinoAuroraFloat3 26s ease-in-out infinite alternate"
            }}
          />
        </div>
      )}

      {/* 2. LINEAR ARCHITECTURAL GRID */}
      {showGrid && (
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-700 [contain:strict] ${
            mode === "hybrid" ? "opacity-[0.035] dark:opacity-[0.06]" : "opacity-[0.06] dark:opacity-[0.10]"
          }`}
          style={{
            backgroundImage: `
              radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px),
              linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 35%, #000 45%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 35%, #000 45%, transparent 100%)"
          }}
        />
      )}

      {/* 3. TITANIUM LIGHT RAYS & MATTE */}
      {showRays && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden [contain:strict]">
          {/* Feixes Volumétricos Cônicos */}
          <div
            className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] blur-[90px] opacity-[0.14] dark:opacity-[0.20] transition-opacity duration-1000"
            style={{
              background:
                "conic-gradient(from 180deg at 50% 0%, rgba(10, 132, 255, 0.25) 0deg, rgba(94, 92, 230, 0.18) 45deg, transparent 90deg, transparent 270deg, rgba(48, 209, 88, 0.18) 315deg, rgba(10, 132, 255, 0.25) 360deg)"
            }}
          />
          {/* Microtextura fosca sutil */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />
        </div>
      )}

      {/* 4. INTERACTIVE CURSOR SPOTLIGHT (GPU Compositor 144Hz via CSS Custom Properties) */}
      {showSpotlight && (
        <div
          ref={spotlightRef}
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 [contain:strict] ${
            mode === "hybrid" ? "opacity-70" : "opacity-100"
          }`}
          style={{
            background: `radial-gradient(650px circle at var(--spot-x, 50vw) var(--spot-y, 30vh), rgba(10, 132, 255, 0.10), rgba(94, 92, 230, 0.04) 40%, transparent 70%)`
          }}
        />
      )}
    </div>
  );
};
