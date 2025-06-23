import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, X, User, MapPin, Phone, Mail, FileText, Briefcase, Calendar } from 'lucide-react';
import { Cliente } from '../types';
import { InputMask } from '../components/forms/InputMask';
import { AddressForm } from '../components/forms/AddressForm';
import { useMask } from '../hooks/useMask';
import { useCep } from '../hooks/useCep';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const cpfMask = useMask('cpf');
  const cnpjMask = useMask('cnpj');
  const phoneMask = useMask('phone');
  const cepMask = useMask('cep');
  const { endereco, loading: cepLoading, buscar } = useCep();

  useEffect(() => {
    const clientesSalvos = localStorage.getItem('clientes');
    if (clientesSalvos) {
      setClientes(JSON.parse(clientesSalvos));
    }
  }, []);

  useEffect(() => {
    if (formData.tipoDocumento === 'cpf') {
      cpfMask.handleChange(formData.cpfCnpj || '');
    } else {
      cnpjMask.handleChange(formData.cpfCnpj || '');
    }
  }, [formData.tipoDocumento, formData.cpfCnpj]);

  useEffect(() => {
    phoneMask.handleChange(formData.telefone || '');
  }, [formData.telefone]);

  useEffect(() => {
    cepMask.handleChange(formData.cep || '');
    if (cepMask.value && cepMask.value.length === 9) {
      buscar(cepMask.value);
    }
  }, [formData.cep]);

  useEffect(() => {
    if (endereco) {
      setFormData(prev => ({
        ...prev,
        endereco: endereco.logradouro,
        bairro: endereco.bairro,
        cidade: endereco.localidade,
        estado: endereco.uf
      }));
    }
  }, [endereco]);

  const saveClientes = (novosClientes: Cliente[]) => {
    localStorage.setItem('clientes', JSON.stringify(novosClientes));
    setClientes(novosClientes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const clienteData = {
      ...formData,
      cpfCnpj: formData.tipoDocumento === 'cpf' ? cpfMask.value : cnpjMask.value,
      telefone: phoneMask.value,
      cep: cepMask.value
    };

    if (editingClient) {
      const clientesAtualizados = clientes.map(cliente => {
        if (cliente.id === editingClient.id) {
          return { ...cliente, ...clienteData };
        }
        return cliente;
      });
      saveClientes(clientesAtualizados);
    } else {
      const novoCliente: Cliente = {
        id: Date.now().toString(),
        ...clienteData
      } as Cliente;
      saveClientes([...clientes, novoCliente]);
    }

    closeModal();
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingClient(cliente);
    setFormData({ ...cliente });
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
    cpfMask.reset();
    cnpjMask.reset();
    phoneMask.reset();
    cepMask.reset();
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cliente.telefone && cliente.telefone.includes(searchTerm)) ||
    cliente.cpfCnpj.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <User className="mr-3 text-blue-600" size={32} />
            Clientes
          </h1>
          <p className="text-gray-600">Gerencie os clientes do sistema</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="text-blue-500 mr-3" size={20} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{cliente.nome}</div>
                        <div className="text-sm text-gray-500">{cliente.email || 'Email não informado'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="text-green-500 mr-2" size={16} />
                      {cliente.telefone || 'Não informado'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cliente.cpfCnpj}</div>
                    <div className="text-sm text-gray-500">{cliente.tipoDocumento.toUpperCase()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="text-red-500 mr-2" size={16} />
                      {cliente.cidade ? `${cliente.cidade}/${cliente.estado}` : 'Não informado'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(cliente)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
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
              <User size={48} className="mx-auto mb-4 text-gray-300" />
              Nenhum cliente encontrado
            </div>
          )}
        </div>
      </div>

      {/* Modal Aprimorado com Ícones e Abas */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center">
                  <User className="mr-2 text-blue-600" size={24} />
                  {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="pessoais" className="p-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pessoais" className="flex items-center">
                    <User className="mr-2" size={16} />
                    Dados Pessoais
                  </TabsTrigger>
                  <TabsTrigger value="endereco" className="flex items-center">
                    <MapPin className="mr-2" size={16} />
                    Endereço
                  </TabsTrigger>
                  <TabsTrigger value="observacoes" className="flex items-center">
                    <FileText className="mr-2" size={16} />
                    Observações
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pessoais" className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <User className="mr-1" size={16} />
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nome || ''}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nome completo do cliente"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Mail className="mr-1" size={16} />
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Phone className="mr-1" size={16} />
                        Telefone
                      </label>
                      <InputMask
                        value={phoneMask.value}
                        onChange={(value) => {
                          phoneMask.handleChange(value);
                          setFormData({ ...formData, telefone: value });
                        }}
                        placeholder="(11) 99999-9999"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Calendar className="mr-1" size={16} />
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        value={formData.dataNascimento || ''}
                        onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Briefcase className="mr-1" size={16} />
                      Tipo de Documento *
                    </label>
                    <select
                      value={formData.tipoDocumento || 'cpf'}
                      onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value as 'cpf' | 'cnpj' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="cpf">CPF - Pessoa Física</option>
                      <option value="cnpj">CNPJ - Pessoa Jurídica</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.tipoDocumento === 'cpf' ? 'CPF *' : 'CNPJ *'}
                    </label>
                    <InputMask
                      value={formData.tipoDocumento === 'cpf' ? cpfMask.value : cnpjMask.value}
                      onChange={(value) => {
                        if (formData.tipoDocumento === 'cpf') {
                          cpfMask.handleChange(value);
                        } else {
                          cnpjMask.handleChange(value);
                        }
                        setFormData({ ...formData, cpfCnpj: value });
                      }}
                      placeholder={formData.tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="endereco" className="space-y-4 mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                      <MapPin className="mr-2" size={18} />
                      Endereço Completo
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                        <InputMask
                          value={cepMask.value}
                          onChange={(value) => {
                            cepMask.handleChange(value);
                            setFormData({ ...formData, cep: value });
                          }}
                          placeholder="00000-000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {cepLoading && <p className="text-xs text-blue-600 mt-1">Buscando endereço...</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                        <input
                          type="text"
                          value={formData.numero || ''}
                          onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nº"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                        <input
                          type="text"
                          value={formData.complemento || ''}
                          onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Apto, Bloco..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
                        <input
                          type="text"
                          value={formData.endereco || ''}
                          onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Rua, Avenida, etc..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                        <input
                          type="text"
                          value={formData.bairro || ''}
                          onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Bairro"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                        <input
                          type="text"
                          value={formData.cidade || ''}
                          onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Cidade"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <input
                          type="text"
                          maxLength={2}
                          value={formData.estado || ''}
                          onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="SP"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="observacoes" className="space-y-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FileText className="mr-1" size={16} />
                      Observações Gerais
                    </label>
                    <textarea
                      value={formData.observacoes || ''}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={6}
                      placeholder="Informações adicionais sobre o cliente, preferências, histórico, etc..."
                    />
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">💡 Dicas para um bom atendimento:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Registre preferências de contato (WhatsApp, ligação, email)</li>
                      <li>• Anote histórico de problemas recorrentes</li>
                      <li>• Documente características especiais do cliente</li>
                      <li>• Registre informações sobre localização ou acesso</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex space-x-3 px-6 py-4 border-t bg-gray-50">
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
                  {editingClient ? 'Atualizar Cliente' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
