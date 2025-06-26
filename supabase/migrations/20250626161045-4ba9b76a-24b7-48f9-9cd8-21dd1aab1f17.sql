
-- Remover todas as políticas RLS problemáticas da tabela ordens_servico
DROP POLICY IF EXISTS "Users can view their own ordens" ON public.ordens_servico;
DROP POLICY IF EXISTS "Users can create their own ordens" ON public.ordens_servico;
DROP POLICY IF EXISTS "Users can update their own ordens" ON public.ordens_servico;
DROP POLICY IF EXISTS "Users can delete their own ordens" ON public.ordens_servico;
DROP POLICY IF EXISTS "Allow public access to orders via token" ON public.ordens_servico;
DROP POLICY IF EXISTS "select_own_orders" ON public.ordens_servico;
DROP POLICY IF EXISTS "insert_own_orders" ON public.ordens_servico;
DROP POLICY IF EXISTS "update_own_orders" ON public.ordens_servico;
DROP POLICY IF EXISTS "delete_own_orders" ON public.ordens_servico;
DROP POLICY IF EXISTS "public_access_via_token" ON public.ordens_servico;

-- Criar políticas RLS simples e funcionais
CREATE POLICY "ordens_select_policy" 
  ON public.ordens_servico 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "ordens_insert_policy" 
  ON public.ordens_servico 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ordens_update_policy" 
  ON public.ordens_servico 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "ordens_delete_policy" 
  ON public.ordens_servico 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Política para acesso público via token (sem recursão)
CREATE POLICY "ordens_public_token_policy" 
  ON public.ordens_servico 
  FOR SELECT 
  USING (
    link_token IS NOT NULL 
    AND link_expires_at > now()
  );
