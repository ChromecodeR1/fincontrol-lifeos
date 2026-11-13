"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";

export type AmbientFxMode = "hybrid" | "aurora" | "grid" | "rays" | "spotlight" | "none";

export interface AmbientBackgroundFXProps {
  mode?: AmbientFxMode;
  activeTab?: string;
}

export const AMBIENT_FX_OPTIONS: { id: AmbientFxMode; label: string; icon: string; desc: string }[] = [
  {
    id: "hybrid",
    label: "Híbrido Copilot (Padrão)",
    icon: "✨",
    desc: "Fusão Aurora Camaleão + Ondas de Seda + Poeira Estelar 3D"
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

// SPRINT 63: Paletas Cromáticas Oficiais da Aurora Camaleão por Aba
export interface TabMoodPalette {
  primary: [number, number, number];
  secondary: [number, number, number];
  accent: [number, number, number];
}

export const TAB_MOOD_PALETTES: Record<string, TabMoodPalette> = {
  // 1. Padrão Cupertino (Dashboard, Transações, Status, Configurações, Sobre)
  default: {
    primary: [10, 132, 255],     // #0A84FF (Apple Blue)
    secondary: [94, 92, 230],    // #5E5CE6 (Cupertino Indigo)
    accent: [56, 189, 248]       // #38BDF8 (Sky Blue)
  },
  dashboard: {
    primary: [10, 132, 255],
    secondary: [94, 92, 230],
    accent: [56, 189, 248]
  },
  transactions: {
    primary: [10, 132, 255],
    secondary: [94, 92, 230],
    accent: [56, 189, 248]
  },
  status: {
    primary: [10, 132, 255],
    secondary: [94, 92, 230],
    accent: [56, 189, 248]
  },
  settings: {
    primary: [10, 132, 255],
    secondary: [94, 92, 230],
    accent: [56, 189, 248]
  },
  about: {
    primary: [10, 132, 255],
    secondary: [94, 92, 230],
    accent: [56, 189, 248]
  },
  // 2. Investimentos (Wealth Ultraviolet & Gold)
  investments: {
    primary: [139, 92, 246],    // #8B5CF6 (Purple/Ultraviolet)
    secondary: [245, 158, 11],   // #F59E0B (Amber Gold)
    accent: [10, 132, 255]       // #0A84FF (Cupertino Blue)
  },
  // 3. Cartões & Recebíveis (Emerald & Titanium Blue)
  cards: {
    primary: [48, 209, 88],      // #30D158 (Cupertino Emerald)
    secondary: [10, 132, 255],   // #0A84FF (Cupertino Blue)
    accent: [99, 102, 241]       // #6366F1 (Indigo)
  },
  receivables: {
    primary: [48, 209, 88],      // #30D158
    secondary: [10, 132, 255],   // #0A84FF
    accent: [99, 102, 241]       // #6366F1
  },
  // 4. Bio & Strava (Strava Flame & Bio Emerald)
  bio: {
    primary: [252, 76, 2],       // #FC4C02 (Strava Orange Flame)
    secondary: [48, 209, 88],    // #30D158 (Bio Emerald)
    accent: [14, 165, 233]       // #0EA5E9 (Sky 500)
  },
  // 5. Veículos (Telemetry Amber & Racing Orange)
  auto: {
    primary: [245, 158, 11],     // #F59E0B (Amber Telemetry)
    secondary: [234, 88, 12],    // #EA580C (Racing Orange)
    accent: [10, 132, 255]       // #0A84FF (Cupertino Blue)
  },
  // 6. Segundo Cérebro (Second Brain Violet & Magenta)
  brain: {
    primary: [217, 70, 239],     // #D946EF (Fuchsia/Magenta)
    secondary: [139, 92, 246],   // #8B5CF6 (Violet)
    accent: [56, 189, 248]       // #38BDF8 (Sky)
  },
  wishlist: {
    primary: [245, 158, 11],     // #F59E0B (Gold)
    secondary: [217, 70, 239],   // #D946EF (Magenta)
    accent: [10, 132, 255]       // #0A84FF (Cupertino Blue)
  },
  spotify: {
    primary: [30, 215, 96],      // #1ED760 (Spotify Green)
    secondary: [10, 132, 255],   // #0A84FF
    accent: [139, 92, 246]       // #8B5CF6
  }
};

interface StardustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVy: number;
  radius: number;
  depth: number;
  layer: 1 | 2 | 3;
  twinkleSpeed: number;
  phase: number;
  baseAlpha: number;
}

interface ShootingStar {
  startX: number;
  startY: number;
  x: number;
  y: number;
  len: number;
  speed: number;
  angle: number;
  startTime: number;
  duration: number;
}

export const AmbientBackgroundFX: React.FC<AmbientBackgroundFXProps> = ({
  mode = "hybrid",
  activeTab = "dashboard"
}) => {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const rafId = useRef<number | null>(null);
  const mousePos = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const smoothMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDocumentHiddenRef = useRef<boolean>(false);

  // Paleta atual interpolada (RGB)
  const currentColorsRef = useRef<{
    primary: [number, number, number];
    secondary: [number, number, number];
    accent: [number, number, number];
  }>({
    primary: [10, 132, 255],
    secondary: [94, 92, 230],
    accent: [56, 189, 248]
  });

  // Estrelas Cadentes (Shooting Stars)
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const nextShootingStarTimeRef = useRef<number>(0);

  // Partículas de Poeira Estelar (115 partículas em 3 camadas)
  const particlesRef = useRef<StardustParticle[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Monitora visibilidade da aba para pausar rAF e economizar 100% de GPU/bateria
  useEffect(() => {
    const handleVisibility = () => {
      isDocumentHiddenRef.current = document.hidden;
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

  // Rastreia posição do mouse para brisa estelar e spotlight
  useEffect(() => {
    if (!mounted || mode === "none") return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (spotlightRef.current) {
        spotlightRef.current.style.setProperty("--spot-x", `${e.clientX}px`);
        spotlightRef.current.style.setProperty("--spot-y", `${e.clientY}px`);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mounted, mode]);

  // SPRINT 63: Motor Cinemático Canvas 144Hz (Poeira Estelar 3D + Ondas de Seda Harmônicas + Aurora Camaleão)
  useEffect(() => {
    if (!mounted || mode === "none") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", handleResize);

    // SPRINT 68: 420 micro-partículas bem pequenas de 0.5px (raio entre 0.4px e 0.65px, opacidade 0.05 a 0.20)
    // Poeira estelar uniforme, fluida e nítida em 144Hz — elegância cinematográfica pura
    const particles: StardustParticle[] = [];
    for (let i = 0; i < 420; i++) {
      const radius = 0.4 + Math.random() * 0.25; // Raio estrito entre 0.4px e 0.65px (média ~0.5px)
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.05,
        vy: -0.05 - Math.random() * 0.08,
        baseVy: -0.05 - Math.random() * 0.08,
        radius,
        depth: 0.15 + Math.random() * 0.55,
        layer: 1,
        twinkleSpeed: 0.0012 + Math.random() * 0.002,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: 0.05 + Math.random() * 0.12 // Faixa sutil 0.05 a 0.17 (com pico máximo de 0.20)
      });
    }
    particlesRef.current = particles;

    // Próximo disparo de estrela cadente (entre 11 e 17 segundos)
    nextShootingStarTimeRef.current = performance.now() + (11000 + Math.random() * 6000);

    const checkReducedMotion = () => {
      const docAttr = document.documentElement.getAttribute("data-animations");
      if (docAttr === "off") return true;
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    };

    // Parâmetros dos 3 feixes de ondas de seda (Silk Contour Waves)
    const SILK_BUNDLES = [
      { baseYPct: 0.26, amp1: 26, amp2: 16, speed: 0.0006 },
      { baseYPct: 0.52, amp1: 34, amp2: 22, speed: 0.0008 },
      { baseYPct: 0.78, amp1: 30, amp2: 18, speed: 0.0007 }
    ];

    // LOOP DE ANIMAÇÃO 144HZ GPU-ACCELERATED
    const renderLoop = (timestamp: number) => {
      if (isDocumentHiddenRef.current) {
        rafId.current = requestAnimationFrame(renderLoop);
        return;
      }

      const isReduced = checkReducedMotion();
      const isLight = document.documentElement.getAttribute("data-theme") === "light";

      // 1. Interpolação Suave das Cores da Aurora Camaleão (lerp a 0.035)
      const targetPalette = TAB_MOOD_PALETTES[activeTab || "default"] || TAB_MOOD_PALETTES.default;
      const curColors = currentColorsRef.current;

      for (let i = 0; i < 3; i++) {
        curColors.primary[i] += (targetPalette.primary[i] - curColors.primary[i]) * 0.035;
        curColors.secondary[i] += (targetPalette.secondary[i] - curColors.secondary[i]) * 0.035;
        curColors.accent[i] += (targetPalette.accent[i] - curColors.accent[i]) * 0.035;
      }

      // Suavização do cursor (Smooth Mouse Lerp)
      if (mousePos.current.x > -1000) {
        smoothMouse.current.x += (mousePos.current.x - smoothMouse.current.x) * 0.08;
        smoothMouse.current.y += (mousePos.current.y - smoothMouse.current.y) * 0.08;
      } else {
        smoothMouse.current.x = width * 0.5;
        smoothMouse.current.y = height * 0.4;
      }

      ctx.clearRect(0, 0, width, height);

      const cp = curColors.primary.map(Math.round);
      const cs = curColors.secondary.map(Math.round);
      const ca = curColors.accent.map(Math.round);

      // ======================================================================
      // PASSO 3: ONDAS DE SEDA HARMÔNICAS (Silk Contour Waves)
      // Renderizadas nos modos "hybrid" e "aurora"
      // ======================================================================
      if (mode === "hybrid" || mode === "aurora") {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        SILK_BUNDLES.forEach((bundle) => {
          const baseY = height * bundle.baseYPct;

          // 5 fitas harmônicas ligeiramente defasadas por feixe
          for (let ribbonIdx = 0; ribbonIdx < 5; ribbonIdx++) {
            const ribbonPhase = ribbonIdx * 0.14;
            const ribbonPhase2 = ribbonIdx * 0.09;
            const ribbonAlpha = isLight
              ? 0.022 + ribbonIdx * 0.005
              : 0.035 + ribbonIdx * 0.008;

            ctx.beginPath();
            const stepX = 16;
            let first = true;

            for (let x = 0; x <= width + stepX; x += stepX) {
              const y =
                baseY +
                Math.sin(x * 0.0022 + timestamp * bundle.speed + ribbonPhase) * bundle.amp1 +
                Math.cos(x * 0.0048 - timestamp * bundle.speed * 0.7 + ribbonPhase2) * bundle.amp2;

              if (first) {
                ctx.moveTo(x, y);
                first = false;
              } else {
                ctx.lineTo(x, y);
              }
            }

            // Gradiente Horizontal Combinando a Tríade Camaleão Ativa
            const grad = ctx.createLinearGradient(0, 0, width, 0);
            grad.addColorStop(0, `rgba(${cp[0]}, ${cp[1]}, ${cp[2]}, 0.01)`);
            grad.addColorStop(0.35, `rgba(${cp[0]}, ${cp[1]}, ${cp[2]}, ${ribbonAlpha})`);
            grad.addColorStop(0.65, `rgba(${cs[0]}, ${cs[1]}, ${cs[2]}, ${ribbonAlpha})`);
            grad.addColorStop(1, `rgba(${ca[0]}, ${ca[1]}, ${ca[2]}, 0.01)`);

            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.65;
            ctx.stroke();

            // Realce especular dinâmico onde o cursor ilumina a fita de seda
            const mouseNearX = Math.abs(smoothMouse.current.x - width * 0.5);
            if (mouseNearX < 260 && Math.abs(smoothMouse.current.y - baseY) < 140) {
              ctx.save();
              ctx.beginPath();
              const glowX = Math.max(0, smoothMouse.current.x - 160);
              const glowEndX = Math.min(width, smoothMouse.current.x + 160);

              for (let x = glowX; x <= glowEndX; x += stepX) {
                const y =
                  baseY +
                  Math.sin(x * 0.0022 + timestamp * bundle.speed + ribbonPhase) * bundle.amp1 +
                  Math.cos(x * 0.0048 - timestamp * bundle.speed * 0.7 + ribbonPhase2) * bundle.amp2;
                if (x === glowX) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }

              const specGrad = ctx.createRadialGradient(
                smoothMouse.current.x,
                baseY,
                10,
                smoothMouse.current.x,
                baseY,
                180
              );
              specGrad.addColorStop(0, `rgba(255, 255, 255, ${ribbonAlpha * 1.8})`);
              specGrad.addColorStop(1, "transparent");

              ctx.strokeStyle = specGrad;
              ctx.lineWidth = 1.1;
              ctx.stroke();
              ctx.restore();
            }
          }
        });

        ctx.restore();
      }

      // ======================================================================
      // PASSO 2: POEIRA ESTELAR CINEMATOGRÁFICA 3D (Floating Micro-Stardust Pro)
      // ======================================================================
      if (mode === "hybrid" || mode === "spotlight" || mode === "aurora" || mode === "grid" || mode === "rays") {
        ctx.save();

        particlesRef.current.forEach((p) => {
          // Interação de Brisa com o Cursor (< 135px)
          const distToMouse = Math.hypot(p.x - smoothMouse.current.x, p.y - smoothMouse.current.y);
          let flareBoost = 1.0;

          if (distToMouse < 135) {
            const normDist = 1 - distToMouse / 135;
            const force = normDist * normDist * 1.8;
            const angle = Math.atan2(p.y - smoothMouse.current.y, p.x - smoothMouse.current.x);
            p.vx += Math.cos(angle) * force * p.depth;
            p.vy += Math.sin(angle) * force * p.depth;
            // SPRINT 64: Ganho de luminosidade perto do cursor calibrado para no máximo +5% (sem estouro)
            flareBoost = 1 + normDist * 0.05;
          }

          // Damping e Atualização Física
          p.vx *= 0.94;
          p.vy = p.vy * 0.94 + p.baseVy * 0.06;

          if (!isReduced) {
            p.x += p.vx;
            p.y += p.vy;
          }

          // Wrap-around suave nas bordas da tela
          if (p.y < -20) p.y = height + 15;
          if (p.y > height + 20) p.y = -15;
          if (p.x < -20) p.x = width + 15;
          if (p.x > width + 20) p.x = -15;

          const twinkle = 0.5 + 0.5 * Math.sin(timestamp * p.twinkleSpeed + p.phase);
          // SPRINT 67: Micro-partículas estelares sutis entre 0.06 e 0.22 de opacidade
          const effectiveAlpha = Math.min(0.22, Math.max(0.06, p.baseAlpha * twinkle * flareBoost * (isLight ? 0.75 : 1)));

          ctx.fillStyle = isLight
            ? `rgba(${cp[0]}, ${cp[1]}, ${cp[2]}, ${effectiveAlpha * 0.7})`
            : `rgba(235, 242, 255, ${effectiveAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        // ------------------------------------------------------------------
        // MICRO-ESTRELAS CADENTES SUTIS (Shooting Stars)
        // Disparadas a cada 11 a 17 segundos
        // ------------------------------------------------------------------
        if (timestamp > nextShootingStarTimeRef.current && !isReduced) {
          shootingStarsRef.current.push({
            startX: width * (0.15 + Math.random() * 0.6),
            startY: height * (0.08 + Math.random() * 0.28),
            x: 0,
            y: 0,
            len: 120 + Math.random() * 80,
            speed: 1.1 + Math.random() * 0.4,
            angle: (28 + Math.random() * 12) * (Math.PI / 180),
            startTime: timestamp,
            duration: 900 // 900ms de vida
          });
          nextShootingStarTimeRef.current = timestamp + (11000 + Math.random() * 6000);
        }

        // Renderiza estrelas cadentes ativas
        const activeShootingStars: ShootingStar[] = [];
        shootingStarsRef.current.forEach((star) => {
          const elapsed = timestamp - star.startTime;
          const prog = elapsed / star.duration;

          if (prog < 1.0) {
            activeShootingStars.push(star);
            const currentDist = star.speed * elapsed;
            const headX = star.startX + Math.cos(star.angle) * currentDist;
            const headY = star.startY + Math.sin(star.angle) * currentDist;
            const tailX = headX - Math.cos(star.angle) * star.len * (1 - prog);
            const tailY = headY - Math.sin(star.angle) * star.len * (1 - prog);

            const starGrad = ctx.createLinearGradient(headX, headY, tailX, tailY);
            // SPRINT 64: Opacidade máxima reduzida para 0.16 para efeito ultra-elegante e sutil
            starGrad.addColorStop(0, `rgba(245, 250, 255, ${0.16 * (1 - prog)})`);
            starGrad.addColorStop(0.35, `rgba(${cp[0]}, ${cp[1]}, ${cp[2]}, ${0.09 * (1 - prog)})`);
            starGrad.addColorStop(1, "transparent");

            ctx.beginPath();
            ctx.moveTo(headX, headY);
            ctx.lineTo(tailX, tailY);
            ctx.strokeStyle = starGrad;
            ctx.lineWidth = 0.85 * (1 - prog);
            ctx.stroke();

            // Ponto central de impacto sutil
            ctx.fillStyle = `rgba(245, 250, 255, ${0.16 * (1 - prog)})`;
            ctx.beginPath();
            ctx.arc(headX, headY, 0.9 * (1 - prog), 0, Math.PI * 2);
            ctx.fill();
          }
        });
        shootingStarsRef.current = activeShootingStars;

        ctx.restore();
      }

      rafId.current = requestAnimationFrame(renderLoop);
    };

    rafId.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [mounted, mode, activeTab]);

  if (mode === "none") {
    return null;
  }

  const showAurora = mode === "aurora" || mode === "hybrid";
  const showGrid = mode === "grid" || mode === "hybrid";
  const showRays = mode === "rays";
  const showSpotlight = mode === "spotlight" || mode === "hybrid";

  // Cores dinâmicas para as esferas DOM da Aurora com interpolação visual contínua
  const activePalette = TAB_MOOD_PALETTES[activeTab || "default"] || TAB_MOOD_PALETTES.default;
  const pRgb = activePalette.primary.join(",");
  const sRgb = activePalette.secondary.join(",");
  const aRgb = activePalette.accent.join(",");

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none [contain:strict]"
      aria-hidden="true"
      style={{ transform: "none" }}
    >
      {/* 1. AURORA CAMALEÃO CONTEXTUAL (Mesh com 3 Esferas Fluidas e Transição de 1600ms) */}
      {showAurora && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden [contain:strict]">
          {/* Esfera 1: Cor Primária Contextual - Topo Esquerdo */}
          <div
            className={`absolute -top-32 -left-32 w-[640px] h-[640px] rounded-full blur-[130px] transition-all duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] [will-change:transform] ${
              mode === "hybrid" ? "opacity-[0.12] dark:opacity-[0.15]" : "opacity-[0.14] dark:opacity-[0.18]"
            }`}
            style={{
              background: `radial-gradient(circle, rgb(${pRgb}) 0%, rgba(${pRgb}, 0) 70%)`,
              animation: "cupertinoAuroraFloat1 24s ease-in-out infinite alternate"
            }}
          />

          {/* Esfera 2: Cor Secundária Contextual - Topo Direito */}
          <div
            className={`absolute -top-28 -right-28 w-[660px] h-[660px] rounded-full blur-[140px] transition-all duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] [will-change:transform] ${
              mode === "hybrid" ? "opacity-[0.10] dark:opacity-[0.14]" : "opacity-[0.13] dark:opacity-[0.17]"
            }`}
            style={{
              background: `radial-gradient(circle, rgb(${sRgb}) 0%, rgba(${sRgb}, 0) 70%)`,
              animation: "cupertinoAuroraFloat2 28s ease-in-out infinite alternate"
            }}
          />

          {/* Esfera 3: Cor Acento Contextual - Centro Inferior */}
          <div
            className={`absolute -bottom-40 left-1/4 w-[720px] h-[620px] rounded-full blur-[150px] transition-all duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] [will-change:transform] ${
              mode === "hybrid" ? "opacity-[0.08] dark:opacity-[0.12]" : "opacity-[0.11] dark:opacity-[0.15]"
            }`}
            style={{
              background: `radial-gradient(circle, rgb(${aRgb}) 0%, rgba(${aRgb}, 0) 70%)`,
              animation: "cupertinoAuroraFloat3 26s ease-in-out infinite alternate"
            }}
          />
        </div>
      )}

      {/* 2. CANVAS CINEMATOGRÁFICO 144HZ: POEIRA ESTELAR 3D + ONDAS DE SEDA HARMÔNICAS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* 3. LINEAR ARCHITECTURAL GRID */}
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

      {/* 4. TITANIUM LIGHT RAYS & MATTE */}
      {showRays && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden [contain:strict]">
          {/* Feixes Volumétricos Cônicos */}
          <div
            className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] blur-[90px] opacity-[0.14] dark:opacity-[0.20] transition-opacity duration-1000"
            style={{
              background: `conic-gradient(from 180deg at 50% 0%, rgba(${pRgb}, 0.25) 0deg, rgba(${sRgb}, 0.18) 45deg, transparent 90deg, transparent 270deg, rgba(${aRgb}, 0.18) 315deg, rgba(${pRgb}, 0.25) 360deg)`
            }}
          />
        </div>
      )}

      {/* 5. INTERACTIVE CURSOR SPOTLIGHT (GPU Compositor 144Hz via CSS Custom Properties) */}
      {showSpotlight && (
        <div
          ref={spotlightRef}
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 [contain:strict] ${
            mode === "hybrid" ? "opacity-70" : "opacity-100"
          }`}
          style={{
            background: `radial-gradient(650px circle at var(--spot-x, 50vw) var(--spot-y, 30vh), rgba(${pRgb}, 0.10), rgba(${sRgb}, 0.04) 40%, transparent 70%)`
          }}
        />
      )}
    </div>
  );
};
