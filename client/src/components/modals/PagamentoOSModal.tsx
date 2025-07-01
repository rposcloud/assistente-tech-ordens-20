import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Calendar } from 'lucide-react';
import { OrdemServico } from '@/types';

interface PagamentoOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  ordem: OrdemServico | null;
  onConfirm: (dadosPagamento: DadosPagamento) => void;
  loading?: boolean;
}

interface DadosPagamento {
  forma_pagamento: string;
  status_pagamento: string;
  data_pagamento: string;
  observacoes_pagamento?: string;
}

const formasPagamento = [
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'cartao_debito', label: 'Cartão de Débito', icon: '💳' },
  { value: 'pix', label: 'PIX', icon: '📱' },
  { value: 'transferencia', label: 'Transferência', icon: '🏦' },
  { value: 'parcelado', label: 'Parcelado', icon: '📊' }
];

const statusPagamento = [
  { value: 'pago', label: 'Pago', color: 'bg-green-100 text-green-800' },
  { value: 'parcial', label: 'Pago Parcial', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'pendente', label: 'Pendente', color: 'bg-red-100 text-red-800' }
];

export const PagamentoOSModal: React.FC<PagamentoOSModalProps> = ({
  isOpen,
  onClose,
  ordem,
  onConfirm,
  loading = false
}) => {
  const [formData, setFormData] = useState<DadosPagamento>({
    forma_pagamento: '',
    status_pagamento: 'pago',
    data_pagamento: new Date().toISOString().split('T')[0],
    observacoes_pagamento: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.forma_pagamento) return;
    onConfirm(formData);
  };

  const handleClose = () => {
    setFormData({
      forma_pagamento: '',
      status_pagamento: 'pago',
      data_pagamento: new Date().toISOString().split('T')[0],
      observacoes_pagamento: ''
    });
    onClose();
  };

  if (!ordem) return null;

  const valorFinal = parseFloat(ordem.valor_final || ordem.valor_total || '0');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Informar Pagamento - OS #{ordem.numero}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Valor da OS */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">Valor Total da OS:</span>
              <div className="flex items-center gap-1 text-lg font-bold text-green-800">
                <DollarSign className="h-4 w-4" />
                R$ {valorFinal.toFixed(2)}
              </div>
            </div>
            <p className="text-xs text-green-600 mt-1">Cliente: {(ordem as any).clientes?.nome || 'N/A'}</p>
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
            <Select value={formData.forma_pagamento} onValueChange={(value) => 
              setFormData({ ...formData, forma_pagamento: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {formasPagamento.map((forma) => (
                  <SelectItem key={forma.value} value={forma.value}>
                    <div className="flex items-center gap-2">
                      <span>{forma.icon}</span>
                      {forma.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status do Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="status_pagamento">Status do Pagamento</Label>
            <Select value={formData.status_pagamento} onValueChange={(value) => 
              setFormData({ ...formData, status_pagamento: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusPagamento.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data do Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="data_pagamento" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Data do Pagamento
            </Label>
            <Input
              type="date"
              value={formData.data_pagamento}
              onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              placeholder="Ex: Pago em 2x no cartão, Desconto aplicado, etc."
              value={formData.observacoes_pagamento}
              onChange={(e) => setFormData({ ...formData, observacoes_pagamento: e.target.value })}
              rows={2}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={loading || !formData.forma_pagamento}
            >
              {loading ? 'Salvando...' : 'Confirmar Pagamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};