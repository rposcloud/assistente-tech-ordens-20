
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf_cnpj: string;
  tipo_documento: 'cpf' | 'cnpj';
  data_nascimento?: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

// Brazilian phone mask function
const formatPhoneBrazilian = (phone: string) => {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Apply Brazilian phone format
  if (digits.length === 11) {
    // Mobile: (XX) XXXXX-XXXX
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (digits.length === 10) {
    // Landline: (XX) XXXX-XXXX
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchClientes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await api.clientes.list();

      // Format phone numbers for display
      const clientesFormatados = (data || []).map((cliente: Cliente) => ({
        ...cliente,
        telefone: formatPhoneBrazilian(cliente.telefone)
      }));

      setClientes(clientesFormatados);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [user]);

  const createCliente = async (clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const data = await api.clientes.create(clienteData);
      await fetchClientes(); // Refresh list
      return data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  };

  const updateCliente = async (id: string, clienteData: Partial<Cliente>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const data = await api.clientes.update(id, clienteData);
      await fetchClientes(); // Refresh list
      return data;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const deleteCliente = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      await api.clientes.delete(id);
      await fetchClientes(); // Refresh list
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
