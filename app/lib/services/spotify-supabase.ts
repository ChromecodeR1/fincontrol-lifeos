import { createClient } from "../supabase/client";

export interface SpotifyPlano {
  userId: string;
  totalMensal: number;
}

export interface SpotifyPessoa {
  id: string;
  userId: string;
  nome: string;
  titular: boolean;
  cota: number;
  inicio: string | null; // "AAAA-MM" ou null
  ativa: boolean;
  pagaAutomatico: boolean;
}

export interface SpotifyPagamento {
  id: string;
  userId: string;
  pessoaId: string;
  mes: string; // "AAAA-MM"
  valor: number;
  pagoEm: string; // "AAAA-MM-DD"
}

export interface SpotifyDataSnapshot {
  schemaReady: boolean;
  plano: SpotifyPlano;
  pessoas: SpotifyPessoa[];
  pagamentos: SpotifyPagamento[];
  error?: string;
}

interface PlanoRow {
  user_id: string;
  total_mensal: number | string;
}

interface PessoaRow {
  id: string;
  user_id: string;
  nome: string;
  titular: boolean;
  cota: number | string;
  inicio: string | null;
  ativa: boolean;
  paga_automatico: boolean;
}

interface PagamentoRow {
  id: string;
  user_id: string;
  pessoa_id: string;
  mes: string;
  valor: number | string;
  pago_em: string;
}

const DEFAULT_TOTAL_MENSAL = 40.9;

function roundCurrency(val: number): number {
  return Math.round(val * 100) / 100;
}

function isMissingTableError(code?: string, message?: string): boolean {
  if (code === "42P01" || code === "PGRST205") return true;
  const msg = (message ?? "").toLowerCase();
  return (
    msg.includes("does not exist") ||
    msg.includes("schema cache") ||
    msg.includes("spotify_plano") ||
    msg.includes("spotify_pessoas")
  );
}

export function getLocalCurrentYearMonth(): { year: number; month: number; ym: string; todayIso: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const ym = `${year}-${String(month).padStart(2, "0")}`;
  const todayIso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { year, month, ym, todayIso };
}

export async function fetchSpotifyFamilyData(ownerDisplayName = "Titular"): Promise<SpotifyDataSnapshot> {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  if (!userId) {
    return {
      schemaReady: true,
      plano: { userId: "", totalMensal: DEFAULT_TOTAL_MENSAL },
      pessoas: [],
      pagamentos: [],
      error: "Sessão não autenticada."
    };
  }

  const [planoRes, pessoasRes, pagamentosRes] = await Promise.all([
    supabase.from("spotify_plano").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("spotify_pessoas").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
    supabase.from("spotify_pagamentos").select("*").eq("user_id", userId)
  ]);

  if (planoRes.error && isMissingTableError(planoRes.error.code, planoRes.error.message)) {
    return {
      schemaReady: false,
      plano: { userId, totalMensal: DEFAULT_TOTAL_MENSAL },
      pessoas: [],
      pagamentos: []
    };
  }

  if (pessoasRes.error && isMissingTableError(pessoasRes.error.code, pessoasRes.error.message)) {
    return {
      schemaReady: false,
      plano: { userId, totalMensal: DEFAULT_TOTAL_MENSAL },
      pessoas: [],
      pagamentos: []
    };
  }

  let totalMensal = DEFAULT_TOTAL_MENSAL;
  if (!planoRes.data) {
    await supabase.from("spotify_plano").upsert({
      user_id: userId,
      total_mensal: DEFAULT_TOTAL_MENSAL
    });
  } else {
    const row = planoRes.data as PlanoRow;
    totalMensal = Number(row.total_mensal ?? DEFAULT_TOTAL_MENSAL);
  }

  let pessoasRows = (pessoasRes.data ?? []) as PessoaRow[];

  // Se ainda não houver pessoas cadastradas, cria os 6 lugares iniciais (incluindo o titular com pagamento automático)
  if (pessoasRows.length === 0) {
    const defaultQuota = roundCurrency(totalMensal / 6);
    const { year } = getLocalCurrentYearMonth();
    const defaultStart = `${year}-01`;

    const initialMembers = [
      {
        user_id: userId,
        nome: ownerDisplayName || "Você (Titular)",
        titular: true,
        cota: defaultQuota,
        inicio: defaultStart,
        ativa: true,
        paga_automatico: true
      },
      ...Array.from({ length: 5 }, (_, idx) => ({
        user_id: userId,
        nome: `Familiar ${idx + 2}`,
        titular: false,
        cota: defaultQuota,
        inicio: defaultStart,
        ativa: true,
        paga_automatico: false
      }))
    ];

    const inserted = await supabase.from("spotify_pessoas").insert(initialMembers).select("*");
    if (inserted.data) {
      pessoasRows = inserted.data as PessoaRow[];
    }
  }

  const pessoas: SpotifyPessoa[] = pessoasRows.map((r) => ({
    id: String(r.id),
    userId: String(r.user_id),
    nome: String(r.nome),
    titular: Boolean(r.titular),
    cota: Number(r.cota ?? 0),
    inicio: r.inicio ? String(r.inicio) : null,
    ativa: Boolean(r.ativa),
    pagaAutomatico: Boolean(r.paga_automatico)
  }));

  const pagamentosRows = (pagamentosRes.data ?? []) as PagamentoRow[];
  const pagamentos: SpotifyPagamento[] = pagamentosRows.map((p) => ({
    id: String(p.id),
    userId: String(p.user_id),
    pessoaId: String(p.pessoa_id),
    mes: String(p.mes),
    valor: Number(p.valor ?? 0),
    pagoEm: String(p.pago_em)
  }));

  return {
    schemaReady: true,
    plano: { userId, totalMensal },
    pessoas,
    pagamentos
  };
}

export async function updateSpotifyPlanoTotal(
  totalMensal: number,
  recalculateQuotas: boolean,
  activeMemberIds: string[]
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return { ok: false, error: "Sessão expirada." };

  const { error } = await supabase.from("spotify_plano").upsert({
    user_id: userId,
    total_mensal: roundCurrency(totalMensal),
    updated_at: new Date().toISOString()
  });

  if (error) return { ok: false, error: error.message };

  if (recalculateQuotas && activeMemberIds.length > 0) {
    const newQuota = roundCurrency(totalMensal / activeMemberIds.length);
    await supabase
      .from("spotify_pessoas")
      .update({ cota: newQuota, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .in("id", activeMemberIds);
  }

  return { ok: true };
}

export async function upsertSpotifyPagamentosBatch(
  items: Array<{ pessoaId: string; mes: string; valor: number; pagoEm?: string }>
): Promise<{ ok: boolean; data?: SpotifyPagamento[]; error?: string }> {
  if (items.length === 0) return { ok: true, data: [] };

  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return { ok: false, error: "Sessão expirada." };

  const { todayIso } = getLocalCurrentYearMonth();

  const payload = items.map((item) => ({
    user_id: userId,
    pessoa_id: item.pessoaId,
    mes: item.mes,
    valor: roundCurrency(item.valor),
    pago_em: item.pagoEm ?? todayIso,
    updated_at: new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from("spotify_pagamentos")
    .upsert(payload, { onConflict: "pessoa_id,mes" })
    .select("*");

  if (error) {
    return { ok: false, error: error.message };
  }

  const mapped: SpotifyPagamento[] = ((data ?? []) as PagamentoRow[]).map((p) => ({
    id: String(p.id),
    userId: String(p.user_id),
    pessoaId: String(p.pessoa_id),
    mes: String(p.mes),
    valor: Number(p.valor ?? 0),
    pagoEm: String(p.pago_em)
  }));

  return { ok: true, data: mapped };
}

export async function deleteSpotifyPagamentoMes(
  pessoaId: string,
  mes: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return { ok: false, error: "Sessão expirada." };

  const { error } = await supabase
    .from("spotify_pagamentos")
    .delete()
    .eq("user_id", userId)
    .eq("pessoa_id", pessoaId)
    .eq("mes", mes);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function saveSpotifyPessoa(
  pessoa: Partial<SpotifyPessoa> & { nome: string; cota: number }
): Promise<{ ok: boolean; pessoa?: SpotifyPessoa; error?: string }> {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return { ok: false, error: "Sessão expirada." };

  const payload: Record<string, unknown> = {
    user_id: userId,
    nome: pessoa.nome.trim(),
    cota: roundCurrency(pessoa.cota),
    inicio: pessoa.inicio && pessoa.inicio.trim() !== "" ? pessoa.inicio.trim() : null,
    titular: Boolean(pessoa.titular),
    ativa: pessoa.ativa !== undefined ? pessoa.ativa : true,
    paga_automatico: Boolean(pessoa.pagaAutomatico),
    updated_at: new Date().toISOString()
  };

  if (pessoa.id) {
    payload.id = pessoa.id;
  }

  const { data, error } = await supabase
    .from("spotify_pessoas")
    .upsert(payload)
    .select("*")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Erro ao salvar participante." };
  }

  const r = data as PessoaRow;
  return {
    ok: true,
    pessoa: {
      id: String(r.id),
      userId: String(r.user_id),
      nome: String(r.nome),
      titular: Boolean(r.titular),
      cota: Number(r.cota ?? 0),
      inicio: r.inicio ? String(r.inicio) : null,
      ativa: Boolean(r.ativa),
      pagaAutomatico: Boolean(r.paga_automatico)
    }
  };
}

export async function setSpotifyPessoaAtiva(
  pessoaId: string,
  ativa: boolean
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return { ok: false, error: "Sessão expirada." };

  const { error } = await supabase
    .from("spotify_pessoas")
    .update({ ativa, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("id", pessoaId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}