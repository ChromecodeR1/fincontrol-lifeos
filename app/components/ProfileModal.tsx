"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, UserCheck, Upload, Trash2, Camera, Check } from "lucide-react";
import { AvatarCropModal } from "./AvatarCropModal";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string | null;
  currentUserAvatar: string;
  onSaveProfile: (newNickname: string, newAvatar: string) => void;
  onExportBackup?: () => void;
  onImportBackup?: (file: File, mode: "merge" | "replace") => void;
  onSeedPatrimonio?: () => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  currentUserAvatar,
  onSaveProfile
}: ProfileModalProps) {
  const [nickname, setNickname] = useState(currentUser || "");
  const [avatar, setAvatar] = useState(currentUserAvatar || "");
  const [isSaving, setIsSaving] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNickname(currentUser || "");
      setAvatar(currentUserAvatar || "");
      setIsSaving(false);
      setCropImageSrc(null);
      setIsCropModalOpen(false);
    }
  }, [isOpen, currentUser, currentUserAvatar]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCropImageSrc(result);
          setIsCropModalOpen(true);
        }
      };
      reader.readAsDataURL(file);
      // Reset input value so re-selecting same file works
      e.target.value = "";
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    const finalNickname = nickname.trim() || currentUser || "Usuário";
    onSaveProfile(finalNickname, avatar);
    setIsSaving(false);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 w-screen h-dvh z-[9999] bg-black/65 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
      <div className="relative w-full max-w-md max-h-[86dvh] overflow-y-auto rounded-2xl bg-[var(--cupertino-card)] border border-[var(--cupertino-border)] shadow-2xl p-6 space-y-6 text-xs custom-scrollbar my-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#0A84FF]" /> Perfil do Usuário
            </h3>
            <p className="text-[11px] text-slate-400">
              Personalize sua foto de exibição e seu nome no FinControl LifeOS.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pré-visualização do Avatar com Recorte Circular Integrado */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-2 border-[#0A84FF]/40 bg-slate-900 overflow-hidden flex items-center justify-center shadow-xl shadow-[#0A84FF]/20">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Prévia do Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCheck className="w-10 h-10 text-[#0A84FF]" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 cursor-pointer"
              title="Trocar Foto"
            >
              <Camera className="w-6 h-6 mb-1 text-[#0A84FF]" />
              <span className="text-[10px] font-bold">Alterar</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-[#0A84FF]/20 hover:bg-[#0A84FF]/30 text-[#0A84FF] border border-[#0A84FF]/40 font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" /> Escolher e Recortar Foto
            </button>
            {avatar && (
              <button
                type="button"
                onClick={() => setAvatar("")}
                className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remover Foto
              </button>
            )}
          </div>
        </div>

        {/* Inputs de Nickname e Link */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 block">
              Nome de Exibição (Nickname)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ex: Sabrino, Lucas, etc."
              maxLength={40}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-[#0A84FF] transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 block">
              Ou Link Direto da Imagem (URL)
            </label>
            <input
              type="url"
              value={avatar.startsWith("data:") ? "" : avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://exemplo.com/minha-foto.png"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-[#0A84FF] transition"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#0A84FF] hover:bg-[#0070E0] text-white font-medium shadow-sm flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Salvar Perfil
          </button>
        </div>
      </div>

      {/* Modal de Recorte Circular */}
      <AvatarCropModal
        isOpen={isCropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => {
          setIsCropModalOpen(false);
          setCropImageSrc(null);
        }}
        onCropComplete={(croppedBase64) => {
          setAvatar(croppedBase64);
        }}
      />
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
