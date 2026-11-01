/**
 * Motor de Datas Brasileiro (Sprint 21 - Padronização Global DD-MM-YYYY)
 * Elimina 100% de bugs de fuso horário UTC-3 (America/Fortaleza) decorrentes de new Date("YYYY-MM-DD") e toISOString().
 * Opera puramente com aritmética inteira de calendário.
 */

export interface DateParts {
  day: number;
  month: number;
  year: number;
}

export interface YearMonthInfo {
  year: number;
  month: number;
  key: string;       // "YYYY-MM"
  labelBR: string;   // "MM-YYYY"
  shortLabel: string;// "Out/26"
}

const MONTH_SHORT_NAMES_BR = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

/**
 * Retorna o número real de dias em determinado mês e ano (respeitando anos bissextos).
 * Sem instanciar Date no fuso UTC.
 */
export function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return isLeap ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

/**
 * Retorna a data atual da máquina no fuso local no formato estrito "DD-MM-YYYY".
 * NUNCA utiliza toISOString(), prevenindo o salto para o dia seguinte após as 21h em UTC-3.
 */
export function todayBR(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Retorna a data atual local no formato ordenável "YYYY-MM-DD".
 */
export function todayISO(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

/**
 * Decompõe qualquer string de data aceita ("DD-MM-YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "YYYY/MM/DD")
 * em dia, mês e ano numéricos. Retorna null se inválida.
 */
export function parseDateParts(input?: string | null): DateParts | null {
  if (!input) return null;
  const clean = input.trim().split("T")[0].replace(/\//g, "-");
  const parts = clean.split("-");
  if (parts.length !== 3) return null;

  // Caso 1: YYYY-MM-DD
  if (parts[0].length === 4) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return { day, month, year };
  }

  // Caso 2: DD-MM-YYYY
  if (parts[2].length === 4) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return { day, month, year };
  }

  return null;
}

/**
 * Padroniza e formata qualquer data para a exibição oficial do usuário: "DD-MM-YYYY".
 * Suporta formatos legados ("YYYY-MM-DD", "DD/MM/YYYY") e mantém consistência total.
 */
export function formatDateBR(input?: string | null): string {
  if (!input) return "";
  const parts = parseDateParts(input);
  if (!parts) return input.trim();
  const dd = String(parts.day).padStart(2, "0");
  const mm = String(parts.month).padStart(2, "0");
  return `${dd}-${mm}-${parts.year}`;
}

/**
 * Converte data para "YYYY-MM-DD" para ordenação ASCII pura ou persistência SQL.
 * Não instancia objeto Date no fuso UTC.
 */
export function toSortableISO(dateStr?: string | null): string {
  if (!dateStr) return "";
  const parts = parseDateParts(dateStr);
  if (!parts) return dateStr.trim();
  const dd = String(parts.day).padStart(2, "0");
  const mm = String(parts.month).padStart(2, "0");
  return `${parts.year}-${mm}-${dd}`;
}

/**
 * Aritmética segura de meses usando números inteiros para virada de ano.
 * totalMonths = year * 12 + (month - 1) + delta
 * Nunca gera mês 13 ou estouro de virada de ano.
 */
export function addMonthsSafe(year: number, month: number, delta: number): YearMonthInfo {
  const totalMonths = year * 12 + (month - 1) + delta;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = (((totalMonths % 12) + 12) % 12) + 1;
  const mm = String(targetMonth).padStart(2, "0");
  const key = `${targetYear}-${mm}`;
  const labelBR = `${mm}-${targetYear}`;
  const shortLabel = `${MONTH_SHORT_NAMES_BR[targetMonth - 1]}/${String(targetYear).slice(-2)}`;
  return {
    year: targetYear,
    month: targetMonth,
    key,
    labelBR,
    shortLabel
  };
}

/**
 * Adiciona meses a uma data completa ("DD-MM-YYYY" ou "YYYY-MM-DD") ajustando dias
 * 29-31 para o último dia real do mês de destino. Retorna sempre "DD-MM-YYYY".
 */
export function addMonthsToDateBR(dateStr: string, delta: number): string {
  const parts = parseDateParts(dateStr);
  if (!parts) return dateStr;
  const ym = addMonthsSafe(parts.year, parts.month, delta);
  const maxDay = daysInMonth(ym.year, ym.month);
  const safeDay = Math.min(parts.day, maxDay);
  return `${String(safeDay).padStart(2, "0")}-${String(ym.month).padStart(2, "0")}-${ym.year}`;
}

/**
 * Versão compatível que retorna "YYYY-MM-DD" se necessário internamente.
 */
export function addMonthsToDateISO(dateStr: string, delta: number): string {
  return toSortableISO(addMonthsToDateBR(dateStr, delta));
}

/**
 * Extrai a chave de competência "YYYY-MM" de uma data ("DD-MM-YYYY" ou "YYYY-MM-DD")
 * de forma pura, sem instanciar objeto Date.
 */
export function getYearMonthKey(dateStr: string): string {
  const parts = parseDateParts(dateStr);
  if (!parts) {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`;
  }
  const mm = String(parts.month).padStart(2, "0");
  return `${parts.year}-${mm}`;
}

/**
 * Retorna as informações completas de competência (ano, mês, chave e rótulos BR).
 */
export function getYearMonthInfo(dateStr: string): YearMonthInfo {
  const parts = parseDateParts(dateStr);
  if (!parts) {
    const d = new Date();
    return addMonthsSafe(d.getFullYear(), d.getMonth() + 1, 0);
  }
  return addMonthsSafe(parts.year, parts.month, 0);
}

/**
 * Compara duas datas em ordem cronológica estrita (sem Date UTC).
 * Retorna negativo se a < b, 0 se iguais, positivo se a > b.
 */
export function compareDatesBR(a: string, b: string): number {
  const aISO = toSortableISO(a);
  const bISO = toSortableISO(b);
  return aISO.localeCompare(bISO);
}

/**
 * Retorna o rótulo abreviado amigável ("Out/26", "Nov/26", etc.)
 */
export function formatMonthShortLabelBR(ym: string): string {
  if (!ym || ym === "ALL") return "Geral";
  const parts = ym.trim().replace(/\//g, "-").split("-");
  let y = 2026;
  let m = 10;
  if (parts.length >= 2) {
    if (parts[0].length === 4) {
      y = parseInt(parts[0], 10) || 2026;
      m = parseInt(parts[1], 10) || 1;
    } else {
      m = parseInt(parts[0], 10) || 1;
      y = parseInt(parts[1], 10) || 2026;
    }
  }
  const safeM = Math.max(1, Math.min(12, m));
  return `${MONTH_SHORT_NAMES_BR[safeM - 1]}/${String(y).slice(-2)}`;
}
