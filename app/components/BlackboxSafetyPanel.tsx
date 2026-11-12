"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Download,
  RotateCcw,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  SafetySnapshotItem,
  getImmutableSafetySnapshots,
  saveImmutableSafetySnapshot,
  downloadSafetySnapshotJson,
  downloadCurrentStateJson
} from "../lib/domain/user-storage";
import { COINDEX_APP_VERSION } from "../lifeos-data";

export interface BlackboxSafetyPanelProps {
  currentUserId?: string | null;
  currentStatePayload: Record<string, unknown>;
  onRestoreSnapshot?: (snapshot: SafetySnapshotItem) => void | Promise<void>;
  notify?: (title: string, message?: string, type?: "info" | "success" | "warning" | "error", category?: any) => void;
  compact?: boolean;
}

export function BlackboxSafetyPanel({
  currentUserId,
  currentStatePayload,
  onRestoreSnapshot,
  notify,
  compact = false
}: BlackboxSafetyPanelProps) {
  const [snapshots, setSnapshots] = useState<SafetySnapshotItem[]>([]);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);

  const refreshSnapshots = useCallback(() => {
    if (!currentUserId) {
      setSnapshots([]);
      return;
    }
    const list = getImmutableSafetySnapshots(currentUserId);
    setSnapshots(list);
  }, [currentUserId]);

  useEffect(() => {
    refreshSnapshots();
  }, [refreshSnapshots]);

  const handleDownloadFullBackup = () => {
    try {
      downloadCurrentStateJson(currentStatePayload, "coindex_backup_completo");
      notify?.(
        "💾 Backup Baixado com Sucesso!",
        "Arquivo .JSON completo com 100% dos seus dados gravado no seu computador.",
        "success",
        "CONFIG"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao exportar";
      notify?.("Erro no Download", msg, "error", "CONFIG");
    }
  };

  const handleCreateManualSnapshot = () => {
    if (!currentUserId) return;
    setIsCreatingManual(true);
    try {
      const snap = saveImmutableSafetySnapshot(
        currentUserId,
        currentStatePayload,
        "Snapshot Manual do Usuário",
        COINDEX_APP_VERSION
      );
      if (snap) {
        refreshSnapshots();
        notify?.(
          "🛡️ Snapshot Criado!",
          "Ponto de recuperação salvo na Caixa-Preta local.",
          "success",
          "CONFIG"
        );
      }
    } finally {
      setIsCreatingManual(false);
    }
  };

  const handleRestore = async (snap: SafetySnapshotItem) => {
    if (!onRestoreSnapshot) return;
    const confirm = window.confirm(
      `Deseja realmente restaurar o ponto de segurança "${snap.reason}" de ${snap.displayDate}?\n\nEle contém ${snap.txCount} lançamentos e substituirá o estado em tela.`
    );
    if (!confirm) return;

    setRestoringId(snap.id);
    try {
      await onRestoreSnapshot(snap);
      notify?.(
        "⏪ Ponto Restaurado com Sucesso!",
        `O estado da Caixa-Preta de ${snap.displayDate} foi carregado em memória.`,
        "success",
        "CONFIG"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha na restauração";
      notify?.("Erro ao Restaurar", msg, "error", "CONFIG");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900/70 border border-emerald-500/20 space-y-4 shadow-xl">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-white text-xs sm:text-sm font-extrabold flex items-center gap-2">
              🛡️ Caixa-Preta & Backups de Segurança Automáticos
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] border border-emerald-500/30 font-bold uppercase tracking-wider">
                Imutável
              </span>
            </h3>
            <p className="text-slate-400 text-[10px] sm:text-[11px] leading-tight">
              Snapshots locais rotativos dos últimos 10 estados da sua conta, protegidos contra exclusão e perda de dados.
            </p>
          </div>
        </div>

        {compact && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-3 animate-fade-in">
          {/* Botões de Ação Imediata */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadFullBackup}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              <Download className="w-3.5 h-3.5" />
              💾 Baixar Backup Completo (.JSON) Agora
            </button>

            <button
              type="button"
              onClick={handleCreateManualSnapshot}
              disabled={isCreatingManual}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {isCreatingManual ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
              )}
              Criar Snapshot Manual
            </button>
          </div>

          {/* Lista dos Últimos 10 Snapshots da Caixa-Preta */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Pontos de Recuperação Automáticos ({snapshots.length}/10):
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Protegido contra reset
              </span>
            </div>

            {snapshots.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-slate-400 text-xs">
                Nenhum snapshot automático gerado ainda. O sistema salva automaticamente ao abrir, sincronizar ou atualizar a versão.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                {snapshots.map((snap, idx) => (
                  <div
                    key={snap.id || idx}
                    className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 flex flex-wrap items-center justify-between gap-2.5 transition"
                  >
                    <div className="space-y-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="text-white text-xs font-bold truncate max-w-[280px]">
                          {snap.reason}
                        </span>
                        <span className="text-slate-400 text-[10px] font-mono">
                          {snap.displayDate}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span className="text-emerald-400 font-semibold">{snap.txCount} lançamentos</span>
                        <span>•</span>
                        <span>{snap.cardsCount} cartões</span>
                        <span>•</span>
                        <span>{snap.banksCount} bancos</span>
                        <span>•</span>
                        <span className="text-slate-500">v{snap.version}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onRestoreSnapshot && (
                        <button
                          type="button"
                          onClick={() => void handleRestore(snap)}
                          disabled={restoringId === snap.id}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer border border-indigo-500/30 disabled:opacity-50"
                          title="Restaura os dados deste ponto para a tela"
                        >
                          {restoringId === snap.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          ⏪ Restaurar
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => downloadSafetySnapshotJson(snap)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer border border-white/5"
                        title="Baixar arquivo JSON deste snapshot"
                      >
                        <FileJson className="w-3 h-3 text-emerald-400" />
                        📥 Baixar .JSON
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
