"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { RotateCcw, Check } from "lucide-react";

export type ChartLineCurve = "monotone" | "linear" | "step";
export type ChartKind = "line" | "area" | "bar" | "pie" | "composed" | "kpi";
export type ChartZeroHandling = "include" | "omit";
export type ChartWidgetSize = "half" | "full";
export type ChartDisplayType = "area" | "line" | "bar";
export type ChartHeightSetting = "compact" | "normal" | "tall";

export interface ChartWidgetSettings {
  color: string;
  curveType: ChartLineCurve;
  strokeWidth: number;
  showDots: boolean;
  fillArea: boolean; // Preenchimento Degradê
  zeroHandling: ChartZeroHandling;
  showDataLabels: boolean;
  showGrid: boolean;
  showLegend: boolean;
  chartType?: ChartDisplayType;
  height?: ChartHeightSetting;
}

export const DEFAULT_CHART_WIDGET_SETTINGS: ChartWidgetSettings = {
  color: "auto",
  curveType: "monotone",
  strokeWidth: 2.5,
  showDots: true,
  fillArea: true,
  zeroHandling: "include",
  showDataLabels: false,
  showGrid: true,
  showLegend: true,
  chartType: "area",
  height: "normal"
};

export const CHART_COLOR_PALETTE: ReadonlyArray<{ id: string; label: string; hex: string }> = [
  { id: "auto", label: "Automática (Azul Apple)", hex: "linear-gradient(135deg,#0A84FF,#5E5CE6)" },
  { id: "#0A84FF", label: "Azul Apple", hex: "#0A84FF" },
  { id: "#30D158", label: "Verde Menta", hex: "#30D158" },
  { id: "#5E5CE6", label: "Índigo Apple", hex: "#5E5CE6" },
  { id: "#64D2FF", label: "Ciano Apple", hex: "#64D2FF" },
  { id: "#FF9F0A", label: "Âmbar Laranja", hex: "#FF9F0A" },
  { id: "#FF453A", label: "Vermelho Coral", hex: "#FF453A" },
  { id: "#BF5AF2", label: "Púrpura Apple", hex: "#BF5AF2" },
  { id: "#8E8E93", label: "Cinza Neutro", hex: "#8E8E93" }
];

interface ChartSettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
  chartKind: ChartKind;
  hasMultipleSeries?: boolean;
  settings: ChartWidgetSettings;
  defaultSettings?: Partial<ChartWidgetSettings>;
  onChange: (next: ChartWidgetSettings) => void;
  size?: ChartWidgetSize;
  onSizeChange?: (nextSize: ChartWidgetSize) => void;
}

export default function ChartSettingsPopover({
  isOpen,
  onClose,
  anchorRef,
  chartKind,
  hasMultipleSeries = false,
  settings,
  defaultSettings,
  onChange,
  size,
  onSizeChange
}: ChartSettingsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; right: number }>({ top: 40, right: 16 });

  const updatePosition = useCallback(() => {
    if (!anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const popoverWidth = 320; // w-80 é 320px
    const spacing = 8;

    let top = rect.bottom + spacing;
    const estimatedHeight = Math.min(window.innerHeight * 0.82, 540);

    // Se transbordar na parte inferior e houver espaço acima, abre para cima
    if (top + estimatedHeight > window.innerHeight && rect.top > estimatedHeight + spacing) {
      top = Math.max(16, rect.top - estimatedHeight - spacing);
    } else if (top + estimatedHeight > window.innerHeight) {
      top = Math.max(16, window.innerHeight - estimatedHeight - 16);
    }

    let right = window.innerWidth - rect.right;
    if (right < 16) right = 16;
    if (window.innerWidth - right < popoverWidth + 16) {
      right = Math.max(16, window.innerWidth - popoverWidth - 16);
    }

    setCoords({ top, right });
  }, [anchorRef]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        (!anchorRef?.current || !anchorRef.current.contains(target))
      ) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, onClose, updatePosition, anchorRef]);

  if (!isOpen || typeof document === "undefined") return null;

  const currentDisplayType: ChartDisplayType =
    settings.chartType || (chartKind === "bar" ? "bar" : chartKind === "line" ? "line" : "area");

  const supportsDisplayType = chartKind === "line" || chartKind === "area" || chartKind === "bar" || chartKind === "composed";
  const isLineOrArea = currentDisplayType === "line" || currentDisplayType === "area" || chartKind === "line" || chartKind === "area";
  const supportsColor = chartKind !== "pie" && chartKind !== "kpi";
  const supportsGrid = chartKind !== "pie" && chartKind !== "kpi";
  const supportsLabels = chartKind !== "kpi";
  const supportsLegend = hasMultipleSeries || chartKind === "pie";

  const updateField = <K extends keyof ChartWidgetSettings>(key: K, value: ChartWidgetSettings[K]) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  const handleRestoreDefault = () => {
    onChange({
      ...DEFAULT_CHART_WIDGET_SETTINGS,
      ...defaultSettings
    });
  };

  return createPortal(
    <div
      ref={popoverRef}
      style={{
        position: "fixed",
        top: `${coords.top}px`,
        right: `${coords.right}px`
      }}
      className="z-[9999] w-80 max-h-[82vh] overflow-y-auto rounded-2xl bg-[var(--cupertino-card)] backdrop-blur-2xl border border-[var(--cupertino-border)] shadow-[var(--cupertino-shadow)] p-4 text-xs text-slate-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5">
        <span className="font-semibold text-slate-100 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#0A84FF]" />
          Personalizar Gráfico
        </span>
        <button
          type="button"
          onClick={handleRestoreDefault}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-400 transition hover:bg-white/10 hover:text-white cursor-pointer"
          title="Restaurar padrão deste gráfico"
        >
          <RotateCcw className="h-3 w-3" />
          Restaurar
        </button>
      </div>

      <div className="space-y-3.5">
        {/* 1. Tipo de Visualização (Modo) */}
        {supportsDisplayType && (
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-slate-400">Tipo de visualização</label>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-950/80 p-1 border border-white/5">
              {[
                { id: "area" as const, label: "Área (Copilot)" },
                { id: "line" as const, label: "Linha" },
                { id: "bar" as const, label: "Barras" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateField("chartType", opt.id)}
                  className={`rounded-md py-1.5 text-center text-[11px] font-semibold transition cursor-pointer ${
                    currentDisplayType === opt.id
                      ? "bg-[#0A84FF] text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. Cores Personalizadas */}
        {supportsColor && (
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-slate-400">Cor da série principal</label>
            <div className="flex flex-wrap items-center gap-1.5">
              {CHART_COLOR_PALETTE.map((swatch) => {
                const selected = (settings.color || "auto") === swatch.id;
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    onClick={() => updateField("color", swatch.id)}
                    title={swatch.label}
                    className={`relative flex h-6 w-6 items-center justify-center rounded-full border transition cursor-pointer ${
                      selected
                        ? "scale-110 border-white ring-2 ring-[#0A84FF] shadow-md"
                        : "border-slate-700/80 opacity-80 hover:opacity-100 hover:scale-105"
                    }`}
                    style={{ background: swatch.hex }}
                  >
                    {selected && <Check className="h-3 w-3 text-white drop-shadow stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Estilo e Espessura da Curva (quando não for barra) */}
        {isLineOrArea && currentDisplayType !== "bar" && (
          <>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-slate-400">Estilo da curva</label>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-950/80 p-1 border border-white/5">
                {(
                  [
                    { id: "monotone" as const, label: "Suave" },
                    { id: "linear" as const, label: "Linear" },
                    { id: "step" as const, label: "Degrau" }
                  ]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateField("curveType", opt.id)}
                    className={`rounded-md py-1.5 text-center text-[11px] font-semibold transition cursor-pointer ${
                      settings.curveType === opt.id
                        ? "bg-[#0A84FF] text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-slate-400">Espessura da linha</label>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-950/80 p-1 border border-white/5">
                {(
                  [
                    { width: 1.5, label: "Fina" },
                    { width: 2.5, label: "Média" },
                    { width: 3.5, label: "Espessa" }
                  ]
                ).map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => updateField("strokeWidth", opt.width)}
                    className={`rounded-md py-1.5 text-center text-[11px] font-semibold transition cursor-pointer ${
                      settings.strokeWidth === opt.width
                        ? "bg-[#0A84FF] text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 4. Altura do Gráfico */}
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-slate-400">Altura do gráfico</label>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-950/80 p-1 border border-white/5">
            {[
              { id: "compact" as const, label: "Compacto" },
              { id: "normal" as const, label: "Padrão" },
              { id: "tall" as const, label: "Expandido" }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateField("height", opt.id)}
                className={`rounded-md py-1.5 text-center text-[11px] font-semibold transition cursor-pointer ${
                  (settings.height || "normal") === opt.id
                    ? "bg-[#0A84FF] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Largura no Dashboard (1/2 vs 1/1) */}
        {size && onSizeChange && (
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-slate-400">Largura no Dashboard</label>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-950/80 p-1 border border-white/5">
              <button
                type="button"
                onClick={() => onSizeChange("half")}
                className={`rounded-md py-1.5 text-center text-[11px] font-semibold transition cursor-pointer ${
                  size === "half"
                    ? "bg-[#0A84FF] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                Meia tela (1/2)
              </button>
              <button
                type="button"
                onClick={() => onSizeChange("full")}
                className={`rounded-md py-1.5 text-center text-[11px] font-semibold transition cursor-pointer ${
                  size === "full"
                    ? "bg-[#0A84FF] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                Tela cheia (1/1)
              </button>
            </div>
          </div>
        )}

        {/* 6. Opções Visuais & Switches */}
        <div className="space-y-1.5 border-t border-white/10 pt-2.5">
          {isLineOrArea && currentDisplayType !== "bar" && (
            <>
              <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/5 transition">
                <span className="text-slate-300">Degradê suave (Copilot)</span>
                <input
                  type="checkbox"
                  checked={settings.fillArea}
                  onChange={(e) => updateField("fillArea", e.target.checked)}
                  className="h-4 w-4 rounded accent-[#0A84FF] cursor-pointer"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/5 transition">
                <span className="text-slate-300">Pontos visíveis na linha</span>
                <input
                  type="checkbox"
                  checked={settings.showDots}
                  onChange={(e) => updateField("showDots", e.target.checked)}
                  className="h-4 w-4 rounded accent-[#0A84FF] cursor-pointer"
                />
              </label>
            </>
          )}

          {supportsGrid && (
            <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/5 transition">
              <span className="text-slate-300">Linhas de grade</span>
              <input
                type="checkbox"
                checked={settings.showGrid}
                onChange={(e) => updateField("showGrid", e.target.checked)}
                className="h-4 w-4 rounded accent-[#0A84FF] cursor-pointer"
              />
            </label>
          )}

          {supportsLegend && (
            <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/5 transition">
              <span className="text-slate-300">Exibir legenda</span>
              <input
                type="checkbox"
                checked={settings.showLegend}
                onChange={(e) => updateField("showLegend", e.target.checked)}
                className="h-4 w-4 rounded accent-[#0A84FF] cursor-pointer"
              />
            </label>
          )}

          {supportsLabels && (
            <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/5 transition">
              <span className="text-slate-300">Rótulos de dados</span>
              <input
                type="checkbox"
                checked={settings.showDataLabels}
                onChange={(e) => updateField("showDataLabels", e.target.checked)}
                className="h-4 w-4 rounded accent-[#0A84FF] cursor-pointer"
              />
            </label>
          )}

          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-400">Tratamento de valores zero</label>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-950/80 p-1 border border-white/5">
              <button
                type="button"
                onClick={() => updateField("zeroHandling", "include")}
                className={`rounded-md py-1 text-center text-[11px] font-semibold transition cursor-pointer ${
                  settings.zeroHandling === "include"
                    ? "bg-[#0A84FF] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                Considerar 0
              </button>
              <button
                type="button"
                onClick={() => updateField("zeroHandling", "omit")}
                className={`rounded-md py-1 text-center text-[11px] font-semibold transition cursor-pointer ${
                  settings.zeroHandling === "omit"
                    ? "bg-[#0A84FF] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                Omitir 0
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
