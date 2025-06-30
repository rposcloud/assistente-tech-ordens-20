import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface EntradaFinanceira {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria_id?: string;
  data_vencimento: string;
  data_pagamento?: string;
  forma_pagamento?: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'parcelado';
  status_pagamento: 'pendente' | 'pago' | 'parcial' | 'cancelado';
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor?: string;
  created_at?: string;
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
      const data = await api.financeiro.list();
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
      const data = await api.categoriasFinanceiras.list();
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
      const data = await api.financeiro.create(entradaData);
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
      const data = await api.financeiro.update(id, entradaData);
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
      await api.financeiro.delete(id);
      await fetchEntradas();
    } catch (error) {
      console.error('Erro ao deletar entrada financeira:', error);
      throw error;
    }
  };

  return {
    entradas,
    categorias,
    loading,
    createEntrada,
    updateEntrada,
    deleteEntrada,
    refetch: fetchEntradas
  };
};