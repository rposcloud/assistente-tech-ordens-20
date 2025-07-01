
import React, { useState } from 'react';
import { Users, UserPlus, Search, FileText, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useClientes, Cliente } from '../hooks/useClientes';
import { SortableTable, Column } from '../components/ui/sortable-table';
import { ClienteForm } from '../components/forms/ClienteForm';
import { ConfirmationModal } from '../components/ui/confirmation-modal';

export const Clientes = () => {
  const { clientes, loading, createCliente, updateCliente, deleteCliente } = useClientes();
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    cliente: Cliente | null;
    loading: boolean;
  }>({
    isOpen: false,
    cliente: null,
    loading: false
  });

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

  const handleDeleteCliente = (cliente: Cliente) => {
    setDeleteModal({
      isOpen: true,
      cliente,
      loading: false
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.cliente) return;

    setDeleteModal(prev => ({ ...prev, loading: true }));

    try {
      await deleteCliente(deleteModal.cliente.id);
      setDeleteModal({
        isOpen: false,
        cliente: null,
        loading: false
      });
    } catch (error: any) {
      console.error('Erro ao deletar cliente:', error);
      alert('Erro ao deletar cliente. Tente novamente.');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const closeDeleteModal = () => {
    if (deleteModal.loading) return;
    setDeleteModal({
      isOpen: false,
      cliente: null,
      loading: false
    });
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
      label: <MoreHorizontal className="h-4 w-4 mx-auto" />,
      render: (cliente) => (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={() => handleEditCliente(cliente)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
            title="Editar cliente"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteCliente(cliente)}
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
            title="Excluir cliente"
          >
            <Trash2 className="h-4 w-4" />
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar clientes por nome, email, telefone ou CPF/CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-3">
            {clientesFiltrados.length} cliente(s)
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Versão Desktop - Tabela */}
        <div className="hidden lg:block">
          <SortableTable
            data={clientesFiltrados}
            columns={colunas}
            keyExtractor={(cliente) => cliente.id}
            emptyMessage="Nenhum cliente encontrado"
            emptyIcon={<FileText size={48} className="text-gray-300" />}
          />
        </div>

        {/* Versão Mobile - Cards */}
        <div className="lg:hidden">
          {clientesFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum cliente encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clientesFiltrados.map((cliente) => (
                <div key={cliente.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {/* Header do Card */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{cliente.nome}</h3>
                      <p className="text-sm text-gray-600">{cliente.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCliente(cliente)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                        title="Editar cliente"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCliente(cliente)}
                        className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                        title="Excluir cliente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Informações do Card */}
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Telefone: </span>
                      <span className="text-gray-900">{cliente.telefone || 'Não informado'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">CPF/CNPJ: </span>
                      <span className="text-gray-900">{cliente.cpf_cnpj}</span>
                    </div>
                    {(cliente.cidade || cliente.estado) && (
                      <div>
                        <span className="text-gray-500">Cidade: </span>
                        <span className="text-gray-900">{cliente.cidade || ''}, {cliente.estado || ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulário */}
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

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir o cliente "${deleteModal.cliente?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        loading={deleteModal.loading}
      />
    </div>
  );
};
