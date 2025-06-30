import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Hook genérico para usar com qualquer endpoint da API
export function useApiData<T>(
  endpoint: string,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      
      // Usar a API baseada no endpoint
      let result;
      switch (endpoint) {
        case 'clientes':
          result = await api.clientes.list();
          break;
        case 'produtos':
          result = await api.produtos.list();
          break;
        case 'ordens':
          result = await api.ordens.list();
          break;
        case 'financeiro':
          result = await api.financeiro.list();
          break;
        case 'categorias-financeiras':
          result = await api.categoriasFinanceiras.list();
          break;
        case 'tipos-defeito':
          result = await api.tiposDefeito.list();
          break;
        default:
          throw new Error(`Endpoint não suportado: ${endpoint}`);
      }
      
      setData(result || []);
    } catch (err) {
      console.error(`Erro ao buscar ${endpoint}:`, err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}