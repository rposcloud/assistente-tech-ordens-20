
export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  tipoDocumento: 'cpf' | 'cnpj';
  dataNascimento?: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  observacoes?: string;
}

export interface OrdemServico {
  id: string;
  numero: string;
  clienteId: string;
  tipoEquipamento: 'smartphone' | 'notebook' | 'desktop' | 'tablet' | 'outros' | 'todos';
  marca: string;
  modelo: string;
  numeroSerie?: string;
  defeitoRelatado: string;
  diagnosticoTecnico?: string;
  solucaoAplicada?: string;
  pecasUtilizadas?: PecaUtilizada[];
  produtosUtilizados?: import('./produto').ProdutoUtilizado[];
  valorMaoObra: number;
  valorTotal: number;
  // Novos campos financeiros
  desconto?: number;
  acrescimo?: number;
  valorFinal?: number;
  formaPagamento?: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'parcelado';
  statusPagamento?: 'pendente' | 'pago' | 'parcial' | 'cancelado';
  dataPagamento?: string;
  dataVencimento?: string;
  observacoesPagamento?: string;
  finalizada?: boolean;
  lucro?: number;
  margemLucro?: number;
  // Portal do cliente
  linkToken?: string;
  linkExpiresAt?: string;
  // Campos existentes
  prazoEntrega?: string;
  garantia: number; // em dias
  status: 'aguardando_diagnostico' | 'aguardando_aprovacao' | 'aguardando_pecas' | 'em_reparo' | 'pronto_entrega' | 'entregue';
  dataAbertura: string;
  dataConclusao?: string;
  observacoesInternas?: string;
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
export type { Produto, ProdutoUtilizado } from './produto';
