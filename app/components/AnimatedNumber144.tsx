"use client";

import React, { useEffect, useRef } from "react";

export interface AnimatedNumber144Props {
  value: number;
  type?: "currency" | "decimal" | "integer";
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number; // default 320ms
}

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function formatNumberDirect(
  val: number,
  type: "currency" | "decimal" | "integer" = "currency",
  decimals = 2,
  prefix = "",
  suffix = ""
): string {
  if (!Number.isFinite(val)) return `${prefix}—${suffix}`;

  let numStr = "";
  if (type === "currency") {
    numStr = brlFormatter.format(val);
  } else if (type === "integer") {
    numStr = Math.round(val).toLocaleString("pt-BR");
  } else {
    numStr = val.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  return `${prefix}${numStr}${suffix}`;
}

/**
 * AnimatedNumber144 — Motor 144Hz Zero-Jank Number Ticker
 * Atualização Direta no DOM via spanRef.current.textContent.
 * ZERO re-renders do React durante a animação com requestAnimationFrame.
 */
export const AnimatedNumber144: React.FC<AnimatedNumber144Props> = ({
  value,
  type = "currency",
  decimals = 2,
  prefix = "",
  suffix = "",
  className = "",
  duration = 320
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef<number>(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    // Se preferir redução de movimento ou valor inválido, atualiza direto sem animação
    if (
      !Number.isFinite(value) ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      el.textContent = formatNumberDirect(value, type, decimals, prefix, suffix);
      prevValueRef.current = value;
      return;
    }

    const startVal = prevValueRef.current;
    const diff = value - startVal;

    // Se a diferença for minúscula, escreve direto
    if (Math.abs(diff) < 0.001) {
      el.textContent = formatNumberDirect(value, type, decimals, prefix, suffix);
      prevValueRef.current = value;
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, Math.max(0, elapsed / duration));

      // Curva Exponencial Suave (Ease-Out Quártica: 1 - (1 - progress)^4)
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = startVal + diff * easeOut;

      el.textContent = formatNumberDirect(current, type, decimals, prefix, suffix);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        el.textContent = formatNumberDirect(value, type, decimals, prefix, suffix);
        prevValueRef.current = value;
        rafRef.current = null;
      }
    };

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, type, decimals, prefix, suffix, duration]);

  return (
    <span
      ref={spanRef}
      className={`tabular-nums ${className}`}
    >
      {formatNumberDirect(value, type, decimals, prefix, suffix)}
    </span>
  );
};

// Aliases convenientes de alta performance
export const AnimatedBRL144: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}> = (props) => <AnimatedNumber144 {...props} type="currency" />;

export const AnimatedMetric144: React.FC<{
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}> = (props) => <AnimatedNumber144 {...props} type="decimal" />;

// Backwards-compatible exports
export const AnimatedBRL = AnimatedBRL144;
export const AnimatedMetric = AnimatedMetric144;
export default AnimatedNumber144;
