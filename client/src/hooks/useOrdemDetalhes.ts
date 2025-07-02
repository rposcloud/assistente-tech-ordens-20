import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface OrdemDetalhes {
  id: string;
  numero: string;
  cliente_id: string;
  status: string;
  prioridade: string;
  tipo_equipamento: string;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  senha_equipamento?: string;
  defeito_relatado?: string;
  diagnostico_tecnico?: string;
  solucao_aplicada?: string;
  valor_mao_obra: string | number;
  valor_total: string | number;
  desconto: string | number;
  valor_final: string | number;
  data_abertura: string;
  clientes?: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    cpf_cnpj: string;
  };
  empresa?: {
    id: string;
    nome_completo: string;
    empresa?: string;
    telefone?: string;
    email_empresa?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cnpj?: string;
  };
  produtos_utilizados?: Array<{
    id: string;
    quantidade: number;
    valor_unitario: string | number;
    valor_total: string | number;
    produto: {
      id: string;
      nome: string;
      categoria: string;
      descricao?: string;
      preco_custo: string | number;
      preco_venda: string | number;
    };
  }>;
  pecas_utilizadas?: Array<{
    id: string;
    nome: string;
    quantidade: number;
    valor_unitario: string | number;
    valor_total: string | number;
  }>;
}

export const useOrdemDetalhes = (ordemId?: string) => {
  return useQuery({
    queryKey: ['/ordens', ordemId, 'print'],
    queryFn: async (): Promise<OrdemDetalhes> => {
      const response = await fetch(`/api/ordens/${ordemId}/print`);
      if (!response.ok) {
        throw new Error('Erro ao buscar detalhes da ordem');
      }
      return response.json();
    },
    enabled: !!ordemId,
  });
};