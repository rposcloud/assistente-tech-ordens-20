
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, X } from 'lucide-react';
import { Cliente } from '../types';
import { InputMask } from '../components/forms/InputMask';
import { AddressForm } from '../components/forms/AddressForm';
import { useMask } from '../hooks/useMask';
import { formatCPF, formatCNPJ, formatPhone } from '../utils/masks';

export const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: '',
    email: '',
    telefone: '',
    cpfCnpj: '',
    tipoDocumento: 'cpf',
    dataNascimento: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    observacoes: ''
  });

  const phoneMask = useMask('phone');

  useEffect(() => {
    const clientesSalvos = localStorage.getItem('clientes');
    if (clientesSalvos) {
      setClientes(JSON.parse(clientesSalvos));
    }
  }, []);

  const saveClientes = (novosClientes: Cliente[]) => {
    localStorage.setItem('clientes', JSON.stringify(novosClientes));
    setClientes(novosClientes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      const clientesAtualizados = clientes.map(cliente =>
        cliente.id === editingClient.id
          ? { ...cliente, ...formData }
          : cliente
      );
      saveClientes(clientesAtualizados);
    } else {
      const novoCliente: Cliente = {
        id: Date.now().toString(),
        ...formData
      } as Cliente;
      saveClientes([...clientes, novoCliente]);
    }

    closeModal();
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingClient(cliente);
    setFormData({ ...cliente });
    phoneMask.setValue(cliente.telefone);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      const clientesFiltrados = clientes.filter(cliente => cliente.id !== id);
      saveClientes(clientesFiltrados);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpfCnpj: '',
      tipoDocumento: 'cpf',
      dataNascimento: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      observacoes: ''
    });
    phoneMask.reset();
  };

  const handlePhoneChange = (value: string) => {
    phoneMask.handleChange(value);
    setFormData({ ...formData, telefone: value });
  };

  const handleDocumentChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    let maskedValue = '';
    let tipoDocumento: 'cpf' | 'cnpj' = 'cpf';

    if (cleanValue.length <= 11) {
      maskedValue = formatCPF(value);
      tipoDocumento = 'cpf';
    } else {
      maskedValue = formatCNPJ(value);
      tipoDocumento = 'cnpj';
    }

    setFormData({ 
      ...formData, 
      cpfCnpj: maskedValue,
      tipoDocumento 
    });
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpfCnpj.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF/CNPJ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{cliente.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cliente.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cliente.telefone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cliente.cpfCnpj}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cliente.cidade}/{cliente.estado}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(cliente)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clientesFiltrados.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum cliente encontrado
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Dados Pessoais */}
              <div>
                <h4 className="text-md font-medium mb-4 text-gray-800">Dados Pessoais</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <InputMask
                      value={formData.nome || ''}
                      onChange={(value) => setFormData({ ...formData, nome: value })}
                      placeholder="Nome completo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <InputMask
                      value={formData.email || ''}
                      onChange={(value) => setFormData({ ...formData, email: value })}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                    <InputMask
                      value={phoneMask.value}
                      onChange={handlePhoneChange}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ *</label>
                    <InputMask
                      value={formData.cpfCnpj || ''}
                      onChange={handleDocumentChange}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                    <input
                      type="date"
                      value={formData.dataNascimento || ''}
                      onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h4 className="text-md font-medium mb-4 text-gray-800">Endereço</h4>
                <AddressForm
                  cep={formData.cep || ''}
                  endereco={formData.endereco || ''}
                  numero={formData.numero || ''}
                  complemento={formData.complemento || ''}
                  bairro={formData.bairro || ''}
                  cidade={formData.cidade || ''}
                  estado={formData.estado || ''}
                  onAddressChange={handleAddressChange}
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={formData.observacoes || ''}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Observações adicionais..."
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingClient ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
