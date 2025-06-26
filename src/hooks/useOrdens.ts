
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  clientes?: {
    nome: string;
    telefone: string;
    email: string;
  };
}

export const useOrdens = () => {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrdens = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          clientes (
            nome,
            telefone,
            email
          )
        `)
        .eq('user_id', user.id)
        .order('data_abertura', { ascending: false });

      if (error) throw error;
      
      const ordensFormatadas = (data || []).map(ordem => ({
        ...ordem,
        historico_status: ordem.historico_status || []
      })) as OrdemServico[];
      
      setOrdens(ordensFormatadas);
    } catch (error) {
      console.error('Erro ao buscar ordens:', error);
      setOrdens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdens();
  }, [user]);

  const createOrdem = async (ordemData: Omit<OrdemServico, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    // Gerar número simples baseado em timestamp
    const numeroOrdem = `OS-${Date.now()}`;
    
    const dadosParaInserir = {
      user_id: user.id,
      numero: numeroOrdem,
      cliente_id: ordemData.cliente_id,
      tipo_equipamento: ordemData.tipo_equipamento || 'smartphone',
      marca: ordemData.marca || '',
      modelo: ordemData.modelo || '',
      numero_serie: ordemData.numero_serie || null,
      senha_equipamento: ordemData.senha_equipamento || null,
      acessorios: ordemData.acessorios || null,
      condicoes_equipamento: ordemData.condicoes_equipamento || null,
      defeito_relatado: ordemData.defeito_relatado || '',
      diagnostico_tecnico: ordemData.diagnostico_tecnico || null,
      solucao_aplicada: ordemData.solucao_aplicada || null,
      tecnico_responsavel: ordemData.tecnico_responsavel || null,
      prioridade: ordemData.prioridade || 'normal',
      valor_mao_obra: Number(ordemData.valor_mao_obra) || 0,
      valor_orcamento: Number(ordemData.valor_orcamento) || 0,
      valor_total: Number(ordemData.valor_total) || 0,
      desconto: Number(ordemData.desconto) || 0,
      acrescimo: Number(ordemData.acrescimo) || 0,
      valor_final: Number(ordemData.valor_final) || 0,
      forma_pagamento: ordemData.forma_pagamento || null,
      status_pagamento: ordemData.status_pagamento || 'pendente',
      data_pagamento: ordemData.data_pagamento || null,
      data_vencimento: ordemData.data_vencimento || null,
      data_previsao_entrega: ordemData.data_previsao_entrega || null,
      prazo_entrega: ordemData.prazo_entrega || null,
      garantia: Number(ordemData.garantia) || 90,
      status: ordemData.status || 'aguardando_diagnostico',
      aprovado_cliente: Boolean(ordemData.aprovado_cliente) || false,
      data_aprovacao: ordemData.data_aprovacao || null,
      observacoes_internas: ordemData.observacoes_internas || null,
      observacoes_pagamento: ordemData.observacoes_pagamento || null,
      finalizada: Boolean(ordemData.finalizada) || false,
      lucro: Number(ordemData.lucro) || 0,
      margem_lucro: Number(ordemData.margem_lucro) || 0,
      historico_status: ordemData.historico_status || [],
      data_abertura: new Date().toISOString(),
      data_conclusao: ordemData.data_conclusao || null
    };

    const { data, error } = await supabase
      .from('ordens_servico')
      .insert(dadosParaInserir)
      .select()
      .single();

    if (error) throw error;
    
    await fetchOrdens();
    return data;
  };

  const updateOrdem = async (id: string, ordemData: Partial<OrdemServico>) => {
    if (!user) throw new Error('Usuário não autenticado');

    const { clientes, ...dadosParaAtualizar } = ordemData as any;

    const { data, error } = await supabase
      .from('ordens_servico')
      .update(dadosParaAtualizar)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    await fetchOrdens();
    return data;
  };

  const deleteOrdem = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('ordens_servico')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    await fetchOrdens();
  };

  return {
    ordens,
    loading,
    createOrdem,
    updateOrdem,
    deleteOrdem,
    refetch: fetchOrdens
  };
};
