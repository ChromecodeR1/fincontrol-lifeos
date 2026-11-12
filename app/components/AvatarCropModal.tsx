"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Camera, Move } from "lucide-react";

export interface AvatarCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
}

export function AvatarCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete
}: AvatarCropModalProps) {
  const [scale, setScale] = useState<number>(1.2);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // VIEWPORT CONSTANTS (240px x 240px circular visor)
  const VISOR_SIZE = 240;

  // Reset state when opening with a new image
  useEffect(() => {
    if (isOpen) {
      setScale(1.2);
      setPan({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen, imageSrc]);

  // Load natural image dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({
      width: img.naturalWidth || 400,
      height: img.naturalHeight || 400
    });
  };

  // Clamping function for panning based on zoom scale
  const clampPan = useCallback(
    (newX: number, newY: number, currentScale: number) => {
      if (!imgRef.current) return { x: newX, y: newY };
      
      // Calculate displayed dimensions of the image in the visor
      const imgAspect = naturalSize.width > 0 && naturalSize.height > 0
        ? naturalSize.width / naturalSize.height
        : 1;

      let baseW = VISOR_SIZE;
      let baseH = VISOR_SIZE;

      if (imgAspect >= 1) {
        baseH = VISOR_SIZE;
        baseW = VISOR_SIZE * imgAspect;
      } else {
        baseW = VISOR_SIZE;
        baseH = VISOR_SIZE / imgAspect;
      }

      const scaledW = baseW * currentScale;
      const scaledH = baseH * currentScale;

      const maxPanX = Math.max(0, (scaledW - VISOR_SIZE) / 2);
      const maxPanY = Math.max(0, (scaledH - VISOR_SIZE) / 2);

      return {
        x: Math.min(maxPanX, Math.max(-maxPanX, newX)),
        y: Math.min(maxPanY, Math.max(-maxPanY, newY))
      };
    },
    [naturalSize, VISOR_SIZE]
  );

  // Pointer event handlers for drag / pan
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const clamped = clampPan(newX, newY, scale);
    setPan(clamped);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const newScale = Math.min(3.0, Math.max(1.0, Number((scale + delta).toFixed(2))));
    setScale(newScale);
    setPan((prev) => clampPan(prev.x, prev.y, newScale));
  };

  const handleScaleChange = (newScale: number) => {
    const clampedScale = Math.min(3.0, Math.max(1.0, newScale));
    setScale(clampedScale);
    setPan((prev) => clampPan(prev.x, prev.y, clampedScale));
  };

  const handleReset = () => {
    setScale(1.2);
    setPan({ x: 0, y: 0 });
  };

  // Generate cropped image in high quality 256x256
  const handleConfirmCrop = () => {
    if (!imgRef.current || !naturalSize.width || !naturalSize.height) return;

    try {
      const OUTPUT_SIZE = 256;
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clean canvas
      ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      // Smooth interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Calculate rendered size relative to 240px visor
      const imgAspect = naturalSize.width / naturalSize.height;
      let baseW = VISOR_SIZE;
      let baseH = VISOR_SIZE;

      if (imgAspect >= 1) {
        baseH = VISOR_SIZE;
        baseW = VISOR_SIZE * imgAspect;
      } else {
        baseW = VISOR_SIZE;
        baseH = VISOR_SIZE / imgAspect;
      }

      const scaledW = baseW * scale;
      const scaledH = baseH * scale;

      // Ratio from visor to 256 canvas
      const ratio = OUTPUT_SIZE / VISOR_SIZE;

      const drawW = scaledW * ratio;
      const drawH = scaledH * ratio;
      const drawX = (OUTPUT_SIZE - drawW) / 2 + pan.x * ratio;
      const drawY = (OUTPUT_SIZE - drawH) / 2 + pan.y * ratio;

      // Draw the image
      ctx.drawImage(imgRef.current, drawX, drawY, drawW, drawH);

      // Convert to JPEG base64 (0.92 quality)
      const croppedBase64 = canvas.toDataURL("image/jpeg", 0.92);
      onCropComplete(croppedBase64);
      onClose();
    } catch (err) {
      console.error("[AvatarCropModal] Falha ao recortar imagem:", err);
    }
  };

  if (!isOpen || !imageSrc) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-slate-950/95 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30">
              <Camera className="w-4 h-4 text-[#0A84FF]" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Enquadrar Foto de Perfil
              </h3>
              <p className="text-[11px] text-slate-400">
                Arraste para posicionar e use o controle para dar zoom.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visor Area */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-900/40 relative select-none">
          {/* Circular Cropping Visor */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            className={`w-[240px] h-[240px] rounded-full overflow-hidden border-2 border-[#0A84FF] shadow-[0_0_35px_rgba(10,132,255,0.35)] relative touch-none select-none flex items-center justify-center ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{
              boxShadow: "0 0 0 9999px rgba(3, 7, 18, 0.75), 0 0 30px rgba(10, 132, 255, 0.4)"
            }}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Foto para recorte"
              onLoad={handleImageLoad}
              draggable={false}
              className="max-w-none pointer-events-none select-none transition-transform duration-75"
              style={{
                width: naturalSize.width >= naturalSize.height ? "auto" : `${VISOR_SIZE}px`,
                height: naturalSize.width >= naturalSize.height ? `${VISOR_SIZE}px` : "auto",
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                transformOrigin: "center center"
              }}
            />

            {/* Subtle Overlay Crosshair / Guide */}
            <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-full" />
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <Move className="w-3.5 h-3.5 text-[#0A84FF]" />
            <span>Arraste a foto para centralizar o rosto</span>
          </div>
        </div>

        {/* Controls */}
        <div className="p-5 space-y-4 border-t border-white/10 bg-slate-950">
          {/* Zoom Slider and Buttons */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <span>Nível de Zoom</span>
                <span className="text-[11px] font-mono text-[#0A84FF]">
                  ({scale.toFixed(2)}x)
                </span>
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" /> Resetar
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleScaleChange(scale - 0.1)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5 transition"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.05"
                value={scale}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                className="flex-1 accent-[#0A84FF] h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />

              <button
                type="button"
                onClick={() => handleScaleChange(scale + 0.1)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5 transition"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmCrop}
              className="px-4 py-2 rounded-xl bg-[#0A84FF] hover:bg-[#0070E0] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Salvar Foto de Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
