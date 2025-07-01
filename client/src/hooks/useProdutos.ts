import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  categoria: 'peca' | 'servico';
  preco_custo: number;
  preco_venda: number;
  estoque_atual?: number;
  estoque_minimo?: number;
  unidade_medida?: string;
  fornecedor?: string;
  codigo_barras?: string;
  observacoes?: string;
  tempo_servico?: number;
  tipo_equipamento: 'smartphone' | 'notebook' | 'desktop' | 'tablet' | 'outros' | 'todos';
  created_at?: string;
  updated_at?: string;
}

export const useProdutos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProdutos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await api.produtos.list();
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

  const createProduto = async (produtoData: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const data = await api.produtos.create(produtoData);
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
      const data = await api.produtos.update(id, produtoData);
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
      await api.produtos.delete(id);
      await fetchProdutos();
    } catch (error) {
      console.error('Erro ao inativar produto:', error);
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