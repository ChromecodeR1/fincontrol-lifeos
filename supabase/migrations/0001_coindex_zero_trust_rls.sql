-- ==============================================================================
-- COINDEX LIFEOS — CIBERSEGURANÇA ZERO-TRUST & ROW LEVEL SECURITY (RLS)
-- SPRINT 37 — Letícia Varella (Head de Cibersegurança & Arquitetura Zero-Trust)
-- ==============================================================================
-- Este arquivo documenta a arquitetura de segurança por inquilino (multi-tenant)
-- isolando estritamente os dados de cada usuário autenticado via Supabase Auth.
-- ==============================================================================

-- 1. TABELA PRINCIPAL DE TRANSAÇÕES
CREATE TABLE IF NOT EXISTS public.coindex_transactions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    category TEXT NOT NULL,
    cost_type TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    card_used TEXT,
    card_id TEXT,
    bank_account TEXT,
    bank_id TEXT,
    status TEXT NOT NULL DEFAULT 'Pago',
    flow_type TEXT NOT NULL DEFAULT 'EXPENSE',
    km NUMERIC(10, 1),
    liters NUMERIC(10, 2),
    fuel_type TEXT,
    installment_info TEXT,
    installment_group_id TEXT,
    installment_series_id TEXT,
    external_id TEXT,
    debtor TEXT,
    notes TEXT,
    indexer TEXT,
    cdi_percentage NUMERIC(6, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Índices Compostos de Alta Performance para Consultas Filtradas por Usuário
CREATE INDEX IF NOT EXISTS idx_coindex_tx_user_date ON public.coindex_transactions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_coindex_tx_user_cat ON public.coindex_transactions (user_id, category);
CREATE INDEX IF NOT EXISTS idx_coindex_tx_user_status ON public.coindex_transactions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_coindex_tx_external_id ON public.coindex_transactions (user_id, external_id) WHERE external_id IS NOT NULL;

-- 2. TABELA DE CARTÕES DE CRÉDITO
CREATE TABLE IF NOT EXISTS public.coindex_cards (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    "limit" NUMERIC(14, 2) NOT NULL DEFAULT 0,
    closing_day INT NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
    due_day INT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    bank_id TEXT,
    bank_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_coindex_cards_user ON public.coindex_cards (user_id);

-- 3. TABELA DE CONTAS E BANCOS
CREATE TABLE IF NOT EXISTS public.coindex_banks (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    institution TEXT NOT NULL,
    account_type TEXT NOT NULL DEFAULT 'Conta Corrente',
    balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_coindex_banks_user ON public.coindex_banks (user_id);

-- 4. TABELA DE STATUS FIXOS & ORÇAMENTO
CREATE TABLE IF NOT EXISTS public.coindex_static_status (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_coindex_static_status_user ON public.coindex_static_status (user_id);

-- 5. TABELA DE LISTA DE DESEJOS (WISHLIST)
CREATE TABLE IF NOT EXISTS public.coindex_wishlist (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    institution TEXT,
    target_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    saved_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    priority TEXT NOT NULL DEFAULT 'Planejado',
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    item_type TEXT NOT NULL DEFAULT 'wish',
    price NUMERIC(14, 2),
    store_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_coindex_wishlist_user ON public.coindex_wishlist (user_id);

-- 6. TABELA DE NOTAS & SEGUNDO CÉREBRO
CREATE TABLE IF NOT EXISTS public.coindex_notes (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    tag TEXT NOT NULL DEFAULT '#Ideias',
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority TEXT DEFAULT 'Planejado',
    price NUMERIC(14, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_coindex_notes_user ON public.coindex_notes (user_id);

-- 7. TABELA DE MEDIÇÕES CORPORAIS (BIO LOGS)
CREATE TABLE IF NOT EXISTS public.coindex_bio_logs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight NUMERIC(6, 2) NOT NULL,
    bf NUMERIC(5, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coindex_bio_user_date ON public.coindex_bio_logs (user_id, date DESC);

-- 8. TABELA DE OKRS & METAS DO ANO
CREATE TABLE IF NOT EXISTS public.coindex_okrs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    current NUMERIC(14, 2) NOT NULL DEFAULT 0,
    target NUMERIC(14, 2) NOT NULL,
    unit TEXT NOT NULL DEFAULT 'R$',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coindex_okrs_user ON public.coindex_okrs (user_id);

-- 9. TABELA DE CONFIGURAÇÕES DO USUÁRIO & TELEMETRIA
CREATE TABLE IF NOT EXISTS public.coindex_user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- POLÍTICAS ZERO-TRUST COM ROW LEVEL SECURITY (RLS) ESTRITO
-- ==============================================================================

-- Ativa RLS em todas as tabelas
ALTER TABLE public.coindex_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coindex_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coindex_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coindex_static_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coindex_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coindex_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coindex_bio_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coindex_okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coindex_user_settings ENABLE ROW LEVEL SECURITY;

-- 1. Políticas coindex_transactions
DROP POLICY IF EXISTS "zero_trust_transactions_policy" ON public.coindex_transactions;
CREATE POLICY "zero_trust_transactions_policy" ON public.coindex_transactions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Políticas coindex_cards
DROP POLICY IF EXISTS "zero_trust_cards_policy" ON public.coindex_cards;
CREATE POLICY "zero_trust_cards_policy" ON public.coindex_cards
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Políticas coindex_banks
DROP POLICY IF EXISTS "zero_trust_banks_policy" ON public.coindex_banks;
CREATE POLICY "zero_trust_banks_policy" ON public.coindex_banks
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Políticas coindex_static_status
DROP POLICY IF EXISTS "zero_trust_static_status_policy" ON public.coindex_static_status;
CREATE POLICY "zero_trust_static_status_policy" ON public.coindex_static_status
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Políticas coindex_wishlist
DROP POLICY IF EXISTS "zero_trust_wishlist_policy" ON public.coindex_wishlist;
CREATE POLICY "zero_trust_wishlist_policy" ON public.coindex_wishlist
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. Políticas coindex_notes
DROP POLICY IF EXISTS "zero_trust_notes_policy" ON public.coindex_notes;
CREATE POLICY "zero_trust_notes_policy" ON public.coindex_notes
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. Políticas coindex_bio_logs
DROP POLICY IF EXISTS "zero_trust_bio_logs_policy" ON public.coindex_bio_logs;
CREATE POLICY "zero_trust_bio_logs_policy" ON public.coindex_bio_logs
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 8. Políticas coindex_okrs
DROP POLICY IF EXISTS "zero_trust_okrs_policy" ON public.coindex_okrs;
CREATE POLICY "zero_trust_okrs_policy" ON public.coindex_okrs
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9. Políticas coindex_user_settings
DROP POLICY IF EXISTS "zero_trust_user_settings_policy" ON public.coindex_user_settings;
CREATE POLICY "zero_trust_user_settings_policy" ON public.coindex_user_settings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
