import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Simplified type to avoid conflicts
type OrdemServico = any;

export const useOrdens = () => {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchOrdens = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await api.ordens.list();
      console.log('Ordens disponíveis:', data?.length || 0);
      setOrdens(data || []);
    } catch (error) {
      console.error('Erro ao buscar ordens:', error);
    } finally {
      setLoading(false);
      console.log('Loading:', false);
    }
  };

  useEffect(() => {
    fetchOrdens();
  }, [user]);

  // Listen to React Query cache invalidations - versão simplificada
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      // Apenas reagir a invalidações específicas da query de ordens
      if (event?.query?.queryKey?.[0] === '/api/ordens' && event.type === 'updated') {
        fetchOrdens();
      }
    });

    return unsubscribe;
  }, [queryClient]);

  const createOrdem = async (ordemData: Omit<OrdemServico, 'id' | 'created_at' | 'updated_at' | 'numero_ordem'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const data = await api.ordens.create(ordemData);
      await fetchOrdens();
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['/api/ordens'] });
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
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['/api/ordens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ordens', id] });
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
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['/api/ordens'] });
      return true;
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