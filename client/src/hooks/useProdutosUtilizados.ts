
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ProdutoUtilizado } from '@/types/produto';

export const useProdutosUtilizados = (ordemServicoId?: string) => {
  const [produtosUtilizados, setProdutosUtilizados] = useState<ProdutoUtilizado[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProdutosUtilizados = async () => {
    if (!user || !ordemServicoId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos_utilizados')
        .select(`
          *,
          produto:produtos(*)
        `)
        .eq('ordem_servico_id', ordemServicoId);

      if (error) throw error;

      setProdutosUtilizados(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos utilizados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutosUtilizados();
  }, [user, ordemServicoId]);

  const addProdutoUtilizado = async (produtoUtilizado: Omit<ProdutoUtilizado, 'id' | 'created_at'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('produtos_utilizados')
        .insert(produtoUtilizado)
        .select(`
          *,
          produto:produtos(*)
        `)
        .single();

      if (error) throw error;

      await fetchProdutosUtilizados();
      return data;
    } catch (error) {
      console.error('Erro ao adicionar produto utilizado:', error);
      throw error;
    }
  };

  const updateProdutoUtilizado = async (id: string, updates: Partial<ProdutoUtilizado>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('produtos_utilizados')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          produto:produtos(*)
        `)
        .single();

      if (error) throw error;

      await fetchProdutosUtilizados();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar produto utilizado:', error);
      throw error;
    }
  };

  const deleteProdutoUtilizado = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { error } = await supabase
        .from('produtos_utilizados')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProdutosUtilizados();
    } catch (error) {
      console.error('Erro ao deletar produto utilizado:', error);
      throw error;
    }
  };

  return {
    produtosUtilizados,
    loading,
    addProdutoUtilizado,
    updateProdutoUtilizado,
    deleteProdutoUtilizado,
    refetch: fetchProdutosUtilizados
  };
};
