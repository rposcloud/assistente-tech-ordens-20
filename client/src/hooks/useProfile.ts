
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface CompanyProfile {
  id: string;
  nome_completo: string;
  empresa?: string;
  cnpj?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  email_empresa?: string;
  site?: string;
  logo_url?: string;
  dados_bancarios?: string;
  observacoes_empresa?: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const data = await api.get('/profile');
      setProfile(data);
    } catch (error) {
      console.error('Erro no useProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<CompanyProfile>) => {
    if (!user) return;

    try {
      const data = await api.put('/profile', updates);
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Erro no updateProfile:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  };
};
