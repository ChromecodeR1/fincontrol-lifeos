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

/**
 * SPRINT 69: Motor Visual "Coindex Caustic Silk Sheet 3D"
 * Lençol de Seda Paramétrico Tridimensional com Dobras Cáusticas Iluminadas,
 * Bainhas Especulares e Interação Fluida a 144Hz.
 *
 * - Lençol 1 (Hero Sheet): 52 filamentos contínuos
 * - Lençol 2 (Deep Sub-Veil): 28 filamentos contínuos com defasagem espacial
 * - 40 segmentos com interpolação spline suave via quadraticCurveTo
 * - Equação de altura tridimensional com curvatura Camber, harmônicos duplos,
 *   torção longitudinal 3D (twist) e deformação elástica por aproximação do cursor (< 320px)
 * - Modo de mistura 'screen' no Dark Mode gerando acúmulo cáustico natural
 * - Bainhas de cetim especulares externas destacadas (isRimEdge)
 * - Gradiente horizontal tricolor com realce perolado na crista
 */
interface CausticSheetConfig {
  numFilaments: number;
  baseYPct: number;
  spreadYPct: number;
  camberAmpPct: number;
  amp1: number;
  freq1: number;
  speed1: number;
  twistPhase1: number;
  amp2: number;
  freq2: number;
  speed2: number;
  twistPhase2: number;
  twistAmp: number;
  rippleAmp: number;
  rippleFreq: number;
  rippleSpeed: number;
  baseAlphaDark: number;
  baseAlphaLight: number;
}

const CAUSTIC_SHEETS: CausticSheetConfig[] = [
  // Lençol 1: Hero Caustic Silk Sheet (52 filamentos)
  {
    numFilaments: 52,
    baseYPct: 0.44,
    spreadYPct: 0.18,
    camberAmpPct: 0.08,
    amp1: 46,
    freq1: 0.0016,
    speed1: 0.00045,
    twistPhase1: 1.8,
    amp2: 26,
    freq2: 0.0034,
    speed2: 0.00032,
    twistPhase2: 2.4,
    twistAmp: 36,
    rippleAmp: 3.5,
    rippleFreq: 0.0055,
    rippleSpeed: 0.001,
    baseAlphaDark: 0.022,
    baseAlphaLight: 0.016
  },
  // Lençol 2: Deep Sub-Veil (28 filamentos com contra-camber e defasagem espacial)
  {
    numFilaments: 28,
    baseYPct: 0.62,
    spreadYPct: 0.22,
    camberAmpPct: -0.06,
    amp1: 34,
    freq1: 0.0012,
    speed1: -0.00038,
    twistPhase1: 1.2,
    amp2: 20,
    freq2: 0.0028,
    speed2: 0.00025,
    twistPhase2: 1.9,
    twistAmp: 24,
    rippleAmp: 2.0,
    rippleFreq: 0.004,
    rippleSpeed: 0.0008,
    baseAlphaDark: 0.015,
    baseAlphaLight: 0.011
  }
];

function drawCausticSilkSheets(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timestamp: number,
  primaryRgb: [number, number, number],
  secondaryRgb: [number, number, number],
  accentRgb: [number, number, number],
  mouseX: number,
  mouseY: number,
  isLight: boolean
) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (!isLight) {
    ctx.globalCompositeOperation = "screen";
  }

  const segments = 40;
  const stepX = width / segments;

  for (let sIdx = 0; sIdx < CAUSTIC_SHEETS.length; sIdx++) {
    const sheet = CAUSTIC_SHEETS[sIdx];
    const N = sheet.numFilaments;
    const baseSheetY = height * sheet.baseYPct;
    const spreadY = height * sheet.spreadYPct;
    const camberAmp = height * sheet.camberAmpPct;
    const baseAlpha = isLight ? sheet.baseAlphaLight : sheet.baseAlphaDark;

    for (let i = 0; i < N; i++) {
      const u = N > 1 ? i / (N - 1) : 0.5; // [0, 1]
      const uCentered = u - 0.5; // [-0.5, 0.5]
      const isRimEdge = i === 0 || i === N - 1;

      // Cálculo de espessura de traço e multiplicador de densidade óptica
      let lineWidth: number;
      let alphaMult: number;

      if (isRimEdge) {
        lineWidth = isLight ? 1.0 : 1.2;
        alphaMult = isLight ? 1.9 : 2.4;
      } else {
        lineWidth = isLight ? 0.6 : 0.75;
        // Filamentos centrais ganham densidade para acúmulo cáustico natural
        alphaMult = 1.0 + Math.sin(u * Math.PI) * 0.35;
      }

      // Função inline de cálculo de Y para este filamento no ponto x
      const computeY = (x: number): number => {
        // 1. Posição base + dispersão no plano
        const yBase = baseSheetY + uCentered * spreadY;

        // 2. Curvatura Camber tridimensional em arco côncavo/convexo
        const camber = Math.sin((x / width) * Math.PI) * camberAmp;

        // 3. Onda primária ondulante longitudinal
        const wave1 = Math.sin(x * sheet.freq1 + timestamp * sheet.speed1 + u * sheet.twistPhase1) * sheet.amp1;

        // 4. Harmônico secundário para dobras cáusticas transversais
        const wave2 = Math.cos(x * sheet.freq2 - timestamp * sheet.speed2 + u * sheet.twistPhase2) * sheet.amp2;

        // 5. Modulação de torção 3D espacial (Twist / Roll)
        const twist = Math.sin(x * 0.0018 + timestamp * 0.0004) * uCentered * sheet.twistAmp;

        // 6. Micro-ondulação de seda (Silk Ripple)
        const ripple = Math.sin(x * sheet.rippleFreq + timestamp * sheet.rippleSpeed + u * 2.5) * sheet.rippleAmp;

        let y = yBase + camber + wave1 + wave2 + twist + ripple;

        // 7. Deformação elástica fluida por aproximação do cursor (< 320px)
        const dx = x - mouseX;
        const dy = y - mouseY;
        const distSq = dx * dx + dy * dy;
        if (distSq < 102400) { // 320^2 = 102400
          const dist = Math.sqrt(distSq);
          const normDist = 1 - dist / 320;
          const lift = Math.sin(normDist * (Math.PI * 0.5)) * 34 * (1 - Math.abs(uCentered) * 0.6);
          const dir = dy >= 0 ? 1 : -1;
          y += lift * dir * 0.55;
        }

        return y;
      };

      // Inicia o desenho da fita contínua via spline por pontos médios (quadraticCurveTo)
      ctx.beginPath();
      let prevX = 0;
      let prevY = computeY(0);
      ctx.moveTo(prevX, prevY);

      for (let s = 1; s <= segments; s++) {
        const currX = s * stepX;
        const currY = computeY(currX);
        const midX = (prevX + currX) * 0.5;
        const midY = (prevY + currY) * 0.5;
        ctx.quadraticCurveTo(prevX, prevY, midX, midY);
        prevX = currX;
        prevY = currY;
      }
      ctx.lineTo(prevX, prevY);

      // Gradiente horizontal tricolor com realce perolado na crista
      const effAlpha = Math.min(1.0, baseAlpha * alphaMult);
      const grad = ctx.createLinearGradient(0, 0, width, 0);

      const r1 = primaryRgb[0], g1 = primaryRgb[1], b1 = primaryRgb[2];
      const r2 = secondaryRgb[0], g2 = secondaryRgb[1], b2 = secondaryRgb[2];
      const r3 = accentRgb[0], g3 = accentRgb[1], b3 = accentRgb[2];

      if (isLight) {
        grad.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, 0)`);
        grad.addColorStop(0.2, `rgba(${r1}, ${g1}, ${b1}, ${effAlpha * 0.75})`);
        grad.addColorStop(0.5, `rgba(${r2}, ${g2}, ${b2}, ${effAlpha})`);
        grad.addColorStop(0.8, `rgba(${r3}, ${g3}, ${b3}, ${effAlpha * 0.8})`);
        grad.addColorStop(1, `rgba(${r3}, ${g3}, ${b3}, 0)`);
      } else {
        const pearlAlpha = Math.min(1.0, effAlpha * 1.6);
        grad.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, 0)`);
        grad.addColorStop(0.22, `rgba(${r1}, ${g1}, ${b1}, ${effAlpha * 0.85})`);
        grad.addColorStop(0.48, `rgba(240, 246, 255, ${pearlAlpha})`); // Realce Perolado Cáustico
        grad.addColorStop(0.72, `rgba(${r2}, ${g2}, ${b2}, ${effAlpha})`);
        grad.addColorStop(1, `rgba(${r3}, ${g3}, ${b3}, 0)`);
      }

      ctx.strokeStyle = grad;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  ctx.restore();
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
      // PASSO 3: LENÇOL DE SEDA PARAMÉTRICO 3D (Coindex Caustic Silk Sheets)
      // Renderizado com 52 filamentos (Hero) + 28 filamentos (Deep Sub-Veil),
      // dobras cáusticas em modo screen e bainhas especulares a 144Hz
      // ======================================================================
      if (mode === "hybrid" || mode === "aurora") {
        drawCausticSilkSheets(
          ctx,
          width,
          height,
          timestamp,
          curColors.primary,
          curColors.secondary,
          curColors.accent,
          smoothMouse.current.x,
          smoothMouse.current.y,
          isLight
        );
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
