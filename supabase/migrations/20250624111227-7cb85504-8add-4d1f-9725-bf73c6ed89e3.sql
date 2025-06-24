
-- Adicionar campos que podem estar faltando na tabela ordens_servico
-- Verificar se todos os campos necessários existem
ALTER TABLE public.ordens_servico 
ADD COLUMN IF NOT EXISTS senha_equipamento TEXT,
ADD COLUMN IF NOT EXISTS acessorios TEXT,
ADD COLUMN IF NOT EXISTS condicoes_equipamento TEXT,
ADD COLUMN IF NOT EXISTS tecnico_responsavel TEXT,
ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS data_previsao_entrega DATE,
ADD COLUMN IF NOT EXISTS valor_orcamento DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS aprovado_cliente BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS historico_status JSONB DEFAULT '[]'::jsonb;

-- Adicionar campos que podem estar faltando na tabela entradas_financeiras
ALTER TABLE public.entradas_financeiras
ADD COLUMN IF NOT EXISTS parcelas INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parcela_atual INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS valor_parcela DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS centro_custo TEXT,
ADD COLUMN IF NOT EXISTS conta_bancaria TEXT,
ADD COLUMN IF NOT EXISTS numero_documento TEXT,
ADD COLUMN IF NOT EXISTS pessoa_responsavel TEXT;

-- Criar tabela para tipos de defeito comuns (facilitar preenchimento)
CREATE TABLE IF NOT EXISTS public.tipos_defeito (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo_equipamento tipo_equipamento NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para tipos_defeito
ALTER TABLE public.tipos_defeito ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tipos_defeito
CREATE POLICY "Users can view own defect types" ON public.tipos_defeito
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own defect types" ON public.tipos_defeito
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own defect types" ON public.tipos_defeito
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own defect types" ON public.tipos_defeito
  FOR DELETE USING (auth.uid() = user_id);

-- Criar tabela para categorias financeiras predefinidas
CREATE TABLE IF NOT EXISTS public.categorias_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo tipo_entrada_financeira NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para categorias_financeiras
ALTER TABLE public.categorias_financeiras ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorias_financeiras
CREATE POLICY "Users can view own financial categories" ON public.categorias_financeiras
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own financial categories" ON public.categorias_financeiras
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial categories" ON public.categorias_financeiras
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial categories" ON public.categorias_financeiras
  FOR DELETE USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tipos_defeito_user_id ON public.tipos_defeito(user_id);
CREATE INDEX IF NOT EXISTS idx_tipos_defeito_tipo_equipamento ON public.tipos_defeito(tipo_equipamento);
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_user_id ON public.categorias_financeiras(user_id);
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_tipo ON public.categorias_financeiras(tipo);

-- Inserir algumas categorias padrão para novos usuários
-- Isso será feito via trigger quando um usuário se cadastrar
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Inserir categorias de receita padrão
  INSERT INTO public.categorias_financeiras (user_id, nome, tipo) VALUES
    (NEW.id, 'Serviços de Reparo', 'receita'),
    (NEW.id, 'Venda de Peças', 'receita'),
    (NEW.id, 'Consultoria Técnica', 'receita'),
    (NEW.id, 'Outros Serviços', 'receita');
    
  -- Inserir categorias de despesa padrão
  INSERT INTO public.categorias_financeiras (user_id, nome, tipo) VALUES
    (NEW.id, 'Compra de Peças', 'despesa'),
    (NEW.id, 'Aluguel', 'despesa'),
    (NEW.id, 'Energia Elétrica', 'despesa'),
    (NEW.id, 'Telefone/Internet', 'despesa'),
    (NEW.id, 'Material de Escritório', 'despesa'),
    (NEW.id, 'Outras Despesas', 'despesa');
    
  -- Inserir tipos de defeito padrão para smartphones
  INSERT INTO public.tipos_defeito (user_id, nome, tipo_equipamento) VALUES
    (NEW.id, 'Tela quebrada', 'smartphone'),
    (NEW.id, 'Não liga', 'smartphone'),
    (NEW.id, 'Bateria viciada', 'smartphone'),
    (NEW.id, 'Problema no carregamento', 'smartphone'),
    (NEW.id, 'Câmera não funciona', 'smartphone'),
    (NEW.id, 'Áudio/Microfone', 'smartphone');
    
  -- Inserir tipos de defeito padrão para notebooks
  INSERT INTO public.tipos_defeito (user_id, nome, tipo_equipamento) VALUES
    (NEW.id, 'Tela quebrada', 'notebook'),
    (NEW.id, 'Não liga', 'notebook'),
    (NEW.id, 'Superaquecimento', 'notebook'),
    (NEW.id, 'Teclado com defeito', 'notebook'),
    (NEW.id, 'HD/SSD com problema', 'notebook'),
    (NEW.id, 'Problema de memória RAM', 'notebook');

  RETURN NEW;
END;
$$;

-- Trigger para criar categorias padrão para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created_categories ON auth.users;
CREATE TRIGGER on_auth_user_created_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_default_categories();
