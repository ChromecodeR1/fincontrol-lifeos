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
    if (k && (k.startsWith(prefix) || k === "lifeos_active_session")) {
      keysToRemove.push(k);
    }
  }

  keysToRemove.forEach((k) => window.localStorage.removeItem(k));
}

/**
 * SPRINT 64: Purga completa de todos os caches locais de entidades financeiras e de dados.
 * O Coindex opera sob arquitetura 100% Nuvem Estrita (Supabase PostgreSQL SSOT).
 * Lançamentos, Cartões, Bancos, Investimentos, Veículos e Notas não residem em localStorage.
 */
export function purgeAllEntityLocalCaches(userId?: string | null): void {
  if (typeof window === "undefined" || !window.localStorage) return;

  const entityKeyPatterns = [
    "lifeos_txs_v8",
    "lifeos_cards_v8",
    "lifeos_cards_v1",
    "lifeos_banks_v8",
    "lifeos_banks_v1",
    "lifeos_status_v8",
    "lifeos_notes_v8",
    "lifeos_wish_v8",
    "lifeos_bio_v8",
    "lifeos_okrs_v8",
    "lifeos_debtors_v8",
    "coindex_vault_cards_backup",
    "coindex_vault_banks_backup",
    "coindex_patrimony_real_adjustment",
    "lifeos_vehicle_maintenance_items_v2",
    "lifeos_vehicle_maintenance_v1",
    "lifeos_fuel_logs_v1"
  ];

  entityKeyPatterns.forEach((k) => {
    try {
      window.localStorage.removeItem(k);
    } catch {}
  });

  const cleanId = userId ? userId.trim() : "";
  const prefixes = cleanId ? [`coindex_usr_${cleanId}_`, "coindex_guest_"] : ["coindex_usr_", "coindex_guest_"];

  const keysToRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k) continue;
    for (const prefix of prefixes) {
      if (k.startsWith(prefix)) {
        if (
          k.includes("_txs") ||
          k.includes("_cards") ||
          k.includes("_banks") ||
          k.includes("_status") ||
          k.includes("_notes") ||
          k.includes("_vault") ||
          k.includes("_adjustment") ||
          k.includes("_wish") ||
          k.includes("_bio") ||
          k.includes("_okrs")
        ) {
          keysToRemove.push(k);
        }
      }
    }
  }

  keysToRemove.forEach((k) => {
    try {
      window.localStorage.removeItem(k);
    } catch {}
  });
}
