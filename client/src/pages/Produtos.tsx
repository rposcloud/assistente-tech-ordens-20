
import React, { useState } from 'react';
import { FileText, Package, Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useProdutos } from '../hooks/useProdutos';
import { SortableTable, Column } from '../components/ui/sortable-table';
import { ProductForm } from '../components/forms/ProductForm';
import type { Produto } from '../types/produto';

export const Produtos = () => {
  const { produtos, loading, createProduto, updateProduto, deleteProduto } = useProdutos();
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'todos' | 'peca' | 'servico'>('todos');

  const handleSaveProduto = async (produtoData: Omit<Produto, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      if (editingProduto) {
        await updateProduto(editingProduto.id, produtoData);
      } else {
        await createProduto(produtoData);
      }
      setShowModal(false);
      setEditingProduto(null);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Tente novamente.');
    }
  };

  const handleEditProduto = (produto: Produto) => {
    setEditingProduto(produto);
    setShowModal(true);
  };

  const handleDeleteProduto = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduto(id);
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
        alert('Erro ao deletar produto. Tente novamente.');
      }
    }
  };

  const produtosFiltrados = produtos.filter(produto => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const matchesSearch = searchRegex.test(produto.nome) || searchRegex.test(produto.descricao || '') || searchRegex.test(produto.codigo || '');
    const matchesCategory = filterCategory === 'todos' || produto.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const colunas: Column<Produto>[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'nome', label: 'Nome' },
    {
      key: 'categoria',
      label: 'Categoria',
      render: (produto) => produto.categoria === 'peca' ? 'Peça' : 'Serviço'
    },
    { key: 'preco_venda', label: 'Preço', render: (produto) => `R$ ${Number(produto.preco_venda).toFixed(2)}` },
    {
      key: 'acoes',
      label: <MoreHorizontal className="h-4 w-4 mx-auto" />,
      render: (produto) => (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={() => handleEditProduto(produto)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
            title="Editar produto"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteProduto(produto.id)}
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
            title="Excluir produto"
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
            <Package className="mr-3 text-blue-600" size={32} />
            Produtos e Serviços
          </h1>
          <p className="text-gray-600">Gerencie seus produtos e serviços</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="mr-2" size={20} />
          Novo Produto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pesquisar</label>
            <input
              type="text"
              placeholder="Pesquisar por nome ou código"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as 'todos' | 'peca' | 'servico')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todas</option>
              <option value="peca">Peça</option>
              <option value="servico">Serviço</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Lista de Produtos e Serviços</h3>
          <p className="text-sm text-gray-600">Total: {produtosFiltrados.length} produtos</p>
        </div>
        <div className="p-6">
          <SortableTable
            data={produtosFiltrados}
            columns={colunas}
            keyExtractor={(produto) => produto.id}
            emptyMessage="Nenhum produto ou serviço encontrado"
            emptyIcon={<FileText size={48} className="text-gray-300" />}
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ProductForm
          produto={editingProduto}
          onSave={handleSaveProduto}
          onCancel={() => {
            setShowModal(false);
            setEditingProduto(null);
          }}
        />
      )}
    </div>
  );
};
