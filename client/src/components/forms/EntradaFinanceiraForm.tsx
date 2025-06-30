
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EntradaFinanceira, CategoriaFinanceira } from '@/hooks/useFinanceiro';

interface EntradaFinanceiraFormProps {
  onSubmit: (data: Omit<EntradaFinanceira, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  categorias: CategoriaFinanceira[];
  initialData?: EntradaFinanceira;
  loading?: boolean;
}

export const EntradaFinanceiraForm: React.FC<EntradaFinanceiraFormProps> = ({
  onSubmit,
  onCancel,
  categorias,
  initialData,
  loading = false
}) => {
  const [formData, setFormData] = useState<Partial<EntradaFinanceira>>({
    tipo: 'receita',
    descricao: '',
    valor: 0,
    categoria: '',
    forma_pagamento: 'dinheiro',
    data_vencimento: new Date().toISOString().split('T')[0],
    status: 'pendente',
    parcelas: 1,
    parcela_atual: 1,
    valor_parcela: 0,
    centro_custo: '',
    conta_bancaria: '',
    numero_documento: '',
    pessoa_responsavel: '',
    observacoes: '',
    ...initialData
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<EntradaFinanceira, 'id' | 'created_at' | 'updated_at'>);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Atualizar valor da parcela automaticamente
      if (field === 'valor' || field === 'parcelas') {
        const valor = field === 'valor' ? value : (newData.valor || 0);
        const parcelas = field === 'parcelas' ? value : (newData.parcelas || 1);
        newData.valor_parcela = parcelas > 0 ? valor / parcelas : valor;
      }
      
      return newData;
    });
  };

  const categoriasFiltradas = categorias.filter(cat => cat.tipo === formData.tipo);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value) => updateField('tipo', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={formData.categoria} onValueChange={(value) => updateField('categoria', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasFiltradas.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.nome}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => updateField('descricao', e.target.value)}
              placeholder="Descreva a receita ou despesa"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor Total (R$) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => updateField('valor', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
              <Input
                id="data_vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => updateField('data_vencimento', e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
              <Select value={formData.forma_pagamento} onValueChange={(value) => updateField('forma_pagamento', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="parcelado">Parcelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.forma_pagamento === 'parcelado' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parcelas">Número de Parcelas</Label>
                <Input
                  id="parcelas"
                  type="number"
                  min="1"
                  value={formData.parcelas}
                  onChange={(e) => updateField('parcelas', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parcela_atual">Parcela Atual</Label>
                <Input
                  id="parcela_atual"
                  type="number"
                  min="1"
                  max={formData.parcelas}
                  value={formData.parcela_atual}
                  onChange={(e) => updateField('parcela_atual', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_parcela">Valor da Parcela (R$)</Label>
                <Input
                  id="valor_parcela"
                  type="number"
                  step="0.01"
                  value={formData.valor_parcela}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="centro_custo">Centro de Custo</Label>
              <Input
                id="centro_custo"
                value={formData.centro_custo}
                onChange={(e) => updateField('centro_custo', e.target.value)}
                placeholder="Ex: Vendas, Administrativo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conta_bancaria">Conta Bancária</Label>
              <Input
                id="conta_bancaria"
                value={formData.conta_bancaria}
                onChange={(e) => updateField('conta_bancaria', e.target.value)}
                placeholder="Ex: Conta Corrente, Poupança"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_documento">Número do Documento</Label>
              <Input
                id="numero_documento"
                value={formData.numero_documento}
                onChange={(e) => updateField('numero_documento', e.target.value)}
                placeholder="Ex: Nota fiscal, recibo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pessoa_responsavel">Pessoa Responsável</Label>
              <Input
                id="pessoa_responsavel"
                value={formData.pessoa_responsavel}
                onChange={(e) => updateField('pessoa_responsavel', e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => updateField('observacoes', e.target.value)}
              placeholder="Observações adicionais"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar Entrada'}
        </Button>
      </div>
    </form>
  );
};
