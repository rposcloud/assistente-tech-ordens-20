
-- Remover todas as políticas RLS existentes da tabela ordens_servico
DROP POLICY IF EXISTS "Users can view their own ordens" ON public.ordens_servico;
DROP POLICY IF EXISTS "Users can create their own ordens" ON public.ordens_servico;
DROP POLICY IF EXISTS "Users can update their own ordens" ON public.ordens_servico;
DROP POLICY IF EXISTS "Users can delete their own ordens" ON public.ordens_servico;
DROP POLICY IF EXISTS "Allow public access to orders via token" ON public.ordens_servico;

-- Recriar políticas RLS simples e funcionais
CREATE POLICY "select_own_orders" 
  ON public.ordens_servico 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "insert_own_orders" 
  ON public.ordens_servico 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_orders" 
  ON public.ordens_servico 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "delete_own_orders" 
  ON public.ordens_servico 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar política separada para acesso público via token (se necessário)
CREATE POLICY "public_access_via_token" 
  ON public.ordens_servico 
  FOR SELECT 
  USING (
    link_token IS NOT NULL 
    AND link_expires_at > now()
  );
