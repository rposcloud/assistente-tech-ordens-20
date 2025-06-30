
export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf_cnpj: string;
  tipo_documento: 'cpf' | 'cnpj';
  data_nascimento?: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  observacoes?: string;
}

// Interface unificada OrdemServico - compatível com banco de dados
export interface OrdemServico {
  id?: string;
  numero: string;
  cliente_id: string;
  tipo_equipamento: 'smartphone' | 'notebook' | 'desktop' | 'tablet' | 'outros' | 'todos';
  marca: string;
  modelo: string;
  numero_serie?: string;
  senha_equipamento?: string;
  acessorios?: string;
  condicoes_equipamento?: string;
  defeito_relatado: string;
  diagnostico_tecnico?: string;
  solucao_aplicada?: string;
  tecnico_responsavel?: string;
  prioridade?: string;
  valor_mao_obra: number;
  valor_orcamento?: number;
  valor_total: number;
  desconto?: number;
  acrescimo?: number;
  valor_final?: number;
  forma_pagamento?: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'parcelado';
  status_pagamento?: 'pendente' | 'pago' | 'parcial' | 'cancelado';
  data_pagamento?: string;
  data_vencimento?: string;
  data_previsao_entrega?: string;
  prazo_entrega?: string;
  garantia: number;
  status: 'aguardando_diagnostico' | 'aguardando_aprovacao' | 'aguardando_pecas' | 'em_reparo' | 'pronto_entrega' | 'entregue';
  aprovado_cliente?: boolean;
  data_aprovacao?: string;
  observacoes_internas?: string;
  observacoes_pagamento?: string;
  finalizada?: boolean;
  lucro?: number;
  margem_lucro?: number;
  historico_status?: any;
  data_abertura?: string;
  data_conclusao?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  // Relacionamento com cliente
  clientes?: {
    nome: string;
    telefone: string;
    email: string;
  };
  // Portal do cliente
  link_token?: string;
  link_expires_at?: string;
}

export interface PecaUtilizada {
  id: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface EnderecoViaCep {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
}

// Re-export from produto.ts
export type { Produto, ProdutoUtilizado, PecaUtilizada as PecaUtilizadaDB, TipoDefeito } from './produto';
