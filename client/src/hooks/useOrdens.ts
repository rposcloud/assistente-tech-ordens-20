
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { OrdemServico } from '@/types';

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

      if (error) {
        console.error('Erro detalhado ao buscar ordens:', error);
        throw error;
      }
      
      console.log('Ordens carregadas:', data?.length || 0);
      
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

    try {
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

      console.log('Criando ordem com dados:', dadosParaInserir);

      const { data, error } = await supabase
        .from('ordens_servico')
        .insert(dadosParaInserir)
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao criar ordem:', error);
        throw error;
      }
      
      console.log('Ordem criada com sucesso:', data);
      await fetchOrdens();
      return data;
    } catch (error) {
      console.error('Erro no createOrdem:', error);
      throw error;
    }
  };

  const updateOrdem = async (id: string, ordemData: Partial<OrdemServico>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { clientes, ...dadosParaAtualizar } = ordemData as any;

      console.log('Atualizando ordem:', id, dadosParaAtualizar);

      const { data, error } = await supabase
        .from('ordens_servico')
        .update(dadosParaAtualizar)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao atualizar ordem:', error);
        throw error;
      }

      console.log('Ordem atualizada com sucesso:', data);
      await fetchOrdens();
      return data;
    } catch (error) {
      console.error('Erro no updateOrdem:', error);
      throw error;
    }
  };

  const deleteOrdem = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      console.log('Excluindo ordem:', id);

      const { error } = await supabase
        .from('ordens_servico')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro detalhado ao excluir ordem:', error);
        throw error;
      }

      console.log('Ordem excluída com sucesso');
      await fetchOrdens();
    } catch (error) {
      console.error('Erro no deleteOrdem:', error);
      throw error;
    }
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

export type { OrdemServico };
