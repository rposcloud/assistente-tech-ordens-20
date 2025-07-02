
import React, { useState } from 'react';
import { FileText, Package, Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useProdutos } from '../hooks/useProdutos';
import { SortableTable, Column } from '../components/ui/sortable-table';
import { ProductForm } from '../components/forms/ProductForm';
import { ConfirmationModal } from '../components/ui/confirmation-modal';
import type { Produto } from '../types/produto';

export const Produtos = () => {
  const { produtos, loading, createProduto, updateProduto, deleteProduto } = useProdutos();
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'todos' | 'peca' | 'servico'>('todos');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    produto: Produto | null;
    loading: boolean;
  }>({
    isOpen: false,
    produto: null,
    loading: false
  });

  const handleSaveProduto = async (produtoData: Omit<Produto, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      if (editingProduto) {
        await updateProduto(editingProduto.id, produtoData as any);
      } else {
        await createProduto(produtoData as any);
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

  const handleDeleteProduto = (produto: Produto) => {
    setDeleteModal({
      isOpen: true,
      produto,
      loading: false
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.produto) return;

    setDeleteModal(prev => ({ ...prev, loading: true }));

    try {
      await deleteProduto(deleteModal.produto.id);
      setDeleteModal({
        isOpen: false,
        produto: null,
        loading: false
      });
    } catch (error: any) {
      console.error('Erro ao inativar produto:', error);
      alert('Erro ao inativar produto. Tente novamente.');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const closeDeleteModal = () => {
    if (deleteModal.loading) return;
    setDeleteModal({
      isOpen: false,
      produto: null,
      loading: false
    });
  };

  const produtosFiltrados = produtos.filter(produto => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const matchesSearch = searchRegex.test(produto.nome) || searchRegex.test(produto.descricao || '') || searchRegex.test((produto as any).codigo || '');
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
      label: '',
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
            onClick={() => handleDeleteProduto(produto)}
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
            title="Inativar produto"
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
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
        <h3 className="text-sm font-medium mb-3 text-gray-700">Filtros</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Pesquisar</label>
            <input
              type="text"
              placeholder="Pesquisar por nome ou código"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as 'todos' | 'peca' | 'servico')}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todas</option>
              <option value="peca">Peça</option>
              <option value="servico">Serviço</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Versão Desktop - Tabela */}
          <div className="hidden lg:block">
            <SortableTable
              data={produtosFiltrados as any}
              columns={colunas}
              keyExtractor={(produto) => produto.id}
              emptyMessage="Nenhum produto ou serviço encontrado"
              emptyIcon={<FileText size={48} className="text-gray-300" />}
            />
          </div>

          {/* Versão Mobile - Cards */}
          <div className="lg:hidden">
            {produtosFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum produto ou serviço encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {produtosFiltrados.map((produto) => (
                  <div key={produto.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {/* Header do Card */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{produto.nome}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            produto.categoria === 'peca' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {produto.categoria === 'peca' ? 'Peça' : 'Serviço'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProduto(produto as any)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                          title="Editar produto"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduto(produto as any)}
                          className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                          title="Excluir produto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Informações do Card */}
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {produto.descricao && (
                        <div>
                          <span className="text-gray-500">Descrição: </span>
                          <span className="text-gray-900">{produto.descricao}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-500">Custo: </span>
                          <span className="text-gray-900">R$ {Number(produto.preco_custo).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Venda: </span>
                          <span className="text-green-600 font-medium">R$ {Number(produto.preco_venda).toFixed(2)}</span>
                        </div>
                      </div>
                      {produto.tipo_equipamento && (
                        <div>
                          <span className="text-gray-500">Equipamento: </span>
                          <span className="text-gray-900 capitalize">{produto.tipo_equipamento}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Formulário */}
      {showModal && (
        <ProductForm
          produto={editingProduto as any}
          onSave={handleSaveProduto}
          onCancel={() => {
            setShowModal(false);
            setEditingProduto(null);
          }}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Inativar Produto"
        message={`Tem certeza que deseja inativar o produto "${deleteModal.produto?.nome}"? Ele não aparecerá mais na lista, mas permanecerá vinculado às ordens de serviço existentes.`}
        confirmText="Inativar"
        cancelText="Cancelar"
        type="warning"
        loading={deleteModal.loading}
      />
    </div>
  );
};
