"use client";

import React, { useRef, useCallback, useEffect } from "react";

// ============================================================================
// SPRINT 52: MOTOR CENTRAL DE MICRO-FÍSICA 144HZ & PARTÍCULAS
// ============================================================================

export type BurstColor = "emerald" | "orange" | "blue" | "gold";

/**
 * Animação #15: Emerald Aura Burst & Confetti
 * Dispara 22 micro-partículas vetoriais luminosas e um anel de onda expansivo
 * nas coordenadas exatas do elemento clicado. Auto-removido em 700ms.
 */
export function triggerAuraBurst(
  originEl: HTMLElement | null,
  color: BurstColor = "emerald"
): void {
  if (typeof window === "undefined" || !originEl) return;

  // Respeita acessibilidade e toggle "Reduzir Animações"
  if (
    document.documentElement.getAttribute("data-animations") === "off" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const rect = originEl.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  // Paleta de cores por tema
  const paletteMap: Record<BurstColor, string[]> = {
    emerald: ["#30D158", "#34D399", "#10B981", "#6EE7B7", "#FFFFFF"],
    orange: ["#FC4C02", "#FF6B2B", "#F97316", "#FDBA74", "#FFFFFF"],
    blue: ["#0A84FF", "#38BDF8", "#60A5FA", "#93C5FD", "#FFFFFF"],
    gold: ["#F59E0B", "#FBBF24", "#FCD34D", "#D97706", "#FFFFFF"]
  };
  const colors = paletteMap[color] || paletteMap.emerald;

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    alpha: number;
    decay: number;
    shape: "circle" | "spark" | "rect";
    rotation: number;
    rotSpeed: number;
  }

  const particleCount = 22;
  const particles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
    const speed = 2.4 + Math.random() * 4.2;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      radius: 2 + Math.random() * 2.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: 0.02 + Math.random() * 0.02,
      shape: Math.random() > 0.6 ? "rect" : Math.random() > 0.3 ? "circle" : "spark",
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.15
    });
  }

  let ringRadius = 4;
  let ringAlpha = 0.95;
  const startTime = performance.now();
  const maxDuration = 700; // 700ms

  let rafId: number;

  const renderFrame = (now: number) => {
    const elapsed = now - startTime;
    if (elapsed > maxDuration) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Onda de Choque / Anel Expansivo
    if (ringAlpha > 0.01) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(originX, originY, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = colors[0];
      ctx.globalAlpha = ringAlpha * 0.7;
      ctx.lineWidth = Math.max(1, 3.5 * (1 - elapsed / maxDuration));
      ctx.stroke();
      ctx.restore();

      ringRadius += 2.8;
      ringAlpha = Math.max(0, 1 - elapsed / 450);
    }

    // 2. Micro-partículas em voo balístico
    for (const p of particles) {
      if (p.alpha <= 0.01) continue;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "rect") {
        ctx.fillRect(-p.radius, -p.radius * 0.6, p.radius * 2, p.radius * 1.2);
      } else {
        // Spark estrela
        ctx.beginPath();
        ctx.moveTo(0, -p.radius * 1.6);
        ctx.lineTo(p.radius * 0.4, 0);
        ctx.lineTo(0, p.radius * 1.6);
        ctx.lineTo(-p.radius * 0.4, 0);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // Gravidade sutil
      p.vx *= 0.985; // Fricção do ar
      p.rotation += p.rotSpeed;
      p.alpha = Math.max(0, p.alpha - p.decay);
    }

    rafId = requestAnimationFrame(renderFrame);
  };

  rafId = requestAnimationFrame(renderFrame);
}

// ============================================================================
// ANIMAÇÃO #1: 3D GYROSCOPE CARD TILT & HOLOGRAPHIC FOIL GLARE
// ============================================================================

export interface TiltCard3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number; // ±6deg por padrão
  glare?: boolean;
  className?: string;
}

/**
 * Componente Wrapper para Cartões de Crédito e Físicos
 * Aplica inclinação giroscópica 3D (±6deg) e reflexo holográfico em 144Hz
 * sem causar re-render no React (mutação direta via requestAnimationFrame).
 */
export const TiltCard3D: React.FC<TiltCard3DProps> = ({
  children,
  maxTilt = 6,
  glare = true,
  className = "",
  style,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (document.documentElement.getAttribute("data-animations") === "off") return;

      const card = cardRef.current;
      if (!card) return;

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }

      const clientX = e.clientX;
      const clientY = e.clientY;

      rafId.current = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(0)`;
        card.style.transition = "transform 80ms cubic-bezier(0.22, 1, 0.36, 1)";

        if (glare && glareRef.current) {
          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;
          glareRef.current.style.opacity = "0.75";
          glareRef.current.style.background = `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)`;
        }
      });
    },
    [maxTilt, glare]
  );

  const handleMouseLeave = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    const card = cardRef.current;
    if (card) {
      card.style.transform = "none";
      card.style.transition = "transform 350ms cubic-bezier(0.22, 1, 0.36, 1)";
    }

    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
      glareRef.current.style.transition = "opacity 400ms ease";
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none ${className}`}
      style={{ perspective: "1000px", ...style }}
      {...rest}
    >
      <div
        ref={cardRef}
        className="w-full h-full relative will-change-transform rounded-2xl"
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}

        {/* Camada Holográfica Glare */}
        {glare && (
          <div
            ref={glareRef}
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 transition-opacity z-20"
            style={{ mixBlendMode: "overlay" }}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// ANIMAÇÃO #3: PROXIMITY BORDER GLOW (HOOK PARA BENTO CARDS)
// ============================================================================

/**
 * Hook para acender suavemente a borda fina (1px) mais próxima do cursor
 * nos Cards Bento sem causar re-render.
 */
export function useProximityBorderGlow<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const rafRef = useRef<number | null>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    if (document.documentElement.getAttribute("data-animations") === "off") return;
    const el = ref.current;
    if (!el) return;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const angleDeg = Math.round(Math.atan2(y - rect.height / 2, x - rect.width / 2) * (180 / Math.PI) + 90);
      el.style.setProperty("--mouse-x", `${x}px`);
      el.style.setProperty("--mouse-y", `${y}px`);
      el.style.setProperty("--mouse-angle", `${angleDeg}deg`);
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
