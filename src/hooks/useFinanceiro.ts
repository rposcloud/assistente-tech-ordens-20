
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EntradaFinanceira {
  id?: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  categoria: string;
  forma_pagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'parcelado';
  data_vencimento: string;
  status: 'pendente' | 'pago' | 'parcial' | 'cancelado';
  parcelas?: number;
  parcela_atual?: number;
  valor_parcela?: number;
  centro_custo?: string;
  conta_bancaria?: string;
  numero_documento?: string;
  pessoa_responsavel?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  ativo: boolean;
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
      console.error('Erro ao buscar entradas:', error);
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
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
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
      console.error('Erro ao criar entrada:', error);
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
      console.error('Erro ao atualizar entrada:', error);
      throw error;
    }
  };

  return {
    entradas,
    categorias,
    loading,
    createEntrada,
    updateEntrada,
    refetch: fetchEntradas
  };
};
