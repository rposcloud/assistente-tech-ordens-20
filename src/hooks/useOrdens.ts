
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
  // Para dados relacionados
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
      console.log('Fetching ordens for user:', user.id);
      
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
        console.error('Error fetching ordens:', error);
        throw error;
      }
      
      console.log('Fetched ordens:', data?.length || 0);
      
      // Converter os dados para o tipo esperado
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
    if (!user) {
      console.error('User not authenticated');
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('Creating ordem for user:', user.id);
      console.log('Ordem data:', ordemData);

      // Gerar número sequencial
      const { count, error: countError } = await supabase
        .from('ordens_servico')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.error('Error counting ordens:', countError);
        throw countError;
      }

      const numeroOrdem = `OS-${String((count || 0) + 1).padStart(4, '0')}`;
      console.log('Generated order number:', numeroOrdem);

      // Remover dados aninhados antes de inserir
      const { clientes, ...dadosParaInserir } = ordemData as any;

      // Preparar dados para inserção com user_id obrigatório
      const dadosInsercao = {
        ...dadosParaInserir,
        user_id: user.id, // Campo obrigatório para RLS
        numero: numeroOrdem,
        data_abertura: new Date().toISOString(),
        // Garantir que campos numéricos tenham valores válidos
        valor_mao_obra: dadosParaInserir.valor_mao_obra || 0,
        valor_total: dadosParaInserir.valor_total || 0,
        garantia: dadosParaInserir.garantia || 90,
        finalizada: false,
        status: dadosParaInserir.status || 'aguardando_diagnostico'
      };

      console.log('Data to insert:', dadosInsercao);

      const { data, error } = await supabase
        .from('ordens_servico')
        .insert(dadosInsercao)
        .select()
        .single();

      if (error) {
        console.error('Error creating ordem:', error);
        throw error;
      }

      console.log('Ordem created successfully:', data);
      await fetchOrdens();
      return data;
    } catch (error) {
      console.error('Erro ao criar ordem:', error);
      throw error;
    }
  };

  const updateOrdem = async (id: string, ordemData: Partial<OrdemServico>) => {
    if (!user) {
      console.error('User not authenticated');
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('Updating ordem:', id, 'for user:', user.id);
      console.log('Update data:', ordemData);

      // Remover dados aninhados antes de atualizar
      const { clientes, ...dadosParaAtualizar } = ordemData as any;

      const { data, error } = await supabase
        .from('ordens_servico')
        .update(dadosParaAtualizar)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating ordem:', error);
        throw error;
      }

      console.log('Ordem updated successfully:', data);
      await fetchOrdens();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      throw error;
    }
  };

  const deleteOrdem = async (id: string) => {
    if (!user) {
      console.error('User not authenticated');
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('Deleting ordem:', id, 'for user:', user.id);

      const { error } = await supabase
        .from('ordens_servico')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting ordem:', error);
        throw error;
      }

      console.log('Ordem deleted successfully');
      await fetchOrdens();
    } catch (error) {
      console.error('Erro ao deletar ordem:', error);
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
