"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  Edit3,
  Plus,
  RefreshCw,
  Sparkles,
  Undo2,
  Users,
  X
} from "lucide-react";
import SpotifyLogo from "./SpotifyLogo";
import {
  SpotifyPagamento,
  SpotifyPessoa,
  deleteSpotifyPagamentoMes,
  fetchSpotifyFamilyData,
  getLocalCurrentYearMonth,
  saveSpotifyPessoa,
  setSpotifyPessoaAtiva,
  updateSpotifyPlanoTotal,
  upsertSpotifyPagamentosBatch
} from "../lib/services/spotify-supabase";

const MONTH_LABELS: ReadonlyArray<{ num: number; short: string; full: string }> = [
  { num: 1, short: "Jan", full: "Janeiro" },
  { num: 2, short: "Fev", full: "Fevereiro" },
  { num: 3, short: "Mar", full: "Março" },
  { num: 4, short: "Abr", full: "Abril" },
  { num: 5, short: "Mai", full: "Maio" },
  { num: 6, short: "Jun", full: "Junho" },
  { num: 7, short: "Jul", full: "Julho" },
  { num: 8, short: "Ago", full: "Agosto" },
  { num: 9, short: "Set", full: "Setembro" },
  { num: 10, short: "Out", full: "Outubro" },
  { num: 11, short: "Nov", full: "Novembro" },
  { num: 12, short: "Dez", full: "Dezembro" }
];

type CellStatus = "PAGO" | "PENDENTE" | "ATRASADO" | "FUTURO" | "NAO_APLICAVEL";

interface UndoAction {
  description: string;
  pessoaId: string;
  mes: string;
  wasPaid: boolean;
  previousPayment?: SpotifyPagamento;
}

interface SpotifyModuleProps {
  ownerDisplayName?: string;
}

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function formatBRL(value: number): string {
  return brlFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatDateBR(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export default function SpotifyModule({ ownerDisplayName = "Sabrino" }: SpotifyModuleProps) {
  const localNow = useMemo(() => getLocalCurrentYearMonth(), []);
  const [selectedYear, setSelectedYear] = useState<number>(localNow.year);

  const [loading, setLoading] = useState<boolean>(true);
  const [schemaReady, setSchemaReady] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [totalMensal, setTotalMensal] = useState<number>(40.9);
  const [pessoas, setPessoas] = useState<SpotifyPessoa[]>([]);
  const [pagamentos, setPagamentos] = useState<SpotifyPagamento[]>([]);
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Edição do valor mensal do plano
  const [editingPlan, setEditingPlan] = useState<boolean>(false);
  const [planInput, setPlanInput] = useState<string>("40.90");
  const [recalcQuotasOnSave, setRecalcQuotasOnSave] = useState<boolean>(true);

  // Feedback de Desfazer e Copiar
  const [undoStack, setUndoStack] = useState<UndoAction | null>(null);
  const [copiedPersonId, setCopiedPersonId] = useState<string | null>(null);

  // Modal "Registrar pagamento" em lote
  const [batchModalPerson, setBatchModalPerson] = useState<SpotifyPessoa | null>(null);
  const [batchSelectedMonths, setBatchSelectedMonths] = useState<Record<string, boolean>>({});
  const [batchCustomValues, setBatchCustomValues] = useState<Record<string, string>>({});
  const [batchSaving, setBatchSaving] = useState<boolean>(false);

  // Modal Adicionar / Editar pessoa
  const [personModalOpen, setPersonModalOpen] = useState<boolean>(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [personName, setPersonName] = useState<string>("");
  const [personQuota, setPersonQuota] = useState<string>("");
  const [personStart, setPersonStart] = useState<string>("");
  const [personTitular, setPersonTitular] = useState<boolean>(false);
  const [personAutoPay, setPersonAutoPay] = useState<boolean>(false);
  const [personSaving, setPersonSaving] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    const snapshot = await fetchSpotifyFamilyData(ownerDisplayName);
    setSchemaReady(snapshot.schemaReady);
    if (snapshot.error) {
      setErrorMsg(snapshot.error);
    }
    setTotalMensal(snapshot.plano.totalMensal);
    setPlanInput(snapshot.plano.totalMensal.toFixed(2));
    setPessoas(snapshot.pessoas);
    setPagamentos(snapshot.pagamentos);
    setLoading(false);

    // Sincroniza automaticamente cotas de quem tem "pagaAutomatico" para meses até o atual
    if (snapshot.schemaReady && snapshot.pessoas.length > 0) {
      const currentYm = getLocalCurrentYearMonth().ym;
      const existingKeys = new Set(snapshot.pagamentos.map((p) => `${p.pessoaId}__${p.mes}`));
      const autoBatch: Array<{ pessoaId: string; mes: string; valor: number }> = [];

      for (const p of snapshot.pessoas) {
        if (!p.ativa || !p.pagaAutomatico) continue;
        for (let m = 1; m <= 12; m++) {
          const ym = `${selectedYear}-${String(m).padStart(2, "0")}`;
          if (ym > currentYm) continue;
          if (p.inicio && ym < p.inicio) continue;
          if (!existingKeys.has(`${p.id}__${ym}`)) {
            autoBatch.push({ pessoaId: p.id, mes: ym, valor: p.cota });
          }
        }
      }

      if (autoBatch.length > 0) {
        const res = await upsertSpotifyPagamentosBatch(autoBatch);
        if (res.ok && res.data) {
          setPagamentos((prev) => {
            const map = new Map(prev.map((item) => [`${item.pessoaId}__${item.mes}`, item]));
            for (const item of res.data ?? []) {
              map.set(`${item.pessoaId}__${item.mes}`, item);
            }
            return Array.from(map.values());
          });
        }
      }
    }
  }, [ownerDisplayName, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Mapa rápido de pagamentos por "pessoaId__AAAA-MM"
  const paymentMap = useMemo(() => {
    const map = new Map<string, SpotifyPagamento>();
    for (const p of pagamentos) {
      map.set(`${p.pessoaId}__${p.mes}`, p);
    }
    return map;
  }, [pagamentos]);

  const getMonthStatus = useCallback(
    (pessoa: SpotifyPessoa, ym: string): { status: CellStatus; payment?: SpotifyPagamento } => {
      const existing = paymentMap.get(`${pessoa.id}__${ym}`);
      if (existing) {
        return { status: "PAGO", payment: existing };
      }
      if (pessoa.inicio && ym < pessoa.inicio) {
        return { status: "NAO_APLICAVEL" };
      }
      if (pessoa.pagaAutomatico && ym <= localNow.ym) {
        return {
          status: "PAGO",
          payment: {
            id: `auto-${pessoa.id}-${ym}`,
            userId: pessoa.userId,
            pessoaId: pessoa.id,
            mes: ym,
            valor: pessoa.cota,
            pagoEm: localNow.todayIso
          }
        };
      }
      if (ym < localNow.ym) {
        return { status: "ATRASADO" };
      }
      if (ym === localNow.ym) {
        return { status: "PENDENTE" };
      }
      return { status: "FUTURO" };
    },
    [paymentMap, localNow]
  );

  // Estatísticas por pessoa e resumo anual
  const peopleWithStats = useMemo(() => {
    const filtered = pessoas.filter((p) => (showArchived ? true : p.ativa));

    const enriched = filtered.map((pessoa) => {
      let paidYear = 0;
      let expectedYear = 0;
      let overdueAmount = 0;
      let pendingAmount = 0;
      const overdueMonths: Array<{ ym: string; label: string }> = [];
      const pendingMonths: Array<{ ym: string; label: string }> = [];

      for (const m of MONTH_LABELS) {
        const ym = `${selectedYear}-${String(m.num).padStart(2, "0")}`;
        const { status, payment } = getMonthStatus(pessoa, ym);

        if (status === "NAO_APLICAVEL") continue;

        if (status === "PAGO") {
          const val = payment ? payment.valor : pessoa.cota;
          paidYear += val;
          expectedYear += val;
        } else {
          expectedYear += pessoa.cota;
          if (status === "ATRASADO") {
            overdueAmount += pessoa.cota;
            overdueMonths.push({ ym, label: `${m.short}/${selectedYear}` });
          } else if (status === "PENDENTE") {
            pendingAmount += pessoa.cota;
            pendingMonths.push({ ym, label: `${m.short}/${selectedYear}` });
          }
        }
      }

      const remainingYear = Math.max(0, expectedYear - paidYear);

      return {
        pessoa,
        paidYear,
        expectedYear,
        remainingYear,
        overdueAmount,
        pendingAmount,
        overdueMonths,
        pendingMonths
      };
    });

    // Ordenação: 1º quem tem atrasado (maior valor), 2º quem tem pendente, 3º titular/nome
    enriched.sort((a, b) => {
      if (a.overdueAmount !== b.overdueAmount) {
        return b.overdueAmount - a.overdueAmount;
      }
      if (a.pendingAmount !== b.pendingAmount) {
        return b.pendingAmount - a.pendingAmount;
      }
      if (a.pessoa.titular !== b.pessoa.titular) {
        return a.pessoa.titular ? -1 : 1;
      }
      return a.pessoa.nome.localeCompare(b.pessoa.nome, "pt-BR");
    });

    return enriched;
  }, [pessoas, showArchived, selectedYear, getMonthStatus]);

  const yearSummary = useMemo(() => {
    let totalPago = 0;
    let totalEsperado = 0;
    let totalAtrasado = 0;
    let totalPendente = 0;

    for (const item of peopleWithStats) {
      if (!item.pessoa.ativa) continue;
      totalPago += item.paidYear;
      totalEsperado += item.expectedYear;
      totalAtrasado += item.overdueAmount;
      totalPendente += item.pendingAmount;
    }

    const percentual = totalEsperado > 0 ? Math.min(100, (totalPago / totalEsperado) * 100) : 0;

    return {
      totalPago,
      totalEsperado,
      totalAtrasado,
      totalPendente,
      percentual
    };
  }, [peopleWithStats]);

  // Alternar um mês individualmente com atualização otimista
  const handleToggleMonthChip = async (pessoa: SpotifyPessoa, ym: string, label: string) => {
    setErrorMsg(null);
    const current = getMonthStatus(pessoa, ym);
    const wasPaid = current.status === "PAGO";
    const previousSnapshot = [...pagamentos];

    if (wasPaid) {
      setPagamentos((prev) => prev.filter((p) => !(p.pessoaId === pessoa.id && p.mes === ym)));
      setUndoStack({
        description: `Pagamento de ${pessoa.nome} (${label}) desmarcado.`,
        pessoaId: pessoa.id,
        mes: ym,
        wasPaid: true,
        previousPayment: current.payment
      });

      const res = await deleteSpotifyPagamentoMes(pessoa.id, ym);
      if (!res.ok) {
        setPagamentos(previousSnapshot);
        setUndoStack(null);
        setErrorMsg(`Falha ao desmarcar ${label}: ${res.error ?? "Erro de conexão"}`);
      }
    } else {
      const optimisticPayment: SpotifyPagamento = {
        id: `temp-${pessoa.id}-${ym}`,
        userId: pessoa.userId,
        pessoaId: pessoa.id,
        mes: ym,
        valor: pessoa.cota,
        pagoEm: localNow.todayIso
      };

      setPagamentos((prev) => [
        ...prev.filter((p) => !(p.pessoaId === pessoa.id && p.mes === ym)),
        optimisticPayment
      ]);
      setUndoStack({
        description: `Mês ${label} de ${pessoa.nome} marcado como pago (${formatBRL(pessoa.cota)}).`,
        pessoaId: pessoa.id,
        mes: ym,
        wasPaid: false
      });

      const res = await upsertSpotifyPagamentosBatch([
        { pessoaId: pessoa.id, mes: ym, valor: pessoa.cota, pagoEm: localNow.todayIso }
      ]);

      if (!res.ok) {
        setPagamentos(previousSnapshot);
        setUndoStack(null);
        setErrorMsg(`Não foi possível salvar o pagamento de ${label}: ${res.error ?? "Erro"}`);
      } else if (res.data && res.data[0]) {
        const saved = res.data[0];
        setPagamentos((prev) =>
          prev.map((p) => (p.pessoaId === pessoa.id && p.mes === ym ? saved : p))
        );
      }
    }
  };

  const handleUndoLastAction = async () => {
    if (!undoStack) return;
    const action = undoStack;
    setUndoStack(null);

    if (action.wasPaid && action.previousPayment) {
      const res = await upsertSpotifyPagamentosBatch([
        {
          pessoaId: action.pessoaId,
          mes: action.mes,
          valor: action.previousPayment.valor,
          pagoEm: action.previousPayment.pagoEm
        }
      ]);
      if (res.ok && res.data && res.data[0]) {
        setPagamentos((prev) => [...prev, res.data![0]]);
      }
    } else {
      setPagamentos((prev) =>
        prev.filter((p) => !(p.pessoaId === action.pessoaId && p.mes === action.mes))
      );
      await deleteSpotifyPagamentoMes(action.pessoaId, action.mes);
    }
  };

  // Abrir modal "Registrar pagamento" com meses atrasados + atual pré-selecionados
  const openBatchPaymentModal = (pessoa: SpotifyPessoa) => {
    const initialSelected: Record<string, boolean> = {};
    const initialValues: Record<string, string> = {};

    for (const m of MONTH_LABELS) {
      const ym = `${selectedYear}-${String(m.num).padStart(2, "0")}`;
      const { status, payment } = getMonthStatus(pessoa, ym);
      if (status === "NAO_APLICAVEL") continue;

      initialValues[ym] = (payment ? payment.valor : pessoa.cota).toFixed(2);
      if (status === "ATRASADO" || status === "PENDENTE") {
        initialSelected[ym] = true;
      } else {
        initialSelected[ym] = false;
      }
    }

    setBatchModalPerson(pessoa);
    setBatchSelectedMonths(initialSelected);
    setBatchCustomValues(initialValues);
  };

  const batchTotalSelected = useMemo(() => {
    if (!batchModalPerson) return 0;
    let sum = 0;
    for (const [ym, isSelected] of Object.entries(batchSelectedMonths)) {
      if (!isSelected) continue;
      const parsed = parseFloat((batchCustomValues[ym] ?? "0").replace(",", "."));
      if (Number.isFinite(parsed) && parsed >= 0) {
        sum += parsed;
      }
    }
    return sum;
  }, [batchModalPerson, batchSelectedMonths, batchCustomValues]);

  const handleConfirmBatchPayment = async () => {
    if (!batchModalPerson) return;
    const itemsToSave: Array<{ pessoaId: string; mes: string; valor: number; pagoEm: string }> = [];

    for (const [ym, isSelected] of Object.entries(batchSelectedMonths)) {
      if (!isSelected) continue;
      const val = parseFloat((batchCustomValues[ym] ?? String(batchModalPerson.cota)).replace(",", "."));
      itemsToSave.push({
        pessoaId: batchModalPerson.id,
        mes: ym,
        valor: Number.isFinite(val) && val >= 0 ? val : batchModalPerson.cota,
        pagoEm: localNow.todayIso
      });
    }

    if (itemsToSave.length === 0) {
      setBatchModalPerson(null);
      return;
    }

    setBatchSaving(true);
    const previousSnapshot = [...pagamentos];

    // Atualização otimista imediata
    const optimisticList: SpotifyPagamento[] = itemsToSave.map((it) => ({
      id: `batch-${it.pessoaId}-${it.mes}`,
      userId: batchModalPerson.userId,
      pessoaId: it.pessoaId,
      mes: it.mes,
      valor: it.valor,
      pagoEm: it.pagoEm
    }));

    setPagamentos((prev) => {
      const map = new Map(prev.map((p) => [`${p.pessoaId}__${p.mes}`, p]));
      for (const opt of optimisticList) {
        map.set(`${opt.pessoaId}__${opt.mes}`, opt);
      }
      return Array.from(map.values());
    });

    const res = await upsertSpotifyPagamentosBatch(itemsToSave);
    setBatchSaving(false);

    if (!res.ok) {
      setPagamentos(previousSnapshot);
      setErrorMsg(`Erro ao registrar lote de pagamentos: ${res.error ?? "Falha no banco"}`);
      return;
    }

    if (res.data) {
      setPagamentos((prev) => {
        const map = new Map(prev.map((p) => [`${p.pessoaId}__${p.mes}`, p]));
        for (const saved of res.data ?? []) {
          map.set(`${saved.pessoaId}__${saved.mes}`, saved);
        }
        return Array.from(map.values());
      });
    }

    setBatchModalPerson(null);
  };

  // Salvar novo valor total mensal do plano
  const handleSavePlanTotal = async () => {
    const parsed = parseFloat(planInput.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) return;

    const activeIds = pessoas.filter((p) => p.ativa).map((p) => p.id);
    const prevTotal = totalMensal;
    const prevPessoas = [...pessoas];

    setTotalMensal(parsed);
    if (recalcQuotasOnSave && activeIds.length > 0) {
      const newQuota = Math.round((parsed / activeIds.length) * 100) / 100;
      setPessoas((prev) =>
        prev.map((p) => (p.ativa ? { ...p, cota: newQuota } : p))
      );
    }
    setEditingPlan(false);

    const res = await updateSpotifyPlanoTotal(parsed, recalcQuotasOnSave, activeIds);
    if (!res.ok) {
      setTotalMensal(prevTotal);
      setPessoas(prevPessoas);
      setErrorMsg(`Erro ao atualizar plano: ${res.error ?? "Falha"}`);
    }
  };

  // Abrir modal para criar ou editar participante
  const openEditPersonModal = (pessoa?: SpotifyPessoa) => {
    if (pessoa) {
      setEditingPersonId(pessoa.id);
      setPersonName(pessoa.nome);
      setPersonQuota(pessoa.cota.toFixed(2));
      setPersonStart(pessoa.inicio ?? "");
      setPersonTitular(pessoa.titular);
      setPersonAutoPay(pessoa.pagaAutomatico);
    } else {
      const defaultQuota = Math.round((totalMensal / 6) * 100) / 100;
      setEditingPersonId(null);
      setPersonName("");
      setPersonQuota(defaultQuota.toFixed(2));
      setPersonStart(`${selectedYear}-01`);
      setPersonTitular(false);
      setPersonAutoPay(false);
    }
    setPersonModalOpen(true);
  };

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;
    const quotaNum = parseFloat(personQuota.replace(",", "."));
    if (!Number.isFinite(quotaNum) || quotaNum < 0) return;

    setPersonSaving(true);
    const res = await saveSpotifyPessoa({
      id: editingPersonId ?? undefined,
      nome: personName.trim(),
      cota: quotaNum,
      inicio: personStart.trim() !== "" ? personStart.trim() : null,
      titular: personTitular,
      pagaAutomatico: personAutoPay,
      ativa: true
    });
    setPersonSaving(false);

    if (!res.ok || !res.pessoa) {
      setErrorMsg(res.error ?? "Erro ao salvar participante.");
      return;
    }

    const saved = res.pessoa;
    setPessoas((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved];
    });
    setPersonModalOpen(false);
  };

  const handleToggleArchivePerson = async (pessoa: SpotifyPessoa) => {
    const nextAtiva = !pessoa.ativa;
    setPessoas((prev) => prev.map((p) => (p.id === pessoa.id ? { ...p, ativa: nextAtiva } : p)));
    const res = await setSpotifyPessoaAtiva(pessoa.id, nextAtiva);
    if (!res.ok) {
      setPessoas((prev) => prev.map((p) => (p.id === pessoa.id ? { ...p, ativa: pessoa.ativa } : p)));
      setErrorMsg(`Falha ao alterar status de ${pessoa.nome}: ${res.error ?? "Erro"}`);
    }
  };

  // Botão "Cobrar" — copia mensagem formatada em pt-BR
  const handleCopyChargeMessage = async (
    pessoa: SpotifyPessoa,
    overdueMonths: Array<{ ym: string; label: string }>,
    pendingMonths: Array<{ ym: string; label: string }>,
    totalOpen: number
  ) => {
    const allOpen = [...overdueMonths, ...pendingMonths];
    const monthsList =
      allOpen.length > 0
        ? allOpen.map((m) => m.label).join(", ")
        : `cota mensal (${selectedYear})`;
    const amountToCharge = totalOpen > 0 ? totalOpen : pessoa.cota;

    const message = `Oi, ${pessoa.nome}! Tudo bem? Passando para lembrar da cota do nosso Spotify Família referente a ${monthsList} (${formatBRL(
      pessoa.cota
    )}/mês), totalizando ${formatBRL(amountToCharge)}. Quando puder me enviar, me avisa para eu dar baixa aqui. Valeu!`;

    try {
      await navigator.clipboard.writeText(message);
      setCopiedPersonId(pessoa.id);
      setTimeout(() => {
        setCopiedPersonId((prev) => (prev === pessoa.id ? null : prev));
      }, 2500);
    } catch {
      setErrorMsg("Não foi possível copiar automaticamente para a área de transferência.");
    }
  };

  if (!schemaReady) {
    return (
      <div className="rounded-2xl border border-amber-500/40 bg-slate-900/80 p-8 text-slate-200 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-amber-500/20 p-3 text-amber-400">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">
              Tabelas do módulo Spotify ainda não encontradas no Supabase
            </h2>
            <p className="text-sm text-slate-300">
              Para usar o controle do Plano Família Spotify, execute o arquivo de migração SQL abaixo no{" "}
              <strong className="text-white">SQL Editor</strong> do seu projeto Supabase:
            </p>
            <code className="block rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-emerald-400">
              supabase/migrations/20261024231500_dashboard_and_spotify.sql
            </code>
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
            >
              <RefreshCw className="h-4 w-4" />
              Já executei o SQL, recarregar agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo Spotify */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800/90 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm lg:flex-row lg:items-center">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1DB954]/15 ring-1 ring-[#1DB954]/40">
            <SpotifyLogo size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Spotify Família</h2>
              <span className="rounded-full bg-[#1DB954]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#1DB954]">
                {pessoas.filter((p) => p.ativa).length} participantes ativos
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Controle anual de cotas, repasses mensais e pendências em tempo real
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Valor total mensal do plano */}
          {editingPlan ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 p-2">
              <span className="text-xs text-slate-400">Plano R$:</span>
              <input
                type="number"
                step="0.01"
                value={planInput}
                onChange={(e) => setPlanInput(e.target.value)}
                className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
              />
              <label className="flex items-center gap-1 text-[11px] text-slate-300">
                <input
                  type="checkbox"
                  checked={recalcQuotasOnSave}
                  onChange={(e) => setRecalcQuotasOnSave(e.target.checked)}
                  className="accent-[#1DB954]"
                />
                Dividir igual
              </label>
              <button
                type="button"
                onClick={handleSavePlanTotal}
                className="rounded-lg bg-[#1DB954] px-2.5 py-1 text-xs font-semibold text-slate-950 hover:opacity-90"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setEditingPlan(false)}
                className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setPlanInput(totalMensal.toFixed(2));
                setEditingPlan(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs text-slate-200 transition hover:border-slate-700"
              title="Clique para editar o valor total mensal do plano"
            >
              <DollarSign className="h-3.5 w-3.5 text-[#1DB954]" />
              <span>
                Plano mensal: <strong className="text-white">{formatBRL(totalMensal)}</strong>
              </span>
              <Edit3 className="h-3 w-3 text-slate-400" />
            </button>
          )}

          {/* Seletor de Ano */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950/80 p-1">
            <button
              type="button"
              onClick={() => setSelectedYear((y) => y - 1)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              title="Ano anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3 text-xs font-bold text-white">
              <Calendar className="h-3.5 w-3.5 text-[#1DB954]" />
              <span>{selectedYear}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedYear((y) => y + 1)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              title="Próximo ano"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Adicionar Participante */}
          <button
            type="button"
            onClick={() => openEditPersonModal()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1DB954] px-3.5 py-2 text-xs font-bold text-slate-950 shadow transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Adicionar pessoa
          </button>
        </div>
      </div>

      {/* Alertas de Erro ou Desfazer */}
      {errorMsg && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {undoStack && (
        <div className="flex items-center justify-between rounded-xl border border-indigo-500/40 bg-indigo-950/40 px-4 py-2.5 text-xs text-indigo-200">
          <span>{undoStack.description}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndoLastAction}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 font-semibold text-white hover:bg-indigo-500"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Desfazer
            </button>
            <button
              type="button"
              onClick={() => setUndoStack(null)}
              className="p-1 text-indigo-300 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Topo: Resumo do Ano */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400">Total arrecadado ({selectedYear})</span>
          <p className="mt-1 text-xl font-bold text-emerald-400">
            {formatBRL(yearSummary.totalPago)}
          </p>
          <span className="mt-1 block text-[11px] text-slate-500">
            Pagamentos confirmados no ano
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400">Total esperado ({selectedYear})</span>
          <p className="mt-1 text-xl font-bold text-slate-100">
            {formatBRL(yearSummary.totalEsperado)}
          </p>
          <span className="mt-1 block text-[11px] text-slate-500">
            Soma anual das cotas ativas
          </span>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4">
          <span className="text-xs text-rose-300">Em aberto — Atrasado</span>
          <p className="mt-1 text-xl font-bold text-rose-400">
            {formatBRL(yearSummary.totalAtrasado)}
          </p>
          <span className="mt-1 block text-[11px] text-rose-300/70">
            Meses anteriores sem baixa
          </span>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
          <span className="text-xs text-amber-300">Em aberto — Pendente</span>
          <p className="mt-1 text-xl font-bold text-amber-400">
            {formatBRL(yearSummary.totalPendente)}
          </p>
          <span className="mt-1 block text-[11px] text-amber-300/70">
            Mês atual aguardando repasse
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>% Arrecadado</span>
            <span className="font-bold text-[#1DB954]">
              {yearSummary.percentual.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-[#1DB954] transition-all duration-300"
              style={{ width: `${yearSummary.percentual}%` }}
            />
          </div>
          <span className="mt-2 block text-[11px] text-slate-500">
            Faltam {formatBRL(Math.max(0, yearSummary.totalEsperado - yearSummary.totalPago))} no ano
          </span>
        </div>
      </div>

      {/* Filtro de arquivados e legenda de estados */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Pago
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Pendente (mês atual)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Atrasado (mês anterior)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-700" /> Futuro (clicável p/ adiantar)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowArchived((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700"
        >
          <Users className="h-3.5 w-3.5" />
          {showArchived ? "Ocultar arquivados" : "Mostrar arquivados"}
        </button>
      </div>

      {/* 2. Lista de Cards por Pessoa (com pendências no topo) */}
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-10 text-center text-sm text-slate-400">
          Carregando participantes e pagamentos do Spotify...
        </div>
      ) : (
        <div className="space-y-4">
          {peopleWithStats.map(
            ({
              pessoa,
              paidYear,
              expectedYear,
              remainingYear,
              overdueAmount,
              pendingAmount,
              overdueMonths,
              pendingMonths
            }) => {
              const hasOverdue = overdueMonths.length > 0;
              const hasPending = pendingMonths.length > 0;
              const totalOpenNow = overdueAmount + pendingAmount;

              return (
                <div
                  key={pessoa.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    !pessoa.ativa
                      ? "border-slate-800/50 bg-slate-950/40 opacity-60"
                      : hasOverdue
                      ? "border-rose-500/50 bg-slate-900/80 shadow-lg shadow-rose-950/20"
                      : hasPending
                      ? "border-amber-500/40 bg-slate-900/75"
                      : "border-slate-800/80 bg-slate-900/60"
                  }`}
                >
                  {/* Topo do Card da Pessoa */}
                  <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white">{pessoa.nome}</h3>

                      {pessoa.titular && (
                        <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
                          Titular
                        </span>
                      )}

                      {pessoa.pagaAutomatico && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                          <Sparkles className="h-3 w-3" />
                          Baixa automática
                        </span>
                      )}

                      {!pessoa.ativa && (
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                          Arquivado
                        </span>
                      )}

                      <span className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-0.5 text-xs text-slate-300">
                        Cota: <strong className="text-white">{formatBRL(pessoa.cota)}</strong>/mês
                      </span>

                      {pessoa.inicio && (
                        <span className="text-[11px] text-slate-400">
                          Início: {pessoa.inicio}
                        </span>
                      )}

                      {/* 3. Destaques de Atraso (Vermelho) e Pendência (Âmbar) */}
                      {hasOverdue && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-semibold text-rose-300 ring-1 ring-rose-500/40">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {overdueMonths.length}{" "}
                          {overdueMonths.length === 1 ? "mês atrasado" : "meses atrasados"} (
                          {formatBRL(overdueAmount)})
                        </span>
                      )}

                      {hasPending && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/40">
                          <Clock className="h-3.5 w-3.5" />
                          Mês atual pendente ({formatBRL(pendingAmount)})
                        </span>
                      )}
                    </div>

                    {/* Ações da Pessoa */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* 4. Fluxo principal: Registrar pagamento em lote */}
                      <button
                        type="button"
                        onClick={() => openBatchPaymentModal(pessoa)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#1DB954] px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:brightness-110"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Registrar pagamento
                      </button>

                      {/* 6. Botão Cobrar */}
                      {!pessoa.titular && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyChargeMessage(
                              pessoa,
                              overdueMonths,
                              pendingMonths,
                              totalOpenNow
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
                          title="Copiar mensagem pronta de cobrança em português"
                        >
                          {copiedPersonId === pessoa.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-slate-400" />
                              <span>Cobrar</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openEditPersonModal(pessoa)}
                        className="rounded-lg border border-slate-800 bg-slate-950 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                        title="Editar participante"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleArchivePerson(pessoa)}
                        className="rounded-lg border border-slate-800 bg-slate-950 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                        title={pessoa.ativa ? "Arquivar participante" : "Reativar participante"}
                      >
                        {pessoa.ativa ? (
                          <Archive className="h-3.5 w-3.5" />
                        ) : (
                          <ArchiveRestore className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Grade de 12 Meses (Chips clicáveis) */}
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
                    {MONTH_LABELS.map((m) => {
                      const ym = `${selectedYear}-${String(m.num).padStart(2, "0")}`;
                      const { status, payment } = getMonthStatus(pessoa, ym);

                      if (status === "NAO_APLICAVEL") {
                        return (
                          <div
                            key={ym}
                            title={`Mês anterior ao início (${pessoa.inicio})`}
                            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800/60 bg-slate-950/30 px-2 py-2.5 text-center opacity-45"
                          >
                            <span className="text-[11px] font-medium text-slate-500">
                              {m.short}
                            </span>
                            <span className="mt-1 text-[10px] text-slate-600">—</span>
                          </div>
                        );
                      }

                      const chipStyles: Record<Exclude<CellStatus, "NAO_APLICAVEL">, string> = {
                        PAGO: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25",
                        PENDENTE:
                          "border-amber-500/50 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25",
                        ATRASADO:
                          "border-rose-500/50 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25",
                        FUTURO:
                          "border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      };

                      const amountDisplay = payment ? payment.valor : pessoa.cota;

                      return (
                        <button
                          key={ym}
                          type="button"
                          onClick={() =>
                            handleToggleMonthChip(pessoa, ym, `${m.short}/${selectedYear}`)
                          }
                          title={
                            status === "PAGO" && payment
                              ? `Pago em ${formatDateBR(payment.pagoEm)} (${formatBRL(
                                  payment.valor
                                )}) — Clique para desmarcar`
                              : `Clique para marcar ${m.full}/${selectedYear} como pago`
                          }
                          className={`flex flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-center transition ${chipStyles[status]}`}
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold">{m.short}</span>
                            {status === "PAGO" && <Check className="h-3 w-3 text-emerald-400" />}
                          </div>
                          <span className="mt-1 text-[10px] font-medium opacity-90">
                            {formatBRL(amountDisplay)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Rodapé do Card: Total Pago no Ano vs Quanto Falta */}
                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/70 pt-3 text-xs text-slate-400">
                    <div>
                      Total pago em {selectedYear}:{" "}
                      <strong className="text-emerald-400">{formatBRL(paidYear)}</strong> de{" "}
                      <span className="text-slate-300">{formatBRL(expectedYear)}</span>
                    </div>
                    <div>
                      Falta no ano:{" "}
                      <strong className={remainingYear > 0 ? "text-amber-300" : "text-slate-300"}>
                        {formatBRL(remainingYear)}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* Modal 4: Registrar Pagamento em Lote (Meses em aberto já marcados) */}
      {batchModalPerson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setBatchModalPerson(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Registrar pagamento — {batchModalPerson.nome}
                </h3>
                <p className="text-xs text-slate-400">
                  Os meses atrasados e o mês atual já estão marcados. Confirme para gravar de uma só vez.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBatchModalPerson(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {MONTH_LABELS.map((m) => {
                const ym = `${selectedYear}-${String(m.num).padStart(2, "0")}`;
                const { status } = getMonthStatus(batchModalPerson, ym);
                if (status === "NAO_APLICAVEL") return null;

                const checked = Boolean(batchSelectedMonths[ym]);

                return (
                  <div
                    key={ym}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs ${
                      checked
                        ? "border-[#1DB954]/50 bg-[#1DB954]/10"
                        : "border-slate-800 bg-slate-950/60"
                    }`}
                  >
                    <label className="flex flex-1 cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setBatchSelectedMonths((prev) => ({
                            ...prev,
                            [ym]: e.target.checked
                          }))
                        }
                        className="h-4 w-4 accent-[#1DB954]"
                      />
                      <span className="font-semibold text-white">
                        {m.full} / {selectedYear}
                      </span>
                      {status === "ATRASADO" && (
                        <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">
                          Atrasado
                        </span>
                      )}
                      {status === "PENDENTE" && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                          Mês atual
                        </span>
                      )}
                      {status === "PAGO" && (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                          Já pago
                        </span>
                      )}
                    </label>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={batchCustomValues[ym] ?? batchModalPerson.cota.toFixed(2)}
                        onChange={(e) =>
                          setBatchCustomValues((prev) => ({
                            ...prev,
                            [ym]: e.target.value
                          }))
                        }
                        className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-right text-xs text-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
              <div>
                <span className="text-xs text-slate-400">Total selecionado:</span>
                <p className="text-lg font-bold text-[#1DB954]">
                  {formatBRL(batchTotalSelected)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBatchModalPerson(null)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={batchSaving}
                  onClick={handleConfirmBatchPayment}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1DB954] px-4 py-2 text-xs font-bold text-slate-950 transition hover:brightness-110 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {batchSaving ? "Gravando..." : "Confirmar pagamento"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Adicionar / Editar Participante */}
      {personModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setPersonModalOpen(false)}
        >
          <form
            onSubmit={handleSavePerson}
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingPersonId ? "Editar participante" : "Novo participante no plano"}
              </h3>
              <button
                type="button"
                onClick={() => setPersonModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-300">Nome</label>
                <input
                  type="text"
                  required
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Ex.: Maria"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-300">Cota mensal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={personQuota}
                    onChange={(e) => setPersonQuota(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-300">
                    Mês de início (opcional)
                  </label>
                  <input
                    type="month"
                    value={personStart}
                    onChange={(e) => setPersonStart(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5">
                <span>É o titular da assinatura</span>
                <input
                  type="checkbox"
                  checked={personTitular}
                  onChange={(e) => setPersonTitular(e.target.checked)}
                  className="h-4 w-4 accent-[#1DB954]"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5">
                <span>Cota paga automaticamente a cada mês</span>
                <input
                  type="checkbox"
                  checked={personAutoPay}
                  onChange={(e) => setPersonAutoPay(e.target.checked)}
                  className="h-4 w-4 accent-[#1DB954]"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setPersonModalOpen(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={personSaving}
                className="rounded-xl bg-[#1DB954] px-4 py-2 text-xs font-bold text-slate-950 hover:brightness-110 disabled:opacity-50"
              >
                {personSaving ? "Salvando..." : "Salvar participante"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}