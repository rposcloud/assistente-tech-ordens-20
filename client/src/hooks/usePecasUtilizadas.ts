
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { PecaUtilizada } from '@/types/produto';

export const usePecasUtilizadas = (ordemServicoId?: string) => {
  const [pecasUtilizadas, setPecasUtilizadas] = useState<PecaUtilizada[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPecasUtilizadas = async () => {
    if (!user || !ordemServicoId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pecas_utilizadas')
        .select('*')
        .eq('ordem_servico_id', ordemServicoId);

      if (error) throw error;

      setPecasUtilizadas(data || []);
    } catch (error) {
      console.error('Erro ao buscar peças utilizadas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPecasUtilizadas();
  }, [user, ordemServicoId]);

  const addPecaUtilizada = async (pecaUtilizada: Omit<PecaUtilizada, 'id' | 'created_at'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('pecas_utilizadas')
        .insert(pecaUtilizada)
        .select()
        .single();

      if (error) throw error;

      await fetchPecasUtilizadas();
      return data;
    } catch (error) {
      console.error('Erro ao adicionar peça utilizada:', error);
      throw error;
    }
  };

  const updatePecaUtilizada = async (id: string, updates: Partial<PecaUtilizada>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('pecas_utilizadas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchPecasUtilizadas();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar peça utilizada:', error);
      throw error;
    }
  };

  const deletePecaUtilizada = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { error } = await supabase
        .from('pecas_utilizadas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchPecasUtilizadas();
    } catch (error) {
      console.error('Erro ao deletar peça utilizada:', error);
      throw error;
    }
  };

  return {
    pecasUtilizadas,
    loading,
    addPecaUtilizada,
    updatePecaUtilizada,
    deletePecaUtilizada,
    refetch: fetchPecasUtilizadas
  };
};
