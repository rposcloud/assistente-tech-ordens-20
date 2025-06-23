
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Cliente } from '@/types';

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchClientes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .order('nome');

      if (error) throw error;

      const clientesFormatted = data.map(cliente => ({
        ...cliente,
        tipoDocumento: cliente.tipo_documento,
        dataNascimento: cliente.data_nascimento,
        cpfCnpj: cliente.cpf_cnpj,
        createdAt: cliente.created_at,
        updatedAt: cliente.updated_at
      }));

      setClientes(clientesFormatted);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [user]);

  const createCliente = async (clienteData: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert({
          user_id: user.id,
          nome: clienteData.nome,
          email: clienteData.email,
          telefone: clienteData.telefone,
          cpf_cnpj: clienteData.cpfCnpj,
          tipo_documento: clienteData.tipoDocumento,
          data_nascimento: clienteData.dataNascimento,
          cep: clienteData.cep,
          endereco: clienteData.endereco,
          numero: clienteData.numero,
          complemento: clienteData.complemento,
          bairro: clienteData.bairro,
          cidade: clienteData.cidade,
          estado: clienteData.estado,
          observacoes: clienteData.observacoes
        })
        .select()
        .single();

      if (error) throw error;

      await fetchClientes(); // Recarregar lista
      return data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  };

  const updateCliente = async (id: string, clienteData: Partial<Cliente>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({
          nome: clienteData.nome,
          email: clienteData.email,
          telefone: clienteData.telefone,
          cpf_cnpj: clienteData.cpfCnpj,
          tipo_documento: clienteData.tipoDocumento,
          data_nascimento: clienteData.dataNascimento,
          cep: clienteData.cep,
          endereco: clienteData.endereco,
          numero: clienteData.numero,
          complemento: clienteData.complemento,
          bairro: clienteData.bairro,
          cidade: clienteData.cidade,
          estado: clienteData.estado,
          observacoes: clienteData.observacoes
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchClientes(); // Recarregar lista
      return data;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const deleteCliente = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchClientes(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  };

  return {
    clientes,
    loading,
    createCliente,
    updateCliente,
    deleteCliente,
    refetch: fetchClientes
  };
};
