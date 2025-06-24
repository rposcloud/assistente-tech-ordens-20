
-- Criar políticas RLS para a tabela ordens_servico
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;

-- Política para SELECT - usuários podem ver suas próprias ordens
CREATE POLICY "Users can view their own ordens" 
  ON public.ordens_servico 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para INSERT - usuários podem criar suas próprias ordens
CREATE POLICY "Users can create their own ordens" 
  ON public.ordens_servico 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE - usuários podem atualizar suas próprias ordens
CREATE POLICY "Users can update their own ordens" 
  ON public.ordens_servico 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para DELETE - usuários podem deletar suas próprias ordens
CREATE POLICY "Users can delete their own ordens" 
  ON public.ordens_servico 
  FOR DELETE 
  USING (auth.uid() = user_id);
