
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, X, Package, Wrench, DollarSign, Archive } from 'lucide-react';
import { Produto } from '../types/produto';
import { formatCurrency } from '../utils/masks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Produtos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const [formData, setFormData] = useState<Partial<Produto>>({
    nome: '',
    descricao: '',
    categoria: 'peca',
    precoCusto: 0,
    precoVenda: 0,
    estoque: 0,
    unidade: 'UN',
    ativo: true,
    tipoEquipamento: 'todos',
    tempoEstimado: 0
  });

  useEffect(() => {
    const produtosSalvos = localStorage.getItem('produtos');
    if (produtosSalvos) {
      setProdutos(JSON.parse(produtosSalvos));
    }
  }, []);

  const saveProdutos = (novosProdutos: Produto[]) => {
    localStorage.setItem('produtos', JSON.stringify(novosProdutos));
    setProdutos(novosProdutos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      const produtosAtualizados = produtos.map(produto => {
        if (produto.id === editingProduct.id) {
          return { ...produto, ...formData, updatedAt: new Date().toISOString() };
        }
        return produto;
      });
      saveProdutos(produtosAtualizados);
    } else {
      const novoProduto: Produto = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Produto;
      saveProdutos([...produtos, novoProduto]);
    }

    closeModal();
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduct(produto);
    setFormData({ ...produto });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      const produtosFiltrados = produtos.filter(produto => produto.id !== id);
      saveProdutos(produtosFiltrados);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      nome: '',
      descricao: '',
      categoria: 'peca',
      precoCusto: 0,
      precoVenda: 0,
      estoque: 0,
      unidade: 'UN',
      ativo: true,
      tipoEquipamento: 'todos',
      tempoEstimado: 0
    });
  };

  const produtosFiltrados = produtos.filter(produto => {
    if (activeTab !== 'all' && activeTab !== produto.categoria) return false;
    return produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
           produto.descricao.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const categoriaOptions = [
    { value: 'peca', label: 'Peça/Produto', icon: Package },
    { value: 'servico', label: 'Serviço', icon: Wrench }
  ];

  const tipoEquipamentoOptions = [
    { value: 'todos', label: 'Todos os Equipamentos' },
    { value: 'smartphone', label: 'Smartphone' },
    { value: 'notebook', label: 'Notebook' },
    { value: 'desktop', label: 'Desktop' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'outros', label: 'Outros' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="mr-3 text-blue-600" size={32} />
            Produtos & Serviços
          </h1>
          <p className="text-gray-600">Gerencie produtos e serviços do sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Novo Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar produtos e serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="peca">Peças</TabsTrigger>
                <TabsTrigger value="servico">Serviços</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Custo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Venda</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {produtosFiltrados.map((produto) => (
                <tr key={produto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {produto.categoria === 'peca' ? (
                        <Package className="text-blue-500 mr-3" size={20} />
                      ) : (
                        <Wrench className="text-green-500 mr-3" size={20} />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                        <div className="text-sm text-gray-500">{produto.descricao}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      produto.categoria === 'peca' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {produto.categoria === 'peca' ? 'Peça' : 'Serviço'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(produto.precoCusto)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(produto.precoVenda)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {produto.categoria === 'peca' ? `${produto.estoque || 0} ${produto.unidade}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      produto.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(produto)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(produto.id)}
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
          {produtosFiltrados.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              Nenhum produto ou serviço encontrado
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulário */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center">
                  <Package className="mr-2 text-blue-600" size={24} />
                  {editingProduct ? 'Editar Item' : 'Novo Produto/Serviço'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="basico" className="p-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basico" className="flex items-center">
                    <Package className="mr-2" size={16} />
                    Básico
                  </TabsTrigger>
                  <TabsTrigger value="precos" className="flex items-center">
                    <DollarSign className="mr-2" size={16} />
                    Preços
                  </TabsTrigger>
                  <TabsTrigger value="estoque" className="flex items-center">
                    <Archive className="mr-2" size={16} />
                    Estoque
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basico" className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                      <input
                        type="text"
                        required
                        value={formData.nome || ''}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nome do produto/serviço"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                      <select
                        value={formData.categoria || 'peca'}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {categoriaOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={formData.descricao || ''}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Descrição detalhada do item..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Equipamento</label>
                      <select
                        value={formData.tipoEquipamento || 'todos'}
                        onChange={(e) => setFormData({ ...formData, tipoEquipamento: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {tipoEquipamentoOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.categoria === 'servico' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tempo Estimado (min)</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.tempoEstimado || 0}
                          onChange={(e) => setFormData({ ...formData, tempoEstimado: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Tempo em minutos"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="precos" className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Custo *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.precoCusto || 0}
                        onChange={(e) => setFormData({ ...formData, precoCusto: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Venda *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.precoVenda || 0}
                        onChange={(e) => setFormData({ ...formData, precoVenda: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {formData.precoVenda && formData.precoCusto && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Análise de Margem</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700">Margem Bruta:</span>
                          <span className="ml-2 font-semibold">
                            {formatCurrency(formData.precoVenda - formData.precoCusto)}
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700">Margem %:</span>
                          <span className="ml-2 font-semibold">
                            {((formData.precoVenda - formData.precoCusto) / formData.precoVenda * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="estoque" className="space-y-4 mt-6">
                  {formData.categoria === 'peca' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Atual</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.estoque || 0}
                          onChange={(e) => setFormData({ ...formData, estoque: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                        <select
                          value={formData.unidade || 'UN'}
                          onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="UN">Unidade</option>
                          <option value="PC">Peça</option>
                          <option value="KG">Quilograma</option>
                          <option value="M">Metro</option>
                          <option value="L">Litro</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Wrench size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>Controle de estoque não se aplica a serviços</p>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ativo"
                      checked={formData.ativo || false}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="ativo" className="text-sm text-gray-700">
                      Item ativo no sistema
                    </label>
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
                  {editingProduct ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
