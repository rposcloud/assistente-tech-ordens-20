
export interface Produto {
  id: string;
  codigo?: string;
  nome: string;
  descricao?: string;
  categoria: 'peca' | 'servico';
  preco_custo: number;
  preco_venda: number;
  estoque?: number;
  unidade: string;
  ativo: boolean;
  tipo_equipamento?: 'smartphone' | 'notebook' | 'desktop' | 'tablet' | 'outros' | 'todos';
  tempo_estimado?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ProdutoUtilizado {
  id: string;
  ordem_servico_id: string;
  produto_id: string;
  produto?: Produto;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  created_at: string;
}

export interface PecaUtilizada {
  id: string;
  ordem_servico_id: string;
  nome: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  created_at: string;
}

export interface TipoDefeito {
  id: string;
  user_id: string;
  nome: string;
  descricao?: string;
  tipo_equipamento: 'smartphone' | 'notebook' | 'desktop' | 'tablet' | 'outros' | 'todos';
  ativo: boolean;
  created_at: string;
}
