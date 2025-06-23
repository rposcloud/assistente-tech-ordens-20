import React, { useState, useEffect } from 'react';
import { FileText, Package } from 'lucide-react';
import { Produto } from '../types';
import { SortableTable, Column } from '../components/ui/sortable-table';
import { ProductForm } from '../components/forms/ProductForm';

export const Produtos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'todos' | 'peca' | 'servico'>('todos');

  useEffect(() => {
    const produtosSalvos = localStorage.getItem('produtos');
    if (produtosSalvos) {
      setProdutos(JSON.parse(produtosSalvos));
    }
  }, []);

  const handleSaveProduto = (produto: Produto) => {
    if (editingProduto) {
      const updatedProdutos = produtos.map(p => p.id === produto.id ? produto : p);
      setProdutos(updatedProdutos);
      localStorage.setItem('produtos', JSON.stringify(updatedProdutos));
    } else {
      const newProdutos = [...produtos, produto];
      setProdutos(newProdutos);
      localStorage.setItem('produtos', JSON.stringify(newProdutos));
    }
    setShowModal(false);
    setEditingProduto(null);
  };

  const handleDeleteProduto = (id: string) => {
    const updatedProdutos = produtos.filter(produto => produto.id !== id);
    setProdutos(updatedProdutos);
    localStorage.setItem('produtos', JSON.stringify(updatedProdutos));
  };

  const produtosFiltrados = produtos.filter(produto => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const matchesSearch = searchRegex.test(produto.nome) || searchRegex.test(produto.descricao) || searchRegex.test(produto.codigo || '');
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
    { key: 'precoVenda', label: 'Preço', render: (produto) => `R$ ${produto.precoVenda.toFixed(2)}` },
    {
      key: 'acoes',
      label: 'Ações',
      render: (produto) => (
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingProduto(produto)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            title="Editar produto"
          >
            Editar
          </button>
          <button
            onClick={() => handleDeleteProduto(produto.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            title="Excluir produto"
          >
            Excluir
          </button>
        </div>
      ),
      className: 'text-center'
    }
  ];

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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
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

      {/* Modal Simplificado */}
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
