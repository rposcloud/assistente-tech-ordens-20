
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Produto } from '@/types/produto';

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

      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [user]);

  const createProduto = async (produtoData: Omit<Produto, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert({
          user_id: user.id,
          ...produtoData
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProdutos();
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
        .update(produtoData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchProdutos();
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

      await fetchProdutos();
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
