"use client";

import React, { useEffect, useRef } from "react";
import { RotateCcw, Check } from "lucide-react";

export type ChartLineCurve = "monotone" | "linear" | "step";
export type ChartKind = "line" | "area" | "bar" | "pie" | "composed" | "kpi";
export type ChartZeroHandling = "include" | "omit";
export type ChartWidgetSize = "half" | "full";

export interface ChartWidgetSettings {
  color: string;
  curveType: ChartLineCurve;
  strokeWidth: number;
  showDots: boolean;
  fillArea: boolean;
  zeroHandling: ChartZeroHandling;
  showDataLabels: boolean;
  showGrid: boolean;
  showLegend: boolean;
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
  showLegend: true
};

export const CHART_COLOR_PALETTE: ReadonlyArray<{ id: string; label: string; hex: string }> = [
  { id: "auto", label: "Automática", hex: "linear-gradient(135deg,#6366f1,#10b981)" },
  { id: "#6366f1", label: "Índigo", hex: "#6366f1" },
  { id: "#10b981", label: "Esmeralda", hex: "#10b981" },
  { id: "#06b6d4", label: "Ciano", hex: "#06b6d4" },
  { id: "#f59e0b", label: "Âmbar", hex: "#f59e0b" },
  { id: "#ec4899", label: "Rosa", hex: "#ec4899" },
  { id: "#8b5cf6", label: "Violeta", hex: "#8b5cf6" },
  { id: "#ef4444", label: "Vermelho", hex: "#ef4444" }
];

interface ChartSettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  chartKind: ChartKind;
  hasMultipleSeries?: boolean;
  settings: ChartWidgetSettings;
  defaultSettings?: Partial<ChartWidgetSettings>;
  onChange: (next: ChartWidgetSettings) => void;
}

export default function ChartSettingsPopover({
  isOpen,
  onClose,
  chartKind,
  hasMultipleSeries = false,
  settings,
  defaultSettings,
  onChange
}: ChartSettingsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    function handleMouseDown(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLineOrArea = chartKind === "line" || chartKind === "area" || chartKind === "composed";
  const supportsColor = chartKind !== "pie" && chartKind !== "kpi";
  const supportsGrid = chartKind === "line" || chartKind === "area" || chartKind === "bar" || chartKind === "composed";
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

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-slate-700/80 bg-slate-900/95 p-3.5 text-xs text-slate-200 shadow-2xl backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2.5 flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-semibold text-slate-100">Opções do gráfico</span>
        <button
          type="button"
          onClick={handleRestoreDefault}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          title="Restaurar padrão deste gráfico"
        >
          <RotateCcw className="h-3 w-3" />
          Restaurar padrão
        </button>
      </div>

      <div className="space-y-3">
        {supportsColor && (
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-slate-400">Cor da série</label>
            <div className="flex flex-wrap items-center gap-1.5">
              {CHART_COLOR_PALETTE.map((swatch) => {
                const selected = settings.color === swatch.id;
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    onClick={() => updateField("color", swatch.id)}
                    title={swatch.label}
                    className={`relative flex h-6 w-6 items-center justify-center rounded-full border transition ${
                      selected
                        ? "scale-110 border-white ring-2 ring-indigo-500/50"
                        : "border-slate-700 opacity-80 hover:opacity-100"
                    }`}
                    style={{ background: swatch.hex }}
                  >
                    {selected && <Check className="h-3 w-3 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isLineOrArea && (
          <>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-400">Estilo da linha</label>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-950/80 p-1">
                {(
                  [
                    { id: "monotone", label: "Suave" },
                    { id: "linear", label: "Linear" },
                    { id: "step", label: "Degrau" }
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateField("curveType", opt.id)}
                    className={`rounded-md py-1 text-center text-[11px] font-medium transition ${
                      settings.curveType === opt.id
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-400">Espessura</label>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-950/80 p-1">
                {(
                  [
                    { width: 1.5, label: "Fina" },
                    { width: 2.5, label: "Média" },
                    { width: 3.5, label: "Espessa" }
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => updateField("strokeWidth", opt.width)}
                    className={`rounded-md py-1 text-center text-[11px] font-medium transition ${
                      settings.strokeWidth === opt.width
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-400">Valores zero</label>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-950/80 p-1">
                <button
                  type="button"
                  onClick={() => updateField("zeroHandling", "include")}
                  className={`rounded-md py-1 text-center text-[11px] font-medium transition ${
                    settings.zeroHandling === "include"
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Considerar 0
                </button>
                <button
                  type="button"
                  onClick={() => updateField("zeroHandling", "omit")}
                  className={`rounded-md py-1 text-center text-[11px] font-medium transition ${
                    settings.zeroHandling === "omit"
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Omitir 0
                </button>
              </div>
            </div>

            <div className="space-y-1.5 pt-0.5">
              <label className="flex cursor-pointer items-center justify-between rounded-md px-1 py-1 hover:bg-slate-800/50">
                <span className="text-slate-300">Pontos visíveis</span>
                <input
                  type="checkbox"
                  checked={settings.showDots}
                  onChange={(e) => updateField("showDots", e.target.checked)}
                  className="h-3.5 w-3.5 accent-indigo-500"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-md px-1 py-1 hover:bg-slate-800/50">
                <span className="text-slate-300">Área preenchida (gradiente)</span>
                <input
                  type="checkbox"
                  checked={settings.fillArea}
                  onChange={(e) => updateField("fillArea", e.target.checked)}
                  className="h-3.5 w-3.5 accent-indigo-500"
                />
              </label>
            </div>
          </>
        )}

        <div className="space-y-1.5 border-t border-slate-800/80 pt-2">
          {supportsLabels && (
            <label className="flex cursor-pointer items-center justify-between rounded-md px-1 py-1 hover:bg-slate-800/50">
              <span className="text-slate-300">Rótulos de dados</span>
              <input
                type="checkbox"
                checked={settings.showDataLabels}
                onChange={(e) => updateField("showDataLabels", e.target.checked)}
                className="h-3.5 w-3.5 accent-indigo-500"
              />
            </label>
          )}

          {supportsGrid && (
            <label className="flex cursor-pointer items-center justify-between rounded-md px-1 py-1 hover:bg-slate-800/50">
              <span className="text-slate-300">Linhas de grade</span>
              <input
                type="checkbox"
                checked={settings.showGrid}
                onChange={(e) => updateField("showGrid", e.target.checked)}
                className="h-3.5 w-3.5 accent-indigo-500"
              />
            </label>
          )}

          {supportsLegend && (
            <label className="flex cursor-pointer items-center justify-between rounded-md px-1 py-1 hover:bg-slate-800/50">
              <span className="text-slate-300">Exibir legenda</span>
              <input
                type="checkbox"
                checked={settings.showLegend}
                onChange={(e) => updateField("showLegend", e.target.checked)}
                className="h-3.5 w-3.5 accent-indigo-500"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}