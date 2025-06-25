
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EntradaFinanceira {
  id?: string;
  user_id?: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  forma_pagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'parcelado';
  data_vencimento: string;
  status: 'pendente' | 'pago' | 'parcial' | 'cancelado';
  observacoes?: string;
  parcelas?: number;
  parcela_atual?: number;
  valor_parcela?: number;
  pessoa_responsavel?: string;
  numero_documento?: string;
  centro_custo?: string;
  conta_bancaria?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  ativo: boolean;
  user_id: string;
  created_at: string;
}

export const useFinanceiro = () => {
  const [entradas, setEntradas] = useState<EntradaFinanceira[]>([]);
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEntradas = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('entradas_financeiras')
        .select('*')
        .eq('user_id', user.id)
        .order('data_vencimento', { ascending: false });

      if (error) throw error;
      setEntradas(data || []);
    } catch (error) {
      console.error('Erro ao buscar entradas financeiras:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      
      console.log('Categorias financeiras carregadas:', data);
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias financeiras:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEntradas();
      fetchCategorias();
    }
  }, [user]);

  const createEntrada = async (entradaData: Omit<EntradaFinanceira, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('entradas_financeiras')
        .insert({
          ...entradaData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchEntradas();
      return data;
    } catch (error) {
      console.error('Erro ao criar entrada financeira:', error);
      throw error;
    }
  };

  const updateEntrada = async (id: string, entradaData: Partial<EntradaFinanceira>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('entradas_financeiras')
        .update(entradaData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchEntradas();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar entrada financeira:', error);
      throw error;
    }
  };

  const deleteEntrada = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { error } = await supabase
        .from('entradas_financeiras')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchEntradas();
    } catch (error) {
      console.error('Erro ao deletar entrada financeira:', error);
      throw error;
    }
  };

  // Helper functions for categorias
  const getCategoriasByTipo = (tipo: 'receita' | 'despesa') => {
    return categorias.filter(cat => cat.tipo === tipo);
  };

  return {
    entradas,
    categorias,
    loading,
    createEntrada,
    updateEntrada,
    deleteEntrada,
    getCategoriasByTipo,
    refetch: fetchEntradas,
    refetchCategorias: fetchCategorias
  };
};
