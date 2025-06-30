import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface OrdemServico {
  id: string;
  cliente_id: string;
  numero_ordem: string;
  equipamento: string;
  modelo?: string;
  serial?: string;
  problema_relatado: string;
  diagnostico?: string;
  solucao?: string;
  valor_servico?: number;
  valor_pecas?: number;
  valor_total?: number;
  status: 'aguardando_diagnostico' | 'aguardando_aprovacao' | 'aguardando_pecas' | 'em_reparo' | 'pronto_entrega' | 'entregue';
  data_entrada: string;
  data_previsao?: string;
  data_conclusao?: string;
  observacoes?: string;
  cliente?: any;
  created_at?: string;
  updated_at?: string;
}

export const useOrdens = () => {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrdens = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await api.ordens.list();
      setOrdens(data || []);
    } catch (error) {
      console.error('Erro ao buscar ordens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdens();
  }, [user]);

  const createOrdem = async (ordemData: Omit<OrdemServico, 'id' | 'created_at' | 'updated_at' | 'numero_ordem'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const data = await api.ordens.create(ordemData);
      await fetchOrdens();
      return data;
    } catch (error) {
      console.error('Erro ao criar ordem:', error);
      throw error;
    }
  };

  const updateOrdem = async (id: string, ordemData: Partial<OrdemServico>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const data = await api.ordens.update(id, ordemData);
      await fetchOrdens();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      throw error;
    }
  };

  const deleteOrdem = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      await api.ordens.delete(id);
      await fetchOrdens();
    } catch (error) {
      console.error('Erro ao deletar ordem:', error);
      throw error;
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