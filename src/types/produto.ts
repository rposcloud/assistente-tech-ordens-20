
export interface Produto {
  id: string;
  codigo?: string; // Adding the missing codigo property
  nome: string;
  descricao: string;
  categoria: 'peca' | 'servico';
  precoCusto: number;
  precoVenda: number;
  estoque?: number; // apenas para peças
  unidade: string;
  ativo: boolean;
  tipoEquipamento?: 'smartphone' | 'notebook' | 'desktop' | 'tablet' | 'outros' | 'todos';
  tempoEstimado?: number; // em minutos, para serviços
  createdAt: string;
  updatedAt: string;
}

export interface ProdutoUtilizado {
  id: string;
  produtoId: string;
  produto: Produto;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}
