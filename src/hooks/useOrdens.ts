
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
      console.log('User not authenticated for fetching ordens');
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
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('Successfully fetched ordens:', data?.length || 0);
      
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
      const errorMsg = 'Usuário não autenticado';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      console.log('=== INÍCIO CRIAÇÃO DE ORDEM ===');
      console.log('User ID:', user.id);
      console.log('Dados recebidos:', JSON.stringify(ordemData, null, 2));

      // Validar dados obrigatórios
      const validationErrors = [];
      if (!ordemData.cliente_id) validationErrors.push('Cliente é obrigatório');
      if (!ordemData.marca?.trim()) validationErrors.push('Marca é obrigatória');
      if (!ordemData.modelo?.trim()) validationErrors.push('Modelo é obrigatório');
      if (!ordemData.defeito_relatado?.trim()) validationErrors.push('Defeito relatado é obrigatório');

      if (validationErrors.length > 0) {
        const errorMsg = `Erro de validação: ${validationErrors.join(', ')}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Gerar número sequencial com retry em caso de erro
      let numeroOrdem = '';
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          console.log(`Tentativa ${retryCount + 1} de gerar número da ordem`);
          
          const { count, error: countError } = await supabase
            .from('ordens_servico')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          if (countError) {
            console.error('Erro ao contar ordens:', countError);
            console.error('Count error details:', JSON.stringify(countError, null, 2));
            throw countError;
          }

          numeroOrdem = `OS-${String((count || 0) + 1).padStart(4, '0')}`;
          console.log('Número da ordem gerado:', numeroOrdem);
          break;
        } catch (error) {
          retryCount++;
          console.error(`Erro na tentativa ${retryCount}:`, error);
          if (retryCount >= maxRetries) {
            throw new Error(`Falha ao gerar número da ordem após ${maxRetries} tentativas: ${error}`);
          }
          // Aguardar 1 segundo antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Remover dados aninhados e preparar para inserção
      const { clientes, ...dadosLimpos } = ordemData as any;

      // Preparar dados para inserção com validação rigorosa
      const dadosInsercao = {
        user_id: user.id, // Campo obrigatório para RLS
        numero: numeroOrdem,
        cliente_id: ordemData.cliente_id,
        tipo_equipamento: ordemData.tipo_equipamento || 'smartphone',
        marca: String(ordemData.marca || '').trim(),
        modelo: String(ordemData.modelo || '').trim(),
        numero_serie: ordemData.numero_serie?.trim() || null,
        senha_equipamento: ordemData.senha_equipamento?.trim() || null,
        acessorios: ordemData.acessorios?.trim() || null,
        condicoes_equipamento: ordemData.condicoes_equipamento?.trim() || null,
        defeito_relatado: String(ordemData.defeito_relatado || '').trim(),
        diagnostico_tecnico: ordemData.diagnostico_tecnico?.trim() || null,
        solucao_aplicada: ordemData.solucao_aplicada?.trim() || null,
        tecnico_responsavel: ordemData.tecnico_responsavel?.trim() || null,
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
        observacoes_internas: ordemData.observacoes_internas?.trim() || null,
        observacoes_pagamento: ordemData.observacoes_pagamento?.trim() || null,
        finalizada: Boolean(ordemData.finalizada) || false,
        lucro: Number(ordemData.lucro) || 0,
        margem_lucro: Number(ordemData.margem_lucro) || 0,
        historico_status: ordemData.historico_status || [],
        data_abertura: new Date().toISOString(),
        data_conclusao: ordemData.data_conclusao || null
      };

      console.log('Dados preparados para inserção:', JSON.stringify(dadosInsercao, null, 2));

      // Inserir no banco de dados com retry
      let insertResult = null;
      retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          console.log(`Tentativa ${retryCount + 1} de inserção no banco`);
          
          const { data, error } = await supabase
            .from('ordens_servico')
            .insert(dadosInsercao)
            .select()
            .single();

          if (error) {
            console.error('Erro na inserção:', error);
            console.error('Insert error details:', JSON.stringify(error, null, 2));
            throw error;
          }

          insertResult = data;
          console.log('Ordem inserida com sucesso:', data);
          break;
        } catch (error) {
          retryCount++;
          console.error(`Erro na tentativa de inserção ${retryCount}:`, error);
          if (retryCount >= maxRetries) {
            throw new Error(`Falha ao inserir ordem após ${maxRetries} tentativas: ${error}`);
          }
          // Aguardar 1 segundo antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log('=== ORDEM CRIADA COM SUCESSO ===');
      
      // Recarregar as ordens
      await fetchOrdens();
      
      return insertResult;
    } catch (error: any) {
      console.error('=== ERRO CRÍTICO NA CRIAÇÃO DE ORDEM ===');
      console.error('Erro completo:', error);
      console.error('Stack trace:', error.stack);
      console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
      
      // Melhorar a mensagem de erro para o usuário
      let userFriendlyMessage = 'Erro desconhecido ao criar ordem';
      
      if (error.message) {
        userFriendlyMessage = error.message;
      } else if (error.code) {
        switch (error.code) {
          case '23505':
            userFriendlyMessage = 'Já existe uma ordem com estes dados';
            break;
          case '23503':
            userFriendlyMessage = 'Cliente selecionado não encontrado';
            break;
          case '42501':
            userFriendlyMessage = 'Sem permissão para criar ordem';
            break;
          default:
            userFriendlyMessage = `Erro do banco de dados: ${error.code}`;
        }
      }
      
      throw new Error(userFriendlyMessage);
    }
  };

  const updateOrdem = async (id: string, ordemData: Partial<OrdemServico>) => {
    if (!user) {
      const errorMsg = 'Usuário não autenticado';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      console.log('=== INÍCIO ATUALIZAÇÃO DE ORDEM ===');
      console.log('Ordem ID:', id);
      console.log('User ID:', user.id);
      console.log('Dados para atualização:', JSON.stringify(ordemData, null, 2));

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
        console.error('Erro na atualização:', error);
        console.error('Update error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('Ordem atualizada com sucesso:', data);
      await fetchOrdens();
      return data;
    } catch (error: any) {
      console.error('=== ERRO NA ATUALIZAÇÃO DE ORDEM ===');
      console.error('Erro completo:', error);
      throw new Error(error.message || 'Erro ao atualizar ordem');
    }
  };

  const deleteOrdem = async (id: string) => {
    if (!user) {
      const errorMsg = 'Usuário não autenticado';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      console.log('=== INÍCIO EXCLUSÃO DE ORDEM ===');
      console.log('Ordem ID:', id);
      console.log('User ID:', user.id);

      const { error } = await supabase
        .from('ordens_servico')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro na exclusão:', error);
        console.error('Delete error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('Ordem excluída com sucesso');
      await fetchOrdens();
    } catch (error: any) {
      console.error('=== ERRO NA EXCLUSÃO DE ORDEM ===');
      console.error('Erro completo:', error);
      throw new Error(error.message || 'Erro ao excluir ordem');
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
