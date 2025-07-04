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

  const deleteOrdem = async (id: string, options?: { force?: boolean; action?: string }) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const params = new URLSearchParams();
      if (options?.force) params.append('force', 'true');
      if (options?.action) params.append('action', options.action);
      
      const url = `/api/ordens/${id}${params.toString() ? `?${params.toString()}` : ''}`;
      const token = localStorage.getItem('auth_token');
      await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw errorData;
        }
        return response.json();
      });

      await fetchOrdens();
      queryClient.invalidateQueries({ queryKey: ['/api/ordens'] });
      return true;
    } catch (error) {
      console.error('Erro ao deletar ordem:', error);
      throw error;
    }
  };

  const getProtectionStatus = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      // Primeiro verificar se tem entradas vinculadas usando endpoint existente
      const token = localStorage.getItem('auth_token');
      const checkResponse = await fetch(`/api/financeiro/check-ordem/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const checkResult = await checkResponse.json();
      
      // Se tem entradas, buscar detalhes
      let linkedEntries = [];
      if (checkResult.hasFinancialEntry) {
        const entriesResponse = await fetch('/api/financeiro', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const allEntries = await entriesResponse.json();
        linkedEntries = allEntries.filter((entry: any) => entry.ordem_servico_id === id);
      }

      return {
        protection: {
          is_protected: checkResult.hasFinancialEntry,
          linked_entries_count: linkedEntries.length,
          can_delete: !checkResult.hasFinancialEntry
        },
        linked_entries: linkedEntries
      };
    } catch (error) {
      console.error('Erro ao verificar proteção:', error);
      throw error;
    }
  };

  return {
    ordens,
    loading,
    createOrdem,
    updateOrdem,
    deleteOrdem,
    getProtectionStatus,
    refetch: fetchOrdens
  };
};