import { useApiData } from '@/hooks/useApi';

export const useTiposDefeito = () => {
  const { data: tiposDefeito = [], loading, refetch } = useApiData('/api/tipos-defeito');

  return {
    tiposDefeito,
    loading,
    refetch
  };
};