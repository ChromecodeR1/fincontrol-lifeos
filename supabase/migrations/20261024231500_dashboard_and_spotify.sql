-- 1. Coluna de configurações por gráfico em user_settings
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS chart_configs JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Tabela do plano mensal Spotify (1 registro por usuário proprietário)
CREATE TABLE IF NOT EXISTS public.spotify_plano (
  user_id UUID PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  total_mensal NUMERIC(10,2) NOT NULL DEFAULT 40.90 CHECK (total_mensal >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela de participantes do plano família
CREATE TABLE IF NOT EXISTS public.spotify_pessoas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  titular BOOLEAN NOT NULL DEFAULT false,
  cota NUMERIC(10,2) NOT NULL DEFAULT 6.82 CHECK (cota >= 0),
  inicio TEXT NULL CHECK (inicio IS NULL OR inicio ~ '^\d{4}-\d{2}$'),
  ativa BOOLEAN NOT NULL DEFAULT true,
  paga_automatico BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabela de pagamentos mensais por pessoa
CREATE TABLE IF NOT EXISTS public.spotify_pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES public.spotify_pessoas(id) ON DELETE CASCADE,
  mes TEXT NOT NULL CHECK (mes ~ '^\d{4}-\d{2}$'),
  valor NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
  pago_em DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT spotify_pagamentos_pessoa_mes_unique UNIQUE (pessoa_id, mes)
);

-- 5. Índices de performance
CREATE INDEX IF NOT EXISTS idx_spotify_pessoas_user_id ON public.spotify_pessoas(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_pagamentos_user_id ON public.spotify_pagamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_pagamentos_pessoa_mes ON public.spotify_pagamentos(pessoa_id, mes);

-- 6. Row Level Security (RLS) e Policies com (select auth.uid())
ALTER TABLE public.spotify_plano ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_pagamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "spotify_plano_owner_all" ON public.spotify_plano;
CREATE POLICY "spotify_plano_owner_all" ON public.spotify_plano
  FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "spotify_pessoas_owner_all" ON public.spotify_pessoas;
CREATE POLICY "spotify_pessoas_owner_all" ON public.spotify_pessoas
  FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "spotify_pagamentos_owner_all" ON public.spotify_pagamentos;
CREATE POLICY "spotify_pagamentos_owner_all" ON public.spotify_pagamentos
  FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);