
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/masks';

interface FinancialEntryModalProps {
  onSave: (entry: FinancialEntry) => void;
}

interface FinancialEntry {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  categoria: string;
  formaPagamento: string;
  dataVencimento: string;
  status: 'pendente' | 'pago';
  observacoes?: string;
}

export const FinancialEntryModal = ({ onSave }: FinancialEntryModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'receita' as 'receita' | 'despesa',
    descricao: '',
    valor: '',
    categoria: '',
    formaPagamento: '',
    dataVencimento: '',
    status: 'pendente' as 'pendente' | 'pago',
    observacoes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry: FinancialEntry = {
      id: Date.now().toString(),
      tipo: formData.tipo,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor.replace(/[^\d,]/g, '').replace(',', '.')),
      categoria: formData.categoria,
      formaPagamento: formData.formaPagamento,
      dataVencimento: formData.dataVencimento,
      status: formData.status,
      observacoes: formData.observacoes
    };

    onSave(entry);
    setOpen(false);
    setFormData({
      tipo: 'receita',
      descricao: '',
      valor: '',
      categoria: '',
      formaPagamento: '',
      dataVencimento: '',
      status: 'pendente',
      observacoes: ''
    });
  };

  const handleValueChange = (value: string) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');
    // Aplica formatação de moeda
    const formattedValue = formatCurrency(parseInt(numericValue || '0') / 100);
    setFormData({ ...formData, valor: formattedValue });
  };

  const categoriesReceita = [
    'Vendas',
    'Serviços',
    'Consultoria',
    'Outros'
  ];

  const categoriesDespesa = [
    'Aluguel',
    'Fornecedores',
    'Salários',
    'Marketing',
    'Energia',
    'Telefone',
    'Internet',
    'Outros'
  ];

  const formasPagamento = [
    { value: 'dinheiro', label: '💵 Dinheiro' },
    { value: 'cartao_credito', label: '💳 Cartão de Crédito' },
    { value: 'cartao_debito', label: '💳 Cartão de Débito' },
    { value: 'pix', label: '📱 PIX' },
    { value: 'transferencia', label: '🏦 Transferência' },
    { value: 'boleto', label: '📄 Boleto' }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={18} />
          Nova Entrada
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Entrada Financeira</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
              <Select value={formData.tipo} onValueChange={(value: 'receita' | 'despesa') => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">📈 Receita</SelectItem>
                  <SelectItem value="despesa">📉 Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <Select value={formData.status} onValueChange={(value: 'pendente' | 'pago') => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">⏳ Pendente</SelectItem>
                  <SelectItem value="pago">✅ Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
            <input
              type="text"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Valor</label>
              <input
                type="text"
                value={formData.valor}
                onChange={(e) => handleValueChange(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="R$ 0,00"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Data Vencimento</label>
              <input
                type="date"
                value={formData.dataVencimento}
                onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
            <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {(formData.tipo === 'receita' ? categoriesReceita : categoriesDespesa).map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Forma de Pagamento</label>
            <Select value={formData.formaPagamento} onValueChange={(value) => setFormData({ ...formData, formaPagamento: value })}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {formasPagamento.map((forma) => (
                  <SelectItem key={forma.value} value={forma.value}>{forma.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 h-8 text-sm">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-8 text-sm">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
