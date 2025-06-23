
import React, { useState } from 'react';
import { Package, DollarSign, Hash, Tag } from 'lucide-react';
import { Produto } from '../../types/produto';
import { formatCurrency, parseCurrency } from '../../utils/masks';

interface ProductFormProps {
  produto?: Produto;
  onSave: (produto: Produto) => void;
  onCancel: () => void;
}

export const ProductForm = ({ produto, onSave, onCancel }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    codigo: produto?.codigo || '',
    nome: produto?.nome || '',
    descricao: produto?.descricao || '',
    categoria: produto?.categoria || 'peca' as 'peca' | 'servico',
    precoCusto: produto?.precoCusto || 0,
    precoVenda: produto?.precoVenda || 0,
    estoque: produto?.estoque || 0,
    unidade: produto?.unidade || 'un',
    tipoEquipamento: produto?.tipoEquipamento || 'todos' as any,
    tempoEstimado: produto?.tempoEstimado || 0
  });

  const [precoCustoFormatado, setPrecoCustoFormatado] = useState(
    produto?.precoCusto ? formatCurrency(produto.precoCusto) : ''
  );
  const [precoVendaFormatado, setPrecoVendaFormatado] = useState(
    produto?.precoVenda ? formatCurrency(produto.precoVenda) : ''
  );

  const handlePrecoCustoChange = (value: string) => {
    setPrecoCustoFormatado(value);
    const numericValue = value ? parseCurrency(value) : 0;
    setFormData(prev => ({ ...prev, precoCusto: numericValue }));
  };

  const handlePrecoVendaChange = (value: string) => {
    setPrecoVendaFormatado(value);
    const numericValue = parseCurrency(value);
    setFormData(prev => ({ ...prev, precoVenda: numericValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const produtoData: Produto = {
      id: produto?.id || Date.now().toString(),
      ...formData,
      ativo: true,
      createdAt: produto?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(produtoData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-600" />
            {produto ? 'Editar Produto' : 'Novo Produto'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Hash className="h-4 w-4 inline mr-1" />
                  Código (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: PEC001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tag className="h-4 w-4 inline mr-1" />
                  Categoria *
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value as 'peca' | 'servico' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="peca">Peça</option>
                  <option value="servico">Serviço</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome do produto ou serviço"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Descrição detalhada"
              />
            </div>

            {/* Preços */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Preço de Custo (Opcional)
                </label>
                <input
                  type="text"
                  value={precoCustoFormatado}
                  onChange={(e) => handlePrecoCustoChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="R$ 0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Preço de Venda *
                </label>
                <input
                  type="text"
                  value={precoVendaFormatado}
                  onChange={(e) => handlePrecoVendaChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="R$ 0,00"
                  required
                />
              </div>
            </div>

            {/* Campos específicos por categoria */}
            {formData.categoria === 'peca' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                  <input
                    type="number"
                    value={formData.estoque}
                    onChange={(e) => setFormData(prev => ({ ...prev, estoque: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                  <select
                    value={formData.unidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, unidade: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="un">Unidade</option>
                    <option value="m">Metro</option>
                    <option value="kg">Quilograma</option>
                    <option value="l">Litro</option>
                  </select>
                </div>
              </div>
            )}

            {formData.categoria === 'servico' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tempo Estimado (minutos)</label>
                <input
                  type="number"
                  value={formData.tempoEstimado}
                  onChange={(e) => setFormData(prev => ({ ...prev, tempoEstimado: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipamento</label>
              <select
                value={formData.tipoEquipamento}
                onChange={(e) => setFormData(prev => ({ ...prev, tipoEquipamento: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos os Equipamentos</option>
                <option value="smartphone">Smartphone</option>
                <option value="notebook">Notebook</option>
                <option value="desktop">Desktop</option>
                <option value="tablet">Tablet</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {produto ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
