
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Produto } from '@/types';

export const useProdutos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProdutos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('user_id', user.id)
        .order('nome');

      if (error) throw error;

      const produtosFormatted = data.map(produto => ({
        ...produto,
        precoCusto: Number(produto.preco_custo),
        precoVenda: Number(produto.preco_venda),
        tipoEquipamento: produto.tipo_equipamento,
        tempoEstimado: produto.tempo_estimado,
        createdAt: produto.created_at,
        updatedAt: produto.updated_at
      }));

      setProdutos(produtosFormatted);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [user]);

  const createProduto = async (produtoData: Omit<Produto, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert({
          user_id: user.id,
          codigo: produtoData.codigo,
          nome: produtoData.nome,
          descricao: produtoData.descricao,
          categoria: produtoData.categoria,
          preco_custo: produtoData.precoCusto,
          preco_venda: produtoData.precoVenda,
          estoque: produtoData.estoque,
          unidade: produtoData.unidade,
          ativo: produtoData.ativo,
          tipo_equipamento: produtoData.tipoEquipamento,
          tempo_estimado: produtoData.tempoEstimado
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProdutos(); // Recarregar lista
      return data;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  };

  const updateProduto = async (id: string, produtoData: Partial<Produto>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('produtos')
        .update({
          codigo: produtoData.codigo,
          nome: produtoData.nome,
          descricao: produtoData.descricao,
          categoria: produtoData.categoria,
          preco_custo: produtoData.precoCusto,
          preco_venda: produtoData.precoVenda,
          estoque: produtoData.estoque,
          unidade: produtoData.unidade,
          ativo: produtoData.ativo,
          tipo_equipamento: produtoData.tipoEquipamento,
          tempo_estimado: produtoData.tempoEstimado
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchProdutos(); // Recarregar lista
      return data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  };

  const deleteProduto = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchProdutos(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  };

  return {
    produtos,
    loading,
    createProduto,
    updateProduto,
    deleteProduto,
    refetch: fetchProdutos
  };
};
