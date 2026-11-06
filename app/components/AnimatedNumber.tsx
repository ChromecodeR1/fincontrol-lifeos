"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatBRL } from "@/app/lifeos-data";

/**
 * Hook de interpolação numérica 120Hz com curva Ease-Out Quártica.
 * Respeita preferências de redução de movimento (prefers-reduced-motion).
 */
export function useAnimatedNumber(
  targetValue: number,
  duration = 380,
  decimals = 2
): number {
  const [displayValue, setDisplayValue] = useState<number>(targetValue);
  const prevValueRef = useRef<number>(targetValue);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Se targetValue não for número finito, atualiza direto
    if (!Number.isFinite(targetValue)) {
      setDisplayValue(targetValue);
      prevValueRef.current = targetValue;
      return;
    }

    // Se preferir redução de movimento, pula animação
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(targetValue);
      prevValueRef.current = targetValue;
      return;
    }

    const startVal = prevValueRef.current;
    const diff = targetValue - startVal;

    // Se não mudou, nada a fazer
    if (Math.abs(diff) < 0.001) {
      setDisplayValue(targetValue);
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, Math.max(0, elapsed / duration));
      
      // Curva Ease-Out Quártica: 1 - (1 - t)^4
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = startVal + diff * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        prevValueRef.current = targetValue;
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
  }, [targetValue, duration, decimals]);

  return displayValue;
}

export interface AnimatedBRLProps {
  value: number;
  className?: string;
  duration?: number;
}

export const AnimatedBRL: React.FC<AnimatedBRLProps> = ({
  value,
  className = "",
  duration = 380
}) => {
  const animated = useAnimatedNumber(value, duration, 2);
  return <span className={`tabular-nums ${className}`}>{formatBRL(animated)}</span>;
};

export interface AnimatedMetricProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
}

export const AnimatedMetric: React.FC<AnimatedMetricProps> = ({
  value,
  decimals = 1,
  suffix = "",
  prefix = "",
  className = "",
  duration = 380
}) => {
  const animated = useAnimatedNumber(value, duration, decimals);
  const formatted = animated.toFixed(decimals).replace(".", ",");
  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
