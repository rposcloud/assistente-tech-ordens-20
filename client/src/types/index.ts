// Re-export types from schema
export type { 
  Cliente, 
  OrdemServico, 
  Produto, 
  User, 
  Profile,
  EntradaFinanceira,
  CategoriaFinanceira,
  TipoDefeito 
} from '../../../shared/schema';

export interface EnderecoViaCep {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
}