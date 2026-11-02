"use client";

import React, { useState, useRef } from "react";
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
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onMoveToTop?: () => void;
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
  const gearButtonRef = useRef<HTMLButtonElement | null>(null);

  const spanClass =
    size === "full"
      ? "col-span-12"
      : size === "third"
      ? "col-span-12 lg:col-span-4"
      : size === "two-thirds"
      ? "col-span-12 lg:col-span-8"
      : "col-span-12 lg:col-span-6";

  const sizeLabel =
    size === "third" ? "1/3" : size === "two-thirds" ? "2/3" : size === "full" ? "1/1" : "1/2";

  const handleToggleSize = () => {
    let nextSize: ChartWidgetSize = "half";
    if (size === "half") nextSize = "full";
    else if (size === "full") nextSize = "half";
    else if (size === "third") nextSize = "half";
    else if (size === "two-thirds") nextSize = "full";
    onSizeChange(nextSize);
  };

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
      className={`${spanClass} min-w-0 overflow-hidden relative rounded-2xl border cupertino-card-hover h-full flex flex-col justify-between ${
        isDropTarget
          ? "border-[#0A84FF] ring-2 ring-[#0A84FF] shadow-sm"
          : "border-slate-800/80"
      } ${isDragging ? " scale-[0.99] opacity-60" : "opacity-100"} ${
        popoverOpen ? "z-[80] overflow-visible" : "z-10 focus-within:z-[80]"
      } bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-semibold tracking-[-0.02em] text-slate-100 whitespace-nowrap overflow-hidden text-ellipsis">
              {title}
            </h3>
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {headerExtra}

          {/* Grupo de controles no canto superior direito: 1. GripVertical, 2. Tamanho real, 3. Engrenagem */}
          <div className="relative flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/70 p-1">
            {/* 1. Ícone de Mover (arraste nativo com mouse/touch) */}
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

            {/* 2. Controle de Proporção de Largura com rótulo real (1/3, 1/2, 2/3 ou 1/1) */}
            <button
              type="button"
              onClick={handleToggleSize}
              title={`Alternar proporção do card (atual: ${sizeLabel})`}
              className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-mono font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white cursor-pointer"
            >
              {size === "full" ? (
                <RectangleHorizontal className="h-3.5 w-3.5 text-[#0A84FF]" />
              ) : (
                <Columns2 className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span>{sizeLabel}</span>
            </button>

            {/* 3. Engrenagem (Configurações deste gráfico) */}
            {chartKind !== "kpi" && (
              <button
                ref={gearButtonRef}
                type="button"
                onClick={() => setPopoverOpen((prev) => !prev)}
                title="Personalizar este gráfico"
                className={`rounded p-1 transition cursor-pointer ${
                  popoverOpen
                    ? "bg-[#0A84FF] text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Settings className="h-4 w-4" />
              </button>
            )}

            <ChartSettingsPopover
              isOpen={popoverOpen}
              onClose={() => setPopoverOpen(false)}
              anchorRef={gearButtonRef}
              chartKind={chartKind}
              hasMultipleSeries={hasMultipleSeries}
              settings={settings}
              defaultSettings={defaultSettings}
              onChange={onSettingsChange}
              size={size}
              onSizeChange={onSizeChange}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">{children}</div>
    </div>
  );
}
