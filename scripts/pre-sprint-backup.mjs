/**
 * COINDEX - PROTOCOLO CAIXA-PRETA: SCRIPT DE BACKUP FÍSICO PRÉ-SPRINT
 * Executa download completo e não-destrutivo de todas as tabelas do Supabase
 * salvando em ./backups_seguranca/coindex_db_backup_${timestamp}.json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// 1. Leitura de .env.local
function loadEnvLocal() {
  const envPath = path.join(projectRoot, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ ERRO: Arquivo .env.local não encontrado em:", envPath);
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

async function runBackup() {
  console.log("🛡️ [PROTOCOLO CAIXA-PRETA] Iniciando Backup Físico do Supabase...");

  const env = loadEnvLocal();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERRO: Credenciais do Supabase não encontradas no .env.local!");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  const tablesToBackup = [
    "transactions",
    "credit_cards",
    "banks",
    "static_status",
    "brain_notes",
    "user_settings"
  ];

  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      supabaseUrl,
      generatedBy: "scripts/pre-sprint-backup.mjs",
      version: "0.49.2"
    },
    tables: {},
    summary: {}
  };

  let totalRecordsAcrossTables = 0;

  for (const table of tablesToBackup) {
    try {
      const { data, error } = await supabase.from(table).select("*");
      if (error) {
        console.warn(`⚠️ Aviso: Tabela "${table}" retornou aviso ou não é acessível publicamente: ${error.message}`);
        backupData.tables[table] = [];
        backupData.summary[table] = 0;
      } else {
        const count = Array.isArray(data) ? data.length : 0;
        backupData.tables[table] = data || [];
        backupData.summary[table] = count;
        totalRecordsAcrossTables += count;
        console.log(`  ✓ Tabela [${table}]: ${count} registros capturados.`);
      }
    } catch (err) {
      console.warn(`⚠️ Aviso ao consultar "${table}":`, err.message);
      backupData.tables[table] = [];
      backupData.summary[table] = 0;
    }
  }

  // 3. Criação da pasta de segurança e gravação do arquivo
  const backupDir = path.join(projectRoot, "backups_seguranca");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const dateStr = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `coindex_db_backup_${dateStr}.json`;
  const filePath = path.join(backupDir, fileName);

  try {
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), "utf-8");
    const fileStats = fs.statSync(filePath);
    const sizeKb = (fileStats.size / 1024).toFixed(2);

    console.log("-------------------------------------------------------------");
    console.log("✅ [CAIXA-PRETA] BACKUP FÍSICO CONCLUÍDO COM SUCESSO!");
    console.log(`📁 Arquivo gerado: ./backups_seguranca/${fileName}`);
    console.log(`📊 Tamanho do arquivo: ${sizeKb} KB`);
    console.log(`📈 Total de registros consolidados: ${totalRecordsAcrossTables}`);
    console.log("📋 Resumo por tabela:", JSON.stringify(backupData.summary, null, 2));
    console.log("-------------------------------------------------------------");
  } catch (err) {
    console.error("❌ ERRO FATAL: Falha ao gravar arquivo de backup no disco:", err);
    process.exit(1);
  }
}

runBackup().catch((err) => {
  console.error("❌ ERRO INESPERADO NO BACKUP:", err);
  process.exit(1);
});
