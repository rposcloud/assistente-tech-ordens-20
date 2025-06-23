
-- Criar enum para tipos de documento
CREATE TYPE public.tipo_documento AS ENUM ('cpf', 'cnpj');

-- Criar enum para categoria de produto
CREATE TYPE public.categoria_produto AS ENUM ('peca', 'servico');

-- Criar enum para tipo de equipamento
CREATE TYPE public.tipo_equipamento AS ENUM ('smartphone', 'notebook', 'desktop', 'tablet', 'outros', 'todos');

-- Criar enum para status da ordem
CREATE TYPE public.status_ordem AS ENUM ('aguardando_diagnostico', 'aguardando_aprovacao', 'aguardando_pecas', 'em_reparo', 'pronto_entrega', 'entregue');

-- Criar enum para forma de pagamento
CREATE TYPE public.forma_pagamento AS ENUM ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'parcelado');

-- Criar enum para status de pagamento
CREATE TYPE public.status_pagamento AS ENUM ('pendente', 'pago', 'parcial', 'cancelado');

-- Criar enum para tipo de entrada financeira
CREATE TYPE public.tipo_entrada_financeira AS ENUM ('receita', 'despesa');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  empresa TEXT,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cpf_cnpj TEXT NOT NULL,
  tipo_documento tipo_documento NOT NULL DEFAULT 'cpf',
  data_nascimento DATE,
  cep TEXT,
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de produtos
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  codigo TEXT,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria categoria_produto NOT NULL,
  preco_custo DECIMAL(10,2) NOT NULL DEFAULT 0,
  preco_venda DECIMAL(10,2) NOT NULL DEFAULT 0,
  estoque INTEGER DEFAULT 0,
  unidade TEXT NOT NULL DEFAULT 'un',
  ativo BOOLEAN NOT NULL DEFAULT true,
  tipo_equipamento tipo_equipamento DEFAULT 'todos',
  tempo_estimado INTEGER DEFAULT 0, -- em minutos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de ordens de serviço
CREATE TABLE public.ordens_servico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  tipo_equipamento tipo_equipamento NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  numero_serie TEXT,
  defeito_relatado TEXT NOT NULL,
  diagnostico_tecnico TEXT,
  solucao_aplicada TEXT,
  valor_mao_obra DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  desconto DECIMAL(10,2) DEFAULT 0,
  acrescimo DECIMAL(10,2) DEFAULT 0,
  valor_final DECIMAL(10,2) DEFAULT 0,
  forma_pagamento forma_pagamento,
  status_pagamento status_pagamento DEFAULT 'pendente',
  data_pagamento TIMESTAMP WITH TIME ZONE,
  data_vencimento TIMESTAMP WITH TIME ZONE,
  observacoes_pagamento TEXT,
  finalizada BOOLEAN NOT NULL DEFAULT false,
  lucro DECIMAL(10,2) DEFAULT 0,
  margem_lucro DECIMAL(5,2) DEFAULT 0,
  link_token TEXT UNIQUE,
  link_expires_at TIMESTAMP WITH TIME ZONE,
  prazo_entrega DATE,
  garantia INTEGER NOT NULL DEFAULT 90, -- em dias
  status status_ordem NOT NULL DEFAULT 'aguardando_diagnostico',
  data_abertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_conclusao TIMESTAMP WITH TIME ZONE,
  observacoes_internas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de peças utilizadas (compatibilidade com sistema antigo)
CREATE TABLE public.pecas_utilizadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem_servico_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de produtos utilizados (nova estrutura)
CREATE TABLE public.produtos_utilizados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem_servico_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de entradas financeiras
CREATE TABLE public.entradas_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo tipo_entrada_financeira NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  categoria TEXT NOT NULL,
  forma_pagamento forma_pagamento NOT NULL,
  data_vencimento DATE NOT NULL,
  status status_pagamento NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pecas_utilizadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos_utilizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entradas_financeiras ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para clientes
CREATE POLICY "Users can view own clients" ON public.clientes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own clients" ON public.clientes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON public.clientes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON public.clientes
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para produtos
CREATE POLICY "Users can view own products" ON public.produtos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own products" ON public.produtos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON public.produtos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON public.produtos
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para ordens de serviço
CREATE POLICY "Users can view own orders" ON public.ordens_servico
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.ordens_servico
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.ordens_servico
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders" ON public.ordens_servico
  FOR DELETE USING (auth.uid() = user_id);

-- Política especial para acesso via token do portal cliente
CREATE POLICY "Portal access via token" ON public.ordens_servico
  FOR SELECT USING (
    link_token IS NOT NULL 
    AND link_expires_at > now()
    AND EXISTS (
      SELECT 1 FROM public.ordens_servico os 
      WHERE os.link_token = ordens_servico.link_token
    )
  );

-- Políticas RLS para peças utilizadas
CREATE POLICY "Users can view own used parts" ON public.pecas_utilizadas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico os 
      WHERE os.id = ordem_servico_id AND os.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own used parts" ON public.pecas_utilizadas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ordens_servico os 
      WHERE os.id = ordem_servico_id AND os.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own used parts" ON public.pecas_utilizadas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico os 
      WHERE os.id = ordem_servico_id AND os.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own used parts" ON public.pecas_utilizadas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico os 
      WHERE os.id = ordem_servico_id AND os.user_id = auth.uid()
    )
  );

-- Políticas RLS para produtos utilizados
CREATE POLICY "Users can view own used products" ON public.produtos_utilizados
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico os 
      WHERE os.id = ordem_servico_id AND os.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own used products" ON public.produtos_utilizados
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ordens_servico os 
      WHERE os.id = ordem_servico_id AND os.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own used products" ON public.produtos_utilizados
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico os 
      WHERE os.id = ordem_servico_id AND os.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own used products" ON public.produtos_utilizados
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico os 
      WHERE os.id = ordem_servico_id AND os.user_id = auth.uid()
    )
  );

-- Políticas RLS para entradas financeiras
CREATE POLICY "Users can view own financial entries" ON public.entradas_financeiras
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own financial entries" ON public.entradas_financeiras
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial entries" ON public.entradas_financeiras
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial entries" ON public.entradas_financeiras
  FOR DELETE USING (auth.uid() = user_id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  RETURN new;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at 
  BEFORE UPDATE ON public.clientes 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at 
  BEFORE UPDATE ON public.produtos 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_ordens_servico_updated_at 
  BEFORE UPDATE ON public.ordens_servico 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_entradas_financeiras_updated_at 
  BEFORE UPDATE ON public.entradas_financeiras 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX idx_clientes_nome ON public.clientes(nome);
CREATE INDEX idx_clientes_cpf_cnpj ON public.clientes(cpf_cnpj);

CREATE INDEX idx_produtos_user_id ON public.produtos(user_id);
CREATE INDEX idx_produtos_categoria ON public.produtos(categoria);
CREATE INDEX idx_produtos_ativo ON public.produtos(ativo);

CREATE INDEX idx_ordens_servico_user_id ON public.ordens_servico(user_id);
CREATE INDEX idx_ordens_servico_cliente_id ON public.ordens_servico(cliente_id);
CREATE INDEX idx_ordens_servico_status ON public.ordens_servico(status);
CREATE INDEX idx_ordens_servico_data_abertura ON public.ordens_servico(data_abertura);
CREATE INDEX idx_ordens_servico_link_token ON public.ordens_servico(link_token);

CREATE INDEX idx_produtos_utilizados_ordem_id ON public.produtos_utilizados(ordem_servico_id);
CREATE INDEX idx_produtos_utilizados_produto_id ON public.produtos_utilizados(produto_id);

CREATE INDEX idx_pecas_utilizadas_ordem_id ON public.pecas_utilizadas(ordem_servico_id);

CREATE INDEX idx_entradas_financeiras_user_id ON public.entradas_financeiras(user_id);
CREATE INDEX idx_entradas_financeiras_data ON public.entradas_financeiras(data_vencimento);
CREATE INDEX idx_entradas_financeiras_tipo ON public.entradas_financeiras(tipo);
