"use client";

import React, { useState } from "react";
import { GripVertical, Settings, Columns2, RectangleHorizontal } from "lucide-react";
import ChartSettingsPopover, {
  ChartKind,
  ChartWidgetSettings,
  ChartWidgetSize
} from "./ChartSettingsPopover";

interface ChartCardProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  chartKind: ChartKind;
  hasMultipleSeries?: boolean;
  size: ChartWidgetSize;
  onSizeChange: (nextSize: ChartWidgetSize) => void;
  settings: ChartWidgetSettings;
  defaultSettings?: Partial<ChartWidgetSettings>;
  onSettingsChange: (nextSettings: ChartWidgetSettings) => void;
  onDragStartCard: (id: string) => void;
  onDragEnterCard: (id: string) => void;
  onDragEndCard: () => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
  headerExtra?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export default function ChartCard({
  id,
  title,
  subtitle,
  icon,
  chartKind,
  hasMultipleSeries = false,
  size,
  onSizeChange,
  settings,
  defaultSettings,
  onSettingsChange,
  onDragStartCard,
  onDragEnterCard,
  onDragEndCard,
  isDragging = false,
  isDropTarget = false,
  headerExtra,
  className = "",
  children
}: ChartCardProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [canDrag, setCanDrag] = useState(false);

  const spanClass = size === "full" ? "col-span-12" : "col-span-12 lg:col-span-6";

  return (
    <div
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
        onDragStartCard(id);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        onDragEnterCard(id);
      }}
      onDragEnd={() => {
        setCanDrag(false);
        onDragEndCard();
      }}
      onDrop={(e) => {
        e.preventDefault();
        setCanDrag(false);
        onDragEndCard();
      }}
      className={`${spanClass} relative rounded-2xl border transition-all duration-200 ${
        isDropTarget
          ? "border-indigo-500 ring-2 ring-indigo-500/40"
          : "border-slate-800/80"
      } ${isDragging ? " scale-[0.99] opacity-60" : "opacity-100"} bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="truncate text-sm font-semibold text-slate-100">{title}</h3>
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-1.5">
          {headerExtra}

          {/* Grupo de controles na ordem estrita: 1. Mover, 2. Tamanho, 3. Engrenagem */}
          <div className="relative flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/70 p-1">
            {/* 1. Ícone de Mover (único ponto que inicia o arraste) */}
            <button
              type="button"
              onMouseDown={() => setCanDrag(true)}
              onMouseUp={() => setCanDrag(false)}
              onTouchStart={() => setCanDrag(true)}
              onTouchEnd={() => setCanDrag(false)}
              title="Arraste para reordenar este card"
              className="cursor-grab rounded p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </button>

            {/* 2. Controle de Tamanho (Meia largura vs Largura total) */}
            <button
              type="button"
              onClick={() => onSizeChange(size === "half" ? "full" : "half")}
              title={size === "half" ? "Expandir para largura total" : "Reduzir para meia largura"}
              className="hidden items-center gap-1 rounded px-1.5 py-1 text-[11px] font-medium text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 lg:inline-flex"
            >
              {size === "half" ? (
                <>
                  <Columns2 className="h-3.5 w-3.5" />
                  <span>1/2</span>
                </>
              ) : (
                <>
                  <RectangleHorizontal className="h-3.5 w-3.5" />
                  <span>1/1</span>
                </>
              )}
            </button>

            {/* 3. Engrenagem (Configurações por gráfico) */}
            {chartKind !== "kpi" && (
              <button
                type="button"
                onClick={() => setPopoverOpen((prev) => !prev)}
                title="Configurações deste gráfico"
                className={`rounded p-1 transition ${
                  popoverOpen
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Settings className="h-4 w-4" />
              </button>
            )}

            <ChartSettingsPopover
              isOpen={popoverOpen}
              onClose={() => setPopoverOpen(false)}
              chartKind={chartKind}
              hasMultipleSeries={hasMultipleSeries}
              settings={settings}
              defaultSettings={defaultSettings}
              onChange={onSettingsChange}
            />
          </div>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}