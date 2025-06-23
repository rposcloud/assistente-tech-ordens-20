
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, X } from 'lucide-react';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

interface OrdemServico {
  id: string;
  clienteId: string;
  equipamento: string;
  problema: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
  dataAbertura: string;
  dataConclusao?: string;
}

export const Ordens = () => {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrdemServico | null>(null);
  const [formData, setFormData] = useState({
    clienteId: '',
    equipamento: '',
    problema: '',
    status: 'pendente' as 'pendente' | 'em_andamento' | 'concluida'
  });

  useEffect(() => {
    const ordensSalvas = localStorage.getItem('ordens');
    const clientesSalvos = localStorage.getItem('clientes');
    
    if (ordensSalvas) {
      setOrdens(JSON.parse(ordensSalvas));
    }
    if (clientesSalvos) {
      setClientes(JSON.parse(clientesSalvos));
    }
  }, []);

  const saveOrdens = (novasOrdens: OrdemServico[]) => {
    localStorage.setItem('ordens', JSON.stringify(novasOrdens));
    setOrdens(novasOrdens);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingOrder) {
      const ordensAtualizadas = ordens.map(ordem => {
        if (ordem.id === editingOrder.id) {
          const updatedOrder = { ...ordem, ...formData };
          if (formData.status === 'concluida' && !ordem.dataConclusao) {
            updatedOrder.dataConclusao = new Date().toISOString().split('T')[0];
          }
          return updatedOrder;
        }
        return ordem;
      });
      saveOrdens(ordensAtualizadas);
    } else {
      const novaOrdem: OrdemServico = {
        id: Date.now().toString(),
        ...formData,
        dataAbertura: new Date().toISOString().split('T')[0],
        dataConclusao: formData.status === 'concluida' ? new Date().toISOString().split('T')[0] : undefined
      };
      saveOrdens([...ordens, novaOrdem]);
    }

    setFormData({ clienteId: '', equipamento: '', problema: '', status: 'pendente' });
    setShowModal(false);
    setEditingOrder(null);
  };

  const handleEdit = (ordem: OrdemServico) => {
    setEditingOrder(ordem);
    setFormData({
      clienteId: ordem.clienteId,
      equipamento: ordem.equipamento,
      problema: ordem.problema,
      status: ordem.status
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      const ordensFiltradas = ordens.filter(ordem => ordem.id !== id);
      saveOrdens(ordensFiltradas);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOrder(null);
    setFormData({ clienteId: '', equipamento: '', problema: '', status: 'pendente' });
  };

  const ordensComClientes = ordens.map(ordem => ({
    ...ordem,
    cliente: clientes.find(cliente => cliente.id === ordem.clienteId)
  }));

  const ordensFiltradas = ordensComClientes.filter(ordem =>
    ordem.equipamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.problema.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    pendente: 'bg-yellow-100 text-yellow-800',
    em_andamento: 'bg-blue-100 text-blue-800',
    concluida: 'bg-green-100 text-green-800'
  };

  const statusTexts = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
          <p className="text-gray-600">Gerencie as ordens de serviço</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Nova Ordem
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar ordens..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problema</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Abertura</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordensFiltradas.map((ordem) => (
                <tr key={ordem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ordem.cliente?.nome || 'Cliente não encontrado'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ordem.equipamento}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{ordem.problema}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[ordem.status]}`}>
                      {statusTexts[ordem.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(ordem)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(ordem.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ordensFiltradas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma ordem de serviço encontrada
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingOrder ? 'Editar Ordem' : 'Nova Ordem de Serviço'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select
                  required
                  value={formData.clienteId}
                  onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipamento</label>
                <input
                  type="text"
                  required
                  value={formData.equipamento}
                  onChange={(e) => setFormData({ ...formData, equipamento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: iPhone 13, Notebook Dell, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problema</label>
                <textarea
                  required
                  value={formData.problema}
                  onChange={(e) => setFormData({ ...formData, problema: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Descreva o problema..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
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
                  {editingOrder ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
