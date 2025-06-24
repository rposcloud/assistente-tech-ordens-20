
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
  historico_status?: any[];
  data_abertura?: string;
  data_conclusao?: string;
  created_at?: string;
  updated_at?: string;
}

export const useOrdens = () => {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrdens = async () => {
    if (!user) return;

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
      setOrdens(data || []);
    } catch (error) {
      console.error('Erro ao buscar ordens:', error);
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
      // Gerar número sequencial
      const { count } = await supabase
        .from('ordens_servico')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const numeroOrdem = `OS-${String((count || 0) + 1).padStart(4, '0')}`;

      const { data, error } = await supabase
        .from('ordens_servico')
        .insert({
          ...ordemData,
          user_id: user.id,
          numero: numeroOrdem,
          data_abertura: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      await fetchOrdens();
      return data;
    } catch (error) {
      console.error('Erro ao criar ordem:', error);
      throw error;
    }
  };

  const updateOrdem = async (id: string, ordemData: Partial<OrdemServico>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .update(ordemData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchOrdens();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      throw error;
    }
  };

  return {
    ordens,
    loading,
    createOrdem,
    updateOrdem,
    refetch: fetchOrdens
  };
};
