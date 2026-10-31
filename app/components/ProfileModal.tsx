"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, UserCheck, Upload, Trash2, Camera, Check, Download, ShieldCheck } from "lucide-react";
import { compressImageFileToBase64 } from "../lifeos-data";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string | null;
  currentUserAvatar: string;
  onSaveProfile: (newNickname: string, newAvatar: string) => void;
  onExportBackup?: () => void;
  onImportBackup?: (file: File) => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  currentUserAvatar,
  onSaveProfile,
  onExportBackup,
  onImportBackup
}: ProfileModalProps) {
  const [nickname, setNickname] = useState(currentUser || "");
  const [avatar, setAvatar] = useState(currentUserAvatar || "");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNickname(currentUser || "");
      setAvatar(currentUserAvatar || "");
      setIsSaving(false);
    }
  }, [isOpen, currentUser, currentUserAvatar]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImageFileToBase64(file, (b64) => {
        setAvatar(b64);
      });
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    const finalNickname = nickname.trim() || currentUser || "Usuário";
    onSaveProfile(finalNickname, avatar);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-950/95 border border-indigo-500/30 p-6 shadow-2xl space-y-6 text-xs animate-in fade-in zoom-in-95">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-400" /> Perfil do Usuário
            </h3>
            <p className="text-[11px] text-slate-400">
              Personalize sua foto de exibição e seu nome no FinControl LifeOS.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pré-visualização do Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-2 border-indigo-500/40 bg-slate-900 overflow-hidden flex items-center justify-center shadow-xl shadow-indigo-950/50">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Prévia do Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCheck className="w-10 h-10 text-indigo-400" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200"
              title="Trocar Foto"
            >
              <Camera className="w-6 h-6 mb-1" />
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
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold text-[11px] flex items-center gap-1.5 transition"
            >
              <Upload className="w-3.5 h-3.5" /> Enviar Nova Foto
            </button>
            {avatar && (
              <button
                type="button"
                onClick={() => setAvatar("")}
                className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-[11px] flex items-center gap-1.5 transition"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Seção de Portabilidade & Segurança de Dados (Backup) - Sprint 15 */}
        <div className="rounded-2xl p-4 bg-slate-900/60 border border-white/10 space-y-3">
          <div>
            <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Portabilidade & Segurança de Dados (Backup)
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Exporte todos os seus lançamentos, cartões, bancos e metas em formato JSON ou restaure um backup prévio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onExportBackup}
              className="min-h-[40px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>📥 Exportar Backup (.json)</span>
            </button>

            <button
              type="button"
              onClick={() => backupFileInputRef.current?.click()}
              className="min-h-[40px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Upload className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>📤 Restaurar Backup (.json)</span>
            </button>

            <input
              ref={backupFileInputRef}
              type="file"
              accept=".json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && onImportBackup) {
                  onImportBackup(f);
                }
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> Salvar Perfil
          </button>
        </div>
      </div>
    </div>
  );
}
