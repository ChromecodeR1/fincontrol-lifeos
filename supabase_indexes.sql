-- ==============================================================================
-- SPRINT 11: ÍNDICES DE ALTA PERFORMANCE PARA O SUPABASE (PostgreSQL)
-- Projeto: FinControl LifeOS
-- Objetivo: Otimizar consultas de transações, parcelamentos, faturas e conciliação bancária
-- Execução: Copie e cole este script no "SQL Editor" do seu painel Supabase e clique em "RUN".
-- ==============================================================================

-- 1. ÍNDICE COMPOSTO PRINCIPAL: Data, Categoria e Método de Pagamento
-- Justificativa Técnica:
-- A listagem da aba Lançamentos, gráficos do Dashboard BI e relatórios mensais ordenam
-- prioritariamente por data decrescente (tx_date DESC) e filtram por categoria e meio de pagamento.
-- Este índice elimina sequential scans (Seq Scan), viabilizando Index Scans com custo O(log N).
CREATE INDEX IF NOT EXISTS idx_transactions_date_cat_method 
ON transactions (tx_date DESC, category, payment_method);

-- Versão tenant-isolated (com user_id para RLS e multitenancy do Supabase):
CREATE INDEX IF NOT EXISTS idx_transactions_user_date_cat_method 
ON transactions (user_id, tx_date DESC, category, payment_method);


-- 2. ÍNDICE DE SÉRIES PARCELADAS: installment_group_id
-- Justificativa Técnica:
-- Compras parceladas compartilham o installment_group_id para auditoria, exclusão em lote
-- e edição em série (Sprint 7). Consultas de busca por grupo de parcelas tornam-se instantâneas.
CREATE INDEX IF NOT EXISTS idx_transactions_installment_group 
ON transactions (installment_group_id) 
WHERE installment_group_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_user_installment_group 
ON transactions (user_id, installment_group_id) 
WHERE installment_group_id IS NOT NULL;


-- 3. ÍNDICE DE COMPETÊNCIA DE FATURAS E CARTÕES DE CRÉDITO: (card_used, status)
-- Justificativa Técnica:
-- O cálculo de exposição da fatura atual e futura (calculateCardExposure e fechamento do ciclo)
-- filtra as transações pendentes/pagas associadas a cada cartão.
CREATE INDEX IF NOT EXISTS idx_transactions_card_status 
ON transactions (card_used, status);

CREATE INDEX IF NOT EXISTS idx_transactions_user_card_status 
ON transactions (user_id, card_used, status);


-- 4. ÍNDICE DE CONTAS BANCÁRIAS E CONCILIAÇÃO: (bank_account / card_used, status)
-- Justificativa Técnica:
-- O cálculo de saldo em tempo real (calculateBankExposure) soma receitas e despesas
-- confirmadas/pagas por instituição bancária para conciliação financeira precisa.
CREATE INDEX IF NOT EXISTS idx_transactions_status_bank 
ON transactions (status, card_used);


-- 5. ÍNDICE DE VALORES A RECEBER E DEVEDORES: (debtor, status)
-- Justificativa Técnica:
-- A aba de devedores e controle de abatimento inteligente (Sprint 4) busca registros
-- onde debtor IS NOT NULL para totalizar saldo em aberto vs saldo quitado.
CREATE INDEX IF NOT EXISTS idx_transactions_debtors 
ON transactions (debtor, status) 
WHERE debtor IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_user_debtors 
ON transactions (user_id, debtor, status) 
WHERE debtor IS NOT NULL;


-- 6. ÍNDICE PARA TELEMETRIA DE VEÍCULOS / COMBUSTÍVEL: (km, liters)
-- Justificativa Técnica:
-- Cálculo de eficiência (km/l), odômetro máximo e relatórios do Ford Fiesta (Sprint 5)
-- filtram transações onde km > 0 e liters > 0.
CREATE INDEX IF NOT EXISTS idx_transactions_auto_telemetry 
ON transactions (tx_date DESC, km, liters) 
WHERE km IS NOT NULL AND liters IS NOT NULL;


-- 7. ÍNDICE PARA STATUS & BASE FIXA: (type)
-- Justificativa Técnica:
-- O botão "Lançar Fixos do Mês" e o cálculo de base fixa realizam leitura por tipo de status.
CREATE INDEX IF NOT EXISTS idx_static_status_user_type 
ON static_status (user_id, type);

-- ==============================================================================
-- FIM DO SCRIPT DE ÍNDICES
-- ==============================================================================
