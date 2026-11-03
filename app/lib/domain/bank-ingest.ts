/**
 * Motor de Ingestão Bancária CSV / OFX & Auto-Categorização (Sprint 37 — Rafael Albuquerque)
 * Parser client-side puro, determinístico e seguro contra injeções de fórmulas.
 */

import { toCents, fromCents, FlowType } from "./finance";
import { formatDateBR, parseDateParts } from "./date-br";

export interface ParsedBankTransaction {
  id: string;
  externalId: string;
  date: string; // DD-MM-YYYY
  rawDate: string;
  description: string;
  amount: number; // valor positivo
  flowType: FlowType;
  costType: "Fixo" | "Variável";
  category: string;
  paymentMethod: string;
  status: "Pago" | "Pendente";
  isDuplicate?: boolean;
  selected?: boolean;
}

export interface BankIngestResult {
  bankName: string;
  format: "CSV" | "OFX";
  transactions: ParsedBankTransaction[];
  totalCount: number;
  newCount: number;
  duplicateCount: number;
  totalIncome: number;
  totalExpense: number;
}

interface CategoryRule {
  keywords: string[];
  category: string;
  costType: "Fixo" | "Variável";
  paymentMethod?: string;
}

export const OFFICIAL_AUTO_CATEGORY_RULES: CategoryRule[] = [
  {
    keywords: ["uber", "99app", "99 app", "99 tecnologia", "cabify", "indrive", "transporte"],
    category: "Transporte / Uber",
    costType: "Variável",
    paymentMethod: "Cartão de Crédito"
  },
  {
    keywords: ["ifood", "rappi", "aiqfome", "mcdonald", "burger king", "habib", "restaurante", "lanchonete", "padaria", "pizzaria", "outback", "churrascaria", "alimentacao", "refeicao"],
    category: "Delivery / Alimentação",
    costType: "Variável",
    paymentMethod: "Cartão de Crédito"
  },
  {
    keywords: ["posto", "shell", "ipiranga", "petrobras", "abastecimento", "combustivel", "gasolina", "etanol", "diesel", "auto posto", "auto servico posto"],
    category: "Combustível",
    costType: "Variável",
    paymentMethod: "Débito em Conta"
  },
  {
    keywords: ["mercado", "supermercado", "assai", "assaí", "carrefour", "pao de acucar", "pão de açúcar", "extra", "atacadão", "atacadao", "hipermercado", "hortifruti", "sacolao", "sacolão", "supermercados"],
    category: "Supermercado",
    costType: "Variável",
    paymentMethod: "Cartão de Crédito"
  },
  {
    keywords: ["netflix", "spotify", "amazon prime", "hbo", "disney", "apple.com", "deezer", "youtube premium", "cloud", "chatgpt", "openai", "google storage", "microsoft"],
    category: "Assinaturas & Serviços",
    costType: "Fixo",
    paymentMethod: "Cartão de Crédito"
  },
  {
    keywords: ["farmacia", "farmácia", "droga raia", "drogasil", "drogaria", "panvel", "pague menos", "remedio", "medicamento", "hospital", "laboratorio", "clinica"],
    category: "Saúde / Farmácia",
    costType: "Variável",
    paymentMethod: "Cartão de Crédito"
  },
  {
    keywords: ["smart fit", "academia", "gympass", "bluefit", "suplement", "corrida", "strava"],
    category: "Saúde & Run",
    costType: "Fixo",
    paymentMethod: "Cartão de Crédito"
  },
  {
    keywords: ["aluguel", "condominio", "condomínio", "enel", "sabesp", "cpfl", "energia", "luz", "agua", "água", "gas", "gás", "iptu", "imobiliaria"],
    category: "Moradia",
    costType: "Fixo",
    paymentMethod: "Débito em Conta"
  },
  {
    keywords: ["salario", "salário", "proventos", "adiantamento", "folha", "pix recebido", "ted recebida", "transferencia recebida", "renda", "remuneracao"],
    category: "Renda Base",
    costType: "Fixo",
    paymentMethod: "PIX"
  },
  {
    keywords: ["rendimento", "dividendos", "jcp", "tesouro direto", "cdi", "lci", "lca", "aporte", "investimento", "xp investimentos", "btg pactual", "nuinvest", "clear"],
    category: "Aportes",
    costType: "Variável",
    paymentMethod: "Investimento"
  },
  {
    keywords: ["estacionamento", "pedagio", "pedágio", "sem parar", "conectcar", "veloe", "ipva", "seguro auto", "mecanica", "oficina"],
    category: "Veículo",
    costType: "Variável",
    paymentMethod: "Cartão de Crédito"
  }
];

export function autoCategorizeDescription(description: string, isIncome: boolean): {
  category: string;
  costType: "Fixo" | "Variável";
  paymentMethod: string;
} {
  const norm = description
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (isIncome) {
    if (norm.includes("rendimento") || norm.includes("dividendo") || norm.includes("juros")) {
      return { category: "Aportes", costType: "Variável", paymentMethod: "Investimento" };
    }
    return { category: "Renda Base", costType: "Fixo", paymentMethod: "PIX" };
  }

  for (const rule of OFFICIAL_AUTO_CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      const cleanKw = kw
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (norm.includes(cleanKw)) {
        return {
          category: rule.category,
          costType: rule.costType,
          paymentMethod: rule.paymentMethod || "Cartão de Crédito"
        };
      }
    }
  }

  return {
    category: "Outros",
    costType: "Variável",
    paymentMethod: "Cartão de Crédito"
  };
}

export function generateDeterministicKey(dateBR: string, amount: number, desc: string): string {
  const cleanDesc = desc
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 24);
  const cents = Math.abs(toCents(amount));
  return `${dateBR}_${cents}_${cleanDesc}`;
}

export function normalizeRawDate(rawDateStr: string): string {
  if (!rawDateStr) return formatDateBR(new Date().toISOString());
  const clean = rawDateStr.trim().replace(/"/g, "");

  // Formato OFX: YYYYMMDD ou YYYYMMDDHHMMSS
  if (/^\d{8}/.test(clean)) {
    const yyyy = clean.slice(0, 4);
    const mm = clean.slice(4, 6);
    const dd = clean.slice(6, 8);
    return `${dd}-${mm}-${yyyy}`;
  }

  // Formato ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const parts = clean.slice(0, 10).split("-");
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  // Formato BR: DD/MM/YYYY ou DD-MM-YYYY
  if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(clean)) {
    const separator = clean.includes("/") ? "/" : "-";
    const parts = clean.slice(0, 10).split(separator);
    return `${parts[0]}-${parts[1]}-${parts[2]}`;
  }

  try {
    return formatDateBR(clean);
  } catch {
    return clean;
  }
}

export function parseOFXStatement(ofxText: string): ParsedBankTransaction[] {
  const transactions: ParsedBankTransaction[] = [];

  // Localiza blocos <STMTTRN>...</STMTTRN>
  const stmtTrnRegex = /<STMTTRN>([\s\S]*?)(?:<\/STMTTRN>|(?=<STMTTRN>)|$)/gi;
  let match: RegExpExecArray | null;

  while ((match = stmtTrnRegex.exec(ofxText)) !== null) {
    const block = match[1];

    const getField = (tag: string): string => {
      const r = new RegExp(`<${tag}>([^<\\r\\n]+)`, "i");
      const m = r.exec(block);
      return m ? m[1].trim() : "";
    };

    const trnType = getField("TRNTYPE");
    const dtPosted = getField("DTPOSTED");
    const trnAmtStr = getField("TRNAMT").replace(",", ".");
    const fitId = getField("FITID");
    const memo = getField("MEMO") || getField("NAME") || "Lançamento OFX";

    if (!dtPosted || !trnAmtStr) continue;

    const rawAmt = parseFloat(trnAmtStr);
    if (isNaN(rawAmt)) continue;

    const isIncome = rawAmt > 0 || trnType.toUpperCase() === "CREDIT";
    const absAmount = Math.abs(rawAmt);
    const dateBR = normalizeRawDate(dtPosted);
    const cleanDesc = memo.replace(/\s+/g, " ").trim();
    const { category, costType, paymentMethod } = autoCategorizeDescription(cleanDesc, isIncome);
    const externalId = fitId || generateDeterministicKey(dateBR, absAmount, cleanDesc);

    transactions.push({
      id: `ingest-ofx-${externalId}-${Math.random().toString(36).slice(2, 6)}`,
      externalId,
      date: dateBR,
      rawDate: dtPosted,
      description: cleanDesc,
      amount: fromCents(toCents(absAmount)),
      flowType: isIncome ? "INCOME" : "EXPENSE",
      costType,
      category,
      paymentMethod,
      status: "Pago",
      selected: true
    });
  }

  return transactions;
}

export function parseCSVStatement(csvText: string): ParsedBankTransaction[] {
  const transactions: ParsedBankTransaction[] = [];
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (lines.length < 2) return [];

  // Detecta delimitador (, ou ;)
  const headerLine = lines[0];
  const delimiter = headerLine.includes(";") ? ";" : ",";

  const parseRow = (row: string): string[] => {
    const cells: string[] = [];
    let current = "";
    let insideQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === delimiter && !insideQuotes) {
        cells.push(current.trim().replace(/^"|"$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current.trim().replace(/^"|"$/g, ""));
    return cells;
  };

  const headers = parseRow(headerLine).map((h) => h.toLowerCase());

  // Mapeia colunas por heurística inteligente
  let dateIdx = headers.findIndex((h) => h.includes("data") || h.includes("date"));
  let descIdx = headers.findIndex((h) => h.includes("descri") || h.includes("titulo") || h.includes("título") || h.includes("historico") || h.includes("histórico") || h.includes("memo") || h.includes("estabelecimento"));
  let amountIdx = headers.findIndex((h) => h.includes("valor") || h.includes("amount") || h.includes("quantia") || h.includes("total"));
  let categoryIdx = headers.findIndex((h) => h.includes("categoria") || h.includes("category"));

  if (dateIdx === -1) dateIdx = 0;
  if (descIdx === -1) descIdx = 1;
  if (amountIdx === -1) amountIdx = headers.length > 2 ? 2 : 1;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseRow(lines[i]);
    if (cols.length < 2) continue;

    const rawDate = cols[dateIdx] || "";
    const rawDesc = cols[descIdx] || "Lançamento CSV";
    const rawAmount = cols[amountIdx] || "0";
    const rawCategory = categoryIdx !== -1 ? cols[categoryIdx] : "";

    // Converte valor
    let cleanAmtStr = rawAmount.replace(/R\$/g, "").replace(/\s/g, "").trim();
    if (!cleanAmtStr || cleanAmtStr === "-" || cleanAmtStr === "") continue;

    // Detecta negativo
    const isNegative = cleanAmtStr.startsWith("-") || (cleanAmtStr.startsWith("(") && cleanAmtStr.endsWith(")"));
    cleanAmtStr = cleanAmtStr.replace(/[\(\)\-]/g, "");

    // Trata formato pt-BR (1.234,56) vs en-US (1234.56)
    if (cleanAmtStr.includes(",")) {
      cleanAmtStr = cleanAmtStr.replace(/\./g, "").replace(",", ".");
    }

    const numAmt = parseFloat(cleanAmtStr);
    if (isNaN(numAmt) || numAmt === 0) continue;

    // No Nubank/Inter: Saídas geralmente vêm com sinal negativo ou positivo conforme o arquivo
    const isIncome = !isNegative && !headers[amountIdx]?.includes("saida");
    const absAmount = fromCents(toCents(Math.abs(numAmt)));
    const dateBR = normalizeRawDate(rawDate);
    const cleanDesc = rawDesc.replace(/\s+/g, " ").trim();
    const autoCat = autoCategorizeDescription(cleanDesc, isIncome);
    const finalCategory = rawCategory && rawCategory.length > 2 ? rawCategory : autoCat.category;
    const externalId = generateDeterministicKey(dateBR, absAmount, cleanDesc);

    transactions.push({
      id: `ingest-csv-${externalId}-${Math.random().toString(36).slice(2, 6)}`,
      externalId,
      date: dateBR,
      rawDate,
      description: cleanDesc,
      amount: absAmount,
      flowType: isIncome ? "INCOME" : "EXPENSE",
      costType: autoCat.costType,
      category: finalCategory,
      paymentMethod: autoCat.paymentMethod,
      status: "Pago",
      selected: true
    });
  }

  return transactions;
}

export function parseBankStatementFile(
  content: string,
  fileName: string,
  existingTransactions: Array<{ date: string; amount: number; description: string; externalId?: string }>
): BankIngestResult {
  const isOFX = fileName.toLowerCase().endsWith(".ofx") || content.includes("<OFX>") || content.includes("<STMTTRN>");
  const transactions = isOFX ? parseOFXStatement(content) : parseCSVStatement(content);

  // Mapeia chaves de transações já existentes no Coindex para detecção de duplicadas
  const existingKeySet = new Set<string>();
  for (const t of existingTransactions) {
    if (t.externalId) {
      existingKeySet.add(t.externalId);
    }
    const dateBR = formatDateBR(t.date);
    existingKeySet.add(generateDeterministicKey(dateBR, t.amount, t.description));
  }

  let newCount = 0;
  let duplicateCount = 0;
  let totalIncome = 0;
  let totalExpense = 0;

  for (const tx of transactions) {
    const isDup = existingKeySet.has(tx.externalId);
    tx.isDuplicate = isDup;
    if (isDup) {
      duplicateCount++;
      tx.selected = false; // Duplicatas vêm desmarcadas por padrão
    } else {
      newCount++;
      tx.selected = true;
    }

    if (tx.flowType === "INCOME") {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
    }
  }

  let bankName = "Extrato Bancário";
  const upper = (fileName + " " + content.slice(0, 500)).toUpperCase();
  if (upper.includes("NUBANK") || upper.includes("NU PAGAMENTOS")) bankName = "Nubank";
  else if (upper.includes("INTER")) bankName = "Banco Inter";
  else if (upper.includes("BTG")) bankName = "BTG Pactual";
  else if (upper.includes("C6")) bankName = "C6 Bank";
  else if (upper.includes("ITAU") || upper.includes("ITAÚ")) bankName = "Itaú";
  else if (upper.includes("BRADESCO")) bankName = "Bradesco";
  else if (upper.includes("SANTANDER")) bankName = "Santander";
  else if (upper.includes("XP")) bankName = "XP Investimentos";

  return {
    bankName,
    format: isOFX ? "OFX" : "CSV",
    transactions,
    totalCount: transactions.length,
    newCount,
    duplicateCount,
    totalIncome: fromCents(toCents(totalIncome)),
    totalExpense: fromCents(toCents(totalExpense))
  };
}
