-- ==============================================================================
-- COINDEX LIFEOS — SPRINT 49: ARQUITETURA 100% CLOUD-FIRST & PERSISTÊNCIA COMPLETA
-- ==============================================================================
-- Garante todas as colunas nativas no PostgreSQL para Desejos de Compra (BrainNote),
-- Cartões de Crédito com logo/limite, Instituições Bancárias e Configurações de Nuvem.
-- ==============================================================================

-- 1. TABELA BRAIN_NOTES (NOTAS E DESEJOS DE COMPRA)
CREATE TABLE IF NOT EXISTS public.brain_notes (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note_date TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    tag TEXT DEFAULT '#Ideias',
    item_type TEXT DEFAULT 'note',
    price NUMERIC(14, 2),
    completed BOOLEAN DEFAULT false,
    description TEXT,
    priority TEXT DEFAULT 'Planejado',
    store_url TEXT,
    target_month TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Adiciona colunas caso a tabela brain_notes já existisse com schema reduzido
ALTER TABLE public.brain_notes ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'note';
ALTER TABLE public.brain_notes ADD COLUMN IF NOT EXISTS price NUMERIC(14, 2);
ALTER TABLE public.brain_notes ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
ALTER TABLE public.brain_notes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.brain_notes ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Planejado';
ALTER TABLE public.brain_notes ADD COLUMN IF NOT EXISTS store_url TEXT;
ALTER TABLE public.brain_notes ADD COLUMN IF NOT EXISTS target_month TEXT;
ALTER TABLE public.brain_notes ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.brain_notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.brain_notes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_brain_notes_user_type ON public.brain_notes (user_id, item_type);
CREATE INDEX IF NOT EXISTS idx_brain_notes_user_date ON public.brain_notes (user_id, note_date DESC);

-- Habilita RLS em brain_notes
ALTER TABLE public.brain_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "brain_notes_user_policy" ON public.brain_notes;
CREATE POLICY "brain_notes_user_policy" ON public.brain_notes
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. TABELA CREDIT_CARDS
CREATE TABLE IF NOT EXISTS public.credit_cards (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    limit_amount NUMERIC(14, 2) DEFAULT 0,
    closing_day INT NOT NULL DEFAULT 1,
    due_day INT NOT NULL DEFAULT 10,
    logo_url TEXT,
    bank_id TEXT,
    bank_name TEXT,
    rev INT DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE public.credit_cards ADD COLUMN IF NOT EXISTS limit_amount NUMERIC(14, 2) DEFAULT 0;
ALTER TABLE public.credit_cards ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.credit_cards ADD COLUMN IF NOT EXISTS bank_id TEXT;
ALTER TABLE public.credit_cards ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE public.credit_cards ADD COLUMN IF NOT EXISTS rev INT DEFAULT 1;
ALTER TABLE public.credit_cards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.credit_cards ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "credit_cards_user_policy" ON public.credit_cards;
CREATE POLICY "credit_cards_user_policy" ON public.credit_cards
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. TABELA BANKS
CREATE TABLE IF NOT EXISTS public.banks (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo_url TEXT,
    limit_amount NUMERIC(14, 2),
    limit_type TEXT DEFAULT 'Cartão de Crédito',
    account_type TEXT DEFAULT 'Conta Digital',
    color TEXT,
    rev INT DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE public.banks ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.banks ADD COLUMN IF NOT EXISTS limit_amount NUMERIC(14, 2);
ALTER TABLE public.banks ADD COLUMN IF NOT EXISTS limit_type TEXT DEFAULT 'Cartão de Crédito';
ALTER TABLE public.banks ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'Conta Digital';
ALTER TABLE public.banks ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.banks ADD COLUMN IF NOT EXISTS rev INT DEFAULT 1;
ALTER TABLE public.banks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.banks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "banks_user_policy" ON public.banks;
CREATE POLICY "banks_user_policy" ON public.banks
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. ATUALIZAÇÃO EM TRANSACTIONS PARA SUPORTE TOTAL A VEÍCULOS E FLUXO
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS km NUMERIC(10, 1);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS liters NUMERIC(10, 2);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS fuel_type TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS full_tank BOOLEAN;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS flow_type TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS invoice_month TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS cash_month TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS debtor TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(14, 2) DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS installment_info TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS installment_group_id TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS wishlist_id TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 5. TABELA USER_SETTINGS
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    theme_mode TEXT DEFAULT 'tradicional',
    personal_budget_limit NUMERIC(14, 2) DEFAULT 350,
    monthly_investment_goal NUMERIC(14, 2),
    patrimony_target NUMERIC(14, 2),
    initial_patrimony NUMERIC(14, 2),
    annual_run_goal_km NUMERIC(10, 2),
    chart_theme TEXT,
    dashboard_layout JSONB,
    chart_configs JSONB,
    read_notification_ids JSONB,
    strava_config JSONB,
    strava_stats JSONB,
    cloud_backup_state JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS cloud_backup_state JSONB;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_settings_policy" ON public.user_settings;
CREATE POLICY "user_settings_policy" ON public.user_settings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
