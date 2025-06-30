
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        // Se não existe perfil, criar um básico
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              nome_completo: user.email || 'Usuário',
              empresa: 'TechService',
              telefone: '(11) 9999-9999',
              email_empresa: 'contato@techservice.com',
              cidade: 'São Paulo',
              estado: 'SP'
            })
            .select()
            .single();
            
          if (createError) {
            console.error('Erro ao criar perfil:', createError);
          } else {
            setProfile(newProfile);
          }
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erro no useProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<CompanyProfile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw error;
      }

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
