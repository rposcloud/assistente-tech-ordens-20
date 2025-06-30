
import React, { useState } from 'react';
import { Package, DollarSign, Hash, Tag } from 'lucide-react';
import { Produto } from '../../types/produto';
import { CurrencyInput } from '../ui/currency-input';
import { useToast } from '../ui/use-toast';

interface ProductFormProps {
  produto?: Produto;
  onSave: (produto: Omit<Produto, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
  onCancel: () => void;
}

export const ProductForm = ({ produto, onSave, onCancel }: ProductFormProps) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    codigo: produto?.codigo || '',
    nome: produto?.nome || '',
    descricao: produto?.descricao || '',
    categoria: produto?.categoria || 'peca' as 'peca' | 'servico',
    preco_custo: produto?.preco_custo || 0,
    preco_venda: produto?.preco_venda || 0,
    estoque: produto?.estoque || 0,
    unidade: produto?.unidade || 'un',
    tipo_equipamento: produto?.tipo_equipamento || 'todos' as any,
    tempo_estimado: produto?.tempo_estimado || 0,
    ativo: produto?.ativo ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (formData.preco_venda <= 0) {
      newErrors.preco_venda = 'Preço de venda deve ser maior que zero';
    }

    if (formData.preco_custo < 0) {
      newErrors.preco_custo = 'Preço de custo não pode ser negativo';
    }

    if (formData.preco_custo > 0 && formData.preco_venda <= formData.preco_custo) {
      newErrors.preco_venda = 'Preço de venda deve ser maior que o preço de custo';
    }

    if (formData.categoria === 'peca' && formData.estoque < 0) {
      newErrors.estoque = 'Estoque não pode ser negativo';
    }

    if (formData.categoria === 'servico' && formData.tempo_estimado < 0) {
      newErrors.tempo_estimado = 'Tempo estimado não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    
    toast({
      title: produto ? "Produto atualizado" : "Produto criado",
      description: `${formData.nome} foi ${produto ? 'atualizado' : 'criado'} com sucesso.`,
    });
  };

  const renderError = (field: string) => {
    return errors[field] ? (
      <span className="text-sm text-red-600 mt-1 block">{errors[field]}</span>
    ) : null;
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.nome ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome do produto ou serviço"
                required
              />
              {renderError('nome')}
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
                <CurrencyInput
                  value={formData.preco_custo}
                  onChange={(value) => setFormData(prev => ({ ...prev, preco_custo: value }))}
                  placeholder="R$ 0,00"
                  className={errors.preco_custo ? 'border-red-500' : ''}
                />
                {renderError('preco_custo')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Preço de Venda *
                </label>
                <CurrencyInput
                  value={formData.preco_venda}
                  onChange={(value) => setFormData(prev => ({ ...prev, preco_venda: value }))}
                  placeholder="R$ 0,00"
                  required
                  className={errors.preco_venda ? 'border-red-500' : ''}
                />
                {renderError('preco_venda')}
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.estoque ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                  {renderError('estoque')}
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
                  value={formData.tempo_estimado}
                  onChange={(e) => setFormData(prev => ({ ...prev, tempo_estimado: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.tempo_estimado ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                />
                {renderError('tempo_estimado')}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipamento</label>
              <select
                value={formData.tipo_equipamento}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo_equipamento: e.target.value as any }))}
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
