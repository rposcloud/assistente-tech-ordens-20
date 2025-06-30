
import React, { useState } from 'react';
import { Users, UserPlus, Search, FileText } from 'lucide-react';
import { useClientes, Cliente } from '../hooks/useClientes';
import { SortableTable, Column } from '../components/ui/sortable-table';
import { ClienteForm } from '../components/forms/ClienteForm';

export const Clientes = () => {
  const { clientes, loading, createCliente, updateCliente, deleteCliente } = useClientes();
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSaveCliente = async (clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, clienteData);
      } else {
        await createCliente(clienteData);
      }
      setShowModal(false);
      setEditingCliente(null);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente. Tente novamente.');
    }
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setShowModal(true);
  };

  const handleDeleteCliente = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteCliente(id);
      } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        alert('Erro ao deletar cliente. Tente novamente.');
      }
    }
  };

  const clientesFiltrados = clientes.filter(cliente => {
    const searchRegex = new RegExp(searchTerm, 'i');
    return searchRegex.test(cliente.nome) || 
           searchRegex.test(cliente.email || '') || 
           searchRegex.test(cliente.telefone || '') ||
           searchRegex.test(cliente.cpf_cnpj);
  });

  const colunas: Column<Cliente>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'cpf_cnpj', label: 'CPF/CNPJ' },
    {
      key: 'endereco',
      label: 'Cidade',
      render: (cliente) => `${cliente.cidade || ''}, ${cliente.estado || ''}`
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (cliente) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditCliente(cliente)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            title="Editar cliente"
          >
            Editar
          </button>
          <button
            onClick={() => handleDeleteCliente(cliente.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            title="Excluir cliente"
          >
            Excluir
          </button>
        </div>
      ),
      className: 'text-center'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="mr-3 text-blue-600" size={32} />
            Clientes
          </h1>
          <p className="text-gray-600">Gerencie seus clientes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <UserPlus className="mr-2" size={20} />
          Novo Cliente
        </button>
      </div>

      {/* Barra de pesquisa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar clientes por nome, email, telefone ou CPF/CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Lista de Clientes</h3>
          <p className="text-sm text-gray-600">Total: {clientesFiltrados.length} clientes</p>
        </div>
        <div className="p-6">
          <SortableTable
            data={clientesFiltrados}
            columns={colunas}
            keyExtractor={(cliente) => cliente.id}
            emptyMessage="Nenhum cliente encontrado"
            emptyIcon={<FileText size={48} className="text-gray-300" />}
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ClienteForm
          cliente={editingCliente}
          onSave={handleSaveCliente}
          onCancel={() => {
            setShowModal(false);
            setEditingCliente(null);
          }}
        />
      )}
    </div>
  );
};
