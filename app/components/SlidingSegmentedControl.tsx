"use client";

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from "react";

export interface SegmentOption<T extends string | number = string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface SlidingSegmentedControlProps<T extends string | number = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  pillClassName?: string;
  indicatorVariant?: "pill" | "underline";
  size?: "xs" | "sm" | "md";
  fullWidth?: boolean;
  activeColor?: string; // e.g. "bg-[#0A84FF]", "bg-indigo-600", "bg-[#FC4C02]", "bg-amber-500 text-slate-950"
}

export function SlidingSegmentedControl<T extends string | number = string>({
  options,
  value,
  onChange,
  className = "",
  pillClassName = "",
  indicatorVariant = "pill",
  size = "sm",
  fullWidth = false,
  activeColor = "bg-[#0A84FF]"
}: SlidingSegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<T, HTMLButtonElement>>(new Map());
  const [pillStyle, setPillStyle] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  const [isReady, setIsReady] = useState(false);

  const updatePosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeBtn = buttonRefs.current.get(value);
    if (!activeBtn) return;

    let x = activeBtn.offsetLeft;
    let y = activeBtn.offsetTop;
    const width = activeBtn.offsetWidth;
    const height = activeBtn.offsetHeight;

    // Fallback de alta precisão caso offsetParent não seja o container direto
    if (activeBtn.offsetParent !== container) {
      const cRect = container.getBoundingClientRect();
      const bRect = activeBtn.getBoundingClientRect();
      x = bRect.left - cRect.left;
      y = bRect.top - cRect.top;
    }

    if (width > 0 && height > 0) {
      setPillStyle({ x, y, width, height });
      setIsReady(true);
    }
  }, [value]);

  useLayoutEffect(() => {
    updatePosition();
    const rafId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(rafId);
  }, [updatePosition, options, value]);

  useEffect(() => {
    // Sincroniza após o carregamento de fontes personalizadas
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        requestAnimationFrame(updatePosition);
      });
    }

    const container = containerRef.current;
    const activeBtn = buttonRefs.current.get(value);
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(updatePosition);
    });

    if (container) observer.observe(container);
    if (activeBtn) observer.observe(activeBtn);

    const handleResize = () => requestAnimationFrame(updatePosition);
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [value, updatePosition]);

  const sizeClasses = {
    xs: "text-[11px] py-1 px-2.5 min-h-[26px] gap-1.5",
    sm: "text-xs py-1.5 px-3 min-h-[32px] gap-1.5",
    md: "text-xs sm:text-sm py-2 px-3.5 min-h-[36px] gap-2"
  }[size];

  // Determina cor do texto selecionado com base no activeColor
  const activeTextColor =
    activeColor.includes("text-slate-950")
      ? "text-slate-950"
      : activeColor.includes("text-slate-900")
      ? "text-slate-900"
      : activeColor.includes("text-black")
      ? "text-black"
      : "text-white";

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center p-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 select-none ${
        fullWidth ? "w-full flex" : ""
      } ${className}`}
      role="tablist"
    >
      {/* Indicador deslizante (Pill ou Underline) */}
      {isReady && pillStyle.width > 0 && (
        indicatorVariant === "pill" ? (
          <div
            aria-hidden="true"
            className={`absolute rounded-lg pointer-events-none z-0 shadow-sm ${activeColor} ${pillClassName}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${pillStyle.width}px`,
              height: `${pillStyle.height}px`,
              transform: `translate3d(${pillStyle.x}px, ${pillStyle.y}px, 0)`,
              transition: isReady
                ? "transform 260ms cubic-bezier(0.22, 1, 0.36, 1), width 260ms cubic-bezier(0.22, 1, 0.36, 1), height 260ms cubic-bezier(0.22, 1, 0.36, 1)"
                : "none"
            }}
          />
        ) : (
          <div
            aria-hidden="true"
            className={`absolute pointer-events-none z-0 rounded-full h-[2px] ${activeColor} ${pillClassName}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${pillStyle.width}px`,
              height: "2px",
              transform: `translate3d(${pillStyle.x}px, ${pillStyle.y + pillStyle.height - 2}px, 0)`,
              transition: isReady
                ? "transform 260ms cubic-bezier(0.22, 1, 0.36, 1), width 260ms cubic-bezier(0.22, 1, 0.36, 1)"
                : "none"
            }}
          />
        )
      )}

      {/* Botões do Segmented Control */}
      {options.map((opt) => {
        const isSelected = opt.id === value;
        return (
          <button
            key={String(opt.id)}
            ref={(el) => {
              if (el) {
                buttonRefs.current.set(opt.id, el);
              } else {
                buttonRefs.current.delete(opt.id);
              }
            }}
            type="button"
            role="tab"
            aria-selected={isSelected}
            disabled={opt.disabled}
            onClick={() => {
              if (!opt.disabled && opt.id !== value) {
                onChange(opt.id);
              }
            }}
            className={`relative z-10 inline-flex items-center justify-center text-center font-semibold leading-none rounded-lg whitespace-nowrap cursor-pointer transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed select-none ${
              fullWidth ? "flex-1" : ""
            } ${sizeClasses} ${
              isSelected ? activeTextColor : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span className="truncate">{opt.label}</span>
            {opt.badge && <span className="ml-1 shrink-0">{opt.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
