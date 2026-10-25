"use client";

import React, { useState, useEffect } from "react";
import {
  User, Lock, Eye, EyeOff, ShieldCheck, Loader2, AlertTriangle,
  CheckCircle2, Sparkles, Database, KeyRound, ArrowRight
} from "lucide-react";
import { CoindexLogoHorizontal } from "./CoindexLogo";
import { validatePasswordRules, sanitizeText } from "../lifeos-data";

interface CoindexAuthScreenProps {
  hasOwner: boolean;
  ownerUsername: string | null;
  sheetsConfigured: boolean;
  cloudError: string | null;
  initialSheetUrl?: string;
  onAuthenticated: (user: { username: string; avatarUrl?: string }, customSheetUrl?: string) => void;
}

export default function CoindexAuthScreen({
  hasOwner,
  ownerUsername,
  cloudError,
  onAuthenticated
}: CoindexAuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">(hasOwner ? "login" : "register");
  const [username, setUsername] = useState(ownerUsername || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (hasOwner) {
      setMode("login");
      if (ownerUsername) setUsername(ownerUsername);
    } else {
      setMode("register");
    }
  }, [hasOwner, ownerUsername]);

  const pwdRules = validatePasswordRules(password) as any;
  const hasLetters = Boolean(pwdRules.hasLetter || pwdRules.hasLower || pwdRules.hasUpper);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanUser = sanitizeText(username);
    if (!cleanUser || !password) {
      setErrorMsg("Preencha o nome de usuário e a senha para continuar.");
      return;
    }

    if (mode === "register" && !pwdRules.minLength) {
      setErrorMsg("Por segurança, sua senha deve conter no mínimo 8 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          username: cleanUser,
          password,
          rememberMe
        })
      });

      const data = await res.json();
      if (!res.ok || data.status === "error") {
        setErrorMsg(data.message || "Não foi possível autenticar. Verifique suas credenciais.");
        return;
      }

      onAuthenticated({
        username: data.user.username,
        avatarUrl: data.user.avatarUrl || ""
      });
    } catch (err: any) {
      setErrorMsg(`Erro de conexão com o servidor: ${err?.message || "Tente novamente."}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 grid grid-cols-1 lg:grid-cols-12 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-36 -left-36 w-[420px] h-[420px] rounded-full bg-indigo-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-emerald-500/15 blur-[140px]" />

      {/* Coluna Esquerda: Identidade Visual Coindex */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 xl:p-16 border-r border-white/[0.07] bg-gradient-to-br from-slate-950/95 via-[#070b16] to-indigo-950/25 relative z-10">
        <div className="flex items-center justify-between">
          <CoindexLogoHorizontal size="lg" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
            <Database className="w-3.5 h-3.5 text-emerald-400" /> Supabase PostgreSQL + RLS
          </span>
        </div>

        <div className="space-y-8 max-w-xl">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Arquitetura Single-Owner • Supabase Auth + Row Level Security
            </span>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Inteligência financeira pessoal e controle patrimonial em tempo real.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              O <strong className="text-slate-200">Coindex</strong> armazena seu fluxo de caixa, cartões, caixinhas, valores a receber, telemetria automotiva e metas em um banco PostgreSQL dedicado com isolamento por linha (RLS).
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.07] backdrop-blur-md space-y-1">
              <span className="text-[11px] font-mono uppercase text-indigo-400 block">Banco Relacional</span>
              <strong className="text-xs text-white block">Supabase PostgreSQL</strong>
              <p className="text-[11px] text-slate-400">Sincronização instantânea em qualquer dispositivo.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.07] backdrop-blur-md space-y-1">
              <span className="text-[11px] font-mono uppercase text-emerald-400 block">Segurança RLS</span>
              <strong className="text-xs text-white block">Cofre Blindado</strong>
              <p className="text-[11px] text-slate-400">Apenas o proprietário autenticado acessa os registros.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.07] backdrop-blur-md space-y-1">
              <span className="text-[11px] font-mono uppercase text-cyan-400 block">Sessão Contínua</span>
              <strong className="text-xs text-white block">Auto-Refresh JWT</strong>
              <p className="text-[11px] text-slate-400">Middleware renova sua sessão sem pedir login toda vez.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/[0.06] pt-6">
          <span>Coindex Financial OS • Uso Pessoal Exclusivo</span>
          <span className="font-mono text-slate-400">Vercel + Supabase Cloud</span>
        </div>
      </div>

      {/* Coluna Direita: Card de Login */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-10 relative z-10">
        <div className="w-full max-w-md rounded-3xl bg-slate-900/85 border border-white/[0.09] backdrop-blur-2xl p-8 shadow-2xl space-y-6">
          <div className="space-y-3">
            <div className="lg:hidden mb-2">
              <CoindexLogoHorizontal size="md" />
            </div>

            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                hasOwner
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
              }`}>
                {hasOwner ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Cofre Proprietário Ativo
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Primeiro Acesso (Supabase)
                  </>
                )}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {mode === "login" ? "Bem-vindo de volta ao Coindex" : "Criar Conta Proprietária"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {mode === "login"
                  ? "Digite sua senha para desbloquear seu painel financeiro."
                  : "Cadastre seu usuário único no Supabase. Após criado, novos cadastros serão bloqueados."}
              </p>
            </div>
          </div>

          {cloudError && (
            <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{cloudError}</span>
            </div>
          )}

          {!hasOwner && (
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setMode("login"); setErrorMsg(""); }}
                className={`py-2 rounded-xl transition ${mode === "login" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
              >
                Já tenho conta
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setErrorMsg(""); }}
                className={`py-2 rounded-xl transition ${mode === "register" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
              >
                Primeiro Acesso
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Usuário Proprietário</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Ex: Sabrino"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Senha de Acesso</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder="Mínimo de 8 caracteres..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/90 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-white transition"
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "register" && password.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.07] space-y-1.5 text-[11px]">
                <span className="text-slate-400 font-semibold block">Requisitos de segurança:</span>
                <div className="flex flex-wrap gap-3">
                  <span className={pwdRules.minLength ? "text-emerald-400 font-semibold" : "text-slate-500"}>
                    {pwdRules.minLength ? "✓" : "○"} Mín. 8 caracteres
                  </span>
                  <span className={hasLetters ? "text-emerald-400 font-semibold" : "text-slate-500"}>
                    {hasLetters ? "✓" : "○"} Letras
                  </span>
                  <span className={pwdRules.hasNumber ? "text-emerald-400 font-semibold" : "text-slate-500"}>
                    {pwdRules.hasNumber ? "✓" : "○"} Números
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-0.5">
              <label className="inline-flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-slate-950 text-indigo-600 focus:ring-indigo-500/30"
                />
                <span>Manter sessão conectada neste dispositivo</span>
              </label>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-950/75 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-extrabold text-white shadow-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 ${
                mode === "login"
                  ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando no Supabase...</span>
                </>
              ) : mode === "login" ? (
                <>
                  <span>Desbloquear Painel Coindex</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Criar Conta no Supabase e Entrar</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}