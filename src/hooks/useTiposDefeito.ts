
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TipoDefeito } from '@/types/produto';

export const useTiposDefeito = () => {
  const [tiposDefeito, setTiposDefeito] = useState<TipoDefeito[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTiposDefeito = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tipos_defeito')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;

      setTiposDefeito(data || []);
    } catch (error) {
      console.error('Erro ao buscar tipos de defeito:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiposDefeito();
  }, [user]);

  const createTipoDefeito = async (tipoDefeito: Omit<TipoDefeito, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('tipos_defeito')
        .insert({
          user_id: user.id,
          ...tipoDefeito
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTiposDefeito();
      return data;
    } catch (error) {
      console.error('Erro ao criar tipo de defeito:', error);
      throw error;
    }
  };

  const updateTipoDefeito = async (id: string, updates: Partial<TipoDefeito>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('tipos_defeito')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchTiposDefeito();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar tipo de defeito:', error);
      throw error;
    }
  };

  const deleteTipoDefeito = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { error } = await supabase
        .from('tipos_defeito')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchTiposDefeito();
    } catch (error) {
      console.error('Erro ao deletar tipo de defeito:', error);
      throw error;
    }
  };

  return {
    tiposDefeito,
    loading,
    createTipoDefeito,
    updateTipoDefeito,
    deleteTipoDefeito,
    refetch: fetchTiposDefeito
  };
};
