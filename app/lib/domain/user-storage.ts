/**
 * Gerenciador de Armazenamento Local Isolado por Usuário & Motor de Tombstones (Sprint 22)
 * Garante isolamento estrito entre contas no mesmo navegador, evitando vazamento multi-tenant
 * e ressurgimento de entidades excluídas via tombstones locais.
 */

export function getUserStorageKey(key: string, userId?: string | null): string {
  const cleanId = userId ? userId.trim() : "";
  return cleanId ? `coindex_usr_${cleanId}_${key}` : `coindex_guest_${key}`;
}

/**
 * Lê um valor do armazenamento local com suporte a namespace por usuário e fallback de migração.
 */
export function getUserItem(key: string, userId?: string | null): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;

  const namespacedKey = getUserStorageKey(key, userId);
  const val = window.localStorage.getItem(namespacedKey);
  if (val !== null) return val;

  // Fallback 1: Se for usuário autenticado mas a chave ainda não existe no namespace,
  // verifica se havia dados em guest para migração no 1º acesso
  if (userId) {
    const guestKey = getUserStorageKey(key, null);
    const guestVal = window.localStorage.getItem(guestKey);
    if (guestVal !== null) {
      window.localStorage.setItem(namespacedKey, guestVal);
      return guestVal;
    }
  }

  // Fallback 2: Chave legada direta (ex: "lifeos_txs_v8") para preservar dados existentes
  const legacyVal = window.localStorage.getItem(key);
  if (legacyVal !== null) {
    window.localStorage.setItem(namespacedKey, legacyVal);
    return legacyVal;
  }

  // Fallback 3: Chaves globais de backup vault (Sprint 47.1)
  if (key.includes("banks")) {
    const vaultBanks = window.localStorage.getItem("coindex_vault_banks_backup");
    if (vaultBanks !== null) {
      window.localStorage.setItem(namespacedKey, vaultBanks);
      return vaultBanks;
    }
  }
  if (key.includes("cards")) {
    const vaultCards = window.localStorage.getItem("coindex_vault_cards_backup");
    if (vaultCards !== null) {
      window.localStorage.setItem(namespacedKey, vaultCards);
      return vaultCards;
    }
  }

  return null;
}

/**
 * Grava um valor no armazenamento local estritamente isolado pelo ID do usuário.
 */
export function setUserItem(key: string, value: string, userId?: string | null): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const namespacedKey = getUserStorageKey(key, userId);
  try {
    window.localStorage.setItem(namespacedKey, value);
  } catch (err) {
    console.error(`[user-storage] Erro ao gravar chave ${namespacedKey}:`, err);
  }
}

/**
 * Remove um valor do armazenamento local do usuário.
 */
export function removeUserItem(key: string, userId?: string | null): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const namespacedKey = getUserStorageKey(key, userId);
  window.localStorage.removeItem(namespacedKey);
}

/**
 * Registra um tombstone (marca de exclusão irreversível) no namespace do usuário.
 * Itens tombstoned nunca serão re-hidratados via cache local ou eco de sincronização.
 */
export function recordTombstone(id: string, userId?: string | null): void {
  if (typeof window === "undefined" || !window.localStorage || !id) return;
  const key = getUserStorageKey("tombstones_v1", userId);
  try {
    const raw = window.localStorage.getItem(key);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    set.add(id);
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn("[user-storage] Erro ao registrar tombstone:", err);
  }
}

/**
 * Registra múltiplos tombstones de uma vez (ex: exclusão de séries de parcelas).
 */
export function recordTombstones(ids: string[], userId?: string | null): void {
  if (typeof window === "undefined" || !window.localStorage || !ids.length) return;
  const key = getUserStorageKey("tombstones_v1", userId);
  try {
    const raw = window.localStorage.getItem(key);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    ids.forEach((id) => set.add(id));
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn("[user-storage] Erro ao registrar múltiplos tombstones:", err);
  }
}

/**
 * Retorna o conjunto de IDs excluídos do usuário.
 */
export function getTombstones(userId?: string | null): Set<string> {
  if (typeof window === "undefined" || !window.localStorage) return new Set();
  const key = getUserStorageKey("tombstones_v1", userId);
  try {
    const raw = window.localStorage.getItem(key);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

/**
 * Verifica se uma entidade está tombstoned (marcada para exclusão).
 */
export function isTombstoned(id: string, userId?: string | null): boolean {
  if (!id) return false;
  const tombstones = getTombstones(userId);
  return tombstones.has(id);
}

/**
 * Remove um tombstone quando uma exclusão é desfeita pelo usuário (AUD-04 Undo Action).
 * Suporta assinaturas flexíveis removeTombstone(id, userId) e removeTombstone(userId, id).
 */
export function removeTombstone(idOrUserId: string | null | undefined, maybeId?: string | null): void {
  if (typeof window === "undefined" || !window.localStorage || !idOrUserId) return;

  const tryRemove = (targetId: string, uId?: string | null): boolean => {
    if (!targetId) return false;
    const key = getUserStorageKey("tombstones_v1", uId);
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return false;
      const set = new Set<string>(JSON.parse(raw));
      if (set.has(targetId)) {
        set.delete(targetId);
        window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  };

  let removed = tryRemove(idOrUserId, maybeId);
  if (!removed && maybeId) {
    removed = tryRemove(maybeId, idOrUserId);
  }
}

/**
 * Remove múltiplos tombstones quando uma série ou lote excluído é desfeito.
 */
export function removeTombstones(ids: string[], userId?: string | null): void {
  if (!ids || !ids.length) return;
  ids.forEach((id) => removeTombstone(id, userId));
}

/**
 * Limpa todos os dados da sessão do usuário atual ao deslogar.
 */
export function clearUserSessionStorage(userId?: string | null): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const prefix = userId ? `coindex_usr_${userId}_` : `coindex_guest_`;

  const keysToRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    // BLINDAGEM PERMANENTE: Snapshots da Caixa-Preta NUNCA são limpos
    if (k && k.startsWith("coindex_blackbox_snapshots_")) continue;
    if (k && (k.startsWith(prefix) || k === "lifeos_active_session")) {
      keysToRemove.push(k);
    }
  }

  keysToRemove.forEach((k) => window.localStorage.removeItem(k));
}

/**
 * SPRINT 66: Purga conservadora de caches legados obsoletos.
 * PROTEÇÃO ABSOLUTA: Transações, telemetria de combustível e snapshots da Caixa-Preta
 * NUNCA são apagados pelo navegador, servindo como rede perene de segurança contra perda de dados.
 */
export function purgeAllEntityLocalCaches(userId?: string | null): void {
  if (typeof window === "undefined" || !window.localStorage) return;

  const obsoleteNonTxKeys = [
    "lifeos_cards_v1",
    "lifeos_banks_v1",
    "coindex_vault_cards_backup",
    "coindex_vault_banks_backup"
  ];

  obsoleteNonTxKeys.forEach((k) => {
    try {
      window.localStorage.removeItem(k);
    } catch {}
  });
}

// -------------------------------------------------------------
// SPRINT 66: PROTOCOLO CAIXA-PRETA — SNAPSHOTS IMUTÁVEIS LOCAIS
// -------------------------------------------------------------

export interface SafetySnapshotItem {
  id: string;
  timestamp: string;
  displayDate: string;
  reason: string;
  version: string;
  txCount: number;
  cardsCount: number;
  banksCount: number;
  payload: Record<string, unknown>;
}

const BLACKBOX_PREFIX = "coindex_blackbox_snapshots_";

export function getBlackboxSnapshotKey(userId: string): string {
  const clean = userId ? userId.trim() : "guest";
  return `${BLACKBOX_PREFIX}${clean}`;
}

/**
 * Salva um snapshot completo, imutável e rotativo dos últimos 10 estados da conta do usuário.
 * Essa chave NUNCA é limpa por nenhuma função de reset ou purga do sistema.
 */
export function saveImmutableSafetySnapshot(
  userId: string,
  statePayload: Record<string, unknown>,
  reason: string,
  version = "0.49.2"
): SafetySnapshotItem | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  if (!statePayload) return null;

  try {
    const key = getBlackboxSnapshotKey(userId);
    let existingList: SafetySnapshotItem[] = [];
    const raw = window.localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          existingList = parsed;
        }
      } catch {}
    }

    const txs = Array.isArray(statePayload.transactions) ? statePayload.transactions : [];
    const cards = Array.isArray(statePayload.cards) ? statePayload.cards : [];
    const banks = Array.isArray(statePayload.banks) ? statePayload.banks : [];

    const newSnapshot: SafetySnapshotItem = {
      id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      displayDate: new Date().toLocaleString("pt-BR"),
      reason: reason || "Ponto de Recuperação Automático",
      version,
      txCount: txs.length,
      cardsCount: cards.length,
      banksCount: banks.length,
      payload: statePayload
    };

    // Mantém no armazenamento local uma lista rotativa dos últimos 10 snapshots completos
    const updatedList = [newSnapshot, ...existingList].slice(0, 10);
    window.localStorage.setItem(key, JSON.stringify(updatedList));

    console.log(`[Protocolo Caixa-Preta] Snapshot "${reason}" salvo com sucesso (${txs.length} transações).`);
    return newSnapshot;
  } catch (err) {
    console.error("[Protocolo Caixa-Preta] Erro ao salvar snapshot de segurança:", err);
    return null;
  }
}

/**
 * Retorna a lista dos últimos snapshots automáticos da Caixa-Preta do usuário.
 */
export function getImmutableSafetySnapshots(userId: string): SafetySnapshotItem[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const key = getBlackboxSnapshotKey(userId);
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Dispara o download de um arquivo .json formatado no navegador.
 */
export function triggerJsonDownload(filename: string, data: unknown): void {
  if (typeof window === "undefined") return;
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("[Protocolo Caixa-Preta] Erro ao baixar arquivo JSON:", err);
  }
}

/**
 * Baixa um snapshot específico da Caixa-Preta como arquivo JSON.
 */
export function downloadSafetySnapshotJson(snapshot: SafetySnapshotItem): void {
  const safeDate = snapshot.timestamp.replace(/[:.]/g, "-");
  const filename = `coindex_snapshot_${safeDate}.json`;
  triggerJsonDownload(filename, snapshot);
}

/**
 * Baixa o estado atual completo como backup JSON seguro.
 */
export function downloadCurrentStateJson(statePayload: Record<string, unknown>, filenamePrefix = "coindex_backup_completo"): void {
  const safeDate = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${filenamePrefix}_${safeDate}.json`;
  const exportPayload = {
    metadata: {
      exportedAt: new Date().toISOString(),
      displayDate: new Date().toLocaleString("pt-BR"),
      system: "Coindex Equilibrium LifeOS",
      version: "0.49.2"
    },
    ...statePayload
  };
  triggerJsonDownload(filename, exportPayload);
}
