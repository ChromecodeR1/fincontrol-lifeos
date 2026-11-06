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
  activeColor?: string; // e.g. "bg-[#0A84FF]", "bg-indigo-600", "bg-[#FC4C02]"
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
  const [style, setStyle] = useState<{ left: number; width: number; height: number; top: number }>({
    left: 0,
    width: 0,
    height: 0,
    top: 0
  });
  const [isReady, setIsReady] = useState(false);

  const updatePosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeButton = buttonRefs.current.get(value);
    if (!activeButton) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeButton.getBoundingClientRect();

    setStyle({
      left: activeRect.left - containerRect.left,
      width: activeRect.width,
      height: activeRect.height,
      top: activeRect.top - containerRect.top
    });
    setIsReady(true);
  }, [value]);

  useLayoutEffect(() => {
    updatePosition();
  }, [updatePosition, options, value]);

  useEffect(() => {
    const handleResize = () => updatePosition();
    window.addEventListener("resize", handleResize);

    const container = containerRef.current;
    let observer: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => updatePosition());
      observer.observe(container);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (observer) observer.disconnect();
    };
  }, [updatePosition]);

  const sizeClasses = {
    xs: "text-[11px] py-1 px-2.5 min-h-[28px] gap-1",
    sm: "text-xs py-1.5 px-3 min-h-[32px] gap-1.5",
    md: "text-xs sm:text-sm py-2 px-3.5 min-h-[38px] gap-2"
  }[size];

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center p-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 select-none ${
        fullWidth ? "w-full flex" : ""
      } ${className}`}
      role="tablist"
    >
      {/* Indicador deslizante (Pill ou Underline) */}
      {isReady && style.width > 0 && (
        indicatorVariant === "pill" ? (
          <div
            className={`absolute rounded-lg shadow-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none ${activeColor} ${pillClassName}`}
            style={{
              transform: `translate3d(${style.left}px, ${style.top}px, 0)`,
              width: `${style.width}px`,
              height: `${style.height}px`
            }}
          />
        ) : (
          <div
            className={`absolute bottom-0 rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none h-[2px] ${activeColor} ${pillClassName}`}
            style={{
              transform: `translate3d(${style.left}px, 0, 0)`,
              width: `${style.width}px`
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
            className={`relative z-10 font-semibold transition-colors duration-200 flex items-center justify-center rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              fullWidth ? "flex-1" : ""
            } ${sizeClasses} ${
              isSelected
                ? "text-white font-bold"
                : "text-slate-400 hover:text-slate-200"
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
